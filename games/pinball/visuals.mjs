// NEON TILT · Cabinet artwork, Version 3
// An original layered pseudo-3D pinball playfield. All mechanical object positions
// come from the actual physics engine; moving a collider must move its art.
import {BOARD,WALLS,BUMPERS,POSTS,SLINGS,LANES,TARGETS,SHOTS,SPINNER,SCOOP,RAMP_PATH,ORBIT_PATH,CENTER_PATH,SKYLINE_PATH} from './engine.mjs?v=10';
import {LOWER_GUIDES,LOWER_SLINGS,LOWER_POSTS,LOWER_CHANNELS} from './lower-hardware.mjs?v=2';
import {MID_BUMPERS,MID_TARGETS,POWER_CORE,midTableState} from './mid-hardware.mjs?v=1';
import {UPPER_ROUTES,UPPER_ROLLOVERS,guideEdges} from './upper-hardware.mjs?v=3';
import {NEON_FINISH,GRID_LIGHTS,gridIllumination,roundedWirePoints} from './classic-finish.mjs?v=1';
import {LOWER_DIRECTION_INSERTS,directionInsertActive,elevatedGuardSide} from './finishing-detail.mjs?v=1';
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
 const bg=G(c,0,0,420,700,[
  [0,NEON_FINISH.upper],[.35,NEON_FINISH.mid],
  [.70,NEON_FINISH.lower],[1,'#22263e']
 ]);
 c.fillStyle=bg;c.fillRect(0,0,BOARD.width,BOARD.height);
 const blueSheen=c.createRadialGradient(138,268,15,138,268,235);
 blueSheen.addColorStop(0,'rgba(59,156,230,.24)');
 blueSheen.addColorStop(1,'rgba(59,156,230,0)');
 c.fillStyle=blueSheen;c.fillRect(0,0,420,700);
 const pinkSheen=c.createRadialGradient(305,398,15,305,398,220);
 pinkSheen.addColorStop(0,'rgba(248,106,163,.16)');
 pinkSheen.addColorStop(1,'rgba(248,106,163,0)');
 c.fillStyle=pinkSheen;c.fillRect(0,0,420,700);
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
 c.font='900 34px "Arial Black",Impact,Arial,sans-serif';
 c.lineWidth=4.5;c.strokeStyle='#130d18';c.strokeText('NEON TILT',213,101,226);
 c.fillStyle='#ffe6cc';c.fillText('NEON TILT',213,99,226);
 c.fillStyle='#ff835e';c.fillText('NEON TILT',213,97,226);
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
 // Classic wireform look: open playfield artwork, coloured shot markers
 // and delicate steel rails. Avoid heavy dark bands across the bumpers.
 for(const route of UPPER_ROUTES){
  const pts=route.points.map(p=>[p.x,p.y]),edges=guideEdges(route);
  const accent=route.accent==='coral'?'#ff92ba':'#ffd08c';
  line(c,pts,'rgba(30,32,65,.58)',7);
  line(c,pts,accent,2.5);
  for(const side of ['left','right']){
   const track=roundedWirePoints(edges.map(e=>e[side]),3)
    .map(p=>[p.x,p.y]);
   line(c,track,'#344151',3.3);
   line(c,track,'#e1e8ed',1.7);
   // Only the outer high safety rail gets an additional polished highlight.
   if(side===elevatedGuardSide(route.kind))
    line(c,track,'rgba(255,247,226,.58)',.7);
  }
  for(const i of route.supportIndices){
   const a=edges[i].left,b=edges[i].right,p=route.points[i];
   line(c,[[a.x,a.y],[b.x,b.y]],'#9998a7',1.6);
   disk(c,a.x,a.y,2.4,'#d4b5a1','#37465c',.8);
   const q=route.points[i-1],ang=Math.atan2(p.y-q.y,p.x-q.x)+Math.PI/2;
   c.save();c.translate(p.x,p.y);c.rotate(ang);
   c.beginPath();c.moveTo(0,-6);c.lineTo(4,4);
   c.lineTo(0,1);c.lineTo(-4,4);c.closePath();
   c.fillStyle=accent;c.strokeStyle='#1b2440';c.lineWidth=.8;
   c.fill();c.stroke();c.restore();
  }
  disk(c,route.entrance.x,route.entrance.y,5,'#222339','#e8ccaf',1.6);
  disk(c,route.entrance.x,route.entrance.y,2.4,accent);
 }
 for(const [path,col] of [[CENTER_PATH,'#89d8f7'],[SKYLINE_PATH,'#dfa6eb']]){
  c.save();c.setLineDash([4,9]);
  line(c,path.map(([x,y])=>[x,y]),'#292236',6);
  line(c,path.map(([x,y])=>[x,y]),col,2.8);c.restore();
 }
 for(const [label,x,y,color] of [
  ['ORBIT',78,372,'#ffdfb4'],['RAMP',315,372,'#ffd4bb'],
  ['CROSS',208,438,'#bcecff'],['SKY',122,404,'#e5c8ff']
 ]){
  rect(c,x-26,y-11,52,22,4,'#151b30','#bd8b87',1.4);
  text(c,label,x,y,11,color,'Barlow Condensed',900);
 }
}
/* Phase 3C: printed enamel, moulded plastics, ball guides and working inserts.
   Decorative lamps follow existing mechanic state; they do not create fake targets. */
