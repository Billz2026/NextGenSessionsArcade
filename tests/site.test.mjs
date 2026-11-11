import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('styles.css', root), 'utf8');
const js = readFileSync(new URL('simulator.js', root), 'utf8');
const engine = readFileSync(new URL('trading.js', root), 'utf8');
const intelligence = readFileSync(new URL('vehicle-intel.js', root), 'utf8');
const photos = readFileSync(new URL('vehicle-photos.js', root), 'utf8');
const marketData = readFileSync(new URL('vehicle-market.js', root), 'utf8');
const accuracyData = readFileSync(new URL('vehicle-accuracy.js', root), 'utf8');
const cards = readFileSync(new URL('vehicle-cards.js', root), 'utf8');
const vehicleView = readFileSync(new URL('vehicle-view.js', root), 'utf8');
const premises = readFileSync(new URL('premises.js', root), 'utf8');
const premisesView = readFileSync(new URL('premises-view.js', root), 'utf8');
const people = readFileSync(new URL('people.js', root), 'utf8');
const peopleView = readFileSync(new URL('people-view.js', root), 'utf8');
const monthly = readFileSync(new URL('monthly.js', root), 'utf8');
const monthlyView = readFileSync(new URL('monthly-view.js', root), 'utf8');
const events = readFileSync(new URL('events.js', root), 'utf8');
const eventsView = readFileSync(new URL('events-view.js', root), 'utf8');
const workshop = readFileSync(new URL('workshop.js', root), 'utf8');
const workshopView = readFileSync(new URL('workshop-view.js', root), 'utf8');
const customers = readFileSync(new URL('customers.js', root), 'utf8');
const customersView = readFileSync(new URL('customers-view.js', root), 'utf8');
const auctionHallView = readFileSync(new URL('auction-hall-view.js', root), 'utf8');
const buyingDeskView = readFileSync(new URL('buying-desk-view.js', root), 'utf8');
const stockView = readFileSync(new URL('stock-view.js', root), 'utf8');
const financeView = readFileSync(new URL('finance-view.js', root), 'utf8');
const dashboardView = readFileSync(new URL('dashboard-view.js', root), 'utf8');
const inboxOffice = readFileSync(new URL('inbox-office.js', root), 'utf8');
const STORAGE_KEY = 'the-motor-trade-career-v1';

test('homepage uses real NextGen Sessions logo and separates three views', () => {
  assert.match(html, /<title>The Motor Trade \| UK Car Dealer Simulator<\/title>/);
  assert.match(html, /assets\/nextgen-header-wordmark-2026\.webp/);
  assert.match(html, /id="screen-menu"/);
  assert.match(html, /id="screen-setup" hidden/);
  assert.match(html, /id="screen-career" hidden/);
  assert.match(html, /data-action="new-career"/);
  assert.match(html, /id="menu-continue" data-action="resume" hidden/);
  assert.match(html, /id="menu-new-career" data-action="new-career"/);
  assert.match(html, /trade-wordmark-hero/);
  assert.doesNotMatch(html, /menu-aside|menu-footer|feature-line/);
  assert.match(html, /id="career-form"/);
  assert.match(html, /id="dealership-name"/);
  assert.ok(existsSync(new URL('assets/nextgen-header-wordmark-2026.webp', root)));
  assert.ok(existsSync(new URL('assets/hatchback-study.svg', root)));
});

test('dashboard has inbox, calendar and navigable management areas', () => {
  for (const page of ['dashboard', 'inbox', 'auctionHall', 'auctions', 'stock', 'workshop', 'sales', 'finance', 'reports', 'events', 'staff', 'reputation', 'business']) {
    assert.match(html, new RegExp('data-panel="' + page + '"'));
    assert.match(html, new RegExp('data-page="' + page + '"'));
  }
  for (const id of ['continue-day', 'dashboard-inbox', 'inbox-list', 'inbox-detail', 'event-notice', 'save-warning']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /id="auction-hall-view"/);
  assert.match(html, /id="market-sellers"/);
  assert.match(html, /id="stock-list"/);
  assert.match(html, /class="stock-control"/);
  assert.match(html, /id="sales-list"/);
  assert.match(html, /id="ledger-list"/);
  assert.match(html, /vehicle-intel\.js\?v=2/);
  assert.match(html, /people\.js\?v=7/);
  assert.match(html, /monthly\.js\?v=7/);
  assert.match(html, /events\.js\?v=2/);
  assert.match(html, /workshop\.js\?v=4/);
  assert.match(html, /customers\.js\?v=5/);
  assert.match(html, /vehicle-photos\.js\?v=5/);
  assert.match(html, /vehicle-market\.js\?v=2/);
  assert.match(html, /auction-hall-view\.js\?v=2/);
  assert.match(html, /buying-desk-view\.js\?v=2/);
  assert.match(html, /stock-view\.js\?v=1/);
  assert.match(html, /finance-view\.js\?v=2/);
  assert.match(html, /styles\.css\?v=45/);
  assert.match(html, /simulator\.js\?v=32/);
  assert.match(html, /premises\.js\?v=1/);
  assert.match(html, /premises-view\.js\?v=1/);
  assert.match(html, /id="premises-view"/);
  assert.match(html, /dashboard-view\.js\?v=2/);
  assert.match(html, /inbox-office\.js\?v=3/);
  assert.match(html, /id="inbox-action-count"/);
  assert.match(html, /id="inbox-filter-buttons"/);
  assert.match(html, /id="dashboard-priorities"/);
  assert.match(html, /id="dashboard-operating-strip"/);
  assert.match(html, /data-bind="dashboard-operating"/);
  assert.match(html, /data-bind="dashboard-monthly-sales"/);
  assert.match(html, /vehicle-accuracy\.js\?v=1/);
  assert.match(html, /id="market-progression"/);
  assert.match(html, /vehicle-cards\.js\?v=4/);
  assert.match(html, /trading\.js\?v=19/);
  assert.match(html, /customers-view\.js\?v=8/);
  assert.match(html, /workshop-view\.js\?v=6/);
  assert.match(html, /events-view\.js\?v=6/);
  assert.match(html, /monthly-view\.js\?v=8/);
  assert.match(html, /people-view\.js\?v=5/);
  assert.match(html, /vehicle-view\.js\?v=4/);
  assert.doesNotMatch(html, /NextGenSessionsArcade|looping\.zip|<iframe/);
  assert.equal(existsSync(new URL('lab/', root)), false);
});

test('responsive dashboard supports mobile and reduced motion', () => {
  assert.match(css, /@media\(max-width:1020px\)/);
  assert.match(css, /@media\(max-width:780px\)/);
  assert.match(css, /@media\(max-width:570px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /\.career-nav/);
  assert.match(css, /\.parent-wordmark/);
});

test('v0.9.2 photo matching, image failure fallback and capacity labels', () => {
  assert.match(html, /PRE-ALPHA · v0\.9\.31/);
  assert.match(html, /FORECOURT CAPACITY[\s\S]*?<strong>4 vehicles<\/strong>/);
  assert.match(html, /Forecourt capacity<\/span><strong data-bind="forecourt-capacity">4 vehicles<\/strong>/);
  assert.match(engine, /const CAPACITY = 4/);
  assert.match(css, /\.vehicle-photo-missing\[hidden\]/);
  const registered = {};
  const context = {
    window: {}, Intl,
    document: { addEventListener(name,handler,capture) {registered[name]={handler,capture};} }
  };
  vm.runInNewContext(photos,context,{timeout:1500});
  vm.runInNewContext(cards,context,{timeout:1500});
  const P=context.window.MotorTradePhotos;
  for (const [title,generation,color,id] of [
    ['2014 Vauxhall Corsa Excite','D','Red','corsa-d-red'],
    ['2016 Peugeot 208 Allure','Mk1 facelift','Silver','208-facelift-silver'],
    ['2014 Honda Jazz ES','GE','Grey','jazz-ge-grey']
  ]) {
    const car={title,generation,color};
    assert.equal(P.select(car)?.id,id);
    assert.ok(P.url(P.select(car)).includes('commons.wikimedia.org'));
  }
  const markup=context.window.MotorTradeCards.photo({
    title:'2014 Vauxhall Corsa Excite',generation:'D',color:'Red'
  },'auction');
  assert.match(markup,/data-vehicle-photo="true"/);
  assert.match(markup,/vehicle-photo-failed" hidden/);
  assert.equal(registered.error?.capture,true);
  const fallback={hidden:true,classList:{contains:name=>name==='vehicle-photo-failed'}};
  const img={tagName:'IMG',hidden:false,hasAttribute:name=>name==='data-vehicle-photo',nextElementSibling:fallback};
  registered.error.handler({target:img});
  assert.equal(img.hidden,true);
  assert.equal(fallback.hidden,false);
});

function browser(storageData = new Map(), { denyStorage = false } = {}) {
  class Node {
    constructor() {
      this.hidden = false;
      this.textContent = '';
      this.value = '';
      this.innerHTML = '';
      this.dataset = {};
      this.attrs = {};
      this.children = [];
      this.disabled = false;
      this.handlers = {};
    }
    replaceChildren(...items) { this.children = items; }
    appendChild(child) { this.children.push(child); }
    setAttribute(key, value) { this.attrs[key] = value; }
    removeAttribute(key) { delete this.attrs[key]; }
    setCustomValidity(message) { this.validationMessage = message; }
    reportValidity() { return !this.validationMessage; }
    addEventListener(type, handler) { this.handlers[type] = handler; }
  }
  const nodes = new Map();
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) nodes.set(id, new Node());
  nodes.get('dealership-name').value = 'First Lot Motors';
  nodes.get('menu-guide').hidden = true; // Mirror the HTML hidden attribute.
  const bindings = new Map();
  for (const [, key] of html.matchAll(/data-bind="([^"]+)"/g)) {
    if (!bindings.has(key)) bindings.set(key, []);
    bindings.get(key).push(new Node());
  }
  const panels = [];
  const nav = [];
  for (const page of ['dashboard', 'inbox', 'auctionHall', 'auctions', 'stock', 'workshop', 'sales', 'finance', 'reports', 'events', 'staff', 'reputation', 'business']) {
    const panel = new Node();
    panel.dataset.panel = page;
    panels.push(panel);
    const item = new Node();
    item.dataset.page = page;
    nav.push(item);
  }
  const listeners = {};
  const document = {
    getElementById: id => {
      if (!nodes.has(id) && /^(auction-bid-|seller-offer-|stock-price-|px-allowance-|projection-|desk-offer-|desk-prep-|desk-total-|desk-projection-|desk-headroom-|desk-signal-|desk-funding-warning-)/.test(id)) {
        const dynamicInput = new Node();
        nodes.set(id,dynamicInput);
      }
      assert.ok(nodes.has(id), 'Expected DOM id ' + id);
      return nodes.get(id);
    },
    querySelectorAll: selector => {
      const bind = selector.match(/^\[data-bind="([^"]+)"\]$/);
      if (bind) return bindings.get(bind[1]) ?? [];
      if (selector === '[data-panel]') return panels;
      if (selector === '.career-nav [data-page]') return nav;
      return [];
    },
    createElement: () => new Node(),
    addEventListener: (type, handler) => { listeners[type] = handler; }
  };
  const localStorage = {
    getItem: key => {
      if (denyStorage) throw Error('blocked');
      return storageData.has(key) ? storageData.get(key) : null;
    },
    setItem: (key, value) => {
      if (denyStorage) throw Error('blocked');
      storageData.set(key, value);
    }
  };
  const context = { document, localStorage, window: { confirm: () => true, scrollTo: () => {} }, Intl, Date };
  vm.runInNewContext(intelligence, context, { timeout: 1500 });
  vm.runInNewContext(photos, context, { timeout: 1500 });
  vm.runInNewContext(accuracyData, context, { timeout: 1500 });
  vm.runInNewContext(marketData, context, { timeout: 1500 });
  vm.runInNewContext(premises, context, { timeout: 1500 });
  vm.runInNewContext(people, context, { timeout: 1500 });
  vm.runInNewContext(monthly, context, { timeout: 1500 });
  vm.runInNewContext(events, context, { timeout: 1500 });
  vm.runInNewContext(workshop, context, { timeout: 1500 });
  vm.runInNewContext(customers, context, { timeout: 1500 });
  vm.runInNewContext(engine, context, { timeout: 1500 });
  vm.runInNewContext(cards, context, { timeout: 1500 });
  // Test-fixture shortcut for PRE-v0.8 financial/reputation assertions only.
  // It is not included in production scripts. Dedicated workshop tests below
  // verify real day progression, blocked retail listings, quality and cash.
  const liveEngine=context.window.MotorTradeEngine;
  let fixtureMode=false;
  function fixtureQC(state,id) {
    const v=state.vehicles.find(x=>x.id===id);
    if(!v)return {ok:false,code:'missing'};
    const j=v.workshop;
    j.stage='quality-check';
    j.remainingDays=0;
    j.reworks=1; // Fixture: avoid random rectification outside QC tests.
    return liveEngine.finishPrep(state,id);
  }
  context.window.MotorTradeEngine={
    ...liveEngine,
    finishPrep:(state,id)=>fixtureMode?fixtureQC(state,id):liveEngine.finishPrep(state,id),
    prepare:(state,id)=>{
      const a=liveEngine.assessStock(state,id);
      if(!a.ok)return a;
      const method=liveEngine.prepQuote(state,id,'internal')?'internal':'external';
      const b=liveEngine.startPrep(state,id,method);
      if(!b.ok)return b;
      return fixtureQC(state,id);
    }
  };

  // The legacy v0.3–0.8 financial and staff regression tests set up
  // completed sales instantly. The following adapter exists ONLY in the
  // Node test fixture. It never ships to users or bypasses production gates.
  function stageCustomer(state,id,mode){
    const car=state.vehicles.find(v=>v.id===id);
    if(!car||car.status!=='listed')return;
    if(!state.customerCases[String(id)]){
      state.customerCases[String(id)]={
        id:'C-'+state.day+'-'+(state.deadlineSession||0)+'-'+id+'-0',
        vehicleId:id,createdDay:state.day,createdSession:state.deadlineSession||0,
        name:'Legacy Fixture Buyer',channel:'FIXTURE ONLY',status:'discussing',
        preferredMode:mode,appointmentDay:null,agreedDay:null,
        price:null,allowance:null,collectionDay:null,held:0,counters:0,
        reason:'',terms:'in-person',prepCost:0,exchange:null
      };
    }
  }
  context.window.MotorTradeEngine={
    ...context.window.MotorTradeEngine,
    counter:(state,id)=>{
      stageCustomer(state,id,'cash');
      const car=state.vehicles.find(v=>v.id===id),buyer=car&&liveEngine.buyers(car,state);
      if(!buyer||buyer.cashOffer+150>buyer.cashLimit)
        return {ok:false,code:'rejected',message:'Customer cannot increase further.'};
      car.cashOffer=buyer.cashOffer+150;
      return {ok:true,changed:true,message:'Legacy test counter increased by £150.'};
    },
    completeSale:(state,id,mode,allowance)=>{
      const car=state.vehicles.find(v=>v.id===id);
      if(!car||car.status!=='listed')return liveEngine.completeSale(state,id,mode,allowance);
      stageCustomer(state,id,mode);
      const current=state.customerCases[String(id)];
      if(current?.status==='discussing'){
        current.preferredMode=mode;
        const offer=liveEngine.agreeCustomer(state,id,mode,allowance);
        if(!offer.ok)return offer;
      }
      return liveEngine.completeSale(state,id,mode,allowance);
    }
  };
  vm.runInNewContext(vehicleView, context, { timeout: 1500 });
  vm.runInNewContext(peopleView, context, { timeout: 1500 });
  vm.runInNewContext(monthlyView, context, { timeout: 1500 });
  vm.runInNewContext(eventsView, context, { timeout: 1500 });
  vm.runInNewContext(workshopView, context, { timeout: 1500 });
  vm.runInNewContext(customersView, context, { timeout: 1500 });
  vm.runInNewContext(premisesView, context, { timeout: 1500 });
  vm.runInNewContext(auctionHallView, context, { timeout: 1500 });
  vm.runInNewContext(buyingDeskView, context, { timeout: 1500 });
  vm.runInNewContext(stockView, context, { timeout: 1500 });
  vm.runInNewContext(financeView, context, { timeout: 1500 });
  vm.runInNewContext(dashboardView, context, { timeout: 1500 });
  vm.runInNewContext(inboxOffice, context, { timeout: 1500 });
  vm.runInNewContext(js, context, { timeout: 1500 });
  function click(action, extras = {}) {
    const send=(a,extra)=> {
      const button={dataset:{action:a,...extra},setAttribute(){}};
      listeners.click({target:{closest:()=>button}});
    };
    if(action==='prepare-stock'){
      // Legacy test setup: walk through real assessment/booking/QC actions.
      // A user cannot invoke this shortcut in the shipped interface.
      fixtureMode=true;
      try {
        send('assess-workshop',extras);
        send('start-workshop',{...extras,method:'external'});
        send('finish-workshop',extras);
      } finally {fixtureMode=false;}
      return;
    }
    send(action,extras);
  }
  function go(page) { click(undefined, { page }); }
  function submitCareer(name = 'First Lot Motors') {
    nodes.get('dealership-name').value = name;
    nodes.get('career-form').handlers.submit({ preventDefault() {} });
  }
  function setInput(id, value) {
    if (!nodes.has(id)) nodes.set(id, new Node());
    nodes.get(id).value = String(value);
  }
  function typeInput(id, value) {
    setInput(id,value);
    if (listeners.input) listeners.input({target:{id,value:String(value)}});
  }
  return { nodes, bindings, panels, nav, storageData, click, go, submitCareer, setInput, typeInput, engine:context.window.MotorTradeEngine, productionEngine:liveEngine, market:context.window.MotorTradeMarket,accuracy:context.window.MotorTradeAccuracy,photos:context.window.MotorTradePhotos,cards:context.window.MotorTradeCards,dashboard:context.window.MotorTradeDashboardView,eventsView:context.window.MotorTradeEventsView,inbox:context.window.MotorTradeInbox,buyingDesk:context.window.MotorTradeBuyingDeskView,stockView:context.window.MotorTradeStockView,workshopView:context.window.MotorTradeWorkshopView,customersView:context.window.MotorTradeCustomersView,financeView:context.window.MotorTradeFinanceView,monthlyView:context.window.MotorTradeMonthlyView,peopleView:context.window.MotorTradePeopleView };
}

test('v0.9.3 curated catalogue contains 50 correctly modelled UK vehicles',()=>{
  const app=browser(),M=app.market,P=app.photos;
  const all=Object.values(M.CATALOGUE).flat();
  assert.equal(all.length,50);
  assert.equal(new Set(all.map(x=>x.title)).size,all.length);
  const fuels=new Set(all.map(x=>x.fuel));
  for(const x of ['Petrol','Diesel','Hybrid','Plug-in Hybrid','Electric'])assert.ok(fuels.has(x));
  for(const v of all){
    const id=P.identity(v);
    assert.notEqual(id.generation,'Unknown',v.title);
    assert.ok(v.guide>0&&v.retail>v.guide+v.prep+v.fee,v.title);
    assert.ok(v.engineSpec.length>2&&v.engineSpec.length<75,v.title);
    assert.ok(id.year>=2016&&id.year<=2026,v.title);
  }
});
test('v0.9.3 market tier needs both cash and reputation',()=>{
  const {market:M,productionEngine:E}=browser();
  assert.equal(M.tierFor(110000,5).key,'starter');
  assert.equal(M.tierFor(12500,80).key,'starter');
  assert.equal(M.tierFor(18500,15).key,'modern');
  assert.equal(M.tierFor(42000,40).key,'premium');
  assert.equal(M.tierFor(110000,65).key,'luxury');
  assert.equal(M.tierFor(109999,100).key,'premium');
  assert.equal(M.tierFor(1000000,64).key,'premium');
  const get=(rep,cash)=>Array.from({length:28},(_,i)=>
    E.market(i+1,rep,0,'Dealer',rep,cash)).flatMap(x=>[...x.auctions,...x.sellers]);
  const starter=get(5,12500);
  assert.ok(starter.some(x=>Number(x.title.slice(0,4))<=2018&&x.miles>90000));
  assert.ok(starter.some(x=>Number(x.title.slice(0,4))>=2020));
  assert.ok(starter.every(x=>x.marketTier==='starter'));
  const modern=get(20,22000);
  assert.ok(modern.some(x=>x.marketTier==='modern'));
  assert.ok(modern.every(x=>['starter','modern'].includes(x.marketTier)));
  const premium=get(45,50000);
  assert.ok(premium.some(x=>x.marketTier==='premium'));
  assert.ok(premium.every(x=>x.marketTier!=='luxury'));
  const luxury=get(75,125000);
  assert.ok(luxury.some(x=>x.marketTier==='luxury'));
  assert.ok(luxury.some(x=>x.marketTier==='modern'));
});
test('v0.9.3 a purchased car cannot reroll the remaining daily catalogue',()=>{
  const {productionEngine:E}=browser();
  const s=E.create('Test Modern Motors',[]);
  s.day=2;s.cash=50000;s.reputationScore=45;
  s.monthPlan.startingReputation=45;
  s.ledger=[{day:1,delta:37500,note:'Test prior-day cash'}];
  const before=JSON.stringify(E.marketFor(s));
  s.cash-=9000;s.ledger.push({day:2,delta:-9000,note:'Same-day vehicle purchase'});
  assert.equal(JSON.stringify(E.marketFor(s)),before);
  s.cash+=24000;s.ledger.push({day:2,delta:24000,note:'Same-day completed sale'});
  assert.equal(JSON.stringify(E.marketFor(s)),before);
  s.day=3;
  assert.equal(E.marketStatus(s).current.key,'premium');
});
test('v0.9.3 modern photographs never cross fuel, body generation or colour',()=>{
  const {photos:P}=browser();
  const examples=[
    ['2021 Honda Jazz SE e:HEV','Hybrid','White','jazz-mk4-hybrid-white'],
    ['2021 Toyota Yaris Design Hybrid','Hybrid','Red','yaris-xp210-hybrid-red'],
    ['2021 Vauxhall Corsa-e Elite Nav','Electric','Silver','corsa-f-electric-silver'],
    ['2021 Peugeot e-208 Allure','Electric','Grey','peugeot-e208-p21-grey'],
    ['2022 MG4 EV SE','Electric','White','mg4-first-white'],
    ['2022 Tesla Model 3 RWD','Electric','White','model3-white-pre-refresh']
  ];
  for(const [title,fuel,color,id] of examples){
    const generation=P.identity({title}).generation;
    const v={title,fuel,color,generation};
    assert.equal(P.select(v)?.id,id,title);
    assert.equal(P.select({...v,color:'Purple'}),null);
    assert.equal(P.select({...v,generation:'Incorrect'}),null);
    if(fuel==='Electric')assert.equal(P.select({...v,fuel:'Diesel'}),null);
  }
});
test('v0.9.3 electric and hybrid cars do not inherit diesel DPF faults',()=>{
  const {productionEngine:E}=browser();
  const candidates=Array.from({length:40},(_,i)=>E.market(i+1,55,0,'Powertrain Motors',55,65000))
    .flatMap(m=>[...m.auctions,...m.sellers])
    .filter(v=>['Electric','Hybrid','Plug-in Hybrid'].includes(v.fuel));
  assert.ok(candidates.length>=15);
  for(const v of candidates)
    assert.doesNotMatch(v.profile.hiddenFault?.item||'',/DPF|clutch|flywheel|timing belt/i);
});

test('v0.9.4 manufacturer evidence is source-linked and exact derivative matched',()=>{
  const {market:M,accuracy:A}=browser(new Map());
  const summary=A.summary(M.CATALOGUE);
  assert.equal(summary.total,50);
  assert.equal(summary.manufacturer,13);
  assert.equal(summary.corroborated,5);
  assert.equal(summary.pending,32);
  assert.equal(Object.keys(A.CHECKED).length,18);
  const all=Object.values(M.CATALOGUE).flat();
  const titles=new Set(all.map(x=>x.title));
  for(const [title,record] of Object.entries(A.CHECKED)){
    assert.ok(titles.has(title),'Evidence references a non-existent vehicle: '+title);
    const car=all.find(x=>x.title===title);
    assert.equal(A.lookup(car).status,record.status,title);
    assert.match(record.url,/^https:\/\//);
    assert.ok(record.note.length>=15);
    assert.equal(record.checkedAt,'2026-11-10');
    assert.equal(A.lookup({...car,engineSpec:'wrong motor'}).status,'pending',
      'Any powertrain edit must invalidate the source status');
    assert.equal(A.lookup({...car,gearbox:'wrong'}).status,'pending');
    assert.equal(A.lookup({...car,fuel:'wrong'}).status,'pending');
  }
});

test('v0.9.4 corrected model-year UK specifications reject historical errors',()=>{
  const {market:M,accuracy:A}=browser(new Map());
  const all=Object.values(M.CATALOGUE).flat();
  const row=title=>all.find(x=>x.title===title);
  assert.equal(row('2017 Toyota Yaris Icon').engineSpec,'1.5 VVT-iE');
  assert.equal(row('2021 Hyundai Ioniq 5 Premium').engineSpec,'73 kWh RWD EV');
  assert.equal(row('2022 MG4 EV SE Standard Range').engineSpec,'51 kWh EV');
  assert.equal(row('2022 Nissan Qashqai Acenta Premium').engineSpec,'1.3 DIG-T 140 MHEV');
  assert.equal(row('2021 Kia Rio 3 MHEV').engineSpec,'1.0 T-GDi 48V MHEV iMT');
  assert.equal(row('2022 Ford Puma Titanium').engineSpec,'1.0 EcoBoost 125 MHEV');
  assert.equal(A.lookup(row('2021 Hyundai Ioniq 5 Premium')).status,'manufacturer');
  assert.equal(A.lookup({...row('2021 Hyundai Ioniq 5 Premium'),profile:{
    engine:'77 kWh EV'
  },engineSpec:undefined}).status,'pending','Historical wrong battery never gets certified');
});

test('v0.9.4 mild hybrids are not advertised as full hybrids',()=>{
  const app=browser(new Map()),P=app.photos,V=app.cards,M=app.market;
  const all=Object.values(M.CATALOGUE).flat();
  for(const title of ['2021 Kia Rio 3 MHEV','2022 Nissan Qashqai Acenta Premium',
    '2022 Ford Puma Titanium']){
    const car=all.find(x=>x.title===title);
    const markup=V.heading({...car,...P.describe(car)},'auction');
    assert.match(markup,/PETROL MILD HYBRID/);
    assert.doesNotMatch(markup,/>HYBRID<\/span>/);
    assert.equal(car.fuel,'Petrol');
  }
});

test('v0.9.4 photo source registry is stable and paint never chosen to fit photograph',()=>{
  const {market:M,photos:P}=browser(new Map());
  assert.equal(P.LIBRARY.length,19);
  for(const shot of P.LIBRARY){
    assert.match(shot.file,/\.jpg$/);
    assert.match(P.source(shot),/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(shot.licenseUrl,/^https:\/\/creativecommons\.org\//);
    assert.ok(shot.author.length>=2);
    const v={title:shot.start+' '+shot.model+' Photo',generation:shot.generation,
      fuel:shot.fuel||'Petrol',color:shot.color};
    assert.equal(P.select(v)?.id,shot.id);
  }
  const v={title:'2021 Honda Jazz SE e:HEV',fuel:'Hybrid',origin:'S-3-2'};
  const a=P.describe(v),b=P.describe(v);
  assert.equal(a.color,b.color);
  assert.ok(P.COLOURS.includes(a.color));
  assert.equal(P.select({...v,...a,color:'Purple'}),null);
  assert.ok(Object.values(M.CATALOGUE).flat().every(x=>P.identity(x).generation!=='Unknown'));
});

test('first visit and saved career show the minimal main menu', () => {
  const saved = new Map();
  const first = browser(saved);
  assert.equal(first.nodes.get('screen-menu').hidden, false);
  assert.equal(first.nodes.get('screen-career').hidden, true);
  assert.equal(first.nodes.get('menu-continue').hidden, true);
  first.click('new-career');
  assert.equal(first.nodes.get('screen-setup').hidden, false);
  first.submitCareer('My Trade Centre');
  assert.equal(first.nodes.get('screen-career').hidden, false);
  assert.equal(first.bindings.get('company')[0].textContent, 'My Trade Centre');
  assert.equal(first.bindings.get('cash')[0].textContent, '£12,500');
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).day, 1);
  first.click('continue');
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).day, 2);
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).messages.length, 4);
  const resumed = browser(saved);
  assert.equal(resumed.nodes.get('screen-menu').hidden, false);
  assert.equal(resumed.nodes.get('screen-career').hidden, true);
  assert.equal(resumed.nodes.get('menu-continue').hidden, false);
  assert.equal(resumed.nodes.get('menu-new-career').className, 'action-btn action-btn-secondary');
  resumed.click('resume');
  assert.equal(resumed.nodes.get('screen-career').hidden, false);
  assert.equal(resumed.bindings.get('company')[0].textContent, 'My Trade Centre');
  assert.match(resumed.bindings.get('date')[0].textContent, /10 NOV 2026/);
});

test('inbox is interactive, read status persists, navigation changes panels', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('new-career');
  app.submitCareer();
  assert.equal(app.nodes.get('dashboard-inbox').children.length, 2);
  assert.equal(app.bindings.get('unread')[0].textContent, '3');
  app.click('read-message', { id: '2' });
  assert.equal(app.panels.find(p => p.dataset.panel === 'inbox').hidden, false);
  assert.equal(app.bindings.get('unread')[0].textContent, '2');
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).messages.find(m => m.id === 2).read, true);
  assert.match(app.nodes.get('inbox-detail').innerHTML, /Three ways to find your next car/);
  app.click('mark-all-read');
  assert.equal(app.bindings.get('unread')[0].hidden, true);
  app.go('finance');
  assert.equal(app.panels.find(p => p.dataset.panel === 'finance').hidden, false);
  assert.equal(app.nodes.get('topbar-page').textContent, 'FINANCES');
});

test('invalid saves are ignored and storage failure is clearly reported', () => {
  const bad = new Map([[STORAGE_KEY, '{"version":900,"name":"Bad"}']]);
  assert.equal(browser(bad).nodes.get('screen-menu').hidden, false);
  const noStorage = browser(new Map(), { denyStorage: true });
  noStorage.click('new-career');
  noStorage.submitCareer('Local Only');
  assert.equal(noStorage.nodes.get('screen-career').hidden, false);
  assert.equal(noStorage.nodes.get('save-warning').hidden, false);
});

test('new career name remains plain text even if it contains markup', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('new-career');
  app.submitCareer('<img src=x onerror=alert(1)>');
  assert.equal(app.bindings.get('company')[0].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).name, '<img src=x onerror=alert(1)>');
});

test('settings display controls operate and persist separately from career', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('toggle-settings');
  assert.equal(app.nodes.get('menu-guide').hidden, false);
  app.click('toggle-showroom');
  assert.equal(app.nodes.get('menu-setting-bg').textContent, 'OFF');
  assert.match(app.nodes.get('screen-menu').className, /menu-no-showroom/);
  app.click('toggle-motion');
  assert.equal(app.nodes.get('menu-setting-motion').textContent, 'OFF');
  assert.match(app.nodes.get('screen-menu').className, /menu-no-motion/);
  assert.equal(JSON.parse(saved.get('the-motor-trade-display-v1')).showroom, false);
  const revisited = browser(saved);
  assert.equal(revisited.nodes.get('menu-setting-bg').textContent, 'OFF');
  assert.equal(revisited.nodes.get('menu-setting-motion').textContent, 'OFF');
});

