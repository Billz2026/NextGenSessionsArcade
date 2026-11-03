/* Phase 4K.5: finishing details are visual-only, with no new sensors.
   The two small arrows indicate already-scored shots, not new objectives. */
export const LOWER_DIRECTION_INSERTS=Object.freeze([
 Object.freeze({kind:'ramp',label:'RAMP',x:169,y:585,colour:'#ffb1b5'}),
 Object.freeze({kind:'orbit',label:'ORBIT',x:251,y:585,colour:'#a9ddfa'})
]);
export function directionInsertActive(engine,kind){
 const last=engine.lastShot;
 return Boolean(engine.missions?.ride ||
  (last?.kind===kind && engine.time>=last.at &&
   engine.time-last.at<5));
}
// Only the outside high safety rail stays visible at the upper crossing.
// Both bottom runners remain continuous and aligned with the engine path.
export function elevatedGuardSide(kind){
 if(kind==='orbit')return 'right';
 if(kind==='ramp')return 'left';
 throw Error('Unknown wireform route '+kind);
}
