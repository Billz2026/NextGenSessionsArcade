import test from 'node:test';
import assert from 'node:assert/strict';
import {BOARD,BUMPERS,SHOTS,SPINNER,SCOOP,PinballEngine} from '../games/pinball/engine.mjs';

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
  steps(g,1.25);
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


test('three N-G-S rollover lanes trigger the 20-second 2x multiplier',()=>{
 const g=new PinballEngine();g.start();
 for(let i=0;i<3;i++)g.activateLane(i);
 assert.equal(g.missions.lanes,true);
 assert.equal(g.multiplierUntil,g.time+20);
 const before=g.score;g.scoreHit(250,'target-test');
 assert.equal(g.score-before,500);
});
test('four physical targets complete Target Bank mission',()=>{
 const g=new PinballEngine();g.start();
 for(let i=0;i<4;i++)g.activateTarget(i);
 assert.equal(g.missions.targets,true);
 assert.ok(g.score>=4*1500+25000);
});
test('bumper frenzy starts after ten hits and enhances bumper points',()=>{
 const g=new PinballEngine();g.start();
 for(let i=0;i<10;i++)g.bumper();
 assert.equal(g.missions.frenzy,true);
 assert.equal(g.frenzyUntil,15);
 const before=g.score;g.scoreHit(250,'bumper0');
 assert.equal(g.score-before,500);
});
test('ramp and orbit combo unlocks the Night Ride jackpot',()=>{
 const g=new PinballEngine();g.start();
 g.activateShot('ramp');g.time+=2;g.activateShot('orbit');
 assert.equal(g.missions.ride,true);
 assert.ok(g.score>=5000+7500+40000);
});
test('all four missions award one extra ball only once',()=>{
 const g=new PinballEngine();g.start();
 for(let i=0;i<3;i++)g.activateLane(i);
 for(let i=0;i<4;i++)g.activateTarget(i);
 for(let i=0;i<10;i++)g.bumper();
 g.activateShot('orbit');g.activateShot('ramp');
 assert.equal(g.extraBalls,1);assert.equal(g.extraAwarded,true);
 g.checkExtraBall();assert.equal(g.extraBalls,1);
 for(let i=0;i<3;i++){
   g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vx=0;g.ball.vy=150;
   g.advance(BOARD.step);steps(g,1.25);
 }
 assert.equal(g.state,'playing');
 assert.equal(g.playingExtraBall,true);
 assert.equal(g.ballNumber,3);
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=150;
 g.advance(BOARD.step);steps(g,1.25);
 assert.equal(g.state,'gameover');
});
test('ball save works once and requires a real launch',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.ball.x=210;g.ball.y=697;g.ball.vy=140;g.advance(BOARD.step);
 assert.equal(g.state,'playing');assert.equal(g.ball.mode,'shooter');
 assert.equal(g.ballSaveUsed,true);
 g.launch();g.ball.x=210;g.ball.y=697;g.ball.vy=140;
 g.advance(BOARD.step);assert.equal(g.state,'between');
});
test('end-of-ball bonus is added once, not repeated on subsequent frames',()=>{
 const g=new PinballEngine();g.start();g.scoreHit(1000,'test');
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=140;
 g.advance(BOARD.step);assert.equal(g.score,1100);
 steps(g,.5);assert.equal(g.score,1100);
});
test('ramp crossing moves ball into animated return lane',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';
 g.ball.x=SHOTS.ramp.x;g.ball.y=SHOTS.ramp.y+3;g.ball.vy=-1000;
 g.checkSensors({x:g.ball.x,y:SHOTS.ramp.y+10});
 // Crossing condition uses the new ball Y: set it past the threshold.
 g.ball.y=SHOTS.ramp.y-2;
 g.checkSensors({x:g.ball.x,y:SHOTS.ramp.y+8});
 assert.equal(g.ball.mode,'travel');
 assert.equal(g.shots,1);
 steps(g,1.1);assert.equal(g.ball.mode,'live');
});

test('spinner awards points once when crossed at speed',()=>{
 const g=new PinballEngine();g.start();g.time=5;g.ball.mode='live';
 g.ball.x=SPINNER.x;g.ball.y=SPINNER.y+2;g.ball.vy=400;g.ball.vx=10;
 g.checkSensors({x:SPINNER.x,y:SPINNER.y-10});
 assert.equal(g.spinnerTurns,1);
 assert.equal(g.score,SPINNER.points);
 assert.equal(g.consumeEvents().some(e=>e.type==='spinner'),true);
});
test('spinner cooldown prevents accidental duplicate scoring',()=>{
 const g=new PinballEngine();g.start();g.time=4;g.ball.mode='live';
 g.ball.x=SPINNER.x;g.ball.y=SPINNER.y+2;g.ball.vy=380;
 g.checkSensors({x:g.ball.x,y:SPINNER.y-10});
 g.time+=.09;g.ball.y=SPINNER.y-1;g.ball.vy=-380;
 g.checkSensors({x:g.ball.x,y:SPINNER.y+9});
 assert.equal(g.spinnerTurns,1);
});
test('scoop captures and ejects a real ball without losing a turn',()=>{
 const g=new PinballEngine();g.start();g.time=4;g.ball.mode='live';
 g.ball.x=SCOOP.x;g.ball.y=SCOOP.y;g.ball.vy=-350;g.ball.vx=20;
 g.checkSensors({x:SCOOP.x,y:SCOOP.y+10});
 assert.equal(g.ball.mode,'scoop');
 assert.equal(g.scoopHits,1);
 assert.equal(g.score,SCOOP.points);
 steps(g,SCOOP.hold+.12,BOARD.step);
 assert.equal(g.ball.mode,'live');
 assert.ok(g.ball.vy<0);
 assert.equal(g.ballNumber,1);
});
test('scoop cannot recapture ball instantly after eject',()=>{
 const g=new PinballEngine();g.start();g.time=10;g.ball.mode='live';
 g.ball.x=SCOOP.x;g.ball.y=SCOOP.y;g.ball.vy=-320;
 g.checkSensors({x:SCOOP.x,y:SCOOP.y+10});
 steps(g,SCOOP.hold+.05,BOARD.step);
 const initial=g.score;
 g.ball.x=SCOOP.x;g.ball.y=SCOOP.y;g.ball.vy=-330;
 g.checkSensors({x:SCOOP.x,y:SCOOP.y+10});
 assert.equal(g.scoopHits,1);
 assert.equal(g.score,initial);
});
test('new game resets spinner and scoop stats',()=>{
 const g=new PinballEngine();g.start();
 g.spinnerTurns=9;g.spinnerAngle=23;g.scoopHits=3;g.lastScoopTime=22;
 g.start();
 assert.equal(g.spinnerTurns,0);
 assert.equal(g.spinnerAngle,0);
 assert.equal(g.scoopHits,0);
 assert.ok(g.lastScoopTime<0);
});
