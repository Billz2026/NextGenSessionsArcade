# UK2026 Dealer Economics: 200-car guide-price viability audit

**Review date:** 13 November 2026. **Build:** draft PR #216, beta only. **Status:** synthetic stress-test output, NOT verified UK auction sold prices, professional valuations or dealer profit forecast.

## Method and cost scope

For every base catalogue entry, load its `uk2026` retail pricing scenario and simulate a BCA Blue Standard auction offer **at the modelled guide price**, using deterministic fictional auction IDs `A-30-{index}`. The existing engine computes:

```
Likely achieved sale (game estimate)
- modelled guide / hammer
- published 2026 BCA Blue buyer fee (when available)
- simulated route delivery / collection
- estimated workshop preparation and fault allowance
- provisional UK margin-scheme output VAT on positive purchase-to-sale margin
= modelled unit trading contribution BEFORE overhead, payroll, financing,
  forecourt days-to-sell, warranty / consumer-rights exposure and corporation tax
```

**Not a completed game career** and not a real wholesale bid sample: each quotation assumes the player acquired the car at its guide, before any rival reserve, bid increment or auction-house exception. All mileage, grade, repair and likely achieved sale figures are synthetic game assumptions. Example route miles are generated in the beta and DO NOT represent actual UK delivery routes. Input VAT recovery is not modelled. Some older retail comparables are asking-price references, not achieved prices; **no wholesale figure is independently sourced**.

## Reproducible results

| Metric | Result | Implication |
|---|---:|---|
| Catalogued UK model/derivative templates | 200 | UK spec evidence classes are independent of valuations |
| New derivatives with no anchored retail asking comparator | 145 | Explicit `priceAudit.status = unverified` |
| Original derivatives with UK retail asking-price reference | 55 | No sale-price or wholesale hammer validation |
| BCA buyer-fee and delivery quote available at guide | 182 | Model can estimate costs; estimates are not dealer invoices |
| Buyer fee above published tariff threshold | 18 | Bidding/settlement requires an individual quote; **do not invent one** |
| **Expected loss buying at game guide** | **24** | At least 22 are not caught by guide >= retail, so add prominent after-fee warning |
| **Below game's targeted per-unit contribution** | **130** | Includes loss-making cars and positive-margin cars below target |
| Independently verified wholesale hammer / trade prices | **0** | Critical release gate |

The modelled 24 negative-contribution units, sorted by most negative:

| # | Vehicle | Projected unit contribution |
|---:|---|---:|
| 1 | 2022 Audi e-tron 55 quattro | -£3,846 |
| 2 | 2022 Nissan Qashqai Acenta Premium | -£2,870 |
| 3 | 2017 Nissan Qashqai Acenta | -£1,711 |
| 4 | 2021 Hyundai Ioniq 5 Premium | -£1,710 |
| 5 | 2022 Volvo XC40 Recharge | -£1,547 |
| 6 | 2022 Audi A3 Sportback 35 TFSI | -£1,498 |
| 7 | 2016 Ford Focus Zetec | -£1,317 |
| 8 | 2018 Peugeot 208 Active | -£1,124 |
| 9 | 2022 Hyundai Tucson SE Connect | -£919 |
| 10 | 2021 Audi Q5 40 TDI S line | -£743 |
| 11 | 2017 Ford Fiesta Zetec | -£645 |
| 12 | 2016 Nissan Note Acenta | -£600 |
| 13 | 2017 Nissan Juke N-Connecta | -£598 |
| 14 | 2018 Vauxhall Corsa Energy | -£537 |
| 15 | 2018 Volkswagen Golf SE | -£380 |
| 16 | 2023 Kia Sportage GT-Line HEV | -£366 |
| 17 | 2021 Honda Jazz SE e:HEV | -£326 |
| 18 | 2021 Vauxhall Corsa-e Elite Nav | -£280 |
| 19 | 2021 Vauxhall Mokka-e Launch Edition | -£260 |
| 20 | 2018 Dacia Sandero Ambiance | -£189 |
| 21 | 2018 Peugeot 2008 Allure | -£179 |
| 22 | 2016 Honda Jazz SE | -£83 |
| 23 | 2018 Toyota Aygo x-play | -£81 |
| 24 | 2021 Volkswagen Golf Life | -£49 |

