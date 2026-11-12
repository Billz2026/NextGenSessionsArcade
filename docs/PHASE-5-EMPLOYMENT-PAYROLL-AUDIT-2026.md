# Phase 5 — England 2026/27 Motor-Trade Employment and Payroll Audit
**Prepared 12 November 2026 | Status: coded pilot on draft PR #205; no live deployment**

## Product objective

The Motor Trade previously paid each employee about 1/30 of their basic monthly salary **every simulated day**, reported those daily cash payments as a cost, and omitted employer National Insurance (NI), workplace pensions, income tax deductions, a real payday and paid leave. A dealer could therefore overestimate profits and liquidity. Phase 5 fixes these in the selectable **2026 Independent Dealer** career only.

**Scope warning:** This is an England-specific, permanently employed adult worker **payroll management simulation**, not certified RTI/PAYE software, a contract of employment, or professional payroll advice. Tax-code changes, cumulative PAYE, statutory sick pay variations, student loans, redundancy, personal allowance taper, benefits, attachment of earnings, 4-week payroll schemes, and individually negotiated working patterns still need review.

The original **classic** career, and pre-Phase-5 v1–v16 saved careers, retain their original wage systems. Modern v16 pilot saves do not receive fake backdated employer-NI liabilities. New v17 independent careers are marked `employmentScenario:'uk2026-payroll'` with a versioned `payroll2026` journal.

## Verified statutory and industry benchmarks

### National Living Wage
- From **1 April 2026** the 21+ National Living Wage is **£12.71/hour**, minimum basic for a 40 paid-hour week / 52 weeks = **£26,436.80/year**, about **£2,203.07/month**.
- The published **1 April 2027** 21+ rate is **£13.21/hour**. The new payroll model raises an affected employee's assumed basic salary as rates increase, rather than treating commission as a legal minimum-wage correction.
- Staff are modelled as **25+**, 40 paid hours/week and 5 nominal workdays/week. Lower age bands and proper apprenticeships would need their own eligibility rules.
Source: https://www.gov.uk/national-minimum-wage-rates

### 2026/27 employer Class 1 NI
- Standard secondary NI: **15%** of regular eligible earnings above **£417/month** for ordinary adults.
- This independent dealer assumes it qualifies for **Employment Allowance** because there is at least one paid non-director employee, a qualifying commercial activity and no connected-business conflict. Subject to eligibility, **up to £10,500/year** offsets secondary NI; unused relief is never recorded as cash income. The hiring budget does *not* rely on the relief continuing.
- Under-21, veterans, apprentices, freeport and other reliefs are *not* used or inferred from a fictional candidate's name.
Sources:
https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
https://www.gov.uk/claim-employment-allowance/eligibility
https://www.gov.uk/claim-employment-allowance

### Pension contributions
- Adults aged at least 22 with earnings at or above the auto-enrolment trigger are assumed enrolled; employer minimum **3% of qualifying earnings**, employee minimum **5% including basic-rate tax relief**.
- Published 2026/27 qualifying band **£520–£4,189 monthly**, with £10,000/year enrolment trigger. The pilot assumes a relief-at-source pension arrangement: employee contributes 4% net and 1% is topped up by the pension provider through tax relief; employer contributes 3%.
- Employee and employer pension money is sent to the scheme **on the 22nd of the next calendar month** as the simplified electronic-remittance deadline.
Sources:
https://www.gov.uk/workplace-pensions-employers/how-to-enrol-staff
https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/ongoing-duties-for-employers/earnings-thresholds

### PAYE, statutory deductions and holiday
- The payroll module approximates **2026/27 England monthly PAYE** using a £12,570 annual personal allowance, basic taxable rate 20%, higher rate 40% where applicable; employee NI 8% between £1,048 and £4,189 monthly, then 2% above. It does not simulate cumulative tax code 1257L adjustments, tax-free allowances for individuals, taxable benefits or other lawful deductions.
- Employee net salaries settle on the **last calendar day of each month**; NI/PAYE remitted by electronic payment on the **22nd next calendar month**. Real statutory PAYE tax months run **6th–5th** and statutory filing/remittance obligations depend on payroll date; this pilot uses the ordinary month-end payday pattern and simplified liability timing.
- Almost all five-day workers are entitled to **28 paid days (5.6 weeks) annually**, potentially *including* bank holidays. This pilot shows a deterministic rotation of four five-workday leave blocks plus the known England/Wales bank holiday dates for 2026–27. It is not an exact individual holiday entitlement/accrual calculator and will need booking balances, pro rata starters/leavers, carry-over and statutory payslip leave rights.
- Sick absence is modelled as infrequent, deterministic and fully paid under a stated **fictional enhanced company sick-pay policy**. This should not be confused with statutory sick pay eligibility or reimbursement.
Sources:
https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past
https://www.gov.uk/pay-paye-tax/overview
https://www.gov.uk/holiday-entitlement-rights
https://www.gov.uk/bank-holidays

### UK motor-trade salary market
A 2026 automotive-recruitment sample reports technician median advertised basic about **£38,000/year**, sales executive median basic about **£21,000/year** and median OTE about **£50,000/year**. A full-time adult minimum-wage legal floor means a £21k basic would be insufficient for a *40-hour* adult contract without qualifying other guaranteed pay; the game therefore pays above statutory floors, with sales commission extra and buyer/technician/supervisor uplifts. These vacancy figures are advertised recruitment samples, not a national wage law.
Source: https://www.perfectplacement.co.uk/cm/automotive-salary-insights

