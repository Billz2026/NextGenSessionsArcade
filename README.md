# The Motor Trade

**The Motor Trade** is a browser-based UK used-car dealership management game by NextGen Sessions. The interface takes inspiration from classic football management games: make commercial decisions, manage money and track an ongoing career.

**Play:** https://billz2026.github.io/TheMotorTrade/

## v0.9 — Four-Space Forecourt & Customer Sales Journey

**Every dealership now starts with four forecourt spaces** (formerly two), without increasing the existing £12,500 initial working capital. Having four spaces does not guarantee enough funds to fill them or prepare all four vehicles. Existing v1–v7 careers migrate to save schema **v8** with four spaces and retain their vehicles, sales, money, workshop jobs, employees, historical reports and progress. Original branding and home screen are unchanged.

The **Sales Office** now runs a customer process instead of allowing a single instant sale click:

- **Actual enquiry required.** Customer interest depends on market-day conditions, asking price, quality and reputation. A car may attract no enquiry, and reloading cannot reroll the same vehicle/day/session. Each advertised car has at most one active customer case.
- **Appointments and no-shows.** Ordinary enquiries require booking a viewing 1–3 game days ahead. Customer attendance is uncertain. No-shows and missed follow-ups are tracked.
- **Test drives and customer objections.** The customer must attend and complete a test drive. Some customers decline to proceed; higher condition risk makes that more likely. Cash and part-exchange preferences differ between customers.
- **Negotiation and agreement.** Once a test drive succeeds, an offer can be negotiated; a counteroffer may be rejected or cause the customer to walk away. Retail values remain based on the vehicle-specific intelligence and existing employee/reputation effects.
- **Handover or deposit.** A mutually accepted agreement can be handed over on the same day, or a fully refundable **£250 reservation deposit** can be recorded for a later collection. Deposits are held in a separate *virtual* customer-holding balance and **never enter spendable dealership cash**; a later cancellation returns the held balance without creating income or an expense. On collection, the full agreed vehicle price is recorded in the actual business cash ledger. Collection can still be cancelled.
- **Deal Day walk-ins.** The final day retains five slow trading sessions and variable quiet/busy market conditions. Interested walk-ins may proceed to a same-session test drive, but not a guaranteed sale. Unresolved walk-in cases expire between sessions; reserved vehicles persist to collection.
- **Monthly performance.** Management reports and the first-day meeting now include real recorded enquiry-to-sale conversion, appointments, no-shows, test drives, agreements and deposits/refunds. Sales count only at handover, never when someone books, agrees or deposits.

**Design limits:** Customer identities and behaviour are invented, not real people or live third-party leads. Appointment dates are game operating days, not staff-hour calendars. The fully refundable deposit and segregated-holding approach are a gameplay simplification, not a claim to model UK deposit contracts or consumer law, and legal documentation, identity checks, vehicle warranties, finance, insurance and actual card/bank processing require dedicated future releases.

## v0.8 Workshop Operations & Vehicle Lifecycle

**Vehicle preparation is no longer instantaneous.** Every newly acquired auction, private-seller or part-exchange car enters Vehicle Stock as unassessed and occupies a forecourt space. Open **Workshop** to authorise a paid assessment, review the individual repair budget, and book either:

- **In-house work** — requires an available employed Prep Technician. Their skills reduce some labour costs; one car can occupy the technician at a time. Work pauses if the assigned technician is unavailable or payroll is unpaid. The dealership can transfer a stuck job to an external garage for a further £125.
- **Outsourced garage** — no employee needed, accepts up to two jobs concurrently, incurs an illustrative uplift for the supplier's labour, parts handling and profit. Actual completion time depends on work complexity and deterministic parts-delay allowances.

Repair bookings charge cash **when authorised**, then progress once per *game day*, not per Deal Day session. Repair duration is a fictional estimate based on car condition, diagnosed repairs, technician efficiency and parts availability. Once work is complete, a **final quality check** must be performed. A proportion of cars need paid rectification and one extra repair day; it is possible for the final repair cost to exceed the original estimate. The car cannot be advertised or sold before passing quality control.

