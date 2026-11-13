import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Production beta load order. These tests use actual gameplay modules rather
// than a mocked copy of the economics or a separate toy service calculator.
const w={};
const ctx=vm.createContext({window:w});
for(const name of [
  'repair-prices','vat','employment-2026','vehicle-intel','vehicle-photos',
  'uk-vehicle-catalogue','uk-original-verification','market-evidence-2026',
  'vehicle-accuracy','vehicle-market','auction-fees','auction-transport',
  'premises','people','monthly','events','workshop','customer-services',
  'retail-liquidity','customers','aftersales','commercial-controls','trading'
]){
  new vm.Script(readFileSync(new URL('../beta/'+name+'.js',import.meta.url),'utf8'),
    {filename:name+'.js'}).runInContext(ctx);
}
const E=w.MotorTradeEngine,W=E.workshop,S=E.services,M=E.monthly,V=E.vat;

test('uk2026 customer service desk and auction reminder survive a real career save',()=>{
  const s=E.create('First Month QA',[],'uk2026');
  assert.equal(s.cash,50000);
  assert.equal(s.capacity,4);
  assert.equal(s.auctionReminderDismissedDay,0);
  assert.equal(s.serviceDesk.nextId,1);
  assert.ok(E.auctionDay(s.day));
  assert.ok(S.valid(s));
  s.auctionReminderDismissedDay=s.day;
  const copy=E.normalize(JSON.parse(JSON.stringify(s)));
  assert.ok(copy,'Normalising a just-created 2026 career must not delete the save');
  assert.equal(copy.auctionReminderDismissedDay,1);
  assert.deepEqual(copy.serviceDesk.jobs,[]);
  assert.equal(E.create('Classic QA',[],'classic').serviceDesk,undefined,
    'Classic career does not inherit 2026 service cashflow or customer system');
});

test('free visual review does not invent internal diagnostic charges or expose hidden defects',()=>{
  const s=E.create('Free Visual QA',[],'uk2026');
  const originalCash=s.cash;
  const fake={id:9001,title:'2018 Ford Fiesta Zetec',source:'seller',
    status:'acquired',cost:3000,prepBudget:500,prepSpent:0,
    origin:'seller-mock-1',storageLocation:'forecourt',
    profile:{grade:3,hiddenFault:{item:'Test undisclosed fault',cost:350}}};
  fake.workshop=W.initial(fake);s.vehicles.push(fake);
  const prior=s.ledger.length;
  const result=W.assess(s,fake.id);
  assert.equal(result.ok,true);
  assert.equal(s.cash,originalCash);
  assert.equal(s.ledger.length,prior);
  assert.equal(fake.cost,3000);
  assert.equal(fake.workshop.assessmentFee,0);
  assert.equal(fake.workshop.visualAssessment,true);
  assert.equal(fake.workshop.stage,'quoted');
  assert.equal(W.valid(fake,s.day),true);
  assert.ok(!result.message.includes('Test undisclosed fault'),
    'A free visual review cannot expose hidden faults');
});

test('four concurrent external repair contracts work, each paid and independently timed',()=>{
  const s=E.create('Unlimited Garage QA',[],'uk2026');
  const before=s.cash;
  for(let i=0;i<4;i++){
    const vehicle={id:101+i,title:'Service Prep '+i,source:'seller',
      status:'acquired',cost:1700,prepBudget:450,prepSpent:0,
      origin:'UK-external-'+i,storageLocation:'forecourt',
      profile:{grade:2,hiddenFault:null}};
    vehicle.workshop=W.initial(vehicle);
    s.vehicles.push(vehicle);
  }
  let supplierTotal=0;
  for(const v of s.vehicles){
    assert.equal(W.assess(s,v.id).ok,true);
    const quote=W.quote(s,v,'external');
    assert.ok(quote&&quote.cost>0);
    supplierTotal+=quote.cost;
    assert.equal(W.start(s,v.id,'external').ok,true);
    assert.equal(v.storageLocation,'external');
    assert.equal(W.valid(v,s.day),true);
  }
  assert.equal(s.cash,before-supplierTotal);
  assert.equal(s.vehicles.filter(v=>v.workshop.method==='external'&&
    v.workshop.stage==='in-progress').length,4);
  assert.equal(E.forecourtCount(s),0);
});

