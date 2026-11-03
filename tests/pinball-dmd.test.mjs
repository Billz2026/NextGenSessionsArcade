import test from 'node:test';
import assert from 'node:assert/strict';
import {createDotMatrix,DMD_COLS,DMD_ROWS,getDmdStatus,describeDmdEvent,ATTRACT_MESSAGES,createDmdTimeline} from '../games/pinball/dmd.mjs';
function mockScreen(){
 const calls={dots:0,frames:0,labels:0,text:[],fonts:[],strokes:[],size:null};
 const screen={
  setTransform(...a){calls.size=a},save(){},restore(){},
  beginPath(){},rect(){},clip(){},
  fillRect(x,y,w,h){
   if(x===0&&y===0&&w===560&&h===162)calls.frames++;
   if(w===1.8&&h===1.8)calls.dots++;
  },
  fillText(txt){calls.labels++;calls.text.push(txt);calls.fonts.push(this.font)},
  strokeText(txt){calls.strokes.push(txt)},
  measureText(txt){const size=Number(this.font?.match(/(\d+)px/)?.[1]||30);return{width:txt.length*size*.62}},
  strokeRect(){}
 };
 return {calls,canvas:{getContext(){return screen}},restore(){}};
}

test('high-resolution dot-matrix lettering overlays all 80 × 22 physical LED accents',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'ready',score:0};
  dmd.update(game,1000);
  assert.equal(m.canvas.width,1120);assert.equal(m.canvas.height,324);
  assert.deepEqual(m.calls.size,[2,0,0,2,0,0]);
  assert.equal(m.calls.dots,DMD_COLS*DMD_ROWS);
  assert.equal(m.calls.labels,2);
  dmd.dispose();
 }finally{m.restore()}
});
test('display throttles frames but redraws for important scoring announcements',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'playing',ball:{mode:'live'},ballNumber:1,score:3250,time:2,frenzyUntil:0,multiplierUntil:0};
  dmd.update(game,1000);
  const count=m.calls.dots;
  dmd.update(game,1030);assert.equal(m.calls.dots,count);
  dmd.notify({type:'mission',headline:'TARGET BANK'},1040);
  dmd.update(game,1050);assert.equal(m.calls.dots,count*2);
  dmd.dispose();dmd.update(game,2000);
  assert.equal(m.calls.dots,count*2);
 }finally{m.restore()}
});
test('high priority celebration cannot be displaced by low priority spinner',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const g={state:'playing',ball:{mode:'live'},ballNumber:1,score:100,time:3,frenzyUntil:0,multiplierUntil:0};
  dmd.notify({type:'extra'},1000);
  dmd.update(g,1001);
  const firstHeadline=m.calls.text.at(-2);
  dmd.notify({type:'spinner',turns:4},1020);
  dmd.update(g,1100);
  assert.equal(m.calls.text.at(-2),firstHeadline,'lower priority event replaced EXTRA BALL');
  assert.equal(firstHeadline,'EXTRA BALL');
  dmd.dispose();
 }finally{m.restore()}
});

test('mission announcements use large sharp 51px/35px text rather than 11px bitmap glyphs',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'playing',ball:{mode:'live'},ballNumber:1,score:0,time:2,frenzyUntil:0,multiplierUntil:0};
  dmd.notify({type:'mission',headline:'TARGET BANK COMPLETE'},1000);
  dmd.update(game,1010);
  assert.equal(m.calls.text.at(-2),'TARGET BANK');
  assert.equal(m.calls.text.at(-1),'COMPLETE!');
  assert.ok(parseInt(m.calls.fonts.at(-2).match(/(\d+)px/)[1])>=34);
  assert.ok(parseInt(m.calls.fonts.at(-1).match(/(\d+)px/)[1])>=26);
  assert.deepEqual(m.calls.strokes.at(-2),'TARGET BANK');
  assert.deepEqual(m.calls.strokes.at(-1),'COMPLETE!');
  dmd.dispose();
 }finally{m.restore()}
});

