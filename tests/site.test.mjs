import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const homepage=readFileSync(new URL('index.html',root),'utf8');
const css=readFileSync(new URL('styles.css',root),'utf8');
test('the archived games are not deployed or linked from the public homepage',()=>{
  assert.equal(existsSync(new URL('games/',root)),false);
  assert.doesNotMatch(homepage,/games\/(roulette|pinball)/i);
  assert.doesNotMatch(homepage,/PLAY NOW|PLAY PINBALL|GAMES LIVE|READY TO PLAY/);
  assert.match(homepage,/00<\/strong><span>GAMES/);
  assert.match(homepage,/No games are currently available to play/);
});
test('arcade floor reserves six unassigned cabinet positions',()=>{
  assert.equal((homepage.match(/class="bay-card/g)||[]).length,6);
  assert.match(homepage,/CABINET 001/);
  assert.match(homepage,/CABINET 006/);
  assert.match(homepage,/AWAITING GAME/);
  assert.equal((homepage.match(/UNASSIGNED/g)||[]).length,5);
});
test('homepage retains official branding and responsive CSS',()=>{
  assert.match(homepage,/assets\/nextgen-header-wordmark-2026\.webp/);
  assert.match(homepage,/assets\/arcade-wordmark\.svg/);
  assert.match(homepage,/id="floor"/);
  assert.match(homepage,/id="vision"/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.ok(existsSync(new URL('assets/nextgen-header-wordmark-2026.webp',root)));
});
