# Phase 6 — 2026 UK Consumer Aftersales & Remedies Audit

**Date:** 12 November 2026. **Status:** implemented and regression tested on **draft PR #205**, NOT released to public `main`.

## Legal sources
- Consumer Rights Act 2015, Sections 19–24: https://www.legislation.gov.uk/ukpga/2015/15/section/20
- Short-term rejection and paused 30-day clock: https://www.legislation.gov.uk/ukpga/2015/15/section/22
- Repair/replacement within reasonable time and without significant inconvenience: https://www.legislation.gov.uk/ukpga/2015/15/section/23
- Final right to reject/price reduction and motor-vehicle use deductions: https://www.legislation.gov.uk/ukpga/2015/15/section/24
- Motor Ombudsman, checked October 2026: https://www.themotorombudsman.org/knowledge/what-are-a-consumers-legal-rights-when-buying-a-car/

### Legal decision framework
1. **Non-conforming goods, not arbitrary wear:** satisfactory quality must be assessed against age, mileage, price, disclosed condition and circumstances. The game simulates certain confirmed inherent defects; it is not a legal fact-finder.
2. **First 30 days from completed delivery:** consumer may exercise the short-term right to reject for qualifying non-conformity. Trader cannot force a repair. If repair is agreed, the statutory short-term clock can pause and post-repair minimum periods apply. The game simplifies the paused-clock rule; therefore it must not present a categorical refusal solely from a simple day count.
3. **After short-term period:** repair/replacement normally precedes the final rejection or a price reduction. A failed attempt, unreasonable delay or significant inconvenience may alter remedies.
4. **First six months:** relevant defect is generally presumed to have existed at delivery unless the dealer demonstrates otherwise. The presumption is rebuttable, not automatic legal liability for all mechanical failures.
5. **Final rejection and cars:** reasonable use deductions may be justified for motor vehicles (including during the first six months), but there is no universal mileage charge. The current pilot chooses a full refund as a **fictional goodwill decision**, not because all later returns must legally be refunded in full.
6. **Refund deadline:** a refund must be given without undue delay and no later than **14 days beginning with the day the trader agrees entitlement** (CRA 2015 s20(15)). Insufficient dealer cash does **not** extinguish the customer liability.
7. **Part-exchange consideration:** a customer normally gets back money and the actual non-monetary consideration transferred, or a validly agreed substitute. The pilot represents cash equivalence only under an explicitly simulated customer consent; real agreements must not be assumed.
8. **Warranty:** voluntary warranty cover does not eliminate statutory rights. Separate warranty-provider insurance, exclusions, claims and reimbursement models are not implemented.

## Implemented on UK2026 scenario
- New `aftersales.js` consumer-claim state machine, simulated risk by delivered vehicle profile, unique claim-per-sale safeguards, legal time bands and deterministic reporting.
- New `aftersales-view.js` Sales Office panel showing complaints, repair choices, accepted refunds, collection fees, price reductions, customer remedy explanations and overdue liabilities.
- Outsourced rectification uses a transparent job-cost benchmark; successful repairs can restore some customer trust, failed repairs lead to the simulated final remedy choice.
- Accepted returns reserve the **full sale price plus collection cost**. Payment is a real ledger debit, and the sold car is reintroduced as acquired stock for reassessment or held offsite when four spaces are occupied.
- 2026 VAT output credits from documented full refunds or price reductions are tracked separately in pence, with the outstanding VAT reduced but no invented same-day HMRC cash repayment.
- Business cash/finance, buying headroom and the monthly management report include agreed aftersales liabilities and settlement cash; overall profitability is adjusted for customer refunds and repair/collection charges.
- Customer trust/reputation is affected by defects, failed repair and overdue refund events.
- New saved format **v18** with historical v1–v17 careers preserved and no fictional backdated claims on old saves.
- Regression tests cover early/late remedies, VAT reversal, return stock capacity, part-ex reimbursement consent, cash and saved ledger reconciliation.

**Latest CI:** 263 tests passing, 0 failures on this draft branch (12 November 2026).

## Critical remaining problems
- Actual physical date and contractual evidence: customer acceptance, repair-tolling of the 30-day clock, proof of ownership and return transport.
- Real claims after six months / time limits, independent reports, rebuttal of inherent-fault presumption and later court judgments.
- HP/PCP finance-funded vehicle refunds, lender obligations and consumer credit.
- Agreement-specific return of the original part-exchange vehicle versus simulated cash equivalent.
- Warranty insurance underwriting, provider contributions, service plans, documentation, excess and reserves.
- Detailed VAT invoice credit notes, exact tax-point implications, recoverable input VAT and historical returns after refund.
- Stock restoration accounting and depreciation/valuation of a repaired or rejected returned car, actual safe-to-sell checks, MOT and rejection inspection.
- Dealer insolvency, statutory refund enforcement, 12/36/60-month simulations and manual browser/mobile play-through.

**Release hold:** the 2026 consumer rights logic is an educational simulation, not a substitute for actual legal analysis, and the full model is not yet ready to merge into production.