test('attract sequence rotates through four distinct arcade messages without repeating branding',()=>{
 const g={state:'ready',score:0};
 const first=ATTRACT_MESSAGES.map((_,i)=>getDmdStatus(g,i*3800));
 assert.deepEqual(first,[
  ['PRESS START','PLAYER ONE READY'],
  ['NEON TILT','SET A NEW RECORD'],
  ['FLIPPERS READY','A / D OR ARROWS']
 ]);
 assert.deepEqual(getDmdStatus(g,3*3800),first[0]);
});
test('normal play alternates live score, target progress and game objectives',()=>{
 const g={state:'playing',ball:{mode:'live'},ballNumber:2,score:16720,
  time:10,frenzyUntil:0,multiplierUntil:0,
  targets:new Set([0,2]),lanes:new Set([1]),spinnerTurns:5,scoopHits:1};
 assert.deepEqual(getDmdStatus(g,0),['SCORE 16,720','BALL 2 / 3']);
 assert.deepEqual(getDmdStatus(g,4000),['POWER GRID 0/3','HIT RAMP OR ORBIT']);
 assert.deepEqual(getDmdStatus(g,8000),['TARGET BANK 2/4','NEON LANES 1/3']);
 assert.deepEqual(getDmdStatus(g,12000),['SPINNER 0/5','BUILD OVERDRIVE']);
});
test('shot and scoop point announcements respect the live multiplier',()=>{
 const g={time:6,multiplierUntil:10};
 assert.equal(describeDmdEvent({type:'shot',kind:'ramp',points:7500},g).sub,'+15,000');
 assert.equal(describeDmdEvent({type:'shot',kind:'orbit',points:5000},g).sub,'+10,000');
 assert.equal(describeDmdEvent({type:'scoop'},g).sub,'+16,000');
 assert.equal(describeDmdEvent({type:'spinner',turns:3},g).sub,'+2,500');
 assert.equal(describeDmdEvent({type:'shot',kind:'orbit',points:5000},
  {time:11,multiplierUntil:10}).sub,'+5,000');
});
test('major events override minor hit messages, but never the other way around',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const g={state:'playing',ball:{mode:'live'},score:0,ballNumber:1,time:2,frenzyUntil:0,multiplierUntil:0};
  dmd.notify({type:'hit',target:'bumper0',score:150},1000,g);
  dmd.update(g,1010);
  assert.equal(m.calls.text.at(-2),'BUMPER HIT');
  dmd.notify({type:'shot',kind:'ramp',points:7500},1200,g);
  dmd.update(g,1210);
  assert.equal(m.calls.text.at(-2),'RAMP SHOT');
  dmd.notify({type:'hit',target:'bumper1',score:150},1300,g);
  dmd.update(g,1400);
  assert.equal(m.calls.text.at(-2),'RAMP SHOT');
  dmd.notify({type:'extra'},1450,g);
  dmd.update(g,1500);
  assert.equal(m.calls.text.at(-2),'EXTRA BALL');
  dmd.notify({type:'shot',kind:'orbit',points:5000},1600,g);
  dmd.update(g,1700);
  assert.equal(m.calls.text.at(-2),'EXTRA BALL');
  dmd.dispose();
 }finally{m.restore()}
});
test('start event clears prior gameover celebration without waiting for timeout',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const g={state:'ready',score:0};
  dmd.notify({type:'gameover',score:65000},1000,g);
  dmd.update(g,1010);
  assert.equal(m.calls.text.at(-2),'GAME OVER');
  dmd.notify({type:'start'},1020,g);
  dmd.update(g,1100);
  assert.equal(m.calls.text.at(-2),'PLAYER ONE');
  dmd.dispose();
 }finally{m.restore()}
});
test('random scoring award events do not displace key DMD callouts',()=>{
 assert.equal(describeDmdEvent({type:'award',score:125,label:'NORMAL TARGET'}),null);
 assert.equal(describeDmdEvent({type:'award',score:2500,label:'END-OF-BALL BONUS'}).sub,'+2,500');
 assert.equal(describeDmdEvent({type:'hit',target:'sling0',score:100}),null);
 assert.equal(describeDmdEvent({type:'ballsave'}).priority,4);
 assert.equal(describeDmdEvent({type:'gameover',score:50000}).priority,5);
});
test('the DMD shows context-sensitive ball and game-over status',()=>{
 assert.deepEqual(getDmdStatus({state:'playing',ball:{mode:'shooter'},ballNumber:3},9000),
  ['BALL 3 READY','HOLD TO LAUNCH']);
 assert.deepEqual(getDmdStatus({state:'gameover',score:42180},9500),
  ['GAME OVER','FINAL SCORE 42,180']);
 assert.deepEqual(getDmdStatus({state:'between'},9500),
  ['BALL 1 OVER','SCORE 0']);
});

test('Phase 3M DMD announces real bonuses and special modes',()=>{
 assert.deepEqual(
  [describeDmdEvent({type:'skillshot',points:12000}).headline,
   describeDmdEvent({type:'combo',count:3,points:10000}).sub,
   describeDmdEvent({type:'hurryup'}).headline,
   describeDmdEvent({type:'jackpot',points:50000}).sub],
  ['SKILL SHOT!','+10,000','JACKPOT LIT!','+50,000']);
 assert.equal(describeDmdEvent({type:'overdrive'}).priority,4);
 assert.equal(describeDmdEvent({type:'superSpinner',points:3000}).sub,'+3,000');
 assert.equal(describeDmdEvent({type:'hurryMiss'}).sub,'RECHARGE GRID');
});
test('DMD displays timer-driven jackpot and Overdrive objectives',()=>{
 const base={state:'playing',ball:{mode:'live'},ballNumber:2,score:17000,time:12,
  frenzyUntil:0,multiplierUntil:0,powerCharges:3,overdriveUntil:0,hurryUpUntil:26};
 assert.deepEqual(getDmdStatus(base,7000),['JACKPOT LIT','SCOOP · 14 SEC']);
 assert.deepEqual(getDmdStatus({...base,hurryUpUntil:0,overdriveUntil:22},7000),
  ['OVERDRIVE · 10S','HIT THE SPINNER']);
});


