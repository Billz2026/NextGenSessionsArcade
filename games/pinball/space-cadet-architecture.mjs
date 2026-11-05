/* Space Cadet-inspired structure, custom NextGen red/gold palette.
   Draws visible hardware only; physics remains engine.mjs authoritative.
   Board coordinates are 420 x 700 and deliberately preserve Neon Tilt text. */
// Exact tracing coordinate system for the user-supplied 915×983 reference.
// The trapezoid correction compensates for Space Cadet's original perspective,
// then reserves the existing Neon Tilt neon marquee in the upper 104px.
export const REFERENCE_FRAME=Object.freeze({width:915,height:983});
export function referenceToTable(x,y){
 const left=225-.135*y,right=770+.110*y;
 return Object.freeze([
  Math.round((24+(x-left)/(right-left)*372)*10)/10,
  Math.round((104+y*.58)*10)/10
 ]);
}
const trace=pts=>Object.freeze(pts.map(([x,y])=>referenceToTable(x,y)));
// Coordinates below are traced from the supplied screenshot (NOT
// guessed from the previous Neon Tilt wall lines). Original colours
// and branding are intentionally not taken from the reference.
const P=Object.freeze({
 topLeft:trace([[246,155],[233,128],[246,92],[277,54],[305,38],
  [336,40],[359,59],[379,88]]),
 topHorseshoe:trace([[379,89],[410,72],[457,60],[519,50],[583,53],
  [634,63],[675,87],[707,119],[728,161],[742,215]]),
 leftOrbit:trace([[260,148],[232,176],[213,217],[202,257],[207,292]]),
 rightCrescent:trace([[571,133],[613,131],[653,155],[682,185],
  [703,222],[709,264],[699,300],[682,328]]),
 rightOuter:trace([[741,290],[758,350],[772,421],[782,492],
  [795,605],[802,706],[811,839],[824,910]]),
 leftDeck:trace([[195,326],[224,311],[260,305],[319,318],
  [372,347],[398,386],[385,417],[347,435],[308,480],
  [297,543],[283,621],[254,673],[223,694],[191,661],
  [164,616],[149,567],[169,476],[182,409]]),
 leftUpper:trace([[214,341],[239,324],[278,325],[330,341],
  [371,374],[373,407],[351,425],[319,414],[286,392],
  [260,387],[245,414],[226,410]]),
 leftSpiral:trace([[239,375],[254,348],[295,351],[333,374],
  [334,398],[306,418],[280,405],[271,384],[288,377],
  [305,386],[285,427],[290,463],[313,483]]),
 rightDeck:trace([[569,124],[612,116],[661,136],[702,170],
  [728,207],[744,250],[746,293],[716,337],[685,367],
  [647,403],[631,387],[666,342],[689,295],[700,256],
  [673,207],[626,171],[585,162]]),
 rightInner:trace([[592,148],[622,165],[655,192],[675,222],
  [690,262],[680,293],[657,324]]),
 rightFlame:trace([[637,353],[664,348],[671,387],[647,418],
  [676,440],[628,488],[609,524],[616,469],
  [584,459],[608,416],[592,404]]),
 leftSling:trace([[303,677],[323,678],[363,816],[300,796]]),
 rightSling:trace([[685,671],[706,677],[746,801],[663,820]]),
 // Inset the edge guide slightly from the reference silhouette to retain
 // at least a full ball diameter beside the actual cabinet boundary.
 leftOut:trace([[181,745],[163,783],[146,835],[136,900],[148,920]])
  .map(([x,y])=>Object.freeze([x+10,y])),
 rightOut:trace([[764,745],[785,782],[808,836],[820,900],[810,920]])
  .map(([x,y])=>Object.freeze([x-30,y])),
 // Shift the inlane entrances toward the centre so the 16px ball plus
 // rubber clearance can actually pass between the two moulded walls.
 leftIn:trace([[197,824],[239,846],[280,872],[328,916]])
  .map(([x,y],i)=>Object.freeze([x+[28,18,9,0][i],y])),
 rightIn:trace([[745,823],[706,847],[669,872],[613,915]])
  .map(([x,y],i)=>Object.freeze([x-[28,18,9,0][i],y])),
 topBrackets:trace([[285,88],[406,73],[533,61],[640,75],[727,159]]),
 leftGears:trace([[184,505],[258,524],[204,568]]),
 leftSwitches:trace([[192,443],[223,458],[243,475]]),
 rightWindows:trace([[588,137],[624,159],[659,189],[689,222],[699,261],[685,299]]),
 rightBrackets:trace([[597,122],[671,160],[722,221],[730,301],[778,576]]),
 rightArrows:trace([[621,382],[643,412],[615,454]])
});
export const CLASSIC_RAIL_PROFILES=P;
// Stage 1 only: physical-looking, segmented upper horseshoe. The 19px
// recessed bed clears a 16px pinball, while the moulding reaches 27px.
// Other table sections and all physics remain unchanged.
export const TOP_HORSESHOE_SPEC=Object.freeze({
 bodyWidth:27,clearChannelWidth:19,couplerWidth:31,couplerDepth:8,
 profileNames:Object.freeze(['topLeft','topHorseshoe'])
});


