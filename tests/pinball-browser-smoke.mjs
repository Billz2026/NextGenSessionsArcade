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
 // CDP grabs the current compositor frame without Playwright waiting for
 // a continuously animated pinball scene to become visually stable.
 // Capture both the complete dashboard and a cropped physical playfield.
 try{
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Page.enable');
  async function capture(name,clip){
   const result=await cdp.send('Page.captureScreenshot',{
    format:'png',fromSurface:true,captureBeyondViewport:true,
    ...(clip?{clip}: {})
   });
   writeFileSync('artifacts/'+name,Buffer.from(result.data,'base64'));
   console.log('Saved browser screenshot:',name);
  }
  await capture('neon-tilt-browser.png');
  const stage=await page.locator('#table-stage').boundingBox();
  if(stage&&stage.width>200&&stage.height>300){
   await capture('neon-tilt-playfield.png',{
    x:Math.max(0,stage.x),y:Math.max(0,stage.y),
    width:stage.width,height:stage.height,scale:1
   });
  }
  await cdp.detach();
 }catch(error){
  console.log('Compositor screenshot unavailable:',String(error).slice(0,300));
 }

}finally{
 await browser.close();
}
