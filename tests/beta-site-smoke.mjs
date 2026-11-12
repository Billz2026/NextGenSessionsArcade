'use strict';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
await mkdir('beta-evidence',{recursive:true});
let checks=0;
function equal(actual,expected,description){assert.equal(actual,expected,description);checks++;}
function ok(actual,description){assert.ok(actual,description);checks++;}

for(const width of [1440,390,360]){
  const isPhone=width<600;
  const ctx=await browser.newContext({
    viewport:{width,height:isPhone?844:900},
    deviceScaleFactor:1,isMobile:isPhone,hasTouch:isPhone,
    reducedMotion:'reduce'
  });
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('requestfailed',r=>{
    if(r.url().startsWith(origin))errors.push('Resource request failed: '+r.url());
  });
  try{
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await page.locator('#menu-new-career').click();
    ok(await page.locator('#screen-setup').isVisible(),'The unchanged live setup loads');
    ok(await page.getByText('£12,500',{exact:true}).count()>0,
       'The existing live game must still advertise the classic £12,500 career');
    await page.locator('#dealership-name').fill('Original Live '+width);
    await page.locator('.setup-submit').click();
    const originalSave=await page.evaluate(()=>localStorage.getItem('the-motor-trade-career-v1'));
    ok(!!originalSave,'Live career really saves under original key');
    const live=JSON.parse(originalSave);
    equal(live.cash,12500,'Live classic £12,500 bank retained');

    await page.goto(origin+'/beta/',{waitUntil:'domcontentloaded'});
    await page.locator('#menu-new-career').click();
    ok(await page.locator('#screen-setup').isVisible(),'The standalone beta setup opens');
    ok(await page.locator('#career-realism').isChecked(),'Realistic 2026 UK dealer selected by default');
    ok((await page.locator('#screen-setup').innerText()).includes('£50,000'),
       'Beta must clearly state starting £50,000');
    ok((await page.locator('#screen-setup').innerText()).includes('SEPARATE CAREER SAVE'),
       'Beta visibly warns that it uses a separate career save');
    await page.locator('#dealership-name').fill('Beta Playtest '+width);
    await page.locator('.setup-submit').click();
    await page.locator('#screen-career').waitFor({state:'visible'});
    const records=await page.evaluate(()=>({
      original:localStorage.getItem('the-motor-trade-career-v1'),
      beta:localStorage.getItem('the-motor-trade-career-beta-v1')
    }));
    equal(records.original,originalSave,'Beta must not rewrite the original career');
    ok(!!records.beta,'Beta writes its own key');
    const sample=JSON.parse(records.beta);
    equal(sample.financialScenario,'uk2026','Beta is correct economic engine');
    equal(sample.cash,50000,'Beta opens with actual £50,000 bank, not just text');

    for(const section of ['auctions','workshop','stock','sales','finance']){
      await page.locator('.career-nav button[data-page="'+section+'"]').click();
      ok(await page.locator('[data-panel="'+section+'"]').isVisible(),
         'Beta '+section+' is functional at width '+width);
      const viewport=await page.evaluate(()=>({
        sw:document.documentElement.scrollWidth,
        bw:document.body.scrollWidth,
        cw:document.documentElement.clientWidth,
        inner:window.innerWidth
      }));
      ok(viewport.sw<=width+4&&viewport.bw<=width+4&&viewport.inner<=width+4,
         'Beta '+section+' must not scroll horizontally at '+width+
         ': '+JSON.stringify(viewport));
    }
    await page.locator('#menu-new-career').count(); // harmless lookup
    await page.goto(origin+'/beta/',{waitUntil:'domcontentloaded'});
    await page.locator('#menu-continue').click();
    const betaReload=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-motor-trade-career-beta-v1')));
    equal(betaReload.cash,50000,'Beta bank still £50,000 after reload');
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await page.locator('#menu-continue').click();
    const liveReload=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-motor-trade-career-v1')));
    equal(liveReload.cash,12500,'Live original career unaffected after beta reload');

    await page.goto(origin+'/beta/',{waitUntil:'domcontentloaded'});
    await page.locator('#menu-continue').click();
    await page.screenshot({path:'beta-evidence/beta-'+width+'.png',fullPage:true,animations:'disabled'});
    equal(errors.length,0,'No uncaught JS or failed local assets: '+JSON.stringify(errors));
    console.log('BETA_SMOKE_PASS '+width+'px live £12,500 retained; beta £50,000 independent; UI and reload good');
  }finally{await ctx.close();}
}
await browser.close();
console.log('BETA_SMOKE_RESULT '+checks+' checks, 0 failures');
