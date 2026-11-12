# Phase 3 — 2026 Vehicle Valuation, Workshop Job Cards and Auction Transport

**Reviewed:** 12 November 2026 · **Status:** implemented on isolated draft branch, not released to public `main`. 
**Scope:** 2026 independent dealer only; **classic career unchanged**.

## A. Current verified progress

- 50 curated vehicle variants in the catalogue.
- **15** have dated UK retail asking-price evidence and a source URL, comparison mileage and confidence label.
- **35** remain unverified: the buyer's vehicle dossier calls out that pricing is fictional rather than pretending to have an exact contemporary valuation.
- No wholesale trade/auction guide has been established from verified sold trade data for the new ten models; their existing fictional trade guides are preserved and described as *assumptions*, **not sourced auction prices**. The five earlier pilot rows contain manually chosen trade-guide estimates, likewise not authenticated.
- New workshop job-card subsystem applies to all new UK2026 auction, seller and part-exchange stock; classic cars retain historical repair assumptions.
- Separate auction transport costs are booked on the modern scenario (modelled road distance, not a real route). Classic historic ledgers are not altered.

## B. Additional UK retail research (10 audited rows)

The following are **asking-price estimates**, not actual sale proceeds. The given comparators are published asking prices; where the exact variant or mileage differs, uncertainty is stated.

| Game model | Mileage | Previous asking | 2026 asking | Evidence and caveats |
|---|---:|---:|---:|---|
| 2016 Ford Focus Zetec 1.5 TDCi | 118,300 | £4,250 | **£3,450** | 2016 1.5 TDCi Zetec around £3,190 at 104k, £2,490 at 131k, £4,250 at 92k; grade-4 and condition-sensitive |
| 2018 Vauxhall Corsa Energy 1.4 | 112,200 | £4,000 | **£4,000 (retained)** | 2018 1.4 manual ~£3,495 at 110k, ~£3,995 at 105k; existing value optimistic end |
| 2017 Nissan Qashqai Acenta 1.5 dCi | 127,000 | £6,350 | **£4,700** | 132k diesel Acenta £4,500; 114k £4,000, scarce exact sample |
| 2018 Peugeot 208 Active 1.2 | 113,800 | £4,150 | **£3,350** | Active around £3,490 at 89k, grade-4 high-mileage inference; nearby trim Allure £3,149 at 110k |
| 2021 Vauxhall Corsa SE Premium 1.2 Turbo | 57,100 | £10,350 | **£8,800** | Exact manual turbo £7,695 at 66k, £9,998 at 35k |
| 2021 Peugeot 208 Allure 1.2 PureTech | 51,200 | £10,850 | **£9,250** | £8,790 at 51k, £9,998 at 48k, £7,995 at 64k |
| 2021 Toyota Yaris Design Hybrid | 55,700 | £13,850 | **£12,800** | £12,488 at 51.7k, £11,995 at 43k |
| 2022 Ford Puma Titanium 1.0 MHEV | 47,300 | £13,950 | **£11,300** | Exact MHEV/manual £10,560 at 47.1k, £10,610 at 44.9k |
| 2022 Toyota Corolla Icon Hybrid | 52,000 | £16,950 | **£15,500** | Trim/model median £16k at 38k median mileage; exact mileage not observed. **Low confidence** |
| 2023 Tesla Model Y Long Range | 39,100 | £29,500 | **£26,800** | 2023 median £25,500 at 46k; £27,888 at 36.8k, £22,644 at 55k |

### Source pages, captured Nov 2026
- Focus: https://askcar.co.uk/used-cars/ford/focus/zetec/2016
- Corsa 2018: https://askcar.co.uk/used-cars/vauxhall/corsa/energy/2018
- Qashqai: https://askcar.co.uk/used-cars/nissan/qashqai/acenta/2017
- Peugeot 208 2018: https://www.askcar.co.uk/used-cars/peugeot/208/2018
- Corsa 2021: https://www.askcar.co.uk/used-cars/vauxhall/corsa/se-premium/2021
- Peugeot 208 2021: https://www.askcar.co.uk/used-cars/peugeot/208/allure/2021
- Yaris: https://www.askcar.co.uk/used-cars/toyota/yaris/design/2021
- Puma: https://askcar.co.uk/used-cars/ford/puma/titanium/2022
- Corolla: https://www.askcar.co.uk/used-cars/toyota/corolla/icon/2022
- Tesla: https://askcar.co.uk/used-cars/tesla/model-y/long-range/2023

**Earlier 5-source pilot:** See `docs/AUCTION-AND-VALUATIONS-AUDIT-2026.md` for Fiesta, Polo, Corsa 2020, MG4 and Leaf.

**Not completed:** 35 exact-derivative retail reviews, 50 independent sold-wholesale/hammer benchmarks, and sales-achieved vs advertised-price evidence. No overclaim of a completed 50-car audit.

## C. 2026 garage price model

New module: `repair-prices.js`, which models a **regional independent garage at an ASSUMED £72/hour ex VAT**, 20% external supplier VAT, and explicit parts. It reflects November 2026 UK benchmark *averages*, not a personal mechanic's quote.

