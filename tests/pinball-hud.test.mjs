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
 const field=()=>({textContent:'',style:{},classList:{toggle(){}},disabled:false,hidden:false});
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
test('ready shows Start only and hides plunger',()=>{
 const {ui,sync}=makeHarness();sync();
 assert.equal(ui.scoreState.textContent,'READY');
 assert.equal(ui.missionMessage.textContent,'TABLE ONLINE');
 assert.equal(ui.actionPanel.hidden,false);
 assert.equal(ui.start.hidden,false);
 assert.equal(ui.start.textContent,'START GAME');
 assert.equal(ui.launch.hidden,true);
 assert.equal(ui.launcherPanel.hidden,true);
 assert.equal(ui.reset.disabled,true);
});
test('ball in shooter has one Launch CTA, then no CTA while playing',()=>{
 const {ui,engine,sync}=makeHarness();engine.start();sync();
 assert.equal(ui.powerTitle.textContent,'CHARGE');
 assert.match(ui.powerLabel.textContent,/^\d+%$/);
 assert.equal(ui.launch.disabled,false);
 assert.equal(ui.launch.hidden,false);
 assert.equal(ui.start.hidden,true);
 assert.equal(ui.actionPanel.hidden,false);
 assert.equal(ui.launcherPanel.hidden,false);
 assert.equal(ui.missionMessage.textContent,'SKILL SHOT AVAILABLE');
 engine.launch();sync();
 assert.equal(ui.powerTitle.textContent,'TIME REMAINING');
 assert.match(ui.powerLabel.textContent,/^\d+s$/);
 assert.equal(ui.launch.disabled,true);
 assert.equal(ui.launch.hidden,true);
 assert.equal(ui.start.hidden,true);
 assert.equal(ui.actionPanel.hidden,true);
 assert.equal(ui.launcherPanel.hidden,false);
 assert.equal(ui.missionMessage.textContent,'SHOOT RAMP OR ORBIT');
});
test('expired save is OFF and progress empties after launch',()=>{
 const {ui,engine,sync}=makeHarness();
 engine.start();engine.launch();sync();
 engine.time=engine.ballSaveUntil+.1;sync();
 assert.equal(ui.launcherPanel.hidden,true);
 assert.equal(ui.power.style.width,'0%');
});

test('between balls has no primary button',()=>{
 const {ui,engine,sync}=makeHarness();engine.start();engine.state='between';engine.ball=null;sync();
 assert.equal(ui.actionPanel.hidden,true);
 assert.equal(ui.launcherPanel.hidden,true);
 assert.equal(ui.missionMessage.textContent,'BALL 1 COMPLETE');
});
test('game over has Play Again only, Reset remains secondary',()=>{
 const {ui,engine,sync}=makeHarness();engine.start();engine.state='gameover';engine.ball=null;engine.score=92350;sync();
 assert.equal(ui.actionPanel.hidden,false);
 assert.equal(ui.start.hidden,false);
 assert.equal(ui.start.textContent,'PLAY AGAIN');
 assert.equal(ui.launch.hidden,true);
 assert.equal(ui.reset.disabled,false);
 assert.equal(ui.missionMessage.textContent,'FINAL SCORE 92350');
});
