/* Raised, perimeter-only hardware for the two genuine main shot returns.
   All points come from the authoritative transport paths. No new scoring,
   collision surfaces, missions or fake physical routes are introduced.
   Each return is separated from the entrance because the centre and upper
   sections carry the simulated ball through the existing guided transport. */
import {TRAVEL_PATHS} from './engine.mjs?v=18';

function returnSection(kind,start,end){
 const travel=TRAVEL_PATHS[kind];
 if(!travel||end>travel.length||end-start<3)
  throw Error('Invalid pinball perimeter return: '+kind);
 return Object.freeze({
  kind,width:20,
  points:Object.freeze(travel.slice(start,end).map(([x,y,z])=>Object.freeze({x,y,z})))
 });
}
// Outside the bumper island, these paths feed toward the real lower flippers.
export const PERIMETER_RETURNS=Object.freeze([
 returnSection('orbit',11,19),
 returnSection('ramp',8,16)
]);
