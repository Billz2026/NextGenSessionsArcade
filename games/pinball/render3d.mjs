/* NextGen Pinball — original real-time 3D table.
   Uses Three.js for 3D geometry and lighting; game engine remains deterministic 2D.
   Coordinates and moving physical pieces are mapped from engine.mjs. */
import {BOARD,WALLS,BUMPERS,POSTS,SLINGS,LANES,TARGETS,SHOTS,SPINNER,SCOOP,RAMP_PATH,ORBIT_PATH,CENTER_PATH,SKYLINE_PATH,FLIPPER_SWEET_SPOT,KICKBACK} from './engine.mjs?v=17';
import {LOWER_GUIDES,LOWER_SLINGS,LOWER_POSTS,LOWER_FLIPPER_BASES,LOWER_CHANNELS} from './lower-hardware.mjs?v=5';
import {MID_BUMPERS,MID_TARGETS,POWER_CORE,midTableState} from './mid-hardware.mjs?v=2';
import {UPPER_ROUTES,UPPER_ROLLOVERS,UPPER_ARCH,guideEdges,UPPER_BALL_RADIUS} from './upper-hardware.mjs?v=5';
import {NEON_FINISH,GRID_LIGHTS,gridIllumination,roundedWirePoints} from './classic-finish.mjs?v=4';
import {LOWER_DIRECTION_INSERTS,directionInsertActive} from './finishing-detail.mjs?v=1';
import {shotIndicatorState,shotIndicatorBrightness} from './shot-guidance.mjs?v=2';
const SCALE=.020;
const X=x=>(x-BOARD.width/2)*SCALE;
const Y=y=>(BOARD.height/2-y)*SCALE;
const PI=Math.PI,TAU=2*PI;
const cold=(a,b)=>Math.max(a,Math.min(b,1));
export async function create3DTable(host){
 const T=await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
 if(!host || !T.WebGLRenderer)throw Error('3D canvas unavailable');
 const scene=new T.Scene();
 scene.background=new T.Color('#080a11');
 // Reframe the real playable area, not the wooden margins. A tighter desktop
 // camera makes the ball, flippers, ramps and targets roughly 14% larger without
 // scaling/distorting the 420 × 700 physics canvas or cutting off live walls.
 // Keep the original framing on phones/Fold where tap accuracy matters most.
 const compact=window.matchMedia?.('(max-width: 1120px)').matches??false;
 const camera=new T.PerspectiveCamera(compact?33:29.2,0.6,.1,120);
 // Frame the active playfield (all live wall ends fit inside the camera).
 camera.position.set(1.05,-2.0,26.25);
 camera.lookAt(0,0,.22);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,compact?1.25:1.8));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.27;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.className='webgl-table';
 renderer.domElement.setAttribute('aria-hidden','true');
 renderer.domElement.style.touchAction='none';
 host.append(renderer.domElement);
 let releaseStudio=()=>{};
 try{
  const {createStudioEnvironment}=await import('./studio3d.mjs?v=1');
  releaseStudio=createStudioEnvironment(T,renderer,scene);
 }catch(error){
  console.warn('Using direct arcade lighting without optional studio reflections.',error);
 }
 const metal=(color,roughness=.28,metalness=.9)=>new T.MeshPhysicalMaterial({
  color,roughness,metalness,clearcoat:.18,clearcoatRoughness:.12,envMapIntensity:1.1
 });
 const enamel=new T.MeshPhysicalMaterial({color:'#15110d',roughness:.23,metalness:.10,clearcoat:.98,clearcoatRoughness:.16,envMapIntensity:.87});
 const black=metal('#100e0b',.47,.28),nickel=metal('#8f9294',.25,.85),chrome=metal('#b9b3a6',.18,.94);
 const darkChrome=metal('#606373',.34,.8),gold=metal('#d6ac56',.21,.83);
  // Arcade-red lacquer is shared with the NextGen Sessions ARCADE wordmark.
  const cabinetRed=new T.MeshPhysicalMaterial({color:'#921721',roughness:.23,metalness:.30,clearcoat:1,clearcoatRoughness:.12});
 const rubber=new T.MeshStandardMaterial({color:'#392a26',roughness:.65,metalness:.02});
 const rose=metal('#9c413f',.29,.48),plastic=new T.MeshPhysicalMaterial({
  color:'#312923',metalness:.06,roughness:.22,clearcoat:1,clearcoatRoughness:.12,
  transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false,envMapIntensity:1
 });
 const lampMaterial=(hex)=>new T.MeshStandardMaterial({color:hex,emissive:hex,emissiveIntensity:.35,roughness:.3,metalness:.15});
 const cherry=lampMaterial('#ff715e'),amber=lampMaterial('#ffc77c'),cyan=lampMaterial('#a3d0fa'),green=lampMaterial('#b2ddc4');
 const add=(geometry,material,x=0,y=0,z=0,shadow=true)=>{
  const o=new T.Mesh(geometry,material);o.position.set(x,y,z);
  o.castShadow=shadow;o.receiveShadow=true;scene.add(o);return o;
 };
 const box=(x,y,z,w,h,d,mat)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z);
 const plane=(x,y,z,w,h,material)=>add(new T.PlaneGeometry(w,h),material,x,y,z,false);
 const cyl=(x,y,z,r,height,mat,n=32)=>{
  const o=add(new T.CylinderGeometry(r,r,height,n),mat,x,y,z);
  o.rotation.x=PI/2;return o;
 };
 const ring=(x,y,z,major,tube,mat)=>{
  const o=add(new T.TorusGeometry(major,tube,10,40),mat,x,y,z);
  return o;
 };
 function label(text,color='#ffddaa',size=64,w=512,h=130,sharp=false){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d');c.clearRect(0,0,w,h);
  c.textAlign='center';c.textBaseline='middle';
  c.font='900 '+size+'px Impact,"Arial Narrow",Arial,sans-serif';
  c.lineJoin='round';c.fillStyle=color;
  // Avoid blurred lettering: the light comes from the 3D frame, not from a
  // 15-pixel shadow baked into a low-resolution canvas texture.
  c.shadowBlur=sharp?0:2;
  if(sharp&&c.strokeText){
   c.lineWidth=Math.max(3,Math.round(size*.038));
   c.strokeStyle='#311b27';
   c.strokeText(text,w/2,h/2,w-30);
  }
  c.fillText(text,w/2,h/2,w-30);
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=Math.min(renderer.capabilities?.getMaxAnisotropy?.()||4,8);
  texture.minFilter=T.LinearMipmapLinearFilter;
  texture.magFilter=T.LinearFilter;
  return new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 }
 // The marquee is one cohesive high-resolution printed sign, not two
 // independently stretched low-resolution glow labels. Native text strokes
 // remain readable at small desktop table sizes.
 function cabinetMarquee(){
  // Transparent artwork: only neon tubing and small gold wings. No sign rectangle.
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=560;
  const c=canvas.getContext('2d');c.clearRect(0,0,2048,560);
  c.lineCap='round';c.lineJoin='round';
  for(const side of [-1,1]){
   for(let i=0;i<3;i++){
    const y=216+i*49;
    const x1=side<0?77:1805,x2=side<0?237:1971;
    c.shadowColor='#f3c74f';c.shadowBlur=29;
    c.strokeStyle='#b78024';c.lineWidth=19;
    c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);c.stroke();
    c.shadowBlur=13;c.strokeStyle='#ffe3a0';c.lineWidth=7;
    c.beginPath();c.moveTo(x1+8,y-2);c.lineTo(x2-8,y-2);c.stroke();
   }
  }
  c.textAlign='center';c.textBaseline='middle';
  // Thin italic Oxanium neon outline, not the previous heavy block-face text.
  c.font='italic 500 318px "Oxanium","Trebuchet MS",Arial,sans-serif';
  c.shadowColor='#ee1732';c.shadowBlur=84;
  c.lineWidth=31;c.strokeStyle='#760711';
  c.strokeText('NEON TILT',1024,277,1550);
  c.shadowBlur=58;c.lineWidth=20;c.strokeStyle='#ec3635';
  c.strokeText('NEON TILT',1024,277,1550);
  c.shadowBlur=26;c.lineWidth=10;c.strokeStyle='#ff4652';
  c.strokeText('NEON TILT',1024,277,1550);
  c.shadowBlur=9;c.lineWidth=4;c.strokeStyle='#fff0e6';
  c.strokeText('NEON TILT',1024,277,1550);
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=Math.min(8,renderer.capabilities?.getMaxAnisotropy?.()||4);
  texture.minFilter=T.LinearMipmapLinearFilter;
  texture.magFilter=T.LinearFilter;
  return new T.MeshBasicMaterial({
   map:texture,transparent:true,depthWrite:false,toneMapped:false,
   side:T.DoubleSide,opacity:1
  });
 }
 // Independent transparent red glow for a visible, continuous neon pulse.
 // Kept separate from gold side bars so only the NEON TILT wording breathes.
 function marqueeGlow(){
  const canvas=document.createElement('canvas');
  canvas.width=2048;canvas.height=560;
  const c=canvas.getContext('2d');
  c.clearRect(0,0,2048,560);
  c.textAlign='center';c.textBaseline='middle';c.lineCap='round';c.lineJoin='round';
  c.font='italic 500 318px "Oxanium","Trebuchet MS",Arial,sans-serif';
  c.shadowColor='#f01b36';c.shadowBlur=98;
  c.lineWidth=42;c.strokeStyle='#c51027';
  c.strokeText('NEON TILT',1024,277,1550);
  c.shadowColor='#ff3649';c.shadowBlur=64;
  c.lineWidth=23;c.strokeStyle='#f32b3e';
  c.strokeText('NEON TILT',1024,277,1550);
  c.shadowBlur=21;c.lineWidth=8;c.strokeStyle='#ff7882';
  c.strokeText('NEON TILT',1024,277,1550);
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=Math.min(8,renderer.capabilities?.getMaxAnisotropy?.()||4);
  texture.minFilter=T.LinearMipmapLinearFilter;
  texture.magFilter=T.LinearFilter;
  return new T.MeshBasicMaterial({
   map:texture,transparent:true,depthWrite:false,toneMapped:false,
   side:T.DoubleSide,blending:T.AdditiveBlending,opacity:.5
  });
 }
 // Backbox and lacquered hardwood body, with truly modelled thickness.
 const boardW=BOARD.width*SCALE,boardH=BOARD.height*SCALE;
 box(0,0,-.38,boardW+.72,boardH+.72,.88,metal('#352633',.35,.55));
 box(0,0,-.12,boardW+.16,boardH+.16,.34,cabinetRed);
 box(0,0,.05,boardW,boardH,.20,enamel);
 // Phase 4: clear classic arcade zones with original Neon Tilt artwork. The important
 // scoring zones are distinct; no more ghost NEON lettering or purple haze.
 const paint=document.createElement('canvas');
 paint.width=840;paint.height=1400;
 const p=paint.getContext('2d');
 const bg=p.createLinearGradient(0,0,0,1400);
 bg.addColorStop(0,NEON_FINISH.upper);
 bg.addColorStop(.38,NEON_FINISH.mid);
 bg.addColorStop(.76,NEON_FINISH.lower);
 bg.addColorStop(1,'#070707');
 p.fillStyle=bg;p.fillRect(0,0,840,1400);
 // Deep piano-black enamel with restrained amber reflections and fine gold dust.
 const goldSheen=p.createRadialGradient(245,435,20,245,435,620);
 goldSheen.addColorStop(0,'rgba(193,136,45,.09)');
 goldSheen.addColorStop(1,'rgba(193,136,45,0)');
 p.fillStyle=goldSheen;p.fillRect(0,0,840,1400);
 const emberSheen=p.createRadialGradient(650,920,15,650,920,440);
 emberSheen.addColorStop(0,'rgba(236,54,53,.045)');
 emberSheen.addColorStop(1,'rgba(236,54,53,0)');
 p.fillStyle=emberSheen;p.fillRect(0,0,840,1400);
 // Seeded positions: texture never crawls/flickers and costs no work per frame.
 const goldDust=seed=>{const v=Math.sin(seed*127.1+67.45)*43758.5453;return v-Math.floor(v)};
 for(let i=0;i<450;i++){
  const x=25+goldDust(i+9)*790,y=30+goldDust(i+577)*1330;
  const radius=i%23===0?1.35:i%7===0?.8:.42;
  p.beginPath();p.arc(x,y,radius,0,Math.PI*2);
  p.fillStyle=i%11===0?'rgba(255,228,150,.40)':'rgba(243,199,79,.22)';
  p.fill();
 }

 // Original Space Cadet-influenced visual hierarchy: distinct upper devices,
 // asymmetric side plastics, a central light-core and clear lower flipper play.
 // Everything is painted in one pass *under* the working machine hardware.
 function shape(points,fill,stroke='#0000',lw=3){
  p.beginPath();p.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)p.lineTo(points[i][0],points[i][1]);
  p.closePath();p.fillStyle=fill;p.fill();
  if(stroke!=='#0000'){p.strokeStyle=stroke;p.lineWidth=lw;p.stroke();}
 }
 // Upper star-map: clean original light paths with muted mid-blue graphic ink.
 p.strokeStyle='rgba(232,184,84,.16)';p.lineWidth=2;
  for(let i=0;i<3;i++){
  p.beginPath();p.moveTo(170,300+i*55);
  p.bezierCurveTo(340,282+i*55,525,304+i*52,660,310+i*48);
  p.stroke();
 }
 // Right bank: warm coral segmented moulded plastic, never chrome rails.
 shape([[707,234],[747,224],[752,264],[750,720],[717,729],[715,449]],
    '#241c12','#a27c39',4);
  p.fillStyle='#17110b';p.fillRect(718,272,19,395);
  p.strokeStyle='#a5a6b3';p.lineWidth=2;p.strokeRect(718,272,19,395);
  for(let i=0;i<7;i++){
   const y=290+i*52;
   p.fillStyle='#101929';p.fillRect(721,y,13,18);
   p.fillStyle=i%3===0?'#ffe0a8':'#b78085';
   p.fillRect(723,y+3,9,10);
   p.fillStyle='#fff0cd';p.fillRect(724,y+4,5,2);
  }
 // Left feature: flowing acrylic shield, target cluster and broad original
 // purple panels, inspired by the reference's use of visual mass.
 shape([[83,384],[102,338],[128,320],[151,337],[139,405],[118,477],
   [90,524],[73,522]],'#1b1713','#a78750',4);
  shape([[89,380],[110,346],[136,338],[124,401],[107,477],
   [82,510]],'#272017','#d2ac63',2);
 for(let i=0;i<4;i++){
  p.fillStyle=i%2?'#ffa66a':'#ffe48f';
  p.fillRect(112+i*12,410+i*40,14,24);
 }
 // Bright, original Windows-era arcade lane ink remains visible below the
 // open wireforms. These graphics do not add sensors or physical rails.
 function route(coords,color,dark){
  p.beginPath();p.moveTo(coords[0][0]*2,coords[0][1]*2);
  for(let i=1;i<coords.length;i++)p.lineTo(coords[i][0]*2,coords[i][1]*2);
  p.lineWidth=7;p.strokeStyle=dark;p.lineCap='round';p.lineJoin='round';p.stroke();
   p.lineWidth=2.1;p.strokeStyle=color;p.globalAlpha=.48;p.stroke();p.globalAlpha=1;
  // Three short, embossed arrow inserts indicate shot direction without
  // taking up the upper-half playfield like opaque ramp walls.
  for(const i of [1,Math.min(5,coords.length-2)]){
   const a=coords[i-1],b=coords[i],dx=b[0]-a[0],dy=b[1]-a[1];
   const ang=Math.atan2(dy,dx)+Math.PI/2;
   p.save();p.translate(b[0]*2,b[1]*2);p.rotate(ang);
   p.beginPath();p.moveTo(0,-11);p.lineTo(8,7);p.lineTo(0,2);
   p.lineTo(-8,7);p.closePath();
   p.fillStyle=color;p.strokeStyle='#172034';p.lineWidth=2;
   p.fill();p.stroke();p.restore();
  }
 }
 route(ORBIT_PATH,'#f3c74f','#302517');
 route(RAMP_PATH,'#ff786f','#332018');
 // Centre and Skyline are *thin dashed markings*, not additional overhead
 // pipes. They don't conceal bumpers or compete with the Power Core.
 for(const [path,color] of [[CENTER_PATH,'#e2bf75'],[SKYLINE_PATH,'#d6a95c']]){
  p.save();p.globalAlpha=.35;p.setLineDash([5,20]);p.lineWidth=3;p.strokeStyle=color;p.beginPath();
  path.forEach(([x,y],i)=>i?p.lineTo(x*2,y*2):p.moveTo(x*2,y*2));
  p.stroke();p.setLineDash([]);p.restore();
  }
  // Bumper field: a recessed six-sided mounting deck groups the three genuine
  // bumper collision zones. This is underlay only, never a new obstacle.
  shape([[221,398],[606,398],[652,550],[535,688],[305,688],[185,550]],
    '#16130e','#af8948',5);
  shape([[237,412],[589,412],[631,551],[522,671],[317,671],[207,551]],
    '#221c14','#725b34',3);
  for(const [cx,cy] of [[300,480],[518,480],[410,620]]){
   p.beginPath();p.arc(cx,cy,68,0,Math.PI*2);
   p.strokeStyle='rgba(192,209,219,.24)';p.lineWidth=6;p.stroke();
  }
  // Power Core, centre feature: vivid circular ring with 16 live 3D inserts
 // on top added below. The printed core itself stays dark and uncluttered.
 const coreX=420,coreY=920;
 const radial=p.createRadialGradient(coreX,coreY,10,coreX,coreY,91);
 radial.addColorStop(0,'#254d7f');radial.addColorStop(.5,'#173762');
 radial.addColorStop(.77,'#121b3b');radial.addColorStop(1,'#11182c');
 p.beginPath();p.arc(coreX,coreY,90,0,Math.PI*2);p.fillStyle='#14182a';p.fill();
 p.lineWidth=11;p.strokeStyle='#b77481';p.stroke();
 p.beginPath();p.arc(coreX,coreY,77,0,Math.PI*2);p.fillStyle=radial;p.fill();
 p.lineWidth=5;p.strokeStyle='#447baa';p.stroke();
 p.beginPath();p.arc(coreX,coreY,43,0,Math.PI*2);p.strokeStyle='#5c9bcd';p.lineWidth=4;p.stroke();
 // Decorative pinball target graphics: original Neon Tilt arrowhead motif.
 // These are paint only; live targets and ball collision remain above them.
 for(const [x,y,rot,col] of [
  [280,520,-.55,'#f68178'],[560,520,.55,'#f68178'],
  [275,770,-.2,'#ffcb88'],[570,770,.2,'#ffcb88']
 ]){
  p.save();p.translate(x,y);p.rotate(rot);
  shape([[-24,32],[0,-37],[24,32],[8,17],[-8,17]],col,'#1f2342',5);
  p.restore();
 }
 // Small stamped sci-fi grooves beneath the real mechanical devices.
 p.save();p.globalAlpha=.37;
 for(const [side,col] of [[-1,'#73d0fa'],[1,'#fc9dc3']]){
  p.save();p.translate(420,785);p.scale(side,1);
  p.lineWidth=4;p.strokeStyle=col;p.beginPath();
  p.moveTo(108,-48);p.lineTo(165,-24);
  p.lineTo(180,54);p.lineTo(131,96);p.stroke();
  p.lineWidth=2;
  for(let i=0;i<3;i++){
   p.beginPath();p.moveTo(112+i*11,22);p.lineTo(128+i*11,12);p.stroke();
  }
  p.restore();
 }
 p.restore();
 // A restrained cyan constellation guides the eye towards the Power Core.
 p.fillStyle='rgba(108,171,225,.72)';
 for(const [x,y] of [[320,740],[360,720],[480,720],[520,740],[345,1010],[495,1010]]){
  p.beginPath();p.arc(x,y,5,0,Math.PI*2);p.fill();
 }
 // Reinforced lower return throats follow existing outlane guides.
  // Their decorative enamel never bridges the open centre drain.
  for(const side of [-1,1]){
   p.save();p.translate(420,1190);p.scale(side,1);
   shape([[123,-133],[221,-37],[217,37],[181,32],[111,-106]],
     '#1c1813','#97743c',4);
   shape([[135,-113],[208,-33],[205,10],[180,8]],
     '#2b2217','#cba45a',2);
   p.restore();
  }
  // Symmetric lower flipper zones: strongly graphic like a classic arcade game.
 for(const side of [-1,1]){
  p.save();p.translate(420,1200);p.scale(side,1);
  shape([[74,-170],[222,-90],[235,18],[180,20]],'#251912','#c18b45',5);
  shape([[92,-139],[177,-104],[205,-18],[179,-7]],'#161410','#d4af64',4);
  p.strokeStyle='#ffbc8d';p.lineWidth=7;p.beginPath();
  p.moveTo(83,-160);p.lineTo(197,-8);p.stroke();
  p.restore();
 }
 // Device labels occupy dark areas, without blocking shots or covering rings.
 function inkLabel(text,x,y,width,color='#ffe0ad'){
  p.fillStyle='#110e0a';p.fillRect(x-width/2,y-19,width,38);
  p.strokeStyle='#af863b';p.lineWidth=2;p.strokeRect(x-width/2,y-19,width,38);
  p.font='900 26px Impact,"Arial Black",sans-serif';
  p.fillStyle=color;p.textAlign='center';p.textBaseline='middle';
  p.fillText(text,x,y,width-10);
 }
 inkLabel('N · G · S',420,365,176);
 p.font='900 20px Oxanium,Arial,sans-serif';p.fillStyle='#bcd5e8';
 p.textAlign='center';p.fillText('FLIGHT RANK',420,235);
 p.font='900 18px Oxanium,Arial,sans-serif';p.fillStyle='#bdeeff';
 p.fillText('FUEL',698,460);
 inkLabel('TARGET BANK',417,827,190);
 inkLabel('POWER CORE',420,1098,210,'#f3c74f');
 inkLabel('ORBIT',120,738,105);
 inkLabel('RAMP',656,738,105);
 inkLabel('BALL SAVE',420,1184,166);
 const floorTexture=new T.CanvasTexture(paint);floorTexture.colorSpace=T.SRGBColorSpace;floorTexture.anisotropy=Math.min(8,renderer.capabilities?.getMaxAnisotropy?.()||4);floorTexture.minFilter=T.LinearMipmapLinearFilter;
 plane(0,0,.166,boardW,boardH,new T.MeshPhysicalMaterial({
  map:floorTexture,roughness:.27,metalness:.12,clearcoat:.83,
  clearcoatRoughness:.19,envMapIntensity:.8
 }));
 // Soft baked contact shadows give hardware physical separation without
 // additional real-time lights or opaque surfaces over the playfield.
 const shadowCanvas=document.createElement('canvas');
 shadowCanvas.width=64;shadowCanvas.height=64;
 const shadowCtx=shadowCanvas.getContext('2d');
 const shadowFalloff=shadowCtx.createRadialGradient(32,32,2,32,32,31);
 shadowFalloff.addColorStop(0,'rgba(3,6,16,.70)');
 shadowFalloff.addColorStop(.48,'rgba(3,6,16,.35)');
 shadowFalloff.addColorStop(1,'rgba(3,6,16,0)');
 shadowCtx.fillStyle=shadowFalloff;shadowCtx.fillRect(0,0,64,64);
 const shadowTexture=new T.CanvasTexture(shadowCanvas);
 const contactMaterial=new T.MeshBasicMaterial({
  map:shadowTexture,transparent:true,opacity:.72,
  depthWrite:false,side:T.DoubleSide,toneMapped:false
 });
 function contactShadow(x,y,w,h){
  const mesh=add(new T.PlaneGeometry(w,h),contactMaterial,x,y-.065,.182,false);
  mesh.receiveShadow=false;mesh.castShadow=false;
  return mesh;
 }
 // Brushed steel side rails and body sidewalls.
 for(const px of [-4.34,4.34]){
  box(px,0,.34,.18,boardH,.64,gold);
  box(px,0,.67,.06,boardH,.09,gold);
  for(const y of [6,3,0,-3,-6]){
   const screw=add(new T.SphereGeometry(.071,12,8),chrome,px,y,.78);
   screw.scale.z=.45;
  }
 }
 for(const py of [-7.12,7.12])box(0,py,.46,8.6,.16,.61,gold);
 // A floating neon wordmark, mounted over the black enamel without a framed plaque.
 const neonMarqueeMaterial=cabinetMarquee();
 const neonGlowMaterial=marqueeGlow();
 plane(0,5.48,.535,5.90,1.58,neonMarqueeMaterial);
 // Slight positive offset prevents z-fighting with the permanent, sharp tube core.
 plane(0,5.48,.548,5.90,1.58,neonGlowMaterial);
 // Collision walls stay in engine.mjs. The Space Cadet-inspired visual
 // treatment replaces metal wall wires with painted enamel / plastic edges.
 for(const point of POSTS){
  cyl(X(point.x),Y(point.y),.45,.14,.54,chrome);
  cyl(X(point.x),Y(point.y),.74,.17,.09,darkChrome);
 }
 // A low cast-metal crown traces the upper edge below the moving ball.
  // Visual-only trim never obstructs a path or introduces a phantom collider.
  const crownSteel=metal('#9b7b45',.46,.35);
  const crownShadow=metal('#19140f',.58,.15);
  const crownPath=new T.CatmullRomCurve3(
   UPPER_ARCH.map(p=>new T.Vector3(X(p.x),Y(p.y),.204)),false,'centripetal'
  );
  add(new T.TubeGeometry(crownPath,72,.045,10,false),
   crownShadow,0,0,0,false);
  const crownGlint=new T.CatmullRomCurve3(
   UPPER_ARCH.map(p=>new T.Vector3(X(p.x),Y(p.y),.228)),false,'centripetal'
  );
  add(new T.TubeGeometry(crownGlint,72,.009,8,false),
   crownSteel,0,0,0,false);
  for(const i of [2,4,6]){
   const p=UPPER_ARCH[i],xx=X(p.x),yy=Y(p.y);
   cyl(xx,yy,.25,.118,.035,crownShadow,16);
   cyl(xx,yy,.272,.057,.026,crownSteel,12);
  }
  // Real upper rollover centres with an elevated cross-bridge above each
 // lane sensor. These high mounts never create invisible ball collisions.
 const laneLamps=[],laneGateMaterials=[];
  // Three separate recessed upper bays make every real rollover readable.
  // Flat decorative plates sit below the active ball and add no colliders.
  const bayEnamel=new T.MeshPhysicalMaterial({
   color:'#101c30',roughness:.35,metalness:.26,clearcoat:.82,
   clearcoatRoughness:.17,side:T.DoubleSide
  });
  const bayTrim=metal('#637387',.37,.62);
  const bayFastener=metal('#d6bc9c',.28,.73);
 for(const l of UPPER_ROLLOVERS){
  const px=X(l.x),py=Y(l.y);
   plane(px,py,.191,1.10,1.38,bayEnamel);
   for(const by of [py-.69,py+.69])
    box(px,by,.24,1.10,.047,.055,bayTrim);
   for(const bx of [px-.55,px+.55]){
    box(bx,py,.237,.049,1.40,.05,bayTrim);
    for(const by of [py-.63,py+.63])
     cyl(bx,by,.276,.049,.035,bayFastener,10);
   }
   box(px,py,.22,.83,.63,.18,black);
  box(px,py,.35,.63,.45,.16,darkChrome);
   // Mounting shoulder and paired captive screws make each lane a
   // distinct piece of playable machine hardware.
   box(px,py+.575,.275,.91,.075,.055,crownSteel);
   for(const dx of [-.38,.38])
    cyl(px+dx,py+.575,.317,.048,.032,bayFastener,12);
   laneLamps.push(box(px,py,.48,.42,.27,.11,amber));
  plane(px,py,.56,.52,.31,label(l.label,'#2b1920',95,180,110));
  for(const d of [-.48,.48])box(px+d,py-.27,.45,.075,.78,.36,nickel);
  for(const dx of [-.35,.35]){
   box(px+dx,py+.32,.68,.065,.13,.62,darkChrome);
   cyl(px+dx,py+.32,.93,.07,.035,gold,12);
  }
  box(px,py+.32,.99,.78,.065,.055,chrome);
  const mat=new T.MeshStandardMaterial({
   color:'#e9b780',emissive:'#ee9d5c',emissiveIntensity:.16,
   roughness:.27,metalness:.08
  });
  box(px,py+.32,1.032,.27,.035,.02,mat);
  laneGateMaterials.push(mat);
 }
 // Flush cast-metal bumper island, shaped around existing sensor positions.
  // It is a visual deck; ball collisions remain exclusively in engine.mjs.
  const deckOutline=[[111,201],[305,201],[330,271],[268,347],[141,347],[87,271]];
  const deckShape=new T.Shape();
  deckOutline.forEach(([x,y],i)=>i?deckShape.lineTo(X(x),Y(y)):
   deckShape.moveTo(X(x),Y(y)));
  deckShape.closePath();
  const deckMaterial=new T.MeshPhysicalMaterial({
   color:'#19293e',metalness:.18,roughness:.43,clearcoat:.64,
   side:T.DoubleSide
  });
  add(new T.ShapeGeometry(deckShape),deckMaterial,0,0,.187,false);
  const rimPoints=deckOutline.map(([x,y])=>new T.Vector3(X(x),Y(y),.198));
  scene.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(rimPoints),
   new T.LineBasicMaterial({color:'#718296'})));
  // Phase 4K.2 — physically constructed bumpers and target-bank hardware.
 // Every centre is sourced from the unchanged physics sensors.
 const bumperSkirt=new T.MeshPhysicalMaterial({
  color:'#bfc5cb',roughness:.22,metalness:.78,clearcoat:.52
 });
 const bumperRubber=new T.MeshStandardMaterial({color:'#352637',roughness:.88});
 const bumperCollar=metal('#c7bbc0',.21,.78);
 const bumperCapMaterials=[],bumperRingMaterials=[];
 const bumperLights=[],bumperTops=[];
 for(const b of MID_BUMPERS){
  const x=X(b.x),y=Y(b.y),r=b.r*SCALE;
  contactShadow(x,y,r*2.8,r*2.8);
   ring(x,y,.226,r+.28,.019,bayTrim);
   // Stacked mounting washer, pressed metal skirt, dark rubber impact band.
  cyl(x,y,.275,r+.18,.105,black,40);
  cyl(x,y,.34,r+.145,.11,bumperSkirt,48);
  ring(x,y,.415,r+.103,.052,chrome);
  cyl(x,y,.45,r+.04,.115,bumperCollar,48);
  ring(x,y,.53,r+.015,.062,bumperRubber);
  cyl(x,y,.59,r-.075,.11,gold,48);
  // Separate luminescent halo insert and a domed translucent plastic cap.
  const edge=new T.MeshStandardMaterial({
   color:'#ffb689',emissive:'#ef5f64',emissiveIntensity:.22,
   metalness:.18,roughness:.35
  });
  ring(x,y,.675,r-.115,.036,edge);bumperRingMaterials.push(edge);
  const capMat=new T.MeshPhysicalMaterial({
   color:'#fff0d8',transparent:true,opacity:.89,metalness:.05,
   roughness:.12,clearcoat:1,clearcoatRoughness:.06,
    emissive:'#b84857',emissiveIntensity:.18,depthWrite:true
  });
  const cap=add(new T.SphereGeometry(r*.65,28,18),capMat,x,y,.69);
  cap.scale.z=.36;bumperTops.push(cap);bumperCapMaterials.push(capMat);
  // A short metal cap finial is a clear indication of depth.
  cyl(x,y,.805,r*.22,.035,chrome,20);
  for(let i=0;i<3;i++){
   const a=i*TAU/3-PI/2;
   const sx=x+Math.cos(a)*(r+.17),sy=y+Math.sin(a)*(r+.17);
   cyl(sx,sy,.422,.055,.028,gold,12);
  }
  const light=new T.PointLight('#ff866a',.75,2.3);
  light.position.set(x,y,1.1);scene.add(light);bumperLights.push(light);
 }
 // Four standing drop-target facades on a shared mechanical bank plate.
 // Their hit sensors remain unchanged: only lamps respond to real hits.
 const left=Math.min(...MID_TARGETS.map(t=>t.x));
 const right=Math.max(...MID_TARGETS.map(t=>t.x));
 const targetMid=X((left+right)/2),targetY=Y(407);
 const bankWidth=(right-left+34)*SCALE;
 contactShadow(targetMid,targetY,bankWidth+.30,1.13);
 const bankMetal=metal('#929ca8',.29,.77);
 const targetBacking=new T.MeshPhysicalMaterial({
  color:'#302b3c',roughness:.37,metalness:.32,clearcoat:.65
 });
 // The target bank receives its own low-profile engraved hardware nameplate.
  box(targetMid,Y(387),.249,bankWidth+.20,.14,.058,bankMetal);
  plane(targetMid,Y(383),.295,bankWidth*.84,.145,
   label('TARGET BANK','#e8d4bd',70,560,72,true));
  box(targetMid,targetY,.26,bankWidth,.72,.115,black);
 box(targetMid,targetY,.335,bankWidth-.13,.60,.095,bankMetal);
 box(targetMid,targetY,.40,bankWidth-.25,.47,.08,targetBacking);
 const targetLamps=[],targetStatusMaterials=[];
 for(const t of MID_TARGETS){
  const x=X(t.x),y=Y(t.y);
  box(x,y,.46,.47,.56,.16,darkChrome);
  box(x,y,.55,.365,.46,.075,rose);
  const lamp=new T.MeshStandardMaterial({
   color:'#d56f70',emissive:'#a73250',emissiveIntensity:.20,
   roughness:.29,metalness:.12
  });
  box(x,y,.603,.273,.367,.040,lamp);targetLamps.push(lamp);
  // Separate shield and status lens so the target body stays legible.
  box(x,y-.275,.49,.39,.055,.09,nickel);
  for(const dx of [-.16,.16]){
   cyl(x+dx,y+.245,.575,.039,.027,chrome,10);
  }
  const status=new T.MeshStandardMaterial({
   color:'#b57677',emissive:'#d75367',emissiveIntensity:.1,roughness:.38
  });
  cyl(x,Y(t.y-24),.29,.094,.048,status,16);
  targetStatusMaterials.push(status);
 }
 // V2.7: Real raised ball paths are represented by continuous moulded
 // channel floors and flush gold inlays, never floating metallic wire rails.
 // All lane samples derive from the physics engine's transport curves.
 const routeHardware=[];
 const laneTrim=new T.MeshPhysicalMaterial({
  color:'#d1a65b',metalness:.32,roughness:.38,side:T.DoubleSide,
  polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1
 });
 const laneBaseMaterials={
  orbit:new T.MeshPhysicalMaterial({color:'#17130d',roughness:.43,metalness:.10,
   clearcoat:.52,transparent:true,opacity:.88,side:T.DoubleSide,depthWrite:false}),
  ramp:new T.MeshPhysicalMaterial({color:'#201312',roughness:.4,metalness:.10,
   clearcoat:.58,transparent:true,opacity:.88,side:T.DoubleSide,depthWrite:false}),
  center:new T.MeshPhysicalMaterial({color:'#17140e',roughness:.5,metalness:.08,
   transparent:true,opacity:.72,side:T.DoubleSide,depthWrite:false}),
  skyline:new T.MeshPhysicalMaterial({color:'#1b170f',roughness:.5,metalness:.08,
   transparent:true,opacity:.72,side:T.DoubleSide,depthWrite:false})
 };
 function channelStrip(route,from,to,lift,mat){
  // A flat ribbon along the actual elevated ball path. Side-band geometry
  // is painted trim at the same height, not a physics wall or wireform.
  const smooth=roundedWirePoints(route.points,3);
  const edges=guideEdges({points:smooth,width:route.width});
  const vertices=[],indices=[];
  for(let i=0;i<edges.length;i++){
   const edge=edges[i],z=smooth[i].z+lift;
   for(const t of [from,to]){
    vertices.push(
     X(edge.left.x+(edge.right.x-edge.left.x)*t),
     Y(edge.left.y+(edge.right.y-edge.left.y)*t),
     z
    );
   }
   if(i){
    const n=i*2;
    indices.push(n-2,n-1,n,n-1,n+1,n);
   }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  return add(geometry,mat,0,0,0,false);
 }
 for(const route of UPPER_ROUTES){
  // The steel ball centre is path.z + UPPER_BALL_RADIUS. The floor stays
  // slightly below the sphere, with no roof obscuring it at crossings.
  channelStrip(route,0,1,-.025,laneBaseMaterials[route.kind]);
  channelStrip(route,.006,.075,-.015,laneTrim);
  channelStrip(route,.925,.994,-.015,laneTrim);
  if(route.kind!=='orbit'&&route.kind!=='ramp')continue;
  const mouth=route.entrance,mx=X(mouth.x),my=Y(mouth.y);
  const cheek=metal('#33291c',.4,.25),lip=metal('#b89555',.3,.50);
  // A wide, flat entry mouth makes the required shot obvious without
  // introducing new posts or changing the sensor capture area.
  box(mx,my,.255,.55,.19,.035,cheek);
  box(mx,my-.26,.241,.66,.08,.025,lip);
  for(const dx of [-.34,.34])box(mx+dx,my-.08,.263,.045,.26,.040,cheek);
  const entryMat=new T.MeshStandardMaterial({
   color:route.kind==='ramp'?'#ffd1c4':'#ffe5ac',
   emissive:route.kind==='ramp'?'#fa6f80':'#f5b963',
   emissiveIntensity:.33,roughness:.29,metalness:.12
  });
  ring(mx,my,.306,.182,.021,entryMat);
  plane(mx,my-.37,.247,.66,.17,label(route.kind.toUpperCase(),
   '#f3debd',55,280,70,true));
  routeHardware.push({kind:route.kind,material:entryMat});
 }
  // Mechanically faithful side lanes & slingshots, sculpted plastic guards.
 for(const [i,s] of SLINGS.entries()){
  const x=i===0?136:284,y=520;
  contactShadow(X(x),Y(y),1.65,1.04);
  const group=new T.Group();scene.add(group);
  const shape=new T.Shape();
  if(i===0){shape.moveTo(X(117),Y(500));shape.lineTo(X(164),Y(536));shape.lineTo(X(131),Y(547));}
  else{shape.moveTo(X(303),Y(500));shape.lineTo(X(256),Y(536));shape.lineTo(X(289),Y(547));}
  shape.closePath();
  const backing=new T.Mesh(new T.ExtrudeGeometry(shape,{
   depth:.09,bevelEnabled:true,bevelSegments:1,steps:1,
   bevelSize:.02,bevelThickness:.02
  }),darkChrome);
  backing.position.z=.235;backing.castShadow=true;group.add(backing);
  const coverMaterial=new T.MeshPhysicalMaterial({
    color:i===0?'#644362':'#73404f',
    metalness:.12,roughness:.29,clearcoat:1,clearcoatRoughness:.13,
    side:T.DoubleSide
   });
   const cover=new T.Mesh(new T.ExtrudeGeometry(shape,{
   depth:.10,bevelEnabled:true,bevelSegments:2,steps:1,
   bevelSize:.026,bevelThickness:.027
  }),coverMaterial);
   cover.position.z=.345;cover.castShadow=true;group.add(cover);
   // A small enameled identity inset sits on each spring-mounted sling.
   const tagX=X(i===0?137:283),tagY=Y(523);
   plane(tagX,tagY,.485,.44,.24,label(i===0?'L':'R','#ffe6c7',84,180,90,true));
  // A braced metal undertray, coloured moulding and contact rubber are
  // visually layered; actual sling collisions stay on SLINGS.
  cyl(X(i===0?131:289),Y(547),.48,.17,.10,gold,16);
  cyl(X(i===0?131:289),Y(547),.56,.095,.035,chrome,14);
 }
 // Phase 4K.1: hardware around the real lower collision segments.
 // Each guide/elastic is generated from engine.mjs and is visual-only.
 const lowerSteel=metal('#c1c9ca',.23,.90);
  const lowerShade=metal('#333a49',.43,.72);
 const lowerElastomer=new T.MeshPhysicalMaterial({
  color:'#4b303f',roughness:.74,metalness:0
 });
 const batEnamel=new T.MeshPhysicalMaterial({
  color:'#f1d8c0',roughness:.25,metalness:.19,clearcoat:.95
 });
 const batHighlight=metal('#fae9d2',.24,.54);
 function mountedRod(segment,z,r,material){
  const ax=X(segment.x1),ay=Y(segment.y1),bx=X(segment.x2),by=Y(segment.y2);
  const dx=bx-ax,dy=by-ay;
  const mesh=add(new T.CylinderGeometry(r,r,Math.hypot(dx,dy),12),
   material,(ax+bx)/2,(ay+by)/2,z);
  mesh.rotation.z=Math.atan2(dy,dx)-PI/2;
  return mesh;
 }
 // The guides now appear as continuous channel guards mounted to the
 // cabinet side, instead of four unsupported, floating silver rods.
 // The panels extend OUTSIDE their exact collision edges.
 const channelBody=new T.MeshPhysicalMaterial({
  color:'#37313b',roughness:.34,metalness:.38,clearcoat:.72,
  clearcoatRoughness:.22,side:T.DoubleSide
 });
 const channelRecess=new T.MeshPhysicalMaterial({
  color:'#111a27',roughness:.72,metalness:.08,clearcoat:.12
 });
 for(const channel of LOWER_CHANNELS){
  const pts=channel.points;
  const shape=new T.Shape();
  shape.moveTo(X(pts[0].x),Y(pts[0].y));
  for(let i=1;i<pts.length;i++)shape.lineTo(X(pts[i].x),Y(pts[i].y));
  for(let i=pts.length-1;i>=0;i--)
   shape.lineTo(X(pts[i].x+channel.outerOffset),Y(pts[i].y));
  shape.closePath();
  const panel=add(new T.ExtrudeGeometry(shape,{
   depth:.072,steps:1,bevelEnabled:true,bevelSegments:2,
   bevelSize:.017,bevelThickness:.017
  }),channelBody,0,0,.276);
  panel.receiveShadow=true;
  // Very thin continuous contact lip; dark inset visually joins the metal
  // to the side channel. Every lip segment remains on the true WALLS path.
  for(let i=1;i<pts.length;i++){
   const edge={x1:pts[i-1].x,y1:pts[i-1].y,x2:pts[i].x,y2:pts[i].y};
   mountedRod(edge,.39,.067,channelRecess);
   mountedRod(edge,.445,.028,lowerSteel);
  }
  // Two short transverse brackets and a joint washer connect the rail to
  // the moulded housing; no prominent long diagonal rods remain.
  for(const p of [pts[0],pts[1],pts[2]]){
   const anchor={x1:p.x,y1:p.y,x2:p.x+channel.outerOffset*.65,y2:p.y};
   mountedRod(anchor,.385,.034,lowerShade);
   const sx=X(p.x+channel.outerOffset*.56),sy=Y(p.y);
   cyl(sx,sy,.424,.094,.051,gold,16);
   cyl(sx,sy,.466,.047,.02,lowerSteel,12);
  }
 }
 for(const sling of LOWER_SLINGS){
  // The contact rubber is darker and wider than the narrow metal retaining
  // strip, making the impact surface readable without overpowering the table.
  mountedRod(sling,.425,.092,lowerShade);
  mountedRod(sling,.505,.079,lowerElastomer);
  for(const [px,py] of [[sling.x1,sling.y1],[sling.x2,sling.y2]]){
   cyl(X(px),Y(py),.45,.117,.089,gold,16);
   cyl(X(px),Y(py),.515,.062,.028,chrome,12);
  }
 }
 for(const post of LOWER_POSTS){
  const x=X(post.x),y=Y(post.y),r=post.r*SCALE;
  cyl(x,y,.35,r+.064,.07,lowerShade,20);
  ring(x,y,.57,r+.014,.047,lowerElastomer);
  const head=box(x,y,.82,.11,.024,.018,black);
  head.rotation.z=PI/4;
 }
 // Arcade pinball outlane kickback solenoids: gold coil housings beside
 // the actual recovery zones. The physical trigger lives only in engine.mjs.
 const kickbackLenses=[];
 for(const [side,coil] of Object.entries(KICKBACK)){
  const x=X(coil.x),y=Y(coil.y);
  cyl(x,y,.30,.234,.056,lowerShade,18);
  ring(x,y,.36,.176,.030,gold);
  const lens=new T.MeshStandardMaterial({
   color:'#806022',emissive:'#f3c74f',emissiveIntensity:1.4,
   metalness:.28,roughness:.22
  });
  cyl(x,y,.388,.119,.040,lens,20);
  plane(x,y+.32,.292,.65,.17,label('KICK', '#f3c74f',62,280,85,true));
  kickbackLenses.push({side,material:lens});
 }
 // Recessed drain mouth below the true ball drain, not a crossbar that
 // appears capable of saving the ball. Its dark opening is deliberately clear.
 const drainWell=new T.MeshPhysicalMaterial({
  color:'#070a12',roughness:.92,metalness:.05
 });
 plane(X(210),Y(686),.258,2.68,.43,lowerShade);
 plane(X(210),Y(685),.274,2.35,.28,drainWell);
 box(X(210),Y(672),.298,2.55,.036,.025,lowerSteel);
 for(const x of [155,265]){
  box(X(x),Y(684),.299,.085,.35,.045,lowerShade);
  cyl(X(x),Y(681),.338,.08,.041,gold,14);
 }
 // The return/apron is completely downstream of the active lower guides.
 // Flush original sci-fi chevrons make the lower playfield less empty.
 // They illuminate only after the corresponding actual shot was scored.
 const lowerDirectionMaterials=[];
 const arrowProfile=new T.Shape();
 arrowProfile.moveTo(0,.17);arrowProfile.lineTo(.17,-.08);
 arrowProfile.lineTo(.060,-.08);arrowProfile.lineTo(.060,-.18);
 arrowProfile.lineTo(-.060,-.18);arrowProfile.lineTo(-.060,-.08);
 arrowProfile.lineTo(-.17,-.08);arrowProfile.closePath();
 const arrowGeometry=new T.ShapeGeometry(arrowProfile);
 for(const item of LOWER_DIRECTION_INSERTS){
  const x=X(item.x),y=Y(item.y);
  cyl(x,y,.203,.246,.028,darkChrome,24);
  ring(x,y,.235,.218,.025,chrome);
  const material=new T.MeshStandardMaterial({
   color:item.colour,emissive:item.colour,emissiveIntensity:.14,
   roughness:.35,metalness:.12,side:T.DoubleSide
  });
  add(arrowGeometry,material,x,y,.247,false);
  lowerDirectionMaterials.push({kind:item.kind,material});
 }
 // Shooter lane geometry and plunger hardware.
 box(X(382),Y(575),.2,.53,4.0,.18,black);
 for(let y=540;y<660;y+=13)box(X(382),Y(y),.35,.32,.05,.02,gold);
 const plungerHandle=box(X(382),Y(660),.46,.44,.3,.56,nickel);
 // Physical bats taper towards the tip. The broad pivot end and
 // narrower contact tip replace the uniform cylinders of the first pass.
 const flipperMeshes=[],flipperRubberMeshes=[],flipperInlays=[],flipperAimMarkers=[];
 function taperedBat(baseWidth,tipWidth,depth){
  const outline=new T.Shape();
  outline.moveTo(-baseWidth,-.49);
  outline.bezierCurveTo(-baseWidth*1.19,-.67,-baseWidth*.59,-.72,0,-.72);
  outline.bezierCurveTo(baseWidth*.59,-.72,baseWidth*1.19,-.67,baseWidth,-.49);
  outline.lineTo(tipWidth,.55);
  outline.quadraticCurveTo(tipWidth*.76,.72,0,.72);
  outline.quadraticCurveTo(-tipWidth*.76,.72,-tipWidth,.55);
  outline.closePath();
  return new T.ExtrudeGeometry(outline,{
   depth,steps:1,bevelEnabled:true,bevelSegments:2,
   bevelSize:.01,bevelThickness:.014
  });
 }
 const rubberBat=taperedBat(.235,.150,.095);
 const enamelBat=taperedBat(.186,.116,.105);
 const enamelStripe=taperedBat(.040,.025,.018);
 for(const f of LOWER_FLIPPER_BASES){
  const x=X(f.x),y=Y(f.y);
  flipperRubberMeshes.push(add(rubberBat,lowerElastomer,x,y,.495));
  flipperMeshes.push(add(enamelBat,batEnamel,x,y,.578));
  flipperInlays.push(add(enamelStripe,batHighlight,x,y,.694));
  const aimMaterial=new T.MeshStandardMaterial({
   color:'#ffd58a',emissive:'#ff9b58',emissiveIntensity:.62,
   metalness:.28,roughness:.31
  });
  flipperAimMarkers.push(ring(x,y,.724,.085,.022,aimMaterial));
  // Stationary plated pivot housing with a visible fixed fastener.
  cyl(x,y,.42,.31,.17,lowerShade,32);
  cyl(x,y,.62,.242,.095,rose,32);
  cyl(x,y,.75,.175,.09,chrome,32);
  ring(x,y,.80,.122,.026,gold);
  box(x,y,.852,.115,.019,.016,darkChrome).rotation.z=.4;
 }
 const ball=add(new T.SphereGeometry(BOARD.radius*SCALE,28,20),chrome,0,0,.56);
 ball.castShadow=true;
 const extraBallMeshes=[ball.clone(),ball.clone()];
 for(const extra of extraBallMeshes){extra.castShadow=true;extra.visible=false;scene.add(extra);}
 const goldLamps=[];
 for(const [i,pos] of [[104,458],[306,458],[112,560],[310,560],[196,554]].entries()){
  const g=add(new T.SphereGeometry(.075,12,10),i%2?cyan:amber,X(pos[0]),Y(pos[1]),.34);
  const light=new T.PointLight(i%2?'#9fc4ff':'#ffc18d',.38,1.8);
  light.position.set(X(pos[0]),Y(pos[1]),.85);scene.add(light);goldLamps.push(g);
 }


 // Phase 3F — soft additive luminous haloes. Emissive materials alone do NOT
 // bloom in normal Three.js; a procedurally generated radial texture supplies
 // the visible halo without a costly multi-pass postprocessing chain.
 const glowCanvas=document.createElement('canvas');
 glowCanvas.width=128;glowCanvas.height=128;
 const gc=glowCanvas.getContext('2d');
 const gradient=gc.createRadialGradient(64,64,1,64,64,63);
 gradient.addColorStop(0,'rgba(255,255,255,1)');
 gradient.addColorStop(.13,'rgba(255,255,255,.92)');
 gradient.addColorStop(.33,'rgba(255,255,255,.34)');
 gradient.addColorStop(.68,'rgba(255,255,255,.08)');
 gradient.addColorStop(1,'rgba(255,255,255,0)');
 gc.fillStyle=gradient;gc.fillRect(0,0,128,128);
 const glowTexture=new T.CanvasTexture(glowCanvas);
 glowTexture.colorSpace=T.SRGBColorSpace;
 const halos=[];
 function halo(px,py,z,size,color,base=.55){
  const material=new T.MeshBasicMaterial({
   color,map:glowTexture,transparent:true,opacity:base,
   blending:T.AdditiveBlending,depthWrite:false,depthTest:true,
   side:T.DoubleSide,toneMapped:false
  });
  const mesh=plane(px,py,z,size,size,material);
  mesh.renderOrder=4;
  halos.push({mesh,material,base});
  return material;
 }
 // Bulb glows are behind the 3D ball but remain visible over playfield enamel.
 for(const b of BUMPERS)halo(X(b.x),Y(b.y),.99,1.52,'#ff7a5b',.5);
 for(const l of LANES)halo(X(l.x),Y(l.y),.67,.78,'#ffc879',.45);
 for(const t of TARGETS)halo(X(t.x),Y(t.y),.70,.62,'#ff7b8e',.33);
 halo(X(SPINNER.x),Y(SPINNER.y),.72,1.2,'#ffd38d',.46);
 halo(X(SCOOP.x),Y(SCOOP.y),.52,1.4,'#ff4a9b',.62);

 // Phase 3E — incandescent-style lamp field (actual mesh bezels, lenses and
 // emissive materials; the moving ball remains in front of the inserts).
 const insertSpecs=[
  [142,131,'rank',0],[176,131,'rank',1],[210,131,'rank',2],[244,131,'rank',3],[278,131,'rank',4],
  [349,252,'fuel',5],[349,272,'fuel',4],[349,292,'fuel',3],[349,312,'fuel',2],[349,332,'fuel',1],
  [80,209,'top',0],[172,180,'top',1],[246,180,'top',2],[332,213,'top',0],
  [107,268,'bumper',0],[305,268,'bumper',1],
  [87,346,'orbit',0],[96,447,'orbit',1],
  [330,340,'ramp',0],[316,466,'ramp',1],
  [139,390,'target',0],[276,392,'target',1],
  [207,423,'center',1],[128,376,'skyline',2],
  [153,456,'mission',0],[261,456,'mission',2],
  [109,552,'lower',0],[209,558,'save',0],[315,552,'lower',1],
  [98,607,'lower',1],[321,607,'lower',2]
 ];
 const insertModes={top:0,bumper:1,orbit:2,ramp:3,target:4,mission:5,lower:6,save:7,center:8,skyline:9};
 const insertMeshes=[],insertColors=['#ffc66e','#fa6377','#66d9ff','#ff93d2'];
 for(let i=0;i<insertSpecs.length;i++){
  const [x,y,group,phase]=insertSpecs[i],cx=X(x),cy=Y(y);
  const bezel=metal('#8d7d8a',.26,.82);
  cyl(cx,cy,.205,.145,.058,bezel,16);
  const color=insertColors[(phase+i)%insertColors.length];
  const material=new T.MeshStandardMaterial({
   color,emissive:color,emissiveIntensity:.22,roughness:.28,metalness:.06
  });
  const lens=cyl(cx,cy,.245,.106,.048,material,20);
  // Each insert is a small real 3D light source with a larger additive aura.
  const glowMat=halo(cx,cy,.39,.53,color,.22);
  insertMeshes.push({lens,material,glowMat,group,phase,i});
 }
 // Directional arrows with true geometric arrow-head inserts.
 const arrowMesh=[];
 const arrowPositions=[
  [93,346,'orbit',-.18],[321,350,'ramp',.22],
  [204,347,'spinner',0],[208,416,'center',0],
  [125,360,'skyline',-.14],[312,433,'scoop',.25],
  [212,386,'target',0],
  [136,568,'lower',0],[282,568,'lower',0]
 ];
 for(let i=0;i<arrowPositions.length;i++){
  const [x,y,group,rot]=arrowPositions[i];
  const shape=new T.Shape();
  shape.moveTo(0,.22);shape.lineTo(.20,-.07);shape.lineTo(.09,-.07);
  shape.lineTo(.09,-.24);shape.lineTo(-.09,-.24);
  shape.lineTo(-.09,-.07);shape.lineTo(-.20,-.07);shape.closePath();
  const material=new T.MeshStandardMaterial({
   color:'#8d7247',
   emissive:'#f3c74f',emissiveIntensity:.22,
   metalness:.18,roughness:.24,side:T.DoubleSide
  });
  const arrow=add(new T.ShapeGeometry(shape),material,X(x),Y(y),.235,false);
  arrow.rotation.z=rot;
  const glowMat=group==='lower'?null:halo(X(x),Y(y),.292,.75,'#ec3635',.06);
  arrowMesh.push({arrow,material,glowMat,group,i});
 }
 // Stacked translucent guide plastics and metal hardware strengthen the
 // impression of a physically assembled cabinet.
 const shroudMat=new T.MeshPhysicalMaterial({color:'#25201d',metalness:.18,roughness:.32,
   clearcoat:.88,transparent:true,opacity:.83,side:T.DoubleSide,depthWrite:false});
 for(const side of [-1,1]){
  const x=side===-1?104:315;
  box(X(x),Y(509),.38,.95,.40,.14,shroudMat);
  for(const px of [x-18,x+18]){
   cyl(X(px),Y(525),.39,.10,.3,chrome,12);
   const top=cyl(X(px),Y(525),.55,.15,.07,black,14);
   top.castShadow=true;
  }
  const cover=box(X(x),Y(589),.31,.84,.22,.12,shroudMat);
  cover.rotation.z=side*.33;
 }
 // A spinner has a metal pivot, thin rotating leaf and an observable shaft.
 const spX=X(SPINNER.x),spY=Y(SPINNER.y);
 const spinnerPivot=new T.Group();
 spinnerPivot.position.set(spX,spY,.65);scene.add(spinnerPivot);
 for(const offset of [-.56,.56]){
  box(spX+offset,spY,.60,.10,.32,.55,nickel);
  cyl(spX+offset,spY,.9,.11,.12,chrome,12);
 }
 const spinnerAxle=add(new T.CylinderGeometry(.055,.055,1.13,12),chrome,spX,spY,.79);
 spinnerAxle.rotation.z=PI/2;
 const spinnerPaddle=new T.Mesh(
  new T.BoxGeometry(.77,.58,.067),
  new T.MeshPhysicalMaterial({color:'#d4a66f',metalness:.72,roughness:.24,clearcoat:.7})
 );
 spinnerPaddle.position.set(0,0,0);spinnerPivot.add(spinnerPaddle);
 // The scoop is a recessed ring with an illuminated red inner cup.
 const scx=X(SCOOP.x),scy=Y(SCOOP.y);
 cyl(scx,scy,.205,.45,.055,black,32);
 ring(scx,scy,.270,.31,.09,chrome);
 const scoopLens=add(new T.CylinderGeometry(.23,.23,.04,32),
  new T.MeshStandardMaterial({color:'#481d32',emissive:'#d53f6a',emissiveIntensity:.23,roughness:.6}),scx,scy,.235);
 scoopLens.rotation.x=PI/2;
 for(const dx of [-.44,.44]){
  box(scx+dx,scy,.45,.08,.75,.39,darkChrome);
 }
 // Moulded original left and right acrylic panels, not metal tube rails.
 const leftAcrylic=new T.MeshPhysicalMaterial({color:'#24201c',metalness:0,
   roughness:.25,clearcoat:.95,transparent:true,opacity:.72,
  side:T.DoubleSide,depthWrite:false});
 const rightAcrylic=new T.MeshPhysicalMaterial({color:'#432323',metalness:.08,
   roughness:.3,clearcoat:.93,side:T.DoubleSide});
 function molded(points,material,z=.34){
  const shape=new T.Shape();
  for(let i=0;i<points.length;i++){
   const [px,py]=points[i];
   if(i)shape.lineTo(X(px),Y(py));else shape.moveTo(X(px),Y(py));
  }
  shape.closePath();
  return add(new T.ExtrudeGeometry(shape,{depth:.1,bevelEnabled:true,
   bevelThickness:.03,bevelSize:.02,bevelSegments:2}),material,0,0,z);
 }
 molded([[39,208],[46,169],[61,148],[80,159],[71,203],
   [62,249],[47,299],[37,299]],leftAcrylic);
 molded([[354,115],[369,108],[374,135],[371,346],
   [361,361],[355,292]],rightAcrylic,.26);
 // Phase 4K.2 — the signature Power Core is a recessed machine insert,
 // not a tall physical obstacle that would contradict the ball simulation.
 const powerX=X(POWER_CORE.x),powerY=Y(POWER_CORE.y);
 contactShadow(powerX,powerY,2.52,2.52);
 const coreHousing=metal('#505e72',.29,.75);
 const coreDark=metal('#182539',.5,.23);
 const coreGlass=new T.MeshPhysicalMaterial({
  color:'#3b88c2',metalness:.12,roughness:.11,clearcoat:1,
  clearcoatRoughness:.06,transparent:true,opacity:.91,
  emissive:'#2365a2',emissiveIntensity:.15
 });
 cyl(powerX,powerY,.20,1.02,.078,black,56);
 cyl(powerX,powerY,.264,.96,.075,coreHousing,56);
 ring(powerX,powerY,.316,.915,.045,chrome);
 cyl(powerX,powerY,.308,.81,.047,coreDark,56);
 cyl(powerX,powerY,.34,.68,.045,coreGlass,56);
 ring(powerX,powerY,.393,.62,.035,chrome);
 const coreHaloMaterial=new T.MeshStandardMaterial({
  color:'#73c3ea',emissive:'#319be5',emissiveIntensity:.4,
  roughness:.28,metalness:.08
 });
 ring(powerX,powerY,.401,.53,.028,coreHaloMaterial);
 // Three independent, recessed arc inserts show actual Power Grid charges.
 const coreArcMaterials=[];
 for(let i=0;i<POWER_CORE.charges;i++){
  const mat=new T.MeshStandardMaterial({
   color:'#376b91',emissive:'#45aae6',emissiveIntensity:.14,
   roughness:.31,metalness:.07
  });
  const arc=add(new T.TorusGeometry(.72,.034,8,30,TAU/POWER_CORE.charges-.17),
   mat,powerX,powerY,.397,false);
  arc.rotation.z=-PI/2+i*TAU/POWER_CORE.charges+.09;
  coreArcMaterials.push(mat);
 }
 // Flush-mounted perimeter lamps and four captive bezel screws.
 const coreLightMaterials=[];
 for(let i=0;i<16;i++){
  const a=i*TAU/16-PI/2;
  const x=powerX+Math.cos(a)*.865,y=powerY+Math.sin(a)*.865;
  const mat=new T.MeshStandardMaterial({
   color:i%4?'#94bce5':'#ffd6a1',
   emissive:i%4?'#377fc7':'#ef9c63',emissiveIntensity:.20,
   roughness:.28
  });
  const lamp=add(new T.SphereGeometry(.072,10,8),mat,x,y,.36,false);
  lamp.scale.z=.32;coreLightMaterials.push(mat);
 }
 for(let i=0;i<4;i++){
  const a=i*TAU/4+PI/4;
  const x=powerX+Math.cos(a)*.985,y=powerY+Math.sin(a)*.985;
  cyl(x,y,.33,.058,.025,gold,12);
 }
 const powerLampMat=[];
 for(const [xx,yy] of [[190,462],[210,445],[230,462]]){
  const mat=new T.MeshStandardMaterial({color:'#e7b47f',
   emissive:'#ff943f',emissiveIntensity:.12,roughness:.27});
  cyl(X(xx),Y(yy),.413,.111,.04,mat,18);powerLampMat.push(mat);
 }
 // Three flush jewels show the real Power Grid charge stages.
 const gridLampMaterials=[];
 for(const g of GRID_LIGHTS){
  const x=X(g.x),y=Y(g.y);
  cyl(x,y,.211,.135,.024,chrome,20);
  const mat=new T.MeshStandardMaterial({
   color:'#86caed',emissive:'#48b9ee',emissiveIntensity:.14,
   metalness:.11,roughness:.25
  });
  cyl(x,y,.23,.098,.022,mat,20);
  gridLampMaterials.push(mat);
 }
 // Phase 4B: a real top rollover lamp bank and two restrained
 // bumper-side light runs. The upper bumper faces remain unobstructed.
 const upperBankLights=[];
 for(let i=0;i<9;i++){
   const px=72+i*34,py=131;
   const material=new T.MeshStandardMaterial({
     color:i%3===0?'#fce2a5':'#94b8ec',
     emissive:i%3===0?'#e89c5a':'#387fbb',
     emissiveIntensity:.15,roughness:.32,metalness:.05
   });
   cyl(X(px),Y(py),.31,.085,.055,material,14);
   upperBankLights.push(material);
 }
 const bumperSideLights=[];
 for(const [px,py,index] of [
   [109,235,0],[111,269,0],[306,235,1],[307,269,1],
   [165,335,2],[245,335,2]
 ]){
   const mat=new T.MeshStandardMaterial({
     color:'#ffbe87',emissive:'#e86b61',emissiveIntensity:.22,
     roughness:.36,metalness:.05
   });
   cyl(X(px),Y(py),.30,.086,.06,mat,14);
   bumperSideLights.push({mat,index});
 }
 const rightBankLights=[];
 for(let i=0;i<8;i++){
  const mat=new T.MeshStandardMaterial({color:'#f4b287',
   emissive:'#ff9062',emissiveIntensity:.2,roughness:.3});
  box(X(365),Y(143+i*31),.45,.2,.24,.08,mat);
  rightBankLights.push(mat);
 }
 // Lower slingshots get coordinated flush insert lamps; unlike decorative
 // steel rails, these are local scoring and ball-save indicators.
 const slingInsertMaterials=[];
 for(const [px,py,side] of [
   [106,537,0],[122,565,0],[161,548,0],
   [314,537,1],[298,565,1],[259,548,1]
 ]){
   const mat=new T.MeshStandardMaterial({
     color:side?'#a9dcff':'#ffbfc0',
     emissive:side?'#6fb8ed':'#ef6480',emissiveIntensity:.20,
     metalness:.04,roughness:.35
   });
   cyl(X(px),Y(py),.34,.12,.055,mat,18);
   slingInsertMaterials.push({mat,side});
 }
 // The jackpot scoop has a physical horseshoe guard and a thicker metal rim.
 const jackpotGuard=metal('#b79eaa',.25,.79);
 for(const side of [-1,1]){
  const px=SCOOP.x+side*22;
  box(X(px),Y(SCOOP.y-7),.51,.085,.95,.27,jackpotGuard);
  cyl(X(px),Y(SCOOP.y+15),.55,.11,.22,chrome,14);
 }
 const rushRing=halo(scx,scy,.61,1.85,'#ff539f',.23);
 // Backglass lightbars animate independently from the scrolling playfield.
 const backboxBars=[];
 for(let i=0;i<9;i++){
  const x=-2.55+i*.64;
  const bar=box(x,4.50,.54,.43,.065,.04,
   new T.MeshStandardMaterial({color:'#ff9872',emissive:'#f07165',emissiveIntensity:.4}));
  backboxBars.push(bar);
 }
 // Edge LEDs give the cabinet a cohesive arcade glow.
 const cabinetLEDs=[];
 for(const side of [-1,1]){
  for(let i=0;i<10;i++){
   const y=5.3-i*1.15;
   const dot=add(new T.SphereGeometry(.06,10,8),
    new T.MeshStandardMaterial({color:'#ffc08a',emissive:'#f67d6b',emissiveIntensity:.8}),
    side*4.33,y,.77,false);
   cabinetLEDs.push(dot);
  }
 }

 // Warm overhead LED bank, white soft fill and red cabinet-edge glow.
 scene.add(new T.AmbientLight('#c1d1ff',1.00));
 const key=new T.DirectionalLight('#ffdcbd',2.7);key.position.set(-5,4,13);
 key.castShadow=true;key.shadow.mapSize.set(compact?512:1024,compact?512:1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;
 key.shadow.camera.top=11;key.shadow.camera.bottom=-11;key.shadow.bias=-.0008;scene.add(key);
 const fill=new T.DirectionalLight('#b4d6ff',1.30);fill.position.set(5,-6,11);scene.add(fill);
 const rim=new T.PointLight('#ff4e64',8,14);rim.position.set(3,3,5);scene.add(rim);
 const sparkle=new T.PointLight('#ffbb6b',6,10);sparkle.position.set(-4,-2,4);scene.add(sparkle);
 // The rendered canvas inherits the parent aspect ratio, not the browser width.
 let lastW=0,lastH=0,disposed=false,renderedSpin=0,previousFrame=0;
 function resize(){
  const rect=host.getBoundingClientRect(),w=Math.max(2,Math.round(rect.width)),h=Math.max(2,Math.round(rect.height));
  if(w===lastW&&h===lastH)return;
  lastW=w;lastH=h;
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
 }
 function update(engine,{bumperFlash=null,tableFlash=null,reducedMotion=false}={}){
  if(disposed)return;
  resize();
  const activeBalls=engine.balls?.length?engine.balls:(engine.ball?[engine.ball]:[]);
  for(const [i,mesh] of [ball,...extraBallMeshes].entries()){
   const b=activeBalls[i];
   mesh.visible=Boolean(b);
   if(!b)continue;
   mesh.position.set(X(b.x),Y(b.y),b.mode==='scoop'?.31:.62);
   if(b.mode==='shooter')mesh.position.z=.55;
   if(b.mode==='scoop')mesh.position.z=.31;
   if(b.mode==='travel')
    mesh.position.z=Math.max(.55,(b.travelHeight||.39)+UPPER_BALL_RADIUS);
  }
  // LEDs expose the one-use outlane recovery charge in actual gameplay.
  for(const {material} of kickbackLenses){
   const ready=engine.kickbackReady&&!engine.tilted;
   material.emissiveIntensity=ready?(reducedMotion?1.8:1.35+.45*Math.sin(performance.now()*.004)):.07;
  }
  for(let i=0;i<engine.flippers.length;i++){
   const f=engine.flippers[i],sgn=f.side==='left'?1:-1;
   const dx=sgn*Math.cos(f.a)*f.length*SCALE,dy=-Math.sin(f.a)*f.length*SCALE;
   const cx=X(f.x)+dx/2,cy=Y(f.y)+dy/2;
   const angle=Math.atan2(dy,dx)-PI/2;
   for(const [mesh,z] of [
    [flipperRubberMeshes[i],.495],[flipperMeshes[i],.578],[flipperInlays[i],.694]
   ]){
    mesh.position.set(cx,cy,z);
    mesh.rotation.set(0,0,angle);
     mesh.scale.y=f.length/71; // 3D bat geometry matches its 2D collider
   }
   const marker=flipperAimMarkers[i];
   marker.position.set(X(f.x)+dx*FLIPPER_SWEET_SPOT,Y(f.y)+dy*FLIPPER_SWEET_SPOT,.724);
   marker.material.emissiveIntensity=(f.side==='left'?engine.leftHeld:engine.rightHeld) ? .95 : .48;
  }
  for(let i=0;i<laneLamps.length;i++){
   const active=engine.lanes.has(i)||engine.missions.lanes;
   laneLamps[i].material=active?amber:rubber;
   laneGateMaterials[i].emissiveIntensity=active?1.9:.16;
  }
  const mid=midTableState(engine);
  const gridLit=gridIllumination(engine);
  for(let i=0;i<gridLampMaterials.length;i++)
   gridLampMaterials[i].emissiveIntensity=gridLit[i]?2.35:.16;
  for(const {kind,material} of lowerDirectionMaterials)
   material.emissiveIntensity=directionInsertActive(engine,kind)?2.1:.20;
  for(let i=0;i<targetLamps.length;i++){
   const lit=mid.targets[i];
   targetLamps[i].emissiveIntensity=lit?2.05:.17;
   targetStatusMaterials[i].emissiveIntensity=lit?2.7:.12;
   targetLamps[i].color.set(lit?'#ffe5b3':'#d56f70');
  }
  const now=performance.now();
  const eventFlash=tableFlash?.until>now&&!reducedMotion
    ?Math.max(0,(tableFlash.until-now)/(tableFlash.duration||600))
    :0;
  for(let i=0;i<bumperLights.length;i++){
   const hit=bumperFlash?.index===i&&bumperFlash.until>now;
   bumperLights[i].intensity=hit?4.2:mid.frenzy?1.75:.45;
   bumperCapMaterials[i].emissiveIntensity=hit?2.4:mid.frenzy?1.05:.16;
   bumperRingMaterials[i].emissiveIntensity=hit?3.1:mid.frenzy?1.55:.22;
   bumperTops[i].scale.z=hit&&!reducedMotion?.32:.36;
  }

  const idleMode=engine.state==='ready'||engine.state==='gameover';
  const rampActive=engine.lastShot?.kind==='ramp'&&engine.time-engine.lastShot.at<2;
  const orbitActive=engine.lastShot?.kind==='orbit'&&engine.time-engine.lastShot.at<2;
  for(const route of routeHardware){
   const state=shotIndicatorState(engine,route.kind);
   const active=state==='mission'||state==='jackpot';
   const recent=state==='confirmed';
   const strength=shotIndicatorBrightness(state,now/1000,reducedMotion);
   route.material.emissive.set(active?'#ec3635':recent?'#ffdf92':'#a17b41');
   route.material.emissiveIntensity=active?1.8+1.4*strength:recent?2.1:.24;
  }
  const frenzyActive=engine.time<engine.frenzyUntil;
  const multiplierActive=engine.time<engine.multiplierUntil;
  const ballSaveActive=engine.state==='playing'&&engine.ballLaunchedAt!==null&&!engine.ballSaveUsed&&engine.time<engine.ballSaveUntil;
  const stageTime=reducedMotion?0:engine.time;
  for(const ins of insertMeshes){
   const phase=stageTime*3.2-ins.phase*.8-ins.i*.45;
   const chasing=reducedMotion?.75:idleMode?.5+.5*Math.sin(now*.005-ins.i*.56):.27+.18*Math.sin(phase);
   let active=false;
   if(ins.group==='bumper')active=frenzyActive;
   if(ins.group==='ramp')active=rampActive||engine.hurryUpUntil>engine.time;
   if(ins.group==='center')active=engine.lastShot?.kind==='center' && engine.time-engine.lastShot.at<6;
   if(ins.group==='skyline')active=engine.lastShot?.kind==='skyline' && engine.time-engine.lastShot.at<6;
   if(ins.group==='orbit')active=orbitActive||engine.comboCount>=2;
   if(ins.group==='target')active=engine.missions.targets;
   if(ins.group==='mission')active=multiplierActive||engine.missions.ride||engine.powerCharges>0;
   if(ins.group==='save')active=ballSaveActive||engine.streakShieldReady;
   if(ins.group==='top')active=engine.missions.lanes||engine.lanes.size>0;
   if(ins.group==='rank')active=ins.phase<=engine.rankIndex;
   if(ins.group==='fuel')active=engine.commandMissionReady||ins.phase<=Math.ceil(engine.commandFuelRatio*5);
   ins.material.emissiveIntensity=active?3.4:ins.group==='fuel'?.12:(idleMode?.9+2.1*chasing:.65+.85*chasing);
   ins.glowMat.opacity=Math.min(1,(active?.82:ins.group==='fuel'?.06:(idleMode?.18+.56*chasing:.18+.3*chasing))+eventFlash*.36);
  }
  // Halos over the three pop bumpers, upper rollover lanes, four targets,
  // spinner and scoop reflect player action and attract-mode light sequences.
  for(let i=0;i<halos.length;i++){
   if(i<3){
    const hit=bumperFlash?.index===i&&bumperFlash.until>now;
    halos[i].material.opacity=hit?1:frenzyActive?.88:idleMode?.45+.22*Math.sin(now*.004+i*2):.43;
   }else if(i<6){
    const laneIndex=i-3;
    halos[i].material.opacity=engine.lanes.has(laneIndex)||engine.missions.lanes?.92:
      idleMode?.3+.36*(.5+.5*Math.sin(now*.005-i)): .28;
   }else if(i<10){
    halos[i].material.opacity=engine.targets.has(i-6)||engine.missions.targets?.81:.33;
   }else if(i===10){
    halos[i].material.opacity=engine.spinnerTurns>0?.75:idleMode?.38+.24*Math.sin(now*.006):.35;
   }else if(i===11){
    halos[i].material.opacity=engine.ball?.mode==='scoop'?1:
      idleMode?.6+.26*Math.sin(now*.005):.52;
   }
  }
  // Fixed mechanical lamps show charge, hurry-up and spinner mode.
  const rush=engine.hurryUpUntil>engine.time;
  const overdrive=engine.overdriveUntil>engine.time;
  const beat=reducedMotion?1:(.65+.35*Math.sin(now*.014));
  // Controlled states: slow attract chase, shot guiding, mode illumination,
  // brief full-table celebration. Reduced motion shows steady lamps.
  const chase=Math.floor(now/(reducedMotion?100000:155));
  const upperChase=Math.floor(now/(reducedMotion?100000:220));
  const launchChase=engine.state==='playing'&&engine.ball?.mode==='live'&&
    engine.ballLaunchedAt!==null&&engine.time-engine.ballLaunchedAt<2.5;
  for(let i=0;i<upperBankLights.length;i++){
    const slot=Math.floor(i/3);
    const marked=engine.lanes.has(slot)||engine.missions.lanes;
    const chaseOn=idleMode?i===upperChase%upperBankLights.length:
      launchChase?i===upperChase%upperBankLights.length:false;
    upperBankLights[i].emissiveIntensity=eventFlash?2.7:
      marked?1.9:chaseOn?1.6:.22;
  }
  for(const {mat,index} of bumperSideLights){
    const hit=bumperFlash?.index===index&&bumperFlash.until>now;
    mat.emissiveIntensity=hit?3.9:
      frenzyActive?1.85*(reducedMotion?1:beat):
      idleMode?.35:.30;
  }
  const saveLight=engine.state==='playing'&&
    engine.ballLaunchedAt!==null&&!engine.ballSaveUsed&&
    engine.time<engine.ballSaveUntil;
  for(const {mat,side} of slingInsertMaterials){
    mat.emissiveIntensity=eventFlash?2.45:
      saveLight?(reducedMotion?1.65:1.15+beat*.8):
      idleMode?.45:(side===0?.30:.22);
  }
  coreHaloMaterial.emissiveIntensity=eventFlash?3:
    mid.rush?2.4*(reducedMotion?1:beat):
    mid.charges>0?1+mid.charges*.3:
    idleMode?(reducedMotion?.7:.65+.25*Math.sin(now*.002)):.65;
  coreGlass.emissiveIntensity=mid.rush?1.75*(reducedMotion?1:beat):
    mid.charges>0?.25+.16*mid.charges:.13;
  for(let i=0;i<coreArcMaterials.length;i++)
   coreArcMaterials[i].emissiveIntensity=mid.rush?2.8*(reducedMotion?1:beat):
    i<mid.charges?2.2:.13;
  for(let i=0;i<coreLightMaterials.length;i++){
   const current=engine.powerCharges>0&&i<engine.powerCharges*5;
   const travel=i===chase%16||i===(chase+1)%16;
   coreLightMaterials[i].emissiveIntensity=eventFlash?3.2*beat:
    rush?2.8*beat:frenzyActive?2*beat:current?1.7:
    idleMode&&travel?2.2:(idleMode?.3:.55);
  }
  for(let i=0;i<rightBankLights.length;i++){
   const active=idleMode?i===Math.floor(now/240)%8:
    rush?i%2===Math.floor(now/240)%2:
    i<Math.min(8,engine.powerCharges*2+1);
   rightBankLights[i].emissiveIntensity=eventFlash?3.0:
    active?(reducedMotion?1.3:2*beat):.2;
  }
  for(let i=0;i<powerLampMat.length;i++){
   const lit=engine.powerCharges>i;
   powerLampMat[i].emissiveIntensity=lit?(rush?3.7*beat:2.35):.11;
  }
  rushRing.opacity=rush?.89*beat:engine.state==='ready'?.18:.12;
  // Forward-looking shot guide. Next mission shot and available jackpots
  // pulse red; completed jackpots dim. No new sensors, scoring or collisions.
  for(const a of arrowMesh){
   if(a.group==='lower')continue;
   const state=shotIndicatorState(engine,a.group);
   const strength=shotIndicatorBrightness(state,now/1000,reducedMotion);
   const urgent=state==='mission'||state==='jackpot';
   a.material.color.set(urgent?'#fff2c7':state==='confirmed'?'#ffe0a0':'#8d7247');
   a.material.emissive.set(urgent?'#ec3635':state==='confirmed'?'#f3c74f':'#bb8c4b');
   a.material.emissiveIntensity=.13+3.1*strength;
   if(a.glowMat){
    a.glowMat.color.set(urgent?'#ec3635':'#d6ad63');
    a.glowMat.opacity=urgent?.20+.58*strength:state==='confirmed'?.4:.06;
   }
  }
  // Animate the mechanical spinner through each full rotation, rather than
  // jumping directly to its event-driven final angle.
  const spinDelta=previousFrame?Math.max(0,Math.min(.05,(now-previousFrame)/1000)):0;
  previousFrame=now;
  if(reducedMotion)renderedSpin=engine.spinnerAngle;
  else renderedSpin+=Math.min(Math.max(0,engine.spinnerAngle-renderedSpin),spinDelta*22);
  if(engine.spinnerAngle<renderedSpin)renderedSpin=engine.spinnerAngle;
  spinnerPivot.rotation.x=renderedSpin;
  plungerHandle.position.y=Y(660)-(engine.charging?Math.max(0,engine.charge-.26)*.27:0);
  const scoopActive=engine.balls?.some(b=>b.mode==='scoop')||engine.ball?.mode==='scoop';
  // Real lock/super-jackpot state lights the scoop red, in both 3D and 2D.
  scoopLens.material.emissive.set(engine.lockLit||engine.multiballSuperLit?'#ec3635':'#d53f6a');
  scoopLens.material.emissiveIntensity=engine.multiballSuperLit?4.5*beat:
   engine.lockLit?3.5*beat:rush?3.9*beat:
   scoopActive?3.5:idleMode?1+.65*Math.sin(now*.004):.55;
  for(let i=0;i<cabinetLEDs.length;i++){
   const m=cabinetLEDs[i].material;
   const phase=(now*.007-i*.42);
   m.emissiveIntensity=reducedMotion?.9:
     idleMode?.6+2.8*(.5+.5*Math.sin(phase)):
       engine.multiballActive?3.4+.9*Math.sin(phase):
       frenzyActive?3.8:.9+1.35*(.5+.5*Math.sin(phase));
  }
  for(let i=0;i<backboxBars.length;i++){
   const m=backboxBars[i].material;
   m.emissiveIntensity=(reducedMotion?1:idleMode?.8+4*(.5+.5*Math.sin(now*.005-i*.85)):
     engine.missions.ride?2.5:.5+1.1*(.5+.5*Math.sin(now*.006-i*.85)))+eventFlash*4;
  }

  // The sharp neon tubes stay fully readable while their red light breathes.
  // A 2.1s smooth cycle continues during standby, live play, multiball and gameover.
  // Reduced-motion mode keeps a bright, fixed glow without flashing.
  const marqueePulse=reducedMotion?.75:.5+.5*Math.sin(now*.0030);
  neonMarqueeMaterial.opacity=1;
  neonGlowMaterial.opacity=.28+.70*marqueePulse;
  const idle=engine.state==='ready'||engine.state==='gameover';
  sparkle.intensity=(idle&&!reducedMotion?6+Math.sin(now*.002)*1.3:6)+eventFlash*8;
  rim.intensity=8+eventFlash*8;
  fill.intensity=1.30+eventFlash*.7;
  renderer.render(scene,camera);
 }
 // Don't present a blank WebGL canvas as a successfully loaded pinball table.
 // Probe the rendered framebuffer before hiding the 2D playfield underneath.
 function isFrameVisible(){
  if(disposed||lastW<10||lastH<10)return false;
  try{
   const gl=renderer.getContext();
   if(!gl||!gl.readPixels)return false;
   const pixel=new Uint8Array(4);
   // Board, cabinet and nearby lamps should have contrast well above
   // the near-black background. Several points avoid a dark material sample.
   for(const [fx,fy] of [[.5,.5],[.32,.4],[.68,.4],[.5,.28],
     [.23,.64],[.77,.64],[.5,.78]]){
    gl.readPixels(Math.floor(lastW*fx),Math.floor(lastH*fy),1,1,
     gl.RGBA,gl.UNSIGNED_BYTE,pixel);
    if(Math.max(pixel[0],pixel[1],pixel[2])>37 &&
       pixel[0]+pixel[1]+pixel[2]>95)return true;
   }
  }catch(error){console.warn('Pinball 3D frame probe unavailable.',error);}
  return false;
 }
 function dispose(){
  if(disposed)return;
  disposed=true;
  scene.traverse(o=>{if(o.isMesh)o.geometry?.dispose();});
  releaseStudio();
  renderer.dispose();renderer.domElement.remove();
 }
 return {update,resize,dispose,isFrameVisible,canvas:renderer.domElement};
}
