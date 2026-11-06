import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BUMPERS,SCOOP,TRAVEL_PATHS} from '../games/pinball/engine.mjs';
import {PERIMETER_RETURNS} from '../games/pinball/perimeter-returns.mjs';

const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('../games/pinball/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../games/pinball/table-first.css',import.meta.url),'utf8');
const game=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');
function distanceToSegment(p,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy||1;
 const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/den));
 return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
test('each raised return is part of the true 2D physics transport',()=>{
 assert.deepEqual(PERIMETER_RETURNS.map(r=>r.kind),['orbit','ramp']);
 for(const ret of PERIMETER_RETURNS){
  const exact=TRAVEL_PATHS[ret.kind];
  const first=exact.findIndex(p=>p[0]===ret.points[0].x&&p[1]===ret.points[0].y);
  assert.ok(first>=0,'return begins on authoritative '+ret.kind+' route');
  assert.ok(ret.width>=16);
  assert.deepEqual(ret.points.map(p=>[p.x,p.y,p.z]),exact.slice(first,first+ret.points.length));
  for(let i=1;i<ret.points.length;i++){
   const a=ret.points[i-1],b=ret.points[i];
   for(const bumper of BUMPERS){
    assert.ok(distanceToSegment(bumper,a,b)>bumper.r+ret.width/2+3,
     ret.kind+' exit hardware would overlap an active bumper');
   }
   if(ret.kind==='ramp')assert.ok(distanceToSegment(SCOOP,a,b)>SCOOP.r+ret.width/2,
    'right return must not run through the working scoop');
  }
 }
});
test('3D return rails and Canvas fallback both use exactly the same return descriptors',()=>{
 assert.match(three,/for\(const returnLane of PERIMETER_RETURNS\)/);
 assert.match(three,/new T\.TubeGeometry\(path/);
 assert.match(three,/channelStrip\(returnLane,0,1,-\.072,returnDeck\)/);
 assert.match(canvas,/for\(const returnLane of PERIMETER_RETURNS\)/);
 assert.match(canvas,/guideEdges\(\{points:smooth,width:returnLane\.width\}\)/);
 assert.doesNotMatch(three,/channelStrip\(route,0,1/);
});
test('table-first interface keeps a single full HUD and live cabinet score while retaining the original controls',()=>{
 assert.match(html,/table-first\.css\?v=2/);
 assert.ok(html.indexOf('table-first.css?v=2')>html.indexOf('side-towers.css?v=1'));
 assert.match(html,/id="table-live-score"/);
 assert.match(html,/id="table-live-ball"/);
 assert.match(html,/id="mobile-action-dock"/);
 assert.match(game,/mobileActionDock\.appendChild\(ui\.actionPanel\)/);
 assert.match(css,/\.machine-top\{display:flex!important\}/);
 assert.match(html,/id="flipper-left"/);
 assert.match(html,/id="flipper-right"/);
 assert.match(html,/id="start"/);
 assert.match(html,/id="launch"/);
 assert.match(game,/ui\.tableLiveScore\.textContent=displayScore/);
 assert.match(game,/ui\.tableLiveBall\.textContent=ui\.ball\.textContent/);
 assert.match(css,/\.machine-arena>\.arena-wing\{display:none!important\}/);
 assert.match(css,/position:sticky;top:0;z-index:15/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(285px,312px\)/);
 assert.ok(!css.includes('transform:scale('),'playfield must not be visually stretched');
});
