import test from 'node:test';
import assert from 'node:assert/strict';
import {BOARD,GRAVITY,PLAY_BALANCE,KICKBACK,POSTS,BUMPERS,SHOTS,SHOT_GUIDES,FLIPPER_SWEET_SPOT,RETURN_FEEDS,SPINNER,SCOOP,RAMP_PATH,ORBIT_PATH,CENTER_PATH,SKYLINE_PATH,TRAVEL_PATHS,ARCADE_MODES,RANKS,FLIGHT_MISSIONS,MISSION_FUEL,PinballEngine} from '../games/pinball/engine.mjs';

const steps=(game,seconds,frame=1/60)=>{for(let t=0;t<seconds-1e-8;t+=frame)game.advance(Math.min(frame,seconds-t))};

test('classic table nudges move the ball and rapid abuse tilts the machine',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';g.ball.x=210;g.ball.y=555;g.ball.vx=0;
 assert.equal(g.nudge('left'),true);assert.ok(g.ball.vx<0);
 for(let i=0;i<4;i++)g.advance(.05);
 assert.equal(g.nudge('right'),true);
 for(let i=0;i<4;i++)g.advance(.05);
 assert.equal(g.nudge('up'),true);assert.equal(g.tilted,false);
 for(let i=0;i<4;i++)g.advance(.05);
 assert.equal(g.nudge('up'),true);assert.equal(g.tilted,true);
 g.setFlipper('left',true);assert.equal(g.leftHeld,false);
 assert.ok(g.consumeEvents().some(e=>e.type==='tilt'));
});
test('tilt cancels scoring and ball bonus, then resets after drain',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';g.ball.x=210;g.ball.y=555;
 g.scoreHit(500,'test');assert.equal(g.score,500);g.bonus=800;
 for(let i=0;i<4;i++){if(i>0)for(let s=0;s<4;s++)g.advance(.05);g.nudge('up');}
 assert.equal(g.tilted,true);
 g.scoreHit(500,'test');assert.equal(g.score,500);
 assert.equal(g.addPoints(500,'TEST'),0);
 g.ball.x=210;g.ball.y=697;g.ball.vx=0;g.ball.vy=160;
 g.advance(BOARD.step);
 assert.equal(g.state,'between');assert.equal(g.score,500);
 for(let i=0;i<28;i++)g.advance(.05);
 assert.equal(g.state,'playing');assert.equal(g.ball.mode,'shooter');
 assert.equal(g.tilted,false);
});
test('nudge cools down and cannot be spammed in the same physics tick',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';g.ball.x=210;g.ball.y=555;
 assert.equal(g.nudge('up'),true);assert.equal(g.nudge('up'),false);
 for(let i=0;i<40;i++)g.advance(.05);
 assert.equal(g.tilted,false);assert.ok(g.tiltMeter<.1);
});
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
 assert.ok(g.flippers.every(f=>f.a<-.25));
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
   g.streakShieldReady=false;g.streakShieldSpent=true; // direct-drain test intentionally bypasses earned replay
   g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vx=0;g.ball.vy=150;
   g.advance(BOARD.step);steps(g,1.25);
 }
 assert.equal(g.state,'playing');
 assert.equal(g.playingExtraBall,true);
 assert.equal(g.ballNumber,3);
 g.streakShieldReady=false;g.streakShieldSpent=true;
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=150;
 g.advance(BOARD.step);steps(g,1.25);
 assert.equal(g.state,'gameover');
});
test('target bank arms a flight mission and the ramp launches it with full fuel',()=>{
 const g=new PinballEngine();g.start();g.consumeEvents();
 for(let i=0;i<4;i++)g.activateTarget(i);
 assert.equal(g.commandMissionReady,true);assert.equal(g.commandMission.name,FLIGHT_MISSIONS[0].name);
 g.activateShot('ramp');
 assert.equal(g.commandMissionReady,false);assert.ok(g.activeCommand);
 assert.equal(g.commandFuelRemaining,MISSION_FUEL);
 const types=g.consumeEvents().map(e=>e.type);
 assert.ok(types.includes('missionarmed'));assert.ok(types.includes('missionstart'));
});
test('multi-stage flight missions award command flags and rank promotions',()=>{
 const g=new PinballEngine();g.start();g.consumeEvents();
 for(const mission of FLIGHT_MISSIONS){
  assert.equal(g.armCommandMission(),true);assert.equal(g.startCommandMission(),true);
  for(const action of mission.sequence)assert.equal(g.progressCommand(action),true);
 }
 assert.equal(g.rankName,RANKS.at(-1));assert.equal(g.commandFlags,FLIGHT_MISSIONS.length);
 const events=g.consumeEvents();
 assert.equal(events.filter(e=>e.type==='commandcomplete').length,FLIGHT_MISSIONS.length);
 assert.equal(events.filter(e=>e.type==='promotion').length,4);
 g.start();assert.equal(g.rankName,'CADET');assert.equal(g.commandFlags,0);
});
test('mission fuel expires honestly and requires the target bank to re-arm',()=>{
 const g=new PinballEngine();g.start();g.armCommandMission();g.startCommandMission();g.consumeEvents();
 g.time=MISSION_FUEL;g.expireArcadeModes();
 assert.equal(g.activeCommand,null);assert.equal(g.commandMissionReady,false);
 const failed=g.consumeEvents().find(e=>e.type==='missionfailed');
 assert.equal(failed.reason,'FUEL DEPLETED');
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

test('guided ramp and orbit shots remain aligned with the physical raised paths',()=>{
 for(const [kind,path] of [['ramp',RAMP_PATH],['orbit',ORBIT_PATH]]){
  const g=new PinballEngine();g.start();g.ball.mode='live';
  g.ball.x=path[0][0];g.ball.y=path[0][1];
  g.activateShot(kind);
  const duration=g.ball.travel.duration;
  // Sample one fixed-step tick near the midpoint of the guided shot.
  steps(g,duration/2,BOARD.step);
  const b=g.ball;
  assert.equal(b.mode,'travel');
   // Every sample remains on a visible rail, despite uneven marker spacing.
   const distances=path.slice(1).map((q,i)=>{
    const p=path[i],dx=q[0]-p[0],dy=q[1]-p[1];
    const mix=Math.max(0,Math.min(1,((b.x-p[0])*dx+(b.y-p[1])*dy)/(dx*dx+dy*dy||1)));
    return Math.hypot(b.x-(p[0]+mix*dx),b.y-(p[1]+mix*dy));
   });
   assert.ok(Math.min(...distances)<1.2,kind+' ball left its visible wireform');
  assert.ok(b.travelHeight>=.35,kind+' failed to track physical height');
 }
});

test('separated flipper tips leave an actual drain gap while preserving outlane posts',()=>{
 const g=new PinballEngine();g.start();
 assert.equal(GRAVITY,780);
 assert.ok(g.flippers.every(f=>f.length>=55&&f.length<=60));
 const gap=g.flippers[1].x-g.flippers[0].x-2*g.flippers[0].length*Math.cos(.40);
 assert.ok(gap>BOARD.radius*2,'ball needs a gap between the resting bat tips');
 assert.ok(POSTS.some(p=>p.x===130&&p.y===641));
 assert.ok(POSTS.some(p=>p.x===290&&p.y===641));
});
test('ball save lasts 15 seconds from launch but can be claimed only once per ball',()=>{
 const g=new PinballEngine();g.start();g.launch();
 assert.ok(Math.abs(g.ballSaveUntil-g.ballLaunchedAt-15)<1e-8);
 g.time=g.ballSaveUntil-.1;
 g.ball.x=210;g.ball.y=697;g.ball.vy=180;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'playing');
 assert.equal(g.ball.mode,'shooter');
 assert.equal(g.ballSaveUsed,true);
 g.launch();
 assert.equal(g.ballSaveUsed,true);
 g.ball.x=210;g.ball.y=697;g.ball.vy=180;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'between');
});
test('an expired ball-save window does not prevent a genuine drain',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.time=g.ballSaveUntil+.1;
 g.ball.x=210;g.ball.y=697;g.ball.vy=180;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'between');
});
test('unattended flippers eventually drain even with the one-use kickback',()=>{
 const g=new PinballEngine();g.start();g.launch();
 let saveCount=0,drains=0,kicks=0;
 // Once-only outlane recovery extends the run; it must never create an
 // infinite unattended ball or a second free recovery charge.
 for(let i=0;i<90/BOARD.step&&!drains;i++){
  if(g.ball?.mode==='shooter')g.launch();
  g.singleStep(BOARD.step);
  for(const e of g.consumeEvents()){
   if(e.type==='ballsave')saveCount++;
   if(e.type==='kickback')kicks++;
   if(e.type==='drain')drains++;
  }
 }
 assert.ok(saveCount<=1,'automatic launch ball save cannot repeat');
 assert.ok(kicks<=2,'one early automatic ball save can serve another physical ball with one kickback');
 assert.equal(drains,1,JSON.stringify({state:g.state,time:g.time,saveCount,kicks,
  ball:g.ball&&{x:g.ball.x,y:g.ball.y,vx:g.ball.vx,vy:g.ball.vy,mode:g.ball.mode},
  shots:g.shots,score:g.score,ballSaveUsed:g.ballSaveUsed,kickbackReady:g.kickbackReady}));
});
test('responsive flipper play keeps the first ball active beyond initial short-drain window',()=>{
 const g=new PinballEngine();g.start();g.launch();
 for(let i=0;i<12/BOARD.step;i++){
  const t=i*BOARD.step;
  g.setFlipper('left',Math.sin(t*2.5)>-.15);
  g.setFlipper('right',Math.cos(t*2.8)>-.2);
  if(g.ball?.mode==='shooter')g.launch();
  g.singleStep(BOARD.step);
 }
 assert.equal(g.state,'playing');
 assert.equal(g.ballNumber,1);
});