A nominal trade guide less than a retail ask does **not** guarantee a profitable purchase once published buyer fees, transport, repairs, selling discount and output VAT are included. The player should retain the ability to make bad trades (realistic gameplay), but projected losses must be prominent. The auction rostrum now displays:
- **PROJECTED LOSS BEFORE OVERHEADS** if `expectedMargin < 0`, including its estimated amount and suggested buying ceiling.
- **BELOW TARGET CONTRIBUTION** when a quoted bid exceeds `maxBid` but modelled contribution is not negative.
- **PUBLISHED BUYER FEE UNAVAILABLE ABOVE £24,999** when no official applicable fee can be quoted; bidding remains gated by the original auction engine.

These warnings do **not** claim market certainty, invent a new buying tariff, automatically improve wholesale prices, or disallow deliberate bad trades.

## Four specific contradictory wholesale guides

Earlier research identified **four** modelled guide prices at or above their dated retail asking comparators: 2022 Nissan Qashqai Acenta Premium, 2022 Range Rover Velar D200 R-Dynamic **HSE**, 2022 Audi e-tron 55 quattro and 2023 Land Rover Defender 110 D250. All four remain source-quarantined from new 2026 dealer leads until actual trade evidence is collected. The modelled loss count of 24 includes only the first and third because the latter two exceed the published buyer-fee ceiling.

## 18 unquotable high-value guide offers

The model must not assume a fixed published auction fee above **£24,999**. E.g. 2022 Audi RS 3 Sportback, 2021 BMW M3 Competition, 2022 Porsche Macan 2.0 PDK, 2023 BMW X5 xDrive30d M Sport, 2023 Defender D250, 2023 Range Rover Sport P440e Dynamic SE, 2021 Taycan 4S and other premium vehicles appear as market candidates but cannot legitimately calculate a cash settlement from the limited BCA Blue Standard rate card. Obtain a contracted BCA account fee table or a directly requested individual quote and account/auction metadata before unlocking a settlement. Do **not** extrapolate the curve.

## Release gate (do not merge as UK-realistic yet)

1. **True wholesale observations:** Gather consented/licensed completed hammer outcomes for a sample of each vehicle (make, derivative, year, actual mileage, auction date, grade, reserve, VAT scheme/account fee), not dealer asking prices or computer-generated 'trade guides'. For each observation, store as-of date, source permission and confidence.
2. **Retail comparables:** Obtain at least two or three *dated* UK listings of the same model, body, trim, powertrain, year ±1, mileage band and grade. Avoid regional/condition mismatches. Asking price is not achieved sale price; infer discount only from validated data.
3. **Buying-ceiling method:** Use real wholesale costs as the *input*. Calculate maximum bid backwards from plausible achieved sale less documented auction fees, transport, prep, VAT and a conservative working-capital/aftersales buffer. Never invent low hammer values merely to produce positive profits.
4. **Reality-check lifecycle:** Run the real game through 12+ months of auction bidding, workshop, sales, complaint/refund, cash, stock ageing and bankruptcy stress across low/mid/high capital cases. Negative margins must remain possible. Report conversion assumptions and uncertainty.
5. **Vehicle photo and trim guard:** Preserve exact generation/colour matching and don't assign wrong photos to newly-added vehicles. Read manufacturers' trim specifications, not just model-family badges.

## Sources and commands

- [BCA UK Blue Standard April 2026 buyer-fee tariff](https://www.bca.co.uk/dam/UK/Buying/payment/BCA_Blue_Standard_Rate_Buyers_Fees_April_2026.pdf) — applicable published tariff ends at £24,999; >£24,999 requires a quote
- [Auto Trader valuations explanation](https://www.autotrader.co.uk/content/advice/car-valuations-how-we-calculate-values) — retail/part exchange vs trade categories; not a substitute for disclosed completed wholesale sold comps
- Game `beta/repair-prices.js`, `beta/vehicle-intel.js`, `beta/vat.js`, `beta/auction-transport.js` — scenario assumptions, **not sourced UK workshop or transport invoices**
- Reproduce independently: `node --test tests/beta-valuation-risk.test.mjs`
- Run general checks: `node --test tests/beta-uk-vehicle-catalogue.test.mjs tests/beta-valuation-risk.test.mjs`

**Game model findings are not market facts.** Keep all simulated prices flagged and the PR in draft until valuation-data provenance and game dynamics have been audited.
