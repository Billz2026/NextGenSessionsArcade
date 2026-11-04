import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../games/pinball/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../games/pinball/console.css',import.meta.url),'utf8');
const towerCss=readFileSync(new URL('../games/pinball/side-towers.css',import.meta.url),'utf8');
const gameSource=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');
const sidebarStart=html.indexOf('<aside class="hud hud-v2"');
const sidebar=html.slice(sidebarStart,html.indexOf('</aside>',sidebarStart)+8);
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
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'IDs stay unique');
});
test('isolated stylesheet is linked, with desktop drawer and mobile flow',()=>{
 assert.ok(html.includes('console.css?v=7'));
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

test('widescreen desktop stage fills the viewport without stretching table geometry',()=>{
 const tableCss=readFileSync(new URL('../games/pinball/game.css',import.meta.url),'utf8');
 const wide=tableCss.slice(tableCss.lastIndexOf('/* Phase 4J:'));
 assert.match(html,/game\.css\?v=\d+/);
 assert.ok(wide.includes('1640px'));
 assert.ok(wide.includes('grid-template-columns:minmax(0,1fr) clamp(390px,32vw,530px)'));
 assert.ok(wide.includes('html:not(:fullscreen) .machine'));
 assert.ok(wide.includes('max-width:1280px'));
 assert.ok(tableCss.includes('aspect-ratio:3/5'));
 assert.ok(!wide.includes('.playfield-wrap{'));
});

test('two full-height instrument towers flank but never replace the functional playfield',()=>{
 const arenaStart=html.indexOf('class="machine-arena"'),table=html.indexOf('<div class="cabinet">',arenaStart);
 const left=html.indexOf('class="arena-wing arena-wing--missions"',arenaStart);
 const right=html.indexOf('class="arena-wing arena-wing--overload"',arenaStart);
 assert.ok(arenaStart>0&&left>arenaStart&&left<table&&table<right);
 assert.ok(right<html.indexOf('<aside class="hud hud-v2"'),'instrument towers remain inside the machine');
 for(const id of ['wing-flight-title','wing-mission-count','wing-fuel-fill','wing-wizard','wing-overload-title',
  'wing-lock-1','wing-lock-2','wing-lock-3','wing-jackpot-ramp','wing-jackpot-orbit','wing-jackpot-super',
  'wing-power-cells','wing-live-balls','wing-overload-state']){
  assert.match(html,new RegExp('id="'+id+'"'));
 }
 for(const id of ['launch','orbit','core','night','signal','redline'])
  assert.ok(html.includes('data-flight-id="'+id+'"'),id+' mission present');
 assert.ok(html.includes('side-towers.css?v=1'));
 assert.match(towerCss,/grid-template-columns:minmax\(0,1fr\) max-content minmax\(0,1fr\)/);
 assert.match(towerCss,/@container \(max-width: 800px\)/);
 assert.match(towerCss,/@media\(max-width:900px\)/);
 assert.match(towerCss,/prefers-reduced-motion:reduce/);
 assert.match(gameSource,/syncHUD\(\);syncArena\(\);dmd\.update/);
});

test('side tower lights mirror actual mission, lock, charge and jackpot state',async()=>{
 const {PinballEngine}=await import('../games/pinball/engine.mjs');
 const start=gameSource.indexOf('// Cabinet-side instrument towers mirror existing engine state.');
 const end=gameSource.indexOf('const ctx=ui.canvas.getContext',start);
 assert.ok(start>=0&&end>start,'locate the actual live tower sync implementation');
 const section=gameSource.slice(start,end);
 const element=id=>{
  const active=new Set();
  return{
   id,textContent:'',style:{width:''},dataset:{flightId:id},
   classList:{
    toggle(name,on){if(on)active.add(name);else active.delete(name)},
    contains(name){return active.has(name)}
   }
  };
 };
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
 const elements=new Map(ids.map(id=>[id,element(id)]));
 const missionRows=[...html.matchAll(/data-flight-id="([^"]+)"/g)].map(x=>element(x[1]));
 const powerCells=[element('cell0'),element('cell1'),element('cell2')];
 const document={
  getElementById(id){return elements.get(id)||null},
  querySelectorAll(query){
   if(query==='[data-flight-id]')return missionRows;
   if(query==='#wing-power-cells i')return powerCells;
   return [];
  }
 };
 const g=new PinballEngine();
 const build=Function('engine','document',
  "const $=id=>document.getElementById(id);"+section+";return syncArena;");
 const sync=build(g,document);
 sync();
 assert.equal(elements.get('wing-flight-title').textContent,'SYSTEM STANDBY');
 assert.equal(elements.get('wing-mission-count').textContent,'0 / 6');
 g.start();g.armCommandMission();sync();
 assert.equal(elements.get('wing-fuel-fill').style.width,'100%');
 assert.equal(missionRows[0].classList.contains('is-current'),true);
 g.startCommandMission();
 for(const action of g.commandMission.sequence)g.progressCommand(action);
 sync();
 assert.equal(missionRows[0].classList.contains('is-complete'),true);
 assert.equal(elements.get('wing-mission-count').textContent,'1 / 6');
 g.ballLocks=1;g.lockLit=true;g.powerCharges=2;sync();
 assert.equal(elements.get('wing-lock-count').textContent,'1/2');
 assert.equal(elements.get('wing-lock-1').classList.contains('is-locked'),true);
 assert.equal(elements.get('wing-lock-2').classList.contains('is-ready'),true);
 assert.equal(powerCells.filter(c=>c.classList.contains('is-charged')).length,2);
 g.startMultiball();sync();
 assert.equal(elements.get('wing-overload-title').textContent,'NEON OVERLOAD');
 assert.ok(elements.get('wing-reactor').classList.contains('is-active'));
 assert.equal(elements.get('wing-live-balls').textContent,'3');
 assert.ok(elements.get('wing-lock-3').classList.contains('is-live'));
 g.awardMultiballJackpot('ramp');g.awardMultiballJackpot('orbit');sync();
 assert.ok(elements.get('wing-jackpot-ramp').classList.contains('is-claimed'));
 assert.ok(elements.get('wing-jackpot-super').classList.contains('is-live'));
 assert.doesNotMatch(section,/engine\.score\s*=/,'decorative instruments may not mutate scoring');
});
