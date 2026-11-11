# Phase 1 — Financial Realism Audit (11 November 2026)

**Project:** The Motor Trade by NextGen Sessions  
**Status:** Audited implementation specification; **not yet applied to the playable game**  
**Scope:** New UK independent used-car dealership career and subsequent operating economics.

## Executive finding

The current career grants £12,500 cash and four forecourt spaces, with four nominal workshop bays and just £25/day (£750/30-day game month) in premises charges. Changing cash alone would not produce realistic gameplay: the game currently omits insurance, marketing, business rates assessment, VAT, customer aftersales exposure and proper opening balance-sheet treatment. Existing unit targets are calibrated to the cheap-to-operate model.

**Proposed standard career:** £60,000 owner investment, £10,000 pre-opening outlays, £50,000 operating bank cash at Day 1, four retail spaces, no employees or dedicated internal workshop, external garage preparation, and no stock already owned.

This is a deliberate *regional UK independent* balancing scenario, not a claim that all dealers need £60,000 or that the illustrated expenses are current binding quotations. Geography/property type and business choices should eventually affect costs.

## 1. Audited current-state findings

| Area | Current source | Finding | Severity |
| --- | --- | --- | --- |
| New career liquidity | `trading.js` and `simulator.js`: `STARTING_CASH = 12500` | Too low for a premises-based four-car dealership, although viable for certain home traders | High |
| Four spaces | `premises.js`: `FORECOURT=[4,6,8,10]` | Reasonable for small independent dealer | Keep |
| Workshop | `premises.js`: `WORKSHOP=[4,6,8]` | Four nominal repair bays on Day 1 are implausible for rented four-space forecourt. Internal work does still require technicians, but the facility claim is misleading. | High |
| Overheads | `premises.js`: rent £18/day + utilities £7/day | £750/30-day period excludes many recurring categories; cannot remain after cash increase | Critical |
| Month objective | `monthly.js`: two vehicle sales at entry reputation, £600/unit gross-margin goal | At realistic monthly overheads, two sales need unusually high per-car contribution to break even | High |
| Trading contribution | `trading.js`: sale price minus cost and preparation | Does not yet include VAT on qualifying margin, consumer claims or broader overheads | High |
| VAT registration | No threshold/turnover tracker | UK 2026 £90k rolling 12-month turnover threshold; second-hand goods margin scheme registration turnover is full sale price, not only margin | Critical |
| VAT margin scheme | Not modelled | For eligible cars sold by VAT-registered trader, VAT at 20% is one-sixth of positive purchase-to-sale margin; qualifying purchase price is *not* reduced by repairs, overheads or refurbishment | Critical |
| Staff wages | `people.js`: some monthly salaries £1,500–£1,925 | Potentially below 2026 UK minimum wage for adult full-time staff; requires hours/age/contracts model in people audit | High |
| Market access | `vehicle-market.js`: unlocking based on cash and reputation | Raising Day 1 cash alone does not grant realistic stock availability; separate finance from seller relationships and stock access | Medium |
| Save consistency | `trading.js`: `balance = STARTING_CASH + sum(ledger.delta)` | Direct changes to constant break old save reconciliation unless versioned migration is implemented | Critical |

## 2. Standard independent dealership financial specification

### Initial equity and day-one statement

| Day 0 opening transaction | Cash movement | Accounting |
| --- | ---: | --- |
| Owner contributes capital | +£60,000 | Credit owner equity; not trading revenue |
| Refundable premises security deposit | -£3,000 | Asset, not expense |
| Annual motor-trade insurance premium paid upfront | -£3,000 | Prepaid insurance asset, expensed over 12 periods |
| Fixtures, signage and basic equipment | -£2,000 | Business asset (depreciation can follow later) |
| One-time legal/launch/site opening costs | -£2,000 | Pre-opening expense |
| **Day-one bank balance** | **£50,000** | Cash available to trade |

Illustrative Day 1 balance sheet: cash £50k + deposit asset £3k + insurance prepayment £3k + fixtures £2k = total assets £58k, funded by £60k owner equity less £2k accumulated pre-opening loss. No debt, no stock, no employees. No Day 1 unpaid premises bill.

**Critical:** Do not represent £60k owner contribution as sales turnover or £10k opening cash movement as normal Month 1 recurring operating expense. Do not charge a second cash payment for prepaid insurance during Months 1–12. Maintain actual cash, accrued expenses, prepayments, assets and liabilities distinctly.

### Ongoing costs, 30-day game month