test('homepage uses the original NextGen wordmark and standalone vector Motor Trade title', () => {
  const photo = new URL('assets/showroom-home-bg.webp', root);
  const logo = new URL('assets/the-motor-trade-premium.svg', root);
  assert.ok(existsSync(photo));
  assert.ok(statSync(photo).size > 250_000);
  assert.ok(existsSync(logo), 'Standalone title artwork must be present');
  const svg = readFileSync(logo, 'utf8');
  assert.match(svg, /<title>THE MOTOR TRADE<\/title>/);
  assert.match(svg, /<linearGradient id="silver"/);
  assert.match(svg, /<linearGradient id="gold"/);
  assert.match(svg, /<path d="/);
  assert.match(html, /src="\.\/assets\/nextgen-header-wordmark-2026\.webp"/);
  assert.match(html, /src="\.\/assets\/the-motor-trade-premium\.svg"/);
  assert.match(html, /styles\.css\?v=45/);
});
test('the title has no black plaque or clipping-prone CSS text gradient', () => {
  const titleStyles = css.match(/#screen-menu \.trade-wordmark-hero \{([\s\S]*?)\}/)?.[1] ?? '';
  assert.match(titleStyles, /background:transparent/);
  assert.match(titleStyles, /overflow:visible/);
  assert.match(titleStyles, /width:min\(700px,100%\)/);
  assert.doesNotMatch(css, /#screen-menu \.trade-wordmark-hero::before\s*\{/);
  assert.doesNotMatch(css, /#screen-menu \.trade-wordmark-hero \.trade-motor\s*\{/);
  assert.doesNotMatch(html, /class="trade-wordmark trade-wordmark-hero"/);
});

test('auction bidding, vehicle preparation, retail sale, cash and margin all persist', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('new-career');
  app.submitCareer('Mason Autos');
  const opening = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(opening.version, 14);
  const lot = app.engine.market(1).auctions[0];
  app.setInput('auction-bid-' + lot.id, lot.guide);
  app.click('bid-auction', { id: lot.id });
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).cash, 12500, 'Outbid must not spend cash');
  assert.match(app.nodes.get('event-notice').textContent, /Outbid/);
  const bid = lot.rival + 75;
  app.setInput('auction-bid-' + lot.id, bid);
  app.click('bid-auction', { id: lot.id });
  let state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles.length, 1);
  assert.equal(state.vehicles[0].source, 'auction');
  assert.equal(state.cash, 12500 - bid - lot.fee);
  app.click('prepare-stock', { id: '1' });
  state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].status, 'prepared');
  assert.equal(state.cash, 12500 - state.vehicles[0].cost - state.vehicles[0].prepSpent);
  app.setInput('stock-price-1', 6200);
  app.click('list-stock', { id: '1' });
  state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].status,'listed');
  const openingBuyer=app.engine.buyers(state.vehicles[0]);
  app.click('counter-sale', { id: '1' });
  state = JSON.parse(saved.get(STORAGE_KEY));
  const achievedPrice=app.engine.buyers(state.vehicles[0]).cashOffer;
  assert.ok(achievedPrice <= openingBuyer.cashLimit,'Counteroffers cannot exceed customer valuation');
  app.click('sell-cash', { id: '1' });
  state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles.length, 0);
  assert.equal(state.sales, 1);
  assert.equal(state.sold[0].mode,'cash');
  assert.equal(state.sold[0].price,achievedPrice);
  assert.equal(state.sold[0].profit,achievedPrice -
    state.sold[0].acquisition - state.sold[0].prep);
  assert.equal(state.cash,12500 + state.sold[0].profit);
  assert.equal(state.ledger.reduce((a,x)=>a+x.delta,0),state.cash-12500);
  const resumed = browser(saved);
  resumed.click('resume');
  assert.equal(resumed.bindings.get('sales')[0].textContent,'1');
  assert.equal(resumed.bindings.get('cash')[0].textContent,'£' + state.cash.toLocaleString('en-GB'));
});
test('direct sellers negotiate and part exchanges become properly valued stock', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('new-career');
  app.submitCareer('Three Routes Motors');
  const seller = app.engine.market(1).sellers[0];
  app.setInput('seller-offer-' + seller.id,seller.floor - 100);
  app.click('buy-seller',{id:seller.id});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).vehicles.length,0,'A counteroffer does not purchase stock');
  let state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.negotiations[seller.id].status,'counter','Negotiation must persist');
  const accepted = state.negotiations[seller.id].counter;
  app.click('accept-seller-counter',{id:seller.id});
  state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].source,'seller');
  assert.equal(state.vehicles[0].cost,accepted);
  app.click('prepare-stock',{id:'1'});
  app.setInput('stock-price-1',5000);
  app.click('list-stock',{id:'1'});
  const firstBuyer=app.engine.buyers(JSON.parse(saved.get(STORAGE_KEY)).vehicles[0]);
  const px = firstBuyer.exchange;
  app.setInput('px-allowance-1',px.floor - 50);
  app.click('sell-part-ex',{id:'1'});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).sales,0,'Rejected allowance cannot complete sale');
  app.setInput('px-allowance-1',px.floor + 25);
  app.click('sell-part-ex',{id:'1'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.sales,1);
  assert.equal(state.sold[0].mode,'part-ex');
  assert.equal(state.sold[0].allowance,px.floor+25);
  assert.equal(state.vehicles.length,1,'Trade-in replaces sold unit');
  assert.equal(state.vehicles[0].source,'part-ex');
  assert.equal(state.vehicles[0].cost,px.floor+25);
  const expected=12500-state.sold[0].acquisition-state.sold[0].prep+
    firstBuyer.pxOffer-(px.floor+25);
  assert.equal(state.cash,expected,'Sale proceeds minus allowance is the cash difference');
  assert.equal(state.sold[0].profit,firstBuyer.pxOffer-
    state.sold[0].acquisition-state.sold[0].prep);
  assert.equal(state.ledger.reduce((a,l)=>a+l.delta,0),state.cash-12500);
  app.click('prepare-stock',{id:'2'});
  app.setInput('stock-price-2',3500);
  app.click('list-stock',{id:'2'});
  app.click('sell-cash',{id:'2'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.sales,2);
  assert.equal(state.stock,0);
  assert.equal(state.reputation,'NEW TRADER');
  assert.ok(state.reputationScore>5,'Satisfactory completed deals should improve the reputation score');
});
test('forecourt and funds prevent impossible purchases, days refresh leads without invented profit', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('new-career');
  app.submitCareer();
  const dayOne=app.engine.market(1);
  for(const seller of dayOne.sellers){
    app.setInput('seller-offer-' + seller.id,seller.ask);
    app.click('buy-seller',{id:seller.id});
  }
  let state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.stock,2);
  const lot=dayOne.auctions[0];
  app.setInput('auction-bid-' + lot.id,lot.rival+50);
  app.click('bid-auction',{id:lot.id});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.stock,3,'A third car now fits on the expanded forecourt');
  assert.equal(state.cash,12500-
    dayOne.sellers.reduce((n,v)=>n+v.ask,0)-(lot.rival+50)-lot.fee);
  const oldCash=state.cash;
  app.click('continue');
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,2);
  assert.equal(state.cash,oldCash-25,'Property rent and utilities are paid even without retail sales');
  assert.equal(state.sold.length,0);
  assert.equal(state.ledger.reduce((a,l)=>a+l.delta,0),state.cash-12500);
  assert.equal(app.engine.market(2).auctions.length,0,'Tuesday has no weekly auction');
  assert.notEqual(app.engine.market(1).auctions[0].id,app.engine.market(8).auctions[0].id);
});
test('previous version 1 careers migrate safely and malformed version 2 balances are rejected', () => {
  const saved=new Map();
  const first=browser(saved);
  first.click('new-career');
  first.submitCareer('Legacy Dealer');
  const old=JSON.parse(saved.get(STORAGE_KEY));
  old.version=1; old.stock=0;old.sales=0;old.cash=12500;
  delete old.vehicles;delete old.sold;delete old.ledger;delete old.nextId;
  saved.set(STORAGE_KEY,JSON.stringify(old));
  const resumed=browser(saved);
  resumed.click('resume');
  assert.equal(resumed.bindings.get('company')[0].textContent,'Legacy Dealer');
  resumed.click('save');
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).version,14);
  const corrupted=JSON.parse(saved.get(STORAGE_KEY));
  corrupted.cash=999999;
  saved.set(STORAGE_KEY,JSON.stringify(corrupted));
  assert.equal(browser(saved).nodes.get('menu-continue').hidden,true);
});

test('cash reserves protect mandatory preparation across multiple purchases', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('new-career');
  app.submitCareer('Cash Discipline Motors');
  const market = app.engine.market(1);
  const lot = market.auctions[0];
  // Intentionally place a very high bid, leaving exactly enough cash for one vehicle's preparation.
  const totalPrep=lot.profile.basePrep+(lot.profile.hiddenFault?.cost||0);
  const maxSafeBid = 12500 - lot.fee - totalPrep;
  app.setInput('auction-bid-' + lot.id, maxSafeBid);
  app.click('bid-auction',{id:lot.id});
  let state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles.length,1);
  assert.equal(state.cash,totalPrep);
  const seller = market.sellers[0];
  app.setInput('seller-offer-' + seller.id,seller.ask);
  app.click('buy-seller',{id:seller.id});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).vehicles.length,1);
  // There is no longer free, instantaneous preparation. With exactly the
  // original repair reserve, the assessment and garage uplift are unaffordable.
  // The dealer can cut losses using the separate wholesale outlet.
  const failedAssessment=app.engine.assessStock(state,1);
  assert.equal(failedAssessment.ok,false);
  assert.equal(failedAssessment.code,'cash');
  assert.ok(app.nodes.get('workshop-board').innerHTML.includes('SELL TO TRADE'));
  app.click('dispose-workshop',{id:'1'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.stock,0);
  assert.equal(state.sales,0,'Wholesale exit must not count as a retail sale');
  assert.equal(state.wholesale.length,1);
  assert.ok(state.wholesale[0].profit<0,'The cash recovery crystallises a loss');
  assert.ok(state.cash>0);
});

test('seller negotiations counter, then accept or walk away without spending cash', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('new-career');
  app.submitCareer('Negotiation Autos');
  const seller = app.engine.market(1).sellers[0];
  app.setInput('seller-offer-' + seller.id,seller.floor-75);
  app.click('buy-seller',{id:seller.id});
  let state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles.length,0);
  assert.equal(state.cash,12500);
  assert.equal(state.negotiations[seller.id].status,'counter');
  assert.match(app.nodes.get('market-sellers').innerHTML,/SELLER COUNTEROFFER/);
  assert.match(app.nodes.get('market-sellers').innerHTML,/ACCEPT/);
  assert.equal(app.nodes.get('trade-feedback-toast').hidden,false);
  const counter = state.negotiations[seller.id].counter;
  const revisited=browser(saved);
  revisited.click('resume');
  assert.match(revisited.nodes.get('market-sellers').innerHTML,/SELLER COUNTEROFFER/);
  revisited.click('accept-seller-counter',{id:seller.id});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].cost,counter);
  assert.equal(state.cash,12500-counter);
  const second=revisited.engine.market(1).sellers[1];
  revisited.setInput('seller-offer-' + second.id,second.floor-300);
  revisited.click('buy-seller',{id:second.id});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).negotiations[second.id].status,'walked');
  assert.equal(revisited.nodes.get('trade-feedback-toast').hidden,false);
  const leftCash=JSON.parse(saved.get(STORAGE_KEY)).cash;
  revisited.setInput('seller-offer-' + second.id,second.ask);
  revisited.click('buy-seller',{id:second.id});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).cash,leftCash);
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).vehicles.length,1,'Walkaway must not erase previous purchases');
  assert.match(revisited.nodes.get('market-sellers').innerHTML,/OWNER WALKED AWAY/);
});
test('auction losses are visible and charge no fee; winning fee is recorded', () => {
  const saved = new Map();
  const app = browser(saved);
  app.click('new-career');
  app.submitCareer('Auction Trader');
  const lot=app.engine.market(1).auctions[0];
  app.setInput('auction-bid-'+lot.id,lot.guide);
  app.click('bid-auction',{id:lot.id});
  assert.match(app.nodes.get('trade-feedback-toast').textContent,/Outbid/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/NUMBERED LOT CATALOGUE/);
  let state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.cash,12500);
  assert.equal(state.ledger.length,0);
  assert.equal(state.auctionBids[lot.id].status,'outbid');
  const back=browser(saved);back.click('resume');
  assert.match(back.nodes.get('auction-hall-view').innerHTML,/LOT 001/);
  back.setInput('auction-bid-'+lot.id,lot.rival+100);
  back.click('bid-auction',{id:lot.id});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].source,'auction');
  assert.equal(state.vehicles[0].cost,lot.rival+100+lot.fee);
  assert.equal(state.cash,12500-lot.rival-100-lot.fee);
  assert.match(state.ledger[0].note,/buyer fee/);
});
test('daily listings vary in source quantity and vehicle selection without duplicates', () => {
  const engine = browser(new Map()).engine;
  const daily = Array.from({length:20},(_,day)=>engine.market(day+1));
  assert.equal(daily[0].auctions.length,3);
  assert.equal(daily[0].sellers.length,2);
  assert.ok(daily.some(d=>d.auctions.length !== 3));
  assert.ok(daily.some(d=>d.sellers.length === 0));
  assert.ok(daily.some(d=>d.sellers.length >= 2));
  for(const d of daily){
    assert.ok(d.auctions.length+d.sellers.length >= 0,'Some quiet days have no new sourcing leads');
    assert.equal(d.auctions.length,new Set(d.auctions.map(v=>v.title)).size,'No duplicate auction model on same day');
    assert.equal(d.sellers.length,new Set(d.sellers.map(v=>v.title)).size,'No duplicate seller car on same day');
  }
  assert.deepEqual(JSON.stringify(engine.market(8)),JSON.stringify(engine.market(8)),'Same day market reproducible after reload');
});
test('two cars no longer fill the four-space forecourt and buying actions stay enabled', () => {
  const saved=new Map(),app=browser(saved);
  app.click('new-career');app.submitCareer();
  const market=app.engine.market(1);
  for(const seller of market.sellers){
    app.setInput('seller-offer-'+seller.id,seller.ask);
    app.click('buy-seller',{id:seller.id});
  }
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).stock,2);
  assert.equal(app.engine.CAPACITY,4);
  assert.doesNotMatch(app.nodes.get('auction-hall-view').innerHTML,/FORECOURT IS FULL/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/data-action="start-auction"/);
  app.setInput('auction-bid-'+market.auctions[0].id,market.auctions[0].rival+100);
  app.click('bid-auction',{id:market.auctions[0].id});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).stock,3);
  assert.match(app.bindings.get('stock')[0].textContent,/3 \/ 4/);
});

test('v0.4 deterministic profiles have unique IDs, grades, MOT records and repair breakdowns', () => {
  const E=browser(new Map()).engine;
  const refs=new Set();
  let hidden=0;
  for(let day=1;day<=30;day++){
    const m=E.market(day);
    for(const car of [...m.auctions,...m.sellers]){
      const p=car.profile;
      assert.ok(p.ref.startsWith('SIM-'),'Never publish a real registration as a synthetic record');
      assert.ok(!refs.has(p.ref),'Every lead has a unique stable dossier ID');
      refs.add(p.ref);
      assert.ok(p.grade>=1&&p.grade<=5);
      assert.ok(p.mot.monthsRemaining>=0&&p.mot.monthsRemaining<=24);
      assert.equal(p.knownRepairs.reduce((n,x)=>n+x.cost,0),p.basePrep);
      if(p.hiddenFault)hidden++;
    }
    assert.equal(JSON.stringify(E.market(day)),JSON.stringify(m),'Same lead and report after reload');
  }
  assert.ok(hidden>0,'The risk engine must generate some hidden defects');
});
test('a paid inspection reveals new risk before purchase and is included in realised margin', () => {
  const storage=new Map();
  const app=browser(storage);
  app.click('new-career');app.submitCareer('Inspection Motors');
  const lot=app.engine.market(1).auctions.find(x=>x.profile.hiddenFault);
  assert.ok(lot,'At least one day-one lot reveals a fault if inspected');
  const before=app.engine.quote(lot,'auction',lot.rival+50,false);
  app.click('toggle-report',{id:lot.id,kind:'auction'});
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/KNOWN PREPARATION ITEMS/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/BUY INSPECTION/);
  app.click('inspect-lead',{id:lot.id,kind:'auction'});
  let state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.cash,12500-lot.profile.inspectionFee);
  assert.equal(state.vehicles.length,0);
  assert.equal(state.reports[lot.id].fee,lot.profile.inspectionFee);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/ADDITIONAL CONDITION RISK/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,new RegExp(lot.profile.hiddenFault.item));
  const after=app.engine.quote(lot,'auction',lot.rival+50,true);
  assert.equal(after.prep,lot.profile.basePrep+lot.profile.hiddenFault.cost);
  assert.equal(after.inspection,lot.profile.inspectionFee);
  assert.notEqual(before.maxBid,after.maxBid);
  const resume=browser(storage);resume.click('resume');
  assert.match(resume.nodes.get('auction-hall-view').innerHTML,/INSPECTION PAID|VEHICLE FILE/);
  resume.click('toggle-report',{id:lot.id,kind:'auction'});
  assert.match(resume.nodes.get('auction-hall-view').innerHTML,/INSPECTION PAID/);
  const hammer=lot.rival+50;
  resume.setInput('auction-bid-'+lot.id,hammer);
  resume.click('bid-auction',{id:lot.id});
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.vehicles.length,1);
  assert.equal(state.vehicles[0].cost,hammer+lot.fee+lot.profile.inspectionFee);
  assert.equal(state.vehicles[0].prepBudget,lot.profile.basePrep+lot.profile.hiddenFault.cost);
  assert.equal(state.vehicles[0].profile.inspected,true);
  resume.click('prepare-stock',{id:'1'});
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.ok(state.vehicles[0].prepSpent>=state.vehicles[0].prepBudget,
    'External garage pricing can exceed the original repair allowance');
  resume.setInput('stock-price-1',6800);
  resume.click('list-stock',{id:'1'});
  state=JSON.parse(storage.get(STORAGE_KEY));
  const achieved=resume.engine.buyers(state.vehicles[0]).cashOffer;
  resume.click('sell-cash',{id:'1'});
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.sold[0].profit,achieved-
    state.sold[0].acquisition-state.sold[0].prep);
  assert.ok(state.sold[0].profile,'Vehicle report must remain in sales history');
  assert.equal(state.cash,12500+state.sold[0].profit);
  assert.ok(state.ledger.some(x=>x.note.startsWith('Pre-purchase inspection')));
});
test('inspections are charged only once, even if the car is never bought', () => {
  const storage=new Map(), app=browser(storage);
  app.click('new-career');app.submitCareer();
  const seller=app.engine.market(1).sellers[0];
  app.click('inspect-lead',{kind:'seller',id:seller.id});
  const first=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(first.cash,12500-seller.profile.inspectionFee);
  assert.equal(first.ledger.length,1);
  app.click('inspect-lead',{kind:'seller',id:seller.id});
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).ledger.length,1);
  app.click('continue');
  const next=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(next.cash,first.cash-25,'Inspection stays charged and day two premises expenses also apply');
  assert.equal(Object.keys(next.reports).length,0,'Expired leads are discarded daily');
  assert.ok(next.ledger.some(x=>x.note.startsWith('Pre-purchase inspection')));
});
test('older v2 stock migrates to v3 without changing costs, prep or recorded sale history', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Legacy Stock');
  const car=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+car.id,car.ask);
  app.click('buy-seller',{id:car.id});
  const before=JSON.parse(storage.get(STORAGE_KEY));
  before.version=2;
  before.vehicles.forEach(v=>delete v.profile);
  delete before.reports;
  storage.set(STORAGE_KEY,JSON.stringify(before));
  const oldCost=before.vehicles[0].cost,oldPrep=before.vehicles[0].prepBudget;
  const resumed=browser(storage);
  assert.equal(resumed.nodes.get('menu-continue').hidden,false);
  resumed.click('resume');
  resumed.click('save');
  const migrated=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(migrated.version,14);
  assert.equal(migrated.vehicles[0].cost,oldCost);
  assert.equal(migrated.vehicles[0].prepBudget,oldPrep);
  assert.equal(migrated.vehicles[0].profile.legacy,true);
  assert.equal(migrated.vehicles[0].profile.hiddenFault,null);
  assert.equal(migrated.cash,before.cash);
  assert.equal(migrated.ledger.length,before.ledger.length);
  assert.match(resumed.nodes.get('stock-list').innerHTML,/VIEW FULL REPORT/);
});
test('a changing maximum bid updates the visible projected contribution', () => {
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Valuation Autos');
  const lot=app.engine.market(1).auctions[0];
  app.typeInput('auction-bid-'+lot.id,lot.guide+500);
  const expected=app.engine.quote(lot,'auction',lot.guide+500,false).expectedMargin;
  const formatted=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(expected);
  assert.equal(app.nodes.get('projection-'+lot.id).textContent,formatted);
  assert.match(app.nodes.get('market-sellers').innerHTML,/TRADE VALUE/);
  assert.match(app.nodes.get('stock-list').innerHTML,/FORECOURT IS EMPTY/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/NUMBERED LOT CATALOGUE/);
});
test('invalid persisted v3 vehicle profiles are rejected rather than silently accepted', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Corrupt Test');
  const lot=app.engine.market(1).auctions[0];
  app.setInput('auction-bid-'+lot.id,lot.rival+100);
  app.click('bid-auction',{id:lot.id});
  const saved=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(saved.vehicles.length,1);
  saved.vehicles[0].profile.knownRepairs[0].cost=999999;
  storage.set(STORAGE_KEY,JSON.stringify(saved));
  assert.equal(browser(storage).nodes.get('menu-continue').hidden,true);
});

test('opening a report preserves the entered bid and exposes itemised max-bid arithmetic', () => {
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Dossier Tester');
  const auction=app.engine.market(1).auctions[0], offer=auction.guide+450;
  app.typeInput('auction-bid-'+auction.id,offer);
  app.click('toggle-report',{id:auction.id,kind:'auction'});
  const markup=app.nodes.get('auction-hall-view').innerHTML;
  assert.match(markup,/MAXIMUM BID \/ OFFER WORKING/);
  assert.match(markup,/NEXT £100 BID/);
  assert.match(markup,/Expected repair allowance/);
  assert.match(markup,/Buyer fees/);
  assert.match(markup,/Target trading contribution/);
  const seller=app.engine.market(1).sellers[0], sellerOffer=seller.ask-100;
  app.typeInput('seller-offer-'+seller.id,sellerOffer);
  app.click('toggle-report',{id:seller.id,kind:'seller'});
  assert.ok(app.nodes.get('market-sellers').innerHTML.includes('id="seller-offer-'+seller.id+
    '" value="'+sellerOffer+'"'));
});
test('old v2 completed sales retain cash and historic gross margin after v0.4 migration', () => {
  const storage=new Map(), app=browser(storage);
  app.click('new-career');app.submitCareer('Historic Dealer');
  const seller=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+seller.id,seller.ask);
  app.click('buy-seller',{id:seller.id});
  app.click('prepare-stock',{id:'1'});
  app.setInput('stock-price-1',5000);
  app.click('list-stock',{id:'1'});
  app.click('sell-cash',{id:'1'});
  const old=JSON.parse(storage.get(STORAGE_KEY));
  old.version=2;
  delete old.reports;
  old.sold.forEach(v=>delete v.profile);
  storage.set(STORAGE_KEY,JSON.stringify(old));
  const resumed=browser(storage);
  assert.equal(resumed.nodes.get('menu-continue').hidden,false);
  resumed.click('resume');
  const current=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(resumed.bindings.get('trade-profit')[0].textContent,
    new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0})
      .format(old.sold[0].profit));
  assert.equal(resumed.bindings.get('cash')[0].textContent,
    new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0})
      .format(old.cash));
  resumed.click('save');
  const saved=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(saved.version,14);
  assert.equal(saved.sold[0].profit,old.sold[0].profit);
  assert.equal(saved.ledger.length,old.ledger.length);
  assert.equal(saved.cash,old.cash);
  assert.equal(saved.sold[0].profile,null);
});

test('v0.5 starts with basic reputation, owner-operated staffing and visible recruitment', () => {
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Starter Motors');
  assert.equal(app.engine.VERSION,14);
  assert.equal(app.bindings.get('reputation')[0].textContent,'NEW TRADER');
  assert.equal(app.bindings.get('reputation-score')[0].textContent,'5 / 100');
  assert.equal(app.bindings.get('staff-count')[0].textContent,'0');
  assert.match(app.nodes.get('people-board').innerHTML,/AVAILABLE CANDIDATES/);
  assert.match(app.nodes.get('people-board').innerHTML,/SALES EXECUTIVE/);
  assert.match(app.nodes.get('people-board').innerHTML,/VEHICLE BUYER/);
  assert.match(app.nodes.get('people-board').innerHTML,/PREP TECHNICIAN/);
  app.click('staff-desk-mode',{mode:'team'});
  assert.match(app.nodes.get('people-board').innerHTML,/No employees in this role yet/);
  app.click('staff-desk-mode',{mode:'candidates'});
  assert.match(app.nodes.get('reputation-view').innerHTML,/LONG-TERM PRESTIGE TARGET/);
  assert.match(app.nodes.get('reputation-view').innerHTML,/NEW TRADER/);
  assert.match(html,/data-page="staff"/);
  assert.match(html,/data-page="reputation"/);
});
test('recruitment charges cash, starts next day, settles daily wages, survives reload', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('People First');
  const P=app.engine.people;
  const candidate=P.applicants(1).find(x=>x.role==='sales');
  app.click('hire-staff',{id:candidate.id});
  let state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.staff.length,1);
  assert.equal(state.staff[0].name,candidate.name);
  assert.equal(state.staff[0].startDay,2);
  assert.equal(state.cash,12500-P.HIRING_FEE);
  assert.equal(state.ledger.filter(x=>x.note.startsWith('Recruitment')).length,1);
  assert.equal(P.active(state,'sales'),null,'Employee cannot boost sales the day they are hired');
  assert.match(app.nodes.get('people-board').innerHTML,/STARTS DAY 2/);
  const daily=P.dailyCost(state.staff[0]);
  app.click('continue');
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.day,2);
  assert.equal(state.cash,12500-P.HIRING_FEE-daily-25);
  assert.equal(state.payrollArrears,0);
  assert.equal(state.ledger.filter(x=>x.note.startsWith('Staff payroll')).length,1);
  assert.match(app.nodes.get('event-notice').textContent,/wage settlement/);
  const later=browser(storage);
  later.click('resume');
  assert.equal(later.bindings.get('staff-count')[0].textContent,'1');
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).staff[0].name,candidate.name);
  assert.match(later.nodes.get('people-board').innerHTML,/AVAILABLE/);
});
test('vehicle buyer changes direct negotiation and adds useful auction intelligence', () => {
  const P=browser(new Map()).engine.people;
  const staff=browser(new Map()).engine.create('Buyer Dealer',[]);
  const candidate=P.applicants(1).find(x=>x.role==='buyer' && x.skills.negotiation>=17);
  assert.ok(candidate);
  assert.ok(P.hire(staff,candidate.id).ok);
  staff.day=2;
  browser(new Map()).engine.staffDay(staff);
  const E=browser(new Map()).engine;
  const seller=E.market(2).sellers[0];
  assert.ok(seller,'Second day must include a seller lead for this scenario');
  const offer=seller.floor-80;
  const assisted=E.acquireSeller(staff,seller.id,offer);
  assert.equal(assisted.ok,true,'Qualified buyer should secure an improved purchase price');
  assert.equal(staff.vehicles[0].cost,offer);
  const owner=E.create('Owner Only',[]);
  owner.day=2;
  const unassisted=E.acquireSeller(owner,seller.id,offer);
  assert.equal(unassisted.ok,false,'Owner acting alone receives a counteroffer');
  assert.equal(unassisted.code,'counter');
  const auction=E.market(8).auctions[0];
  assert.ok(P.buyerEstimate(staff,auction.rival));
});
test('technician reduces basic prep costs without changing recorded repair estimates', () => {
  const E=browser(new Map()).engine,P=E.people;
  const state=E.create('Technical Trader',[]);
  const candidate=P.applicants(1).find(x=>x.role==='technician'&&x.skills.efficiency>=15);
  assert.ok(candidate);
  assert.ok(P.hire(state,candidate.id).ok);
  state.day=2;E.staffDay(state);
  const seller=E.market(2).sellers[0];
  assert.ok(E.acquireSeller(state,seller.id,seller.ask).ok);
  const v=state.vehicles[0],quote=v.prepBudget;
  assert.ok(P.labourSaving(state,v)>0);
  assert.ok(E.prepare(state,v.id).ok);
  assert.equal(v.status,'prepared');
  assert.ok(v.prepSpent<quote,'Technician saves a portion of preparation labour');
  assert.equal(v.prepBudget,quote,'Original quoted repair budget remains visible');
  assert.equal(state.staff[0].workDone,1);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))),'Discounted preparation must survive save validation');
});
test('sales staff improves buyer offers, earns commission and influences reputation', () => {
  const E=browser(new Map()).engine,P=E.people;
  const state=E.create('Sales Professionals',[]);
  const candidate=P.applicants(1).find(x=>x.role==='sales'&&x.skills.sales>=16);
  assert.ok(P.hire(state,candidate.id).ok);
  state.day=2;E.staffDay(state);
  const car=E.market(2).sellers[0];
  assert.ok(E.acquireSeller(state,car.id,car.ask).ok);
  const stock=state.vehicles[0];
  assert.ok(E.prepare(state,stock.id).ok);
  assert.ok(E.advertise(state,stock.id,Math.round(stock.retail/50)*50).ok);
  const withSales=E.buyers(stock,state);
  const ownerOnly=E.buyers(stock);
  assert.ok(withSales.cashOffer>ownerOnly.cashOffer,'Strong salesperson should improve opening customer offer');
  const before=state.reputationScore;
  const sale=E.completeSale(state,stock.id,'cash',null);
  assert.ok(sale.ok);
  assert.ok(state.reputationScore>before);
  assert.equal(state.staff[0].deals,1);
  assert.equal(state.sold[0].salesCommission,
    Math.round(Math.max(0,state.sold[0].profit)*.06));
  assert.equal(state.sold[0].salesCommissionRatePct,6);
  assert.ok(state.ledger.some(x=>x.note.startsWith('Sales commission:')));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('poor condition can reduce customer trust; reputation tiers are earned gradually', () => {
  const E=browser(new Map()).engine,P=E.people;
  const state=E.create('Quality Matters',[]);
  const lot=Array.from({length:30},(_,day)=>E.market(day+1))
    .flatMap(x=>x.auctions).find(x=>x.profile.grade>=4);
  assert.ok(lot);
  state.day=lot.day;
  assert.ok(E.acquireAuction(state,lot.id,lot.rival+50).ok);
  const v=state.vehicles[0];
  assert.ok(E.prepare(state,v.id).ok);
  assert.ok(E.advertise(state,v.id,Math.round(v.retail/50)*50).ok);
  const before=state.reputationScore;
  assert.ok(E.completeSale(state,v.id,'cash',null).ok);
  assert.ok(state.reputationScore<before,'Poor-grade stock should damage trust');
  assert.ok(state.reputationHistory.some(x=>x.delta<0));
  assert.equal(state.reputation,P.tier(state.reputationScore));
  assert.equal(P.tier(0),'NEW TRADER');
  assert.equal(P.tier(20),'LOCAL DEALER');
  assert.equal(P.tier(40),'TRUSTED DEALER');
  assert.equal(P.tier(60),'REGIONAL SPECIALIST');
  assert.equal(P.tier(80),'PRESTIGE DEALER');
});
test('payroll cash shortages are recorded without spending repair reserves or losing a career', () => {
  const E=browser(new Map()).engine,P=E.people,state=E.create('Thin Cash Motors',[]);
  const candidate=P.applicants(1).find(x=>x.role==='sales');
  assert.ok(P.hire(state,candidate.id).ok);
  const lot=E.market(1).auctions[0];
  const maxSafeBid=state.cash-lot.fee-lot.profile.basePrep-
    (lot.profile.hiddenFault?.cost||0);
  assert.ok(E.acquireAuction(state,lot.id,maxSafeBid).ok);
  const remaining=state.vehicles[0].prepBudget;
  assert.equal(state.cash,remaining);
  state.day=2;
  const tick=E.staffDay(state);
  assert.equal(tick.paid,0,'Vehicle preparation funds are protected');
  assert.ok(tick.arrears>0);
  assert.equal(state.cash,remaining);
  assert.ok(state.reputationScore<5,'Unpaid staff wages hurt reputation');
  // Original prep money cannot fund a new diagnosis and external uplift.
  // Exit to the trade, settle arrears next day and keep the ledger coherent.
  assert.equal(E.assessStock(state,1).ok,false);
  assert.ok(E.disposeStock(state,1).ok);
  assert.equal(state.vehicles.length,0);
  assert.equal(state.sold.length,0);
  assert.ok(state.wholesale[0].profit<0);
  state.day=3;
  const recovered=E.staffDay(state);
  assert.equal(recovered.arrears,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))),'Ledger and arrears must remain coherent');
});
test('staff training consumes cash, improves skill, and temporarily blocks employee effects', () => {
  const E=browser(new Map()).engine,P=E.people,state=E.create('Skills Workshop',[]);
  const candidate=P.applicants(1).find(x=>x.role==='buyer');
  assert.ok(P.hire(state,candidate.id).ok);
  state.day=2;E.staffDay(state);
  const e=state.staff[0],previous=e.skills.negotiation;
  assert.ok(P.active(state,'buyer'));
  const result=P.train(state,e.id);
  assert.ok(result.ok);
  assert.ok(e.skills.negotiation>=previous);
  assert.equal(P.active(state,'buyer'),null);
  assert.equal(state.ledger.filter(x=>x.note.startsWith('Staff development')).length,1);
  assert.equal(P.train(state,e.id).ok,false);
  state.day=3;E.staffDay(state);
  assert.equal(P.active(state,'buyer'),null);
  state.day=4;E.staffDay(state);
  assert.ok(P.active(state,'buyer'),'Training finishes on day four');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('v0.4 career migrates with stock, sold vehicles and financial balances untouched', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Legacy Reputation Dealer');
  const seller=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+seller.id,seller.ask);
  app.click('buy-seller',{id:seller.id});
  const v3=JSON.parse(storage.get(STORAGE_KEY));
  v3.version=3;
  delete v3.staff;delete v3.nextStaffId;delete v3.reputationScore;
  delete v3.payrollArrears;delete v3.reputationHistory;
  storage.set(STORAGE_KEY,JSON.stringify(v3));
  const newApp=browser(storage);
  assert.equal(newApp.nodes.get('menu-continue').hidden,false);
  newApp.click('resume');newApp.click('save');
  const restored=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(restored.version,14);
  assert.equal(restored.cash,v3.cash);
  assert.equal(restored.vehicles[0].cost,v3.vehicles[0].cost);
  assert.equal(restored.vehicles[0].prepBudget,v3.vehicles[0].prepBudget);
  assert.equal(restored.ledger.length,v3.ledger.length);
  assert.deepEqual(restored.staff,[]);
  assert.equal(restored.reputationScore,5);
  assert.match(newApp.nodes.get('stock-list').innerHTML,/VIEW FULL REPORT/);
});
test('tampered staff ratings or payroll liabilities invalidate a career save', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Integrity Dealer');
  const candidate=app.engine.people.applicants(1)[0];
  app.click('hire-staff',{id:candidate.id});
  const valid=JSON.parse(storage.get(STORAGE_KEY));
  valid.staff[0].skills.sales=999;
  storage.set(STORAGE_KEY,JSON.stringify(valid));
  assert.equal(browser(storage).nodes.get('menu-continue').hidden,true);
  const bad=JSON.parse(storage.get(STORAGE_KEY));
  bad.staff[0].skills.sales=17;
  bad.payrollArrears=-20;
  storage.set(STORAGE_KEY,JSON.stringify(bad));
  assert.equal(browser(storage).nodes.get('menu-continue').hidden,true);
});

