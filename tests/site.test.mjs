import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const html=readFileSync(new URL('index.html',root),'utf8');
const css=readFileSync(new URL('styles.css',root),'utf8');
const js=readFileSync(new URL('simulator.js',root),'utf8');
test('renamed site contains no playable arcade or legacy URL',()=>{
  assert.match(html,/<title>The Motor Trade \| UK Car Dealer Simulator<\/title>/);
  assert.match(html,/billz2026\.github\.io\/TheMotorTrade\//);
  assert.doesNotMatch(html,/NextGenSessionsArcade|looping\.zip|arcade-home\.js|<iframe/);
  assert.equal(existsSync(new URL('lab/',root)),false);
  assert.equal(existsSync(new URL('arcade-home.js',root)),false);
});
test('initial website clearly identifies its pre-alpha concept status',()=>{
  assert.match(html,/PRE-ALPHA CONCEPT/);
  assert.match(html,/FOUNDATION BUILD/);
  assert.match(html,/ILLUSTRATIVE LOT/);
  assert.match(html,/FICTIONAL EXAMPLE/);
  assert.match(html,/not net profit/i);
  assert.match(html,/PLANNED GAME SYSTEMS/);
});
test('deal calculator can model buyer fee VAT, prep and customer negotiation',()=>{
  for(const id of ['hammer','fee','transport','prep','asking','offer','landed','fee-vat','profit-asking','profit-offer','cash-left','deal-status'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(js,/values\.fee\*20\)\/100/);
  assert.match(js,/values\.hammer\+values\.fee\+feeVat\+values\.transport\+values\.prep/);
  assert.match(js,/values\.asking-landed/);
  assert.match(js,/values\.offer-landed/);
  assert.match(js,/reset-calc/);
  assert.match(js,/Intl\.NumberFormat\('en-GB'/);
});
test('branding, semantic structure and responsive layouts are intact',()=>{
  assert.match(html,/assets\/nextgen-header-wordmark-2026\.webp/);
  assert.ok(existsSync(new URL('assets/nextgen-header-wordmark-2026.webp',root)));
  assert.ok(existsSync(new URL('assets/hatchback-study.svg',root)));
  assert.match(html,/aria-labelledby="page-heading"/);
  assert.match(css,/@media\(max-width:860px\)/);
  assert.match(css,/@media\(max-width:600px\)/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