| Category | Monthly assumed expense | Cash due monthly in first year |
| --- | ---: | ---: |
| Rented four-space forecourt | £1,350 | £1,350 |
| Utilities and security | £200 | £200 |
| Motor-trade insurance (annual £3,000 prepaid on Day 0) | £250 | £0 until renewal |
| Vehicle advertising/listing subscriptions | £450 | £450 |
| Website and dealer software | £100 | £100 |
| Bookkeeping and administration | £125 | £125 |
| Cleaning, waste and small property services | £75 | £75 |
| Business rates | £0 *in the designated qualifying relief scenario only* | £0 |
| **Total** | **£2,550** | **£2,300** |

Monthly figures are illustrative *balancing assumptions*. Business rates are not universally £0: set a starter premise with rateable value <= £12,000 and one qualifying property, so English small business rate relief can apply; check location/rules for any additional scenario. Do not apply England relief automatically to all of the UK.

£2,550 represents **expense**; £2,300 represents **new cash paid** because £250 insurance expense is amortisation of cash already paid Day 0. Periodic renewals must produce an actual £3,000 payment at the correct renewal date, then be amortised again.

No staff/owner salary is assumed on Day 1. Owner drawings are not trading expenses for a sole trader; director salary and employer costs are different under a limited company. Business form should be represented clearly before simulating either.

### Liquidity safeguards

Display at least:
- bank cash;
- protected outstanding workshop costs and customer obligations;
- upcoming committed auction invoices;
- rolling 30- and 90-day operating cash runway;
- stock acquisition value and preparation commitments;
- truly free working capital *after* protected obligations and prudent runway; and
- noncash asset values separately.

Recommendation: warn when purchasing drives free bank cash under **three months of routine cash overhead** (£6,900 at £2,300/month); do not silently block every purchase solely due to a soft advisory reserve. Hard-block only if immediate committed expenses/repair obligations cannot be paid; show a clear distinction between the cash-available limit and the recommended safe ceiling. Never regard a customer deposit as available working capital.

### Example four-car purchase

Four cars at £5,200 acquisition each = £20,800; fees £2,000; preparation £2,400; transport/checks £600. Total cash tied up £25,800, leaving £24,200 bank cash from £50,000. Three-month baseline cash expense reserve £6,900 leaves £17,300 before further stock buying or contingency exposure. All inputs hypothetical.

## 3. Realistic unit economics and targets

Illustrative margin-scheme **VAT-registered** retail transaction for an eligible used car:
- Retail sale £7,500.
- Eligible purchase price £5,000.
- Auction/buying fees £450 (model invoice/VAT treatment separately).
- Repairs/preparation £600.
- Margin-scheme VAT output on positive £2,500 purchase-to-sale margin = £416.67.
- Contribution before overhead and aftersales exposure = **£1,033.33**, disregarding separate recoverable input VAT for illustration.

Accounting must track buying fees and prep outside the margin scheme purchase/sale VAT basis where required. Invoice classification and VAT eligibility can vary; do not blindly treat every auction as margin-scheme eligible. An individual vehicle making a negative VAT margin generates no margin-scheme output VAT; do not offset vehicle losses against positive margins in the individual scheme.

At £2,550 monthly expenses, three sales producing £1,033 each generate ~£550 monthly contribution **before** aftersales claims, financing costs, owner remuneration and taxes on profit. Two generate approximately a £483 loss. Accordingly:
- Retire a flat beginner goal that calls two modest-margin deals financially successful.
- Show break-even units as a calculation from credible expected **post-VAT per-unit contribution and overheads**.
- Separate *volume objective* from *positive contribution* and make it possible to miss one while satisfying the other.
- Advertise uncertainty: margin is affected by model mix, buying prices, repairs, time-to-sale and claims.

The current starter catalogue contains many £2k–£4.5k guide vehicles. Increasing bank funds without revisiting access and mix can leave surplus money with only low-value stock accessible. Reputation should influence demand/trust; it should not act as a magical hard cash tier for vehicle availability.

## 4. VAT, compliance and legal realism boundaries

- VAT registration: current UK threshold is **more than £90,000 taxable turnover** over 12 months or the expected turnover condition. Second-hand goods margin-scheme registration turnover is the *full selling price*, not the margin. Registration timing and rolling history must be tracked.
- VAT margin scheme: use only for eligible vehicles; positive purchase/sale difference × 1/6 at 20% rate. Maintain stock-book record of acquisition, qualifying invoice, sale, VAT basis and VAT due. Distinguish VAT obligation from VAT cash remittance and input VAT claims.
- Business rates: English small business relief only on a qualifying property; don't grant blanket nationwide zero rates.
- Sales payment method: the current game uses "cash sale" to mean a sale without part-exchange; avoid implying physical notes. For UK high-value cash payments from 30 June 2026, HMRC guidance uses a **£10,000** high-value dealer cash threshold. A bank transfer/card sale is not the same.
- 2026 minimum wage: £12.71/hour for age 21+ (before employer NI/pension) makes some existing illustrative salaries unsuitable for an unspecified full-time adult employee. Add paid hours/age basis or reprice candidates.
- Never present game balances as statutory accounts or live market quotes.

