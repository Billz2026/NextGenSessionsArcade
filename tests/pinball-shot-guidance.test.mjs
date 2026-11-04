import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PinballEngine,SHOTS,SCOOP,FLIGHT_MISSIONS} from '../games/pinball/engine.mjs';
import {SHOT_INDICATORS,requiredShot,shotIndicatorState,shotIndicatorBrightness,approachLampState}
 from '../games/pinball/shot-guidance.mjs';

const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
const engineSource=readFileSync(new URL('../games/pinball/engine.mjs',import.meta.url),'utf8');

test('shot markers are anchored to actual scoring zones rather than new game sensors',()=>{
 const names=SHOT_INDICATORS.map(x=>x.kind);
 assert.deepEqual(names,['orbit','ramp','center','skyline','scoop','spinner','target']);
 for(const kind of ['orbit','ramp','center','skyline']){
  const spec=SHOT_INDICATORS.find(x=>x.kind===kind);
  assert.ok(Math.hypot(spec.x-SHOTS[kind].x,spec.y-SHOTS[kind].y)<22);
 }
 const scoop=SHOT_INDICATORS.find(x=>x.kind==='scoop');
 assert.equal(scoop.x,SCOOP.x);
 assert.equal(scoop.y,SCOOP.y);
 assert.equal(FLIGHT_MISSIONS.length,6);
});

test('mission sequence guides only the genuinely required next physical shot',()=>{
 const g=new PinballEngine();g.start();
 assert.equal(requiredShot(g),null);
 assert.equal(g.armCommandMission(),true);
 assert.equal(requiredShot(g),'ramp');
 assert.equal(shotIndicatorState(g,'ramp'),'mission');
 assert.equal(shotIndicatorState(g,'orbit'),'idle');
 assert.equal(g.startCommandMission(),true);
 assert.equal(requiredShot(g),FLIGHT_MISSIONS[0].sequence[0]);
 assert.equal(g.progressCommand('ramp'),true);
 assert.equal(requiredShot(g),'skyline');
 assert.equal(shotIndicatorState(g,'skyline'),'mission');
 assert.equal(shotIndicatorState(g,'ramp'),'idle');
 assert.equal(g.progressCommand('skyline'),true);
 assert.equal(requiredShot(g),null);
});

test('spinner, scoop, target bank and wizard use mission precedence without fake hints',()=>{
 const g=new PinballEngine();g.start();
 g.targets.add(0);
 assert.equal(shotIndicatorState(g,'target'),'charging');
 g.activeCommand={index:4,step:0};g.commandMissionIndex=4;g.commandFuelUntil=g.time+26;
 assert.equal(requiredShot(g),'spinner');
 assert.equal(shotIndicatorState(g,'spinner'),'mission');
 assert.equal(shotIndicatorState(g,'target'),'idle');
 g.activeCommand=null;
 g.neonCommandActive=true;g.neonCommandStep=2;g.neonCommandUntil=g.time+30;
 assert.equal(requiredShot(g),'center');
 g.neonCommandStep=4;
 assert.equal(requiredShot(g),'scoop');
 g.neonCommandActive=false;g.neonCommandReady=true;
 assert.equal(requiredShot(g),'scoop');
 g.neonCommandReady=false;g.lockLit=true;
 assert.equal(shotIndicatorState(g,'scoop'),'mission');
 g.tilted=true;
 assert.equal(requiredShot(g),null);
 assert.equal(shotIndicatorState(g,'scoop'),'idle');
});

