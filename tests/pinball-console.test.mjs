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
 'start']){
  const pos=sidebar.indexOf('id="'+id+'"');
  assert.ok(pos>=0&&pos<cutoff,id+' must stay visible');
 }
});
test('missions, personal records and instructions remain accessible',()=>{
 const details=sidebar.slice(sidebar.indexOf('<details class="console-more"'));
 assert.match(details,/<summary>/);
 for(const id of ['mission-lanes','mission-frenzy','mission-targets','mission-ride',
 'progress-lanes','progress-frenzy','progress-targets','progress-ride','extra-status',
 'shots-counter','spinner-count','scoop-count','leaderboard','reset']){
  assert.ok(details.includes('id="'+id+'"'),id+' preserved');
 }
 assert.match(details,/HOW TO PLAY/);
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'IDs stay unique');
});
test('isolated stylesheet is linked, with desktop drawer and mobile flow',()=>{
 assert.ok(html.includes('console.css?v=5'));
 assert.ok(css.includes('.hud.hud-v2'));
 assert.ok(css.includes('max-height:min(62dvh,470px)'));
 assert.ok(css.includes('@media(max-width:1120px)'));
 assert.ok(css.includes('position:static'));
 assert.ok(css.includes('prefers-reduced-motion'));
});

test('console has purposeful multicolour arcade hierarchy without hiding important information',()=>{
 for(const tone of ['--nt-red:', '--nt-gold:', '--nt-cyan:', '--nt-violet:', '--nt-mint:']){
  assert.ok(css.includes(tone),tone+' defined');
 }
 assert.ok(css.includes('.hud-stat:nth-child(1)'));
 assert.ok(css.includes('.hud-stat:nth-child(4)'));
 assert.ok(css.includes('.launcher-section.is-ball-live'));
 assert.ok(css.includes('.hud-v2 .dmd-display'));
 assert.ok(css.includes('.console-more[open]'));
});
test('active objective supports a second line instead of clipping at desktop width',()=>{
 const rule=css.match(/\.hud-v2 \.game-banner strong\{([^}]*)\}/)?.[1]||'';
 assert.ok(rule.includes('white-space:normal'));
 assert.ok(rule.includes('-webkit-line-clamp:2'));
 assert.ok(rule.includes('overflow-wrap:break-word'));
 assert.ok(!rule.includes('white-space:nowrap'));
});
test('updated decorative labels preserve primary game IDs',()=>{
 assert.ok(html.includes('id="score"'));
 assert.ok(html.includes('id="dmd-screen"'));
 assert.ok(html.includes('id="mission-message"'));
 assert.ok(html.includes('MISSION CONTROL'));
 assert.ok(html.includes('TABLE INTEL'));
});

test('exactly one contextual primary action and no repeated idle start copy',()=>{
 assert.ok(sidebar.includes('id="primary-action"'));
 assert.ok(sidebar.includes('id="launcher-section" hidden'));
 assert.ok(sidebar.indexOf('id="reset"')>sidebar.indexOf('id="console-more"'));
 assert.ok(!sidebar.includes('PRESS START TO PLAY'));
 assert.ok(!sidebar.includes('START GAME TO LAUNCH'));
 assert.ok(css.includes('.action-panel>button[hidden]{display:none!important}'));
});

test('desktop console uses available vertical space without adding unnecessary cards',()=>{
 assert.ok(css.includes('@media(min-width:1121px) and (min-height:721px)'));
 assert.ok(css.includes('justify-content:space-between'));
 assert.ok(css.includes('.hud-v2 .console-more{flex:0 0 47px'));
 assert.ok(css.includes('.hud-v2 .dmd-display{min-height:142px;max-height:210px}'));
 assert.ok(html.includes('CHARGE THE POWER GRID'));
 assert.ok(html.includes('HIT THREE ROUTE SHOTS TO LIGHT THE SCOOP'));
 assert.ok(!html.includes('TABLE ONLINE'));
});
