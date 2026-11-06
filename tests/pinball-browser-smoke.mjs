import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';

const base='http://127.0.0.1:8877/games/pinball/';
mkdirSync('artifacts',{recursive:true});
const browser=await chromium.launch({
 headless:true,
 args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader']
});
const page=await browser.newPage({viewport:{width:1690,height:920},deviceScaleFactor:1});
const cdp=await page.context().newCDPSession(page);
// Direct CDP capture avoids Playwright's screenshot animation/font stabilization
// timeout, which previously produced no usable image despite green CI.
async function captureEvidence(path,fullPage=false){
 const args={format:'png',fromSurface:true,captureBeyondViewport:fullPage};
 if(fullPage){
  const size=await page.evaluate(()=>({
   width:document.documentElement.scrollWidth,
   height:document.documentElement.scrollHeight
  }));
  args.clip={x:0,y:0,width:size.width,height:size.height,scale:1};
 }
 const shot=await cdp.send('Page.captureScreenshot',args);
 assert.ok(shot.data?.startsWith('iVBORw0KGgo'),'CDP did not return valid PNG evidence for '+path);
 const bytes=Buffer.from(shot.data,'base64');
 assert.ok(bytes.length>4000,'Screenshot is unexpectedly small: '+path);
 writeFileSync(path,bytes);
 console.log('Saved screenshot:',path,bytes.length,'bytes');
}
const errors=[],warnings=[];
page.on('pageerror',err=>errors.push(err.stack||String(err)));
page.on('console',msg=>{
 if(msg.type()==='error')errors.push('console: '+msg.text());
 if(msg.type()==='warning')warnings.push(msg.text());
});
try{
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForTimeout(2200);
 // Inspect the actual rendered pixels directly. Screenshot waiting for a
 // dynamically sized/animated stage to settle can timeout even on a good page.
 const evidence=await page.evaluate(()=>{
  const canvas=document.querySelector('#playfield');
  const stage=document.querySelector('#table-stage');
  if(!canvas)throw Error('No playfield canvas in page');
  const context=canvas.getContext('2d');
  if(!context)throw Error('Playfield has no 2D context');
  const w=canvas.width,h=canvas.height,rgba=context.getImageData(0,0,w,h).data;
  let bright=0,colourful=0,checked=0;
  for(let y=12;y<h-12;y+=6)for(let x=12;x<w-12;x+=6){
   const o=(y*w+x)*4,r=rgba[o],g=rgba[o+1],b=rgba[o+2];
   checked++;
   if(Math.max(r,g,b)>105)bright++;
   if((r>100&&g>45&&r>g*1.15)||(r>105&&g>95&&b<100))colourful++;
  }
  return {
   width:w,height:h,bright,colourful,checked,
   mode:document.querySelector('#render-mode')?.textContent?.trim(),
   active3D:stage?.classList.contains('has-webgl'),
   stageClass:stage?.className||''
  };
 });
 console.log('Rendered pixel evidence:',JSON.stringify(evidence));
 console.log('Browser warnings:',JSON.stringify(warnings.slice(0,8)));
 console.log('Browser errors:',JSON.stringify(errors.slice(0,8)));
 assert.ok(evidence.width>250&&evidence.height>400,'playfield canvas was not sized');
 assert.ok(evidence.active3D||evidence.bright>180,
   'Neither active WebGL nor painted 2D playfield detected');
 if(!evidence.active3D)
  assert.ok(evidence.colourful>55,'2D fallback has no visible neon or gold hardware');
 assert.equal(errors.length,0,'Browser runtime errors found');
 // Releasing the on-screen flipper must not cancel a held keyboard flipper.
 // This used to fail: pointerup called setHold(false) even while Z remained down.
 const leftFlipper=page.locator('#flipper-left');
 await page.keyboard.down('z');
 assert.equal(await leftFlipper.evaluate(el=>el.classList.contains('active')),true,
  'Z should engage the left flipper');
 await leftFlipper.click();
 assert.equal(await leftFlipper.evaluate(el=>el.classList.contains('active')),true,
  'releasing a button pointer must not drop a keyboard-held flipper');
 await page.keyboard.up('z');
 assert.equal(await leftFlipper.evaluate(el=>el.classList.contains('active')),false,
  'left flipper must release once all input sources are released');

 // A pointer release on the launcher must not prematurely fire a plunger
 // while the keyboard Space key still owns the charge.
 await page.locator('#start').click();
 await page.evaluate(()=>document.activeElement?.blur?.());
 const launch=page.locator('#launch');
 await page.keyboard.down('Space');
 assert.equal(await launch.evaluate(el=>el.classList.contains('pressed')),true,
  'Space should begin charging the plunger');
 await launch.click();
 assert.equal(await launch.evaluate(el=>el.classList.contains('pressed')),true,
  'releasing a launcher pointer must not cancel a Space-held charge');
 await page.keyboard.up('Space');
 assert.equal(await launch.evaluate(el=>el.classList.contains('pressed')),false,
  'the final release should stop charging the plunger');

 // Check the actual box geometry at common desktop, narrow desktop, Fold and
 // phone CSS viewport sizes. Mobile pages may scroll vertically, not sideways.
 const viewports=[
  {name:'desktop',width:1690,height:920},
  {name:'laptop',width:1280,height:720},
  {name:'fold-unfolded',width:760,height:880},
  {name:'phone',width:390,height:844}
 ];
 for(const vp of viewports){
  await page.setViewportSize({width:vp.width,height:vp.height});
  await page.waitForTimeout(100);
  const layout=await page.evaluate(()=>{
   const rect=sel=>{
    const e=document.querySelector(sel);
    if(!e)throw Error('Missing required element '+sel);
    const r=e.getBoundingClientRect();
    return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,
     width:r.width,height:r.height};
   };
   return {scrollWidth:document.documentElement.scrollWidth,
    table:rect('#table-stage'),left:rect('#flipper-left'),
    right:rect('#flipper-right')};
  });
  console.log(vp.name+' layout:',JSON.stringify(layout));
  assert.ok(layout.table.width>150&&layout.table.height>250,
   vp.name+': table size too small');
  assert.ok(Math.abs(layout.table.width/layout.table.height-.6)<.04,
   vp.name+': table aspect ratio is distorted');
  assert.ok(layout.scrollWidth<=vp.width+3,
   vp.name+': horizontal overflow detected');
  for(const key of ['table','left','right']){
   const r=layout[key];
   assert.ok(r.left>=-3&&r.right<=vp.width+3,
    vp.name+': '+key+' is clipped horizontally');
  }
  if(vp.width>1120){
   assert.ok(layout.table.bottom<=vp.height+3,
    vp.name+': playfield is clipped below the desktop viewport');
   assert.ok(layout.left.bottom<=vp.height+3&&layout.right.bottom<=vp.height+3,
    vp.name+': flipper buttons are clipped below the desktop viewport');
  }
  await captureEvidence('artifacts/neon-tilt-'+vp.name+'.png',vp.width<=1120);
 }
 assert.equal(errors.length,0,'Browser runtime errors after control and viewport checks');
 // Screenshots are mandatory evidence, not optional decoration. The run fails
 // if any capture above is missing or invalid.
}finally{
 await browser.close();
}
