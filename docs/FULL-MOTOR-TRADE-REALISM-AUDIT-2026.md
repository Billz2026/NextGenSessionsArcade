# The Motor Trade — Whole-Game Realism Audit & Implementation Backlog
**As of 12 November 2026 · UK / regional independent used-car dealer**  
**Status:** evidence-based audit, not a claim that all systems have been rebuilt. Proposed values are labelled as scenarios and not live supplier quotes.

## Product standard
A decision is commercially credible only when a real trader could explain where every pound came from, why a specific car is priced that way, what the worst downside is, and why the sale would or would not take place. Time, stock, cash, customers and liabilities must be conserved. The game should not create stock, cash, buyers or reliefs ex nihilo.

Model a small independent dealer operating a four-space retail site in England in 2026 first. Other UK jurisdictions and larger dealers require scenario-specific rules. Data must carry **source, timestamp, geography, spec, sample size, confidence and freshness**; no invented quote presented as live pricing.

## Severity-ordered findings

| ID | System (current files) | Confirmed issue | Priority | Release criterion |
|---|---|---|---|---|
| F01 | `trading.js`, `simulator.js` | £12,500 starting cash mismatches premises-based four-car business | P0 | New standard scenario £60k owner equity, £50k bank cash, correct £10k opening-asset/expense journal |
| F02 | `trading.js` | All saves reconcile to fixed £12,500 base; naive replacement corrupts old saves | P0 | Versioned opening-journal model with v1–v14 migration and tested legacy fixtures |
| F03 | `premises.js` | £25/day only rent/utilities; four repair bays presented as equipped | P0 | Real cost stack; four retail spaces, zero owned repair bays, outsourced preparation |
| F04 | `monthly.js`, `finance-view.js` | Gross margin and operating contribution omit VAT/aftersales and several overheads | P0 | Separate vehicle contribution, VAT due, cash movement, working capital, gross and net expense |
| F05 | `vehicle-market.js`, `trading.js` | Auction fee is ~£240 for a £2k guide car, even though BCA 2026 Blue standard is £614 inc VAT at £2,000–2,249 hammer; current lot fee is based on *guide*, not hammer | P0 | Auctioneer/account tier-specific fee-at-hammer invoice with VAT/transport/online and documented fallback |
| F06 | `vehicle-market.js` | 50+ fictional market rows use static guide, retail and prep; not derivative/mileage/dated-market-validated | P0 | Every catalogue row benchmarked against >=3 suitable listings or documented insufficiency, with trade and retail separate |
| F07 | `vehicle-intel.js`, `workshop.js` | Only single deterministic hidden fault, unverified generic labour/parts, flat prep; future costs insufficiently modelled | P0 | Job cards (hours×rate + parts + VAT), multi-defect findings, model-specific risk, condition-based ranges, safety block |
| F08 | `people.js` | Several new candidate monthly base salaries below 40-hour adult minimum; employer on-costs and leave omitted | P0 | Legal 2026 hourly minimum per contracted hours, realistic salary bands, NI, pension, leave and allowances by eligibility |
| F09 | `trading.js`, `monthly.js` | UK VAT registration and eligible margin scheme absent | P0 | Rolling turnover registration trigger, margin-scheme eligibility and correct individual-vehicle VAT records |
| F10 | `customers.js` | No customer statutory remedy / rejection workflow after completed sale | P0 | Rights-aware claims, inspection, repair, rejection/refund, costs and reputation |
| F11 | `people.js` | Payroll settles daily at 1/30 monthly pay, not normal UK weekly/monthly payroll or tax calendar | P1 | Accrue daily, remit on scheduled payday, employer NI/pension liabilities separate |
| F12 | `events.js`, `monthly.js` | Every period is fixed 30 days, with no audited business calendar / bank holidays for operating costs | P1 | Explicit configurable game-time abstraction; meaningful opening hours and scheduled supplier/cash settlements |
| F13 | `vehicle-market.js` | Cash/reputation thresholds prevent access to normal market stock irrespective of dealer relationships | P1 | Liquidity limits what is affordable; trust/reputation influence supply terms, not magical vehicle availability |
| F14 | `vehicle-intel.js` | All simulated MOT reports show PASS even for poor grade and high-mileage stock | P1 | Defects/advisories/failures, age-dependent MOT timing, documents and checks |
| F15 | `trading.js`, `customers.js` | Asking/listing range permits wildly above-market prices, with largely deterministic demand | P1 | Comparable-based price, elasticity, stale-stock markdowns, no-show risk, finance availability, advertising effectiveness |
| F16 | `premises.js` | Expansion fees £1,800/£3,600/£6,500 ignore commercial lease, deposit, planning, rates, equipment and fit-out | P1 | Location/lease/size-specific upgrade cost, recurring rent, deposit and financing treatment |
| F17 | `trading.js`, `monthly.js` | No floorplan funding, credit interest, cash-flow timing, payment terms or insolvency workout | P1 | Credit facility principal/interest/covenants and safe-mode debt/account reconciliation |
| F18 | `vehicle-intel.js`, `vehicle-accuracy.js` | Generic engine fallbacks may be inaccurate where derivative not verified | P1 | UK trim/gearbox/emissions/hybrid generation and fitment audit, no false certainty |
| F19 | `customers.js` | Unsecured appointments and deposits have mechanics but no complete customer-contract compliance audit | P1 | Written disclosure, distance sale rules where applicable, fair deposit handling, handover documentation |
| F20 | `simulator.js` | Single localStorage save; migration risk and limited backup/recovery | P1 | Backup/export, import, safe rollback, migration dry-run and integrity checks |
| F21 | `monthly.js` | Beginner target two units can reward unrealistic operating success | P1 | Forecast break-even units from actual net contribution and overhead, separate volumes and profit |
| F22 | `events.js` | Seasonality is event-driven, without empirical supply, registration-season and fuel demand effects | P2 | Scenario-specific, auditable market condition curves and uncertainty |
| F23 | `vehicle-market.js` | Stock supply and auction rival behaviour are repeatable deterministic curves | P2 | Seeded stochastic distributions calibrated against outcomes, not guaranteed flip opportunities |
| F24 | Whole UI | Important distinction between asking price, expected sale, hammer, fees, prep, gross spread and actual profit not always clear | P1 | Full buy-to-retail financial bridge visible before bids, with cash risk and confidence |
| F25 | Whole game | End-to-end integration/balance stress tests inadequate for new financial regime | P0 | Run 12/36/60 game-month simulations, loss scenarios, insolvency, turnover threshold and saves across devices |

