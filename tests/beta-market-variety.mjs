'use strict';
/*
 * Phase 8E UK2026 vehicle mix: genuine browser load, production sourcing,
 * every fuel, wide mileage and model years, correlated prices and unchanged
 * live/classic source. The sample is synthetic: not a claim about the UK
 * market's exact distribution or a verified trade hammer price.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto((process.env.SITE_ORIGIN||'http://127.0.0.1:4173')+'/beta/',{waitUntil:'domcontentloaded'});
await page.locator('#menu-new-career').waitFor({state:'visible'});

const metrics=await page.evaluate(()=>{
  const E=window.MotorTradeEngine,M=window.MotorTradeMarket;
  const start=E.create('Market Variety QA',[],'uk2026');
  const status=E.marketStatus(start);
  if(status.current.key!=='premium'||start.reputationScore!==5)
    throw Error('A £50k UK dealer at reputation 5 should see more than starter-band stock');
  if(M.tierFor(50000,5).key!=='starter')
    throw Error('Classic reputation-gated market must remain unchanged');
  if(M.sourcingTier2026(10000)!=='starter'||
    M.sourcingTier2026(22000)!=='modern'||
    M.sourcingTier2026(50000)!=='premium'||
    M.sourcingTier2026(120000)!=='luxury')
    throw Error('2026 sourcing tiers do not follow available market-level cash');
  const initial=E.marketFor(start);
  if(JSON.stringify(initial)!==JSON.stringify(E.marketFor(start)))
    throw Error('Opening 2026 source offers rerolled without game day advancing');
  if(!E.normalize(JSON.parse(JSON.stringify(start))))
    throw Error('Opening save with new market does not restore');
  const classic=E.market(1,5,0,'Original Classic',5,12500,'classic');
  if(classic.auctions.length!==3||classic.auctions[0].miles!==118300||
    classic.auctions[0].title!=='2016 Ford Focus Zetec'||
    classic.sellers[0].title!=='2019 Honda Jazz SE')
    throw Error('Unreleased classic career initial sourcing changed');
  const all=[],perDay=[];
  for(let day=1;day<=90;day++){
    const current=E.market(day,5,0,'Market Variety QA',5,50000,'uk2026');
    const combined=[...current.auctions,...current.sellers];
    const idSet=new Set(combined.map(x=>x.id));
    if(idSet.size!==combined.length)
      throw Error('Duplicate daily auction or seller identifiers');
    for(const car of combined){
      if(!Number.isSafeInteger(car.miles)||car.miles<3500||car.miles>185000)
        throw Error('Impossible modelled mileage '+car.miles+' for '+car.title);
      if(!Number.isSafeInteger(car.guide)||!Number.isSafeInteger(car.retail)||
        car.guide<850||car.retail<1000)
        throw Error('Invalid 2026 guide or retail asking estimate '+car.title);
      if(car.priceAudit?.buyingRisk)
        throw Error('Unverified guide >= retail risk unit still in sellable sourcing');
      if(!car.profile||!Number.isSafeInteger(car.profile.likelySale))
        throw Error('Missing genuine vehicle-intel profile on '+car.title);
      if(car.priceAudit?.variantMileage!==undefined &&
         (car.priceAudit.variantMileage!==car.miles||
          !car.priceAudit.note.includes('simulated')))
        throw Error('Random mileage not disclosed as an illustrative adjustment');
      if(!['Petrol','Diesel','Hybrid','Plug-in Hybrid','Electric'].includes(car.fuel))
        throw Error('Unexpected vehicle fuel category '+car.fuel);
      const year=Number(car.title.slice(0,4));
      if(year<2016||year>2025)
        throw Error('Model year outside verified/illustrative catalogue boundaries');
      all.push({day,id:car.id,title:car.title,miles:car.miles,fuel:car.fuel,
        year,guide:car.guide,retail:car.retail,source:car.kind});
    }
    perDay.push({day,cars:combined.length,lowestMiles:Math.min(...combined.map(x=>x.miles)),
      fuels:[...new Set(combined.map(x=>x.fuel))]});
  }
  const bands={
    under30:all.filter(c=>c.miles<=30000).length,
    '30to50':all.filter(c=>c.miles>30000&&c.miles<=50000).length,
    '50to80':all.filter(c=>c.miles>50000&&c.miles<=80000).length,
    '80to110':all.filter(c=>c.miles>80000&&c.miles<=110000).length,
    over110:all.filter(c=>c.miles>110000).length
  };
  const fuels=Object.fromEntries(['Petrol','Diesel','Hybrid','Plug-in Hybrid','Electric']
    .map(f=>[f,all.filter(x=>x.fuel===f).length]));
  const years=Object.fromEntries([...new Set(all.map(x=>x.year))]
    .sort((a,b)=>a-b).map(y=>[y,all.filter(x=>x.year===y).length]));
  const firstMonth=all.filter(c=>c.day<=30);
  const firstTwoWeeks=all.filter(c=>c.day<=14);
  const firstDay=all.filter(c=>c.day===1);
  const groups=Object.groupBy(all,x=>x.title);
  const pricePairs=Object.values(groups).flatMap(cars=>{
    const pairs=[];
    for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){
      const a=cars[i],b=cars[j];
      if(a.source!==b.source||Math.abs(a.miles-b.miles)<35000)continue;
      const low=a.miles<b.miles?a:b,high=low===a?b:a;
      pairs.push({title:a.title,lowMiles:low.miles,highMiles:high.miles,
        lowRetail:low.retail,highRetail:high.retail});
    }
    return pairs;
  });
  const wrongPrice=pricePairs.filter(p=>p.lowRetail+100<p.highRetail);
  return {total:all.length,bands,fuels,years,firstMonth:{
      total:firstMonth.length,lowMiles:firstMonth.filter(c=>c.miles<=30000).length,
      newer:firstMonth.filter(c=>c.year>=2024).length,
      fuels:[...new Set(firstMonth.map(c=>c.fuel))]},
    firstTwoWeeks:{total:firstTwoWeeks.length,lowMiles:firstTwoWeeks.filter(c=>c.miles<=30000).length},
    firstDay:firstDay.map(({title,miles,fuel,guide})=>({title,miles,fuel,guide})),
    sampleDays:perDay.slice(0,6),pricePairs:pricePairs.length,
    invalidPricePairs:wrongPrice.slice(0,10),staticCatalogSize:
      Object.values(M.CATALOGUE).reduce((n,x)=>n+x.length,0),
    catalogueHas2025:Object.values(M.CATALOGUE).flat().some(x=>x.title.startsWith('2025 '))};
});
console.log('BETA_MARKET_MIX_90D '+JSON.stringify(metrics));
assert.ok(metrics.total>=150,'90 days should offer a real range of buying opportunities');
assert.ok(metrics.bands.under30>=20,
  'Low-mileage under-30k cars must be available, not hidden by old high-mileage starters');
assert.ok(Object.values(metrics.bands).every(n=>n>=10),
  'Sourcing must include all five mileage bands from nearly new to very high mileage');
// A rare UK used PHEV can correctly appear only once in a 90-day sample.
  // Require healthy mainstream representation without forcing a false 1%-fuel
  // threshold to look like a larger market share.
assert.ok(['Petrol','Diesel','Hybrid','Electric'].every(f=>metrics.fuels[f]>=2)&&
  metrics.fuels['Plug-in Hybrid']>=1,
  'Market must include all five powertrains without overforcing rare PHEVs');
assert.ok(metrics.firstMonth.lowMiles>=8,
  'A player should see several sub-30,000 mile cars in one 30-day month');
assert.ok(metrics.firstTwoWeeks.lowMiles>=3,
  'Low-mileage stock should appear in the first two weeks, not require reputation grinding');
assert.ok(metrics.firstMonth.newer>=2,
  'Recently used 2024-25 stock should appear in the first trading month');
assert.ok(metrics.years['2024']>0||metrics.years['2025']>0,
  'The 90-day market must expose genuinely newer model years');
assert.ok(metrics.catalogueHas2025,
  'The catalogue must retain authentic 2025 model-year options');
assert.ok(metrics.pricePairs>10,'Repeated models need meaningful mileage-price tradeoffs');
assert.deepEqual(metrics.invalidPricePairs,[],
  'Within the same title, a 35k+ lower-mileage example must never be materially cheaper');
assert.ok(metrics.staticCatalogSize>=54,'Newer catalogue examples must exist alongside classic 50');

await page.locator('#menu-new-career').click();
await page.locator('#dealership-name').fill('Real Buyer Market Demo');
await page.locator('.setup-submit').click();
await page.locator('#screen-career').waitFor({state:'visible'});
await page.locator('.career-nav [data-page="auctions"]').click();
assert.match(await page.locator('[data-panel="auctions"]').innerText(),/low and high mileage/i);
await page.locator('.career-nav [data-page="auctionHall"]').click();
assert.match(await page.locator('[data-panel="auctionHall"]').innerText(),/MILES/);
const dimensions=await page.evaluate(()=>({
  expected:390,scroll:document.documentElement.scrollWidth,
  body:document.body.scrollWidth}));
assert.ok(dimensions.scroll<=394&&dimensions.body<=394,'Mobile buy/auction pages cannot scroll horizontally');
assert.deepEqual(errors,[],'New market generator creates no uncaught browser JavaScript errors');
console.log('BETA_MARKET_VARIETY_PASS '+JSON.stringify({
  under30:metrics.bands.under30,fuelKinds:Object.keys(metrics.fuels).length,
  modelYears:Object.keys(metrics.years),firstMonthLow:metrics.firstMonth.lowMiles,
  firstMonthNew:metrics.firstMonth.newer,pricePairs:metrics.pricePairs}));
await context.close();await browser.close();
