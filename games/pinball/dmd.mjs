// NEON TILT — readable high-resolution DMD with a subdued 80 × 22 LED backing grid.
// No external sprites or timers: transitions depend on the frame clock and
// deterministic engine events. Reduced motion uses static, legible messages.
export const DMD_COLS=80,DMD_ROWS=22;
const FMT=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('en-GB');
export const ATTRACT_MESSAGES=Object.freeze([
 Object.freeze(['PRESS START','PLAYER ONE READY']),
 Object.freeze(['3 BALL ARCADE','CHASE JACKPOTS']),
 Object.freeze(['FOUR BALL ROUTES','CHASE THE JACKPOT']),
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
  ['POWER GRID '+(game.powerCharges||0)+'/3','FOUR ROUTES LIVE'],
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
   headline:({
    ramp:'RAMP SHOT',orbit:'ORBIT SHOT',
    center:'CROSSOVER!',skyline:'SKYLINE LOOP'
   })[event.kind]||'SHOT COMPLETE',
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
export const DMD_WIDTH=1120,DMD_HEIGHT=324;
// Native-resolution lettering instead of the old 80x22 rasterised words:
// LED cells remain as physical background detail, not as the typeface.
export function createDotMatrix(canvas,{reducedMotion=false}={}){
 const noop={notify(){},update(){},dispose(){}};
 if(!canvas?.getContext)return noop;
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)return noop;
 const width=560,height=162;
 canvas.width=DMD_WIDTH;canvas.height=DMD_HEIGHT;
 ctx.setTransform?.(2,0,0,2,0,0);
 const fontFace='"Arial Black","Barlow Condensed",Impact,Arial,sans-serif';
 let active=null,lastFrame=-Infinity,disposed=false,lastBumperAt=-Infinity;
 function notify(event,now=performance.now(),game=null){
  if(disposed||!event)return;
  const info=describeDmdEvent(event,game);
  if(!info)return;
  if(event.type==='start')active=null;
  if(info.priority===0){
   if(now-lastBumperAt<850)return;
   lastBumperAt=now;
  }
  if(active?.until>now){
   if(active.priority>info.priority)return;
   if(active.priority===info.priority&&active.priority<3&&now-active.started<420)return;
  }
  active={...info,started:now,until:now+info.duration};
  lastFrame=-Infinity;
 }
 function fitFont(value,preferred,minimum,maxWidth){
  let size=preferred;
  for(;size>minimum;size-=1){
   ctx.font='900 '+size+'px '+fontFace;
   const measured=ctx.measureText?ctx.measureText(value).width:value.length*size*.68;
   if(measured<=maxWidth)break;
  }
  ctx.font='900 '+size+'px '+fontFace;
  return size;
 }
 function printLine(value,y,preferred,min,color){
  const str=String(value??'').toUpperCase();
  fitFont(str,preferred,min,512);
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.lineJoin='round';
  // Raised, solid LED-style amber typography with a hard edge—not a
  // low-resolution sampled bitmap or a blurry glow filter.
  ctx.shadowBlur=0;
  ctx.lineWidth=2.3;
  ctx.strokeStyle='#261208';
  ctx.strokeText(str,width/2,y,515);
  ctx.fillStyle=color;
  ctx.fillText(str,width/2,y,515);
 }
 function update(game,now=performance.now()){
  if(disposed||!game||now-lastFrame<65)return;
  lastFrame=now;
  const showing=active?.until>now?active:null;
  const lines=showing?[showing.headline,showing.sub]:getDmdStatus(game,now);
  const elapsed=showing?Math.max(0,now-showing.started):Infinity;
  const celebration=Boolean(showing&&showing.priority>=4);
  const flash=celebration&&!reducedMotion&&elapsed<950&&Math.floor(elapsed/180)%2===0;
  // Dark machine recess and small physical LEDs remain visible at the edges.
  ctx.fillStyle='#070505';
  ctx.fillRect(0,0,width,height);
  for(let row=0;row<DMD_ROWS;row++){
   for(let col=0;col<DMD_COLS;col++){
    const x=3.5+col*7,y=4.5+row*7;
    ctx.fillStyle=flash?'#382015':'#29160d';
    ctx.fillRect(x,y,1.8,1.8);
   }
  }
  // Opaque lettering bands cover the dot texture behind the glyphs.
  // This matters most when the whole canvas is displayed around 350px wide.
  ctx.fillStyle='#0a0707';
  ctx.fillRect(10,10,540,67);
  ctx.fillRect(10,83,540,69);
  ctx.fillStyle='#6e4228';
  ctx.fillRect(13,80,534,1);
  // A short left-to-right reveal preserves arcade feedback, while whole
  // glyphs are crisp and fully visible once the 260ms entrance completes.
  const reveal=showing&&!reducedMotion?Math.min(1,elapsed/260):1;
  ctx.save?.();
  ctx.beginPath?.();
  ctx.rect?.(10,11,540*reveal,141);
  ctx.clip?.();
  printLine(lines[0],46,51,34,flash?'#fff4d3':'#ffe7b7');
  printLine(lines[1],116,35,26,flash?'#ffe8ba':'#ffbd7b');
  ctx.restore?.();
  ctx.strokeStyle=celebration?(flash?'#ffe2a3':'#cf9258'):'#a16b46';
  ctx.lineWidth=celebration?3:2;
  ctx.strokeRect(2,2,width-4,height-4);
 }
 return {notify,update,dispose(){disposed=true}};
}