### 2026 UK authoritative compliance / benchmark facts

- **Wages:** 21+ minimum £12.71/hr effective 1 Apr 2026, £26,436.80 annually at 40h × 52wk = £2,203.07/month. https://www.gov.uk/national-minimum-wage-rates
- **Employer NI:** Usually 15% above £5,000/year secondary threshold for ordinary eligible employees in 2026/27. Check qualifying Employment Allowance before applying a flat employer tax charge to a micro business; exemptions for certain younger workers/apprentices. https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
- **Employer pension:** minimum 3% of qualifying earnings (normally £6,240 to £50,270 annually) where auto-enrolment applies. https://www.gov.uk/workplace-pensions-employers/how-to-enrol-staff
- **Wage market benchmark:** 2026 UK recruitment advertised vehicle technician median basic ~£38k/year, average ~£38.5k, not £19.8k. Recruitment adverts are indicative, not statutory rules. https://www.perfectplacement.co.uk/cm/automotive-salary-insights
- **VAT registration:** currently £90,000 taxable turnover across rolling 12 months / expected turnover test. For margin-scheme goods, registration turnover uses full selling prices, not profit margin. https://www.gov.uk/register-for-vat and https://www.gov.uk/hmrc-internal-manuals/vat-registration-manual/vatreg02400
- **VAT on eligible second-hand vehicle margin:** one-sixth of the positive purchase-to-sale margin at a 20% VAT rate; prep repairs do not reduce the VAT margin. Correct invoice eligibility and VAT on ancillary fees require separate records. https://www.gov.uk/guidance/buying-and-selling-second-hand-motor-vehicles-using-the-vat-margin-scheme
- **Consumer rights:** condition, age, mileage and sale description matter; faults present at supply can give remedies beyond an optional dealer warranty. https://www.citizensadvice.org.uk/consumer/buying-or-repairing-a-car/problems-with-a-used-car/
- **Business rate relief** is property/jurisdiction-specific and cannot be automatically granted to any nationwide dealer. https://www.gov.uk/business-rates-relief/small-business-rate-relief

