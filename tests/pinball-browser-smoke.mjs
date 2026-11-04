import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';
import {mkdirSync} from 'node:fs';

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
 await page.goto(base,{waitUntil:'load',timeout:30000});
 await page.waitForTimeout(2200);
 const wrap=page.locator('.playfield-wrap').first();
 await wrap.screenshot({path:'artifacts/neon-tilt-table.png'});
 const png=PNG.sync.read(await wrap.screenshot());
 let colourful=0,bright=0;
 for(let y=10;y<png.height-10;y+=4){
  for(let x=10;x<png.width-10;x+=4){
   const offset=(y*png.width+x)*4;
   const [r,g,b]=png.data.subarray(offset,offset+3);
   if(Math.max(r,g,b)>105)bright++;
   if((r>100&&g>45&&r>g*1.15)||(r>105&&g>95&&b<100))colourful++;
  }
 }
 const state=await page.evaluate(()=>{
  const canvas=document.querySelector('#playfield');
  const stage=document.querySelector('#table-stage');
  return {
   mode:document.querySelector('#render-mode')?.textContent?.trim(),
   active3D:stage?.classList.contains('has-webgl'),
   canvasWidth:canvas?.width,canvasHeight:canvas?.height,
   tableClass:stage?.className
  };
 });
 console.log('Pixel evidence',JSON.stringify({width:png.width,height:png.height,bright,colourful,...state}));
 console.log('Browser warnings',JSON.stringify(warnings.slice(0,8)));
 console.log('Browser errors',JSON.stringify(errors.slice(0,8)));
 assert.ok(bright>200,'Playfield is empty or too dark: no illuminated hardware visible');
 assert.ok(colourful>75,'Playfield neon lights, gold rails or bumpers are not visible');
 assert.equal(errors.length,0,'Browser runtime errors found');
}finally{
 await page.screenshot({path:'artifacts/neon-tilt-full-page.png',fullPage:true}).catch(()=>{});
 await browser.close();
}
