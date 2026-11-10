# The Motor Trade — Vehicle & Photography Accuracy Register

**Review date:** 10 November 2026  
**Release:** v0.9.4  
**Scope:** all 50 catalogue variants and all 16 Wikimedia photographs.

## Status summary

| Source verification | Vehicles | Meaning |
| --- | ---: | --- |
| Manufacturer-backed | 13 | Matching UK manufacturer specification, original price/equipment publication or manufacturer-approved used stock |
| Corroborated | 5 | Relevant independent vehicle catalogue, UK observed listing, or authenticated photograph; factory-level documentation outstanding |
| Pending source verification | 32 | Model variant still needs a dated, UK-relevant model-year specification source |
| **Total** | **50** | Every vehicle listed below |

**Pricing caution:** No individual game car valuation is a live market quote, no real auction reserve has been purchased, and no individual mileage, service history, condition, MOT or battery-health reading has been validated against a real car. The numbers remain fictional gameplay assumptions. `retail − guide − prep − auction fee` is a *theoretical before-overheads spread*, not a guaranteed trade margin and not a proxy for CAP HPI. Buyer competition, fees, unexpected defects, holding time, VAT and taxes change realised outcomes.

**Status rule:** Only an exact title + fuel + gearbox + powertrain match to a recorded evidence row may show a supported status. Any spec edit causes that record to return to Pending until rechecked. The full in-game report exposes status, evidence and limitations. Model years and body generations are checked by `vehicle-photos.js`; year and licence matching is separately checked for photos.

## Corrective findings

1. The 2021 Hyundai Ioniq 5 Premium used the **73 kWh** RWD battery in Hyundai's UK 2021 document; the **77.4 kWh** pack belongs to the 2023 model-year update. The catalogue was corrected.
2. Toyota replaced the outgoing **1.33-litre Yaris petrol** unit with **1.5 VVT-iE** for its 2017 facelift. The default facelift Icon car now specifies 1.5 VVT-iE.
3. MG's 2022 **MG4 EV SE Standard Range** had **51 kWh nominal**. The title now specifies Standard Range rather than incorrectly generalising across the 51 kWh and 64 kWh SE choices.
4. Petrol/diesel **48V mild hybrids** are combustion vehicles with electrical assistance, not full hybrids or plug-ins. The vehicle report retains petrol/diesel as the underlying fuel and the card explicitly displays the mild-hybrid qualifier.
5. The catalogue no longer assigns a paint colour to make an available reference photo match. The immutable fictional colour is chosen independently, and unmatched photos remain missing by design.
6. Annual prices and trim-date changes are not fully independently confirmed for 32 catalogue records; these remain visibly **Pending**, not silently certified.

## Full 50-vehicle register

