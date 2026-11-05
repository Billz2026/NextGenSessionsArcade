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
 // Always save the stable 2D playfield, even when Chromium's dynamic WebGL
 // compositor refuses to settle for a whole-page screenshot.
 const playfieldData=await page.evaluate(()=>{
  const c=document.querySelector('#playfield');
  return c.toDataURL('image/png');
 });
 writeFileSync('artifacts/neon-tilt-2d-reference.png',
  Buffer.from(playfieldData.split(',')[1],'base64'));
 // Capture the compositor frame through CDP, bypassing Playwright's
 // waiting for animations/stability (the WebGL canvas never stops drawing).
 try{
  const cdp=await page.context().newCDPSession(page);
  const frame=await cdp.send('Page.captureScreenshot',{
   format:'png',captureBeyondViewport:false,fromSurface:true
  });
  writeFileSync('artifacts/neon-tilt-browser.png',
   Buffer.from(frame.data,'base64'));
  await cdp.detach();
  console.log('Direct compositor screenshot captured');
 }catch(error){
  console.log('CDP frame unavailable:',String(error).slice(0,240));
 }
}finally{
 await browser.close();
}