test('first upper rollover after launch awards one real skill-shot bonus',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.time=3;g.activateLane(0);
 assert.equal(g.score,12750);
 assert.equal(g.skillShotPending,false);
 assert.equal(g.consumeEvents().filter(e=>e.type==='skillshot').length,1);
 g.activateLane(1);assert.equal(g.consumeEvents().filter(e=>e.type==='skillshot').length,0);
});
test('skill shot cannot be earned late or again after a saved launch',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.time=ARCADE_MODES.skillWindow+.1;g.activateLane(0);
 assert.equal(g.consumeEvents().some(e=>e.type==='skillshot'),false);
 g.ballSaveUsed=true;g.ball.mode='shooter';g.launch();
 g.activateLane(1);
 assert.equal(g.consumeEvents().some(e=>e.type==='skillshot'),false);
});
test('real shot combos pay escalating bonuses and reset after timeout',()=>{
 const g=new PinballEngine();g.start();
 g.activateShot('ramp');g.time+=2;g.activateShot('orbit');
 g.time+=2;g.activateShot('ramp');
 assert.equal(g.comboCount,3);
 const events=g.consumeEvents().filter(e=>e.type==='combo');
 assert.equal(events.length,2);assert.equal(events[0].points,5000);
 assert.equal(events[1].points,10000);
 g.time+=ARCADE_MODES.comboWindow+1;g.expireArcadeModes();
 assert.equal(g.comboCount,0);
 g.activateShot('ramp');assert.equal(g.comboCount,1);
});
test('three ramp/orbit shots charge a timed jackpot that is claimed at the scoop',()=>{
 const g=new PinballEngine();g.start();
 for(let i=0;i<3;i++){g.time+=1.5;g.activateShot(i%2?'orbit':'ramp');}
 assert.equal(g.powerCharges,3);
 assert.ok(g.hurryUpUntil>g.time);
 assert.equal(g.consumeEvents().filter(e=>e.type==='hurryup').length,1);
 g.ball.mode='live';g.ball.x=SCOOP.x;g.ball.y=SCOOP.y;
 g.ball.vy=-350;g.time+=1;
 const pre=g.score;g.checkSensors({x:SCOOP.x,y:SCOOP.y+8});
 assert.equal(g.powerCharges,0);assert.equal(g.hurryUpUntil,0);
 assert.equal(g.score-pre,58000);
 assert.equal(g.consumeEvents().filter(e=>e.type==='jackpot').length,1);
});
test('unclaimed jackpot hurry-up expires once without phantom awards',()=>{
 const g=new PinballEngine();g.start();
 for(let i=0;i<3;i++){g.time+=1;g.activateShot('ramp');}
 assert.ok(g.hurryUpUntil>0);
 const score=g.score;
 g.time=g.hurryUpUntil+.01;g.expireArcadeModes();
 assert.equal(g.hurryUpUntil,0);assert.equal(g.powerCharges,1);
 assert.equal(g.score,score);
 assert.equal(g.consumeEvents().filter(e=>e.type==='hurryMiss').length,1);
 g.expireArcadeModes();
 assert.equal(g.consumeEvents().filter(e=>e.type==='hurryMiss').length,0);
});
test('five spinner crossings start Overdrive and subsequent spins award bonus',()=>{
 const g=new PinballEngine();g.start();g.time=5;g.ball.mode='live';
 for(let i=0;i<6;i++){
  g.ball.x=SPINNER.x;g.ball.y=SPINNER.y+2;g.ball.vy=420;
  g.time+=.3;g.checkSensors({x:SPINNER.x,y:SPINNER.y-7});
 }
 assert.equal(g.spinnerTurns,6);
 assert.ok(g.overdriveUntil>g.time);
 const ev=g.consumeEvents();
 assert.equal(ev.filter(e=>e.type==='overdrive').length,1);
 assert.equal(ev.filter(e=>e.type==='superSpinner').length,1);
 assert.equal(g.score,6*SPINNER.points+3000);
});
test('special arcade modes reset on drain and on a fresh game',()=>{
 const g=new PinballEngine();g.start();
 g.powerCharges=2;g.hurryUpUntil=99;g.comboCount=4;g.overdriveUntil=99;
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=200;
 g.singleStep(BOARD.step);
 assert.equal(g.hurryUpUntil,0);assert.equal(g.powerCharges,0);
 assert.equal(g.comboCount,0);assert.equal(g.overdriveUntil,0);
 g.start();
 assert.equal(g.nextOverdriveAt,ARCADE_MODES.spinThreshold);
 assert.equal(g.skillShotPending,false);
});