**Financial integrity:** Assessment cash is added to the vehicle's acquisition basis; repair booking, outsourcing and rework are counted in the actual preparation cost, recognised as vehicle cost on completion. Money reserved for other unprepared vehicles is protected. Workshop charges are tracked in the ledger and monthly management reports; cash tied up in unfinished jobs is included in stock working capital. Hiring a mechanic is not automatically the best option for a two-space dealership. In extreme cash shortages, a player can accept a simplified, below-cost **wholesale disposal offer** for stock that has not yet entered the repair queue; the recorded trading loss is not counted as a retail sale and reduces overall realised trading contribution. Reports now distinguish ongoing repair jobs and outstanding final checks.

**Save compatibility:** Existing v1–v6 careers migrate to schema v7 without altering historic cash, acquired stock, recorded sales, margins, archived monthly reports or employee records. Previously prepared and advertised stock remains immediately usable; previously acquired but unprepared cars start at the new assessment stage. The original homepage, NextGen Sessions logo, Motor Trade SVG and showroom background remain untouched.

**Limitations:** The system models elapsed game days rather than actual technician hours, parts purchase orders, trade disposal, live repair quotes, VAT and legal roadworthiness certification. A passed fictional quality check is not a legal MOT or a guarantee of safety. Repair market figures are illustrative, not verified UK garage prices.

## Deal Day Realism Update (v0.7.1)

Deal Day is no longer a guaranteed bargain event. Each 30-day operating month receives a distinct, persistent fictional trading climate. Low-footfall months can produce empty private-seller sessions and no interested retail customers, while busy months generally create more opportunities. Realistic deal acceptance and part-exchanges vary by individual customer; the business can still make poor deals or miss targets. The Deal Day and monthly report screens distinguish *potential leads* from *completed sales*. No auction trade is permitted on month-end days. The save schema remains v6, so existing v0.7 careers continue unchanged.

## Customer Deal Day & Monthly Management Meetings (v0.7)

The **last day of each 30-day game operating month** is now **Deal Day**, inspired by transfer deadline day. Instead of one ordinary Continue, it runs through five sessions **09:00, 11:00, 13:00, 15:00 and 17:00**. Each early Continue moves the *session clock*, not the calendar, so payroll is **not charged again**. The final Continue closes the month, generates the existing full management report and begins the next month's first-day board meeting.

**Deal Day is strictly for ordinary retail customers and private sellers, never auction houses.** The auction catalogue is empty and auction purchase attempts are rejected on days 30, 60, 90 and so on. **Every operating month has different market conditions** (quiet, subdued, steady, busy or exceptionally busy). The simulation varies private-seller footfall, retail buyer interest, willingness to negotiate and the availability of part-exchanges. Some sessions have zero enquiries and a quiet month can finish with no customer deals at all. Busy months offer more potential customers on average, but **better offers and bargains are never guaranteed**. The conditions remain deterministic for the same dealership and month across save/reload; changing screens or reloading cannot generate a better deal. **Part-exchanges still bring incoming stock and preparation liabilities.** The deadline is an opportunity, not a free cash or reputation reward. On a Deal Day, a listed vehicle may attract no buyer in a given session, and a retail enquiry does not automatically include a part-exchange. Auctions remain unavailable in all market conditions.

A new **Deal Day & Meetings** page and dashboard banner show the active event and phase. Private enquiries and cash offers expire when a new phase starts; a paid inspection is non-refundable. The generated market climate and actual Deal Day results are recorded in completed monthly management reports, not forecast in advance. Cars already purchased and recorded sales persist normally. Prepare and advertise your stock in advance to take advantage of the event.

### First-day management meeting

Every **first day of a game operating month** (days 1, 31, 61, etc.) features a board meeting in Deal Day & Meetings. The day-1 startup meeting is available as an optional introductory briefing. For later months, you **must hold the meeting before continuing to the next day**.

The meeting draws from the actual completed monthly report: total cars sold vs targets, turnover, gross trade margin, cash, staff expenses, stock ageing, employee performance and unpaid wage risks. It gives specific management discussion points and asks the dealer to choose **one** monthly priority:

- **Retail sales:** a moderate improvement in customer offers on listed stock.
- **Buying discipline:** a small improvement in acceptable private seller purchase offers.
- **Customer care:** a modest additional reputation gain *only when* a fairly-priced, good-condition vehicle is sold.

Meeting decisions, chosen priority and historical meeting minutes are saved. They do not confer a guaranteed sale, directly add money or make auctions easier. The same monthly operating targets and historical management report archive remain.

Existing v1–v5 local careers migrate to save schema v6 without changing their money, employees, stock, ledger, historical sales, archived reports or reputation. Earlier historical meetings are not invented. The original homepage showroom, both logo assets and main-menu design are unchanged.

