# Phase 6 — UK Consumer Rights, Fault Claims, Refunds and Aftersales Audit
**Reference date: 12 November 2026. Status: implemented on draft PR #205, not deployed.**  
**Applies only to newly created v18 `uk2026` independent-dealer careers.** Existing v1–v17 careers are preserved without invented historical faults or consumer liabilities.

## Why this matters

An independent used-car trader does not stop being responsible for a vehicle when it drives off the forecourt. Faults, recovery, statutory repairs, rejected vehicles, refunds and reduction-in-price agreements affect **cash**, **stock**, **gross contribution**, **VAT** and **reputation**. A £900 realised car margin can be outweighed by a £1,000 remedial repair, a customer's statutory rejection, £125–£225 vehicle recovery and ongoing payroll and rent.

This is a legal/economic GAME MODEL, **not** a legal determination or a replacement for an actual diagnostic report, customer contract, VAT credit note or litigation advice.

## Verified UK law and regulator context

### Baseline legal standard

- The **Consumer Rights Act 2015** requires consumer goods, including used vehicles bought from traders, to be of satisfactory quality, fit for purpose and as described. For used cars quality is assessed in context, including price, age, condition and mileage. Not all ordinary wear, known and properly disclosed imperfections or fresh accidental damage amount to a non-conformity.
- **Sections 19, 20 and 22:** Qualifying short-term rejection generally lasts **30 days** from the relevant handover/delivery starting point. A consumer does not have to accept an enforced repair instead. Accepting a repair can *pause* the short-term rejection clock and provides a possible seven-day minimum following an unsuccessful repair.
- **Section 23:** Outside short-term rejection, repair/replacement is ordinarily the first remedy, at the trader's cost and within a reasonable time and without significant inconvenience. The dealer cannot insist on unlimited unsuccessful repairs.
- **Section 24:** After one unsuccessful repair/replacement, disproportionate/impossible repair or unreasonable delay, a price reduction or final rejection may be available. A **reasonable deduction for use** may be allowed on a motor vehicle on final rejection, including during the first six months. There is **no automatic mandatory pence-per-mile formula**. The pilot chooses not to deduct use; this models a dealer offering more than the minimum in some cases.
- **First six months:** For qualifying faults, there is generally a rebuttable presumption that non-conformity existed on delivery. This is not a universal car warranty, nor a rule requiring the dealer to fund every consumable item.
- **Section 20(7)–(17):** Once a trader agrees the customer's right to reject, a refund is due without undue delay and at latest within **14 days**; the dealer generally bears reasonable return costs. The Act has rules about restoring the *actual* consideration, including a part-exchange car: it is not lawful for a trader unilaterally to substitute cash without an appropriate agreement.
- Customer legal rights cannot be removed simply by displaying **“no warranty”**. A commercial warranty may exist in addition to statutory rights, not instead of them.
- Rights and actions can persist **after six months** and potentially for years, depending on jurisdiction, proof, legal limitation and circumstances. The engine is not a full claim/litigation model; it auto-generates cases only during an initial 180-game-day warranty-risk window.

### References

1. CRA s20: https://www.legislation.gov.uk/ukpga/2015/15/section/20
2. CRA s22: https://www.legislation.gov.uk/ukpga/2015/15/section/22
3. CRA s23: https://www.legislation.gov.uk/ukpga/2015/15/section/23
4. CRA s24: https://www.legislation.gov.uk/ukpga/2015/15/section/24
5. The Motor Ombudsman, rights updated to 25 Oct 2026: https://www.themotorombudsman.org/knowledge/what-are-a-consumers-legal-rights-when-buying-a-car/
6. Fault in first 30 days: https://www.themotorombudsman.org/knowledge/what-happens-if-i-find-a-fault-within-30-days-of-buying-a-car/
7. HMRC used-car VAT margin: https://www.gov.uk/guidance/buying-and-selling-second-hand-motor-vehicles-using-the-vat-margin-scheme

