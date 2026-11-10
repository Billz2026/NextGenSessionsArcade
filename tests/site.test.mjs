import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('styles.css', root), 'utf8');
const js = readFileSync(new URL('simulator.js', root), 'utf8');
const engine = readFileSync(new URL('trading.js', root), 'utf8');
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
  for (const page of ['dashboard', 'inbox', 'auctions', 'stock', 'sales', 'finance', 'business']) {
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
  assert.match(html, /trading\.js\?v=1/);
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
  for (const page of ['dashboard', 'inbox', 'auctions', 'stock', 'sales', 'finance', 'business']) {
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
      if (!nodes.has(id) && /^(auction-bid-|seller-offer-|stock-price-|px-allowance-)/.test(id)) {
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
  vm.runInNewContext(engine, context, { timeout: 1500 });
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
  return { nodes, bindings, panels, nav, storageData, click, go, submitCareer, setInput, engine:context.window.MotorTradeEngine };
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
  assert.match(html, /styles\.css\?v=10/);
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
  assert.equal(opening.version, 2);
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
  app.click('counter-sale', { id: '1' });
  state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].cashOffer,5950);
  app.click('sell-cash', { id: '1' });
  state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles.length, 0);
  assert.equal(state.sales, 1);
  assert.equal(state.sold[0].mode,'cash');
  assert.equal(state.sold[0].price,5950);
  assert.equal(state.sold[0].profit,5950 - bid - lot.fee - lot.prep);
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
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).vehicles.length,0,'Rejected offer cannot acquire stock');
  app.setInput('seller-offer-' + seller.id,seller.floor + 25);
  app.click('buy-seller',{id:seller.id});
  let state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles[0].source,'seller');
  assert.equal(state.vehicles[0].cost,seller.floor + 25);
  app.click('prepare-stock',{id:'1'});
  app.setInput('stock-price-1',5000);
  app.click('list-stock',{id:'1'});
  const px = app.engine.buyers(JSON.parse(saved.get(STORAGE_KEY)).vehicles[0]).exchange;
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
  const expected=12500-(seller.floor+25)-seller.prep+(5000-220)-(px.floor+25);
  assert.equal(state.cash,expected,'Sale proceeds minus allowance is the cash difference');
  assert.equal(state.sold[0].profit,(5000-220)-(seller.floor+25)-seller.prep);
  assert.equal(state.ledger.reduce((a,l)=>a+l.delta,0),state.cash-12500);
  app.click('prepare-stock',{id:'2'});
  app.setInput('stock-price-2',3500);
  app.click('list-stock',{id:'2'});
  app.click('sell-cash',{id:'2'});
  state=JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.sales,2);
  assert.equal(state.stock,0);
  assert.equal(state.reputation,'UP-AND-COMING');
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
  assert.equal(JSON.parse(saved.get(STORAGE_KEY)).version,2);
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
  const maxSafeBid = 12500 - lot.fee - lot.prep;
  app.setInput('auction-bid-' + lot.id, maxSafeBid);
  app.click('bid-auction',{id:lot.id});
  let state = JSON.parse(saved.get(STORAGE_KEY));
  assert.equal(state.vehicles.length,1);
  assert.equal(state.cash,lot.prep);
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
