/* Space Cadet-inspired structure, custom NextGen red/gold palette.
   Draws visible hardware only; physics remains engine.mjs authoritative.
   Board coordinates are 420 x 700 and deliberately preserve Neon Tilt text. */
// Layout traced proportionally from the supplied Space Cadet reference, then
// redrawn as original Neon Tilt pieces. All dimensions use 420x700 playfield.
const P=Object.freeze({
 outer:[[75,365],[60,327],[57,269],[72,215],[91,180],[112,151],
  [155,137],[211,128],[270,135],[311,154],[343,192],
  [356,232],[359,278],[349,328],[333,369]],
 inner:[[276,161],[301,178],[326,205],[336,242],[329,281],[310,315]],
 left:[[52,354],[45,330],[56,313],[87,294],[117,296],[151,309],
  [181,340],[182,364],[162,395],[143,428],[133,452],
  [130,478],[122,505],[93,519],[67,505],[50,482],[43,450],
  [43,410]],
 leftUpper:[[63,336],[83,302],[117,291],[151,309],[170,334],
  [151,353],[120,364],[100,385],[97,407],[79,409],[63,389]],
 chute:[[80,347],[85,329],[102,320],[129,326],[145,341],
  [144,359],[129,370],[112,370],[104,384],[117,398],[139,394]],
 rightDeck:[[284,184],[312,176],[336,189],[359,215],[371,245],
  [367,281],[354,313],[344,337],[326,360],[306,368],
  [304,349],[324,319],[336,281],[339,251],[321,219],[294,207]],
 rightInner:[[294,195],[319,207],[342,234],[352,261],[346,291],
  [331,314]],
 rightOuter:[[370,310],[378,340],[381,370],[378,410],[369,444],
  [363,475]],
 fin:[[312,340],[339,343],[347,369],[331,392],[350,405],
  [322,446],[298,475],[310,440],[292,424],[308,395],[301,379]],
 lowLeft:[[35,557],[33,581],[32,605],[37,638],[53,661],[70,675]],
 lowRight:[[385,557],[387,581],[388,605],[383,638],[367,661],[350,675]],
 inLeft:[[71,555],[72,583],[82,603],[105,623],[132,640]],
 inRight:[[349,555],[348,583],[338,603],[315,623],[288,640]],
 leftSling:[[113,524],[143,531],[160,602],[132,588]],
 rightSling:[[307,524],[277,531],[260,602],[288,588]],
 topBrackets:[[104,165,-.55],[166,140,-.1],[222,132,0],[282,144,.3],[333,184,.65]],
 rightWindows:[[330,218,.55],[348,246,.80],[348,276,1.28],[332,311,1.90]],
 wingWindows:[[73,417,-.2],[87,440,.1],[98,465,.25]],
 wingGears:[[76,454,10],[94,486,11],[113,497,8]],
 rightFasteners:[[365,344],[376,405],[369,453]],
 rightChevrons:[[322,366],[329,393],[312,426]]
});
export const CLASSIC_RAIL_PROFILES=P;
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
 const plate=(p,fill='#60202a')=>{
  pathCanvas(c,smooth([...p,p[0]],5),true);
  c.fillStyle=fill;c.fill();c.lineWidth=2.5;c.strokeStyle='#d4a267';c.stroke();
 };
 const road=(p,w)=>{
  const r=ribbon(p,w);
  pathCanvas(c,r.polygon,true);c.fillStyle='#67222b';c.fill();
  c.lineWidth=1.8;c.strokeStyle='#d1a064';c.stroke();
  pathCanvas(c,r.center);c.lineWidth=w*.61;c.strokeStyle='#211b17';c.stroke();
  pathCanvas(c,r.left);c.lineWidth=1.8;c.strokeStyle='#edbf88';c.stroke();
  pathCanvas(c,r.right);c.lineWidth=1.4;c.strokeStyle='#a96740';c.stroke();
 };
 const disk=(x,y,r,fill,stroke='#d7a66e',lw=2)=>{
  c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();
  c.lineWidth=lw;c.strokeStyle=stroke;c.stroke();
 };
 const rectRotate=(x,y,w,h,angle)=>{
  c.save();c.translate(x,y);c.rotate(angle);
  c.fillStyle='#21191a';c.strokeStyle='#d1a064';c.lineWidth=2;
  c.beginPath();c.roundRect(-w/2,-h/2,w,h,3);c.fill();c.stroke();
  c.fillStyle='#ab6654';c.fillRect(-w*.34,-h*.33,w*.68,h*.66);
  c.restore();
 };
 if(upper){
  // Bounded perimeter loop with segmented metal-gold couplings.
  road(P.outer,19);road(P.inner,16);
  for(const [x,y,a] of P.topBrackets)rectRotate(x,y,19,10,a);
  // Broad sculpted left deck, with its upper shelf and open spiral chute.
  plate(P.left,'#6a2834');plate(P.leftUpper,'#8b3543');
  road(P.chute,20);
  for(const [x,y,r] of P.wingGears){
   disk(x,y,r+3,'#181b22');
   disk(x,y,r,'#c28d58','#f7e4c6',3);
   disk(x,y,r*.50,'#37435a','#131621',2);
  }
  for(const [x,y,a] of P.wingWindows)rectRotate(x,y,9,18,a);
  // Cascading right upper deck and individual dark framed windows.
  plate(P.rightDeck,'#5b2229');road(P.rightInner,19);
  for(const [x,y,a] of P.rightWindows)rectRotate(x,y,24,17,a);
  road(P.rightOuter,20);plate(P.fin,'#8b2d37');
  for(const [x,y] of P.rightChevrons){
   pathCanvas(c,[[x-7,y+5],[x+2,y-8],[x+7,y+7]],true);
   c.fillStyle='#e5a15b';c.fill();
  }
  for(const [x,y] of P.rightFasteners)disk(x,y,3,'#f5ca7e');
 }
 if(lower){
  // Outer lanes remain predominantly vertical; inlanes actually bend inward.
  road(P.lowLeft,11);road(P.lowRight,11);
  road(P.inLeft,10);road(P.inRight,10);
  for(const [poly,flip] of [[P.leftSling,false],[P.rightSling,true]]){
   plate(poly,'#842d35');
   const midx=flip?282:138;
   pathCanvas(c,[[midx-11,539],[midx+5,577],[midx+7,590],
    [midx-13,566]],true);
   c.fillStyle='#251b1a';c.fill();
   disk(midx,576,5,'#e1a76a');
  }
 }
 c.restore();
}
export function buildClassicRails(T,scene,{X,Y}){
 const mat=(color,roughness=.36)=>new T.MeshPhysicalMaterial({
  color,metalness:0,roughness,clearcoat:.73,clearcoatRoughness:.26,side:T.DoubleSide
 });
 const red=mat('#68232d'),redRaised=mat('#883342'),gold=mat('#d1a064',.40),
  dark=mat('#211915',.78),black=mat('#15181d',.84);
 const lamp=new T.MeshStandardMaterial({color:'#f6b77f',emissive:'#b75c34',emissiveIntensity:.35});
 const glass=new T.MeshStandardMaterial({color:'#385071',metalness:.21,roughness:.23});
 const add=(geo,material,z=0,shadow=true)=>{
  const m=new T.Mesh(geo,material);m.position.z=z;m.castShadow=shadow;
  m.receiveShadow=true;scene.add(m);return m;
 };
 const shape=pts=>{
  const s=new T.Shape();
  pts.forEach(([x,y],i)=>i?s.lineTo(X(x),Y(y)):s.moveTo(X(x),Y(y)));
  s.closePath();return s;
 };
 const tube=(pts,z,r,material,closed=false)=>{
  const curve=new T.CatmullRomCurve3(pts.map(([x,y])=>new T.Vector3(X(x),Y(y),0)),closed,'centripetal');
  return add(new T.TubeGeometry(curve,Math.max(36,pts.length*2),r,10,closed),material,z,false);
 };
 const plate=(pts,z=.27,depth=.095,material=red)=>{
  const outline=smooth([...pts,pts[0]],6);
  add(new T.ExtrudeGeometry(shape(outline),{depth,steps:1,bevelEnabled:true,
   bevelSegments:3,bevelSize:.012,bevelThickness:.014}),material,z);
  tube(outline,z+depth+.024,.025,gold,true);
 };
 const road=(path,width,z=.26,depth=.11)=>{
  const a=ribbon(path,width),bed=ribbon(path,width*.60);
  add(new T.ExtrudeGeometry(shape(a.polygon),{depth,steps:1,
   bevelEnabled:true,bevelSegments:3,bevelSize:.011,bevelThickness:.011}),red,z);
  add(new T.ShapeGeometry(shape(bed.polygon)),dark,z+depth+.021,false);
  tube(a.left,z+depth+.046,.025,gold);
  tube(a.right,z+depth+.046,.022,gold);
 };
 const cyl=(x,y,r,z,height,material)=>{
  const m=add(new T.CylinderGeometry(r,r,height,24),material,z);
  m.rotation.x=Math.PI/2;m.position.x=X(x);m.position.y=Y(y);
  return m;
 };
 const insert=(x,y,w,h,angle,z=.42)=>{
  const group=new T.Group();scene.add(group);
  group.position.set(X(x),Y(y),0);group.rotation.z=angle;
  const bezel=new T.Mesh(new T.BoxGeometry(w*.020,h*.020,.058),black);
  bezel.position.z=z;group.add(bezel);
  const inset=new T.Mesh(new T.BoxGeometry(w*.014,h*.014,.042),lamp);
  inset.position.z=z+.036;group.add(inset);
 };
 // Segmented top horseshoe; a narrow true-looking channel, not a fat arch.
 road(P.outer,19,.23,.11);road(P.inner,16,.245,.09);
 for(const [x,y,a] of P.topBrackets)insert(x,y,17,9,a,.393);
 // Left raised ramp: broad asymmetric two-level plastic housing and spiral.
 plate(P.left,.26,.12,red);plate(P.leftUpper,.385,.06,redRaised);
 road(P.chute,20,.45,.075);
 for(const [x,y,a] of P.wingWindows)insert(x,y,9,17,a,.442);
 for(const [x,y,r] of P.wingGears){
  cyl(x,y,r*.020+.06,.435,.055,black);
  const rim=new T.Mesh(new T.TorusGeometry(r*.020,.052,10,28),gold);
  rim.position.set(X(x),Y(y),.49);scene.add(rim);
  const cap=new T.Mesh(new T.CircleGeometry(r*.016,24),glass);
  cap.position.set(X(x),Y(y),.494);scene.add(cap);
 }
 // Broad stepped right return: separate inset sections curve toward launcher.
 plate(P.rightDeck,.255,.115,red);
 road(P.rightInner,19,.381,.07);
 for(const [x,y,a] of P.rightWindows)insert(x,y,24,17,a,.44);
 road(P.rightOuter,20,.263,.115);
 plate(P.fin,.27,.085,redRaised);
 for(const [x,y] of P.rightChevrons)
  add(new T.ShapeGeometry(shape([[x-7,y+5],[x+2,y-8],[x+7,y+7]])),gold,.373,false);
 for(const [x,y] of P.rightFasteners)cyl(x,y,.065,.423,.040,gold);
 // Tall lower triangular slings, long wall-side outlanes, inward feed lanes.
 road(P.lowLeft,11,.273,.085);road(P.lowRight,11,.273,.085);
 road(P.inLeft,10,.273,.085);road(P.inRight,10,.273,.085);
 for(const poly of [P.leftSling,P.rightSling]){
  plate(poly,.268,.10,redRaised);
  const center=poly.reduce((a,[x,y])=>[a[0]+x/4,a[1]+y/4],[0,0]);
  cyl(center[0],center[1],.095,.40,.035,lamp);
 }
}
