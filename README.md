# The Motor Trade

**The Motor Trade** is a browser-based UK used-car dealership management game by NextGen Sessions. The interface takes inspiration from classic football management games: make commercial decisions, manage money and track an ongoing career.

**Play:** https://billz2026.github.io/TheMotorTrade/

### v0.9.6 — 48-hour viewings and genuinely non-exclusive appointments
- Unpaid viewing bookings are set for the next one or two game days (within 48 game-hours), not three days later.
- Booked cars stay listed and available for competing walk-in enquiries. On days with genuine second-buyer interest, dealers can serve another viewer immediately, who must still test drive and agree terms.
- If the competing buyer declines, the original viewing remains booked; if a different buyer purchases or pays a deposit, only the unsecured booking is displaced, not treated as a no-show.
- Appointment attendance is more reliable, while genuine no-shows, test-drive rejection and cancellations remain possible.
- Paid £250 reservations remain exclusive and deposited funds remain segregated. Existing v9 careers and their customer cases continue loading; new optional standby data is validated on load.

## v0.9.5 — Four-bay workshop, more committed buyers and photographic coverage (11 November 2026)

- **Four in-house mechanics from day one**, alongside up to one salesperson and one vehicle buyer. Each mechanic runs one distinct vehicle repair, with named assignments and correct training/payroll pauses. A job awaiting final quality control still occupies its assigned technician until it is closed or transferred out. Future workshop slots grow to six technicians at 40 reputation and eight at 80 reputation. Hiring requires a protected one-week wage buffer and onboarding fee; hiring everybody at once is optional and expensive.
- **More reasonable customer conversion:** viewing attendance rises from about 77% to about 88% for a new trader; the successful test drive probability is now about 91% for grade 1–3 vehicles and about 76% for grade 4–5, modified by reputation. Negotiation counteroffers are less likely to trigger a full walkaway. A customer who has agreed terms and paid a £250 deposit is now 96% likely to proceed to collection, up from 83%, with a five-day collection grace period rather than two.
- **Deposit fairness is unchanged:** £250 is held separately and cannot be spent until handover. On buyer withdrawal, only recorded, demonstrable customer-specific expense may be retained. Dealer-caused cancellations refund all customer funds, and legacy fully refundable reservations keep their existing promise. Nothing automatically turns an advance payment into business revenue.
- **More real photos:** three additional source-checked Wikimedia images (red Corsa E, red Kia Rio YB, silver facelift Toyota Yaris XP130) bring the curated photo library to 19. Cards still require matching generation, colour, year and known fuel; unmatched cars show an explicit photo-unavailable fallback. The photograph never claims to depict the exact fictional car. Image attribution and licence links remain visible.
- Existing career saves retain schema version 9 and are not reset. New Node regression cases cover parallel repairs, staffing unlocks and the relative reliability of paid reservations.

## v0.9.4 — Vehicle specification and photo-source audit (10 November 2026)

**Accuracy must be evidenced, not implied.** Model/year/trim/powertrain claims are sourced independently from the invented individual-car data. A separate `vehicle-accuracy.js` source registry records source links against *exact title, fuel, transmission and powertrain* combinations. Changing any of those fields automatically reverts the car to **review pending**. The full vehicle report makes that status visible and links to source evidence when available.

- Corrected the 2021 Hyundai Ioniq 5 Premium long-range RWD battery from the later 77.4kWh pack to the launch **73kWh** pack (Hyundai UK 2021 pricing sheet).
- Corrected the facelift 2017 Toyota Yaris Icon petrol from discontinued **1.33** to **1.5 VVT-iE**, matching Toyota UK's 2017 specification announcement.
- Clarified the 2022 MG4 EV SE **Standard Range** as the **51kWh** version rather than ambiguously implying that all SE models have that battery.
- Added proper variant descriptions for 2022 Ford Puma and Nissan Qashqai 48V mild-hybrids and the 2021 Kia Rio MHEV. Mild-hybrids are visibly labelled **PETROL/DIESEL MILD HYBRID**, not misrepresented as full hybrids.
- Fixed photo-driven paint bias: colour is now a deterministic neutral-heavy paint choice **independent of the available photograph**. If no suitable model/year/generation/colour/fuel photo exists, the game intentionally shows a placeholder.
- Reviewed all **16** existing Wikimedia photograph file pages for file existence, model/generation, paint, authorship and open licence. This is a source-page check, not a guarantee the external image CDN never fails; the image error fallback is still required.
- The 50-entry specification registry currently includes 18 individually sourced derivatives (**13 manufacturer-backed**, **5 corroborated**) and **32 awaiting individual verification**. Don't present outstanding entries as certified. See `docs/vehicle-accuracy-audit.md` for the full itemised register and sources. Exact annual/model-market valuations are **not verified**; all game prices, mileage, MOT and condition remain simulated.
- Gameplay, financial ledger, workshop operations, cash thresholds and stored career schema **version 9** have not changed.

