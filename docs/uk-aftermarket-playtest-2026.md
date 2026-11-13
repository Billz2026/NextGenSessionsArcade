# UK2026 Beta — Dealer Playtest Feedback / Aftermarket Iteration

**Reviewed:** 13 November 2026. **Scope:** draft PR #216 only; no root/live classic-career changes. This is a simulation, not an MOT, DVLA/DVSA, ATF, price-quoting, repair or VAT-returns product.

## Issues reproduced and changes made

### 1. External garage bookings should have no arbitrary two-car slot limit
- Removed the code restriction at two simultaneous external stock-repair bookings in `beta/workshop.js` and all corresponding disabled UI branches in `beta/workshop-view.js`.
- Any number of independently paid repair contracts may be created, as long as the dealer protects its current stock-repair cash reserves. Each vehicle retains its own work order, estimated day count, parts delay, and quality check. The number of external garages is **not** represented by one unlimited physical garage.
- An off-site repair vehicle now leaves the four showroom positions while it is at the external garage. When ready, it returns to a free display space or paid overflow compound.

### 2. The 2026 dealer without an internal workshop should not pay an imaginary internal assessment
- The UK2026 work order now starts with a **no-fee visual intake review**, included in normal dealer overhead; it does not claim that an independent diagnostic or MOT has taken place.
- A separate genuine pre-purchase inspection can still be bought for a fee. Actual external repair supplier costs, possible quality rework and time delays are still charged.
- Classic-mode paid diagnostics are unchanged. Existing save records can carry an optional `visualAssessment` flag; a zero assessment fee is valid **only** when the review is flagged as visual, not a free full diagnostic.

### 3. Four forecourt spaces are display capacity, not maximum owned stock
- UK2026 `storageLocation` tracks **forecourt**, **external repairer**, or **offsite compound**. The current four available retail display spaces still physically constrain advertising.
- A fifth+ owned car goes to **offsite paid storage** if the four display spaces are occupied. **£12 per owned offsite vehicle/game day** is a *fictional* storage-expense assumption, charged through real cash/arrears/expense ledgers. Cars actively at an external repairer are not charged that separate compound storage rate.
- A prepared offsite car can be brought back to a free display space for **£35 fictitious transfer cost**, recorded as acquisition cash. You cannot advertise a car still stored offsite or at a garage. A returned/refunded consumer car also goes into owned offsite inventory if no showroom position is free.
- The same 4-space limit in *classic* careers is unchanged. Inventory remains cash-gated and bounded by save validation; offsite does **not** create free loan capital or instant sales.

### 4. New regular customer activity even when retail cars are not selling
- New customer-facing **Customer Services** sidebar/page in UK2026, independent of 4-car display occupancy.
- Daily deterministic service/repair/MOT/ATF leads; more offered as reputation improves:
  - Routine service: **£229 gross customer invoice / £150 paid external supplier**
  - Minor customer repair: **£395 gross customer invoice / £275 paid external supplier**
  - Approved MOT testing-centre referral: **£15 (modelled taxable referral commission)**; **£45 illustrative MOT test paid by the customer directly to the approved test centre**; no claim of dealer MOT testing authority
  - Licensed ATF end-of-life vehicle referral: **£35 (modelled taxable referral commission)**; the ATF pays vehicle owner directly by bank transfer/cheque and is responsible for Certificate of Destruction when scrapping
- All quoted commission and supplier figures are **fictional game-balancing assumptions**, *not contractual partner quotes, workshop invoices or fee promises*.
- Supplier outlay on booking, customer gross receipt or partner referral commission **only when completed successfully**, with cash ledger and conservative standard-rate output VAT for taxable services. No input VAT recovery. 7% deterministic provider QC failure possibility and a chance of two-day lateness. Customer rating 1–5, resulting possible reputation gain/penalty. Backlog adds delivery time after every five active referrals (max +5 days); subcontracted jobs are not silently instant.
- No scrap car is stored/dismantled or sold as salvage by this unlicensed dealership. DVLA/ATF paperwork and owner payment remain with the authorised parties.

### 5. Weekly auction must be hard to miss
- Persistent high-contrast **AUCTION IS ON TODAY** banner on actual auction day with two buttons:
  - **ENTER AUCTION HALL**, navigates to the current lot without placing a bid.
  - **SKIP THIS WEEK**, calls the underlying pass/next-lot transitions (records correct non-sales and charges no buyer fee) and dismisses the prompt until next eligible auction date.
- The decision is written into the existing beta career's optional `auctionReminderDismissedDay` field, preserving reload behavior and never creating a fake auction win.

### 6. Monthly sales and revenue targets tied to reputation
- Existing 2026 `targetFor2026` increases the **number of required car sales** and **turnover figure** with starting reputation and forecourt size.
- The updated 2026 monthly goal is now truly **mandatory in both dimensions**:
  1. Required vehicle **handover count**, never inflated by servicing/MOT/scrap jobs.
  2. Required **dealership revenue**, used-car handovers **plus completed customer service and referral receipts**.
  3. **Positive operating contribution after premises, payroll, aftercare and conservative output VAT**.
- An easy-feeling huge service pipeline without vehicle handovers will **not** satisfy the car-unit target. Monthly targets are set at start of the period and do not move mid-month. The 2026 Management Reports display combined revenue, services separately, and required target; rep changes affect the next month's targets.

## UK compliance research (references, not operational approval)
- [GOV.UK: approved MOT test centres are required](https://www.gov.uk/getting-an-mot/booking-an-mot).
- [GOV.UK: maximum Class 4 car MOT fee £54.85; MOT test fee not subject to VAT](https://www.gov.uk/getting-an-mot/mot-test-fees).
- [DVSA Accounts and Fees manual: MOT fees and VAT distinctions](https://www.gov.uk/guidance/mot-testing-guide/l-accounts-and-fees).
- [GOV.UK: scrapped cars only at authorised treatment facilities, Certificate of Destruction, owner payment methods](https://www.gov.uk/scrapped-and-written-off-vehicles/where-vehicles-can-be-scrapped).
- [GOV.UK: scrapping and notifying DVLA](https://www.gov.uk/scrapped-and-written-off-vehicles).

## Scope limitations and release controls
- Real third-party garages vary in actual capacity, price, availability, parts and legally enforceable consumer remedies. No real booking API or invoices connected.
- The £12/day offsite compound charge and £35 relocation are hypothetical; they must be calibrated before claiming UK pricing realism.
- A work-order visual review doesn't establish HPI, MOT history, roadworthiness, unseen defects or warranty liability.
- Service quality is deterministic simulation. Real trust depends on genuine repeat business and feedback; there is no automatic promise that every customer is satisfied.
- Some high-value auction and wholesale guides still lack verified trade sold outcomes and published fee quotes. The existing draft cannot yet be merged as a price-certified dealership game.
- A **365-day full-career agent stress run is still pending**; the new unit tests cover the workflow invariants and existing browser smoke verifies loading and regressions.

## Regression
- `node --test tests/beta-aftermarket-playtest.test.mjs` verifies real module initialization and save, free visual review, four concurrent external repairs, paid offsite ownership, customer jobs/ledger/VAT/monthly requirements, auction skip mechanics and legal referral labels.
- Existing site and Playtest beta browser smoke workflows must pass, plus UK catalogue and valuation tests.

**This iteration is draft-only; no live/main game merge or browser-published release is implied.**