function drawEnamelDetails(c){
 c.save();
 // Printed under-glass lightning arcs & retro arcade scoring ladder.
 c.strokeStyle='rgba(145,209,247,.34)';c.lineWidth=1.15;
 for(let i=0;i<5;i++){
  c.beginPath();c.moveTo(116+i*3,355-i*6);
  c.bezierCurveTo(153,382+i*7,253,372-i*7,297-i*3,355-i*6);c.stroke();
 }
 text(c,'POWER GRID',210,360,10,'rgba(255,226,173,.57)','Oxanium',900);
 // The former ghost lettering is replaced by a clear central power insert.
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
 // Retro upper-playfield inserts and sculpted rollover plastics.
 // Devices remain visible; no rail or elevated structure is painted over them.
 for(let i=0;i<9;i++){
  const x=72+i*34,y=131;
  disk(c,x,y,4,'#21253c','#756680',1);
 }
 for(const lane of UPPER_ROLLOVERS){
  rect(c,lane.x-24,183,48,23,5,'#2c254b','#bf89c4',2);
  text(c,lane.label,lane.x,193,12,'#ffe5ba','Barlow Condensed',900);
  line(c,[[lane.x-18,lane.y-16],[lane.x-18,lane.y-22],
   [lane.x+18,lane.y-22],[lane.x+18,lane.y-16]],'#3c4656',6);
  line(c,[[lane.x-18,lane.y-22],[lane.x+18,lane.y-22]],'#c8c8cc',2.4);
  disk(c,lane.x-18,lane.y-16,3,'#d5b89f');
  disk(c,lane.x+18,lane.y-16,3,'#d5b89f');
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
 // Three physical-looking Power Grid lights track real charge progression.
 const gridLit=gridIllumination(engine);
 for(const g of GRID_LIGHTS){
  const on=gridLit[g.index];
  c.save();c.shadowBlur=on?12:0;c.shadowColor=NEON_FINISH.cyan;
  disk(c,g.x,g.y,8,'#192336','#a6c0d4',1.5);
  disk(c,g.x,g.y,5.5,on?'#b3eeff':'#43708c',
   on?'#fff9dc':'#6c97af',1.1);
  c.restore();
  text(c,String(g.index+1),g.x,g.y+.25,6.5,
   on?'#173854':'#d7e9f4','Oxanium',900);
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
 // Mounted target bank: shared pressed-steel backplate and four illuminated
 // standing switch faces aligned with the game's actual target sensors.
 c.save();c.shadowColor='#000';c.shadowBlur=9;c.shadowOffsetY=6;
 rect(c,146,387,123,43,5,
  G(c,146,387,269,430,[[0,'#bdabb3'],[.26,'#50505e'],[.77,'#292d3a'],[1,'#b1a3a4']]),
  '#ddc7b1',2.1);
 c.restore();
 for(let i=0;i<MID_TARGETS.length;i++){
  const t=MID_TARGETS[i],on=engine.targets.has(i)||engine.missions.targets;
  c.save();c.shadowColor='rgba(2,5,14,.72)';c.shadowBlur=8;c.shadowOffsetY=5;
  rect(c,t.x-13,t.y-18,26,38,3,'#202532','#93949e',2);c.restore();
  rect(c,t.x-10,t.y-15,20,32,2,
   G(c,t.x-10,t.y-15,t.x+10,t.y+17,[
    [0,'#cfc5b9'],[.25,'#9e939b'],[.8,'#3b3443'],[1,'#171d2a']
   ]),'#e4cbb8',1.1);
  c.save();c.shadowBlur=on?11:0;c.shadowColor='#ffd4a0';
  rect(c,t.x-7,t.y-11,14,22,2,on?'#ffe2a5':'#a23c57',
   on?'#fffae6':'#d3928c',1.2);
  c.restore();
  text(c,String(i+1),t.x,t.y+1,10,on?'#392636':'#ffe0c7','Oxanium',900);
  bolt(c,t.x-9,t.y+15,1.8);bolt(c,t.x+9,t.y+15,1.8);
  disk(c,t.x,t.y-25,4,on?'#ffe0a5':'#593642',
   on?'#fff0c5':'#8f7d89',1);
 }

}
function drawBumpers(c,engine,anim,reducedMotion,bumperFlash=null){
 const mid=midTableState(engine);
 for(let i=0;i<MID_BUMPERS.length;i++){
  const b=MID_BUMPERS[i];
  const hit=!reducedMotion&&bumperFlash?.index===i&&bumperFlash.until>performance.now();
  const pulse=reducedMotion?1:.75+.25*Math.sin(anim*7+i*1.2);
  c.save();c.shadowColor='rgba(0,0,0,.82)';c.shadowBlur=19;c.shadowOffsetY=10;
  disk(c,b.x,b.y+4,b.r+12,'#12151f');c.restore();
  // Physical mounting washer, plated skirt and visible rubber contact ring.
  disk(c,b.x,b.y,b.r+10,
   R(c,b.x,b.y,b.r+12,[[0,'#e6d5c8'],[.38,'#a9a2aa'],[.7,'#545360'],[1,'#1d2534']]),
   '#c1aaa0',2);
  disk(c,b.x,b.y-1,b.r+6,'#4a4651','#e9c7b1',3);
  disk(c,b.x,b.y-2,b.r+1,'#292432','#9a6371',4);
  disk(c,b.x,b.y-4,b.r-4,
   R(c,b.x,b.y-5,b.r-3,[
    [0,hit?'#fff5d5':'#ffdaac'],
    [.38,'#f69b91'],[.79,'#a84162'],[1,'#532339']
   ]),'#edc4ae',2.2);
  c.save();
  c.globalAlpha=hit?1:mid.frenzy?.72*pulse:.36;
  c.shadowColor='#ff9a81';c.shadowBlur=hit?16:mid.frenzy?11:4;
  disk(c,b.x,b.y-6,b.r*.44,'#ffd5ac','#fff2d3',1.4);
  c.restore();
  // Three captive screws make the assembly read as mounted machinery.
  for(let j=0;j<3;j++){
   const a=j*TAU/3-Math.PI/2;
   bolt(c,b.x+Math.cos(a)*(b.r+8),b.y+Math.sin(a)*(b.r+8),2.1);
  }
  disk(c,b.x-6,b.y-12,3,'rgba(255,255,255,.72)');
  text(c,'0'+(i+1),b.x,b.y+46,9,'#d3bca8');
 }
}
function drawSlings(c){
 for(let i=0;i<LOWER_SLINGS.length;i++){
  const s=LOWER_SLINGS[i],pivot=i===0?[130,547]:[290,547];
  c.save();c.shadowColor='rgba(3,4,13,.75)';c.shadowBlur=11;c.shadowOffsetY=6;
  plastic(c,a=>{a.moveTo(s.x1,s.y1);a.lineTo(s.x2,s.y2);a.lineTo(...pivot);a.closePath()},
   G(c,s.x1,s.y1,s.x2,s.y2,[[0,'#b0595b'],[.42,'#692c3f'],[1,'#331f2d']]),'#dcb19c');
  c.restore();
  line(c,[[s.x1,s.y1],[s.x2,s.y2]],'#1a1925',10);
  line(c,[[s.x1,s.y1],[s.x2,s.y2]],'#5d3648',7);
  line(c,[[s.x1,s.y1],[s.x2,s.y2]],'#f0bf9c',2.2);
  bolt(c,s.x1,s.y1,3);bolt(c,s.x2,s.y2,3);
  bolt(c,...pivot,4);
 }
 for(const p of POSTS){
  c.save();c.shadowBlur=6;c.shadowOffsetY=3;c.shadowColor='#000';
  disk(c,p.x,p.y,p.r+3,R(c,p.x,p.y,p.r+3,[[0,'#f9e7bf'],[.4,'#b1a5a1'],[.7,'#5b5961'],[1,'#d2c2af']]),'#372f36',1.7);
  c.restore();
  if(LOWER_POSTS.some(q=>q.x===p.x&&q.y===p.y)){
   disk(c,p.x,p.y,p.r+1.5,null,'#48313f',3.2);
   disk(c,p.x,p.y,p.r*.57,'#b4aca7','#f2d6b6',1);
   line(c,[[p.x-3,p.y+2],[p.x+3,p.y-2]],'#453038',1.4);
  }else disk(c,p.x-1,p.y-1,p.r*.43,'rgba(255,255,255,.5)');
 }
}
function drawWalls(c){
 // Outer boundaries, slings and inlanes use painted acrylic sidewalls.
 // Real collisions remain in engine.mjs, independent from the artwork.
 for(const w of WALLS){
  const pts=[[w[0],w[1]],[w[2],w[3]]];
  line(c,pts,'#241e37',7);
  line(c,pts,'rgba(205,122,156,.55)',3);
 }
 for(const [x,left] of [[91,true],[329,false]]){
  line(c,[[x,510],[left?122:298,545]],'#794f8c',8);
  line(c,[[x,510],[left?122:298,545]],'#d893ae',3);
 }
 // Two solid cabinet-mounted channels visually join the four physical
 // wall segments. The coloured body lies outside the collision line.
 for(const channel of LOWER_CHANNELS){
  const pts=channel.points,outline=pts.map(p=>[p.x,p.y]);
  const back=pts.slice().reverse().map(p=>[p.x+channel.outerOffset,p.y]);
  c.beginPath();c.moveTo(...outline[0]);
  for(const p of outline.slice(1))c.lineTo(...p);
  for(const p of back)c.lineTo(...p);
  c.closePath();
  c.fillStyle=G(c,outline[0][0],outline[0][1],
   back[1][0],back[1][1],[
    [0,'#7b6673'],[.27,'#352c3c'],[.71,'#1c2333'],[1,'#685362']
   ]);
  c.fill();c.lineWidth=1;c.strokeStyle='#b9a49e';c.stroke();
  line(c,outline,'#222a35',7);
  line(c,outline,'#7a8b97',3.2);
  line(c,outline,'#e4cbb6',1);
  for(const p of pts){
   const bx=p.x+channel.outerOffset*.56,by=p.y;
   line(c,[[p.x,p.y],[bx,by]],'#a99792',2.1);
   bolt(c,bx,by,2.7);
  }
 }
}
// A tapered, rounded flipper outline is easier to read than thick,
 // perfectly uniform paint strokes. Ends follow the actual engine bat tip.
 function batContour(c,fx,fy,tx,ty,baseWidth,tipWidth,fill,stroke=null){
  const d=Math.hypot(tx-fx,ty-fy)||1;
  const ux=(tx-fx)/d,uy=(ty-fy)/d,nx=-uy,ny=ux;
  c.beginPath();
  c.moveTo(fx+nx*baseWidth,fy+ny*baseWidth);
  c.lineTo(tx+nx*tipWidth,ty+ny*tipWidth);
  c.quadraticCurveTo(tx+ux*6,ty+uy*6,tx-nx*tipWidth,ty-ny*tipWidth);
  c.lineTo(fx-nx*baseWidth,fy-ny*baseWidth);
  c.quadraticCurveTo(fx-ux*8,fy-uy*8,fx+nx*baseWidth,fy+ny*baseWidth);
  c.closePath();c.fillStyle=fill;c.fill();
  if(stroke){c.strokeStyle=stroke;c.lineWidth=1.4;c.stroke();}
 }
function drawFlippers(c,engine){
 for(const f of engine.flippers){
  const end=engine.flipperTip(f);
  c.save();c.shadowColor='#000';c.shadowBlur=10;c.shadowOffsetY=5;
  batContour(c,f.x,f.y,end.x,end.y,12.4,8.4,'#17121c');c.restore();
  batContour(c,f.x,f.y,end.x,end.y,11.4,7.5,'#553844','#dba88e');
  batContour(c,f.x,f.y,end.x,end.y,8.8,5.5,
   G(c,f.x,f.y-10,end.x,end.y+8,[
    [0,'#fff0d5'],[.22,'#f0dfcd'],[.60,'#d4b7a9'],[1,'#996d74']
   ]),'#f7dab9');
  line(c,[[f.x+4,f.y-3],[end.x-3,end.y-2]],'rgba(255,245,218,.68)',1.8);
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
 // Phase 4K.2 — recessed machine housing and real Power Grid inserts.
 const coreX=POWER_CORE.x,coreY=POWER_CORE.y;
 const mid=midTableState(engine),litGrid=mid.charges,rushActive=mid.rush;
 const pulse=reducedMotion?1:.7+.3*Math.sin(performance.now()*.008);
 c.save();c.shadowColor='#040710';c.shadowBlur=14;c.shadowOffsetY=7;
 disk(c,coreX,coreY,50,'#0e1522','#6f6a80',3);c.restore();
 disk(c,coreX,coreY,47,
  R(c,coreX,coreY,50,[[0,'#8399aa'],[.36,'#4d6680'],[.68,'#253549'],[1,'#b1a7a9']]),
  '#d3c3b3',2);
 disk(c,coreX,coreY,40,'#122033','#b2bbc2',2.2);
 disk(c,coreX,coreY,33,
  R(c,coreX,coreY,34,[
   [0,rushActive?'#ffe1b0':'#72b5dc'],[.40,'#3977ab'],[1,'#17324c']
  ]),'#a3c7df',2);
 disk(c,coreX,coreY,19,'#1d405f','#b0d9ed',2.3);
 c.save();c.globalAlpha=.28+(rushActive?.5:litGrid*.08)*pulse;
 disk(c,coreX-6,coreY-9,8,'#d7efff');c.restore();
 for(let i=0;i<POWER_CORE.charges;i++){
  const a=-Math.PI/2+i*TAU/POWER_CORE.charges+.08;
  const on=rushActive||i<litGrid;
  c.beginPath();c.arc(coreX,coreY,35,a,a+TAU/POWER_CORE.charges-.18);
  c.strokeStyle=on?'#ffe5af':'#4b7796';
  c.lineWidth=4.4;c.stroke();
 }
 for(let i=0;i<16;i++){
  const a=i*TAU/16-Math.PI/2;
  const x=coreX+Math.cos(a)*44,y=coreY+Math.sin(a)*44;
  const lit=rushActive||i<litGrid*5 ||
   (engine.state==='ready'&&!reducedMotion&&i===Math.floor(performance.now()/180)%16);
  disk(c,x,y,lit?3.8:3.2,lit?'#ffe0ae':'#6584a5',
   lit?'#fff4cd':'#344b66',1);
 }
 for(let i=0;i<4;i++){
  const a=i*TAU/4+Math.PI/4;
  bolt(c,coreX+Math.cos(a)*49,coreY+Math.sin(a)*49,2.2);
 }
 for(const [i,pos] of [[190,462],[210,445],[230,462]].entries()){
  disk(c,pos[0],pos[1],4.8,litGrid>i?'#ffd49d':'#4e4d65','#a9a5b4',1.2);
 }
 const rush=engine.hurryUpUntil>engine.time,overdrive=engine.overdriveUntil>engine.time;
 // Live light cues in the same zones as the 3D display.
 const now=performance.now(),upperStep=Math.floor(now/220);
 const launchChase=engine.state==='playing'&&engine.ballLaunchedAt!==null&&
  engine.time-engine.ballLaunchedAt<2.5;
 for(let i=0;i<9;i++){
  const lane=Math.floor(i/3);
  const lit=engine.lanes.has(lane)||engine.missions.lanes||
   (engine.state==='ready'||launchChase)&&
    (reducedMotion?i===0:i===upperStep%9);
  disk(c,72+i*34,131,4,lit?'#ffe4a7':'#425673',
   lit?'#fff5d5':'#283448',1);
 }
 for(const [x,y,index] of [
  [109,235,0],[111,269,0],[306,235,1],[307,269,1],
  [165,335,2],[245,335,2]
 ]){
  const lit=engine.time<engine.frenzyUntil;
  disk(c,x,y,4,lit?'#ffd7a0':'#653e55',
   lit?'#fff1c1':'#9c6577',1);
 }
 const ballSave=engine.state==='playing'&&engine.ballLaunchedAt!==null&&
   !engine.ballSaveUsed&&engine.time<engine.ballSaveUntil;
 for(const [x,y] of [[106,537],[122,565],[161,548],
                       [314,537],[298,565],[259,548]]){
  const shine=ballSave&&(reducedMotion||Math.sin(now*.009+x*.1)>-.2);
  disk(c,x,y,5,shine?'#ffdfad':'#473c59',
   shine?'#fff5d5':'#a27f92',1.2);
 }
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
 // A recessed drain mouth below the flipper return plane, with a dark
 // open centre rather than a misleading solid bar across the trough.
 rect(c,148,676,124,21,5,'#29303d','#9e9ba0',1.3);
 rect(c,157,680,106,15,3,'#060912','#6f7780',1);
 line(c,[[151,676],[269,676]],'#ded0c1',2);
 for(const x of [155,265]){
  rect(c,x-4,679,8,17,2,'#414452','#ad9290',1);
  bolt(c,x,682,2.7);
 }
 text(c,'DRAIN',210,691,8,'#b7a7a1');
 // Mechanical plunger channel, spring, and knurled handle.
 rect(c,368,474,30,200,8,G(c,367,480,397,674,[[0,'#393442'],[.38,'#10111a'],[.7,'#292431'],[1,'#8e655f']]),'#baa18e',2);
 line(c,[[379,487],[379,661]],'#d2bab0',2);
 for(let y=604;y<650;y+=8)line(c,[[371,y],[392,y+6]],'#aaa2a6',2.5);
 rect(c,370,656,25,27,7,G(c,371,658,390,681,[[0,'#fff4d6'],[.35,'#b7a7a4'],[1,'#72545b']]),'#322a33',2);
 if(engine.ball?.mode==='shooter')text(c,Math.round(engine.charge*100)+'%',380,458,11,'#ffe8c0');
}
// Flush, original sci-fi lane inserts near the real flippers. The lights
// are recoloured only by the already-existing Ramp and Orbit shot events.
function drawLowerDirectionInserts(c,engine,reducedMotion){
 for(const item of LOWER_DIRECTION_INSERTS){
  const on=directionInsertActive(engine,item.kind);
  const {x,y}=item;
  c.save();
  c.shadowColor=item.colour;c.shadowBlur=on&&!reducedMotion?11:0;
  disk(c,x,y,11,'#1b2337','#a7b9c8',2);
  disk(c,x,y,8,on?item.colour:'#41526b','#c2cbd9',1);
  c.beginPath();
  c.moveTo(x,y-6);c.lineTo(x+6,y+3);
  c.lineTo(x+2,y+2);c.lineTo(x+2,y+5);
  c.lineTo(x-2,y+5);c.lineTo(x-2,y+2);
  c.lineTo(x-6,y+3);c.closePath();
  c.fillStyle=on?'#17334a':'#b4cedf';c.fill();
  c.restore();
  text(c,item.label,x,y-17,8,on?'#fff2cd':'#aabbd3',
   'Barlow Condensed',900);
 }
}
function drawUpperRouteFeedback(c,engine,reducedMotion){
 const last=engine.lastShot;
 if(!last||engine.time-last.at>2)return;
 const route=UPPER_ROUTES.find(r=>r.kind===last.kind);
 if(!route)return;
 c.save();c.shadowBlur=reducedMotion?0:9;
 c.shadowColor=route.accent==='coral'?'#ff8298':'#ffc589';
 disk(c,route.entrance.x,route.entrance.y,5.5,
  route.accent==='coral'?'#ffe0d3':'#fff0bd');
 c.restore();
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
 drawUpperRouteFeedback(ctx,engine,reducedMotion);
 drawTargets(ctx,engine);
 drawBumpers(ctx,engine,anim,reducedMotion,bumperFlash);
 drawWorkingInserts(ctx,engine,anim,reducedMotion);
 drawNewFeatures(ctx,engine,reducedMotion);
 drawLower(ctx,engine);
 drawLowerDirectionInserts(ctx,engine,reducedMotion);
 drawFlippers(ctx,engine);
 drawBall(ctx,engine);
 // Two restrained angled light reflections, as if viewed through tempered glass.
 const ref=G(ctx,0,0,320,610,[[0,'rgba(255,254,234,.095)'],[.24,'rgba(255,255,255,.011)'],[.65,'rgba(255,255,255,0)'],[1,'rgba(255,255,255,0)']]);
 ctx.beginPath();ctx.moveTo(23,24);ctx.lineTo(66,24);ctx.lineTo(236,670);ctx.lineTo(203,670);ctx.closePath();ctx.fillStyle=ref;ctx.fill();
 ctx.restore();
}
