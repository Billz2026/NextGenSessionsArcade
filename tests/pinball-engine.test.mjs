import test from 'node:test';
import assert from 'node:assert/strict';
import {BOARD,BUMPERS,PinballEngine} from '../games/pinball/engine.mjs';

const steps=(game,seconds,frame=1/60)=>{for(let t=0;t<seconds-1e-8;t+=frame)game.advance(Math.min(frame,seconds-t))};

test('game starts with a stationary shooter-lane ball and three-ball session',()=>{
 const g=new PinballEngine();assert.equal(g.state,'ready');g.start();
 assert.equal(g.state,'playing');assert.equal(g.ballNumber,1);assert.equal(g.ball.mode,'shooter');
 assert.equal(g.ball.x,382);assert.equal(g.score,0);
});
test('plunger charges with fixed time and fires upwards on release',()=>{
 const g=new PinballEngine();g.start();g.holdLaunch(true);steps(g,.5);
 assert.ok(g.charge>.6);
 g.holdLaunch(false);assert.equal(g.ball.mode,'live');assert.ok(g.ball.vy < -1050);
});
test('releasing focus cancels charge rather than accidentally launching',()=>{
 const g=new PinballEngine();g.start();g.holdLaunch(true);steps(g,.4);
 g.releaseControls();assert.equal(g.charging,false);
 assert.equal(g.ball.mode,'shooter');
});
test('flippers move toward motor targets and return to rest',()=>{
 const g=new PinballEngine();g.start();g.setFlipper('left',true);g.setFlipper('right',true);
 steps(g,.15);
 assert.ok(g.flippers.every(f=>f.a<-.5));
 g.setFlipper('left',false);g.setFlipper('right',false);steps(g,.15);
 assert.ok(g.flippers.every(f=>f.a>.35));
});
test('ball is affected by gravity and fixed-rate physics',()=>{
 const g=new PinballEngine();g.start();
 g.ball.mode='live';g.ball.x=200;g.ball.y=402;g.ball.vx=0;g.ball.vy=0;
 steps(g,.1);
 assert.ok(g.ball.y>402);
});
test('bumpers score once per impact and reverse an incoming ball',()=>{
 const g=new PinballEngine();g.start();
 const b=BUMPERS[0];g.ball.mode='live';g.ball.x=b.x;g.ball.y=b.y-b.r-BOARD.radius+.3;
 g.ball.vx=0;g.ball.vy=300;
 g.advance(BOARD.step);
 assert.equal(g.score,250);assert.ok(g.ball.vy<0);
});
test('draining all three balls ends a run',()=>{
 const g=new PinballEngine();g.start();
 for(let i=1;i<=3;i++){
  g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vx=0;g.ball.vy=140;
  g.advance(BOARD.step);assert.equal(g.state,'between');
  steps(g,.8);
  if(i<3){assert.equal(g.ballNumber,i+1);assert.equal(g.ball.mode,'shooter');}
 }
 assert.equal(g.state,'gameover');
 assert.ok(g.consumeEvents().some(e=>e.type==='gameover'));
});
test('same simulated time gives same ball position across render frame sizes',()=>{
 const configure=()=>{
  const g=new PinballEngine();g.start();g.ball.mode='live';g.ball.x=210;g.ball.y=410;g.ball.vx=45;g.ball.vy=40;return g;
 };
 const a=configure(),b=configure();
 steps(a,.2,1/60);steps(b,.2,1/120);
 assert.ok(Math.abs(a.ball.x-b.ball.x)<.2, 'x diverged');
 assert.ok(Math.abs(a.ball.y-b.ball.y)<.2, 'y diverged');
});
test('hit events preserve their type and target',()=>{
 const g=new PinballEngine();g.start();g.consumeEvents();g.scoreHit(250,'bumper0');
 const e=g.consumeEvents().at(-1);
 assert.equal(e.type,'hit');assert.equal(e.target,'bumper0');assert.equal(e.score,250);
});
test('renderer geometry constants retain declared playfield bounds',()=>{
 assert.equal(BOARD.width,420);assert.equal(BOARD.height,700);assert.equal(BOARD.step,1/240);
});


test('charged plunger routes the ball into the main table',()=>{
 const g=new PinballEngine();g.start();g.charge=.5;g.launch();
 let entered=false;
 for(let i=0;i<600&&g.state==='playing';i++){
   if(g.ball.x<355)entered=true;
   g.advance(1/60);
 }
 assert.equal(entered,true);
});
test('held flippers produce upward impulse at the bat face',()=>{
 for(const side of ['left','right']){
  const g=new PinballEngine();g.start();g.setFlipper(side,true);steps(g,.2,BOARD.step);
  const f=g.flippers.find(flipper=>flipper.side===side),tip=g.flipperTip(f);
  g.ball.mode='live';g.ball.x=(f.x+tip.x)/2;g.ball.y=(f.y+tip.y)/2-18;
  g.ball.vx=0;g.ball.vy=550;
  let strongest=0;
  for(let i=0;i<15;i++){g.advance(BOARD.step);strongest=Math.min(strongest,g.ball.vy);}
  assert.ok(strongest < -400,side+' bat lacked lift');
 }
});
