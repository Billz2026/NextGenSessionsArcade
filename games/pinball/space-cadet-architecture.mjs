/* Space Cadet-inspired structure, custom NextGen red/gold palette.
   Draws visible hardware only; physics remains engine.mjs authoritative.
   Board coordinates are 420 x 700 and deliberately preserve Neon Tilt text. */
const P=Object.freeze({
 outer:[[77,373],[59,321],[56,250],[71,204],[94,176],[136,152],
  [214,150],[300,150],[321,167],[341,222],[339,298],[332,387]],
 inner:[[291,160],[311,183],[324,213],[323,247],[313,287]],
 left:[[52,368],[44,342],[47,320],[61,299],[85,283],[115,284],
  [136,300],[143,324],[124,345],[111,370],[105,400],[107,433],
  [101,464],[85,483],[66,473],[54,452],[51,418]],
 chute:[[67,359],[63,332],[77,314],[103,302],[124,313],
  [120,333],[105,350],[97,379]],
 fin:[[336,333],[351,339],[361,363],[365,388],[354,416],
  [339,444],[330,428],[337,397],[326,378]],
 lowLeft:[[24,566],[35,590],[56,617],[80,643],[105,666],[116,674]],
 lowRight:[[365,566],[352,590],[340,618],[326,644],[307,668],[305,674]],
 inLeft:[[105,581],[109,590],[118,604],[130,618]],
 inRight:[[315,581],[311,590],[302,604],[290,618]],
 lamps:[[337,189],[344,215],[346,241],[343,267],[339,293]],
 sideLamps:[[67,410],[75,432],[78,455]],
 chevrons:[[344,355],[350,375],[346,398]]
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
 const plate=p=>{
  pathCanvas(c,smooth([...p,p[0]],5),true);
  c.fillStyle='#60202a';c.fill();c.lineWidth=2;c.strokeStyle='#d1a064';c.stroke();
 };
 const road=(p,w)=>{
  const r=ribbon(p,w);
  pathCanvas(c,r.polygon,true);c.fillStyle='#67222b';c.fill();
  c.lineWidth=1.5;c.strokeStyle='#d1a064';c.stroke();
  pathCanvas(c,r.center);c.lineWidth=w*.58;c.strokeStyle='#241b18';c.stroke();
  pathCanvas(c,r.left);c.lineWidth=1.6;c.strokeStyle='#edbf88';c.stroke();
  pathCanvas(c,r.right);c.lineWidth=1.4;c.strokeStyle='#a96740';c.stroke();
 };
 if(upper){
  road(P.outer,30);road(P.inner,17);
  plate(P.left);road(P.chute,21);plate(P.fin);
  for(const [x,y] of P.lamps){
   c.fillStyle='#271c18';c.fillRect(x-7,y-10,14,20);
   c.fillStyle='#c78e58';c.fillRect(x-5,y-8,10,16);
  }
  for(const [x,y] of P.sideLamps){
   c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fillStyle='#e7a65e';c.fill();
   c.lineWidth=2;c.strokeStyle='#211711';c.stroke();
  }
  for(const [x,y] of P.chevrons){
   pathCanvas(c,[[x-6,y+5],[x,y-6],[x+6,y+5]],true);
   c.fillStyle='#f0b574';c.fill();
  }
 }
 if(lower){road(P.lowLeft,13);road(P.lowRight,13);road(P.inLeft,10);road(P.inRight,10);}
 c.restore();
}
export function buildClassicRails(T,scene,{X,Y}){
 const mat=(color,roughness=.34)=>new T.MeshPhysicalMaterial({
  color,metalness:0,roughness,clearcoat:.75,clearcoatRoughness:.24,side:T.DoubleSide
 });
 const red=mat('#68232d'),gold=mat('#d1a064',.40),dark=mat('#211915',.77);
 const light=new T.MeshStandardMaterial({color:'#ffbd7b',emissive:'#be6c30',emissiveIntensity:.45});
 const add=(geometry,material,z=0,shadow=true)=>{
  const m=new T.Mesh(geometry,material);m.position.z=z;m.castShadow=shadow;
  m.receiveShadow=true;scene.add(m);return m;
 };
 const shape=pts=>{
  const s=new T.Shape();
  pts.forEach(([x,y],i)=>i?s.lineTo(X(x),Y(y)):s.moveTo(X(x),Y(y)));
  s.closePath();return s;
 };
 const line=(pts,z,rad,material,closed=false)=>{
  const curve=new T.CatmullRomCurve3(pts.map(([x,y])=>new T.Vector3(X(x),Y(y),0)),closed,'centripetal');
  return add(new T.TubeGeometry(curve,Math.max(36,pts.length*2),rad,8,closed),material,z,false);
 };
 const plate=(pts,z=.245,depth=.095)=>{
  const outline=smooth([...pts,pts[0]],6);
  add(new T.ExtrudeGeometry(shape(outline),{depth,steps:1,bevelEnabled:true,
   bevelSegments:2,bevelSize:.013,bevelThickness:.013}),red,z);
  line(outline,z+depth+.023,.023,gold,true);
 };
 const road=(path,width,z=.25,depth=.105)=>{
  const a=ribbon(path,width),bed=ribbon(path,width*.60);
  add(new T.ExtrudeGeometry(shape(a.polygon),{depth,steps:1,
   bevelEnabled:true,bevelSegments:2,bevelSize:.011,bevelThickness:.011}),red,z);
  add(new T.ShapeGeometry(shape(bed.polygon)),dark,z+depth+.02,false);
  line(a.left,z+depth+.042,.022,gold);
  line(a.right,z+depth+.042,.020,gold);
 };
 const insert=(x,y,w,h,z=.41)=>{
  const bezel=add(new T.BoxGeometry(w*.020,h*.020,.025),dark,z,false);
  bezel.position.x=X(x);bezel.position.y=Y(y);
  const lens=add(new T.BoxGeometry(w*.016,h*.015,.026),light,z+.018,false);
  lens.position.x=X(x);lens.position.y=Y(y);
 };
 road(P.outer,30,.237,.105);road(P.inner,17,.252,.098);
 plate(P.left,.247,.108);road(P.chute,21,.364,.046);
 plate(P.fin,.245,.086);
 for(const p of P.lamps)insert(...p,11,17,.38);
 for(const p of P.sideLamps)insert(...p,8,8,.38);
 for(const [x,y] of P.chevrons){
  const s=shape([[x-6,y+5],[x,y-6],[x+6,y+5]]);
  add(new T.ShapeGeometry(s),gold,.354,false);
 }
 road(P.lowLeft,13,.262,.085);road(P.lowRight,13,.262,.085);
 road(P.inLeft,10,.266,.072);road(P.inRight,10,.266,.072);
}