### Vehicle retail spot checks — November 2026

1. **2022 MG4 EV SE Standard Range:** game example 57,500 miles retail £13,250. Public 2022 MG4 SE sample (32 advertised, 10 Nov 2026) median asking price ~£12,000 at *28,000* median miles; game value is a high-priority recheck, not automatically a confirmed error without battery, grade and specific listing match. Source: https://www.askcar.co.uk/used-cars/mg/mg4/se/2022
2. **2018 Volkswagen Polo SE, ~98k miles:** game asking £6,300. A 2019 Polo SE 1.0 petrol at ~89k miles was advertised at £8,480 in early Nov 2026, and 2018 Polo SE model-year asking median ~£9,600 but at typical lower mileage. Check exact 2018 derivative, mileage and condition before modifying; used as directional evidence only. Sources: https://www.askcar.co.uk/car/volkswagen-polo-2019-e79fb1e0fd9c and https://askcar.co.uk/used-cars/volkswagen/polo/se/2019
3. **2018 Toyota Yaris Icon Hybrid, ~114k miles:** game asking £7,250. 2018 Yaris hybrid asking comparison around £8,000–£8,200 for the broader >=60k-mile cohort, which likely spans much lower mileage than 114k. Needs high-mileage comparables before reprice. Source: https://www.askcar.co.uk/used-cars/toyota/yaris/icon-tech/2018
4. Benchmark auction **acquisition** prices separately: internet retail advertisements do not establish achieved hammer, buyer fees, trade appraisal or dealer margin. Don't compute wholesale as arbitrary fixed percentage of a single retailer ask.

### Auction charges — evidence

BCA Blue Standard buyer fees effective 30 March 2026, **VAT-inclusive fee at hammer**:
- £1,750–£1,999: £596
- £2,000–£2,249: £614
- £3,000–£3,249: £753
- £4,000–£4,249: £796
- £5,000–£5,249: £828
- £7,000–£7,249: £912
- £9,000–£9,249: £1,008
- £10,000–£10,249: £1,043
- £20,000–£20,249: £1,476
- Over £24,999: **ask Customer Services**, not a published uniform fee.
Published PDF: https://www.bca.co.uk/dam/UK/Buying/payment/BCA_Blue_Standard_Rate_Buyers_Fees_April_2026.pdf
These are specific account schedule figures, not universal BCA or Manheim fees. The game must not label its own formula as an actual BCA invoice.

### Repair prices — evidence

- June/November 2026 BookMyGarage national bookings: front pads + discs ~£278, rear ~£248, with make and postcode variance. https://bookmygarage.com/blog/brake-pads-and-discs-cost/
- FixMyCar London this-month: full service ~£206, brake pads and discs quote ~£503, cambelt change ~£591. Scope can differ materially from BookMyGarage, so do not average incomparable services blindly. https://www.whocanfixmycar.com/lp/services/london
- 2026 independent garage labour bands are broad by geography (£40–£110/hr illustrative in one published benchmark). Always use labour hours, parts and VAT with location rather than a single universal £150–£600 fault cost. https://garagedesk.co/garage-labour-rates-uk/
- A high-mileage 1.0 EcoBoost, PureTech 1.2, DSG, EV battery/charger or premium diesel has specification-specific risks; do not declare a known defect without identifying the exact powertrain and service history.
- The repair estimator should provide a **range and confidence**, and inspection should reveal extra defects. Jobs have safety-critical priority. A failed quality check costs time and potentially money; never guarantee repair success.