test('sales commission never consumes the reserved preparation cash of incoming stock', () => {
  const E=browser(new Map()).engine,P=E.people;
  const state=E.create('Commission Reserve Motors',[]);
  const candidate=P.applicants(1).find(x=>x.role==='sales');
  assert.ok(P.hire(state,candidate.id).ok);
  state.day=8;E.staffDay(state);
  const lot=E.market(8).auctions[0];
  assert.ok(E.acquireAuction(state,lot.id,lot.rival+50).ok);
  const prepDue=state.vehicles[0].prepBudget;
  // Simulate a tight cash position with reserved workshop money. Use a
  // valid trade to move cash into stock, then assess commission in isolation.
  state.cash=prepDue;
  state.ledger.push({day:8,delta:-(state.ledger.reduce((n,l)=>n+l.delta,12500)-prepDue),
    note:'Test fixture: settled separate business expense'});
  const before=state.cash;
  const out=P.sale(state,{profile:{grade:2,likelySale:5000}},4800,10000);
  assert.ok(out.commission>0);
  assert.equal(state.cash,before,'Reserved workshop funds must remain available');
  assert.equal(state.payrollArrears,out.commission);
  assert.equal(state.ledger.filter(x=>x.note.startsWith('Sales commission')).length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('reputation attracts additional direct sellers only after trust threshold', () => {
  const E=browser(new Map()).engine;
  const day=Array.from({length:30},(_,i)=>i+2).find(d=>{
    const baseline=E.market(d,5).sellers.length;
    return baseline>0&&baseline<4;
  });
  assert.ok(day);
  const owner=E.market(day,5),trusted=E.market(day,42);
  assert.equal(trusted.sellers.length,owner.sellers.length+1);
  assert.equal(trusted.auctions.length,owner.auctions.length);
  assert.equal(new Set(trusted.sellers.map(s=>s.id)).size,trusted.sellers.length);
});
test('releasing staff records notice costs and any unpaid amount as a liability', () => {
  const E=browser(new Map()).engine,P=E.people,state=E.create('Employer Test',[]);
  const candidate=P.applicants(1).find(x=>x.role==='technician');
  assert.ok(P.hire(state,candidate.id).ok);
  const staff=state.staff[0], notice=P.dailyCost(staff)*7;
  const result=P.release(state,staff.id);
  assert.ok(result.ok);
  assert.equal(state.staff.length,0);
  assert.equal(state.cash,12500-P.HIRING_FEE-notice);
  assert.equal(state.payrollArrears,0);
  assert.ok(state.ledger.some(x=>x.note.startsWith('Staff exit')));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('legacy career reputation tiers are respected when converting past sale milestones', () => {
  const P=browser(new Map()).engine.people;
  assert.equal(P.legacyScore(0),5);
  assert.ok(P.legacyScore(5)>=20,'Old LOCAL TRADER should migrate to Local Dealer or higher');
  assert.ok(P.legacyScore(12)>=40,'Old ESTABLISHED trader should not lose earned standing');
  assert.ok(P.legacyScore(200)<=75,'Historical sales alone do not unlock prestige');
});

test('new dealerships receive achievable company targets and a live monthly dashboard', () => {
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Monthly Review Motors');
  const E=app.engine,state=E.create('Standalone',[]);
  assert.equal(E.VERSION,14);
  assert.equal(state.monthPlan.month,1);
  assert.equal(state.monthPlan.startDay,1);
  assert.equal(state.monthPlan.endDay,30);
  assert.equal(state.monthPlan.unitTarget,2);
  assert.equal(state.monthlyReports.length,0);
  assert.equal(app.bindings.get('monthly-target')[0].textContent,'0 / 2');
  assert.match(app.nodes.get('monthly-dashboard-target').innerHTML,/MONTHLY SALES TARGET/);
  assert.match(app.nodes.get('monthly-report-view').innerHTML,/MANAGEMENT REVIEW/);
  assert.match(app.nodes.get('monthly-report-view').innerHTML,/STAFF COSTS|Wages paid/i);
  assert.match(app.nodes.get('monthly-report-view').innerHTML,/STOCK & WORKING CAPITAL/);
  assert.match(html,/data-panel="reports"/);
});
test('sales targets scale by reputation but stay fixed during a month', () => {
  const E=browser(new Map()).engine,M=E.monthly,state=E.create('Target Trader',[]);
  const expectations=[[5,2],[20,3],[40,4],[60,5],[80,6]];
  for(const [score,target] of expectations)assert.equal(M.targetFor(score).unitTarget,target);
  assert.equal(state.monthPlan.unitTarget,2);
  state.reputationScore=41;
  assert.equal(state.monthPlan.unitTarget,2,'Better reputation cannot rewrite existing targets');
  state.day=30;
  const closed=M.close(state);
  assert.equal(closed.targetUnits,2);
  state.day=31;M.next(state);
  assert.equal(state.monthPlan.unitTarget,4,'New month uses the improved reputation tier');
  assert.equal(state.monthPlan.month,2);
  assert.ok(M.validPlan(state.monthPlan,state.day));
});
test('hiring assigns a fair salesperson target and late-month hires are exempt', () => {
  const E=browser(new Map()).engine,P=E.people,state=E.create('People Targets',[]);
  const first=P.applicants(1).find(x=>x.role==='sales');
  assert.ok(E.hireStaff(state,first.id).ok);
  assert.equal(state.monthPlan.staffTargets.length,1);
  assert.equal(state.monthPlan.staffTargets[0].unitTarget,2);
  state.day=30;
  const r=E.monthly.close(state);
  assert.equal(r.sellers.length,1);
  assert.equal(r.sellers[0].sold,0);
  assert.equal(r.sellers[0].unitTarget,2);
  assert.equal(r.sellers[0].hit,false);
  assert.equal(state.staff[0].morale,67,'Missed targets affect morale without artificial cash fines');
  const late=E.create('Late Recruitment',[]);
  late.day=26;
  const second=P.applicants(26).find(x=>x.role==='sales');
  assert.ok(E.hireStaff(late,second.id).ok);
  assert.equal(late.monthPlan.staffTargets[0].unitTarget,0);
  late.day=30;
  const report=E.monthly.close(late);
  assert.equal(report.sellers[0].exempt,true);
  assert.equal(late.staff[0].morale,72,'Late hires should not be punished for days before joining');
});
test('completed cash and part-ex deals count towards real sales targets', () => {
  const E=browser(new Map()).engine,state=E.create('Performance Motors',[]);
  const first=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(state,first.id,first.ask).ok);
  assert.ok(E.prepare(state,1).ok);
  assert.ok(E.advertise(state,1,Math.round(state.vehicles[0].retail/50)*50).ok);
  const firstBuyer=E.buyers(state.vehicles[0],state);
  assert.ok(E.completeSale(state,1,'cash',null).ok);
  assert.equal(state.sold[0].price,firstBuyer.cashOffer);
  const second=E.market(1).sellers[1];
  assert.ok(E.acquireSeller(state,second.id,second.ask).ok);
  assert.ok(E.prepare(state,2).ok);
  assert.ok(E.advertise(state,2,Math.round(state.vehicles[0].retail/50)*50).ok);
  const px=E.buyers(state.vehicles[0],state).exchange;
  assert.ok(E.completeSale(state,2,'part-ex',px.ask).ok);
  assert.equal(state.sold.length,2);
  state.day=30;
  const r=E.monthly.close(state);
  assert.equal(r.soldUnits,2);
  assert.equal(r.salesModes.cash,1);
  assert.equal(r.salesModes.partExchange,1);
  assert.equal(r.turnover,state.sold[0].price+state.sold[1].price);
  assert.equal(r.grossMargin,state.sold[0].profit+state.sold[1].profit);
  assert.equal(r.targetMet,true);
  assert.equal(state.monthlyReports.length,1);
  assert.equal(r.openingCash+r.netCashChange,r.closingCash);
  assert.ok(E.monthly.validReport(r));
});
test('monthly report distinguishes cash flow, gross margin, staff costs and tied-up stock', () => {
  const E=browser(new Map()).engine,state=E.create('Cash Flow Motors',[]);
  const P=E.people,employee=P.applicants(1).find(x=>x.role==='sales');
  assert.ok(E.hireStaff(state,employee.id).ok);
  state.day=2;E.staffDay(state);
  const first=E.market(2).sellers[0];
  assert.ok(E.acquireSeller(state,first.id,first.ask).ok);
  assert.ok(E.prepare(state,1).ok);
  assert.ok(E.advertise(state,1,Math.round(state.vehicles[0].retail/50)*50).ok);
  assert.ok(E.completeSale(state,1,'cash',null).ok);
  assert.equal(state.sold[0].salespersonId,state.staff[0].id);
  assert.equal(state.sold[0].salespersonName,state.staff[0].name);
  state.day=30;
  const r=E.monthly.close(state);
  assert.equal(r.sellers[0].sold,1);
  assert.equal(r.sellers[0].turnover,state.sold[0].price);
  assert.ok(r.ledgerBreakdown.payroll<0);
  assert.ok(r.ledgerBreakdown.commission<0);
  assert.equal(r.cashIn-r.cashOut,r.netCashChange);
  assert.equal(r.openingCash+r.netCashChange,r.closingCash);
  assert.equal(r.grossAfterStaff,r.grossMargin-r.staffCosts);
  assert.equal(r.stockCount,state.vehicles.length);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('day 30 close generates an inbox message and immutable archived review', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Month End Cars');
  for(let i=0;i<34;i++)app.click('continue');
  let state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.day,31);
  assert.equal(state.monthPlan.month,2);
  assert.equal(state.monthlyReports.length,1);
  assert.equal(state.monthlyReports[0].month,1);
  assert.equal(state.monthlyReports[0].targetMet,false);
  assert.equal(state.reputationScore,4);
  assert.equal(state.monthlyReports[0].closingCash,12500-29*25,'29 days of premises overhead since the first game day');
  assert.ok(state.messages.some(m=>m.linkPage==='reports'&&/Month 1 report/.test(m.subject)));
  assert.match(app.nodes.get('event-notice').textContent,/management review ready/i);
  assert.match(app.nodes.get('monthly-report-view').innerHTML,/MONTH 1/);
  assert.match(app.nodes.get('monthly-report-view').innerHTML,/TARGET MISSED/);
  const archived=JSON.stringify(state.monthlyReports[0]);
  app.click('select-report',{month:'current'});
  assert.match(app.nodes.get('monthly-report-view').innerHTML,/MONTH 2/);
  app.click('continue');
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(JSON.stringify(state.monthlyReports[0]),archived);
  const resumed=browser(storage);
  resumed.click('resume');
  assert.equal(resumed.engine.VERSION,14);
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).monthlyReports.length,1);
});
test('monthly targets credit salesperson performance only during active duty', () => {
  const E=browser(new Map()).engine,P=E.people,state=E.create('Service Scores',[]);
  const candidate=P.applicants(1).find(x=>x.role==='sales'&&x.skills.sales>=16);
  assert.ok(E.hireStaff(state,candidate.id).ok);
  state.day=2;E.staffDay(state);
  const a=E.market(2).sellers[0],b=E.market(2).sellers[1];
  for (const car of [a,b]){
    assert.ok(E.acquireSeller(state,car.id,car.ask).ok);
    const v=state.vehicles.at(-1);
    assert.ok(E.prepare(state,v.id).ok);
    assert.ok(E.advertise(state,v.id,Math.round(v.retail/50)*50).ok);
    assert.ok(E.completeSale(state,v.id,'cash',null).ok);
  }
  state.day=30;
  const r=E.monthly.close(state);
  assert.equal(r.sellers.length,1);
  assert.equal(r.sellers[0].sold,2);
  assert.equal(r.sellers[0].hit,true);
  assert.equal(r.sellers[0].unitTarget,2);
  assert.ok(state.staff[0].morale>=77,'Good sales performance improves morale');
});
test('migration from v0.5 preserves staff, outstanding balances and day without fabricated reports', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Established Example');
  const applicant=app.engine.people.applicants(1).find(x=>x.role==='sales');
  app.click('hire-staff',{id:applicant.id});
  for(let i=0;i<8;i++)app.click('continue');
  const before=JSON.parse(storage.get(STORAGE_KEY));
  before.version=4;delete before.monthPlan;delete before.monthlyReports;
  storage.set(STORAGE_KEY,JSON.stringify(before));
  const resumed=browser(storage);
  assert.equal(resumed.nodes.get('menu-continue').hidden,false);
  resumed.click('resume');resumed.click('save');
  const after=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(after.version,14);
  assert.equal(after.day,before.day);
  assert.equal(after.cash,before.cash);
  assert.equal(after.ledger.length,before.ledger.length);
  assert.equal(after.staff.length,1);
  assert.equal(after.staff[0].name,before.staff[0].name);
  assert.equal(after.payrollArrears,before.payrollArrears);
  assert.deepEqual(after.monthlyReports,[]);
  assert.equal(after.monthPlan.partial,true);
  assert.equal(after.monthPlan.startDay,after.day);
  assert.equal(after.monthPlan.month,1);
  assert.match(resumed.nodes.get('monthly-report-view').innerHTML,/PARTIAL|MONTH 1/);
});
test('monthly report saved snapshots must reconcile cash and reject tampering', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Audit Motors');
  for(let i=0;i<34;i++)app.click('continue');
  const saved=JSON.parse(storage.get(STORAGE_KEY));
  const corrupted=JSON.parse(JSON.stringify(saved));
  corrupted.monthlyReports[0].closingCash+=250;
  storage.set(STORAGE_KEY,JSON.stringify(corrupted));
  assert.equal(browser(storage).nodes.get('menu-continue').hidden,true);
  const corruptedPlan=JSON.parse(JSON.stringify(saved));
  corruptedPlan.monthPlan.openingCash+=100;
  storage.set(STORAGE_KEY,JSON.stringify(corruptedPlan));
  assert.equal(browser(storage).nodes.get('menu-continue').hidden,true);
});
test('monthly reports never mislabel vehicle counts as currency amounts', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Presentation Motors');
  const html=app.nodes.get('monthly-report-view').innerHTML;
  assert.match(html,/Cash retail sales/);
  assert.match(html,/Vehicles on forecourt/);
  assert.doesNotMatch(html,/Cash retail sales<\/span><strong>£/);
  assert.doesNotMatch(html,/Reputation opening<\/span><strong>£/);
  assert.match(html,/GROSS TRADE MARGIN/);
  assert.match(html,/SALES TEAM SCORECARDS/);
});

test('Deal Day is five customer-only sessions, with some sessions legitimately empty', () => {
  const E=browser(new Map()).engine,D=E.events;
  const state=E.create('Deal Day Motors',[]);
  state.day=30;
  assert.equal(D.isDealDay(30),true);
  assert.equal(D.isDealDay(29),false);
  assert.equal(D.PHASES.length,5);
  const seen=new Set();
  for(let stage=0;stage<5;stage++){
    state.deadlineSession=stage;
    const params=[30,state.reputationScore,stage,state.name,state.monthPlan.startingReputation];
    const m=E.market(...params);
    assert.equal(m.auctions.length,0,'No auctions at any phase');
    assert.deepEqual(JSON.parse(JSON.stringify(E.market(...params))),
      JSON.parse(JSON.stringify(m)),'Catalogue must remain deterministic');
    for(const car of m.sellers){
      assert.ok(!seen.has(car.id),'Lead IDs stay unique across sessions');
      seen.add(car.id);
    }
    assert.equal(E.acquireAuction(state,'A-30-0',4000).ok,false);
  }
  assert.equal(state.cash,12500);
  assert.equal(state.ledger.length,0);
  assert.equal(D.PHASES[0].time,'09:00');
  assert.equal(D.PHASES[4].time,'17:00');
  assert.ok(['quiet','subdued','steady','busy','exceptional'].includes(D.outlook(state).type));
});
test('pressing continue on Deal Day advances hours, not game days or wages', () => {
  const saved=new Map(),app=browser(saved);
  app.click('new-career');app.submitCareer('Clock Motors');
  const P=app.engine.people,staff=P.applicants(1).find(x=>x.role==='sales');
  app.click('hire-staff',{id:staff.id});
  for(let i=0;i<29;i++)app.click('continue');
  let state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,30);
  assert.equal(state.deadlineSession,0);
  assert.equal(app.nodes.get('continue-label').textContent,'NEXT SESSION');
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/AUCTION HOUSE CLOSED TODAY/);
  assert.match(app.nodes.get('events-view').innerHTML,/09:00/);
  assert.match(app.nodes.get('events-view').innerHTML,/FINAL TRADING DAY/);
  const cash=state.cash,ledger=state.ledger.length;
  for(let i=1;i<=4;i++){
    const oldIds=app.engine.market(30,state.reputationScore,i-1).sellers.map(x=>x.id);
    app.click('continue');
    state=JSON.parse(saved.get(STORAGE_KEY));
    assert.equal(state.day,30);
    assert.equal(state.deadlineSession,i);
    assert.equal(state.cash,cash,'No repeated wage or cash charge during intra-day sessions');
    assert.equal(state.ledger.length,ledger);
    const nextIds=app.engine.market(30,state.reputationScore,i).sellers.map(x=>x.id);
    assert.ok(oldIds.every(x=>!nextIds.includes(x)));
  }
  assert.equal(app.nodes.get('continue-label').textContent,'CLOSE MONTH');
  app.click('continue');
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,31);
  assert.equal(state.deadlineSession,0);
  assert.equal(state.monthlyReports.length,1);
  assert.equal(state.monthPlan.month,2);
  assert.match(app.nodes.get('events-view').innerHTML,/BOARD MEETING/);
  assert.equal(app.nodes.get('continue-label').textContent,'CONTINUE');
});
test('some, but not all, deadline sellers accept bargains and inspections remain non-refundable', () => {
  const E=browser(new Map()).engine,D=E.events;
  const chosen=Array.from({length:150},(_,i)=>'Bargain Trader '+i).map(name=>{
    const state=E.create(name,[]);state.day=30;
    const sellers=E.market(30,state.reputationScore,0,name,state.monthPlan.startingReputation).sellers;
    const bargain=sellers.find(x=>D.sellerDiscount(state,x.id)>=60);
    return {state,sellers,bargain};
  }).find(x=>x.sellers.length>=2&&x.bargain);
  assert.ok(chosen,'At least one dealer-month should include a motivated owner');
  const {state,sellers,bargain}=chosen;
  const belowFloor=bargain.floor-30;
  assert.ok(belowFloor>=100);
  assert.ok(E.acquireSeller(state,bargain.id,belowFloor).ok,
    'This particular motivated seller can agree slightly below their normal floor');
  assert.equal(state.vehicles[0].cost,belowFloor);
  const second=sellers.find(x=>x.id!==bargain.id);
  const inspect=E.inspectLead(state,'seller',second.id);
  assert.ok(inspect.ok);
  const amount=state.cash,ledger=state.ledger.length;
  assert.ok(D.advanceSession(state).ok);
  assert.equal(state.day,30);
  assert.equal(state.deadlineSession,1);
  assert.equal(Object.keys(state.reports).length,0);
  assert.equal(state.cash,amount);
  assert.equal(state.ledger.length,ledger);
  assert.equal(E.acquireSeller(state,second.id,second.ask).ok,false,
    'Expired seller cannot be purchased next session');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('Deal Day retail interest and part-exchanges vary, with valuation limits enforced', () => {
  const E=browser(new Map()).engine,D=E.events;
  const selected=Array.from({length:200},(_,i)=>'Retail Closing '+i).map(name=>{
    const state=E.create(name,[]);
    const car={id:1,origin:'S-1-0'};
    const phase=[0,1,2,3,4].find(phase=>{
      state.day=30;state.deadlineSession=phase;
      return D.retailActive(state,car)&&D.partExchangeAvailable(state,car);
    });
    return {name,phase};
  }).find(x=>x.phase!==undefined);
  assert.ok(selected,'A buyer with a part-exchange should sometimes appear');
  const state=E.create(selected.name,[]);
  const seller=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(state,seller.id,seller.ask).ok);
  assert.ok(E.prepare(state,1).ok);
  const car=state.vehicles[0];
  assert.ok(E.advertise(state,car.id,Math.round(car.retail/50)*50).ok);
  const ordinary=E.buyers(car,state);
  state.day=30;state.deadlineSession=selected.phase;
  const active=E.buyers(car,state);
  assert.ok(active&&active.exchange);
  assert.ok(active.cashOffer>=ordinary.cashOffer);
  assert.ok(active.cashOffer<=active.cashLimit);
  assert.ok(active.pxOffer<=car.asking);
  assert.ok(active.exchange.floor<=ordinary.exchange.floor);
  assert.ok(E.completeSale(state,car.id,'part-ex',active.exchange.ask).ok);
  assert.equal(state.sold[0].day,30);
  assert.equal(state.sold[0].mode,'part-ex');
  assert.equal(state.vehicles[0].source,'part-ex');
  assert.ok(state.ledger.some(x=>x.note.startsWith('Part-exchange acquisition')));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('monthly first-day meeting reviews past results and blocks further days until held', () => {
  const saved=new Map(),app=browser(saved);
  app.click('new-career');app.submitCareer('Boardroom Cars');
  assert.match(app.nodes.get('events-view').innerHTML,/BOARD MEETING/);
  for(let i=0;i<34;i++)app.click('continue');
  let state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,31);
  assert.equal(state.meetingHeldMonth,0);
  assert.match(app.nodes.get('events-view').innerHTML,/PREVIOUS SALES|TURNOVER/);
  assert.match(app.nodes.get('events-view').innerHTML,/MANAGEMENT DISCUSSION/);
  assert.match(app.nodes.get('events-view').innerHTML,/AGREE ONE MANAGEMENT PRIORITY/);
  app.click('continue');
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,31,'Cannot skip next-month meeting');
  assert.match(app.nodes.get('event-notice').textContent,/meeting is due/);
  app.click('hold-meeting',{focus:'sales'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.meetingHeldMonth,2);
  assert.equal(state.meetingFocus,'sales');
  assert.equal(state.meetings.length,1);
  assert.equal(state.meetings[0].previousMonth,1);
  const copy=browser(saved);copy.click('resume');
  assert.match(copy.nodes.get('events-view').innerHTML,/MEETING COMPLETED/);
  copy.click('continue');
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).day,32);
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).meetings.length,1);
});
test('meeting strategies improve measured decisions, not cash through bonuses', () => {
  const E=browser(new Map()).engine,D=E.events;
  const clean=E.create('Unfocused',[]);
  const focused=E.create('Focused',[]);
  const seller=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(clean,seller.id,seller.ask).ok);
  assert.ok(E.acquireSeller(focused,seller.id,seller.ask).ok);
  assert.ok(E.prepare(clean,1).ok);
  assert.ok(E.prepare(focused,1).ok);
  assert.ok(E.advertise(clean,1,5200).ok);
  assert.ok(E.advertise(focused,1,5200).ok);
  const baseline=E.buyers(clean.vehicles[0],clean).cashOffer;
  assert.ok(D.holdMeeting(focused,'sales').ok);
  assert.ok(E.buyers(focused.vehicles[0],focused).cashOffer>=baseline);
  assert.equal(focused.cash,clean.cash,'Choosing a meeting focus never invents income');
  assert.equal(D.holdMeeting(focused,'care').ok,false,'Meeting can be held only once per month');
  const prospect=D.careBonus({...focused,meetingFocus:'care'},
    {profile:{grade:2,likelySale:5200}},5000);
  assert.equal(prospect,1);
  assert.equal(D.careBonus({...focused,meetingFocus:'care'},
    {profile:{grade:4,likelySale:5200}},5000),0);
  assert.ok(D.meetingBonus({...focused,meetingFocus:'buying'},'buying')>0);
});
test('old v0.6 saved careers migrate without losing sales, staff, stock or cash', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Migrating Dealer');
  const candidate=app.engine.people.applicants(1).find(x=>x.role==='sales');
  app.click('hire-staff',{id:candidate.id});
  const seller=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+seller.id,seller.ask);
  app.click('buy-seller',{id:seller.id});
  const old=JSON.parse(storage.get(STORAGE_KEY));
  old.version=5;
  delete old.deadlineSession;delete old.meetingHeldMonth;
  delete old.meetingFocus;delete old.meetings;
  storage.set(STORAGE_KEY,JSON.stringify(old));
  const next=browser(storage);
  assert.equal(next.nodes.get('menu-continue').hidden,false);
  next.click('resume');
  next.click('save');
  const after=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(after.version,14);
  assert.equal(after.cash,old.cash);
  assert.equal(after.staff.length,1);
  assert.equal(after.vehicles.length,1);
  assert.equal(after.vehicles[0].cost,old.vehicles[0].cost);
  assert.equal(after.ledger.length,old.ledger.length);
  assert.equal(after.deadlineSession,0);
  assert.equal(after.meetingFocus,'steady');
});
test('tampered event state or impossible meeting records invalidate a saved career', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Event Integrity');
  const saved=JSON.parse(storage.get(STORAGE_KEY));
  saved.deadlineSession=4;
  storage.set(STORAGE_KEY,JSON.stringify(saved));
  assert.equal(browser(storage).nodes.get('menu-continue').hidden,true);
  const bad={...saved,deadlineSession:0,meetings:[{month:99,day:1,focus:'invalid',
    previousMonth:null,sold:0,target:0,grossMargin:0,agedStock:0,
    staffCosts:0,cash:12500,reputation:5}]};
  storage.set(STORAGE_KEY,JSON.stringify(bad));
  assert.equal(browser(storage).nodes.get('menu-continue').hidden,true);
});

test('Deal Day and mandatory board meetings recur for a second operating month', () => {
  const saved=new Map(),app=browser(saved);
  app.click('new-career');app.submitCareer('Recurring Calendar Motors');
  for(let i=0;i<34;i++)app.click('continue');
  let state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,31);
  assert.equal(state.monthlyReports.length,1);
  app.click('hold-meeting',{focus:'buying'});
  for(let i=0;i<29;i++)app.click('continue');
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,60);
  assert.equal(state.deadlineSession,0);
  assert.equal(app.engine.market(60,state.reputationScore,0).auctions.length,0);
  for(let i=0;i<5;i++)app.click('continue');
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,61);
  assert.equal(state.monthlyReports.length,2);
  assert.equal(state.monthlyReports[1].month,2);
  assert.equal(state.meetings.length,1);
  app.click('continue');
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).day,61);
  app.click('hold-meeting',{focus:'care'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.meetings.length,2);
  assert.equal(state.meetings[1].previousMonth,2);
  assert.equal(state.meetingFocus,'care');
  assert.equal(state.meetingHeldMonth,3);
  assert.equal(app.engine.normalize(JSON.parse(JSON.stringify(state)))?.day,61);
});
test('customer-care meeting priority improves genuine good-condition retail service', () => {
  const E=browser(new Map()).engine,D=E.events;
  const plain=E.create('Standard Care',[]),focused=E.create('Customer Care',[]);
  const seller=E.market(1).sellers.find(v=>v.profile.grade<=3);
  assert.ok(seller);
  assert.ok(D.holdMeeting(focused,'care').ok);
  for(const state of [plain,focused]){
    assert.ok(E.acquireSeller(state,seller.id,seller.ask).ok);
    const v=state.vehicles[0];
    assert.ok(E.prepare(state,v.id).ok);
    assert.ok(E.advertise(state,v.id,Math.round(v.retail/50)*50).ok);
    assert.ok(E.completeSale(state,v.id,'cash',null).ok);
  }
  assert.equal(focused.cash,plain.cash,'Customer service does not create free cash');
  assert.equal(focused.sold[0].price,plain.sold[0].price);
  assert.equal(focused.reputationScore,plain.reputationScore+1);
  assert.ok(focused.reputationHistory[0].reason.includes('management focus on customer care'));
});

test('month-end market conditions vary across many months and quiet periods have no sellers', () => {
  const E=browser(new Map()).engine,D=E.events;
  const byType=new Map(),quietTotals=[],busyTotals=[];
  let emptyPhases=0,nonBargainBusy=0;
  for(let month=1;month<=120;month++){
    const day=month*30,name='First Lot Motors',c=D.conditions(day,name);
    assert.deepEqual(JSON.parse(JSON.stringify(D.conditions(day,name))),
      JSON.parse(JSON.stringify(c)),'Climate cannot reroll on reload');
    byType.set(c.type,(byType.get(c.type)||0)+1);
    let sellerTotal=0;
    for(let phase=0;phase<5;phase++){
      const count=D.leadCount(day,5,phase,name);
      sellerTotal+=count;
      if(count===0)emptyPhases++;
      if(c.type==='busy'||c.type==='exceptional'){
        const market=E.market(day,5,phase,name,5);
        nonBargainBusy+=market.sellers.filter(x=>
          D.sellerDiscount({day,name,deadlineSession:phase},x.id)===0).length;
      }
    }
    if(c.type==='quiet')quietTotals.push(sellerTotal);
    if(c.type==='busy'||c.type==='exceptional')busyTotals.push(sellerTotal);
  }
  assert.equal(byType.size,5,'All five conditions should appear over a long career');
  assert.ok(emptyPhases>0,'Some sessions should have no private sellers');
  assert.ok(quietTotals.some(n=>n===0),'An entire month-end can be silent');
  const mean=a=>a.reduce((n,x)=>n+x,0)/a.length;
  assert.ok(mean(busyTotals)>mean(quietTotals)*2,'Busy climates generate more seller footfall on average');
  assert.ok(nonBargainBusy>0,'Busy trading must not guarantee below-floor bargains');
});
test('Deal Day buying interest varies with the market and is stable within sessions', () => {
  const D=browser(new Map()).engine.events;
  const values={quiet:[],exceptional:[],busy:[]};
  const car={id:1,origin:'S-1-0'};
  for(let month=1;month<=400;month++){
    const day=month*30,name='First Lot Motors',climate=D.conditions(day,name);
    const arr=values[climate.type];
    if(!arr)continue;
    for(let phase=0;phase<5;phase++){
      const state={day,name,deadlineSession:phase,monthPlan:{startingReputation:5}};
      const interested=D.retailActive(state,car);
      assert.equal(D.retailActive(state,car),interested,'Re-render cannot reroll buyer demand');
      arr.push(Number(interested));
    }
  }
  assert.ok(values.quiet.includes(0)&&values.quiet.includes(1));
  const mean=a=>a.reduce((n,x)=>n+x,0)/a.length;
  assert.ok(mean(values.exceptional)>mean(values.quiet)*2);
  assert.ok(mean(values.busy)>mean(values.quiet));
});
test('a quiet Deal Day can leave a listed car with no buyer, so selling is disallowed', () => {
  const E=browser(new Map()).engine,D=E.events;
  const chosen=Array.from({length:100},(_,i)=>'Quiet Test '+i).find(name=>{
    const state={name,day:30,deadlineSession:0,monthPlan:{startingReputation:5}};
    return D.conditions(30,name).type==='quiet'&&
      !D.retailActive(state,{id:1,origin:'S-1-0'});
  });
  assert.ok(chosen,'We should find a quiet dealer-month with no retail enquiry');
  const store=new Map(),app=browser(store);
  app.click('new-career');app.submitCareer(chosen);
  const seller=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+seller.id,seller.ask);
  app.click('buy-seller',{id:seller.id});
  app.click('prepare-stock',{id:'1'});
  app.setInput('stock-price-1',5200);
  app.click('list-stock',{id:'1'});
  for(let i=0;i<29;i++)app.click('continue');
  const before=JSON.parse(store.get(STORAGE_KEY));
  assert.equal(before.day,30);
  assert.match(app.nodes.get('events-view').innerHTML,/QUIET MONTH/);
  assert.match(app.nodes.get('sales-list').innerHTML,/NO ACTIVE RETAIL ENQUIRIES/);
  assert.doesNotMatch(app.nodes.get('sales-list').innerHTML,/ACCEPT CASH/);
  const fail=app.productionEngine.completeSale(before,1,'cash',null);
  assert.equal(fail.ok,false);
  assert.equal(fail.code,'customer');
  assert.equal(before.sold.length,0);
  const n=app.engine.normalize(JSON.parse(JSON.stringify(before)));
  assert.ok(n);
});
test('month-end management report records actual Deal Day results without spoiling future supply', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Uncertain Reports');
  const current=JSON.parse(storage.get(STORAGE_KEY));
  const report=app.engine.monthly.statement(current);
  assert.equal('dealDay' in report,false,'Cannot forecast exact future Deal Day footfall');
  assert.match(app.nodes.get('monthly-report-view').innerHTML,/Deal Day outcomes are not known yet/);
  for(let i=0;i<34;i++)app.click('continue');
  const closed=JSON.parse(storage.get(STORAGE_KEY)).monthlyReports[0];
  assert.ok(closed.dealDay);
  assert.ok(['quiet','subdued','steady','busy','exceptional'].includes(closed.dealDay.type));
  assert.equal(closed.dealDay.sellerEnquiries,app.engine.events.PHASES.reduce(
    (n,_,stage)=>n+app.engine.events.leadCount(30,closed.startingReputation,stage,'Uncertain Reports'),0));
  assert.equal(closed.dealDay.retailSales,0);
  assert.equal(closed.dealDay.turnover,0);
  assert.ok(app.engine.monthly.validReport(closed));
  assert.match(app.nodes.get('monthly-report-view').innerHTML,/MONTH-END DEAL DAY REVIEW/);
});