test('all four routes have independent scoring sensors and shared physical paths',()=>{
 assert.equal(Object.keys(TRAVEL_PATHS).length,4);
 for(const kind of ['orbit','ramp','center','skyline']){
  const g=new PinballEngine();g.start();
  const shot=SHOTS[kind];
  g.ball.mode='live';g.ball.x=shot.x;g.ball.y=shot.y-2;
  g.ball.vy=-500;g.time=1;
  g.checkSensors({x:shot.x,y:shot.y+6});
  assert.equal(g.ball.mode,'travel',kind+' sensor not triggered');
  assert.equal(g.ball.travel.kind,kind);
  assert.ok(g.score>=shot.points,kind+' did not pay scoring points');
  assert.ok(TRAVEL_PATHS[kind].length>=7);
 }
});
test('centre crossover travels above middle bumper and returns towards right flipper',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';
 g.activateShot('center');
 const route=CENTER_PATH;
 const midway=g.ball.travel.duration*.5;
 steps(g,midway,BOARD.step);
 assert.equal(g.ball.mode,'travel');
 assert.ok(g.ball.travelHeight>1.0,'centre channel not elevated');
 // Stop on the exact simulation tick that releases the guided ball.
 while(g.ball.mode==='travel')g.singleStep(BOARD.step);
 assert.equal(g.ball.mode,'live');
 assert.ok(g.ball.vx<0&&g.ball.vy>0);
 assert.ok(g.ball.x>40&&g.ball.x<BOARD.width);
});
test('skyline loop guides ball into left return lane with positive exit velocity',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';
 g.activateShot('skyline');steps(g,.65,BOARD.step);
 assert.equal(g.ball.mode,'travel');
 assert.ok(g.ball.travelHeight>.4);
 steps(g,.7,BOARD.step);
 assert.equal(g.ball.mode,'live');
 assert.ok(g.ball.vx>0&&g.ball.vy>0);
 assert.ok(g.ball.x>35&&g.ball.x<BOARD.width);
});
test('new routes add honest combos and Power Grid charges without free repeat points',()=>{
 const g=new PinballEngine();g.start();
 g.activateShot('skyline');g.time+=2;g.activateShot('center');
 assert.equal(g.powerCharges,2);
 assert.equal(g.comboCount,2);
 const total=g.score;
 g.ball.mode='travel';
 for(let i=0;i<200;i++)g.singleStep(BOARD.step);
 assert.equal(g.score,total,'travel itself should not mint repeated score');
});