### Starting business financial model — agreed design hypothesis

Owner contributes £60k. Day 0 pays £3k refundable lease deposit, £3k insurance prepaid (12×£250 expense), £2k fixtures asset, £2k one-off launch expense = **£50k bank**, **£58k gross assets**, **£60k equity − £2k expense**. Four retail spaces; outsource preparation; no employees.

30-game-day period operating expenses £2,550: rent £1,350, utilities/security £200, prepaid insurance amortisation £250, vehicle ads £450, software £100, accounts/admin £125, services £75. **New recurring cash outflow £2,300** during prepaid term, not £2,550. Qualifying English small-business rates relief is a scenario condition, not a blanket rule. Additional charges (business rates where due, repairs, inventory, VAT, staff, customer claims) are separate.

At £1,000 post-acquisition/post-prep/post-VAT contribution per sale, three sales (£3,000) less £2,550 running expense = £450 contribution **before** irregular liabilities and owner drawings. Do not claim £450 accounting net profit.

## Implementation architecture — non-negotiables

1. **Accounting invariants**: journal is source of truth; cash account is independently reconcilable; owner capital and refundable deposit are neither sales revenue nor P&L expense; preparation carried in stock cost then recognised on sale; no negative cash without explicit credit.
2. **Save migration**: v1–v14 old careers keep their original opening base and contract costs, or offer explicit migration with a pre-change backup. New regime must have separate scenario/version ID; do not inject unearned £37,500 into old saves.
3. **Valuation record**: `{year,make,model,derivative,engine,gearbox,trim,mileage,condition,history,region,grade,sourceDate,confidence,tradeGuide,retailAsk,retailAchievedRange}`. Separate advertised from achieved price.
4. **Auction invoice**: `hammer + applicable buyer fee + transport + inspection + storage - recoverable input VAT` with invoice-level VAT attribution and account tier. Fee recomputed from *hammer*; before bidding show safely conservative estimate.
5. **Repair job**: `parts + billedHours*labourRate + diagnostics + external provider VAT + contingency`, internal labour not free if employee hours used. Parts delays and workshop availability matter.
6. **Employment**: contracted weekly hours and base gross pay, commission, employer NIC, pension, payroll taxes, holiday accrual, recruitment and training; annual national wage uprating.
7. **Sales**: realistic enquiries, probability of completion, price competition, finance authorisation where involved, part-ex VAT accounting, handover costs and post-sale claim exposure.
8. **Time**: test time-dependent expenses, dates and thresholds independent of fast-forward exploits.
9. **Test fixtures**: loss on car with hidden fault; cash under three-month runway; VAT threshold exceeded; customer rejects car at day 20; warranty repair at month 4; auction fee crosses hammer band; worker at minimum salary after annual rate change; insolvent dealer; restore old v14 car.
10. **Rollout**: separate audit branch, tests green, smoke test new/legacy careers, then merge. Keep a changelog of validated vs forecast vs fictional values.

## Implementation status

- [x] Broad code audit and government/source benchmarking recorded here.
- [x] Branch-level patch: new generated applicant base salary repriced by role using the adult full-time £12.71/hr minimum, with premium for technicians/buyers/supervisors; legacy staff untouched. **This does not yet model employer on-costs, tax remittances or staff hours and is not the completed wage model.**
- [ ] Opening balance-sheet implementation + versioned new career.
- [ ] True recurring overheads and insurance prepayment accounting.
- [ ] Auction hammer fee schedule and VAT treatment.
- [ ] Per-derivative 2026 vehicle market dataset.
- [ ] Job-card and regional mechanic price model.
- [ ] Employer contributions and pay calendar.
- [ ] VAT and aftersales rights flows.
- [ ] Automated 36-month career stress testing.

**Release gate:** Never call the whole game "fully realistic" until it passes every P0 requirement and relevant P1 business-critical tests.