test('four displayed cars do not consume all owned stock storage or unblock a free fifth display',()=>{
  const s=E.create('Storage QA',[],'uk2026');
  const make=(id,loc)=>({id,storageLocation:loc,title:'Stock '+id,cost:1000});
  s.vehicles.push(make(1,'forecourt'),make(2,'forecourt'),make(3,'forecourt'),
    make(4,'forecourt'),make(5,'offsite'));
  assert.equal(E.forecourtCount(s),4);
  assert.equal(E.moveStockToForecourt(s,5).code,'capacity');
  s.vehicles[0].storageLocation='external';
  assert.equal(E.forecourtCount(s),3);
  const cashBefore=s.cash;
  const moved=E.moveStockToForecourt(s,5);
  assert.equal(moved.ok,true);
  assert.equal(E.forecourtCount(s),4);
  assert.equal(s.cash,cashBefore-35);
  assert.equal(s.vehicles.at(-1).cost,1035);
  assert.equal(s.ledger.at(-1).delta,-35);
});

test('customer services operate with a fully occupied display and preserve real cash/booking rules',()=>{
  const s=E.create('Customer Desk QA',[],'uk2026');
  for(let i=0;i<4;i++)s.vehicles.push({id:i+1,storageLocation:'forecourt'});
  const leads=S.leads(s);
  assert.ok(leads.length>=1);
  const first=leads[0];
  const result=S.book(s,first.id);
  assert.equal(result.ok,true);
  const booked=s.serviceDesk.jobs[0];
  assert.equal(booked.status,'booked');
  assert.equal(s.cash,50000-first.supplier);
  assert.equal(S.leads(s).some(x=>x.id===first.id),false);
  assert.equal(V.serviceOutputPence(s),0,'Service booking is not already a taxable completed supply');
  assert.equal(S.valid(s),true);
  for(let day=2;day<=booked.readyDay;day++){s.day=day;S.advance(s)}
  assert.ok(['completed','failed'].includes(booked.status));
  assert.equal(S.valid(s),true);
  const monthly=M.statement(s);
  assert.equal(monthly.serviceTurnover,booked.status==='completed'?booked.gross:0);
  assert.equal(monthly.combinedRevenue,monthly.turnover+monthly.serviceTurnover);
  assert.equal(monthly.serviceUnits,booked.status==='completed'?1:0);
  assert.equal(V.serviceOutputPence(s),booked.taxOutputPence);
  assert.ok(booked.rating>=1&&booked.rating<=5);
  assert.ok(monthly.targetUnits>=1&&monthly.targetTurnover>0);
  assert.equal(monthly.targetMet,false,'Services alone do not count as vehicle unit sales');
});

test('reputation scales monthly turnover targets while UK2026 requires sales, revenue and positive cash contribution',()=>{
  const start=M.targetFor2026(5,4,30),wellKnown=M.targetFor2026(85,4,30);
  assert.ok(start.turnoverTarget>0);
  assert.ok(wellKnown.turnoverTarget>start.turnoverTarget);
  assert.ok(wellKnown.unitTarget>=start.unitTarget);
  const view=readFileSync(new URL('../beta/monthly-view.js',import.meta.url),'utf8');
  assert.match(view,/MANDATORY dealership revenue target/);
  assert.match(view,/CUSTOMER SERVICES & REFERRALS/);
  assert.match(view,/positive operating contribution/);
});

