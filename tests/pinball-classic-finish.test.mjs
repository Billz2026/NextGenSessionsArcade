import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOARD,TRAVEL_PATHS,PinballEngine} from '../games/pinball/engine.mjs';
import {UPPER_ROUTES,guideEdges} from '../games/pinball/upper-hardware.mjs';
import {NEON_FINISH,GRID_LIGHTS,gridIllumination,roundedWirePoints}
 from '../games/pinball/classic-finish.mjs';
const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
const game=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');
test('brighter original finish is shared across 3D and fallback',()=>{
 for(const c of Object.values(NEON_FINISH))assert.match(c,/^#[0-9a-f]{6}$/i);
 assert.notEqual(NEON_FINISH.upper,NEON_FINISH.lower);
 assert.ok(three.includes('bg.addColorStop(0,NEON_FINISH.upper)'));
 assert.ok(canvas.includes('[0,NEON_FINISH.upper]'));
 assert.ok(three.includes('clearcoat:.83'));
});
test('three Power Grid jewels show real charge count and jackpot',()=>{
 const e=new PinballEngine();e.start();
 assert.deepEqual(GRID_LIGHTS.map(g=>g.index),[0,1,2]);
 assert.deepEqual(gridIllumination(e),[false,false,false]);
 e.powerCharges=2;assert.deepEqual(gridIllumination(e),[true,true,false]);
 e.powerCharges=3;assert.deepEqual(gridIllumination(e),[true,true,true]);
 e.powerCharges=0;e.hurryUpUntil=e.time+9;
 assert.deepEqual(gridIllumination(e),[true,true,true]);
 assert.ok(three.includes('const gridLit=gridIllumination(engine)'));
 assert.ok(canvas.includes('const gridLit=gridIllumination(engine)'));
 assert.ok(GRID_LIGHTS.every(g=>g.x>40&&g.x<BOARD.width-40));
});
test('lane rounding preserves all engine path geometry and route endpoints',()=>{
 for(const route of UPPER_ROUTES){
  const edges=guideEdges(route);
  for(const side of ['left','right']){
   const original=edges.map(x=>x[side]);
   const curved=roundedWirePoints(original,3);
   assert.ok(curved.length>original.length);
   assert.deepEqual(curved[0],original[0]);
   assert.deepEqual(curved.at(-1),original.at(-1));
   assert.ok(curved.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)));
  }
  assert.deepEqual(route.points.map(p=>[p.x,p.y,p.z]),TRAVEL_PATHS[route.kind]);
 }
 assert.ok(three.includes('roundedWirePoints(route.points,3)'));
 assert.ok(canvas.includes('roundedWirePoints(route.points,3)'));
 assert.ok(three.includes('function channelStrip(route,from,to,lift,mat)'));
 assert.ok(!three.includes('function railTube('));
});
test('classic finish does not change collision rules',()=>{
 assert.match(game,/render3d\.mjs\?v=\d+/);
 assert.match(game,/visuals\.mjs\?v=\d+/);
 assert.ok(!three.includes('new T.RigidBody'));
 assert.ok(!canvas.includes('engine.score+='));
});
