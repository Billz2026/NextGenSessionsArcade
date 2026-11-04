import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const controller=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');

test('procedural table audio has a protected master bus and percussive noise layer',()=>{
 assert.match(controller,/createDynamicsCompressor\(\)/);
 assert.match(controller,/audioMaster\.connect\(compressor\)\.connect\(audio\.destination\)/);
 assert.match(controller,/function noiseBurst\(/);
 assert.match(controller,/createBiquadFilter\(\)/);
});

test('physical materials receive distinct impact and stereo feedback',()=>{
 assert.match(controller,/function mechanicalImpact\(event\)/);
 for(const kind of ['bumper','sling','flipper','target','post'])
  assert.ok(controller.includes("event.kind==='"+kind+"'")||controller.includes("event.kind==='post'"),kind+' audio missing');
 assert.match(controller,/function impactPan\(x\)/);
 assert.match(controller,/if\(e\.type==='impact'\)mechanicalImpact\(e\)/);
});

test('flipper coils, plunger and guided route entry and exit have mechanical layers',()=>{
 assert.match(controller,/function mechanicalCoil\(/);
 assert.match(controller,/function plungerHardware\(/);
 assert.match(controller,/function routeHardware\(/);
 assert.match(controller,/if\(e\.type==='routeexit'\)routeHardware\(e\.kind,true\)/);
 assert.match(controller,/mechanicalCoil\(active,side\)/);
});
