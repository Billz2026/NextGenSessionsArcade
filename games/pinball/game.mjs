import {BOARD,WALLS,POSTS,BUMPERS,SLINGS,LANES,TARGETS,SHOTS,PinballEngine} from './engine.mjs';
import {renderTable} from './visuals.mjs';
const $=id=>document.getElementById(id);
const ui={
 canvas:$('playfield'),overlay:$('screen-overlay'),overlayKicker:$('overlay-kicker'),
 overlayTitle:$('overlay-title'),overlaySub:$('overlay-sub'),score:$('score'),
 scoreFlash:$('score-flash'),scoreState:$('score-state'),ball:$('ball-number'),
 best:$('best-score'),status:$('status-indicator'),power:$('power-fill'),
 powerLabel:$('power-label'),start:$('start'),reset:$('reset'),
 launch:$('launch'),left:$('flipper-left'),right:$('flipper-right'),sound:$('sound'),
 multi:$('multiplier'),ballSave:$('ball-save'),modeName:$('mode-name'),
 modeTimer:$('mode-timer'),missionMessage:$('mission-message'),
 extraStatus:$('extra-status'),shots:$('shots-counter'),leaderboard:$('leaderboard'),
 mission:{lanes:$('mission-lanes'),frenzy:$('mission-frenzy'),targets:$('mission-targets'),ride:$('mission-ride')},
 progress:{lanes:$('progress-lanes'),frenzy:$('progress-frenzy'),targets:$('progress-targets'),ride:$('progress-ride')}
};
const ctx=ui.canvas.getContext('2d',{alpha:false});
const engine=new PinballEngine();
const STORAGE_KEY='ngs_pinball_proto_best_v1', TOP_KEY='ngs_pinball_top5_v2';
const safeRead=()=>{try{return Number(localStorage.getItem(STORAGE_KEY))||0}catch{return 0}};
const safeWrite=n=>{try{localStorage.setItem(STORAGE_KEY,String(n))}catch{}};
let best=safeRead(),soundOn=false,audio=null,lastTime=0,particles=[],touchPointers=new Map();
let topScores=[];try{const v=JSON.parse(localStorage.getItem(TOP_KEY)||'[]');if(Array.isArray(v))topScores=v.filter(n=>Number.isSafeInteger(n)&&n>=0).slice(0,5)}catch{}
best=Math.max(best,...topScores,0);
let lastModeMessage='PRESS START TO PLAY',messageUntil=0,announcedGameOver=false;
let lastScore=-1,lastBall=-1,lastStatus='',lastPower=-1,lastBest=-1,lastStatusText='';
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
   ui.ball.textContent=ball?(engine.playingExtraBall?'EXTRA':ball+' / 3'):'— / 3';
   ui.status.textContent=state==='ready'?'STANDBY':state==='playing'?'BALL LIVE':state==='between'?'BALL DRAINED':'GAME OVER';
   ui.scoreState.textContent=state==='ready'?'PRESS START':state==='playing'?(engine.ball?.mode==='shooter'?'CHARGE LAUNCH':'KEEP THE BALL ALIVE'):state==='between'?'NEXT BALL':'RUN COMPLETE';
   lastBall=ball;lastStatus=state;
 }
 if(lastPower!==power){ui.power.style.width=power+'%';ui.powerLabel.textContent=power+'%';lastPower=power;}
 if(lastBest!==best){ui.best.textContent=fmt(best);lastBest=best;}
 ui.scoreState.textContent=state==='ready'?'PRESS START':state==='playing'?(engine.ball?.mode==='shooter'?'CHARGE LAUNCH':'KEEP THE BALL ALIVE'):state==='between'?'NEXT BALL':'RUN COMPLETE';
 ui.launch.disabled=!(state==='playing'&&engine.ball?.mode==='shooter');
 ui.start.disabled=state==='playing'||state==='between';
 if(lastStatusText!==state){ui.start.textContent=state==='gameover'?'PLAY AGAIN ↻':'START GAME ↻';lastStatusText=state;}
 ui.reset.disabled=state==='ready';
 const activeMulti=engine.time<engine.multiplierUntil;
 ui.multi.textContent=activeMulti?'2×':'1×';
 ui.ballSave.textContent=state==='playing'&&engine.ballLaunchedAt!==null&&!engine.ballSaveUsed&&engine.time<engine.ballSaveUntil
   ?Math.ceil(engine.ballSaveUntil-engine.time)+'s':'OFF';
 for(const name of Object.keys(engine.missions)){ui.mission[name].classList.toggle('completed',engine.missions[name]);}
 ui.progress.lanes.textContent=engine.missions.lanes?'DONE':engine.lanes.size+' / 3';
 ui.progress.frenzy.textContent=engine.missions.frenzy?'DONE':Math.min(10,engine.bumperHits)+' / 10';
 ui.progress.targets.textContent=engine.missions.targets?'DONE':engine.targets.size+' / 4';
 ui.progress.ride.textContent=engine.missions.ride?'DONE':'RAMP + ORBIT';
 ui.extraStatus.textContent=engine.extraAwarded?'EXTRA BALL EARNED ✓':'EXTRA BALL: COMPLETE ALL FOUR MISSIONS';
 ui.shots.textContent=engine.shots+' SHOTS';
 const remaining=Math.max(engine.multiplierUntil,engine.frenzyUntil)-engine.time;
 ui.modeName.textContent=state==='ready'?'ATTRACT MODE':state==='gameover'?'RUN COMPLETE':
  engine.time<engine.frenzyUntil?'BUMPER FRENZY':activeMulti?'NEON LANES 2×':
  engine.lastShot&&engine.time-engine.lastShot.at<8?'COMBO CHASE':'NEON TILT';
 ui.modeTimer.textContent=state==='ready'?'NEON TILT / GAME 002':remaining>0?Math.ceil(remaining)+' SECONDS REMAIN':'RAMP · ORBIT · TARGETS · LANES';
 if(performance.now()>messageUntil){
  ui.missionMessage.textContent=state==='gameover'?'GAME OVER · PLAY AGAIN':state==='playing'?
   engine.ball?.mode==='shooter'?'CHARGE YOUR PLUNGER':'CHASE THE NIGHT RIDE JACKPOT':
   state==='between'?'NEXT BALL READY SOON':'PRESS START TO PLAY';
 }
}
function arcadeMessage(message){
 lastModeMessage=message;messageUntil=performance.now()+2400;
 ui.missionMessage.textContent=message;
}
function renderLeaderboard(){
 ui.leaderboard.replaceChildren();
 if(!topScores.length){const li=document.createElement('li');li.textContent='NO RECORDS YET — SET THE FIRST SCORE';ui.leaderboard.append(li);return;}
 topScores.forEach((s,i)=>{const li=document.createElement('li');const rank=document.createElement('span');rank.textContent='#'+String(i+1).padStart(2,'0');const score=document.createElement('strong');score.textContent=fmt(s);li.append(rank,score);ui.leaderboard.append(li);});
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
  if(e.type==='launch'){ui.scoreFlash.textContent='BALL LAUNCHED';arcadeMessage('SKILL SHOTS LIVE');sound(360,.15,'sawtooth');}
  if(e.type==='shot'){arcadeMessage(e.kind==='ramp'?'RAMP SHOT! +7,500':'LEFT ORBIT! +5,000');ui.scoreFlash.textContent=e.kind.toUpperCase()+' SHOT';sound(760,.14);}
  if(e.type==='mission'){arcadeMessage(e.headline);ui.scoreFlash.textContent='MISSION COMPLETE';sound(980,.22);}
  if(e.type==='award'){ui.scoreFlash.textContent=e.label+' · +'+fmt(e.score);}
  if(e.type==='ballsave'){ui.overlay.hidden=true;arcadeMessage('BALL SAVED! LAUNCH AGAIN');sound(720,.18);}
  if(e.type==='extra'){arcadeMessage('EXTRA BALL UNLOCKED!');sound(1060,.22);}
  if(e.type==='multiplier'){arcadeMessage('2× MULTIPLIER · 20 SECONDS');}
  if(e.type==='frenzy'){arcadeMessage('BUMPER FRENZY · 15 SECONDS');}

  if(e.type==='hit'){
   ui.scoreFlash.textContent='+'+fmt(e.score);
   sound(e.target.startsWith('bumper')?650:560,.055);
   if(!reducedMotion){
    const p=e.target.startsWith('bumper')?BUMPERS[Number(e.target.slice(-1))]:
      e.target.startsWith('target')?TARGETS[Number(e.target.slice(-1))]:
      e.target.startsWith('lane')?LANES[Number(e.target.slice(-1))]:
      e.target==='sling0'?{x:143,y:522}:e.target==='sling1'?{x:277,y:522}:null;
    if(p)for(let i=0;i<8;i++){const a=i*Math.PI/4;particles.push({x:p.x,y:p.y,vx:Math.cos(a)*70,vy:Math.sin(a)*70,life:.42});}
   }
  }
  if(e.type==='drain'){
   overlay('BALL '+e.ball+' LOST',e.ball===3?'FINAL BALL':'GET READY','Ball drained. '+(e.ball===3?'Calculating final score…':'Next ball loading…'));
   ui.scoreFlash.textContent='BALL DRAINED';arcadeMessage('BALL '+e.ball+' DRAINED');sound(260,.23,'sawtooth');
  }
  if(e.type==='gameover'){
   const record=e.score>best;
   if(record){best=e.score;safeWrite(best);}
   topScores=[...topScores,e.score].sort((a,b)=>b-a).slice(0,5);
   try{localStorage.setItem(TOP_KEY,JSON.stringify(topScores))}catch{}
   renderLeaderboard();
   overlay('RUN COMPLETE',record?'NEW PERSONAL BEST!':'GAME OVER',fmt(e.score)+' POINTS · '+engine.shots+' SHOTS · PRESS PLAY AGAIN');
   ui.scoreFlash.textContent='SCORE BANKED';sound(360,.2);
  }
 }
}
function startGame(){
 engine.releaseControls();engine.start();particles=[];announcedGameOver=false;messageUntil=0;ui.scoreFlash.textContent='BALL 1 READY';syncHUD();processEvents();
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
 button.addEventListener('pointercancel',()=>{if(button===ui.launch){engine.cancelLaunchCharge();ui.launch.classList.remove('pressed')}else up()});
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
ui.canvas.addEventListener('lostpointercapture',e=>releaseTouch(e.pointerId));
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
function glowLamp(x,y,r,col,active,label=''){
 ctx.save();ctx.shadowColor=col;ctx.shadowBlur=active&&!reducedMotion?16:3;
 circle(x,y,r,active?col:'#27242b',active?'#ffe8b7':'#7a5b43',1.5);
 ctx.shadowBlur=0;circle(x-2,y-2,r*.25,active?'#fff5dc':'#725a4b');
 if(label)centerText(label,x,y+r+12,8,active?'#fae0a3':'#847a72');
 ctx.restore();
}
function rail(points,thickness=9,color='#dfac6a'){
 ctx.save();
 ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
 ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#150e14';ctx.lineWidth=thickness+8;ctx.stroke();
 ctx.strokeStyle='#49312f';ctx.lineWidth=thickness+3;ctx.stroke();
 ctx.strokeStyle=color;ctx.lineWidth=thickness;ctx.stroke();
 ctx.strokeStyle='rgba(255,251,211,.65)';ctx.lineWidth=1.5;ctx.stroke();
 ctx.restore();
}
function drawBoard(){renderTable(ctx,engine,{reducedMotion});}
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
resize();renderLeaderboard();syncHUD();requestAnimationFrame(loop);