test('centre crossover is reachable during real flipper play, not just sensor injection',()=>{
 const g=new PinballEngine();g.start();let centre=0;
 for(let i=0;i<12/BOARD.step;i++){
  if(g.ball?.mode==='shooter')g.launch();
  const t=i*BOARD.step;
  g.setFlipper('left',Math.sin(t*2.2)>-.22);
  g.setFlipper('right',Math.cos(t*2.9)>-.08);
  g.singleStep(BOARD.step);
  for(const event of g.consumeEvents())
   if(event.type==='shot'&&event.kind==='center')centre++;
 }
 assert.ok(centre>=1,'centre channel must be reachable in ordinary responsive play');
});

test('a stationary held bat does not apply an automatic upward kick',()=>{
 for(const side of ['left','right']){
  const g=new PinballEngine();g.start();g.setFlipper(side,true);
  steps(g,.2,BOARD.step);
  const f=g.flippers.find(x=>x.side===side),tip=g.flipperTip(f);
  const dx=tip.x-f.x,dy=tip.y-f.y,length=Math.hypot(dx,dy);
  const nx=(dx>0?dy:-dy)/length,ny=-Math.abs(dx)/length;
  function impact(vy){
   g.ball.mode='live';g.ball.x=f.x+dx*.55+nx*16;
   g.ball.y=f.y+dy*.55+ny*16;g.ball.vx=0;g.ball.vy=vy;
   g.collideFlipper(f);return Math.hypot(g.ball.vx,g.ball.vy);
  }
  const soft=impact(50),hard=impact(550);
  assert.ok(soft<170,side+' slow contact was artificially launched');
  assert.ok(hard>soft+200,side+' hard contact lacked proportional rebound');
 }
});
test('bat tip travels faster than heel and yields a stronger strike',()=>{
 for(const side of ['left','right']){
  const g=new PinballEngine();g.start();
  const f=g.flippers.find(x=>x.side===side);
  f.a=-.25;f.omega=-14;
  const tip=g.flipperTip(f),dx=tip.x-f.x,dy=tip.y-f.y,length=Math.hypot(dx,dy);
  const nx=(dx>0?dy:-dy)/length,ny=-Math.abs(dx)/length;
  function strike(at){
   g.ball.mode='live';g.ball.x=f.x+dx*at+nx*16;
   g.ball.y=f.y+dy*at+ny*16;g.ball.vx=0;g.ball.vy=160;
   g.collideFlipper(f);return Math.hypot(g.ball.vx,g.ball.vy);
  }
  assert.ok(strike(.82)>strike(.23)+90,side+' tip strike not stronger');
 }
});
test('ramp and orbit return down the wireform without teleporting',()=>{
 for(const kind of ['ramp','orbit']){
  const path=TRAVEL_PATHS[kind];
  assert.ok(path.length>=13&&path.at(-1)[1]>500,'missing return rail');
  const g=new PinballEngine();g.start();g.ball.mode='live';
  g.ball.x=path[0][0];g.ball.y=path[0][1];g.ball.vy=-730;
  g.activateShot(kind);
  let biggest=0;
  while(g.ball.mode==='travel'){
   const old=[g.ball.x,g.ball.y];g.singleStep(BOARD.step);
   biggest=Math.max(biggest,Math.hypot(g.ball.x-old[0],g.ball.y-old[1]));
  }
  assert.ok(biggest<25,'rail motion had a visible teleport');
  assert.ok(Math.hypot(g.ball.x-path.at(-1)[0],g.ball.y-path.at(-1)[1])<.01);
  const last=path.at(-1),previous=path.at(-2);
  assert.ok(g.ball.vx*(last[0]-previous[0])+g.ball.vy*(last[1]-previous[1])>0,
   'ball exited opposite to the wireform direction');
 }
});
test('faster shots cross a guided rail in less time',()=>{
 const duration=vy=>{
  const g=new PinballEngine();g.start();g.ball.mode='live';
  g.ball.x=SHOTS.ramp.x;g.ball.y=SHOTS.ramp.y;g.ball.vy=vy;
  g.activateShot('ramp');return g.ball.travel.duration;
 };
 assert.ok(duration(-1100)<duration(-450));
});
test('physical contacts emit material, position and proportional impact feedback',()=>{
 const g=new PinballEngine();g.start();g.consumeEvents();
 const bumper=BUMPERS[0];
 g.ball.mode='live';g.ball.x=bumper.x;g.ball.y=bumper.y-bumper.r-BOARD.radius+.2;
 g.ball.vx=0;g.ball.vy=420;g.singleStep(BOARD.step);
 const impact=g.consumeEvents().find(e=>e.type==='impact'&&e.kind==='bumper');
 assert.ok(impact);assert.equal(impact.x,bumper.x);assert.equal(impact.y,bumper.y);
 assert.ok(impact.speed>=400);assert.ok(impact.strength>0&&impact.strength<=1);
});
test('shot-mouth guidance assists committed ramp and orbit approaches without magnetic cross-table aim',()=>{
 for(const guide of Object.values(SHOT_GUIDES)){
  const g=new PinballEngine();g.start();g.ball.mode='live';
  g.ball.x=guide.x+30;g.ball.y=guide.y+42;g.ball.vx=-180;g.ball.vy=-700;
  g.guideShotMouths(.08);assert.ok(g.ball.vx<-180,'committed approach was not guided');
  g.ball.vx=180;g.guideShotMouths(.08);assert.equal(g.ball.vx,180,'away-moving miss was magnetised');
  g.ball.x=guide.x+guide.capture+8;g.ball.vx=-180;
  g.guideShotMouths(.08);assert.equal(g.ball.vx,-180,'outside ball was pulled into the shot');
 }
});
test('guided hardware emits one route-exit event when the ball returns to the playfield',()=>{
 const g=new PinballEngine();g.start();g.consumeEvents();g.ball.mode='live';
 g.ball.x=SHOTS.ramp.x;g.ball.y=SHOTS.ramp.y;g.ball.vy=-800;g.activateShot('ramp');
 g.consumeEvents();while(g.ball.mode==='travel')g.singleStep(BOARD.step);
 const exits=g.consumeEvents().filter(e=>e.type==='routeexit');
 assert.equal(exits.length,1);assert.equal(exits[0].kind,'ramp');assert.ok(exits[0].speed>0);
 assert.equal(exits[0].feed,'right');
});
test('marked powered-flipper sweet spot improves cross-table shot alignment without energising dead flips',()=>{
 for(const side of ['left','right']){
  const strike=(at,omega=-14)=>{
   const g=new PinballEngine();g.start();g.consumeEvents();
   const f=g.flippers.find(x=>x.side===side);f.a=.12;f.omega=omega;
   const tip=g.flipperTip(f),dx=tip.x-f.x,dy=tip.y-f.y,length=Math.hypot(dx,dy);
   const nx=(dx>0?dy:-dy)/length,ny=-Math.abs(dx)/length;
   g.ball.mode='live';g.ball.x=f.x+dx*at+nx*16;g.ball.y=f.y+dy*at+ny*16;
   g.ball.vx=0;g.ball.vy=260;g.collideFlipper(f);
   const target=side==='left'?SHOTS.ramp:SHOTS.orbit;
   const ax=target.x-g.ball.x,ay=target.y-g.ball.y,speed=Math.hypot(g.ball.vx,g.ball.vy);
   const alignment=(ax*g.ball.vx+ay*g.ball.vy)/(Math.hypot(ax,ay)*speed);
   return {alignment,speed,event:g.consumeEvents().find(e=>e.type==='impact')};
  };
  const heel=strike(.20),sweet=strike(FLIPPER_SWEET_SPOT),dead=strike(FLIPPER_SWEET_SPOT,0);
  assert.equal(heel.event.grip,0);assert.ok(sweet.event.grip>.95);
  assert.ok(sweet.alignment>heel.alignment+.025,side+' sweet spot did not improve aim');
  assert.equal(dead.event.grip,0);assert.ok(dead.speed<sweet.speed*.55,side+' dead flip received a hidden kick');
 }
});
test('wireform returns project into their named flipper feed windows',()=>{
 for(const kind of ['ramp','orbit']){
  const g=new PinballEngine();g.start();g.ball.mode='live';g.activateShot(kind);
  while(g.ball.mode==='travel')g.singleStep(BOARD.step);
  const feed=RETURN_FEEDS[kind],travel=(feed.y-g.ball.y)/g.ball.vy;
  const projectedX=g.ball.x+g.ball.vx*travel;
  assert.ok(g.ball.vy>0&&travel>0,kind+' did not descend toward the flippers');
  assert.ok(Math.abs(projectedX-feed.x)<22,kind+' return missed the '+feed.side+' feed');
 }
});