test('multiball lamps guide unclaimed jackpots then the scoop super jackpot',()=>{
 const g=new PinballEngine();g.start();g.startMultiball();
 assert.equal(shotIndicatorState(g,'ramp'),'jackpot');
 assert.equal(shotIndicatorState(g,'orbit'),'jackpot');
 assert.equal(shotIndicatorState(g,'scoop'),'idle');
 g.awardMultiballJackpot('ramp');
 assert.equal(shotIndicatorState(g,'ramp'),'claimed');
 assert.equal(shotIndicatorState(g,'orbit'),'jackpot');
 g.awardMultiballJackpot('orbit');
 assert.equal(g.multiballSuperLit,true);
 assert.equal(shotIndicatorState(g,'scoop'),'mission');
 assert.equal(shotIndicatorState(g,'ramp'),'idle');
 g.awardSuperJackpot();
 assert.equal(shotIndicatorState(g,'ramp'),'jackpot');
 assert.equal(shotIndicatorState(g,'orbit'),'jackpot');
 assert.equal(shotIndicatorState(g,'scoop'),'idle');
});

test('visual pulse is continuous, bounded and steady with reduced motion',()=>{
 for(const mode of ['mission','jackpot','charging','confirmed','idle','claimed']){
  const samples=Array.from({length:30},(_,i)=>shotIndicatorBrightness(mode,i*.083,false));
  assert.ok(samples.every(x=>x>=0&&x<=1));
  if(mode==='mission'||mode==='jackpot')
   assert.ok(Math.max(...samples)-Math.min(...samples)>.1,'live '+mode+' must pulse');
  const baseline=shotIndicatorBrightness(mode,0,true);
  for(const t of [0,.1,5,100])
   assert.equal(shotIndicatorBrightness(mode,t,true),baseline,'reduced motion constant');
 }
});

test('both renderers use one shared guidance module and avoid new collision or scores',()=>{
 assert.match(three,/import \{shotIndicatorState,shotIndicatorBrightness\} from '\.\/shot-guidance\.mjs/);
 assert.match(canvas,/import \{SHOT_INDICATORS,shotIndicatorState,shotIndicatorBrightness\} from '\.\/shot-guidance\.mjs/);
 assert.match(three,/for\(const a of arrowMesh\)/);
 assert.match(three,/shotIndicatorState\(engine,a\.group\)/);
 assert.match(three,/shotIndicatorState\(engine,route\.kind\)/);
 assert.match(canvas,/function drawShotGuidance\(c,engine,anim,reducedMotion\)/);
 assert.match(canvas,/drawShotGuidance\(ctx,engine,anim,reducedMotion\)/);
 assert.match(three,/\[312,433,'scoop'/);
 assert.match(three,/\[212,386,'target'/);
 assert.match(canvas,/G\(c,40,420,91,460,\[\[0,'#5b4e3a'/);
 assert.doesNotMatch(engineSource,/shot-guidance\.mjs/);
 assert.doesNotMatch(three,/new T\.BoxGeometry\(\d+,\d+,\d+\).*SHOT_INDICATORS/);
});

test('lane lens illuminates on requested shots and the actual ball transport state',()=>{
 const game=new PinballEngine();
 assert.equal(approachLampState(game,'orbit'),'idle');
 game.start();
 assert.equal(approachLampState(game,'orbit'),'idle');
 game.armCommandMission();
 assert.equal(approachLampState(game,'ramp'),'mission');
 assert.equal(approachLampState(game,'orbit'),'idle');
 game.ball.mode='live';
 game.activateShot('orbit');
 assert.equal(approachLampState(game,'orbit'),'travel');
 assert.equal(approachLampState(game,'ramp'),'mission');
 game.tilted=true;
 assert.equal(approachLampState(game,'orbit'),'idle','TILT must not imply a working lamp');
});

test('ball-travel lens effect is smooth and respects reduced-motion',()=>{
 const samples=[0,.2,.4,.6,.8,1].map(t=>shotIndicatorBrightness('travel',t,false));
 assert.ok(samples.every(n=>n>=.78&&n<=1));
 assert.ok(Math.max(...samples)-Math.min(...samples)>.04);
 for(const t of [0,.3,1,50])
  assert.equal(shotIndicatorBrightness('travel',t,true),1);
});
