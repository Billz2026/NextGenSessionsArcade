import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WALLS,POSTS,SLINGS,FLIPPER_SWEET_SPOT,RETURN_FEEDS,PinballEngine} from '../games/pinball/engine.mjs';
import {LOWER_GUIDES,LOWER_SLINGS,LOWER_POSTS,LOWER_FLIPPER_BASES,LOWER_CHANNELS}
 from '../games/pinball/lower-hardware.mjs';
import {CLASSIC_RAIL_PROFILES} from '../games/pinball/space-cadet-architecture.mjs';
const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const fallback=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
const controller=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');
test('physical lower side guides exactly match engine collision lines',()=>{
 assert.equal(LOWER_GUIDES.length,4);
 for(const g of LOWER_GUIDES){
  assert.ok(WALLS.some(w=>w[0]===g.x1&&w[1]===g.y1&&w[2]===g.x2&&w[3]===g.y2));
 }
});
test('lower slings, six posts and flipper pivots remain grounded in the engine',()=>{
 assert.equal(LOWER_SLINGS.length,2);
 for(const s of LOWER_SLINGS)
  assert.ok(SLINGS.some(g=>g.x1===s.x1&&g.y1===s.y1&&g.x2===s.x2&&g.y2===s.y2));
 assert.equal(LOWER_POSTS.length,6);
 for(const p of LOWER_POSTS)
  assert.ok(POSTS.some(q=>q.x===p.x&&q.y===p.y&&q.r===p.r));
 assert.deepEqual(LOWER_FLIPPER_BASES,new PinballEngine().flippers.map(
  f=>({side:f.side,x:f.x,y:f.y,length:f.length})));
});
test('3D static hardware and moving flipper layers use the collision descriptors',()=>{
 for(const name of ['LOWER_SLINGS','LOWER_POSTS','LOWER_FLIPPER_BASES'])
  assert.ok(three.includes('for(const '+(name==='LOWER_POSTS'?'post':name==='LOWER_SLINGS'?'sling':'f')+' of '+name+')'));
 assert.ok(three.includes('buildClassicRails(T,scene,{X,Y})'));
 assert.ok(three.includes('flipperRubberMeshes.push('));
 assert.ok(three.includes('flipperInlays.push('));
 assert.ok(three.includes('mesh.rotation.set(0,0,angle)'));
 assert.ok(three.includes('const drainWell=new T.MeshPhysicalMaterial'));
});
test('Canvas fallback mirrors hardware and the game loads the new renderers',()=>{
 assert.ok(fallback.includes('paintClassicRails(c,{upper:false,lower:true})'));
 assert.ok(fallback.includes('for(let i=0;i<LOWER_SLINGS.length;i++)'));
 assert.ok(fallback.includes('LOWER_POSTS.some('));
 assert.ok(fallback.includes("rect(c,157,680,106,15,3,'#060912'"));
 assert.match(controller,/visuals\.mjs\?v=\d+/);
 assert.match(controller,/render3d\.mjs\?v=\d+/);
});

test('two connected lower cabinet channels inherit all four real collision guides',()=>{
 assert.equal(LOWER_CHANNELS.length,2);
 const touched=[];
 for(const channel of LOWER_CHANNELS){
  assert.ok(channel.side==='left'||channel.side==='right');
  assert.equal(channel.points.length,3);
  assert.equal(Math.sign(channel.outerOffset),channel.side==='left'?-1:1);
  assert.ok(Math.abs(channel.outerOffset)<=10);
  for(let i=1;i<channel.points.length;i++){
   const p=channel.points[i-1],q=channel.points[i];
   assert.ok(LOWER_GUIDES.some(g=>
    g.x1===p.x&&g.y1===p.y&&g.x2===q.x&&g.y2===q.y));
   touched.push(p.x+','+p.y+':'+q.x+','+q.y);
  }
 }
 assert.equal(new Set(touched).size,4,'all four guide segments used once');
});
test('moulded inlane and outlane profiles match native table geometry',()=>{
 assert.ok(three.includes('buildClassicRails(T,scene,{X,Y})'));
 assert.ok(fallback.includes('paintClassicRails(c,{upper:false,lower:true})'));
 assert.deepEqual(CLASSIC_RAIL_PROFILES.lowLeft[0],[24,566]);
 assert.deepEqual(CLASSIC_RAIL_PROFILES.lowLeft.at(-1),[116,674]);
 assert.deepEqual(CLASSIC_RAIL_PROFILES.lowRight[0],[365,566]);
 assert.deepEqual(CLASSIC_RAIL_PROFILES.lowRight.at(-1),[305,674]);
 for(const points of [CLASSIC_RAIL_PROFILES.lowLeft,CLASSIC_RAIL_PROFILES.lowRight,
  CLASSIC_RAIL_PROFILES.inLeft,CLASSIC_RAIL_PROFILES.inRight])
  assert.ok(points.every(([x,y])=>x>=0&&x<=420&&y>=0&&y<=700));
 assert.equal(WALLS.length,20,'rail skin must not silently add invisible colliders');
});
test('both renderers use tapered flippers and leave an open drain',()=>{
 assert.ok(three.includes('function taperedBat(baseWidth,tipWidth,depth)'));
 assert.ok(three.includes('new T.ExtrudeGeometry(outline'));
 assert.ok(three.includes('const rubberBat=taperedBat(.235,.150,.095)'));
 assert.ok(fallback.includes('function batContour('));
 assert.ok(fallback.includes('batContour(c,f.x,f.y,end.x,end.y,11.4,7.5'));
 assert.ok(FLIPPER_SWEET_SPOT>.5&&FLIPPER_SWEET_SPOT<.8);
 assert.deepEqual(Object.keys(RETURN_FEEDS).sort(),['orbit','ramp']);
 assert.ok(three.includes('flipperAimMarkers.push('));
 assert.ok(three.includes('dx*FLIPPER_SWEET_SPOT'));
 assert.ok(fallback.includes('(end.x-f.x)*FLIPPER_SWEET_SPOT'));
 assert.ok(three.includes('const drainWell=new T.MeshPhysicalMaterial'));
 assert.ok(fallback.includes('A recessed drain mouth'));
});

test('recessed drain remains visually open instead of a raised solid crossbar',()=>{
 assert.ok(three.includes("plane(X(210),Y(685),.274,2.35,.28,drainWell)"));
 assert.ok(three.includes("box(X(210),Y(672),.298,2.55,.036,.025,mouldedIvory)"));
 assert.ok(!three.includes("box(X(210),Y(685),.204,2.52,.35,.06,lowerShade)"));
 assert.ok(fallback.includes("rect(c,157,680,106,15,3,'#060912'"));
 assert.ok(!fallback.includes("rect(c,154,670,112,26,5"));
});