test('Neon Tilt V2 selects six distinct flight missions and unlocks command mode after four',()=>{
 const g=new PinballEngine();g.start();
 assert.equal(FLIGHT_MISSIONS.length,6);
 for(let i=0;i<4;i++){
  assert.equal(g.armCommandMission(),true);
  assert.equal(g.commandMission.id,FLIGHT_MISSIONS[i].id);
  assert.equal(g.startCommandMission(),true);
  for(const action of FLIGHT_MISSIONS[i].sequence)assert.ok(g.progressCommand(action));
 }
 assert.equal(g.rankName,'COMMANDER');
 assert.equal(g.neonCommandReady,true);
 assert.equal(g.startNeonCommand(),true);
 for(const action of ['ramp','orbit','center','skyline','scoop'])assert.ok(g.progressNeonCommand(action));
 assert.equal(g.neonCommandDone,true);
 assert.equal(g.neonCommandActive,false);
 assert.ok(g.consumeEvents().some(e=>e.type==='wizardcomplete'));
 g.start();assert.equal(g.completedCommands.size,0);assert.equal(g.neonCommandDone,false);
});

test('Ball locks require actual scoop capture and serve replacements without spending regular balls',()=>{
 const g=new PinballEngine();g.start();g.launch();
 for(let locked=1;locked<=2;locked++){
  g.lockLit=true;g.commandMissionReady=false;g.activeCommand=null;
  g.lastScoopTime=-100;
  g.ball.mode='live';g.ball.x=SCOOP.x;g.ball.y=SCOOP.y;g.ball.vy=-480;
  g.checkSensors({x:SCOOP.x,y:SCOOP.y+16});
  assert.equal(g.ballLocks,locked);
  assert.equal(g.balls.length,1);
  assert.equal(g.ball.mode,'shooter');
  assert.equal(g.ballNumber,1);
 }
 g.lockLit=true;g.lastScoopTime=-100;
 g.ball.mode='live';g.ball.x=SCOOP.x;g.ball.y=SCOOP.y;g.ball.vy=-500;
 g.checkSensors({x:SCOOP.x,y:SCOOP.y+16});
 assert.equal(g.multiballActive,true);
 assert.equal(g.balls.length,3);
 assert.equal(new Set(g.balls.map(b=>b.id)).size,3);
 assert.ok(g.balls.every(b=>b.mode==='live'));
 assert.ok(g.consumeEvents().some(e=>e.type==='multiballstart'));
});

