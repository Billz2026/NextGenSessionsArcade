import {BOARD,WALLS,POSTS,BUMPERS,SLINGS,LANES,TARGETS,SHOTS,PinballEngine} from './engine.mjs?v=15';
import {renderTable} from './visuals.mjs?v=31';
import {createDotMatrix} from './dmd.mjs?v=15';
const $=id=>document.getElementById(id);
const ui={
 canvas:$('playfield'),overlay:$('screen-overlay'),overlayKicker:$('overlay-kicker'),
 overlayTitle:$('overlay-title'),overlaySub:$('overlay-sub'),score:$('score'),
 scoreFlash:$('score-flash'),scoreState:$('score-state'),ball:$('ball-number'),
 best:$('best-score'),rank:$('rank-name'),status:$('status-indicator'),power:$('power-fill'),
 powerLabel:$('power-label'),powerTitle:$('power-title'),launchTitle:$('launch-title'),launchHint:$('launch-hint'),launcherPanel:$('launcher-section'),actionPanel:$('primary-action'),start:$('start'),reset:$('reset'),
 launch:$('launch'),left:$('flipper-left'),right:$('flipper-right'),sound:$('sound'),
 multi:$('multiplier'),ballSave:$('ball-save'),modeName:$('mode-name'),
 multiballStatus:$('multiball-indicator'),multiballText:$('multiball-text'),
 modeTimer:$('mode-timer'),missionMessage:$('mission-message'),
 extraStatus:$('extra-status'),gridStatus:$('grid-status'),shots:$('shots-counter'),leaderboard:$('leaderboard'),
 mission:{lanes:$('mission-lanes'),frenzy:$('mission-frenzy'),targets:$('mission-targets'),ride:$('mission-ride')},
 progress:{lanes:$('progress-lanes'),frenzy:$('progress-frenzy'),targets:$('progress-targets'),ride:$('progress-ride')}
};
const ctx=ui.canvas.getContext('2d',{alpha:false});
const engine=new PinballEngine();
const STORAGE_KEY='ngs_pinball_proto_best_v1', TOP_KEY='ngs_pinball_top5_v2';
const safeRead=()=>{try{return Number(localStorage.getItem(STORAGE_KEY))||0}catch{return 0}};
const safeWrite=n=>{try{localStorage.setItem(STORAGE_KEY,String(n))}catch{}};
let best=safeRead(),soundOn=false,audio=null,audioMaster=null,audioNoise=null,lastTime=0,particles=[],touchPointers=new Map();
let bumperFlash=null,tableFlash=null;
let topScores=[];try{const v=JSON.parse(localStorage.getItem(TOP_KEY)||'[]');if(Array.isArray(v))topScores=v.filter(n=>Number.isSafeInteger(n)&&n>=0).slice(0,5)}catch{}
best=Math.max(best,...topScores,0);
let lastModeMessage='',messageUntil=0,announcedGameOver=false;
let lastScore=-1,lastBall=-1,lastActiveBalls=-1,lastStatus='',lastPower=-1,lastBest=-1,lastStatusText='',lastTilt=null;
const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
const dmd=createDotMatrix(document.getElementById('dmd-screen'),{reducedMotion});
// A physically modelled Three.js scene is the preferred renderer. 2D Canvas
// is retained as an immediate, offline-safe fallback on unsupported systems.
const stage=document.getElementById('table-stage');
const renderStatus=document.getElementById('render-status');
const modeButton=document.getElementById('render-mode');
let view3d=null,prefer3d=true,loading3d=false,threeFailed=false;
let webglValidated=false,webglBlankFrames=0;
function updateRenderUI(){
 if(!stage)return;
 const active=prefer3d&&Boolean(view3d)&&webglValidated;
 stage.classList.toggle('has-webgl',active);
 if(modeButton){
  modeButton.disabled=threeFailed;
  modeButton.setAttribute('aria-pressed',String(active));
  modeButton.textContent=active?'3D TABLE · ON':threeFailed?'2D FALLBACK':'2D TABLE · ON';
 }
 if(renderStatus)renderStatus.textContent=active?'REAL-TIME 3D':threeFailed?'2D MODE · 3D UNAVAILABLE':loading3d?'LOADING 3D…':'CLASSIC 2D VIEW';
}
async function activate3D(){
 if(!stage||view3d||loading3d||threeFailed)return;
 loading3d=true;updateRenderUI();
 try{
  const {create3DTable}=await import('./render3d.mjs?v=34');
  const result=await create3DTable(stage);
  view3d=result;
  webglValidated=false;webglBlankFrames=0;
  result.canvas.addEventListener('webglcontextlost',event=>{
   event.preventDefault();
   prefer3d=false;threeFailed=true;webglValidated=false;
   updateRenderUI();
  });
 }catch(error){
  console.warn('Neon Tilt 3D unavailable; keeping playable 2D table.',error);
  threeFailed=true;
 }finally{loading3d=false;updateRenderUI();}
}
if(modeButton)modeButton.addEventListener('click',()=>{
 if(threeFailed)return;
 prefer3d=!prefer3d;
 updateRenderUI();
 if(prefer3d&&!view3d)activate3D();
});
activate3D();
// Optional browser fullscreen, independent of game mechanics and zoom.
const immersiveButton=document.getElementById('immersive');
if(immersiveButton){
 immersiveButton.addEventListener('click',async()=>{
  try{
   if(document.fullscreenElement)await document.exitFullscreen();
   else await document.documentElement.requestFullscreen();
  }catch(error){console.warn('Fullscreen unavailable in this browser.',error);}
 });
 document.addEventListener('fullscreenchange',()=>{
  const active=Boolean(document.fullscreenElement);
  immersiveButton.setAttribute('aria-pressed',String(active));
  immersiveButton.textContent=active?'EXIT FULLSCREEN':'FULLSCREEN ⛶';
  view3d?.resize();
 });
}
// Phase 4L.1 — optional table-first desktop presentation.
 // The header disappears only while focused; an in-stage exit control
 // restores every original header action without restarting the run.