test('long display messages fit with readable minimum type sizes',()=>{
 const m=mockScreen();
 try{
  const display=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'playing',ball:{mode:'live'},score:350000,ballNumber:2,time:10,
   hurryUpUntil:25,frenzyUntil:0,multiplierUntil:0};
  display.update(game,5000);
  assert.equal(m.calls.text.at(-2),'JACKPOT LIT');
  assert.equal(m.calls.text.at(-1),'SCOOP · 15 SEC');
  const sizes=m.calls.fonts.slice(-2).map(f=>parseInt(f.match(/(\d+)px/)[1]));
  assert.ok(sizes[0]>=34&&sizes[1]>=26);
  assert.equal(m.calls.strokes.at(-2),'JACKPOT LIT');
  display.dispose();
 }finally{m.restore()}
});
test('sharp DMD uses no sampled low-res bitmap or blurred lettering',()=>{
 const m=mockScreen();
 try{
  const display=createDotMatrix(m.canvas,{reducedMotion:true});
  display.update({state:'ready'},1000);
  assert.equal(m.calls.labels,2);
  assert.equal(m.calls.strokes.length,2);
  assert.equal(m.calls.frames,1);
  assert.equal(m.calls.dots,DMD_COLS*DMD_ROWS);
  display.dispose();
 }finally{m.restore()}
});

test('important events interrupt weaker callouts and queued shots play afterwards',()=>{
 const timeline=createDmdTimeline(),g={state:'playing',ball:{mode:'live'},score:15000};
 timeline.notify({type:'shot',kind:'ramp',points:7500},1000,g);
 assert.equal(timeline.current(1010).headline,'RAMP SHOT');
 timeline.notify({type:'hurryup'},1300,g);
 assert.equal(timeline.current(1310).headline,'JACKPOT LIT!');
 timeline.notify({type:'combo',count:2,points:10000},1400,g);
 assert.equal(timeline.current(1600).headline,'JACKPOT LIT!');
 assert.equal(timeline.current(3600).headline,'RAMP SHOT');
 assert.equal(timeline.current(5200).headline,'COMBO X2');
});
test('queued repetitive progress replaces stale updates and expires',()=>{
 const timeline=createDmdTimeline(),g={state:'playing',ball:{mode:'live'}};
 timeline.notify({type:'extra'},1000,g);
 for(let i=0;i<20;i++)timeline.notify({type:'power',charges:i%3,needed:3},1010+i*40,g);
 assert.equal(timeline.current(1500).headline,'EXTRA BALL');
 assert.equal(timeline.current(4300).headline,'POWER GRID 1/3');
 assert.equal(timeline.current(6000),null,'old queued info does not stay forever');
});
test('new ball and new game discard old achievements, game-over record is genuine',()=>{
 const timeline=createDmdTimeline(),g={state:'playing',ball:{mode:'shooter'}};
 timeline.notify({type:'jackpot',points:50000},1000,g);
 timeline.notify({type:'combo',count:3,points:5000},1100,g);
 timeline.notify({type:'ball',ball:2},1200,g);
 assert.equal(timeline.current(1210).headline,'BALL 2 READY');
 assert.equal(timeline.current(3300),null,'previous-ball combo discarded');
 assert.equal(describeDmdEvent({type:'gameover',score:125000,record:true}).headline,'NEW HIGH SCORE!');
 assert.equal(describeDmdEvent({type:'gameover',score:125000,record:false}).headline,'GAME OVER');
 timeline.notify({type:'gameover',score:125000,record:true},3500,g);
 assert.equal(timeline.current(3510).headline,'NEW HIGH SCORE!');
 timeline.notify({type:'start'},3600,g);
 assert.equal(timeline.current(3610).headline,'PLAYER ONE READY');
});
test('live timers only show real active mode and ball-save windows',()=>{
 const g={state:'playing',ball:{mode:'live'},ballNumber:1,score:700,
  time:2,ballSaveUntil:11,ballSaveUsed:false,frenzyUntil:0,multiplierUntil:0};
 assert.deepEqual(getDmdStatus(g,4000),['BALL SAVE','9 SECONDS LEFT']);
 assert.deepEqual(getDmdStatus({...g,time:12},4000),['POWER GRID 0/3','HIT RAMP OR ORBIT']);
 assert.deepEqual(getDmdStatus({...g,hurryUpUntil:14,time:12},4000),['JACKPOT LIT','SCOOP · 2 SEC']);
 assert.equal(describeDmdEvent({type:'launch'},{skillShotPending:true}).headline,'SKILL SHOT LIT');
 assert.equal(describeDmdEvent({type:'launch'},{skillShotPending:false}).headline,'BALL IN PLAY');
});
