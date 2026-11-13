# UK Vehicle Catalogue Expansion — Beta Review (13 November 2026)

## Scope and status

- **Beta review branch only.** No changes to the public live career or saved career schema.
- Current original template inventory: **55** vehicle derivatives.
- New UK variety additions: **145** derivatives.
- Resulting beta inventory: **200 distinct derivatives** across starter, modern, premium and luxury.
- The original tier rows are kept in the same order to preserve existing template IDs.
- **Six new derivatives** have individually sourced manufacturer documentation recorded by their exact title/fuel/gearbox/engine tuple. **The other 139 new derivatives are verification-pending** in the in-game specification register.
- **All 145 new retail and guide prices are unverified, illustrative game values.** No new purchase price is being claimed as a real BCA hammer, CAP HPI valuation or confirmed retail completion.

These are **candidate UK-market derivatives** suitable for beta playtesting; catalogue inclusion is not a guarantee of complete year/trim/engine validation. Do **not** merge as a certified 200-car dataset.

## New market coverage

New everyday additions include Toyota Aygo, Aygo X, Auris, Prius, C-HR, RAV4 and Corolla; Nissan Micra, Note, Juke, X-Trail and Qashqai e-POWER; Ford Fiesta, Focus and Kuga; Vauxhall Astra, Insignia, Mokka and Grandland X; VW Golf GTD, Tiguan, T-Cross and ID.3. Additions also cover Škoda, SEAT, Citroën, Peugeot, Renault, Dacia, Suzuki, Honda, Mazda, Hyundai, Kia, MG, Fiat, MINI, Volvo, Jaguar, Lexus, Mitsubishi, Jeep, Subaru, Land Rover, DS, Polestar, BYD and other premium brands.

Performance models include Golf GTI Performance, Golf R, Fiesta ST, Audi S3, RS 3, BMW M140i, M135i, Hyundai i30 N Performance, CUPRA Formentor, Mercedes-AMG A35/A45 S and Skoda Octavia vRS.

## Direct manufacturer evidence — exact matches

- **2018 VW Golf GTI Performance** and **2018 VW Golf R**: https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/golf-vii-pa/vw_golf_2017-present_jul_2017.pdf
- **2019 Toyota RAV4 Design AWD-i Hybrid**: https://media.toyota.co.uk/specifications-and-prices-announced-for-the-all-new-all-hybrid-toyota-rav4/
- **2021 Nissan Juke N-Connecta DIG-T 114**: https://uk.nissannews.com/en-GB/releases/new-more-efficient-engine-for-juke-as-nissan-launches-happy-holiday-playlist-to-beat-the-winter-blues
- **2022 Audi RS 3 Sportback**: https://www.audi-mediacenter.com/en/press-releases/a-feast-for-the-senses-upgrade-for-the-audi-rs-3-16140/download
- **2019 Hyundai i30 N Performance**: https://www.hyundai.news/uk/articles/press-releases/hyundai-motor-uk-announces-i30-n-pricing-and-specifications.html

Evidence status uses exact matching and must revert to pending if any specification changes. Brochures or model-family announcements do not validate generated mileage, MOT history, condition, battery health or cash prices.

## Used UK supply weighting

SMMT Q3 2026 UK used-car transaction mix is heavily petrol and diesel, with smaller hybrid/EV shares. The beta changes the source fuel selection weights for the 2026 career to rounded **56% petrol, 31% diesel, 7% hybrid, 5% electric, 1% PHEV**. These are *game sampling guides*, not promises of the exact resulting mix, because the available band/type pool may lack a matching car.

Official UK backdrop: https://www.smmt.co.uk/vehicle-data/used-car-sales/

An accurate future phase should use **model-level** transaction/parc frequency, not uniform selection among models of the same fuel. The original 55-row pricing audit remains distinct from these 145 new assumptions.

## Known realism limits / merge gate

1. Independently verify **the remaining 139 new derivative tuples**, using dated UK manufacturer brochures or reliable official used inventory. Correct or remove any combination that cannot be substantiated.
2. Collect exact UK retail comparable records **and separate actual wholesale benchmark evidence**. Do not reverse-engineer trade values simply to ensure profits.
3. Existing BCA Blue auction fees have no published rate above **£24,999**; high-value cars can appear in the catalogue but the auction cannot settle without a supported quote. Do not invent fee tariffs. Consider custom high-value account quotes before releasing prestige sourcing.
4. The original curated vehicle-photo library does not cover most new models. The beta deliberately shows **photo unavailable** for unmatched make/generation/colour, instead of reusing incorrect copyrighted photos. Unsupported generation labels are disclosed as not verified.
5. Validate 12-month simulated stock turnover, failures, repaired vehicles, insolvency/cash buffers, warranty complaints and UK fuel proportions before merging.

## Smoke tests

Run locally in the repository root:

```bash
node --test tests/beta-uk-vehicle-catalogue.test.mjs
node --test tests/site.test.mjs
```

The dedicated test ensures count/uniqueness, preserved template IDs, correct verification status, explicit price uncertainty, deterministic daily selection and photo identity honesty.
