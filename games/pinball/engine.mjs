// Neon Tilt prototype physics: deterministic fixed-step ball and flipper simulation.
// Coordinates are pixels in a 420 × 700 playfield, +Y points down.
export const BOARD = Object.freeze({width:420,height:700,radius:8,step:1/240});
export const GRAVITY=920;
export const BUMPERS=Object.freeze([
 {x:150,y:240,r:24,score:250},
 {x:259,y:240,r:24,score:250},
 {x:205,y:310,r:24,score:250}
]);
export const POSTS=Object.freeze([
 {x:112,y:585,r:9},{x:308,y:585,r:9},
 {x:135,y:635,r:6},{x:285,y:635,r:6},
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
  this.flippers=[{side:'left',x:144,y:613,a:.40,omega:0,length:65},
                 {side:'right',x:276,y:613,a:.40,omega:0,length:65}];
  this.charging=false;this.charge=.26;this.time=0;this.between=0;
  this.events=[];this.cooldowns=new Map();this.accumulator=0;
 }
 emit(type,detail={}){this.events.push({type,...detail});}
 consumeEvents(){const a=this.events.splice(0);return a;}
 start(){
  this.state='playing';this.score=0;this.ballNumber=1;
  this.charging=false;this.charge=.26;this.time=0;this.between=0;
  this.accumulator=0;this.cooldowns.clear();
  for(const f of this.flippers){f.a=.4;f.omega=0;}
  this.spawnBall();this.emit('start');
 }
 spawnBall(){
  this.ball={x:382,y:582,vx:0,vy:0,r:BOARD.radius,mode:'shooter',trail:[]};
  this.charging=false;this.charge=.26;
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
  this.emit('launch',{power:p});return true;
 }
 setFlipper(side,held){if(side==='left')this.leftHeld=Boolean(held);if(side==='right')this.rightHeld=Boolean(held);}
 releaseControls(){this.leftHeld=false;this.rightHeld=false;this.cancelLaunchCharge();}
 cancelLaunchCharge(){this.charging=false;if(this.ball?.mode==='shooter')this.charge=.26;}
 scoreHit(score,type){
  if(this.state!=='playing')return;
  this.score+=score;this.emit('hit',{score,target:type,total:this.score});
 }
 cooldownHit(key,delay,score,type){
  const last=this.cooldowns.get(key)??-100;
  if(this.time-last<delay)return false;
  this.cooldowns.set(key,this.time);this.scoreHit(score,type);return true;
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
  const contacted=this.collideSegment(f.x,f.y,tip.x,tip.y,8,.60,'flipper',0,bodyVelocity);
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
 singleStep(dt){
  if(this.state==='between'){
   this.between-=dt;
   if(this.between<=0){
    if(this.ballNumber>=3){this.state='gameover';this.ball=null;this.emit('gameover',{score:this.score});}
    else{this.ballNumber++;this.state='playing';this.spawnBall();}
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
  b.vy+=GRAVITY*dt;
  // Gentle air drag and speed cap. Four sub-pixel slices near top speed prevent tunnelling.
  b.vx*=1-.09*dt;b.vy*=1-.04*dt;
  const speed=len(b.vx,b.vy),max=1670;
  if(speed>max){b.vx*=max/speed;b.vy*=max/speed;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;
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
   this.ball=null;this.state='between';this.between=.75;
   this.emit('drain',{ball:this.ballNumber});
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
