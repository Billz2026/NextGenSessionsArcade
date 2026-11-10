# The Motor Trade

**The Motor Trade** is a browser-based UK used-car dealership management game by NextGen Sessions. The interface takes inspiration from classic football management games: make commercial decisions, manage money and track an ongoing career.

**Play:** https://billz2026.github.io/TheMotorTrade/

## Staff & Reputation (v0.5)

Careers start as **NEW TRADER, 5/100 reputation**, with no employees. Open **Staff & Recruitment** to review six fictional candidates (two per role) in a weekly rotating shortlist, inspect 1–20 skills, salaries and experience, and hire up to three employees (one per role at the first dealership).

### Staff roles and actual effects

- **Sales Executive:** improves cash and part-exchange buyer offers within market-derived valuation limits. Customer-care ability influences reputation outcomes; the employee receives 3% commission on positive gross trading margin.
- **Vehicle Buyer:** negotiates lower acceptable direct-seller prices and supplies an *estimated range* for rival auction bids. Auction fees and reserve rules still apply.
- **Prep Technician:** improves basic workshop coordination/labour efficiency, saving a modest amount on vehicle preparation. Parts and unexpected hidden-fault costs are not discounted.

Staff start the day **after hiring**. Recruitment costs £150. Two-day training costs £275, improves relevant attributes and makes the person temporarily unavailable; a 14-day training cooldown applies. Releasing staff incurs an illustrative seven-day notice cost. All staff, skills, morale, training, transactions and employment history are kept in the same local career save.

### Payroll and reputation

Salaries are fictional **monthly base pay** estimates. To keep the game playable, a 1/30-month wage amount is paid **on each game day** when CONTINUE is used. This is simplified game cash settlement, *not* compliant UK payroll or employment-law modelling; employer National Insurance, pension contributions, tax, formal notice and leave are not yet calculated. The game keeps preparation reserves protected before paying staff; unpaid wage balances remain a liability, reduce morale and can damage reputation. Staff can depart after prolonged low morale.

Reputation changes after completed retail sales based on vehicle grade, fair pricing and sales staff care. Risky vehicles and poor customer outcomes can decrease it. Staff payroll failures can also harm trust. Reputation tiers are **0–19 New Trader, 20–39 Local Dealer, 40–59 Trusted Dealer, 60–79 Regional Specialist, 80–100 Prestige Dealer**. Trusted dealers get additional direct-seller opportunities on some days. The Reputation screen records changes, sales count, lifetime turnover and long-term prestige milestones. Prestige and luxury vehicles are a **future development stage**, not currently unlocked merely by reaching a tier.

Existing v1, v2 and v3 saves migrate to schema v4 without recalculating existing purchases, profits, ledger transactions or vehicle repair estimates. Existing sales determine a conservative starting reputation score for old careers. Gross vehicle margin excludes wages/commission and should not be mistaken for net business profit.

## Vehicle Intelligence System (v0.4)

Every auction lot and direct-seller offer now has a **persistent fictional dossier**: unique simulation ID, derivative/engine, mileage, previous keepers, MOT-style test result/mileage/advisories, condition grade, demand outlook, trade value, retail guide, likely achieved sale price and line-item preparation costs. Full reports open from the Buying Desk and your Vehicle Stock. The data is deterministic for a given lead ID, not live DVLA/DVSA data.

**Pre-purchase inspections:** Open a report and buy the optional £75–£95 simulated inspection. The fee is charged immediately, appears in the finance ledger and is not refunded if the car is not acquired. It reveals the car-specific additional fault when present. If acquired, the inspection cost is included in that vehicle’s acquisition basis without charging cash twice. Vehicle preparation uses the actual repair quotation (known work plus additional faults). Existing saved v0.3 vehicles do not gain retroactive hidden faults or changed acquisition costs.

**Buying intelligence:** Trade value, retail asking guide, likely sale, recommended maximum bid and expected margin appear for each lot. Expected margin = likely sale − bid/offer − auction fees − forecast repairs − paid inspection. Before inspection, a condition-based contingency is used; this is a forecast, not a guarantee. Editing your offer updates the displayed margin. Customer cash offers are now capped by the car’s likely achieved market value rather than automatically following an inflated asking price. No real live valuations are fetched.

**Save compatibility:** Existing v1 and v2 browser saves are migrated to save schema v3 (same storage key). Existing stock, cash, completed sales, ledger, day and inbox are preserved. Individual reports persist through stock and into completed-sale history. Unused pre-purchase inspection reports expire when the game day advances, but the inspection expense remains in the ledger.

## Playable trading foundation (v0.3 → v0.4)

The main menu uses the original unchanged NextGen Sessions wordmark, standalone silver-and-gold Motor Trade vector title and sharp showroom background. Create a career with **£12,500 starting cash** and a **two-vehicle forecourt**. Continue Career resumes the same locally saved business.

### Interactive bidding and seller negotiation

Auction bids now report the result **inside the lot card and in an always-visible dismissible notification**. A lost maximum-bid attempt does not charge a buyer's fee; the fictional rival may outbid you, and the lot closes after a second unsuccessful bid. A winning bid deducts the hammer price and displayed buyer fee, with preparation money reserved.

