/* Physical lower outlane/inlane shapes originate in the same traced
   reference profiles as the rendered 3D mouldings and 2D fallback. */
import {BOARD,WALLS,SLINGS,POSTS} from './engine.mjs?v=19';
import {CLASSIC_RAIL_PROFILES,MOULDED_COLLISION_RAILS} from './space-cadet-architecture.mjs?v=2';
const wrap=([x1,y1,x2,y2])=>Object.freeze({x1,y1,x2,y2});
export const LOWER_GUIDES=Object.freeze([
 ...MOULDED_COLLISION_RAILS.leftOut,
 ...MOULDED_COLLISION_RAILS.rightOut,
 ...MOULDED_COLLISION_RAILS.leftIn,
 ...MOULDED_COLLISION_RAILS.rightIn
].map(wrap));
export const LOWER_SLINGS=Object.freeze(
 SLINGS.map(({x1,y1,x2,y2})=>Object.freeze({x1,y1,x2,y2}))
);
export const LOWER_POSTS=Object.freeze(
 POSTS.filter(({y})=>y>=580&&y<=650).map(({x,y,r})=>Object.freeze({x,y,r}))
);
export const LOWER_FLIPPER_BASES=Object.freeze([
 Object.freeze({side:'left',x:136,y:613,length:58}),
 Object.freeze({side:'right',x:284,y:613,length:58})
]);
const channel=(side,points,outerOffset)=>Object.freeze({
 side,outerOffset,
 points:Object.freeze(points.map(([x,y])=>Object.freeze({x,y})))
});
export const LOWER_CHANNELS=Object.freeze([
 channel('left',CLASSIC_RAIL_PROFILES.leftOut,-5),
 channel('right',CLASSIC_RAIL_PROFILES.rightOut,5)
]);
export const LOWER_INLANES=Object.freeze([
 channel('left',CLASSIC_RAIL_PROFILES.leftIn,-3),
 channel('right',CLASSIC_RAIL_PROFILES.rightIn,3)
]);
