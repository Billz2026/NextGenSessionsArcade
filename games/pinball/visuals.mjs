// NEON TILT · Cabinet artwork, Version 3
// An original layered pseudo-3D pinball playfield. All mechanical object positions
// come from the actual physics engine; moving a collider must move its art.
import {BOARD,WALLS,BUMPERS,POSTS,SLINGS,LANES,TARGETS,SHOTS,SPINNER,SCOOP} from './engine.mjs?v=6';
const TAU=Math.PI*2;
const G=(ctx,x,y,x2,y2,stops)=>{const gr=ctx.createLinearGradient(x,y,x2,y2);for(const [p,c] of stops)gr.addColorStop(p,c);return gr;};
const R=(ctx,x,y,r,stops)=>{const gr=ctx.createRadialGradient(x-r*.37,y-r*.43,1,x,y,r);for(const [p,c] of stops)gr.addColorStop(p,c);return gr;};
function rect(c,x,y,w,h,r,fill,stroke=null,line=1){
 c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}
}
function disk(c,x,y,r,fill,stroke=null,lw=1){
 c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
}
function line(c,coords,color,width=1){
 c.beginPath();c.moveTo(...coords[0]);for(let i=1;i<coords.length;i++)c.lineTo(...coords[i]);
 c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();
}
function text(c,label,x,y,size,color='#ffe6ba',font='Oxanium',weight=800){
 c.fillStyle=color;c.font=weight+' '+size+'px "'+font+'",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(label,x,y);
}
function bolt(c,x,y,r=4){
 c.save();c.shadowBlur=4;c.shadowColor='#000';
 disk(c,x+1,y+1,r+1,'#120e16');
 disk(c,x,y,r,R(c,x,y,r,[[0,'#f7e6c0'],[.43,'#b4b2ad'],[.87,'#5b5e66'],[1,'#e3d3bd']]),'#2c2633',1);
 line(c,[[x-r*.52,y+r*.37],[x+r*.52,y-r*.37]],'#38353b',1);
 c.restore();
}
function chromeRail(c,pts,w=7,tint='#e2bbc3'){
 c.save();c.shadowColor='rgba(0,0,0,.78)';c.shadowBlur=6;c.shadowOffsetY=5;
 line(c,pts,'#181924',w+12);c.restore();
 line(c,pts,'#41414b',w+6);line(c,pts,G(c,pts[0][0],pts[0][1],pts.at(-1)[0],pts.at(-1)[1],[[0,'#9998a5'],[.4,tint],[1,'#584c54']]),w+2);
 line(c,pts,'rgba(255,252,222,.86)',Math.max(1,w*.25));
}
function neonInsert(c,x,y,label,lit=false,color='#f7ca7a'){
 c.save();c.shadowBlur=lit?18:2;c.shadowColor=color;
 rect(c,x-17,y-10,34,23,5,'#171821','#5b5554',1.7);
 rect(c,x-13,y-7,26,16,4,lit?color:'#563e45',lit?'#fff5d6':'#a46d64',1);
 c.restore();text(c,label,x,y+1,10,lit?'#201316':'#e6b6a7','Oxanium',900);
}
function plastic(c,path,color,glow){
 c.save();c.shadowColor='rgba(0,0,0,.6)';c.shadowBlur=10;c.shadowOffsetY=7;
 c.beginPath();path(c);c.fillStyle='#08090f';c.fill();c.restore();
 c.beginPath();path(c);c.fillStyle=color;c.fill();c.lineWidth=2;c.strokeStyle=glow;c.stroke();
}
function drawBase(c,anim){
 const bg=G(c,0,0,420,700,[[0,'#172238'],[.28,'#151d33'],[.64,'#17192e'],[1,'#1c1829']]);
 c.fillStyle=bg;c.fillRect(0,0,BOARD.width,BOARD.height);
 // Worn enamel / star-fleck artwork with stable deterministic placements.
 const rand=seed=>{const n=Math.sin(seed*127.1+67.45)*43758.5453;return n-Math.floor(n)};
 c.fillStyle='rgba(246,226,204,.17)';
 for(let i=0;i<110;i++){const x=18+rand(i+1)*372,y=37+rand(i+419)*590;if(x>362&&y>150)continue;disk(c,x,y,(i%4===0?1.05:.45),i%3===0?'rgba(255,195,118,.28)':'rgba(190,208,255,.23)');}
 // Atmospheric sweeps are part of the enamel printing, not arbitrary UI decor.
 c.save();c.globalAlpha=.16;
 for(let i=0;i<12;i++){const y=160+i*37;line(c,[[61,y],[211,y-25],[329,y]],i%2?'#c44d72':'#b9968a',.8);}
 c.restore();
 // Long fluted body side walls in perspective: thick edging, polished rails.
 const left=G(c,12,30,33,600,[[0,'#f6d29a'],[.16,'#765d5b'],[.65,'#4b454f'],[1,'#dfb287']]);
 const right=G(c,387,30,406,650,[[0,'#e8b987'],[.2,'#62505b'],[.75,'#383847'],[1,'#d2a077']]);
 plastic(c,x=>{x.moveTo(1,8);x.lineTo(30,28);x.lineTo(29,622);x.lineTo(12,695);x.lineTo(1,695);x.closePath()},left,'#dbb179');
 plastic(c,x=>{x.moveTo(418,8);x.lineTo(392,26);x.lineTo(391,633);x.lineTo(408,697);x.lineTo(419,697);x.closePath()},right,'#b59479');
 line(c,[[30,64],[32,622]],'rgba(255,249,206,.54)',2);
 line(c,[[388,56],[387,630]],'rgba(255,245,215,.48)',2);
 // Underlay city / star-map silhouettes preserve original branding identity.
 // Keep the lower playfield free of unreadable ghost lettering.
 c.save();c.globalAlpha=.67;
 text(c,'BALL SAVE',210,565,11,'#f1d4ad','Barlow Condensed',900);
 c.restore();
 // Brass enamel edge screws.
 for(const [x,y] of [[23,32],[397,32],[19,263],[400,263],[19,524],[402,524],[30,671],[389,671]])bolt(c,x,y,4);
}
function drawBackglass(c,anim){
 // Recessed metal plaque: 3D shadow outside, glass window and spotlight.
 c.save();c.shadowColor='#050407';c.shadowBlur=18;c.shadowOffsetY=12;
 rect(c,79,32,269,108,11,'#17131c','#876d5a',5);c.restore();
 rect(c,83,35,261,103,10,G(c,90,35,320,139,[[0,'#b6a18b'],[.07,'#4c4447'],[.37,'#161622'],[.82,'#2d2939'],[1,'#ae7e69']]),'#ddc09e',2.5);
 rect(c,91,43,244,86,7,G(c,94,44,331,126,[[0,'#181b2f'],[.55,'#070e22'],[1,'#29172c']]),'rgba(243,201,134,.46)',1.2);
 c.save();
 c.shadowBlur=0;
 c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 c.font='900 14px "Barlow Condensed",Impact,sans-serif';
 c.fillStyle='#fff0d7';c.fillText('NEXTGEN SESSIONS',213,66,220);
 c.font='900 33px "Barlow Condensed",Impact,sans-serif';
 c.lineWidth=3.5;c.strokeStyle='#251522';c.strokeText('NEON TILT',213,101,220);
 c.fillStyle='#ffa18b';c.fillText('NEON TILT',213,101,220);
 c.restore();
 for(const x of [101,324])bolt(c,x,52,3);
 // Top crown lamps run automatically in attract mode.
 for(let i=0;i<3;i++){
  const power=anim>0 ? (Math.sin(anim*1.8+i*2.1)+1)/2 : .7;
  disk(c,111+i*102,151,11,R(c,111+i*102,151,11,[[0,'#fff8df'],[.3,'#efac7a'],[1,'#623e4d']]),'#bdb1a1',2);
  c.save();c.globalAlpha=power*.45;disk(c,111+i*102,151,15,null,'#ffbb81',2);c.restore();
 }
}
function drawOrbits(c){
 // Ramped half-tubes: broad dark extrusion underneath, translucent top rails.
 const orbit=[[85,394],[57,361],[49,303],[49,235],[60,186],[86,164]];
 chromeRail(c,orbit,11,'#e7b79b');
 line(c,[[93,392],[69,338],[68,270],[79,202],[97,181]],'#301725',5);
 line(c,[[93,392],[69,338],[68,270],[79,202],[97,181]],'rgba(255,137,109,.8)',2.2);
 const ramp=[[315,406],[335,379],[343,332],[322,279],[296,241],[290,203],[313,173]];
 chromeRail(c,ramp,15,'#cab4c6');
 line(c,[[298,399],[318,366],[321,332],[304,293],[278,255],[270,202]],'#533a59',6);
 line(c,[[298,399],[318,366],[321,332],[304,293],[278,255],[270,202]],'#ffad92',2.3);
 // Ramp's raised bridge spans in an offset alignment with its collision sensor.
 for(const [x,y] of [[336,336],[308,260],[306,197]]){
  c.save();c.shadowColor='#050409';c.shadowBlur=8;c.shadowOffsetY=8;
  rect(c,x-20,y-7,40,14,4,G(c,x-20,y-10,x+20,y+10,[[0,'#eee0d1'],[.42,'#a58c95'],[1,'#4e4853']]),'#e9beab',1.5);c.restore();
  for(const b of [-14,14])bolt(c,x+b,y,2);
 }
 rect(c,46,354,70,31,6,'#1d1825','#e3ae83',2);
 text(c,'ORBIT',81,370,13,'#ffe5b0','Barlow Condensed',900);
 rect(c,279,356,73,31,6,'#211924','#eeb899',2);
 text(c,'RAMP',315,372,14,'#ffdaaf','Barlow Condensed',900);
}

