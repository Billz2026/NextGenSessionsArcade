import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Public primary auction sold-lot display prices and secondary UK dealer
// retail ASKING prices are separate evidence, never automatic BCA guides.
const window={};
const ctx=vm.createContext({window});
for(const name of ['uk-vehicle-catalogue.js','market-evidence-2026.js','vehicle-market.js']){
  new vm.Script(readFileSync(new URL('../beta/'+name,import.meta.url),'utf8'),{filename:name}).runInContext(ctx);
}
const E=window.MotorTradeObservedMarket,M=window.MotorTradeMarket;
const all=Object.values(M.CATALOGUE).flat();

test('only dated, sourced UK auction SOLD-LOT observations and retail asking adverts are stored',()=>{
  assert.equal(E.AUCTION.length,8);
  assert.equal(E.RETAIL.length,4);
  assert.equal(E.PAIRS.length,4);
  assert.equal(E.kind,'public-observations-only-no-automatic-prices');
  assert.equal(new Set(E.AUCTION.map(x=>x.id)).size,8);
  for(const x of E.AUCTION){
    assert.ok(x.sourceUrl.startsWith('https://'));
    assert.ok(/^2026-(?:0[1-9]|1[01])-\d\d$/.test(x.saleDate));
    assert.ok(x.priceGBP>0&&x.miles>0);
    assert.equal(x.priceIncludesFees,null,
      'Do not silently claim lot display price is a fee-inclusive or fee-exclusive hammer');
    assert.ok(!('registration' in x)&&!('vin' in x));
  }
  for(const x of E.RETAIL){
    assert.ok(x.askingGBP>0);
    assert.ok(x.sourceUrl.startsWith('https://'));
    assert.ok(x.snapshotDate<='2026-11-13');
    assert.ok(!('achievedSaleGBP' in x),'Public retail adverts are not completed consumer sales');
  }
});

test('Aygo and Fiesta UK source pairs are close derivatives, but NOT profits',()=>{
  const aygo=E.spread('BW-2026-10-08-11','ATU-2026-09-25-AYGO');
  const fiesta=E.spread('BW-2026-11-05-62','CG-2026-11-13-ST2');
  assert.equal(aygo.sameDerivative,true);
  assert.equal(aygo.grossDifferenceInAdvertAndReportedAuctionPrices,2910);
  assert.equal(fiesta.sameDerivative,true);
  assert.equal(fiesta.grossDifferenceInAdvertAndReportedAuctionPrices,6439);
  for(const x of [aygo,fiesta]){
    assert.equal(x.includesFees,false);
    assert.equal(x.retailSaleConfirmed,false);
    assert.match(x.classifiedAs,/NOT REALISED DEALER PROFIT/);
    assert.equal('dealerProfit' in x,false);
  }
  const aygoAuction=E.AUCTION.find(x=>x.id==='BW-2026-10-08-11');
  assert.equal(aygoAuction.buyerPremiumRate,.075);
  assert.equal(aygoAuction.buyerPremiumMinimumGBP,250);
  assert.ok(aygoAuction.notes.includes('MOT'));
});

test('do not count mismatched miles or ambiguous body types as exact UK comparables',()=>{
  const wide=E.spread('BW-2026-11-05-62','TF-2026-11-13-ST2');
  assert.equal(wide.sameDerivative,false);
  const ambiguous=E.spread('BW-2026-11-05-08','ATU-2026-11-11-A3');
  assert.equal(ambiguous.sameDerivative,false);
  assert.equal(E.PAIRS.filter(x=>x.status==='matched-derivative-unadjusted').length,2);
  for(const p of E.PAIRS){
    const result=E.spread(p.auctionId,p.retailId);
    assert.equal(result.sameDerivative,p.status==='matched-derivative-unadjusted');
  }
  const diesel=E.AUCTION.find(x=>x.id==='BW-2026-10-08-06');
  assert.equal(diesel.fuel,'Diesel');
  assert.notEqual(diesel.fuel,all.find(x=>x.title==='2017 Ford Fiesta Zetec').fuel);
  const tesla=E.AUCTION.find(x=>x.id==='BW-2026-11-05-87');
  assert.equal(tesla.trim,'Performance AWD');
  assert.ok(!all.some(x=>x.title==='2023 Tesla Model Y Performance AWD'),
    'Performance result cannot be applied to game Long Range without evidence');
});

test('BCA-settled simulated stock cannot inherit Brightwells observed prices or premiums',()=>{
  assert.equal(all.length,200);
  for(const row of all){
    const q=E.snapshotFor(row);
    const base=M.priceFor(row,'uk2026');
    assert.equal(q.status,'not-calibrated');
    assert.equal(q.priceToApply,null);
    assert.equal(q.eligibleBcaSoldPrices,0);
    assert.equal(base.priceAudit.wholesaleAudit.status,'not-calibrated');
    assert.equal(base.priceAudit.wholesaleAudit.priceToApply,null);
    assert.equal(base.guide,row.guide==='nonexistent'?null:base.guide,
      'Game guide remains independently modelled and unchanged');
    assert.ok(!('auctionSoldPrice' in base.priceAudit),
      'One Brightwells lot cannot become purported BCA wholesale provenance');
  }
  assert.equal(M.priceFor(all[0],'classic'),all[0],
    'Original classic mode must remain untouched');
  assert.equal(M.priceFor(all.find(x=>x.title==='2019 Ford Fiesta ST-2'),'uk2026').guide,9700);
});

test('evidence loads before 2026 market pricing but neither file changes retail or trade figures',()=>{
  const html=readFileSync(new URL('../beta/index.html',import.meta.url),'utf8');
  assert.ok(html.indexOf('market-evidence-2026.js')>0);
  assert.ok(html.indexOf('market-evidence-2026.js')<html.indexOf('vehicle-market.js'));
  assert.equal(all.filter(x=>M.priceFor(x,'uk2026').priceAudit.status==='unverified').length,145);
  assert.equal(all.filter(x=>M.priceFor(x,'uk2026').priceAudit.status==='retail-comparable').length,55);
});
