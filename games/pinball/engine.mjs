// Neon Tilt prototype physics: deterministic fixed-step ball and flipper simulation.
// Coordinates are pixels in a 420 × 700 playfield, +Y points down.
export const BOARD = Object.freeze({width:420,height:700,radius:8,step:1/240});
export const GRAVITY=780;
export const PLAY_BALANCE=Object.freeze({launchSave:15,flipperLength:58,returnBlend:.36,streakShots:2});
// One illuminated, physical outlane kickback per served ball. The central drain
// stays open, and the solenoid never fires after TILT.
export const KICKBACK=Object.freeze({
 left:Object.freeze({x:105,y:640,edge:126,vx:335,vy:-685}),
 right:Object.freeze({x:315,y:640,edge:294,vx:-335,vy:-685})
});
export const BUMPERS=Object.freeze([
 {x:150,y:240,r:24,score:250},
 {x:259,y:240,r:24,score:250},
 {x:205,y:310,r:24,score:250}
]);
export const POSTS=Object.freeze([
 {x:112,y:585,r:9},{x:308,y:585,r:9},
 {x:135,y:635,r:6},{x:285,y:635,r:6},
 {x:130,y:641,r:9},{x:290,y:641,r:9}, // outlane rebound posts
 {x:340,y:132,r:9}
]);
export const WALLS=Object.freeze([
 [24,650,24,125],[24,125,33,79],[33,79,61,41],
 [61,41,104,25],[104,25,310,25],[310,25,351,37],
 [351,37,385,74],[385,74,400,118],[400,118,400,659],
 [365,156,365,590], // launch lane divider; upper opening lets ball enter playfield
 [24,566,95,644],[95,644,116,674],
 [365,566,325,639],[325,639,305,674],
 [91,496,120,526],[120,526,142,542],
 [329,496,300,526],[300,526,278,542],
 [53,366,83,419],[336,420,357,365]
]);
export const LANES=Object.freeze([{x:101,y:173,label:'N'},{x:210,y:169,label:'G'},{x:314,y:174,label:'S'}]);
export const TARGETS=Object.freeze([{x:165,y:410,r:12},{x:194,y:405,r:12},{x:223,y:405,r:12},{x:252,y:410,r:12}]);
// Single source of truth for guided-ball motion and the raised 3D rail paths.
// [x, y, 3D height] coordinates; collision physics elsewhere stays 2D.
export const RAMP_PATH=Object.freeze([
 [311,372,.40],[327,333,.65],[320,290,.94],[286,244,1.23],
 [285,203,1.45],[311,170,1.28],[291,150,.95],
 [321,167,.95],[341,222,.85],[339,298,.68],[332,387,.53],
 [316,469,.43],[287,518,.46]
].map(p=>Object.freeze(p)));
export const ORBIT_PATH=Object.freeze([
 [77,373,.39],[59,321,.52],[56,250,.67],[71,204,.78],
 [94,176,.86],[136,152,.9],[214,150,.82],[300,150,.69],
 [273,121,.77],[180,113,.80],[91,129,.71],[50,173,.65],
 [45,268,.55],[48,352,.46],[66,425,.39],[120,519,.46]
].map(p=>Object.freeze(p)));
// Phase 3N routes are shared by physics, the 3D hardware and 2D fallback.
export const CENTER_PATH=Object.freeze([
 [207,426,.37],[207,397,.53],[207,363,.75],[207,323,1.14],
 [208,289,1.50],[208,266,1.58],
 [204,220,1.48],[226,183,1.43],[259,165,1.41],
 [272,205,1.24],[270,273,1.12],[251,349,.84],
 [275,416,.58],[253,505,.46]
].map(p=>Object.freeze(p)));
export const SKYLINE_PATH=Object.freeze([
 [124,380,.38],[102,341,.63],[94,304,.92],[94,254,1.23],
 [119,207,1.43],[158,173,1.53],[196,152,1.60],
 [178,219,1.38],[156,283,1.05],[141,360,.76],
 [134,428,.52],[159,508,.46]
].map(p=>Object.freeze(p)));
export const TRAVEL_PATHS=Object.freeze({
 ramp:RAMP_PATH,orbit:ORBIT_PATH,center:CENTER_PATH,skyline:SKYLINE_PATH
});
// Three-dimensional arc length is shared by all guided rail segments.
const TRAVEL_GEOMETRY=Object.freeze(Object.fromEntries(
 Object.entries(TRAVEL_PATHS).map(([kind,path])=>{
  const lengths=[0];
  for(let i=1;i<path.length;i++){
   const a=path[i-1],b=path[i];
   lengths.push(lengths[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1],45*(b[2]-a[2])));
  }
  return [kind,Object.freeze({lengths:Object.freeze(lengths),total:lengths.at(-1)})];
 })
));
export const SHOTS=Object.freeze({
 orbit:{x:77,y:373,r:26,points:5000},
 ramp:{x:311,y:372,r:27,points:7500},
 center:{x:207,y:426,r:33,points:4500},
 skyline:{x:124,y:380,r:18,points:6000}
});
// Ramp and orbit entries should reward a deliberate outside-lane shot without
// feeling like a magnetic auto-aim. The spring acts only inside the visible
// mouth, on a fast upward ball, and never pulls a centre-table miss across.
export const SHOT_GUIDES=Object.freeze({
 orbit:Object.freeze({x:77,y:373,capture:45,depth:78,pull:31,damping:2.4}),
 ramp:Object.freeze({x:311,y:372,capture:46,depth:78,pull:31,damping:2.4})
});
// A powered strike near the marked rubber band has slightly more directional
// grip. It preserves the collision's real speed and only blends the outgoing
// angle; heel hits, dead flips and weak contacts receive no hidden launch.
export const FLIPPER_SWEET_SPOT=.68;
export const RETURN_FEEDS=Object.freeze({
 orbit:Object.freeze({side:'left',x:145,y:577,blend:PLAY_BALANCE.returnBlend}),
 ramp:Object.freeze({side:'right',x:275,y:577,blend:PLAY_BALANCE.returnBlend})
});
export const SPINNER=Object.freeze({x:204,y:365,halfWidth:20,points:1250});
export const SCOOP=Object.freeze({x:316,y:444,r:17,points:8000,hold:.67});
export const SLINGS=Object.freeze([
 {x1:119,y1:502,x2:163,y2:535,score:100},
 {x1:301,y1:502,x2:257,y2:535,score:100}
]);
export const ARCADE_MODES=Object.freeze({skillWindow:6,comboWindow:7,hurryWindow:18,overdriveWindow:14,powerShots:3,spinThreshold:5});
// Classic Windows-era pinball was memorable because a run felt like a career,
// not just a score chase. Neon Tilt keeps its own missions and identity, while
// exposing the same kind of persistent in-run rank progression.
export const RANKS=Object.freeze(['CADET','ENSIGN','LIEUTENANT','CAPTAIN','COMMANDER']);
export const MISSION_FUEL=26;
export const FLIGHT_MISSIONS=Object.freeze([
 Object.freeze({id:'launch',name:'LAUNCH WINDOW',sequence:Object.freeze(['ramp','skyline']),bonus:30000}),
 Object.freeze({id:'orbit',name:'ORBITAL SWEEP',sequence:Object.freeze(['orbit','center']),bonus:35000}),
 Object.freeze({id:'core',name:'CORE RECOVERY',sequence:Object.freeze(['scoop','bumper','bumper','bumper']),bonus:40000}),
 Object.freeze({id:'night',name:'NIGHT FLIGHT',sequence:Object.freeze(['ramp','orbit','scoop']),bonus:50000}),
 Object.freeze({id:'signal',name:'SIGNAL CHASE',sequence:Object.freeze(['spinner','spinner','spinner','spinner','spinner','orbit','center']),bonus:55000}),
 Object.freeze({id:'redline',name:'REDLINE RUN',sequence:Object.freeze(['ramp','orbit','ramp']),bonus:65000,fuel:22})
]);
const COMMAND_LABELS=Object.freeze({ramp:'HIT RAMP',skyline:'HIT SKYLINE',orbit:'HIT ORBIT',center:'HIT CROSSOVER',scoop:'HIT SCOOP',bumper:'HIT BUMPERS',spinner:'HIT SPINNER'});
const MIN_LAUNCH=1050, MAX_LAUNCH=1450;
const clip=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const len=(x,y)=>Math.hypot(x,y);
function pointToSegment(x,y,x1,y1,x2,y2){
 const dx=x2-x1,dy=y2-y1,d=dx*dx+dy*dy||1;
 const t=clip(((x-x1)*dx+(y-y1)*dy)/d,0,1);
 const px=x1+dx*t,py=y1+dy*t,dd=len(x-px,y-py);
 return {px,py,t,dist:dd,nx:dd>1e-7?(x-px)/dd:dy/Math.sqrt(d),ny:dd>1e-7?(y-py)/dd:-dx/Math.sqrt(d)};
}
export class PinballEngine{
 constructor(){
  this.state='ready';this.score=0;this.best=0;this.ballNumber=0;
  this.ball=null;this.balls=[];this.nextBallId=1;this.leftHeld=false;this.rightHeld=false;
  this.flippers=[{side:'left',x:144,y:613,a:.40,omega:0,length:PLAY_BALANCE.flipperLength},
                 {side:'right',x:276,y:613,a:.40,omega:0,length:PLAY_BALANCE.flipperLength}];
  this.charging=false;this.charge=.26;this.time=0;this.between=0;
  this.events=[];this.cooldowns=new Map();this.accumulator=0;
  this.tilted=false;this.tiltMeter=0;this.lastNudgeAt=-100;
  this.kickbackReady=true;
  this.lanes=new Set();this.targets=new Set();this.bumperHits=0;
  this.missions={lanes:false,frenzy:false,targets:false,ride:false};
  this.rankIndex=0;this.rankName=RANKS[0];this.commandFlags=0;
  this.commandMissionReady=false;this.commandMissionIndex=0;this.completedCommands=new Set();
  this.neonCommandReady=false;this.neonCommandActive=false;this.neonCommandDone=false;this.neonCommandStep=0;this.neonCommandUntil=0;
  this.ballLocks=0;this.lockLit=false;this.multiballActive=false;this.multiballSaveUntil=0;
  this.multiballJackpots=new Set();this.multiballSuperLit=false;this.multiballAddUsed=false;
  this.activeCommand=null;this.commandFuelUntil=0;
  this.multiplierUntil=0;this.frenzyUntil=0;this.lastShot=null;
  this.extraBalls=0;this.extraAwarded=false;this.ballSaveUntil=0;this.ballSaveUsed=false;
  this.streakShots=0;this.streakShieldReady=false;this.streakShieldSpent=false;
  this.ballLaunchedAt=null;this.bonus=0;this.shots=0;this.playingExtraBall=false;
  this.spinnerTurns=0;this.spinnerAngle=0;this.scoopHits=0;this.lastScoopTime=-100;
  this.skillShotPending=false;this.skillShotUntil=0;
  this.comboCount=0;this.comboUntil=0;
  this.powerCharges=0;this.hurryUpUntil=0;
  this.overdriveUntil=0;this.nextOverdriveAt=ARCADE_MODES.spinThreshold;
 }
 emit(type,detail={}){this.events.push({type,...detail});}
 consumeEvents(){const a=this.events.splice(0);return a;}
 start(){
  this.state='playing';this.score=0;this.ballNumber=1;
  this.charging=false;this.charge=.26;this.time=0;this.between=0;
  this.accumulator=0;this.cooldowns.clear();
  this.tilted=false;this.tiltMeter=0;this.lastNudgeAt=-100;
  this.kickbackReady=true;
  this.lanes.clear();this.targets.clear();this.bumperHits=0;
  this.missions={lanes:false,frenzy:false,targets:false,ride:false};
  this.rankIndex=0;this.rankName=RANKS[0];this.commandFlags=0;
  this.commandMissionReady=false;this.commandMissionIndex=0;this.completedCommands.clear();
  this.neonCommandReady=false;this.neonCommandActive=false;this.neonCommandDone=false;this.neonCommandStep=0;this.neonCommandUntil=0;
  this.ballLocks=0;this.lockLit=false;this.multiballActive=false;this.multiballSaveUntil=0;
  this.multiballJackpots.clear();this.multiballSuperLit=false;this.multiballAddUsed=false;
  this.activeCommand=null;this.commandFuelUntil=0;
  this.multiplierUntil=0;this.frenzyUntil=0;this.lastShot=null;
  this.extraBalls=0;this.extraAwarded=false;this.ballSaveUntil=0;this.ballSaveUsed=false;
  this.streakShots=0;this.streakShieldReady=false;this.streakShieldSpent=false;
  this.ballLaunchedAt=null;this.bonus=0;this.shots=0;this.playingExtraBall=false;
  this.spinnerTurns=0;this.spinnerAngle=0;this.scoopHits=0;this.lastScoopTime=-100;
  this.skillShotPending=false;this.skillShotUntil=0;
  this.comboCount=0;this.comboUntil=0;
  this.powerCharges=0;this.hurryUpUntil=0;
  this.overdriveUntil=0;this.nextOverdriveAt=ARCADE_MODES.spinThreshold;
  for(const f of this.flippers){f.a=.4;f.omega=0;}
  this.spawnBall();this.emit('start');
 }
 spawnBall({preserveProtection=false}={}){
  this.ball={id:this.nextBallId++,x:382,y:582,vx:0,vy:0,r:BOARD.radius,mode:'shooter',trail:[]};
  this.balls=[this.ball];
  this.charging=false;this.charge=.26;
  this.ballSaveUntil=0;this.ballLaunchedAt=null;this.ballSaveUsed=false;
  if(!preserveProtection){this.streakShots=0;this.streakShieldReady=false;this.streakShieldSpent=false;}
  this.tilted=false;this.tiltMeter=0;this.lastNudgeAt=-100;
  this.kickbackReady=true;
  this.skillShotPending=false;this.comboCount=0;this.comboUntil=0;
  this.powerCharges=0;this.hurryUpUntil=0;this.overdriveUntil=0;
  this.emit('ball',{ball:this.ballNumber});
 }
 holdLaunch(held){
  if(this.state!=='playing'||!this.ball||this.ball.mode!=='shooter')return;
  if(held){this.charging=true;return;}
  if(this.charging)this.launch();
 }
 launch(){
  if(this.state!=='playing'||!this.ball||this.ball.mode!=='shooter')return false;
  const p=clip(this.charge,.12,1);
  this.ball.vy=-(MIN_LAUNCH+(MAX_LAUNCH-MIN_LAUNCH)*p);
  this.ball.vx=-18;this.ball.mode='live';this.charging=false;
  this.ballLaunchedAt=this.time;this.ballSaveUntil=this.time+PLAY_BALANCE.launchSave;
  this.skillShotPending=!this.ballSaveUsed;
  this.skillShotUntil=this.time+ARCADE_MODES.skillWindow;
  this.emit('launch',{power:p});return true;
 }
 setFlipper(side,held){
  if(this.tilted&&held)return;
  if(side==='left')this.leftHeld=Boolean(held);
  if(side==='right')this.rightHeld=Boolean(held);
 }
 // Table bumps are physical impulses, not automatic ball saves.
 // Excessive nudging TILTs the machine until the next ball.
 nudge(direction){
  const b=this.ball;
  if(this.state!=='playing'||!b||b.mode!=='live'||this.tilted||
     !['left','right','up'].includes(direction)||this.time-this.lastNudgeAt<.12)return false;
  this.lastNudgeAt=this.time;
  if(direction==='left')b.vx-=135;
  else if(direction==='right')b.vx+=135;
  else b.vy-=165;
  const before=this.tiltMeter;
  this.tiltMeter+=.32;
  this.emit('nudge',{direction});
  if(this.tiltMeter>=1){
   this.tilted=true;
   this.leftHeld=false;this.rightHeld=false;
   this.emit('tilt');
  }else if(before<.72&&this.tiltMeter>=.72){
   this.emit('tiltwarning',{level:Math.round(this.tiltMeter*100)});
  }
  return true;
 }
 // This is a visible solenoid kick at the physical outlane, NOT a magnetic
 // ball catch or a free relaunch. One charge can be spent per served ball.
 tryOutlaneKickback(){
  const b=this.ball;
  if(!this.kickbackReady||this.tilted||this.state!=='playing'||!b||
     b.mode!=='live'||b.y<635||b.y>694||b.vy<=100)return false;
  const side=b.x>35&&b.x<KICKBACK.left.edge&&b.vx<140?'left':
   b.x<365&&b.x>KICKBACK.right.edge&&b.vx>-140?'right':null;
  if(!side)return false;
  const coil=KICKBACK[side];
  this.kickbackReady=false;
  b.vx=coil.vx;b.vy=coil.vy;
  this.emit('kickback',{side,x:b.x,y:b.y});
  return true;
 }
 releaseControls(){this.leftHeld=false;this.rightHeld=false;this.cancelLaunchCharge();}
 cancelLaunchCharge(){this.charging=false;if(this.ball?.mode==='shooter')this.charge=.26;}
 scoreHit(score,type){
  if(this.state!=='playing'||this.tilted)return;
  const active=this.time<this.multiplierUntil?2:1;
  const frenzy=type.startsWith('bumper')&&this.time<this.frenzyUntil?2:1;
  const awarded=score*active*frenzy;
  this.score+=awarded;this.bonus+=Math.floor(awarded/10);
  this.emit('hit',{score:awarded,target:type,total:this.score});
 }
 cooldownHit(key,delay,score,type){
  if(this.tilted)return false;
  const last=this.cooldowns.get(key)??-100;
  if(this.time-last<delay)return false;
  this.cooldowns.set(key,this.time);this.scoreHit(score,type);
  if(type.startsWith('bumper'))this.bumper();
  return true;
 }
 impactFeedback(kind,key,speed,x,y,detail={}){
  if(speed<55)return false;
  const id='impact:'+key,last=this.cooldowns.get(id)??-100;
  if(this.time-last<.045)return false;
  this.cooldowns.set(id,this.time);
  this.emit('impact',{
   kind,key,speed:Math.round(speed),
   strength:clip((speed-55)/850,.06,1),x,y,...detail
  });
  return true;
 }
 collideCircle(obj,impulse=1.07,key='circle',score=0){
  const b=this.ball,dx=b.x-obj.x,dy=b.y-obj.y;
  const limit=b.r+obj.r,d=len(dx,dy);
  if(d>=limit)return false;
  const nx=d>1e-6?dx/d:0,ny=d>1e-6?dy/d:-1;
  b.x+=nx*(limit-d+.12);b.y+=ny*(limit-d+.12);
  const dot=b.vx*nx+b.vy*ny;
  if(dot<0){
   const impact=-dot;
   b.vx-=(1+impulse)*dot*nx;b.vy-=(1+impulse)*dot*ny;
   if(score && dot<-35 && this.cooldownHit(key,.11,score,key)){
    b.vx+=nx*90;b.vy+=ny*90;
   }
   const kind=key.startsWith('bumper')?'bumper':key.startsWith('post')?'post':'metal';
   this.impactFeedback(kind,key,impact,obj.x,obj.y);
  }
  return true;
 }
 collideSegment(x1,y1,x2,y2,pad=2,restitution=.72,key='',score=0,velocity=null){
  const b=this.ball,p=pointToSegment(b.x,b.y,x1,y1,x2,y2);
  const depth=b.r+pad-p.dist;
  if(depth<=0)return false;
  b.x+=p.nx*(depth+.08);b.y+=p.ny*(depth+.08);
  const vel=velocity?velocity(p):{x:0,y:0};
  const vn=(b.vx-vel.x)*p.nx+(b.vy-vel.y)*p.ny;
  if(vn<-1){
   const impact=-vn;
   let rebound=-(1+restitution)*vn;
   if(velocity)rebound=Math.min(rebound,1150);
   b.vx+=p.nx*rebound;b.vy+=p.ny*rebound;
   if(score && vn<-35 && this.cooldownHit(key,.13,score,key)){
    b.vx+=p.nx*75;b.vy+=p.ny*75;
   }
   const kind=key.startsWith('sling')?'sling':key.startsWith('wall')?'rail':'metal';
   this.impactFeedback(kind,key,impact,p.px,p.py);
  }
  return true;
 }
 updateFlippers(dt){
  for(const f of this.flippers){
   const held=!this.tilted&&(f.side==='left'?this.leftHeld:this.rightHeld);
   const goal=held?-.30:.40;
   const old=f.a;
   const angularSpeed=held?17:12; // powered stroke / slower return
   f.a=clip(goal,old-angularSpeed*dt,old+angularSpeed*dt);
   f.omega=(f.a-old)/dt;
  }
 }
 flipperTip(f){
  return {x:f.x+(f.side==='left'?1:-1)*Math.cos(f.a)*f.length,y:f.y+Math.sin(f.a)*f.length};
 }
 collideFlipper(f){
  const b=this.ball,tip=this.flipperTip(f);
  const p=pointToSegment(b.x,b.y,f.x,f.y,tip.x,tip.y);
  const overlap=b.r+11-p.dist;
  if(overlap<=0)return false;
  // Contact depends on the ball's velocity relative to the rotating bat.
  // A tip strike is stronger than a strike near the pivot.
  const w=f.omega*(f.side==='left'?1:-1);
  const rx=p.px-f.x,ry=p.py-f.y;
  const surfaceX=-w*ry,surfaceY=w*rx;
  const vn=(b.vx-surfaceX)*p.nx+(b.vy-surfaceY)*p.ny;
  b.x+=p.nx*(overlap+.06);b.y+=p.ny*(overlap+.06);
  if(vn>=-.1)return true;
  const impact=-vn;
  const restitution=impact<95?.12:impact<260?.50:.88;
  const impulse=Math.min((1+restitution)*impact,1900);
  b.vx+=p.nx*impulse;b.vy+=p.ny*impulse;
  const tx=-p.ny,ty=p.nx;
  const tangent=(b.vx-surfaceX)*tx+(b.vy-surfaceY)*ty;
  const friction=clip(-tangent*.22,-impulse*.25,impulse*.25);
  b.vx+=tx*friction;b.vy+=ty*friction;
  const powered=f.omega<-2.5,grip=powered&&impact>80?
   clip(1-Math.abs(p.t-FLIPPER_SWEET_SPOT)/.36,0,1):0;
  if(grip>0&&b.vy<-50){
   const target=f.side==='left'?SHOTS.ramp:SHOTS.orbit;
   const aimX=target.x-b.x,aimY=target.y-b.y,aimLength=Math.hypot(aimX,aimY)||1;
   const speed=Math.hypot(b.vx,b.vy),blend=.025+.095*grip;
   const vx=b.vx*(1-blend)+speed*aimX/aimLength*blend;
   const vy=b.vy*(1-blend)+speed*aimY/aimLength*blend;
   const adjusted=Math.hypot(vx,vy)||1;
   b.vx=vx*speed/adjusted;b.vy=vy*speed/adjusted;
  }
  this.impactFeedback('flipper','flipper-'+f.side,impact,p.px,p.py,{contact:p.t,grip});
  return true;
 }
 guideShotMouths(dt){
  const b=this.ball;
  if(!b||b.mode!=='live'||b.vy>=-260||Math.abs(b.vx)>650)return;
  for(const guide of Object.values(SHOT_GUIDES)){
   const depth=b.y-guide.y,dx=b.x-guide.x;
   if(depth<=0||depth>=guide.depth||Math.abs(dx)>=guide.capture)continue;
   if(Math.abs(dx)>13&&dx*b.vx>=0)continue;
   const envelope=(1-depth/guide.depth)*(1-Math.abs(dx)/guide.capture*.34);
   b.vx+=(-dx*guide.pull-b.vx*guide.damping)*envelope*dt;
  }
 }
 // All sensors and scoring run in fixed simulation time, not per render frame.
 addPoints(points,label){
  if(this.tilted)return 0;
  const multiplier=this.time<this.multiplierUntil?2:1;
  const value=points*multiplier;
  this.score+=value;this.bonus+=Math.floor(value/10);
  this.emit('award',{score:value,label,total:this.score});
  return value;
 }
 mission(name,headline,points=0){
  if(this.missions[name])return;
  this.missions[name]=true;
  if(points)this.addPoints(points,headline);
  this.emit('mission',{name,headline});
  this.checkExtraBall();
 }
 get commandMission(){return FLIGHT_MISSIONS[this.commandMissionIndex%FLIGHT_MISSIONS.length];}
 get commandFuelRemaining(){return this.activeCommand?Math.max(0,this.commandFuelUntil-this.time):this.commandMissionReady?(this.commandMission.fuel||MISSION_FUEL):0;}
 get commandFuelRatio(){return clip(this.commandFuelRemaining/(this.commandMission.fuel||MISSION_FUEL),0,1);}
 get commandInstruction(){
  if(this.commandMissionReady)return 'SHOOT RAMP TO LAUNCH';
  if(!this.activeCommand)return 'COMPLETE TARGET BANK';
  return COMMAND_LABELS[this.commandMission.sequence[this.activeCommand.step]]||'COMPLETE MISSION';
 }
 armCommandMission(){
  if(this.activeCommand||this.commandMissionReady)return false;
  const next=FLIGHT_MISSIONS.findIndex(m=>!this.completedCommands.has(m.id));
  this.commandMissionIndex=next>=0?next:this.commandFlags%FLIGHT_MISSIONS.length;
  this.commandMissionReady=true;this.commandFuelUntil=0;
  const mission=this.commandMission;
  this.emit('missionarmed',{mission:mission.id,name:mission.name,instruction:'SHOOT RAMP TO LAUNCH'});
  return true;
 }
 startCommandMission(){
  if(!this.commandMissionReady||this.activeCommand||this.state!=='playing')return false;
  const mission=this.commandMission;
  this.commandMissionReady=false;this.activeCommand={index:this.commandMissionIndex,step:0};
  const fuel=mission.fuel||MISSION_FUEL;this.commandFuelUntil=this.time+fuel;
  this.emit('missionstart',{mission:mission.id,name:mission.name,instruction:this.commandInstruction,fuel});
  return true;
 }
 progressCommand(action){
  if(!this.activeCommand||this.time>=this.commandFuelUntil)return false;
  const mission=this.commandMission,expected=mission.sequence[this.activeCommand.step];
  if(action!==expected)return false;
  this.activeCommand.step++;
  this.commandFuelUntil=Math.min(this.time+(mission.fuel||MISSION_FUEL),this.commandFuelUntil+3);
  if(this.activeCommand.step<mission.sequence.length){
   this.emit('missionprogress',{mission:mission.id,name:mission.name,step:this.activeCommand.step,total:mission.sequence.length,instruction:this.commandInstruction});
   return true;
  }
  const points=this.addPoints(mission.bonus,'FLIGHT MISSION');
  this.activeCommand=null;this.commandFuelUntil=0;
  if(!this.completedCommands.has(mission.id)){this.completedCommands.add(mission.id);this.commandFlags++;}
  this.emit('commandcomplete',{mission:mission.id,name:mission.name,points,flags:this.commandFlags});
  const nextRank=Math.min(RANKS.length-1,this.commandFlags);
  if(nextRank>this.rankIndex){
   this.rankIndex=nextRank;this.rankName=RANKS[nextRank];
   const promotionBonus=10000*nextRank;
   const awarded=this.addPoints(promotionBonus,'RANK PROMOTION');
   this.emit('promotion',{rank:this.rankName,index:nextRank,flags:this.commandFlags,points:awarded});
  }
  if(this.commandFlags>=4&&!this.neonCommandDone&&!this.neonCommandReady&&!this.neonCommandActive){
   this.neonCommandReady=true;this.emit('wizardready',{name:'NEON COMMAND'});
  }
  return true;
 }
 failCommand(reason='FUEL DEPLETED'){
  if(!this.activeCommand)return false;
  const mission=this.commandMission;
  this.activeCommand=null;this.commandFuelUntil=0;
  this.emit('missionfailed',{mission:mission.id,name:mission.name,reason});
  return true;
 }
 // Four distinct flight flags unlock a timed final command sequence.
 get neonCommandRemaining(){return this.neonCommandActive?Math.max(0,this.neonCommandUntil-this.time):0;}
 startNeonCommand(){
  if(!this.neonCommandReady||this.neonCommandDone||this.multiballActive)return false;
  this.neonCommandReady=false;this.neonCommandActive=true;this.neonCommandStep=0;
  this.neonCommandUntil=this.time+35;
  this.emit('wizardstart',{name:'NEON COMMAND',fuel:35,instruction:'HIT RAMP'});return true;
 }
 progressNeonCommand(action){
  if(!this.neonCommandActive||this.time>=this.neonCommandUntil)return false;
  const steps=['ramp','orbit','center','skyline','scoop'];
  if(action!==steps[this.neonCommandStep])return false;
  this.neonCommandStep++;this.neonCommandUntil=Math.min(this.time+35,this.neonCommandUntil+4);
  if(this.neonCommandStep===steps.length){
   this.neonCommandActive=false;this.neonCommandDone=true;this.neonCommandUntil=0;
   const points=this.addPoints(250000,'NEON COMMAND');this.emit('wizardcomplete',{points});return true;
  }
  this.emit('wizardprogress',{step:this.neonCommandStep,total:steps.length,instruction:COMMAND_LABELS[steps[this.neonCommandStep]]});
  return true;
 }
 failNeonCommand(reason){
  if(!this.neonCommandActive)return;
  this.neonCommandActive=false;this.neonCommandUntil=0;this.neonCommandReady=true;
  this.emit('wizardfailed',{reason});
 }
 // Locked balls are held virtually until the third scoop, then released as physical balls.
 makeMultiballBall(x,y,vx,vy){
  return {id:this.nextBallId++,x,y,vx,vy,r:BOARD.radius,mode:'live',trail:[]};
 }
 startMultiball(captured=this.ball){
  if(this.multiballActive||!captured)return false;
  captured.mode='live';captured.scoopTimer=0;captured.x=316;captured.y=444;
  captured.vx=-440;captured.vy=-640;captured.trail=[];
  this.balls=[captured,this.makeMultiballBall(294,414,-310,-780),this.makeMultiballBall(263,434,-560,-460)];
  this.ball=captured;this.multiballActive=true;this.ballLocks=0;this.lockLit=false;
  this.multiballSaveUntil=this.time+10;this.ballSaveUsed=true;this.multiballJackpots.clear();
  this.multiballSuperLit=false;this.multiballAddUsed=false;
  this.emit('multiballstart',{count:3,save:10});return true;
 }
 awardMultiballJackpot(kind){
  if(!this.multiballActive||this.multiballJackpots.has(kind))return false;
  const points=this.addPoints(kind==='ramp'?25000:35000,'MULTIBALL JACKPOT');
  this.multiballJackpots.add(kind);this.emit('multiballjackpot',{kind,points});
  if(this.multiballJackpots.size===2){this.multiballSuperLit=true;this.emit('superlit');}
  return true;
 }
 awardSuperJackpot(){
  if(!this.multiballActive||!this.multiballSuperLit)return false;
  const points=this.addPoints(100000,'SUPER JACKPOT');this.emit('superjackpot',{points});
  this.multiballSuperLit=false;this.multiballJackpots.clear();return true;
 }
 collideMultiball(){
  for(let i=0;i<this.balls.length;i++)for(let j=i+1;j<this.balls.length;j++){
   const a=this.balls[i],b=this.balls[j];
   if(a.mode!=='live'||b.mode!=='live')continue;
   const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||.0001;
   if(dist>=a.r+b.r)continue;
   const nx=dx/dist,ny=dy/dist,overlap=a.r+b.r-dist;
   a.x-=nx*overlap*.5;a.y-=ny*overlap*.5;b.x+=nx*overlap*.5;b.y+=ny*overlap*.5;
   const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
   if(relative<0){const impulse=relative*.94;
    a.vx+=impulse*nx;a.vy+=impulse*ny;b.vx-=impulse*nx;b.vy-=impulse*ny;
   }
  }
 }
 // A single skill-earned replay. Routes and scoop shots count only when
 // genuine physical sensors fire; idle bumpers cannot earn protection.
 recordStreakShot(){
  if(this.state!=='playing'||this.tilted||this.multiballActive||
     this.streakShieldSpent||this.streakShieldReady)return;
  this.streakShots++;
  if(this.streakShots>=PLAY_BALANCE.streakShots){
   this.streakShieldReady=true;
   this.emit('streakshield',{shots:this.streakShots});
  }
 }
 checkExtraBall(){
  if(this.extraAwarded||!Object.values(this.missions).every(Boolean))return;
  this.extraAwarded=true;this.extraBalls++;this.emit('extra',{count:this.extraBalls});
 }
 bumper(){
  this.bumperHits++;
  this.progressCommand('bumper');this.progressNeonCommand('bumper');
  if(this.bumperHits===10){
   this.frenzyUntil=this.time+15;
   this.mission('frenzy','BUMPER FRENZY',7500);
   this.emit('frenzy',{until:this.frenzyUntil});
  }
 }
 expireArcadeModes(){
  if(this.skillShotPending && this.time>=this.skillShotUntil)
   this.skillShotPending=false;
  if(this.comboCount>0 && this.time>=this.comboUntil)
   this.comboCount=0;
  if(this.hurryUpUntil>0 && this.time>=this.hurryUpUntil){
   this.hurryUpUntil=0;this.powerCharges=1;
   this.emit('hurryMiss',{remaining:1});
  }
  if(this.overdriveUntil>0 && this.time>=this.overdriveUntil){
   this.overdriveUntil=0;
   this.emit('modeend',{mode:'overdrive'});
  }
  if(this.activeCommand && this.time>=this.commandFuelUntil)this.failCommand();
  if(this.neonCommandActive&&this.time>=this.neonCommandUntil)this.failNeonCommand('FUEL DEPLETED');
 }
 activateLane(i){
  if(this.lanes.has(i))return;
  this.lanes.add(i);this.scoreHit(750,'lane'+i);
  if(this.skillShotPending && this.time<=this.skillShotUntil){
   this.skillShotPending=false;
   const points=this.addPoints(12000,'SKILL SHOT');
   this.emit('skillshot',{points,lane:i});
  }
  this.emit('lane',{index:i,count:this.lanes.size});
  this.progressCommand('lane');
  if(this.lanes.size===3){
   this.lanes.clear();this.multiplierUntil=this.time+20;
   if(this.multiballActive&&!this.multiballAddUsed&&this.balls.length<3){
    this.multiballAddUsed=true;
    this.balls.push(this.makeMultiballBall(322,195,-265,-260));
    this.emit('multiballadd',{count:this.balls.length});
   }
   this.mission('lanes','NEON LANES · 2× SCORING',10000);
   this.emit('multiplier',{until:this.multiplierUntil});
  }
 }
 activateTarget(i){
  if(this.targets.has(i))return;
  this.targets.add(i);this.scoreHit(1500,'target'+i);
  this.emit('target',{index:i,count:this.targets.size});
  if(this.targets.size===4){
   this.targets.clear();
   this.mission('targets','TARGET BANK COMPLETE',25000);
   this.armCommandMission();
   if(!this.multiballActive){this.lockLit=true;this.emit('locklit',{locked:this.ballLocks});}
  }
 }
 activateShot(kind){
  const shot=SHOTS[kind];
  if(!shot||this.state!=='playing'||!this.ball)return;
  this.expireArcadeModes();
  this.shots++;this.recordStreakShot();const shotName={
   ramp:'RAMP SHOT',orbit:'LEFT ORBIT',
   center:'CENTER CROSSOVER',skyline:'SKYLINE LOOP'
  }[kind];
  this.addPoints(shot.points,shotName);
  this.emit('shot',{kind,points:shot.points});
  if(this.commandMissionReady&&kind==='ramp')this.startCommandMission();
  else this.progressCommand(kind);
  this.progressNeonCommand(kind);
  if(this.multiballActive&&(kind==='ramp'||kind==='orbit'))this.awardMultiballJackpot(kind);
  const chained=this.lastShot && this.time-this.lastShot.at<ARCADE_MODES.comboWindow;
  this.comboCount=chained?Math.min(5,Math.max(1,this.comboCount)+1):1;
  this.comboUntil=this.time+ARCADE_MODES.comboWindow;
  if(this.comboCount>=2){
   const points=this.addPoints((this.comboCount-1)*5000,'NEON COMBO');
   this.emit('combo',{count:this.comboCount,points});
  }
  if(this.lastShot && this.lastShot.kind!==kind && this.time-this.lastShot.at<8){
   this.mission('ride','NIGHT RIDE JACKPOT',40000);
  }
  this.lastShot={kind,at:this.time};
  if(!this.hurryUpUntil){
   this.powerCharges=Math.min(ARCADE_MODES.powerShots,this.powerCharges+1);
   this.emit('power',{charges:this.powerCharges,needed:ARCADE_MODES.powerShots});
   if(this.powerCharges===ARCADE_MODES.powerShots){
    this.hurryUpUntil=this.time+ARCADE_MODES.hurryWindow;
    this.emit('hurryup',{until:this.hurryUpUntil});
   }
  }
  const b=this.ball;
  const durations={ramp:.95,orbit:.8,center:1.24,skyline:1.18};
  const approach=Math.hypot(b.vx,b.vy),base=durations[kind];
  const duration=clip(base*650/clip(approach,500,900),base*.84,base*1.12);
  b.mode='travel';b.travel={kind,t:0,duration,from:{x:b.x,y:b.y}};
 }
 checkSensors(previous){
  const b=this.ball;if(!b||b.mode!=='live'||this.tilted)return;
  // Crossing guards prevent repeated scoring when balls rest against a target.
  for(let i=0;i<LANES.length;i++){
   const lane=LANES[i];
   if(b.vy< -80&&previous.y>=lane.y&&b.y<lane.y&&Math.abs(b.x-lane.x)<21)
    this.activateLane(i);
  }
  for(let i=0;i<TARGETS.length;i++){
   const t=TARGETS[i],dx=b.x-t.x,dy=b.y-t.y;
   const distance=Math.hypot(dx,dy);
   if(distance<t.r+b.r && (Math.abs(b.vx)+Math.abs(b.vy))>110 &&
       (this.cooldowns.get('target'+i)??-100)<this.time-.38){
     this.cooldowns.set('target'+i,this.time);
     const nx=distance>1?dx/distance:0,ny=distance>1?dy/distance:-1;
     b.x=t.x+nx*(t.r+b.r+.5);b.y=t.y+ny*(t.r+b.r+.5);
     const toward=b.vx*nx+b.vy*ny;
     if(toward<0){b.vx-=(1.6)*toward*nx;b.vy-=(1.6)*toward*ny;}
     this.impactFeedback('target','target'+i,Math.abs(toward),t.x,t.y);
     this.activateTarget(i);
   }
  }
  // Spinner and scoop are physical scoring features located in free lanes.
  if(Math.abs(b.x-SPINNER.x)<SPINNER.halfWidth &&
     ((previous.y<SPINNER.y&&b.y>=SPINNER.y) || (previous.y>SPINNER.y&&b.y<=SPINNER.y)) &&
     Math.abs(b.vy)>170 && this.time-(this.cooldowns.get('spinner')??-100)>.19){
   this.cooldowns.set('spinner',this.time);
   this.spinnerTurns++;
   this.spinnerAngle+=Math.PI*1.5;
   this.progressCommand('spinner');
   const points=this.addPoints(SPINNER.points,'SPINNER');
   this.emit('spinner',{turns:this.spinnerTurns,points});
   if(this.spinnerTurns>=this.nextOverdriveAt && this.time>=this.overdriveUntil){
    this.nextOverdriveAt=this.spinnerTurns+ARCADE_MODES.spinThreshold;
    this.overdriveUntil=this.time+ARCADE_MODES.overdriveWindow;
    this.emit('overdrive',{until:this.overdriveUntil});
   }else if(this.time<this.overdriveUntil){
    const bonus=this.addPoints(3000,'OVERDRIVE SPINNER');
    this.emit('superSpinner',{points:bonus,turns:this.spinnerTurns});
   }
  }
  const sd=Math.hypot(b.x-SCOOP.x,b.y-SCOOP.y);
  if(sd<SCOOP.r-2 && b.vy< -180 && this.time-this.lastScoopTime>2){
   this.lastScoopTime=this.time;this.scoopHits++;
    this.recordStreakShot();
   this.addPoints(SCOOP.points,'NEON SCOOP');
   const wizardWasReady=this.neonCommandReady;
   this.progressCommand('scoop');this.progressNeonCommand('scoop');
   if(this.multiballActive)this.awardSuperJackpot();
   if(this.hurryUpUntil>this.time){
    const points=this.addPoints(50000,'NEON RUSH JACKPOT');
    this.emit('jackpot',{points});
    this.powerCharges=0;this.hurryUpUntil=0;
   }
   // A flight mission owns its scoop shot. Lock only when mission control is idle.
   if(!this.multiballActive&&wizardWasReady&&!this.activeCommand&&!this.commandMissionReady)
    this.startNeonCommand();
   if(!this.multiballActive&&this.lockLit&&!this.neonCommandActive&&!this.neonCommandReady&&
      !this.activeCommand&&!this.commandMissionReady){
    this.lockLit=false;
    if(this.ballLocks<2){
     this.ballLocks++;this.emit('balllock',{locked:this.ballLocks,needed:2});
     this.spawnBall();return;
    }
    this.startMultiball(b);return;
   }
   b.mode='scoop';b.scoopTimer=SCOOP.hold;
   b.x=SCOOP.x;b.y=SCOOP.y;b.vx=0;b.vy=0;
   this.emit('scoop',{count:this.scoopHits});
   return;
  }
  for(const kind of ['orbit','ramp','center','skyline']){
   const s=SHOTS[kind];
   if(b.vy<-300&&previous.y>=s.y&&b.y<s.y&&Math.abs(b.x-s.x)<s.r){
    this.activateShot(kind);return;
   }
  }
 }
 updateTravel(dt){
  const b=this.ball,tr=b.travel;if(!tr){b.mode='live';return;}
  tr.t+=dt;
  const path=TRAVEL_PATHS[tr.kind],geo=TRAVEL_GEOMETRY[tr.kind];
  const progress=clip(tr.t/tr.duration,0,1);
  // Unevenly spaced rail supports do not cause uneven ball movement.
  // Slight acceleration on descent keeps shots lively.
  const distance=geo.total*(progress-.055*Math.sin(Math.PI*progress));
  const lengths=geo.lengths;
  let i=0;while(i<path.length-2&&lengths[i+1]<distance)i++;
  const segment=lengths[i+1]-lengths[i];
  const f=segment>0?clip((distance-lengths[i])/segment,0,1):0;
  const entryBlend=Math.max(0,1-progress*9);
  b.x=path[i][0]+(path[i+1][0]-path[i][0])*f+(tr.from.x-path[0][0])*entryBlend;
  b.y=path[i][1]+(path[i+1][1]-path[i][1])*f+(tr.from.y-path[0][1])*entryBlend;
  b.travelHeight=path[i][2]+(path[i+1][2]-path[i][2])*f;
  if(progress>=1){
   const a=path.at(-2),z=path.at(-1),dx=z[0]-a[0],dy=z[1]-a[1];
   const length=Math.hypot(dx,dy)||1;
   const speed=clip(geo.total/tr.duration*.50,260,475),feed=RETURN_FEEDS[tr.kind];
   let vx=dx/length,vy=dy/length;
   if(feed){
    const fx=feed.x-z[0],fy=feed.y-z[1],fl=Math.hypot(fx,fy)||1;
    vx=vx*(1-feed.blend)+fx/fl*feed.blend;
    vy=vy*(1-feed.blend)+fy/fl*feed.blend;
    const vl=Math.hypot(vx,vy)||1;vx/=vl;vy/=vl;
   }
   b.vx=speed*vx;b.vy=speed*vy;
   b.mode='live';b.travel=null;b.travelHeight=0;b.trail=[];
   this.emit('routeexit',{kind:tr.kind,speed,x:b.x,y:b.y,feed:feed?.side||null});
  }
 }

