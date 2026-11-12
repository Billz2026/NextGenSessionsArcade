# Phase 4 — UK 2026 VAT Accounting Pilot and Retail Audit Expansion
**As of 12 November 2026 — DRAFT implementation, not the live game**

## Realism standard and scope

This is a simulation of an **English small independent used-car dealership** with 2026/27 legal/tax assumptions. It is not HMRC-compliant VAT accounting software. No VAT registration, filing or remittance is actually performed for a real business.

**New** `uk2026` careers are **modelled as voluntarily VAT-registered from Day 1** (9 November 2026), rather than waiting for the threshold. This is a documented scenario assumption: it is not a declaration that every independent trader voluntarily registers. Existing classic careers remain untaxed under their original historic simulation. An earlier v15 2026 pilot career, if migrated, keeps its old economics with `vatRegistrationDay=0` and **no retroactive VAT**; it is flagged as a legacy pilot, not compliant taxation.

## Verified UK VAT rules

1. **Registration trigger:** taxable turnover in the rolling preceding 12 months **over £90,000**, or forecast forward-look trigger. Second-hand goods sold under a margin scheme count the **full selling prices**, not the taxable margin, for VAT registration. A business electing voluntary registration may be registered below £90k.  
   https://www.gov.uk/register-for-vat  
   https://www.gov.uk/hmrc-internal-manuals/vat-registration-manual/vatreg02400
2. **Margin-scheme eligibility is conditional:** no separate VAT on the vehicle purchase invoice, eligible used vehicle, source records, stockbook and valid supplier invoices. Imported or VAT-qualifying vehicles can be ineligible; the scenario assumes **fictional eligible domestic vehicles** for its toy stock and does not verify real invoices.  
   https://www.gov.uk/guidance/buying-and-selling-second-hand-motor-vehicles-using-the-vat-margin-scheme
3. **VAT output on individual eligible vehicle:** at 20%, output VAT on a positive **gross sale consideration minus eligible purchase price** is **one-sixth** of that margin. Losses generate zero VAT, not a negative offset against another car. Vehicle preparation/repair, transport and overhead are NOT deducted from the margin-scheme purchase basis.  
   https://www.gov.uk/guidance/how-to-work-out-the-margin-and-vat-due-using-vat-margin-schemes  
   https://www.gov.uk/guidance/recording-vat-margin-scheme-transactions
4. **Auction fee invoice distinction:** separately VAT-invoiced buyer services are not added to the vehicle's margin-scheme purchase price; treatment differs where eligible auction scheme fees form part of the purchase consideration without separately charged VAT. The game uses a documented **simulated separately VAT-invoiced BCA buyer service** assumption. The real invoice must be inspected before asserting eligibility or reclaiming input VAT.  
   https://www.gov.uk/guidance/buying-and-selling-goods-at-auction-using-the-vat-margin-scheme
5. **Part exchange:** the agreed value of a vehicle received from a customer is part of the total selling consideration of the outgoing car, and the incoming car's purchase value for subsequent margin calculation. This is reflected in the new records.  
   https://www.gov.uk/guidance/buying-and-selling-second-hand-motor-vehicles-using-the-vat-margin-scheme
6. **Registration date if the statutory threshold triggers:** full rolling turnover crossing typically requires registration within 30 days after the calendar month of crossing, with effective registration on the first day of the second following month. Forward-look rules differ. **The pilot does NOT implement dynamic threshold-triggered registration**, because new scenarios voluntarily register at opening.  
   https://www.gov.uk/register-for-vat

## Implemented accounting path

Files: `vat.js`, `trading.js`, `monthly.js`, `monthly-view.js`, `finance-view.js`, `vehicle-intel.js`, `buying-desk-view.js`, `auction-hall-view.js`, `vehicle-view.js`, `simulator.js` and tests.

- `vatPurchasePrice` on new registered 2026 stock records the **hammer, private-seller price, or part-exchange allowance**, separately from landed acquisition costs. The completed sale stores `vat.scheme`, purchase basis, full selling consideration, period and output VAT in pence.
- A £7,500 sale on a £5,000 eligible purchase basis makes £2,500 margin and **£416.67 output VAT** even where repairs/overheads make actual trading profit lower. No VAT is due if the sale is below the eligible purchase price.
- Buy-to-sell forecasts and suggested maximum bids now deduct the **provisional positive output VAT** and show it as an explicit line, instead of describing pre-VAT spreads as actual contribution.
- A separate zero-cash-delta ledger row records output VAT accrual when the vehicle changes ownership. VAT is not deducted from bank cash at handover; it remains an outstanding liability.
- `vat.js` tracks a rolling 365-day turnover figure using **full retail prices and wholesale disposal proceeds**. The finance view displays this against the £90k threshold, while noting the standard scenario is already registered voluntarily.
- The **simulated quarter-end cash remittance** assumes calendar quarter VAT periods; due date the seventh day of the second calendar month after the quarter ends (e.g. Q4 2026 -> 7 Feb 2027). VAT is computed in **pence** and the integer-pound game cash ledger pays down whole pounds; remaining pence carry forward provisionally. **Real VAT accounting periods vary** and proper return totals must include input VAT. This pilot does not call its tax schedule an HMRC-approved return.
- VAT outstanding is excluded from the displayed working-cash budget and from new vehicle buying headroom. Overdue liabilities are shown without inventing loans or a VAT refund when the business is short of cash.
- The operating statement retains pre-VAT `grossMargin` and `operatingContribution` for continuity and shows `operatingAfterVat` separately for 2026. Sales-team commissions are calculated on a VAT-adjusted unit contribution in the 2026 scenario (not on VAT monies owing).
- `VERSION=16`; classic v1–v15 saves continue their original start-capital and VAT-free model. Previous 2026 v15 draft careers are preserved without retroactive tax and are clearly designated legacy VAT-unmodelled.
- The game cash ledger never includes a made-up tax payment before an invoice/period is due, and each VAT remittance is audited against accumulated output tax.

