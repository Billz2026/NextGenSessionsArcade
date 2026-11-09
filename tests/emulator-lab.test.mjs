import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../lab/arcade-emulator/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../lab/arcade-emulator/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../lab/arcade-emulator/style.css',import.meta.url),'utf8');
test('prototype loads ROMs locally, not via hard-coded game URLs',()=>{
  assert.match(js,/URL\.createObjectURL\(selected\)/);
  assert.match(js,/window\.EJS_gameUrl = objectUrl/);
  assert.doesNotMatch(js,/fetch\s*\([^)]*(rom|game)/i);
  assert.match(html,/type="file"/);
  assert.match(html,/No games are bundled or published/);
});
test('prototype supports distinct arcade and console core choices',()=>{
  for(const name of ['arcade','mame2003','nes','snes','segaMD','gb']) {
    assert.match(html, new RegExp('value="'+name+'"'));
  }
  assert.match(js,/EJS_VERSION = '4\.2\.3'/);
  assert.match(js,/window\.EJS_ready/);
});
test('site interface remains a responsive standalone lab',()=>{
  assert.match(css,/@media\(max-width:1050px\)/);
  assert.match(css,/@media\(max-width:650px\)/);
  assert.match(html,/src="\.\/app\.js"/);
  assert.match(html,/href="\.\/style\.css"/);
  assert.match(html,/src="\.\.\/\.\.\/assets\/nextgen-header-wordmark-2026\.webp"/);
});
