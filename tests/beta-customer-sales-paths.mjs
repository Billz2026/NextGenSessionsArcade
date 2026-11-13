'use strict';
/*
 * Phase 8E customer sales paths — actual production UK2026 state, prices,
 * payroll/VAT/ledger and Chromium phone UI. No fabricated free sales.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('dialog',d=>d.accept());
await page.goto(origin+'/beta/',{waitUntil:'domcontentloaded'});
await page.locator('#menu-new-career').waitFor();
const data=await page.evaluate(()=>{
  const E=window.MotorTradeEngine,D=E.events,C=E.customers,IN=window.MotorTradeInbox;
  const clone=x=>JSON.parse(JSON.stringify(x));
  function normalized(s,what){
    if(!E.normalize(clone(s)))throw Error('Production save invalid after '+what);
    const expected=50000+s.ledger.reduce((n,x)=>n+x.delta,0);
    if(s.cash!==expected)throw Error('Bank/ledger mismatch after '+what+': '+s.cash+' vs '+expected);
  }
  function tick(s){
    if(D.meetingDue(s))D.holdMeeting(s,'sales');
    const end=s.day===s.monthPlan.endDay;
    if(end)E.monthly.close(s);
    s.day++;E.rollAuctionHall(s);s.deadlineSession=0;
    if(end)E.monthly.next(s);
    E.staffDay(s);E.premisesDay(s);E.aftersalesDay(s);E.vatDay(s);
    E.advanceWorkshop(s);E.advanceCustomers(s);IN.sync(s,E);
  }
  function lead(name){
    const s=E.create(name,[],'uk2026');
    let bought=false;
    for(let i=0;i<12&&!bought;i++){
      const listed=E.marketFor(s).sellers.slice().sort((a,b)=>a.ask-b.ask);
      for(const car of listed){
        if(car.ask>15000)continue;
        const result=E.acquireSeller(s,car.id,car.ask);
        if(result.ok){bought=true;break;}
      }
      if(!bought)tick(s);
    }
    if(!bought)throw Error('Could not purchase a car: '+name);
    const v=s.vehicles[0];
    for(let d=0;d<26&&v.status!=='listed';d++){
      if(v.workshop.stage==='unassessed')E.assessStock(s,v.id);
      if(v.workshop.stage==='quoted')E.startPrep(s,v.id,'external');
      if(v.workshop.stage==='quality-check')E.finishPrep(s,v.id);
      if(v.status==='prepared'){
        const ask=Math.max(500,Math.round(Math.min(v.retail,v.profile.likelySale)*1.08/50)*50);
        const listed=E.advertise(s,v.id,ask);
        if(!listed.ok)throw Error('Unable to advertise '+v.title+': '+listed.message);
      }
      if(v.status!=='listed')tick(s);
    }
    if(v.status!=='listed')throw Error('Unprepared real car '+v.title);
    for(let i=0;i<26;i++){
      const c=C.caseFor(s,v.id);
      if(c?.status==='enquiry'){
        normalized(s,'genuine 2026 enquiry');
        return {s,v,c};
      }
      tick(s);
    }
    throw Error('No genuine lead after 26 game days with one advertised car');
  }
  const conversations=[];
  let remoteSuccess=null,remoteRejected=0,remoteCancelled=0,remoteInspected=0;
  let priceCounterCase=null;
  for(let i=0;i<18;i++){
    const {s,v,c}=lead('Sales Dialogue Test '+i);
    const savedBeforeQuote=clone(s);
    const b=E.buyers(v,s);
    if(!b||b.cashLimit>=v.asking)throw Error('No true buyer budget ceiling');
    const over=E.quoteCustomer(s,v.id,v.asking);
    if(!over.ok||c.quoteStatus!=='counter'||c.quotedPrice!==b.cashLimit)
      throw Error('Dealer asking price did not generate genuine buyer counter');
    normalized(s,'buyer counter');
    if(!priceCounterCase)priceCounterCase=savedBeforeQuote;
    const yes=E.acceptPriceCounterCustomer(s,v.id);
    if(!yes.ok||c.quoteStatus!=='accepted')throw Error('Cannot accept budget counter');
    normalized(s,'provisional price accepted');
    const proposed=clone(s);
    const deposit=E.remoteReserveCustomer(s,v.id);
    if(!deposit.ok){
      remoteRejected++;
      if(c.held!==0||s.sold.length)throw Error('Declined remote reservation created money or free sale');
      normalized(s,'declined remote reservation');
      conversations.push({id:c.id,remote:false,price:b.cashLimit});
      continue;
    }
    if(c.status!=='reserved'||c.held!==250||c.remote!==true||
       c.terms!=='distance-refundable'||c.collectionDay!==s.day+1)
      throw Error('Provisional telephone order was not recorded as refundable next-day reservation');
    if(s.sold.length||E.completeSale(s,v.id,'cash',null).ok)
      throw Error('Remote deposit must not allow handover before arrival');
    normalized(s,'remote deposit');
    if(!remoteSuccess)remoteSuccess={before:proposed,paid:clone(s),carId:v.id};
    const beforeRefund=clone(s);
    const cancel=E.cancelCustomer(s,v.id,'buyer');
    if(!cancel.ok||c.held!==0||
      !s.customerFunds.some(x=>x.leadId===c.id&&x.type==='refunded'&&x.delta===-250))
      throw Error('Remote buyer cancellation failed full £250 refund');
    if(s.cash!==beforeRefund.cash)
      throw Error('Remote cancellation should not debit/credit trading bank instead of customer holding');
    normalized(s,'customer full refund');
    remoteCancelled++;
    // Independently test collection using the exact same genuine order state.
    const collection=E.normalize(clone(beforeRefund));
    tick(collection);
    const due=C.caseFor(collection,v.id);
    if(due?.status!=='collectable'){
      if(due?.status!=='lost')throw Error('Collection did not either proceed or cancel');
      normalized(collection,'buyer missed collection');
      continue;
    }
    if(E.completeSale(collection,v.id,'cash',null).ok)
      throw Error('Remote collection without inspection must not be payable');
    const inspected=E.inspectRemoteCustomer(collection,v.id);
    if(!inspected.ok){
      if(due.held!==0)throw Error('Customer inspection rejection failed deposit refund');
      normalized(collection,'collection inspection rejection');
      continue;
    }
    remoteInspected++;
    const price=due.price,bankBefore=collection.cash,ledgerBefore=collection.ledger.length;
    const finish=E.completeSale(collection,v.id,'cash',null);
    if(!finish.ok)throw Error('Accepted vehicle could not be collected: '+finish.message);
    if(collection.cash!==bankBefore+price||collection.ledger.length<=ledgerBefore)
      throw Error('Deposit plus outstanding balance do not reconcile to final vehicle price');
    const sold=collection.sold.at(-1);
    if(sold.depositApplied!==250||sold.customerBalancePaid!==price-250)
      throw Error('Sales record incorrectly paid the already-received deposit twice');
    if(C.heldDeposits(collection)!==0)throw Error('Customer holding account still contains applied deposit');
    normalized(collection,'remote handover and margin-scheme record');
    conversations.push({id:c.id,remote:true,price,paidBalance:sold.customerBalancePaid});
  }
  if(!remoteSuccess||remoteCancelled<1||remoteInspected<1||remoteRejected<1)
    throw Error('Unexercised remote scenario: '+JSON.stringify({remoteSuccess:!!remoteSuccess,
      remoteCancelled,remoteInspected,remoteRejected}));
  const booked=clone(priceCounterCase);
  const first=booked.vehicles[0],c=C.caseFor(booked,first.id);
  const ask=E.quoteCustomer(booked,first.id,first.asking);
  if(!ask.ok||c.quoteStatus!=='counter')throw Error('Quote did not counter');
  E.acceptPriceCounterCustomer(booked,first.id);
  const bookedOn=booked.day;
  const appointment=E.bookCustomer(booked,first.id);
  if(!appointment.ok||c.appointmentDay!==bookedOn+1||c.status!=='booked')
    throw Error('New UK2026 viewing did not book 24h / next game day');
  normalized(booked,'24h booking');
  const old=clone(priceCounterCase);
  const oldC=C.caseFor(old,old.vehicles[0].id);
  for(const key of ['quotedPrice','quoteStatus','quoteRounds','remote','remoteInspected','remoteAttempted'])
    delete oldC[key];
  if(!E.normalize(clone(old)))throw Error('Existing v18 customer careers cannot restore without new optional fields');
  // Capture the first booked and price counter as real production save snapshots.
  return {firstPriceCounter:priceCounterCase,remoteSuccess,booked,
    total:conversations.length+remoteRejected,remoteRejected,remoteCancelled,
    remoteInspected,examples:conversations.slice(0,8)};
});
console.log('BETA_CUSTOMER_PATHS '+JSON.stringify({
  total:data.total,remoteRejected:data.remoteRejected,
  remoteCancelled:data.remoteCancelled,remoteInspected:data.remoteInspected,
  examples:data.examples
}));
assert.ok(data.remoteCancelled>=1&&data.remoteInspected>=1);
assert.ok(data.remoteRejected>=1);

// Test the actual smartphone controls and persistent save with a real lead.
await page.evaluate(s=>localStorage.setItem('the-motor-trade-career-beta-v1',JSON.stringify(s)),
  data.firstPriceCounter);
await page.reload({waitUntil:'domcontentloaded'});
await page.locator('#menu-continue').click();
await page.locator('.career-nav [data-page="sales"]').click();
let s=JSON.parse(await page.evaluate(()=>localStorage.getItem('the-motor-trade-career-beta-v1')));
const id=s.vehicles[0].id;
const asking=s.vehicles[0].asking;
const price=page.locator('#prequote-'+id);
assert.ok(await price.isVisible(),'The dealer must be able to enter a customer price before any viewing');
await price.fill(String(asking));
await page.locator('[data-action="quote-customer"][data-id="'+id+'"]').click();
assert.match(await page.locator('[data-panel="sales"]').innerText(),/BUYER COUNTER/);
await page.locator('[data-action="accept-buyer-counter"][data-id="'+id+'"]').click();
assert.match(await page.locator('[data-panel="sales"]').innerText(),/PROVISIONAL PRICE AGREED/);
await page.locator('[data-action="book-customer"][data-id="'+id+'"]').click();
s=JSON.parse(await page.evaluate(()=>localStorage.getItem('the-motor-trade-career-beta-v1')));
assert.equal(s.customerCases[String(id)].appointmentDay,s.day+1,'Real UI must book tomorrow only');
assert.equal(s.customerCases[String(id)].held,0,'Viewing alone never takes a deposit');
assert.match(await page.locator('[data-panel="sales"]').innerText(),/NEXT-DAY VIEWING \(24 HOURS\)/);
await page.reload({waitUntil:'domcontentloaded'});
await page.locator('#menu-continue').click();
const saved=JSON.parse(await page.evaluate(()=>localStorage.getItem('the-motor-trade-career-beta-v1')));
assert.equal(saved.customerCases[String(id)].appointmentDay,s.day+1);
assert.equal(saved.cash,s.cash);

// Exercise real remote deposit button from a verified willing buyer.
await page.evaluate(s=>localStorage.setItem('the-motor-trade-career-beta-v1',JSON.stringify(s)),
  data.remoteSuccess.before);
await page.reload({waitUntil:'domcontentloaded'});
await page.locator('#menu-continue').click();
await page.locator('.career-nav [data-page="sales"]').click();
const remoteId=data.remoteSuccess.carId;
assert.ok(await page.locator('[data-action="remote-reserve-customer"][data-id="'+remoteId+'"]').isVisible());
await page.locator('[data-action="remote-reserve-customer"][data-id="'+remoteId+'"]').click();
const remote=JSON.parse(await page.evaluate(()=>localStorage.getItem('the-motor-trade-career-beta-v1')));
assert.equal(remote.customerCases[String(remoteId)].status,'reserved');
assert.equal(remote.customerCases[String(remoteId)].held,250);
assert.equal(remote.sold.length,0);
assert.match(await page.locator('[data-panel="sales"]').innerText(),/BALANCE DUE AT COLLECTION/);
assert.match(await page.locator('[data-panel="sales"]').innerText(),/full £250/);
assert.deepEqual(errors,[],'No browser JS errors in dealer-to-customer price quoting and remote deposit');
console.log('BETA_CUSTOMER_PATHS_PASS '+JSON.stringify({
  sampled:data.total,remoteCancelled:data.remoteCancelled,
  remoteInspected:data.remoteInspected,quotedUI:true,booked24h:true,
  remoteDepositUI:true,savedCareerRestored:true}));
await context.close();await browser.close();