/* Phase 3C: printed enamel, moulded plastics, ball guides and working inserts.
   Decorative lamps follow existing mechanic state; they do not create fake targets. */
function drawEnamelDetails(c){
 c.save();
 // Printed under-glass lightning arcs & retro arcade scoring ladder.
 c.strokeStyle='rgba(140,156,227,.2)';c.lineWidth=1.15;
 for(let i=0;i<5;i++){
  c.beginPath();c.moveTo(116+i*3,355-i*6);
  c.bezierCurveTo(153,382+i*7,253,372-i*7,297-i*3,355-i*6);c.stroke();
 }
 text(c,'POWER GRID',210,360,10,'rgba(255,226,173,.57)','Oxanium',900);
 text(c,'NEON CITY',210,470,29,'rgba(209,99,120,.27)','Barlow Condensed',900);
 text(c,'HIGH VOLTAGE',211,493,10,'rgba(137,179,241,.33)','Oxanium',800);
 // A restrained 3D-effect skyline is printed onto the playfield, not a prop.
 for(let i=0;i<14;i++){
  const bx=106+i*14,h=12+(i*7)%24;
  rect(c,bx,510-h,11,h,1,'rgba(97,99,141,.19)',null);
  for(let y=515-h;y<501;y+=6)for(let x=bx+3;x<bx+10;x+=5){
   disk(c,x,y,.6,'rgba(249,198,141,.14)');
  }
 }
 // Two matte dark plastic sculpted returns, away from the ball's actual
 // top-level collision walls and aligned to shooter guides.
 plastic(c,p=>{
  p.moveTo(42,429);p.bezierCurveTo(54,423,63,410,71,396);
  p.lineTo(91,426);p.lineTo(75,457);p.lineTo(42,453);p.closePath();
 },G(c,40,420,91,460,[[0,'#7b6f95'],[.45,'#39374e'],[1,'#171728']]),'#bda5bb');
 plastic(c,p=>{
  p.moveTo(338,423);p.bezierCurveTo(350,409,357,406,362,395);
  p.lineTo(374,445);p.lineTo(346,457);p.lineTo(326,431);p.closePath();
 },G(c,326,406,369,462,[[0,'#9b7b89'],[.46,'#403746'],[1,'#1c1a2a']]),'#e3bca1');
 // Lifted lanes and compact steel gate frames near the upper rollovers.
 for(const lane of LANES){
  const x=lane.x;
  chromeRail(c,[[x-22,187],[x-22,207]],2.4,'#e6d6d0');
  chromeRail(c,[[x+22,187],[x+22,207]],2.4,'#e6d6d0');
  for(const offset of [-22,22])bolt(c,x+offset,201,2);
 }
 // Dense recessed incandescent insert clusters, like a physical playfield.
 const inserts=[
  [109,338,6,'#eb8d7d'],[128,362,5,'#e3b26d'],
  [283,343,6,'#e3ba85'],[307,331,5,'#a3b8eb'],
  [98,474,5,'#bcb0f7'],[126,468,5,'#e8a078'],
  [292,466,5,'#d4bbec'],[320,472,5,'#e8ba8a'],
  [180,539,4,'#a4afe3'],[240,539,4,'#a4afe3'],
  [109,571,5,'#e2bb84'],[312,571,5,'#e2bb84']
 ];
 for(const [x,y,r,col] of inserts){
  c.save();c.shadowColor=col;c.shadowBlur=7;
  disk(c,x,y,r+2,'#12101a','#a18d8b',1.2);
  disk(c,x,y,r,R(c,x,y,r,[[0,'#fff2dc'],[.3,col],[1,'#463442']]));
  c.restore();
 }
 // Lateral traffic/switch markings follow real left orbit and right ramp.
 for(let i=0;i<4;i++){
  text(c,'▸',93,286+i*19,11,'rgba(250,185,143,.72)','Oxanium',800);
  text(c,'◂',316,288+i*19,11,'rgba(195,188,239,.68)','Oxanium',800);
 }
}
function drawWorkingInserts(c,engine,anim,reducedMotion){
 const pulse=reducedMotion?1:.76+.24*Math.sin(anim*5.2);
 const multi=engine.time<engine.multiplierUntil;
 const frenzy=engine.time<engine.frenzyUntil;
 const active=[
  {x:142,y:369,label:'2×',on:multi,color:'#ffe29a'},
  {x:275,y:369,label:'2×',on:multi,color:'#ffe29a'},
  {x:123,y:449,label:'FRNZ',on:frenzy,color:'#ff9998'},
  {x:298,y:450,label:'FRNZ',on:frenzy,color:'#ff9998'},
  {x:168,y:480,label:'RAMP',on:engine.missions.ride,color:'#bad0ff'},
  {x:251,y:480,label:'ORBIT',on:engine.missions.ride,color:'#bad0ff'}
 ];
 for(const ins of active){
  c.save();c.globalAlpha=ins.on?pulse:1;
  c.shadowBlur=ins.on?13:0;c.shadowColor=ins.color;
  rect(c,ins.x-19,ins.y-8,38,18,5,ins.on?ins.color:'#2b2532',ins.on?'#fff8d6':'#605361',1.2);
  c.restore();
  text(c,ins.label,ins.x,ins.y+1,8,ins.on?'#2b1826':'#ab90a0','Oxanium',900);
 }
 // Target-bank illumination is driven only by targets that have registered.
 for(const [i,target] of TARGETS.entries()){
  const on=engine.targets.has(i)||engine.missions.targets;
  const x=target.x,y=target.y+44;
  c.save();c.shadowBlur=on?13:0;c.shadowColor='#ffe9ac';
  disk(c,x,y,5,on?'#ffe5a8':'#503b4a',on?'#fff8d7':'#927b75',1.3);
  c.restore();
 }
}

