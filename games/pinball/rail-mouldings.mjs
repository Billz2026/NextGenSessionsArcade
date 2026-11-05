/* Moulded NextGen rail shells.
   Decorative hardware follows the physical collision guides or genuine
   guided-ball return routes. No new colliders and no scoring changes. */
import {WALLS} from './engine.mjs?v=18';
import {UPPER_ROUTES} from './upper-hardware.mjs?v=7';
const freezePath=pts=>Object.freeze(pts.map(p=>Object.freeze({...p})));
export const UPPER_MOULDINGS=Object.freeze([
 Object.freeze({
  id:'orbit-housing',kind:'orbit',side:'right',width:22,bodyWidth:14,
  points:freezePath(UPPER_ROUTES[0].points.slice(0,4))
 }),
 Object.freeze({
  id:'ramp-return-housing',kind:'ramp',side:'right',width:22,bodyWidth:11,
  points:freezePath(UPPER_ROUTES[1].points.slice(7,11))
 })
]);
const existingSlingGuide=(x,y,side,bodyWidth)=>{
 const first=WALLS.find(w=>w[0]===x&&w[1]===y);
 if(!first)throw Error('Missing '+side+' sling guide start');
 const next=WALLS.find(w=>w[0]===first[2]&&w[1]===first[3]);
 if(!next)throw Error('Disconnected '+side+' sling guide');
 return Object.freeze({
  side,bodyWidth,points:freezePath([
   {x:first[0],y:first[1]},{x:first[2],y:first[3]},
   {x:next[2],y:next[3]}
  ])
 });
};
export const SLING_GUIDE_MOULDINGS=Object.freeze([
 existingSlingGuide(91,496,'left',10),
 existingSlingGuide(329,496,'right',10)
]);
export const LOWER_RAIL_WIDTH=Object.freeze({left:17,right:11});
