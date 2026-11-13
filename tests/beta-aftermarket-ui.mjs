import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
try{
  for(const width of [390,1440]){
    const ctx=await browser.newContext({viewport:{width,height:900},
      isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('requestfailed',r=>{if(r.url().startsWith(origin))errors.push(r.url())});
    try{
      await page.goto(origin+'/beta/',{waitUntil:'domcontentloaded'});
      await page.locator('#menu-new-career').click();
      await page.locator('#dealership-name').fill('Aftermarket UI '+width);
      await page.locator('.setup-submit').click();
      await page.locator('#screen-career').waitFor({state:'visible'});
      assert.equal(await page.locator('#auction-flash').isVisible(),true,
        'Weekly auction notice must show on first game day');
      await page.locator('[data-action="skip-weekly-auction"]').click();
      assert.equal(await page.locator('#auction-flash').isVisible(),false);
      const passed=await page.evaluate(()=>JSON.parse(
        localStorage.getItem('the-motor-trade-career-beta-v1')));
      assert.equal(passed.auctionReminderDismissedDay,1);
      assert.equal(passed.auctionHall.phase,'finished');
      assert.equal(passed.cash,50000,'Skipping an auction never charges a buyer fee');
      await page.locator('.career-nav button[data-page="services"]').click();
      assert.equal(await page.locator('[data-panel="services"]').isVisible(),true);
      assert.ok(await page.locator('.service-offer').count()>=1);
      const before=await page.evaluate(()=>JSON.parse(
        localStorage.getItem('the-motor-trade-career-beta-v1')));
      await page.locator('.service-offer button[data-action="book-service-lead"]').first().click();
      const booked=await page.evaluate(()=>JSON.parse(
        localStorage.getItem('the-motor-trade-career-beta-v1')));
      assert.equal(booked.serviceDesk.jobs.length,1);
      const job=booked.serviceDesk.jobs[0];
      assert.equal(job.status,'booked');
      assert.equal(booked.cash,before.cash-job.supplier);
      assert.ok((await page.locator('#services-board').innerText()).includes(
        'ACTIVE CUSTOMER JOBS'));
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('#menu-continue').click();
      await page.locator('.career-nav button[data-page="services"]').click();
      assert.ok((await page.locator('#services-board').innerText()).includes(
        'BOOKED / IN PROGRESS'));
      for(let day=2;day<=job.readyDay;day++)await page.locator('#continue-day').click();
      const after=await page.evaluate(()=>JSON.parse(
        localStorage.getItem('the-motor-trade-career-beta-v1')));
      assert.notEqual(after.serviceDesk.jobs[0].status,'booked');
      assert.ok([1,2,3,4,5].includes(after.serviceDesk.jobs[0].rating));
      assert.equal(after.auctionReminderDismissedDay,1);
      const body=await page.evaluate(()=>({
        sw:document.documentElement.scrollWidth,
        w:document.documentElement.clientWidth
      }));
      assert.ok(body.sw<=width+4,
        'Customer service page must not overflow viewport: '+JSON.stringify(body));
      assert.deepEqual(errors,[],'No page JS errors or failed local assets');
      console.log('AFTERMARKET_BROWSER_PASS '+width+'px, auction skip, saved service job, timed completion');
    }finally{await ctx.close();}
  }
}finally{await browser.close()}