## Not yet implemented — no claims of full compliance

| Missing | Why critical |
|---|---|
| Input VAT claims on buyer-fee invoices, eligible transport, service/parts and other overheads | The current VAT *cash liability is deliberately conservative*; final VAT return and net profit are not modelled |
| Invoice eligibility and actual stockbook, VRN/VIN, VAT invoice number, supplier VAT registration and genuine buyer status | A synthetic game vehicle profile cannot certify that a car qualifies for the scheme |
| VAT registration upon threshold crossing in a non-registered career, future 30-day expectations and late notification penalties | New 2026 scenario is always registered from opening; original classic remains intentionally simplified |
| Full VAT period configuration and legally exact cash rounding | Uses quarter calendar and pence carry in a simplified integer-pound ledger |
| Customer rejection, price refunds, repairs and VAT credit notes after handover | Output tax must be adjusted for correctly documented returns/credit notes |
| VAT treatment of warranty products, customer-specific separate charges, ex-VAT wages and external finance commissions | Specific supplies may be outside the margin scheme |
| Actual tax/payroll returns, employer NI/pension and statutory accounts | Not yet built. 'Operating contribution after output VAT' is not statutory net profit |

## Retail valuation research expanded to 20 of 50

Five further vehicles have dated 9–12 November UK advertised comparison evidence:

| Game vehicle | Mileage | Modelled 2026 retail asking | Reference | Decision |
|---|---:|---:|---|---|
| 2018 Toyota Yaris Icon Hybrid | 114,300 | £7,250 | 87,241 mi Icon hybrid £8,972 (2018); 60k+ Icon Tech hybrid median £8k is a different trim | Retain; low confidence |
| 2019 Hyundai i20 SE 1.2 | 106,500 | £6,150 | exact 1.2 SE manual 82,900 mi £6,899 | Retain; medium confidence |
| 2019 Honda Jazz SE 1.3 | 108,000 | £5,900 | exact 1.3 SE 73,131 mi £7,995; no direct 108k sample | Retain; low confidence |
| 2018 Volkswagen Golf SE 1.6 TDI | 131,100 | **£6,950** (was £7,600) | 1.6 TDI SE estate 82,600 mi £8,093; 72,884 mi hatchback £8,995; older/condition inference | Revise; low confidence |
| 2020 Nissan Leaf Acenta 40kWh | 89,600 | £7,350 | 2020 Leaf Tekna 62kWh 103,759 mi £6,750, different spec; battery SOH unknown | Retain; low confidence |

Sources:
- https://askcar.co.uk/used-cars/toyota/yaris/icon/2018
- https://www.askcar.co.uk/used-cars/hyundai/i20/se/2019
- https://www.askcar.co.uk/used-cars/honda/jazz/se/2019
- https://askcar.co.uk/used-cars/volkswagen/golf/se/2018
- https://www.autouncle.co.uk/en-gb/used-cars/Nissan/Leaf/y-2020

**30 of 50** retail profiles still have no dated reviewed asking comparables. **No claim of verified wholesale sold auction price evidence** has been made. Trade guides remain explicitly fictional assumptions; retail ask and wholesale hammer cannot be conflated.

## Regression verification

Latest isolated development-branch workflow: **246 tests passing** (12 November 2026), including:
- statutory £90k monitor on FULL retail/wholesale selling prices;
- £7,500–£5,000 = £416.67 output VAT, and nil on negative margin;
- calendar-Q4 2026 due date of 7 February 2027, no premature or duplicate cash remittance;
- full real-game acquisition, prepared vehicle, retail sale and VAT margin basis surviving save/restore;
- part-exchange sale consideration and new car's purchase-basis persistence;
- v15 draft pilot migration without unearned cash or retroactive VAT;
- 20 reviewed/30 unverified cars, default classic valuation unchanged;
- earlier hammer fee/transport and workshop/regression tests.

## Deployment gate

Keep PR #205 **draft and unmerged** until actual invoice eligibility, supplier VAT records, input VAT recovery and returns are implemented; the remaining valuation and employment/consumer-law P0 issues have explicit tests; and a real browser playthrough plus multi-year stress test passes. This code is a **VAT output model**, not a completed dealership tax system.
