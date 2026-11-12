'use strict';
/*
 * Beta Phase 8E: real production 30-day sales-desk activity comparisons.
 * No synthetic lead or purchase injection and no instant sales. A paid
 * employee should handle contacts and book some real test-drive viewings,
 * but still incur payroll and never manufacture vehicle sales or money.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(origin+'/beta/',{waitUntil:'domcontentloaded'});
await page.locator('#menu-new-career').waitFor();

const result=await page.evaluate(()=>{
  const E=window.MotorTradeEngine,D=E.events,P=E.people,
    C=E.customers,IN=window.MotorTradeInbox;
  const names=['Active Sales North','Active Sales West','Active Sales Central',
    'Active Sales East','Active Sales South'];
  function day(s){
    if(D.meetingDue(s))D.holdMeeting(s,'sales');
    const closing=s.day===s.monthPlan.endDay;
    if(closing)E.monthly.close(s);
    s.day++;
    E.rollAuctionHall(s);s.deadlineSession=0;
    if(closing)E.monthly.next(s);
    E.staffDay(s);E.premisesDay(s);E.aftersalesDay(s);E.vatDay(s);
    E.advanceWorkshop(s);
    E.advanceCustomers(s);
    IN.sync(s,E);
  }
  function prepare(s){
    for(const v of s.vehicles){
      if(v.status==='acquired'&&v.workshop.stage==='unassessed')E.assessStock(s,v.id);
      if(v.status==='acquired'&&v.workshop.stage==='quoted')E.startPrep(s,v.id,'external');
      if(v.status==='acquired'&&v.workshop.stage==='quality-check')E.finishPrep(s,v.id);
      if(v.status==='prepared'){
        const asking=Math.max(500,Math.round(Math.min(v.retail,v.profile.likelySale)*1.08/50)*50);
        const r=E.advertise(s,v.id,asking);
        if(!r.ok)throw Error('Unable to advertise real stock '+v.id+': '+r.message);
      }
    }
  }
  function openForecourt(name){
    const s=E.create(name,[],'uk2026');
    if(C.queueEnquiries(s).length)throw Error('No invented leads without adverts');
    for(let i=0;i<25&&s.vehicles.length<3;i++){
      const sellers=E.marketFor(s).sellers.slice().sort((a,b)=>a.ask-b.ask);
      for(const car of sellers){
        if(s.vehicles.length>=3)break;
        if(car.ask<=12000)E.acquireSeller(s,car.id,car.ask);
      }
      prepare(s);
      if(s.vehicles.length<3)day(s);
    }
    if(s.vehicles.length!==3)throw Error('Could not source 3 real cars for '+name);
    for(let i=0;i<25&&s.vehicles.some(v=>v.status!=='listed');i++){
      prepare(s);
      if(s.vehicles.some(v=>v.status!=='listed'))day(s);
    }
    if(s.vehicles.some(v=>v.status!=='listed'))throw Error('Not all real stock advertised for '+name);
    return s;
  }
  const runs=names.map(name=>{
    const starting=openForecourt(name);
    const owner=E.normalize(JSON.parse(JSON.stringify(starting)));
    const staffed=E.normalize(JSON.parse(JSON.stringify(starting)));
    if(!owner||!staffed)throw Error('Cannot clone validated career');
    const candidate=P.applicants(staffed.day,staffed).filter(x=>x.role==='sales')
      .sort((a,b)=>b.skills.sales-a.skills.sales)[0];
    if(!candidate)throw Error('No eligible sales applicant');
    const hire=E.hireStaff(staffed,candidate.id);
    if(!hire.ok)throw Error('Could not hire a paid sales executive: '+hire.message);
    function exercise(s){
      const initialCash=s.cash,initialSold=s.sold.length,startDay=s.day;
      const activityDays=new Set(),enquiryDays=new Set(),followupDays=new Set();
      const beforeHistory=s.customerHistory.length;
      for(let i=0;i<30;i++){
        day(s);
        for(const h of s.customerHistory.slice(beforeHistory)){
          if(h.day<startDay+1)continue;
          if(['enquiry','sales-follow-up','appointment','arrived','no-show'].includes(h.type))
            activityDays.add(h.day);
          if(h.type==='enquiry')enquiryDays.add(h.day);
          if(h.type==='sales-follow-up')followupDays.add(h.day);
        }
      }
      const log=s.customerHistory.slice(beforeHistory);
      const followups=log.filter(x=>x.type==='sales-follow-up');
      if(new Set(followups.map(x=>x.leadId)).size!==followups.length)
        throw Error('Employee called the same buyer twice for one daily follow-up');
      const salaryAccrualDays=s.ledger.filter(r=>r.day>startDay&&
        r.note.startsWith('Staff salary expense accrued:')).length;
      const counts=type=>log.filter(x=>x.type===type).length;
      const allBalances=(s.financialScenario==='uk2026'?50000:12500)+
        s.ledger.reduce((sum,r)=>sum+r.delta,0);
      if(allBalances!==s.cash)throw Error('Cash is not backed by real ledger');
      if(!E.normalize(JSON.parse(JSON.stringify(s))))throw Error('Failed to restore a real sales staff career');
      if(s.sold.length!==initialSold)throw Error('Unmanaged customer cases generated a free vehicle sale');
      return {startDay,cashBefore:initialCash,cashAfter:s.cash,
        activityDays:activityDays.size,enquiryDays:enquiryDays.size,
        followupDays:followupDays.size,enquiries:counts('enquiry'),
        callbacks:counts('sales-follow-up'),booked:counts('appointment'),
        viewings:counts('arrived'),noShows:counts('no-show'),
        profit:0,staffCount:s.staff.length,salaryAccrualDays,
        payrollLiabilities:E.employment.liabilities(s).total,
        rep:s.staff.find(x=>x.role==='sales')?
          {name:s.staff[0].name,contacts:s.staff[0].workDone,deals:s.staff[0].deals,
            salary:s.staff[0].monthlySalary}:null};
    }
    const solo=exercise(owner),team=exercise(staffed);
    return {name,solo,team,staffedState:staffed};
  });
  return runs;
});
const summary=result.map(({staffedState,...rest})=>rest);
console.log('BETA_SALES_TEAM_30DAY '+JSON.stringify(summary));
assert.equal(summary.length,5);
assert.ok(summary.every(x=>x.solo.staffCount===0&&x.team.staffCount===1));
assert.ok(summary.every(x=>x.solo.callbacks===0));
assert.ok(summary.every(x=>x.team.callbacks>=1),
  'A paid sales executive should contact real prospects instead of sitting idle');
assert.ok(summary.every(x=>x.team.salaryAccrualDays>=20&&x.solo.salaryAccrualDays===0),
  'Employment must accrue real wages during the month even without a retail sale');
assert.ok(summary.every(x=>x.team.rep.contacts>=x.team.callbacks),
  'Staff register must credit genuine callbacks and inbound enquiries');
assert.ok(summary.every(x=>x.team.booked>=1),
  'A salesperson should arrange at least one actual appointment in each seeded active three-car forecourt');
assert.ok(summary.every(x=>x.team.cashAfter<x.solo.cashAfter),
  'Salespeople should incur real payroll, not create free marketing or revenues');
assert.ok(summary.every(x=>x.team.rep.deals===0),
  'Automated lead handling must not produce unearned sales');
const meanTeam=summary.reduce((n,x)=>n+x.team.activityDays,0)/summary.length;
const meanSolo=summary.reduce((n,x)=>n+x.solo.activityDays,0)/summary.length;
const totalTeamBookings=summary.reduce((n,x)=>n+x.team.booked,0);
assert.ok(meanTeam>=14,
  'With three advertised cars and a salesperson, customer activity should average roughly every other day');
assert.ok(meanTeam>meanSolo,
  'Sales executives must create noticeably more real interactions than owner-only stock');
assert.ok(totalTeamBookings<=60,
  'The staff process must not turn every price enquiry into a guaranteed appointment');

// Restore a genuine staffed 30-day career through normal browser storage.
const example=result[0].staffedState;
await page.evaluate(s=>localStorage.setItem('the-motor-trade-career-beta-v1',JSON.stringify(s)),example);
await page.reload({waitUntil:'domcontentloaded'});
await page.locator('#menu-continue').click();
await page.locator('.career-nav [data-page="sales"]').click();
const sales=await page.locator('[data-panel="sales"]').innerText();
assert.match(sales,/SALES TEAM CALLBACKS/);
assert.match(sales,/Salaried sales staff can generate additional contacts/);
await page.locator('.career-nav [data-page="staff"]').click();
const people=await page.locator('[data-panel="staff"]').innerText();
assert.match(people,/CUSTOMER CONTACTS/);
assert.deepEqual(errors,[]);
console.log('BETA_SALES_TEAM_PASS '+JSON.stringify({
  meanInteractionDaysStaffed:meanTeam,meanInteractionDaysOwner:meanSolo,
  totalViewingsBooked:totalTeamBookings,scenarios:summary.length}));
await context.close();await browser.close();
