/* Upper machine geometry uses the existing engine transport paths.
   Decorative guide rails never alter physics or create extra scoring zones. */
import {BOARD,TRAVEL_PATHS,SHOTS,LANES} from './engine.mjs?v=8';
function makeRoute(kind,width,accent){
 const path=TRAVEL_PATHS[kind],shot=SHOTS[kind];
 if(!path||!shot||path[0][0]!==shot.x||path[0][1]!==shot.y)
  throw Error('Upper rail does not start at '+kind+' scoring sensor');
 return Object.freeze({
  kind,width,accent,
  points:Object.freeze(path.map(([x,y,z])=>Object.freeze({x,y,z}))),
  entrance:Object.freeze({x:shot.x,y:shot.y,r:shot.r}),
  supportIndices:Object.freeze([1,Math.min(4,path.length-2)])
 });
}
export const UPPER_ROUTES=Object.freeze([
 makeRoute('orbit',22,'amber'),makeRoute('ramp',22,'coral')
]);
export const UPPER_ROLLOVERS=Object.freeze(LANES.map((l,index)=>
 Object.freeze({index,x:l.x,y:l.y,label:l.label})));
export const UPPER_BALL_RADIUS=BOARD.radius*.020;
// Rounded visual wireforms retain all of these authoritative path samples.
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
