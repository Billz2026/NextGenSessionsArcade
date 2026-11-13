# UK used-car wholesale evidence — public observations (13 November 2026)

## Status and decision

**Research sample, not a price feed.** The UK2026 beta currently models 200 genuine UK-market candidate vehicle derivatives, but its trade guides are **still unverified as BCA or other auctioneer completed transactions**. We located a small amount of primary UK auctioneer historical sale evidence through **Brightwells**, and dated **retail dealer asking price** observations for similar, separate vehicles. These observations show the correct *way* to calibrate the game, but are insufficient to publish a full 200-car UK trade guide.

The game includes the sources in `beta/market-evidence-2026.js`. They are referenced as research and have no authority to mutate wholesale or retail assumptions. `MotorTradeObservedMarket.snapshotFor(template)` returns `not-calibrated` and `priceToApply:null` for every game vehicle. The current simulated BCA Blue tariff is **not interchangeable** with the buyer-premium schedule of Brightwells.

## Eight primary auctioneer reported sold-lot examples

Each listed price was visibly reported by the auctioneer on a completed lot page or archived completed-sale result page. **Auctioneer display is not a verified buyer-invoice breakdown**: the reported figure may be a hammer/current bid display; fee inclusion/exclusion and VAT treatment have to be confirmed before calling it all-in acquisition cost. The summary page marks each as "Sale Price"; original lot pages distinguish additional buyer premium (when visible). These are **not BCA trades**, and are not from an audited probability sample.

