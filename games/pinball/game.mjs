import {BOARD,WALLS,POSTS,BUMPERS,SLINGS,PinballEngine} from './engine.mjs';
const $=id=>document.getElementById(id);
const ui={
 canvas:$('playfield'),overlay:$('screen-overlay'),overlayKicker:$('overlay-kicker'),
 overlayTitle:$('overlay-title'),overlaySub:$('overlay-sub'),score:$('score'),
 scoreFlash:$('score-flash'),scoreState:$('score-state'),ball:$('ball-number'),
 best:$('best-score'),status:$('status-indicator'),power:$('power-fill'),
 powerLabel:$('power-label'),start:$('start'),reset:$('reset'),
 launch:$('launch'),left:$('flipper-left'),right:$('flipper-right'),sound:$('sound')
};
const ctx=ui.canvas.getContext('2d',{alpha:false});
const engine=new PinballEngine();
const STORAGE_KEY='ngs_pinball_proto_best_v1';
const safeRead=()=>{try{return Number(localStorage.getItem(STORAGE_KEY))||0}catch{return 0}};
const safeWrite=n=>{try{localStorage.setItem(STORAGE_KEY,String(n))}catch{}};
let best=safeRead(),soundOn=false,audio=null,lastTime=0,particles=[],touchPointers=new Map();
let lastScore=-1,lastBall=-1,lastStatus='',lastPower=-1,lastBest=-1;
const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
const fmt=n=>Math.max(0,Math.floor(n)).toLocaleString('en-GB');
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function overlay(kicker,title,sub){
 ui.overlay.hidden=false;ui.overlayKicker.textContent=kicker;ui.overlayTitle.textContent=title;ui.overlaySub.textContent=sub;
}
function syncHUD(){
 const state=engine.state,score=engine.score,ball=engine.ballNumber,power=Math.round(engine.charge*100);
 if(lastScore!==score){ui.score.textContent=fmt(score).padStart(7,'0');lastScore=score;}
 if(lastBall!==ball||lastStatus!==state){
   ui.ball.textContent=ball?ball+' / 3':'— / 3';
   ui.status.textContent=state==='ready'?'STANDBY':state==='playing'?'BALL LIVE':state==='between'?'BALL DRAINED':'GAME OVER';
   ui.scoreState.textContent=state==='ready'?'PRESS START':state==='playing'?(engine.ball?.mode==='shooter'?'CHARGE LAUNCH':'KEEP THE BALL ALIVE'):state==='between'?'NEXT BALL':'RUN COMPLETE';
   lastBall=ball;lastStatus=state;
 }
 if(lastPower!==power){ui.power.style.width=power+'%';ui.powerLabel.textContent=power+'%';lastPower=power;}
 if(lastBest!==best){ui.best.textContent=fmt(best);lastBest=best;}
 ui.launch.disabled=!(state==='playing'&&engine.ball?.mode==='shooter');
 ui.start.disabled=state==='playing'||state==='between';
 ui.start.innerHTML=state==='gameover'?'PLAY AGAIN <span aria-hidden="true">↻</span>':'START GAME <span aria-hidden="true">↻</span>';
 ui.reset.disabled=state==='ready';
}
function sound(freq=500,duration=.07,kind='triangle'){
 if(!soundOn)return;
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume();
  const t=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();
  osc.type=kind;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(100,freq*.75),t+duration);
  gain.gain.setValueAtTime(.035,t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain).connect(audio.destination);osc.start(t);osc.stop(t+duration+.01);
 }catch{}
}
function processEvents(){
 for(const e of engine.consumeEvents()){
  if(e.type==='start'){ui.overlay.hidden=true;ui.scoreFlash.textContent='BALL 1 READY';sound(490,.10);}
  if(e.type==='ball'){
   ui.overlay.hidden=true;ui.scoreFlash.textContent='BALL '+e.ball+' READY';
   if(e.ball>1)sound(480,.12);
  }
  if(e.type==='launch'){ui.scoreFlash.textContent='BALL LAUNCHED';sound(360,.15,'sawtooth');}
  if(e.type==='hit'){
   ui.scoreFlash.textContent='+'+fmt(e.score);
   sound(e.target.startsWith('bumper')?650:560,.055);
   if(!reducedMotion){
    const p=e.target.startsWith('bumper')?BUMPERS[Number(e.target.slice(-1))]:e.target==='sling0'?{x:143,y:522}:{x:277,y:522};
    if(p)for(let i=0;i<8;i++){const a=i*Math.PI/4;particles.push({x:p.x,y:p.y,vx:Math.cos(a)*70,vy:Math.sin(a)*70,life:.42});}
   }
  }
  if(e.type==='drain'){
   overlay('BALL '+e.ball+' LOST',e.ball===3?'FINAL BALL':'GET READY','Ball drained. '+(e.ball===3?'Calculating final score…':'Next ball loading…'));
   ui.scoreFlash.textContent='BALL DRAINED';sound(260,.23,'sawtooth');
  }
  if(e.type==='gameover'){
   const record=e.score>best;
   if(record){best=e.score;safeWrite(best);}
   overlay('THREE BALLS COMPLETE',record?'NEW PERSONAL BEST!':'GAME OVER',fmt(e.score)+' POINTS · PRESS PLAY AGAIN');
   ui.scoreFlash.textContent='SCORE BANKED';sound(360,.2);
  }
 }
}
function startGame(){
 engine.releaseControls();engine.start();particles=[];ui.scoreFlash.textContent='BALL 1 READY';syncHUD();processEvents();
}
ui.start.addEventListener('click',startGame);
ui.reset.addEventListener('click',startGame);
ui.sound.addEventListener('click',()=>{
 soundOn=!soundOn;ui.sound.setAttribute('aria-pressed',String(soundOn));
 ui.sound.innerHTML=soundOn?'SOUND ON <span aria-hidden="true">♪</span>':'SOUND OFF <span aria-hidden="true">♪</span>';
 if(soundOn)sound(780,.08);
});
function setHold(side,held){
 engine.setFlipper(side,held);
 (side==='left'?ui.left:ui.right).classList.toggle('active',held);
}
function bindHold(button,down,up){
 button.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();button.setPointerCapture?.(e.pointerId);down();
 });
 button.addEventListener('pointerup',e=>{e.preventDefault();up();});
 button.addEventListener('pointercancel',up);
 button.addEventListener('lostpointercapture',up);
 button.addEventListener('contextmenu',e=>e.preventDefault());
}
bindHold(ui.left,()=>setHold('left',true),()=>setHold('left',false));
bindHold(ui.right,()=>setHold('right',true),()=>setHold('right',false));
bindHold(ui.launch,()=>{engine.holdLaunch(true);ui.launch.classList.add('pressed');},
 ()=>{engine.holdLaunch(false);ui.launch.classList.remove('pressed');});
