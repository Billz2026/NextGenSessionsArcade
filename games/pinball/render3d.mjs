/* NextGen Pinball — original real-time 3D table.
   Uses Three.js for 3D geometry and lighting; game engine remains deterministic 2D.
   Coordinates and moving physical pieces are mapped from engine.mjs. */
import {BOARD,WALLS,BUMPERS,POSTS,SLINGS,LANES,TARGETS,SHOTS} from './engine.mjs';
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
 camera.position.set(0,-6.0,29.5);
 camera.lookAt(0,0,.12);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 const compact=window.matchMedia?.('(max-width: 1120px)').matches??false;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,compact?1.25:1.8));
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.7;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.domElement.className='webgl-table';
 renderer.domElement.setAttribute('aria-hidden','true');
 renderer.domElement.style.touchAction='none';
 host.append(renderer.domElement);
 const metal=(color,roughness=.28,metalness=.9)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const enamel=new T.MeshPhysicalMaterial({color:'#17213a',roughness:.2,metalness:.17,clearcoat:.98,clearcoatRoughness:.07});
 const black=metal('#11151f',.32,.4),nickel=metal('#aebdc9',.19,.91),chrome=metal('#e6e7e9',.13,1);
 const darkChrome=metal('#414953',.27,.88),gold=metal('#e0ad72',.21,.93);
 const rubber=new T.MeshStandardMaterial({color:'#bd6773',roughness:.55,metalness:.02});
 const rose=metal('#aa4059',.21,.52),plastic=new T.MeshPhysicalMaterial({color:'#9d6876',metalness:.07,roughness:.27,transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false});
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
 function label(text,color='#ffddaa',size=64,w=512,h=130){
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const c=canvas.getContext('2d');c.clearRect(0,0,w,h);c.font='900 '+size+'px Impact,"Arial Narrow",sans-serif';
  c.textAlign='center';c.textBaseline='middle';c.shadowColor=color;c.shadowBlur=15;c.fillStyle=color;c.fillText(text,w/2,h/2,w-16);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  return new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide});
 }
 // Backbox and lacquered hardwood body, with truly modelled thickness.
 const boardW=BOARD.width*SCALE,boardH=BOARD.height*SCALE;
 box(0,0,-.38,boardW+.72,boardH+.72,.88,metal('#352633',.35,.55));
 box(0,0,-.12,boardW+.16,boardH+.16,.34,gold);
 box(0,0,.05,boardW,boardH,.20,enamel);
 // Original table artwork is an enamel print underneath mechanical fixtures.
 const paint=document.createElement('canvas');paint.width=840;paint.height=1400;
 const p=paint.getContext('2d'),bg=p.createLinearGradient(0,0,840,1400);
 bg.addColorStop(0,'#25334f');bg.addColorStop(.35,'#161a36');
 bg.addColorStop(.7,'#1a1832');bg.addColorStop(1,'#392437');
 p.fillStyle=bg;p.fillRect(0,0,840,1400);
 p.strokeStyle='rgba(237,170,133,.23)';p.lineWidth=2;
 for(let i=0;i<13;i++){p.beginPath();p.moveTo(135,230+i*82);p.quadraticCurveTo(425,195+i*78,710,245+i*77);p.stroke();}
 p.textAlign='center';
 p.fillStyle='rgba(240,133,116,.20)';p.font='900 96px Impact,sans-serif';p.fillText('NEON',416,1020);
 p.fillStyle='rgba(202,162,232,.23)';p.font='900 108px Impact,sans-serif';p.fillText('TILT',416,1115);
 for(let i=0;i<36;i++){const x=80+(i*71)%680,y=120+(i*153)%1170;p.fillStyle=i%3===0?'#705e7d':'#545873';p.fillRect(x,y,4,4);}
 const floorTexture=new T.CanvasTexture(paint);floorTexture.colorSpace=T.SRGBColorSpace;floorTexture.anisotropy=8;
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
 plane(0,5.84,.51,5.55,.76,label('NEXTGEN SESSIONS','#f9d39e',52));
 plane(0,5.2,.51,5.77,1.0,label('NEON TILT','#ff8e7d',100));
 // Mechanical wall wires are mapped to actual collision segments, not decorative outlines.
 for(let i=0;i<WALLS.length;i++){
  const [x1,y1,x2,y2]=WALLS[i];
  linear(x1,y1,x2,y2,.064,darkChrome,.36);
  linear(x1,y1,x2,y2,.022,chrome,.42);
 }
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
 // Real tubular overpasses with stainless supports and translucent plastic lanes.
 const orbitPath=[[77,375,.3],[59,315,.38],[57,245,.52],[73,196,.63],[95,177,.64],[137,152,.68]];
 const rampPath=[[310,371,.43],[326,330,.62],[320,290,.93],[286,244,1.2],[285,203,1.43],[311,170,1.28],[291,150,.95]];
 const setRamp=(path,color)=>{
  tube(path,.12,darkChrome);
  tube(path.map(([x,y,z])=>[x,y,z+.13]),.065,nickel);
  const side=path.map(([x,y,z])=>[x-13,y,z+.12]);
  tube(side,.035,chrome);
  const side2=path.map(([x,y,z])=>[x+13,y,z+.12]);
  tube(side2,.035,chrome);
  for(const [x,y,z] of path.slice(1,-1).filter((_,i)=>i%2===0)){
   linear(x,y,x,y+10,.06,gold,z);
   const post=box(X(x),Y(y),z*.5,.09,.09,z,chrome);post.position.z=z*.5;
  }
 };
 setRamp(orbitPath,'#ecb98d');setRamp(rampPath,'#f3a6ba');
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
  linear(s.x1,s.y1,s.x2,s.y2,.053,chrome,.57);
 }
 // Inlanes and outlanes, more compact than the classic Windows table, but original.
 for(const pts of [
  [[77,562,.4],[101,588,.42],[119,625,.43]],
  [[344,562,.4],[320,588,.42],[301,625,.43]],
  [[112,585,.4],[127,613,.41]],
  [[309,585,.4],[291,613,.41]]
 ])tube(pts,.055,chrome);
 // Shooter lane geometry and plunger hardware.
 box(X(382),Y(575),.2,.53,4.0,.18,black);
 for(let y=540;y<660;y+=11)linear(373,y,391,y+5,.029,gold,.42);
 box(X(382),Y(660),.46,.44,.3,.56,nickel);
 // Flippers: full 3D paddle capsule (as opposed to flat rendered strokes).
 const flipperMeshes=[],flipperHeads=[];
 for(const f of [{side:'left',x:144,y:613,length:65},{side:'right',x:276,y:613,length:65}]){
  const paddle=add(new T.CapsuleGeometry(.18,.94,5,12),new T.MeshPhysicalMaterial({
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
 // Warm overhead LED bank, white soft fill and red cabinet-edge glow.
 scene.add(new T.AmbientLight('#a4b4de',1.35));
 const key=new T.DirectionalLight('#ffdcbd',4.0);key.position.set(-5,4,13);
 key.castShadow=true;key.shadow.mapSize.set(compact?512:1024,compact?512:1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;
 key.shadow.camera.top=11;key.shadow.camera.bottom=-11;key.shadow.bias=-.0008;scene.add(key);
 const fill=new T.DirectionalLight('#b5c6ff',2.0);fill.position.set(5,-6,11);scene.add(fill);
 const rim=new T.PointLight('#ff4e64',23,14);rim.position.set(3,3,5);scene.add(rim);
 const sparkle=new T.PointLight('#ffbb6b',14,10);sparkle.position.set(-4,-2,4);scene.add(sparkle);
 // The rendered canvas inherits the parent aspect ratio, not the browser width.
 let lastW=0,lastH=0,disposed=false;
 function resize(){
  const rect=host.getBoundingClientRect(),w=Math.max(2,Math.round(rect.width)),h=Math.max(2,Math.round(rect.height));
  if(w===lastW&&h===lastH)return;
  lastW=w;lastH=h;
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
 }
 function update(engine,{bumperFlash=null,reducedMotion=false}={}){
  if(disposed)return;
  resize();
  const b=engine.ball;
  ball.visible=Boolean(b);
  if(b){
   ball.position.set(X(b.x),Y(b.y),b.mode==='travel'?.96:.62);
   if(b.mode==='shooter')ball.position.z=.55;
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
  for(let i=0;i<bumperLights.length;i++){
   const hit=bumperFlash?.index===i && bumperFlash.until>now;
   const frenzy=engine.time<engine.frenzyUntil;
   bumperLights[i].intensity=hit?6:frenzy?3.1:.65;
   bumperTops[i].material=hit?chrome:amber;
  }
  const idle=engine.state==='ready'||engine.state==='gameover';
  sparkle.intensity=idle&&!reducedMotion?13+Math.sin(now*.002)*4:13;
  renderer.render(scene,camera);
 }
 function dispose(){
  if(disposed)return;
  disposed=true;
  scene.traverse(o=>{if(o.isMesh)o.geometry?.dispose();});
  renderer.dispose();renderer.domElement.remove();
 }
 return {update,resize,dispose,canvas:renderer.domElement};
}