**Evidence types:** *manufacturer* = UK manufacturer model-spec documentation, including official brand-used listings; *corroborated* = secondary owner/photo/reference documentation that supports the entry, but requires manufacturer-level confirmation; *pending* = no sufficient individually checked evidence. No external data source is called from the game at runtime.

## v0.9.3 — Modern UK Used-Car Market & Luxury Progression

**Dealer career:** A new dealership still starts with £12,500 and four spaces. Its first catalogue mixes affordable 2016–2020 higher-mileage stock with a few accessible newer vehicles (including a high-mileage Nissan Leaf). As cash and reputation rise, the buying desk unlocks progressively newer **Modern**, **Premium** and **Luxury** stock. Older cars never disappear entirely; established traders can still look for low-cost opportunities. The buying desk shows the next unlock thresholds.

**Eligibility (both conditions):**

| Market access | Opening cash | Monthly opening reputation |
|---|---:|---:|
| Starter | Any | Any |
| Modern | £18,500 | 15 |
| Premium | £42,000 | 40 |
| Luxury | £110,000 | 65 |

Listings are **fixed per game day** using opening-day cash and the reputation at the start of the current 30-day management period. Purchases, sales and inspection fees do not reroll the day's lots or shift their IDs. After advancing days, cash changes can unlock the next tier; reputation access is reviewed at the next management period. Both thresholds measure resources, **not an extra fee or purchase**. Existing save format v9 and historic stock costs are unchanged.

**Catalogue:** 50 distinct, curated fictional UK used-car model/derivative entries, including modern Vauxhall Corsa and Peugeot 208, Toyota Yaris and Corolla hybrids, Honda Jazz e:HEV, MG4 EV, Corsa-e, e-208, Nissan Leaf, Tesla Model 3 / Y, BMW 3 Series, Audi A3, Volvo XC40, Porsche Macan / Taycan, Range Rover and Mercedes-Benz luxury models. Five fuel categories now display as prominent card labels: petrol, diesel, hybrid, plug-in hybrid and electric. Model-specific engines/motors replace the previous generic powertrain guess. Electric and hybrid workshop risk descriptions no longer generate irrelevant diesel DPF or clutch faults. All valuation, battery condition and MOT-style data remain fictional, not live DVLA/DVSA or actual auction/retail quotes.

**Photography:** Eight additional source-credited Wikimedia Commons photographs depict modern counterparts; images are restricted by generation, colour, year and, when identified, fuel. A different body, paint or electric/petrol derivative is never presented as an exact match. Missing matches retain the explicit photograph-unavailable panel rather than using unlicensed dealer listing photos. New vehicle data can be revised each release without a live data dependency.