const isInput=t=>t?.matches?.('input,textarea,select,[contenteditable="true"]');
document.addEventListener('keydown',e=>{
 if(isInput(e.target))return;
 const k=e.code;
 if(['ArrowLeft','ArrowRight','Space','ArrowDown','KeyA','KeyD','Enter','KeyP'].includes(k))e.preventDefault();
 if(k==='ArrowLeft'||k==='KeyA')setHold('left',true);
 if(k==='ArrowRight'||k==='KeyD')setHold('right',true);
 if((k==='Space'||k==='ArrowDown')&&!e.repeat){engine.holdLaunch(true);ui.launch.classList.add('pressed');}
 if(k==='Enter'&&!e.repeat&&(engine.state==='ready'||engine.state==='gameover'))startGame();
});
document.addEventListener('keyup',e=>{
 if(e.code==='ArrowLeft'||e.code==='KeyA')setHold('left',false);
 if(e.code==='ArrowRight'||e.code==='KeyD')setHold('right',false);
 if(e.code==='Space'||e.code==='ArrowDown'){
   engine.holdLaunch(false);ui.launch.classList.remove('pressed');
 }
});
// Pointer controls work directly on the lower playfield, including two simultaneous touches.
ui.canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 const rect=ui.canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;
 if(y<.49||engine.state!=='playing')return;
 e.preventDefault();ui.canvas.setPointerCapture?.(e.pointerId);
 const side=x<.5?'left':'right';touchPointers.set(e.pointerId,side);setHold(side,true);
});
function releaseTouch(id){
 const side=touchPointers.get(id);if(!side)return;
 touchPointers.delete(id);
 // Do not release a side while another finger is still holding the same side.
 if(![...touchPointers.values()].includes(side))setHold(side,false);
}
ui.canvas.addEventListener('pointerup',e=>releaseTouch(e.pointerId));
ui.canvas.addEventListener('pointercancel',e=>releaseTouch(e.pointerId));
function loseFocus(){
 touchPointers.clear();ui.left.classList.remove('active');ui.right.classList.remove('active');
 ui.launch.classList.remove('pressed');
 engine.setFlipper('left',false);engine.setFlipper('right',false);
 engine.cancelLaunchCharge();
}
window.addEventListener('blur',loseFocus);
document.addEventListener('visibilitychange',()=>{if(document.hidden){loseFocus();lastTime=0;}});
const TWO=Math.PI*2;
function roundRect(x,y,w,h,r,fill,stroke,lw=1){
 ctx.beginPath();ctx.roundRect(x,y,w,h,r);
 if(fill){ctx.fillStyle=fill;ctx.fill()}
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}
}
function circle(x,y,r,fill,stroke,lw=1){
 ctx.beginPath();ctx.arc(x,y,r,0,TWO);
 if(fill){ctx.fillStyle=fill;ctx.fill()}
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}
}
function line(x1,y1,x2,y2,color,width=2){
 ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();
}
function centerText(txt,x,y,size,color='#f9e2ad',font='Oxanium'){
 ctx.fillStyle=color;ctx.font='800 '+size+'px "'+font+'",sans-serif';ctx.textAlign='center';ctx.fillText(txt,x,y);
}
function drawBoard(){
 const w=BOARD.width,h=BOARD.height;
 const bg=ctx.createLinearGradient(0,0,400,700);
 bg.addColorStop(0,'#2c1623');bg.addColorStop(.4,'#121522');bg.addColorStop(1,'#251018');
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 const a=ctx.createRadialGradient(205,275,50,205,310,330);
 a.addColorStop(0,'rgba(174,54,50,.19)');a.addColorStop(1,'rgba(5,6,13,0)');
 ctx.fillStyle=a;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='rgba(245,190,102,.045)';ctx.lineWidth=1;
 for(let i=20;i<425;i+=26){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,h);ctx.stroke()}
 for(let j=20;j<700;j+=26){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(w,j);ctx.stroke()}
 roundRect(45,43,324,107,17,'rgba(12,11,18,.68)','rgba(248,188,91,.25)',2);
 centerText('NEXTGEN SESSIONS',208,72,14,'#e6b878');
 centerText('N E O N   T I L T',208,106,28,'#ff8971');
 centerText('ARCADE 002  /  PHYSICS TEST',208,129,10,'#c5b6a6');
 // Illuminated playfield inserts
 for(const [x,y,n] of [[112,176,'N'],[208,181,'G'],[304,176,'S']]){
  circle(x,y,15,'#35201c','#cb8b49',2);centerText(n,x,y+5,14,'#ffdb8c');
 }
 centerText('BUMPER ZONE',205,372,12,'#a77e67');
 centerText('NEON',208,440,44,'rgba(214,73,65,.19)','Barlow Condensed');
 centerText('TILT',208,480,52,'rgba(242,198,103,.11)','Barlow Condensed');
 // Matching left/right playfield slings
 for(const [idx,s] of SLINGS.entries()){
  ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);
  ctx.lineTo(idx===0?132:288,549);ctx.closePath();
  ctx.fillStyle=idx===0?'rgba(202,51,59,.52)':'rgba(184,53,67,.52)';ctx.fill();
  ctx.strokeStyle='#e9a260';ctx.lineWidth=2.5;ctx.stroke();
 }
 // Metal exterior rails and lane divider, with compact highlights
 for(const [i,[x1,y1,x2,y2]] of WALLS.entries()){
  line(x1,y1,x2,y2,'#543b38',9);
  line(x1,y1,x2,y2,i===9?'#ee9975':'#e5ad69',3);
  line(x1,y1,x2,y2,'rgba(255,242,194,.42)',1);
 }
 // Launcher shaft and plunger spring
 line(381,557,381,661,'#af6f43',5);
 line(381,557,381,661,'#f1c06e',1);
 roundRect(375,655,13,23,5,'#98603b','#ffe3a7',1);
 // Circular bumper cluster with vibrant red/yellow rings
 for(const b of BUMPERS){
  circle(b.x,b.y,b.r+8,'rgba(249,143,58,.08)','rgba(250,202,109,.24)',3);
  const fill=ctx.createRadialGradient(b.x-8,b.y-10,2,b.x,b.y,b.r);
  fill.addColorStop(0,'#ffdd9d');fill.addColorStop(.34,'#e75b4b');fill.addColorStop(1,'#6b2528');
  circle(b.x,b.y,b.r,fill,'#f4c66c',4);
  circle(b.x,b.y,b.r*.52,'#a83735','#ffd992',2);
  circle(b.x,b.y,5,'#ffe1a0');
 }
 for(const p of POSTS){circle(p.x,p.y,p.r+3,'#674533','#241115',1);circle(p.x,p.y,p.r,'#e9bd71','#f8dda2',2);}
 // Drain mouth and lower apron.
 ctx.fillStyle='rgba(3,3,7,.82)';ctx.beginPath();ctx.ellipse(210,694,104,24,0,0,TWO);ctx.fill();
 centerText('DRAIN',210,684,10,'#a35f55');
 for(const f of engine.flippers){
  const tip=engine.flipperTip(f);
  ctx.shadowBlur=14;ctx.shadowColor='#eeb85e';
  line(f.x,f.y,tip.x,tip.y,'#422321',22);
  line(f.x,f.y,tip.x,tip.y,'#ffda7f',16);
  ctx.shadowBlur=0;
  line(f.x,f.y,tip.x,tip.y,'#ef9561',5);
  circle(f.x,f.y,12,'#492725','#ffdf97',3);
  circle(f.x,f.y,5,'#fbe0ab');
 }
 const b=engine.ball;
 if(b){
  // Ball trail fades naturally as speed decreases.
  if(b.mode==='live'){
    b.trail.push({x:b.x,y:b.y});
    if(b.trail.length>9)b.trail.shift();
    b.trail.forEach((p,i)=>circle(p.x,p.y,2+i*.35,'rgba(255,209,129,'+(i/b.trail.length*.21)+')'));
  }
  circle(b.x+3,b.y+5,b.r+1,'rgba(0,0,0,.55)');
  const metal=ctx.createRadialGradient(b.x-3,b.y-5,1,b.x,b.y,b.r+1);
  metal.addColorStop(0,'#ffffff');metal.addColorStop(.38,'#f7f1de');metal.addColorStop(.8,'#9b918c');metal.addColorStop(1,'#4a474a');
  circle(b.x,b.y,b.r,metal,'#f6e8d4',.6);
  circle(b.x-3,b.y-3,2.1,'#fff');
 }
 // Plunger charge display in the lane.
 if(b?.mode==='shooter'){
  const v=Math.round(engine.charge*100);
  centerText(v+'%',383,527,13,'#ffd18a');
 }
}
function drawParticles(dt){
 if(reducedMotion)return;
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;circle(p.x,p.y,2.6,'rgba(255,209,112,'+clamp(p.life/.42,0,1)+')');}
 particles=particles.filter(p=>p.life>0);
}
function resize(){
 const dpr=Math.min(2,Math.max(1,devicePixelRatio||1));
 const width=Math.round(BOARD.width*dpr),height=Math.round(BOARD.height*dpr);
 if(ui.canvas.width!==width||ui.canvas.height!==height){
  ui.canvas.width=width;ui.canvas.height=height;
 }
 ctx.setTransform(width/BOARD.width,0,0,height/BOARD.height,0,0);
}
function loop(now){
 const dt=lastTime?Math.min(.05,(now-lastTime)/1000):0;lastTime=now;
 if(!document.hidden){
  engine.advance(dt);processEvents();syncHUD();
  resize();drawBoard();drawParticles(dt);
 }
 requestAnimationFrame(loop);
}
resize();syncHUD();requestAnimationFrame(loop);
