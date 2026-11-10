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
const vehicleView = readFileSync(new URL('vehicle-view.js', root), 'utf8');
const people = readFileSync(new URL('people.js', root), 'utf8');
const peopleView = readFileSync(new URL('people-view.js', root), 'utf8');
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
  for (const page of ['dashboard', 'inbox', 'auctions', 'stock', 'sales', 'finance', 'staff', 'reputation', 'business']) {
    assert.match(html, new RegExp('data-panel="' + page + '"'));
    assert.match(html, new RegExp('data-page="' + page + '"'));
  }
  for (const id of ['continue-day', 'dashboard-inbox', 'inbox-list', 'inbox-detail', 'event-notice', 'save-warning']) {
    assert.match(html, new RegExp('id="' + id + '"'));
  }
  assert.match(html, /id="market-auctions"/);
  assert.match(html, /id="market-sellers"/);
  assert.match(html, /id="stock-list"/);
  assert.match(html, /id="sales-list"/);
  assert.match(html, /id="ledger-list"/);
  assert.match(html, /vehicle-intel\.js\?v=1/);
  assert.match(html, /people\.js\?v=1/);
  assert.match(html, /trading\.js\?v=4/);
  assert.match(html, /people-view\.js\?v=1/);
  assert.match(html, /vehicle-view\.js\?v=1/);
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
  for (const page of ['dashboard', 'inbox', 'auctions', 'stock', 'sales', 'finance', 'staff', 'reputation', 'business']) {
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
      if (!nodes.has(id) && /^(auction-bid-|seller-offer-|stock-price-|px-allowance-|projection-)/.test(id)) {
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
  vm.runInNewContext(people, context, { timeout: 1500 });
  vm.runInNewContext(engine, context, { timeout: 1500 });
  vm.runInNewContext(vehicleView, context, { timeout: 1500 });
  vm.runInNewContext(peopleView, context, { timeout: 1500 });
  vm.runInNewContext(js, context, { timeout: 1500 });
  function click(action, extras = {}) {
    const button = { dataset: { action, ...extras }, setAttribute() {} };
    listeners.click({ target: { closest: () => button } });
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
  return { nodes, bindings, panels, nav, storageData, click, go, submitCareer, setInput, typeInput, engine:context.window.MotorTradeEngine };
}

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
  assert.equal(app.nodes.get('dashboard-inbox').children.length, 3);
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
  assert.match(html, /styles\.css\?v=13/);
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
  assert.equal(opening.version, 4);
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
  assert.equal(state.cash, 12500 - bid - lot.fee - lot.prep);
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
  assert.equal(state.sold[0].profit,achievedPrice - bid - lot.fee - lot.prep);
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
  const expected=12500-accepted-seller.prep+firstBuyer.pxOffer-(px.floor+25);
  assert.equal(state.cash,expected,'Sale proceeds minus allowance is the cash difference');
  assert.equal(state.sold[0].profit,firstBuyer.pxOffer-accepted-seller.prep);
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
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).stock,2);
  const oldCash=state.cash;
  app.click('continue');
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.day,2);
  assert.equal(state.cash,oldCash);
  assert.equal(state.sold.length,0);
  assert.equal(state.ledger.reduce((a,l)=>a+l.delta,0),state.cash-12500);
  assert.notEqual(app.engine.market(1).auctions[0].id,app.engine.market(2).auctions[0].id);
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
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).version,4);
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
  app.click('prepare-stock',{id:'1'});
  state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.cash,0);
  app.setInput('stock-price-1',6200);
  app.click('list-stock',{id:'1'});
  app.click('sell-cash',{id:'1'});
  state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.stock,0);
  assert.ok(state.cash>0,'Player can sell out of a cash shortage');
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
  assert.match(app.nodes.get('market-auctions').innerHTML,/OUTBID/);
  let state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.cash,12500);
  assert.equal(state.ledger.length,0);
  assert.equal(state.auctionBids[lot.id].status,'outbid');
  const back=browser(saved);back.click('resume');
  assert.match(back.nodes.get('market-auctions').innerHTML,/OUTBID/);
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
    assert.ok(d.auctions.length+d.sellers.length >= 1,'At least one sourcing opportunity a day');
    assert.equal(d.auctions.length,new Set(d.auctions.map(v=>v.title)).size,'No duplicate auction model on same day');
    assert.equal(d.sellers.length,new Set(d.sellers.map(v=>v.title)).size,'No duplicate seller car on same day');
  }
  assert.deepEqual(JSON.stringify(engine.market(8)),JSON.stringify(engine.market(8)),'Same day market reproducible after reload');
});
test('every market buying action remains clickable and shows a capacity warning', () => {
  const saved=new Map();
  const app=browser(saved);
  app.click('new-career');app.submitCareer();
  const market=app.engine.market(1);
  for(const seller of market.sellers) {
    app.setInput('seller-offer-'+seller.id,seller.ask);
    app.click('buy-seller',{id:seller.id});
  }
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).stock,2);
  assert.match(app.nodes.get('market-auctions').innerHTML,/FORECOURT FULL/);
  assert.doesNotMatch(app.nodes.get('market-auctions').innerHTML,/data-action="bid-auction"[^>]* disabled/);
  app.setInput('auction-bid-'+market.auctions[0].id,market.auctions[0].rival+100);
  app.click('bid-auction',{id:market.auctions[0].id});
  assert.match(app.nodes.get('trade-feedback-toast').textContent,/forecourt is full/i);
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).stock,2);
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
  assert.match(app.nodes.get('market-auctions').innerHTML,/KNOWN PREPARATION ITEMS/);
  assert.match(app.nodes.get('market-auctions').innerHTML,/BUY INSPECTION/);
  app.click('inspect-lead',{id:lot.id,kind:'auction'});
  let state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.cash,12500-lot.profile.inspectionFee);
  assert.equal(state.vehicles.length,0);
  assert.equal(state.reports[lot.id].fee,lot.profile.inspectionFee);
  assert.match(app.nodes.get('market-auctions').innerHTML,/ADDITIONAL CONDITION RISK/);
  assert.match(app.nodes.get('market-auctions').innerHTML,new RegExp(lot.profile.hiddenFault.item));
  const after=app.engine.quote(lot,'auction',lot.rival+50,true);
  assert.equal(after.prep,lot.profile.basePrep+lot.profile.hiddenFault.cost);
  assert.equal(after.inspection,lot.profile.inspectionFee);
  assert.notEqual(before.maxBid,after.maxBid);
  const resume=browser(storage);resume.click('resume');
  assert.match(resume.nodes.get('market-auctions').innerHTML,/INSPECTION PAID|VEHICLE FILE/);
  resume.click('toggle-report',{id:lot.id,kind:'auction'});
  assert.match(resume.nodes.get('market-auctions').innerHTML,/INSPECTION PAID/);
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
  assert.equal(state.vehicles[0].prepSpent,state.vehicles[0].prepBudget);
  resume.setInput('stock-price-1',6800);
  resume.click('list-stock',{id:'1'});
  state=JSON.parse(storage.get(STORAGE_KEY));
  const achieved=resume.engine.buyers(state.vehicles[0]).cashOffer;
  resume.click('sell-cash',{id:'1'});
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.sold[0].profit,achieved-(hammer+lot.fee+lot.profile.inspectionFee)-
    (lot.profile.basePrep+lot.profile.hiddenFault.cost));
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
  assert.equal(next.cash,first.cash,'The inspection fee is non-refundable');
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
  assert.equal(migrated.version,4);
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
  assert.match(app.nodes.get('market-auctions').innerHTML,/RECOMMENDED MAX/);
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
  const markup=app.nodes.get('market-auctions').innerHTML;
  assert.match(markup,/MAXIMUM BID \/ OFFER WORKING/);
  assert.ok(markup.includes('id="auction-bid-'+auction.id+'" value="'+offer+'"'));
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
  assert.equal(saved.version,4);
  assert.equal(saved.sold[0].profit,old.sold[0].profit);
  assert.equal(saved.ledger.length,old.ledger.length);
  assert.equal(saved.cash,old.cash);
  assert.equal(saved.sold[0].profile,null);
});