Market context: [SMMT UK used-car market, Q3 2026](https://www.smmt.co.uk/used-car-market-records-second-quarter-of-growth-with-one-in-20-drivers-going-electric/) and [AA Cars used vehicle asking price trends, Q3 2026](https://www.theaa.com/used-cars/used-car-market-trends/q3-2026). These are sector context and broad pricing guides; **none of the game's individual prices is a scraped live listing**.

## v0.9.2 — Vehicle card reliability and first catalogue expansion

- Three additional real, licence-checked Wikimedia Commons photographs: red 2014 Vauxhall Corsa D Excite (Harvey Bold, CC BY 4.0); silver 2016 Peugeot 208 Allure facelift (Harvey Bold, CC0 1.0); and grey 2014 Honda Jazz GE ES Plus (Harvey Bold, CC BY 4.0). The curated catalogue increases from five to eight images. Each photograph represents a matching model, generation and colour, not the exact fictional car.
- Failed remote image requests now reveal a visible unavailable-image panel while preserving the vehicle's controls and source attribution.
- Fixed both career setup and business profile labels to show four forecourt spaces, matching the game engine. This does not change capital, capacity logic or saved careers.
- This is *not* full model and colour coverage. Other vehicles (including i20, Kia Rio, Corsa E and Golf) still require matching, licensed photos. Previously saved paint colours are never overwritten.

## v0.9.1 — Real Vehicle Photograph Cards & Deposit Part-Payments

**Real representative car photos, never synthetic substitutes.** Auctions, Private & Walk-in Sellers, Stock, Workshop, incoming customer part-exchanges, Reserved vehicles and recent Sold cars share a premium large-photo card system. Every card shows its true matching **make/model, generation/face-style, colour and year-band**; it continues with simulated mileage/owner/MOT and relevant prices and actions. If the photo library lacks a matching real picture, the game displays **PHOTO UNAVAILABLE** rather than a wrong car, mismatched paint colour or computer-generated substitute. A photo of a *similar trim* can be used only with a visible disclosure; none is presented as a photograph of the exact fictional vehicle.

**Five initial genuine, source-credited Wikimedia Commons photographs:**
- Black Nissan Qashqai J11 (2014–17), © M 93, CC BY-SA 3.0 DE; car in photo is Tekna and simulation may be Acenta.
- Black Ford Focus Mk3, © Damian B Oh, CC BY-SA 4.0; trim/body details can differ and broader facelift matching needs expansion.
- Red Ford Fiesta Mk7 facelift (2013–17), © Elise240SX, CC BY-SA 4.0; photo is North American SE trim.
- White Volkswagen Polo 6R facelift (2014–17), © EurovisionNim, CC BY-SA 4.0; photographed regional Trendline trim.
- Silver Toyota Yaris XP130 (2011–14), © OSX, released to public domain; photographed Australian YR trim.

Photographs are delivered from Wikimedia Commons URLs, not downloaded into the repository, so connectivity and Commons availability matter. The cards link to the **exact source page and licence** and disclose the display cropping. Original photographers must be credited; this is not permission to grab copyrighted dealer listing photos. The curated catalogue will be expanded model/colour/generation by model/colour/generation.

**Deposit handling:** The new customer reservation holds the £250 deposit in a **separate virtual customer-funds ledger** until collection. The player pays a real, vehicle-specific simulated collection/valet/administration expense of £75–£250 on reservation. On completion the **customer pays only the remaining balance** after both previous deposit and any part-exchange allowance; the previously held funds transfer into business cash, and a non-cash part-ex allowance is recorded without fictitious incoming/outgoing cash. No sale is recorded until handover; receipts are not double-counted.

A buyer cancelling a new **in-person** reservation may have up to the **documented, actually incurred customer-specific expense** retained from the £250. Any remainder is refunded. A cancellation caused by dealership fault refunds the deposit in full; the dealer bears their own preparation loss. A buyer whose existing v0.9 career deposit explicitly promised a full refund **keeps that promise after save migration**, so previous agreements are not retroactively changed. More detailed UK consumer-law scenarios, distance selling and contract terms need a later release. **This is a deliberately limited gameplay interpretation of deposit fairness, not legal compliance software, and does not mean any deposit can always be retained.**

**Saves and authenticity:** v1–v8 careers migrate into schema **v9** preserving money, stock, historical sales, staff, monthly reports, workshop progress, customer cases and existing held deposits. Previously unrecorded colour is assigned once deterministically based on the vehicle's stable origin and persists through stock acquisition and resale. Photos remain representative of simulated cars, not exact registrations. Logo, showroom and main menu stay unchanged.

## v0.9 — Four-Space Forecourt & Customer Sales Journey

**Every dealership now starts with four forecourt spaces** (formerly two), without increasing the existing £12,500 initial working capital. Having four spaces does not guarantee enough funds to fill them or prepare all four vehicles. Existing v1–v7 careers migrate to save schema **v8** with four spaces and retain their vehicles, sales, money, workshop jobs, employees, historical reports and progress. Original branding and home screen are unchanged.

The **Sales Office** now runs a customer process instead of allowing a single instant sale click:

- **Actual enquiry required.** Customer interest depends on market-day conditions, asking price, quality and reputation. A car may attract no enquiry, and reloading cannot reroll the same vehicle/day/session. Each advertised car has at most one active customer case.
- **Appointments and no-shows.** Ordinary enquiries require booking a viewing 1–3 game days ahead. Customer attendance is uncertain. No-shows and missed follow-ups are tracked.
- **Test drives and customer objections.** The customer must attend and complete a test drive. Some customers decline to proceed; higher condition risk makes that more likely. Cash and part-exchange preferences differ between customers.
- **Negotiation and agreement.** Once a test drive succeeds, an offer can be negotiated; a counteroffer may be rejected or cause the customer to walk away. Retail values remain based on the vehicle-specific intelligence and existing employee/reputation effects.
- **Handover or deposit (v0.9 historical behaviour).** A mutually accepted agreement can be handed over on the same day, or a fully refundable **£250 reservation deposit** can be recorded for a later collection. Deposits are held in a separate *virtual* customer-holding balance and **never enter spendable dealership cash**; a later cancellation returns the held balance without creating income or an expense. On collection, the full agreed vehicle price is recorded in the actual business cash ledger. Collection can still be cancelled.
- **Deal Day walk-ins.** The final day retains five slow trading sessions and variable quiet/busy market conditions. Interested walk-ins may proceed to a same-session test drive, but not a guaranteed sale. Unresolved walk-in cases expire between sessions; reserved vehicles persist to collection.
- **Monthly performance.** Management reports and the first-day meeting now include real recorded enquiry-to-sale conversion, appointments, no-shows, test drives, agreements and deposits/refunds. Sales count only at handover, never when someone books, agrees or deposits.

**Design limits:** Customer identities and behaviour are invented, not real people or live third-party leads. Appointment dates are game operating days, not staff-hour calendars. The original v0.9 refundable deposit and segregated-holding approach were gameplay simplifications, not a claim to model UK deposit contracts or consumer law, and legal documentation, identity checks, vehicle warranties, finance, insurance and actual card/bank processing require dedicated future releases.

## v0.8 Workshop Operations & Vehicle Lifecycle

**Vehicle preparation is no longer instantaneous.** Every newly acquired auction, private-seller or part-exchange car enters Vehicle Stock as unassessed and occupies a forecourt space. Open **Workshop** to authorise a paid assessment, review the individual repair budget, and book either:

- **In-house work** — requires an available employed Prep Technician. Their skills reduce some labour costs; one car can occupy the technician at a time. Work pauses if the assigned technician is unavailable or payroll is unpaid. The dealership can transfer a stuck job to an external garage for a further £125.
- **Outsourced garage** — no employee needed, accepts up to two jobs concurrently, incurs an illustrative uplift for the supplier's labour, parts handling and profit. Actual completion time depends on work complexity and deterministic parts-delay allowances.

Repair bookings charge cash **when authorised**, then progress once per *game day*, not per Deal Day session. Repair duration is a fictional estimate based on car condition, diagnosed repairs, technician efficiency and parts availability. Once work is complete, a **final quality check** must be performed. A proportion of cars need paid rectification and one extra repair day; it is possible for the final repair cost to exceed the original estimate. The car cannot be advertised or sold before passing quality control.

**Financial integrity:** Assessment cash is added to the vehicle's acquisition basis; repair booking, outsourcing and rework are counted in the actual preparation cost, recognised as vehicle cost on completion. Money reserved for other unprepared vehicles is protected. Workshop charges are tracked in the ledger and monthly management reports; cash tied up in unfinished jobs is included in stock working capital. Hiring a mechanic is not automatically the best option for a four-space starter dealership. In extreme cash shortages, a player can accept a simplified, below-cost **wholesale disposal offer** for stock that has not yet entered the repair queue; the recorded trading loss is not counted as a retail sale and reduces overall realised trading contribution. Reports now distinguish ongoing repair jobs and outstanding final checks.

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
- `vehicle-photos.js` — source-credited real photograph catalogue, exact colour/generation mapping and safe matching.
- `vehicle-cards.js` — single premium photographic card design with honest unavailable-image fallbacks.
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
