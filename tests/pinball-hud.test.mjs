import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {PinballEngine} from '../games/pinball/engine.mjs';

// Exercise the real HUD function with a lightweight DOM substitute.
const controller=readFileSync(fileURLToPath(new URL('../games/pinball/game.mjs',import.meta.url)),'utf8');
const begin=controller.indexOf('function syncHUD(){');
const end=controller.indexOf('\nfunction arcadeMessage(',begin);
assert.ok(begin>=0&&end>begin,'syncHUD source must be found');
const source=controller.slice(begin,end);
function makeHarness(){
 const field=()=>({textContent:'',style:{},classList:{toggle(){}},disabled:false});
 const ui=new Proxy({},{get(o,key){
  if(!Object.hasOwn(o,key))o[key]=field();
  return o[key];
 }});
 ui.mission={lanes:field(),frenzy:field(),targets:field(),ride:field()};
 ui.progress={lanes:field(),frenzy:field(),targets:field(),ride:field()};
 const engine=new PinballEngine();
 const build=Function('engine','ui',
  'let lastScore=null,lastBall=null,lastStatus=null,lastPower=null;'+
  'let lastBest=null,lastStatusText=null;'+
  'const best=0,fmt=n=>String(n),spinnerCount=null,scoopCount=null;'+
  'const messageUntil=-1,performance={now:()=>1000};'+source+';return syncHUD;');
 return{ui,engine,sync:build(engine,ui)};
}
test('launch bar is not shown while game is in attract mode',()=>{
 const {ui,sync}=makeHarness();sync();
 assert.equal(ui.powerLabel.textContent,'READY');
 assert.equal(ui.launchTitle.textContent,'01 / LAUNCH');
});
test('charge percentage and launch control are available only in shooter lane',()=>{
 const {ui,engine,sync}=makeHarness();
 engine.start();sync();
 assert.equal(ui.powerTitle.textContent,'PLUNGER POWER');
 assert.match(ui.powerLabel.textContent,/^\d+%$/);
 assert.equal(ui.launch.disabled,false);
 engine.launch();sync();
 assert.equal(ui.powerTitle.textContent,'EARLY BALL SAVE');
 assert.match(ui.powerLabel.textContent,/^\d+s$/);
 assert.equal(ui.launchTitle.textContent,'01 / IN PLAY');
 assert.equal(ui.launch.disabled,true);
 assert.match(ui.launch.textContent,/BALL IN PLAY/);
});
test('expired save is OFF and progress empties after launch',()=>{
 const {ui,engine,sync}=makeHarness();
 engine.start();engine.launch();sync();
 engine.time=engine.ballSaveUntil+.1;sync();
 assert.equal(ui.powerLabel.textContent,'OFF');
 assert.equal(ui.power.style.width,'0%');
});
