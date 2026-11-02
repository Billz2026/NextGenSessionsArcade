import test from 'node:test';
import assert from 'node:assert/strict';
import {createDotMatrix,DMD_COLS,DMD_ROWS,getDmdStatus,describeDmdEvent,ATTRACT_MESSAGES} from '../games/pinball/dmd.mjs';
function mockScreen(){
 const calls={dots:0,frames:0,labels:0,text:[],fonts:[]};
 const pixels=new Uint8ClampedArray(DMD_COLS*DMD_ROWS*4);
 for(let i=0;i<DMD_COLS*DMD_ROWS;i+=9)pixels[i*4]=255;
 const paper={fillRect(){},fillText(txt){calls.labels++;calls.text.push(txt);calls.fonts.push(this.font)},getImageData(){return{data:pixels}}};
 const screen={fillRect(){calls.frames++},beginPath(){calls.dots++},arc(){},fill(){},strokeRect(){}};
 const old=globalThis.document;
 globalThis.document={createElement(){return{width:0,height:0,getContext(){return paper}}}};
 return {calls,canvas:{getContext(){return screen}},restore(){globalThis.document=old}};
}
test('dot-matrix display fits all 80 × 22 LED cells in 560 × 162 pixels',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'ready',score:0};
  dmd.update(game,1000);
  assert.equal(m.canvas.width,560);assert.equal(m.canvas.height,162);
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

test('mission announcements remain readable with prominent 11px/9px dot-matrix type',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'playing',ball:{mode:'live'},ballNumber:1,score:0,time:2,frenzyUntil:0,multiplierUntil:0};
  dmd.notify({type:'mission',headline:'TARGET BANK COMPLETE'},1000);
  dmd.update(game,1010);
  assert.equal(m.calls.text.at(-2),'TARGET BANK');
  assert.equal(m.calls.text.at(-1),'COMPLETE!');
  assert.match(m.calls.fonts.at(-2),/11px/);
  assert.match(m.calls.fonts.at(-1),/9px/);
  dmd.dispose();
 }finally{m.restore()}
});

test('attract sequence rotates through four distinct arcade messages without repeating branding',()=>{
 const g={state:'ready',score:0};
 const first=ATTRACT_MESSAGES.map((_,i)=>getDmdStatus(g,i*3800));
 assert.deepEqual(first,[
  ['PRESS START','PLAYER ONE READY'],
  ['3 BALL ARCADE','CHASE JACKPOTS'],
  ['LIGHT THE TABLE','RAMP + ORBIT'],
  ['HIGH SCORE RUN','OWN THE NIGHT']
 ]);
 assert.deepEqual(getDmdStatus(g,4*3800),first[0]);
});
test('normal play alternates live score, target progress and game objectives',()=>{
 const g={state:'playing',ball:{mode:'live'},ballNumber:2,score:16720,
  time:10,frenzyUntil:0,multiplierUntil:0,
  targets:new Set([0,2]),lanes:new Set([1]),spinnerTurns:5,scoopHits:1};
 assert.deepEqual(getDmdStatus(g,0),['SCORE 16,720','BALL 2 / 3']);
 assert.deepEqual(getDmdStatus(g,4500),['TARGET BANK 2/4','NEON LANES 1/3']);
 assert.deepEqual(getDmdStatus(g,9000),['RAMP + ORBIT','CHASE JACKPOTS']);
 assert.deepEqual(getDmdStatus(g,13500),['SPINS 5','SCOOPS 1']);
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
  ['BALL 3 READY','CHARGE PLUNGER']);
 assert.deepEqual(getDmdStatus({state:'gameover',score:42180},9500),
  ['GAME OVER','FINAL 42,180']);
 assert.deepEqual(getDmdStatus({state:'between'},9500),
  ['BALL DRAINED','NEXT BALL READY']);
});
