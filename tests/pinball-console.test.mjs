import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../games/pinball/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../games/pinball/console.css',import.meta.url),'utf8');
const sidebar=html.slice(html.indexOf('<aside class="hud hud-v2"'),html.indexOf('</aside>')+8);
test('critical game HUD stays available with Table Intel collapsed',()=>{
 const cutoff=sidebar.indexOf('<details class="console-more"');
 assert.ok(cutoff>0);
 for(const id of ['score','ball-number','status-indicator','dmd-screen','mode-name','grid-status',
 'mission-message','best-score','multiplier','ball-save','launch','power-fill','power-label',
 'start','reset']){
  const pos=sidebar.indexOf('id="'+id+'"');
  assert.ok(pos>=0&&pos<cutoff,id+' must stay visible');
 }
});
test('missions, personal records and instructions remain accessible',()=>{
 const details=sidebar.slice(sidebar.indexOf('<details class="console-more"'));
 assert.match(details,/<summary>/);
 for(const id of ['mission-lanes','mission-frenzy','mission-targets','mission-ride',
 'progress-lanes','progress-frenzy','progress-targets','progress-ride','extra-status',
 'shots-counter','spinner-count','scoop-count','leaderboard']){
  assert.ok(details.includes('id="'+id+'"'),id+' preserved');
 }
 assert.match(details,/HOW TO PLAY/);
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'IDs stay unique');
});
test('isolated stylesheet is linked, with desktop drawer and mobile flow',()=>{
 assert.match(html,/console\\.css\\?v=1/);
 assert.match(css,/\\.hud\\.hud-v2/);
 assert.match(css,/max-height:min\\(62dvh,470px\\)/);
 assert.match(css,/@media\\(max-width:1120px\\)/);
 assert.match(css,/position:static/);
 assert.match(css,/prefers-reduced-motion/);
});
