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
  while(s.auctionHall.phase==='catalogue'&&count<12){
    assert.equal(E.passAuction(s).ok,true);
    assert.equal(E.nextAuctionLot(s).ok,true);
    count++;
  }
  assert.ok(count>=1);
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