Direct sellers have a short negotiation: a sensible offer may be accepted; a lower but credible offer receives a counteroffer; a very low offer or failed follow-up can cause the seller to walk away. **Accept Counter**, **Submit Offer** and **Walk Away** actions are shown inside the seller card. Open negotiations and outbid status persist in the browser save for that game day.

A full forecourt or insufficient cash is now explained **in the buying card**, rather than presenting a silent disabled button. Click to see the specific reason. Advancing the career day replaces the catalogue with a deterministic mix of roughly 0–3 auction lots and 0–3 private-seller leads; some days have no leads from one channel, but there is always at least one opportunity in the current prototype. Each day's offers are stable across reloads, and no duplicate vehicle model appears twice in one channel on the same day.

This remains a fictional **instant-result maximum-bid simulation**, not a live or timed vehicle auction. Auction-house fee schedules differ by buyer and hammer price; the game's shown buyer fees are illustrative and due only on successful purchases.

### Three ways of acquiring vehicles

1. **Auction Desk:** inspect fictional catalogue lots, buyer fees, grade, mileage, preparation estimate and retail guide. Enter your maximum bid. Rival traders have simulated competing bids; losing costs nothing, winning deducts the full bid plus buyer fee.
2. **Direct sellers:** private owners and walk-in customers ask the dealership to purchase their cars. Offer an amount; the owner may reject a low offer. A successful purchase reduces cash and adds stock without auction fees.
3. **Part-exchanges:** when a customer buys one of your advertised vehicles, you can negotiate an allowance for their existing car. The cash collected is the selling price **minus the part-exchange allowance**. That incoming car becomes owned stock and must be prepared before resale. This is a retail transaction with a separate incoming acquisition, not a free car.

### First complete trading loop

- Acquire a vehicle through an auction or a direct seller.
- Reserve sufficient cash for required preparation of all acquired vehicles, then pay a simplified inspection/preparation budget. The first version prevents purchasing into an unrecoverable cash deadlock.
- Set a retail asking price and advertise it.
- In the Sales Office, accept a cash customer's offer or make limited counteroffers.
- Alternatively, accept a customer's part-exchange after valuing the incoming car.
- The ledger records purchases, buyer fees, preparation, sale proceeds and part-exchange allowances.
- Sales update cash, stock, reputation, completed-sales count and **realised gross trading margin**.
- **Continue** advances one in-game day and refreshes the available auction lots and direct sellers. There are no arbitrary daily cash injections.

The current dealership inbox, dashboard, calendar, menu settings, browser save and responsive navigation remain in place. Stock and trading history survive reloads. Earlier **v0.2** browser saves are migrated into the updated format while retaining dealership names, game day and inbox history. A new career still overwrites the single saved career only after confirmation.

## Accounting and gameplay boundaries

This is **fictional gameplay**, not live auction, DVLA, valuation or customer data. Buyer thresholds and vehicle values are authored examples. Grade and condition notes are not an inspection guarantee. Preparations are simplified as one required cost, not a real safety certificate.

**Realised gross trade margin** is the sale price less the sold vehicle's acquisition cost and preparation. It is not accounting net profit. The game currently **does not calculate** VAT (including margin-scheme treatment), tax, premises costs, advertising spend, finance, warranties, consumer-rights claims, or other overheads. Part-exchange allowance is capital tied up in the newly acquired vehicle, not a reduction in the sold car's headline sale price. Cash and ledger sums are reconciled before saved v0.3 careers are loaded.

Customers are currently deterministic examples rather than a fully simulated market. This first milestone does not yet model bank funding, external feeds, multi-site premises, vehicle inspections beyond a fixed budget, disposal, or complex negotiation personalities. These are future development stages.

## Structure and tests

- `index.html` — game menu and interactive management screens.
- `styles.css` — responsive premium game interface.
- `people.js` — candidate selection, staff salaries, training, performance and reputation engine.
- `people-view.js` — responsive personnel and reputation management UI.
- `vehicle-intel.js` — stable fictional vehicle profile generation, repair forecasts and appraisal arithmetic.
- `vehicle-view.js` — inline report UI for buying and stock.
- `trading.js` — deterministic financial and vehicle transaction engine; save migration/validation.
- `simulator.js` — game navigation, inbox, calendar, market rendering and save integration.
- `tests/site.test.mjs` — Node built-in tests for UI, the complete trading loop, cash conservation and migration.
- `assets/nextgen-header-wordmark-2026.webp` — original NextGen Sessions logo (unchanged).
- `assets/the-motor-trade-premium.svg` — premium vector game title.
- `assets/showroom-home-bg.webp` — high-resolution showroom background.

Run:

```sh
node --check vehicle-intel.js
node --check vehicle-view.js
node --check people.js
node --check people-view.js
node --check trading.js
node --check simulator.js
node --test tests/site.test.mjs
```

The pre-pivot Arcade version is archived at `archive/nextgen-arcade-before-motor-trade-2026-11-09`.

© 2026 NextGen Sessions.
