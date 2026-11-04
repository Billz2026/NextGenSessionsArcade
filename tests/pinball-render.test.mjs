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
test('marquee uses standalone red neon tubing without a surrounding plaque',()=>{
 assert.doesNotMatch(canvasSource,/fillText\('NEXTGEN SESSIONS'/);
 assert.doesNotMatch(threeSource,/fillText\('NEXTGEN SESSIONS'/);
 for(const source of [canvasSource,threeSource]){
  assert.match(source,/italic 500/);
  assert.match(source,/#ec3635/i);
  assert.match(source,/#f3c74f/i);
 }
 const draw=canvasSource.split('function drawNeonMarquee(c,anim){')[1]?.split('function drawBackglass')[0];
 const texture=threeSource.split('function cabinetMarquee(){')[1]?.split('// Backbox and lacquered hardwood body')[0];
 assert.ok(draw&&texture,'both unboxed sign renderers must exist');
 for(const section of [draw,texture]){
  assert.doesNotMatch(section,/(?:strokeRect|fillRect|roundRect)\(/,
   'the neon lettering must have no rectangle behind or around it');
  assert.match(section,/strokeText\('NEON TILT'/);
 }
 assert.match(canvasSource,/drawNeonMarquee\(ctx,anim\)/,'2D sign must pulse each frame');
 assert.match(canvasSource,/\.5\+\.5\*Math\.sin\(anim\*3\.0\)/,'2D glow must breathe smoothly');
 assert.match(threeSource,/const neonGlowMaterial=marqueeGlow\(\)/,'3D neon must have a real luminous halo');
 assert.match(threeSource,/T\.AdditiveBlending/,'3D sign must illuminate rather than disappear');
 assert.match(threeSource,/neonGlowMaterial\.opacity=\.28\+\.70\*marqueePulse/,'3D red halo must pulse every frame');
 assert.match(threeSource,/neonMarqueeMaterial\.opacity=1/,'neon glass core must stay visible');
 assert.match(threeSource,/reducedMotion\?\.75:/,'3D sign honours reduced motion');
});

test('black lacquer and deterministic gold dust are shared by both renderers',()=>{
 assert.match(canvasSource,/rgba\(243,199,79,\.20\)/);
 assert.match(canvasSource,/for\(let i=0;i<290;i\+\+\)/);
 assert.match(threeSource,/rgba\(243,199,79,\.22\)/);
 assert.match(threeSource,/for\(let i=0;i<450;i\+\+\)/);
 assert.match(threeSource,/const laneTrim=new T.MeshPhysicalMaterial/);
 assert.doesNotMatch(canvasSource,/Math\.random\(/);
 assert.doesNotMatch(threeSource,/Math\.random\(/);
});

test('marquee pulse keeps a continuous live play-loop update with no scoring dependency',()=>{
 const render3d=threeSource.split('function update(engine,')[1]?.split('function isFrameVisible()')[0]||'';
 const canvas2d=canvasSource.split('export function renderTable(')[1]||'';
 assert.match(render3d,/Math\.sin\(now\*\.0030\)/);
 assert.match(render3d,/neonGlowMaterial\.opacity=/);
 assert.match(canvas2d,/drawNeonMarquee\(ctx,anim\)/);
 assert.ok(!render3d.includes('if(engine.state===\'playing\')neonGlowMaterial'));
});