function drawTargets(c,engine){
 for(let i=0;i<LANES.length;i++){
  const l=LANES[i],on=engine.lanes.has(i)||engine.missions.lanes;
  rect(c,l.x-21,l.y-16,42,22,8,G(c,l.x-19,l.y-15,l.x+18,l.y+9,[[0,'#a3887c'],[.2,'#45333b'],[1,'#1b1822']]),'#c7a48c',2);
  neonInsert(c,l.x,l.y-5,l.label,on,on?'#ffe5ac':'#eb826d');
  line(c,[[l.x,l.y+22],[l.x,l.y+35]],'rgba(246,174,112,.6)',2);
 }
 for(let i=0;i<TARGETS.length;i++){
  const t=TARGETS[i],on=engine.targets.has(i)||engine.missions.targets;
  c.save();c.shadowColor='#000';c.shadowBlur=7;c.shadowOffsetY=7;
  rect(c,t.x-11,t.y-15,22,32,4,G(c,t.x-11,t.y-15,t.x+11,t.y+17,[[0,'#fff2c2'],[.18,'#c7aca5'],[.48,'#41404b'],[1,'#867376']]),'#1b161f',1);
  c.restore();
  rect(c,t.x-7,t.y-11,14,20,3,on?'#ffe8a2':'#9c424e',on?'#fff5cf':'#df917e',1.2);
  text(c,String(i+1),t.x,t.y+1,10,on?'#33201f':'#f4b3a3','Oxanium',900);
  bolt(c,t.x,t.y+17,2.4);
 }
}
function drawBumpers(c,engine,anim,reducedMotion,bumperFlash=null){
 for(let i=0;i<BUMPERS.length;i++){
  const b=BUMPERS[i],active=engine.time<engine.frenzyUntil;
  c.save();c.shadowColor='rgba(0,0,0,.8)';c.shadowBlur=16;c.shadowOffsetY=11;
  disk(c,b.x,b.y+1,b.r+11,'#161923','#14121a',2);c.restore();
  disk(c,b.x,b.y,b.r+10,R(c,b.x,b.y,b.r+10,[[0,'#ffe7bb'],[.3,'#f5d1a3'],[.61,'#6d5559'],[1,'#d2b39e']]),'#5b4a4b',2);
  disk(c,b.x,b.y-2,b.r+4,R(c,b.x,b.y-2,b.r+4,[[0,'#fcf3cb'],[.26,'#ee9988'],[.65,'#ac384c'],[1,'#431e38']]),'#f1d0a8',2.6);
  disk(c,b.x,b.y-2,b.r-6,R(c,b.x,b.y-2,b.r-6,[[0,'#ffefb0'],[.25,'#ff9778'],[.6,'#922b43'],[1,'#641d32']]),'rgba(255,232,174,.8)',1);
  const flash=active&&!reducedMotion?(Math.sin(anim*16+i*1.8)+1)/2:active?1:.16;
  c.save();c.globalAlpha=.32+flash*.65;c.shadowColor='#ffb66a';c.shadowBlur=active?17:6;
  disk(c,b.x,b.y-5,b.r*.49,'#f9c377','#fff5d3',2);c.restore();
  disk(c,b.x-6,b.y-11,4,'rgba(255,255,255,.72)');
  const hit=!reducedMotion&&bumperFlash?.index===i&&bumperFlash.until>performance.now();
  if(hit){
   const intensity=Math.max(0,Math.min(1,(bumperFlash.until-performance.now())/210));
   c.save();c.globalAlpha=intensity;c.shadowBlur=28;c.shadowColor='#fff0b2';
   disk(c,b.x,b.y,b.r+12,null,'#ffeab3',3);
   disk(c,b.x,b.y-4,b.r*.45,'#fff2bc');
   c.restore();
  }
  text(c,'0'+(i+1),b.x,b.y+47,9,'#ceb9ac');
 }
}
function drawSlings(c){
 for(let i=0;i<SLINGS.length;i++){
  const s=SLINGS[i],pivot=i===0?[130,547]:[290,547];
  plastic(c,a=>{a.moveTo(s.x1,s.y1);a.lineTo(s.x2,s.y2);a.lineTo(...pivot);a.closePath()},
   G(c,s.x1,s.y1,s.x2,s.y2,[[0,'#b0595b'],[.42,'#692c3f'],[1,'#331f2d']]),'#dcb19c');
  line(c,[[s.x1+3,s.y1+4],[s.x2-4,s.y2+2]],'#ffe3bb',3.7);
  bolt(c,...pivot,4);
 }
 for(const p of POSTS){
  c.save();c.shadowBlur=6;c.shadowOffsetY=3;c.shadowColor='#000';
  disk(c,p.x,p.y,p.r+3,R(c,p.x,p.y,p.r+3,[[0,'#f9e7bf'],[.4,'#b1a5a1'],[.7,'#5b5961'],[1,'#d2c2af']]),'#372f36',1.7);
  c.restore();disk(c,p.x-1,p.y-1,p.r*.43,'rgba(255,255,255,.5)');
 }
}
function drawWalls(c){
 // Collision-linked walls. Thin silver rails are located exactly on the colliders.
 for(const w of WALLS){
  const [[x1,y1],[x2,y2]]=[[w[0],w[1]],[w[2],w[3]]];
  chromeRail(c,[[x1,y1],[x2,y2]],3.4,'#cbc7c2');
 }
 for(const x of [91,329]){
  const left=x<200;
  chromeRail(c,[[x,510],[left?122:298,545]],5,'#f0d1b0');
 }
}
function drawFlippers(c,engine){
 for(const f of engine.flippers){
  const end=engine.flipperTip(f);
  c.save();c.shadowColor='#000';c.shadowBlur=11;c.shadowOffsetY=9;
  line(c,[[f.x,f.y],[end.x,end.y]],'#17121b',25);c.restore();
  line(c,[[f.x,f.y],[end.x,end.y]],'#594a54',24);
  line(c,[[f.x,f.y],[end.x,end.y]],G(c,f.x,f.y-11,end.x,end.y+11,[[0,'#fff0d2'],[.2,'#eee1cd'],[.48,'#ac999b'],[.77,'#bd8b8e'],[1,'#624958']]),19);
  line(c,[[f.x+1,f.y-4],[end.x,end.y-4]],'rgba(255,255,255,.83)',3);
  disk(c,f.x,f.y,13,R(c,f.x,f.y,13,[[0,'#fff1ce'],[.32,'#cfb5ae'],[.7,'#7b5861'],[1,'#e3cbad']]),'#2f2830',2);
  bolt(c,f.x,f.y,4);
 }
}
function drawBall(c,engine){
 const b=engine.ball;if(!b)return;
 if(b.mode!=='shooter'){
  b.trail.push({x:b.x,y:b.y});if(b.trail.length>7)b.trail.shift();
  for(let i=0;i<b.trail.length;i++){
   const p=b.trail[i];disk(c,p.x,p.y,2+i*.27,'rgba(255,214,161,'+(i/b.trail.length*.19)+')');
  }
 }
 c.save();c.shadowColor='#080609';c.shadowBlur=9;c.shadowOffsetY=8;
 disk(c,b.x+2,b.y+4,b.r+1,'rgba(2,2,8,.55)');c.restore();
 c.save();c.shadowColor='rgba(248,239,220,.54)';c.shadowBlur=4;
 disk(c,b.x,b.y,b.r,R(c,b.x,b.y,b.r,[[0,'#fff'],[.2,'#f4f5f5'],[.49,'#dad9d5'],[.74,'#898994'],[1,'#464651']]),'#e5e0d8',.8);
 c.restore();disk(c,b.x-3,b.y-3,2,'#fff');
}

