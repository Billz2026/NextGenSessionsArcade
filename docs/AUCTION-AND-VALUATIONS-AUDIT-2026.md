# Phase 2 — 2026 Auction Fees & Individual Vehicle Pricing Audit

**Date:** 12 November 2026 (Europe/London). **Status:** Verified tariff implementation and first five retail-comparable records in the *draft* audit branch. **NOT** a completed all-vehicle valuation or release to the live game.

## 1. Buyer fee audit — exact 2026 published tariff (scenario-specific)

BCA's **Blue Standard**, VAT-inclusive rate card was effective 30 March 2026:
https://www.bca.co.uk/dam/UK/Buying/payment/BCA_Blue_Standard_Rate_Buyers_Fees_April_2026.pdf

The repo's `auction-fees.js` stores every published hammer band from £11 through £24,999. The fee is recomputed at each proposed bid and on final settlement. This is a realistic comparison **for the named 2026 Blue Standard account**, not a universal schedule for all auctioneers or dealer account tiers. It excludes transport, storage and optional inspections. Gross buyer fees include 20% VAT; VAT input recovery is *not* automatically credited to the game.

Selected rate checks:

| Hammer | VAT-inclusive BCA fee | Total invoice before transport |
|---:|---:|---:|
| £1,950 | £596 | £2,546 |
| £2,000 | £614 | £2,614 |
| £2,450 | £636 | £3,086 |
| £3,000 | £753 | £3,753 |
| £5,000 | £828 | £5,828 |
| £7,000 | £912 | £7,912 |
| £10,000 | £1,043 | £11,043 |
| £20,000 | £1,476 | £21,476 |

At £25,000 or above, BCA requests buyers contact Customer Services. The 2026 scenario therefore **does not extrapolate a fictional fee and blocks bids above that published range** until an individual quote can be supported. Classic £12,500 careers keep their legacy fee mechanics and history.

### Verified live scenario

On game Day 1, lot 001 has a £1,950 guide; its visible guide-band fee is £596. If the player bids £2,450 and wins, the buyer fee is £636, payable bank debit is £3,086, the acquisition basis records £3,086 and the auction record and both Finance and Dashboard show £3,086. Automation verifies that tampering the rate invalidates the 2026 career save.

**Caution:** "all-in" here means **hammer + buyer fee**, *not* the eventual full landed-to-retail cost. Transport, paid inspections, refurbishment, warranty exposure, VAT on the used vehicle margin and recurring business costs are separately relevant.

## 2. Retail valuation audit — dated 2026 comparables

The original catalogue contains 50 model/derivative rows. **Five** now have explicit November 2026 retail anchor evidence; the remaining **45 are visibly marked unverified** for the 2026 scenario.

This is *not* a certified CAP HPI, Glass's or live auction valuation database. Retail adverts are **asking** prices, not actual transaction prices. Trading/auction buying guides remain model assumptions pending verified wholesale sold evidence. The engine deliberately keeps old classic catalogue figures unchanged, and marks `priceAudit.tradeGuide` as an assumption.

| Model/derivative (game mileage) | Classic asking | 2026 scenario asking | Evidence / caveat | Confidence |
|---|---:|---:|---|---|
| 2017 Ford Fiesta Zetec (104,500 mi) | £3,950 | £3,950 | 2017 year and ~101k mi year/mileage regression £3,979; trim not exact | Medium |
| 2018 Volkswagen Polo SE (98,000 mi) | £6,300 | £7,550 | 2018 year and ~102k mi regression £7,599; trim not exact | Medium |
| 2020 Vauxhall Corsa SE Premium 1.2 Turbo (103,600 mi) | £7,850 | £6,250 | High-mileage 2020 1.2 petrol SE Premium examples ~£5,500–£5,800; 100 PS turbo trim not exact | **Low** |
| 2022 MG4 SE Standard Range (57,500 mi) | £13,250 | £10,650 | 53,956 mi £10,500, 50,183 mi ~£10,900, 62,270 mi £10,495 | Medium |
| 2021 Nissan Leaf N-Connecta 40 kWh (49,300 mi) | £8,550 | £8,550 | 2021 trim median ~£9,000 at ~38k mi; higher-mileage adjustment not exact | Low |