test('Multiball jackpots require two different shots and a scoop for super jackpot',()=>{
 const g=new PinballEngine();g.start();g.startMultiball();
 assert.equal(g.awardMultiballJackpot('ramp'),true);
 assert.equal(g.awardMultiballJackpot('ramp'),false);
 assert.equal(g.multiballSuperLit,false);
 assert.equal(g.awardMultiballJackpot('orbit'),true);
 assert.equal(g.multiballSuperLit,true);
 assert.equal(g.awardSuperJackpot(),true);
 assert.equal(g.multiballSuperLit,false);
 assert.equal(g.awardSuperJackpot(),false);
 assert.equal(g.score,160000);
});

test('Simulated multiball drains, saves and completion never consume extra regular turns',()=>{
 const g=new PinballEngine();g.start();g.startMultiball();
 const ids=g.balls.map(b=>b.id);
 const early=g.balls[2];
 early.x=210;early.y=698;early.vy=290;
 g.singleStep(BOARD.step);
 assert.equal(g.balls.length,3);
 assert.equal(g.multiballActive,true);
 assert.equal(g.ballNumber,1);
 assert.ok(!g.balls.some(b=>b.id===ids[2]));
 g.time=g.multiballSaveUntil+1;
 for(let n=2;n>=1;n--){
  const b=g.balls[g.balls.length-1];
  b.mode='live';b.x=210;b.y=698;b.vy=300;
  g.singleStep(BOARD.step);
  assert.equal(g.balls.length,n);
 }
 assert.equal(g.multiballActive,false);
 assert.equal(g.state,'playing');
 assert.equal(g.ballNumber,1);
 g.ball.mode='live';g.ball.x=210;g.ball.y=698;g.ball.vy=300;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'between');
 assert.equal(g.balls.length,0);
});

