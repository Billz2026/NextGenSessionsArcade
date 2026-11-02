// NEON TILT — responsive, event-driven 80 × 22 physical-style DMD.
// No external sprites or timers: transitions depend on the frame clock and
// deterministic engine events. Reduced motion uses static, legible messages.
export const DMD_COLS=80,DMD_ROWS=22;
const FMT=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('en-GB');
export const ATTRACT_MESSAGES=Object.freeze([
 Object.freeze(['PRESS START','PLAYER ONE READY']),
 Object.freeze(['3 BALL ARCADE','CHASE JACKPOTS']),
 Object.freeze(['LIGHT THE TABLE','RAMP + ORBIT']),
 Object.freeze(['HIGH SCORE RUN','OWN THE NIGHT'])
]);
const ATTRACT_MS=3800,STATUS_MS=4500;
function bonus(value,game){
 const multiplier=game?.time<game?.multiplierUntil?2:1;
 return '+'+FMT((Number(value)||0)*multiplier);
}
export function getDmdStatus(game,now=0){
 const state=game?.state||'ready';
 if(state==='ready')return ATTRACT_MESSAGES[Math.floor(Math.max(0,now)/ATTRACT_MS)%ATTRACT_MESSAGES.length];
 if(state==='gameover')return ['GAME OVER','FINAL '+FMT(game.score)];
 if(state==='between')return ['BALL DRAINED','NEXT BALL READY'];
 const ball=game.ballNumber||1;
 if(game.ball?.mode==='shooter')return ['BALL '+ball+' READY','CHARGE PLUNGER'];
 if(game.ball?.mode==='scoop')return ['SCOOP CAPTURED','WAIT FOR EJECT'];
 if(game.hurryUpUntil>game.time)
  return ['NEON RUSH JACKPOT','SCOOP · '+Math.ceil(game.hurryUpUntil-game.time)+' SECONDS'];
 if(game.overdriveUntil>game.time)
  return ['SPINNER OVERDRIVE','SPIN FOR BONUS'];
 if(game.time<game.frenzyUntil)return ['BUMPER FRENZY','2X BUMPER POINTS'];
 if(game.time<game.multiplierUntil)return ['2X SCORING','CHASE JACKPOTS'];
 const targets=game.targets?.size||0,lanes=game.lanes?.size||0;
 const frame=Math.floor(Math.max(0,now)/STATUS_MS)%4;
 return [
  ['SCORE '+FMT(game.score),'BALL '+ball+' / 3'],
  ['TARGET BANK '+targets+'/4','NEON LANES '+lanes+'/3'],
  ['POWER GRID '+(game.powerCharges||0)+'/3','RAMP + ORBIT'],
  ['SPINS '+(game.spinnerTurns||0),'SCOOPS '+(game.scoopHits||0)]
 ][frame];
}
// Priority 5: final/extra-ball moments, 4: modes and missions,
// 3: ball/shot/scoop, 2: spinner, 1: lane/target, 0: occasional bumper.
export function describeDmdEvent(event,game=null){
 if(!event)return null;
 switch(event.type){
  case 'start':return {headline:'PLAYER ONE',sub:'THREE BALLS',priority:3,duration:1200};
  case 'ball':return {headline:'BALL '+(event.ball||1)+' READY',sub:'CHARGE PLUNGER',priority:3,duration:1500};
  case 'launch':return {headline:'BALL IN PLAY',sub:'CHASE JACKPOTS',priority:2,duration:1100};
  case 'shot':return {
   headline:event.kind==='ramp'?'RAMP SHOT':'ORBIT SHOT',
   sub:bonus(event.points||0,game),
   priority:3,duration:1900
  };
  case 'skillshot':return {headline:'SKILL SHOT!',sub:'+'+FMT(event.points),priority:4,duration:2300};
  case 'combo':return {headline:'COMBO X'+(event.count||2),sub:'+'+FMT(event.points),priority:3,duration:1550};
  case 'power':return {headline:'POWER GRID',sub:(event.charges||0)+' / '+(event.needed||3)+' CHARGED',priority:1,duration:900};
  case 'hurryup':return {headline:'JACKPOT LIT!',sub:'HIT THE SCOOP',priority:4,duration:2650};
  case 'jackpot':return {headline:'NEON RUSH!',sub:'+'+FMT(event.points),priority:5,duration:3350};
  case 'hurryMiss':return {headline:'JACKPOT EXPIRED',sub:'RECHARGE GRID',priority:2,duration:1350};
  case 'overdrive':return {headline:'OVERDRIVE!',sub:'SUPER SPINNER',priority:4,duration:2750};
  case 'superSpinner':return {headline:'SUPER SPINNER',sub:'+'+FMT(event.points),priority:3,duration:1200};
  case 'modeend':return event.mode==='overdrive'?
   {headline:'OVERDRIVE ENDED',sub:'SPIN TO RECHARGE',priority:1,duration:1200}:null;
  case 'spinner':return {
   headline:'SPINNER · '+(event.turns||1),
   sub:bonus(1250,game),priority:2,duration:1050
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
  case 'frenzy':return {headline:'BUMPER FRENZY',sub:'2X BUMPER POINTS',priority:4,duration:2400};
  case 'multiplier':return {headline:'2X SCORING',sub:'20 SECONDS',priority:4,duration:2400};
  case 'ballsave':return {headline:'BALL SAVED!',sub:'SHOOT AGAIN',priority:4,duration:2400};
  case 'extra':return {headline:'EXTRA BALL',sub:'AWARDED!',priority:5,duration:3250};
  case 'drain':return {headline:'BALL '+(event.ball||1)+' LOST',sub:'GET READY',priority:3,duration:1500};
  case 'gameover':return {headline:'GAME OVER',sub:'SCORE '+FMT(event.score),priority:5,duration:3300};
  case 'award':
   return event.label==='END-OF-BALL BONUS'?
    {headline:'END BALL BONUS',sub:'+'+FMT(event.score),priority:2,duration:1100}:null;
  case 'hit':
   return event.target?.startsWith('bumper')?
    {headline:'BUMPER HIT',sub:'+'+FMT(event.score),priority:0,duration:650}:null;
  default:return null;
 }
}
export function createDotMatrix(canvas,{reducedMotion=false}={}){
 const noop={notify(){},update(){},dispose(){}};
 if(!canvas?.getContext)return noop;
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)return noop;
 canvas.width=560;canvas.height=162;
 const cols=DMD_COLS,rows=DMD_ROWS,pitch=7,ox=3.5,oy=4.5;
 const paper=document.createElement('canvas');
 paper.width=cols;paper.height=rows;
 const p=paper.getContext('2d',{willReadFrequently:true});
 if(!p)return noop;
 let active=null,lastFrame=-Infinity,disposed=false,lastBumperAt=-Infinity;
 function notify(event,now=performance.now(),game=null){
  if(disposed||!event)return;
  const info=describeDmdEvent(event,game);
  if(!info)return;
  if(event.type==='start')active=null; // New run clears an old GAME OVER banner.
  if(info.priority===0){
   if(now-lastBumperAt<850)return;
   lastBumperAt=now;
  }
  if(active?.until>now){
   if(active.priority>info.priority)return;
   // A stream of equally important ordinary events should not hold the DMD
   // hostage. Higher-priority achievements can always take over immediately.
   if(active.priority===info.priority&&active.priority<3&&now-active.started<420)return;
  }
  active={...info,started:now,until:now+info.duration};
  lastFrame=-Infinity;
 }
 function update(game,now=performance.now()){
  if(disposed||!game||now-lastFrame<65)return;
  lastFrame=now;
  const showing=active?.until>now?active:null;
  const lines=showing?[showing.headline,showing.sub]:getDmdStatus(game,now);
  p.fillStyle='#000';p.fillRect(0,0,cols,rows);
  p.textBaseline='middle';p.textAlign='center';p.fillStyle='#fff';
  p.font='900 11px monospace';
  p.fillText(String(lines[0]).toUpperCase(),cols/2,6.8,76);
  p.font='900 9px monospace';
  p.fillText(String(lines[1]).toUpperCase(),cols/2,17.2,77);
  const pixels=p.getImageData(0,0,cols,rows).data;
  const elapsed=showing?Math.max(0,now-showing.started):Infinity;
  const celebration=Boolean(showing&&showing.priority>=4);
  const flash=celebration&&!reducedMotion&&elapsed<950&&Math.floor(elapsed/180)%2===0;
  const reveal=showing&&!reducedMotion?
   Math.min(cols,Math.floor(elapsed/280*cols)):cols;
  ctx.fillStyle='#080505';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let row=0;row<rows;row++){
   for(let col=0;col<cols;col++){
    const i=(row*cols+col)*4;
    const lit=pixels[i]>85&&col<reveal;
    const x=ox+col*pitch,y=oy+row*pitch;
    ctx.beginPath();ctx.arc(x,y,2.55,0,Math.PI*2);
    if(lit){
     const shimmer=reducedMotion?1:.94+.06*Math.sin(now*.009+col*.23);
     ctx.fillStyle=flash?'#fff5c8':shimmer>.97?'#ffe7a8':'#ffaa50';
    }else ctx.fillStyle=flash?'#47251b':'#29150e';
    ctx.fill();
   }
  }
  ctx.strokeStyle=celebration?(flash?'#ffe2a3':'#d49455'):'#986344';
  ctx.lineWidth=celebration?3:2;
  ctx.strokeRect(1.5,1.5,canvas.width-3,canvas.height-3);
 }
 return {notify,update,dispose(){disposed=true}};
}