## Monthly Management Reports & Targets (v0.6)

The game now operates in **30-game-day management months** (a transparent simulation rule, not UK calendar-month payroll). The dealership must achieve a **monthly unit sales target and a positive gross vehicle margin**. Turnover and gross-margin guides are secondary objectives. Targets are locked at each month's start and recalculate for the *next* month as reputation rises:

| Reputation | Required vehicles per operating month |
|---|---:|
| New Trader (0–19) | 2 |
| Local Dealer (20–39) | 3 |
| Trusted Dealer (40–59) | 4 |
| Regional Specialist (60–79) | 5 |
| Prestige Dealer (80–100) | 6 |

Targets suit the existing two-space forecourt at entry level; they assume stock can turn over more than once in a month. A future premises/workshop release will revisit this operational capacity. Employees can also receive **individual sales-unit targets**, calculated from the days they are actually eligible to work in the month. Staff hired with less than seven eligible days remaining are exempt from that month's target. Sales personally closed by an active salesperson are credited to that employee, not automatically to every employee.

At the end of day 30, 60, 90 and so on, press CONTINUE to close the period. A **Management Office inbox message** announces the result, and the complete archive appears in the **Management Reports** navigation. The result snapshot cannot change later. Reaching the company sales target with a positive gross margin earns a small reputation bonus; severe shortfalls can slightly reduce it. Employees gain morale when their own targets are met and lose morale for missed achievable targets. No artificial cash bonuses are awarded.

### What each management report records

- **Sales targets:** Actual units vs required units, turnover vs planning guide, gross margin vs guide and end-of-month status.
- **Financial statement:** Opening and closing cash, money received/paid, exact ledger reconciliation, completed-sales gross margin, gross margin after paid staff expenses and category-by-category auction, private purchase, part-exchange, repair, inspection, wages, commission, training, hiring and notice outgoings.
- **Stock and buying:** Unsold inventory, car-by-car stock ageing, cars older than 14 days, preparation waiting and money invested in stock; sales split by cash/part-exchange and best/worst-margin vehicle.
- **Employee performance:** Per-salesperson sales quota, sales achieved, customer turnover, gross contribution and whether their monthly target was met. Players operating without a salesperson can still satisfy the overall dealership target themselves.
- **Customer trust:** Opening/closing reputation, actual recorded reputation events, unpaid employee liabilities and a clear warning about absent customer-satisfaction and warranty-claim modelling.

The **live** report is updated as transactions happen. Historical reports are fixed snapshots, with the most recent 120 archived. Existing v1–v4 careers migrate safely to save schema v5. A previously played career begins *partial-period reporting at the actual upgrade day* instead of inventing financial history or retrospectively changing old transactions.

**Accounting disclaimer:** These reports are management game summaries, not statutory accounts or taxable net profit. In particular, outstanding stock cash, unrecovered inspection fees, working capital, cash flow and realised vehicle margins are different quantities; UK payroll obligations, pensions, VAT, warranty liabilities, property costs, corporation tax and finance charges are not yet fully modelled. Historical vehicle contributions are not silently recalculated when upgrading.

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
- `monthly.js` — operating-month goals, cash/stock reporting, month close and archived reports.
- `events.js` — customer-only Deal Day sessions, offer adjustments, board meeting decisions and save migration.
- `events-view.js` — Deal Day timeline, management discussion and meeting decisions.
- `monthly-view.js` — responsive monthly report cards, staff scorecards and financial breakdown.
- `people-view.js` — responsive personnel and reputation management UI.
- `vehicle-intel.js` — stable fictional vehicle profile generation, repair forecasts and appraisal arithmetic.
- `workshop.js` — timed vehicle assessment, repair sourcing, capacity, financial commitment and final QC.
- `workshop-view.js` — responsive repair board with quote comparisons, queue progress and status.
- `customers.js` — persistent customer cases, deterministic leads, appointments, no-shows, test drives, offers and refundable holds.
- `customers-view.js` — customer journey UI in the Sales Office.
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
node --check monthly.js
node --check monthly-view.js
node --check events.js
node --check events-view.js
node --check workshop.js
node --check workshop-view.js
node --check customers.js
node --check customers-view.js
node --check trading.js
node --check simulator.js
node --test tests/site.test.mjs
```

The pre-pivot Arcade version is archived at `archive/nextgen-arcade-before-motor-trade-2026-11-09`.

© 2026 NextGen Sessions.