## Phase 6 implementation

New modules: `aftersales.js`, `aftersales-view.js`. Wired into `trading.js`, `simulator.js`, `index.html`, `vat.js`, `monthly.js`, `monthly-view.js`, `finance-view.js`, CI and tests.

### 1. Aftersales case intake

- Only completed **consumer retail sales** can generate claims. No claims are generated for vehicles disposed of to trade or for cars never sold.
- New sales save a frozen original **delivered vehicle snapshot**, including condition/parts/repair history, for possible recovery and independent re-assessment.
- Each sale gets at most **one** generated post-sale claim. A deterministic grade-based probability sets a **fictional** inherent fault frequency of roughly 5%–34% depending on vehicle condition; the chance is **not an empirically calibrated UK claims rate**.
- Claims may be auto-reported 3–40 days after handover. Diagnostic category and a VAT-inclusive job card come from the existing external workshop benchmark; these represent **assumed faults in the simulation**, not diagnoses or manufacturer faults on a real vehicle.
- A customer complaint reduces dealer reputation and appears in the **Sales Office / Aftersales & Customer Remedies** panel.

### 2. Remedies and financial decisions

- On a reported case the dealer can authorise a **customer-funded £0 / dealer-funded VAT-inclusive outsourced repair**. Cash leaves the bank immediately; the repair takes four game days and may pass or fail quality control. Only **one** attempted repair is automatically offered for this complaint.
- For a qualifying early claim the user can accept a **full 30-day rejection**. For later claims, accepting a full return before the repair can be an additional **dealer goodwill settlement**, not a statutory guarantee that a refund was already due.
- If the one permitted repair fails, the dealer can accept a **full final rejection** or a **mutually agreed partial price reduction** where the customer keeps the vehicle.
- The partial refund is a **fictional agreed case price**, based on the remedial repair quote plus a modest vehicle-value adjustment. **It is not an official statutory percentage or compulsory tariff.**
- A full rejection includes the complete **retail consideration**, plus a modelled dealer-paid collection charge (**£125–£225** depending on condition). No automatically deducted mileage-use charge. The simulation presumes a part-exchange customer expressly agrees cash-equivalent substitution for their original vehicle. **This agreement is simulated, not a legally automatic replacement of the CRA obligation to return original consideration.**
- Accepted customer payments acquire a **14-day simulated deadline**. Insufficient funds do not eliminate the liability, make the bank negative, waive the customer's rights or grant an artificial loan. Overdue refunds reduce reputation and remain owed.
- While a refund/price reduction is outstanding, it is deducted from working cash and new vehicle purchasing headroom.

### 3. Recovery and stock

- On payment of a full refund, the rejected vehicle is recovered at its historical capitalised acquisition and preparation cost, **with a new unique stock ID** and a clear source reference to the original sale.
- It becomes **unassessed stock** requiring the workshop process again before retail advertising; no vehicle is magically repaired or given a safety certificate.
- If forecourt capacity is full, the returned car is recorded as an **offsite held asset** rather than overflowing a fictional four-space forecourt. It can be transferred when a space becomes free. The Finance panel shows its separate value.
- A recovered car can then be **repaired, sold again or disposed to a trade buyer**. Its return provenance survives further trade sales and reloads.
- The asset is held at historic capitalised cost until re-assessment/disposal. **A lower-of-cost-and-net-realisable-value impairment is NOT modelled**; carrying value may be overstated for a seriously defective return, and this is an outstanding accounting gap.

### 4. Profit and cash recognition

A customer-approved refund reverses the original **trade gross contribution immediately on agreement**, not only when bank cash eventually moves. Collection is also expensed when agreed. If only a partial price reduction is agreed, the car remains sold and the reduction decreases its realised contribution without creating a fake returned car.