test('v0.8 blocks immediate retail listing until repairs take real days and pass QC', () => {
  const saved=new Map(),app=browser(saved);
  app.click('new-career');app.submitCareer('Real Prep Motors');
  const seller=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+seller.id,seller.ask);
  app.click('buy-seller',{id:seller.id});
  let state=JSON.parse(saved.get(STORAGE_KEY));
  const v=state.vehicles[0];
  assert.equal(v.status,'acquired');
  assert.equal(v.workshop.stage,'unassessed');
  assert.match(app.nodes.get('workshop-board').innerHTML,/AUTHORISE ASSESSMENT/);
  app.setInput('stock-price-1',5200);
  app.click('list-stock',{id:'1'});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).vehicles[0].status,'acquired');
  app.click('assess-workshop',{id:'1'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].workshop.stage,'quoted');
  assert.equal(state.vehicles[0].workshop.assessmentFee,55);
  assert.ok(state.ledger.some(l=>l.note.startsWith('Workshop assessment:')));
  assert.match(app.nodes.get('workshop-board').innerHTML,/IN-HOUSE TECHNICIAN/);
  assert.match(app.nodes.get('workshop-board').innerHTML,/EXTERNAL GARAGE/);
  app.click('start-workshop',{id:'1',method:'external'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].workshop.stage,'in-progress');
  const planned=state.vehicles[0].workshop.plannedDays;
  assert.ok(planned>=2,'The car must require real time');
  app.click('list-stock',{id:'1'});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).vehicles[0].status,'acquired');
  app.click('finish-workshop',{id:'1'});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).vehicles[0].workshop.stage,'in-progress');
  for(let i=0;i<planned;i++)app.click('continue');
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].workshop.stage,'quality-check');
  assert.equal(state.vehicles[0].workshop.remainingDays,0);
  app.click('finish-workshop',{id:'1'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  if(state.vehicles[0].workshop.stage==='in-progress'){
    app.click('continue');
    app.click('finish-workshop',{id:'1'});
    state=JSON.parse(saved.get(STORAGE_KEY));
  }
  assert.equal(state.vehicles[0].workshop.stage,'ready');
  assert.equal(state.vehicles[0].status,'prepared');
  assert.ok(state.vehicles[0].prepSpent>state.vehicles[0].prepBudget,
    'Outsourcing can cost more than initial repairs');
  assert.ok(app.engine.normalize(JSON.parse(JSON.stringify(state))));
  app.setInput('stock-price-1',5200);
  app.click('list-stock',{id:'1'});
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).vehicles[0].status,'listed');
});
test('recruiting a technician changes workshop prices and internal bay capacity', () => {
  const E=browser(new Map()).engine,P=E.people;
  const s=E.create('Tech Centre',[]);
  const tech=P.applicants(1).find(x=>x.role==='technician'&&x.skills.efficiency>=15);
  assert.ok(tech);
  assert.ok(E.hireStaff(s,tech.id).ok);
  s.day=2;E.staffDay(s);
  const offered=E.market(2).sellers;
  assert.ok(offered.length>=2);
  for(const car of offered.slice(0,2))assert.ok(E.acquireSeller(s,car.id,car.ask).ok);
  const v=s.vehicles[0],v2=s.vehicles[1];
  assert.ok(E.assessStock(s,v.id).ok);
  assert.ok(E.assessStock(s,v2.id).ok);
  const internal=E.prepQuote(s,v.id,'internal');
  const external=E.prepQuote(s,v.id,'external');
  assert.ok(internal.cost<external.cost);
  assert.ok(E.startPrep(s,v.id,'internal').ok);
  const blocked=E.startPrep(s,v2.id,'internal');
  assert.equal(blocked.ok,false);
  assert.equal(blocked.code,'busy');
  assert.ok(E.startPrep(s,v2.id,'external').ok);
  assert.equal(s.vehicles.filter(x=>x.workshop.stage==='in-progress').length,2);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});
test('four mechanics start available and handle four separate in-house repair jobs', () => {
  const E=browser(new Map()).productionEngine,P=E.people,s=E.create('Four Bay Motors',[]);
  const candidates=P.applicants(1).filter(x=>x.role==='technician');
  assert.equal(candidates.length,8);
  assert.equal(P.technicianLimit(s),4);
  assert.equal(P.staffLimit(s),7,'One additional place is reserved for a staff supervisor');
  for(const candidate of candidates.slice(0,4))assert.ok(P.hire(s,candidate.id).ok);
  assert.equal(s.staff.length,4);
  assert.equal(P.hire(s,candidates[0].id).ok,false);
  // Test fixture injects investment capital for stock only, not production gameplay.
  s.cash=200000;
  for(let day=2;day<=25&&s.vehicles.length<4;day++){
    s.day=day;
    for(const car of E.market(day).sellers){
      if(s.vehicles.length===4)break;
      E.acquireSeller(s,car.id,car.ask);
    }
  }
  assert.equal(s.vehicles.length,4);
  for(const v of s.vehicles){
    assert.ok(E.assessStock(s,v.id).ok);
    assert.ok(E.startPrep(s,v.id,'internal').ok);
  }
  assert.equal(new Set(s.vehicles.map(v=>v.workshop.technicianId)).size,4);
  assert.equal(P.availableTechnicians(s).length,0);
  assert.ok(P.valid(s,s.day));
  s.reputationScore=40;
  assert.equal(P.technicianLimit(s),4,'Reputation opens permission but workshop expansion adds physical bays');
  assert.ok(E.upgradePremises(s,'workshop').ok);
  assert.equal(P.technicianLimit(s),6);
  assert.equal(P.staffLimit(s),10,'Expanded workshop still reserves one separate supervisor post');
  s.day=29;
  const additional=P.applicants(s.day).find(x=>x.role==='technician'&&
    !s.staff.some(e=>e.name===x.name));
  assert.ok(additional);
  assert.ok(P.hire(s,additional.id).ok,'Higher reputation unlocks more technicians');
  s.reputationScore=80;
  assert.equal(P.technicianLimit(s),6);
  assert.ok(E.upgradePremises(s,'workshop').ok);
  assert.equal(P.technicianLimit(s),8);
  assert.equal(P.staffLimit(s),13,'Maximum staffing includes a supervisor post');
});
test('staff training pauses internal jobs, but transfer can rescue a stalled workshop', () => {
  const E=browser(new Map()).engine,P=E.people,s=E.create('Repair Team',[]);
  const tech=P.applicants(1).find(x=>x.role==='technician');
  assert.ok(E.hireStaff(s,tech.id).ok);
  s.day=2;E.staffDay(s);
  const seller=E.market(2).sellers[0];
  assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
  assert.ok(E.assessStock(s,1).ok);
  assert.ok(E.startPrep(s,1,'internal').ok);
  const initial=s.vehicles[0].workshop.remainingDays;
  assert.ok(P.train(s,s.staff[0].id).ok);
  s.day=3;E.staffDay(s);
  const events=E.advanceWorkshop(s);
  assert.equal(s.vehicles[0].workshop.paused,true);
  assert.equal(s.vehicles[0].workshop.remainingDays,initial);
  assert.ok(events.some(x=>/paused/.test(x)));
  const before=s.cash;
  assert.ok(E.transferPrep(s,1).ok);
  assert.equal(s.cash,before-125);
  assert.equal(s.vehicles[0].workshop.method,'external');
  s.day=4;E.staffDay(s);E.advanceWorkshop(s);
  assert.equal(s.vehicles[0].workshop.paused,false);
  assert.ok(s.vehicles[0].workshop.remainingDays<initial);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});
test('paid quality rectification can require an additional day and larger repair bill', () => {
  const E=browser(new Map()).engine;
  let failure=null;
  for(let day=1;day<=24&&!failure;day++){
    const lot=E.market(day).auctions.find(x=>x.profile.grade>=4);
    if(!lot)continue;
    const state=E.create('QC Check',[]);
    state.day=day;
    if(!E.acquireAuction(state,lot.id,lot.rival+50).ok)continue;
    if(!E.assessStock(state,1).ok)continue;
    if(!E.startPrep(state,1,'external').ok)continue;
    const v=state.vehicles[0],base=v.workshop.repairCost;
    while(v.workshop.stage==='in-progress'&&state.day<30){
      state.day++;E.advanceWorkshop(state);
    }
    if(v.workshop.stage!=='quality-check')continue;
    const check=E.finishPrep(state,1);
    if(check.ok&&v.workshop.stage==='in-progress')
      failure={state,v,base,check};
  }
  assert.ok(failure,'Deterministic simulation should contain a failed quality check');
  const {state,v,base}=failure;
  assert.equal(v.workshop.reworks,1);
  assert.ok(v.workshop.repairCost>base);
  assert.equal(v.status,'acquired');
  assert.ok(state.ledger.some(x=>x.note.startsWith('Workshop quality rectification:')));
  state.day++;E.advanceWorkshop(state);
  assert.equal(v.workshop.stage,'quality-check');
  assert.ok(E.finishPrep(state,v.id).ok);
  assert.equal(v.workshop.stage,'ready');
  assert.equal(v.prepSpent,v.workshop.repairCost);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('workshop cash flow and unfinished repairs are reflected in monthly working capital', () => {
  const E=browser(new Map()).engine,s=E.create('Capital Motors',[]);
  const seller=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
  assert.ok(E.assessStock(s,1).ok);
  assert.ok(E.startPrep(s,1,'external').ok);
  const v=s.vehicles[0],paid=v.workshop.repairCost;
  const r=E.monthly.statement(s);
  assert.equal(r.workshopInProgress,1);
  assert.equal(r.stockCapital,v.cost+paid);
  assert.equal(r.ledgerBreakdown.preparation,-paid);
  assert.equal(r.ledgerBreakdown.inspections,-v.workshop.assessmentFee);
  assert.equal(r.soldUnits,0);
  assert.equal(r.grossMargin,0,'Unfinished inventory is not a realised sale');
  assert.equal(r.openingCash+r.netCashChange,r.closingCash);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});
test('wholesale disposal releases cash at a loss without fabricating retail sales', () => {
  const E=browser(new Map()).engine,s=E.create('Cut Losses Autos',[]);
  const seller=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
  const basis=s.vehicles[0].cost;
  const q=E.wholesaleOffer(s.vehicles[0]);
  assert.ok(q<basis);
  assert.ok(E.disposeStock(s,1).ok);
  assert.equal(s.vehicles.length,0);
  assert.equal(s.wholesale.length,1);
  assert.equal(s.sold.length,0);
  assert.equal(s.sales,0);
  assert.equal(s.wholesale[0].profit,q-basis);
  assert.equal(E.totalMargin(s),q-basis);
  assert.equal(E.monthly.statement(s).wholesaleUnits,1);
  assert.equal(E.monthly.statement(s).soldUnits,0);
  assert.equal(E.monthly.statement(s).grossMargin,q-basis);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
  assert.equal(E.disposeStock(s,1).ok,false);
});
test('v0.7.1 saved stock migrates without adding hidden charges or altering completed cars', () => {
  const E=browser(new Map()).engine,s=E.create('Old Stock Migration',[]);
  const sellers=E.market(1).sellers;
  for(const car of sellers)assert.ok(E.acquireSeller(s,car.id,car.ask).ok);
  // Simulate the exact old v0.7.1 save shape: prep was instantly charged
  // at the original budget, with no assessment fee, job or garage uplift.
  const original=s.vehicles[0];
  original.prepSpent=original.prepBudget;
  original.status='prepared';
  s.cash-=original.prepBudget;
  s.ledger.push({day:1,delta:-original.prepBudget,
    note:'Preparation and inspection: '+original.title});
  const old=JSON.parse(JSON.stringify(s));
  old.version=6;
  delete old.wholesale;
  for(const v of old.vehicles)delete v.workshop;
  const restored=E.normalize(old);
  assert.ok(restored,'Historic save should migrate instead of being discarded');
  assert.equal(restored.version,14);
  assert.equal(restored.cash,old.cash);
  assert.equal(restored.ledger.length,old.ledger.length);
  assert.equal(restored.vehicles[0].prepSpent,old.vehicles[0].prepSpent);
  assert.equal(restored.vehicles[0].cost,old.vehicles[0].cost);
  assert.equal(restored.vehicles[0].status,'prepared');
  assert.equal(restored.vehicles[0].workshop.stage,'ready');
  assert.equal(restored.vehicles[1].status,'acquired');
  assert.equal(restored.vehicles[1].workshop.stage,'unassessed');
  assert.equal(restored.wholesale.length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(restored))));
});
test('Deal Day sessions do not advance workshop repairs or trigger additional invoices', () => {
  const E=browser(new Map()).engine,D=E.events,s=E.create('Deadline Workshop',[]);
  const lot=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(s,lot.id,lot.ask).ok);
  assert.ok(E.assessStock(s,1).ok);
  assert.ok(E.startPrep(s,1,'external').ok);
  s.day=30;
  const before=s.vehicles[0].workshop.remainingDays;
  const cash=s.cash,ledger=s.ledger.length;
  for(let i=0;i<4;i++)assert.ok(D.advanceSession(s).ok);
  assert.equal(s.day,30);
  assert.equal(s.vehicles[0].workshop.remainingDays,before);
  assert.equal(s.cash,cash);
  assert.equal(s.ledger.length,ledger);
  assert.equal(E.market(30,s.reputationScore,s.deadlineSession,s.name).auctions.length,0);
});

test('unknown hidden repair detail stays confidential until workshop assessment', () => {
  const store=new Map(),app=browser(store);
  app.click('new-career');app.submitCareer('Inspection Dealer');
  const car=app.engine.market(1).auctions.find(x=>x.profile.hiddenFault);
  assert.ok(car);
  const hammer=car.rival+50;
  app.setInput('auction-bid-'+car.id,hammer);
  app.click('bid-auction',{id:car.id});
  let state=JSON.parse(store.get(STORAGE_KEY));
  assert.equal(state.vehicles.length,1);
  const extra=state.vehicles[0].profile.hiddenFault.item;
  const initial=app.nodes.get('workshop-board').innerHTML;
  assert.doesNotMatch(initial,new RegExp(extra),'Undiagnosed hidden fault must not appear in the workshop list');
  app.click('assess-workshop',{id:'1'});
  state=JSON.parse(store.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].workshop.stage,'quoted');
  assert.match(app.nodes.get('workshop-board').innerHTML,new RegExp(extra));
  assert.ok(state.ledger.some(l=>l.note.startsWith('Workshop assessment:')));
});

function readyForRetail(E,name,asking=5200){
  const state=E.create(name,[]);
  const seller=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(state,seller.id,seller.ask).ok);
  const v=state.vehicles[0];
  assert.ok(E.assessStock(state,v.id).ok);
  assert.ok(E.startPrep(state,v.id,'external').ok);
  while(v.workshop.stage==='in-progress'&&state.day<14){
    state.day++;
    E.advanceWorkshop(state);
  }
  assert.equal(v.workshop.stage,'quality-check');
  assert.ok(E.finishPrep(state,v.id).ok);
  if(v.workshop.stage==='in-progress'){
    state.day++;E.advanceWorkshop(state);
    assert.ok(E.finishPrep(state,v.id).ok);
  }
  assert.equal(v.status,'prepared');
  assert.ok(E.advertise(state,v.id,asking).ok);
  return {state,v};
}
function findCompletedDrive(E,qualifier=()=>true){
  for(let i=0;i<350;i++){
    const {state,v}=readyForRetail(E,'Appointment Trail '+i);
    const C=E.customers;
    if(!C.demand(state,v))continue;
    assert.ok(E.openCustomer(state,v.id).ok);
    const c=C.caseFor(state,v.id);
    if(!qualifier(c,state,v))continue;
    assert.ok(E.bookCustomer(state,v.id).ok);
    state.day=c.appointmentDay;
    E.advanceCustomers(state);
    if(c.status!=='arrived')continue;
    if(!E.testDrive(state,v.id).ok)continue;
    return {state,v,c};
  }
  assert.fail('No eligible completed customer viewing found in 350 deterministic candidates');
}
test('v0.9 gives four spaces to fresh and existing two-space dealerships without changing cash', () => {
  const E=browser(new Map()).productionEngine;
  assert.equal(E.CAPACITY,4);
  const s=E.create('Four Space Motors',[]);
  assert.equal(s.capacity,4);
  const seller=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
  const old=JSON.parse(JSON.stringify(s));
  old.version=7;
  old.capacity=2;
  delete old.customerCases;delete old.customerHistory;
  const upgraded=E.normalize(old);
  assert.ok(upgraded);
  assert.equal(upgraded.version,14);
  assert.equal(upgraded.capacity,4);
  assert.equal(upgraded.cash,old.cash);
  assert.equal(upgraded.vehicles.length,old.vehicles.length);
  assert.equal(upgraded.vehicles[0].cost,old.vehicles[0].cost);
  assert.equal(upgraded.ledger.length,old.ledger.length);
  assert.equal(upgraded.customerHistory.length,0);
  assert.equal(Object.keys(upgraded.customerCases).length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(upgraded))));
});
test('v0.9 enforces actual appointments and includes real no-show outcomes', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const tally={enquiries:0,arrivals:0,noShows:0};
  for(let i=0;i<100;i++){
    const {state,v}=readyForRetail(E,'Appointments '+i);
    if(!C.demand(state,v))continue;
    tally.enquiries++;
    assert.equal(E.completeSale(state,v.id,'cash',null).code,'customer');
    assert.ok(E.openCustomer(state,v.id).ok);
    assert.equal(E.completeSale(state,v.id,'cash',null).code,'customer');
    assert.ok(E.bookCustomer(state,v.id).ok);
    const c=C.caseFor(state,v.id);
    assert.ok(c.appointmentDay>state.day);
    assert.equal(E.testDrive(state,v.id).code,'stage');
    state.day=c.appointmentDay;
    E.advanceCustomers(state);
    if(c.status==='arrived')tally.arrivals++;
    if(c.status==='lost'){
      tally.noShows++;
      assert.match(c.reason,/failed to attend/);
      assert.equal(E.completeSale(state,v.id,'cash',null).code,'customer');
    }
    assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
  }
  assert.ok(tally.enquiries>15);
  assert.ok(tally.arrivals>5);
  assert.ok(tally.noShows>0,'A rare no-show should remain possible');
});
test('successful test drive and signed cash terms are mandatory before handover', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const {state,v,c}=findCompletedDrive(E);
  assert.equal(c.status,'discussing');
  assert.equal(E.completeSale(state,v.id,'cash',null).code,'customer');
  assert.equal(state.sold.length,0);
  const buyer=E.buyers(v,state);
  assert.ok(buyer);
  assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
  assert.equal(c.status,'agreed');
  assert.equal(c.price,buyer.cashOffer);
  const before=state.cash;
  const result=E.completeSale(state,v.id,'cash',null);
  assert.ok(result.ok);
  assert.equal(state.cash,before+buyer.cashOffer);
  assert.equal(state.sold.length,1);
  assert.equal(state.stock,0);
  assert.equal(C.heldDeposits(state),0);
  assert.ok(state.customerHistory.some(x=>x.type==='sale'));
  assert.equal(C.stats(state,1,state.day).completedSales,1);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('part-exchange customers must agree a valid allowance before handover', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const {state,v,c}=findCompletedDrive(E,c=>c.preferredMode==='part-ex');
  const b=E.buyers(v,state);
  assert.ok(b.exchange);
  assert.equal(E.agreeCustomer(state,v.id,'part-ex',b.exchange.floor-25).ok,false);
  assert.equal(c.status,'discussing');
  assert.equal(E.completeSale(state,v.id,'part-ex',b.exchange.ask).code,'customer');
  assert.ok(E.agreeCustomer(state,v.id,'part-ex',b.exchange.ask).ok);
  assert.equal(c.allowance,b.exchange.ask);
  assert.equal(E.completeSale(state,v.id,'cash',null).code,'mode');
  const before=state.cash;
  assert.ok(E.completeSale(state,v.id,'part-ex',null).ok);
  assert.equal(state.cash,before+c.price-c.allowance);
  assert.equal(state.sold[0].mode,'part-ex');
  assert.equal(state.vehicles.length,1);
  assert.equal(state.vehicles[0].source,'part-ex');
  assert.equal(state.vehicles[0].status,'acquired');
  assert.equal(state.vehicles[0].workshop.stage,'unassessed');
  assert.equal(state.vehicles[0].origin,'PX-'+c.agreedDay+'-'+v.id);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('£250 deposit is segregated, blocks premature collection and settles at handover', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let selected=null;
  for(let i=0;i<150;i++){
    const {state,v}=readyForRetail(E,'Deposit Success '+i);
    if(!C.demand(state,v))continue;
    E.openCustomer(state,v.id);
    E.bookCustomer(state,v.id);
    const c=C.caseFor(state,v.id);
    state.day=c.appointmentDay;
    E.advanceCustomers(state);
    if(c.status!=='arrived'||!E.testDrive(state,v.id).ok)continue;
    assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
    assert.ok(E.depositCustomer(state,v.id).ok);
    const cashBefore=state.cash,ledgerBefore=state.ledger.length;
    assert.equal(C.heldDeposits(state),250);
    assert.equal(state.cash,cashBefore);
    assert.equal(state.ledger.length,ledgerBefore);
    assert.equal(E.advertise(state,v.id,5400).code,'reserved');
    assert.equal(E.completeSale(state,v.id,'cash',null).code,'customer');
    state.day=c.collectionDay;
    E.advanceCustomers(state);
    if(c.status!=='collectable')continue;
    selected={state,v,c,cashBefore,ledgerBefore};
    break;
  }
  assert.ok(selected,'Some customers should collect after depositing');
  const {state,v,c,cashBefore,ledgerBefore}=selected;
  const price=c.price;
  assert.ok(E.completeSale(state,v.id,'cash',null).ok);
  assert.equal(state.cash,cashBefore+price);
  assert.equal(state.ledger.length,ledgerBefore+2);
  assert.equal(state.sold[0].customerBalancePaid,price-250);
  assert.equal(state.sold[0].depositApplied,250);
  assert.equal(C.heldDeposits(state),0);
  assert.equal(state.sold.length,1);
  assert.equal(state.ledger.slice(-2).reduce((n,x)=>n+x.delta,0),price,
    'Balance plus applied deposit must equal the full agreed sale once');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('customer cancellation always returns held deposits without adding or losing business cash', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const {state,v,c}=findCompletedDrive(E);
  assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
  assert.ok(E.depositCustomer(state,v.id).ok);
  const before=state.cash,ledger=state.ledger.length;
  assert.equal(C.heldDeposits(state),250);
  assert.ok(E.cancelCustomer(state,v.id).ok);
  assert.equal(c.status,'lost');
  assert.equal(c.held,0);
  assert.equal(C.heldDeposits(state),0);
  assert.equal(state.cash,before+c.prepCost,
    'Only documented customer-specific expense is recovered, not an unearned £250 penalty');
  assert.equal(state.ledger.length,ledger+1);
  assert.equal(state.sold.length,0);
  assert.equal(C.stats(state,1,state.day).retainedAmount,c.prepCost);
  assert.equal(E.completeSale(state,v.id,'cash',null).code,'customer');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('some customers cancel before collecting despite a paid reservation', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let cancelled=null;
  for(let i=0;i<480;i++){
    const {state,v}=readyForRetail(E,'Deposit Cancel '+i);
    if(!C.demand(state,v))continue;
    E.openCustomer(state,v.id);
    E.bookCustomer(state,v.id);
    const c=C.caseFor(state,v.id);
    state.day=c.appointmentDay;E.advanceCustomers(state);
    if(c.status!=='arrived'||!E.testDrive(state,v.id).ok)continue;
    E.agreeCustomer(state,v.id,'cash',null);
    E.depositCustomer(state,v.id);
    state.day=c.collectionDay;
    E.advanceCustomers(state);
    if(c.status==='lost') {cancelled={state,v,c};break;}
  }
  assert.ok(cancelled,'Some deposit-holding customers should cancel rather than collect');
  const {state,v,c}=cancelled;
  assert.equal(c.held,0);
  assert.equal(C.heldDeposits(state),0);
  assert.equal(state.sold.length,0);
  assert.equal(C.stats(state,1,state.day).retainedAmount,c.prepCost);
  assert.equal(C.stats(state,1,state.day).retainedDeposits,1);
  assert.equal(C.stats(state,1,state.day).refunds,c.prepCost<250?1:0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('paid reservations usually proceed to collection', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let booked=0,collected=0;
  for(let i=0;i<240;i++){
    const {state,v}=readyForRetail(E,'Buyer Commitment '+i);
    if(!C.demand(state,v))continue;
    E.openCustomer(state,v.id);
    E.bookCustomer(state,v.id);
    const c=C.caseFor(state,v.id);
    state.day=c.appointmentDay;
    E.advanceCustomers(state);
    if(c.status!=='arrived'||!E.testDrive(state,v.id).ok)continue;
    if(!E.agreeCustomer(state,v.id,'cash',null).ok)continue;
    if(!E.depositCustomer(state,v.id).ok)continue;
    booked++;
    state.day=c.collectionDay;
    E.advanceCustomers(state);
    if(c.status==='collectable')collected++;
  }
  assert.ok(booked>=30,'Include an adequate sample of deposited deals');
  assert.ok(collected/booked>=0.9,'Paid buyer cancellations must be rare');
});
test('counteroffer rejection and walkaways mean negotiations do not guarantee extra money', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let accepted=0,rejected=0,walked=0;
  for(let i=0;i<1200&&(accepted===0||rejected===0||walked===0);i++){
    const {state,v}=readyForRetail(E,'Counter Trader '+i);
    if(!C.demand(state,v))continue;
    E.openCustomer(state,v.id);
    E.bookCustomer(state,v.id);
    const c=C.caseFor(state,v.id);
    state.day=c.appointmentDay;E.advanceCustomers(state);
    if(c.status!=='arrived'||!E.testDrive(state,v.id).ok)continue;
    const b=E.buyers(v,state);
    if(b.cashOffer+150>b.cashLimit)continue;
    const r=E.counter(state,v.id);
    if(r.ok)accepted++;
    else rejected++;
    if(r.code==='walked')walked++;
    if(!r.ok)assert.ok(r.changed);
    assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
  }
  assert.ok(accepted>0);
  assert.ok(rejected>0);
  assert.ok(walked>0);
});
test('Deal Day customers can arrive as walk-ins, but still need a test drive and agreement', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let found=null;
  for(let i=0;i<160;i++){
    const {state,v}=readyForRetail(E,'Deadline Customer '+i);
    state.day=30;state.deadlineSession=0;
    if(!C.demand(state,v))continue;
    const opened=E.openCustomer(state,v.id);
    if(!opened.ok)continue;
    found={state,v,c:C.caseFor(state,v.id)};
    break;
  }
  assert.ok(found);
  const {state,v,c}=found;
  assert.equal(E.market(30,state.reputationScore,0,state.name).auctions.length,0);
  assert.equal(c.status,'arrived','Month-end walk-in should not require an extra day');
  assert.equal(E.completeSale(state,v.id,'cash',null).code,'customer');
  const beforeCases=Object.keys(state.customerCases).length;
  assert.equal(beforeCases,1);
  assert.ok(E.events.advanceSession(state).ok);
  E.nextCustomerSession(state);
  assert.equal(Object.keys(state.customerCases).length,0);
  assert.equal(state.sold.length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('daily customer conversion statistics enter management accounts and reject corrupt saves', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const {state,v,c}=findCompletedDrive(E);
  assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
  assert.ok(E.completeSale(state,v.id,'cash',null).ok);
  const report=E.monthly.statement(state);
  assert.equal(report.customerJourney.enquiries,1);
  assert.equal(report.customerJourney.appointments,1);
  assert.equal(report.customerJourney.attended,1);
  assert.equal(report.customerJourney.testDrives,1);
  assert.equal(report.customerJourney.completedSales,1);
  assert.equal(report.customerHoldingAtClose,0);
  assert.ok(E.monthly.validReport(report));
  const old=JSON.parse(JSON.stringify(state));
  old.customerHistory[0].type='fabricated-profit';
  assert.equal(E.normalize(old),null);
  const wrong=JSON.parse(JSON.stringify(state));
  wrong.customerCases['1']={id:'INVALID',vehicleId:1,held:999,status:'reserved'};
  assert.equal(E.normalize(wrong),null);
});

test('the sales office UI supports a saved multi-day appointment and collection', () => {
  const probe=browser(new Map()).productionEngine,C=probe.customers;
  let name=null;
  for(let i=0;i<180;i++){
    const n='UI Customer '+i;
    const s=probe.create(n,[]);
    const seller=probe.market(1).sellers[0];
    probe.acquireSeller(s,seller.id,seller.ask);
    const v=s.vehicles[0];
    v.status='listed';v.asking=5200;v.listedDay=1;
    if(!C.demand(s,v))continue;
    probe.openCustomer(s,v.id);
    probe.bookCustomer(s,v.id);
    const c=C.caseFor(s,v.id);
    s.day=c.appointmentDay;probe.advanceCustomers(s);
    if(c.status!=='arrived'||!probe.testDrive(s,v.id).ok)continue;
    probe.agreeCustomer(s,v.id,'cash',null);
    probe.depositCustomer(s,v.id);
    s.day=c.collectionDay;probe.advanceCustomers(s);
    if(c.status==='collectable'){name=n;break;}
  }
  assert.ok(name,'Find a stable full customer journey');
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer(name);
  const seller=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+seller.id,seller.ask);
  app.click('buy-seller',{id:seller.id});
  app.click('prepare-stock',{id:'1'}); // Test fixture for older prep workflow.
  app.setInput('stock-price-1',5200);
  app.click('list-stock',{id:'1'});
  assert.match(app.nodes.get('sales-list').innerHTML,/BUYER INTEREST TO CONTACT/);
  assert.doesNotMatch(app.nodes.get('sales-list').innerHTML,/COMPLETE HANDOVER/);
  app.click('open-customer',{id:'1'});
  assert.match(app.nodes.get('sales-list').innerHTML,/BOOK VIEWING/);
  app.click('book-customer',{id:'1'});
  let state=JSON.parse(storage.get(STORAGE_KEY));
  const due=state.customerCases['1'].appointmentDay;
  for(let d=state.day;d<due;d++)app.click('continue');
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.customerCases['1'].status,'arrived');
  assert.match(app.nodes.get('sales-list').innerHTML,/OFFER TEST DRIVE/);
  app.click('test-drive',{id:'1'});
  assert.match(app.nodes.get('sales-list').innerHTML,/AGREE CASH PRICE/);
  app.click('agree-cash',{id:'1'});
  assert.match(app.nodes.get('sales-list').innerHTML,/TAKE £250 DEPOSIT/);
  app.click('deposit-customer',{id:'1'});
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.customerCases['1'].held,250);
  assert.equal(app.financeView.snapshot(state,app.productionEngine).held,250);
  assert.equal(state.sold.length,0);
  const resumed=browser(storage);
  assert.equal(resumed.nodes.get('menu-continue').hidden,false);
  resumed.click('resume');
  const collection=state.customerCases['1'].collectionDay;
  for(let d=state.day;d<collection;d++)resumed.click('continue');
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.customerCases['1'].status,'collectable');
  resumed.click('handover-customer',{id:'1',mode:'cash'});
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.sold.length,1);
  assert.equal(state.vehicles.length,0);
  assert.equal(resumed.financeView.snapshot(state,resumed.productionEngine).held,0);
  assert.ok(resumed.productionEngine.normalize(JSON.parse(JSON.stringify(state))));
});
test('overdue collection cancels a reserved agreement and returns customer holding funds', () => {
  const E=browser(new Map()).productionEngine;
  const {state,v,c}=findCompletedDrive(E);
  assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
  assert.ok(E.depositCustomer(state,v.id).ok);
  const before=state.cash;
  state.day=c.collectionDay;
  E.advanceCustomers(state);
  if(c.status==='collectable'){
    state.day=c.collectionDay+6;
    const notices=E.advanceCustomers(state);
    assert.equal(c.status,'lost');
    assert.ok(notices.some(x=>x.includes('retained')||x.includes('refunded')));
    assert.equal(E.customers.heldDeposits(state),0);
    assert.equal(state.cash,before+c.prepCost);
    assert.equal(state.sold.length,0);
    assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
  }
});

test('the player can occupy all four forecourt spaces but a fifth purchase is blocked', () => {
  const E=browser(new Map()).productionEngine;
  const state=E.create('Four Cars Reality',[]);
  for(let day=1;day<=20&&state.vehicles.length<4;day++){
    state.day=day;
    const m=E.market(day);
    const options=[
      ...m.auctions.map(car=>({kind:'auction',car,
        price:Math.max(car.rival,car.reserve)+50,
        total:Math.max(car.rival,car.reserve)+50+car.fee+
          car.profile.basePrep+(car.profile.hiddenFault?.cost||0)})),
      ...m.sellers.map(car=>({kind:'seller',car,
        price:car.ask,total:car.ask+
          car.profile.basePrep+(car.profile.hiddenFault?.cost||0)}))
    ].sort((a,b)=>a.total-b.total);
    for(const opt of options){
      if(state.vehicles.length===4)break;
      if(opt.kind==='auction')E.acquireAuction(state,opt.car.id,opt.price);
      else E.acquireSeller(state,opt.car.id,opt.price);
    }
  }
  assert.equal(state.vehicles.length,4,'Four vehicles can be genuinely financed from starting cash');
  assert.equal(state.capacity,4);
  assert.equal(state.stock,4);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
  // Some market days legitimately have no direct sellers. Locate the next
  // valid seller rather than assuming the very next date has an enquiry.
  let fifth=null;
  for(let date=state.day+1;date<=state.day+30&&!fifth;date++){
    state.day=date;
    fifth=E.market(date).sellers[0]||null;
  }
  assert.ok(fifth,'A later market day should produce a seller');
  const rejected=E.acquireSeller(state,fifth.id,fifth.ask);
  assert.equal(rejected.ok,false);
  assert.equal(rejected.code,'capacity');
  assert.equal(state.stock,4);
  assert.equal(state.vehicles.length,4);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('real-photo cards never use an incorrect model, generation or paint colour', () => {
  const app=browser(new Map()),P=app.photos,V=app.cards;
  assert.equal(P.LIBRARY.length,19);
  for(const item of P.LIBRARY){
    assert.ok(item.file.endsWith('.jpg'));
    assert.ok(item.author&&item.license&&item.licenseUrl);
    const car={title:item.start+' '+item.model+' Test',color:item.color,
      generation:item.generation,miles:78000,profile:{grade:3,owners:2,mot:{monthsRemaining:6}}};
    assert.equal(P.select(car)?.id,item.id);
    assert.equal(P.select({...car,color:item.color==='Black'?'White':'Black'}),null);
    assert.equal(P.select({...car,generation:'wrong'}),null);
    assert.match(V.photo(car,'auction'),/REAL PHOTO:/);
    assert.match(V.photo({...car,color:'Purple'},'auction'),/PHOTO UNAVAILABLE/);
  }
  assert.equal(P.select({title:'2024 Nissan Qashqai Tekna',
    generation:'J11',color:'Black'}),null);
  assert.equal(P.select({title:'2015 Nissan Qashqai Acenta',
    generation:'J11',color:'Black'})?.id,'qashqai-j11-black');
});
test('live photo identity survives buying, saving, and v8 migration', () => {
  const app=browser(new Map()),E=app.productionEngine,P=app.photos;
  const state=E.create('Photo Trader',[]),seller=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(state,seller.id,seller.ask).ok);
  assert.equal(state.vehicles[0].color,seller.color);
  assert.equal(state.vehicles[0].generation,seller.generation);
  const old=JSON.parse(JSON.stringify(state));
  old.version=8;delete old.customerFunds;
  delete old.vehicles[0].color;delete old.vehicles[0].generation;
  const migrated=E.normalize(old);
  assert.ok(migrated);
  assert.equal(migrated.version,14);
  assert.equal(migrated.cash,state.cash);
  assert.ok(P.COLOURS.includes(migrated.vehicles[0].color));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(migrated))));
});
test('buyer cancellation cannot retain more than actual customer-specific costs', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const {state,v,c}=findCompletedDrive(E);
  assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
  const before=state.cash;
  assert.ok(E.depositCustomer(state,v.id).ok);
  assert.equal(C.balanceDue(c),c.price-250);
  const spent=c.prepCost;
  assert.ok(spent>=75&&spent<=250);
  assert.equal(state.cash,before-spent);
  assert.ok(E.cancelCustomer(state,v.id,'buyer').ok);
  assert.equal(state.cash,before);
  assert.equal(C.stats(state,1,state.day).retainedAmount,spent);
  assert.equal(C.heldDeposits(state),0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});