| Auction date | Auctioneer | Lot | Vehicle, year, miles | Reported result | Source | What prevents direct game calibration |
|---|---|---:|---|---:|---|---|
| 8 Oct 2026 | Brightwells | 11 | Toyota Aygo x-play TSS 1.0 manual, 2021, 12,716mi | £6,100 | [Lot 11](https://fd.brightwells.com/department/cars/sale/6059/lot/924094) | Closest UK beta Aygo is a 2018 example at far higher mileage; buyer premium is a different auctioneer's |
| 5 Nov 2026 | Brightwells | 62 | Ford Fiesta ST-2 1.5 manual 5dr, 2021, 34,090mi | £8,551 | [Lot 62](https://fd.brightwells.com/department/cars/sale/6065/lot/930811) | Game ST-2 is model-year 2019 with higher miles; condition/options unknown |
| 5 Nov 2026 | Brightwells | 8 | Audi A3 Sport 40 TFSI e S tronic 5dr, 2022, 74,925mi | £10,900 | [Lot 8](https://fd.brightwells.com/department/cars/sale/6065/lot/932077) | Game 2022 A3 35 TFSI is non-PHEV petrol, different derivative |
| 8 Oct 2026 | Brightwells | 6 | Ford Fiesta Zetec TDCi, 2018, 61,602mi | £4,333 | [Completed auction](https://fd.brightwells.com/department/cars/sale/6059?pageSize=100) | Game 2017 Fiesta Zetec petrol, not same fuel, year or engine |
| 8 Oct 2026 | Brightwells | 2 | Kia Ceed 2 CRDi ISG Estate, 2019, 41,157mi | £6,530 | [Completed auction](https://fd.brightwells.com/department/cars/sale/6059?pageSize=100) | Game 2021 Ceed 2 1.0 T-GDi petrol manual, not diesel estate |
| 5 Nov 2026 | Brightwells | 19 | Kia Niro 3 PHEV, 2021, 40,806mi | £10,870 | [Completed auction](https://fd.brightwells.com/department/cars/sale/6065?pageSize=All) | Game Niro 2 is earlier non-plug-in HEV; fuel/powertrain differs |
| 5 Nov 2026 | Brightwells | 72 | Peugeot 3008 Allure BlueHDi, 2021, 142,190mi (unwarranted) | £2,500 | [Completed auction](https://fd.brightwells.com/department/cars/sale/6065?pageSize=All) | Very high mileage, unwarranted, engine/gearbox unspecified; game is a 2021 130 EAT8 with ~74k |
| 5 Nov 2026 | Brightwells | 87 | Tesla Model Y Performance AWD, 2023, 71,791mi | £20,270 | [Completed auction](https://fd.brightwells.com/department/cars/sale/6065?pageSize=All) | Game 2023 Model Y is **Long Range AWD**, not Performance |

No vehicle registration, VIN, customer data or proprietary photos were copied into the dataset.

### Buyer premium is not a trade guide

Brightwells lot 11 explicitly stated **7.5% buyer premium excluding VAT, minimum £250**; lot 62 showed **7.5% excluding VAT, minimum £375**. Those terms **differ materially** from the BCA Blue Standard buyer-fee bands used by the game. The Brightwells lot shows the result figure separately from the listed premium, but a completed paid invoice was not available for review, so `priceIncludesFees:null` is deliberate. VAT status on the vehicle itself may also differ by lot. Avoid treating an auction result or invoice total as the same thing as an unadjusted hammer.

## Dated UK dealer advertisements: four examples

| Price observed | Vehicle (separate car) | Retail asking | Source |
|---|---|---:|---|
| 25 Sep 2026 | 2021 Aygo x-play 1.0 petrol manual, 5dr, 12,709mi | £9,010 | [AutoUncle retail advert](https://www.autouncle.co.uk/en-gb/d/43946816-used-2021-toyota-aygo-x-play-72-bhp) |
| 13 Nov 2026 | 2021 Fiesta ST-2 1.5 manual 5dr, 32,000mi | £14,990 | [CarGurus dealer advert](https://www.cargurus.co.uk/Cars/l-Used-2021-Ford-Fiesta-ST-2-ev673049) |
| 13 Nov 2026 | 2021 Fiesta ST-2 1.5 manual 5dr, 47,000mi | £12,895 | [TF Cars direct dealer advert](https://www.tfcarshinckley.co.uk/used-ford-fiesta-hinckley-leicestershire-8296399) |
| 11 Nov 2026 | 2022 Audi A3 Sport 40 TFSI e S tronic 5dr, 75,972mi | £14,295 | [AutoUncle retail advert](https://www.autouncle.co.uk/en-gb/d/44718974-used-2022-audi-a3-sport) |

**None is a confirmed achieved consumer sale price.** The Audi secondary advert inconsistently describes the body as sedan despite its "5dr" title; this needs further investigation before treating it as an exact body-style comparable.

## Candidate auction-to-retail snapshots — NOT profits

| Group / difference | Auction displayed | Retail advertised | Gross ASK-minus-result | Strict screening |
|---|---:|---:|---:|---|
| 2021 Aygo x-play manual 5dr; 12,716mi versus 12,709mi | £6,100 | £9,010 | £2,910 | Candidate comparable different cars, still requires fees/condition |
| 2021 Fiesta ST-2 5dr manual; 34,090mi versus 32,000mi | £8,551 | £14,990 | £6,439 | Candidate comparable different cars, still requires fees/condition |
| 2021 Fiesta ST-2 5dr manual; 34,090mi versus 47,000mi | £8,551 | £12,895 | £4,344 | Mileage gap exceeds strict matching band |
| 2022 Audi A3 Sport PHEV; 74,925mi versus 75,972mi | £10,900 | £14,295 | £3,395 | **Not an exact match:** retailer body inconsistent |

These are **arithmetic differences across two different cars and at different dates**, not real gross margin, achieved retail profit, or validated all-in acquisition costs. Different engine power, extras, transmission, colour, condition, MOT, grade, number of owners, warranty, repair work, funding cost, retail discount and auction buyer-premium tax can change the economics dramatically.

**No automatic portfolio repricing.** The game still has 145 new modelled trade+retail assumptions and 55 original retail asking comparables with modelled trade guides. Price status remains unchanged in UK2026; the separate `wholesaleAudit` explicitly says `not-calibrated` for all 200. The original 24 guide-price negative projected contributions and 18 unquoted BCA high-value fees remain as previously documented in [guide-price risk audit](uk-valuation-risk-audit-2026.md).

## Source-provenance gates for future UK price imports

A wholesale record should be eligible to inform the 2026 BCA-calibrated game only if all of the following are satisfied:

1. **Permitted data rights** for retention/derived research and gameplay distribution, including contract restrictions from BCA, CAP HPI, Auto Trader, Brightwells or partner providers. Public visibility is not automatic permission for bulk extraction or redistribution.
2. **Actual completed wholesale sold result**, excluding reserves, failed lots, bids, advertisements, self-reported estimates, and last-advert price. Keep `soldPriceKind` (hammer, buyer total, or auctioneer result), sale timestamp, auctioneer/account fee basis, premium VAT, sale condition.
3. **Derivative identity** with make, model, trim, MY/registration year, engine/fuel, transmission, body style, driven axle, and battery kWh for EV; exact model-year and variant checks. Any conflict must fail closed.
4. **Comparable age/mileage/grade**: same registration year when possible, mileage difference at most 30%/5k as a first-pass screen, and independently supported condition/grade and warranty/flags. Older evidence or varied auction fees reduce match confidence.
5. **At least three independent wholesale sold lots** within a suitable observation period and **at least three dated matching retail adverts**, with duplicate cars removed. Higher sample counts are preferable. Retail adverts alone never become "sold" observations.
6. **Separate game calibration review** of real sold lot observations and comparable asking evidence, including modelled retail discount, acquisition fees, transport, workshop and cash-flow; observed costs stay source-labeled and linked with the resulting uncertainty.
7. **Explicit approval and test suite** before a wholesale guide is changed in the beta; never overwrite live careers. Simulated stress tests must continue to allow negative-margin deals.

The existing public sample meets some early provenance requirements but **does not meet these aggregate standards for any catalogue derivative**. Its correct action today is *preserve the source links and retain unverified prices*.

## Reproduction and further market data options

- Run `node --test tests/beta-market-evidence.test.mjs`, which verifies observation provenance, close and bad matches, fee uncertainty, and unchanged prices versus a baseline without the research module.
- BCA's [trade account information](https://cmsmain.bca.co.uk/help/account) confirms their live marketplace is trade-account restricted; an eligible trade buyer may obtain actual purchase statements subject to licensing and privacy constraints.
- [Auto Trader's valuation product](https://www.autotrader.co.uk/partners/retailer/platform/autotrader-valuations) and [historical valuations](https://help.autotrader.co.uk/hc/en-gb/articles/21945683119389-Introduction-to-Historic-Valuations) distinguish trade/retail estimates but these are **model valuations, not paid auction invoices**.
- Some public auction result pages, such as Brightwells, display lot-level amounts; these are **auctioneer-specific** and do not justify BCA price curves or account-specific charges.
