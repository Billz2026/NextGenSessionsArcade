/* Playable moulded rails: renderer paths always trace engine colliders. */
import {LOWER_OUTLANES,INLANE_GUIDES,SLINGS,POSTS} from './engine.mjs?v=19';
const segments=r=>r.points.slice(1).map(([x2,y2],i)=>{
 const [x1,y1]=r.points[i];return Object.freeze({x1,y1,x2,y2,side:r.side});
});
export const LOWER_GUIDES=Object.freeze(LOWER_OUTLANES.flatMap(segments));
export const LOWER_SLINGS=Object.freeze(SLINGS.map(({x1,y1,x2,y2})=>Object.freeze({x1,y1,x2,y2})));
export const LOWER_POSTS=Object.freeze(POSTS.filter(p=>p.y>=580&&p.y<=650)
 .map(({x,y,r})=>Object.freeze({x,y,r})));
export const LOWER_FLIPPER_BASES=Object.freeze([
 Object.freeze({side:'left',x:144,y:613,length:58}),
 Object.freeze({side:'right',x:276,y:613,length:58})
]);
const channel=(r,offset)=>Object.freeze({side:r.side,outerOffset:offset,
 points:Object.freeze(r.points.map(([x,y])=>Object.freeze({x,y})))});
export const LOWER_CHANNELS=Object.freeze(LOWER_OUTLANES.map(r=>channel(r,r.side==='left'?-6:6)));
export const INLANE_CHANNELS=Object.freeze(INLANE_GUIDES.map(r=>channel(r,r.side==='left'?-5:5)));
