import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TRAVEL_PATHS,SHOTS,LANES,BOARD,PinballEngine}
 from '../games/pinball/engine.mjs';
import {UPPER_ROUTES,UPPER_ROLLOVERS,UPPER_ARCH,guideEdges,UPPER_BALL_RADIUS}
 from '../games/pinball/upper-hardware.mjs';

const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');

test('four moulded corridors begin at the true scoring sensors and mirror full ball paths',()=>{
 assert.deepEqual(UPPER_ROUTES.map(r=>r.kind),['orbit','ramp','center','skyline']);
 for(const route of UPPER_ROUTES){
  assert.deepEqual(route.points.map(p=>[p.x,p.y,p.z]),TRAVEL_PATHS[route.kind]);
  assert.deepEqual(route.entrance,
   {x:SHOTS[route.kind].x,y:SHOTS[route.kind].y,r:SHOTS[route.kind].r});
  assert.equal(route.width,['orbit','ramp'].includes(route.kind)?22:18);
  assert.ok(route.width>2*BOARD.radius,'corridor must clear the actual ball');
  assert.ok(route.points.every(p=>p.z>=.3&&p.z<=1.65));
 }
});
test('integrated lane edges straddle each actual physical travel centreline',()=>{
 for(const route of UPPER_ROUTES){
  const edges=guideEdges(route);
  assert.equal(edges.length,route.points.length);
  for(let i=0;i<edges.length;i++){
   const a=edges[i].left,b=edges[i].right,p=route.points[i];
   assert.ok(Math.abs((a.x+b.x)/2-p.x)<1e-9);
   assert.ok(Math.abs((a.y+b.y)/2-p.y)<1e-9);
   assert.ok(Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-route.width)<1e-7);
   assert.equal(a.z,p.z);assert.equal(b.z,p.z);
  }
 }
});
test('3D guided ball stays above its actual integrated lane bed',()=>{
 const g=new PinballEngine();g.start();g.launch();
 for(const route of UPPER_ROUTES){
  g.ball.mode='live';
  g.activateShot(route.kind);
  assert.equal(g.ball.mode,'travel');
  g.advance(1/30);
  assert.ok(g.ball.travelHeight>0);
  assert.ok(UPPER_BALL_RADIUS>0);
  assert.equal(g.ball.travel.kind,route.kind);
 }
 assert.match(three,/\(b\.travelHeight\|\|\.39\)\+UPPER_BALL_RADIUS/);
 assert.match(three,/channelStrip\(route,0,1,-\.025,laneBaseMaterials\[route\.kind\]\)/);
});
test('WebGL renders flat smoked channels and painted inlays, not overhead wireforms',()=>{
 assert.match(three,/function channelStrip\(route,from,to,lift,mat\)/);
 assert.match(three,/new T\.BufferGeometry\(\)/);
 assert.match(three,/geometry\.setIndex\(indices\)/);
 assert.match(three,/new T\.Float32BufferAttribute\(vertices,3\)/);
 assert.match(three,/channelStrip\(route,\.006,\.075,-\.015,laneTrim\)/);
 assert.match(three,/channelStrip\(route,\.925,\.994,-\.015,laneTrim\)/);
 assert.doesNotMatch(three,/function railTube\(/);
 assert.doesNotMatch(three,/railTube\(edges\.map/);
 assert.doesNotMatch(three,/routeRod\(/);
 assert.doesNotMatch(three,/upperGuardSections\(route\)/);
 assert.doesNotMatch(three,/wireSteel=metal/);
});
test('Canvas fallback shows filled corridor silhouettes instead of thin steel rails',()=>{
 assert.match(canvas,/function drawOrbits\(c\)/);
 assert.match(canvas,/roundedWirePoints\(route\.points,3\)/);
 assert.match(canvas,/guideEdges\(\{points:smooth,width:route\.width\}\)/);
 assert.match(canvas,/for\(let i=edges\.length-1;i>=0;i--\)c\.lineTo\(edges\[i\]\.right\.x/);
 assert.match(canvas,/c\.closePath\(\);c\.fillStyle=fill;c\.fill\(\)/);
 assert.doesNotMatch(canvas,/upperGuardSections\(route\)/);
 assert.doesNotMatch(canvas,/elevatedGuardSide\(route\.kind\)/);
});
test('only primary orbit and ramp receive wide physical entrance mouths',()=>{
 assert.match(three,/if\(route\.kind!==\x27orbit\x27&&route\.kind!==\x27ramp\x27\)continue/);
 assert.match(three,/const mouth=route\.entrance/);
 assert.match(canvas,/const ex=route\.entrance\.x,ey=route\.entrance\.y/);
 assert.match(canvas,/route\.kind===\x27center\x27\?\x27CROSS\x27:\x27SKY\x27/);
 assert.ok(UPPER_ROUTES.every(r=>r.entrance.x===SHOTS[r.kind].x&&r.entrance.y===SHOTS[r.kind].y));
});
test('upper crown remains low-profile outside the functional ball routes',()=>{
 assert.equal(UPPER_ARCH.length,9);
 assert.ok(UPPER_ARCH.every(p=>p.x>BOARD.radius&&p.x<BOARD.width-BOARD.radius));
 assert.ok(UPPER_ARCH.every(p=>p.y>=140&&p.y<=212));
 assert.ok(UPPER_ARCH.every((p,i)=>i===0||p.x>UPPER_ARCH[i-1].x));
 assert.match(three,/UPPER_ARCH\.map\(p=>new T\.Vector3\(X\(p\.x\),Y\(p\.y\),\.204\)\)/);
 assert.match(canvas,/drawUpperCrown\(c\)/);
});
test('three genuine N/G/S rollover bridges remain on their original scoring sensors',()=>{
 assert.equal(UPPER_ROLLOVERS.length,3);
 for(const lane of UPPER_ROLLOVERS){
  assert.deepEqual({x:lane.x,y:lane.y,label:lane.label},
   {x:LANES[lane.index].x,y:LANES[lane.index].y,label:LANES[lane.index].label});
 }
 assert.match(three,/laneGateMaterials\[i\]\.emissiveIntensity=active\?/);
 assert.match(canvas,/for\(const lane of UPPER_ROLLOVERS\)/);
 assert.match(canvas,/drawUpperRouteFeedback\(ctx,engine,reducedMotion\)/);
});
