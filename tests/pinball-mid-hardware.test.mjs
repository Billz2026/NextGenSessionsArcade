import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BUMPERS,TARGETS,ARCADE_MODES,PinballEngine}
 from '../games/pinball/engine.mjs';
import {MID_BUMPERS,MID_TARGETS,POWER_CORE,midTableState}
 from '../games/pinball/mid-hardware.mjs';
const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
const game=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('../games/pinball/index.html',import.meta.url),'utf8');
test('all three physical bumper assemblies use unchanged engine colliders',()=>{
 assert.equal(MID_BUMPERS.length,3);
 for(const b of MID_BUMPERS)
  assert.deepEqual({x:b.x,y:b.y,r:b.r},((i)=>({
   x:BUMPERS[i].x,y:BUMPERS[i].y,r:BUMPERS[i].r
  }))(b.index));
 assert.ok(three.includes('for(const b of MID_BUMPERS)'));
 assert.ok(canvas.includes('for(let i=0;i<MID_BUMPERS.length;i++)'));
 assert.ok(three.includes('bumperCapMaterials[i].emissiveIntensity=hit?'));
 assert.ok(three.includes('bumperRingMaterials[i].emissiveIntensity=hit?'));
});
test('target bank has four fixed hit sensors with individual working lamps',()=>{
 assert.equal(MID_TARGETS.length,4);
 for(const t of MID_TARGETS)
  assert.deepEqual({x:t.x,y:t.y,r:t.r},{
   x:TARGETS[t.index].x,y:TARGETS[t.index].y,r:TARGETS[t.index].r
  });
 const g=new PinballEngine();
 g.start();
 assert.deepEqual(midTableState(g).targets,[false,false,false,false]);
 g.activateTarget(1);
 assert.deepEqual(midTableState(g).targets,[false,true,false,false]);
 for(const i of [0,2,3])g.activateTarget(i);
 assert.ok(g.missions.targets);
 assert.deepEqual(midTableState(g).targets,[true,true,true,true]);
 assert.ok(three.includes('targetStatusMaterials[i].emissiveIntensity=lit?'));
 assert.ok(canvas.includes('for(let i=0;i<MID_TARGETS.length;i++)'));
});
test('Power Core arc progression follows the real charge limit and jackpot state',()=>{
 assert.equal(POWER_CORE.charges,ARCADE_MODES.powerShots);
 const g=new PinballEngine();g.start();
 assert.equal(midTableState(g).charges,0);
 g.powerCharges=2;assert.equal(midTableState(g).charges,2);
 g.powerCharges=99;assert.equal(midTableState(g).charges,ARCADE_MODES.powerShots);
 g.powerCharges=2;g.hurryUpUntil=g.time+15;
 assert.equal(midTableState(g).rush,true);
 assert.ok(three.includes('for(let i=0;i<POWER_CORE.charges;i++)'));
 assert.ok(three.includes('i<mid.charges?2.2:.13'));
 assert.ok(canvas.includes('for(let i=0;i<POWER_CORE.charges;i++)'));
});
test('raised decorative centre parts remain separate from unchanged physics',()=>{
 assert.ok(three.includes('const coreGlass=new T.MeshPhysicalMaterial'));
 assert.ok(three.includes('cyl(powerX,powerY,.34,.68,.045,coreGlass'));
 assert.ok(three.includes('const targetBacking=new T.MeshPhysicalMaterial'));
 assert.ok(!game.includes('midTableState'),'the state is derived in renderers');
 assert.ok(game.includes("visuals.mjs?v=18"));
 assert.ok(game.includes("render3d.mjs?v=20"));
 assert.ok(html.includes('game.mjs?v=32'));
});
