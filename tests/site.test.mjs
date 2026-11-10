import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('styles.css', root), 'utf8');
const js = readFileSync(new URL('simulator.js', root), 'utf8');
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
  assert.match(html, /Auction bidding, rival traders, buyer fees/);
  assert.match(html, /No income is simulated/);
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
  return { nodes, bindings, panels, nav, storageData, click, go, submitCareer };
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
  assert.match(app.nodes.get('inbox-detail').innerHTML, /Your first vehicle report is ready/);
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