| Modelled job | Labour and parts ex VAT | Gross with VAT | Published context |
|---|---|---:|---|
| Full service & filters | 1.5 h × £72 + £62 parts | **£204** | FixMyCar UK full service average ~£206 |
| Front brake discs and pads | 1.5 h × £72 + £124 parts | **£278** | BookMyGarage £278 average |
| Rear brake discs and pads | 1.25 h × £72 + £117 parts | **£248** | BookMyGarage £248 average |
| Pair mid-range tyres fitted | 0.8 h × £72 + £138 parts | **£235** | Balancing assumption, not an observed national average |
| EV safety/service check | 1.2 h × £72 + £38 parts | **£149** | Balancing assumption, not a full battery certificate |

Sources:
- https://bookmygarage.com/blog/brake-pads-and-discs-cost/
- https://www.whocanfixmycar.com/lp/services/full-service
- https://garagedesk.co/garage-labour-rates-uk/

For a modern **grade-4** petrol/diesel car, modelled scheduled preparation = service £204 + rear brakes £248 + pair tyres £235 = **£687**. This is a conditional *workshop budget*, not a claim those exact defects have been verified. Separate paid pre-repair assessment is **£80**. The job card does not charge for diagnostics a second time.

Engine-specific **conditional exposure**: high-mileage 1.2 PureTech / relevant PSA Corsa engines and 1.0 EcoBoost require timing-belt configuration, service-history and eligibility checks. A potential wet-belt job is **not automatically a fault**. The estimated exposure and risk reserve are visible in the vehicle file. The same principle applies to diesel DPF exposure. If reliable invoices or model identification contradict the assumption, the garage should re-quote the individual vehicle.

Source context (2026): https://mendcost.com/uk/repair-costs/timing-belt/peugeot-1-2-puretech-wet-belt-replacement-cost/

**Important remaining defect:** Garage job cards are still simplified. Regional variations, actual supplier invoices, parts fitment, failed quality checks, safety recalls, full MOT failure outcomes and cash reclaim of VAT on eligible costs are not completely modelled. Internal workshop labour economics, National Insurance and employer pension accounting remain unfinished.

## D. Simulated 2026 auction transport

Module: `auction-transport.js`

- Actual UK provider example: OPT Transport quotes **£1.70/mile inc VAT**, minimum £75, with a specific-route quotation still required.
- Game lacks actual auction depot and forecourt addresses. It generates a stable artificial route of **45–155 miles** from the lot identifier.
- The quote is **not a claim about the true distance or actual price for a BCA vehicle**.
- The quote is converted to **whole pounds**, since this game's current cash ledger stores integer pound amounts.
- Example 2026 Day 1, lot 001: **65 simulated miles, £111** transport cost.
- £2,450 hammer + £636 BCA Blue Standard buyer fee + £111 simulated transport = **£3,197 immediate cash requirement**, before workshop assessment/repair.
- `trading.js` posts hammer+fee separately from transport, includes both in stock acquisition basis, checks future preparation reserves and validates the transport invoice against saved lot identifiers.
- `finance-view.js`, `dashboard-view.js`, `auction-hall-view.js` and `vehicle-view.js` now show the charge consistently.
- `monthly.js` records transport under vehicle acquisition, not a generic unexplained cash movement. Legacy archived monthly reports remain valid.

Source: https://opttransport.co.uk/transport-cost

**Important limitation:** Stock becomes available for assessment immediately on purchase in this pilot; actual delivery, auction gate-release, storage penalties and carrier delays remain a future scheduling task. Also requires player choice of trade-plate self-collection versus transported delivery, and actual location/distance scenario.

## E. Automated verification

Latest branch CI: **241 tests passing, 0 failures** (12 November 2026). Tests cover:
- 15 reviewed versus 35 unverified catalogue rows and unchanged classic prices;
- regional job-card line item totals £204/£278/£248/£235, no double diagnostics;
- model-specific timing-belt risk is provisional;
- modern workshop assessment £80, external booking without duplicate labour uplift, cash and saved job validation;
- 2026 published auction buyer fee bands and no unsupported quote above £24,999;
- 2026 winning hammer £2,450 buyer fee £636 plus simulated £111 delivery;
- statement/report cash reconciliation and developer-save transport tampering rejection;
- archived v1–v14 legacy careers preserved.

Do not merge into production until remaining high-priority accounting and vehicle data defects are complete, and a true UI smoke test and economic stress test are run.

## F. Next high-priority tasks

1. **35 remaining retail variants** — 3+ exact-spec comparables and date/mileage/condition evidence each.
2. **Trade price quality** — acquisition guides must be separately sourced from actual trade/auction sold values, not discounted retail ads.
3. **VAT** — 2026 turnover registration, eligible second-hand vehicle margin scheme and correct input VAT recovery; no profit-calculation claims before this is done.
4. **Consumer aftersales** — faults, repairs, rejection rights, realistic claim reserves and settlement timings.
5. **Staff employment** — hours, NI, pensions, minimum wage changes, holidays, payroll liabilities.
6. **Real operational logistics** — auction collection timeline, supplier quotes, travel, storage and MOT/roadworthiness restrictions.
7. **Commercial viability** — break-even budgets, margin stress testing, realistic financed/unfinanced liquidity and business insolvency.
