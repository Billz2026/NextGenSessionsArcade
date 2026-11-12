# Phase 7 — Full 50-Car Retail Pricing Audit & Multi-Year Cash Stress (UK, November 2026)

**Date:** 12 November 2026. **Development status:** draft PR #205 only — public production website unchanged. **Not a finished trade price database.**

## Completed retail comparison coverage

- **50/50 catalogue model-year entries now have a dated 2026 retail asking-price comparison**, with title, advertised comparison mileage, source URL and specific limitations.
- Review confidence: **13 high**, **23 medium**, **14 low**. These ratings measure match quality, **not a guaranteed accurate selling price**.
- Comparable evidence varies: exact variant/mileage in stronger cases, different trim/body, wider cohorts or distance-based approximations in weak cases. Particularly weak comparables should be improved before release.
- **0/50 verified ordinary wholesale sold-auction hammer values.** The game's `guide` values are retained as explicitly illustrative assumptions (including five prior individually chosen estimates). Actual BCA/Manheim sold trade values or CAP Live benchmarks require authenticated dealer data; the retail asking prices are *not* a substitute.
- Current source URLs and notes are stored with every `PRICING_2026` record in `vehicle-market.js`. Classic career pricing is unchanged.
- All figures here are **advertised asking prices**, not completed transactions. Vehicle conditions, history, ULEZ, MOT, battery condition, asking-price changes and sale-date negotiations are independent variables.

## Complete 50-vehicle retail pricing worksheet