function drawNewFeatures(c,engine,reducedMotion=false){
 const sx=SPINNER.x,sy=SPINNER.y;
 // Steel spinner pivot and hinged amber plate, animated from the engine angle.
 rect(c,sx-27,sy-15,54,30,6,'#24242b','#e4bc8d',2);
 for(const x of [sx-24,sx+24])disk(c,x,sy,5,'#c4b3ae','#fff1d3',2);
 c.save();c.translate(sx,sy);
 c.scale(1,Math.max(.18,Math.abs(Math.cos(engine.spinnerAngle))));
 rect(c,-17,-13,34,26,4,'#e9a96c','#fff0c4',2);
 c.restore();
 text(c,'SPIN',sx,sy+26,9,'#ffd5a4');
 // Recessed scoop, chrome lip and bright catch light, same coordinates as 3D.
 const sc=SCOOP,on=engine.ball?.mode==='scoop';
 disk(c,sc.x,sc.y,20,'#211823','#d7b9ae',3);
 disk(c,sc.x,sc.y,14,on?'#f48770':'#3a152a','#edbc85',2);
 disk(c,sc.x,sc.y,8,on?'#fff0c0':'#120c17');
 text(c,'SCOOP',sc.x,sc.y+28,9,'#ffdfb2');
 // 2D fallback reflects the same real Power Grid and Overdrive engine state.
 rect(c,162,465,92,23,5,'#191724','#c4a18d',2);
 text(c,'POWER GRID',208,459,9,'#ffe2ad','Barlow Condensed',900);
 for(let i=0;i<3;i++){
  const lit=engine.powerCharges>i,rush=engine.hurryUpUntil>engine.time;
  disk(c,180+i*28,476,6,lit?(rush?'#ff67aa':'#ffbd6b'):'#41333d',
   lit?'#fff4cf':'#816a69',1.5);
 }
 const rush=engine.hurryUpUntil>engine.time,overdrive=engine.overdriveUntil>engine.time;
 if(rush){disk(c,sc.x,sc.y,23,null,'#ff70b1',3);text(c,'JACKPOT',sc.x,sc.y-32,11,'#ffe0a4');}
 if(overdrive)text(c,'OVERDRIVE!',sx,sy-32,11,'#fff0b1');

 if(!reducedMotion){
  const t=performance.now()/1000;
  const active=engine.time<engine.frenzyUntil||engine.state==='ready';
  for(const [i,pos] of [[104,262],[300,262],[112,349],[309,348],[120,481],[297,480],[164,570],[255,570]].entries()){
   const lit=active&&Math.sin(t*5-i*.8)>.08;
   disk(c,pos[0],pos[1],5,lit?'#ffde99':'#65424e',lit?'#fff5d5':'#ab8b78',1);
  }
 }
}