test('Active multiball can add only one replacement ball from a completed lane bank',()=>{
 const g=new PinballEngine();g.start();g.startMultiball();
 g.time=g.multiballSaveUntil+1;
 const b=g.balls.at(-1);b.x=210;b.y=698;b.vy=250;g.singleStep(BOARD.step);
 assert.equal(g.balls.length,2);
 g.activateLane(0);g.activateLane(1);g.activateLane(2);
 assert.equal(g.balls.length,3);
 assert.equal(g.multiballAddUsed,true);
 g.lanes.clear();g.activateLane(0);g.activateLane(1);g.activateLane(2);
 assert.equal(g.balls.length,3);
});

test('nudge gives a genuine TILT WARNING after three closely spaced bumps before fourth causes TILT',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';g.ball.x=210;g.ball.y=505;
 for(let i=0;i<3;i++){
  if(i>0)g.time+=.14;
  assert.equal(g.nudge('up'),true);
 }
 assert.equal(g.tilted,false,'three nudges are recoverable, as in the uploaded video');
 const events=g.consumeEvents();
 assert.equal(events.filter(e=>e.type==='tiltwarning').length,1);
 assert.equal(events.filter(e=>e.type==='tilt').length,0);
 g.time+=.14;assert.equal(g.nudge('up'),true);
 assert.equal(g.tilted,true);
 assert.equal(g.consumeEvents().filter(e=>e.type==='tilt').length,1);
});

test('outlane kickback is a single genuine physical impulse, not scoring or a teleport',()=>{
 for(const [side,x,vx] of [['left',105,-100],['right',315,100]]){
  const g=new PinballEngine();g.start();
  const b=g.ball;
  b.mode='live';b.x=x;b.y=644;b.vx=vx;b.vy=440;
  const score=g.score;
  assert.equal(g.kickbackReady,true);
  assert.equal(g.tryOutlaneKickback(),true,side+' was not recovered');
  assert.equal(b.x,x,'ball position must not be teleported');
  assert.equal(b.y,644,'ball position must not be teleported');
  assert.equal(b.vx,KICKBACK[side].vx);
  assert.equal(b.vy,KICKBACK[side].vy);
  assert.equal(g.kickbackReady,false);
  assert.equal(g.score,score,'coil is recovery not a score bonus');
  assert.equal(g.ballNumber,1);
  assert.equal(g.tryOutlaneKickback(),false,'charge cannot be used twice');
  const ev=g.consumeEvents().filter(e=>e.type==='kickback');
  assert.equal(ev.length,1);
  assert.equal(ev[0].side,side);
 }
});

test('outlane coil triggers during real fixed-step physics after entering the danger zone',()=>{
 for(const side of ['left','right']){
  const g=new PinballEngine();g.start();const b=g.ball;
  b.mode='live';b.x=side==='left'?105:315;b.y=639;
  b.vx=side==='left'?-80:80;b.vy=300;
  g.singleStep(BOARD.step);
  assert.equal(g.kickbackReady,false);
  assert.equal(g.ballNumber,1);
  assert.equal(g.state,'playing');
  assert.ok(b.vy<0);
  assert.equal(g.consumeEvents().filter(e=>e.type==='kickback').length,1);
 }
});

test('kickback never saves a central drain, never overrides tilt and cannot endlessly save a ball',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';
 g.ball.x=210;g.ball.y=697;g.ball.vx=0;g.ball.vy=200;
 assert.equal(g.tryOutlaneKickback(),false);
 g.singleStep(BOARD.step);
 assert.equal(g.state,'between','centre drain is always physically open');
 assert.equal(g.kickbackReady,true,'unused side coil stays charged for that ball');
 steps(g,1.25);
 g.ball.mode='live';g.ball.x=105;g.ball.y=644;g.ball.vx=-70;g.ball.vy=400;
 assert.equal(g.tryOutlaneKickback(),true);
 assert.equal(g.kickbackReady,false);
 g.ball.x=105;g.ball.y=644;g.ball.vx=-70;g.ball.vy=400;
 assert.equal(g.tryOutlaneKickback(),false);
 g.tilted=true;g.kickbackReady=true;
 assert.equal(g.tryOutlaneKickback(),false);
 g.ball.x=210;g.ball.y=697;g.ball.vx=0;g.ball.vy=200;
 g.singleStep(BOARD.step);
 steps(g,1.25);
 assert.equal(g.kickbackReady,true,'new served ball gets a fresh charge');
});

test('fairer flippers still leave the central gap and return feeds are passive',()=>{
 const g=new PinballEngine();
 assert.equal(g.flippers[0].length,58);
 const gap=g.flippers[1].x-g.flippers[0].x-
  2*g.flippers[0].length*Math.cos(.40);
 assert.ok(gap>BOARD.radius*2,'centre drain must remain genuinely open');
 assert.ok(RETURN_FEEDS.ramp.blend>=.3&&RETURN_FEEDS.ramp.blend<.5);
 assert.ok(RETURN_FEEDS.orbit.blend>=.3&&RETURN_FEEDS.orbit.blend<.5);
});

