'use strict';
/*
 * The Motor Trade beta: reproducible MODELLED wholesale guide purchase stress.
 * This is NOT a forecast or a source of observed UK auction hammer prices.
 * Preserve quote uncertainty and unprofitable purchases; do not massage trade
 * guides to make the virtual dealer appear more successful.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const ctx=vm.createContext({window:{}});
for(const filename of [
  'repair-prices.js','vat.js','vehicle-intel.js',
  'uk-vehicle-catalogue.js','uk-original-verification.js',
  'vehicle-accuracy.js','vehicle-market.js',
  'auction-fees.js','auction-transport.js'
]){
  const src=readFileSync(new URL('../beta/'+filename,import.meta.url),'utf8');
  new vm.Script(src,{filename}).runInContext(ctx);
}
const {MotorTradeMarket:M,MotorTradeIntel:I,MotorTradeAuctionFees:FEES,
  MotorTradeAccuracy:ACCURACY}=ctx.window;
const catalogue=Object.values(M.CATALOGUE).flat();
const rows=catalogue.map((template,i)=>{
  const priced=M.priceFor(template,'uk2026');
  const car={...priced,id:'A-30-'+i,origin:'auction',feeModel:'bca-blue-2026'};
  const p=I.profile(car);
  const quote=I.quote({...car,profile:p},'auction',car.guide,false);
  return {car,p,quote};
});
const quoted=rows.filter(({quote})=>!quote.feeQuoteRequired);
const losses=quoted.filter(({quote})=>quote.expectedMargin<0);
const below=quoted.filter(({quote})=>quote.expectedMargin<quote.targetMargin);
const unquoted=rows.filter(({quote})=>quote.feeQuoteRequired);
const audit={total:rows.length,quoteable:quoted.length,requiresFeeQuote:unquoted.length,
  guidePriceLosses:losses.length,belowTarget:below.length,
  verifiedWholesalePrices:0,unknownNewRetailPrices:
  rows.filter(({car})=>car.priceAudit.status==='unverified').length};
console.log('UK2026_GUIDE_PRICE_VIABILITY '+JSON.stringify(audit));

test('simulation has 200 UK vehicles with an honest source evidence register',()=>{
  assert.equal(catalogue.length,200);
  assert.equal(ACCURACY.summary(M.CATALOGUE).pending,0);
  assert.equal(audit.unknownNewRetailPrices,145);
  assert.equal(rows.filter(({car})=>car.priceAudit.status==='retail-comparable').length,55);
  assert.ok(rows.every(({car})=>car.priceAudit.tradeGuide?
    car.priceAudit.tradeGuide.includes('not a verified auction result'):true));
});

test('published BCA Blue tariff never silently extrapolates above £24,999',()=>{
  assert.equal(FEES.MAX_PUBLISHED_HAMMER,24999);
  assert.equal(FEES.feeAtHammer(25000),null);
  assert.equal(audit.requiresFeeQuote,18);
  for(const {car,quote} of unquoted){
    assert.ok(car.guide>FEES.MAX_PUBLISHED_HAMMER);
    assert.equal(quote.total,null);
    assert.equal(quote.expectedMargin,null);
  }
});

test('quote arithmetic includes exact modelled buyer fees, transport, prep and VAT',()=>{
  assert.equal(audit.quoteable,182);
  for(const {car,p,quote} of quoted){
    assert.ok(Number.isSafeInteger(quote.fee)&&quote.fee>0);
    assert.ok(Number.isSafeInteger(quote.transport)&&quote.transport>0);
    assert.ok(Number.isSafeInteger(quote.prep)&&quote.prep>0);
    assert.equal(quote.total,car.guide+quote.fee+quote.transport+quote.prep);
    assert.equal(quote.expectedMargin,p.likelySale-quote.total-
      Math.ceil(quote.vatEstimatePence/100));
    assert.ok(quote.maxBid>=0);
  }
});

test('do not disguise materially loss-making guide bids as profitable stock',()=>{
  assert.equal(audit.guidePriceLosses,24);
  assert.equal(audit.belowTarget,130);
  const names=new Set(losses.map(({car})=>car.title));
  for(const name of [
    '2022 Audi e-tron 55 quattro',
    '2022 Nissan Qashqai Acenta Premium',
    '2017 Nissan Qashqai Acenta',
    '2021 Hyundai Ioniq 5 Premium',
    '2022 Audi A3 Sportback 35 TFSI',
    '2016 Ford Focus Zetec'
  ])assert.ok(names.has(name),'Loss at guide must be disclosed: '+name);
  assert.equal(rows.filter(({car})=>car.priceAudit.buyingRisk).length,4,
    'Four legacy trade guides >= observed retail comparisons are quarantined');
});

test('explicit risk banner on auction rostrum is visible and does not block deliberate poor bids',()=>{
  const view=readFileSync(new URL('../beta/auction-hall-view.js',import.meta.url),'utf8');
  assert.match(view,/PROJECTED LOSS BEFORE OVERHEADS/);
  assert.match(view,/BELOW TARGET CONTRIBUTION/);
  assert.match(view,/profitWarning/);
  assert.match(view,/SKIP — BUYER FEE NOT QUOTED/);
  assert.match(view,/feeUnknown/);
});
