# Phase 8B — Commercial Controls & Distressed Stock (draft, 12 November 2026)

**Branch:** `audit/phase-8b-commercial-solvency-2026` based on Phase 8 draft PR #206 (itself based on the unmerged Phase 7 PR #205). This is a **staged pilot**, not audited statutory accounts or a live production release.

## Implemented

1. **Unverified guide quarantine.** All 50 source-linked retail comparator rows remain intact. Four catalogue entries have a simulated wholesale `guide` at or above a 2026 retail asking-price reference. In new UK2026 market sessions they are **not offered for purchase** until trustworthy, derivative-matched sold-wholesale evidence or an actual dealer invoice supports the economics. No fictional lower trade hammer is generated. Classic career catalogue stays untouched. Quarantined entries:
   - 2022 Nissan Qashqai Acenta Premium
   - 2022 Range Rover Velar D200 R-Dynamic
   - 2022 Audi e-tron 55 quattro
   - 2023 Land Rover Defender 110 D250
   Supply volume may decrease in some simulation sessions. That is preferable to a commercially contradictory vendor ask.
2. **Existing-creditor protection.** New discretionary stock purchases now protect already booked vehicle repairs, outstanding VAT output, agreed consumer remedies, payroll obligations and premises arrears. Active unpaid premises/wage/VAT obligations or agreed customer refunds impose an operational **creditor hold** on *new* purchases. Completed retail sales and trade disposals continue; a binding hammered lot may still be settled if there are genuinely sufficient free funds.
3. **Core operating reserve.** New purchases preserve an explicitly **hypothetical 14-day minimum cash buffer** for routine running costs and conservative staff costs. This is *not* a statutory capital requirement or real-world recommendation. The buffer is a game control; cash and obligations are never silently adjusted.
4. **Completed-stock distressed trade outlet.** Fully repaired, QC-passed and already-advertised vehicles can be exited wholesale using a labelled **fictional immediate trade-bid sensitivity**. An active viewing, negotiation, agreement, or deposit blocks disposal until the Sales Office arrangement is resolved. No forced forfeiture of customer funds. Paid repair costs enter the realized wholesale loss. Running workshop jobs remain protected.
5. **Management visibility.** Finance and the management dashboard display creditor holds, protected cash and shortfalls. Premises expansion is also restricted while creditors are overdue. No invented credit facility or automatic sale is added.
6. **Backward compatibility.** Changes are derived from existing data; the save version stays at 18, with no new financial ledger fields. Legacy career mechanics remain unchanged.

## Legal evidence and boundaries (verified 12 Nov 2026)

- HMRC: *Buying and selling second-hand motor vehicles using the VAT margin scheme*, updated **2 November 2026**, describes vehicle eligibility, purchase/selling price rules, and mandatory VRN/VIN and vehicle records. **Source:** https://www.gov.uk/guidance/buying-and-selling-second-hand-motor-vehicles-using-the-vat-margin-scheme
- HMRC: *VAT margin schemes — keeping records* requires an item-by-item stockbook and supplier/customer purchase/sales invoices. **Source:** https://www.gov.uk/vat-margin-schemes/keeping-records
- The Insolvency Service: a company can be unable to pay debts on time or have liabilities greater than assets, yet trading is not necessarily prohibited without assessing rescue/insolvency options. **Source:** https://www.gov.uk/guidance/director-information-hub-insolvency

The Phase 8B **creditor hold is an operational gameplay mechanic, not a declaration of insolvency or a legal directive**. This simulation does not emulate director duties, statutory preferences, moratoria, CVA, HMRC enforcement or insolvency-practitioner intervention. It does not assert that a business has become legally insolvent simply because a 14-day operating buffer is breached. The game still cannot verify any specific vehicle's VAT eligibility or produce a compliant VRN/VIN/invoice stockbook or payroll RTI submissions.

## Unresolved release blockers

- **0/50 verified sold wholesale auction results**; quarantined rows have NOT been priced with fabricated replacement hammers.
- **14 low-confidence retail comparable matches**; review exact derivative, mileage, date and condition. The dated retail adverts are *asking*, not realised sale prices.
- Real vehicle VIN/VRN, supplier invoices, margin-scheme eligibility evidence, reclaimable input VAT and actual net quarterly returns; approved customer finance or regulated lender handling.
- UK payroll RTI, National Insurance/pensions exceptions, leave, tax years and exact statutory wage/time rules.
- Consumer aftersales statutory nuance, funded dispute escalation, claims/warranties and real timing.
- Auction buyer fees above published bracket maximum, dealer account terms, deposit funding, part-exchange settlement, refurbishment delays and holding finance.
- Commercial benchmarking for local independent dealer sales lead rates, actual price-to-sale clearance, true trade bids, advertising conversion and price competition.
- **Phase 8C:** test multiple complete active 12-, 36- and 60-month careers (including conservative/no-sales, good buyer, bad buyer, expanded premises, expensive staff, high claims, supplier arrears and recovery); use observed results to recalibrate rather than promise profit.
- Full browser/mobile end-to-end smoke test, actual manual user review and finance-to-ledger reconciliation before merging to `main`.

## Guardrails for review

- Never call illustrative book prices “verified trade values”.
- No payment to a supplier/refund is made by just viewing a forecast panel.
- Never present forecast unsold stock valuations as cash or paid stock disposal proceeds.
- Keep Phase 8B behind a draft PR until all tests pass and QA confirms open invoices/deposits are never trapped by spending restrictions.
