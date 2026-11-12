# Phase 8 — Operational retail realism (draft)

**Date:** 12 November 2026. **Branch:** `audit/phase-8-operational-realism-2026`, based on the unmerged Phase 7 branch. **Do not merge into production without manual validation.**

## Target
Reduce unrealistically instant retail conversion; reward evidence-led pricing and forecourt turnover without fabricating wholesale transactions, customer credit approvals or automatic profits. Show actual bank cash versus invested stock and committed liabilities.

## Evidence and calibration limits
Auto Trader's 9 November 2026 Q3/October commentary describes **29 days average retail days-to-sell in October 2026**. This is a cross-market retailer measure, not the chance an individual independent will get a buyer each game day. Source: https://plc.autotrader.co.uk/news-views/press-releases/commentary-q3-used-car-transactions-2026/

The new UK2026 lead chance starts from an **illustrative 12% per listed car per day** at the modelled achievable price, then adjusts for ask/market deviation, stock age, grade, reputation and staff. This figure is NOT directly derived from the 29-day statistic. The visitor must still be actively handled and reach a completed sale. The game does not invent customers or paid stock while the player is absent.

No-show, test-drive and collection probabilities are game balance assumptions, not verified national rates. Classic careers retain their old mechanics and balances.

An illustrative **1.5% stock-value downside per additional 30 game days after day 30**, capped at 18%, affects only the displayed sensitivity and customer demand, **not** real balance-sheet depreciation, proceeds, the historical 2026 comparable, or cash. This is deliberately a downside assumption, not a prediction for particular fuel types or models.

## Phase 8 acceptance criteria
- Lower and more price-sensitive UK2026 enquiries, deterministic across reloads, with no same-day reroll by repeated page visits.
- Show appointments can fail and purchases can fall through; paid customer deposits remain segregated.
- Changing a listed vehicle's ask does not erase the original advertising age.
- Finance separates protected cash, assumed three-month operating reserve, actual stock capital, illustrative realisation and stock-age exposures.
- The finance view must never present the indicative stock valuation as readily available cash or guaranteed sale proceeds.
- Save migrations, trading ledger, 60-month no-sale run and existing classic customer funnel must remain unchanged.
- All critical flows, UI and save restores tested before merging.

## Release blockers beyond Phase 8
- Phase 7 has **0/50 verified sold wholesale auction benchmarks** and 14 low-confidence retail comparisons. BCA/Manheim/CAP dealer evidence needed; do not invent trades.
- No authentic transaction-level VIN/invoice/contract tax records, recoverable VAT, RTI payroll or detailed consumer finance handling.
- No measured small-dealer cohort conversion data or local competitor advertising feed; probabilities need empirical calibration.
- No real credit facility, lender affordability checks, stock finance/floorplan, statutory insolvency administration or legal-compliance certification.
- Desktop/mobile real-world playthrough, real trading month/long career QA and settlement reconciliation still required.

**Status:** code and tests on a draft branch; not a claim of complete commercial, legal or market realism.
