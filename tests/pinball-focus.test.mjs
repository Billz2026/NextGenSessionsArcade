import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../games/pinball/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../games/pinball/focus.css',import.meta.url),'utf8');
const game=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');
test('table focus is a visible desktop option with a clear exit, not a dead button',()=>{
 assert.match(html,/id="table-focus"[^>]*aria-pressed="false"/);
 assert.match(html,/id="focus-exit"[^>]*aria-keyshortcuts="Escape"/);
 assert.ok(html.includes('focus.css?v=1'));
 assert.ok(html.indexOf('focus.css?v=1')>html.indexOf('console.css?v=5'));
 assert.ok(html.includes('game.mjs?v=36'));
 assert.ok(game.includes("focusButton?.addEventListener('click'"));
 assert.ok(game.includes("focusExit?.addEventListener('click'"));
 assert.ok(game.includes("document.documentElement.classList.toggle('pinball-focus',next)"));
 assert.ok(game.includes("requestAnimationFrame(()=>view3d?.resize())"));
});
test('immersive layout retains physical portrait ratio, flipper controls and scoreboard',()=>{
 assert.ok(css.includes('html.pinball-focus:not(:fullscreen) .game-layout'));
 assert.ok(css.includes('grid-template-columns:minmax(0,1fr) clamp(310px,24vw,365px)'));
 assert.ok(css.includes('--table-height:clamp(210px,calc(100dvh - 60px),1080px)'));
 assert.ok(css.includes('aspect-ratio:3/5'));
 assert.ok(css.includes('.flipper-controls'));
 assert.ok(css.includes('.hud.hud-v2'));
 for(const id of ['score','dmd-screen','ball-number','launcher-section',
   'start','launch','flipper-left','flipper-right']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.ok(!css.includes('transform:scaleX('));
 assert.ok(!css.includes('.hud.hud-v2{display:none'));
});
test('Focus cannot strand Fold/mobile users, fullscreen visitors or keyboard users',()=>{
 assert.ok(game.includes("window.matchMedia?.('(min-width:1121px)')"));
 assert.ok(game.includes("if(!event.matches&&tableFocusEnabled)setTableFocus(false)"));
 assert.ok(game.includes("if(document.fullscreenElement&&tableFocusEnabled)setTableFocus(false)"));
 assert.ok(game.includes("event.key==='Escape'&&tableFocusEnabled"));
 assert.ok(css.includes('@media(max-width:1120px)'));
 assert.ok(css.includes('.focus-toggle,.focus-exit{display:none!important}'));
 assert.ok(css.includes('.focus-exit:focus-visible'));
 assert.ok(css.includes('html.pinball-focus:not(:fullscreen)'));
 assert.ok(css.includes('.focus-exit[hidden]{display:none!important}'));
});