const focusButton=document.getElementById('table-focus');
const focusExit=document.getElementById('focus-exit');
const desktopFocusMedia=window.matchMedia?.('(min-width:1121px)');
let tableFocusEnabled=false;
function setTableFocus(enabled){
 const next=Boolean(enabled&&desktopFocusMedia?.matches&&!document.fullscreenElement);
 const previous=tableFocusEnabled;
 tableFocusEnabled=next;
 document.documentElement.classList.toggle('pinball-focus',next);
 focusButton?.setAttribute('aria-pressed',String(next));
 if(focusExit)focusExit.hidden=!next;
 // Keep keyboard focus on a visible control when hiding/showing the header.
 if(next&&!previous)focusExit?.focus({preventScroll:true});
 else if(previous&&!next&&desktopFocusMedia?.matches&&!document.fullscreenElement)
  focusButton?.focus({preventScroll:true});
 // Resize after the layout reflows; 2D playfield coordinates stay unchanged.
 requestAnimationFrame(()=>view3d?.resize());
}
focusButton?.addEventListener('click',()=>setTableFocus(!tableFocusEnabled));
focusExit?.addEventListener('click',()=>setTableFocus(false));
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&tableFocusEnabled&&!document.fullscreenElement){
  setTableFocus(false);
 }
});
desktopFocusMedia?.addEventListener?.('change',event=>{
 if(!event.matches&&tableFocusEnabled)setTableFocus(false);
});
document.addEventListener('fullscreenchange',()=>{
 if(document.fullscreenElement&&tableFocusEnabled)setTableFocus(false);
});
const spinnerCount=document.getElementById('spinner-count');
const scoopCount=document.getElementById('scoop-count');
const fmt=n=>Math.max(0,Math.floor(n)).toLocaleString('en-GB');
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
function overlay(kicker,title,sub){
 ui.overlay.hidden=false;ui.overlayKicker.textContent=kicker;ui.overlayTitle.textContent=title;ui.overlaySub.textContent=sub;
}
function syncHUD(){
 const state=engine.state,score=engine.score,ball=engine.ballNumber,power=Math.round(engine.charge*100);
 if(lastScore!==score){ui.score.textContent=fmt(score).padStart(7,'0');lastScore=score;}
 const isReady=state==='ready',isOver=state==='gameover';
 const shooterReady=state==='playing'&&engine.ball?.mode==='shooter';
 const ballLive=state==='playing'&&!shooterReady;
 const saveRemaining=ballLive&&!engine.tilted&&!engine.ballSaveUsed&&engine.ballLaunchedAt!==null?
  Math.max(0,engine.ballSaveUntil-engine.time):0;
 if(lastBall!==ball||lastStatus!==state||lastTilt!==engine.tilted||lastActiveBalls!==engine.balls.length){
  ui.ball.textContent=engine.multiballActive?engine.balls.length+' LIVE':ball?(engine.playingExtraBall?'EXTRA':ball+' / 3'):'— / 3';
  ui.status.textContent=engine.tilted?'TILT':isReady?'STANDBY':shooterReady?'BALL READY':
   ballLive?'BALL LIVE':state==='between'?'BETWEEN BALLS':'GAME OVER';
  lastBall=ball;lastStatus=state;lastTilt=engine.tilted;lastActiveBalls=engine.balls.length;
 }
 ui.actionPanel.hidden=!(isReady||isOver||shooterReady);
 ui.start.hidden=!(isReady||isOver);
 ui.start.disabled=!(isReady||isOver);
 ui.launch.hidden=!shooterReady;
 ui.launch.disabled=!shooterReady;
 ui.reset.disabled=isReady;
 ui.launcherPanel.hidden=!(shooterReady||saveRemaining>0);
 ui.launcherPanel.classList.toggle('is-ball-live',saveRemaining>0);
 ui.launchTitle.textContent=shooterReady?'PLUNGER POWER':'BALL SAVE';
 ui.launchHint.textContent=shooterReady?'SHOOTER LANE':'EARLY DRAIN PROTECTION';
 ui.powerTitle.textContent=shooterReady?'CHARGE':'TIME REMAINING';
 ui.powerLabel.textContent=shooterReady?power+'%':Math.ceil(saveRemaining)+'s';
 const progress=shooterReady?power:saveRemaining>0?Math.round(Math.min(1,saveRemaining/11)*100):0;
 if(lastPower!==progress){ui.power.style.width=progress+'%';lastPower=progress;}
 if(lastBest!==best){ui.best.textContent=fmt(best);lastBest=best;}
 ui.rank.textContent=engine.rankName;
 ui.scoreState.textContent=isReady?'READY':shooterReady?'BALL READY':
  ballLive?'IN PLAY':state==='between'?'BALL COMPLETE':'RUN COMPLETE';
 if(lastStatusText!==state){ui.start.textContent=isOver?'PLAY AGAIN':'START GAME';lastStatusText=state;}
 const activeMulti=engine.time<engine.multiplierUntil;
 const commandActive=Boolean(engine.activeCommand),commandReady=engine.commandMissionReady;
 ui.multi.textContent=activeMulti?'2×':'1×';
 ui.multiballStatus.hidden=!engine.multiballActive;
 if(engine.multiballActive)ui.multiballText.textContent=engine.multiballSuperLit?'SUPER JACKPOT LIT · SHOOT SCOOP':
  engine.time<engine.multiballSaveUntil?'3-BALL SAVE · '+Math.ceil(engine.multiballSaveUntil-engine.time)+'s':
  engine.balls.length+' BALLS ACTIVE · RAMP + ORBIT JACKPOTS';
 ui.ballSave.textContent=engine.tilted?'TILT':engine.multiballActive&&engine.time<engine.multiballSaveUntil?
  Math.ceil(engine.multiballSaveUntil-engine.time)+'s':state==='playing'&&engine.ballLaunchedAt!==null&&!engine.ballSaveUsed&&engine.time<engine.ballSaveUntil
   ?Math.ceil(engine.ballSaveUntil-engine.time)+'s':'OFF';
 for(const name of Object.keys(engine.missions)){ui.mission[name].classList.toggle('completed',engine.missions[name]);}
 ui.progress.lanes.textContent=engine.missions.lanes?'DONE':engine.lanes.size+' / 3';
 ui.progress.frenzy.textContent=engine.missions.frenzy?'DONE':Math.min(10,engine.bumperHits)+' / 10';
 ui.progress.targets.textContent=engine.missions.targets?'DONE':engine.targets.size+' / 4';
 ui.progress.ride.textContent=engine.missions.ride?'DONE':'RAMP + ORBIT';
 ui.extraStatus.textContent=engine.extraAwarded?'COMMANDER RANK · EXTRA BALL EARNED ✓':
  'FLIGHT RANK: '+engine.rankName+' · '+Math.min(4,engine.commandFlags)+'/4 MISSION FLAGS';
 const rushActive=engine.hurryUpUntil>engine.time,overdriveActive=engine.overdriveUntil>engine.time;
 const remaining=rushActive?engine.hurryUpUntil-engine.time:
  overdriveActive?engine.overdriveUntil-engine.time:
  Math.max(engine.multiplierUntil,engine.frenzyUntil)-engine.time;
 ui.gridStatus.textContent=isReady?'3 SHOTS TO JACKPOT':isOver?'FINAL SCORE':
  state==='between'?'BALL '+ball+' COMPLETE':shooterReady?'UPPER LANES · SKILL SHOT':
  engine.multiballActive?'MULTIBALL · '+engine.balls.length+' BALLS':
  engine.neonCommandActive?'NEON COMMAND · '+Math.ceil(engine.neonCommandRemaining)+'s':
  commandActive?'FUEL · '+Math.ceil(engine.commandFuelRemaining)+'s':commandReady?'MISSION READY':
  rushActive?'JACKPOT · '+Math.ceil(engine.hurryUpUntil-engine.time)+'s':
  overdriveActive?'OVERDRIVE · '+Math.ceil(engine.overdriveUntil-engine.time)+'s':
  'POWER GRID '+engine.powerCharges+'/3';
 ui.shots.textContent=engine.shots+' SHOTS';
 if(spinnerCount)spinnerCount.textContent=engine.spinnerTurns+' SPINS';
 if(scoopCount)scoopCount.textContent=engine.scoopHits+' SCOOPS';
 ui.modeName.textContent=engine.tilted?'TILT · NO SCORING':isReady?'TABLE OBJECTIVE':isOver?'RUN COMPLETE':
  state==='between'?'BETWEEN BALLS':shooterReady?'SKILL SHOT':
  engine.multiballActive?'NEON OVERLOAD · MULTIBALL':engine.neonCommandActive?'NEON COMMAND':
  commandActive?'FLIGHT MISSION':commandReady?'MISSION CONTROL':
  rushActive?'NEON RUSH · JACKPOT LIT':overdriveActive?'SPINNER OVERDRIVE':
  engine.time<engine.frenzyUntil?'BUMPER FRENZY':activeMulti?'NEON LANES 2×':
  engine.comboCount>=2?'COMBO X'+engine.comboCount:'CURRENT OBJECTIVE';
 ui.modeTimer.textContent=engine.tilted?'BONUS FORFEITED · NEXT BALL TO RESET':isReady?'HIT THREE ROUTE SHOTS TO LIGHT THE SCOOP':isOver?'YOUR BEST '+fmt(best):
  state==='between'?'NEXT BALL PREPARING':shooterReady?'HIT AN UPPER N-G-S LANE':
  engine.multiballActive?(engine.multiballSuperLit?'SHOOT SCOOP FOR SUPER JACKPOT':'HIT RAMP + ORBIT FOR JACKPOTS'):
  engine.neonCommandActive?'COMMAND '+engine.neonCommandStep+'/5 · '+Math.ceil(engine.neonCommandRemaining)+'s':
  commandActive?engine.commandInstruction+' · '+Math.ceil(engine.commandFuelRemaining)+' SECONDS FUEL':
  commandReady?'TARGET BANK LOCKED · RAMP STARTS MISSION':
  remaining>0?Math.ceil(remaining)+' SECONDS · '+(rushActive?'HIT SCOOP':overdriveActive?'SPIN FOR BONUS':'MODE LIVE'):
  'RAMP · ORBIT · CROSSOVER · SKYLINE';
 ui.missionMessage.textContent=engine.tilted?'WAIT FOR BALL TO DRAIN':isReady?'CHARGE THE POWER GRID':isOver?'FINAL SCORE '+fmt(score):
  state==='between'?'BALL '+ball+' COMPLETE':shooterReady?'SKILL SHOT AVAILABLE':
  engine.multiballActive?'THREE-BALL SCORE ATTACK':engine.neonCommandActive?'FINAL COMMAND MISSION':
  commandActive?engine.commandMission.name:commandReady?'SHOOT RAMP TO LAUNCH':
  rushActive?'SHOOT THE SCOOP':overdriveActive?'HIT THE SPINNER':
  engine.powerCharges===2?'ONE MORE ROUTE FOR JACKPOT':
  engine.powerCharges>0?'CHARGE THE POWER GRID':'SHOOT RAMP OR ORBIT';

}
function arcadeMessage(message){
 lastModeMessage=message;messageUntil=performance.now()+2400;
 // Hardware event announcements are exclusive to the dynamic DMD.
}
function renderLeaderboard(){
 ui.leaderboard.replaceChildren();
 if(!topScores.length){const li=document.createElement('li');li.textContent='NO RECORDS YET — SET THE FIRST SCORE';ui.leaderboard.append(li);return;}
 topScores.forEach((s,i)=>{const li=document.createElement('li');const rank=document.createElement('span');rank.textContent='#'+String(i+1).padStart(2,'0');const score=document.createElement('strong');score.textContent=fmt(s);li.append(rank,score);ui.leaderboard.append(li);});
}
function ensureAudio(){
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(!audioMaster){
   const compressor=audio.createDynamicsCompressor();
   compressor.threshold.value=-18;compressor.knee.value=14;
   compressor.ratio.value=5;compressor.attack.value=.004;compressor.release.value=.16;
   audioMaster=audio.createGain();audioMaster.gain.value=.72;
   audioMaster.connect(compressor).connect(audio.destination);
  }
  if(audio.state==='suspended')audio.resume();
  return audio;
 }catch{return null}
}
function audioBus(pan=0){
 if(!audioMaster)return null;
 if(!audio.createStereoPanner)return audioMaster;
 const panner=audio.createStereoPanner();panner.pan.value=clamp(pan,-.85,.85);panner.connect(audioMaster);return panner;
}
function sound(freq=500,duration=.07,kind='triangle',volume=.035,pan=0){
 if(!soundOn)return;
 try{
  if(!ensureAudio())return;
  const t=audio.currentTime,osc=audio.createOscillator(),gain=audio.createGain();
  osc.type=kind;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(100,freq*.75),t+duration);
  gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain).connect(audioBus(pan));osc.start(t);osc.stop(t+duration+.01);
 }catch{}
}
function noiseBurst(duration=.045,volume=.035,filterFrequency=1500,pan=0){
 if(!soundOn||!ensureAudio())return;
 try{
  if(!audioNoise){
   audioNoise=audio.createBuffer(1,Math.ceil(audio.sampleRate*.25),audio.sampleRate);
   const channel=audioNoise.getChannelData(0);
   for(let i=0;i<channel.length;i++)channel[i]=(Math.random()*2-1)*(1-i/channel.length*.45);
  }
  const t=audio.currentTime,source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
  source.buffer=audioNoise;filter.type='bandpass';filter.frequency.value=filterFrequency;filter.Q.value=.7;
  gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  source.connect(filter).connect(gain).connect(audioBus(pan));source.start(t);source.stop(t+duration+.01);
 }catch{}
}
function impactPan(x){return Number.isFinite(x)?(x/BOARD.width)*1.6-.8:0}
function mechanicalImpact(event){
 const strength=clamp(event.strength||.08,.06,1),pan=impactPan(event.x);
 if(event.kind==='bumper'){
  noiseBurst(.038,.025+strength*.04,2300,pan);
  sound(165+strength*75,.095,'sine',.045+strength*.055,pan);
  sound(720+strength*260,.042,'square',.012+strength*.018,pan);return;
 }
 if(event.kind==='sling'){
  noiseBurst(.052,.028+strength*.045,1700,pan);
  sound(235+strength*90,.07,'triangle',.04+strength*.045,pan);return;
 }
 if(event.kind==='flipper'){
  noiseBurst(.028,.018+strength*.025,1150,pan);
  sound(105+strength*55,.055,'sine',.035+strength*.04,pan);
  if(event.grip>.55)sound(610+event.grip*170,.038,'triangle',.018+event.grip*.014,pan);
  return;
 }
 if(event.kind==='target'){
  noiseBurst(.032,.02+strength*.025,2850,pan);
  sound(510+strength*180,.045,'square',.018+strength*.02,pan);return;
 }
 const post=event.kind==='post';
 noiseBurst(post ? .034 : .026,.014+strength*.026,post?3200:2450,pan);
 sound(post?430+strength*190:260+strength*120,post ? .05 : .038,'triangle',.012+strength*.024,pan);
}
function mechanicalCoil(active,side){
 const pan=side==='left'?-.55:.55;
 noiseBurst(active ? .036 : .024,active ? .033 : .018,active?850:1250,pan);
 sound(active?92:128,active ? .06 : .035,'square',active ? .045 : .022,pan);
}
function routeHardware(kind,exit=false){
 const pan=kind==='orbit'?-.52:kind==='ramp' ? .52 : 0;
 noiseBurst(exit ? .05 : .075,exit ? .025 : .035,exit?1850:1250,pan);
 sound(exit?390:285,exit ? .06 : .11,'triangle',exit ? .022 : .035,pan);
}
function plungerHardware(power=.5){
 noiseBurst(.065,.035+.025*power,720,.68);
 sound(105+power*55,.12,'sine',.055+.03*power,.68);
}
function processEvents(){
 for(const e of engine.consumeEvents()){
  // The records are calculated from the pre-award best, not from a
  // stale UI state after the end-of-game persistence update.
  const dmdEvent=e.type==='gameover'?{...e,record:e.score>best}:e;
  dmd.notify(dmdEvent,performance.now(),engine);
  if(['shot','mission','missionarmed','missionstart','missionprogress','missionfailed','commandcomplete','promotion','extra','scoop','spinner','frenzy','multiplier',
      'skillshot','combo','hurryup','jackpot','overdrive','superSpinner','ballsave',
      'balllock','multiballstart','multiballjackpot','superlit','superjackpot','multiballadd','wizardstart','wizardcomplete'].includes(e.type)){
   const duration=e.type==='jackpot'||e.type==='extra'?1250:
    e.type==='hurryup'||e.type==='overdrive'||e.type==='skillshot'?950:
    e.type==='mission'?900:550;
   tableFlash={kind:e.type,until:performance.now()+duration,duration};
  }
  if(e.type==='start'){ui.overlay.hidden=true;ui.scoreFlash.textContent='BALL 1 READY';sound(490,.10);}
  if(e.type==='ball'){
   ui.overlay.hidden=true;ui.scoreFlash.textContent='BALL '+e.ball+' READY';
   if(e.ball>1)sound(480,.12);
  }
  if(e.type==='launch'){ui.scoreFlash.textContent='BALL LAUNCHED';arcadeMessage('SKILL SHOTS LIVE');plungerHardware(e.power);sound(360,.15,'sawtooth',.03,.55);}
  if(e.type==='shot'){
   const names={ramp:'RAMP SHOT',orbit:'LEFT ORBIT',
     center:'CENTER CROSSOVER',skyline:'SKYLINE LOOP'};
   const label=names[e.kind]||'SHOT';
   arcadeMessage(label+'! +'+fmt(e.points));
   ui.scoreFlash.textContent=label;
   routeHardware(e.kind);sound(e.kind==='center'?900:e.kind==='skyline'?1020:760,.16,'triangle',.032,e.kind==='orbit'?-.45:e.kind==='ramp'?.45:0);
  }
  if(e.type==='routeexit')routeHardware(e.kind,true);
  if(e.type==='spinner'){
   arcadeMessage('SPINNER! · '+e.turns+' TURNS');
   ui.scoreFlash.textContent='SPINNER +1,250';
   sound(980,.11,'sawtooth');
  }
  if(e.type==='scoop'){
   arcadeMessage('NEON SCOOP! · +8,000');
   ui.scoreFlash.textContent='SCOOP CAPTURED';
   sound(570,.18);
  }
  if(e.type==='scoopRelease'){
   arcadeMessage('SCOOP EJECT · KEEP IT ALIVE');
   sound(820,.13);
  }
  if(e.type==='skillshot'){
   arcadeMessage('SKILL SHOT! +'+fmt(e.points));ui.scoreFlash.textContent='SKILL SHOT';
   sound(1120,.19,'sawtooth');
  }
  if(e.type==='combo'){
   arcadeMessage('NEON COMBO X'+e.count+' · +'+fmt(e.points));
   ui.scoreFlash.textContent='COMBO X'+e.count;
   sound(780+e.count*75,.17,'square');
  }
  if(e.type==='power'){
   if(e.charges<e.needed && !engine.hurryUpUntil)
    ui.scoreFlash.textContent='POWER GRID '+e.charges+'/'+e.needed;
  }
  if(e.type==='hurryup'){
   arcadeMessage('JACKPOT LIT! · HIT THE SCOOP');
   ui.scoreFlash.textContent='NEON RUSH ACTIVE';
   sound(1100,.25,'sawtooth');
  }
  if(e.type==='jackpot'){
   arcadeMessage('NEON RUSH JACKPOT! +'+fmt(e.points));
   ui.scoreFlash.textContent='JACKPOT +'+fmt(e.points);
   sound(1300,.36,'square');
  }
  if(e.type==='hurryMiss')arcadeMessage('JACKPOT EXPIRED · RECHARGE');
  if(e.type==='overdrive'){
   arcadeMessage('SPINNER OVERDRIVE · 14 SECONDS');
   sound(1150,.27,'sawtooth');
  }
  if(e.type==='superSpinner'){
   ui.scoreFlash.textContent='SUPER SPINNER +'+fmt(e.points);
   sound(1080,.12,'triangle');
  }
  if(e.type==='mission'){arcadeMessage(e.headline);ui.scoreFlash.textContent='MISSION COMPLETE';sound(980,.22);}
  if(e.type==='missionarmed'){
   arcadeMessage(e.name+' SELECTED · SHOOT RAMP');ui.scoreFlash.textContent='MISSION READY';sound(840,.2,'square');
  }
  if(e.type==='missionstart'){
   arcadeMessage(e.name+' · '+e.instruction);ui.scoreFlash.textContent='MISSION START · '+e.fuel+'s';sound(1050,.28,'sawtooth');
  }
  if(e.type==='missionprogress'){
   arcadeMessage('MISSION '+e.step+'/'+e.total+' · '+e.instruction);ui.scoreFlash.textContent=e.instruction;sound(940,.16,'square');
  }
  if(e.type==='missionfailed'){
   arcadeMessage('MISSION FAILED · '+e.reason);ui.scoreFlash.textContent='MISSION FAILED';sound(210,.32,'sawtooth');
  }
  if(e.type==='commandcomplete'){
   arcadeMessage(e.name+' COMPLETE · +'+fmt(e.points));ui.scoreFlash.textContent='FLIGHT MISSION COMPLETE';sound(1320,.34,'square');
  }
  if(e.type==='promotion'){
   arcadeMessage('RANK PROMOTION · '+e.rank);
   ui.scoreFlash.textContent=e.rank+' +'+fmt(e.points);
   sound(1260,.34,'square');
  }
  if(e.type==='award'&&!['SKILL SHOT','NEON COMBO','NEON RUSH JACKPOT','OVERDRIVE SPINNER'].includes(e.label)){
   ui.scoreFlash.textContent=e.label+' · +'+fmt(e.score);
  }
  if(e.type==='impact')mechanicalImpact(e);
  if(e.type==='balllock'){ui.scoreFlash.textContent='BALL '+e.locked+' LOCKED';sound(930,.25,'square');}
  if(e.type==='multiballstart'){ui.scoreFlash.textContent='NEON OVERLOAD';sound(1150,.46,'sawtooth');}
  if(e.type==='multiballjackpot'){ui.scoreFlash.textContent='MULTIBALL JACKPOT +'+fmt(e.points);sound(1320,.29,'square');}
  if(e.type==='superjackpot'){ui.scoreFlash.textContent='SUPER JACKPOT +'+fmt(e.points);sound(1490,.50,'square');}
  if(e.type==='multiballadd'){ui.scoreFlash.textContent='ADD-A-BALL';sound(1030,.28,'triangle');}
  if(e.type==='wizardstart'||e.type==='wizardcomplete'){ui.scoreFlash.textContent=e.type==='wizardstart'?'NEON COMMAND':'COMMAND CLEAR';sound(1180,.39,'square');}
  if(e.type==='nudge'){noiseBurst(.055,.035,480,0);sound(115,.07,'sine',.05);}
   if(e.type==='tilt'){
    ui.scoreFlash.textContent='TILT · BONUS LOST';
    ui.left.classList.remove('active');ui.right.classList.remove('active');
    arcadeMessage('TILT · FLIPPERS DISABLED');sound(220,.34,'sawtooth');
   }
   if(e.type==='ballsave'){ui.overlay.hidden=true;arcadeMessage('BALL SAVED! LAUNCH AGAIN');sound(720,.18);}
  if(e.type==='extra'){arcadeMessage('EXTRA BALL UNLOCKED!');sound(1060,.22);}
  if(e.type==='multiplier'){arcadeMessage('2× MULTIPLIER · 20 SECONDS');}
  if(e.type==='frenzy'){arcadeMessage('BUMPER FRENZY · 15 SECONDS');}

  if(e.type==='hit'){
   ui.scoreFlash.textContent='+'+fmt(e.score);
   if(e.target.startsWith('bumper')){
    bumperFlash={index:Number(e.target.slice(-1)),until:performance.now()+210};
   }
   if(e.target.startsWith('lane'))sound(560,.045,'triangle',.022,0);
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
const flipperAudioState={left:false,right:false};
function setHold(side,held){
  const active=Boolean(held)&&!engine.tilted;
  if(flipperAudioState[side]!==active){
   flipperAudioState[side]=active;
   if(engine.state==='playing')mechanicalCoil(active,side);
  }
  engine.setFlipper(side,active);
  (side==='left'?ui.left:ui.right).classList.toggle('active',active);
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
 const leftFlipperKeys=new Set(['ArrowLeft','KeyA','KeyZ']);
 const rightFlipperKeys=new Set(['ArrowRight','KeyD','Slash']);
 const nudgeKeys={KeyX:'left',Period:'right',ArrowUp:'up'};
 const pressedKeys=new Set();
 document.addEventListener('keydown',e=>{
  if(isInput(e.target))return;
  const k=e.code;
  if(leftFlipperKeys.has(k)||rightFlipperKeys.has(k)||nudgeKeys[k]||
     ['Space','ArrowDown','Enter'].includes(k))e.preventDefault();
  if(leftFlipperKeys.has(k)){pressedKeys.add(k);setHold('left',true);}
  if(rightFlipperKeys.has(k)){pressedKeys.add(k);setHold('right',true);}
  if(nudgeKeys[k]&&!e.repeat)engine.nudge(nudgeKeys[k]);
  if((k==='Space'||k==='ArrowDown')&&!e.repeat){engine.holdLaunch(true);ui.launch.classList.add('pressed');}
  if(k==='Enter'&&!e.repeat&&(engine.state==='ready'||engine.state==='gameover'))startGame();
 });
 document.addEventListener('keyup',e=>{
  const k=e.code;
  pressedKeys.delete(k);
  if(leftFlipperKeys.has(k))setHold('left',[...leftFlipperKeys].some(code=>pressedKeys.has(code)));
  if(rightFlipperKeys.has(k))setHold('right',[...rightFlipperKeys].some(code=>pressedKeys.has(code)));
  if(k==='Space'||k==='ArrowDown'){
   engine.holdLaunch(false);ui.launch.classList.remove('pressed');
  }
 });
// Pointer controls work directly on the lower playfield, including two simultaneous touches.
ui.canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 const rect=ui.canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;
 if(engine.state!=='playing')return;
  if(y<.49){
   // Touch nudge without making the Fold/table-focus controls taller.
   if(e.pointerType!=='mouse'){e.preventDefault();engine.nudge('up');}
   return;
  }
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
 touchPointers.clear();pressedKeys.clear();ui.left.classList.remove('active');ui.right.classList.remove('active');
 ui.launch.classList.remove('pressed');
 flipperAudioState.left=false;flipperAudioState.right=false;
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
function drawBoard(){renderTable(ctx,engine,{reducedMotion,bumperFlash});}
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
  engine.advance(dt);processEvents();syncHUD();dmd.update(engine,now);
  if(prefer3d&&view3d){
   try{
    view3d.update(engine,{bumperFlash,tableFlash,reducedMotion});
    if(!webglValidated){
     if(view3d.isFrameVisible?.()){
      webglValidated=true;
      updateRenderUI();
     }else if(++webglBlankFrames>=5){
      console.warn('Neon Tilt 3D produced no visible playfield; keeping the playable 2D table.');
      prefer3d=false;threeFailed=true;webglValidated=false;
      view3d.dispose();view3d=null;updateRenderUI();
     }
     // The 2D table stays visibly painted until a real 3D frame passes
     // the visibility check; a failed WebGL init never creates a black game.
     resize();drawBoard();drawParticles(dt);
    }
   }catch(error){
    console.warn('3D rendering stopped; restoring playable 2D table.',error);
    prefer3d=false;threeFailed=true;webglValidated=false;
    try{view3d?.dispose()}catch{}
    view3d=null;updateRenderUI();
    resize();drawBoard();drawParticles(dt);
   }
  }else{resize();drawBoard();drawParticles(dt);}
 }
 requestAnimationFrame(loop);
}
resize();renderLeaderboard();syncHUD();requestAnimationFrame(loop);
