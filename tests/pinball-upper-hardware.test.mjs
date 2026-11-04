import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TRAVEL_PATHS,SHOTS,LANES,BOARD,BUMPERS,PinballEngine}
 from '../games/pinball/engine.mjs';
import {UPPER_ROUTES,VISIBLE_CHANNELS,APPROACH_LIGHTS,UPPER_ROLLOVERS,UPPER_ARCH,guideEdges,UPPER_BALL_RADIUS}
 from '../games/pinball/upper-hardware.mjs';

const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');

function distanceToSegment(p,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy||1;
 const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/den));
 return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));
}

test('four genuine playable transport routes are preserved in the physics engine',()=>{
 assert.deepEqual(UPPER_ROUTES.map(r=>r.kind),['orbit','ramp','center','skyline']);
 for(const route of UPPER_ROUTES){
  assert.deepEqual(route.points.map(p=>[p.x,p.y,p.z]),TRAVEL_PATHS[route.kind]);
  assert.deepEqual(route.entrance,
   {x:SHOTS[route.kind].x,y:SHOTS[route.kind].y,r:SHOTS[route.kind].r});
  assert.ok(route.width>=2*BOARD.radius,'real ball has adequate route clearance');
 }
});
test('only two short perimeter approaches are visually shown, not four entire paths',()=>{
 assert.deepEqual(VISIBLE_CHANNELS.map(r=>r.kind),['orbit','ramp']);
 assert.deepEqual(VISIBLE_CHANNELS.map(r=>r.points.length),[4,3]);
 for(const ch of VISIBLE_CHANNELS){
  assert.ok(ch.points.length<UPPER_ROUTES.find(r=>r.kind===ch.kind).points.length/2);
  assert.deepEqual(ch.points,UPPER_ROUTES.find(r=>r.kind===ch.kind).points.slice(0,ch.points.length));
  assert.ok(['left','right'].includes(ch.trimSide));
  assert.equal(ch.width,22);
  assert.deepEqual(ch.points[0],UPPER_ROUTES.find(r=>r.kind===ch.kind).points[0]);
 }
 assert.equal(VISIBLE_CHANNELS[0].trimSide,'right');
 assert.equal(VISIBLE_CHANNELS[1].trimSide,'left');
});
test('every exposed channel stays outside all three bumpers and ends before top N/G/S gates',()=>{
 for(const ch of VISIBLE_CHANNELS){
  for(let i=1;i<ch.points.length;i++){
   for(const bumper of BUMPERS){
    const d=distanceToSegment(bumper,ch.points[i-1],ch.points[i]);
    assert.ok(d>bumper.r+ch.width/2+6,
     ch.kind+' exposed segment '+i+' visually crosses bumper at '+JSON.stringify(bumper));
   }
  }
  const last=ch.points.at(-1);
  assert.ok(last.y>195,'do not draw a channel across upper rollover switches');
 }
});
test('visible approach edges straddle their exact path centreline',()=>{
 for(const ch of VISIBLE_CHANNELS){
  const edges=guideEdges(ch);
  for(let i=0;i<edges.length;i++){
   const a=edges[i].left,b=edges[i].right,p=ch.points[i];
   assert.ok(Math.abs((a.x+b.x)/2-p.x)<1e-9);
   assert.ok(Math.abs((a.y+b.y)/2-p.y)<1e-9);
   assert.ok(Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-ch.width)<1e-7);
  }
 }
});
test('WebGL only paints two moulded outside-lane approaches and no full four-route ribbons',()=>{
 assert.match(three,/for\(const channel of VISIBLE_CHANNELS\)/);
 assert.match(three,/channelStrip\(channel,0,1,-\.025,laneBaseMaterials\[channel\.kind\]\)/);
 assert.match(three,/channelStrip\(channel,\.929,\.985,-\.015,laneTrim\)/);
 assert.match(three,/channelStrip\(channel,\.015,\.071,-\.015,laneTrim\)/);
 assert.match(three,/const route=UPPER_ROUTES\.find\(r=>r\.kind===channel\.kind\)/);
 assert.doesNotMatch(three,/channelStrip\(route,0,1/);
 assert.doesNotMatch(three,/for\(const route of UPPER_ROUTES\)\{\s*const edges=guideEdges\(route\)/);
 assert.doesNotMatch(three,/function railTube\(/);
 assert.doesNotMatch(three,/function routeRod\(/);
 assert.doesNotMatch(three,/const crownGlint=/);
});
test('Canvas paints only two dark channels, one restrained outer trim line each',()=>{
 assert.match(canvas,/for\(const channel of VISIBLE_CHANNELS\)/);
 assert.match(canvas,/const side=channel\.trimSide/);
 assert.match(canvas,/const points=edges\.map\(e=>\[e\[side\]\.x,e\[side\]\.y\]\)/);
 assert.match(canvas,/line\(c,points,accent,1\.8\)/);
 assert.doesNotMatch(canvas,/for\(const route of ordered\)/);
 assert.doesNotMatch(canvas,/upperGuardSections\(route\)/);
});
test('other shots still have real matching gameplay entrances and mission LEDs',()=>{
 assert.deepEqual(UPPER_ROUTES.slice(2).map(r=>r.kind),['center','skyline']);
 assert.ok(three.includes("['center'")||three.includes("'center',0]"));
 assert.ok(canvas.includes('drawShotGuidance(ctx,engine,anim,reducedMotion)'));
 assert.ok(three.includes('shotIndicatorState(engine,a.group)'));
});
test('3D ball continues to follow the complete hidden return trajectory without teleporting',()=>{
 const g=new PinballEngine();g.start();g.launch();
 for(const route of UPPER_ROUTES){
  g.ball.mode='live';g.activateShot(route.kind);
  assert.equal(g.ball.mode,'travel');
  g.advance(1/30);
  assert.ok(g.ball.travelHeight>0);
  assert.equal(g.ball.travel.kind,route.kind);
 }
 assert.ok(UPPER_BALL_RADIUS>0);
 assert.match(three,/\(b\.travelHeight\|\|\.39\)\+UPPER_BALL_RADIUS/);
});
test('top crown is flush printed enamel, not another shiny suspended arch',()=>{
 assert.equal(UPPER_ARCH.length,9);
 assert.ok(UPPER_ARCH.every(p=>p.y>=140&&p.y<=212));
 assert.match(three,/new T\.ShapeGeometry\(crownShape\)/);
 assert.match(canvas,/drawUpperCrown\(c\)/);
 assert.doesNotMatch(three,/new T\.TubeGeometry\(crownPath/);
});
test('three N/G/S rollover bridges remain attached to the actual sensors',()=>{
 assert.equal(UPPER_ROLLOVERS.length,3);
 for(const lane of UPPER_ROLLOVERS)
  assert.deepEqual({x:lane.x,y:lane.y,label:lane.label},
   {x:LANES[lane.index].x,y:LANES[lane.index].y,label:LANES[lane.index].label});
 assert.match(three,/laneGateMaterials\[i\]\.emissiveIntensity=active\?/);
});

test('four inset lenses stay inside actual visible approaches and outside bumper island',()=>{
 assert.deepEqual(APPROACH_LIGHTS.map(l=>l.kind),['orbit','orbit','ramp','ramp']);
 for(const lens of APPROACH_LIGHTS){
  const channel=VISIBLE_CHANNELS.find(c=>c.kind===lens.kind);
  assert.ok(channel,'unknown visible approach');
  assert.ok(lens.index===0||lens.index===1);
  const a=channel.points[lens.index],b=channel.points[lens.index+1];
  assert.ok(distanceToSegment(lens,a,b)<1e-6);
  assert.ok(lens.y>275&&lens.y<360,'lamp overlaps upper N/G/S gates');
  assert.ok(lens.kind==='orbit'?lens.x<85:lens.x>300,'lamp blocks centre bumpers');
  for(const bumper of BUMPERS)
   assert.ok(Math.hypot(lens.x-bumper.x,lens.y-bumper.y)>bumper.r+17);
 }
});

test('both playfield renderers recess the lane floor and illuminate only the four true lane lenses',()=>{
 assert.match(three,/channelStrip\(channel,\.28,\.72,-\.018,laneGroove\)/);
 assert.match(three,/for\(const lamp of APPROACH_LIGHTS\)/);
 assert.match(three,/approachLampState\(engine,indicator\.kind\)/);
 assert.match(three,/arrow\.rotation\.z=Math\.atan2\(-lamp\.dy,lamp\.dx\)-PI\/2/);
 assert.match(canvas,/drawApproachLamps\(ctx,engine,anim,reducedMotion\)/);
 assert.match(canvas,/const state=approachLampState\(engine,lamp\.kind\)/);
 assert.match(canvas,/for\(const lamp of APPROACH_LIGHTS\)/);
 assert.doesNotMatch(canvas,/One subtle directional insert per open approach/);
 // The old V2.7 full-path 'spaghetti' should never return.
 assert.doesNotMatch(three,/channelStrip\(route,0,1/);
 assert.doesNotMatch(canvas,/for\(const route of ordered\)/);
});