test('shooter lane is not mistaken for a right-side outlane recovery',()=>{
 const g=new PinballEngine();g.start();g.ball.mode='live';
 g.ball.x=382;g.ball.y=649;g.ball.vx=0;g.ball.vy=300;
 assert.equal(g.tryOutlaneKickback(),false,'plunger channel cannot consume KICKBACK');
 assert.equal(g.kickbackReady,true);
});

test('streak rescue is earned by two real route scoring events, not by passive bounces',()=>{
 const g=new PinballEngine();g.start();g.launch();
 for(let i=0;i<12;i++)g.bumper();
 assert.equal(g.streakShots,0);
 assert.equal(g.streakShieldReady,false);
 g.activateShot('ramp');
 assert.equal(g.streakShots,1);
 assert.equal(g.streakShieldReady,false);
 g.ball.mode='live';g.activateShot('orbit');
 assert.equal(g.streakShots,2);
 assert.equal(g.streakShieldReady,true);
 assert.equal(g.consumeEvents().filter(e=>e.type==='streakshield').length,1);
});

test('earned shield saves one legitimate post-window central drain without adding a turn',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.activateShot('ramp');g.ball.mode='live';g.activateShot('orbit');
 assert.equal(g.streakShieldReady,true);
 g.time=g.ballSaveUntil+2;
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vx=0;g.ball.vy=260;
 const before=g.ballNumber;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'playing');assert.equal(g.ball.mode,'shooter');
 assert.equal(g.ballNumber,before);
 assert.equal(g.streakShieldSpent,true);
 assert.equal(g.streakShieldReady,false);
 assert.equal(g.ballSaveUsed,true);
 assert.equal(g.consumeEvents().filter(e=>e.type==='streaksave').length,1);
 g.launch();
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=240;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'between','earned replay must never loop');
});

test('a fresh normal turn restores one earnable shield after the previous one is spent',()=>{
 const g=new PinballEngine();g.start();
 g.streakShots=2;g.streakShieldReady=false;g.streakShieldSpent=true;
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=180;
 g.singleStep(BOARD.step);
 for(let i=0;i<320;i++)g.singleStep(BOARD.step);
 assert.equal(g.state,'playing');assert.equal(g.ball.mode,'shooter');
 assert.equal(g.streakShieldSpent,false);
 assert.equal(g.streakShots,0);
 assert.equal(g.streakShieldReady,false);
});

test('tilted balls forfeit earned streak protection rather than becoming free replays',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.activateShot('ramp');g.ball.mode='live';g.activateShot('orbit');
 g.tilted=true;g.time=g.ballSaveUntil+1;
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=210;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'between');
 assert.equal(g.consumeEvents().filter(e=>e.type==='streaksave').length,0);
});

test('initial ball save and earned shield cannot manufacture unlimited launches',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.activateShot('ramp');g.ball.mode='live';g.activateShot('orbit');
 g.time=g.ballSaveUntil-.1;
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=190;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'playing');assert.equal(g.ballSaveUsed,true);
 assert.equal(g.streakShieldReady,true);
 g.launch();g.time=g.ballSaveUntil+1;
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=190;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'playing');
 assert.equal(g.streakShieldSpent,true);
 g.launch();
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=190;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'between');
});

test('balance maintains an accessible real center gap with controlled return lanes',()=>{
 const g=new PinballEngine();
 assert.equal(PLAY_BALANCE.flipperLength,58);
 assert.equal(PLAY_BALANCE.returnBlend,.36);
 const f=g.flippers[0];
 const actualGap=g.flippers[1].x-f.x-2*f.length*Math.cos(.40);
 assert.ok(actualGap>BOARD.radius*2);
 assert.equal(PLAY_BALANCE.launchSave,15);
});

test('protected replay keeps earned combo and grid progress for a real streak',()=>{
 const g=new PinballEngine();g.start();g.launch();
 g.time=g.ballSaveUntil+1; // build a fresh streak after normal early ball-save expires
 g.activateShot('ramp');g.ball.mode='live';g.time+=1;g.activateShot('orbit');
 assert.equal(g.streakShieldReady,true);
 const combo=g.comboCount,charges=g.powerCharges,until=g.comboUntil;
 assert.ok(combo>=2&&charges>0);
 g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=200;
 g.singleStep(BOARD.step);
 assert.equal(g.ball.mode,'shooter');
 assert.equal(g.comboCount,combo);
 assert.equal(g.powerCharges,charges);
 assert.equal(g.comboUntil,until);
 g.launch();g.ball.mode='live';g.ball.x=210;g.ball.y=697;g.ball.vy=190;
 g.singleStep(BOARD.step);
 assert.equal(g.state,'between');
 for(let i=0;i<340;i++)g.singleStep(BOARD.step);
 assert.equal(g.comboCount,0,'a genuinely new ball resets combo progress');
});
