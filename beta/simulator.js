'use strict';
/*
 * The Motor Trade — first playable multi-source trading career.
 * All market prices, buyer behaviour and stock are fictional; game only.
 * Single-slot career save with backward-compatible foundation migration.
 */
(() => {
  const E = window.MotorTradeEngine;
  const PV = window.MotorTradePeopleView;
  const MV = window.MotorTradeMonthlyView;
  const EV = window.MotorTradeEventsView;
  const WV = window.MotorTradeWorkshopView;
  const CV = window.MotorTradeCustomersView;
  const AFTV=window.MotorTradeAftersalesView;
  const AV = window.MotorTradeAuctionHallView;
  const SITE_VIEW = window.MotorTradePremisesView;
  const DV = window.MotorTradeDashboardView;
  const IN = window.MotorTradeInbox;
  const BV = window.MotorTradeBuyingDeskView;
  const SV = window.MotorTradeStockView;
  const FV = window.MotorTradeFinanceView;
  if (!E || !PV || !MV || !EV || !WV || !CV || !SITE_VIEW || !AV || !DV || !IN || !BV || !SV || !FV)
    throw new Error('Customer, workshop and report modules must load before simulator.js');
  const P = E.people;
  const M = E.monthly;
  const D = E.events;
  const W = E.workshop;
  const C = E.customers;
  const SITE = E.premises;
  const VC = window.MotorTradeCards;
  if(!VC)throw new Error('Load vehicle-cards.js before simulator.js');
  const MARKET = window.MotorTradeMarket;
  if(!MARKET)throw new Error('Load vehicle-market.js before simulator.js');
  const STORAGE_KEY = 'the-motor-trade-career-beta-v1';
  const DISPLAY_KEY = 'the-motor-trade-display-beta-v1';
  const SAVE_VERSION = E.VERSION;
  const STARTING_CASH = 12500;
  const CAPACITY = E.CAPACITY;
  const START_DATE_UTC = Date.UTC(2026, 10, 9);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MAX_DAY = 36500;
  const PAGES = Object.freeze({
    dashboard: 'DASHBOARD',
    inbox: 'INBOX',
    auctions: 'BUYING DESK',
    auctionHall: 'AUCTION HALL',
    stock: 'VEHICLE STOCK',
    workshop: 'WORKSHOP OPERATIONS',
    sales: 'SALES OFFICE',
    finance: 'FINANCES',
    reports: 'MANAGEMENT REPORTS',
    events: 'EVENTS & MEETINGS',
    staff: 'STAFF & RECRUITMENT',
    reputation: 'REPUTATION',
    business: 'MY DEALERSHIP'
  });
  const money = new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  const dateShort = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  });
  const dateLong = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric'
  });
  const weekdayLong = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC', weekday: 'long'
  });
  const byId = id => document.getElementById(id);
  const all = selector => Array.from(document.querySelectorAll(selector));
  const escapeText = value => String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);

  function makeMessage(id, day, from, subject, preview, body, linkPage) {
    return { id, day, from, subject, preview, body, linkPage, read: false };
  }
  function welcomeMessages(realistic=false) {
    return [
      makeMessage(1,1,'BUSINESS SUPPORT','Welcome to the motor trade',
        realistic?'Open your independent dealership with £50,000 in bank cash.':
          'Run your first dealership, with £12,500 in capital.',
        (realistic?'£60,000 owner capital funded your business. £10,000 was committed before opening (lease deposit, prepaid insurance, equipment and launch). You begin with £50,000 bank cash, four selling spaces and outsourced repairs. ': 'Your dealership starts with £12,500 in cash and four forecourt spaces. ')+
        'Visit the Auction Hall for live numbered-lot bidding, and the Buying Desk for customers selling cars directly.\n\nA car needs workshop assessment, timed repairs and a passed final quality check before advertising. Once listed, customer enquiries are not guaranteed: book appointments, arrange test drives, negotiate and complete handover. A part-exchange becomes your next stock vehicle.',
        'auctionHall'),
      makeMessage(2,1,'BUYING DESK','Three ways to find your next car',
        'Auctions, direct sellers and part-exchanges all supply vehicles.',
        'Auctions have competing traders and buyer fees. Direct sellers can reject low offers. Part-exchanges happen when you sell one of your advertised cars and agree an allowance for the customer\'s existing vehicle.\n\nEvery route affects your cash and stock differently. Your first market opportunities are waiting.',
        'auctionHall'),
      makeMessage(3,1,'ACCOUNTS OFFICE',realistic?'Protect your opening £50,000':'Protect your opening £12,500',
        'Gross margin is different from cash flow.',
        'Every purchase and preparation job costs cash. Customer sales return cash, while part-exchange deals include the incoming vehicle as a separate purchase.\n\nThe Finances page records each transaction. '+(realistic?'Your 2026 dealer is modelled as voluntarily VAT-registered from day one. Eligible fictional used-car sales accrue one-sixth VAT on the positive vehicle purchase-to-sale margin, with a separate quarterly tax payment. Input VAT recovery and full statutory returns are not modelled; employer taxes and aftersales claims still require auditing.':'Gross trade margin excludes staff and premises overheads; the management report shows an operating contribution after those charges. VAT, tax, finance and after-sale claims remain unmodelled.'),
        'finance')
    ];
  }
  const scheduledMessages = Object.freeze({
    2: () => makeMessage(4,2,'BUYING DESK','Today\'s stock opportunities have refreshed',
      'Private seller opportunities have refreshed.',
      'Auctions run once per week, normally Monday or Tuesday when Monday is Deal Day. Other days are for private sellers and retail trading.',
      'auctionHall'),
    3: () => makeMessage(5,3,'SALES ADVISER','Cash sale or part-exchange?',
      'Both deals can move your stock, but they affect your cash differently.',
      'A cash customer pays the agreed sale price at handover. A part-exchange customer brings a car and pays only the balance after the agreed allowance. You own that incoming car and must prepare it before advertising it.',
      'sales'),
    5: () => makeMessage(6,5,'ACCOUNTS OFFICE','Review your trading margins',
      'Check the ledger for purchases, costs and completed sales.',
      'Your ledger separates auction fees, purchases, preparation bills, cash receipts and part-exchange allowances. Gross trade margin is only an initial game measure and is not net accounting profit.',
      'finance'),
    7: () => makeMessage(7,7,'BUSINESS SUPPORT','Your first week as a trader',
      'Review sales, stock age and cash reserves.',
      'Buying cheap is not enough. The best dealers keep vehicles moving, avoid tying up too much cash and know when to walk away from a risky deal. More management systems will follow this playable trading foundation.',
      'business')
  });

  const display = { showroom: true, motion: true };
  try {
    const savedDisplay = JSON.parse(localStorage.getItem(DISPLAY_KEY) || 'null');
    if (savedDisplay && typeof savedDisplay.showroom === 'boolean' &&
        typeof savedDisplay.motion === 'boolean') {
      display.showroom = savedDisplay.showroom;
      display.motion = savedDisplay.motion;
    }
  } catch (_) { /* Display preferences are optional. */ }
  function saveDisplay() {
    try { localStorage.setItem(DISPLAY_KEY, JSON.stringify(display)); }
    catch (_) { /* Keep settings active for this visit. */ }
  }
  let storageAvailable = true;
  function loadCareer() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); }
    catch (_) { storageAvailable = false; return null; }
    if (!raw) return null;
    try { return E.normalize(JSON.parse(raw)); }
    catch (_) { return null; }
  }
  function persistCareer() {
    if (!career) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(career));
      storageAvailable = true;
      return true;
    } catch (_) {
      storageAvailable = false;
      return false;
    }
  }

  let career = loadCareer();
  let screen = 'menu'; // The cinematic main menu is the entry point for all careers.
  let currentPage = 'dashboard';
  let selectedMessageId = null;
  let inboxFilter = 'all';
  let eventNotice = '';
  let lastTradeResult = null;
  let expandedReportId = null;
  let auctionPreviewId = null;
  let offerDrafts = {};
  let selectedSellerId = null;
  let selectedStockId = null;
  let stockFilter = 'all';
  let selectedWorkshopId = null;
  let workshopFilter = 'all';
  let selectedSalesId = null;
  let salesFilter = 'all';
  let ledgerFilter = 'all';
  let ledgerExpanded = false;
  let staffDeskMode = null;
  let staffDeskRole = 'all';
  let staffDeskSelectedId = null;
  let selectedMonth = 'current'; // Current-day input, retained while opening a report.

  function gameDate(day) {
    return new Date(START_DATE_UTC + (day - 1) * MS_PER_DAY);
  }
  function unreadCount() {
    return career ? career.messages.filter(m => !m.read).length : 0;
  }
  function bindText(name, value) {
    for (const node of all('[data-bind="' + name + '"]')) node.textContent = value;
  }
  function renderMessageRow(message, compact) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = 'read-message';
    button.dataset.id = String(message.id);
    const pending=IN.needsAction(message,career);
    const category=IN.infer(message);
    button.className = (compact ? 'message-preview' : 'inbox-row')+
      (message.read ? '' : ' is-unread')+(pending?' inbox-row-action':'');
    if (!compact) button.setAttribute('aria-pressed', String(message.id === selectedMessageId));
    const stamp = message.day === 1 ? 'DAY 01' : 'DAY ' + String(message.day).padStart(2, '0');
    button.innerHTML =
      '<span class="message-icon" aria-hidden="true">✉</span>' +
      '<span class="message-copy">' +
        '<span class="message-from"><span>' + escapeText(message.from) + '</span><time>' + stamp + '</time></span>' +
        '<span class="message-title">' + escapeText(message.subject) + '</span>' +
        (!compact?'<span class="inbox-message-tags"><b>'+escapeText(IN.labels[category]||category)+
          '</b>'+(pending?'<b class="inbox-tag-action">APPROVAL REQUIRED</b>':'')+
          (message.subject.startsWith('PAID COPY')?'<b class="inbox-tag-paid">ALREADY PAID</b>':'')+
          '</span>':'') +
        '<span class="message-summary">' + escapeText(message.preview) + '</span>' +
      '</span>' +
      (message.read ? '' : '<span class="message-unread" aria-label="Unread"></span>');
    return button;
  }
  function renderInbox() {
    if(!career)return;
    const ordered=IN.filtered(career.messages,career,inboxFilter);
    const recent=IN.filtered(career.messages,career,'all');
    const preview=byId('dashboard-inbox');
    const spotlight=[...recent.filter(m=>IN.needsAction(m,career)),
      ...recent.filter(m=>!IN.needsAction(m,career)&&!m.read),
      ...recent.filter(m=>!IN.needsAction(m,career)&&m.read)].slice(0,2);
    preview.replaceChildren(...spotlight.map(m=>renderMessageRow(m,true)));
    const list=byId('inbox-list');
    list.replaceChildren(...ordered.map(m=>renderMessageRow(m,false)));
    const unread=unreadCount();
    const counts=IN.counters(career.messages,career);
    const actions=counts.action;
    byId('widget-unread-label').textContent=unread+' UNREAD'+
      (actions?' · '+actions+' APPROVAL'+(actions===1?'':'S'):'');
    byId('inbox-unread-count').textContent=unread+' UNREAD';
    byId('inbox-action-count').textContent=String(actions);
    byId('inbox-unread-summary').textContent=String(unread);
    byId('inbox-paid-count').textContent=String(
      career.messages.filter(m=>m.subject.startsWith('PAID COPY')).length);
    byId('inbox-filter-count').textContent=String(ordered.length)+' SHOWN';
    byId('inbox-filter-buttons').innerHTML=IN.categories.map(filter=>
      '<button type="button" data-action="filter-inbox" data-filter="'+filter+
      '" aria-pressed="'+String(inboxFilter===filter)+'">'+
      IN.esc(IN.labels[filter])+
      (filter==='action'&&counts.action?' · '+counts.action:'')+'</button>').join('');
    const detail=byId('inbox-detail');
    if(selectedMessageId===null||!ordered.some(m=>m.id===selectedMessageId))
      selectedMessageId=ordered[0]?.id??null;
    const selected=ordered.find(m=>m.id===selectedMessageId);
    if(!selected){
      detail.innerHTML='<div class="inbox-empty"><strong>No messages in this category.</strong>'+
        '<p>Use All Mail to see your communications history. New decisions and receipts appear as genuine trading events occur.</p></div>';
      return;
    }
    const actionable=IN.needsAction(selected,career);
    const category=IN.infer(selected);
    detail.innerHTML=
      '<div class="inbox-mail-heading">'+
        '<span class="section-overline">'+escapeText(IN.labels[category]||category)+
          (actionable?' · APPROVAL REQUIRED':'')+'</span>'+
        '<h2>'+escapeText(selected.subject)+'</h2>'+
      '</div>'+
      IN.formatMail(selected,career)+IN.quoteControls(selected,career,E);
    const toolbar=document.createElement('div');
    toolbar.className='inbox-message-toolbar';
    const mark=document.createElement('button');
    mark.type='button';
    mark.className='secondary-button';
    mark.dataset.action='toggle-inbox-read';
    mark.dataset.id=String(selected.id);
    mark.textContent=selected.read?'MARK UNREAD':'MARK READ';
    toolbar.appendChild(mark);
    if(selected.linkPage&&Object.prototype.hasOwnProperty.call(PAGES,selected.linkPage)){
      const action=document.createElement('button');
      action.type='button';
      action.className='secondary-button detail-action';
      action.dataset.page=selected.linkPage;
      action.textContent='OPEN '+PAGES[selected.linkPage]+' ↗';
      toolbar.appendChild(action);
    }
    detail.appendChild(toolbar);
  }
  const cashText = n => money.format(n);
  const milesText = n => new Intl.NumberFormat('en-GB').format(n) + ' mi';
  function inputNumber(id, fallback) {
    const field = byId(id);
    if (!field || field.value.trim() === '') return NaN;
    const value = Number(field.value);
    return Number.isSafeInteger(value) ? value : NaN;
  }
  function saveResult(result, leadId = null) {
    eventNotice = result.message;
    lastTradeResult = { id:leadId, ok:result.ok, code:result.code || '', message:result.message };
    if (result.ok || result.changed) persistCareer();
    render();
  }
  function leadFeedback(id) {
    if (!lastTradeResult || lastTradeResult.id !== id) return '';
    return '<div class="trade-inline-feedback ' + (lastTradeResult.ok ? 'trade-feedback-success' : 'trade-feedback-warning') +
      '" role="status">' + escapeText(lastTradeResult.message) + '</div>';
  }
  const prepReserved = () => W.reserved(career);
  function purchaseWarning(cost) {
    if (career.vehicles.length >= career.capacity)
      return 'FORECOURT FULL — finish a sale in Vehicle Stock / Sales Office.';
    if (career.cash < cost + prepReserved())
      return 'NOT ENOUGH CASH — preserve funds for all vehicle preparation.';
    return '';
  }
  function details(vehicle) {
    return '<div class="trade-card-details">' +
      '<span>' + milesText(vehicle.miles) + '</span>' +
      '<span>' + escapeText(vehicle.fuel) + '</span>' +
      '<span>' + escapeText(vehicle.gearbox) + '</span>' +
      (vehicle.profile?'<span>'+escapeText(vehicle.profile.ref)+'</span>':'') +
      '<span>History: ' + escapeText(vehicle.history) + '</span></div>';
  }
  function cardHeader(car,source) {
    const kind=source.startsWith('AUCTION')?'auction':
      source.startsWith('PRIVATE')||source.startsWith('SELLER')?'seller':
      source.startsWith('PART-EX')?'part-ex':'stock';
    return VC.heading(car,kind,source)+
      '<p class="trade-card-note">'+escapeText(car.note||'')+'</p>';
  }
  function reportCard(car,kind,price) {
    const key=kind+':'+car.id;
    const h=career.auctionHall;
    const inspectionClosed=kind==='auction' &&
      (h.results.some(r=>r.lotId===car.id) ||
       (h.phase==='payment' && E.auctionLot(career)?.id===car.id));
    return window.MotorTradeVehicleView.render(car,kind,{
      open:expandedReportId===key,
      inspected:kind==='stock'?!!car.profile?.inspected:!!career.reports?.[car.id],
      price,inspectionClosed
    });
  }
  function repairReserve(car) {
    return car.profile?.basePrep + (car.profile?.riskAllowance||0);
  }
  function expectedMarginText(car,kind,price) {
    return cashText(E.quote(car,kind,price,!!career.reports?.[car.id]).expectedMargin);
  }
  function renderAuctionHall(){
    byId('auction-hall-view').innerHTML=AV.render(career,E,reportCard,auctionPreviewId);
  }
  function renderMarket() {
    const progression=E.marketStatus(career);
    const next=progression.next;
    byId('market-progression').innerHTML=
      '<span>STOCK ACCESS <strong>'+VC.esc(progression.current.label)+'</strong></span>'+
      '<small>'+(next?'NEXT: '+VC.esc(next.label)+' · '+cashText(next.minCash)+
        ' OPENING CASH / '+next.minRep+' REPUTATION':
        'TOP TIER UNLOCKED')+'</small>';
    const desk=BV.render(career,E,{
      selectedId:selectedSellerId,drafts:offerDrafts,reportCard,leadFeedback
    });
    selectedSellerId=desk.selectedId;
    byId('market-sellers').innerHTML=desk.html;
  }
  function renderStock() {
    const view=SV.render(career,{selectedId:selectedStockId,filter:stockFilter,reportCard});
    selectedStockId=view.selectedId;
    byId('stock-list').innerHTML=view.html;
  }
  function renderWorkshop() {
    const view=WV.render(career,W,{selectedId:selectedWorkshopId,filter:workshopFilter});
    selectedWorkshopId=view.selectedId;
    byId('workshop-board').innerHTML=view.html;
  }
  function renderSales() {
    const view=CV.render(career,E,{selectedId:selectedSalesId,filter:salesFilter});
    selectedSalesId=view.selectedId;
    byId('sales-list').innerHTML=view.html;
    byId('aftersales-board').innerHTML=AFTV.render(career,E);
  }
  function renderFinances() {
    byId('finance-overview').innerHTML=FV.summary(career,E).html;
    const view=FV.ledger(career,{filter:ledgerFilter,expanded:ledgerExpanded});
    byId('finance-ledger-toolbar').innerHTML=view.controls;
    byId('ledger-list').innerHTML=view.html;
  }
  function renderEvents() {
    const banner=byId('events-banner');
    banner.className='events-banner'+(['dashboard','auctions'].includes(currentPage)?' dashboard-event-compact':'');
    banner.innerHTML=EV.banner(career);
    byId('events-view').innerHTML=EV.render(career);
  }
  function renderDashboard(){
    const d=DV.snapshot(career,E);
    byId('dashboard-priorities').innerHTML=DV.priorities(d);
    byId('dashboard-operating-strip').innerHTML=DV.operations(d,career);
    bindText('dashboard-cash-note',d.reserved?
      money.format(d.reserved)+' earmarked for repairs':'Before future operating bills');
    bindText('dashboard-stock-note',d.listed+' listed · '+d.awaitingPrep+' awaiting prep');
    bindText('dashboard-monthly-sales',d.report.soldUnits+' / '+d.report.targetUnits);
    const sales=DV.salesProgress(d.report,d.daysToGo);
    bindText('dashboard-sales-note',sales.text);
    for(const node of all('[data-bind="dashboard-sales-note"]'))
      node.className=sales.positive?'dashboard-target-positive':'';
    bindText('dashboard-operating',money.format(d.report.operatingContribution));
    bindText('dashboard-auction',d.auctionOpen?'TODAY':'DAY '+d.auctionDay);
    bindText('dashboard-auction-note',d.auctionWeekday==='TUE'?
      'Tuesday · Deal Day reschedule':'Monday · weekly session');
  }
  function renderMonthly() {
    const r=M.statement(career);
    byId('monthly-dashboard-target').innerHTML=MV.liveGoals(career,M);
    byId('monthly-report-view').innerHTML=MV.renderReport(career,M,selectedMonth);
    bindText('monthly-target',r.soldUnits+' / '+r.targetUnits);
  }
  function renderBusiness(){
    byId('premises-view').innerHTML=SITE_VIEW.render(career,SITE);
  }
  function renderPeople() {
    const view=PV.staffDesk(career,P,{mode:staffDeskMode,role:staffDeskRole,
      selectedId:staffDeskSelectedId});
    staffDeskMode=view.mode;
    staffDeskRole=view.role;
    staffDeskSelectedId=view.selectedId;
    byId('people-board').innerHTML=view.html;
    byId('reputation-view').innerHTML=PV.reputation(career);
  }
  function renderTrading() {
    renderMarket();
    renderAuctionHall();
    renderStock();
    renderWorkshop();
    renderSales();
    renderFinances();
    renderPeople();
    renderMonthly();
    renderDashboard();
    renderBusiness();
    renderEvents();
  }

  function render() {
    const menu = byId('screen-menu');
    menu.hidden = screen !== 'menu';
    menu.className = 'menu-screen' + (display.showroom ? '' : ' menu-no-showroom') +
      (display.motion ? '' : ' menu-no-motion');
    byId('menu-setting-bg').textContent = display.showroom ? 'ON' : 'OFF';
    byId('menu-setting-bg').setAttribute('aria-pressed', String(display.showroom));
    byId('menu-setting-motion').textContent = display.motion ? 'ON' : 'OFF';
    byId('menu-setting-motion').setAttribute('aria-pressed', String(display.motion));
    byId('screen-setup').hidden = screen !== 'setup';
    byId('screen-career').hidden = screen !== 'career';
    byId('menu-continue').hidden = !career;
    byId('menu-continue').className = 'action-btn action-btn-primary';
    byId('menu-new-career').className = career ? 'action-btn action-btn-secondary' : 'action-btn action-btn-primary';
    if (career) {
      byId('menu-resume-description').textContent =
        career.name + ' / Day ' + String(career.day).padStart(2, '0');
    }
    if (screen !== 'career' || !career) return;
    // Derive mail from actual invoices, workshop quotes and staffing activity.
    // Never repeat a ledger receipt when reloading the same saved career.
    if(IN.sync(career,E))persistCareer();
    const date = gameDate(career.day);
    const short = dateShort.format(date).toUpperCase();
    bindText('company', career.name);
    byId('owner-startup-label').textContent=career.financialScenario==='uk2026'?
      'INDEPENDENT DEALER · OWNER CAPITAL £60,000 · OPENING BANK £50,000':
      'INDEPENDENT MOTOR TRADER · STARTING CAPITAL £12,500';
    bindText('cash', money.format(career.cash));
    bindText('customer-deposits',money.format(C.heldDeposits(career)));
    bindText('stock', career.stock + ' / ' + career.capacity);
    bindText('forecourt-capacity',career.capacity+' vehicles');
    bindText('workshop-bays',String(SITE.bays(career)));
    bindText('premises-daily',money.format(SITE.costs(career).total)+'/day');
    bindText('premises-arrears',money.format(career.premises.arrears));
    bindText('stock-count', String(career.stock));
    bindText('trade-profit', money.format(E.totalMargin(career)));
    bindText('sales', String(career.sales));
    bindText('reputation', career.reputation);
    bindText('reputation-score', career.reputationScore+' / 100');
    bindText('staff-count', String(career.staff.length));
    bindText('staff-arrears', money.format(career.payrollArrears));
    bindText('staff-daily-pay', money.format(career.staff.reduce(
      (n,e)=>n+P.dailyCost(e),0))+'/day');
    bindText('day-label', 'DAY ' + String(career.day).padStart(2, '0'));
    bindText('date', short);
    bindText('weekday', weekdayLong.format(date).toUpperCase());
    bindText('date-long', dateLong.format(date).toUpperCase());
    const badge = all('[data-bind="unread"]');
    const unread = unreadCount();
    for (const node of badge) {
      node.hidden = !unread;
      node.textContent = String(unread);
    }
    for (const panel of all('[data-panel]')) panel.hidden = panel.dataset.panel !== currentPage;
    for (const nav of all('.career-nav [data-page]')) {
      if (nav.dataset.page === currentPage) nav.setAttribute('aria-current', 'page');
      else nav.removeAttribute('aria-current');
    }
    byId('topbar-page').textContent = PAGES[currentPage];
    byId('continue-day').disabled = career.day >= MAX_DAY;
    byId('continue-label').textContent=D.isDealDay(career.day)?
      (career.deadlineSession>=D.PHASES.length-1?'CLOSE MONTH':'NEXT SESSION'):'CONTINUE';
    byId('save-warning').hidden = storageAvailable;
    byId('event-notice').hidden = !eventNotice;
    byId('event-notice').textContent = eventNotice;
    const toast = byId('trade-feedback-toast');
    toast.hidden = !lastTradeResult;
    toast.className = 'trade-feedback-toast' + (lastTradeResult?.ok ? ' trade-feedback-toast-success' : ' trade-feedback-toast-warning');
    toast.textContent = lastTradeResult?.message || '';
    renderInbox();
    renderTrading();
  }
  function show(pageOrScreen) {
    if (pageOrScreen === 'menu' || pageOrScreen === 'setup') {
      screen = pageOrScreen;
    } else if (career && Object.prototype.hasOwnProperty.call(PAGES, pageOrScreen)) {
      screen = 'career';
      currentPage = pageOrScreen;
    }
    eventNotice = '';
    lastTradeResult = null;
    render();
    if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
  }
  function advanceDay() {
    if (!career || career.day >= MAX_DAY) return;
    if(career.auctionHall.phase==='payment'){
      currentPage='auctionHall';
      eventNotice='An auction hammer has fallen. Finalise the winning bid and buyer fee before advancing the game day.';
      render();
      return;
    }
    if(career.auctionHall.phase==='bidding'){
      currentPage='auctionHall';
      eventNotice='The rival dealer is still bidding. Match the latest bid or choose PASS / LEAVE LOT to finish before advancing the game day.';
      render();
      return;
    }
    if(D.meetingBlocksContinue(career)){
      currentPage='events';
      eventNotice='Your monthly management meeting is due. Review the previous month and agree one priority before advancing to the next day.';
      render();
      return;
    }
    if(D.isDealDay(career.day)&&career.deadlineSession<D.PHASES.length-1){
      const event=D.advanceSession(career);
      E.nextCustomerSession(career);
      expandedReportId=null;
      offerDrafts={};
      selectedSellerId=null;
      lastTradeResult=null;
      currentPage='events';
      eventNotice=event.message;
      persistCareer();
      render();
      return;
    }
    const enteringDealDay=(career.day+1)%30===0;
    // Close the completed 30-day period BEFORE charging the next day's wage.
    // This keeps reports internally reconcilable with recorded ledger dates.
    const closed=career.day===career.monthPlan.endDay?M.close(career):null;
    career.day += 1;
    E.rollAuctionHall(career);
    auctionPreviewId=null;
    career.deadlineSession=0;
    if(closed) {
      M.next(career);
      selectedMonth=String(closed.month);
      currentPage='events'; // Show the first-day management meeting.
    } else if(enteringDealDay){
      currentPage='events'; // Surface the special event automatically.
    }
    const workforceEvent=E.staffDay(career);
    if(workforceEvent.support?.length){
      IN.emit(career,{from:'STAFF SUPERVISOR · '+workforceEvent.supervisor,
        category:'staff',subject:'Supervisor completed weekly staff check-ins',
        preview:workforceEvent.support.length+' employee'+(workforceEvent.support.length===1?'':'s')+
          ' supported through delegated rota and wellbeing check-ins.',
        body:'ROUTINE STAFF SUPPORT · NO OWNER APPROVAL NEEDED\\n\\n'+
          workforceEvent.supervisor+' has carried out this week’s low-cost employee check-ins.\n'+
          workforceEvent.support.join('\n')+
          '\n\nNo additional company expenditure was authorised. More significant welfare expenditure will be proposed separately for your approval.',
        linkPage:'staff',reference:'supervisor-checkins:'+career.day});
    }
    const premisesEvent=E.premisesDay(career);
    const aftersalesEvents=E.aftersalesDay(career);
    const vatEvent=E.vatDay(career);
    const workshopEvents=E.advanceWorkshop(career);
    const customerEvents=E.advanceCustomers(career);
    lastTradeResult = null;
    expandedReportId = null;
    career.reports = {};
    offerDrafts = {};
    selectedSellerId=null;
    // Prior negotiations are tied to that day's leads. Keep the save bounded.
    career.negotiations = {};
    career.auctionBids = {};
    const eventFactory = scheduledMessages[career.day];
    const scheduled=eventFactory?eventFactory():null;
    if (scheduled && !career.messages.some(m=>m.day===career.day&&m.subject===scheduled.subject)) {
      scheduled.id=career.messages.reduce((high,m)=>Math.max(high,m.id),0)+1;
      career.messages.push(scheduled);
      eventNotice = 'New inbox message received. Your game calendar has advanced by one day.';
    } else {
      eventNotice = E.auctionDay(career.day)?
        'WEEKLY AUCTION DAY: this week’s numbered lots are open.':
        'One game day completed. Private sellers have refreshed; next weekly auction is game day '+
          E.nextAuctionDay(career.day)+'.';
    }
    if(career.employmentScenario==='uk2026-payroll'){
      if(workforceEvent.periodClose){
        eventNotice+=' CALENDAR-MONTH PAYROLL: gross '+money.format(workforceEvent.gross)+
          ', net wages due '+money.format(workforceEvent.netWages)+
          ', employer NI after allowance '+money.format(workforceEvent.employerNi)+
          ', employer pension '+money.format(workforceEvent.employerPension)+
          ', Employment Allowance used '+money.format(workforceEvent.allowanceRelief)+'.';
      }
      if(workforceEvent.paid||workforceEvent.arrears)
        eventNotice+=' NET PAYROLL: '+money.format(workforceEvent.paid)+
          ' paid today; '+money.format(workforceEvent.arrears)+' wages unpaid.';
      if(workforceEvent.hmrcPaid||workforceEvent.pensionPaid)
        eventNotice+=' PAYROLL REMITTANCES: HMRC '+money.format(workforceEvent.hmrcPaid)+
          ', pension '+money.format(workforceEvent.pensionPaid)+'.';
    }else if(workforceEvent.payroll || workforceEvent.arrears){
      eventNotice += ' Staff wage settlement: '+money.format(workforceEvent.paid)+
        ' paid of '+money.format(workforceEvent.payroll)+
        '; unpaid balance '+money.format(workforceEvent.arrears)+'.';
      if(workforceEvent.departures.length)
        eventNotice+=' Departures: '+workforceEvent.departures.join(', ')+'.';
    }
    if(workforceEvent.departures.length&&career.employmentScenario==='uk2026-payroll')
      eventNotice+=' Departures: '+workforceEvent.departures.join(', ')+'.';
    eventNotice+=' PREMISES: '+money.format(premisesEvent.paid)+' of '+
      money.format(premisesEvent.due)+(career.financialScenario==='uk2026'?' daily operating bills paid; ':' daily rent/utilities paid; ')+
      money.format(premisesEvent.arrears)+' outstanding.';
    if(vatEvent.paid)
      eventNotice+=' HMRC VAT remittance: '+money.format(vatEvent.paid)+
        ' paid; '+E.vat.pence(vatEvent.duePence)+' of overdue output VAT remains.';
    else if(vatEvent.duePence>=100)
      eventNotice+=' VAT PAYMENT OVERDUE: '+E.vat.pence(vatEvent.duePence)+
        ' owed on the simplified eligible used-vehicle margin scheme.';
    if(workshopEvents.length)
      eventNotice+=' WORKSHOP: '+workshopEvents.join(' ');
    if(customerEvents.length)
      eventNotice+=' CUSTOMERS: '+customerEvents.join(' ');
    if(aftersalesEvents.length)
      eventNotice+=' AFTERSALES: '+aftersalesEvents.join(' ');
    if(closed){
      const id=career.messages.reduce((n,message)=>Math.max(n,message.id),0)+1;
      const status=closed.targetMet?'ACHIEVED':'MISSED';
      const shortReport='Sold '+closed.soldUnits+'/'+closed.targetUnits+
        ' cars. Turnover '+money.format(closed.turnover)+
        '. Gross trade margin '+money.format(closed.grossMargin)+
        '. Cash '+money.format(closed.closingCash)+'.';
      career.messages.push(makeMessage(id,career.day,'MANAGEMENT OFFICE',
        'Month '+closed.month+' report — target '+status,
        shortReport,
        'Your month '+closed.month+' management report is ready.\n\n'+shortReport+
        '\nStaff costs '+money.format(closed.staffCosts)+
        '. Unsold stock '+closed.stockCount+' cars, including '+
        closed.agedStock+' aged 14+ days.\n\nVisit Management Reports for the full financial statement, individual salesperson targets, stock position and reputation review.',
        'reports'));
      eventNotice='Month '+closed.month+' management review ready — company sales target '+
        status+'. Open MANAGEMENT REPORTS or your inbox for the full results. '+
        eventNotice;
    }
    persistCareer();
    render();
  }
  function startCareer() {
    const input = byId('dealership-name');
    const name = input.value.trim().replace(/\s+/g, ' ');
    if (name.length < 2 || name.length > 36) {
      input.setCustomValidity('Enter a name between 2 and 36 characters.');
      input.reportValidity();
      return;
    }
    input.setCustomValidity('');
    if (career && !window.confirm('Replace your existing career? This will overwrite your saved dealership and inbox history.')) return;
    const realistic=byId('career-realism').checked===true;
    career = E.create(name, welcomeMessages(realistic),realistic?'uk2026':'classic');
    selectedMessageId = null;
    inboxFilter='all';
    lastTradeResult = null;
    selectedMonth = 'current';
    expandedReportId = null;
    offerDrafts = {};
    selectedSellerId=null;
    selectedStockId=null;
    stockFilter='all';
    selectedWorkshopId=null;
    workshopFilter='all';
    selectedSalesId=null;
    salesFilter='all';
    ledgerFilter='all';
    ledgerExpanded=false;
    staffDeskMode=null;
    staffDeskRole='all';
    staffDeskSelectedId=null;
    screen = 'career';
    currentPage = 'dashboard';
    const saved = persistCareer();
    eventNotice = saved
      ? 'Career created and saved on this device. Welcome to your new dealership.'
      : 'Career created, but this browser blocked saving. Progress may be lost when you close the page.';
    render();
  }

  byId('career-form').addEventListener('submit', event => {
    event.preventDefault();
    startCareer();
  });
  byId('dealership-name').addEventListener('input', event => event.target.setCustomValidity(''));
  byId('career-realism').addEventListener('change',event=>{
    const modern=event.target.checked;
    byId('starting-cash-fact').textContent=modern?'£50,000':'£12,500';
    byId('career-type-fact').textContent=modern?'2026 independent':'Classic independent';
  });
  document.addEventListener('input', event => {
    if(!career||!event.target?.id)return;
    const match=/^(auction-bid-|seller-offer-)([AS]-[0-9]+-[0-9]+)$/.exec(event.target.id);
    if(!match)return;
    const kind=match[1]==='auction-bid-'?'auction':'seller';
    const car=E.marketFor(career)[kind==='auction'?'auctions':'sellers']
      .find(v=>v.id===match[2]);
    if(!car)return;
    const price=Number(event.target.value);
    const valid=event.target.value!==''&&Number.isSafeInteger(price);
    offerDrafts[match[2]]=valid?price:null;
    const output=byId('projection-'+match[2]);
    if(output)output.textContent=valid?expectedMarginText(car,kind,price):'ENTER A VALID OFFER';
    if(kind!=='seller')return;
    const set=(id,text)=>{const el=byId(id+'-'+car.id);if(el)el.textContent=text;return el;};
    if(!valid||price<100||price>car.ask){
      set('desk-projection','ENTER VALID OFFER');
      const warning=byId('desk-funding-warning-'+car.id);
      if(warning){warning.hidden=true;warning.textContent='';}
      const signal=byId('desk-signal-'+car.id);
      if(signal){signal.className='buy-decision buy-decision-risk';
        signal.textContent='Offer must be between £100 and '+cashText(car.ask)+'.';}
      return;
    }
    const model=BV.figures(car,career,E,price);
    const warning=byId('desk-funding-warning-'+car.id);
    if(warning){
      const message=BV.fundingWarning(career,model);
      warning.textContent=message;warning.hidden=!message;
    }
    set('desk-offer',cashText(price));
    set('desk-prep',cashText(model.quote.prep));
    set('desk-total',cashText(model.quote.total));
    const margin=set('desk-projection',cashText(model.quote.expectedMargin));
    if(margin)margin.className=model.quote.expectedMargin<0?'buy-negative':'';
    const headroom=set('desk-headroom',cashText(model.remaining));
    if(headroom)headroom.className=model.remaining<0?'buy-negative':'';
    const signal=byId('desk-signal-'+car.id);
    if(signal){
      signal.className='buy-decision buy-decision-'+model.position.kind;
      signal.innerHTML='<strong>'+VC.esc(model.position.label)+'</strong>'+
        '<p>'+VC.esc(model.position.text)+'</p>';
    }
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-action],button[data-page]');
    if (!button) return;
    const destination = button.dataset.page;
    if (destination && Object.prototype.hasOwnProperty.call(PAGES, destination)) {
      const id=Number(button.dataset.id);
      if(career&&Number.isSafeInteger(id)&&career.vehicles.some(v=>v.id===id)){
        if(destination==='workshop'){selectedWorkshopId=id;workshopFilter='all';}
        if(destination==='stock'){selectedStockId=id;stockFilter='all';}
        if(destination==='sales'){selectedSalesId=id;salesFilter='all';}
      }
      show(destination);
      return;
    }
    // A hammered lot creates a binding invoice. Do not allow other purchases,
    // workshops, payroll decisions or time progression to spend its funds.
    if(career?.auctionHall?.phase==='payment'&&
       !['settle-auction','toggle-report','preview-auction','close-auction-preview',
         'menu','resume','dashboard','new-career','select-report'].includes(button.dataset.action)){
      currentPage='auctionHall';
      eventNotice='Auction invoice outstanding. Pay the hammer plus buyer fee before other dealership decisions.';
      render();
      return;
    }
    switch (button.dataset.action) {
      case 'new-career':
        show('setup');
        break;
      case 'resume':
        if (career) show('dashboard');
        break;
      case 'dashboard':
        if (career) show('dashboard');
        break;
      case 'menu':
        show('menu');
        break;
      case 'continue':
        advanceDay();
        break;
      case 'hold-meeting':
        if(career){
          const r=D.holdMeeting(career,button.dataset.focus);
          eventNotice=r.message;
          lastTradeResult=null;
          if(r.ok)persistCareer();
          currentPage='events';
          render();
        }
        break;
      case 'select-workshop':
        if(career&&career.vehicles.some(v=>v.id===Number(button.dataset.id))){
          selectedWorkshopId=Number(button.dataset.id);currentPage='workshop';render();
        }
        break;
      case 'filter-workshop':
        if(career&&WV.FILTERS.includes(button.dataset.filter)){
          workshopFilter=button.dataset.filter;selectedWorkshopId=null;
          currentPage='workshop';render();
        }
        break;
      case 'assess-workshop':
        if(career)saveResult(E.assessStock(career,Number(button.dataset.id)));
        break;
      case 'start-workshop':
        if(career)saveResult(E.startPrep(career,Number(button.dataset.id),button.dataset.method));
        break;
      case 'finish-workshop':
        if(career)saveResult(E.finishPrep(career,Number(button.dataset.id)));
        break;
      case 'outsource-workshop':
        if(career)saveResult(E.transferPrep(career,Number(button.dataset.id)));
        break;
      case 'dispose-workshop':
        if(career){
          const vehicle=career.vehicles.find(v=>v.id===Number(button.dataset.id));
          if(vehicle&&window.confirm('Dispose of '+vehicle.title+
            ' to the trade for the simulated bid '+money.format(E.wholesaleOffer(vehicle,career))+
            '? This crystallises the actual acquisition and paid repair costs, and frees a stock space. Do not treat this as a verified buyer quote.')){
            saveResult(E.disposeStock(career,vehicle.id));
          }
        }
        break;
      case 'select-seller': {
        if(career&&E.marketFor(career).sellers.some(car=>car.id===button.dataset.id)){
          selectedSellerId=button.dataset.id;
          currentPage='auctions';
          render();
        }
        break;
      }
      case 'toggle-report':
        if (career) {
          if(button.dataset.kind==='seller')selectedSellerId=button.dataset.id;
          const key=button.dataset.kind+':'+button.dataset.id;
          if(button.dataset.kind==='auction'&&
             E.auctionLot(career)?.id!==button.dataset.id)
            auctionPreviewId=button.dataset.id;
          expandedReportId=expandedReportId===key?null:key;
          render();
        }
        break;
      case 'inspect-lead':
        if (career) {
          if(button.dataset.kind==='seller')selectedSellerId=button.dataset.id;
          expandedReportId=button.dataset.kind+':'+button.dataset.id;
          if(button.dataset.kind==='auction'&&
             E.auctionLot(career)?.id!==button.dataset.id)
            auctionPreviewId=button.dataset.id;
          saveResult(E.inspectLead(career,button.dataset.kind,button.dataset.id),
            button.dataset.id);
        }
        break;
      case 'staff-desk-mode':
        if(career&&PV.DESK_MODES.includes(button.dataset.mode)){
          staffDeskMode=button.dataset.mode;
          staffDeskRole='all';staffDeskSelectedId=null;
          currentPage='staff';render();
        }
        break;
      case 'staff-desk-role':
        if(career&&PV.DESK_ROLES.includes(button.dataset.role)){
          staffDeskRole=button.dataset.role;
          staffDeskSelectedId=null;currentPage='staff';render();
        }
        break;
      case 'select-person':
        if(career&&typeof button.dataset.person==='string'&&
          ((staffDeskMode==='team'&&career.staff.some(e=>'e:'+e.id===button.dataset.person))||
           (staffDeskMode==='candidates'&&P.applicants(career.day)
             .some(e=>'c:'+e.id===button.dataset.person)))){
          staffDeskSelectedId=button.dataset.person;
          currentPage='staff';render();
        }
        break;
      case 'hire-staff':
        if(career){
          const target=P.applicants(career.day).find(c=>c.id===button.dataset.id);
          const result=E.hireStaff(career,button.dataset.id);
          if(result.ok&&target){
            const hired=career.staff.find(e=>e.name===target.name);
            staffDeskMode='team';staffDeskRole='all';
            staffDeskSelectedId=hired?'e:'+hired.id:null;
          }
          saveResult(result);
        }
        break;
      case 'upgrade-premises':
        if(career&&['forecourt','workshop'].includes(button.dataset.kind)){
          const quote=SITE.quote(career,button.dataset.kind);
          if(quote&&!quote.maximum&&window.confirm('Invest '+money.format(quote.cost)+
            ' in '+button.dataset.kind+' expansion? Daily rent and utilities will increase by '+
            money.format(quote.dailyIncrease)+'. Existing workshop reserves remain protected.'))
            saveResult(E.upgradePremises(career,button.dataset.kind));
        }
        break;
      case 'select-report':
        if(career){
          const chosen=button.dataset.month;
          if(chosen==='current'||career.monthlyReports.some(r=>String(r.month)===chosen)){
            selectedMonth=chosen;
            render();
          }
        }
        break;
      case 'train-staff':
        if (career) saveResult(P.train(career,Number(button.dataset.id)));
        break;
      case 'release-staff':
        if (career&&window.confirm('Release this employee? The game charges seven days of provisional notice pay, even if cash is unavailable.')){
          const result=P.release(career,Number(button.dataset.id));
          if(result.ok){staffDeskSelectedId=null;
            if(!career.staff.length){staffDeskMode='candidates';staffDeskRole='all';}}
          saveResult(result);
        }
        break;
      case 'preview-auction':
        if(career&&E.marketFor(career).auctions.some(lot=>lot.id===button.dataset.id)){
          auctionPreviewId=button.dataset.id;
          expandedReportId='auction:'+button.dataset.id;
          render();
        }
        break;
      case 'close-auction-preview':
        auctionPreviewId=null;
        render();
        break;
      case 'start-auction':
        if(career){
          auctionPreviewId=null;
          saveResult(E.startAuction(career));
        }
        break;
      case 'bid-live-auction':
        if(career)saveResult(E.bidLiveAuction(career,Number(button.dataset.increment)));
        break;
      case 'settle-auction':
        if(career)saveResult(E.settleAuction(career));
        break;
      case 'pass-auction':
        if(career)saveResult(E.passAuction(career));
        break;
      case 'next-auction-lot':
        if(career){
          auctionPreviewId=null;
          saveResult(E.nextAuctionLot(career));
        }
        break;
      case 'bid-auction':
        if (career) saveResult(E.acquireAuction(career,button.dataset.id,
          inputNumber('auction-bid-' + button.dataset.id)),button.dataset.id);
        break;
      case 'buy-seller':
        if(career)selectedSellerId=button.dataset.id;
        if (career) saveResult(E.acquireSeller(career,button.dataset.id,
          inputNumber('seller-offer-' + button.dataset.id)),button.dataset.id);
        break;
      case 'accept-seller-counter':
        if (career) {
          selectedSellerId=button.dataset.id;
          const offer=career.negotiations?.[button.dataset.id]?.counter;
          saveResult(E.acquireSeller(career,button.dataset.id,offer),button.dataset.id);
        }
        break;
      case 'walk-seller':
        if(career)selectedSellerId=button.dataset.id;
        if (career) saveResult(E.walkSeller(career,button.dataset.id),button.dataset.id);
        break;
      case 'dismiss-feedback':
        lastTradeResult = null;
        byId('trade-feedback-toast').hidden = true;
        break;
      case 'prepare-stock':
        if(career){
          currentPage='workshop';
          eventNotice='Vehicle preparation now requires assessment, booked repairs, elapsed game days and final quality control.';
          render();
        }
        break;
      case 'select-stock':
        if(career&&career.vehicles.some(v=>v.id===Number(button.dataset.id))){
          selectedStockId=Number(button.dataset.id);
          currentPage='stock';
          render();
        }
        break;
      case 'filter-stock':
        if(career&&SV.FILTERS.includes(button.dataset.filter)){
          stockFilter=button.dataset.filter;
          selectedStockId=null;
          currentPage='stock';
          render();
        }
        break;
      case 'list-stock':
        if (career) saveResult(E.advertise(career,Number(button.dataset.id),
          inputNumber('stock-price-' + button.dataset.id)));
        break;
      case 'select-sales':
        if(career&&career.vehicles.some(v=>v.id===Number(button.dataset.id)&&v.status==='listed')){
          selectedSalesId=Number(button.dataset.id);currentPage='sales';render();
        }
        break;
      case 'filter-sales':
        if(career&&CV.FILTERS.includes(button.dataset.filter)){
          salesFilter=button.dataset.filter;selectedSalesId=null;
          currentPage='sales';render();
        }
        break;
      case 'open-customer':
        if(career)saveResult(E.openCustomer(career,Number(button.dataset.id)));
        break;
      case 'quote-customer':
        if(career)saveResult(E.quoteCustomer(career,Number(button.dataset.id),
          inputNumber('prequote-'+button.dataset.id)));
        break;
      case 'accept-buyer-counter':
        if(career)saveResult(E.acceptPriceCounterCustomer(career,Number(button.dataset.id)));
        break;
      case 'remote-reserve-customer':
        if(career&&window.confirm('Ask this customer to leave a £250 online/telephone reservation deposit? The customer can decline. If paid, it stays in the separate holding account and can be fully refunded before collection. Final vehicle inspection and balance payment remain due.'))
          saveResult(E.remoteReserveCustomer(career,Number(button.dataset.id)));
        break;
      case 'inspect-remote-customer':
        if(career)saveResult(E.inspectRemoteCustomer(career,Number(button.dataset.id)));
        break;
      case 'book-customer':
        if(career)saveResult(E.bookCustomer(career,Number(button.dataset.id)));
        break;
      case 'competing-customer':
        if(career)saveResult(E.competingCustomer(career,Number(button.dataset.id)));
        break;
      case 'test-drive':
        if(career)saveResult(E.testDrive(career,Number(button.dataset.id)));
        break;
      case 'agree-cash':
        if(career)saveResult(E.agreeCustomer(career,Number(button.dataset.id),'cash',null));
        break;
      case 'agree-part-ex':
        if(career)saveResult(E.agreeCustomer(career,Number(button.dataset.id),'part-ex',
          inputNumber('px-allowance-'+button.dataset.id)));
        break;
      case 'deposit-customer':
        if(career)saveResult(E.depositCustomer(career,Number(button.dataset.id)));
        break;
      case 'cancel-customer':
        if(career&&window.confirm('Cancel the deal because of a dealership issue? The full held customer deposit will be refunded.'))
          saveResult(E.cancelCustomer(career,Number(button.dataset.id),'dealer'));
        break;
      case 'customer-withdrawal':
        if(career){
          const caseData=E.customers.caseFor(career,Number(button.dataset.id));
          const notice=caseData?.remote?
            'The phone/online customer is withdrawing before collection. Refund the FULL £250 from the segregated holding account? The dealership bears its own preparation expense.':
            'The buyer is withdrawing. For an in-person £250 reservation, only recorded customer-specific direct costs may be retained, with the remainder refunded. Record the withdrawal?';
          if(window.confirm(notice))saveResult(E.cancelCustomer(career,Number(button.dataset.id),'buyer'));
        }
        break;
      case 'handover-customer':
        if(career)saveResult(E.completeSale(career,Number(button.dataset.id),button.dataset.mode,null));
        break;
      case 'counter-sale':
        if (career) saveResult(E.counter(career,Number(button.dataset.id)));
        break;
      case 'sell-cash':
        if (career) saveResult(E.completeSale(career,Number(button.dataset.id),'cash',null));
        break;
      case 'sell-part-ex':
        if (career) saveResult(E.completeSale(career,Number(button.dataset.id),'part-ex',
          inputNumber('px-allowance-' + button.dataset.id)));
        break;
      case 'aftersales-repair':
        if(career&&window.confirm('Authorise a VAT-inclusive outsourced consumer remedy? The customer pays nothing and your dealership pays the repair invoice.'))
          saveResult(E.repairAftersales(career,Number(button.dataset.id)));
        break;
      case 'aftersales-refund':
        if(career&&window.confirm('Accept the full retail refund and dealer-funded vehicle collection? This becomes a binding customer liability, even if the business has insufficient cash. Part-exchange consideration is returned as a cash equivalent only with the simulated customer agreement.'))
          saveResult(E.refundAftersales(career,Number(button.dataset.id)));
        break;
      case 'aftersales-reduce':
        if(career&&window.confirm('The customer agrees to keep the car after the failed repair in return for the displayed case-specific price reduction. Authorise the partial refund and corresponding VAT adjustment?'))
          saveResult(E.reduceAftersales(career,Number(button.dataset.id)));
        break;
      case 'aftersales-recover':
        if(career)saveResult(E.releaseReturned(career,Number(button.dataset.id)));
        break;
      case 'filter-ledger':
        if(career&&FV.FILTERS.includes(button.dataset.filter)){
          ledgerFilter=button.dataset.filter;
          ledgerExpanded=false;
          currentPage='finance';render();
        }
        break;
      case 'toggle-ledger':
        if(career){ledgerExpanded=!ledgerExpanded;currentPage='finance';render();}
        break;
      case 'toggle-showroom':
        display.showroom = !display.showroom;
        saveDisplay();
        render();
        break;
      case 'toggle-motion':
        display.motion = !display.motion;
        saveDisplay();
        render();
        break;
      case 'toggle-settings': {
        const guide = byId('menu-guide');
        guide.hidden = !guide.hidden;
        button.setAttribute('aria-expanded', String(!guide.hidden));
        break;
      }
      case 'toggle-inbox-read': {
        if(!career)break;
        const target=career.messages.find(m=>m.id===Number(button.dataset.id));
        if(target){
          target.read=!target.read;
          selectedMessageId=target.id;
          persistCareer();
          render();
        }
        break;
      }
      case 'filter-inbox':
        if(career&&IN.categories.includes(button.dataset.filter)){
          inboxFilter=button.dataset.filter;
          selectedMessageId=null;
          currentPage='inbox';
          render();
        }
        break;
      case 'decide-staff-welfare': {
        if(!career)break;
        const id=Number(button.dataset.id);
        const approve=button.dataset.decision==='approve';
        if(!['approve','decline'].includes(button.dataset.decision))break;
        const request=career.messages.find(m=>m.id===id);
        if(!request)break;
        if(approve){
          const employeeId=IN.moraleId(request);
          const plan=employeeId!==null?P.moraleProposal(career,employeeId):null;
          if(!plan){
            eventNotice='That supervisor recommendation is no longer valid.';
            render();break;
          }
          if(!window.confirm('Approve '+money.format(plan.cost)+
            ' of company funds for '+plan.employee.name+'’s staff welfare plan?'))break;
        }
        const result=E.decideStaffMorale(career,id,approve);
        if(result.ok){
          inboxFilter='all';selectedMessageId=id;currentPage='inbox';
        }
        saveResult(result);
        break;
      }
      case 'approve-inbox-repair': {
        if(!career)break;
        const selected=career.messages.find(m=>m.id===selectedMessageId);
        const car=selected&&IN.actionFor(selected,career);
        const method=button.dataset.method;
        if(!car||car.id!==Number(button.dataset.id)||!['internal','external'].includes(method)){
          eventNotice='This repair request is no longer awaiting approval.';
          render();
          break;
        }
        if(!window.confirm('Authorise '+method+' repairs on '+car.title+'? The workshop will immediately debit the agreed booking cost and begin the job.'))break;
        saveResult(E.startPrep(career,car.id,method));
        break;
      }
      case 'read-message': {
        if (!career) break;
        const id = Number(button.dataset.id);
        const message = career.messages.find(m => m.id === id);
        if (!message) break;
        selectedMessageId = id;
        message.read = true;
        persistCareer();
        show('inbox');
        break;
      }
      case 'mark-all-read':
        if (!career) break;
        for (const message of career.messages) message.read = true;
        persistCareer();
        eventNotice = 'Inbox messages marked as read.';
        render();
        break;
      case 'save':
        if (!career) break;
        eventNotice = persistCareer()
          ? 'Your career was saved in this browser.'
          : 'Unable to save your career. Browser storage is unavailable.';
        render();
        break;
      default:
        break;
    }
  });
  render();
})();