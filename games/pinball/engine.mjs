// Neon Tilt prototype physics: deterministic fixed-step ball and flipper simulation.
// Coordinates are pixels in a 420 × 700 playfield, +Y points down.
export const BOARD = Object.freeze({width:420,height:700,radius:8,step:1/240});
export const GRAVITY=780;
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
 [285,203,1.45],[311,170,1.28],[291,150,.95]
].map(p=>Object.freeze(p)));
export const ORBIT_PATH=Object.freeze([
 [77,373,.39],[59,321,.52],[56,250,.67],[71,204,.78],
 [94,176,.86],[136,152,.9],[214,150,.82],[300,150,.69]
].map(p=>Object.freeze(p)));
export const SHOTS=Object.freeze({
 orbit:{x:77,y:373,r:26,points:5000},
 ramp:{x:311,y:372,r:27,points:7500}
});
export const SPINNER=Object.freeze({x:204,y:365,halfWidth:20,points:1250});
export const SCOOP=Object.freeze({x:316,y:444,r:17,points:8000,hold:.67});
export const SLINGS=Object.freeze([
 {x1:119,y1:502,x2:163,y2:535,score:100},
 {x1:301,y1:502,x2:257,y2:535,score:100}
]);
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
  this.ball=null;this.leftHeld=false;this.rightHeld=false;
  this.flippers=[{side:'left',x:144,y:613,a:.40,omega:0,length:71},
                 {side:'right',x:276,y:613,a:.40,omega:0,length:71}];
  this.charging=false;this.charge=.26;this.time=0;this.between=0;
  this.events=[];this.cooldowns=new Map();this.accumulator=0;
  this.lanes=new Set();this.targets=new Set();this.bumperHits=0;
  this.missions={lanes:false,frenzy:false,targets:false,ride:false};
  this.multiplierUntil=0;this.frenzyUntil=0;this.lastShot=null;
  this.extraBalls=0;this.extraAwarded=false;this.ballSaveUntil=0;this.ballSaveUsed=false;
  this.ballLaunchedAt=null;this.bonus=0;this.shots=0;this.playingExtraBall=false;
  this.spinnerTurns=0;this.spinnerAngle=0;this.scoopHits=0;this.lastScoopTime=-100;
 }
 emit(type,detail={}){this.events.push({type,...detail});}
 consumeEvents(){const a=this.events.splice(0);return a;}
 start(){
  this.state='playing';this.score=0;this.ballNumber=1;
  this.charging=false;this.charge=.26;this.time=0;this.between=0;
  this.accumulator=0;this.cooldowns.clear();
  this.lanes.clear();this.targets.clear();this.bumperHits=0;
  this.missions={lanes:false,frenzy:false,targets:false,ride:false};
  this.multiplierUntil=0;this.frenzyUntil=0;this.lastShot=null;
  this.extraBalls=0;this.extraAwarded=false;this.ballSaveUntil=0;this.ballSaveUsed=false;
  this.ballLaunchedAt=null;this.bonus=0;this.shots=0;this.playingExtraBall=false;
  this.spinnerTurns=0;this.spinnerAngle=0;this.scoopHits=0;this.lastScoopTime=-100;
  for(const f of this.flippers){f.a=.4;f.omega=0;}
  this.spawnBall();this.emit('start');
 }
 spawnBall(){
  this.ball={x:382,y:582,vx:0,vy:0,r:BOARD.radius,mode:'shooter',trail:[]};
  this.charging=false;this.charge=.26;
  this.ballSaveUntil=0;this.ballLaunchedAt=null;this.ballSaveUsed=false;
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
  this.ballLaunchedAt=this.time;this.ballSaveUntil=this.time+11;
  this.emit('launch',{power:p});return true;
 }
 setFlipper(side,held){if(side==='left')this.leftHeld=Boolean(held);if(side==='right')this.rightHeld=Boolean(held);}
 releaseControls(){this.leftHeld=false;this.rightHeld=false;this.cancelLaunchCharge();}
 cancelLaunchCharge(){this.charging=false;if(this.ball?.mode==='shooter')this.charge=.26;}
 scoreHit(score,type){
  if(this.state!=='playing')return;
  const active=this.time<this.multiplierUntil?2:1;
  const frenzy=type.startsWith('bumper')&&this.time<this.frenzyUntil?2:1;
  const awarded=score*active*frenzy;
  this.score+=awarded;this.bonus+=Math.floor(awarded/10);
  this.emit('hit',{score:awarded,target:type,total:this.score});
 }
 cooldownHit(key,delay,score,type){
  const last=this.cooldowns.get(key)??-100;
  if(this.time-last<delay)return false;
  this.cooldowns.set(key,this.time);this.scoreHit(score,type);
  if(type.startsWith('bumper'))this.bumper();
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
   b.vx-=(1+impulse)*dot*nx;b.vy-=(1+impulse)*dot*ny;
   if(score && dot<-35 && this.cooldownHit(key,.11,score,key)){
    b.vx+=nx*90;b.vy+=ny*90;
   }
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
   let rebound=-(1+restitution)*vn;
   if(velocity)rebound=Math.min(rebound,1150);
   b.vx+=p.nx*rebound;b.vy+=p.ny*rebound;
   if(score && vn<-35 && this.cooldownHit(key,.13,score,key)){
    b.vx+=p.nx*75;b.vy+=p.ny*75;
   }
  }
  return true;
 }
 updateFlippers(dt){
  for(const f of this.flippers){
   const held=f.side==='left'?this.leftHeld:this.rightHeld;
   const goal=held?-.57:.40;
   const old=f.a;
   f.a=clip(goal,old-14*dt,old+14*dt);
   f.omega=(f.a-old)/dt;
  }
 }
 flipperTip(f){
  return {x:f.x+(f.side==='left'?1:-1)*Math.cos(f.a)*f.length,y:f.y+Math.sin(f.a)*f.length};
 }
 collideFlipper(f){
  const tip=this.flipperTip(f),sx=f.side==='left'?1:-1;
  const bodyVelocity=p=>{
   const rx=p.px-f.x,ry=p.py-f.y;
   // Flip angle is mirrored horizontally for the right bat.
   const w=f.omega*sx;
   return {x:-w*ry,y:w*rx};
  };
  const contacted=this.collideSegment(f.x,f.y,tip.x,tip.y,11,.65,'flipper',0,bodyVelocity);
  if(contacted){
   const held=f.side==='left'?this.leftHeld:this.rightHeld;
   const last=this.cooldowns.get('bat-'+f.side)??-100;
   if(held && this.ball.y<f.y+14 && this.time-last>.085){
    // A stationary held bat still needs an upward collision response.
    // The kick is stronger while its motor is actively rotating into the ball.
    const lift=470+Math.min(320,Math.abs(f.omega)*24);
    this.ball.vy=Math.min(this.ball.vy,-lift);
    this.ball.vx+=(f.side==='left'?1:-1)*(90+Math.min(90,Math.abs(f.omega)*7));
    this.cooldowns.set('bat-'+f.side,this.time);
   }
  }
 }
 // All sensors and scoring run in fixed simulation time, not per render frame.
 addPoints(points,label){
  const multiplier=this.time<this.multiplierUntil?2:1;
  const value=points*multiplier;
  this.score+=value;this.bonus+=Math.floor(value/10);
  this.emit('award',{score:value,label,total:this.score});
 }
 mission(name,headline,points=0){
  if(this.missions[name])return;
  this.missions[name]=true;
  if(points)this.addPoints(points,headline);
  this.emit('mission',{name,headline});
  this.checkExtraBall();
 }
 checkExtraBall(){
  if(this.extraAwarded||!Object.values(this.missions).every(Boolean))return;
  this.extraAwarded=true;this.extraBalls++;this.emit('extra',{count:this.extraBalls});
 }
 bumper(){
  this.bumperHits++;
  if(this.bumperHits===10){
   this.frenzyUntil=this.time+15;
   this.mission('frenzy','BUMPER FRENZY',7500);
   this.emit('frenzy',{until:this.frenzyUntil});
  }
 }
 activateLane(i){
  if(this.lanes.has(i))return;
  this.lanes.add(i);this.scoreHit(750,'lane'+i);
  this.emit('lane',{index:i,count:this.lanes.size});
  if(this.lanes.size===3){
   this.lanes.clear();this.multiplierUntil=this.time+20;
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
  }
 }
 activateShot(kind){
  const shot=SHOTS[kind];
  this.shots++;this.addPoints(shot.points,kind==='ramp'?'RAMP SHOT':'LEFT ORBIT');
  this.emit('shot',{kind,points:shot.points});
  if(this.lastShot && this.lastShot.kind!==kind && this.time-this.lastShot.at<8){
   this.mission('ride','NIGHT RIDE JACKPOT',40000);
  }
  this.lastShot={kind,at:this.time};
  const b=this.ball;
  b.mode='travel';b.travel={kind,t:0,duration:kind==='ramp'?.95:.8,from:{x:b.x,y:b.y}};
 }
 checkSensors(previous){
  const b=this.ball;if(!b||b.mode!=='live')return;
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
   this.addPoints(SPINNER.points,'SPINNER');
   this.emit('spinner',{turns:this.spinnerTurns});
  }
  const sd=Math.hypot(b.x-SCOOP.x,b.y-SCOOP.y);
  if(sd<SCOOP.r-2 && b.vy< -180 && this.time-this.lastScoopTime>2){
   this.lastScoopTime=this.time;this.scoopHits++;
   this.addPoints(SCOOP.points,'NEON SCOOP');
   b.mode='scoop';b.scoopTimer=SCOOP.hold;
   b.x=SCOOP.x;b.y=SCOOP.y;b.vx=0;b.vy=0;
   this.emit('scoop',{count:this.scoopHits});
   return;
  }
  for(const kind of ['orbit','ramp']){
   const s=SHOTS[kind];
   if(b.vy<-300&&previous.y>=s.y&&b.y<s.y&&Math.abs(b.x-s.x)<s.r){
    this.activateShot(kind);return;
   }
  }
 }
 updateTravel(dt){
  const b=this.ball,tr=b.travel;if(!tr){b.mode='live';return;}
  tr.t+=dt;
  const path=tr.kind==='ramp'?RAMP_PATH:ORBIT_PATH;
  const progress=Math.min(1,tr.t/tr.duration);
  const pos=progress*(path.length-1);
  const i=Math.min(path.length-2,Math.floor(pos));
  const f=Math.max(0,Math.min(1,pos-i));
  const entryBlend=Math.max(0,1-progress*8);
  b.x=path[i][0]+(path[i+1][0]-path[i][0])*f+
    (tr.from.x-path[0][0])*entryBlend;
  b.y=path[i][1]+(path[i+1][1]-path[i][1])*f+
    (tr.from.y-path[0][1])*entryBlend;
  b.travelHeight=path[i][2]+(path[i+1][2]-path[i][2])*f;
  if(progress>=1){
   b.mode='live';b.travel=null;
   b.vx=tr.kind==='ramp'?-170:-260;b.vy=230;
   b.travelHeight=0;b.trail=[];
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
  const b=this.ball;
  if(!b)return;
  if(b.mode==='shooter'){
   b.x=382;b.y=582;b.vx=0;b.vy=0;return;
  }
  this.time+=dt;
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
  // Gentle air drag and speed cap. Four sub-pixel slices near top speed prevent tunnelling.
  b.vx*=1-.09*dt;b.vy*=1-.04*dt;
  const speed=len(b.vx,b.vy),max=1670;
  if(speed>max){b.vx*=max/speed;b.vy*=max/speed;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  this.checkSensors(previous);
  if(b.mode!=='live')return;
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
   if(!this.ballSaveUsed && this.ballLaunchedAt!==null && this.time<this.ballSaveUntil){
    this.ballSaveUsed=true;this.ball=null;this.spawnBall();
    this.ballSaveUsed=true; // preserve single-use guard after spawnBall
    this.emit('ballsave');return;
   }
   const endBonus=this.bonus;
   if(endBonus>0){
    this.score+=endBonus;this.emit('award',{score:endBonus,label:'END-OF-BALL BONUS',total:this.score});
   }
   this.bonus=0;
   this.ball=null;this.state='between';this.between=1.1;
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
