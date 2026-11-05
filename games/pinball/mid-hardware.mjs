/* Phase 4K.2: shared mid-table visual positions grounded in game sensors.
   This file does not define collisions or create new game objectives. */
import {BUMPERS,TARGETS,ARCADE_MODES} from './engine.mjs?v=19';
export const MID_BUMPERS=Object.freeze(BUMPERS.map((b,i)=>Object.freeze({
 index:i,x:b.x,y:b.y,r:b.r
})));
export const MID_TARGETS=Object.freeze(TARGETS.map((t,i)=>Object.freeze({
 index:i,x:t.x,y:t.y,r:t.r
})));
export const POWER_CORE=Object.freeze({
 x:210,y:460,visibleRadius:48,charges:ARCADE_MODES.powerShots
});
// The Power Core is a recessed progress indicator, not a ball collider.
export function midTableState(engine){
 const rush=engine.hurryUpUntil>engine.time;
 const charges=Math.max(0,Math.min(POWER_CORE.charges,engine.powerCharges||0));
 const frenzy=engine.frenzyUntil>engine.time;
 return {
  charges,rush,frenzy,
  targets:MID_TARGETS.map(t=>engine.targets.has(t.index)||engine.missions.targets)
 };
}
