# Phase 8C — Real gameplay balance audit (UK independent dealer, Nov 2026)

**Status:** Experimental on a draft development branch. Based on Phase 8B, 8A and Phase 7 drafts, not the live GitHub Pages game.

## Objective
The game should feel like managing a small UK independent used-car business, not like guaranteed money printing or an impossible insolvency trap. A skilled and disciplined player should usually have a plausible path to survive and progress, while bad acquisition, inflated prices, excessive staffing and poor stock turn can cause real cash difficulties.

## Active-career test design
A deterministic test bot uses the **actual `MotorTradeEngine`**, with NO test-only instantaneous preparation or sale shortcuts. On each day it:
1. Attends monthly management meetings.
2. Assesses incoming stock, books external reconditioning, waits for workshop duration and passes actual QC.
3. Advertises at policy-driven asking prices and adjusts stock gradually when allowed.
4. Contacts only interested real-in-game leads; books appointments, handles no-shows, offers test drives, negotiates and completes cash sales or genuine deposits/collections.
5. Sources only cars passing published fee/transport + simulated repair/VAT and target-margin assessment, subject to capacity, creditor holds and protected operating buffer.
6. Runs month-end Deal Day sessions and reconciles the actual finance ledger, stock, monthly reports and save restore over 12, 36 and 60 game months.

### Comparison strategies
- **Balanced:** aims for three prepared/listed cars, modest fair asking premium and measured reductions.
- **Cautious:** fewer cars and higher expected-margin hurdle.
- **Overpriced:** asks substantially above fair buyer budgets; does not chase a sale.
- **Discount:** accepts thinner margins and deliberately sells some deals via deposits/collection to test the full commitment timeline.
- **Inactive:** buys/sells nothing and still pays fixed recurring costs.

No customer demand, auction value, bank loan, stock disposal or tax receipt is manufactured by the bot; it chooses among game-exposed offers and uses existing production calls. Results are **simulation observations**, not predictions for a real dealer.

## Release acceptance principles
- Finite, reproducible 12/36/60 month lives and reconciled cash and stocks; no negative bank, duplicated sales or erased debts.
- Sound decisions result in materially better *median* outcomes than poor ones over multiple deterministic seeds; do **not** require every single good career to win.
- Players have adequate time to repair, advertise and negotiate, and cannot instantly force a customer to buy.
- The day-to-day actions have meaningful rewards without requiring hundreds of repetitive clicks. Career progression is gated by actual cash, reputation and operating constraints.
- Balance uncertain demand and price calibrations to conservative, transparent assumptions, not to invented wholesale results or a single lucky test seed.
- Manual responsive/mobile browser tests and eventual user playtesting are required before release.

## Important limitations
These tests do not independently verify any actual BCA/Manheim sold hammer, income-tax or UK director-insolvency compliance. Retail comparisons are advertisements, not achieved prices. Missing verified sold-wholesale data, invoice/VIN/VAT evidence and an independently calibrated customer cohort remain release blockers. The tests are a basis for *relative* scenario balance only.


## Phase 8C measured observations (test fixture, 12 November 2026)

The active dealer uses genuine production buying, seller counteroffers, external workshop repairs and QC, actual customer appointments/test drives, customer refunds/deposits, real salary/NI/pension if hired, and actual bank/ledger accruals. Multi-seed results are **not population forecasts**.

### Five paired first-year market seeds
Same dealership names for the balanced and persistently overpriced policies. Balanced dealer paid asking prices only after evaluating margin and negotiating with fictional owners; it repriced older adverts deliberately. Each listed vehicle's advert date is preserved when repriced.

| Fictional market seed | Balanced sales, 12 months | Mean days advertised on completed sales | Overpriced policy sales |
|---|---:|---:|---:|
| Northwood | 31 | 27 | 0 |
| Fleetline | 20 | 45 | 0 |
| Riverside | 15 | 63 | 0 |
| West Quay | 30 | 23 | 0 |
| Central Trade | 19 | 44 | 0 |

- **Median balanced throughput:** 20 retail cars per 12 game months. Actual lead/turnover variability is material; we must not promise identical outcomes.
- **Mean time advertised:** 40.4 game days across the five seed-level averages; **not** the pooled vehicle-weighted mean and **not** a robust estimate of real-world stock turn.
- **Selected empirical backdrop:** Auto Trader 9 Nov 2026 reports 29 days market-wide for October; Cazoo Market View 4 Nov 2026 reports **49.6 days for independent dealers**, whose average stock fleet was about 42 units (not this four-space game). These are different platform methodologies and dealer populations, **not validated per-unit enquiry probabilities**. Sources:
  - https://plc.autotrader.co.uk/news-views/press-releases/commentary-q3-used-car-transactions-2026/
  - https://dealer.cazoo.co.uk/news/cazoo-market-view-reports-softening-of-used-prices-in-october-driven-by-younger-age-profile-cars/