function drawLower(c,engine){
 rect(c,75,571,61,20,4,'#302331','#aa8582',1);
 rect(c,286,571,61,20,4,'#302331','#aa8582',1);
 const ballSave=engine.state==='playing'&&engine.ballLaunchedAt!==null&&!engine.ballSaveUsed&&engine.time<engine.ballSaveUntil;
 neonInsert(c,206,558,'S',ballSave,ballSave?'#bce9b9':'#bf675c');
 text(c,'BALL SAVE',206,582,8,ballSave?'#dcf5cc':'#aa7d79');
 c.save();c.shadowColor='#000';c.shadowBlur=8;c.shadowOffsetY=4;
 c.beginPath();c.ellipse(208,692,93,19,0,0,TAU);c.fillStyle='#05060e';c.fill();c.restore();
 text(c,'DRAIN',210,683,9,'#ad8582');
 // Mechanical plunger channel, spring, and knurled handle.
 rect(c,368,474,30,200,8,G(c,367,480,397,674,[[0,'#393442'],[.38,'#10111a'],[.7,'#292431'],[1,'#8e655f']]),'#baa18e',2);
 line(c,[[379,487],[379,661]],'#d2bab0',2);
 for(let y=604;y<650;y+=8)line(c,[[371,y],[392,y+6]],'#aaa2a6',2.5);
 rect(c,370,656,25,27,7,G(c,371,658,390,681,[[0,'#fff4d6'],[.35,'#b7a7a4'],[1,'#72545b']]),'#322a33',2);
 if(engine.ball?.mode==='shooter')text(c,Math.round(engine.charge*100)+'%',380,458,11,'#ffe8c0');
}
let cachedStatic=null;
function baseArtwork(){
 if(cachedStatic)return cachedStatic;
 const layer=document.createElement('canvas');
 const detail=2;layer.width=BOARD.width*detail;layer.height=BOARD.height*detail;
 const c=layer.getContext('2d');c.setTransform(detail,0,0,detail,0,0);
 drawBase(c,0);
 drawBackglass(c,0);
 drawOrbits(c);
 drawEnamelDetails(c);
 drawSlings(c);
 drawWalls(c);
 cachedStatic=layer;return layer;
}
export function renderTable(ctx,engine,{reducedMotion=false,bumperFlash=null}={}){
 const anim=reducedMotion?0:performance.now()/1000;
 ctx.save();ctx.clearRect(0,0,BOARD.width,BOARD.height);
 ctx.drawImage(baseArtwork(),0,0,BOARD.width,BOARD.height);
 drawTargets(ctx,engine);
 drawBumpers(ctx,engine,anim,reducedMotion,bumperFlash);
 drawWorkingInserts(ctx,engine,anim,reducedMotion);
 drawNewFeatures(ctx,engine,reducedMotion);
 drawLower(ctx,engine);
 drawFlippers(ctx,engine);
 drawBall(ctx,engine);
 // Two restrained angled light reflections, as if viewed through tempered glass.
 const ref=G(ctx,0,0,320,610,[[0,'rgba(255,254,234,.095)'],[.24,'rgba(255,255,255,.011)'],[.65,'rgba(255,255,255,0)'],[1,'rgba(255,255,255,0)']]);
 ctx.beginPath();ctx.moveTo(23,24);ctx.lineTo(66,24);ctx.lineTo(236,670);ctx.lineTo(203,670);ctx.closePath();ctx.fillStyle=ref;ctx.fill();
 ctx.restore();
}
