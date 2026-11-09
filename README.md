# The Motor Trade

A **NextGen Sessions** UK used-car dealership management game, built around an ongoing career, inbox and calendar rather than a static promotional page.

**Play:** https://billz2026.github.io/TheMotorTrade/

## Current playable foundation (v0.2)

The site opens to a branded **main menu** if this browser has no valid save. Choosing **New Career** takes the player through a dealership setup screen (name, £12,500 starting capital, two-vehicle forecourt), then into a Football Manager-inspired career dashboard.

If a valid save is present, **the site automatically opens the career dashboard on the next visit**. Players can return to the main menu and resume from there. The single career slot is stored in the browser's localStorage under the key the-motor-trade-career-v1, not on a server; the save is not synchronised across devices or browsers. Starting another career replaces the saved career after confirmation. If browser storage is blocked or unavailable, the game shows an explicit warning.

### Working interactions

- **Career dashboard:** dealership name, balance, empty-stock count, career day and reputation, with truthful starter values.
- **Inbox:** initial adviser, auction and finance messages, detail view, unread badges, mark-as-read, mark-all-read, related navigation links.
- **Continue:** advances the simulated date by one day and triggers introductory inbox messages on days 2, 3, 5 and 7. It updates the browser save.
- **Navigation:** Dashboard, Inbox, Auction Desk, Vehicle Stock, Sales Office, Finances and My Dealership. Every navigation control opens the relevant section.
- **Auction preview:** one clearly identified **fictional** Ford Focus lot and sample condition report. Bidding is not yet implemented.
- **Responsive interface:** desktop management sidebar, compact mobile navigation, foldable-friendly layouts, reduced-motion support.
- **Save:** automatic on career creation, day advance and inbox changes, plus a manual Save Career action.

### Not yet simulated

There are **no** live or fictional auction bids, bought cars, stock preparation jobs, dealer expenses, customer enquiries, completed sales or profit figures. Advancing the calendar does **not** invent money, stock or business results. The current balance remains £12,500. The Grade 3 condition report and hatchback illustration are fictional and are not verified auction data.

The next development milestone is a **complete playable single-car loop**:

1. Research multiple fictional auction lots, fees and risk.
2. Bid competitively, purchase one car and record the actual invoice.
3. Receive inspection findings, choose preparation work and pay costs.
4. Advertise the car, negotiate with customers and choose an offer.
5. Record the sale, update cash and gross-versus-net returns.
6. Trigger consequences for stock ageing, vehicle issues and buyer rights.

**Accuracy principles:** distinguish cash flow, vehicle stock value, gross spread, VAT liability and realised profit; auction fees differ by auctioneer and buyer type; the condition grade is not a repair guarantee; and customer/consumer rights cannot be treated as optional. All financial values are sample game data until a rule has been independently verified.

## Files and development

This is a lightweight static GitHub Pages app (HTML, CSS and vanilla JavaScript):

- index.html — menu, setup, dashboard and management screens.
- styles.css — responsive game design.
- simulator.js — in-browser career state, mail, time progression and local save.
- tests/site.test.mjs — Node built-in tests covering markup, functionality, persistence, and invalid save handling.
- assets/nextgen-header-wordmark-2026.webp — the unchanged official NextGen Sessions logo.
- assets/hatchback-study.svg — generic vehicle illustration.

Run checks with: node --check simulator.js && node --test tests/site.test.mjs.

## Archived project

The pre-pivot Arcade project is preserved on the Git branch archive/nextgen-arcade-before-motor-trade-2026-11-09.

© 2026 NextGen Sessions.