 singleStep(dt){
  if(this.state==='between'){
   this.between-=dt;
   if(this.between<=0){
    if(this.ballNumber>=3 && this.extraBalls===0){
      this.state='gameover';this.ball=null;this.emit('gameover',{score:this.score,bonus:this.bonus,shots:this.shots});
    }
    else{
      if(this.ballNumber>=3){this.extraBalls--;this.playingExtraBall=true;}
      else{this.ballNumber++;this.playingExtraBall=false;}
      this.state='playing';this.spawnBall();
    }
   }
   return;
  }
  if(this.state!=='playing')return;
  this.updateFlippers(dt);
  if(this.charging)this.charge=clip(this.charge+dt*.82,.12,1);
  const current=this.ball;
  if(!current)return;
  if(current.mode==='shooter'){
   current.x=382;current.y=582;current.vx=0;current.vy=0;return;
  }
  this.time+=dt;this.tiltMeter=Math.max(0,this.tiltMeter-dt*.36);
  this.expireArcadeModes();
  // Flippers and the timer advance once; each physical ball has its own simulation.
  for(const item of [...this.balls]){
   if(!this.balls.includes(item))continue;
   this.ball=item;this.stepActiveBall(dt);
  }
  if(this.multiballActive)this.collideMultiball();
  this.ball=this.balls[0]||null;
 }
 stepActiveBall(dt){
  const b=this.ball;
  if(!b)return;
  if(b.mode==='travel'){this.updateTravel(dt);return;}
  if(b.mode==='scoop'){
   b.scoopTimer-=dt;
   b.x=SCOOP.x;b.y=SCOOP.y;b.vx=0;b.vy=0;
   if(b.scoopTimer<=0){
    b.mode='live';b.scoopTimer=0;
    b.x=SCOOP.x-12;b.y=SCOOP.y-18;
    b.vx=-320;b.vy=-560;
    this.emit('scoopRelease');
   }
   return;
  }
  const previous={x:b.x,y:b.y};
  b.vy+=GRAVITY*dt;
  // Gentle air drag and speed cap. Fixed 240 Hz collision steps limit tunnelling.
  b.vx*=1-.09*dt;b.vy*=1-.04*dt;
  this.guideShotMouths(dt);
  const speed=len(b.vx,b.vy),max=1670;
  if(speed>max){b.vx*=max/speed;b.vy*=max/speed;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  this.checkSensors(previous);
  if(!this.balls.includes(b)||b.mode!=='live')return;
  // Kickback fires at the physical side-lane threshold BEFORE rail/post
  // collisions push a genuine outlane ball out of its recovery zone.
  this.tryOutlaneKickback();
  // The shooter lane starts below the open top: once the ball crosses over the divider
  // on the way down it enters the main table.
  for(let pass=0;pass<2;pass++){
   for(let i=0;i<WALLS.length;i++){
    const [x1,y1,x2,y2]=WALLS[i];
    this.collideSegment(x1,y1,x2,y2,2,.68,'wall'+i);
   }
   for(let i=0;i<POSTS.length;i++)this.collideCircle(POSTS[i],.69,'post'+i);
   for(let i=0;i<BUMPERS.length;i++)this.collideCircle(BUMPERS[i],1.09,'bumper'+i,250);
   for(let i=0;i<SLINGS.length;i++){
    const s=SLINGS[i];
    this.collideSegment(s.x1,s.y1,s.x2,s.y2,5,1.01,'sling'+i,100);
   }
   for(const f of this.flippers)this.collideFlipper(f);
  }
  if(b.y>695||b.x< -35||b.x>455){
   if(this.multiballActive){
    this.balls=this.balls.filter(other=>other!==b);
    if(!this.tilted&&this.time<this.multiballSaveUntil){
     this.balls.push(this.makeMultiballBall(330,215,-265,-260));
     this.emit('multiballsave',{count:this.balls.length});return;
    }
    this.emit('multiballdrain',{remaining:this.balls.length});
    if(this.balls.length<=1){
     this.multiballActive=false;this.multiballSuperLit=false;this.multiballJackpots.clear();
     this.emit('multiballend',{remaining:this.balls.length});
    }
    if(this.balls.length>0)return;
   }
   if(!this.tilted && !this.ballSaveUsed && this.ballLaunchedAt!==null && this.time<this.ballSaveUntil){
    this.ballSaveUsed=true;this.ball=null;this.spawnBall({preserveProtection:true});
    this.ballSaveUsed=true; // preserve single-use launch-save guard
    this.emit('ballsave');return;
   }
   // One additional skill-earned rescue per served turn, never infinite.
   if(!this.tilted&&!this.multiballActive&&this.streakShieldReady&&!this.streakShieldSpent){
    this.streakShieldSpent=true;this.streakShieldReady=false;
    this.ball=null;this.spawnBall({preserveProtection:true});
    this.ballSaveUsed=true; // rescue does not grant another launch save
    this.emit('streaksave',{shots:this.streakShots});return;
   }
   this.skillShotPending=false;this.comboCount=0;this.comboUntil=0;
   if(this.activeCommand)this.failCommand('BALL DRAINED');
   if(this.neonCommandActive)this.failNeonCommand('BALL DRAINED');
   this.hurryUpUntil=0;this.powerCharges=0;this.overdriveUntil=0;
   const endBonus=this.tilted?0:this.bonus;
   if(endBonus>0){
    this.score+=endBonus;this.emit('award',{score:endBonus,label:'END-OF-BALL BONUS',total:this.score});
   }
   this.bonus=0;
   this.ball=null;this.balls=[];this.state='between';this.between=1.1;
   this.emit('drain',{ball:this.ballNumber,bonus:endBonus});
  }
 }
 advance(seconds){
  this.accumulator+=Math.min(.05,Math.max(0,seconds));
  const step=BOARD.step;
  let n=0;
  while(this.accumulator>=step && n<16){
   this.singleStep(step);this.accumulator-=step;n++;
  }
  if(n===16)this.accumulator=0;
 }
}