| # | Model as implemented | Game mileage | Previous ask | 2026 game ask | Match confidence | Dated source / advertised comparator |
|---:|---|---:|---:|---:|---|---|
| 1 | 2016 Ford Focus Zetec | 118,300 | £4,250 | **£3,450** | medium | [Advert £3,190 / 104,000mi](https://askcar.co.uk/used-cars/ford/focus/zetec/2016) |
| 2 | 2020 Vauxhall Corsa SE Premium | 103,600 | £7,850 | **£6,250** | low | [Advert £5,800 / 101,511mi](https://www.askcar.co.uk/used-cars/vauxhall/corsa/se-premium/2020) |
| 3 | 2018 Volkswagen Polo SE | 98,000 | £6,300 | **£7,550** | medium | [Advert £7,599 / 101,539mi](https://certmotors.com/vehicles/car/Volkswagen/Polo) |
| 4 | 2019 Honda Jazz SE | 108,000 | £5,900 | **£5,900** | low | [Advert £7,995 / 73,131mi](https://www.askcar.co.uk/used-cars/honda/jazz/se/2019) |
| 5 | 2017 Ford Fiesta Zetec | 104,500 | £3,950 | **£3,950** | medium | [Advert £3,979 / 100,923mi](https://certmotors.com/vehicles/car/Ford/Fiesta) |
| 6 | 2018 Toyota Yaris Icon Hybrid | 114,300 | £7,250 | **£7,250** | low | [Advert £8,972 / 87,241mi](https://askcar.co.uk/used-cars/toyota/yaris/icon/2018) |
| 7 | 2018 Vauxhall Corsa Energy | 112,200 | £4,000 | **£4,000** | medium | [Advert £3,495 / 110,348mi](https://askcar.co.uk/used-cars/vauxhall/corsa/energy/2018) |
| 8 | 2017 Nissan Qashqai Acenta | 127,000 | £6,350 | **£4,700** | low | [Advert £4,500 / 132,000mi](https://askcar.co.uk/used-cars/nissan/qashqai/acenta/2017) |
| 9 | 2019 Kia Rio 2 | 99,600 | £6,500 | **£6,200** | medium | [Advert £6,299 / 89,805mi](https://www.pistonheads.com/buy/kia/rio/year/2019) |
| 10 | 2019 Hyundai i20 SE | 106,500 | £6,150 | **£6,150** | medium | [Advert £6,899 / 82,900mi](https://www.askcar.co.uk/used-cars/hyundai/i20/se/2019) |
| 11 | 2018 Peugeot 208 Active | 113,800 | £4,150 | **£3,350** | medium | [Advert £3,490 / 89,000mi](https://askcar.co.uk/used-cars/peugeot/208/2018) |
| 12 | 2020 Nissan Leaf Acenta | 89,600 | £7,350 | **£7,350** | low | [Advert £6,750 / 103,759mi](https://www.autouncle.co.uk/en-gb/used-cars/Nissan/Leaf/y-2020) |
| 13 | 2018 Volkswagen Golf SE | 131,100 | £7,600 | **£6,950** | low | [Advert £8,093 / 82,600mi](https://askcar.co.uk/used-cars/volkswagen/golf/se/2018) |
| 14 | 2017 Toyota Yaris Icon | 96,000 | £6,000 | **£6,400** | low | [Advert £6,395 / 92,097mi](https://www.autouncle.co.uk/en-gb/used-cars/Toyota/Yaris/y-2017) |
| 15 | 2016 Honda Jazz SE | 157,800 | £3,500 | **£3,500** | low | [Advert £5,495 / 109,000mi](https://askcar.co.uk/used-cars/honda/jazz/se/2016) |
| 16 | 2021 Vauxhall Corsa SE Premium | 57,100 | £10,350 | **£8,800** | medium | [Advert £7,695 / 66,300mi](https://askcar.co.uk/used-cars/vauxhall/corsa/se-premium/2021) |
| 17 | 2021 Peugeot 208 Allure | 51,200 | £10,850 | **£9,250** | medium | [Advert £8,790 / 51,053mi](https://askcar.co.uk/used-cars/peugeot/208/allure/2021) |
| 18 | 2021 Toyota Yaris Design Hybrid | 55,700 | £13,850 | **£12,800** | medium | [Advert £12,488 / 51,702mi](https://askcar.co.uk/used-cars/toyota/yaris/design/2021) |
| 19 | 2021 Honda Jazz SE e:HEV | 46,100 | £14,850 | **£12,500** | medium | [Advert £12,250 / 50,415mi](https://askcar.co.uk/used-cars/honda/jazz/2021) |
| 20 | 2022 Nissan Qashqai Acenta Premium | 60,200 | £16,550 | **£10,950** | high | [Advert £10,749 / 62,506mi](https://www.askcar.co.uk/used-cars/nissan/qashqai/acenta-premium/2022) |
| 21 | 2021 Kia Rio 3 MHEV | 65,000 | £10,250 | **£9,250** | medium | [Advert £9,400 / 59,083mi](https://www.pistonheads.com/buy/kia/rio/year/2021) |
| 22 | 2022 MG4 EV SE Standard Range | 57,500 | £13,250 | **£10,650** | medium | [Advert £10,500 / 53,956mi](https://askcar.co.uk/car/mg-mg4-2022-85693825dda8) |
| 23 | 2021 Vauxhall Corsa-e Elite Nav | 52,300 | £11,150 | **£9,250** | high | [Advert £8,790 / 51,128mi](https://askcar.co.uk/car/vauxhall-corsa-electric-2021-6a5901c386f9) |
| 24 | 2021 Volkswagen Golf Life | 66,600 | £14,600 | **£12,000** | high | [Advert £11,820 / 65,016mi](https://www.askcar.co.uk/used-cars/volkswagen/golf/life/2021) |
| 25 | 2022 Volkswagen Polo Life | 45,500 | £13,250 | **£12,350** | medium | [Advert £11,600 / 49,000mi](https://www.askcar.co.uk/used-cars/volkswagen/polo/life/2022) |
| 26 | 2022 Ford Puma Titanium | 47,300 | £13,950 | **£11,300** | medium | [Advert £10,560 / 47,107mi](https://askcar.co.uk/used-cars/ford/puma/titanium/2022) |
| 27 | 2022 Toyota Corolla Icon Hybrid | 52,000 | £16,950 | **£15,500** | low | [Advert £16,000 / 38,000mi](https://www.askcar.co.uk/used-cars/toyota/corolla/icon/2022) |
| 28 | 2021 Nissan Leaf N-Connecta | 49,300 | £8,550 | **£8,550** | low | [Advert £9,000 / 38,000mi](https://www.askcar.co.uk/used-cars/nissan/leaf/n-connecta/2021) |
| 29 | 2021 Peugeot e-208 Allure | 53,500 | £11,250 | **£9,950** | low | [Advert £10,200 / 46,380mi](https://www.askcar.co.uk/used-cars/peugeot/e-208/2021) |
| 30 | 2022 Hyundai Tucson SE Connect | 57,500 | £21,500 | **£16,950** | high | [Advert £16,540 / 56,542mi](https://www.askcar.co.uk/used-cars/hyundai/tucson/se-connect/2022) |
| 31 | 2022 Vauxhall Mokka-e Launch Edition | 51,000 | £13,350 | **£11,250** | low | [Advert £11,750 / 49,000mi](https://www.askcar.co.uk/car/vauxhall-mokka-electric-2022-d260fd92e754) |
| 32 | 2022 Tesla Model 3 RWD | 47,000 | £20,500 | **£19,000** | high | [Advert £18,799 / 47,775mi](https://askcar.co.uk/car/tesla-model-3-2022-f2de48627a72) |
| 33 | 2022 BMW 320d M Sport | 53,400 | £25,500 | **£24,000** | medium | [Advert £23,290 / 51,000mi](https://askcar.co.uk/car/bmw-3-series-2022-aae30f0f91c2) |
| 34 | 2022 Audi A3 Sportback 35 TFSI | 42,100 | £23,150 | **£17,600** | medium | [Advert £16,990 / 42,000mi](https://www.monarchmotorco.co.uk/used-audi-a3-redditch-worcestershire-8287189) |
| 35 | 2022 Mercedes-Benz A200 AMG Line | 39,000 | £22,350 | **£19,000** | medium | [Advert £18,995 / 39,000mi](https://askcar.co.uk/car/mercedes-benz-a-class-2022-3d2911015026) |
| 36 | 2022 Volvo XC40 Recharge | 52,000 | £23,450 | **£18,000** | high | [Advert £17,999 / 52,439mi](https://www.askcar.co.uk/car/volvo-xc40-2022-b638aba5e7f5) |
| 37 | 2023 Kia Sportage GT-Line HEV | 43,800 | £25,000 | **£20,800** | high | [Advert £20,789 / 43,716mi](https://www.askcar.co.uk/car/kia-sportage-2023-ef1fb931ced8) |
| 38 | 2021 Hyundai Ioniq 5 Premium | 59,300 | £21,350 | **£15,750** | medium | [Advert £14,900 / 63,745mi](https://askcar.co.uk/car/hyundai-ioniq-5-2021-24ed90de9a20) |
| 39 | 2023 Tesla Model Y Long Range | 39,100 | £29,500 | **£26,800** | medium | [Advert £27,888 / 36,800mi](https://askcar.co.uk/used-cars/tesla/model-y/long-range/2023) |
| 40 | 2022 BMW 330e M Sport | 51,500 | £24,150 | **£20,950** | high | [Advert £20,995 / 51,000mi](https://www.askcar.co.uk/car/bmw-3-series-2022-672ab24a7013) |
| 41 | 2021 Audi Q5 40 TDI S line | 56,700 | £27,750 | **£23,000** | high | [Advert £23,136 / 57,327mi](https://askcar.co.uk/car/audi-q5-2021-96bee4cf3a71) |
| 42 | 2022 Porsche Macan 2.0 PDK | 38,200 | £42,000 | **£39,500** | high | [Advert £37,994 / 38,664mi](https://www.askcar.co.uk/car/porsche-macan-2022-7205fb010429) |
| 43 | 2022 Range Rover Velar D200 R-Dynamic | 49,100 | £40,000 | **£26,300** | medium | [Advert £25,984 / 49,877mi](https://askcar.co.uk/car/land-rover-range-rover-velar-2022-7669ebfbddcc) |
| 44 | 2023 BMW X5 xDrive30d M Sport | 33,500 | £55,000 | **£51,500** | high | [Advert £50,998 / 33,160mi](https://www.askcar.co.uk/car/bmw-x5-2023-212040a6800e) |
| 45 | 2023 Mercedes-Benz E300e AMG Line | 31,900 | £41,750 | **£33,500** | low | [Advert £32,850 / 29,000mi](https://www.askcar.co.uk/used-cars/mercedes-benz/e-class/plug-in-hybrid/in-london) |
| 46 | 2022 Audi e-tron 55 quattro | 48,600 | £30,850 | **£21,300** | low | [Advert £22,470 / 36,700mi](https://evguide.uk/guides/used-audi-e-tron-buyers-guide) |
| 47 | 2021 Porsche Taycan 4S | 42,600 | £49,350 | **£39,000** | high | [Advert £38,941 / 40,479mi](https://askcar.co.uk/car/porsche-taycan-2021-08589fb714ba) |
| 48 | 2022 Mercedes-Benz S350d AMG Line | 42,100 | £65,000 | **£59,000** | medium | [Advert £59,990 / 47,500mi](https://www.prestigemotorwarehouse.co.uk/cars/ad/22402-mercedes-benz-s-class-s350d-amg-line-black) |
| 49 | 2023 Land Rover Defender 110 D250 | 36,200 | £62,500 | **£47,500** | medium | [Advert £47,400 / 36,568mi](https://askcar.co.uk/car/land-rover-defender-110-2023-23c5cc2cffc1) |
| 50 | 2023 Range Rover Sport P440e | 33,800 | £66,000 | **£54,000** | high | [Advert £52,510 / 34,043mi](https://www.askcar.co.uk/used-cars/land-rover/range-rover-sport/2023?page=3) |

Each row's detailed trim/condition difference and why the estimate was selected is recorded in `vehicle-market.js` `PRICING_2026[name].note`.

## Critical buying-price contradictions — 4/50

**A sourced retail asking price does not establish a wholesale hammer value.** Four cars have existing **unsourced** buying guides at or above their new retail estimates:

- **2022 Nissan Qashqai Acenta Premium:** unsourced existing indicative wholesale guide £11,950 vs reviewed retail ask £10,950. The guide **exceeds retail even before auction fees, collection, inspection, repairs, VAT and overheads**. Buyers should decline purchases at that guide until genuine sold-wholesale data supports a bid.
- **2022 Range Rover Velar D200 R-Dynamic:** unsourced existing indicative wholesale guide £29,800 vs reviewed retail ask £26,300. The guide **exceeds retail even before auction fees, collection, inspection, repairs, VAT and overheads**. Buyers should decline purchases at that guide until genuine sold-wholesale data supports a bid.
- **2022 Audi e-tron 55 quattro:** unsourced existing indicative wholesale guide £22,400 vs reviewed retail ask £21,300. The guide **exceeds retail even before auction fees, collection, inspection, repairs, VAT and overheads**. Buyers should decline purchases at that guide until genuine sold-wholesale data supports a bid.
- **2023 Land Rover Defender 110 D250:** unsourced existing indicative wholesale guide £48,600 vs reviewed retail ask £47,500. The guide **exceeds retail even before auction fees, collection, inspection, repairs, VAT and overheads**. Buyers should decline purchases at that guide until genuine sold-wholesale data supports a bid.

These records are flagged in the full vehicle dossier with **BUYING VIABILITY WARNING**; `E.quote` also identifies the negative contribution and recalculates an indicative maximum bid. The system **does not replace the figures with invented trade auction evidence**.

Even on other cars where indicative guide is below retail, the full buying model must deduct BCA 2026 hammer-specific buyer fee, simulated transport, external preparation, conditional faults, provisional margin-scheme output VAT and overhead. An apparently large retail-to-guide spread is **not** realised net profit.

## Retail research validation limitations

1. **Source quality:** URLs are contemporaneous listing/index pages; many are aggregators and can change or be taken down. Archive dated screen/text evidence or secure an export before any future data freeze.
2. **Unverified specification:** `2022 Vauxhall Mokka-e Launch Edition`, some luxury trim/package/body labels, and 2023 Range Rover/Defender subtrims lack an exact vehicle-to-advert match; confirm the manufacturer's market/grade identity before calling these equivalent products.
3. **EVs:** model battery chemistry/capacity, health test, warranty transfer, charging speed and battery-degradation costs rather than valuing merely by year and mileage.
4. **Used-car retail negotiation:** adverts do not establish the achieved sale price. No inferred auction hammer data is presented.
5. **Local/geographic price:** listed regional comparables may differ from the player's fictional forecourt location; the game currently lacks actual geography and market liquidity.
6. **Data expiry:** all estimates are anchored to **2026-11-12**, not a perpetual live valuation. Aged listings should be marked stale if reused after market or generation changes.
7. **Business-to-business sale values:** subscriptions such as CAP Live, authentic dealer BCA/Manheim sale files, or auction invoices would be required for a verifiable wholesale buying series across these exact 50 derivatives. Do **not** derive an "auction sale price" by multiplying retail by a universal factor.

## 12 / 36 / 60-month financial stress test

Code: `economics-stress.js`, shown in the 2026 Finance page under an optional disclosure, and tested against the **actual** 2026 dealer engine.

The cash-flow **sensitivity** uses the new 2026 independent's £50,000 opening bank balance, **£2,300 routine monthly new cash overheads**, and **£3,000 insurance renewals every 360 game days**. It includes full employer cost before Employment Allowance if the dealership has hired staff, plus any accepted customer refunds, repair reserves, pending VAT and PAYE/pension debts. **The game never inserts imaginary borrowing.**

| Scenario: zero staff, zero sales | After 12 months | After 36 months | After 60 months |
|---|---:|---:|---:|
| Illustrative bank cash | £22,400 | £0 | £0 |
| Cumulative unpaid funding gap | £0 | **£38,800** | **£100,000** |
| First cash shortfall month | Not yet | 21 | 21 |

**Important:** These are **cash-only economic sensitivities**, not actual historical game outcomes. A separate real-engine test also runs **1,800 daily advances / 60 game months** without sales; it verifies bank cash never becomes negative, operating bills become arrears rather than disappearing, management reports close, and the v18 save can be restored. Real day-one proration and collection timing make exact live ledger figures differ slightly from the simple 30-day sensitivity.

The Finance desk offers transparent assumptions for 1, 3 or 4 retail units per game month at **£700, £1,000 or £1,400 contribution per unit** (after assumed buying/fees/repair/transport/VAT), plus adverse annual repair/claim costs. These figures are deliberately **hypothetical**, not statistically validated margins or demand predictions. One unit "sold" in the sensitivity assumes its acquisition, prep and retail proceeds are fully settled in the same month, a material simplification: **no capital is locked in unsold inventory** in the sensitivity. Do not use these projections to forecast a real dealership's viability.

## Engineering and release gates

- 50/50 source-linked retail overlays validated; full wholesale guides remain separately identified as unsourced.
- Tests verify source confidence/mileage, classic catalogue isolation, the four guide-above-retail contradictions and maximum affordable bids.
- Real 12/36/60-month sensitivity and actual 60-month no-sale engine validation cover bank, unpaid obligations, recurring 2026 premises costs and annual policy renewals.
- CI must pass on the latest PR branch commit; main production stays unchanged.
- **Before deploying:** verify real sold wholesale observations, true supplier invoice VAT eligibility/input VAT, payroll RTI/holiday rights, consumer aftersales specifics, stock aging/actual sales conversion and multi-month stock cash lock-up, and manual browser/mobile playthrough. Stress alone does not establish realistic economic balance.

**Summary:** Retail asking-price research coverage has reached 50/50, but it is **not 50/50 independently verified trade value coverage**. Four buying guides fail the basic retail-price consistency check. Keep the release blocked until market evidence resolves those contradictions.