test('v0.5 starts with basic reputation, owner-operated staffing and visible recruitment', () => {
  const app=browser(new Map());
  app.click('new-career');app.submitCareer('Starter Motors');
  assert.equal(app.engine.VERSION,4);
  assert.equal(app.bindings.get('reputation')[0].textContent,'NEW TRADER');
  assert.equal(app.bindings.get('reputation-score')[0].textContent,'5 / 100');
  assert.equal(app.bindings.get('staff-count')[0].textContent,'0');
  assert.match(app.nodes.get('people-roster').innerHTML,/OWNER OPERATED/);
  assert.match(app.nodes.get('people-applicants').innerHTML,/SALES EXECUTIVE/);
  assert.match(app.nodes.get('people-applicants').innerHTML,/VEHICLE BUYER/);
  assert.match(app.nodes.get('people-applicants').innerHTML,/PREP TECHNICIAN/);
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
  assert.match(app.nodes.get('people-roster').innerHTML,/STARTS DAY 2/);
  const daily=P.dailyCost(state.staff[0]);
  app.click('continue');
  state=JSON.parse(storage.get(STORAGE_KEY));
  assert.equal(state.day,2);
  assert.equal(state.cash,12500-P.HIRING_FEE-daily);
  assert.equal(state.payrollArrears,0);
  assert.equal(state.ledger.filter(x=>x.note.startsWith('Staff payroll')).length,1);
  assert.match(app.nodes.get('event-notice').textContent,/wage settlement/);
  const later=browser(storage);
  later.click('resume');
  assert.equal(later.bindings.get('staff-count')[0].textContent,'1');
  assert.equal(JSON.parse(storage.get(STORAGE_KEY)).staff[0].name,candidate.name);
  assert.match(later.nodes.get('people-roster').innerHTML,/AVAILABLE/);
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
  const auction=E.market(2).auctions[0];
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
  assert.equal(state.sold[0].salesCommission,Math.round(Math.max(0,state.sold[0].profit)*.03));
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
  assert.ok(E.prepare(state,1).ok);
  assert.equal(state.cash,0);
  assert.ok(E.advertise(state,1,6200).ok);
  assert.ok(E.completeSale(state,1,'cash',null).ok);
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
  assert.equal(restored.version,4);
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
