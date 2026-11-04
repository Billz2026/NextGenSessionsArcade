import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PinballEngine,TRAVEL_PATHS} from '../games/pinball/engine.mjs';
import {UPPER_ROUTES,guideEdges} from '../games/pinball/upper-hardware.mjs';
import {LOWER_DIRECTION_INSERTS,directionInsertActive}
 from '../games/pinball/finishing-detail.mjs';
const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
test('upper route finishing uses four actual guided paths and no metal runners',()=>{
 assert.deepEqual(UPPER_ROUTES.map(r=>r.kind),['orbit','ramp','center','skyline']);
 for(const route of UPPER_ROUTES){
  assert.deepEqual(route.points.map(p=>[p.x,p.y,p.z]),TRAVEL_PATHS[route.kind]);
  assert.equal(guideEdges(route).length,route.points.length);
 }
 assert.ok(three.includes('function channelStrip(route,from,to,lift,mat)'));
 assert.ok(three.includes('channelStrip(channel,0,1,-.058,laneBaseMaterials[channel.kind])'));
 assert.ok(!three.includes('function railTube('));
 assert.ok(!three.includes('routeRod('));
 assert.ok(!canvas.includes('upperGuardSections(route)'));
 assert.ok(canvas.includes('for(const channel of VISIBLE_CHANNELS)'));
});
test('flipper-area indicator lamps react only to real shot and mission states',()=>{
 const game=new PinballEngine();game.start();
 assert.deepEqual(LOWER_DIRECTION_INSERTS.map(i=>i.kind),['ramp','orbit']);
 assert.equal(directionInsertActive(game,'ramp'),false);
 assert.equal(directionInsertActive(game,'orbit'),false);
 game.lastShot={kind:'ramp',at:game.time};
 assert.equal(directionInsertActive(game,'ramp'),true);
 assert.equal(directionInsertActive(game,'orbit'),false);
 game.time+=5.01;
 assert.equal(directionInsertActive(game,'ramp'),false);
 game.missions.ride=true;
 assert.equal(directionInsertActive(game,'ramp'),true);
 assert.equal(directionInsertActive(game,'orbit'),true);
 assert.ok(three.includes('directionInsertActive(engine,kind)?2.1:.20'));
 assert.ok(canvas.includes('drawLowerDirectionInserts(ctx,engine,reducedMotion)'));
});
test('shadow layers are translucent and do not create physical obstacles',()=>{
 assert.ok(three.includes('const contactMaterial=new T.MeshBasicMaterial'));
 assert.ok(three.includes('depthWrite:false'));
 assert.ok(three.includes('function contactShadow(x,y,w,h)'));
 assert.ok(three.includes('contactShadow(targetMid,targetY'));
 assert.ok(three.includes('contactShadow(powerX,powerY'));
 assert.ok(three.includes('contactShadow(X(x),Y(y),1.65,1.04)'));
 assert.ok(three.includes('contactShadow(x,y,r*2.8,r*2.8)'));
 assert.ok(!three.includes('new T.RigidBody'));
 assert.ok(canvas.includes("c.shadowBlur=19;c.shadowOffsetY=10"));
});
