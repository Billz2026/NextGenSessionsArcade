import {renderLedLine} from './dmd-lettering.mjs?v=2';
// NEON TILT — readable high-resolution DMD with a subdued 80 × 22 LED backing grid.
// No external sprites or timers: transitions depend on the frame clock and
// deterministic engine events. Reduced motion uses static, legible messages.
export const DMD_COLS=80,DMD_ROWS=22;
const FMT=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('en-GB');
export const ATTRACT_MESSAGES=Object.freeze([
 Object.freeze(['PLAYER ONE READY','THREE BALL CHALLENGE']),
 Object.freeze(['NEON TILT','HIGH SCORE RUN']),
 Object.freeze(['FLIPPERS READY','A / D OR ARROWS'])
]);
const ATTRACT_MS=3800,STATUS_MS=4000;
function bonus(value,game){
 const multiplier=game?.time<game?.multiplierUntil?2:1;
 return '+'+FMT((Number(value)||0)*multiplier);
}
// Live machine status derives only from the real game simulation.
// The screen never claims a bonus, lock, multiball or danger sensor that
// the physics engine has not produced.
export function getDmdStatus(game,now=0){
 const state=game?.state||'ready';
 if(state==='ready')return ATTRACT_MESSAGES[Math.floor(Math.max(0,now)/ATTRACT_MS)%ATTRACT_MESSAGES.length];
 if(state==='gameover')return ['GAME OVER','FINAL SCORE '+FMT(game.score)];
 if(state==='between')return ['BALL '+(game.ballNumber||1)+' OVER','SCORE '+FMT(game.score)];
 const ball=game.ballNumber||1;
 if(game.ball?.mode==='shooter')return ['BALL '+ball+' READY','HOLD TO LAUNCH'];
 if(game.ball?.mode==='scoop')return ['SCOOP CAPTURED','WAIT FOR EJECT'];
 if(game.tilted)return ['TILT','FLIPPERS OFF · NO BONUS'];
 if(game.multiballActive)return ['NEON OVERLOAD · '+(game.balls?.length||1)+' BALLS',
  game.multiballSuperLit?'SUPER JACKPOT · HIT SCOOP':'JACKPOTS · RAMP + ORBIT'];
 if(game.neonCommandActive)return ['NEON COMMAND',
  ['RAMP','ORBIT','CROSSOVER','SKYLINE','SCOOP'][game.neonCommandStep]+' · '+Math.ceil(game.neonCommandRemaining)+'S'];
 if(game.activeCommand)
  return [String(game.commandMission?.name||'FLIGHT MISSION'),String(game.commandInstruction||'COMPLETE MISSION')+' · '+Math.ceil(game.commandFuelRemaining||0)+'S'];
 if(game.commandMissionReady)return ['MISSION READY','SHOOT RAMP TO LAUNCH'];
 if(game.neonCommandReady)return ['NEON COMMAND READY','HIT SCOOP TO BEGIN'];
 if(game.lockLit)return ['BALL LOCK LIT','SHOOT SCOOP · '+(game.ballLocks||0)+'/2 HELD'];
 if(game.ballLocks>0)return ['BALLS HELD '+game.ballLocks+'/2','COMPLETE TARGET BANK'];
 if(game.hurryUpUntil>game.time)
  return ['JACKPOT LIT','SCOOP · '+Math.ceil(game.hurryUpUntil-game.time)+' SEC'];
 if(game.overdriveUntil>game.time)
  return ['OVERDRIVE · '+Math.ceil(game.overdriveUntil-game.time)+'S','HIT THE SPINNER'];
 if(game.time<game.frenzyUntil)
  return ['BUMPER FRENZY','2X BUMPERS · '+Math.ceil(game.frenzyUntil-game.time)+'S'];
 if(game.time<game.multiplierUntil)
  return ['2X SCORING',Math.ceil(game.multiplierUntil-game.time)+' SECONDS LEFT'];
 const targets=game.targets?.size||0,lanes=game.lanes?.size||0;
 const grid=game.powerCharges||0,spins=game.spinnerTurns||0;
 const frame=Math.floor(Math.max(0,now)/STATUS_MS)%5;
 const save=game.state==='playing'&&game.ball?.mode==='live'&&!game.ballSaveUsed&&
  Number.isFinite(game.ballSaveUntil)&&game.ballSaveUntil>game.time;
 const status=[
  ['SCORE '+FMT(game.score),'BALL '+ball+' / 3'],
  save?['BALL SAVE',Math.ceil(game.ballSaveUntil-game.time)+' SECONDS LEFT']:
   ['POWER GRID '+grid+'/3',grid===2?'ONE MORE SHOT':'HIT RAMP OR ORBIT'],
  ['TARGET BANK '+targets+'/4','NEON LANES '+lanes+'/3'],
  ['SPINNER '+(spins%5)+'/5',spins>0?'BUILD OVERDRIVE':'HIT THE SPINNER'],
  ['FLIGHT RANK',''+(game.rankName||'CADET')+' · '+Math.min(4,game.commandFlags||0)+'/4 FLAGS']
 ];
 return status[frame];
}
// Priority 5: terminal and major awards; 4: modes and missions;
// 3: skillful shots/combos; 2: progress; 1: minor targets; 0: bumpers.
export function describeDmdEvent(event,game=null){
 if(!event)return null;
 switch(event.type){
  case 'start':return {headline:'PLAYER ONE READY',sub:'BALL 1 OF 3',priority:3,duration:1100};
  case 'nudge':return {headline:'TABLE NUDGE',sub:'WATCH THE TILT!',priority:1,duration:700};
  case 'tiltwarning':return {headline:'TILT WARNING!',sub:'EASE OFF THE NUDGE',priority:4,duration:1700};
  case 'deckenter':return {headline:'LAUNCH PLATFORM',sub:'ENGINE BUMPERS ACTIVE',priority:4,duration:1800};
  case 'decklane':return {headline:'LAUNCH LANE '+event.count+'/3',sub:'ENGINE LIGHTS',priority:2,duration:1050};
  case 'deckupgrade':return {headline:'ENGINE BUMPERS UP!',sub:'LEVEL '+event.level,priority:5,duration:2600};
  case 'deckexit':return {headline:'BONUS RETURN',sub:'LEFT FLIPPER FEED',priority:2,duration:1200};
  case 'warplit':return {headline:'SPACE WARP ARMED',sub:'HIT A COLOURED HOLE',priority:4,duration:2300};
  case 'wormhole':return event.opened?
   {headline:'SPACE WARP!',sub:String(event.source).toUpperCase()+' TO '+String(event.destination).toUpperCase()+' · +'+FMT(event.points),priority:5,duration:2800}:
   {headline:String(event.source).toUpperCase()+' WORMHOLE',sub:'+'+FMT(event.points),priority:3,duration:1550};
  case 'kickback':return {headline:'NEON KICKBACK!',sub:String(event.side||'SIDE').toUpperCase()+' OUTLANE SAVE',priority:5,duration:2300};
  case 'tilt':return {headline:'TILT!',sub:'BONUS FORFEITED',priority:5,duration:3200};
  case 'ball':return {headline:'BALL '+(event.ball||1)+' READY',sub:'HOLD TO LAUNCH',priority:3,duration:1700};
  case 'launch':return game?.skillShotPending?{headline:'SKILL SHOT LIT',sub:'HIT UPPER LANE',priority:3,duration:1500}:{headline:'BALL IN PLAY',sub:'USE THE FLIPPERS',priority:2,duration:1100};
  case 'shot':return {
   headline:({
    ramp:'RAMP SHOT',orbit:'ORBIT SHOT',
    center:'CROSSOVER!',skyline:'LAUNCH RAMP'
   })[event.kind]||'SHOT COMPLETE',
   sub:bonus(event.points||0,game),
   priority:3,duration:1900
  };
  case 'skillshot':return {headline:'SKILL SHOT!',sub:'+'+FMT(event.points),priority:4,duration:2300};
  case 'combo':return {headline:'COMBO X'+(event.count||2),sub:'+'+FMT(event.points),priority:3,duration:1550};
  case 'power':return {headline:'POWER GRID '+(event.charges||0)+'/'+(event.needed||3),sub:event.charges===event.needed-1?'ONE MORE SHOT':'ROUTE CHARGED',priority:2,duration:1250};
  case 'hurryup':return {headline:'JACKPOT LIT!',sub:'SHOOT THE SCOOP',priority:4,duration:2250};
  case 'jackpot':return {headline:'NEON RUSH JACKPOT',sub:'+'+FMT(event.points),priority:5,duration:3200};
  case 'locklit':return {headline:'BALL LOCK LIT',sub:'HIT THE SCOOP',priority:4,duration:1900};
  case 'balllock':return {headline:'BALL '+event.locked+' LOCKED',sub:event.locked+'/2 · SHOOT TO CONTINUE',priority:5,duration:2800};
  case 'multiballstart':return {headline:'NEON OVERLOAD!',sub:'THREE-BALL MULTIBALL',priority:5,duration:3400};
  case 'multiballjackpot':return {headline:'MULTIBALL JACKPOT!',sub:'+'+FMT(event.points),priority:5,duration:2700};
  case 'superlit':return {headline:'SUPER JACKPOT LIT',sub:'SHOOT THE SCOOP',priority:5,duration:2600};
  case 'superjackpot':return {headline:'SUPER JACKPOT!',sub:'+'+FMT(event.points),priority:5,duration:3600};
  case 'multiballadd':return {headline:'ADD-A-BALL!',sub:'BALLS IN PLAY '+event.count,priority:5,duration:2600};
  case 'multiballsave':return {headline:'MULTIBALL SAVE',sub:event.count+' BALLS ACTIVE',priority:3,duration:1300};
  case 'multiballdrain':return {headline:'MULTIBALL DRAIN',sub:event.remaining+' BALLS LEFT',priority:3,duration:1200};
  case 'multiballend':return {headline:'MULTIBALL ENDED',sub:'CONTINUE YOUR RUN',priority:4,duration:2200};
  case 'wizardready':return {headline:'NEON COMMAND LIT',sub:'HIT SCOOP TO BEGIN',priority:5,duration:3000};
  case 'wizardstart':return {headline:'NEON COMMAND',sub:'HIT RAMP · '+event.fuel+'S',priority:5,duration:2900};
  case 'wizardprogress':return {headline:'COMMAND '+event.step+'/'+event.total,sub:event.instruction,priority:4,duration:1600};
  case 'wizardcomplete':return {headline:'NEON COMMAND CLEAR!',sub:'+'+FMT(event.points),priority:5,duration:3500};
  case 'wizardfailed':return {headline:'COMMAND FAILED',sub:String(event.reason),priority:4,duration:2100};
  case 'hurryMiss':return {headline:'JACKPOT EXPIRED',sub:'RECHARGE GRID',priority:2,duration:1350};
  case 'overdrive':return {headline:'OVERDRIVE!',sub:'HIT THE SPINNER',priority:4,duration:2400};
  case 'superSpinner':return {headline:'SUPER SPINNER',sub:'+'+FMT(event.points),priority:3,duration:1200};
  case 'modeend':return event.mode==='overdrive'?
   {headline:'OVERDRIVE ENDED',sub:'SPIN TO RECHARGE',priority:1,duration:1200}:null;
  case 'spinner':return {
   headline:'SPINNER · '+(event.turns||1),
   sub:bonus(event.points||1250,game),priority:2,duration:1050
  };
  case 'scoop':return {headline:'NEON SCOOP',sub:bonus(8000,game),priority:3,duration:2200};
  case 'scoopRelease':return {headline:'SCOOP EJECT',sub:'KEEP IT ALIVE',priority:2,duration:1050};
  case 'target':return {headline:'TARGET BANK',sub:(event.count||0)+' / 4 LIT',priority:1,duration:1050};
  case 'lane':return {headline:'NEON LANES',sub:(event.count||0)+' / 3 LIT',priority:1,duration:1000};
  case 'mission':{
   const name=event.name||'',full=String(event.headline||'').toUpperCase();
   if(name==='ride'||full.includes('JACKPOT'))return {headline:'NIGHT RIDE',sub:'JACKPOT!',priority:4,duration:2700};
   if(name==='targets'||full.includes('TARGET'))return {headline:'TARGET BANK',sub:'COMPLETE!',priority:4,duration:2450};
   if(name==='frenzy'||full.includes('FRENZY'))return {headline:'BUMPER FRENZY',sub:'MODE UNLOCKED',priority:4,duration:2350};
   if(name==='lanes'||full.includes('LANES'))return {headline:'NEON LANES',sub:'2X SCORING',priority:4,duration:2350};
   return {headline:'MISSION',sub:'COMPLETE!',priority:4,duration:2300};
  }
  case 'missionarmed':return {headline:'MISSION SELECTED',sub:String(event.name||'FLIGHT MISSION'),priority:4,duration:2500};
  case 'missionstart':return {headline:String(event.name||'MISSION START'),sub:String(event.instruction||'GO!')+' · '+(event.fuel||26)+'S',priority:5,duration:2800};
  case 'missionprogress':return {headline:'MISSION '+(event.step||1)+'/'+(event.total||2),sub:String(event.instruction||'KEEP GOING'),priority:4,duration:1700};
  case 'missionfailed':return {headline:'MISSION FAILED',sub:String(event.reason||'FUEL DEPLETED'),priority:5,duration:2600};
  case 'commandcomplete':return {headline:'MISSION COMPLETE!',sub:'+'+FMT(event.points),priority:5,duration:3100};
  case 'promotion':return {headline:'RANK PROMOTION!',sub:String(event.rank||'ENSIGN')+' · +'+FMT(event.points),priority:5,duration:3200};
  case 'frenzy':return {headline:'BUMPER FRENZY',sub:'2X BUMPER POINTS',priority:4,duration:2400};
  case 'multiplier':return {headline:'2X SCORING',sub:'20 SECONDS',priority:4,duration:2400};
  case 'ballsave':return {headline:'BALL SAVED!',sub:'RELAUNCH NOW',priority:4,duration:2200};
  case 'streakshield':return {headline:'NEON SHIELD ARMED',sub:'TWO SHOTS · ONE REPLAY',priority:4,duration:2500};
  case 'streaksave':return {headline:'STREAK SAVED!',sub:'RELAUNCH · KEEP BUILDING',priority:5,duration:2900};
  case 'extra':return {headline:'EXTRA BALL',sub:'AWARDED!',priority:5,duration:3250};
  case 'drain':return {headline:'BALL '+(event.ball||1)+' OVER',sub:'SCORE '+FMT(game?.score||0),priority:3,duration:1800};
  case 'gameover':return event.record?{headline:'NEW HIGH SCORE!',sub:'SCORE '+FMT(event.score),priority:5,duration:3700}:{headline:'GAME OVER',sub:'FINAL '+FMT(event.score),priority:5,duration:3200};
  case 'award':
   return event.label==='END-OF-BALL BONUS'?
    {headline:'END BALL BONUS',sub:'+'+FMT(event.score),priority:2,duration:1100}:null;
  case 'hit':
   return event.target?.startsWith('bumper')?
    {headline:'BUMPER HIT',sub:'+'+FMT(event.score),priority:0,duration:650}:null;
  default:return null;
 }
}
// Bounded event scheduler: important moments pre-empt routine scoring,
// while other worthwhile events are shown afterwards (never dumped in a burst).
// All times use the same requestAnimationFrame clock as game.mjs.
export function createDmdTimeline(){
 const MAX_QUEUE=5,MAX_AGE=5600;
 let active=null,queue=[],lastBumperAt=-Infinity;
 const start=(item,now)=>{active={...item,started:now,until:now+item.duration};};
 function enqueue(info,now){
  if(info.priority<2)return;
  const key=info.eventKey;
  // Collapse repeated sensor reports; retain only the freshest progress.
  const duplicate=queue.findIndex(x=>x.eventKey===key);
  if(duplicate>=0)queue.splice(duplicate,1);
  queue.push({...info,queuedAt:now});
  if(queue.length>MAX_QUEUE){
   let worst=0;
   for(let i=1;i<queue.length;i++){
    if(queue[i].priority<queue[worst].priority)worst=i;
   }
   queue.splice(worst,1);
  }
 }
 function current(now){
  if(active&&active.until>now)return active;
  active=null;
  queue=queue.filter(x=>now-x.queuedAt<MAX_AGE);
  if(queue.length){
   // Higher priority first, then older events at the same priority.
   let next=0;
   for(let i=1;i<queue.length;i++){
    if(queue[i].priority>queue[next].priority)next=i;
   }
   const item=queue.splice(next,1)[0];
   start(item,now);
  }
  return active;
 }
 function notify(event,now,game=null){
  if(!event)return;
  if(['start','ball','gameover'].includes(event.type)){active=null;queue=[];}
  const info=describeDmdEvent(event,game);
  if(!info)return;
  if(info.priority===0){
   if(now-lastBumperAt<1000)return;
   lastBumperAt=now;
  }
  const item={...info,eventKey:event.type+':'+(event.kind||event.name||'')};
  if(active?.until<=now)active=null;
  if(!active){start(item,now);return;}
  // Mission and jackpot callouts must appear immediately; recent meaningful
  // messages can resume later, but never after an entire ball has changed.
  if(info.priority>active.priority && info.priority>=3){
   if(active.priority>=3 && active.until-now>650 &&
      !['drain','gameover','start','ball'].includes(active.eventKey.split(':')[0]))
    enqueue({...active,duration:Math.min(1700,active.until-now)},now);
   start(item,now);
  }else if(info.priority>=2)enqueue(item,now);
  // Bumper impacts never hide real achievements or build an enormous queue.
 }
 return {notify,current,clear(){active=null;queue=[];lastBumperAt=-Infinity}};
}
export const DMD_WIDTH=1120,DMD_HEIGHT=324;
// Original 5x7 red and amber LED cells are now the *only* visible lettering.
// Removing the overlapping solid text layer fixes shadowed/illegible words.
// The queue, timers, scoring and 3D table remain unchanged.
export function createDotMatrix(canvas,{reducedMotion=false}={}){
 const noop={notify(){},update(){},dispose(){}};
 if(!canvas?.getContext)return noop;
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)return noop;
 const width=560,height=162;
 canvas.width=DMD_WIDTH;canvas.height=DMD_HEIGHT;
 ctx.setTransform?.(2,0,0,2,0,0);
 let lastFrame=-Infinity,disposed=false;
 const timeline=createDmdTimeline();
 function notify(event,now=performance.now(),game=null){
  if(disposed)return;
  timeline.notify(event,now,game);
  lastFrame=-Infinity;
 }
 function update(game,now=performance.now()){
  if(disposed||!game||now-lastFrame<65)return;
  lastFrame=now;
  const showing=timeline.current(now);
  const lines=showing?[showing.headline,showing.sub]:getDmdStatus(game,now);
  const elapsed=showing?Math.max(0,now-showing.started):Infinity;
  const celebration=Boolean(showing&&showing.priority>=4);
  const flash=celebration&&!reducedMotion&&elapsed<780&&Math.floor(elapsed/350)%2===0;
  // Dark machine recess and small physical LEDs remain visible at the edges.
  ctx.fillStyle='#070508';
  ctx.fillRect(0,0,width,height);
  for(let row=0;row<DMD_ROWS;row++){
   for(let col=0;col<DMD_COLS;col++){
    const x=3.5+col*7,y=4.5+row*7;
    ctx.fillStyle=flash?'#42202a':'#30141e';
    ctx.fillRect(x,y,1.8,1.8);
   }
  }
  // Opaque lettering bands cover the dot texture behind the glyphs.
  // This matters most when the whole canvas is displayed around 350px wide.
  ctx.fillStyle='#0a060b';
  ctx.fillRect(10,10,540,67);
  ctx.fillRect(10,83,540,69);
  ctx.fillStyle='#792b40';
  ctx.fillRect(13,80,534,1);
  // A short left-to-right reveal preserves arcade feedback, while whole
  // glyphs are crisp and fully visible once the 260ms entrance completes.
  const reveal=showing&&!reducedMotion?Math.min(1,elapsed/260):1;
  ctx.save?.();
  ctx.beginPath?.();
  ctx.rect?.(10,11,540*reveal,141);
  ctx.clip?.();
  renderLedLine(ctx,lines[0],{y:46,headline:true,celebration,flash});
  renderLedLine(ctx,lines[1],{y:116,headline:false,celebration,flash});
  ctx.restore?.();
  ctx.strokeStyle=celebration?(flash?'#ffb39c':'#e45160'):'#b84959';
  ctx.lineWidth=celebration?3:2;
  ctx.strokeRect(2,2,width-4,height-4);
  return lines; // Observable in tests; no effect on the frame loop.
 }
 return {notify,update,dispose(){disposed=true;timeline.clear()}};
}
