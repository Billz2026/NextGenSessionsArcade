import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../lab/looping-browser/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../lab/looping-browser/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../lab/looping-browser/style.css',import.meta.url),'utf8');
const sw=readFileSync(new URL('../lab/looping-browser/rom-service-worker.js',import.meta.url),'utf8');
test('unlinked page, local ROM picker, MAME 0.243 integration',()=>{
  assert.match(html,/type="file"/);
  assert.match(html,/NOT LIVE CABINET 001/);
  assert.match(html,/NO ROM DISTRIBUTION/);
  assert.match(js,/window\.EJS_core='mame0\.243'/);
  assert.ok(js.includes('navigator.serviceWorker.register'));
  assert.ok(js.includes('window.EJS_gameUrl=romUrl'));
  assert.ok(js.includes("new URL('./local/looping.zip'"));
  assert.doesNotMatch(js,/URL\.createObjectURL\(selected\)/);
  assert.match(js,/document\.createElement\('script'\)/);
  assert.doesNotMatch(html,/src="https:\/\/www\.emulatorjs\.com\/loader\.js"/);
});
test('service worker responds with local ROM on a named ZIP URL without persistence',()=>{
  assert.ok(sw.includes('event.request.url'));
  assert.ok(sw.includes('NGS_GET_LOOPING_ROM'));
  assert.ok(sw.includes('new Response(buffer'));
  assert.ok(sw.includes('application/zip'));
  assert.doesNotMatch(sw,/caches\.open|indexedDB\.open/);
});
test('ROM compatibility preflight covers expected 14 chips',()=>{
  const m=js.match(/'[^']+'\s*:\s*\[\d+,\s*0x[a-f0-9]+\]/g)||[];
  assert.equal(m.length,14);
  assert.match(js,/'loop551.bin':\[4096,0xd6bb6db6\]/);
  assert.match(js,/'cop.bin':\[1024,0xd47fecec\]/);
  assert.match(js,/'loopvp1.bin':\[32,0x6a0c7d87\]/);
  assert.match(js,/readCentralDirectory\(await file\.arrayBuffer\(\)\)/);
});
test('responsive cabinet reuses official project brand without embedding a ROM',()=>{
  assert.match(html,/assets\/nextgen-header-wordmark-2026\.webp/);
  assert.match(html,/assets\/arcade-wordmark\.svg/);
  assert.match(css,/@media\(max-width:640px\)/);
  assert.doesNotMatch(html,/src="[^"]*\.(zip|bin)"/i);
});
