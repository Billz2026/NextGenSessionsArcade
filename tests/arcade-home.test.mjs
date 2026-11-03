import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const homepage=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const art=readFileSync(new URL('../assets/neon-tilt-card.svg',import.meta.url),'utf8');
test('two playable featured cards link to distinct existing games',()=>{
  assert.equal((homepage.match(/class="game-card /g)||[]).length,6);
  assert.match(homepage,/href="\.\/games\/roulette\/" aria-label="Play High Roll Run roulette"/);
  assert.match(homepage,/href="\.\/games\/pinball\/" aria-label="Play Neon Tilt pinball"/);
  assert.ok(existsSync(new URL('../games/roulette/index.html',import.meta.url)));
  assert.ok(existsSync(new URL('../games/pinball/index.html',import.meta.url)));
  assert.equal((homepage.match(/class="play-button/g)||[]).length,2);
});
test('home status and navigation reflect exactly two games and four future categories',()=>{
  assert.match(homepage,/02 GAMES LIVE/);
  assert.match(homepage,/<strong>02<\/strong><span>PLAYABLE<br>NOW/);
  assert.match(homepage,/<strong>04<\/strong><span>FUTURE<br>CATEGORIES/);
  assert.match(homepage,/<strong>002<\/strong> READY TO PLAY/);
  assert.equal((homepage.match(/class="coming-label"/g)||[]).length,4);
  assert.match(homepage,/id="upcoming" class="game-card category-card reflex-card"/);
  assert.doesNotMatch(homepage,/only playable game|five category previews/);
});
test('two-game grid keeps desktop height contract with responsive mobile layout',()=>{
  assert.match(css,/\.game-grid\{[^}]*100dvh/);
  assert.match(css,/\.pinball-card\{[^}]*grid-column:span 6/);
  assert.match(css,/@media\(max-width:1050px\)/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/\.sports-card\{--accent:#a8d46c\}/);
  assert.match(art,/<svg\b/);
  assert.match(homepage,/src="\.\/assets\/neon-tilt-card\.svg"/);
});
