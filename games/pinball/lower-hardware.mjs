/* Shared 3D/2D visual coordinates sourced from real game colliders.
   Decorative hardware never adds invisible physical boundaries. */
import {WALLS,SLINGS,POSTS} from './engine.mjs?v=8';
export const LOWER_GUIDES=Object.freeze(
 WALLS.filter(([x1,y1,x2,y2])=>y1>=560&&y2>=600&&Math.abs(x2-x1)>10)
  .map(([x1,y1,x2,y2])=>Object.freeze({x1,y1,x2,y2}))
);
export const LOWER_SLINGS=Object.freeze(
 SLINGS.map(({x1,y1,x2,y2})=>Object.freeze({x1,y1,x2,y2}))
);
export const LOWER_POSTS=Object.freeze(
 POSTS.filter(({y})=>y>=580&&y<=650)
  .map(({x,y,r})=>Object.freeze({x,y,r}))
);
export const LOWER_FLIPPER_BASES=Object.freeze([
 Object.freeze({side:'left',x:144,y:613,length:71}),
 Object.freeze({side:'right',x:276,y:613,length:71})
]);
