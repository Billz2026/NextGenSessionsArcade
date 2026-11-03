import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WALLS,POSTS,SLINGS,PinballEngine} from '../games/pinball/engine.mjs';
import {LOWER_GUIDES,LOWER_SLINGS,LOWER_POSTS,LOWER_FLIPPER_BASES}
 from '../games/pinball/lower-hardware.mjs';
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
 for(const name of ['LOWER_GUIDES','LOWER_SLINGS','LOWER_POSTS','LOWER_FLIPPER_BASES'])
  assert.ok(three.includes('for(const '+(name==='LOWER_POSTS'?'post':name==='LOWER_GUIDES'?'guide':name==='LOWER_SLINGS'?'sling':'f')+' of '+name+')'));
 assert.ok(three.includes('flipperRubberMeshes.push('));
 assert.ok(three.includes('flipperInlays.push('));
 assert.ok(three.includes('mesh.rotation.set(0,0,angle)'));
 assert.ok(three.includes('recessed drain apron') || three.includes('recessed drain'));
});
test('Canvas fallback mirrors hardware and the game loads the new renderers',()=>{
 assert.ok(fallback.includes('for(const guide of LOWER_GUIDES)'));
 assert.ok(fallback.includes('for(let i=0;i<LOWER_SLINGS.length;i++)'));
 assert.ok(fallback.includes('LOWER_POSTS.some('));
 assert.ok(fallback.includes('Recessed drain apron'));
 assert.ok(controller.includes("visuals.mjs?v=15"));
 assert.ok(controller.includes("render3d.mjs?v=17"));
});
