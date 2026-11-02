// Neon Tilt — bespoke 3D mechanical detailing, Phase 3G.
// All dimensions are Three.js world-space; table landmarks use the shared
// 420 × 700 physics coordinate map passed in by render3d.mjs.
export function buildMechanicalTable(T,scene,{X,Y,SPINNER,SCOOP}){
 const physically=(color,roughness=.28,metalness=.7,extra={})=>new T.MeshPhysicalMaterial({
  color,roughness,metalness,clearcoat:.82,clearcoatRoughness:.16,...extra
 });
 const steel=physically('#a8b6c9',.2,.91);
 const chrome=physically('#e5e5e7',.13,.96);
 const anodised=physically('#4b405e',.29,.64);
 const brass=physically('#d3a36c',.22,.83);
 const darkRubber=physically('#332633',.72,.03);
 const transparent=physically('#9a729d',.2,.08,{transparent:true,opacity:.63,depthWrite:false,side:T.DoubleSide});
 const blue=physically('#7f91cb',.22,.18,{transparent:true,opacity:.8,depthWrite:false,side:T.DoubleSide});
 const red=physically('#d1607a',.24,.22,{transparent:true,opacity:.78,depthWrite:false,side:T.DoubleSide});
 const add=(geo,mat,x=0,y=0,z=0,shadow=true)=>{
  const o=new T.Mesh(geo,mat);o.position.set(x,y,z);
  o.castShadow=shadow;o.receiveShadow=true;scene.add(o);return o;
 };
 const fastenerGeo=new T.CylinderGeometry(.09,.09,.09,12);
 const fasteners=[];
 function fastener(x,y,z,scale=1){
  const m=add(fastenerGeo,chrome,X(x),Y(y),z,false);
  m.rotation.x=Math.PI/2;m.scale.set(scale,scale,scale);
  fasteners.push(m);
 }
 function beam(x,y,z,w,h,d,mat,rotation=0){
  const m=add(new T.BoxGeometry(w,h,d),mat,X(x),Y(y),z);
  m.rotation.z=rotation;return m;
 }
 function rod(points,rad=.045,mat=chrome){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(X(p[0]),Y(p[1]),p[2])));
  return add(new T.TubeGeometry(curve,Math.max(20,points.length*12),rad,8,false),mat);
 }
 // True raised strips underneath the wire-form ramps.
 // This provides parallax and visible side walls rather than a drawing of a ramp.
 function rampDeck(path,halfWidth,material){
  const spline=new T.CatmullRomCurve3(path.map(([x,y,z])=>new T.Vector3(X(x),Y(y),z)));
  const vertices=[],indices=[],steps=36,edge=halfWidth;
  for(let i=0;i<=steps;i++){
   const q=spline.getPoint(i/steps);
   const tangent=spline.getTangent(i/steps).normalize();
   const nx=-tangent.y,ny=tangent.x;
   for(const v of [-edge,edge])vertices.push(q.x+v*nx,q.y+v*ny,q.z-.09);
   if(i<steps){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  add(geo,material,0,0,0,true);
  // Structural beams and rail joins align to this exact deck geometry.
  for(let i=1;i<path.length-1;i+=2){
   const [x,y,z]=path[i];
   const length=Math.max(.16,z-.23);
   const post=add(new T.CylinderGeometry(.065,.082,length,12),brass,X(x),Y(y),.23+length/2);
   post.rotation.x=Math.PI/2;
   fastener(x,y,z+.08,.85);
   beam(x,y,z-.06,.8,.09,.11,anodised);
  }
  // The outer curled edge reads like moulded plastic in side lighting.
  const left=path.map(([x,y,z])=>[x-halfWidth*40,y,z+.10]);
  const right=path.map(([x,y,z])=>[x+halfWidth*40,y,z+.10]);
  rod(left,.035,chrome);rod(right,.035,chrome);
 }
 const rightPath=[
  [311,378,.40],[327,337,.65],[321,288,.91],
  [284,245,1.26],[287,199,1.45],[310,172,1.26],[293,151,.94]
 ];
 const leftPath=[
  [76,375,.39],[59,321,.50],[56,250,.66],
  [71,204,.79],[94,176,.85],[136,152,.90]
 ];
 rampDeck(rightPath,.27,transparent);
 rampDeck(leftPath,.18,blue);
 // Shaped plastic covers around slings, all lifted above the playfield.
 const slings=[
  {points:[[101,500],[152,523],[165,546],[130,551],[103,530]],mat:red},
  {points:[[319,500],[268,523],[255,546],[289,551],[317,530]],mat:blue}
 ];
 for(const s of slings){
  const shape=new T.Shape();
  s.points.forEach(([x,y],i)=>i?shape.lineTo(X(x),Y(y)):shape.moveTo(X(x),Y(y)));
  shape.closePath();
  const shell=add(new T.ExtrudeGeometry(shape,{
   steps:1,depth:.13,bevelEnabled:true,bevelThickness:.035,bevelSize:.04,bevelSegments:2
  }),s.mat,0,0,.51);
  shell.material.side=T.DoubleSide;
  for(const p of [s.points[0],s.points[2]])fastener(p[0],p[1],.71,.8);
 }
 // Rubber posts and flipper bearings: ground shadow, rubber collar and steel bolt.
 for(const [x,y] of [[97,571],[114,588],[133,614],[285,614],[305,588],[323,571],
  [110,491],[304,491],[144,610],[276,610]]){
  const p=add(new T.CylinderGeometry(.13,.13,.26,12),darkRubber,X(x),Y(y),.36);
  p.rotation.x=Math.PI/2;
  fastener(x,y,.65,.83);
 }
 // Bank backing plate and individual protective hoods.
 beam(209,420,.30,2.8,.25,.18,anodised);
 for(const x of [165,194,223,252]){
  beam(x,395,.45,.46,.14,.24,steel);
  fastener(x,399,.66,.65);
 }
 // Two actual gate frames high in the upper table; braces join in 3D.
 for(const x of [106,314]){
  const b=beam(x,181,.50,1.0,.09,.22,brass);
  b.rotation.z=(x<210?-.25:.25);
  for(const dx of [-21,21]){
   const m=add(new T.CylinderGeometry(.045,.052,.52,10),steel,X(x+dx),Y(181),.53);
   m.rotation.x=Math.PI/2;
  }
 }
 // Cast-metal ramp entrances, grounded in real shot sensors.
 for(const [x,y,mirror] of [[77,373,-1],[311,372,1]]){
  beam(x,y,.42,1.04,.22,.25,anodised,mirror*.26);
  rod([[x-23,y+15,.38],[x,y-.03,.52],[x+23,y-15,.65]],.075,chrome);
  fastener(x-16,y+7,.57,.7);fastener(x+16,y-7,.57,.7);
 }
 // Shooter lane spring casing, screws and transparent safety guide.
 beam(381,580,.56,.49,3.5,.06,transparent);
 for(const y of [488,540,598,651])fastener(382,y,.7,.65);
 // Raised central toy mounted BELOW flipper flight paths; brand plaque above the
 // lower playfield rather than an intrusive wall blocking scoring shots.
 beam(207,466,.30,2.25,.50,.17,anodised);
 beam(207,466,.47,1.98,.37,.045,brass);
 // A final set of bolt heads at the flipper-guard edges.
 for(const [x,y] of [[87,523],[136,543],[286,543],[334,523],[72,630],[348,630]])
  fastener(x,y,.64,.85);
 return {detailCount:fasteners.length,dispose(){
  for(const o of [...fasteners])o.geometry?.dispose();
 }};
}