Sources (observed 9–12 November 2026):

1. Fiesta model-year/mileage estimates: https://certmotors.com/vehicles/car/Ford/Fiesta
2. Polo model-year/mileage estimates: https://certmotors.com/vehicles/car/Volkswagen/Polo
3. Corsa 2020 trim specific cohort and individual adverts: https://www.askcar.co.uk/used-cars/vauxhall/corsa/se-premium/2020
4. MG4: https://askcar.co.uk/car/mg-mg4-2022-85693825dda8 and https://askcar.co.uk/used-cars/mg/mg4/se/2022
5. Nissan Leaf: https://www.askcar.co.uk/used-cars/nissan/leaf/n-connecta/2021
6. Context — Auto Trader October Retail Price Index, reported 9 November: https://app-autotrader-umbraco-prod.azurewebsites.net/news-views/press-releases/used-car-retail-prices-hold-steady-month-on-month-as-market-continues-to-show-resilience/

**Confidence meaning:** Medium means relevant year/mileage and broadly matching model or derivative, but not exact vehicle history/condition/location. Low means the exact trim/powertrain or mileage-specific comparison is weaker. None should be presented as a guaranteed sale, live wholesale bid or actual auction invoice.

### Unverified 45-row backlog

The rest of the catalogue retains 2026 scenario game assumptions, labelled **VALUATION REQUIRES VERIFICATION** in each buying vehicle dossier. These must be worked individually with the true derivative, powertrain, mileage, service history and comparable listings. A universal increase/decrease percentage would hide errors instead of fixing them.

### Next work package — required for full valuation audit

1. Obtain 3–5 *exact-trim* dealer retail comparables per remaining 45 variants, and confirm whether their asking prices are actually achieved after negotiation; archive reference date and outliers.
2. Obtain **sold wholesale / auction hammer** evidence (not dealer retail prices) for guide buy values; distinguish hammer, fees and landed vehicle cost. Label any inferred bid strictly as a simulation estimate.
3. Add local/regional availability, mileage, condition/history adjustments, vehicle-specific EV battery or maintenance risk, confidence bounds and data recency degradation.
4. Separate VAT-qualified, margin-scheme eligible and privately bought vehicles; output VAT and recoverable fee VAT are different accounting concepts.
5. Verify manufacturer trims and engine naming against the existing `vehicle-accuracy.js` registry; do not quote an exact variant where only parent model is corroborated.
6. Apply seasonal/ageing and stock-turnout probabilities based on empirical data; Auto Trader reports an average 29-day used-car turnover in October 2026, but that is an industry average, not a universal customer conversion probability.

## 3. Engineering safeguards built

- Published BCA fee lookup returns `null` for unsupported hammer prices rather than guessing.
- New career auction listing shows **guide-band indicative fee**; bid quote and final settlement use the **actual proposed/achieved hammer**.
- Finance, Dashboard, invoice ledger, stock acquisition basis, bid headroom and buyer-fee display use the matching hammer; classic career retains its original fee.
- The expected maximum bid is recalculated against the *stepwise fee table*, rather than subtracting one fee at guide price.
- 2026 records reject fee-history tampering when restored from a browser save.
- Retail comparables and audit status are visible in vehicle dossiers; unverified cars remain marked unverified.
- Latest CI run on the draft branch: **237 automated tests passed, 0 failed** (12 Nov 2026).

## 4. Release hold

**Do not merge the draft into public `main` yet.** The vehicle pricing audit is 5 of 50, while parts of the wider game still omit transport, employer on-costs, VAT, aftersales and complete repair pricing. Finishing the hard P0 issues and manually testing real player flows is required before the game can claim a realistic financial model.
