import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TRAVEL_PATHS,SHOTS,LANES,BOARD,PinballEngine}
 from '../games/pinball/engine.mjs';
import {UPPER_ROUTES,UPPER_ROLLOVERS,guideEdges,UPPER_BALL_RADIUS}
 from '../games/pinball/upper-hardware.mjs';
const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
test('two raised machine routes exactly follow genuine scoring sensors and travel paths',()=>{
 assert.deepEqual(UPPER_ROUTES.map(x=>x.kind),['orbit','ramp']);
 for(const r of UPPER_ROUTES){
  assert.deepEqual(r.points.map(p=>[p.x,p.y,p.z]),TRAVEL_PATHS[r.kind]);
  assert.deepEqual(r.entrance,{x:SHOTS[r.kind].x,y:SHOTS[r.kind].y,r:SHOTS[r.kind].r});
  assert.ok(r.points.length>=7);
  assert.ok(r.points.every(p=>p.z>=.3&&p.z<=1.65));
 }
});
test('guide rails bound the path rather than crossing its centre or creating sensors',()=>{
 for(const route of UPPER_ROUTES){
  const edges=guideEdges(route);
  assert.equal(edges.length,route.points.length);
  for(let i=0;i<edges.length;i++){
   const a=edges[i].left,b=edges[i].right,p=route.points[i];
   assert.ok(Math.abs((a.x+b.x)/2-p.x)<1e-9);
   assert.ok(Math.abs((a.y+b.y)/2-p.y)<1e-9);
   assert.ok(Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-route.width)<1e-7);
  }
  for(const i of route.supportIndices)assert.ok(i>0&&i<route.points.length-1);
 }
 assert.equal(UPPER_BALL_RADIUS,BOARD.radius*.020);
});
test('raised visual ball uses real travelHeight from unchanged physics engine',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.ball.mode='live';
 g.activateShot('ramp');
 assert.equal(g.ball.mode,'travel');
 g.advance(1/30);
 assert.ok(g.ball.travelHeight>0);
 assert.ok(three.includes("if(b.mode==='travel')"));
 assert.ok(three.includes('(b.travelHeight||.39)+UPPER_BALL_RADIUS'),
  'the displayed ball must follow authoritative route height');
 assert.ok(three.includes('UPPER_BALL_RADIUS'));
 assert.ok(!three.includes('geom.setIndex(indices)'),
  'open wireforms must not have a solid indexed ramp bed');
 assert.ok(three.includes('const wireSteel=metal('));
 assert.ok(three.includes('routeRod({...a,z:a.z-.034}'));
 assert.ok(three.includes('routeRod({...a,z:a.z+.208}'));
 assert.ok(three.includes('for(const route of UPPER_ROUTES)'));
});
test('three supported rollover bridges and canvas fallback use matching sensors',()=>{
 assert.equal(UPPER_ROLLOVERS.length,3);
 for(const l of UPPER_ROLLOVERS)
  assert.deepEqual({x:l.x,y:l.y,label:l.label},
   {x:LANES[l.index].x,y:LANES[l.index].y,label:LANES[l.index].label});
 assert.ok(three.includes('laneGateMaterials[i].emissiveIntensity=active?'));
 assert.ok(canvas.includes('for(const lane of UPPER_ROLLOVERS)'));
 assert.ok(canvas.includes('for(const route of UPPER_ROUTES)'));
 assert.ok(canvas.includes('drawUpperRouteFeedback(ctx,engine,reducedMotion)'));
});

test('open wireform channels preserve enough clearance for the ball',()=>{
 for(const route of UPPER_ROUTES){
  assert.equal(route.width,22);
  assert.ok(route.width>2*BOARD.radius,'channel must exceed ball diameter');
 }
 assert.ok(!three.includes("const routeBed=new T.MeshPhysicalMaterial"),
  'heavy opaque beds must not return');
 assert.ok(!three.includes("geom.setIndex(indices)"),
  'the 3D path must remain open below the wireforms');
 assert.ok(three.includes("for(const side of ['left','right'])"));
 assert.ok(three.includes("routeRod({...a,z:a.z-.034}"));
 assert.ok(three.includes("routeRod({...a,z:a.z+.208}"));
});
test('classic shot graphics stay visible and 2D renderer removes black channel bands',()=>{
 assert.ok(three.includes("route(ORBIT_PATH,'#ffc77f','#3c3451')"));
 assert.ok(three.includes("route(RAMP_PATH,'#ff8fb7','#433251')"));
 assert.ok(three.includes("p.lineWidth=12;p.strokeStyle=dark"));
 assert.ok(canvas.includes("const accent=route.accent==='coral'?'#ff92ba':'#ffd08c'"));
 assert.ok(!canvas.includes("route.width+8"));
 assert.ok(!canvas.includes("route.width-10"));
 assert.ok(canvas.includes("line(c,track,'#e1e8ed',1.7)"));
});