| Tier | Fictional vehicle specification | Fuel | Gearbox | Powertrain | Provenance | Specification source | Simulated guide / retail |
| --- | --- | --- | --- | --- | --- | --- | --- |
| starter | 2016 Ford Focus Zetec | Diesel | Manual | 1.5 TDCi | pending | — | £1,950 / £4,250 |
| starter | 2020 Vauxhall Corsa SE Premium | Petrol | Manual | 1.2 Turbo 100 | manufacturer | [Reference](https://www.vauxhall.co.uk/content/dam/vauxhall/Home/PDFs/Cars/corsa/price-guides/New_Corsa_Spec_ePG_8_January_2020_Library-1578411749.pdf) | £4,550 / £7,850 |
| starter | 2018 Volkswagen Polo SE | Petrol | Manual | 1.0 TSI | pending | — | £3,650 / £6,300 |
| starter | 2019 Honda Jazz SE | Petrol | Manual | 1.3 i-VTEC | pending | — | £3,450 / £5,900 |
| starter | 2017 Ford Fiesta Zetec | Petrol | Manual | 1.0 EcoBoost | pending | — | £1,750 / £3,950 |
| starter | 2018 Toyota Yaris Icon Hybrid | Hybrid | Automatic | 1.5 VVT-i hybrid e-CVT | manufacturer | [Reference](https://media.toyota.co.uk/toyota-announces-new-yaris-specifications-prices/) | £4,550 / £7,250 |
| starter | 2018 Vauxhall Corsa Energy | Petrol | Manual | 1.4 16v | pending | — | £1,850 / £4,000 |
| starter | 2017 Nissan Qashqai Acenta | Diesel | Manual | 1.5 dCi | pending | — | £3,400 / £6,350 |
| starter | 2019 Kia Rio 2 | Petrol | Manual | 1.25 CVVT | pending | — | £3,750 / £6,500 |
| starter | 2019 Hyundai i20 SE | Petrol | Manual | 1.2 MPI | pending | — | £3,450 / £6,150 |
| starter | 2018 Peugeot 208 Active | Petrol | Manual | 1.2 PureTech | pending | — | £1,850 / £4,150 |
| starter | 2020 Nissan Leaf Acenta | Electric | Automatic | 40 kWh EV | pending | — | £4,300 / £7,350 |
| starter | 2018 Volkswagen Golf SE | Diesel | Manual | 1.6 TDI | pending | — | £4,400 / £7,600 |
| starter | 2017 Toyota Yaris Icon | Petrol | Manual | 1.5 VVT-iE | manufacturer | [Reference](https://media.toyota.co.uk/toyota-announces-new-yaris-specifications-prices/) | £3,600 / £6,000 |
| starter | 2016 Honda Jazz SE | Petrol | Manual | 1.3 i-VTEC | pending | — | £1,450 / £3,500 |
| modern | 2021 Vauxhall Corsa SE Premium | Petrol | Manual | 1.2 Turbo 100 | corroborated | [Reference](https://commons.wikimedia.org/wiki/File:2021_Vauxhall_Corsa_SE_Premium_Turbo_1.2.jpg) | £6,350 / £10,350 |
| modern | 2021 Peugeot 208 Allure | Petrol | Manual | 1.2 PureTech 100 | manufacturer | [Reference](https://www.media.stellantis.com/uk-en/peugeot/press/all-new-peugeot-208-and-e-208-prices-and-specifications-announced) | £6,850 / £10,850 |
| modern | 2021 Toyota Yaris Design Hybrid | Hybrid | Automatic | 1.5 VVT-i hybrid e-CVT | pending | — | £9,400 / £13,850 |
| modern | 2021 Honda Jazz SE e:HEV | Hybrid | Automatic | 1.5 i-MMD hybrid e-CVT | manufacturer | [Reference](https://hondanews.eu/gb/en/cars/media/pressreleases/201913/pricing-details-confirmed-for-all-new-honda-jazz) | £10,650 / £14,850 |
| modern | 2022 Nissan Qashqai Acenta Premium | Petrol | Manual | 1.3 DIG-T 140 MHEV | manufacturer | [Reference](https://usedcars.nissan.co.uk/en/nissan/qashqai/2022) | £11,950 / £16,550 |
| modern | 2021 Kia Rio 3 MHEV | Petrol | Manual | 1.0 T-GDi 48V MHEV iMT | manufacturer | [Reference](https://used-uk.kia.com/used-car-details/used-kia-rio-10-t-gdi-48v-3-hatchback-storm-grey-manual-petrol/id-6524095829323178025/) | £6,500 / £10,250 |
| modern | 2022 MG4 EV SE Standard Range | Electric | Automatic | 51 kWh EV | manufacturer | [Reference](https://www.mg.co.uk/media-centre/mg-motor-uk-announces-pricing-and-specifications-striking-new-mg4-ev) | £8,850 / £13,250 |
| modern | 2021 Vauxhall Corsa-e Elite Nav | Electric | Automatic | 50 kWh EV | corroborated | [Reference](https://commons.wikimedia.org/wiki/File:2021_Vauxhall_Corsa-e_Elite_NAV.jpg) | £7,050 / £11,150 |
| modern | 2021 Volkswagen Golf Life | Petrol | Manual | 1.5 TSI | pending | — | £9,800 / £14,600 |
| modern | 2022 Volkswagen Polo Life | Petrol | Manual | 1.0 TSI | pending | — | £9,350 / £13,250 |
| modern | 2022 Ford Puma Titanium | Petrol | Manual | 1.0 EcoBoost 125 MHEV | manufacturer | [Reference](https://nd-mediagallery2-public-production.s3.amazonaws.com/4c7199f0ce6ae31adef340fa45b56599/puma_customer_price_list_uk_effective_1st_july_2022_without_design_2.0_.pdf) | £9,350 / £13,950 |
| modern | 2022 Toyota Corolla Icon Hybrid | Hybrid | Automatic | 1.8 VVT-i hybrid e-CVT | pending | — | £11,800 / £16,950 |
| modern | 2021 Nissan Leaf N-Connecta | Electric | Automatic | 40 kWh EV | pending | — | £5,450 / £8,550 |
| modern | 2021 Peugeot e-208 Allure | Electric | Automatic | 50 kWh EV | manufacturer | [Reference](https://www.media.stellantis.com/uk-en/peugeot/press/all-new-peugeot-208-and-e-208-prices-and-specifications-announced) | £7,150 / £11,250 |
| modern | 2022 Hyundai Tucson SE Connect | Hybrid | Automatic | 1.6 T-GDi hybrid | corroborated | [Reference](https://askcar.co.uk/car/hyundai-tucson-2022-1e458dbdca9a) | £15,600 / £21,500 |
| modern | 2022 Vauxhall Mokka-e Launch Edition | Electric | Automatic | 50 kWh EV | pending | — | £8,850 / £13,350 |
| premium | 2022 Tesla Model 3 RWD | Electric | Automatic | Rear-wheel-drive EV | corroborated | [Reference](https://ev-database.org/uk/car/1555/Tesla-Model-3-RWD) | £14,600 / £20,500 |
| premium | 2022 BMW 320d M Sport | Diesel | Automatic | 2.0 320d | pending | — | £18,800 / £25,500 |
| premium | 2022 Audi A3 Sportback 35 TFSI | Petrol | Automatic | 1.5 TFSI S tronic | pending | — | £16,750 / £23,150 |
| premium | 2022 Mercedes-Benz A200 AMG Line | Petrol | Automatic | 1.3 A200 | pending | — | £16,400 / £22,350 |
| premium | 2022 Volvo XC40 Recharge | Electric | Automatic | 69 kWh single-motor EV | corroborated | [Reference](https://ev-database.org/uk/car/1592/Volvo-XC40-Recharge-Pure-Electric) | £17,250 / £23,450 |
| premium | 2023 Kia Sportage GT-Line HEV | Hybrid | Automatic | 1.6 T-GDi hybrid | manufacturer | [Reference](https://used-uk.kia.com/used-car-details/used-kia-sportage-16-h-t-gdi-gt-line-auto-euro-suv-green-automatic-petrol-hybrid/id-202609075800541/) | £18,750 / £25,000 |
| premium | 2021 Hyundai Ioniq 5 Premium | Electric | Automatic | 73 kWh RWD EV | manufacturer | [Reference](https://www.hyundai.news/newsroom/dam/eu/uk/20210507_ioniq_5/hyundai-uk-ioniq-5-pricing.pdf) | £15,150 / £21,350 |
| premium | 2023 Tesla Model Y Long Range | Electric | Automatic | Dual-motor EV | pending | — | £22,600 / £29,500 |
| premium | 2022 BMW 330e M Sport | Plug-in Hybrid | Automatic | 2.0 petrol PHEV | pending | — | £17,700 / £24,150 |
| premium | 2021 Audi Q5 40 TDI S line | Diesel | Automatic | 2.0 TDI quattro | pending | — | £20,750 / £27,750 |
| luxury | 2022 Porsche Macan 2.0 PDK | Petrol | Automatic | 2.0 turbo PDK | pending | — | £32,600 / £42,000 |
| luxury | 2022 Range Rover Velar D200 R-Dynamic | Diesel | Automatic | 2.0 D200 AWD | pending | — | £29,800 / £40,000 |
| luxury | 2023 BMW X5 xDrive30d M Sport | Diesel | Automatic | 3.0 xDrive30d | pending | — | £43,400 / £55,000 |
| luxury | 2023 Mercedes-Benz E300e AMG Line | Plug-in Hybrid | Automatic | 2.0 petrol PHEV | manufacturer | [Reference](https://tax.mercedes-benz.co.uk/companycar/tax/history/Mercedes-Benz/E-Class%20Saloon/73) | £31,350 / £41,750 |
| luxury | 2022 Audi e-tron 55 quattro | Electric | Automatic | 95 kWh EV | pending | — | £22,400 / £30,850 |
| luxury | 2021 Porsche Taycan 4S | Electric | Automatic | Dual-motor EV | pending | — | £37,600 / £49,350 |
| luxury | 2022 Mercedes-Benz S350d AMG Line | Diesel | Automatic | 2.9 S350d | pending | — | £50,500 / £65,000 |
| luxury | 2023 Land Rover Defender 110 D250 | Diesel | Automatic | 3.0 D250 MHEV | pending | — | £48,600 / £62,500 |
| luxury | 2023 Range Rover Sport P440e | Plug-in Hybrid | Automatic | 3.0 petrol PHEV | pending | — | £50,800 / £66,000 |

## Source-backed variant notes

- **2020 Vauxhall Corsa SE Premium (manufacturer):** Vauxhall MY2020 UK SE Premium 1.2 turbo 100PS manual. [Evidence](https://www.vauxhall.co.uk/content/dam/vauxhall/Home/PDFs/Cars/corsa/price-guides/New_Corsa_Spec_ePG_8_January_2020_Library-1578411749.pdf) (source reviewed 2026-11-10).
- **2018 Toyota Yaris Icon Hybrid (manufacturer):** 2017-20 generation UK Icon 1.5 self-charging hybrid CVT. [Evidence](https://media.toyota.co.uk/toyota-announces-new-yaris-specifications-prices/) (source reviewed 2026-11-10).
- **2017 Toyota Yaris Icon (manufacturer):** 2017 facelift Icon, 1.5 petrol manual; replaces old 1.33. [Evidence](https://media.toyota.co.uk/toyota-announces-new-yaris-specifications-prices/) (source reviewed 2026-11-10).
- **2021 Vauxhall Corsa SE Premium (corroborated):** 2021 UK photographed trim and engine; year-specific manufacturer price list pending. [Evidence](https://commons.wikimedia.org/wiki/File:2021_Vauxhall_Corsa_SE_Premium_Turbo_1.2.jpg) (source reviewed 2026-11-10).
- **2021 Peugeot 208 Allure (manufacturer):** UK P21 208 Allure PureTech 100 six-speed manual; 2019 launch series continued. [Evidence](https://www.media.stellantis.com/uk-en/peugeot/press/all-new-peugeot-208-and-e-208-prices-and-specifications-announced) (source reviewed 2026-11-10).
- **2021 Honda Jazz SE e:HEV (manufacturer):** UK fourth-generation Jazz SE 1.5 e:HEV hybrid, automatic. [Evidence](https://hondanews.eu/gb/en/cars/media/pressreleases/201913/pricing-details-confirmed-for-all-new-honda-jazz) (source reviewed 2026-11-10).
- **2022 Nissan Qashqai Acenta Premium (manufacturer):** Nissan UK used listings identify 2022 Acenta Premium 1.3 mild hybrid manual. [Evidence](https://usedcars.nissan.co.uk/en/nissan/qashqai/2022) (source reviewed 2026-11-10).
- **2021 Kia Rio 3 MHEV (manufacturer):** Kia UK certified example corroborates 2021 1.0 petrol 48V mild hybrid manual 3. [Evidence](https://used-uk.kia.com/used-car-details/used-kia-rio-10-t-gdi-48v-3-hatchback-storm-grey-manual-petrol/id-6524095829323178025/) (source reviewed 2026-11-10).
- **2022 MG4 EV SE Standard Range (manufacturer):** MG 2022 launch SE Standard Range nominal 51 kWh battery. [Evidence](https://www.mg.co.uk/media-centre/mg-motor-uk-announces-pricing-and-specifications-striking-new-mg4-ev) (source reviewed 2026-11-10).
- **2021 Vauxhall Corsa-e Elite Nav (corroborated):** 2021 UK Corsa-e Elite Nav photo documents body and trim; 50kWh early generation. [Evidence](https://commons.wikimedia.org/wiki/File:2021_Vauxhall_Corsa-e_Elite_NAV.jpg) (source reviewed 2026-11-10).
- **2022 Ford Puma Titanium (manufacturer):** Ford MY2022 Titanium UK 1.0 EcoBoost mHEV 125 PS six-speed manual. [Evidence](https://nd-mediagallery2-public-production.s3.amazonaws.com/4c7199f0ce6ae31adef340fa45b56599/puma_customer_price_list_uk_effective_1st_july_2022_without_design_2.0_.pdf) (source reviewed 2026-11-10).
- **2021 Peugeot e-208 Allure (manufacturer):** UK e-208 Allure and nominal 50 kWh battery; 2021 trim. [Evidence](https://www.media.stellantis.com/uk-en/peugeot/press/all-new-peugeot-208-and-e-208-prices-and-specifications-announced) (source reviewed 2026-11-10).
- **2022 Hyundai Tucson SE Connect (corroborated):** 2022 UK SE Connect 1.6 full hybrid automatic listing; source is secondary. [Evidence](https://askcar.co.uk/car/hyundai-tucson-2022-1e458dbdca9a) (source reviewed 2026-11-10).
- **2022 Tesla Model 3 RWD (corroborated):** 2022 UK RWD variant; expert reference, not Tesla factory build sheet. [Evidence](https://ev-database.org/uk/car/1555/Tesla-Model-3-RWD) (source reviewed 2026-11-10).
- **2022 Volvo XC40 Recharge (corroborated):** 2022 UK single motor electric variant and gross 69kWh; secondary source. [Evidence](https://ev-database.org/uk/car/1592/Volvo-XC40-Recharge-Pure-Electric) (source reviewed 2026-11-10).
- **2023 Kia Sportage GT-Line HEV (manufacturer):** Kia UK certified 2023 GT-Line 1.6 T-GDi full hybrid automatic. [Evidence](https://used-uk.kia.com/used-car-details/used-kia-sportage-16-h-t-gdi-gt-line-auto-euro-suv-green-automatic-petrol-hybrid/id-202609075800541/) (source reviewed 2026-11-10).
- **2021 Hyundai Ioniq 5 Premium (manufacturer):** Hyundai 2021 UK Premium 73 kWh RWD; 77.4 kWh arrived with MY2023. [Evidence](https://www.hyundai.news/newsroom/dam/eu/uk/20210507_ioniq_5/hyundai-uk-ioniq-5-pricing.pdf) (source reviewed 2026-11-10).
- **2023 Mercedes-Benz E300e AMG Line (manufacturer):** Mercedes UK historic E300e AMG Line petrol PHEV offered Sep 2022–Nov 2023, W213. [Evidence](https://tax.mercedes-benz.co.uk/companycar/tax/history/Mercedes-Benz/E-Class%20Saloon/73) (source reviewed 2026-11-10).

## Photographic source audit

These are **representative photographs**, not images of the fictional individual cars. Each source page was checked for file existence, author, licence and vehicle model/generation/colour information. Particular variants may differ from UK trim and equipment. Direct runtime image retrieval can still fail: the game deliberately shows a visible fallback.

| ID | File page | Model / generation | Colour | Fuel specificity | Credit | Licence |
| --- | --- | --- | --- | --- | --- | --- |
| qashqai-j11-black | [Commons source](https://commons.wikimedia.org/wiki/File:Nissan_Qashqai_Tekna_(II)_%E2%80%93_Frontansicht%2C_24._August_2014%2C_D%C3%BCsseldorf.jpg) | Nissan Qashqai / J11 | Black | Body only; derivative may differ | M 93 | [CC BY-SA 3.0 DE](https://creativecommons.org/licenses/by-sa/3.0/de/deed.en) |
| focus-mk3-black | [Commons source](https://commons.wikimedia.org/wiki/File:Ford_Focus_2.0_TDCi_Sport_C346_Panther_Black_Metallic_(2).jpg) | Ford Focus / Mk3 | Black | Body only; derivative may differ | Damian B Oh | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| fiesta-mk7-red | [Commons source](https://commons.wikimedia.org/wiki/File:2016_Ford_Fiesta_SE_Hatchback_in_Ruby_Red_Metallic_Tinted_Clearcoat%2C_Front_Right%2C_2023-07-13.jpg) | Ford Fiesta / Mk7 facelift | Red | Body only; derivative may differ | Elise240SX | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| polo-6r-white | [Commons source](https://commons.wikimedia.org/wiki/File:2017_Volkswagen_Polo_(6R_MY17)_66TSI_Trendline_5-door_hatchback_(2017-07-15)_01.jpg) | Volkswagen Polo / 6R facelift | White | Body only; derivative may differ | EurovisionNim | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| yaris-xp130-silver | [Commons source](https://commons.wikimedia.org/wiki/File:2012_Toyota_Yaris_(NCP130R)_YR_5-door_hatchback_(2012-06-04).jpg) | Toyota Yaris / XP130 | Silver | Body only; derivative may differ | OSX | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) |
| corsa-d-red | [Commons source](https://commons.wikimedia.org/wiki/File:2014_Vauxhall_Corsa_Excite_-_1229cc_1.2_(85PS)_Petrol_-_Flame_Red_-_03-2024%2C_Front.jpg) | Vauxhall Corsa / D | Red | Body only; derivative may differ | Harvey Bold | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| 208-facelift-silver | [Commons source](https://commons.wikimedia.org/wiki/File:2016_Peugeot_208_Allure_PureTech_-_1200cc_1.2_(100PS)_Petrol_-_Silver_-_07-2024%2C_Front.jpg) | Peugeot 208 / Mk1 facelift | Silver | Body only; derivative may differ | Harvey Bold | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| jazz-ge-grey | [Commons source](https://commons.wikimedia.org/wiki/File:2014_Honda_Jazz_ES_Plus_i-VTEC_-_1339cc_1.3_(100PS)_Petrol_-_Grey_-_02-2024%2C_Front.jpg) | Honda Jazz / GE | Grey | Body only; derivative may differ | Harvey Bold | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| yaris-xp210-hybrid-red | [Commons source](https://commons.wikimedia.org/wiki/File:2020_Toyota_Yaris_Design_HEV_CVT_1.5_Front.jpg) | Toyota Yaris / XP210 | Red | Hybrid | Vauxford | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| jazz-mk4-hybrid-white | [Commons source](https://commons.wikimedia.org/wiki/File:2020_Honda_Jazz_SE_i-MMD_CVT_1.5_Front.jpg) | Honda Jazz / Mk4 | White | Hybrid | Vauxford | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| qashqai-j12-white | [Commons source](https://commons.wikimedia.org/wiki/File:2021_Nissan_Qashqai_Premiere_Edition_DIG-T_-_1332cc_1.3_(140PS)_Petrol_-_Arctic_White_-_04-2024%2C_Front.jpg) | Nissan Qashqai / J12 | White | Petrol | Harvey Bold | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| corsa-f-electric-silver | [Commons source](https://commons.wikimedia.org/wiki/File:2021_Vauxhall_Corsa-e_Elite_NAV.jpg) | Vauxhall Corsa / F | Silver | Electric | Vauxford | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| peugeot-208-p21-blue | [Commons source](https://commons.wikimedia.org/wiki/File:2020_Peugeot_208_GT_Line_PureTech_1.2_Front.jpg) | Peugeot 208 / P21 | Blue | Petrol | Vauxford | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| peugeot-e208-p21-grey | [Commons source](https://commons.wikimedia.org/wiki/File:2020_Peugeot_e-208_Allure_Front.jpg) | Peugeot 208 / P21 | Grey | Electric | Vauxford | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| mg4-first-white | [Commons source](https://commons.wikimedia.org/wiki/File:MG4_EV_Automesse_Ludwigsburg_2022_1X7A5874.jpg) | MG4 EV / 1st generation | White | Electric | Alexander Migl | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| model3-white-pre-refresh | [Commons source](https://commons.wikimedia.org/wiki/File:2022-01-28_Tesla_Model_3.jpg) | Tesla Model 3 / Pre-refresh | White | Electric | Lobester00 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

## Outstanding checks / release gate

- Independently verify the **32 Pending** UK model-year/trim/powertrain combinations. Do not upgrade them to Manufacturer-backed status from generic model pages or guessed specifications.
- For corroborated entries, secure manufacturer-year documents where available; otherwise keep their lower status clearly labelled.
- Benchmark prices against correctly licensed UK trade and retail data before claiming market accuracy. The game's present figures are **illustrative** and should not be represented as CAP, Auto Trader or live auction data.
- Re-run GitHub CI and an in-browser desktop/mobile test on the actual game after any template, photograph, or save-migration edit. Remote image link health must be checked separately when new photographs are added.
- Future catalogue edits must preserve appropriate generation, UK trim, year, gearbox, fuel and powertrain. Tests must fail when a supposedly manufacturer-backed specification no longer matches its recorded evidence.

## Selected primary/reference sources

- [Hyundai 2021 UK Ioniq 5 pricing PDF](https://www.hyundai.news/newsroom/dam/eu/uk/20210507_ioniq_5/hyundai-uk-ioniq-5-pricing.pdf)
- [Hyundai 2023 MY battery enhancement](https://www.hyundai.news/uk/articles/press-releases/hyundai-ioniq-5-to-receive-product-enhancements-for-2023-model-year.html)
- [Toyota new 2017 Yaris engine and specification](https://media.toyota.co.uk/toyota-announces-new-yaris-specifications-prices/)
- [MG4 EV 2022 launch specifications](https://www.mg.co.uk/media-centre/mg-motor-uk-announces-pricing-and-specifications-striking-new-mg4-ev)
- [2022 Ford Puma UK manufacturer price list](https://nd-mediagallery2-public-production.s3.amazonaws.com/4c7199f0ce6ae31adef340fa45b56599/puma_customer_price_list_uk_effective_1st_july_2022_without_design_2.0_.pdf)
