/* Shared 3D/2D visual coordinates sourced from real game colliders.
   Decorative hardware never adds invisible physical boundaries. */
import {BOARD,WALLS,SLINGS,POSTS} from './engine.mjs?v=17';
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
 Object.freeze({side:'left',x:144,y:613,length:58}),
 Object.freeze({side:'right',x:276,y:613,length:58})
]);

// Join the four original lower guide segments into two continuously mounted
// metal/plastic channel housings. Guard material sits outside the real collision
// edge; no visual part claims to be a new playable wall.
const channel=(side)=>{
 const starts=LOWER_GUIDES.filter(g=>g.y1<600 &&
  (side==='left'?g.x1<BOARD.width/2:g.x1>BOARD.width/2));
 if(starts.length!==1)throw Error('Expected one '+side+' lower channel start');
 const a=starts[0];
 const next=LOWER_GUIDES.filter(g=>g.x1===a.x2&&g.y1===a.y2);
 if(next.length!==1)throw Error('Disconnected '+side+' guide segments');
 const b=next[0];
 return Object.freeze({
  side,
  // x-offset points towards the cabinet edge, away from the live ball area.
  outerOffset:side==='left'?-10:10,
  points:Object.freeze([
   Object.freeze({x:a.x1,y:a.y1}),
   Object.freeze({x:a.x2,y:a.y2}),
   Object.freeze({x:b.x2,y:b.y2})
  ])
 });
};
export const LOWER_CHANNELS=Object.freeze([channel('left'),channel('right')]);
