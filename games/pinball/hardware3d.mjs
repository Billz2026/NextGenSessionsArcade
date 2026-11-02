// Neon Tilt — bespoke 3D mechanical detailing, Phase 3G.
// All dimensions are Three.js world-space; table landmarks use the shared
// 420 × 700 physics coordinate map passed in by render3d.mjs.
export function buildMechanicalTable(T,scene,{X,Y,SPINNER,SCOOP,RAMP_PATH,ORBIT_PATH}){
 const physically=(color,roughness=.28,metalness=.7,extra={})=>new T.MeshPhysicalMaterial({
  color,roughness,metalness,clearcoat:.82,clearcoatRoughness:.16,...extra
 });
 const steel=physically('#c0c2c9',.24,.84);
 const chrome=physically('#c5ccd4',.19,.91);
 const anodised=physically('#56465f',.37,.57);
 const brass=physically('#bf946b',.25,.7);
 const darkRubber=physically('#332633',.72,.03);
 const transparent=physically('#ac8ebc',.24,.03,{transparent:true,opacity:.64,depthWrite:false,side:T.DoubleSide});
 const blue=physically('#88a4c7',.29,.07,{transparent:true,opacity:.72,depthWrite:false,side:T.DoubleSide});
 const red=physically('#d56c8a',.28,.07,{transparent:true,opacity:.76,depthWrite:false,side:T.DoubleSide});
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
  // Four vertices per station: two on the top deck, two underneath.
  // Unlike a flat plane, this produces a true visible deck thickness and
  // chrome-edged side walls that respond to angled lights.
  const vertices=[],indices=[],steps=48,edge=halfWidth;
  for(let i=0;i<=steps;i++){
   const q=spline.getPoint(i/steps);
   const tangent=spline.getTangent(i/steps).normalize();
   const nx=-tangent.y,ny=tangent.x;
   for(const v of [-edge,edge]){
    vertices.push(q.x+v*nx,q.y+v*ny,q.z-.045);
    vertices.push(q.x+v*nx,q.y+v*ny,q.z-.205);
   }
   if(i<steps){
    const j=i*4,k=j+4;
    // Top, bottom and both side rails use consistent winding.
    indices.push(j,j+2,k,j+2,k+2,k);
    indices.push(j+1,k+1,j+3,j+3,k+1,k+3);
    indices.push(j,j+4,j+1,j+1,j+4,j+5);
    indices.push(j+2,j+3,k+2,j+3,k+3,k+2);
   }
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  const deck=add(geo,material,0,0,0,true);
  deck.material.side=T.DoubleSide;
  // Deck spine supports appear below the raised channel.
  const spine=path.map(([x,y,z])=>[x,y,z-.21]);
  rod(spine,.055,anodised);
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

 // Bumper skirts: concentric outer rubber ring and metallic mounting collars.
 // Visual components stay below the engine's existing bumper collision caps.
 for(const [x,y] of [[169,290],[249,288],[210,335]]){
  const px=X(x),py=Y(y);
  const ring1=add(new T.TorusGeometry(.47,.07,10,36),darkRubber,px,py,.32);
  ring1.receiveShadow=true;
  const ring2=add(new T.TorusGeometry(.36,.035,10,36),brass,px,py,.39);
  ring2.receiveShadow=true;
  for(const d of [[-.5,0],[.5,0],[0,-.5],[0,.5]])
   fastener(x+d[0]/.020,y+d[1]/.020,.43,.52);
 }
 // Flipper base plates are separately cast metal with rubber collars.
 for(const [x,y] of [[144,613],[276,613]]){
  const base=add(new T.CylinderGeometry(.36,.36,.12,24),anodised,X(x),Y(y),.31);
  base.rotation.x=Math.PI/2;
  const collar=add(new T.TorusGeometry(.285,.075,10,28),darkRubber,X(x),Y(y),.42);
  collar.receiveShadow=true;
  fastener(x,y,.58,.84);
 }

 const rightPath=RAMP_PATH,leftPath=ORBIT_PATH;
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
