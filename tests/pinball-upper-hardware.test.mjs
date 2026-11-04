import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TRAVEL_PATHS,SHOTS,LANES,BOARD,PinballEngine}
 from '../games/pinball/engine.mjs';
import {UPPER_ROUTES,UPPER_ROLLOVERS,UPPER_ARCH,upperGuardSections,guideEdges,UPPER_BALL_RADIUS}
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
 assert.ok(three.includes('roundedWirePoints(points,3)'));
 assert.ok(three.includes('new T.TubeGeometry(curve,'));
 assert.ok(three.includes('railTube(edges.map(e=>e[side]),-.034,.024,wireSteel)'));
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
 assert.ok(three.includes("roundedWirePoints(points,3)"));
 assert.ok(three.includes("new T.TubeGeometry(curve,"));
 assert.ok(three.includes("railTube(edges.map(e=>e[side]),-.034,.024,wireSteel)"));
});
test('classic shot graphics stay visible and 2D renderer removes black channel bands',()=>{
 assert.ok(three.includes("route(ORBIT_PATH,'#f3c74f','#302517')"));
 assert.ok(three.includes("route(RAMP_PATH,'#ff786f','#332018')"));
 assert.ok(three.includes("p.lineWidth=7;p.strokeStyle=dark"));
 assert.ok(canvas.includes("const accent=route.accent==='coral'?'#ff92ba':'#ffd08c'"));
 assert.ok(!canvas.includes("route.width+8"));
 assert.ok(!canvas.includes("route.width-10"));
 assert.ok(canvas.includes("line(c,track,'#d3ad61',1.3)"));
});

test('upper crown is a low-profile arch outside active hardware',()=>{
 assert.equal(UPPER_ARCH.length,9);
 assert.ok(UPPER_ARCH.every(p=>p.x>BOARD.radius&&p.x<BOARD.width-BOARD.radius));
 assert.ok(UPPER_ARCH.every(p=>p.y>=140&&p.y<=212));
 assert.ok(UPPER_ARCH.every((p,i)=>i===0||p.x>UPPER_ARCH[i-1].x));
 assert.ok(three.includes('UPPER_ARCH.map(p=>new T.Vector3(X(p.x),Y(p.y),.204))'));
 assert.ok(canvas.includes('drawUpperCrown(c)'));
 assert.ok(canvas.includes('UPPER_ARCH.map(p=>[p.x,p.y])'));
});
test('upper guard sections avoid overhead crossings but lower rails stay continuous',()=>{
 for(const route of UPPER_ROUTES){
  const sections=upperGuardSections(route);
  assert.equal(sections.length,2);
  assert.equal(sections[0][0],0);
  assert.equal(sections[1][1],route.points.length-1);
  assert.ok(sections[0][1]<sections[1][0]-1);
  for(const [from,to] of sections)assert.ok(from>=0&&from<to&&to<route.points.length);
  assert.equal(route.supportIndices.length,3);
 }
 assert.ok(three.includes('for(const [from,to] of upperGuardSections(route))'));
 assert.ok(canvas.includes('for(const [from,to] of upperGuardSections(route))'));
 assert.ok(three.includes('railTube(edges.map(e=>e[side]),-.034,.024,wireSteel)'));
});
test('mouths and mounting supports still correspond to real scoring positions',()=>{
 assert.ok(three.includes('const mouth=route.entrance'));
 assert.ok(canvas.includes('const ex=route.entrance.x,ey=route.entrance.y'));
 assert.ok(three.includes('for(const index of route.supportIndices)'));
 assert.ok(canvas.includes('for(const i of route.supportIndices)'));
 assert.ok(UPPER_ROUTES.every(r=>r.entrance.x===SHOTS[r.kind].x&&r.entrance.y===SHOTS[r.kind].y));
});
