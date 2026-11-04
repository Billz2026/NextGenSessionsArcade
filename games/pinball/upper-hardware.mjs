/* Integrated routed-lane geometry follows the existing authoritative engine
   transport paths. These visual lane surfaces never alter physics or scoring. */
import {BOARD,TRAVEL_PATHS,SHOTS,LANES} from './engine.mjs?v=10';
function makeRoute(kind,width,accent){
 const path=TRAVEL_PATHS[kind],shot=SHOTS[kind];
 if(!path||!shot||path[0][0]!==shot.x||path[0][1]!==shot.y)
  throw Error('Integrated lane does not start at '+kind+' scoring sensor');
 return Object.freeze({
  kind,width,accent,
  points:Object.freeze(path.map(([x,y,z])=>Object.freeze({x,y,z}))),
  entrance:Object.freeze({x:shot.x,y:shot.y,r:shot.r})
 });
}
export const UPPER_ROUTES=Object.freeze([
 makeRoute('orbit',22,'amber'),makeRoute('ramp',22,'coral'),
 makeRoute('center',18,'ivory'),makeRoute('skyline',18,'gold')
]);
// Display only the clearly readable OUTER entry portions. The complete
// guided-ball transport remains in UPPER_ROUTES / TRAVEL_PATHS for gameplay.
// V2.7's mistake was tracing all four complete return/crossover paths across
// the bumper island. A real pinball table does not outline every hidden
// transport section on top of the playfield.
export const VISIBLE_CHANNELS=Object.freeze([
 Object.freeze({
  kind:'orbit',width:22,trimSide:'right',
  points:Object.freeze(UPPER_ROUTES[0].points.slice(0,4))
 }),
 Object.freeze({
  kind:'ramp',width:22,trimSide:'left',
  points:Object.freeze(UPPER_ROUTES[1].points.slice(0,3))
 })
]);
// Flush direction inserts sit INSIDE the two visible lane approaches,
// never across the bumper field or at invented gameplay sensors.
// Each one is interpolated from neighbouring authoritative transport samples.
export const APPROACH_LIGHTS=Object.freeze(VISIBLE_CHANNELS.flatMap(channel=>
 [0.65,1.48].map((location,index)=>{
  const segment=Math.floor(location),t=location-segment;
  const a=channel.points[segment],b=channel.points[segment+1];
  return Object.freeze({
   kind:channel.kind,index,
   x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,
   z:a.z+(b.z-a.z)*t,
   dx:b.x-a.x,dy:b.y-a.y
  });
 })
));
export const UPPER_ROLLOVERS=Object.freeze(LANES.map((l,index)=>
 Object.freeze({index,x:l.x,y:l.y,label:l.label})));
export const UPPER_BALL_RADIUS=BOARD.radius*.020;
// Both edges describe real 22px/18px channels centred on the exact ball path.
export function guideEdges(route){
 return route.points.map((p,i)=>{
  const a=route.points[Math.max(0,i-1)];
  const b=route.points[Math.min(route.points.length-1,i+1)];
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
  const ox=-dy/len*route.width/2,oy=dx/len*route.width/2;
  return Object.freeze({
   left:Object.freeze({x:p.x+ox,y:p.y+oy,z:p.z}),
   right:Object.freeze({x:p.x-ox,y:p.y-oy,z:p.z})
  });
 });
}

// The upper crown follows the outer machine silhouette and stays UNDER the ball.
// Its y-coordinates never intersect the visible title plaque or alter scoring.
export const UPPER_ARCH=Object.freeze([
 [48,211],[56,179],[83,153],[120,145],[210,142],
 [300,145],[336,154],[357,181],[365,211]
].map(([x,y])=>Object.freeze({x,y})));

