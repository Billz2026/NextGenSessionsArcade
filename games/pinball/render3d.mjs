/* NextGen Pinball — original real-time 3D table.
   Uses Three.js for 3D geometry and lighting; game engine remains deterministic 2D.
   Coordinates and moving physical pieces are mapped from engine.mjs. */
import {BOARD,WALLS,BUMPERS,POSTS,SLINGS,LANES,TARGETS,SHOTS,SPINNER,SCOOP,RAMP_PATH,ORBIT_PATH,CENTER_PATH,SKYLINE_PATH} from './engine.mjs?v=8';
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
 const camera=new T.PerspectiveCamera(33,0.6,.1,120);
 // Frame almost the entire physical playfield while keeping the outer rails visible.
 camera.position.set(1.05,-2.0,26.25);
 camera.lookAt(0,0,.22);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 const compact=window.matchMedia?.('(max-width: 1120px)').matches??false;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,compact?1.25:1.8));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.48;
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
 const enamel=new T.MeshPhysicalMaterial({color:'#1d263f',roughness:.29,metalness:.12,clearcoat:.95,clearcoatRoughness:.12,envMapIntensity:.8});
 const black=metal('#15131c',.47,.28),nickel=metal('#b4b7bd',.25,.85),chrome=metal('#c9d0d8',.18,.94);
 const darkChrome=metal('#606373',.34,.8),gold=metal('#c79b76',.24,.75);
 const rubber=new T.MeshStandardMaterial({color:'#bd6773',roughness:.55,metalness:.02});
 const rose=metal('#bc596d',.29,.48),plastic=new T.MeshPhysicalMaterial({
  color:'#9b7184',metalness:.06,roughness:.22,clearcoat:1,clearcoatRoughness:.12,
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
 function tube(coords,r,mat){
  const points=coords.map(([x,y,z=.4])=>new T.Vector3(X(x),Y(y),z));
  const curve=new T.CatmullRomCurve3(points);
  return add(new T.TubeGeometry(curve,Math.max(16,coords.length*8),r,9,false),mat);
 }
 function linear(x1,y1,x2,y2,r,mat,z=.35){
  const start=new T.Vector3(X(x1),Y(y1),z),end=new T.Vector3(X(x2),Y(y2),z);
  const vec=new T.Vector3().subVectors(end,start),length=vec.length();
  const object=add(new T.CylinderGeometry(r,r,length,10),mat,...start.clone().add(end).multiplyScalar(.5).toArray());
  object.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vec.normalize());
  return object;
 }
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
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=560;
  const c=canvas.getContext('2d');
  c.fillStyle='#0b101e';c.fillRect(0,0,2048,560);
  c.fillStyle='#12182a';c.fillRect(34,30,1980,500);
  c.strokeStyle='#e3af79';c.lineWidth=12;c.strokeRect(29,26,1990,508);
  c.strokeStyle='#5d3a40';c.lineWidth=4;c.strokeRect(51,49,1945,462);
  // Slim horizontal rules keep the real-world sign feel without a halo.
  c.fillStyle='#d7a16c';
  c.fillRect(285,158,320,5);c.fillRect(1443,158,320,5);
  c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  c.shadowBlur=0;c.shadowOffsetX=0;c.shadowOffsetY=0;
  c.font='900 90px "Barlow Condensed",Impact,"Arial Narrow",sans-serif';
  c.lineWidth=5;c.strokeStyle='#11141d';
  c.strokeText('NEXTGEN SESSIONS',1024,157,790);
  c.fillStyle='#fff0d7';c.fillText('NEXTGEN SESSIONS',1024,157,790);
  c.font='900 292px "Arial Black",Impact,Arial,sans-serif';
  c.lineWidth=25;c.strokeStyle='#140a13';
  c.strokeText('NEON TILT',1024,346,1880);
  // Offset underprint and bright cream cap make a chunky embossed, backlit sign.
  c.fillStyle='#85384b';c.fillText('NEON TILT',1024,365,1880);
  c.fillStyle='#ffe0bf';c.fillText('NEON TILT',1024,341,1880);
  c.fillStyle='#ff825f';c.fillText('NEON TILT',1024,335,1880);
  c.fillStyle='#e9b27d';c.fillRect(360,495,1328,9);
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=Math.min(8,renderer.capabilities?.getMaxAnisotropy?.()||4);
  texture.minFilter=T.LinearMipmapLinearFilter;
  texture.magFilter=T.LinearFilter;
  return new T.MeshBasicMaterial({map:texture,toneMapped:false,side:T.DoubleSide});
 }
 // Backbox and lacquered hardwood body, with truly modelled thickness.
 const boardW=BOARD.width*SCALE,boardH=BOARD.height*SCALE;
 box(0,0,-.38,boardW+.72,boardH+.72,.88,metal('#352633',.35,.55));
 box(0,0,-.12,boardW+.16,boardH+.16,.34,gold);
 box(0,0,.05,boardW,boardH,.20,enamel);
 // Phase 4: clear classic arcade zones with original Neon Tilt artwork. The important
 // scoring zones are distinct; no more ghost NEON lettering or purple haze.
 const paint=document.createElement('canvas');
 paint.width=840;paint.height=1400;
 const p=paint.getContext('2d');
 const bg=p.createLinearGradient(0,0,0,1400);
 bg.addColorStop(0,'#152238');
 bg.addColorStop(.37,'#161d34');
 bg.addColorStop(.70,'#191a32');
 bg.addColorStop(1,'#171626');
 p.fillStyle=bg;p.fillRect(0,0,840,1400);

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
 p.strokeStyle='rgba(105,158,216,.23)';p.lineWidth=3;
 for(let i=0;i<5;i++){
  p.beginPath();p.moveTo(170,300+i*55);
  p.bezierCurveTo(340,282+i*55,525,304+i*52,660,310+i*48);
  p.stroke();
 }
 // Right bank: warm coral segmented moulded plastic, never chrome rails.
 shape([[690,215],[746,202],[762,254],[755,874],[705,884],[711,475]],
   '#612e3f','#d16c61',9);
 p.fillStyle='#ac4853';p.fillRect(716,270,26,530);
 for(let i=0;i<9;i++){
  const y=273+i*63;
  p.fillStyle=i%3===0?'#ffe191':'#ff906d';
  p.fillRect(722,y,25,23);
  p.fillStyle='#301e39';p.fillRect(724,y+5,21,6);
 }
 // Left feature: flowing acrylic shield, target cluster and broad original
 // purple panels, inspired by the reference's use of visual mass.
 shape([[93,382],[124,328],[181,312],[232,332],[212,412],[180,456],
  [164,569],[143,611],[100,611],[112,488]],'#683c82','#ad78cb',8);
 shape([[116,390],[150,354],[198,361],[184,422],[157,478],[142,565],
  [119,558]],'#9863a3','#e1b8ef',4);
 for(let i=0;i<4;i++){
  p.fillStyle=i%2?'#ffa66a':'#ffe48f';
  p.fillRect(112+i*12,410+i*40,14,24);
 }
 // Visible left loop and right ramp are flat playfield ink with clear arrows.
 function route(coords,color,dark){
  p.beginPath();p.moveTo(coords[0][0]*2,coords[0][1]*2);
  for(let i=1;i<coords.length;i++)p.lineTo(coords[i][0]*2,coords[i][1]*2);
  p.lineWidth=22;p.strokeStyle=dark;p.lineCap='round';p.lineJoin='round';p.stroke();
  p.lineWidth=10;p.strokeStyle=color;p.stroke();
  p.lineWidth=3;p.strokeStyle='rgba(255,243,211,.62)';p.stroke();
 }
 route(ORBIT_PATH,'#f9b875','#563949');
 route(RAMP_PATH,'#ff8d98','#572943');
 // Centre and Skyline are *thin dashed markings*, not additional overhead
 // pipes. They don't conceal bumpers or compete with the Power Core.
 for(const [path,color] of [[CENTER_PATH,'#8dd8f6'],[SKYLINE_PATH,'#e3a1fa']]){
  p.setLineDash([9,15]);p.lineWidth=6;p.strokeStyle=color;p.beginPath();
  path.forEach(([x,y],i)=>i?p.lineTo(x*2,y*2):p.moveTo(x*2,y*2));
  p.stroke();p.setLineDash([]);
 }
 // Power Core, centre feature: vivid circular ring with 16 live 3D inserts
 // on top added below. The printed core itself stays dark and uncluttered.
 const coreX=420,coreY=944;
 const radial=p.createRadialGradient(coreX,coreY,10,coreX,coreY,108);
 radial.addColorStop(0,'#254d7f');radial.addColorStop(.5,'#173762');
 radial.addColorStop(.77,'#121b3b');radial.addColorStop(1,'#11182c');
 p.beginPath();p.arc(coreX,coreY,106,0,Math.PI*2);p.fillStyle='#14182a';p.fill();
 p.lineWidth=11;p.strokeStyle='#b77481';p.stroke();
 p.beginPath();p.arc(coreX,coreY,88,0,Math.PI*2);p.fillStyle=radial;p.fill();
 p.lineWidth=5;p.strokeStyle='#447baa';p.stroke();
 p.beginPath();p.arc(coreX,coreY,48,0,Math.PI*2);p.strokeStyle='#5c9bcd';p.lineWidth=4;p.stroke();
 // Symmetric lower flipper zones: strongly graphic like a classic arcade game.
 for(const side of [-1,1]){
  p.save();p.translate(420,1200);p.scale(side,1);
  shape([[74,-170],[222,-90],[235,18],[180,20]],'#492f5b','#d07894',5);
  shape([[92,-139],[177,-104],[205,-18],[179,-7]],'#292f57','#95bdd8',4);
  p.strokeStyle='#ffbc8d';p.lineWidth=7;p.beginPath();
  p.moveTo(83,-160);p.lineTo(197,-8);p.stroke();
  p.restore();
 }
 // Device labels occupy dark areas, without blocking shots or covering rings.
 function inkLabel(text,x,y,width,color='#ffe0ad'){
  p.fillStyle='#121625';p.fillRect(x-width/2,y-19,width,38);
  p.strokeStyle='#ae777c';p.lineWidth=2;p.strokeRect(x-width/2,y-19,width,38);
  p.font='900 26px Impact,"Arial Black",sans-serif';
  p.fillStyle=color;p.textAlign='center';p.textBaseline='middle';
  p.fillText(text,x,y,width-10);
 }
 inkLabel('NEON LANES',420,365,176);
 inkLabel('TARGETS',417,827,170);
 inkLabel('POWER CORE',420,1098,210,'#a9d9ff');
 inkLabel('ORBIT',120,738,105);
 inkLabel('RAMP',656,738,105);
 inkLabel('BALL SAVE',420,1184,166);
 const floorTexture=new T.CanvasTexture(paint);floorTexture.colorSpace=T.SRGBColorSpace;floorTexture.anisotropy=Math.min(8,renderer.capabilities?.getMaxAnisotropy?.()||4);floorTexture.minFilter=T.LinearMipmapLinearFilter;
 plane(0,0,.166,boardW,boardH,new T.MeshStandardMaterial({map:floorTexture,roughness:.3,metalness:.18}));
 // Brushed steel side rails and body sidewalls.
 for(const px of [-4.34,4.34]){
  box(px,0,.34,.18,boardH,.64,gold);
  box(px,0,.67,.06,boardH,.09,chrome);
  for(const y of [6,3,0,-3,-6]){
   const screw=add(new T.SphereGeometry(.071,12,8),chrome,px,y,.78);
   screw.scale.z=.45;
  }
 }
 for(const py of [-7.12,7.12])box(0,py,.46,8.6,.16,.61,darkChrome);
 // Billboard sign: original logo displayed on textured top panel, not lifted website heading.
 box(0,5.48,.3,6.25,1.95,.22,metal('#161322',.18,.62));
 box(0,5.48,.46,5.93,1.70,.03,metal('#070d20',.17,.23));
 plane(0,5.48,.535,5.79,1.58,cabinetMarquee());
 // A physically raised cast-metal marquee frame reads as a real backlit
 // cabinet assembly even without the expensive glyph-extrusion font loader.
 for(const y of [4.63,6.33])box(0,y,.62,6.14,.13,.15,gold);
 for(const x of [-3.02,3.02])box(x,5.48,.62,.13,1.75,.15,gold);
 for(const x of [-2.99,2.99])for(const y of [4.64,6.31]){
  const screw=add(new T.SphereGeometry(.085,14,10),chrome,x,y,.74);
  screw.scale.z=.55;
 }
 // Side-depth panels frame, rather than cover, the printed title.
 for(const x of [-3.18,3.18])box(x,5.48,.26,.14,2.05,.52,darkChrome);
 // Collision walls stay in engine.mjs. The Space Cadet-inspired visual
 // treatment replaces metal wall wires with painted enamel / plastic edges.
 for(const point of POSTS){
  cyl(X(point.x),Y(point.y),.45,.14,.54,chrome);
  cyl(X(point.x),Y(point.y),.74,.17,.09,darkChrome);
 }
 // Upper lane rollover pockets with genuine recess/rubber rings and animated inserts.
 const laneLamps=[];
 for(const l of LANES){
  const px=X(l.x),py=Y(l.y);
  box(px,py,.22,.83,.63,.18,black);
  box(px,py,.35,.63,.45,.16,darkChrome);
  const lamp=box(px,py,.48,.42,.27,.11,amber);laneLamps.push(lamp);
  plane(px,py,.56,.52,.31,label(l.label,'#2b1920',95,180,110));
  for(const d of [-.48,.48])box(px+d,py-.27,.45,.075,.78,.36,nickel);
 }
 // Pop bumpers: 3D stacked metal bases, concentric lenses and lit hemispheres.
 const bumperLights=[],bumperTops=[];
 for(const b of BUMPERS){
  const x=X(b.x),y=Y(b.y),r=b.r*SCALE;
  cyl(x,y,.3,r+.18,.27,darkChrome,48);
  cyl(x,y,.51,r+.11,.25,gold,48);
  cyl(x,y,.7,r-.02,.26,rose,48);
  ring(x,y,.84,r-.07,.042,chrome);
  const cap=add(new T.SphereGeometry(r*.54,28,18),amber,x,y,.85);
  cap.scale.z=.34;bumperTops.push(cap);
  const light=new T.PointLight('#ff9176',2.3,3.2);
  light.position.set(x,y,1.38);scene.add(light);bumperLights.push(light);
 }
 // Working targets: raised steel blocks, lamp inset. Dynamic lights follow scoring.
 const targetLamps=[];
 for(const t of TARGETS){
  const x=X(t.x),y=Y(t.y);
  box(x,y,.32,.35,.48,.30,darkChrome);
  const face=box(x,y,.53,.24,.34,.12,cherry);targetLamps.push(face);
  box(x,y-.39,.24,.31,.12,.16,nickel);
 }
 // No raised rails or wireforms. Four engine routes are illustrated by
 // flat, illuminated lane markings on the playfield artwork below.
 // The ball follows their existing authoritative engine trajectories.
 // Mechanically faithful side lanes & slingshots, sculpted plastic guards.
 for(const [i,s] of SLINGS.entries()){
  const x=i===0?136:284,y=520;
  const group=new T.Group();scene.add(group);
  const shape=new T.Shape();
  if(i===0){shape.moveTo(X(117),Y(500));shape.lineTo(X(164),Y(536));shape.lineTo(X(131),Y(547));}
  else{shape.moveTo(X(303),Y(500));shape.lineTo(X(256),Y(536));shape.lineTo(X(289),Y(547));}
  shape.closePath();
  const cover=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.035}),plastic);
  cover.position.z=.27;cover.castShadow=true;group.add(cover);
  // Slingshot contact rubber follows existing collision segments.
 }
 // Inlane/outlane returns are painted on the enamel rather than tubes.
 // Physical lower slings and pivot posts remain present.
 // Shooter lane geometry and plunger hardware.
 box(X(382),Y(575),.2,.53,4.0,.18,black);
 for(let y=540;y<660;y+=11)linear(373,y,391,y+5,.029,gold,.42);
 const plungerHandle=box(X(382),Y(660),.46,.44,.3,.56,nickel);
 // Flippers: full 3D paddle capsule (as opposed to flat rendered strokes).
 const flipperMeshes=[],flipperHeads=[];
 for(const f of [{side:'left',x:144,y:613,length:71},{side:'right',x:276,y:613,length:71}]){
  const paddle=add(new T.CapsuleGeometry(.18,1.06,5,12),new T.MeshPhysicalMaterial({
   color:'#e4c3af',metalness:.64,roughness:.26,clearcoat:.7,clearcoatRoughness:.12
  }),X(f.x),Y(f.y),.57);
  // Capsule's long axis is +Y; rotate around screen-normal Z to match the bat.
  flipperMeshes.push(paddle);
  cyl(X(f.x),Y(f.y),.45,.26,.26,darkChrome,32);
  const pivot=cyl(X(f.x),Y(f.y),.73,.18,.14,chrome,32);flipperHeads.push(pivot);
 }
 const ball=add(new T.SphereGeometry(BOARD.radius*SCALE,28,20),chrome,0,0,.56);
 ball.castShadow=true;
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
  [80,209,'top',0],[125,202,'top',1],[172,180,'top',2],
  [246,180,'top',0],[302,208,'top',1],[332,213,'top',2],
  [107,268,'bumper',0],[191,236,'bumper',1],[305,268,'bumper',2],
  [157,345,'bumper',0],[248,340,'bumper',1],[209,346,'bumper',2],
  [87,346,'orbit',0],[74,399,'orbit',1],[96,447,'orbit',2],
  [330,340,'ramp',0],[324,388,'ramp',1],[316,466,'ramp',2],
  [139,390,'target',0],[276,392,'target',1],
  [207,423,'center',3],[206,395,'center',1],
  [128,376,'skyline',2],[112,341,'skyline',1],
  [153,457,'mission',0],[207,460,'mission',1],[261,457,'mission',2],
  [126,487,'mission',0],[286,486,'mission',1],
  [109,552,'lower',0],[155,554,'lower',1],
  [209,544,'save',0],[258,554,'lower',2],[315,552,'lower',0],
  [98,607,'lower',1],[321,607,'lower',2],
  [170,586,'lower',0],[249,586,'lower',1]
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
  [92,319,'orbit',-.22],[93,361,'orbit',-.12],
  [315,308,'ramp',.30],[318,354,'ramp',.18],
  [180,384,'spinner',0],[229,383,'spinner',0],
  [174,480,'mission',0],[247,480,'mission',0],
  [207,418,'center',0],[125,350,'skyline',-.14],
  [136,568,'lower',0],[282,568,'lower',0]
 ];
 for(let i=0;i<arrowPositions.length;i++){
  const [x,y,group,rot]=arrowPositions[i];
  const shape=new T.Shape();
  shape.moveTo(0,.22);shape.lineTo(.20,-.07);shape.lineTo(.09,-.07);
  shape.lineTo(.09,-.24);shape.lineTo(-.09,-.24);
  shape.lineTo(-.09,-.07);shape.lineTo(-.20,-.07);shape.closePath();
  const material=new T.MeshStandardMaterial({
   color:i%2?'#c97b81':'#a99fcc',
   emissive:i%2?'#ff887a':'#a6c2ee',emissiveIntensity:.22,
   metalness:.18,roughness:.24,side:T.DoubleSide
  });
  const arrow=add(new T.ShapeGeometry(shape),material,X(x),Y(y),.235,false);
  arrow.rotation.z=rot;arrowMesh.push({arrow,material,group,i});
 }
 // Stacked translucent guide plastics and metal hardware strengthen the
 // impression of a physically assembled cabinet.
 const shroudMat=new T.MeshPhysicalMaterial({color:'#583f70',metalness:.2,roughness:.24,clearcoat:.9,transparent:true,opacity:.82,side:T.DoubleSide,depthWrite:false});
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
 // Tiny raised plaques identify the actual scoring devices.
 plane(spX,spY+.53,.29,.96,.22,label('SPIN','#f9d39a',61,220,90));
 plane(scx,scy+.58,.29,1.13,.23,label('SCOOP','#ffc2a5',57,250,90));
 // Separate screen-printed control plaques from busy mechanical hardware.
 // Dark backing plates protect the words from nearby insert glows.
 const plaqueBacking=new T.MeshBasicMaterial({color:'#111522',side:T.DoubleSide});
 for(const [txt,x,y,w] of [
  ['JACKPOT',205,492,1.75],['RAMP',315,410,1.10],
  ['ORBIT',80,411,1.10],['BALL SAVE',208,565,1.65],
  ['FRENZY',206,351,1.42],
  ['CROSS',205,443,1.28],['SKY',127,406,1.04]
 ]){
  plane(X(x),Y(y),.241,w+.20,.35,plaqueBacking);
  plane(X(x),Y(y),.245,w,.29,label(txt,'#ffe1b2',64,512,144,true));
 }
 // Power Grid has real raised illuminated three-lamp metalwork, not a fake HUD.
 // These lamps are mounted just above the target bank and register each
 // successful ramp/orbit hit. The scoop's illuminated bezel is the jackpot.
 const powerBezel=metal('#b68a6f',.22,.76),powerLampMat=[];
 box(X(208),Y(472),.32,2.15,.65,.15,darkChrome);
 const powerLampMeshes=[];
 for(let i=0;i<3;i++){
  const x=X(179+i*29),y=Y(471);
  cyl(x,y,.46,.22,.16,powerBezel,18);
  const mat=new T.MeshStandardMaterial({
   color:'#f4b878',emissive:'#ff743e',emissiveIntensity:.15,roughness:.24,metalness:.08
  });
  const lens=cyl(x,y,.585,.135,.06,mat,18);
  powerLampMeshes.push(lens);powerLampMat.push(mat);
 }
 plane(X(208),Y(491),.28,1.73,.23,
  label('POWER GRID','#ffe2ae',64,512,128,true));
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
 scene.add(new T.AmbientLight('#a4b4de',1.05));
 const key=new T.DirectionalLight('#ffdcbd',3.2);key.position.set(-5,4,13);
 key.castShadow=true;key.shadow.mapSize.set(compact?512:1024,compact?512:1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;
 key.shadow.camera.top=11;key.shadow.camera.bottom=-11;key.shadow.bias=-.0008;scene.add(key);
 const fill=new T.DirectionalLight('#b5c6ff',1.4);fill.position.set(5,-6,11);scene.add(fill);
 const rim=new T.PointLight('#ff4e64',13.5,14);rim.position.set(3,3,5);scene.add(rim);
 const sparkle=new T.PointLight('#ffbb6b',9.5,10);sparkle.position.set(-4,-2,4);scene.add(sparkle);
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
  const b=engine.ball;
  ball.visible=Boolean(b);
  if(b){
   ball.position.set(X(b.x),Y(b.y),b.mode==='scoop'?.31:.62);
   if(b.mode==='shooter')ball.position.z=.55;
   if(b.mode==='scoop')ball.position.z=.31;
  }
  for(let i=0;i<engine.flippers.length;i++){
   const f=engine.flippers[i],sgn=f.side==='left'?1:-1;
   const dx=sgn*Math.cos(f.a)*f.length*SCALE,dy=-Math.sin(f.a)*f.length*SCALE;
   flipperMeshes[i].position.set(X(f.x)+dx/2,Y(f.y)+dy/2,.59);
   // Capsule is modelled on the Y axis, rotated into XY; model orientation is
   // rotated only around screen-normal Z for correct left/right bat movement.
   flipperMeshes[i].rotation.set(0,0,Math.atan2(dy,dx)-PI/2);
  }
  for(let i=0;i<laneLamps.length;i++){
   laneLamps[i].material=engine.lanes.has(i)||engine.missions.lanes?amber:rubber;
  }
  for(let i=0;i<targetLamps.length;i++){
   targetLamps[i].material=engine.targets.has(i)||engine.missions.targets?amber:cherry;
  }
  const now=performance.now();
  const eventFlash=tableFlash?.until>now&&!reducedMotion
    ?Math.max(0,(tableFlash.until-now)/(tableFlash.duration||600))
    :0;
  for(let i=0;i<bumperLights.length;i++){
   const hit=bumperFlash?.index===i && bumperFlash.until>now;
   const frenzy=engine.time<engine.frenzyUntil;
   bumperLights[i].intensity=hit?6:frenzy?3.1:.65;
   bumperTops[i].material=hit?chrome:amber;
  }

  const idleMode=engine.state==='ready'||engine.state==='gameover';
  const rampActive=engine.lastShot?.kind==='ramp'&&engine.time-engine.lastShot.at<2;
  const orbitActive=engine.lastShot?.kind==='orbit'&&engine.time-engine.lastShot.at<2;
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
   if(ins.group==='save')active=ballSaveActive;
   if(ins.group==='top')active=engine.missions.lanes||engine.lanes.size>0;
   ins.material.emissiveIntensity=active?3.4:(idleMode?.9+2.1*chasing:.65+.85*chasing);
   ins.glowMat.opacity=Math.min(1,(active?.82:(idleMode?.18+.56*chasing:.18+.3*chasing))+eventFlash*.36);
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
  for(let i=0;i<powerLampMat.length;i++){
   const lit=engine.powerCharges>i;
   powerLampMat[i].emissiveIntensity=lit?(rush?3.7*beat:2.35):.11;
  }
  rushRing.opacity=rush?.89*beat:engine.state==='ready'?.18:.12;
  for(const a of arrowMesh){
   const on=a.group==='ramp'?rampActive:a.group==='orbit'?orbitActive:
    a.group==='center'?engine.lastShot?.kind==='center':
    a.group==='skyline'?engine.lastShot?.kind==='skyline':
    a.group==='spinner'?(overdrive||engine.spinnerTurns>0):
    a.group==='mission'?engine.missions.ride:
    engine.state==='playing';
   const pulse=reducedMotion?1:(.6+.4*Math.sin(now*.009-a.i*.5));
   a.material.emissiveIntensity=on?2.2*pulse:(idleMode?.6+.5*pulse:.22);
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
  const scoopActive=engine.ball?.mode==='scoop';
  scoopLens.material.emissiveIntensity=rush?3.9*beat:
   scoopActive?3.5:idleMode?1+.65*Math.sin(now*.004):.55;
  for(let i=0;i<cabinetLEDs.length;i++){
   const m=cabinetLEDs[i].material;
   const phase=(now*.007-i*.42);
   m.emissiveIntensity=reducedMotion?.9:
     idleMode?.6+2.8*(.5+.5*Math.sin(phase)):
       frenzyActive?3.8:.9+1.35*(.5+.5*Math.sin(phase));
  }
  for(let i=0;i<backboxBars.length;i++){
   const m=backboxBars[i].material;
   m.emissiveIntensity=(reducedMotion?1:idleMode?.8+4*(.5+.5*Math.sin(now*.005-i*.85)):
     engine.missions.ride?2.5:.5+1.1*(.5+.5*Math.sin(now*.006-i*.85)))+eventFlash*4;
  }

  const idle=engine.state==='ready'||engine.state==='gameover';
  sparkle.intensity=(idle&&!reducedMotion?9.5+Math.sin(now*.002)*2.3:9.5)+eventFlash*10;
  rim.intensity=13.5+eventFlash*10;
  fill.intensity=1.4+eventFlash*.8;
  renderer.render(scene,camera);
 }
 function dispose(){
  if(disposed)return;
  disposed=true;
  scene.traverse(o=>{if(o.isMesh)o.geometry?.dispose();});
  releaseStudio();
  renderer.dispose();renderer.domElement.remove();
 }
 return {update,resize,dispose,canvas:renderer.domElement};
}