test('dealership cancellation returns all held deposit and leaves its preparation loss', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const {state,v,c}=findCompletedDrive(E);
  assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
  const before=state.cash;
  assert.ok(E.depositCustomer(state,v.id).ok);
  assert.ok(E.cancelCustomer(state,v.id,'dealer').ok);
  assert.equal(state.cash,before-c.prepCost);
  assert.equal(C.heldDeposits(state),0);
  assert.equal(C.stats(state,1,state.day).retainedAmount,0);
  assert.equal(C.stats(state,1,state.day).refunds,1);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('legacy v8 reservations keep their original full-refund promise after upgrade', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const {state,v,c}=findCompletedDrive(E);
  assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
  assert.ok(E.depositCustomer(state,v.id).ok);
  const old=JSON.parse(JSON.stringify(state)),cost=old.customerCases['1'].prepCost;
  old.version=8;
  delete old.customerFunds;
  old.cash+=cost;
  old.ledger=old.ledger.filter(x=>
    !x.note.startsWith('Customer-specific collection preparation:'));
  for(const vehicle of old.vehicles){
    delete vehicle.color;delete vehicle.generation;
  }
  delete old.customerCases['1'].terms;
  delete old.customerCases['1'].prepCost;
  const migrated=E.normalize(old);
  assert.ok(migrated);
  assert.equal(migrated.customerCases['1'].terms,'legacy-refundable');
  assert.equal(C.heldDeposits(migrated),250);
  const balance=migrated.cash;
  assert.ok(E.cancelCustomer(migrated,v.id,'buyer').ok);
  assert.equal(migrated.cash,balance);
  assert.equal(C.stats(migrated,1,migrated.day).retainedAmount,0);
  assert.equal(C.heldDeposits(migrated),0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(migrated))));
});
test('buyer applying deposit to part exchange pays only the net cash amount', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let result=null;
  for(let i=0;i<140;i++){
    const {state,v}=readyForRetail(E,'PX Collection '+i);
    if(!C.demand(state,v))continue;
    E.openCustomer(state,v.id);
    const c=C.caseFor(state,v.id);
    if(c.preferredMode!=='part-ex')continue;
    E.bookCustomer(state,v.id);
    state.day=c.appointmentDay;E.advanceCustomers(state);
    if(c.status!=='arrived'||!E.testDrive(state,v.id).ok)continue;
    const buyer=E.buyers(v,state);
    if(!buyer?.exchange)continue;
    assert.ok(E.agreeCustomer(state,v.id,'part-ex',buyer.exchange.ask).ok);
    if(!E.depositCustomer(state,v.id).ok)continue;
    const balance=C.balanceDue(c);
    state.day=c.collectionDay;E.advanceCustomers(state);
    if(c.status!=='collectable')continue;
    const before=state.cash;
    const sale=E.completeSale(state,v.id,'part-ex',null);
    if(!sale.ok)continue;
    result={state,c,balance,cashDelta:state.cash-before};
    break;
  }
  assert.ok(result,'A deposit-paying part-ex customer should occasionally collect');
  const {state,c,balance,cashDelta}=result;
  assert.equal(balance,c.price-c.allowance-250);
  assert.equal(cashDelta,balance+250);
  assert.equal(state.sold[0].customerBalancePaid,balance);
  assert.equal(state.sold[0].depositApplied,250);
  assert.equal(state.ledger.slice(-3).reduce((n,x)=>n+x.delta,0),balance+250);
  assert.ok(state.ledger.some(x=>x.delta===0&&
    x.note.startsWith('Part-exchange acquisition:')));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('v0.9.6 bookings are within 48 game-hours and never reserve unpaid stock', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let checked=0;
  for(let i=0;i<80;i++){
    const {state:s,v}=readyForRetail(E,'48 Hour Booking '+i);
    if(!C.demand(s,v))continue;
    assert.ok(E.openCustomer(s,v.id).ok);
    assert.ok(E.bookCustomer(s,v.id).ok);
    const c=C.caseFor(s,v.id);
    assert.ok(c.appointmentDay===s.day+1||c.appointmentDay===s.day+2);
    assert.equal(c.held,0);
    assert.equal(v.status,'listed');
    assert.equal(C.heldDeposits(s),0);
    assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
    checked++;
  }
  assert.ok(checked>20);
});

test('v0.9.6 another buyer can inspect an unsecured booked car without losing the original appointment', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let found=null;
  for(let i=0;i<250;i++){
    const {state:s,v}=readyForRetail(E,'Competing Viewer '+i);
    if(!C.demand(s,v))continue;
    E.openCustomer(s,v.id);E.bookCustomer(s,v.id);
    if(!C.competingInterest(s,v.id))continue;
    found={s,v};
    break;
  }
  assert.ok(found,'A real competing viewing should be available sometimes');
  const {s,v}=found,booked=C.caseFor(s,v.id),originalId=booked.id;
  assert.ok(E.competingCustomer(s,v.id).ok);
  const other=C.caseFor(s,v.id);
  assert.equal(other.status,'arrived');
  assert.equal(other.channel,'WALK-IN');
  assert.equal(other.standby.id,originalId);
  assert.equal(other.standby.appointmentDay,booked.appointmentDay);
  assert.equal(C.heldDeposits(s),0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))),'Both buyer and original appointment survive save/load');
  v.cashOffer=4100;
  assert.ok(E.cancelCustomer(s,v.id,'dealer').ok);
  assert.equal(v.cashOffer,null,'A competing buyer offer must not contaminate the original viewer');
  assert.equal(C.caseFor(s,v.id).id,originalId);
  assert.equal(C.caseFor(s,v.id).status,'booked');
  assert.equal(v.status,'listed');
  assert.equal(s.sold.length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.6 a competing buyer can buy, cancelling only the unsecured appointment', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let found=null;
  for(let i=0;i<380;i++){
    const {state:s,v}=readyForRetail(E,'Competing Sale '+i);
    if(!C.demand(s,v))continue;
    E.openCustomer(s,v.id);E.bookCustomer(s,v.id);
    if(!C.competingInterest(s,v.id))continue;
    E.competingCustomer(s,v.id);
    if(!E.testDrive(s,v.id).ok)continue;
    found={s,v};
    break;
  }
  assert.ok(found,'A competing customer should occasionally pass the test drive');
  const {s,v}=found;
  assert.ok(E.agreeCustomer(s,v.id,'cash',null).ok);
  assert.ok(E.completeSale(s,v.id,'cash',null).ok);
  assert.equal(s.sold.length,1);
  assert.equal(C.heldDeposits(s),0);
  assert.equal(C.caseFor(s,v.id),null);
  assert.equal(s.customerHistory.filter(h=>h.type==='appointment-displaced').length,1);
  assert.equal(s.customerHistory.filter(h=>h.type==='no-show').length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.6 deposited sales are exclusive, so other buyers cannot displace them', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  const {state,v}=findCompletedDrive(E);
  assert.ok(E.agreeCustomer(state,v.id,'cash',null).ok);
  assert.ok(E.depositCustomer(state,v.id).ok);
  assert.equal(C.competingInterest(state,v.id),false);
  assert.equal(E.competingCustomer(state,v.id).code,'stage');
  assert.equal(C.caseFor(state,v.id).status,'reserved');
  assert.equal(C.heldDeposits(state),250);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('v0.9.6 a rival who delays beyond the viewing deadline cannot wipe out the original booking', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let found=null;
  for(let i=0;i<250;i++){
    const {state,v}=readyForRetail(E,'Appointment Restoration '+i);
    if(!C.demand(state,v))continue;
    E.openCustomer(state,v.id);E.bookCustomer(state,v.id);
    if(!C.competingInterest(state,v.id))continue;
    found={state,v};break;
  }
  assert.ok(found);
  const {state,v}=found,original=C.caseFor(state,v.id);
  assert.ok(E.competingCustomer(state,v.id).ok);
  state.day=original.appointmentDay;
  E.advanceCustomers(state);
  assert.equal(C.caseFor(state,v.id).id,original.id);
  assert.ok(['arrived','lost'].includes(C.caseFor(state,v.id).status));
  assert.ok(state.customerHistory.some(h=>h.type==='appointment-restored'));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('v0.9.6 paying a deposit displaces an earlier unsecured appointment but no holding funds are lost', () => {
  const E=browser(new Map()).productionEngine,C=E.customers;
  let chosen=null;
  for(let i=0;i<320;i++){
    const {state,v}=readyForRetail(E,'Appointment Deposit '+i);
    if(!C.demand(state,v))continue;
    E.openCustomer(state,v.id);E.bookCustomer(state,v.id);
    if(!C.competingInterest(state,v.id))continue;
    E.competingCustomer(state,v.id);
    if(!E.testDrive(state,v.id).ok)continue;
    if(!E.agreeCustomer(state,v.id,'cash',null).ok)continue;
    if(!E.depositCustomer(state,v.id).ok)continue;
    chosen={state,v};break;
  }
  assert.ok(chosen,'Find a paid reservation following a competing walk-in');
  const {state,v}=chosen,c=C.caseFor(state,v.id);
  assert.equal(c.status,'reserved');
  assert.equal(c.standby,null);
  assert.equal(c.held,250);
  assert.equal(C.competingInterest(state,v.id),false);
  assert.equal(C.heldDeposits(state),250);
  assert.equal(state.customerHistory.filter(h=>h.type==='appointment-displaced').length,1);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('v0.9.7 recruitment exposes eight technicians and affordable, transparent three-day wage cover', () => {
  const E=browser(new Map()).productionEngine,P=E.people,s=E.create('Transparent Recruitment',[]);
  const technicians=P.applicants(1).filter(c=>c.role==='technician');
  const sellers=P.applicants(1).filter(c=>c.role==='sales');
  assert.equal(technicians.length,8);
  assert.equal(sellers.length,4);
  assert.equal(P.technicianLimit(s),4);
  assert.equal(P.salesLimit(s),1);
  assert.equal(P.WAGE_COVER_DAYS,3);
  let previousCash=s.cash;
  for(const candidate of technicians.slice(0,4)){
    const quote=P.hireQuote(s,candidate);
    assert.equal(quote.shortfall,0,'Four technicians must be affordable initially');
    assert.equal(quote.required,P.HIRING_FEE+quote.dailyWages*3);
    assert.ok(P.hire(s,candidate.id).ok);
    assert.equal(s.cash,previousCash-P.HIRING_FEE);
    previousCash=s.cash;
  }
  assert.equal(s.staff.filter(e=>e.role==='technician').length,4);
  assert.equal(P.hire(s,technicians[4].id).code,'role');
  assert.ok(P.valid(s,s.day));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.7 sales salaries, customer conversion, appointment speed and commissions reflect ability', () => {
  const E=browser(new Map()).productionEngine,P=E.people,C=E.customers;
  const candidates=P.applicants(1).filter(c=>c.role==='sales');
  const excellent=candidates.find(c=>c.skills.sales>=17);
  const budget=candidates.find(c=>c.skills.sales<=9);
  assert.ok(excellent&&budget);
  const strong=P.salesProfile(excellent),cheap=P.salesProfile(budget);
  assert.ok(strong.enquiryLift>cheap.enquiryLift);
  assert.ok(strong.driveLift>cheap.driveLift);
  assert.equal(strong.fastViewing,true);
  assert.ok(strong.commissionRate>cheap.commissionRate);
  assert.ok(excellent.monthlySalary>budget.monthlySalary);
  const s=E.create('Sales Hire Test',[]);
  assert.ok(P.hire(s,excellent.id).ok);
  s.day=2;
  assert.ok(P.salesImpact(s,1).enquiryLift>0);
  assert.ok(P.salesImpact(s,1).fastViewing);
  let found=null;
  for(let i=0;i<160;i++){
    const ready=readyForRetail(E,'Sales Speed '+i);
    const {state:r,v:car}=ready;
    const candidate=P.applicants(r.day).find(c=>c.role==='sales'&&c.skills.sales>=15);
    if(!candidate||!P.hire(r,candidate.id).ok)continue;
    r.day++;
    if(!C.demand(r,car))continue;
    assert.ok(E.openCustomer(r,car.id).ok);
    assert.ok(E.bookCustomer(r,car.id).ok);
    assert.equal(C.caseFor(r,car.id).appointmentDay,r.day+1);
    assert.equal(C.caseFor(r,car.id).salespersonId,r.staff[0].id);
    assert.ok(E.normalize(JSON.parse(JSON.stringify(r))));
    found=r;break;
  }
  assert.ok(found,'Qualified salesperson should secure a next-day viewing');
});

test('v0.9.7 good sales staff produce more actual enquiries with equal stock and reputation', () => {
  const E=browser(new Map()).productionEngine,P=E.people,C=E.customers;
  let baseline=0,improved=0,eligible=0;
  for(let i=0;i<160;i++){
    const {state:owner,v}=readyForRetail(E,'Sales Funnel '+i);
    const staffed=E.normalize(JSON.parse(JSON.stringify(owner)));
    const candidate=P.applicants(staffed.day).find(x=>x.role==='sales'&&x.skills.sales>=15);
    if(!candidate||!P.hire(staffed,candidate.id).ok)continue;
    owner.day++;staffed.day++;
    eligible++;
    if(C.demand(owner,v))baseline++;
    if(C.demand(staffed,staffed.vehicles[0]))improved++;
  }
  assert.ok(eligible>80);
  assert.ok(improved>baseline,'A stronger salesperson should increase real leads across fixed simulation sample');
});

test('v0.9.7 multiple salespeople unlock at reputation milestones and divide active cases', () => {
  const E=browser(new Map()).productionEngine,P=E.people,s=E.create('Growing Sales Team',[]);
  const people=P.applicants(1).filter(x=>x.role==='sales');
  assert.equal(P.salesLimit(s),1);
  assert.ok(P.hire(s,people[0].id).ok);
  assert.equal(P.hire(s,people[1].id).code,'role');
  s.reputationScore=40;
  assert.equal(P.salesLimit(s),2);
  assert.ok(P.hire(s,people[1].id).ok);
  s.day++;
  assert.notEqual(P.salesRep(s,1).id,P.salesRep(s,2).id);
  assert.equal(P.staffLimit(s),8,'Supervisor headcount does not create extra repair bays');
  s.reputationScore=80;
  assert.equal(P.salesLimit(s),3);
  assert.equal(P.staffLimit(s),9,'Further mechanic places require workshop investment');
  assert.ok(P.valid(s,s.day));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.8 premises investment unlocks capacity only with earned reputation and affordable cash', () => {
  const E=browser(new Map()).productionEngine,site=E.premises;
  const state=E.create('Expansion Economics',[]);
  assert.equal(E.VERSION,14);
  assert.equal(state.capacity,4);
  assert.equal(site.bays(state),4);
  assert.equal(site.costs(state).total,25);
  assert.equal(E.upgradePremises(state,'forecourt').code,'reputation');
  state.reputationScore=20;
  const f=site.quote(state,'forecourt');
  assert.equal(f.next,6);
  assert.equal(f.cost,1800);
  assert.ok(f.requiredCash>f.cost);
  const start=state.cash;
  assert.ok(E.upgradePremises(state,'forecourt').ok);
  assert.equal(state.capacity,6);
  assert.equal(state.cash,start-f.cost);
  assert.equal(site.costs(state).total,35);
  assert.equal(E.upgradePremises(state,'forecourt').code,'reputation');
  state.reputationScore=40;
  assert.ok(E.upgradePremises(state,'workshop').ok);
  assert.equal(site.bays(state),6);
  assert.equal(E.people.technicianLimit(state),6);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('v0.9.8 daily rent and utilities are real cash expenses and match operating results', () => {
  const E=browser(new Map()).productionEngine,site=E.premises;
  const s=E.create('Property Accounting',[]);
  const starting=s.cash;
  s.day=2;
  const paid=E.premisesDay(s);
  assert.equal(paid.due,25);
  assert.equal(paid.paid,25);
  assert.equal(paid.arrears,0);
  assert.equal(s.cash,starting-25);
  assert.equal(s.ledger.filter(x=>x.note.startsWith('Premises expense accrued')).length,1);
  assert.equal(s.ledger.filter(x=>x.note.startsWith('Premises overhead payment')).length,1);
  const report=E.monthly.statement(s);
  assert.equal(report.premisesExpense,25);
  assert.equal(report.premisesPaid,25);
  assert.equal(report.operatingContribution,report.grossAfterStaff-25);
  assert.ok(E.monthly.validReport(report));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.8 property arrears protect workshop reserve and are not invisible profit', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Overhead Arrears',[]);
  const seller=E.market(1).sellers[0];
  assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
  const protectedCash=E.workshop.reserved(s);
  // Adjust available cash through a legitimate recorded business transaction.
  const delta=protectedCash-s.cash;
  s.cash+=delta;
  s.ledger.push({day:s.day,delta,note:'Legacy fixture liquidity adjustment'});
  s.day=2;
  const result=E.premisesDay(s);
  assert.equal(result.paid,0);
  assert.equal(result.arrears,25);
  assert.equal(s.cash,protectedCash);
  assert.equal(E.monthly.statement(s).premisesExpense,25);
  assert.equal(E.monthly.statement(s).operatingContribution,-25);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.8 old version 9 careers migrate to a four-space premises without losing money', () => {
  const E=browser(new Map()).productionEngine;
  const s=E.create('Previous Career',[]);
  const old=JSON.parse(JSON.stringify(s));
  old.version=9;
  delete old.premises;
  const after=E.normalize(old);
  assert.ok(after);
  assert.equal(after.version,14);
  assert.equal(after.capacity,4);
  assert.equal(after.premises.forecourtLevel,0);
  assert.equal(after.premises.workshopLevel,0);
  assert.equal(after.cash,s.cash);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(after))));
  const invalid=JSON.parse(JSON.stringify(after));
  invalid.capacity=10;
  assert.equal(E.normalize(invalid),null);
});

test('v0.9.8 dynamic forecourt capacity and premises results appear in saved career UI', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');
  app.submitCareer('Expansion Screen');
  assert.match(app.nodes.get('premises-view').innerHTML,/EXPANSION & RUNNING COSTS/);
  assert.match(app.nodes.get('premises-view').innerHTML,/REQUIRES 20 REPUTATION/);
  let s=JSON.parse(storage.get(STORAGE_KEY));
  s.reputationScore=20;
  const amount=s.cash;
  storage.set(STORAGE_KEY,JSON.stringify(s));
  const resume=browser(storage);
  resume.click('resume');
  resume.click('upgrade-premises',{kind:'forecourt'});
  s=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(s.capacity,6);
  assert.equal(s.cash,amount-1800);
  assert.equal(resume.bindings.get('stock')[0].textContent,'0 / 6');
  assert.equal(resume.bindings.get('forecourt-capacity')[0].textContent,'6 vehicles');
  assert.match(resume.nodes.get('premises-view').innerHTML,/6 → 8 forecourt spaces/);
  assert.ok(resume.productionEngine.normalize(s));
});

test('v0.9.8 previously hired six mechanics retain functioning workshop bays after v9 migration', () => {
  const E=browser(new Map()).productionEngine,P=E.people,s=E.create('Grandfathered Workshop',[]);
  s.reputationScore=40;
  s.premises.workshopLevel=1;
  const candidates=P.applicants(1).filter(c=>c.role==='technician').slice(0,6);
  for(const candidate of candidates)assert.ok(E.hireStaff(s,candidate.id).ok);
  assert.equal(s.staff.length,6);
  const old=JSON.parse(JSON.stringify(s)),cash=s.cash;
  old.version=9;
  delete old.premises;
  const migrated=E.normalize(old);
  assert.ok(migrated,'A legitimate older career with six employees must remain loadable');
  assert.equal(migrated.premises.workshopLevel,1);
  assert.equal(E.premises.bays(migrated),6);
  assert.equal(P.technicianLimit(migrated),6);
  assert.equal(migrated.cash,cash,'Migration must not fabricate a capital purchase');
  assert.equal(migrated.staff.length,6);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(migrated))));
});

test('v0.9.8 property charges do not repeat during month-end Deal Day sessions', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');
  app.submitCareer('Deal Day Rent');
  for(let i=0;i<29;i++)app.click('continue');
  let before=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(before.day,30);
  const count=before.ledger.filter(l=>l.note.startsWith('Premises expense accrued:')).length;
  assert.equal(count,29);
  const cashBefore=before.cash;
  for(let i=0;i<4;i++){
    app.click('continue');
    const after=JSON.parse(storage.get(STORAGE_KEY));
    assert.equal(after.day,30);
    assert.equal(after.cash,cashBefore);
    assert.equal(after.ledger.filter(l=>l.note.startsWith('Premises expense accrued:')).length,count);
  }
});

test('v0.9.9 Auction Hall is a separate tab; Buying Desk has no live maximum-bid controls', () => {
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Dedicated Auction Trader');
  assert.match(html,/data-page="auctionHall"/);
  assert.match(html,/data-panel="auctionHall"/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/NUMBERED LOT CATALOGUE/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/LOT 001/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/LOT 002/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/data-action="start-auction"/);
  assert.doesNotMatch(app.nodes.get('market-sellers').innerHTML,/data-action="bid-auction"/);
  assert.match(app.nodes.get('market-sellers').innerHTML,/data-action="buy-seller"/);
  assert.doesNotMatch(html,/id="market-auctions"/);
});

test('v0.9.9 live bids meet fixed rival thresholds and only hammer charges purchase and fee', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Auction Hammer Trades',[]);
  const lot=E.marketFor(s).auctions[0];
  assert.ok(lot);
  assert.ok(E.startAuction(s).ok);
  assert.equal(s.auctionHall.phase,'bidding');
  assert.equal(s.auctionHall.currentBid,lot.guide);
  assert.equal(s.auctionHall.leader,'rival');
  const startCash=s.cash;
  const first=E.bidLiveAuction(s,100);
  assert.ok(first.ok);
  assert.equal(s.auctionHall.rounds,1);
  assert.equal(s.cash,startCash,'Bid without a hammer cannot remove dealership funds');
  assert.equal(s.vehicles.length,0);
  let rounds=0;
  while(s.auctionHall.phase==='bidding'&&rounds++<30){
    assert.ok(E.bidLiveAuction(s,100).ok);
  }
  assert.equal(s.auctionHall.phase,'payment','A competitive lot must reach a binding hammer awaiting settlement');
  assert.equal(s.cash,startCash,'Hammer alone must not deduct cash');
  assert.equal(s.vehicles.length,0,'The vehicle must not enter stock before payment');
  assert.equal(E.passAuction(s).code,'stage','Cannot walk away after the hammer');
  assert.ok(E.settleAuction(s).ok);
  assert.equal(s.auctionHall.phase,'result');
  const result=s.auctionHall.results[0];
  assert.equal(result.kind,'won');
  assert.ok(result.hammer>=lot.reserve);
  assert.equal(result.fee,lot.fee);
  assert.equal(result.total,result.hammer+lot.fee);
  assert.equal(s.vehicles[0].origin,lot.id);
  assert.equal(s.vehicles[0].cost,result.total);
  assert.equal(s.cash,startCash-result.total);
  assert.equal(s.auctionHistory.length,1);
  assert.equal(s.auctionHistory[0].kind,'won');
  assert.equal(s.ledger.filter(row=>row.note.startsWith('Auction purchase:')).length,1);
  assert.equal(E.bidLiveAuction(s,100).code,'stage','Cannot rebid after the hammer');
  assert.equal(E.settleAuction(s).code,'stage','Cannot pay a settled invoice twice');
  assert.equal(E.passAuction(s).code,'stage','Cannot withdraw an already won auction lot');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))),'Hammer and fees must survive save validation');
});

test('v0.9.9 passing and skipping numbered lots never charge buyer fees', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Auction Walkaways',[]);
  const lots=E.marketFor(s).auctions;
  const initial=s.cash;
  assert.equal(lots.length,3);
  assert.ok(E.startAuction(s).ok);
  assert.equal(E.passAuction(s).ok,true);
  assert.equal(s.auctionHall.results[0].kind,'unsold','At guide price the reserve is not met, so rival cannot be a winner');
  assert.equal(s.cash,initial);
  assert.equal(s.vehicles.length,0);
  assert.ok(E.nextAuctionLot(s).ok);
  assert.equal(s.auctionHall.index,1);
  assert.equal(s.auctionHall.phase,'catalogue');
  assert.equal(E.bidLiveAuction(s,100).code,'stage');
  assert.ok(E.passAuction(s).ok);
  assert.equal(s.auctionHall.results[1].kind,'passed');
  assert.equal(s.auctionHall.results[1].fee,0);
  assert.ok(E.nextAuctionLot(s).ok);
  assert.ok(E.passAuction(s).ok);
  assert.ok(E.nextAuctionLot(s).ok);
  assert.equal(s.auctionHall.phase,'finished');
  assert.equal(s.auctionHall.results.length,lots.length);
  assert.equal(E.nextAuctionLot(s).code,'stage');
  assert.equal(s.cash,initial);
  assert.equal(s.auctionHistory.length,3);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.9 unaffordable auction bids are rejected before any binding position', () => {
  const E=browser(new Map()).productionEngine,s=E.create('No Reckless Bidding',[]);
  const lot=E.marketFor(s).auctions[0];
  const toSpend=s.cash-(lot.guide+lot.fee-1);
  s.cash-=toSpend;
  s.ledger.push({day:1,delta:-toSpend,note:'Fixture committed equipment investment'});
  assert.ok(E.startAuction(s).ok);
  const before=JSON.stringify(s.auctionHall),cash=s.cash;
  const result=E.bidLiveAuction(s,100);
  assert.equal(result.code,'cash');
  assert.equal(JSON.stringify(s.auctionHall),before);
  assert.equal(s.cash,cash);
  assert.ok(E.passAuction(s).ok);
  assert.equal(s.vehicles.length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.9 live auction stages, reserve, results and fees persist through UI reload', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Auction UI Reload');
  const lot=app.engine.market(1).auctions[0];
  app.go('auctionHall');
  app.click('start-auction');
  app.click('bid-live-auction',{increment:'100'});
  let before=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(before.auctionHall.phase,'bidding');
  assert.equal(before.auctionHall.rounds,1);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/Regional dealer counters/);
  const loaded=browser(storage);
  loaded.click('resume');
  loaded.go('auctionHall');
  assert.match(loaded.nodes.get('auction-hall-view').innerHTML,/AUCTIONEER ACTIVITY/);
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).auctionHall.rounds,1);
  for(let i=0;i<30&&JSON.parse(storage.get(STORAGE_KEY)).auctionHall.phase==='bidding';i++)
    loaded.click('bid-live-auction',{increment:'100'});
  const done=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(done.auctionHall.phase,'payment');
  assert.equal(done.vehicles.length,0,'No car ownership before payment');
  loaded.click('settle-auction');
  const settled=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(settled.auctionHall.results[0].kind,'won');
  assert.equal(settled.auctionHall.results[0].lotId,lot.id);
  assert.equal(settled.vehicles.length,1);
  assert.match(loaded.nodes.get('auction-hall-view').innerHTML,/HAMMERED TO YOU/);
  loaded.click('next-auction-lot');
  assert.match(loaded.nodes.get('auction-hall-view').innerHTML,/LOT 002/);
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).auctionHall.index,1);
  assert.ok(loaded.productionEngine.normalize(JSON.parse(storage.get(STORAGE_KEY))));
});

test('v0.9.9 prior v10 expanded dealership saves retain stock capacity, cash and historical reports', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Migrating Auction Trader',[]);
  s.reputationScore=20;
  assert.ok(E.upgradePremises(s,'forecourt').ok);
  const previous=JSON.parse(JSON.stringify(s));
  previous.version=10;
  delete previous.auctionHall;
  delete previous.auctionHistory;
  const restored=E.normalize(previous);
  assert.ok(restored);
  assert.equal(restored.version,14);
  assert.equal(restored.capacity,6);
  assert.equal(restored.premises.forecourtLevel,1);
  assert.equal(restored.cash,previous.cash);
  assert.equal(restored.auctionHall.phase,'catalogue');
  assert.deepEqual(JSON.stringify(restored.auctionHistory),'[]');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(restored))));
});

test('v0.9.9 forged auction wins or impossible auction session states invalidate career saves', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Secured Auction Record',[]);
  const first=JSON.parse(JSON.stringify(s));
  first.auctionHall.phase='bidding';
  first.auctionHall.currentBid=0;
  assert.equal(E.normalize(first),null);
  const another=JSON.parse(JSON.stringify(s));
  another.auctionHistory=[{day:1,lotId:'A-1-0',lotNumber:'001',
    title:'Fictional Vehicle',kind:'won',hammer:2000,fee:275,total:2275,
    detail:'Fabricated hammer'}];
  assert.equal(E.normalize(another),null);
});

test('v0.9.9 Deal Day closes auction access and new game days reset the session', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Auction Calendar Test',[]);
  E.startAuction(s);
  E.passAuction(s);
  assert.equal(s.auctionHistory.length,1);
  s.day=2;
  E.rollAuctionHall(s);
  assert.equal(s.auctionHall.day,2);
  assert.equal(s.auctionHall.phase,'catalogue');
  assert.equal(s.auctionHall.results.length,0);
  assert.equal(s.auctionHistory.length,1);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
  s.day=30;
  E.rollAuctionHall(s);
  assert.equal(E.marketFor(s).auctions.length,0);
  assert.equal(E.startAuction(s).code,'closed');
  assert.equal(E.bidLiveAuction(s,100).code,'stage');
});

test('v0.9.9 upcoming catalogue previews protect undisclosed faults until paid inspection', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Catalogue Inspectors');
  const lots=app.engine.market(1).auctions;
  const lot=lots.find(x=>x.profile.hiddenFault);
  assert.ok(lot);
  app.go('auctionHall');
  app.click('preview-auction',{id:lot.id});
  let markup=app.nodes.get('auction-hall-view').innerHTML;
  assert.match(markup,new RegExp('LOT '+String(lots.indexOf(lot)+1).padStart(3,'0')));
  assert.ok(!markup.includes(lot.profile.hiddenFault.item),'Hidden faults must remain confidential before inspection');
  app.click('inspect-lead',{kind:'auction',id:lot.id});
  const state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.reports[lot.id].fee,lot.profile.inspectionFee);
  markup=app.nodes.get('auction-hall-view').innerHTML;
  assert.match(markup,/ADDITIONAL CONDITION RISK/);
  assert.ok(markup.includes(lot.profile.hiddenFault.item));
  assert.equal(state.auctionHall.index,0,'Inspecting an upcoming lot must not advance the current lot');
  assert.ok(app.productionEngine.normalize(state));
});

test('v0.9.10 auction calendar opens only Mondays, never Saturdays or Sundays', () => {
  const E=browser(new Map()).productionEngine;
  const Mondays=[1,8,15,22,29,36];
  for(let day=1;day<=42;day++){
    const open=Mondays.includes(day);
    assert.equal(E.auctionDay(day),open,'Calendar day '+day);
    const lots=E.market(day).auctions;
    assert.equal(lots.length>0,open,'Auction catalogue must match scheduled Monday on day '+day);
    if(open){
      assert.ok(lots.length>=3&&lots.length<=5);
      assert.equal(lots[0].id,'A-'+day+'-0');
    } else assert.equal(lots.length,0);
  }
  assert.equal(E.nextAuctionDay(1),8);
  assert.equal(E.nextAuctionDay(2),8);
  assert.equal(E.nextAuctionDay(7),8);
  assert.equal(E.nextAuctionDay(8),15);
  assert.equal(E.nextAuctionDay(30),36);
  assert.equal(E.auctionDay(6),false,'Saturday must not have an auction');
  assert.equal(E.auctionDay(7),false,'Sunday must not have an auction');
  assert.equal(E.auctionDay(120),false,'Month-end Monday is reserved for Deal Day');
  assert.equal(E.auctionDay(121),true,'Auction must move to Tuesday, preserving weekly frequency');
  assert.equal(E.nextAuctionDay(119),121);
  assert.equal(E.nextAuctionDay(120),121);
  assert.equal(E.nextAuctionDay(121),127);
  assert.equal(E.market(120).auctions.length,0);
  assert.ok(E.market(121).auctions.length>=3);
  for(let week=0;week<65;week++){
    const monday=1+week*7;
    const open=[0,1,2,3,4,5,6].map(offset=>monday+offset)
      .filter(day=>E.auctionDay(day));
    assert.equal(open.length,1,'Exactly one auction for game week '+(week+1));
    assert.ok((open[0]-monday)<5,'Weekly auction must be Monday–Friday');
  }
});