### Primary government references
- UK used vehicle margin scheme (updated 2 Nov 2026): https://www.gov.uk/guidance/buying-and-selling-second-hand-motor-vehicles-using-the-vat-margin-scheme
- Margin/VAT calculation (2 Nov 2026): https://www.gov.uk/guidance/how-to-work-out-the-margin-and-vat-due-using-vat-margin-schemes
- VAT registration: https://www.gov.uk/register-for-vat
- HMRC turnover for second-hand goods registration: https://www.gov.uk/hmrc-internal-manuals/vat-registration-manual/vatreg02400
- Small business rate relief (England): https://www.gov.uk/business-rates-relief/small-business-rate-relief
- Minimum wage rates: https://www.gov.uk/national-minimum-wage-rates
- High-value dealer guidance (updated Oct 2026): https://www.gov.uk/hmrc-internal-manuals/anti-money-laundering-guidance-for-supervised-businesses/amlg2600

Indicative market context (not official quotation):
- Broker pricing guide: https://www.premier-insurance.co.uk/guides/motor-trade/how-much-does-motor-trade-insurance-cost-uk
- Startup cost breakdown: https://www.simplyquote.co.uk/insights/how-to-start-a-used-car-dealership-in-the-uk/

## 5. Implementation order — **do not modify main until regression tests pass**

1. **Versioned opening financial journal.** Add initial owner-equity and pre-opening transactions plus balance-sheet accounts. New careers display £50k bank and £60k contributed; old saves keep their authentic history. The current fixed `STARTING_CASH` invariant and legacy `version===1` rule must be revised with explicit migration before this is shipped.
2. **Operating cost ledger.** Separate rent, utilities, insurance accrual, advertising, software, bookkeeping, services, business rates and lease payments. Avoid duplicate expense recognition; overdue bills should remain liabilities, not disappear when no cash.
3. **Physical premises model.** Four selling spaces; no own workshop at new-career launch. External preparation is usable. Workshop construction and staff acquisition cost actual money and create incremental operating commitments. Grandfather valid legacy careers with technician headcounts.
4. **Tax and actual deal contribution.** Store gross selling price, qualifying VAT purchase price, fees, preparation, recoverable VAT, sales VAT, other obligations, and net unit contribution. The initial VAT position and threshold must be explicit. No unqualified VAT automation on every sale.
5. **Reporting and incentives.** Replace misleading 'premises' labels when the number now includes ads/admin/insurance, show cash vs expenses, and recalculate financial targets on actual realistic costs.
6. **UX and training.** Update setup screen, opening Accounts Office email, My Dealership, dashboard, finance reports and help copy to show capital contribution separately from opening cash. Don't imply four functioning workshop bays.
7. **Regression and stress testing.** Test new and old career creation, persistence, buying/settlement, internal/external prep, sale and part-exchange, arrears, annual insurance renewal, VAT threshold crossing, impossible bids and full-forecourt bankruptcy risks.

### Required acceptance criteria

- [ ] New career: owner equity £60k, bank £50k, four forecourt spaces, zero employees, no internal workshop by default.
- [ ] Opening balance sheet balances: £58k assets = £60k capital − £2k startup expense. Refundable deposit and insurance prepayment are **not** expensed immediately.
- [ ] No duplicate premium charge during first 12 operating periods; £250 of insurance expense recognised each 30-day period, renewed explicitly at annual policy boundary.
- [ ] At Day 30 with no sales/employees, routine operating expenses £2,550 and new routine cash outflows £2,300 (assuming all bills paid and no other activity). New startup expenses remain pre-opening.
- [ ] Correct business-rate relief is only used for the selected qualifying starter premises.
- [ ] No committed auction payment or customer deposit is mistaken for available liquidity.
- [ ] Positive and negative trade unit margins reconcile to monthly contribution and correctly account for eligible VAT.
- [ ] Monthly target / break-even logic is viable for four stock spaces and does not reward loss-making turnover.
- [ ] Existing v1–v14 saves are not silently rewritten, invalidated, or gifted capital. Migration is version-aware and opt-in when economics change.
- [ ] No fixed text remains promising £12,500 when the selected *new* standard career has £50,000 in bank cash.

## Release rule

**This document specifies the audit. It is not a completed game change.** Implement in a separate branch with reproducible regression tests, inspect new and legacy career behaviours, then merge only after all financial invariants and UI text are verified. This avoids disguising capital injection as profit or breaking the user's existing local save.