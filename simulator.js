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
  if (!E || !PV || !MV || !EV || !WV)
    throw new Error('Workshop and report modules must load before simulator.js');
  const P = E.people;
  const M = E.monthly;
  const D = E.events;
  const W = E.workshop;
  const STORAGE_KEY = 'the-motor-trade-career-v1';
  const DISPLAY_KEY = 'the-motor-trade-display-v1';
  const SAVE_VERSION = E.VERSION;
  const STARTING_CASH = 12500;
  const CAPACITY = 2;
  const START_DATE_UTC = Date.UTC(2026, 10, 9);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MAX_DAY = 36500;
  const PAGES = Object.freeze({
    dashboard: 'DASHBOARD',
    inbox: 'INBOX',
    auctions: 'BUYING DESK',
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
  function welcomeMessages() {
    return [
      makeMessage(1,1,'BUSINESS SUPPORT','Welcome to the motor trade',
        'Run your first dealership, with £12,500 in capital.',
        'Your dealership starts with £12,500 in cash and two spaces on your forecourt. Visit the Buying Desk to view auction lots and customers who want to sell their cars directly.\n\nA car needs paid preparation before it can be advertised. Once listed, customers will bring cash offers or propose a part-exchange. A part-exchange becomes your next vehicle in stock.',
        'auctions'),
      makeMessage(2,1,'BUYING DESK','Three ways to find your next car',
        'Auctions, direct sellers and part-exchanges all supply vehicles.',
        'Auctions have competing traders and buyer fees. Direct sellers can reject low offers. Part-exchanges happen when you sell one of your advertised cars and agree an allowance for the customer\'s existing vehicle.\n\nEvery route affects your cash and stock differently. Your first market opportunities are waiting.',
        'auctions'),
      makeMessage(3,1,'ACCOUNTS OFFICE','Protect your opening £12,500',
        'Gross margin is different from cash flow.',
        'Every purchase and preparation job costs cash. Customer sales return cash, while part-exchange deals include the incoming vehicle as a separate purchase.\n\nThe Finances page records each transaction. Gross trade margin currently excludes VAT, tax, business overheads, finance and after-sale consumer claims.',
        'finance')
    ];
  }
  const scheduledMessages = Object.freeze({
    2: () => makeMessage(4,2,'BUYING DESK','Today\'s stock opportunities have refreshed',
      'New auction lots and private sellers are on the market.',
      'Each new day brings a refreshed set of fictional auction and direct-sale opportunities. Look at total acquisition cost and your preparation budget before agreeing a deal.',
      'auctions'),
    3: () => makeMessage(5,3,'SALES ADVISER','Cash sale or part-exchange?',
      'Both deals can move your stock, but they affect your cash differently.',
      'A cash customer pays the agreed sale price. A part-exchange customer brings a car and pays only the balance after their agreed allowance. You own that incoming car and must prepare it before advertising it.',
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
  let eventNotice = '';
  let lastTradeResult = null;
  let expandedReportId = null;
  let offerDrafts = {};
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
    button.className = (compact ? 'message-preview' : 'inbox-row') + (message.read ? '' : ' is-unread');
    if (!compact) button.setAttribute('aria-pressed', String(message.id === selectedMessageId));
    const stamp = message.day === 1 ? 'DAY 01' : 'DAY ' + String(message.day).padStart(2, '0');
    button.innerHTML =
      '<span class="message-icon" aria-hidden="true">✉</span>' +
      '<span class="message-copy">' +
        '<span class="message-from"><span>' + escapeText(message.from) + '</span><time>' + stamp + '</time></span>' +
        '<span class="message-title">' + escapeText(message.subject) + '</span>' +
        '<span class="message-summary">' + escapeText(message.preview) + '</span>' +
      '</span>' +
      (message.read ? '' : '<span class="message-unread" aria-label="Unread"></span>');
    return button;
  }
  function renderInbox() {
    if (!career) return;
    const ordered = [...career.messages].sort((a, b) => b.day - a.day || b.id - a.id);
    const preview = byId('dashboard-inbox');
    const list = byId('inbox-list');
    preview.replaceChildren(...ordered.slice(0, 3).map(m => renderMessageRow(m, true)));
    list.replaceChildren(...ordered.map(m => renderMessageRow(m, false)));
    const unread = unreadCount();
    byId('widget-unread-label').textContent = unread + ' UNREAD';
    byId('inbox-unread-count').textContent = unread + ' UNREAD';
    const selected = career.messages.find(m => m.id === selectedMessageId);
    const detail = byId('inbox-detail');
    if (!selected) {
      detail.textContent = 'Select a message to read it.';
      return;
    }
    detail.innerHTML =
      '<div class="detail-heading">' +
        '<span class="section-overline">DAY ' + String(selected.day).padStart(2, '0') + ' / MESSAGE</span>' +
        '<h2>' + escapeText(selected.subject) + '</h2>' +
        '<span class="detail-sender">FROM: ' + escapeText(selected.from) + '</span>' +
      '</div>' +
      '<p class="detail-body">' + escapeText(selected.body) + '</p>';
    if (selected.linkPage && Object.prototype.hasOwnProperty.call(PAGES, selected.linkPage)) {
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'secondary-button detail-action';
      action.dataset.page = selected.linkPage;
      action.textContent = 'OPEN ' + PAGES[selected.linkPage] + ' ↗';
      detail.appendChild(action);
    }
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
  function cardHeader(car, source) {
    return '<div class="trade-card-top"><div><span class="trade-card-kicker">' + escapeText(source) +
      '</span><h3>' + escapeText(car.title) + '</h3></div>' +
      '<span class="trade-source">GRADE ' + (car.profile?.grade||car.grade||3) + '</span></div>' +
      details(car) + '<p class="trade-card-note">' + escapeText(car.note) + '</p>';
  }
  function reportCard(car,kind,price) {
    const key=kind+':'+car.id;
    return window.MotorTradeVehicleView.render(car,kind,{
      open:expandedReportId===key,
      inspected:kind==='stock'?!!car.profile?.inspected:!!career.reports?.[car.id],
      price
    });
  }
  function repairReserve(car) {
    return car.profile?.basePrep + (car.profile?.riskAllowance||0);
  }
  function expectedMarginText(car,kind,price) {
    return cashText(E.quote(car,kind,price,!!career.reports?.[car.id]).expectedMargin);
  }
  function renderMarket() {
    const {auctions,sellers} = E.market(career.day,career.reputationScore,career.deadlineSession,
      career.name,career.monthPlan.startingReputation);
    const auctionsHtml = auctions.length ? auctions.map(lot => {
      const state = (career.auctionBids || {})[lot.id];
      const owned = career.vehicles.some(v => v.origin === lot.id);
      const closed = owned || state?.status === 'lost';
      const warning = purchaseWarning(lot.guide + lot.fee + repairReserve(lot));
      const auctionIntel=P.buyerEstimate(career,Math.max(lot.rival,lot.reserve));
      const guide = Number.isSafeInteger(offerDrafts[lot.id]) ?
        offerDrafts[lot.id] : state?.lastBid ?
          Math.max(lot.guide,state.lastBid + 150) : lot.guide + 250;
      const outcome = owned ? '<div class="trade-inline-feedback trade-feedback-success">PURCHASED — see Vehicle Stock.</div>' :
        state?.status === 'lost' ? '<div class="trade-inline-feedback trade-feedback-warning">OUTBID — lot closed. No fee charged.</div>' :
        state?.status === 'outbid' ? '<div class="trade-inline-feedback trade-feedback-warning">OUTBID — one more bid available. No fee charged.</div>' : '';
      return '<article class="trade-card">' + cardHeader(lot,'AUCTION / '+lot.id) +
        reportCard(lot,'auction',guide) +
        '<div class="trade-pricing"><div><small>GUIDE BID</small><strong>'+cashText(lot.guide) +
        '</strong></div><div><small>BUYER FEE</small><strong>'+cashText(lot.fee) +
        '</strong></div><div><small>EST. RETAIL</small><strong>'+cashText(lot.retail) +
        '</strong></div><div><small>EST. PREP</small><strong>'+cashText(lot.prep) +
        '</strong></div></div><div class="trade-actions">'+
        '<span class="trade-extra">Maximum bid simulation · buyer fee only if you win. Include the fee and preparation when calculating your limit.</span>' +
        (auctionIntel?'<span class="people-bid-intel">BUYER INTELLIGENCE: EXPECTED RIVAL BID '+
          cashText(auctionIntel.lower)+'–'+cashText(auctionIntel.upper)+
          '. Range estimate, not a guaranteed result.</span>':'')+
        (warning && !closed ? '<div class="trade-purchase-warning">'+escapeText(warning)+'</div>' : '')+
        outcome+leadFeedback(lot.id)+
        '<div class="trade-action-row"><label>YOUR MAXIMUM BID (£)<input class="trade-input" type="number" inputmode="numeric" min="'+lot.guide+
        '" max="100000" step="25" id="auction-bid-'+lot.id+'" value="'+guide+'"></label>'+
        '<button type="button" class="trade-button" data-action="bid-auction" data-id="'+lot.id+
        '"'+(closed?' disabled':'')+'>'+(closed?'CLOSED':'PLACE BID')+'</button></div></div></article>';
    }).join('') : D.isDealDay(career.day) ?
      '<div class="trade-empty deadline-auction-closed"><h2>AUCTIONS CLOSED — DEAL DAY.</h2>'+
      '<p>Today is reserved for private sellers, retail customers and part-exchanges. Auction houses resume tomorrow.</p></div>' :
      '<div class="trade-empty">No auction session today. Check direct sellers or advance to the next game day.</div>';
    const sellersHtml = sellers.length ? sellers.map(car => {
      const negotiation = (career.negotiations || {})[car.id];
      const owned = career.vehicles.some(v => v.origin === car.id);
      const closed = owned || negotiation?.status === 'walked';
      const warning = purchaseWarning(car.ask + repairReserve(car));
      const asking = Number.isSafeInteger(offerDrafts[car.id]) ?
        offerDrafts[car.id] : negotiation?.status === 'counter' ? negotiation.counter : car.ask;
      const offerStatus = owned ? '<div class="trade-inline-feedback trade-feedback-success">PURCHASED — car added to Vehicle Stock.</div>' :
        negotiation?.status === 'walked' ? '<div class="trade-inline-feedback trade-feedback-warning">OWNER WALKED AWAY — enquiry closed for today.</div>' :
        negotiation?.status === 'counter' ?
          '<div class="trade-inline-feedback trade-feedback-counter"><strong>SELLER COUNTEROFFER: '+cashText(negotiation.counter)+'</strong> — accept, revise or walk away.</div>' : '';
      const controls = closed ? '<button type="button" class="trade-button" disabled>ENQUIRY CLOSED</button>' :
        '<div class="trade-action-row"><label>YOUR OFFER (£)<input class="trade-input" type="number" inputmode="numeric" min="100" max="'+car.ask+
        '" step="25" id="seller-offer-'+car.id+'" value="'+asking+'"></label>'+
        '<button type="button" class="trade-button" data-action="buy-seller" data-id="'+car.id+
        '">'+(negotiation?.status==='counter'?'SUBMIT OFFER':'MAKE OFFER')+'</button></div>'+
        (negotiation?.status==='counter'?'<div class="trade-offer-buttons"><button type="button" class="trade-button trade-button-secondary" data-action="accept-seller-counter" data-id="'+car.id+
          '">ACCEPT '+cashText(negotiation.counter)+'</button><button type="button" class="trade-button trade-button-outline" data-action="walk-seller" data-id="'+car.id+'">WALK AWAY</button></div>':'');
      return '<article class="trade-card">' + cardHeader(car,'DIRECT SELLER / '+car.id) +
        reportCard(car,'seller',asking) +
        '<div class="trade-pricing"><div><small>OWNER ASKS</small><strong>'+cashText(car.ask)+
        '</strong></div><div><small>EST. RETAIL</small><strong>'+cashText(car.retail)+
        '</strong></div><div><small>EST. PREP</small><strong>'+cashText(car.prep)+
        '</strong></div><div><small>BUYER FEE</small><strong>£0</strong></div></div>'+
        '<div class="trade-actions"><span class="trade-extra">The owner can accept your offer, negotiate, or leave. Each enquiry is limited to two rounds.</span>'+
        (warning && !closed ? '<div class="trade-purchase-warning">'+escapeText(warning)+'</div>' : '')+
        offerStatus+leadFeedback(car.id)+controls+'</div></article>';
    }).join('') : D.isDealDay(career.day)?
      '<div class="trade-empty"><h2>NO PRIVATE SELLER ENQUIRIES THIS SESSION.</h2>'+
      '<p>This month may be quiet. The next session could bring new sellers, but nothing is guaranteed. Auctions are closed.</p></div>' :
      '<div class="trade-empty">No private or walk-in seller leads today. Check auction lots or the next game day.</div>';
    byId('market-auctions').innerHTML = auctionsHtml;
    byId('market-sellers').innerHTML = sellersHtml;
  }
  function renderStock() {
    const container = byId('stock-list');
    if (!career.vehicles.length) {
      container.innerHTML = '<div class="trade-empty"><h2>YOUR FORECOURT IS EMPTY.</h2><p>Visit the Buying Desk to bid at an auction or negotiate with a private seller.</p></div>';
      return;
    }
    container.innerHTML = career.vehicles.map(car => {
      const status = car.status === 'acquired' ?
          ({
            unassessed:'NEEDS WORKSHOP ASSESSMENT',
            quoted:'WAITING FOR REPAIR APPROVAL',
            'in-progress':'REPAIRS IN PROGRESS',
            'quality-check':'QUALITY CHECK DUE'
          }[car.workshop?.stage]||'WORKSHOP REQUIRED') :
        car.status === 'prepared' ? 'READY TO ADVERTISE' : 'ADVERTISED';
      const age = career.day - car.acquiredDay;
      const totals = car.cost + car.prepSpent;
      const action = car.status === 'acquired'
        ? '<div class="workshop-stock-action"><p>Preparation takes time. '+
          (car.workshop?.stage==='in-progress'?
            car.workshop.remainingDays+' day(s) until repairs finish, then quality control is due.' :
            car.workshop?.stage==='quality-check'?'Repairs finished. Complete quality control before advertising.' :
            'Authorise an assessment and choose an internal or external garage.')+
          '</p><button class="trade-button" type="button" data-page="workshop">'+
          'OPEN WORKSHOP →</button></div>'
        : '<div class="trade-action-row"><label>RETAIL ASKING PRICE (£)<input class="trade-input" id="stock-price-' + car.id +
          '" type="number" inputmode="numeric" min="500" max="75000" step="50" value="' + (car.asking ?? car.retail) +
          '"></label><button class="trade-button" type="button" data-action="list-stock" data-id="' + car.id +
          '">' + (car.status === 'listed' ? 'UPDATE PRICE' : 'ADVERTISE') + '</button></div>';
      return '<article class="trade-card">' + cardHeader(car,car.source.toUpperCase() + ' / STOCK ' + car.id) +
        reportCard(car,'stock',car.asking??car.retail) +
        '<div class="trade-pricing"><div><small>ACQUISITION</small><strong>' + cashText(car.cost) +
        '</strong></div><div><small>PREP SPENT</small><strong>' + cashText(car.prepSpent) +
        '</strong></div><div><small>COST TO DATE</small><strong>' + cashText(totals) +
        '</strong></div><div><small>EST. RETAIL</small><strong>' + cashText(car.retail) +
        '</strong></div></div><div class="trade-actions"><span class="trade-status">' + status +
        ' · DAY ' + car.acquiredDay + ' · ' + age + ' DAYS HELD</span>' +
        (car.status === 'acquired' ?
          '<span class="trade-extra">Workshop assessment, repair turnaround and final quality control are required before advertising. Original repair budget: '+
          cashText(car.prepBudget)+'.</span>' : '') +
        action + '</div></article>';
    }).join('');
  }
  function renderWorkshop() {
    byId('workshop-board').innerHTML=WV.render(career,W);
  }
  function renderSales() {
    const listed=career.vehicles.filter(car=>car.status==='listed');
    const holder=byId('sales-list');
    const outlook=D.isDealDay(career.day)?D.outlook(career):null;
    const deadlineNote=outlook?
      '<div class="deadline-retail-intro"><strong>DEAL DAY · '+D.dealSession(career).time+
      ' · '+escapeText(outlook.label)+'</strong>'+
      '<p>Customer interest is uncertain. Some sessions bring cash buyers or part-exchanges; others bring no enquiries. Stronger negotiating terms are possible, not guaranteed.</p></div>':'';
    if(!listed.length){
      holder.innerHTML=deadlineNote+'<div class="trade-empty"><h2>NO RETAIL ENQUIRIES YET.</h2>'+
        '<p>Prepare a vehicle and advertise it from Vehicle Stock. A quiet Deal Day may finish without any sales.</p></div>';
      return;
    }
    holder.innerHTML=deadlineNote+listed.map(car=>{
      const buyer=E.buyers(car,career);
      const top=cardHeader(car,'CUSTOMER ENQUIRY / STOCK '+car.id);
      const pricing='<div class="trade-pricing"><div><small>YOUR ASKING PRICE</small><strong>'+
        cashText(car.asking)+'</strong></div><div><small>YOUR COST + PREP</small><strong>'+
        cashText(car.cost+car.prepSpent)+'</strong></div></div>';
      if(!buyer){
        return '<article class="trade-card">'+top+pricing+
          '<div class="trade-actions"><div class="trade-inline-feedback trade-feedback-warning">'+
          'NO INTERESTED CUSTOMER THIS SESSION — this vehicle has no retail buyer right now. '+
          'Wait for another session or review your asking price. This does not guarantee a later enquiry.'+
          '</div></div></article>';
      }
      const cash='<div><h4>CASH BUYER</h4><p>Customer offers</p><strong>'+
        cashText(buyer.cashOffer)+'</strong><p>Negotiate another £150, or accept this price.</p>'+
        '<div class="trade-action-row"><button class="trade-button trade-button-secondary" type="button" data-action="counter-sale" data-id="'+car.id+
        '">COUNTER +£150</button><button class="trade-button" type="button" data-action="sell-cash" data-id="'+car.id+
        '">ACCEPT CASH</button></div></div>';
      const px=buyer.exchange;
      const tradeIn=px?'<div><h4>PART-EXCHANGE BUYER</h4><p>Customer wants '+
        cashText(buyer.pxOffer)+' for your car and offers <strong>'+
        escapeText(px.title)+'</strong> ('+milesText(px.miles)+
        ') as part-exchange.</p><span class="trade-extra">Customer requests '+
        cashText(px.ask)+' allowance; negotiate the valuation.</span>'+
        '<label class="trade-extra" for="px-allowance-'+car.id+'">YOUR PART-EX ALLOWANCE (£)</label>'+
        '<input class="trade-input" id="px-allowance-'+car.id+
        '" type="number" inputmode="numeric" min="0" max="'+px.ask+
        '" step="25" value="'+px.ask+'">'+
        '<span class="trade-extra">Estimated trade-in retail '+cashText(px.retail)+
        ', prep '+cashText(px.prep)+'. The incoming car occupies the space of the sold car.</span>'+
        '<button class="trade-button" type="button" data-action="sell-part-ex" data-id="'+car.id+
        '">ACCEPT PART-EX DEAL</button></div>':
        '<div><h4>NO PART-EXCHANGE ENQUIRY</h4><p>Customers are interested in purchasing this vehicle for cash, but none is offering a part-exchange in this session.</p>'+
        '<span class="trade-extra">A later session may attract a trade-in, but it is not guaranteed.</span></div>';
      return '<article class="trade-card">'+top+pricing+
        '<div class="trade-buyer-modes">'+cash+tradeIn+'</div></article>';
    }).join('');
  }
  function renderLedger() {
    const history = byId('ledger-list');
    if (!career.ledger.length) {
      history.innerHTML = '<div class="trade-empty">Opening capital: ' + cashText(E.STARTING_CASH) +
        '. No trading transactions recorded yet.</div>';
      return;
    }
    history.innerHTML = [...career.ledger].reverse().map(entry =>
      '<div class="trade-ledger-row"><time>DAY ' + String(entry.day).padStart(2,'0') +
      '</time><span>' + escapeText(entry.note) + '</span><b class="' +
      (entry.delta < 0 ? 'trade-negative' : 'trade-positive') + '">' +
      (entry.delta < 0 ? '−' : '+') + cashText(Math.abs(entry.delta)) + '</b></div>'
    ).join('');
  }
  function renderEvents() {
    byId('events-banner').innerHTML=EV.banner(career);
    byId('events-view').innerHTML=EV.render(career);
  }
  function renderMonthly() {
    const r=M.statement(career);
    byId('monthly-dashboard-target').innerHTML=MV.liveGoals(career,M);
    byId('finance-monthly-target').innerHTML=MV.liveGoals(career,M);
    byId('monthly-report-view').innerHTML=MV.renderReport(career,M,selectedMonth);
    bindText('monthly-target',r.soldUnits+' / '+r.targetUnits);
  }
  function renderPeople() {
    byId('people-totals').innerHTML=PV.totals(career,P);
    byId('people-roster').innerHTML=PV.roster(career,P);
    byId('people-applicants').innerHTML=PV.applicants(career,P);
    byId('reputation-view').innerHTML=PV.reputation(career);
  }
  function renderTrading() {
    renderMarket();
    renderStock();
    renderWorkshop();
    renderSales();
    renderLedger();
    renderPeople();
    renderMonthly();
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
    const date = gameDate(career.day);
    const short = dateShort.format(date).toUpperCase();
    bindText('company', career.name);
    bindText('cash', money.format(career.cash));
    bindText('stock', career.stock + ' / ' + career.capacity);
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
    const calendarCopy = byId('calendar-message');
    calendarCopy.textContent = D.isDealDay(career.day)?
      'DEAL DAY '+D.dealSession(career).time+': customer-only retail trading. Auctions are closed and this game day advances in five sessions.' :
      D.meetingDue(career)?
        'FIRST-DAY MEETING: review the previous month and agree this month’s management priority.' :
      career.day <= 7
        ? 'Day ' + career.day + ' of your career. Check the inbox for business updates.'
        : 'Auction lots, direct sellers and customer opportunities refresh daily. Check your stock age and cash.';
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
    if(D.meetingBlocksContinue(career)){
      currentPage='events';
      eventNotice='Your monthly management meeting is due. Review the previous month and agree one priority before advancing to the next day.';
      render();
      return;
    }
    if(D.isDealDay(career.day)&&career.deadlineSession<D.PHASES.length-1){
      const event=D.advanceSession(career);
      expandedReportId=null;
      offerDrafts={};
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
    career.deadlineSession=0;
    if(closed) {
      M.next(career);
      selectedMonth=String(closed.month);
      currentPage='events'; // Show the first-day management meeting.
    } else if(enteringDealDay){
      currentPage='events'; // Surface the special event automatically.
    }
    const workforceEvent=E.staffDay(career);
    const workshopEvents=E.advanceWorkshop(career);
    lastTradeResult = null;
    expandedReportId = null;
    career.reports = {};
    offerDrafts = {};
    // Prior negotiations are tied to that day's leads. Keep the save bounded.
    career.negotiations = {};
    career.auctionBids = {};
    const eventFactory = scheduledMessages[career.day];
    if (eventFactory && !career.messages.some(m => m.day === career.day)) {
      career.messages.push(eventFactory());
      eventNotice = 'New inbox message received. Your game calendar has advanced by one day.';
    } else {
      eventNotice = 'One game day completed. New auction lots and private seller leads are available.';
    }
    if(workforceEvent.payroll || workforceEvent.arrears){
      eventNotice += ' Staff wage settlement: '+money.format(workforceEvent.paid)+
        ' paid of '+money.format(workforceEvent.payroll)+
        '; unpaid balance '+money.format(workforceEvent.arrears)+'.';
      if(workforceEvent.departures.length)
        eventNotice+=' Departures: '+workforceEvent.departures.join(', ')+'.';
    }
    if(workshopEvents.length)
      eventNotice+=' WORKSHOP: '+workshopEvents.join(' ');
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
    career = E.create(name, welcomeMessages());
    selectedMessageId = null;
    lastTradeResult = null;
    selectedMonth = 'current';
    expandedReportId = null;
    offerDrafts = {};
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
  document.addEventListener('input', event => {
    if (!career || !event.target?.id) return;
    const match=/^(auction-bid-|seller-offer-)([AS]-[0-9]+-[0-9]+)$/.exec(event.target.id);
    if (!match) return;
    const kind=match[1]==='auction-bid-'?'auction':'seller';
    const catalogue=E.market(career.day,career.reputationScore,career.deadlineSession,
      career.name,career.monthPlan.startingReputation);
    const car=(kind==='auction'?catalogue.auctions:catalogue.sellers).find(v=>v.id===match[2]);
    const output=byId('projection-'+match[2]);
    if (!car || !output) return;
    const price=Number(event.target.value);
    offerDrafts[match[2]]=Number.isSafeInteger(price) && event.target.value!==''?
      price:null;
    output.textContent=Number.isSafeInteger(price) && event.target.value!==''?
      expectedMarginText(car,kind,price):'ENTER A VALID OFFER';
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-action],button[data-page]');
    if (!button) return;
    const destination = button.dataset.page;
    if (destination && Object.prototype.hasOwnProperty.call(PAGES, destination)) {
      show(destination);
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
      case 'toggle-report':
        if (career) {
          const key=button.dataset.kind+':'+button.dataset.id;
          expandedReportId=expandedReportId===key?null:key;
          render();
        }
        break;
      case 'inspect-lead':
        if (career) {
          expandedReportId=button.dataset.kind+':'+button.dataset.id;
          saveResult(E.inspectLead(career,button.dataset.kind,button.dataset.id),
            button.dataset.id);
        }
        break;
      case 'hire-staff':
        if (career) saveResult(E.hireStaff(career,button.dataset.id));
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
        if (career&&window.confirm('Release this employee? The game charges seven days of provisional notice pay, even if cash is unavailable.'))
          saveResult(P.release(career,Number(button.dataset.id)));
        break;
      case 'bid-auction':
        if (career) saveResult(E.acquireAuction(career,button.dataset.id,
          inputNumber('auction-bid-' + button.dataset.id)),button.dataset.id);
        break;
      case 'buy-seller':
        if (career) saveResult(E.acquireSeller(career,button.dataset.id,
          inputNumber('seller-offer-' + button.dataset.id)),button.dataset.id);
        break;
      case 'accept-seller-counter':
        if (career) {
          const offer=career.negotiations?.[button.dataset.id]?.counter;
          saveResult(E.acquireSeller(career,button.dataset.id,offer),button.dataset.id);
        }
        break;
      case 'walk-seller':
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
      case 'list-stock':
        if (career) saveResult(E.advertise(career,Number(button.dataset.id),
          inputNumber('stock-price-' + button.dataset.id)));
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