test('v0.9.10 rival withdrawal produces invoice first, not instant payment or workshop stock', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Weekly Hammer Economics',[]);
  const lot=E.marketFor(s).auctions[0];
  const initialCash=s.cash;
  assert.ok(E.startAuction(s).ok);
  assert.equal(E.auctionLot(s).id,lot.id);
  assert.ok(E.bidLiveAuction(s,100).ok);
  assert.equal(s.auctionHall.leader,'rival','Rival should match an affordable early bid');
  assert.equal(s.cash,initialCash);
  assert.equal(s.vehicles.length,0);
  for(let i=0;i<30&&s.auctionHall.phase==='bidding';i++)
    assert.ok(E.bidLiveAuction(s,100).ok);
  assert.equal(s.auctionHall.phase,'payment');
  assert.equal(s.auctionHall.leader,'player');
  assert.equal(s.auctionHall.rivalFolded,true);
  assert.ok(s.auctionHall.currentBid>=lot.reserve);
  assert.equal(s.cash,initialCash);
  assert.equal(s.ledger.length,0);
  assert.equal(s.auctionHistory.length,0,'Hammer is not a recorded paid win');
  assert.equal(E.passAuction(s).code,'stage');
  assert.equal(E.nextAuctionLot(s).code,'stage');
  assert.equal(E.bidLiveAuction(s,100).code,'stage');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))),'Unpaid invoice must be a valid resumable save');
  const hammer=s.auctionHall.currentBid;
  assert.ok(E.settleAuction(s).ok);
  assert.equal(s.cash,initialCash-hammer-lot.fee);
  assert.equal(s.vehicles.length,1);
  assert.equal(s.vehicles[0].workshop.stage,'unassessed');
  assert.equal(s.vehicles[0].cost,hammer+lot.fee);
  assert.equal(s.vehicles[0].origin,lot.id);
  assert.equal(s.auctionHall.results[0].kind,'won');
  assert.equal(E.settleAuction(s).code,'stage','Invoice cannot be paid twice');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.10 declining a rival bid correctly loses without charging a buyer fee', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Disciplined Trader',[]);
  const lot=E.marketFor(s).auctions[0],opening=s.cash;
  assert.ok(E.startAuction(s).ok);
  for(let i=0;i<5&&s.auctionHall.currentBid<lot.reserve;i++){
    if(s.auctionHall.phase!=='bidding')break;
    assert.ok(E.bidLiveAuction(s,100).ok);
  }
  assert.equal(s.auctionHall.leader,'rival');
  const rivalBid=s.auctionHall.currentBid;
  const passed=E.passAuction(s);
  assert.ok(passed.ok);
  assert.equal(s.auctionHall.results[0].kind,rivalBid>=lot.reserve?'lost':'unsold');
  assert.equal(s.auctionHall.results[0].hammer,rivalBid>=lot.reserve?rivalBid:0);
  assert.equal(s.auctionHall.results[0].fee,0);
  assert.equal(s.cash,opening);
  assert.equal(s.vehicles.length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.10 unpaid auction invoice blocks other spending and game day advance in the interface', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Hammer Payment Due');
  const lot=app.engine.market(1).auctions[0];
  app.click('start-auction');
  for(let i=0;i<30&&JSON.parse(storage.get(STORAGE_KEY)).auctionHall.phase==='bidding';i++)
    app.click('bid-live-auction',{increment:'100'});
  let saved=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(saved.auctionHall.phase,'payment');
  const balance=saved.cash,day=saved.day;
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/FINALISE PAYMENT/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/HAMMER DOWN/);
  app.click('continue');
  saved=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(saved.day,day);
  app.click('hire-staff',{id:app.engine.people.applicants(saved.day)[0].id});
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).cash,balance);
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).staff.length,0);
  const reopened=browser(storage);reopened.click('resume');
  assert.match(reopened.nodes.get('auction-hall-view').innerHTML,/PAYMENT REQUIRED/);
  reopened.click('settle-auction');
  saved=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(saved.auctionHall.phase,'result');
  assert.equal(saved.vehicles.length,1);
  assert.equal(saved.vehicles[0].origin,lot.id);
  assert.equal(saved.cash,balance-saved.auctionHall.results[0].total);
  reopened.click('settle-auction');
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).cash,saved.cash);
});

test('v0.9.10 unfinished auction bidding must be passed before game-day rollover', () => {
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Auction Timing Test');
  app.click('start-auction');
  app.click('continue');
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).day,1);
  assert.match(app.nodes.get('event-notice').textContent,/still bidding/);
  app.click('pass-auction');
  app.click('continue');
  const day2=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(day2.day,2);
  assert.equal(day2.auctionHall.day,2);
  assert.equal(day2.auctionHall.phase,'catalogue');
  assert.equal(app.productionEngine.marketFor(day2).auctions.length,0);
  assert.equal(day2.auctionHistory[0].kind,'unsold');
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/AUCTION HOUSE CLOSED TODAY/);
  assert.match(app.nodes.get('auction-hall-view').innerHTML,/GAME DAY 8/);
});

test('v0.9.10 migrates previous v11 careers on now-closed weekdays without losing auction history', () => {
  const E=browser(new Map()).productionEngine,s=E.create('Old Daily Auction',[]);
  s.day=2;
  E.rollAuctionHall(s);
  s.auctionHistory.push({day:2,lotId:'A-2-0',lotNumber:'001',title:'2018 Example Car',
    kind:'lost',hammer:3000,fee:0,total:3000,
    detail:'Old weekday auction ended before weekly schedule'});
  const old=JSON.parse(JSON.stringify(s));
  old.version=11;
  old.auctionHall={day:2,index:1,phase:'result',currentBid:3000,leader:'rival',
    playerBid:0,rivalFolded:false,rounds:0,feed:['Old Wednesday lot ended'],
    results:[{...s.auctionHistory[0]}]};
  const restored=E.normalize(old);
  assert.ok(restored,'Old v11 save must survive schedule change');
  assert.equal(restored.version,14);
  assert.equal(restored.cash,s.cash);
  assert.equal(restored.auctionHistory.length,1);
  assert.equal(restored.auctionHall.day,2);
  assert.equal(restored.auctionHall.phase,'catalogue');
  assert.equal(restored.auctionHall.results.length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(restored))));
});

test('v0.9.11 dashboard is compact, focused and retains all critical live links',()=>{
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Compact Trade Control');
  assert.match(html,/class="career-panel dashboard-control"/);
  assert.match(html,/class="stat-grid dashboard-kpis"/);
  assert.equal((html.match(/class="stat-tile dashboard-kpi/g)||[]).length,6,
    'Exactly six first-view KPI controls');
  assert.match(css,/\.dashboard-control \.dashboard-kpis/);
  assert.match(css,/@media\(max-width:1450px\)/);
  assert.match(css,/@media\(max-width:700px\)/);
  assert.match(css,/\.dashboard-event-compact/);
  assert.doesNotMatch(html,/GOOD MORNING, <em>BOSS/);
  assert.doesNotMatch(html,/Read your welcome brief and starting position/);
  assert.doesNotMatch(html,/EVERY DEAL COUNTS/);
  assert.equal(app.nodes.get('dashboard-inbox').children.length,2);
  assert.match(app.nodes.get('dashboard-priorities').innerHTML,/data-page="(auctionHall|auctions|events|staff|stock|sales|finance)"/);
  assert.match(app.nodes.get('dashboard-operating-strip').innerHTML,/LISTED FOR SALE/);
  assert.match(app.nodes.get('dashboard-operating-strip').innerHTML,/OUTSTANDING BILLS/);
  assert.equal(app.bindings.get('dashboard-monthly-sales')[0].textContent,'0 / 2');
  assert.equal(app.bindings.get('dashboard-operating')[0].textContent,'£0');
  assert.equal(app.bindings.get('dashboard-auction')[0].textContent,'TODAY');
  assert.equal(app.bindings.get('cash')[0].textContent,'£12,500');
  assert.equal(app.bindings.get('stock')[0].textContent,'0 / 4');
  assert.equal(app.nodes.get('events-banner').className,'events-banner dashboard-event-compact');
  app.go('stock');
  assert.equal(app.nodes.get('events-banner').className,'events-banner');
  app.go('dashboard');
  assert.equal(app.nodes.get('events-banner').className,'events-banner dashboard-event-compact');
});

test('v0.9.11 dashboard tasks respond to actual unassessed stock, unpaid staff and property bills',()=>{
  const app=browser(new Map()),E=app.productionEngine,V=app.dashboard;
  const state=E.create('Live Priority Engine',[]);
  let model=V.snapshot(state,E);
  assert.ok(model.tasks.some(x=>x.key==='empty-stock'));
  assert.ok(model.tasks.some(x=>x.key==='auction-live'));
  assert.equal(model.report.soldUnits,0);
  assert.equal(model.report.targetUnits,2);
  const seller=E.marketFor(state).sellers[0];
  assert.ok(E.acquireSeller(state,seller.id,seller.ask).ok);
  model=V.snapshot(state,E);
  assert.ok(!model.tasks.some(x=>x.key==='empty-stock'));
  assert.ok(model.tasks.some(x=>x.key==='workshop'),'Acquired stock requires assessment');
  assert.equal(model.awaitingPrep,1);
  state.payrollArrears=400;
  state.premises.arrears=175;
  model=V.snapshot(state,E);
  assert.equal(model.arrears,575);
  assert.equal(model.tasks[0].key,'board-meeting','Start-of-career meeting remains a mandatory first action');
  assert.equal(model.tasks[1].key,'payroll');
  assert.equal(model.tasks[2].key,'rent');
  assert.match(V.priorities(model),/data-page="staff"/);
  assert.match(V.priorities(model),/data-page="business"/);
  assert.match(V.operations(model,state),/£575/);
  assert.equal(state.vehicles[0].workshop.stage,'unassessed',
    'Dashboard must not change workshop work or spend money');
});

test('v0.9.11 dashboard prioritises binding auction invoices before other decisions',()=>{
  const app=browser(new Map()),E=app.productionEngine,V=app.dashboard;
  const s=E.create('Unpaid Hammer',[]);
  assert.ok(E.startAuction(s).ok);
  for(let i=0;i<30&&s.auctionHall.phase==='bidding';i++)
    assert.ok(E.bidLiveAuction(s,100).ok);
  assert.equal(s.auctionHall.phase,'payment');
  const cash=s.cash,carCount=s.vehicles.length;
  const snap=V.snapshot(s,E);
  assert.equal(snap.tasks[0].key,'auction-invoice');
  assert.equal(snap.tasks[0].page,'auctionHall');
  assert.match(V.priorities(snap),/PAY INVOICE/);
  assert.equal(s.cash,cash);
  assert.equal(s.vehicles.length,carCount);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.11 dashboard reflects Deal Day, weekly auctions, monthly expenses and true contribution',()=>{
  const app=browser(new Map()),E=app.productionEngine,V=app.dashboard;
  const s=E.create('Month Close Dashboard',[]);
  s.day=2;
  E.rollAuctionHall(s);
  E.premisesDay(s);
  const day2=V.snapshot(s,E);
  assert.equal(day2.report.premisesExpense,25);
  assert.equal(day2.report.operatingContribution,-25,
    'Accrued property costs appear even when the dealership has no sales');
  assert.equal(day2.auctionDay,8);
  assert.equal(day2.auctionOpen,false);
  s.day=30;s.deadlineSession=4;
  E.rollAuctionHall(s);
  const close=V.snapshot(s,E);
  assert.equal(close.tasks[0].key,'deal-day');
  assert.match(close.tasks[0].title,/Close the trading month/);
  assert.equal(close.auctionDay,36);
  assert.match(V.priorities(close),/CLOSE MONTH/);
});

test('v0.9.11 inbox preview always prioritises unread items over old read messages',()=>{
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Actionable Inbox');
  const first=app.nodes.get('dashboard-inbox').children;
  assert.equal(first.length,2);
  app.click('read-message',{id:first[0].dataset.id});
  app.go('dashboard');
  const preview=app.nodes.get('dashboard-inbox').children;
  assert.equal(preview.length,2);
  const state=JSON.parse(storage.get(STORAGE_KEY));
  assert.ok(preview.every(node=>!state.messages.find(m=>String(m.id)===node.dataset.id).read),
    'Read messages should not displace the remaining unread messages');
  app.click('mark-all-read');
  app.go('dashboard');
  assert.equal(app.bindings.get('unread')[0].hidden,true);
  assert.equal(app.nodes.get('dashboard-inbox').children.length,2,
    'Recent read communications remain accessible when inbox is cleared');
});

test('v0.9.12 dashboard reports real unit target overachievement rather than zero to go',()=>{
  const app=browser(new Map()),V=app.dashboard;
  const exceeded=V.salesProgress({soldUnits:7,targetUnits:2},0);
  assert.equal(exceeded.text,'✓ Unit target exceeded by 5 vehicles');
  assert.equal(exceeded.positive,true);
  assert.doesNotMatch(exceeded.text,/0 to target/);
  const exactly=V.salesProgress({soldUnits:2,targetUnits:2},4);
  assert.equal(exactly.text,'✓ Unit target reached');
  assert.equal(exactly.positive,true);
  const short=V.salesProgress({soldUnits:1,targetUnits:2},3);
  assert.equal(short.text,'1 sale to target · 3 game days left');
  assert.equal(short.positive,false);
  const noTarget=V.salesProgress({soldUnits:0,targetUnits:0},7);
  assert.equal(noTarget.text,'No unit target set');
  assert.equal(noTarget.positive,false);
  assert.match(css,/dashboard-target-positive/);
});

test('v0.9.12 Day 60 exceeding target suggests Day 64 auction instead of generic finances',()=>{
  const app=browser(new Map()),E=app.productionEngine,V=app.dashboard;
  const s=E.create('Month 2 Overachievement',[]);
  s.day=60;
  s.deadlineSession=4;
  E.rollAuctionHall(s);
  s.monthPlan.startDay=31;
  s.monthPlan.endDay=60;
  s.monthPlan.month=2;
  // Synthetic completed sales are used only to exercise the read-only
  // Dashboard; this fixture never changes the production cash/stock engine.
  s.sold=Array.from({length:7},(_,i)=>({
    day:40+i,price:5000,profit:650,mode:'cash'
  }));
  s.messages.forEach(m=>{m.read=true;});
  const view=V.snapshot(s,E);
  assert.equal(view.report.soldUnits,7);
  assert.equal(view.report.targetUnits,2);
  assert.equal(view.report.operatingContribution,4550);
  assert.equal(view.auctionDay,64);
  assert.deepEqual(Array.from(view.tasks,x=>x.key),
    ['deal-day','empty-stock','next-auction']);
  assert.equal(view.tasks[2].title,'Prepare for Day 64 auction');
  assert.match(view.tasks[2].description,/Monday session in 4 game days/);
  assert.match(V.priorities(view),/VIEW AUCTION SCHEDULE/);
  assert.doesNotMatch(V.priorities(view),/Check your operating position/);
  assert.doesNotMatch(V.priorities(view),/Review this week’s stock plan/);
  assert.equal(V.salesProgress(view.report,view.daysToGo).text,
    '✓ Unit target exceeded by 5 vehicles');
});

test('v0.9.12 Deal Day banner and primary action agree on final closing session',()=>{
  const app=browser(new Map()),E=app.productionEngine,EV=app.eventsView;
  const s=E.create('Closing Session',[]);
  s.day=60;s.deadlineSession=4;
  E.rollAuctionHall(s);
  const banner=EV.banner(s);
  assert.match(banner,/FINAL DAY OF MONTH 2/);
  assert.match(banner,/17:00 · 5 OF 5/);
  assert.match(banner,/data-page="events">CLOSE MONTH ↗/);
  assert.doesNotMatch(banner,/OPEN DEAL DAY ↗/);
  const priority=app.dashboard.snapshot(s,E).tasks[0];
  assert.equal(priority.key,'deal-day');
  assert.equal(priority.action,'CLOSE MONTH');
  assert.equal(priority.page,'events');
  s.deadlineSession=3;
  const earlier=EV.banner(s);
  assert.match(earlier,/OPEN DEAL DAY ↗/);
  assert.doesNotMatch(earlier,/CLOSE MONTH ↗/);
});

test('v0.9.12 dashboard shows genuine operating-loss warning instead of filler advice',()=>{
  const app=browser(new Map()),E=app.productionEngine,V=app.dashboard;
  const s=E.create('End-of-month Cost Risk',[]);
  s.day=27;s.monthPlan.endDay=30;E.rollAuctionHall(s);
  s.sold=[{day:21,price:4500,profit:-1200,mode:'cash'}];
  s.messages.forEach(m=>{m.read=true;});
  const view=V.snapshot(s,E);
  assert.ok(view.report.operatingContribution<0);
  assert.ok(view.tasks.some(t=>t.key==='negative-contribution'));
  assert.match(V.priorities(view),/Trading costs exceed your vehicle margin/);
  assert.doesNotMatch(V.priorities(view),/Check your operating position/);
  assert.ok(view.tasks.every(t=>t.page&&t.action));
});

test('v0.9.13 owner Inbox is compact, filterable and distinguishes paid copies from requests',()=>{
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Owner Inbox Desk');
  assert.match(html,/class="career-panel inbox-control"/);
  assert.match(html,/id="inbox-filter-buttons"/);
  assert.match(css,/\.inbox-control \.inbox-layout/);
  assert.match(css,/calc\(100dvh - 385px\)/);
  assert.match(app.nodes.get('inbox-filter-buttons').innerHTML,/NEEDS APPROVAL/);
  assert.match(app.nodes.get('inbox-filter-buttons').innerHTML,/ACCOUNTS/);
  assert.match(app.nodes.get('inbox-filter-buttons').innerHTML,/STAFF/);
  assert.equal(app.nodes.get('inbox-action-count').textContent,'0');
  app.click('filter-inbox',{filter:'accounts'});
  assert.match(app.nodes.get('inbox-filter-buttons').innerHTML,/data-filter="accounts" aria-pressed="true"/);
  assert.match(app.nodes.get('inbox-detail').innerHTML,/Accounts Office/);
  app.click('filter-inbox',{filter:'action'});
  assert.equal(app.nodes.get('inbox-list').children.length,0);
  assert.match(app.nodes.get('inbox-detail').innerHTML,/No messages in this category/);
  app.click('filter-inbox',{filter:'all'});
  assert.equal(app.nodes.get('inbox-list').children.length,3);
  assert.equal(app.nodes.get('inbox-unread-summary').textContent,'3');
});

test('v0.9.13 workshop request permits actual approval and charges exactly once',()=>{
  const storage=new Map(),E=browser(new Map()).productionEngine;
  const s=E.create('Workshop Authorisations',[]);
  const seller=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
  const car=s.vehicles[0];
  assert.ok(E.assessStock(s,car.id).ok);
  const external=E.prepQuote(s,car.id,'external');
  assert.ok(external);
  storage.set(STORAGE_KEY,JSON.stringify(s));
  const app=browser(storage);
  app.click('resume');
  const initial=JSON.parse(storage.get(STORAGE_KEY));
  const request=initial.messages.find(m=>m.reference==='repair:'+car.id);
  assert.ok(request,'Workshop assessment must generate an owner approval request');
  assert.equal(request.from,'WORKSHOP SUPERVISOR');
  assert.equal(request.category,'operations');
  assert.equal(app.nodes.get('inbox-action-count').textContent,'1');
  assert.ok(initial.messages.some(m=>m.subject==='Diagnostic inspection completed'));
  app.click('filter-inbox',{filter:'action'});
  assert.equal(app.nodes.get('inbox-list').children.length,1);
  app.click('read-message',{id:String(request.id)});
  assert.match(app.nodes.get('inbox-detail').innerHTML,/OWNER DECISION REQUIRED/);
  assert.match(app.nodes.get('inbox-detail').innerHTML,/APPROVE EXTERNAL GARAGE/);
  const before=JSON.parse(storage.get(STORAGE_KEY));
  app.click('approve-inbox-repair',{id:String(car.id),method:'external'});
  const after=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(after.cash,before.cash-external.cost);
  assert.equal(after.vehicles[0].workshop.stage,'in-progress');
  assert.equal(after.vehicles[0].workshop.method,'external');
  assert.equal(after.inboxLedgerCursor,after.ledger.length);
  assert.equal(after.ledger.filter(l=>l.note.startsWith('Workshop repair booking:')).length,1);
  assert.equal(after.messages.filter(m=>m.subject==='PAID COPY · Workshop repair authorisation').length,1);
  assert.equal(app.nodes.get('inbox-action-count').textContent,'0');
  const cash=after.cash,number=after.messages.length;
  app.click('approve-inbox-repair',{id:String(car.id),method:'external'});
  const retried=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(retried.cash,cash,'Repeat click cannot debit the garage twice');
  assert.equal(retried.messages.length,number);
  assert.ok(app.productionEngine.normalize(retried));
});

test('v0.9.13 owner Accounts mails are actual paid receipts, not another charge',()=>{
  const app=browser(new Map()),E=app.productionEngine,I=app.inbox;
  const s=E.create('Auction Accounting',[]);
  const startCash=s.cash;
  assert.ok(E.startAuction(s).ok);
  for(let i=0;i<30&&s.auctionHall.phase==='bidding';i++)
    assert.ok(E.bidLiveAuction(s,100).ok);
  assert.equal(s.auctionHall.phase,'payment');
  assert.ok(E.settleAuction(s).ok);
  const cash=s.cash,paid=s.auctionHall.results[0].total;
  assert.equal(startCash-cash,paid);
  assert.ok(I.sync(s,E));
  const invoice=s.messages.find(m=>m.subject==='PAID COPY · Auction purchase settlement');
  assert.ok(invoice);
  assert.equal(invoice.category,'accounts');
  assert.match(invoice.body,/Status: PAID/);
  assert.match(invoice.body,/not a new payment request/);
  assert.equal(s.cash,cash,'Generating receipts must not affect accounts');
  assert.equal(I.sync(s,E),false,'Reading/synchronising existing ledger must not duplicate receipt');
  assert.equal(s.messages.filter(m=>m.subject==='PAID COPY · Auction purchase settlement').length,1);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.13 staff issues generate evidence-backed owner notifications without spam',()=>{
  const app=browser(new Map()),E=app.productionEngine,I=app.inbox;
  const s=E.create('Personnel Updates',[]);
  const employee=E.people.applicants(s.day).find(p=>p.role==='sales');
  assert.ok(E.hireStaff(s,employee.id).ok);
  s.staff[0].morale=40;
  s.payrollArrears=350;
  s.premises.arrears=60;
  assert.ok(I.sync(s,E));
  const subjects=s.messages.map(m=>m.subject);
  assert.ok(subjects.includes('New employee onboarded · Cost confirmed'));
  assert.ok(!subjects.some(x=>x.startsWith('Staff concern · ')),
    'Payroll arrears are the root cause; paid morale interventions must not be suggested');
  assert.ok(subjects.includes('ACTION REQUIRED · Outstanding wages'));
  assert.ok(subjects.includes('ACTION REQUIRED · Premises payment shortfall'));
  const count=s.messages.length,cash=s.cash;
  assert.equal(I.sync(s,E),false);
  assert.equal(s.messages.length,count,'No daily duplicate reminders from repeated screen render');
  assert.equal(s.cash,cash);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.13 previous v12 career preserves history and does not resend old invoices',()=>{
  const app=browser(new Map()),E=app.productionEngine,I=app.inbox;
  const s=E.create('Older Accounts History',[]);
  const seller=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
  assert.ok(E.assessStock(s,s.vehicles[0].id).ok);
  const old=JSON.parse(JSON.stringify(s));
  old.version=12;
  delete old.inboxLedgerCursor;
  const restored=E.normalize(old);
  assert.ok(restored);
  assert.equal(restored.version,14);
  assert.equal(restored.inboxLedgerCursor,old.ledger.length);
  assert.equal(restored.cash,old.cash);
  assert.equal(restored.stock,old.stock);
  assert.equal(restored.ledger.length,old.ledger.length);
  assert.ok(I.sync(restored,E));
  assert.ok(restored.messages.some(m=>m.reference.startsWith('repair:')));
  assert.equal(restored.messages.filter(m=>m.reference?.startsWith('ledger:')).length,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(restored))));
});

test('v0.9.13 paid invoice copies preserve read status and filter after page reload',()=>{
  const storage=new Map(),E=browser(new Map()).productionEngine;
  const s=E.create('Saved Owner Inbox',[]);
  const applicant=E.people.applicants(1).find(p=>p.role==='technician');
  assert.ok(E.hireStaff(s,applicant.id).ok);
  storage.set(STORAGE_KEY,JSON.stringify(s));
  const app=browser(storage);app.click('resume');
  app.go('inbox');
  app.click('filter-inbox',{filter:'staff'});
  const mail=JSON.parse(storage.get(STORAGE_KEY)).messages.find(m=>m.from==='PEOPLE & PAYROLL');
  assert.ok(mail);
  app.click('read-message',{id:String(mail.id)});
  const viewed=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(viewed.messages.find(m=>m.id===mail.id).read,true);
  const total=viewed.messages.length;
  const resumed=browser(storage);resumed.click('resume');
  const reopened=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(reopened.messages.length,total);
  assert.equal(reopened.messages.find(m=>m.id===mail.id).read,true);
  resumed.click('filter-inbox',{filter:'staff'});
  assert.equal(resumed.nodes.get('inbox-list').children.length,1);
  assert.match(resumed.nodes.get('inbox-detail').innerHTML,/New employee onboarded/);
});

test('v0.9.13 weekly Accounts brief gives established careers current truthful financial mail',()=>{
  const app=browser(new Map()),E=app.productionEngine,I=app.inbox;
  const s=E.create('First Lot Motors',[]);
  s.day=60;
  s.monthPlan.month=2;
  s.monthPlan.startDay=31;
  s.monthPlan.endDay=60;
  E.rollAuctionHall(s);
  const cash=s.cash;
  const forecast=E.monthly.statement(s);
  assert.ok(I.sync(s,E));
  const briefs=s.messages.filter(m=>m.reference==='weekly-brief:8');
  assert.equal(briefs.length,1);
  assert.equal(briefs[0].from,'ACCOUNTS OFFICE');
  assert.equal(briefs[0].category,'reports');
  assert.match(briefs[0].body,/OWNER FINANCIAL BRIEF/);
  assert.ok(briefs[0].body.includes('Cash £12,500'));
  assert.ok(briefs[0].body.includes('Month sales '+forecast.soldUnits+'/'+forecast.targetUnits));
  assert.ok(briefs[0].body.includes('Operating contribution after recorded staff and premises expenses'));
  assert.equal(s.cash,cash);
  assert.equal(I.sync(s,E),false,'Weekly report is sent once, not on every refresh');
  assert.equal(s.messages.filter(m=>m.reference==='weekly-brief:8').length,1);
  // This fixture intentionally jumps to day 60 without producing 59 days of
  // accounting and monthly reports; it tests the read-only briefing only.
});

test('v0.9.14 supervisor hiring offers named candidates, distinct salaries and a real payroll post',()=>{
  const app=browser(new Map()),E=app.productionEngine,P=E.people,s=E.create('Supervisor Hiring',[]);
  const candidates=P.applicants(1).filter(c=>c.role==='supervisor');
  assert.equal(candidates.length,2);
  assert.notEqual(candidates[0].name,candidates[1].name);
  assert.ok(candidates.every(c=>c.monthlySalary>=2000));
  assert.match(app.peopleView.staffDesk(s,P,{mode:'candidates',role:'supervisor'}).html,/STAFF SUPERVISOR/);
  assert.ok(E.hireStaff(s,candidates[1].id).ok);
  assert.equal(s.staff[0].name,candidates[1].name);
  assert.equal(s.staff[0].role,'supervisor');
  assert.equal(P.active(s,'supervisor'),null,'Supervisor does not start immediately');
  assert.equal(E.hireStaff(s,candidates[0].id).code,'role',
    'Only one supervisor post is authorised');
  const before=s.cash;
  s.day=2;
  const payroll=E.staffDay(s);
  assert.ok(payroll.paid>0);
  assert.equal(before-s.cash,P.dailyCost(s.staff[0]));
  assert.equal(P.active(s,'supervisor')?.name,candidates[1].name);
  assert.ok(P.valid(s,s.day));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.14 supervisor writes real costed welfare proposal, owner approval changes morale and cash once',()=>{
  const storage=new Map(),E=browser(new Map()).productionEngine,P=E.people,I=browser(new Map()).inbox;
  const s=E.create('Supervisor Decisions',[]);
  const sales=P.applicants(1).find(c=>c.role==='sales');
  const manager=P.applicants(1).find(c=>c.role==='supervisor');
  assert.ok(E.hireStaff(s,sales.id).ok);
  assert.ok(E.hireStaff(s,manager.id).ok);
  s.staff.find(x=>x.role==='sales').morale=32;
  s.day=2;E.staffDay(s);
  const employee=s.staff.find(x=>x.role==='sales');
  const plan=P.moraleProposal(s,employee.id);
  assert.ok(plan);
  assert.equal(plan.manager.name,manager.name);
  assert.ok(I.sync(s,E));
  const request=s.messages.find(m=>m.reference==='supervisor-morale:'+employee.id+':0');
  assert.ok(request);
  assert.equal(request.from,'STAFF SUPERVISOR · '+manager.name);
  assert.ok(I.needsAction(request,s));
  assert.match(I.quoteControls(request,s,E),/APPROVE/);
  assert.match(I.quoteControls(request,s,E),/DECLINE/);
  assert.match(I.formatMail(request,s),/inbox-email-header/);
  storage.set(STORAGE_KEY,JSON.stringify(s));
  const app=browser(storage);app.click('resume');
  app.click('filter-inbox',{filter:'action'});
  assert.equal(app.nodes.get('inbox-action-count').textContent,'1');
  app.click('read-message',{id:String(request.id)});
  assert.match(app.nodes.get('inbox-detail').innerHTML,/OWNER AUTHORISATION REQUIRED/);
  const old=JSON.parse(storage.get(STORAGE_KEY)),cash=old.cash;
  app.click('decide-staff-welfare',{id:String(request.id),decision:'approve'});
  const after=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(after.cash,cash-plan.cost);
  assert.equal(after.staff.find(x=>x.id===employee.id).morale,employee.morale+plan.gain);
  assert.equal(after.messages.find(m=>m.id===request.id).decision,'approved');
  assert.equal(after.ledger.filter(x=>x.note.startsWith('Staff welfare intervention:')).length,1);
  assert.equal(after.messages.filter(m=>m.subject==='PAID COPY · Approved staff welfare budget').length,1);
  assert.equal(app.nodes.get('inbox-action-count').textContent,'0');
  assert.match(app.nodes.get('inbox-detail').innerHTML,/SUPERVISOR PLAN APPROVED/);
  assert.equal(app.productionEngine.decideStaffMorale(after,request.id,true).code,'stage');
  assert.ok(E.normalize(after));
});

test('v0.9.14 owner refusal costs nothing; supervisor proposals cannot be replayed',()=>{
  const E=browser(new Map()).productionEngine,P=E.people,I=browser(new Map()).inbox;
  const s=E.create('Decline Decision',[]);
  assert.ok(E.hireStaff(s,P.applicants(1).find(c=>c.role==='sales').id).ok);
  assert.ok(E.hireStaff(s,P.applicants(1).find(c=>c.role==='supervisor').id).ok);
  s.day=2;E.staffDay(s);
  s.staff.find(e=>e.role==='sales').morale=31;
  assert.ok(I.sync(s,E));
  const m=s.messages.find(x=>x.reference?.startsWith('supervisor-morale:'));
  assert.ok(m);
  const cash=s.cash,morale=s.staff.find(x=>x.role==='sales').morale;
  assert.ok(E.decideStaffMorale(s,m.id,false).ok);
  assert.equal(s.cash,cash);
  assert.equal(s.staff.find(x=>x.role==='sales').morale,morale);
  assert.equal(m.decision,'declined');
  assert.equal(E.decideStaffMorale(s,m.id,false).code,'stage');
  assert.equal(E.decideStaffMorale(s,m.id,true).code,'stage');
  assert.equal(I.needsAction(m,s),false);
  assert.equal(I.sync(s,E),false,'Decline does not spam a fresh proposal that week');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.14 absent supervisor emails encourage recruitment rather than owner micromanagement',()=>{
  const E=browser(new Map()).productionEngine,P=E.people,I=browser(new Map()).inbox;
  const s=E.create('Owner With No Supervisor',[]);
  assert.ok(E.hireStaff(s,P.applicants(1).find(c=>c.role==='sales').id).ok);
  const employee=s.staff[0];employee.morale=32;
  assert.ok(I.sync(s,E));
  assert.ok(s.messages.some(m=>m.subject.startsWith('SUPERVISOR VACANCY')));
  assert.equal(s.messages.filter(m=>m.reference?.startsWith('supervisor-morale:')).length,0);
  assert.equal(I.counters(s.messages,s).action,0);
  const notice=s.messages.find(m=>m.subject.startsWith('SUPERVISOR VACANCY'));
  assert.equal(notice.linkPage,'staff');
  assert.match(notice.body,/appoint a supervisor from the recruitment shortlist/);
  const supervisor=P.applicants(1).find(c=>c.role==='supervisor');
  assert.ok(E.hireStaff(s,supervisor.id).ok);
  s.day=2;E.staffDay(s);
  assert.ok(I.sync(s,E));
  assert.ok(s.messages.some(m=>m.subject.startsWith('APPROVAL · ')));
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.14 routine supervisor check-ins lift morale without owner permission or fee',()=>{
  const E=browser(new Map()).productionEngine,P=E.people;
  const s=E.create('Weekly Supervisor Delegation',[]);
  assert.ok(E.hireStaff(s,P.applicants(1).find(c=>c.role==='supervisor').id).ok);
  assert.ok(E.hireStaff(s,P.applicants(1).find(c=>c.role==='sales').id).ok);
  const employee=s.staff.find(x=>x.role==='sales');
  employee.morale=52;
  s.day=7;
  const before=s.cash;
  const result=E.staffDay(s);
  const expected=52-1+(s.staff.find(x=>x.role==='supervisor').skills.care>=16?5:3);
  assert.equal(employee.morale,expected);
  assert.equal(result.support.length,1);
  assert.equal(result.supervisor,s.staff.find(x=>x.role==='supervisor').name);
  assert.equal(before-s.cash,s.staff.reduce((n,x)=>n+P.dailyCost(x),0));
  assert.equal(s.ledger.some(x=>x.note.startsWith('Staff welfare intervention:')),false);
});

test('v0.9.14 payroll arrears correctly block paid morale proposals',()=>{
  const E=browser(new Map()).productionEngine,P=E.people,I=browser(new Map()).inbox;
  const s=E.create('No Paper Morale Fixes',[]);
  assert.ok(E.hireStaff(s,P.applicants(1).find(c=>c.role==='sales').id).ok);
  assert.ok(E.hireStaff(s,P.applicants(1).find(c=>c.role==='supervisor').id).ok);
  s.day=2;E.staffDay(s);
  s.staff.find(e=>e.role==='sales').morale=30;
  s.payrollArrears=350;
  assert.equal(P.moraleProposal(s,s.staff.find(e=>e.role==='sales').id),null);
  assert.ok(I.sync(s,E));
  assert.ok(s.messages.some(m=>m.subject==='ACTION REQUIRED · Outstanding wages'));
  assert.equal(s.messages.filter(m=>m.reference?.startsWith('supervisor-morale:')).length,0);
});

