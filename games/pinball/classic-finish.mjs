/* Original arcade artwork and light states; physics is unchanged. */
import {ARCADE_MODES} from './engine.mjs?v=10';
export const NEON_FINISH=Object.freeze({
 upper:'#2c4168',mid:'#283459',lower:'#232a49',
 ivory:'#fff0cf',cyan:'#80d8fb',coral:'#ff88b2',amber:'#ffd38f'
});
export const GRID_LIGHTS=Object.freeze([
 Object.freeze({index:0,x:165,y:351}),
 Object.freeze({index:1,x:210,y:348}),
 Object.freeze({index:2,x:255,y:351})
]);
export function gridIllumination(engine){
 const charges=Math.max(0,Math.min(ARCADE_MODES.powerShots,engine.powerCharges||0));
 const jackpot=engine.hurryUpUntil>engine.time;
 return GRID_LIGHTS.map(({index})=>jackpot||index<charges);
}
// Decorative corners are rounded by only three board pixels; the physics
// transport lines and their end points are never modified.
export function roundedWirePoints(points,radius=3){
 if(points.length<3)return points.map(p=>({...p}));
 const out=[{...points[0]}];
 for(let i=1;i<points.length-1;i++){
  const before=points[i-1],p=points[i],after=points[i+1];
  const da=Math.hypot(before.x-p.x,before.y-p.y)||1;
  const db=Math.hypot(after.x-p.x,after.y-p.y)||1;
  const trim=Math.min(Math.max(0,radius),da*.10,db*.10);
  const a={x:p.x+(before.x-p.x)*trim/da,y:p.y+(before.y-p.y)*trim/da,
   z:p.z+(before.z-p.z)*trim/da};
  const b={x:p.x+(after.x-p.x)*trim/db,y:p.y+(after.y-p.y)*trim/db,
   z:p.z+(after.z-p.z)*trim/db};
  out.push(a);
  for(let k=1;k<=3;k++){
   const t=k/4,u=1-t;
   out.push({x:u*u*a.x+2*u*t*p.x+t*t*b.x,
    y:u*u*a.y+2*u*t*p.y+t*t*b.y,
    z:u*u*a.z+2*u*t*p.z+t*t*b.z});
  }
  out.push(b);
 }
 out.push({...points.at(-1)});
 return out;
}
