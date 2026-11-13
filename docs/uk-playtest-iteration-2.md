# UK2026 — second owner playtest iteration (13 November 2026)

## Verified intent and scope

Changes in draft PR #216, branch `feat/uk-vehicle-variety-beta-2026`. The published live game and classic save are **not** modified. Figures, repair services and financing are **simulation assumptions**; none is a real trade, lending, supplier, MOT or legal offer.

### Auction Hall
- The UK2026 weekly auction now generates **30–36 numbered lots** on the scheduled auction day (including first day). Classic auction sizes remain unchanged.
- Full rostrum `results` validation expanded to 48, and the Skip This Week action records all passed lots (up to a safety bound of 64), without purchase or buyer fees.
- All auction results and full preview remain deterministic; the player makes or declines each individual bid. High-value BCA tariffs still require quotes and cannot be invented.

### Recruitment
- UK2026 no longer has an arbitrary one-salesperson or two-technician role ceiling or 3-person team quota. New hires still require a specific weekly applicant, £150 recruitment charge and a real modelled month of payroll reserve plus existing creditor/VAT/repair obligations. Hires become paid obligations the next day.
- The employed team already has working FIRE/RELEASE controls with recorded contractual notice liability, retained. A generous technical guard remains for corrupted or extreme save states; staff are **not** literally free or infinite. Classic-career caps remain unchanged.

### Buying Desk
- Every private-seller enquiry now offers **DECLINE THIS CAR — NO COST** before or after negotiating, using the existing seller-walk-away engine. The lead closes for the day and cannot be bought afterward. No invented payment or dealer sale is recorded.

### Debt and financed recovery
- The game bank balance remains nonnegative. A loss-making month is distinct from a true overdue bill. Existing sales and funded servicing still continue during credit difficulty.
- **First 14 continuously overdue game days:** soft recovery for eligible *premises arrears* only, provided bank, repairs and 14-day operating reserves support new purchasing. Unpaid wages, matured VAT, accepted refunds and overdue secured lending trigger immediate creditor restriction.
- **After day 14:** new stock purchases restricted while unpaid obligations persist.
- **At day 30:** critical recovery status, recurring reputation erosion for ongoing nonpayment and strict stop to *new* buying. Exits, existing sales, aftercare and funded services remain available. There is **no legally permitted 30-day insolvency grace period**; this is only a game decision framework.
- Eligible businesses can **opt into one secured fictional bridge facility** of £5k/£10k/£15k, only after 7 days distress or reputation 35, subject to conservative owned-stock collateral. Term 60 game days, assumed 3% arrangement fee, 16% annual simple interest, 22% after due, cash, liability, interest accrual, and full repayment recorded separately. No second active loan; a 180-game-day cooldown prevents cyclic borrowing. The loan is **never retail revenue or operating profit**.
- Financial Reports now distinguish facility proceeds, interest/arrangement charges and repayments from true dealership sales; new monthly `afterFinance` result deducts finance costs. Do not present this model as regulated consumer or business credit, advice, director-liability compliance or real loan approval.

### Better stock when reputation grows
- Existing UK2026 cash tiers still gate accessible value. Reputation now affects *frequency* of high-value/premium/luxury stock in that accessible tier. High-standing dealers see more premium leads, including existing Tesla candidates once cash permits. No new/unverified Tesla derivative or fabricated Tesla price added.
- Prestige stock remains uncommon with low reputation; a high score never automatically provides buying funds.

### Off-site vehicles can advertise online
- A fully prepared vehicle in paid storage can be **advertised online** without using one of the four permanent display spaces.
- Booking an off-site car for a customer viewing triggers a **£35 illustrative round-trip transfer cost** and **48-game-hour presentation delay**. Vehicle remains in storage before booked arrival and visits a distinct appointment bay, not a free fifth forecourt position. No-shows return to charged storage.
- Remote reservation/collection also requires funded delivery and a suitable collection day; held customer deposits remain segregated.
- Cars at an external repairer still cannot advertise until finishing repairs and quality control.

### Mandatory monthly reporting
- A completed 30-day month now navigates **directly to archived Management Reports**, not straight to the next-day meeting.
- All eight detailed management sections and cash/revenue/VAT/stock/finance disclosures auto-expand on a closed month. The dashboard has an always-visible month-to-date sales, revenue, operating contribution and cash strip.
- Sales-unit target and combined dealership revenue target remain distinct, increasing with reputation and forecourt capacity. Financing proceeds never meet a sales goal.

### Management meetings matter
- Five recorded 30-day priorities:
  - Retail marketing (£250): +8 points enquiry chance and +£125 sales negotiating help.
  - Buying margin (£150): +£150 sourcing-negotiation improvement.
  - Customer care (£125): improved end-customer trust and third-party job quality.
  - Aftermarket growth (£200): one extra daily independently funded customer service/referral lead.
  - Creditor recovery (£0): no sales windfall; prioritises cash preservation.
- Actual campaign costs are deducted from bank cash on selection and from that month's operating contribution; cash reserve is checked before authorising. Classic-career meeting costs remain zero.
- Prior minutes retain decision and cost, with guidance on expected effects. No fake guaranteed customer bookings or sales.

### Inbox
- Renamed the owner-focused heading to **INBOX**, simplified description, invoice label, spacing and responsive mail layout while retaining staff approvals, read/unread actions and existing messages.

## Release controls
- All public wholesale price guides remain unverified until legally usable actual sold-price evidence is available.
- The manual 30–90 game-day playtest and 365-day simulator are still important; automated unit/browser tests cover functionality but not a full-year economic forecast.
- Spec and pricing uncertainty remains in [UK public market observations](uk-public-market-evidence-2026.md) and [UK guide-price risk audit](uk-valuation-risk-audit-2026.md).
- UK source for immediate creditor duties: [Insolvency Service guidance](https://www.gov.uk/guidance/director-information-hub-director-duties-upon-insolvency); the modelled 14/30-day trigger **does not override legal duties**.

## Tests
- `tests/beta-aftermarket-playtest.test.mjs` now checks 30+ completed lot passes, multiple hires and valid saved career, decline before offer, off-site booked viewing, reputation-based prestige weighting, genuine meeting cost/service demand, rescue loan + creditor timer + no fake sales, and expanded month-end reporting.
- Existing Playwright beta isolation and `tests/beta-aftermarket-ui.mjs` test the actual mobile/desktop browser flow.