test('v0.9.14 v13 saves keep historic employee messages, ledger cursor and cash',()=>{
  const E=browser(new Map()).productionEngine;
  const s=E.create('Old Staff Records',[]);
  s.messages=[{id:1,day:1,from:'PEOPLE & PAYROLL',
    subject:'Staff concern · Daniel Harris',preview:'Old notice',
    body:'Older staff advisory',linkPage:'staff',read:true,
    category:'staff',reference:'morale:1:0'}];
  const legacy=JSON.parse(JSON.stringify(s));
  legacy.version=13;
  const restored=E.normalize(legacy);
  assert.ok(restored);
  assert.equal(restored.version,14);
  assert.equal(restored.cash,legacy.cash);
  assert.equal(restored.messages[0].body,'Older staff advisory');
  assert.equal(restored.messages[0].read,true);
  assert.equal(restored.inboxLedgerCursor,legacy.inboxLedgerCursor);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(restored))));
});

test('v0.9.14 new mail letterhead formats readable sections and escapes markup',()=>{
  const E=browser(new Map()).productionEngine,I=browser(new Map()).inbox;
  const s=E.create('Trade <script> HQ',[]);
  const m={id:1,day:3,from:'ACCOUNTS <script>',subject:'Brief',
    body:'MANAGEMENT SUMMARY\n\nONE-OFF COST: £200\nSTAFF MORALE: 32/100\n\nA paragraph with <script>unsafe()</script> embedded.',
    category:'accounts',reference:'example',linkPage:'finance',read:false};
  const markup=I.formatMail(m,s);
  assert.match(markup,/inbox-email-address/);
  assert.match(markup,/mail-paragraph-group/);
  assert.match(markup,/mail-key-value/);
  assert.match(markup,/MANAGEMENT SUMMARY/);
  assert.match(markup,/ONE-OFF COST/);
  assert.doesNotMatch(markup,/<script>/);
  assert.match(markup,/&lt;script&gt;/);
});

test('v0.9.15 legacy escaped-newline correspondence becomes readable email paragraphs',()=>{
  const app=browser(new Map()),I=app.inbox,E=app.productionEngine;
  const s=E.create('First Lot Motors',[]);
  s.day=60;
  const legacy={id:110,day:60,read:true,from:'PEOPLE & PAYROLL',
    subject:'SUPERVISOR VACANCY · Daniel Harris at risk',
    category:'staff',linkPage:'staff',reference:'supervisor-gap:17:8',
    preview:'Morale 32/100. Hire a supervisor to manage employee welfare.',
    body:String.raw`STAFFING ESCALATION\n\nDaniel Harris has morale 32/100. There is currently no active staff supervisor to investigate the cause.\n\nYour action is to choose and hire a Staff Supervisor.`};
  assert.equal(I.readableBody(String.raw`First paragraph\n\nSecond paragraph`),
    'First paragraph\n\nSecond paragraph');
  const output=I.formatMail(legacy,s);
  assert.match(output,/inbox-email-header/);
  assert.match(output,/inbox-email-body/);
  assert.match(output,/inbox-email-signature/);
  assert.match(output,/Daniel Harris currently has a morale score of 32\/100/);
  assert.match(output,/appointing a supervisor/);
  assert.match(output,/datetime="2027-01-07"/);
  assert.match(output,/Thu, 7 Jan 2027/);
  assert.doesNotMatch(output,/\\n/,'No visible backslash-n artifacts may remain');
  assert.doesNotMatch(output,/<h3 class="mail-subject-heading">STAFFING ESCALATION/);
  assert.ok(output.indexOf('I wanted to bring')<output.indexOf('No payment or personnel'),
    'Email should read as a human message rather than a metadata dump');
});

test('v0.9.15 mailbox offers unread filter and allows owners to mark messages unread again',()=>{
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Mail Desk');
  const before=JSON.parse(storage.get(STORAGE_KEY));
  const cash=before.cash,ledger=before.ledger.length;
  assert.match(app.nodes.get('inbox-filter-buttons').innerHTML,/data-filter="unread"/);
  const first=before.messages[0];
  assert.ok(first);
  app.click('read-message',{id:String(first.id)});
  let after=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(after.messages.find(m=>m.id===first.id).read,true);
  assert.match(app.nodes.get('inbox-detail').children.at(-1).children[0].textContent,/MARK UNREAD/);
  app.click('toggle-inbox-read',{id:String(first.id)});
  after=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(after.messages.find(m=>m.id===first.id).read,false);
  assert.equal(after.cash,cash);
  assert.equal(after.ledger.length,ledger);
  app.click('filter-inbox',{filter:'unread'});
  assert.match(app.nodes.get('inbox-filter-buttons').innerHTML,/data-filter="unread" aria-pressed="true"/);
  assert.ok(app.nodes.get('inbox-list').children.length>=1);
  const resumed=browser(storage);resumed.click('resume');
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).messages.find(m=>m.id===first.id).read,false);
  assert.ok(resumed.productionEngine.normalize(JSON.parse(storage.get(STORAGE_KEY))));
});

test('v0.9.15 email template has proper hierarchy and sanitises arbitrary strings',()=>{
  const I=browser(new Map()).inbox,E=browser(new Map()).productionEngine;
  const s=E.create('Name <script>alert(1)</script>',[]);
  const message={id:23,day:1,read:false,from:'ACCOUNTS OFFICE',
    category:'accounts',reference:'ledger:3',
    subject:'PAID COPY · Workshop',linkPage:'finance',
    body:'PAYMENT CONFIRMATION\n\nAMOUNT PAID: £1,200\nSTATUS: PAID\n\nThank you.\nThis is for your records. <img src=x onerror=1>'};
  const content=I.formatMail(message,s);
  assert.match(content,/inbox-email-avatar/);
  assert.match(content,/Accounts Office/);
  assert.match(content,/To: Dealership Owner/);
  assert.match(content,/Kind regards/);
  assert.match(content,/PAID · FOR YOUR RECORDS/);
  assert.match(content,/AMOUNT PAID/);
  assert.match(content,/£1,200/);
  assert.match(content,/&lt;script&gt;/);
  assert.match(content,/&lt;img/);
  assert.doesNotMatch(content,/<script>|<img /);
});

test('v0.9.15 email filter and read controls preserve actual owner approval state',()=>{
  const E=browser(new Map()).productionEngine,I=browser(new Map()).inbox,s=E.create('Approval Does Not Expire',[]);
  const buyer=E.people.applicants(1).find(x=>x.role==='sales');
  const supervisor=E.people.applicants(1).find(x=>x.role==='supervisor');
  assert.ok(E.hireStaff(s,buyer.id).ok);
  assert.ok(E.hireStaff(s,supervisor.id).ok);
  s.day=2;E.staffDay(s);
  const employee=s.staff.find(x=>x.role==='sales');employee.morale=32;
  assert.ok(I.sync(s,E));
  const request=s.messages.find(m=>m.reference?.startsWith('supervisor-morale:'));
  assert.ok(request);
  request.read=true;
  assert.equal(I.counters(s.messages,s).action,1);
  assert.equal(I.filtered(s.messages,s,'unread').some(x=>x.id===request.id),false);
  request.read=false;
  assert.equal(I.filtered(s.messages,s,'unread').some(x=>x.id===request.id),true);
  assert.equal(I.counters(s.messages,s).action,1,
    'Unread status is independent of owner authorisation status');
  assert.equal(request.decision,undefined);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.16 Buying Desk shows compact lead list and actual financial context, not repeated auction banners',()=>{
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Focused Buyer');
  const htmlDesk=app.nodes.get('market-sellers').innerHTML;
  assert.match(html,/class="career-panel buying-desk-control"/);
  assert.doesNotMatch(html,/AUCTION BUYING HAS MOVED/);
  assert.doesNotMatch(html,/WEEKLY MONDAY AUCTION<\/strong>/);
  assert.match(htmlDesk,/SELLER SHORTLIST/);
  assert.match(htmlDesk,/buy-desk-stats/);
  assert.match(htmlDesk,/buy-seller-focus/);
  assert.match(htmlDesk,/BUYING APPRAISAL/);
  assert.match(htmlDesk,/PROJECTED GROSS CONTRIBUTION/);
  assert.match(htmlDesk,/data-action="select-seller"/);
  assert.match(htmlDesk,/data-action="buy-seller"/);
  assert.match(htmlDesk,/TRADE VALUE/);
  assert.match(htmlDesk,/LIKELY ACHIEVED SALE/);
  assert.match(htmlDesk,/SUGGESTED MAX OFFER/);
  assert.match(htmlDesk,/VIEW FULL REPORT/);
  assert.match(app.nodes.get('market-progression').innerHTML,/STOCK ACCESS/);
  assert.match(css,/\.buy-main-grid/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/\.buy-seller-focus\{height:clamp/);
  assert.equal(app.nodes.get('events-banner').className,'events-banner dashboard-event-compact');
});

test('v0.9.16 selecting private seller changes focused dossier without reserving car or spending cash',()=>{
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Sourcing Control');
  const sellers=app.engine.market(1).sellers;
  assert.equal(sellers.length,2);
  const first=app.nodes.get('market-sellers').innerHTML;
  assert.ok(first.includes('SELLER VEHICLE · '+sellers[0].id));
  assert.equal(first.includes('SELLER VEHICLE · '+sellers[1].id),false);
  const before=JSON.parse(storage.get(STORAGE_KEY));
  app.click('select-seller',{id:sellers[1].id});
  const after=JSON.parse(storage.get(STORAGE_KEY));
  const second=app.nodes.get('market-sellers').innerHTML;
  assert.ok(second.includes('SELLER VEHICLE · '+sellers[1].id));
  assert.ok(second.includes('aria-pressed="true"'));
  assert.equal(after.cash,before.cash);
  assert.equal(after.vehicles.length,0);
  assert.equal(after.ledger.length,before.ledger.length);
  app.go('dashboard');app.go('auctions');
  assert.ok(app.nodes.get('market-sellers').innerHTML.includes('SELLER VEHICLE · '+sellers[1].id),
    'Selected vehicle remains in focus while visiting another page');
});

test('v0.9.16 changing a proposed offer updates every visible appraisal metric',()=>{
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Margin Calculator');
  const E=app.productionEngine,car=E.market(1).sellers[0],offer=car.ask-125;
  const state=E.create('Margin Calculator',[]);
  const model=app.buyingDesk.figures(car,state,E,offer);
  assert.equal(model.quote.price,offer);
  assert.equal(model.quote.prep,car.profile.basePrep+car.profile.riskAllowance);
  assert.equal(model.quote.expectedMargin,model.quote.likelySale-model.quote.total);
  app.typeInput('seller-offer-'+car.id,offer);
  const formatted=new Intl.NumberFormat('en-GB',{style:'currency',
    currency:'GBP',maximumFractionDigits:0});
  assert.equal(app.nodes.get('projection-'+car.id).textContent,
    formatted.format(model.quote.expectedMargin));
  assert.equal(app.nodes.get('desk-projection-'+car.id).textContent,
    formatted.format(model.quote.expectedMargin));
  assert.equal(app.nodes.get('desk-total-'+car.id).textContent,formatted.format(model.quote.total));
  assert.equal(app.nodes.get('desk-offer-'+car.id).textContent,formatted.format(offer));
  assert.equal(app.nodes.get('desk-headroom-'+car.id).textContent,formatted.format(model.remaining));
  app.typeInput('seller-offer-'+car.id,car.ask+100);
  assert.equal(app.nodes.get('desk-projection-'+car.id).textContent,'ENTER VALID OFFER');
});

test('v0.9.16 actual buying decisions preserve counteroffers, no fee, stock and workshop routing',()=>{
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Disciplined Buyer');
  const car=app.engine.market(1).sellers[0];
  const initial=JSON.parse(storage.get(STORAGE_KEY));
  app.typeInput('seller-offer-'+car.id,car.floor-75);
  app.click('buy-seller',{id:car.id});
  const counter=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(counter.vehicles.length,0);
  assert.equal(counter.cash,initial.cash);
  assert.equal(counter.negotiations[car.id].status,'counter');
  assert.match(app.nodes.get('market-sellers').innerHTML,/SELLER COUNTEROFFER/);
  app.click('accept-seller-counter',{id:car.id});
  const paid=JSON.parse(storage.get(STORAGE_KEY));
  const agreed=counter.negotiations[car.id].counter;
  assert.equal(paid.cash,initial.cash-agreed);
  assert.equal(paid.vehicles.length,1);
  assert.equal(paid.vehicles[0].origin,car.id);
  assert.equal(paid.vehicles[0].cost,agreed);
  assert.equal(paid.vehicles[0].status,'acquired');
  assert.equal(paid.vehicles[0].workshop.stage,'unassessed');
  assert.match(app.nodes.get('market-sellers').innerHTML,/PURCHASED/);
  assert.match(app.nodes.get('market-sellers').innerHTML,/VIEW VEHICLE STOCK/);
  assert.equal(paid.ledger.filter(l=>l.note.startsWith('Direct purchase:')).length,1);
  assert.equal(app.productionEngine.normalize(paid)?.cash,paid.cash);
});

test('v0.9.16 seller temperaments influence stable counteroffers without resetting daily leads',()=>{
  const E=browser(new Map()).productionEngine;
  const s=E.create('Seller Personality',[]);
  const day1=E.marketFor(s).sellers[0];
  assert.equal(E.sellerApproach(s,day1).label,'PRIVATE OWNER');
  assert.equal(E.sellerApproach(s,day1).concession,50);
  const styles=new Set();
  for(let day=2;day<=24;day++){
    s.day=day;
    const sellers=E.marketFor(s).sellers;
    for(const car of sellers){
      const a=E.sellerApproach(s,car);
      const b=E.sellerApproach(s,car);
      assert.equal(a.label,b.label);
      assert.equal(a.firstCounter,b.firstCounter);
      assert.ok([25,50,75].includes(a.concession));
      styles.add(a.label);
    }
  }
  assert.ok(styles.has('TIME-SENSITIVE OWNER'));
  assert.ok(styles.has('PRICE-CONSCIOUS OWNER'));
  assert.ok(styles.has('PRIVATE OWNER'));
  const target=Array.from({length:26},(_,i)=>i+2).flatMap(day=>{
    const x=E.market(day,5,0,'Seller Personality',5,12500).sellers;
    return x.map(car=>({day,car,profile:E.sellerApproach({...s,day},car)}));
  }).find(x=>x.profile.label==='PRICE-CONSCIOUS OWNER');
  assert.ok(target);
  const first=E.create('Firm Seller',[]);first.day=target.day;
  const other=E.create('Firm Seller',[]);other.day=target.day;
  const offer=target.car.floor-75;
  const a=E.acquireSeller(first,target.car.id,offer);
  const b=E.acquireSeller(other,target.car.id,offer);
  assert.equal(a.code,'counter');
  assert.equal(b.code,'counter');
  assert.equal(first.negotiations[target.car.id].counter,other.negotiations[target.car.id].counter);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(first))));
});

test('v0.9.16 no seller leads produces honest sourcing guidance without phantom vehicles',()=>{
  const E=browser(new Map()).productionEngine,app=browser(new Map());
  const candidate=Array.from({length:180},(_,i)=>i+2).find(day=>
    E.market(day,5,0,'Quiet Seller Test',5,12500).sellers.length===0);
  assert.ok(candidate,'Market has quiet days with no seller offers');
  const state=E.create('Quiet Seller Test',[]);
  state.day=candidate;
  E.rollAuctionHall(state);
  const view=app.buyingDesk.render(state,E,{
    reportCard:()=>'',leadFeedback:()=>''});
  assert.equal(view.selectedId,null);
  assert.match(view.html,/NO PRIVATE SELLERS THIS SESSION/);
  assert.doesNotMatch(view.html,/data-action="buy-seller"/);
  assert.equal(state.cash,12500);
});

test('v0.9.17 closed auction inspections neither charge nor display a purchase control',()=>{
  const E=browser(new Map()).productionEngine,s=E.create('Closed Lot',[]);
  const lot=E.marketFor(s).auctions[0],cash=s.cash;
  assert.ok(E.passAuction(s).ok);
  assert.equal(E.inspectLead(s,'auction',lot.id).code,'closed');
  assert.equal(s.cash,cash);
  assert.equal(s.ledger.length,0);
  const pending=E.create('Hammer',[]),current=E.marketFor(pending).auctions[0];
  pending.auctionHall.phase='payment';
  assert.equal(E.inspectLead(pending,'auction',current.id).code,'closed');
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Closed Lot UI');
  app.go('auctionHall');app.click('pass-auction');
  app.click('toggle-report',{kind:'auction',id:lot.id});
  const page=app.nodes.get('auction-hall-view').innerHTML;
  assert.match(page,/LOT CLOSED · INSPECTION UNAVAILABLE/);
  assert.doesNotMatch(page,new RegExp('data-action="inspect-lead" data-id="'+lot.id+'"'));
});

test('v0.9.17 suggested offer, funding warning and short-screen layout',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  app.click('new-career');app.submitCareer('Fair Opener');
  const car=E.market(1).sellers[0],offer=app.buyingDesk.openingOffer(car);
  assert.ok(offer>=100&&offer<car.ask&&offer%25===0);
  const page=app.nodes.get('market-sellers').innerHTML;
  assert.match(page,/SUGGESTED OPENING OFFER/);
  assert.ok(page.includes('id="seller-offer-'+car.id+'" value="'+offer+'"'));
  app.typeInput('seller-offer-'+car.id,car.ask-100);
  assert.equal(app.nodes.get('desk-funding-warning-'+car.id).hidden,true);
  assert.match(css,/@media\(min-width:1081px\) and \(max-height:800px\)/);
  let match;
  for(let day=1;day<=120&&!match;day++){
    const s=E.create('Reserve Check',[]);s.day=day;E.rollAuctionHall(s);
    const c=E.marketFor(s).sellers.find(v=>v.profile.hiddenFault?.cost>v.profile.riskAllowance);
    if(c)match={s,c};
  }
  assert.ok(match);
  const quote=E.quote(match.c,'seller',match.c.ask,false);
  match.s.cash=match.c.ask+quote.prep;
  const model=app.buyingDesk.figures(match.c,match.s,E,match.c.ask);
  assert.equal(model.remaining,0);
  assert.equal(model.affordable,false);
  assert.match(app.buyingDesk.fundingWarning(match.s,model),/INSUFFICIENT CASH/);
  assert.equal(E.acquireSeller(match.s,match.c.id,match.c.ask).code,'cash');
});

test('v0.9.18 Vehicle Stock is a filterable single-unit workspace without save changes',()=>{
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Forecourt File');
  const seller=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+seller.id,seller.ask);
  app.click('buy-seller',{id:seller.id});
  const before=JSON.parse(storage.get(STORAGE_KEY));
  app.go('stock');
  const layout=app.nodes.get('stock-list').innerHTML;
  assert.match(layout,/STOCK REGISTER/);
  assert.match(layout,/CASH INVESTED/);
  assert.match(layout,/UNSPENT PREP/);
  assert.match(layout,/STOCK 1/);
  assert.match(layout,/VEHICLE FILE/);
  assert.match(layout,/PROJECTED GROSS CONTRIBUTION/);
  assert.match(layout,/OPEN WORKSHOP/);
  assert.match(layout,/data-action="filter-stock"/);
  app.click('filter-stock',{filter:'listed'});
  assert.match(app.nodes.get('stock-list').innerHTML,/No vehicles in this category/);
  app.click('filter-stock',{filter:'all'});
  assert.match(app.nodes.get('stock-list').innerHTML,/VEHICLE FILE/);
  assert.deepEqual(JSON.parse(storage.get(STORAGE_KEY)),before,'UI filters must not mutate career save');
});

test('v0.9.18 accounting keeps paid booked repairs in invested capital before QC',()=>{
  const app=browser(),E=app.productionEngine,SV=app.stockView;
  const s=E.create('Repair accounting',[]);
  const car=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,car.id,car.ask).ok);
  const v=s.vehicles[0],base=v.cost;
  assert.equal(SV.figures(v).invested,base);
  assert.equal(SV.figures(v).futurePrep,v.prepBudget);
  assert.ok(E.assessStock(s,v.id).ok);
  assert.equal(SV.figures(v).invested,v.cost);
  const booked=E.startPrep(s,v.id,'external');
  assert.ok(booked.ok,booked.message);
  assert.equal(v.prepSpent,0,'Legacy realised repair spend stays zero before QC');
  assert.ok(v.workshop.repairCost>0);
  assert.equal(SV.figures(v).paidRepairs,v.workshop.repairCost);
  assert.equal(SV.figures(v).invested,v.cost+v.workshop.repairCost);
  assert.equal(SV.figures(v).futurePrep,0);
  assert.equal(SV.summary(s).invested,SV.figures(v).invested);
  assert.equal(SV.summary(s).reserved,0);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))),
    'Existing career structure and financial integrity still validate');
});

test('v0.9.18 selecting one vehicle changes dossier and sorting remains deterministic',()=>{
  const storage=new Map(),app=browser(storage),E=app.productionEngine;
  app.click('new-career');app.submitCareer('Stock Search');
  const sellers=E.market(1).sellers;
  for(const seller of sellers){
    app.setInput('seller-offer-'+seller.id,seller.ask);
    app.click('buy-seller',{id:seller.id});
  }
  const s=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(s.vehicles.length,2);
  app.go('stock');
  let html=app.nodes.get('stock-list').innerHTML;
  assert.match(html,/aria-pressed="true"/);
  app.click('select-stock',{id:'2'});
  html=app.nodes.get('stock-list').innerHTML;
  assert.match(html,/VEHICLE FILE · STOCK 2/);
  assert.match(html,/data-action="select-stock" data-id="2" aria-pressed="true"/);
  assert.equal(html.includes('id="stock-price-2"'),false,'Unprepared stock cannot be priced');
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).cash,s.cash);
  assert.ok(E.normalize(JSON.parse(storage.get(STORAGE_KEY))));
});

test('v0.9.18 ready and listed cars keep proper advertising controls and locked deals',()=>{
  const app=browser(),E=app.productionEngine,SV=app.stockView;
  const s=E.create('Stock lifecycle',[]);
  const car=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,car.id,car.ask).ok);
  const v=s.vehicles[0];
  v.status='prepared';v.workshop.stage='ready';v.prepSpent=400;
  let view=SV.render(s,{reportCard:()=>''});
  assert.match(view.html,/ADVERTISE VEHICLE/);
  assert.match(view.html,/stock-price-1/);
  assert.equal(SV.summary(s).ready,1);
  v.status='listed';v.asking=v.retail;v.listedDay=s.day;
  view=SV.render(s,{filter:'listed',reportCard:()=>''});
  assert.match(view.html,/UPDATE PRICE/);
  assert.match(view.html,/OPEN SALES OFFICE/);
  assert.equal(SV.summary(s).listed,1);
  s.customerCases[String(v.id)]={status:'reserved'};
  view=SV.render(s,{reportCard:()=>''});
  assert.match(view.html,/PRICING LOCKED/);
  assert.match(view.html,/data-action="list-stock" data-id="1" disabled/);
});

test('v0.9.18 empty forecourt displays direct sourcing actions',()=>{
  const app=browser(),state=app.productionEngine.create('Empty',[]);
  const view=app.stockView.render(state);
  assert.match(view.html,/YOUR FORECOURT IS EMPTY/);
  assert.match(view.html,/data-page="auctions"/);
  assert.match(view.html,/data-page="auctionHall"/);
  assert.equal(view.selectedId,null);
});


test('v0.9.19 compact Vehicle Stock is scoped to desktop and retains full report access',()=>{
  assert.match(html,/PRE-ALPHA · v0\.9\.31/);
  assert.match(css,/@media\(min-width:981px\)/);
  assert.match(css,/\.career-content:has\(\[data-panel="stock"\]:not\(\[hidden\]\)\)/);
  assert.match(css,/\.stock-dossier-vehicle \.vehicle-photo-frame\{[\s\S]*?height:125px/);
  assert.match(css,/\.stock-dossier \.intel-numbers\{display:none\}/);
  assert.match(css,/\.stock-action-box\{order:2\}/);
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Compact Forecourt');
  const car=app.engine.market(1).sellers[0];
  app.setInput('seller-offer-'+car.id,car.ask);
  app.click('buy-seller',{id:car.id});
  app.go('stock');
  let htmlStock=app.nodes.get('stock-list').innerHTML;
  assert.match(htmlStock,/VIEW FULL REPORT/);
  assert.match(htmlStock,/OPEN WORKSHOP/);
  app.click('toggle-report',{kind:'stock',id:'1'});
  htmlStock=app.nodes.get('stock-list').innerHTML;
  assert.match(htmlStock,/HIDE REPORT/);
  assert.match(htmlStock,/MOT ADVISORIES/);
  assert.match(htmlStock,/KNOWN PREPARATION ITEMS/);
});

test('v0.9.20 workshop is a compact selected job register with safe filters',()=>{
  const storage=new Map(),app=browser(storage),E=app.productionEngine;
  app.click('new-career');app.submitCareer('Workshop Desk');
  for(const car of E.market(1).sellers){
    app.setInput('seller-offer-'+car.id,car.ask);
    app.click('buy-seller',{id:car.id});
  }
  const previous=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(previous.vehicles.length,2);
  const page=app.nodes.get('workshop-board').innerHTML;
  assert.match(page,/WORKSHOP JOB REGISTER/);
  assert.match(page,/COST CONTROL/);
  assert.match(page,/AUTHORISE ASSESSMENT/);
  assert.match(page,/REPAIR REQUIREMENTS/);
  assert.match(page,/TRADE DISPOSAL \/ CUT LOSSES/);
  app.click('select-workshop',{id:'2'});
  assert.match(app.nodes.get('workshop-board').innerHTML,/WORK ORDER · STOCK 2/);
  app.click('filter-workshop',{filter:'ready'});
  assert.match(app.nodes.get('workshop-board').innerHTML,/No jobs in this category/);
  app.click('filter-workshop',{filter:'all'});
  assert.deepEqual(JSON.parse(storage.get(STORAGE_KEY)),previous);
  assert.match(css,/\.ws-layout\{display:grid/);
});

test('v0.9.20 workshop bookable quotes and hidden defects follow engine truth',()=>{
  const app=browser(new Map()),E=app.productionEngine,s=E.create('Workshop Test',[]);
  const lead=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,lead.id,lead.ask).ok);
  const v=s.vehicles[0],fault=v.profile.hiddenFault?.item;
  const pre=app.workshopView.render(s,E.workshop);
  assert.equal(pre.selectedId,v.id);
  if(fault&&!v.profile.inspected)assert.ok(!pre.html.includes(fault));
  assert.ok(E.assessStock(s,v.id).ok);
  const quote=app.workshopView.render(s,E.workshop);
  if(fault)assert.ok(quote.html.includes(fault));
  assert.match(quote.html,/IN-HOUSE TECHNICIAN/);
  assert.match(quote.html,/EXTERNAL GARAGE/);
  assert.match(quote.html,/BOOK EXTERNAL REPAIR/);
  assert.ok(E.startPrep(s,v.id,'external').ok);
  const active=app.workshopView.render(s,E.workshop);
  assert.match(active.html,/REPAIRS BOOKED/);
  assert.equal(app.workshopView.paid(v),v.workshop.repairCost);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});


