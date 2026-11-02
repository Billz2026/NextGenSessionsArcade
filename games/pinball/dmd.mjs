// NEON TILT — original amber dot-matrix display (DMD).
// Draws a physical-style 80 × 22 LED matrix; gameplay continues without it.
export const DMD_COLS=80, DMD_ROWS=22;
const FMT=n=>Math.max(0,Math.floor(n)).toLocaleString('en-GB');
const EVENT_TEXT={
 start:['PLAYER ONE','THREE BALLS'],
 launch:['SKILL SHOT','GOOD LUCK'],
 ball:['BALL READY','CHARGE THE PLUNGER'],
 drain:['BALL DRAINED','NEXT BALL'],
 ballsave:['BALL SAVED','SHOOT AGAIN'],
 gameover:['GAME OVER','THANKS FOR PLAYING'],
 extra:['EXTRA BALL','UNLOCKED'],
 frenzy:['BUMPER FRENZY','2X BUMPERS'],
 multiplier:['NEON LANES','2X SCORING'],
 scoop:['NEON SCOOP','8,000 POINTS'],
 spinner:['SPINNER','KEEP IT SPINNING'],
 mission:['MISSION','COMPLETE'],
 shot:['RAMP / ORBIT','NICE SHOT'],
 award:['BONUS','KEEP GOING']
};
export function createDotMatrix(canvas,{reducedMotion=false}={}){
 if(!canvas?.getContext)return {notify(){},update(){},dispose(){}};
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)return {notify(){},update(){},dispose(){}};
 canvas.width=560;canvas.height=162;
 const cols=DMD_COLS,rows=DMD_ROWS;
 const pitch=7,ox=3.5,oy=4.5;
 const paper=document.createElement('canvas');paper.width=cols;paper.height=rows;
 const p=paper.getContext('2d',{willReadFrequently:true});
 let active=null,lastFrame=-Infinity,disposed=false;
 const defaultText=(game)=>{
  if(game.state==='ready')return ['NEON TILT','PRESS START'];
  if(game.state==='gameover')return ['GAME OVER',FMT(game.score)];
  if(game.state==='between')return ['BALL DRAINED','NEXT BALL'];
  if(game.ball?.mode==='shooter')return ['BALL '+game.ballNumber+' READY','HOLD TO LAUNCH'];
  if(game.time<game.frenzyUntil)return ['BUMPER FRENZY','2X POINTS'];
  if(game.time<game.multiplierUntil)return ['NEON LANES','2X POINTS'];
  if(game.lastShot&&game.time-game.lastShot.at<3)return ['COMBO SHOT','SCORE '+FMT(game.score)];
  return ['SCORE '+FMT(game.score),'BALL '+game.ballNumber+' / 3'];
 };
 function notify(event,now=performance.now()){
  if(disposed||!event)return;
  const lines=EVENT_TEXT[event.type];
  if(!lines)return;
  const priority=event.type==='gameover'||event.type==='extra'?4:
   event.type==='mission'||event.type==='frenzy'?3:
   event.type==='shot'||event.type==='scoop'?2:1;
  if(active?.until>now && active.priority>priority)return;
  let headline=lines[0],sub=lines[1];
  if(event.type==='mission'&&event.headline){
   const full=String(event.headline).toUpperCase();
   headline=full.includes('TARGET')?'TARGET BANK':
    full.includes('NIGHT')?'NIGHT RIDE':
    full.includes('LANE')?'NEON LANES':
    full.includes('FRENZY')?'BUMPER FRENZY':'MISSION';
   sub='COMPLETE!';
  }
  if(event.type==='shot')headline=event.kind==='ramp'?'RAMP SHOT':'ORBIT SHOT';
  if(event.type==='spinner')sub=String(event.turns)+' TURNS';
  if(event.type==='award'&&event.score)sub='+'+FMT(event.score);
  if(event.type==='gameover')sub='SCORE '+FMT(event.score);
  if(event.type==='ball')headline='BALL '+event.ball+' READY';
  active={headline,sub,priority,started:now,until:now+(priority>=3?2850:1800)};
  lastFrame=-Infinity;
 }
 function draw(game,now){
  if(disposed||now-lastFrame<70)return;
  lastFrame=now;
  const mode=active?.until>now?[active.headline,active.sub]:defaultText(game);
  // Render the type onto a low-resolution bitmap, then display LED dots only
  // where there are lit pixels. No dependence on an external font or image.
  p.fillStyle='#000';p.fillRect(0,0,cols,rows);
  p.textBaseline='middle';p.textAlign='center';
  p.fillStyle='#fff';
  // Enlarged two-line type. Long messages get a deliberate width limit
  // rather than unreadable font-size reductions across the whole display.
  p.font='900 11px monospace';
  p.fillText(String(mode[0]).toUpperCase(),cols/2,6.8,76);
  p.font='900 9px monospace';
  p.fillText(String(mode[1]).toUpperCase(),cols/2,17.2,77);
  const pixels=p.getImageData(0,0,cols,rows).data;
  ctx.fillStyle='#080505';ctx.fillRect(0,0,560,162);
  // DMD glass tint + physical grid of inactive lamps.
  for(let row=0;row<rows;row++){
   for(let col=0;col<cols;col++){
    const i=(row*cols+col)*4;
    const reveal=(!reducedMotion&&active?.until>now)?
      Math.min(cols,Math.floor(((now-active.started)/340)*cols)):cols;
    const lit=pixels[i]>85&&col<reveal;
    const x=ox+col*pitch,y=oy+row*pitch;
    ctx.beginPath();ctx.arc(x,y,2.55,0,Math.PI*2);
    if(lit){
     const flicker=reducedMotion?1:.92+.08*Math.sin(now*.009+col*.23);
     ctx.fillStyle=flicker>.95?'#ffe7a8':'#ffaa50';
    }else ctx.fillStyle='#2d160e';
    ctx.fill();
   }
  }
  // Keep each dot sharp. Blurring the canvas over itself made letters illegible
  // at normal desktop zoom, especially when scaled into a narrow score panel.
  // The CSS bezel provides the glow without touching the lit pixels.
  ctx.strokeStyle='#be7847';ctx.lineWidth=2;ctx.strokeRect(1,1,558,160);
 }
 return {notify,update:draw,dispose(){disposed=true}};
}
