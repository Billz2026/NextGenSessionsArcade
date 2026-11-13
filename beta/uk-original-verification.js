'use strict';
/*
 * UK source audit for the 37 original 2026-beta car templates which were
 * previously source-verification pending (13 November 2026).
 * Evidence is exact title+fuel+gearbox+engine only. 'manufacturer' is a
 * dated official UK range / brochure description, not a VIN certificate.
 * 'corroborated' includes UK registered-stock and historic derivative data.
 * Neither class verifies 2026 trade guide, achieved auction hammer, condition,
 * body/paint/options, MOT, service record, battery health, or retail sale.
 * Never promote a corroborated entry merely because a maker also sells that
 * model family; exact year, grade and powertrain combinations must match.
 */
(() => {
  const VERIFIED=Object.freeze([
  [
    "2016 Ford Focus Zetec",
    "Diesel",
    "Manual",
    "1.5 TDCi",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Ford/Focus/?q=1.5+Manual+TDCi+Zetec",
    "UK Ford Focus Zetec 1.5 TDCi manual is established in historic UK used price listings; early Mk3 facelift, but exact engine output/body style of generated car not recorded."
  ],
  [
    "2018 Volkswagen Polo SE",
    "Petrol",
    "Manual",
    "1.0 TSI",
    "manufacturer",
    "https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/polo/polo-nf/polo-nf-brochure-dec-2017.pdf",
    "Volkswagen UK December 2017 Polo AW specification lists SE 1.0 TSI 95PS five-speed manual; 2018 model-year continuation. SE 1.0 MPI is a different engine."
  ],
  [
    "2019 Honda Jazz SE",
    "Petrol",
    "Manual",
    "1.3 i-VTEC",
    "corroborated",
    "https://www.askcar.co.uk/used-cars/honda/jazz/se/2019",
    "UK 2019 registered Jazz SE 1.3 i-VTEC petrol manual appears in UK listings; 2015 Honda factory SE brochure confirms engine/transmission family, 2019 continuation not separately factory-sourced."
  ],
  [
    "2017 Ford Fiesta Zetec",
    "Petrol",
    "Manual",
    "1.0 EcoBoost",
    "corroborated",
    "https://comcar.co.uk/companycar/tax/history/Ford/Fiesta%205%20Door/17",
    "UK historical model-year 2017 Ford Fiesta Zetec 1.0 EcoBoost 100PS manual entry. Both late Mk7 and early Mk8 registered in 2017, so registration period determines generation."
  ],
  [
    "2018 Vauxhall Corsa Energy",
    "Petrol",
    "Manual",
    "1.4 16v",
    "manufacturer",
    "https://www.media.stellantis.com/uk-en/vauxhall/press/vauxhall-updates-best-selling-corsa-range",
    "Vauxhall June 2018 UK Corsa range lists Energy trim and Euro 6.2 1.4-litre petrol manual versions; not 1.4 Turbo GSi or later Corsa F."
  ],
  [
    "2017 Nissan Qashqai Acenta",
    "Diesel",
    "Manual",
    "1.5 dCi",
    "corroborated",
    "https://www.lookers.co.uk/nissan/used-car/qashqai/1-5-dci-acenta-5dr/id/205558",
    "Lookers Nissan UK lists 2017 Qashqai Acenta 1.5 dCi 110PS six-speed manual with matching exact derivative; J11 generation not later J12."
  ],
  [
    "2019 Kia Rio 2",
    "Petrol",
    "Manual",
    "1.25 CVVT",
    "corroborated",
    "https://www.lookers.co.uk/used-car/kia/rio/1-25-2-5dr/id/800030",
    "UK 2019 Kia Rio grade 2 1.25 petrol 83PS five-speed manual documented with VIN-style spec and engine code; CVVT describes variable valve timing."
  ],
  [
    "2019 Hyundai i20 SE",
    "Petrol",
    "Manual",
    "1.2 MPI",
    "manufacturer",
    "https://www.hyundai.news/newsroom/dam/uk/press-kits/20180827_i20/New_Hyundai_i20_-_Technical_data_and_dimensions.pdf",
    "Hyundai Motor UK facelift i20 specification shows SE 1.2 MPI 84PS five-speed manual, 2018-on. Not the 1.0 T-GDi turbo SE."
  ],
  [
    "2018 Peugeot 208 Active",
    "Petrol",
    "Manual",
    "1.2 PureTech",
    "corroborated",
    "https://carveya.co.uk/vehicles/chelsea-1698935",
    "UK 2018 registered 208 Active 1.2 PureTech petrol manual 89,000mi advert confirms trim/engine/gearbox; exact 82PS variant and wet-belt history still require inspection."
  ],
  [
    "2020 Nissan Leaf Acenta",
    "Electric",
    "Automatic",
    "40 kWh EV",
    "manufacturer",
    "https://uk.nissannews.com/en-GB/releases/new-my20-nissan-leaf-new-technology-new-specifications-and-lower-pricing-for-nissans-best-selling-ev",
    "Nissan UK MY2020 LEAF Acenta explicitly has nominal 40kWh battery and single-speed electric automatic; do not mix e+ 62kWh trims."
  ],
  [
    "2018 Volkswagen Golf SE",
    "Diesel",
    "Manual",
    "1.6 TDI",
    "manufacturer",
    "https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/golf-vii-pa/vw_golf_2017-present_jul_2017.pdf",
    "Volkswagen UK Mk7.5 Golf brochure gives SE 1.6 TDI 115PS diesel manual offering; body hatch assumed by game title, Estate existed separately."
  ],
  [
    "2016 Honda Jazz SE",
    "Petrol",
    "Manual",
    "1.3 i-VTEC",
    "manufacturer",
    "https://hondanews.eu/gb/en/cars/media/pressreleases/58340/honda-confirms-pricing-for-all-new-jazz",
    "Honda UK third-generation Jazz launched with SE 1.3 i-VTEC 102PS six-speed manual and CVT, supported for 2016 follow-on year; game picks manual."
  ],
  [
    "2019 Ford Focus Zetec 1.5 EcoBlue",
    "Diesel",
    "Manual",
    "1.5 EcoBlue 120",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Ford/Focus/Hatchback/Hatchback/2019/?q=1.5+Diesel+EcoBlue+Manual+Zetec",
    "UK 2019 Mk4 Focus Zetec diesel 1.5 EcoBlue 120PS manual identified by year, trim and engine; hatch/estate body must be set to price comparable."
  ],
  [
    "2021 Toyota Yaris Design Hybrid",
    "Hybrid",
    "Automatic",
    "1.5 VVT-i hybrid e-CVT",
    "manufacturer",
    "https://media.toyota.co.uk/wp-content/uploads/sites/5/pdf/211222-Yaris.pdf",
    "Toyota UK 2021.5 Yaris grade/engine list has Design 1.5 VVT-i petrol hybrid 116 DIN hp automatic; e-CVT is the hybrid drive, not a conventional automatic."
  ],
  [
    "2021 Volkswagen Golf Life",
    "Petrol",
    "Manual",
    "1.5 TSI",
    "corroborated",
    "https://00738.usedcars.volkswagen.co.uk/en/vehicle_search/volkswagen/all-models?MANUFACTURER_LST=VOLKSWAGEN",
    "VW UK approved dealer listing shows 2021-registered Golf Mk8 Life 1.5 TSI 130PS six-speed manual; genuine Life trim, distinct from R-Line or GTI."
  ],
  [
    "2022 Volkswagen Polo Life",
    "Petrol",
    "Manual",
    "1.0 TSI",
    "corroborated",
    "https://00738.usedcars.volkswagen.co.uk/en/vehicle_search/volkswagen/all-models?MANUFACTURER_LST=VOLKSWAGEN",
    "Volkswagen Approved Used lists 2022 Polo Life 1.0 TSI 95PS manual; not 1.0 MPI 80PS Life. Grade and engine separately documented."
  ],
  [
    "2022 Toyota Corolla Icon Hybrid",
    "Hybrid",
    "Automatic",
    "1.8 VVT-i hybrid e-CVT",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Toyota/Corolla/Hatchback/2022/?q=1.8+72+reg+Hybrid+Icon+VVTi",
    "UK 2022 Corolla Icon 1.8 VVT-i Hybrid e-CVT hatch explicitly listed. Other Corolla Touring Sports share the same badge, so in-game body style needs later schema."
  ],
  [
    "2021 Nissan Leaf N-Connecta",
    "Electric",
    "Automatic",
    "40 kWh EV",
    "manufacturer",
    "https://uk.nissannews.com/en-GB/releases/price-reduction-for-nissan-leaf-40kwh-and-62kwh-unlocks-full-nissan-ev-range-for-revised-plug-in-car-grant",
    "Nissan UK March 2021 LEAF N-Connecta specifically offers 40kWh battery; e+ N-Connecta 62kWh is separate derivative."
  ],
  [
    "2021 Vauxhall Mokka-e Launch Edition",
    "Electric",
    "Automatic",
    "50 kWh EV",
    "manufacturer",
    "https://www.media.stellantis.com/uk-en/vauxhall/press/vauxhall-confirms-prices-and-specs-for-all-new-mokka-and-mokka-e-as-order-books-open",
    "Vauxhall UK 2020 model announcement lists 2021-delivery Mokka-e Launch Edition 50kWh electric automatic; first registered 2021 UK listing supports corrected year."
  ],
  [
    "2024 Toyota Yaris Icon Hybrid",
    "Hybrid",
    "Automatic",
    "1.5 VVT-i hybrid e-CVT",
    "manufacturer",
    "https://media.toyota.co.uk/the-new-toyota-yaris-4/",
    "Toyota UK 2024 facelift Yaris includes Icon 1.5 hybrid petrol electric 114bhp and automatic e-CVT; GR Sport 129bhp/130hp is distinct."
  ],
  [
    "2024 MG4 EV SE Standard Range",
    "Electric",
    "Automatic",
    "51 kWh EV",
    "manufacturer",
    "https://www.mg.co.uk/media-centre/mg-takes-you-even-further-new-mg4-ev-extended-range",
    "MG UK 2023 range matrix distinguishes 51kWh nominal SE Standard Range from 64kWh Long Range and later 77kWh Extended Range; 2024 continuity."
  ],
  [
    "2024 Kia Ceed 2",
    "Petrol",
    "Manual",
    "1.5 T-GDi",
    "manufacturer",
    "https://digital-brochures.kia.com/story/the-kia-ceed-family-dealer1/page/5",
    "Kia UK Ceed family grade 2 table lists 1.5 T-GDi six-speed manual; 2024 1.5 T-GDi 2 manual registered UK example separately offered by Pentagon Group."
  ],
  [
    "2025 Vauxhall Corsa Design",
    "Petrol",
    "Manual",
    "1.2 Turbo 100",
    "manufacturer",
    "https://www.media.stellantis.com/uploads/uk/model-pricelist/pricespeccorsa_my25_psg_3_december_2024_library-67a5e63bc6d04.pdf",
    "Vauxhall UK MY2025 January 2025 guide lists Design 1.2 Turbo 100PS petrol with six-speed manual; this is NOT the 100PS 48V hybrid automatic."
  ],
  [
    "2022 BMW 320d M Sport",
    "Diesel",
    "Automatic",
    "2.0 320d",
    "manufacturer",
    "https://www.press.bmwgroup.com/united-kingdom/article/detail/T0390793EN_GB/the-new-bmw-3-series-saloon-and-bmw-3-series-touring?language=en_GB",
    "BMW UK May 2022 facelift 320d M Sport 2.0 diesel mild-hybrid 190hp eight-speed Steptronic; saloon and Touring variants should price separately."
  ],
  [
    "2022 Audi A3 Sportback 35 TFSI",
    "Petrol",
    "Automatic",
    "1.5 TFSI S tronic",
    "corroborated",
    "https://www.monarchmotorco.co.uk/used-audi-a3-redditch-worcestershire-8287189",
    "UK registered 2022 A3 Sportback 35 TFSI 1.5 petrol S tronic 42,000mi advertised in Sport grade; game intentionally omits trim, not automatically S line."
  ],
  [
    "2022 Mercedes-Benz A200 AMG Line",
    "Petrol",
    "Automatic",
    "1.3 A200",
    "corroborated",
    "https://tax.mercedes-benz.co.uk/companycar/tax/history/Mercedes-Benz/A-Class/22",
    "Mercedes UK 2022 historical derivative table lists A200 AMG Line 7G-DCT 1.3 petrol; AMG Line is styling grade, NOT AMG A35 or A45."
  ],
  [
    "2023 Tesla Model Y Long Range",
    "Electric",
    "Automatic",
    "Dual-motor EV",
    "corroborated",
    "https://www.motorpoint.co.uk/used-cars/tesla/model-y/long-range",
    "UK 2023 Model Y Long Range AWD dual-motor electric automatic examples are traded as exact badge; no claim of fixed battery health, software or achieved range."
  ],
  [
    "2022 BMW 330e M Sport",
    "Plug-in Hybrid",
    "Automatic",
    "2.0 petrol PHEV",
    "manufacturer",
    "https://www.press.bmwgroup.com/united-kingdom/article/detail/T0390793EN_GB/the-new-bmw-3-series-saloon-and-bmw-3-series-touring?language=en_GB",
    "BMW UK 2022 330e M Sport 2.0 petrol plug-in hybrid 292hp combined, 8-speed automatic; 330e xDrive is a separate selectable derivative."
  ],
  [
    "2021 Audi Q5 40 TDI S line",
    "Diesel",
    "Automatic",
    "2.0 TDI quattro",
    "corroborated",
    "https://www.motorpoint.co.uk/used-cars/audi/q5/s-line",
    "Motorpoint UK lists 2021-registered Q5 40 TDI quattro S line 2.0 diesel 7-speed S tronic automatic; distinct from 45 TFSI."
  ],
  [
    "2022 Porsche Macan 2.0 PDK",
    "Petrol",
    "Automatic",
    "2.0 turbo PDK",
    "corroborated",
    "https://www.harwoods.co.uk/car/porsche/macan/02iQ4000008h5kbIAA",
    "Harwoods UK 2022-registered Macan 2.0 turbo petrol 265PS PDK 4WD exact model, gearbox and engine. Game does not specify interior/options."
  ],
  [
    "2022 Range Rover Velar D200 R-Dynamic HSE",
    "Diesel",
    "Automatic",
    "2.0 D200 AWD",
    "manufacturer",
    "https://media.jlr.com/range-rover/en-gb/news/2022/04/land-rover-introduces-new-range-rover-velar-hst-edition",
    "Range Rover official UK 2022 D200 R-Dynamic HSE 204hp diesel MHEV AWD automatic is explicitly listed; trim corrected from ambiguous R-Dynamic. Trade guide above retailable retail remains quarantined."
  ],
  [
    "2023 BMW X5 xDrive30d M Sport",
    "Diesel",
    "Automatic",
    "3.0 xDrive30d",
    "manufacturer",
    "https://www.press.bmwgroup.com/united-kingdom/article/detail/T0408483EN_GB/the-new-bmw-x5-and-x6?language=en_GB",
    "BMW UK 2023 facelift X5 xDrive30d 3.0 diesel 48V mild hybrid 298hp eight-speed AWD auto, available M Sport; pre-facelift 286hp also exists in registration-year transition."
  ],
  [
    "2022 Audi e-tron 55 quattro",
    "Electric",
    "Automatic",
    "95 kWh EV",
    "corroborated",
    "https://www.cinch.co.uk/used-cars/audi/four-wheel-drive-drive-type/2022-year",
    "Cinch UK 2022-registered Audi e-tron 55 quattro 300kW with 95kWh nominal/gross traction battery listed as 55 quattro 95kWh S line automatic; options and battery health unverified."
  ],
  [
    "2021 Porsche Taycan 4S",
    "Electric",
    "Automatic",
    "Dual-motor EV",
    "corroborated",
    "https://askcar.co.uk/car/porsche-taycan-2021-08589fb714ba",
    "UK 2021 Taycan 4S dual motor electric all-wheel-drive automatic advertised; Performance Battery Plus is optional, so game must not assume a specific battery size."
  ],
  [
    "2022 Mercedes-Benz S350d AMG Line",
    "Diesel",
    "Automatic",
    "2.9 S350d",
    "corroborated",
    "https://tax.mercedes-benz.co.uk/companycar/tax/history/rewrite.cfm?path=Mercedes-Benz%2FS-Class+Saloon%2F22",
    "Mercedes-Benz UK 2022 historic tax listing explicitly includes S350d AMG Line 9G-TRONIC, 2.9/3.0-litre straight-six diesel. Saloon vs Long-wheelbase not specified; no extra luxury package presumed."
  ],
  [
    "2023 Land Rover Defender 110 D250",
    "Diesel",
    "Automatic",
    "3.0 D250 MHEV",
    "corroborated",
    "https://www.askcar.co.uk/car/land-rover-defender-110-2023-377bbf71cab3",
    "UK 2023 Defender 110 D250 3.0 diesel mild-hybrid 250PS auto 4WD available, example HSE. Game does not claim S, SE or HSE exact trim; quoted retail comparables must match before valuation."
  ],
  [
    "2023 Range Rover Sport P440e Dynamic SE",
    "Plug-in Hybrid",
    "Automatic",
    "3.0 petrol PHEV",
    "manufacturer",
    "https://media.jlr.com/range-rover/en-gb/news/2022/05/new-range-rover-sport-revealed-epic-spillway-climb",
    "Range Rover UK new Sport P440e petrol 3.0 PHEV 440hp Dynamic SE 8-speed AWD automatic launched 2022 for 2023 registrations; game now names correct Dynamic SE variant."
  ]
].map(row=>Object.freeze(row)));
  if(VERIFIED.length!==37||new Set(VERIFIED.map(x=>x[0])).size!==37)
    throw Error('UK legacy source audit registry must have 37 unique rows');
  window.MotorTradeOriginalVerification=Object.freeze({VERIFIED,checkedAt:'2026-11-13'});
})();