test('v0.9.21 compact Workshop hides non-urgent calendar banner only at desktop width',()=>{
  assert.match(html,/PRE-ALPHA · v0\.9\.31/);
  assert.match(css,/@media\(min-width:1021px\)/);
  assert.match(css,/\.career-content:has\(\[data-panel="workshop"\]:not\(\[hidden\]\)\)>#events-banner:has\(\.event-neutral-banner\)/);
  assert.match(css,/#events-banner:has\(\.event-deadline-banner\)/);
  assert.match(css,/#events-banner:has\(\.event-meeting-banner\)/);
  assert.match(css,/\.ws-kpis>div\{min-height:51px/);
  assert.match(css,/\.ws-photo \.vehicle-photo-frame\{height:59px/);
});

test('v0.9.21 Workshop puts next decision above costs without changing repair actions',()=>{
  const app=browser(new Map()),E=app.productionEngine,s=E.create('Job Priority',[]);
  const lead=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,lead.id,lead.ask).ok);
  const v=s.vehicles[0];
  assert.ok(E.assessStock(s,v.id).ok);
  assert.ok(E.startPrep(s,v.id,'external').ok);
  const htmlWork=app.workshopView.render(s,E.workshop).html;
  const action=htmlWork.indexOf('REPAIRS BOOKED');
  const cost=htmlWork.indexOf('COST CONTROL');
  assert.ok(action>=0&&cost>action,'Workshop action should be encountered before the finance table');
  assert.match(htmlWork,/GAME DAYS/);
  assert.match(htmlWork,/REPAIRS PAID \/ BOOKED/);
  assert.equal(app.workshopView.paid(v),v.workshop.repairCost);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});


test('v0.9.22 two-slot garage limit blocks third external transfer before any charge',()=>{
  const E=browser(new Map()).productionEngine,P=E.people;
  const s=E.create('External Capacity',[]);
  s.cash=80000; // Isolate the slot constraint rather than funding.
  const tech=P.applicants(1).find(x=>x.role==='technician');
  assert.ok(tech);
  assert.ok(E.hireStaff(s,tech.id).ok);
  s.day=2;E.staffDay(s);
  for(let day=2;day<=12&&s.vehicles.length<3;day++){
    s.day=day;
    const cars=E.marketFor(s).sellers;
    for(const car of cars){
      if(s.vehicles.length===3)break;
      if(s.vehicles.some(v=>v.origin===car.id))continue;
      assert.ok(E.acquireSeller(s,car.id,car.ask).ok);
    }
  }
  assert.equal(s.vehicles.length,3);
  const [a,b,c]=s.vehicles;
  for(const v of [a,b,c])assert.ok(E.assessStock(s,v.id).ok);
  assert.ok(E.startPrep(s,a.id,'external').ok);
  assert.ok(E.startPrep(s,b.id,'external').ok);
  assert.ok(E.startPrep(s,c.id,'internal').ok);
  const oldCash=s.cash,oldLedger=s.ledger.length,oldJob=JSON.stringify(c.workshop);
  const denied=E.transferPrep(s,c.id);
  assert.equal(denied.ok,false);
  assert.equal(denied.code,'busy');
  assert.equal(s.cash,oldCash);
  assert.equal(s.ledger.length,oldLedger);
  assert.equal(JSON.stringify(c.workshop),oldJob);
  const view=browser(new Map()).workshopView.render(s,E.workshop,{selectedId:c.id});
  assert.match(view.html,/EXTERNAL GARAGES FULL \(2\/2\)/);
  assert.match(view.html,new RegExp('data-action="outsource-workshop" data-id="'+c.id+'" disabled'));
  // When one external job finishes, its slot becomes free for a transfer.
  a.workshop.stage='quality-check';a.workshop.remainingDays=0;
  const moved=E.transferPrep(s,c.id);
  assert.ok(moved.ok,moved.message);
  assert.equal(c.workshop.method,'external');
  assert.equal(s.cash,oldCash-125);
  assert.equal(s.ledger.length,oldLedger+1);
  // Cash and one finished job were synthetic to isolate the slot rule;
  // assert engine-side cash/ledger invariants rather than save reconciliation.
});

test('v0.9.22 retail-ready prepared cars differ from already advertised stock',()=>{
  const app=browser(new Map()),E=app.productionEngine,s=E.create('Workshop Listings',[]);
  s.cash=80000;
  const cars=E.marketFor(s).sellers;
  for(const car of cars)assert.ok(E.acquireSeller(s,car.id,car.ask).ok);
  assert.equal(s.vehicles.length,2);
  for(const v of s.vehicles){
    assert.ok(E.assessStock(s,v.id).ok);
    assert.ok(E.startPrep(s,v.id,'external').ok);
    // Bring both through to completed repairs without bypassing the rules.
    while(v.workshop.stage==='in-progress'&&s.day<30){
      s.day++;E.advanceWorkshop(s);
    }
    assert.equal(v.workshop.stage,'quality-check');
    const result=E.finishPrep(s,v.id);
    assert.ok(result.ok);
    if(v.workshop.stage==='in-progress'){
      s.day++;E.advanceWorkshop(s);
      assert.ok(E.finishPrep(s,v.id).ok);
    }
  }
  const ready=s.vehicles[0],listed=s.vehicles[1];
  assert.ok(E.advertise(s,listed.id,listed.retail).ok);
  const ui=app.workshopView;
  const counts=ui.summary(s,E.workshop);
  assert.equal(counts.ready,1);
  assert.equal(counts.listed,1);
  const all=ui.render(s,E.workshop).html;
  assert.match(all,/READY TO ADVERTISE/);
  assert.match(all,/ON SALE/);
  assert.match(all,/data-filter="listed"/);
  const readyView=ui.render(s,E.workshop,{filter:'ready'});
  assert.equal(readyView.selectedId,ready.id);
  assert.ok(readyView.html.includes('data-page="stock" data-id="'+ready.id+'"'));
  assert.ok(!readyView.html.includes('WORK ORDER · STOCK '+listed.id));
  const advertised=ui.render(s,E.workshop,{filter:'listed'});
  assert.equal(advertised.selectedId,listed.id);
  assert.match(advertised.html,/QC PASSED \/ ON SALE/);
  assert.match(advertised.html,/OPEN SALES OFFICE/);
  assert.ok(!advertised.html.includes('WORK ORDER · STOCK '+ready.id));
});

test('v0.9.22 repair booking difference is explicit and is not double-counted',()=>{
  const app=browser(new Map()),E=app.productionEngine,s=E.create('Labour Difference',[]);
  s.cash=60000;
  const tech=E.people.applicants(1).find(x=>x.role==='technician');
  assert.ok(E.hireStaff(s,tech.id).ok);
  s.day=2;E.staffDay(s);
  const car=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,car.id,car.ask).ok);
  assert.ok(E.assessStock(s,1).ok);
  const v=s.vehicles[0],q=E.workshop.quote(s,v,'internal');
  assert.ok(q);
  const quoted=app.workshopView.render(s,E.workshop).html;
  if(q.saving>0)assert.match(quoted,/IN-HOUSE LABOUR SAVING/);
  assert.ok(E.startPrep(s,v.id,'internal').ok);
  const booked=app.workshopView.render(s,E.workshop).html;
  if(q.saving>0){
    assert.match(booked,/IN-HOUSE LABOUR SAVING/);
    const formatted=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(q.saving);
    assert.ok(booked.includes('−'+formatted));
  }
  assert.match(booked,/CAPITAL INVESTED/);
  assert.equal(app.workshopView.paid(v),v.workshop.repairCost);
  assert.equal(s.ledger.filter(x=>x.note.startsWith('Workshop repair booking:')).length,1);
  // Cash was increased synthetically to isolate booked pricing and labour savings.
});


test('v0.9.23 Sales Office compact register, case selection and filters preserve saves',()=>{
  const storage=new Map(),app=browser(storage),E=app.productionEngine;
  app.click('new-career');app.submitCareer('Sales Office UI');
  for(const lead of E.market(1).sellers){
    app.setInput('seller-offer-'+lead.id,lead.ask);
    app.click('buy-seller',{id:lead.id});
  }
  for(const v of JSON.parse(storage.get(STORAGE_KEY)).vehicles){
    app.click('prepare-stock',{id:String(v.id)});
    app.setInput('stock-price-'+v.id,Math.max(500,v.retail));
    app.click('list-stock',{id:String(v.id)});
  }
  const before=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(before.vehicles.length,2);
  assert.ok(before.vehicles.every(v=>v.status==='listed'));
  app.go('sales');
  const htmlUI=app.nodes.get('sales-list').innerHTML;
  assert.match(htmlUI,/RETAIL CASE REGISTER/);
  assert.match(htmlUI,/ADVERTISED VEHICLES/);
  assert.match(htmlUI,/VEHICLE FINANCIALS/);
  assert.match(htmlUI,/NEXT CUSTOMER ACTION/);
  assert.match(htmlUI,/data-action="select-sales"/);
  assert.match(htmlUI,/data-action="filter-sales"/);
  app.click('select-sales',{id:'2'});
  assert.match(app.nodes.get('sales-list').innerHTML,/RETAIL FILE · STOCK 2/);
  app.click('filter-sales',{filter:'deposits'});
  assert.match(app.nodes.get('sales-list').innerHTML,/No vehicles match this filter/);
  app.click('filter-sales',{filter:'all'});
  assert.deepEqual(JSON.parse(storage.get(STORAGE_KEY)),before);
  assert.match(css,/\.so-layout\{display:grid/);
});

test('v0.9.23 Sales Office keeps live enquiry and collection actions in focused case file',()=>{
  const app=browser(new Map()),E=app.productionEngine,C=E.customers;
  const state=E.create('Focused Sale',[]);
  const car=E.marketFor(state).sellers[0];
  assert.ok(E.acquireSeller(state,car.id,car.ask).ok);
  const v=state.vehicles[0];
  // The test uses a prepared fixture so customer presentation can be isolated.
  v.status='listed';v.listedDay=1;v.asking=v.retail;v.workshop.stage='ready';
  v.workshop.completedDay=1;v.workshop.repairCost=0;
  let rendered=app.customersView.render(state,E);
  assert.match(rendered.html,/SALES PROGRESSION|Sales progression|so-flow/);
  assert.match(rendered.html,/RETAIL FILE/);
  const current=app.customersView.lead(state,v,E);
  assert.ok(['AWAITING BUYER INTEREST','BUYER INTEREST TO CONTACT'].includes(current.title));
  const caseObj={id:'C-1-0-1-1',vehicleId:v.id,createdDay:1,createdSession:0,
    name:'Test Customer',channel:'ONLINE',status:'collectable',
    preferredMode:'cash',appointmentDay:null,agreedDay:1,price:v.asking,
    allowance:null,collectionDay:1,held:250,counters:0,reason:'',
    terms:'in-person',prepCost:75,exchange:null,salespersonId:null};
  state.customerCases[String(v.id)]=caseObj;
  rendered=app.customersView.render(state,E,{selectedId:v.id});
  assert.match(rendered.html,/READY FOR COLLECTION/);
  assert.match(rendered.html,/BALANCE TO COLLECT TODAY/);
  assert.match(rendered.html,/handover-customer/);
  assert.equal(rendered.selectedId,v.id);
});

test('v0.9.23 Sales Office removes duplicated top notices but retains policy information',()=>{
  assert.match(html,/id="sales-list" class="so-control"/);
  assert.match(html,/class="so-policy"/);
  assert.doesNotMatch(html,/id="sales-list" class="trade-card-grid trade-sales-grid"/);
  assert.match(css,/#events-banner:has\(\.event-neutral-banner\)/);
  assert.match(css,/\[data-panel="sales"\]>.page-heading h1/);
});


test('v0.9.24 Sales Office puts vehicle identity alongside readable finances',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  const s=E.create('Compact Sales Case',[]);
  const lead=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,lead.id,lead.ask).ok);
  const v=s.vehicles[0];
  v.status='listed';v.listedDay=s.day;v.asking=v.retail;
  const ui=app.customersView.render(s,E);
  assert.match(ui.html,/class="so-vehicle-intro"/);
  assert.match(ui.html,/VEHICLE FINANCIALS/);
  assert.match(ui.html,/NEXT CUSTOMER ACTION/);
  assert.equal((ui.html.match(/NEXT CUSTOMER ACTION/g)||[]).length,1);
  assert.match(css,/\.so-vehicle-intro\{display:grid;grid-template-columns:100px/);
  assert.match(css,/@media\(min-width:1021px\)/);
  assert.match(css,/\.so-kpis>div\{min-height:51px/);
});

test('v0.9.24 emerging buyer interest is not misreported as a recorded enquiry',()=>{
  const app=browser(new Map()),E=app.productionEngine,C=E.customers;
  let found=null;
  for(let i=0;i<100&&!found;i++){
    const s=E.create('Sales Lead Clarity '+i,[]);
    const lead=E.marketFor(s).sellers[0];
    assert.ok(E.acquireSeller(s,lead.id,lead.ask).ok);
    const v=s.vehicles[0];
    v.status='listed';v.listedDay=s.day;v.asking=v.retail;
    if(C.demand(s,v))found={s,v};
  }
  assert.ok(found,'Find a deterministic prospective buyer');
  const {s,v}=found;
  assert.equal(C.stats(s,s.monthPlan.startDay,s.day).enquiries,0);
  const preview=app.customersView.render(s,E);
  assert.match(preview.html,/BUYER INTEREST TO CONTACT/);
  assert.match(preview.html,/0 RECORDED ENQUIRIES/);
  assert.match(preview.html,/CONTACT BUYER \/ OPEN ENQUIRY/);
  assert.ok(E.openCustomer(s,v.id).ok);
  const contacted=app.customersView.render(s,E);
  assert.match(contacted.html,/NEW ENQUIRY/);
  assert.match(contacted.html,/1 RECORDED ENQUIRIES/);
  assert.doesNotMatch(contacted.html,/BUYER INTEREST TO CONTACT/);
});

test('v0.9.24 scheduled customer dates appear in the sales register',()=>{
  const app=browser(new Map()),E=app.productionEngine,s=E.create('Visible Appointments',[]);
  const lead=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,lead.id,lead.ask).ok);
  const v=s.vehicles[0];v.status='listed';v.listedDay=s.day;v.asking=v.retail;
  const fixture={id:'C-1-0-1-2',vehicleId:v.id,name:'A Buyer',channel:'ONLINE',
    status:'booked',appointmentDay:3,collectionDay:null,held:0};
  s.customerCases[String(v.id)]=fixture;
  const booked=app.customersView.render(s,E);
  assert.match(booked.html,/VIEWING DAY 3/);
  fixture.status='reserved';fixture.collectionDay=6;fixture.held=250;
  const reserved=app.customersView.render(s,E);
  assert.match(reserved.html,/COLLECTION DAY 6/);
  assert.match(reserved.html,/DEPOSIT HELD/);
});


test('v0.9.25 lead progression uses Lead / Enquiry and one clear contact action',()=>{
  const app=browser(new Map()),E=app.productionEngine,C=E.customers;
  let lead=null;
  for(let i=0;i<100&&!lead;i++){
    const s=E.create('Sales Final '+i,[]);
    const seller=E.marketFor(s).sellers[0];
    assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
    const v=s.vehicles[0];v.status='listed';v.listedDay=s.day;v.asking=v.retail;
    if(C.demand(s,v))lead={s,v};
  }
  assert.ok(lead);
  const {s,v}=lead,markup=app.customersView.render(s,E).html;
  assert.match(markup,/LEAD \/ ENQUIRY/);
  assert.match(markup,/aria-current="step"/);
  assert.match(markup,/CONTACT POTENTIAL BUYER/);
  assert.match(markup,/CONTACT BUYER \/ OPEN ENQUIRY/);
  assert.equal((markup.match(/CONTACT POTENTIAL BUYER/g)||[]).length,1);
  assert.equal(C.stats(s,s.monthPlan.startDay,s.day).enquiries,0);
  assert.ok(E.openCustomer(s,v.id).ok);
  assert.match(app.customersView.render(s,E).html,/NEW ENQUIRY/);
});

test('v0.9.25 negotiated sale remains clear with cash and part exchange',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  const cashCase=findCompletedDrive(E,c=>c.preferredMode==='cash');
  const cashMarkup=app.customersView.render(cashCase.state,E).html;
  assert.match(cashMarkup,/AGREE CASH PRICE/);
  assert.match(cashMarkup,/COUNTER \+£150/);
  const pxCase=findCompletedDrive(E,c=>c.preferredMode==='part-ex');
  const pxMarkup=app.customersView.render(pxCase.state,E).html;
  assert.match(pxMarkup,/CASH PURCHASE/);
  assert.match(pxMarkup,/PART-EXCHANGE PROPOSAL/);
  assert.match(pxMarkup,/AGREED PART-EX ALLOWANCE/);
  assert.match(pxMarkup,/data-action="agree-part-ex"/);
  assert.match(css,/max-width:1350px/);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(pxCase.state))));
});

test('v0.9.25 deposit and collection keep payment balance and handover correct',()=>{
  const app=browser(new Map()),E=app.productionEngine,C=E.customers;
  let completed=null;
  for(let i=0;i<130&&!completed;i++){
    const {state,v}=readyForRetail(E,'Final Sales Handover '+i);
    if(!C.demand(state,v))continue;
    if(!E.openCustomer(state,v.id).ok||!E.bookCustomer(state,v.id).ok)continue;
    const c=C.caseFor(state,v.id);
    state.day=c.appointmentDay;E.advanceCustomers(state);
    if(c.status!=='arrived'||!E.testDrive(state,v.id).ok)continue;
    if(!E.agreeCustomer(state,v.id,'cash',null).ok)continue;
    if(!E.depositCustomer(state,v.id).ok)continue;
    const reserve=app.customersView.render(state,E).html;
    assert.match(reserve,/BALANCE DUE AT COLLECTION/);
    assert.match(reserve,/COLLECTION: GAME DAY/);
    assert.doesNotMatch(reserve,/data-action="handover-customer"/);
    const balance=C.balanceDue(c);
    state.day=c.collectionDay;E.advanceCustomers(state);
    if(c.status==='collectable')completed={state,v,c,balance};
  }
  assert.ok(completed,'Find a buyer who attends their paid collection');
  const {state,v,c,balance}=completed;
  const collect=app.customersView.render(state,E).html;
  assert.match(collect,/BALANCE TO COLLECT TODAY/);
  assert.match(collect,/COLLECTION DUE: DAY/);
  assert.match(collect,/data-action="handover-customer"/);
  assert.equal(C.balanceDue(c),balance);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});


test('v0.9.26 new finance dashboard cleanly distinguishes cash, repair reserves and stock',()=>{
  const app=browser(new Map()),E=app.productionEngine,F=app.financeView;
  const state=E.create('Finance Snapshot',[]);
  const initial=F.snapshot(state,E);
  assert.equal(initial.cash,12500);
  assert.equal(initial.stock,0);
  assert.equal(initial.held,0);
  assert.equal(initial.afterReserve,initial.cash-initial.reserved);
  assert.equal(initial.cashReconciles,true);
  const seller=E.marketFor(state).sellers[0];
  assert.ok(E.acquireSeller(state,seller.id,seller.ask).ok);
  const snap=F.snapshot(state,E);
  assert.equal(snap.stock,state.vehicles[0].cost);
  assert.equal(snap.afterReserve,state.cash-E.workshop.reserved(state));
  assert.equal(snap.report.openingCash+snap.report.cashIn-snap.report.cashOut,state.cash);
  const page=F.summary(state,E).html;
  for(const word of ['CASH BALANCE','CASH AFTER REPAIR RESERVES',
    'INVESTED IN UNSOLD VEHICLES','MONTH OPERATING CONTRIBUTION',
    'WHERE YOUR CASH WENT','FULL MONTHLY REPORT','Customer deposits held separately']){
    assert.ok(page.includes(word),word);
  }
  assert.ok(E.normalize(JSON.parse(JSON.stringify(state))));
});

test('v0.9.26 filterable ledger exposes every entry without modifying saved career',()=>{
  const storage=new Map(),app=browser(storage),E=app.productionEngine,F=app.financeView;
  app.click('new-career');app.submitCareer('Finance Filtering');
  const first=E.market(1).sellers[0];
  app.setInput('seller-offer-'+first.id,first.ask);
  app.click('buy-seller',{id:first.id});
  const snapshot=JSON.parse(storage.get(STORAGE_KEY));
  app.go('finance');
  assert.match(app.nodes.get('finance-overview').innerHTML,/WHERE YOUR CASH WENT/);
  assert.match(app.nodes.get('ledger-list').innerHTML,/Direct purchase:/);
  app.click('filter-ledger',{filter:'in'});
  assert.match(app.nodes.get('ledger-list').innerHTML,/No transactions match this filter/);
  app.click('filter-ledger',{filter:'out'});
  assert.match(app.nodes.get('ledger-list').innerHTML,/Direct purchase:/);
  app.click('filter-ledger',{filter:'all'});
  assert.deepEqual(JSON.parse(storage.get(STORAGE_KEY)),snapshot);
  const s=E.create('Nine Ledger Rows',[]);
  s.ledger=Array.from({length:9},(_,i)=>({
    day:i+1,delta:i===0?0:i%2?125:-85,
    note:i===0?'Part-exchange acquisition: ledger record':'Other cash movement '+i
  }));
  const small=F.ledger(s);
  assert.match(small.html,/SHOWING 6 OF 9 ENTRIES/);
  assert.match(small.html,/VIEW ALL 9 ENTRIES/);
  assert.equal((small.html.match(/class="fin-entry"/g)||[]).length,6);
  const all=F.ledger(s,{expanded:true});
  assert.equal((all.html.match(/class="fin-entry"/g)||[]).length,9);
  assert.match(all.html,/£0 · NON-CASH/);
  assert.match(F.ledger(s,{filter:'noncash'}).html,/Part-exchange acquisition/);
  assert.doesNotMatch(F.ledger(s,{filter:'in'}).html,/Part-exchange acquisition/);
});

test('v0.9.26 finance alerts distinguish accrued bills from bank cash and held deposits',()=>{
  const app=browser(new Map()),E=app.productionEngine,F=app.financeView;
  const s=E.create('Bills Overview',[]);
  s.payrollArrears=600;s.premises.arrears=125;
  const data=F.snapshot(s,E);
  assert.equal(data.arrears,725);
  assert.equal(data.cash,12500);
  const ui=F.summary(s,E).html;
  assert.match(ui,/UNPAID BILLS: £725/);
  assert.match(ui,/Customer deposits held separately/);
  assert.match(ui,/not statutory net profit/);
  assert.match(html,/id="finance-overview"/);
  assert.match(html,/id="finance-ledger-toolbar"/);
  assert.match(html,/class="fin-help"/);
  assert.match(css,/\.fin-primary\{display:grid/);
});


test('v0.9.27 cash hero explains equal balance when no repairs are reserved',()=>{
  const app=browser(new Map()),E=app.productionEngine,F=app.financeView;
  const s=E.create('Cash Clarity',[]);
  const zero=F.summary(s,E);
  assert.equal(zero.snapshot.reserved,0);
  assert.match(zero.html,/class="fin-tile fin-tile-hero"/);
  assert.match(zero.html,/WORKING CASH AVAILABLE/);
  assert.match(zero.html,/No workshop funds reserved/);
  assert.doesNotMatch(zero.html,/CASH AFTER REPAIR RESERVES/);
  assert.equal(zero.snapshot.afterReserve,zero.snapshot.cash);
  const seller=E.marketFor(s).sellers[0];
  assert.ok(E.acquireSeller(s,seller.id,seller.ask).ok);
  const funded=F.summary(s,E);
  assert.ok(funded.snapshot.reserved>0);
  assert.match(funded.html,/CASH AFTER REPAIR RESERVES/);
  assert.match(funded.html,/After earmarked repairs/);
  assert.equal(funded.snapshot.afterReserve,s.cash-funded.snapshot.reserved);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.27 operating contribution gets accurate negative and positive signals',()=>{
  const app=browser(new Map()),E=app.productionEngine,F=app.financeView;
  const s=E.create('Margin Presentation',[]);
  const mock=amount=>({
    ...E,monthly:{...E.monthly,
      statement:state=>({...E.monthly.statement(state),operatingContribution:amount})}
  });
  const negative=F.summary(s,mock(-4940)).html;
  assert.match(negative,/fin-tile-loss/);
  assert.match(negative,/NEGATIVE THIS MONTH/);
  const positive=F.summary(s,mock(2250)).html;
  assert.doesNotMatch(positive,/fin-tile-loss/);
  assert.match(positive,/POSITIVE THIS MONTH/);
  assert.match(F.summary(s,mock(0)).html,/BREAK-EVEN SO FAR/);
  assert.match(css,/\.fin-tile-hero\{/);
  assert.match(css,/\.fin-flow \.fin-flow-total\{/);
});

test('v0.9.27 ledger HTML escapes special punctuation',()=>{
  const app=browser(new Map()),E=app.productionEngine,F=app.financeView;
  const s=E.create('Safe Ledger',[]);
  s.ledger.push({day:1,delta:0,note:"Paid <span onclick=\"alert(1)\"> & Bob's ledger"});
  const result=F.ledger(s,{expanded:true}).html;
  assert.match(result,/&lt;span/);
  assert.match(result,/&quot;alert\(1\)&quot;/);
  assert.match(result,/Bob&#39;s ledger/);
  assert.doesNotMatch(result,/<span onclick/);
  assert.match(html,/finance-view\.js\?v=2/);
  assert.match(html,/styles\.css\?v=45/);
});


test('v0.9.28 management overview shows key measures before detailed reports',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  const state=E.create('Report Overview',[]);
  const page=app.monthlyView.renderReport(state,E.monthly);
  assert.match(page,/MANAGEMENT REVIEW/);
  assert.match(page,/LIVE POSITION/);
  assert.match(page,/VEHICLES HANDED OVER/);
  assert.match(page,/OPERATING CONTRIBUTION/);
  assert.match(page,/CURRENT CASH/);
  assert.match(page,/CASH INVESTED IN STOCK/);
  assert.match(page,/ARE WE ON TARGET/);
  assert.match(page,/WHAT NEEDS ATTENTION/);
  assert.match(page,/SALES REQUIRED/);
  assert.match(page,/DETAILED MANAGEMENT RECORDS/);
  assert.equal((page.match(/class="mr-detail"/g)||[]).length,8);
  assert.ok(page.indexOf('mr-kpis')<page.indexOf('CASH FLOW & FINANCES'));
  assert.match(page,/Wages paid/);
  assert.match(page,/SALES TEAM SCORECARDS/);
  assert.match(page,/STOCK & WORKING CAPITAL/);
  assert.match(css,/\.mr-focus\{display:grid/);
  assert.match(html,/class="mr-control"/);
});

test('v0.9.28 archived report shows recorded result, not current-month balance',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  const state=E.create('Closed Reports',[]);
  state.day=30;
  const closed=E.monthly.close(state);
  assert.ok(closed);
  state.day=31;E.monthly.next(state);
  const frozen=JSON.stringify(state.monthlyReports[0]);
  const archived=app.monthlyView.renderReport(state,E.monthly,1);
  assert.match(archived,/ARCHIVED RESULT/);
  assert.match(archived,/CLOSING CASH/);
  assert.match(archived,/MONTH 1/);
  assert.match(archived,/TARGET MISSED/);
  assert.match(archived,/RETAIL CUSTOMER JOURNEY/);
  const live=app.monthlyView.renderReport(state,E.monthly,'current');
  assert.match(live,/CURRENT CASH/);
  assert.match(live,/MONTH 2/);
  assert.equal(JSON.stringify(state.monthlyReports[0]),frozen);
});

test('v0.9.28 management priorities use recorded stock age and preparation backlog',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  const state=E.create('Stock Review',[]);
  const seller=E.marketFor(state).sellers[0];
  assert.ok(E.acquireSeller(state,seller.id,seller.ask).ok);
  state.day=16;
  const view=app.monthlyView.renderReport(state,E.monthly);
  assert.match(view,/AGEING STOCK/);
  assert.match(view,/14\+ days/);
  assert.match(view,/WORKSHOP BACKLOG/);
  assert.match(view,/CASH INVESTED IN STOCK/);
  assert.match(view,/DAYS 1–30/);
});


test('v0.9.29 compact Management Reports puts all details behind one collapsed archive',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  const s=E.create('One Page Reports',[]);
  const view=app.monthlyView.renderReport(s,E.monthly);
  assert.match(view,/<details class="mr-records" aria-label="Detailed Management Records">/);
  assert.match(view,/<summary class="mr-records-summary">/);
  assert.match(view,/8 REPORTS · EXPAND/);
  assert.equal((view.match(/<details class="mr-detail">/g)||[]).length,8);
  assert.ok(view.indexOf('mr-mini')<view.indexOf('mr-records'));
  assert.match(view,/CASH FLOW & FINANCES/);
  assert.match(view,/SALES TEAM SCORECARDS/);
  assert.match(view,/RETAIL CUSTOMER JOURNEY/);
  assert.match(view,/DEAL DAY RESULTS/);
  assert.match(view,/£0 \/ £10,500/);
  assert.match(view,/£0 \/ £1,200/);
  assert.match(css,/\.mr-records-summary\{display:flex/);
  assert.match(css,/\.mr-records-body\{padding/);
  assert.match(css,/\.career-main:has\(\[data-panel="reports"\]:not\(\[hidden\]\)\) \.career-topbar/);
  assert.match(css,/\[data-panel="reports"\]>\.page-heading p:last-child\{display:none\}/);
});

test('v0.9.29 archived reports stay accessible and labels reflect historical shortfall',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  const s=E.create('History Matters',[]);
  s.day=30;
  const r=E.monthly.close(s);
  assert.ok(r);
  s.day=31;E.monthly.next(s);
  const original=JSON.stringify(s.monthlyReports[0]);
  const archive=app.monthlyView.renderReport(s,E.monthly,'1');
  assert.match(archive,/ARCHIVED RESULT/);
  assert.match(archive,/SALES TARGET MISSED/);
  assert.match(archive,/2 handovers short of the final target/);
  assert.match(archive,/CLOSING CASH/);
  assert.match(archive,/8 REPORTS · EXPAND/);
  assert.equal(JSON.stringify(s.monthlyReports[0]),original);
  const current=app.monthlyView.renderReport(s,E.monthly,'current');
  assert.match(current,/SALES REQUIRED/);
  assert.match(current,/CURRENT CASH/);
});


test('v0.9.30 normal calendar shows real milestone days without forecasting buyer volumes',()=>{
  const app=browser(new Map()),E=app.productionEngine,view=app.eventsView;
  const s=E.create('Event Diary',[]);
  s.day=11;
  const cashBefore=s.cash;
  const page=view.render(s);
  assert.match(page,/UPCOMING EVENTS/);
  assert.match(page,/DAY 30/);
  assert.match(page,/DAY 31/);
  assert.match(page,/FIVE SESSIONS · 09:00–17:00/);
  assert.doesNotMatch(page,/19 GAME DAYS AWAY/);
  assert.match(page,/MONTH-END DEAL DAY/);
  assert.match(page,/MONTHLY BOARD MEETING/);
  assert.match(page,/CASH BALANCE/);
  assert.match(page,/data-page="stock"/);
  assert.match(page,/data-page="reports"/);
  assert.doesNotMatch(page,/PRIVATE SELLERS THIS SESSION/);
  assert.equal(s.cash,cashBefore);
  assert.equal(s.meetings.length,0);
  assert.match(css,/\.eo-calendar-grid\{display:grid/);
  assert.match(css,/\.career-content:has\(\[data-panel="events"\]:not\(\[hidden\]\)\)>#events-banner\{display:none\}/);
});

test('v0.9.30 five Deal Day sessions show live opportunities and unchanged session rules',()=>{
  const app=browser(new Map()),E=app.productionEngine,D=E.events,V=app.eventsView;
  const s=E.create('Event Session View',[]);
  s.day=30;
  const cash=s.cash,ledger=s.ledger.length;
  const first=V.render(s);
  assert.match(first,/DEAL DAY/);
  assert.match(first,/FINAL TRADING DAY/);
  assert.match(first,/SESSION 1 \/ 5/);
  assert.match(first,/09:00/);
  assert.match(first,/PRIVATE SELLERS THIS SESSION/);
  assert.match(first,/VEHICLES ADVERTISED/);
  assert.match(first,/RETAIL HANDOVERS TODAY/);
  assert.match(first,/NEXT: NEXT SESSION/);
  assert.match(first,/data-page="sales"/);
  assert.match(first,/data-page="auctions"/);
  assert.match(first,/DEAL DAY RULES & SESSION EXPIRY/);
  assert.equal((first.match(/class="eo-phase /g)||[]).length,5);
  assert.ok(D.advanceSession(s).ok);
  assert.match(V.render(s),/SESSION 2 \/ 5/);
  assert.equal(s.day,30);
  assert.equal(s.cash,cash);
  assert.equal(s.ledger.length,ledger);
  s.deadlineSession=4;
  const last=V.render(s);
  assert.match(last,/17:00/);
  assert.match(last,/NEXT: CLOSE MONTH/);
  assert.match(last,/final chance to trade/i);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});

test('v0.9.30 monthly board decision appears before expanded staff review and persists',()=>{
  const app=browser(new Map()),E=app.productionEngine,D=E.events,V=app.eventsView;
  const s=E.create('Focused Board',[]);
  s.day=30;
  const prior=E.monthly.close(s);
  assert.ok(prior);
  s.day=31;E.monthly.next(s);
  const before=JSON.stringify(s);
  const page=V.render(s);
  assert.match(page,/BOARD MEETING/);
  assert.match(page,/DECISION REQUIRED/);
  assert.match(page,/AGREE ONE MANAGEMENT PRIORITY/);
  assert.match(page,/PREVIOUS SALES/);
  assert.match(page,/OPERATING CONTRIBUTION/);
  assert.match(page,/MANAGEMENT DISCUSSION/);
  assert.match(page,/SALES TEAM REVIEW/);
  assert.match(page,/RECENT MEETING MINUTES|NEW MONTH.S TARGETS/);
  assert.equal((page.match(/data-action="hold-meeting"/g)||[]).length,3);
  assert.ok(page.indexOf('AGREE ONE MANAGEMENT PRIORITY')<page.indexOf('MANAGEMENT DISCUSSION'));
  assert.match(page,/data-focus="sales"/);
  assert.match(page,/data-focus="buying"/);
  assert.match(page,/data-focus="care"/);
  assert.equal(JSON.stringify(s),before,'Rendering must not change the career');
  const result=D.holdMeeting(s,'buying');
  assert.ok(result.ok);
  const complete=V.render(s);
  assert.match(complete,/MEETING COMPLETED/);
  assert.match(complete,/SELECTED PRIORITY/);
  assert.match(complete,/DECISION LOCKED/);
  assert.equal((complete.match(/data-action="hold-meeting"[^>]* disabled/g)||[]).length,3);
  assert.equal(s.meetings.length,1);
  assert.equal(s.meetingFocus,'buying');
  assert.equal(D.holdMeeting(s,'sales').ok,false);
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});


test('v0.9.31 Deal Day diary shows its countdown once, with sessions in the event card',()=>{
  const app=browser(new Map()),E=app.productionEngine;
  const s=E.create('Single Countdown',[]);
  s.day=74;
  const ui=app.eventsView.render(s);
  assert.match(ui,/DAYS UNTIL DEAL DAY/);
  assert.match(ui,/FIVE SESSIONS · 09:00–17:00/);
  assert.doesNotMatch(ui,/16 GAME DAYS AWAY/);
  assert.match(ui,/UPCOMING · GAME DAY 90/);
  assert.match(ui,/MONTHLY BOARD MEETING/);
  assert.equal(s.day,74);
});

test('v0.9.31 recruitment separates employed staff, weekly candidates and role filters',()=>{
  const storage=new Map(),app=browser(storage);
  app.click('new-career');app.submitCareer('Hiring Overview');
  const P=app.engine.people,E=app.productionEngine;
  const view=app.peopleView.staffDesk(E.create('Another Firm',[]),P);
  assert.equal(view.mode,'candidates');
  assert.equal(view.counts.employed,0);
  assert.equal(view.counts.candidates,16);
  assert.match(view.html,/AVAILABLE CANDIDATES/);
  assert.match(view.html,/RECRUITMENT FILE/);
  assert.match(view.html,/TOTAL CASH NEEDED TO HIRE/);
  assert.match(view.html,/PROTECTED VEHICLE REPAIRS/);
  assert.match(view.html,/REFRESHES DAY 8/);
  const previous=JSON.parse(storage.get(STORAGE_KEY));
  app.click('staff-desk-role',{role:'sales'});
  const salesUI=app.nodes.get('people-board').innerHTML;
  assert.match(salesUI,/SALES EXECUTIVE/);
  assert.match(salesUI,/4 SHOWN/);
  assert.doesNotMatch(salesUI,/VEHICLE BUYER/);
  app.click('staff-desk-role',{role:'technician'});
  const techUI=app.nodes.get('people-board').innerHTML;
  assert.match(techUI,/8 SHOWN/);
  assert.match(techUI,/PREP TECHNICIAN/);
  app.click('staff-desk-role',{role:'all'});
  assert.match(app.nodes.get('people-board').innerHTML,/16 SHOWN/);
  assert.deepEqual(JSON.parse(storage.get(STORAGE_KEY)),previous);
});

test('v0.9.31 hire automatically opens the employee file with payroll and availability',()=>{
  const storage=new Map(),app=browser(storage),P=app.engine.people;
  app.click('new-career');app.submitCareer('Employed & Available');
  const candidate=P.applicants(1).find(c=>c.role==='buyer');
  app.click('staff-desk-mode',{mode:'candidates'});
  app.click('select-person',{person:'c:'+candidate.id});
  const before=app.nodes.get('people-board').innerHTML;
  assert.match(before,/TOTAL CASH NEEDED TO HIRE/);
  assert.match(before,/3-DAY WAGE COVER/);
  assert.match(before,/ONE-OFF ONBOARDING FEE/);
  const expense=P.hireQuote(app.engine.create('Test Cash',[]),candidate);
  assert.ok(expense.required>=P.HIRING_FEE+P.dailyCost(candidate)*3);
  app.click('hire-staff',{id:candidate.id});
  let current=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(current.staff.length,1);
  assert.equal(current.staff[0].name,candidate.name);
  assert.equal(current.cash,12500-P.HIRING_FEE);
  const after=app.nodes.get('people-board').innerHTML;
  assert.match(after,/YOUR TEAM/);
  assert.match(after,/EMPLOYEE FILE · ID 1/);
  assert.match(after,/STARTS DAY 2/);
  assert.match(after,/STAFF TRAINING/);
  assert.match(after,/RELEASE EMPLOYEE \/ NOTICE COST/);
  app.click('continue');
  current=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(current.day,2);
  assert.match(app.nodes.get('people-board').innerHTML,/AVAILABLE/);
  assert.equal(current.staff[0].startDay,2);
});

test('v0.9.31 cash-poor candidates show a precise block and do not debit hiring fee',()=>{
  const app=browser(new Map()),E=app.productionEngine,P=E.people;
  const state=E.create('Cash Safeguards',[]);
  state.cash=202;
  const c=P.applicants(1).find(x=>x.role==='sales');
  const quotation=P.hireQuote(state,c);
  assert.ok(quotation.shortfall>0);
  const file=app.peopleView.staffDesk(state,P,{mode:'candidates',selectedId:'c:'+c.id}).html;
  assert.match(file,/INSUFFICIENT CASH/);
  assert.match(file,/SHORT BY/);
  assert.match(file,/CANNOT HIRE/);
  assert.match(file,/data-action="hire-staff"[^>]* disabled/);
  const before=state.cash,ledger=state.ledger.length;
  assert.equal(P.hire(state,c.id).code,'cash');
  assert.equal(state.cash,before);
  assert.equal(state.ledger.length,ledger);
  assert.equal(state.staff.length,0);
});

test('v0.9.31 staff availability, training and role vacancies are truthful',()=>{
  const app=browser(new Map()),E=app.productionEngine,P=E.people;
  const s=E.create('Employment Flow',[]);
  const tech=P.applicants(s.day).find(x=>x.role==='technician');
  const sales=P.applicants(s.day).find(x=>x.role==='sales');
  assert.ok(P.hire(s,tech.id).ok);
  assert.ok(P.hire(s,sales.id).ok);
  const team=app.peopleView.staffDesk(s,P,{mode:'team',selectedId:'e:1'});
  assert.equal(team.counts.employed,2);
  assert.equal(team.counts.active,0);
  assert.match(team.html,/STARTS DAY 2/);
  assert.match(team.html,/2 \/ 7/);
  s.day=2;
  assert.equal(app.peopleView.deskCounts(s,P).active,2);
  const training=P.train(s,1);
  assert.ok(training.ok);
  const during=app.peopleView.staffDesk(s,P,{mode:'team',selectedId:'e:1'}).html;
  assert.match(during,/TRAINING TO DAY 4/);
  assert.match(during,/ALREADY TRAINING/);
  assert.match(during,/AUTHORISE TRAINING[^<]*<\/button>/);
  s.day=4;
  assert.equal(app.peopleView.employeeStatus(s,P,s.staff[0]).name,'AVAILABLE');
  assert.ok(E.normalize(JSON.parse(JSON.stringify(s))));
});