test('auction flash can decline each game-day lot with normal sold/lost/pass outcomes and no buyer fee',()=>{
  const s=E.create('Weekly Auction QA',[],'uk2026');
  assert.equal(s.auctionHall.phase,'catalogue');
  assert.ok(E.marketFor(s).auctions.length>=1);
  let count=0;
  while(s.auctionHall.phase==='catalogue'&&count<64){
    assert.equal(E.passAuction(s).ok,true);
    assert.equal(E.nextAuctionLot(s).ok,true);
    count++;
  }
  assert.ok(count>=30&&count<=36,'UK weekly sale must include 30+ lots');
  assert.equal(s.auctionHall.phase,'finished');
  assert.equal(s.cash,50000);
  assert.ok(s.auctionHistory.every(x=>x.kind!=='won'));
  const ui=readFileSync(new URL('../beta/simulator.js',import.meta.url),'utf8');
  assert.match(ui,/enter-weekly-auction/);
  assert.match(ui,/skip-weekly-auction/);
  assert.match(ui,/auctionReminderDismissedDay/);
  const html=readFileSync(new URL('../beta/index.html',import.meta.url),'utf8');
  assert.ok(html.includes('WEEKLY MOTOR AUCTION IS ON TODAY'));
  assert.ok(html.includes('data-page="services"'));
  assert.ok(html.indexOf('customer-services.js')<html.indexOf('trading.js'));
});

test('taxable service income is not vehicle-margin VAT and MOT/ATF are referrals only',()=>{
  const kinds=S.PRODUCTS;
  assert.equal(kinds.mot.payer,'approved-mot-centre');
  assert.equal(kinds.scrap.payer,'authorised-treatment-facility');
  assert.equal(kinds.mot.supplier,0);
  assert.equal(kinds.scrap.supplier,0);
  assert.equal(kinds.mot.gross,15);
  assert.equal(kinds.scrap.gross,35);
  assert.equal(kinds.service.supplier,150);
  assert.equal(kinds.repair.supplier,275);
  assert.match(kinds.mot.description,/approved third-party/i);
  assert.match(kinds.scrap.description,/licensed ATF/i);
});

test('fully funded 2026 dealer can hire multiple sales employees without arbitrary role limits',()=>{
  const state=E.create('Expanded Team QA',[],'uk2026');
  assert.equal(E.people.roleLimit(state,'sales'),Infinity);
  assert.equal(E.people.roleLimit(state,'technician'),Infinity);
  const candidates=E.people.applicants(state.day,state).filter(c=>c.role==='sales');
  assert.ok(candidates.length>=3);
  for(const c of candidates.slice(0,3)){
    const q=E.people.hireQuote(state,c);
    assert.equal(q.shortfall,0);
    assert.equal(E.hireStaff(state,c.id).ok,true);
  }
  assert.equal(state.staff.filter(x=>x.role==='sales').length,3);
  assert.equal(E.people.valid(state,state.day),true);
  assert.ok(state.cash<50000,'Real recruitment fees must be paid');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))),
    'Three sales staff must not invalidate a saved career');
});

test('private seller lead can be declined without making an offer or paying cash',()=>{
  const state=E.create('Declined Lead QA',[],'uk2026');
  const lead=E.marketFor(state).sellers[0];
  assert.ok(lead);
  assert.equal(E.walkSeller(state,lead.id).ok,true);
  assert.equal(state.cash,50000);
  assert.equal(state.ledger.length,0);
  assert.equal(state.negotiations[lead.id].status,'walked');
  assert.equal(E.acquireSeller(state,lead.id,lead.ask).ok,false);
  const view=readFileSync(new URL('../beta/buying-desk-view.js',import.meta.url),'utf8');
  assert.match(view,/DECLINE THIS CAR · NO COST/);
});

test('offsite prepared vehicle can advertise online and incurs paid 48-hour customer presentation',()=>{
  const state=E.create('Remote Stock QA',[],'uk2026');
  const v={id:111,title:'2018 Toyota Aygo x-play',source:'seller',
    status:'prepared',cost:2000,prepBudget:450,prepSpent:450,
    retail:4800,asking:null,acquiredDay:1,origin:'S-1-1',
    miles:19000,fuel:'Petrol',gearbox:'Manual',
    storageLocation:'offsite',profile:{grade:2,likelySale:4800}};
  v.workshop=W.initial(v);state.vehicles.push(v);
  assert.equal(E.advertise(state,v.id,4750).ok,true);
  assert.equal(v.status,'listed');assert.equal(v.storageLocation,'offsite');
  const opened=E.openCustomer(state,v.id);
  assert.equal(opened.ok,true);
  const originalCash=state.cash;
  const appointment=E.bookCustomer(state,v.id);
  assert.equal(appointment.ok,true,appointment.message);
  const c=E.customers.caseFor(state,v.id);
  assert.equal(c.appointmentDay,3);
  assert.equal(state.cash,originalCash-35);
  assert.equal(v.viewingArriveDay,3);
  assert.equal(v.storageLocation,'offsite');
  state.day=3;
  E.advanceCustomers(state);
  assert.ok(['viewing','offsite'].includes(v.storageLocation));
  assert.equal(v.viewingArriveDay,undefined);
});

