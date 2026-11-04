import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOARD,PinballEngine} from '../games/pinball/engine.mjs';
import {renderTable} from '../games/pinball/visuals.mjs';
const canvasSource=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
const threeSource=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');

// Regression guard for the blank-table incident: a missing import in
// drawOrbits caused the Canvas fallback to throw before its first frame.
function mockCanvas(){
 const calls={fills:0,draws:0,texts:[],pixelWidth:0};
 const gradient={addColorStop(){}};
 const methods={
  createLinearGradient(){return gradient},
  createRadialGradient(){return gradient},
  fill(){calls.fills++},fillRect(){calls.fills++},
  drawImage(){calls.draws++},
  fillText(text){calls.texts.push(text)},
  strokeText(text){calls.texts.push(text)},
  measureText(text){return{width:text.length*15}},
  setTransform(a){calls.pixelWidth=a*BOARD.width}
 };
 const ctx=new Proxy(methods,{
  get(obj,key){
   if(key in obj)return obj[key];
   return ()=>{};
  },
  set(obj,key,v){obj[key]=v;return true}
 });
 return{ctx,calls};
}
test('classic playfield draws a nonblank start screen without WebGL',()=>{
 const original=globalThis.document;
 const {ctx,calls}=mockCanvas();
 globalThis.document={createElement(){return{
  width:0,height:0,getContext(){return ctx}
 }}};
 try{
  renderTable(ctx,new PinballEngine(),{reducedMotion:false});
  assert.equal(calls.draws,1,'the complete base artwork must reach the output canvas');
  assert.ok(calls.fills>100,'the pinball table must contain real painted features');
  assert.ok(calls.texts.includes('NEON TILT'));
  assert.ok(calls.texts.includes('ORBIT'));
  assert.ok(calls.texts.includes('RAMP'));
 }finally{globalThis.document=original}
});
test('classic fallback keeps rendering after starting a ball',()=>{
 const original=globalThis.document;
 const {ctx,calls}=mockCanvas();
 globalThis.document={createElement(){return{
  width:0,height:0,getContext(){return ctx}
 }}};
 try{
  const game=new PinballEngine();game.start();game.launch();
  game.advance(1/30);
  renderTable(ctx,game,{reducedMotion:true});
  assert.equal(calls.draws,1);
  assert.ok(calls.texts.includes('BALL SAVE'));
 }finally{globalThis.document=original}
});
test('table marquee is a clean flashy arcade logo without the website brand line',()=>{
 assert.doesNotMatch(canvasSource,/fillText\('NEXTGEN SESSIONS'/);
 assert.doesNotMatch(threeSource,/fillText\('NEXTGEN SESSIONS'/);
 for(const source of [canvasSource,threeSource]){
  assert.match(source,/italic 900/);
  assert.match(source,/#ff4ca3/i);
  assert.match(source,/#(?:1de8ff|1ce9ff|20ddf4)/i);
 }
});