- Regression sanity gates now catch model changes causing a five-seed **median below 12 or above 35 yearly sales**, **mean seed-level advertised time below 25 or above 65 days**, and widespread first-year cash exhaustion. These are game-design guardrails, **not authoritative real-dealer industry targets**.

### Long-term and adverse strategies (distinct deterministic seeds)
- **Balanced 36 months:** 86 retail sales, approximately £53,699 bank cash, three unsold stock cars, nine actual consumer repair cases, no outstanding premises/wage arrears. This is a surviving small company, not instant expansion to a mega-dealer.
- **Understocked cautious 60 months:** 61 retail sales, bank eventually £0 and approximately £45,034 overdue premises/wage arrears. Keeping only two vehicles and paying the full four-space fixed overhead can be an unsustainable business strategy; insolvency is not artificially prevented.
- **Discount-led 60 months:** 249 retail sales with four-stock operating target, approximately £119,267 bank cash and four unsold units, including 19 consumer complaint repair cases and four negotiated remedies. This approach can scale but earns thinner unit margins and uses cash aggressively. Its **22-day average advertised time** is faster than independent market averages and must be treated as a selectively low-priced strategy, not the normal baseline.
- **Early staffed 12 months:** 55 retail sales, around £41,761 bank cash plus four unsold units, reflecting both stronger lead handling and full wage/tax/pension costs. Hiring before capacity and turnover justify it can still be dangerous in other seeds.
- **Persistently overpriced first year:** no completed sales for this refusal-to-negotiate policy. Vehicles remain owned and bank cash declines from ordinary overheads; the game does not grant a retail exit without real buyers.

*All amounts above are **simulated gameplay observations** from individual deterministic seeds. Ending bank cash excludes the invested capital still held in stock; and **owner labour/pay is not yet costed**. Figures are not audited profit or a statutory balance sheet.*

### Defects fixed and balancing changes

1. **Critical VAT fractional-remainder deadlock:** the UK2026 creditor hold formerly treated 1–99p of accrued VAT as overdue even though the game can only remit integer pounds. This could permanently freeze all new buying with ample cash in the bank, transforming an otherwise successful dealer into unavoidable failure. Now only whole pounds **actually due** cause a creditor buying hold; pennies remain reserved as liabilities. Dedicated regression test prevents recurrence.
2. **Excessive car throughput:** the initial Phase 8 UK2026 lead rate produced more than 60 sales/year on only three stocked spaces. The simulated base probability has been reduced, price sensitivity, quality, source and staff effects preserved, and older listings can be repriced. It is **not a claimed measured real-market lead conversion rate**.
3. **Unrealistic reputation target ladder:** the classic ladder remains untouched, but UK2026 management targets cannot grow from 2 to 6 sales/month on a four-space premise simply because the reputation tier increased. Target caps now scale by actual forecourt capacity (3/4/5/6 units for 4/6/8/10 space locations at high reputation).
4. **Aged-stock management:** Vehicle Stock now shows a cautionary price-review suggestion once a listing is 30+ days advertised and priced at least £100 above its modelled sensitivity. It makes no automatic price change and never guarantees a sale.
5. **More complete economic exposure:** the career agent handles automatically generated consumer complaints and paid remedial repairs/reductions, and the Finance desk explicitly warns that the working owner salary/drawings are NOT in the contribution figure.

## What is **not** yet proven

- Manual desktop/mobile playthrough, real independent-player usability, UI accessibility and exact average playtime per game year have **not** been completed.
- These agents use intentionally different buying and pricing policies. The same player may behave differently, and a small deterministic sample does not guarantee the game's expected difficulty for everyone.
- The available catalogue still lacks 50 actual sold wholesale comparables and has 14 weak retail price matches; UK vehicle-specific VAT/finance/RTI and owner compensation cannot be labelled legally or financially exact.
- Longer-career simulations should also include part-exchange-heavy sales, creditor rescue/restructuring, hired technicians, difficult consumer rejections and deliberate premises expansions in more independent seeds.
- We intentionally have **not** introduced difficulty multipliers or free rescue money. Successful play should stem from sourcing, managing margins, pricing and stock turn.
