# The Motor Trade

**A NextGen Sessions project** — a realistic UK used-car dealer business simulation in early development.

Public site: https://billz2026.github.io/TheMotorTrade/

## Current stage

This is a **foundation/concept build**, not a complete game. The new public homepage is a responsive dashboard concept and a working, clearly labelled **illustrative auction-to-retail deal calculator**. It includes a fictional 2016 Ford Focus Zetec, a sample Grade 3 report and editable figures for hammer price, buyer's fee, transport, preparation, asking price and customer offer.

The calculator reports landed cost, VAT on the buyer's fee, gross spread at the asking price, gross spread at the offered price, and illustrative remaining capital. The figures are **not** live market data and **not** net profit. It does not yet model HMRC VAT margin scheme calculations, warranty liabilities, MOT/repair reinspection, funding, fixed costs, tax or consumer rights. All values are local browser demo values; no data is stored.

## Core game design — long-term target

1. **Auction**: lots, inspection reports, photographic condition evidence, grades, trade valuation, guide prices, bidding strategy and auctioneer-specific fee tables; different buyer/account and VAT rules.
2. **Acquisition**: won hammer, invoice, buyer's fee, appropriate VAT treatment, transport, payment settlement, and cash-flow impact.
3. **Preparation**: repair estimates, unexpected faults, trade suppliers, stock ageing, MOT, valeting, servicing and job allocation.
4. **Retail**: live stock adverts, market competition, price reductions, enquiries, customer personalities, financing/part exchanges where modelled responsibly, test drives, negotiation and compliant handover.
5. **Business**: accounting, warranties/claims, returns and consumer law, stock holding risk, premises, employees, reputation and longer-term dealership expansion.

### First playable slice (next milestone)

One fictional vehicle, a complete purchase decision and a simulated auction bid, a generated invoice/fee breakdown, a condition/preparation decision, then a customer offer with a final cash/profit outcome. No elaborate dealership management until this single complete transaction is fun and accurate.

### Rules for realism

- Fee schedules are configurable by auctioneer, account, purchase type and VAT treatment: no universal buyer fee.
- Condition grade is an **inspection aid**, not a repair-cost guarantee; a report may miss faults.
- Separate **gross spread**, **margin before overhead**, **actual net profit**, **cash flow**, and **VAT**. They are not interchangeable.
- Distinguish retail sale price from any VAT accounting for the vehicle and services.
- Treat all current on-page prices, reports, and fees as **fictional illustrative data** until a source/fixture is clearly labelled.
- Validate the economics and edge cases with motor-trade expertise before turning the demo calculator into the game engine.

## Technical

Static GitHub Pages HTML/CSS/JavaScript with no build dependency. Launch locally using any simple static server. JavaScript entry point: `simulator.js`.

Checks: `node --check simulator.js` and `node --test tests/site.test.mjs`.

## Archive

The complete previous NextGen Sessions Arcade, including the original games archive and Looping emulator experiment, is preserved on the Git branch `archive/nextgen-arcade-before-motor-trade-2026-11-09`. Arcade source files are removed from the **new public branch** so old game pages are not inadvertently presented under the new brand.

© 2026 NextGen Sessions.