// The engine and both renderers use the same outer/inner lower rail centrelines.
// A visual channel is never allowed to imply a wall somewhere else.
const wallify=pts=>pts.slice(1).map(([x2,y2],i)=>{
 const [x1,y1]=pts[i];return Object.freeze([x1,y1,x2,y2]);
});
export const MOULDED_COLLISION_RAILS=Object.freeze({
 leftOut:Object.freeze(wallify(P.leftOut)),
 rightOut:Object.freeze(wallify(P.rightOut)),
 leftIn:Object.freeze(wallify(P.leftIn)),
 rightIn:Object.freeze(wallify(P.rightIn))
});

function smooth(path,steps=9){
 const o=[];
 for(let i=0;i<path.length-1;i++){
  const a=path[Math.max(0,i-1)],b=path[i],d=path[i+1],e=path[Math.min(path.length-1,i+2)];
  for(let j=0;j<steps;j++){
   const t=j/steps,q=t*t,r=q*t;
   o.push([
    .5*(2*b[0]+(-a[0]+d[0])*t+(2*a[0]-5*b[0]+4*d[0]-e[0])*q+(-a[0]+3*b[0]-3*d[0]+e[0])*r),
    .5*(2*b[1]+(-a[1]+d[1])*t+(2*a[1]-5*b[1]+4*d[1]-e[1])*q+(-a[1]+3*b[1]-3*d[1]+e[1])*r)
   ]);
  }
 }
 return [...o,path.at(-1)];
}
function ribbon(pts,width){
 const p=smooth(pts,6),left=[],right=[];
 for(let i=0;i<p.length;i++){
  const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)];
  const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;
  const u=-dy/d*width/2,v=dx/d*width/2;
  left.push([p[i][0]+u,p[i][1]+v]);right.push([p[i][0]-u,p[i][1]-v]);
 }
 return {center:p,left,right,polygon:[...left,...right.slice().reverse()]};
}
function pathCanvas(c,p,close=false){
 c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(close)c.closePath();
}
export function paintClassicRails(c,{upper=true,lower=true}={}){
 c.save();c.lineCap='round';c.lineJoin='round';
 const plate=(pts,fill='#66232f')=>{
  pathCanvas(c,smooth([...pts,pts[0]],6),true);
  c.fillStyle=fill;c.fill();c.lineWidth=2;c.strokeStyle='#d2a16b';c.stroke();
 };
 const road=(pts,w,base='#66242b')=>{
  const a=ribbon(pts,w);
  pathCanvas(c,a.polygon,true);c.fillStyle=base;c.fill();
  c.lineWidth=1.7;c.strokeStyle='#d8a86e';c.stroke();
  pathCanvas(c,a.center);c.lineWidth=w*.57;c.strokeStyle='#201b1a';c.stroke();
  for(const side of [a.left,a.right]){
   pathCanvas(c,side);c.lineWidth=1.8;c.strokeStyle='#e3bc87';c.stroke();
  }
 };
 const topHorseshoeSection=(pts)=>{
  const {bodyWidth,clearChannelWidth}=TOP_HORSESHOE_SPEC;
  const p=ribbon(pts,bodyWidth),bed=ribbon(pts,clearChannelWidth);
  c.save();c.shadowColor='rgba(0,0,0,.52)';c.shadowBlur=7;c.shadowOffsetY=2;
  pathCanvas(c,p.polygon,true);c.fillStyle='#56202a';c.fill();
  c.shadowBlur=0;c.shadowOffsetY=0;
  c.strokeStyle='#d3a36e';c.lineWidth=1.25;c.stroke();
  pathCanvas(c,bed.polygon,true);c.fillStyle='#201b1c';c.fill();
  pathCanvas(c,p.left);c.strokeStyle='#e2ba86';c.lineWidth=2.2;c.stroke();
  pathCanvas(c,p.right);c.strokeStyle='#b98758';c.lineWidth=2.2;c.stroke();
  // Fine rubber shadows inside both moulded retaining lips.
  pathCanvas(c,bed.left);c.strokeStyle='#74313c';c.lineWidth=1.2;c.stroke();
  pathCanvas(c,bed.right);c.strokeStyle='#74313c';c.lineWidth=1.2;c.stroke();
  c.restore();
 };
 const upperCoupler=(x,y,angle)=>{
  const {couplerWidth,couplerDepth}=TOP_HORSESHOE_SPEC;
  c.save();c.translate(x,y);c.rotate(angle);
  c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=3;c.shadowOffsetY=2;
  c.fillStyle='#c6a77d';c.strokeStyle='#f1d5a5';c.lineWidth=1;
  c.beginPath();c.roundRect(-couplerWidth/2,-couplerDepth/2,
   couplerWidth,couplerDepth,2);c.fill();c.stroke();
  c.shadowBlur=0;c.shadowOffsetY=0;
  c.fillStyle='#3a2426';
  for(const dx of [-couplerWidth*.38,couplerWidth*.38]){
   c.beginPath();c.arc(dx,0,1.7,0,Math.PI*2);c.fill();
  }
  c.restore();
 };
 const disk=(x,y,r,fill,stroke='#d7a66e',lw=2)=>{
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();
  c.lineWidth=lw;c.strokeStyle=stroke;c.stroke();
 };
 const metalWindow=(x,y,w,h,angle)=>{
  c.save();c.translate(x,y);c.rotate(angle);
  c.fillStyle='#1a1a1e';c.strokeStyle='#d6a46b';c.lineWidth=1.4;
  c.fillRect(-w/2,-h/2,w,h);c.strokeRect(-w/2,-h/2,w,h);
  c.fillStyle='#8a4e45';c.fillRect(-w*.36,-h*.30,w*.72,h*.60);
  c.restore();
 };
 if(upper){
  topHorseshoeSection(P.topLeft);
  topHorseshoeSection(P.topHorseshoe);
  road(P.leftOrbit,10);
  // Five ivory couplers follow the original Space Cadet rail rhythm.
  for(let i=0;i<P.topBrackets.length;i++){
   const [x,y]=P.topBrackets[i];
   upperCoupler(x,y,[.42,.14,.06,.20,.78][i]);
  }
  // True broad asymmetric deck with multi-level curled launch shell.
  plate(P.leftDeck,'#63242d');plate(P.leftUpper,'#953b45');
  road(P.leftSpiral,18);
  for(const [x,y] of P.leftGears){
   disk(x,y,15,'#19191f','#e1b273',3);
   disk(x,y,10,'#bd8a5c','#fff0c7',2);
   disk(x,y,5,'#385477','#181b24',1.3);
  }
  for(const [x,y] of P.leftSwitches)metalWindow(x,y,8,16,-.15);
  // Multisegment right ramp, NOT a vertical solid maroon strip.
  plate(P.rightDeck,'#5b2229');road(P.rightCrescent,17);
  road(P.rightInner,14);
  for(let i=0;i<P.rightWindows.length;i++){
   const [x,y]=P.rightWindows[i];
   metalWindow(x,y,20,14,.20+i*.19);
  }
  for(const [x,y] of P.rightBrackets)metalWindow(x,y,14,6,.30);
  road(P.rightOuter,11);
  plate(P.rightFlame,'#8b3039');
  for(const [x,y] of P.rightArrows){
   pathCanvas(c,[[x-5,y+5],[x+3,y-8],[x+7,y+5]],true);
   c.fillStyle='#e9aa6b';c.fill();
  }
 }
 if(lower){
  road(P.leftOut,12);road(P.rightOut,12);
  road(P.leftIn,9);road(P.rightIn,9);
  for(const poly of [P.leftSling,P.rightSling]){
   plate(poly,'#7e2732');
   const center=poly.reduce((p,[x,y])=>[p[0]+x/4,p[1]+y/4],[0,0]);
   const recess=poly.map(([x,y])=>[
    center[0]+(x-center[0])*.64,center[1]+(y-center[1])*.64
   ]);
   pathCanvas(c,recess,true);c.fillStyle='#241c24';c.fill();
   c.strokeStyle='#d5a16f';c.lineWidth=1.8;c.stroke();
   const [tipx,tipy]=poly[2];
   pathCanvas(c,[[center[0],center[1]-12],[tipx*.52+center[0]*.48,
    tipy*.52+center[1]*.48]]);
   c.strokeStyle='#b9424f';c.lineWidth=2.4;c.stroke();
   disk(center[0],center[1],6,'#e6a76c');
  }
  // Recessed mechanical inserts circle the Power Core without changing it.
  for(let i=0;i<20;i++){
   const a=i*Math.PI/10-Math.PI/2,x=210+63*Math.cos(a),y=460+63*Math.sin(a);
   disk(x,y,4.6,'#22202c','#8f643f',1);
   disk(x,y,2.5,'#445e78','#111a20',.8);
  }
 }
 c.restore();
}
export function buildClassicRails(T,scene,{X,Y}){
 const mat=(color,rough=.38)=>new T.MeshPhysicalMaterial({
  color,metalness:0,roughness:rough,clearcoat:.68,
  clearcoatRoughness:.30,side:T.DoubleSide
 });
 const red=mat('#62232c'),raised=mat('#87323e'),
  gold=mat('#cda064',.41),dark=mat('#211b1b',.77);
 const steel=mat('#9d8271',.43),blue=mat('#2b4358',.31),
  smoked=mat('#24232a',.54),slingInset=mat('#211d24',.68);
 const amber=new T.MeshStandardMaterial({color:'#efb784',emissive:'#b76c3c',emissiveIntensity:.24});
 const add=(geometry,material,z=0,shadow=true)=>{
  const mesh=new T.Mesh(geometry,material);mesh.position.z=z;
  mesh.castShadow=shadow;mesh.receiveShadow=true;scene.add(mesh);
  return mesh;
 };
 const geomShape=pts=>{
  const shape=new T.Shape();
  pts.forEach(([x,y],i)=>i?shape.lineTo(X(x),Y(y)):shape.moveTo(X(x),Y(y)));
  shape.closePath();return shape;
 };
 const tube=(pts,z,r,material,closed=false)=>{
  const cv=new T.CatmullRomCurve3(pts.map(([x,y])=>new T.Vector3(X(x),Y(y),0)),closed,'centripetal');
  return add(new T.TubeGeometry(cv,Math.max(28,pts.length*3),r,8,closed),material,z,false);
 };
 const plate=(pts,z=.25,depth=.09,material=red)=>{
  const path=smooth([...pts,pts[0]],7);
  add(new T.ExtrudeGeometry(geomShape(path),{depth,steps:1,bevelEnabled:true,
   bevelSize:.011,bevelThickness:.010,bevelSegments:2}),material,z);
  tube(path,z+depth+.018,.023,gold,true);
 };
 const road=(pts,width,z=.256,depth=.09)=>{
  const p=ribbon(pts,width),b=ribbon(pts,width*.63);
  add(new T.ExtrudeGeometry(geomShape(p.polygon),{depth,steps:1,
   bevelEnabled:true,bevelSegments:2,bevelSize:.009,bevelThickness:.009}),red,z);
  add(new T.ShapeGeometry(geomShape(b.polygon)),dark,z+depth+.014,false);
  tube(p.left,z+depth+.038,.019,gold);
  tube(p.right,z+depth+.038,.018,gold);
 };
 const disk=(x,y,r,z,material)=>{
  const m=add(new T.CylinderGeometry(r,r,.045,24),material,z);
  m.rotation.x=Math.PI/2;m.position.x=X(x);m.position.y=Y(y);return m;
 };
 const window=(x,y,w,h,angle=0,z=.405,lensMaterial=amber)=>{
  const group=new T.Group();group.position.set(X(x),Y(y),0);group.rotation.z=angle;scene.add(group);
  const bezel=new T.Mesh(new T.BoxGeometry(w*.020,h*.020,.05),dark);
  bezel.position.z=z;group.add(bezel);
  const frame=new T.Mesh(new T.BoxGeometry(w*.021,h*.022,.014),steel);
  frame.position.z=z-.034;group.add(frame);
  const lens=new T.Mesh(new T.BoxGeometry(w*.014,h*.014,.057),lensMaterial);
  lens.position.z=z+.033;group.add(lens);
 };
 const upperHorseshoeSection=(pts,z=.253)=>{
  const {bodyWidth,clearChannelWidth}=TOP_HORSESHOE_SPEC;
  const outer=ribbon(pts,bodyWidth),inset=ribbon(pts,clearChannelWidth);
  add(new T.ExtrudeGeometry(geomShape(outer.polygon),{
   depth:.105,steps:1,bevelEnabled:true,bevelSegments:3,
   bevelSize:.016,bevelThickness:.013
  }),red,z);
  // Non-metal black recess and two retaining lips give the same depth
  // hierarchy as the reference's original steel/plastic track.
  add(new T.ShapeGeometry(geomShape(inset.polygon)),dark,z+.121,false);
  tube(outer.left,z+.159,.028,gold);
  tube(outer.right,z+.159,.028,gold);
  tube(inset.left,z+.146,.011,raised);
  tube(inset.right,z+.146,.011,raised);
 };
 const topHorseshoeCoupler=(x,y,angle)=>{
  const {couplerWidth,couplerDepth}=TOP_HORSESHOE_SPEC;
  const group=new T.Group();group.position.set(X(x),Y(y),0);
  group.rotation.z=angle;scene.add(group);
  const clamp=new T.Mesh(new T.BoxGeometry(couplerWidth*.020,
   couplerDepth*.020,.056),steel);
  clamp.position.z=.442;group.add(clamp);
  const veneer=new T.Mesh(new T.BoxGeometry(couplerWidth*.020*.94,
   couplerDepth*.020*.70,.012),gold);
  veneer.position.z=.479;group.add(veneer);
  for(const dx of [-couplerWidth*.38,couplerWidth*.38]){
   const bolt=new T.Mesh(new T.CylinderGeometry(.028,.028,.014,12),dark);
   bolt.rotation.x=Math.PI/2;bolt.position.set(dx*.020,0,.491);
   group.add(bolt);
  }
 };
 // Stage 1: continuous curved rail with recessed dark bed and five
 // independent gold/ivory clamps. No other rail geometry is changed.
 upperHorseshoeSection(P.topLeft);
 upperHorseshoeSection(P.topHorseshoe);
 road(P.leftOrbit,10,.244,.085);
 P.topBrackets.forEach(([x,y],i)=>
  topHorseshoeCoupler(x,y,[.42,.14,.06,.20,.78][i]));
 // Broad left Space Cadet-inspired mechanical deck and raised spiral.
 plate(P.leftDeck,.257,.118,red);
 plate(P.leftUpper,.380,.074,raised);
 road(P.leftSpiral,18,.452,.067);
 P.leftGears.forEach(([x,y],i)=>{
  const r=i===1?.19:.17;
  disk(x,y,r+.058,.405,dark);
  const torus=add(new T.TorusGeometry(r,.042,10,28),gold,.472,false);
  torus.position.x=X(x);torus.position.y=Y(y);
  disk(x,y,r*.56,.476,blue);
  disk(x,y,.041,.502,amber);
 });
 P.leftSwitches.forEach(([x,y])=>window(x,y,8,16,-.15,.463));
 // Layered upper-right curved transport deck with inset windows and side chute.
 plate(P.rightDeck,.255,.110,red);
 road(P.rightCrescent,17,.375,.080);
 road(P.rightInner,14,.388,.064);
 P.rightWindows.forEach(([x,y],i)=>window(x,y,22,16,.20+i*.19,.477,smoked));
 P.rightBrackets.forEach(([x,y])=>window(x,y,14,6,.30,.400));
 road(P.rightOuter,11,.265,.115);
 plate(P.rightFlame,.270,.083,raised);
 for(const [x,y] of P.rightArrows)
  add(new T.ShapeGeometry(geomShape([[x-5,y+5],[x+3,y-8],[x+7,y+5]])),gold,.384,false);
 // Narrow outer channels, distinct inner flipper feeds and tall sling plastics.
 road(P.leftOut,12,.277,.073);road(P.rightOut,12,.277,.073);
 road(P.leftIn,9,.274,.077);road(P.rightIn,9,.274,.077);
 for(const p of [P.leftSling,P.rightSling]){
  plate(p,.288,.110,raised);
  const [x,y]=p.reduce((a,[xx,yy])=>[a[0]+xx/4,a[1]+yy/4],[0,0]);
  const inset=p.map(([px,py])=>[x+(px-x)*.64,y+(py-y)*.64]);
  add(new T.ShapeGeometry(geomShape(inset)),slingInset,.410,false);
  tube([...inset,inset[0]],.431,.021,gold,true);
  disk(x,y,.10,.435,amber);
 }
 // The blue-black insert ring resembles a machined gear around the
 // existing Power Core. It is purely visual and sits below active hardware.
 for(let i=0;i<20;i++){
  const a=i*Math.PI/10-Math.PI/2,x=210+63*Math.cos(a),y=460+63*Math.sin(a);
  const bezel=add(new T.RingGeometry(.034,.081,18),smoked,.222,false);
  bezel.position.x=X(x);bezel.position.y=Y(y);
  const insert=add(new T.CircleGeometry(.036,18),blue,.225,false);
  insert.position.x=X(x);insert.position.y=Y(y);
 }
}
