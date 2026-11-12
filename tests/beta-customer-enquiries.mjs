'use strict';
/*
 * Beta customer discovery regression: actual production UK2026 engine and
 * real Chromium. Never manufacture lead messages, customers or sales.
 * Synthetic future careers use only current seeded market offers, real repair
 * workflow and actual retail adverts. No promise of real UK lead frequencies.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},
  hasTouch:true,isMobile:true,reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(origin+'/beta/',{waitUntil:'domcontentloaded'});
await page.locator('#menu-new-career').waitFor({state:'visible'});

const samples=await page.evaluate(()=>{
  const E=window.MotorTradeEngine,C=E.customers;
  const IN=window.MotorTradeInbox,D=E.events;
  const names=['Buyer QA North','Buyer QA West','Buyer QA Central','Buyer QA East','Buyer QA South'];
  return names.map(name=>{
    const s=E.create(name,[],'uk2026');
    const baseline=C.queueEnquiries(s);
    if(baseline.length!==0)throw Error('Bought but unlisted stock generated buyer');
    let purchaseAttempts=0,sold=0,firstLead=null,successfullyListed=0;
    const daysSeen=new Set(),enquiryIds=new Set();
    function manage(){
      if(D.meetingDue(s))D.holdMeeting(s,'sales');
      for(const v of [...s.vehicles]){
        if(v.status==='acquired'){
          if(v.workshop.stage==='unassessed')E.assessStock(s,v.id);
          if(v.workshop.stage==='quoted')E.startPrep(s,v.id,'external');
          if(v.workshop.stage==='quality-check')E.finishPrep(s,v.id);
        }
        if(v.status==='prepared'){
          const asking=Math.round(Math.min(v.retail,v.profile.likelySale)/50)*50;
          if(E.advertise(s,v.id,Math.max(500,asking)).ok)successfullyListed++;
        }
      }
    }
    function tick(){
      if(s.day===s.monthPlan.endDay){
        E.monthly.close(s);
      }
      s.day++;
      E.rollAuctionHall(s);
      s.deadlineSession=0;
      if(s.day===s.monthPlan.endDay+1)E.monthly.next(s);
      E.staffDay(s);E.premisesDay(s);E.aftersalesDay(s);E.vatDay(s);
      E.advanceWorkshop(s);
      const notices=E.advanceCustomers(s);
      if(notices.length)daysSeen.add(s.day);
      for(const c of Object.values(s.customerCases)){
        if(c.status==='enquiry'){
          enquiryIds.add(c.id);
          if(!firstLead){
            IN.sync(s,E);
            firstLead=JSON.parse(JSON.stringify(s));
          }
        }
      }
      // Turning pages or re-rendering cannot create extra people.
      const before=s.customerHistory.length;
      IN.sync(s,E);
      if(s.customerHistory.length!==before)
        throw Error('Reading/syncing the inbox generated extra customers');
      const refs=s.messages.filter(m=>m.reference?.startsWith('retail-enquiry:'));
      if(new Set(refs.map(m=>m.reference)).size!==refs.length)
        throw Error('Repeated inbox sync duplicated a customer enquiry email');
    }
    // Source three affordable stock units through the production seller flow.
    for(let i=0;i<23&&s.vehicles.length<3;i++){
      manage();
      const cars=E.marketFor(s).sellers.slice()
        .sort((a,b)=>a.ask-b.ask);
      for(const car of cars){
        if(s.vehicles.length>=3)break;
        if(car.ask>12000)continue;
        purchaseAttempts++;
        E.acquireSeller(s,car.id,car.ask);
      }
      manage();
      if(s.vehicles.length<3)tick();
    }
    if(s.vehicles.length!==3)throw Error(name+' only bought '+s.vehicles.length+
      ' cars after '+purchaseAttempts+' real offers; bank='+s.cash);
    for(let i=0;i<25&&s.vehicles.some(v=>v.status!=='listed');i++){
      manage();if(s.vehicles.some(v=>v.status!=='listed'))tick();
    }
    if(s.vehicles.some(v=>v.status!=='listed'))throw Error(name+
      ' could not list all 3 cars: '+s.vehicles.map(v=>v.workshop.stage+'/'+v.status));
    const firstAdvertDay=s.day;
    const firstAdvertState=JSON.parse(JSON.stringify(s));
    // No player action in Sales Office: enquiries must nevertheless happen
    // automatically during the next thirty simulated game days.
    for(let i=0;i<30;i++){tick();manage();}
    if(E.normalize(JSON.parse(JSON.stringify(s)))===null)
      throw Error('Production save normalization failed on the customer-enabled career');
    const notified=s.messages.filter(m=>m.reference?.startsWith('retail-enquiry:'));
    const physicalCases=Object.values(s.customerCases)
      .filter(c=>c.status==='enquiry').length;
    return {name,firstAdvertDay,stock:s.vehicles.length,listed:s.vehicles.filter(v=>v.status==='listed').length,
      enquiries:enquiryIds.size,noticeDays:daysSeen.size,notified:notified.length,
      finalActive:physicalCases,firstAdvertState,firstLead,
      totalMonths:Math.floor((s.day-1)/30)+1,
      version:s.version,bank:s.cash};
  });
});
const view=samples.map(({firstLead,firstAdvertState,...rest})=>rest);
console.log('BETA_CUSTOMER_30DAY_SCENARIOS '+JSON.stringify(view));
assert.ok(samples.every(x=>x.stock===3&&x.listed===3),'All sample dealers must have three advertised cars');
assert.ok(samples.every(x=>x.enquiries===x.notified),'Every genuine enquiry must produce one saved inbox notification');
assert.ok(samples.every(x=>x.enquiries>0),'Three fairly priced advertised cars should not go thirty days with no enquiries in the five test seeds');
const total=samples.reduce((n,x)=>n+x.enquiries,0);
assert.ok(total>=10&&total<=60,'Test careers should have repeated but bounded leads, never a guaranteed sale factory');
// Exercise real Continue clicks on an existing career without visiting Sales
// Office. A previously missed day-only demand opportunity must now survive.
const starting=samples[0].firstAdvertState;
await page.evaluate(s=>localStorage.setItem('the-motor-trade-career-beta-v1',JSON.stringify(s)),starting);
await page.reload({waitUntil:'domcontentloaded'});
await page.locator('#menu-continue').click();
let generated=null;
for(let day=0;day<20;day++){
  await page.locator('#continue-day').click();
  const current=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-motor-trade-career-beta-v1')));
  generated=Object.values(current.customerCases).find(c=>
    c.status==='enquiry'&&c.createdDay===current.day);
  if(generated){
    assert.ok((await page.locator('#event-notice').innerText()).includes('NEW RETAIL ENQUIRY'),
      'Player must see an unsolicited new buyer enquiry without having entered Sales Office');
    assert.ok(current.messages.some(m=>m.reference==='retail-enquiry:'+generated.id),
      'Automatic enquiry must appear in Inbox immediately on Continue');
    break;
  }
}
assert.ok(generated,'A player continuing normal days must encounter a genuine buyer enquiry');
const actualSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-motor-trade-career-beta-v1')));
assert.ok(actualSaved.cash>=0,'A real UI save must exist after the daily lead');
const sample=samples.find(x=>x.firstLead)?.firstLead;
assert.ok(sample,'At least one real customer enquiry should exist for UI verification');
const active=Object.values(sample.customerCases).find(c=>c.status==='enquiry');
assert.ok(active,'Snapshot must preserve unbooked live lead');
await page.evaluate(s=>localStorage.setItem('the-motor-trade-career-beta-v1',JSON.stringify(s)),sample);
await page.reload({waitUntil:'domcontentloaded'});
await page.locator('#menu-continue').click();
assert.ok((await page.locator('#dashboard-priorities').innerText()).includes('customer enquiry'),
  'Dashboard should flag genuinely waiting customers before they expire');
await page.locator('.career-nav [data-page="inbox"]').click();
const mails=await page.locator('#inbox-list').innerText();
assert.ok(mails.includes('NEW CUSTOMER ENQUIRY'),'Inbox must show an enquiry without manually opening Sales Office');
const savedBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-motor-trade-career-beta-v1')));
await page.reload({waitUntil:'domcontentloaded'});
await page.locator('#menu-continue').click();
const savedAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('the-motor-trade-career-beta-v1')));
assert.equal(savedAfter.customerHistory.length,savedBefore.customerHistory.length,
  'Reload cannot create another customer enquiry');
assert.equal(savedAfter.messages.filter(m=>m.reference?.startsWith('retail-enquiry:')).length,
  savedBefore.messages.filter(m=>m.reference?.startsWith('retail-enquiry:')).length,
  'Reload cannot resend customer enquiry emails');
await page.locator('.career-nav [data-page="sales"]').click();
const book=page.locator('[data-panel="sales"] [data-action="book-customer"][data-id="'+active.vehicleId+'"]');
assert.ok(await book.isVisible(),'The generated enquiry must be actionable in the normal Sales Office');
await book.click();
const booked=await page.evaluate(id=>JSON.parse(localStorage.getItem('the-motor-trade-career-beta-v1')).customerCases[String(id)].status,
  active.vehicleId);
assert.equal(booked,'booked','Player can convert an automatically generated enquiry into a genuine viewing');
assert.deepEqual(errors,[],'Real browser encountered no customer-related JavaScript errors');
console.log('BETA_CUSTOMER_DISCOVERY_PASS '+total+
  ' genuine enquiries across five 3-car 30-day cohorts; inbox, dashboard, appointment and save passed');
await context.close();await browser.close();
