import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const homepage=readFileSync(new URL('index.html',root),'utf8');
const css=readFileSync(new URL('styles.css',root),'utf8');

test('archived prototypes remain off the published site',()=>{
  assert.equal(existsSync(new URL('games/',root)),false);
  assert.doesNotMatch(homepage,/games\/(roulette|pinball)/i);
  assert.doesNotMatch(homepage,/PLAY NOW|PLAY PINBALL|LIVE BETA|href="\.\/games\//i);
  assert.match(homepage,/>00<\/strong><span>GAMES/);
  assert.match(homepage,/No games are currently available to play/);
});
test('six uniform cabinet tiles are reserved, none present as playable links',()=>{
  assert.equal((homepage.match(/class="machine-tile /g)||[]).length,6);
  assert.equal((homepage.match(/class="tile-heading"/g)||[]).length,6);
  assert.equal((homepage.match(/class="tile-content"/g)||[]).length,6);
  assert.equal((homepage.match(/class="tile-footer"/g)||[]).length,6);
  assert.equal((homepage.match(/class="cabinet-monitor"/g)||[]).length,6);
  assert.equal((homepage.match(/AWAITING GAME/g)||[]).length,6);
  for(let i=1;i<=6;i++) assert.match(homepage,new RegExp('CABINET<br><em>00'+i+'\\.'));
  assert.doesNotMatch(homepage,/<a[^>]*class="machine-tile/);
});
test('tile-first homepage uses responsive grid and keeps official wordmarks',()=>{
  assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:1100px\)/);
  assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/grid-template-columns:1fr/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(homepage,/id="floor"/);
  assert.match(homepage,/id="vision"/);
  assert.match(homepage,/assets\/nextgen-header-wordmark-2026\.webp/);
  assert.match(homepage,/assets\/arcade-wordmark\.svg/);
  assert.ok(existsSync(new URL('assets/nextgen-header-wordmark-2026.webp',root)));
});