When payment clears:
- Bank cash falls by the agreed customer amount; full rejection additionally charges collection.
- VAT output previously accrued on the eligible margin sale is reversed (full return) or recalculated on **reduced selling consideration** (partial refund) and retained as an offsetting **VAT credit balance** if tax was already remitted.
- Refund and delivery are separate ledger events; the original vehicle purchase/transport/repair bank debits are **not refunded magically**.
- The monthly management report separately records accepted refunded turnover, customer repairs, collected vehicles, price reductions, positive/negative aftersale VAT adjustment, operating contribution and actual cash movements.
- Continuing classic career sales remain unchanged. New aftersale balances are reconciled against the v18 ledger and saved history; fake refunds, VAT credits and return assets cannot be silently injected.

### Worked example

A hypothetical eligible UK used car is bought at a £5,000 hammer, later sold for £7,500 with VAT output of **£416.67** on its original £2,500 margin (not on the net profit after auction fees, delivery and repairs).

If the customer exercises a valid **full return** and the dealer accepts it:
- An **immediate £7,500 customer refund liability** is accrued, plus the assumed collection charge.
- The original sale contribution is reversed at acceptance.
- Bank cash pays the full £7,500 and collection when there is liquidity; a returned vehicle asset is recorded on recovery, not a second fresh purchase receipt.
- Previously accrued £416.67 margin-VAT output is reversed on final payment under the simplified accounting pilot. Real tax credit-note timing and correct documentation must be verified against HMRC rules.

If instead the consumer **agrees to retain the car** after failed repair with a £500 price reduction, the vehicle stays sold; profit and VAT are reduced using **£7,000 adjusted consideration**, with no returned stock.

## Validation and test coverage

CI on the draft branch has coverage for:
1. Consumer rights at Day 1, Day 31, post-30-day period and six-calendar-month threshold.
2. Full refund case with initial sale VAT, cash payout, recovery, initial workshop state, return cash ledger and historical-margin reversal.
3. Inadequate dealer cash: accepted refund persists as a liability, bank remains nonnegative, overdue reputation impacts and subsequent payment is possible.
4. One dealer-paid repair, elapsed days, real one-attempt restriction, successful or failed result.
5. Failed repair → negotiated partial refund, seller keeps car, tax/turnover reflect lower consideration.
6. Duplicate claim restrictions, VAT-credit forgery rejection and tampered stock IDs refused on reload.
7. Accepted refund costs recognised in the monthly management statement **before** the bank pays.
8. Returned vehicle subsequently sold to a trade purchaser without invalidating the original refund, VAT adjustment or stored return provenance.
9. Legacy career and v17 pilot migration without retroactive post-sale claims.

## Outstanding before a fully realistic launch

- Proper expert **evidence** on whether a fault was inherent, wear and tear, disclosed at handover or customer-caused; independent reports, customer burden and rebuttal.
- Legal pause and extension of the **30-day rejection clock while a repair/replacement is pending**, not just a simplified claim status.
- Customer replacement arrangements, proportionate repairs/impossibility standards, **price-reduction valuations** backed by real data, and settlement of disputes via ADR/court.
- Part-exchange **return of original vehicle** versus demonstrably consented alternative restitution (simulated consent is not enough for real commerce).
- Finance, credit broker, conditional-sale and hire-purchase **lender** and refund obligations.
- Optional motor-vehicle use deductions calculated from actual post-sale miles, downtime and legal criteria (pilot intentionally refunds full price).
- Insurance-backed warranty products, cover limitations, claim administrators, chargebacks and trade-specific reserve modelling.
- Real invoice/tax credit notes, input VAT recovery and exact HMRC tax-period bookkeeping.
- Post-return carrying-value impairment, offsite storage rental and reconditioning costs, transport provider quotes and long-term claims beyond 180 days.
- Non-car statutory consumer refunds (deposits and ancillary services) and legal fees.
- 12/36/60-month stress simulations with aftersale claims and liquidity failures; manual browser playthrough; release sign-off.

**Do not merge PR #205 yet. The public GitHub Pages game remains unchanged.**