## Example: £3,000/month adult employee

| Component | Approximate model amount |
|---|---:|
| Basic gross monthly earnings | £3,000 |
| Employer Class 1 NI before relief | £387 |
| Employer workplace pension | £74 |
| **Conservative cost to employer before Employment Allowance** | **£3,461/month** |
| Eligible employer NI offset if allowance available | -£387 |
| **Modelled employer cost while fully relieved** | **£3,074/month** |
| Employee pension net deduction | £99 |
| Employee NI | £156 |
| Income tax deducted under simplified monthly PAYE | £391 |
| Estimated employee net pay | £2,354 |
| PAYE + NI transferred to HMRC when due, while fully relieved | £547 |
| Employee + employer pension transferred when due | £173 |

Figures are integer-pound approximations to protect the game's existing cash ledger format. Actual employer payroll/RTI would require **pence and tax-code-specific cumulative calculations**. The £3,461 figure is the prudent recurring hiring budget. Employment Allowance offsets NI liabilities but never creates a bank credit.

## Code changes

- **New** `employment-2026.js`: statutory rates, adult salary floor, PAYE/NI/pension model, allowance budget, calendar-date salary accrual, month-end payslip, next-month remittance, leave/sickness schedule and balance-sheet reconciliation.
- `people.js`: 2026 role salary bands, 40-hour contracts, pension eligibility assumption, 30-day all-in hiring cash buffer, monthly commission and notice accrual, instead of immediate same-day commission/termination payouts; classic path unchanged.
- `trading.js`: save schema **v17** with independent `employmentScenario` and `payroll2026` state; old v1–v16 careers are migrated without backdated wages, employer NI or pensions.
- `monthly.js`: new **accrual-based employment expense** includes salary, commission, notice and net employer NIC/pension; bank payments to employees, HMRC and pension providers are reported separately rather than double-counted as P&L expenses.
- `finance-view.js`: bank liquidity shown net of unpaid wages and PAYE/pension liabilities; current salary accrual and employer cost visible separately.
- `people-view.js`: contracted-hours/holiday rules, employer-cost warnings, monthly rather than daily payroll explanation and clear absence status; legacy view wording preserved where applicable.
- `simulator.js`: monthly pay and statutory remittance messages, warning where net pay is overdue. Separate game management months continue to be 30 days; the **employment payroll calendar** uses actual Gregorian month ends.
- `.github/workflows/site-checks.yml`: syntax checker and CI push watch added for the new module.

## Financial and save invariants

1. Daily salary is accrued as an accounting expense, without deducting bank cash until payday.
2. A partial first calendar month is pro-rated across days after the employee's actual start day; absent/training days remain paid under an assumed salaried contract.
3. PAYE and employee NI are **withheld from gross** to calculate net wages, not charged as extra employer expenses. Employer NI *after* applied allowance and employer pension are extra dealer costs.
4. Wage net pay is charged only once at month-end. HMRC and workplace pension liabilities are recorded **separately** and paid by their simplified next-month due date. If underfunded, unpaid wages and statutory amounts remain owed.
5. Held VAT cash, unpaid statutory payroll funds and existing workshop reserves reduce working liquidity. A new hire requires a **whole month's gross all-in employment budget** even when Employment Allowance might cover some NI.
6. Sales commission earned after that calendar month's payroll has already run is deferred to the **next payslip**, while the expense remains attributed to the day earned.
7. Daily payroll processing is idempotent by game day, preventing duplicate cash payments or salary accruals through an accidental repeated call.
8. Saved balances reconcile `cumulative wage/HMRC/pension amounts created − actual bank remittances = outstanding liabilities`; modified tax/pension balances or payslips fail restoration.
9. The 2026 payroll pilot never mutates a classic career's original 1/30 monthly salary cash rules.

## Automated tests and status

On the isolated branch, CI covers:
- adult minimum salary and role-based candidates for 2026,
- a £3,000 wage example and Employment Allowance exhaustion,
- one employee hired 9 Nov and salary accruing 10–30 Nov, paid **30 November**,
- no HMRC/pension remittance before **22 December**, no repeat charge thereafter,
- unsigned remittance/missing balance and altered payslip rejection,
- a late-November sale commission rolling into December's payroll rather than an already-paid cheque,
- company bank cash shortage resulting in unpaid net salary, with protected stock cash untouched,
- public holidays/leave and the published 2027 minimum-wage increase,
- contractual notice pay accrued and paid at payday rather than deducted twice,
- v1–v16 save migration preserving previous salary economics.

**Outstanding P0 employment work before merging production:** actual PAYE cumulative coding and RTI, individual worker NI/tax/age categories, pension opt-outs/deferrals, exact 28-day annual-leave entitlement and bank-holiday overlap management, sickness/SSP/correct statutory rights, salary commission during holidays, employer benefit plans, employment contract and redundancy laws, and tested company cashflow under multiple workers.

## Next commercial steps

1. VAT eligibility, input VAT, customer rejects/refunds and credit notes.
2. Remaining 30 model/trim retail valuations and real sold-wholesale price evidence.
3. 12/36/60 game-month economic stress and insolvency.
4. Actual browser/UI smoke tests, save backup, documentation and only then PR merge.

**Draft PR #205 remains unmerged; the public GitHub Pages website is not updated.**
