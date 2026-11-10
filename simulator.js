'use strict';
/*
 * The Motor Trade — career foundation.
 * Local-only, single-slot career save. No actual auctions, transactions,
 * repair estimates, customer negotiation or profit/tax calculations yet.
 */
(() => {
  const STORAGE_KEY = 'the-motor-trade-career-v1';
  const SAVE_VERSION = 1;
  const STARTING_CASH = 12500;
  const CAPACITY = 2;
  const START_DATE_UTC = Date.UTC(2026, 10, 9);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MAX_DAY = 36500;
  const PAGES = Object.freeze({
    dashboard: 'DASHBOARD',
    inbox: 'INBOX',
    auctions: 'AUCTION DESK',
    stock: 'VEHICLE STOCK',
    sales: 'SALES OFFICE',
    finance: 'FINANCES',
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
      makeMessage(1, 1, 'BUSINESS SUPPORT', 'Welcome to the motor trade',
        'Your independent dealership career starts today.',
        'Welcome to your new dealership.\n\nYou are starting as an independent trader with £12,500 in available cash and space for two vehicles. Protect your capital: every purchase will eventually have fees, preparation costs and the risk of holding stock.\n\nFor now, get familiar with your dashboard, inbox and management screens. The full trading engine is still being developed.',
        'business'),
      makeMessage(2, 1, 'AUCTION DESK', 'Your first vehicle report is ready',
        'Review a sample auction lot before you buy.',
        'A fictional 2016 Ford Focus Zetec has been prepared as your first training report.\n\nCheck the condition notes carefully. An auction grade is only a guide; unexpected repairs can turn a promising purchase into a loss.\n\nThis release does not accept bids or deduct money. Open the Auction Desk to see the sample vehicle.',
        'auctions'),
      makeMessage(3, 1, 'ACCOUNTS OFFICE', 'Your opening balance: £12,500',
        'Cash flow matters more than the headline margin.',
        'Your opening balance is £12,500.\n\nThere are currently no purchases, sales, repairs or overhead charges. When trading gameplay arrives, the accounts will distinguish available cash from stock value, gross spread, expenses and realised profit.\n\nDo not mistake a profitable asking price for cash in the bank.',
        'finance')
    ];
  }
  const scheduledMessages = Object.freeze({
    2: () => makeMessage(4, 2, 'AUCTION DESK', 'Research before raising your hand',
      'Inspect the demo report and identify the risks.',
      'You have reached the second day of your career.\n\nThe Auction Desk contains a sample vehicle, including grade, mileage and condition issues. Real bidding, rival traders and auction invoices are next on the development roadmap.\n\nNo live or simulated auction has taken place, and your cash has not changed.',
      'auctions'),
    3: () => makeMessage(5, 3, 'DEALERSHIP ADVISER', 'A good trader knows when to walk away',
      'Your first decisions should protect working capital.',
      'A dealer can go out of business while owning valuable stock if the cash runs out.\n\nIn the complete simulation you will need to balance auction fees, transport, VAT treatment, repair surprises, advertising and stock age. The best bid is sometimes no bid at all.\n\nReview the Finance screen to see your current opening balance.',
      'finance'),
    5: () => makeMessage(6, 5, 'ACCOUNTS OFFICE', 'First-week cash check',
      'The opening capital remains available.',
      'Your dealership has not completed a purchase or sale.\n\nFor this foundation version, advancing the calendar does not create fictional profits, daily costs or customers. The business ledger will become transactional when auction and sales systems are released.',
      'finance'),
    7: () => makeMessage(7, 7, 'BUSINESS SUPPORT', 'Your first week in the trade',
      'The management office is ready for the next stage.',
      'You have reached the end of your first in-game week.\n\nYour dashboard, mail, calendar and local career save are operational. Vehicle acquisition and customer negotiation are the next major systems to build.\n\nKeep this career if you want to continue with the same dealership name in future compatible releases.',
      'business')
  });

  let storageAvailable = true;
  function loadCareer() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); }
    catch (_) { storageAvailable = false; return null; }
    if (!raw) return null;
    try {
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== SAVE_VERSION ||
          typeof saved.name !== 'string' || saved.name.trim().length < 2 ||
          saved.name.trim().length > 36 ||
          !Number.isInteger(saved.day) || saved.day < 1 || saved.day > MAX_DAY ||
          saved.cash !== STARTING_CASH || saved.capacity !== CAPACITY ||
          !Array.isArray(saved.messages)) return null;
      const validMessages = saved.messages.every(m =>
        m && Number.isInteger(m.id) && Number.isInteger(m.day) &&
        typeof m.from === 'string' && typeof m.subject === 'string' &&
        typeof m.preview === 'string' && typeof m.body === 'string' &&
        typeof m.read === 'boolean' &&
        (m.linkPage === null || Object.prototype.hasOwnProperty.call(PAGES, m.linkPage)));
      if (!validMessages) return null;
      return {
        version: SAVE_VERSION, name: saved.name.trim(), day: saved.day,
        cash: STARTING_CASH, capacity: CAPACITY,
        stock: 0, sales: 0, reputation: 'NEWCOMER',
        messages: saved.messages.map(m => ({
          id: m.id, day: m.day, from: m.from, subject: m.subject,
          preview: m.preview, body: m.body, linkPage: m.linkPage, read: m.read
        }))
      };
    } catch (_) { return null; }
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
  let screen = 'menu'; // Always start at the main menu, including when a save exists.
  let currentPage = 'dashboard';
  let selectedMessageId = null;
  let eventNotice = '';

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
  function render() {
    byId('screen-menu').hidden = screen !== 'menu';
    byId('screen-setup').hidden = screen !== 'setup';
    byId('screen-career').hidden = screen !== 'career';
    byId('menu-continue').hidden = !career;
    // Prioritise the saved career, without risking an accidental overwrite.
    byId('menu-continue').className = career ? 'action-btn action-btn-primary' : 'action-btn';
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
    bindText('sales', String(career.sales));
    bindText('reputation', career.reputation);
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
    const calendarCopy = byId('calendar-message');
    calendarCopy.textContent = career.day === 1
      ? 'Your first day in business. Review your briefing before advancing.'
      : career.day <= 7
        ? 'Day ' + career.day + ' of your career. Check the inbox for business updates.'
        : 'Career calendar active. Future trading events will arrive with the auction and sales systems.';
    byId('save-warning').hidden = storageAvailable;
    byId('event-notice').hidden = !eventNotice;
    byId('event-notice').textContent = eventNotice;
    renderInbox();
  }
  function show(pageOrScreen) {
    if (pageOrScreen === 'menu' || pageOrScreen === 'setup') {
      screen = pageOrScreen;
    } else if (career && Object.prototype.hasOwnProperty.call(PAGES, pageOrScreen)) {
      screen = 'career';
      currentPage = pageOrScreen;
    }
    eventNotice = '';
    render();
    if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
  }
  function advanceDay() {
    if (!career || career.day >= MAX_DAY) return;
    career.day += 1;
    const eventFactory = scheduledMessages[career.day];
    if (eventFactory && !career.messages.some(m => m.day === career.day)) {
      career.messages.push(eventFactory());
      eventNotice = 'New inbox message received. Your game calendar has advanced by one day.';
    } else {
      eventNotice = 'One game day completed. No buying, sales or financial transactions were simulated.';
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
    career = {
      version: SAVE_VERSION, name, day: 1,
      cash: STARTING_CASH, capacity: CAPACITY,
      stock: 0, sales: 0, reputation: 'NEWCOMER',
      messages: welcomeMessages()
    };
    selectedMessageId = null;
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
      case 'toggle-guide': {
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