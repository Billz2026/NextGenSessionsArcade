import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WALLS,POSTS,SLINGS,FLIPPER_SWEET_SPOT,RETURN_FEEDS,PinballEngine} from '../games/pinball/engine.mjs';
import {LOWER_GUIDES,LOWER_SLINGS,LOWER_POSTS,LOWER_FLIPPER_BASES,LOWER_CHANNELS,LOWER_INLANES}
 from '../games/pinball/lower-hardware.mjs';
import {CLASSIC_RAIL_PROFILES,MOULDED_COLLISION_RAILS} from '../games/pinball/space-cadet-architecture.mjs';
const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const fallback=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
const controller=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');
test('physical lower side guides exactly match engine collision lines',()=>{
 const physicalSegments=Object.values(MOULDED_COLLISION_RAILS).flat();
 assert.equal(LOWER_GUIDES.length,physicalSegments.length);
 assert.ok(LOWER_GUIDES.length>=12,'both inlane and outlane rails need several segments');
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

test('inlane and outlane render descriptors exactly match every actual collision rail',()=>{
 assert.equal(LOWER_CHANNELS.length,2);
 assert.equal(LOWER_INLANES.length,2);
 const allChannels=[...LOWER_CHANNELS,...LOWER_INLANES],seen=new Set();
 for(const channel of allChannels){
  assert.ok(['left','right'].includes(channel.side));
  assert.ok(channel.points.length>=4,'no two-point decorative slashes');
  assert.equal(Math.sign(channel.outerOffset),channel.side==='left'?-1:1);
  assert.ok(Math.abs(channel.outerOffset)<=10);
  for(let i=1;i<channel.points.length;i++){
   const p=channel.points[i-1],q=channel.points[i];
   const key=[p.x,p.y,q.x,q.y].join(',');
   assert.ok(LOWER_GUIDES.some(g=>[g.x1,g.y1,g.x2,g.y2].join(',')===key),
    'visually rendered rail without collision geometry');
   assert.ok(!seen.has(key),'duplicate contact line');
   seen.add(key);
  }
 }
 assert.equal(seen.size,LOWER_GUIDES.length,'every physical rail appears in rendered hardware');
});
test('Space Cadet-traced lower lanes remain bounded, open and symmetrical enough for a ball',()=>{
 assert.ok(three.includes('buildClassicRails(T,scene,{X,Y})'));
 assert.ok(fallback.includes('paintClassicRails(c,{upper:false,lower:true})'));
 const P=CLASSIC_RAIL_PROFILES;
 for(const name of ['leftOut','rightOut','leftIn','rightIn']){
  const points=P[name];
  assert.ok(points.every(([x,y])=>x>=0&&x<=420&&y>=0&&y<=700),name);
  assert.ok(points.length>=4,name);
  assert.equal(MOULDED_COLLISION_RAILS[name].length,points.length-1);
 }
 function xAt(path,y){
  for(let i=1;i<path.length;i++){
   const [x0,y0]=path[i-1], [x1,y1]=path[i];
   if(y>=Math.min(y0,y1)&&y<=Math.max(y0,y1))
    return x0+(x1-x0)*(y-y0)/(y1-y0);
  }
  return null;
 }
 for(const y of [582,590,600,610,620,630]){
  const left=xAt(P.leftIn,y)-xAt(P.leftOut,y);
  const right=xAt(P.rightOut,y)-xAt(P.rightIn,y);
  assert.ok(left>20,'left ball lane pinched at y='+y);
  assert.ok(right>20,'right ball lane pinched at y='+y);
 }
 for(const w of Object.values(MOULDED_COLLISION_RAILS).flat())
  assert.ok(WALLS.some(v=>v.every((q,i)=>q===w[i])),
   'moulded inlane/outlane has no matching real contact line');
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
