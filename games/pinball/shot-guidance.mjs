/* Visual-only shot guidance shared by the Three.js and Canvas renderers.
   No collision, score, mission progress or ball physics is changed here. */
export const SHOT_INDICATORS=Object.freeze([
 Object.freeze({kind:'orbit',x:77,y:363,label:'ORBIT'}),
 Object.freeze({kind:'ramp',x:311,y:360,label:'RAMP'}),
 Object.freeze({kind:'center',x:207,y:425,label:'CROSS'}),
 Object.freeze({kind:'skyline',x:124,y:375,label:'SKY'}),
 Object.freeze({kind:'scoop',x:316,y:444,label:'SCOOP'}),
 Object.freeze({kind:'spinner',x:204,y:358,label:'SPIN'}),
 Object.freeze({kind:'target',x:210,y:389,label:'BANK'})
]);
const WIZARD_SHOTS=Object.freeze(['ramp','orbit','center','skyline','scoop']);
export function requiredShot(engine){
 if(engine.state!=='playing'||engine.tilted)return null;
 if(engine.multiballActive)return engine.multiballSuperLit?'scoop':null;
 if(engine.neonCommandActive)return WIZARD_SHOTS[engine.neonCommandStep]||null;
 if(engine.activeCommand)return engine.commandMission.sequence[engine.activeCommand.step]||null;
 if(engine.commandMissionReady)return 'ramp';
 if(engine.neonCommandReady)return 'scoop';
 if(engine.lockLit)return 'scoop';
 return null;
}
export function shotIndicatorState(engine,kind){
 if(engine.state!=='playing'||engine.tilted)return 'idle';
 const requested=requiredShot(engine);
 if(requested){
  if(requested===kind)return 'mission';
  // A physical bumper or rollover mission does not activate an unrelated arrow.
  return 'idle';
 }
 if(engine.multiballActive){
  if((kind==='ramp'||kind==='orbit')&&!engine.multiballSuperLit)
   return engine.multiballJackpots.has(kind)?'claimed':'jackpot';
  return 'idle';
 }
 if(kind==='scoop'&&engine.hurryUpUntil>engine.time)return 'jackpot';
 if(kind==='target'&&engine.targets.size>0)return 'charging';
 if(engine.lastShot?.kind===kind&&engine.time-engine.lastShot.at<1.2)
  return 'confirmed';
 return 'idle';
}
export function shotIndicatorBrightness(state,phase,reducedMotion=false){
 if(state==='idle'||state==='claimed')return state==='claimed'?.13:.24;
 if(state==='confirmed')return .84;
 if(reducedMotion)return state==='mission'||state==='jackpot'?1:.7;
 const beat=(Math.sin(phase*6.3)+1)/2;
 return state==='mission'?.67+.33*beat:
  state==='jackpot'?.78+.22*beat:.54+.20*beat;
}
