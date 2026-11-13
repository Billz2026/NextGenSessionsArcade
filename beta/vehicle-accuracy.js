'use strict';
/*
 * Motor Trade UK specification evidence — source reviewed 10 November 2026.
 *
 * This is NOT a registration lookup or valuation service. Only the listed
 * title+fuel+gearbox+powertrain tuples are backed by the linked material.
 * Manufacturer-backed indicates a documented UK model/derivative offering;
 * it is not evidence that the invented mileage, condition, MOT, history or
 * prices describe a real registered car. Some year/trim continuations remain
 * estimates: those are deliberately marked 'corroborated', not manufacturer.
 *
 * A future source or powertrain change invalidates the reviewed state until
 * independently rechecked. Unlisted catalogue records remain 'pending'.
 */
(() => {
  // These six exact UK derivatives have manufacturer source evidence.
  // Every other new variant remains pending, never auto-certified by brand.
  const expanded=window.MotorTradeUKCatalogue?.VERIFIED||[];
  const reviewed=[
    ...expanded,
    ['2017 Toyota Yaris Icon','Petrol','Manual','1.5 VVT-iE','manufacturer',
      'https://media.toyota.co.uk/toyota-announces-new-yaris-specifications-prices/',
      '2017 facelift Icon, 1.5 petrol manual; replaces old 1.33'],
    ['2018 Toyota Yaris Icon Hybrid','Hybrid','Automatic','1.5 VVT-i hybrid e-CVT','manufacturer',
      'https://media.toyota.co.uk/toyota-announces-new-yaris-specifications-prices/',
      '2017-20 generation UK Icon 1.5 self-charging hybrid CVT'],
    ['2020 Vauxhall Corsa SE Premium','Petrol','Manual','1.2 Turbo 100','manufacturer',
      'https://www.vauxhall.co.uk/content/dam/vauxhall/Home/PDFs/Cars/corsa/price-guides/New_Corsa_Spec_ePG_8_January_2020_Library-1578411749.pdf',
      'Vauxhall MY2020 UK SE Premium 1.2 turbo 100PS manual'],
    ['2021 Vauxhall Corsa SE Premium','Petrol','Manual','1.2 Turbo 100','corroborated',
      'https://commons.wikimedia.org/wiki/File:2021_Vauxhall_Corsa_SE_Premium_Turbo_1.2.jpg',
      '2021 UK photographed trim and engine; year-specific manufacturer price list pending'],
    ['2021 Peugeot 208 Allure','Petrol','Manual','1.2 PureTech 100','manufacturer',
      'https://www.media.stellantis.com/uk-en/peugeot/press/all-new-peugeot-208-and-e-208-prices-and-specifications-announced',
      'UK P21 208 Allure PureTech 100 six-speed manual; 2019 launch series continued'],
    ['2021 Peugeot e-208 Allure','Electric','Automatic','50 kWh EV','manufacturer',
      'https://www.media.stellantis.com/uk-en/peugeot/press/all-new-peugeot-208-and-e-208-prices-and-specifications-announced',
      'UK e-208 Allure and nominal 50 kWh battery; 2021 trim'],
    ['2021 Honda Jazz SE e:HEV','Hybrid','Automatic','1.5 i-MMD hybrid e-CVT','manufacturer',
      'https://hondanews.eu/gb/en/cars/media/pressreleases/201913/pricing-details-confirmed-for-all-new-honda-jazz',
      'UK fourth-generation Jazz SE 1.5 e:HEV hybrid, automatic'],
    ['2021 Kia Rio 3 MHEV','Petrol','Manual','1.0 T-GDi 48V MHEV iMT','manufacturer',
      'https://used-uk.kia.com/used-car-details/used-kia-rio-10-t-gdi-48v-3-hatchback-storm-grey-manual-petrol/id-6524095829323178025/',
      'Kia UK certified example corroborates 2021 1.0 petrol 48V mild hybrid manual 3'],
    ['2022 Nissan Qashqai Acenta Premium','Petrol','Manual','1.3 DIG-T 140 MHEV','manufacturer',
      'https://usedcars.nissan.co.uk/en/nissan/qashqai/2022',
      'Nissan UK used listings identify 2022 Acenta Premium 1.3 mild hybrid manual'],
    ['2022 Ford Puma Titanium','Petrol','Manual','1.0 EcoBoost 125 MHEV','manufacturer',
      'https://nd-mediagallery2-public-production.s3.amazonaws.com/4c7199f0ce6ae31adef340fa45b56599/puma_customer_price_list_uk_effective_1st_july_2022_without_design_2.0_.pdf',
      'Ford MY2022 Titanium UK 1.0 EcoBoost mHEV 125 PS six-speed manual'],
    ['2022 MG4 EV SE Standard Range','Electric','Automatic','51 kWh EV','manufacturer',
      'https://www.mg.co.uk/media-centre/mg-motor-uk-announces-pricing-and-specifications-striking-new-mg4-ev',
      'MG 2022 launch SE Standard Range nominal 51 kWh battery'],
    ['2021 Hyundai Ioniq 5 Premium','Electric','Automatic','73 kWh RWD EV','manufacturer',
      'https://www.hyundai.news/newsroom/dam/eu/uk/20210507_ioniq_5/hyundai-uk-ioniq-5-pricing.pdf',
      'Hyundai 2021 UK Premium 73 kWh RWD; 77.4 kWh arrived with MY2023'],
    ['2021 Vauxhall Corsa-e Elite Nav','Electric','Automatic','50 kWh EV','corroborated',
      'https://commons.wikimedia.org/wiki/File:2021_Vauxhall_Corsa-e_Elite_NAV.jpg',
      '2021 UK Corsa-e Elite Nav photo documents body and trim; 50kWh early generation'],
    ['2023 Kia Sportage GT-Line HEV','Hybrid','Automatic','1.6 T-GDi hybrid','manufacturer',
      'https://used-uk.kia.com/used-car-details/used-kia-sportage-16-h-t-gdi-gt-line-auto-euro-suv-green-automatic-petrol-hybrid/id-202609075800541/',
      'Kia UK certified 2023 GT-Line 1.6 T-GDi full hybrid automatic'],
    ['2023 Mercedes-Benz E300e AMG Line','Plug-in Hybrid','Automatic','2.0 petrol PHEV','manufacturer',
      'https://tax.mercedes-benz.co.uk/companycar/tax/history/Mercedes-Benz/E-Class%20Saloon/73',
      'Mercedes UK historic E300e AMG Line petrol PHEV offered Sep 2022–Nov 2023, W213'],
    ['2022 Hyundai Tucson SE Connect','Hybrid','Automatic','1.6 T-GDi hybrid','corroborated',
      'https://askcar.co.uk/car/hyundai-tucson-2022-1e458dbdca9a',
      '2022 UK SE Connect 1.6 full hybrid automatic listing; source is secondary'],
    ['2022 Tesla Model 3 RWD','Electric','Automatic','Rear-wheel-drive EV','corroborated',
      'https://ev-database.org/uk/car/1555/Tesla-Model-3-RWD',
      '2022 UK RWD variant; expert reference, not Tesla factory build sheet'],
    ['2022 Volvo XC40 Recharge','Electric','Automatic','69 kWh single-motor EV','corroborated',
      'https://ev-database.org/uk/car/1592/Volvo-XC40-Recharge-Pure-Electric',
      '2022 UK single motor electric variant and gross 69kWh; secondary source']
  ];
  const CHECKED=Object.freeze(Object.fromEntries(reviewed.map(([title,fuel,gearbox,engine,status,url,note])=>[
    title,Object.freeze({title,fuel,gearbox,engine,status,url,note,checkedAt:'2026-11-10'})
  ])));
  const STATUS=Object.freeze(['manufacturer','corroborated','pending']);
  function lookup(vehicle){
    const title=String(vehicle?.title||'');
    const actualFuel=String(vehicle?.fuel||'');
    const actualGearbox=String(vehicle?.gearbox||'');
    const actualEngine=String(vehicle?.engineSpec??vehicle?.profile?.engine??'');
    const evidence=CHECKED[title];
    if(evidence&&evidence.fuel===actualFuel&&
        evidence.gearbox===actualGearbox&&evidence.engine===actualEngine){
      return evidence;
    }
    return {title,status:'pending',url:null,checkedAt:null,
      note:evidence?'Current car details differ from the reviewed manufacturer variant.':
        'Model-year and trim specifications have not yet been individually source-verified.'};
  }
  function summary(catalogue){
    const all=Object.values(catalogue).flat(),totals={manufacturer:0,corroborated:0,pending:0};
    all.forEach(car=>totals[lookup(car).status]++);
    return Object.freeze({total:all.length,...totals});
  }
  window.MotorTradeAccuracy=Object.freeze({CHECKED,STATUS,lookup,summary});
})();