test('reputation influences prestige stock weighting without counterfeiting Tesla valuations',()=>{
  const Mkt=w.MotorTradeMarket;
  const score=rep=>{
    let prestige=0;
    for(let d=1;d<=100;d++)for(let i=0;i<7;i++){
      const v=Mkt.pick('auction','luxury',d,i,new Set(),'uk2026',rep);
      if(['premium','luxury'].includes(v.marketTier))prestige++;
    }
    return prestige;
  };
  assert.ok(score(85)>score(5),'Strong reputation should make premium/luxury auction sourcing more frequent');
  assert.ok(Mkt.CATALOGUE.luxury.some(v=>v.title.includes('Tesla')),
    'Tesla candidates must come from genuine catalogue templates, not invented pricing');
});

test('funded board meeting has a real expense and one additional customer service lead',()=>{
  const state=E.create('Management QA',[],'uk2026');
  const before=S.leads(state).length;
  const result=E.events.holdMeeting(state,'aftermarket');
  assert.equal(result.ok,true);
  assert.equal(state.cash,49800);
  assert.equal(state.meetings.at(-1).budget,200);
  assert.equal(S.leads(state).length,before+1);
  assert.equal(M.statement(state).managementSpend,200);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('debt recovery has timed warnings, controls cash borrowing and never treats bridge as sales',()=>{
  const s=E.create('Recovery QA',[],'uk2026');
  s.premises.arrears=700;
  for(let day=2;day<=14;day++){s.day=day;E.advanceFinance(s)}
  assert.equal(s.debtSinceDay,2);
  assert.equal(E.commercialControls.status(s).debtDays,13);
  assert.equal(E.commercialControls.status(s).softArrears,true);
  s.day=16;E.advanceFinance(s);
  assert.equal(E.commercialControls.status(s).creditorHold,true);
  s.day=35;E.advanceFinance(s);
  assert.equal(E.commercialControls.status(s).recoveryRequired,true);
  const collateral={id:303,cost:16000,retail:23000,profile:{trade:16000}};
  s.vehicles.push(collateral);
  const quote=E.financeQuote(s,5000);
  assert.equal(quote.ok,true,quote.message);
  const cash=s.cash;
  assert.equal(E.borrowFinance(s,5000).ok,true);
  assert.equal(s.cash,cash+4850);
  assert.equal(E.financeQuote(s,5000).ok,false,'Only one active facility');
  assert.equal(M.statement(s).turnover,0,'Lending cash must NOT be sales revenue');
  assert.equal(M.statement(s).financingExpense,150,'Arrangement fee is financing cost');
  s.day=36;E.advanceFinance(s);
  assert.ok(s.financeBridge.interestAccrued>0);
  assert.equal(E.commercialControls.status(s).bridgeOutstanding,
    5000+s.financeBridge.interestAccrued);
  s.premises.arrears=0;
  assert.equal(E.repayFinance(s).ok,true);
  assert.equal(s.financeBridge.principalOutstanding,0);
  assert.equal(s.financeBridge.closedDay,36);
  assert.equal(E.financeQuote(s,5000).ok,false,'180-day repeat cooldown blocks loan cycling');
});

test('month-end reports immediately open archived detail and debt financing appears separately',()=>{
  const sim=readFileSync(new URL('../beta/simulator.js',import.meta.url),'utf8');
  const view=readFileSync(new URL('../beta/monthly-view.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../beta/index.html',import.meta.url),'utf8');
  assert.match(sim,/currentPage='reports'; \/\/ Mandatory financial review/);
  assert.match(view,/isClosed\?' open':'/);
  assert.match(view,/AFTER FINANCING/);
  assert.match(html,/id="dashboard-monthly-highlight"/);
  assert.match(html,/>INBOX<em>\.<\/em>/);
});
