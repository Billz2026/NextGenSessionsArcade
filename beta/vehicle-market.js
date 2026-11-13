'use strict';
/*
 * The Motor Trade v0.9.3 — curated UK USED-CAR simulator inventory.
 * Dates, derivatives and powertrains are model-specific; cash figures are
 * illustrative game valuations, NOT live auction or retail quotes.
 * Each tuple: title, mileage, fuel, transmission, engine or motor, guide buy,
 * retail asking, preparation allowance, condition (1 best / 5 worst), history.
 * All game prices are GBP. Original 2026 market context: SMMT Q3 2026,
 * https://www.smmt.co.uk/used-car-market-records-second-quarter-of-growth-with-one-in-20-drivers-going-electric/
 */
(() => {
  const rows = Object.freeze({
    // Starter: older, higher-mileage runabouts plus affordable newer stock.
    starter: [
      ['2016 Ford Focus Zetec',118300,'Diesel','Manual','1.5 TDCi',1950,4250,450,4,'Partial'],
      ['2020 Vauxhall Corsa SE Premium',103600,'Petrol','Manual','1.2 Turbo 100',4550,7850,395,3,'Partial'],
      ['2018 Volkswagen Polo SE',98000,'Petrol','Manual','1.0 TSI',3650,6300,355,3,'Partial'],
      ['2019 Honda Jazz SE',108000,'Petrol','Manual','1.3 i-VTEC',3450,5900,325,3,'Full'],
      ['2017 Ford Fiesta Zetec',104500,'Petrol','Manual','1.0 EcoBoost',1750,3950,425,4,'Partial'],
      ['2018 Toyota Yaris Icon Hybrid',114300,'Hybrid','Automatic','1.5 VVT-i hybrid e-CVT',4550,7250,360,3,'Partial'],
      ['2018 Vauxhall Corsa Energy',112200,'Petrol','Manual','1.4 16v',1850,4000,390,4,'Partial'],
      ['2017 Nissan Qashqai Acenta',127000,'Diesel','Manual','1.5 dCi',3400,6350,550,4,'Partial'],
      ['2019 Kia Rio 2',99600,'Petrol','Manual','1.25 CVVT',3750,6500,375,3,'Full'],
      ['2019 Hyundai i20 SE',106500,'Petrol','Manual','1.2 MPI',3450,6150,375,3,'Partial'],
      ['2018 Peugeot 208 Active',113800,'Petrol','Manual','1.2 PureTech',1850,4150,475,4,'Partial'],
      ['2020 Nissan Leaf Acenta',89600,'Electric','Automatic','40 kWh EV',4300,7350,560,3,'Partial'],
      ['2018 Volkswagen Golf SE',131100,'Diesel','Manual','1.6 TDI',4400,7600,535,4,'Partial'],
      ['2017 Toyota Yaris Icon',96000,'Petrol','Manual','1.5 VVT-iE',3600,6000,310,3,'Full'],
      // Older part-ex and low-budget auction stock can still be serviceable.
      ['2016 Honda Jazz SE',157800,'Petrol','Manual','1.3 i-VTEC',1450,3500,250,3,'Partial']
    ],
    modern: [
      ['2021 Vauxhall Corsa SE Premium',57100,'Petrol','Manual','1.2 Turbo 100',6350,10350,385,2,'Full'],
      ['2021 Peugeot 208 Allure',51200,'Petrol','Manual','1.2 PureTech 100',6850,10850,445,2,'Partial'],
      ['2021 Toyota Yaris Design Hybrid',55700,'Hybrid','Automatic','1.5 VVT-i hybrid e-CVT',9400,13850,395,2,'Full'],
      ['2021 Honda Jazz SE e:HEV',46100,'Hybrid','Automatic','1.5 i-MMD hybrid e-CVT',10650,14850,360,2,'Full'],
      ['2022 Nissan Qashqai Acenta Premium',60200,'Petrol','Manual','1.3 DIG-T 140 MHEV',11950,16550,515,2,'Full'],
      ['2021 Kia Rio 3 MHEV',65000,'Petrol','Manual','1.0 T-GDi 48V MHEV iMT',6500,10250,355,3,'Partial'],
      ['2022 MG4 EV SE Standard Range',57500,'Electric','Automatic','51 kWh EV',8850,13250,585,2,'Full'],
      ['2021 Vauxhall Corsa-e Elite Nav',52300,'Electric','Automatic','50 kWh EV',7050,11150,525,3,'Partial'],
      ['2021 Volkswagen Golf Life',66600,'Petrol','Manual','1.5 TSI',9800,14600,425,2,'Full'],
      ['2022 Volkswagen Polo Life',45500,'Petrol','Manual','1.0 TSI',9350,13250,365,2,'Full'],
      ['2022 Ford Puma Titanium',47300,'Petrol','Manual','1.0 EcoBoost 125 MHEV',9350,13950,435,2,'Full'],
      ['2022 Toyota Corolla Icon Hybrid',52000,'Hybrid','Automatic','1.8 VVT-i hybrid e-CVT',11800,16950,465,2,'Full'],
      ['2021 Nissan Leaf N-Connecta',49300,'Electric','Automatic','40 kWh EV',5450,8550,575,2,'Full'],
      ['2021 Peugeot e-208 Allure',53500,'Electric','Automatic','50 kWh EV',7150,11250,615,2,'Partial'],
      ['2022 Hyundai Tucson SE Connect',57500,'Hybrid','Automatic','1.6 T-GDi hybrid',15600,21500,555,2,'Full'],
      ['2022 Vauxhall Mokka-e Launch Edition',51000,'Electric','Automatic','50 kWh EV',8850,13350,585,3,'Partial'],
      // Later, low-mileage mainstream models. Retail asks below are dated
      // comparable advertisements; all wholesale guides are game estimates.
      ['2024 Toyota Yaris Icon Hybrid',15000,'Hybrid','Automatic','1.5 VVT-i hybrid e-CVT',12000,16800,385,2,'Full'],
      ['2024 MG4 EV SE Standard Range',18000,'Electric','Automatic','51 kWh EV',9850,13700,585,2,'Full'],
      ['2024 Kia Ceed 2',19000,'Petrol','Manual','1.5 T-GDi',11200,16300,410,2,'Full'],
      ['2025 Vauxhall Corsa Design',8000,'Petrol','Manual','1.2 Turbo 100',9950,13800,390,2,'Full']
    ],
    premium: [
      ['2022 Tesla Model 3 RWD',47000,'Electric','Automatic','Rear-wheel-drive EV',14600,20500,725,2,'Full'],
      ['2022 BMW 320d M Sport',53400,'Diesel','Automatic','2.0 320d',18800,25500,625,2,'Full'],
      ['2022 Audi A3 Sportback 35 TFSI',42100,'Petrol','Automatic','1.5 TFSI S tronic',16750,23150,535,2,'Full'],
      ['2022 Mercedes-Benz A200 AMG Line',39000,'Petrol','Automatic','1.3 A200',16400,22350,575,2,'Full'],
      ['2022 Volvo XC40 Recharge',52000,'Electric','Automatic','69 kWh single-motor EV',17250,23450,715,2,'Full'],
      ['2023 Kia Sportage GT-Line HEV',43800,'Hybrid','Automatic','1.6 T-GDi hybrid',18750,25000,610,2,'Full'],
      ['2021 Hyundai Ioniq 5 Premium',59300,'Electric','Automatic','73 kWh RWD EV',15150,21350,765,3,'Full'],
      ['2023 Tesla Model Y Long Range',39100,'Electric','Automatic','Dual-motor EV',22600,29500,775,2,'Full'],
      ['2022 BMW 330e M Sport',51500,'Plug-in Hybrid','Automatic','2.0 petrol PHEV',17700,24150,690,2,'Full'],
      ['2021 Audi Q5 40 TDI S line',56700,'Diesel','Automatic','2.0 TDI quattro',20750,27750,770,3,'Partial']
    ],
    luxury: [
      ['2022 Porsche Macan 2.0 PDK',38200,'Petrol','Automatic','2.0 turbo PDK',32600,42000,950,2,'Full'],
      ['2022 Range Rover Velar D200 R-Dynamic',49100,'Diesel','Automatic','2.0 D200 AWD',29800,40000,1250,3,'Partial'],
      ['2023 BMW X5 xDrive30d M Sport',33500,'Diesel','Automatic','3.0 xDrive30d',43400,55000,1050,2,'Full'],
      ['2023 Mercedes-Benz E300e AMG Line',31900,'Plug-in Hybrid','Automatic','2.0 petrol PHEV',31350,41750,925,2,'Full'],
      ['2022 Audi e-tron 55 quattro',48600,'Electric','Automatic','95 kWh EV',22400,30850,1175,3,'Full'],
      ['2021 Porsche Taycan 4S',42600,'Electric','Automatic','Dual-motor EV',37600,49350,1350,3,'Full'],
      ['2022 Mercedes-Benz S350d AMG Line',42100,'Diesel','Automatic','2.9 S350d',50500,65000,1450,2,'Full'],
      ['2023 Land Rover Defender 110 D250',36200,'Diesel','Automatic','3.0 D250 MHEV',48600,62500,1475,2,'Full'],
      ['2023 Range Rover Sport P440e',33800,'Plug-in Hybrid','Automatic','3.0 petrol PHEV',50800,66000,1625,2,'Full']
    ]
  });
  // Only the audited 2026 scenario uses these dated asking-price anchors.
  // These ARE UK retail advertisements, NOT auction hammer or CAP trade values.
  // The trade guides below remain transparent, illustrative game assumptions.
  // Untouched rows are explicitly marked review-pending instead of masquerading
  // as live valuations. The classic career retains the original catalogue.
  const PRICING_2026=Object.freeze({
    '2019 Kia Rio 2':{
      retail:6200,sourcePrice:6299,sourceMiles:89805,
      source:'https://www.pistonheads.com/buy/kia/rio/year/2019',
      note:'Exact 1.25 2 manual 89,805mi £6,299; game 99,600mi + grade 3. Asking adjusted conservatively; not sold.',confidence:'medium'},
    '2017 Toyota Yaris Icon':{
      retail:6400,sourcePrice:6395,sourceMiles:92097,
      source:'https://www.autouncle.co.uk/en-gb/used-cars/Toyota/Yaris/y-2017',
      note:'2017 1.5 petrol Icon Tech manual 92,097mi £6,395, game Icon not Tech 96k; trim difference.',confidence:'low'},
    '2016 Honda Jazz SE':{
      retail:3500,sourcePrice:5495,sourceMiles:109000,
      source:'https://askcar.co.uk/used-cars/honda/jazz/se/2016',
      note:'2016 1.3 SE manual 109k £5,495; game 157,800mi substantially beyond observed comparisons, retaining lower £3,500 is a HIGH-risk extrapolation.',confidence:'low'},
    '2021 Honda Jazz SE e:HEV':{
      retail:12500,sourcePrice:12250,sourceMiles:50415,
      source:'https://askcar.co.uk/used-cars/honda/jazz/2021',
      note:'Exact 2021 SE hybrid automatic 50,415mi £12,250; game 46,100mi. 42,341mi £12,495 second listing.',confidence:'medium'},
    '2024 Toyota Yaris Icon Hybrid':{
      retail:16800,sourcePrice:16799,sourceMiles:13712,
      source:'https://www.askcar.co.uk/used-cars/toyota/yaris/icon/2024',
      note:'November 2026 2024 1.5 VVT-h Icon automatic cohort and advertised 13,712mi £16,799 example. 15,000mi stock is a fictional derivative-matched case, not the real car.',confidence:'medium'},
    '2024 MG4 EV SE Standard Range':{
      retail:13700,sourcePrice:13700,sourceMiles:18000,
      source:'https://www.askcar.co.uk/used-cars/mg/mg4/se/2024',
      note:'November 2026 MG4 SE 2024 asking-price median at approx 18,000mi £13,700; battery and exact standard-range option not individually checked. Illustrated trade guide, not a hammer.',confidence:'low'},
    '2024 Kia Ceed 2':{
      retail:16300,sourcePrice:16299,sourceMiles:17176,
      source:'https://www.askcar.co.uk/used-cars/kia/ceed/2024',
      note:'November 2026 2024 Ceed 1.5 T-GDi 2 manual estate advertised 17,176mi £16,299; game model body unspecified. Retail asking only, not sold or trade.',confidence:'medium'},
    '2025 Vauxhall Corsa Design':{
      retail:13800,sourcePrice:13800,sourceMiles:5000,
      source:'https://www.askcar.co.uk/used-cars/vauxhall/corsa/design',
      note:'November 2026 2025 Corsa Design cohort median asking £13,800 at typical 5,000mi; game 8,000mi illustrative, turbo/manual specification may affect actual asking.',confidence:'low'},
    '2022 Nissan Qashqai Acenta Premium':{
      retail:10950,sourcePrice:10749,sourceMiles:62506,
      source:'https://www.askcar.co.uk/used-cars/nissan/qashqai/acenta-premium/2022',
      note:'Exact 1.3 DIG-T MHEV 138 manual 62,506mi £10,749; at 61k £10,995, 67k £10,495. Previous £16,550 materially overstated.',confidence:'high'},
    '2021 Kia Rio 3 MHEV':{
      retail:9250,sourcePrice:9400,sourceMiles:59083,
      source:'https://www.pistonheads.com/buy/kia/rio/year/2021',
      note:'2021 1.0 T-GDi 48V MHEV 3 manual 59,083mi £9,400; game 65,000mi, same powertrain and trim.',confidence:'medium'},
    '2021 Vauxhall Corsa-e Elite Nav':{
      retail:9250,sourcePrice:8790,sourceMiles:51128,
      source:'https://askcar.co.uk/car/vauxhall-corsa-electric-2021-6a5901c386f9',
      note:'Exact 2021 50kWh Elite NAV electric auto 51,128mi £8,790; £9,291 AskCar estimated asking value at Oct month-end.',confidence:'high'},
    '2021 Volkswagen Golf Life':{
      retail:12000,sourcePrice:11820,sourceMiles:65016,
      source:'https://www.askcar.co.uk/used-cars/volkswagen/golf/life/2021',
      note:'Exact 2021 1.5 TSI Life manual 65,016mi £11,820; 67,900mi 148bhp £12,195. Engine output differences.',confidence:'high'},
    '2022 Volkswagen Polo Life':{
      retail:12350,sourcePrice:11600,sourceMiles:49000,
      source:'https://www.askcar.co.uk/used-cars/volkswagen/polo/life/2022',
      note:'Exact 1.0 TSI Life 94bhp manual 49k £11,600; 44,442mi example £13,900, 40-60k cohort £12,500. Adjusted estimate £12,350.',confidence:'medium'},
    '2021 Peugeot e-208 Allure':{
      retail:9950,sourcePrice:10200,sourceMiles:46380,
      source:'https://www.askcar.co.uk/used-cars/peugeot/e-208/2021',
      note:'Closest 2021 e-208 Allure Premium 46,380mi £10,200; actual game Allure 53,500mi (different trim). Low exact-trim sample.',confidence:'low'},
    '2022 Hyundai Tucson SE Connect':{
      retail:16950,sourcePrice:16540,sourceMiles:56542,
      source:'https://www.askcar.co.uk/used-cars/hyundai/tucson/se-connect/2022',
      note:'Exact 1.6 full HEV SE Connect automatic 56,542mi £16,540, another 56,964mi £17,750. Original £21,500 overstated.',confidence:'high'},
    '2022 Vauxhall Mokka-e Launch Edition':{
      retail:11250,sourcePrice:11750,sourceMiles:49000,
      source:'https://www.askcar.co.uk/car/vauxhall-mokka-electric-2022-d260fd92e754',
      note:'2022 Mokka Electric 50kWh Elite Premium 49kmi £11,750; \'Launch Edition\' not matched to a verified UK trim. Model/trim validation pending.',confidence:'low'},
    '2022 Tesla Model 3 RWD':{
      retail:19000,sourcePrice:18799,sourceMiles:47775,
      source:'https://askcar.co.uk/car/tesla-model-3-2022-f2de48627a72',
      note:'2022 Model 3 RWD Auto 47,775mi advertised £18,799; 47,126mi Standard Range Plus £19,750 (battery/trim difference).',confidence:'high'},
    '2022 BMW 320d M Sport':{
      retail:24000,sourcePrice:23290,sourceMiles:51000,
      source:'https://askcar.co.uk/car/bmw-3-series-2022-aae30f0f91c2',
      note:'2022 320d MHT M Sport auto Touring RWD 51k £23,290; game body style unspecified; comparable estate/AWD variations matter.',confidence:'medium'},
    '2022 Audi A3 Sportback 35 TFSI':{
      retail:17600,sourcePrice:16990,sourceMiles:42000,
      source:'https://www.monarchmotorco.co.uk/used-audi-a3-redditch-worcestershire-8287189',
      note:'Exact engine 1.5 TFSI 35 Sport Sportback S tronic 42,000mi £16,990; S line with 38,010mi £18,990 (trim uplift).',confidence:'medium'},
    '2022 Mercedes-Benz A200 AMG Line':{
      retail:19000,sourcePrice:18995,sourceMiles:39000,
      source:'https://askcar.co.uk/car/mercedes-benz-a-class-2022-3d2911015026',
      note:'2022 A200 AMG Line Edition Executive DCT saloon 39,000mi £18,995; body/Edition not specified on game row.',confidence:'medium'},
    '2022 Volvo XC40 Recharge':{
      retail:18000,sourcePrice:17999,sourceMiles:52439,
      source:'https://www.askcar.co.uk/car/volvo-xc40-2022-b638aba5e7f5',
      note:'2022 69kWh single-motor Recharge Core 52,439mi £17,999; exact battery/motor, Core specification not in game name.',confidence:'high'},
    '2023 Kia Sportage GT-Line HEV':{
      retail:20800,sourcePrice:20789,sourceMiles:43716,
      source:'https://www.askcar.co.uk/car/kia-sportage-2023-ef1fb931ced8',
      note:'Exact 2023 1.6 HEV GT Line auto at 43,716mi £20,789; 43,371mi £20,640 / 44,515mi £20,695.',confidence:'high'},
    '2021 Hyundai Ioniq 5 Premium':{
      retail:15750,sourcePrice:14900,sourceMiles:63745,
      source:'https://askcar.co.uk/car/hyundai-ioniq-5-2021-24ed90de9a20',
      note:'Exact 2021 73kWh RWD Premium electric auto 63,745mi £14,900; game 59,300mi slight mileage premium, battery SOH unverified.',confidence:'medium'},
    '2022 BMW 330e M Sport':{
      retail:20950,sourcePrice:20995,sourceMiles:51000,
      source:'https://www.askcar.co.uk/car/bmw-3-series-2022-672ab24a7013',
      note:'Exact 2022 330e M Sport automatic RWD saloon 51,000mi £20,995; 50,790mi example £19,710.',confidence:'high'},
    '2021 Audi Q5 40 TDI S line':{
      retail:23000,sourcePrice:23136,sourceMiles:57327,
      source:'https://askcar.co.uk/car/audi-q5-2021-96bee4cf3a71',
      note:'Exact 2021 40 TDI S Line S tronic quattro 57,327mi £23,136; body ambiguity estate/SUV registration, 58k £20,399.',confidence:'high'},
    '2022 Porsche Macan 2.0 PDK':{
      retail:39500,sourcePrice:37994,sourceMiles:38664,
      source:'https://www.askcar.co.uk/car/porsche-macan-2022-7205fb010429',
      note:'Exact 2022 2.0 PDK 4WD 38,664mi £37,994; 36,897mi £39,840; example priced down £805 after 103 days.',confidence:'high'},
    '2022 Range Rover Velar D200 R-Dynamic':{
      retail:26300,sourcePrice:25984,sourceMiles:49877,
      source:'https://askcar.co.uk/car/land-rover-range-rover-velar-2022-7669ebfbddcc',
      note:'Exact 2022 D200 R Dynamic HSE 49,877mi £25,984; underlying R-Dynamic trim unspecified, HSE equipment affects price.',confidence:'medium'},
    '2023 BMW X5 xDrive30d M Sport':{
      retail:51500,sourcePrice:50998,sourceMiles:33160,
      source:'https://www.askcar.co.uk/car/bmw-x5-2023-212040a6800e',
      note:'2023 30d MHT M Sport Steptronic 4WD 33,160mi £50,998, corresponding derivative/engine/gearbox.',confidence:'high'},
    '2023 Mercedes-Benz E300e AMG Line':{
      retail:33500,sourcePrice:32850,sourceMiles:29000,
      source:'https://www.askcar.co.uk/used-cars/mercedes-benz/e-class/plug-in-hybrid/in-london',
      note:'2023 E300e AMG Line Night Edition Premium Plus saloon 29kmi £32,850; trim/package not exact; game 31,900mi.',confidence:'low'},
    '2022 Audi e-tron 55 quattro':{
      retail:21300,sourcePrice:22470,sourceMiles:36700,
      source:'https://evguide.uk/guides/used-audi-e-tron-buyers-guide',
      note:'2022 e-tron SUV 55 95kWh cohort median £22,470 at median 36,700mi; game 48,600mi, grade 3. Cohort not individual advert.',confidence:'low'},
    '2021 Porsche Taycan 4S':{
      retail:39000,sourcePrice:38941,sourceMiles:40479,
      source:'https://askcar.co.uk/car/porsche-taycan-2021-08589fb714ba',
      note:'2021 Taycan 4S 40,479mi £38,941; Performance Plus 42,950mi £41,990, battery option affects value.',confidence:'high'},
    '2022 Mercedes-Benz S350d AMG Line':{
      retail:59000,sourcePrice:59990,sourceMiles:47500,
      source:'https://www.prestigemotorwarehouse.co.uk/cars/ad/22402-mercedes-benz-s-class-s350d-amg-line-black',
      note:'2022 S350d AMG Line Premium G-Tronic diesel saloon 47,500mi asking £59,990; exact game AMG Line not Premium. Sparse stock.',confidence:'medium'},
    '2023 Land Rover Defender 110 D250':{
      retail:47500,sourcePrice:47400,sourceMiles:36568,
      source:'https://askcar.co.uk/car/land-rover-defender-110-2023-23c5cc2cffc1',
      note:'2023 D250 MHEV SE Auto 4WD 36,568mi £47,400; game trim unspecified; 36,800mi another £44,990.',confidence:'medium'},
    '2023 Range Rover Sport P440e':{
      retail:54000,sourcePrice:52510,sourceMiles:34043,
      source:'https://www.askcar.co.uk/used-cars/land-rover/range-rover-sport/2023?page=3',
      note:'2023 P440e Dynamic SE 34,043mi £52,510; 34,967mi £53,190, 34,720mi £53,230; unspecified in-game trim.',confidence:'high'},
    '2018 Toyota Yaris Icon Hybrid':{
      retail:7250,sourcePrice:8972,sourceMiles:87241,
      source:'https://askcar.co.uk/used-cars/toyota/yaris/icon/2018',
      note:'87k-mile Icon 1.5 VVT-h advertised £8,972; 114k-mile grade-3 simulator stock retains £7,250 asking. Sparse exact high-mileage hybrid cohort and condition uncertainty.',confidence:'low'},
    '2019 Hyundai i20 SE':{
      retail:6150,sourcePrice:6899,sourceMiles:82900,
      source:'https://www.askcar.co.uk/used-cars/hyundai/i20/se/2019',
      note:'Exact 2019 1.2 SE manual 82,900 miles £6,899 and 76,960 miles £7,297; a 106k-mile car at £6,150 is a conservative mileage-adjusted estimate.',confidence:'medium'},
    '2019 Honda Jazz SE':{
      retail:5900,sourcePrice:7995,sourceMiles:73131,
      source:'https://www.askcar.co.uk/used-cars/honda/jazz/se/2019',
      note:'2019 1.3 i-VTEC SE 73,131 miles advertised £7,995 and 64,353 miles £9,495. Sparse 108k-mile listings; retain £5,900 pending exact comparison.',confidence:'low'},
    '2018 Volkswagen Golf SE':{
      retail:6950,sourcePrice:8093,sourceMiles:82600,
      source:'https://askcar.co.uk/used-cars/volkswagen/golf/se/2018',
      note:'2018 Golf SE 1.6 TDI 82,600 miles estate advertised £8,093 and 72,884-mile hatchback £8,995. At 131k and grade-4 the game estimate £6,950 is an extrapolation; estate is different body.',confidence:'low'},
    '2020 Nissan Leaf Acenta':{
      retail:7350,sourcePrice:6750,sourceMiles:103759,
      source:'https://www.autouncle.co.uk/en-gb/used-cars/Nissan/Leaf/y-2020',
      note:'2020 higher-trim Tekna 62kWh at 103,759mi advertised £6,750; Acenta 40kWh 89,600mi not an exact battery/mileage match. Retained £7,350 provisional pending SOH and exact trim comparables.',confidence:'low'},
    '2016 Ford Focus Zetec':{
      retail:3450,sourcePrice:3190,sourceMiles:104000,
      source:'https://askcar.co.uk/used-cars/ford/focus/zetec/2016',
      note:'Exact 1.5 TDCi Zetec 104k mile asking £3,190; 131k £2,490 and 92k £4,250; 118k estimate remains conditional on condition and MOT.',confidence:'medium'},
    '2018 Vauxhall Corsa Energy':{
      retail:4000,sourcePrice:3495,sourceMiles:110348,
      source:'https://askcar.co.uk/used-cars/vauxhall/corsa/energy/2018',
      note:'1.4 manual 110k-mile comparator £3,495; 105k ~£3,995, so existing £4,000 ask is towards high end for grade 4.',confidence:'medium'},
    '2017 Nissan Qashqai Acenta':{
      retail:4700,sourcePrice:4500,sourceMiles:132000,
      source:'https://askcar.co.uk/used-cars/nissan/qashqai/acenta/2017',
      note:'Exact 1.5 dCi Acenta manual 132k advertised £4,500, 114k £4,000. Scarce exact high-mileage sample.',confidence:'low'},
    '2018 Peugeot 208 Active':{
      retail:3350,sourcePrice:3490,sourceMiles:89000,
      source:'https://askcar.co.uk/used-cars/peugeot/208/2018',
      note:'2018 PureTech Active 89k £3,490 and 84k £3,450; 110k Allure Premium £3,149. Grade-4 114k estimate below lower-mileage comparators.',confidence:'medium'},
    '2021 Vauxhall Corsa SE Premium':{
      retail:8800,sourcePrice:7695,sourceMiles:66300,
      source:'https://askcar.co.uk/used-cars/vauxhall/corsa/se-premium/2021',
      note:'Exact 1.2 Turbo SE Premium manual 66k £7,695; 35k £9,998; 56.6k automatic £9,600 not directly comparable.',confidence:'medium'},
    '2021 Peugeot 208 Allure':{
      retail:9250,sourcePrice:8790,sourceMiles:51053,
      source:'https://askcar.co.uk/used-cars/peugeot/208/allure/2021',
      note:'Exact Allure 51k £8,790; 48.5k £9,998; 64k £7,995. Model asking price is not sale achieved.',confidence:'medium'},
    '2021 Toyota Yaris Design Hybrid':{
      retail:12800,sourcePrice:12488,sourceMiles:51702,
      source:'https://askcar.co.uk/used-cars/toyota/yaris/design/2021',
      note:'1.5 hybrid Design 51,702mi £12,488 and 43k £11,995; 30k £15,995; one local vehicle\'s condition may differ.',confidence:'medium'},
    '2022 Ford Puma Titanium':{
      retail:11300,sourcePrice:10560,sourceMiles:47107,
      source:'https://askcar.co.uk/used-cars/ford/puma/titanium/2022',
      note:'Exact 1.0 EcoBoost MHEV Titanium manual 47,107mi £10,560; 44,862mi £10,610; 41,848mi £11,749.',confidence:'medium'},
    '2022 Toyota Corolla Icon Hybrid':{
      retail:15500,sourcePrice:16000,sourceMiles:38000,
      source:'https://www.askcar.co.uk/used-cars/toyota/corolla/icon/2022',
      note:'2022 Icon hybrid median £16,000 at 38k median miles; model 52k mileage adjusted conservatively but no exact-match advert validated.',confidence:'low'},
    '2023 Tesla Model Y Long Range':{
      retail:26800,sourcePrice:27888,sourceMiles:36800,
      source:'https://askcar.co.uk/used-cars/tesla/model-y/long-range/2023',
      note:'2023 Long Range 36.8k-mi £27,888, 55k-mi £22,644 and 2023 median £25,500 at 46k; EV battery and warranty verified separately.',confidence:'medium'},
    '2017 Ford Fiesta Zetec':{
      retail:3950,sourcePrice:3979,sourceMiles:100923,tradeGuide:1750,
      source:'https://certmotors.com/vehicles/car/Ford/Fiesta',
      note:'Model-year/mileage regression, trim and condition unverified',confidence:'medium'},
    '2018 Volkswagen Polo SE':{
      retail:7550,sourcePrice:7599,sourceMiles:101539,tradeGuide:4250,
      source:'https://certmotors.com/vehicles/car/Volkswagen/Polo',
      note:'2018 model year and mileage model; trim needs validation',confidence:'medium'},
    '2020 Vauxhall Corsa SE Premium':{
      retail:6250,sourcePrice:5800,sourceMiles:101511,tradeGuide:3450,
      source:'https://www.askcar.co.uk/used-cars/vauxhall/corsa/se-premium/2020',
      note:'2020 comparable 100k+ petrol cars £5.5k-£5.8k, turbo derivative may differ',confidence:'low'},
    '2022 MG4 EV SE Standard Range':{
      retail:10650,sourcePrice:10500,sourceMiles:53956,tradeGuide:7100,
      source:'https://askcar.co.uk/car/mg-mg4-2022-85693825dda8',
      note:'Three 2022 SE examples 50k-62k miles near £10.5k-£11.2k',confidence:'medium'},
    '2021 Nissan Leaf N-Connecta':{
      retail:8550,sourcePrice:9000,sourceMiles:38000,tradeGuide:5450,
      source:'https://www.askcar.co.uk/used-cars/nissan/leaf/n-connecta/2021',
      note:'2021 trim median, car has above-median miles; battery SOH unverified',confidence:'low'}
  });
  const MARKET_2026_REVIEW_DATE='2026-11-12';
  function priceFor(base,scenario='classic'){
    if(scenario!=='uk2026')return base;
    const evidence=PRICING_2026[base.title];
    if(!evidence)return {...base,repairScenario:'uk2026',priceAudit:{
      status:'unverified',asOf:MARKET_2026_REVIEW_DATE,
      note:'Illustrative game guide/asking prices awaiting derivative, mileage and condition benchmarking.'}};
    const guide=Number.isSafeInteger(evidence.tradeGuide)?evidence.tradeGuide:base.guide;
    return {...base,guide,retail:evidence.retail,repairScenario:'uk2026',
      reserve:guide+Math.round(guide*.07/25)*25,
      rival:guide+Math.round(guide*.13/25)*25,
      ask:guide+Math.max(300,Math.round(guide*.08/25)*25),
      floor:guide-125,
      priceAudit:{
        status:'retail-comparable',asOf:MARKET_2026_REVIEW_DATE,
        confidence:evidence.confidence,source:evidence.source,
        comparisonAsk:evidence.sourcePrice,comparisonMiles:evidence.sourceMiles,
        note:evidence.note,
        tradeGuide:'Illustrative game-model assumption, not a verified auction result',
        ...(guide>=evidence.retail?{buyingRisk:'WARNING: UNSOURCED wholesale guide is at or above retail asking. Buying at this guide is commercially loss-making even before fees and preparation.'}:{})
      }};
  }
  const KEYS=Object.freeze(['starter','modern','premium','luxury']);
  const TIERS=Object.freeze([
    {key:'starter',label:'STARTER DEALER',minCash:0,minRep:0},
    {key:'modern',label:'MODERN STOCK',minCash:18500,minRep:15},
    {key:'premium',label:'PREMIUM DEALER',minCash:42000,minRep:40},
    {key:'luxury',label:'LUXURY SPECIALIST',minCash:110000,minRep:65}
  ]);
  const hash=value=>{
    let h=2166136261;
    for(const letter of String(value))h=Math.imul(h^letter.charCodeAt(0),16777619)>>>0;
    return h>>>0;
  };
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const source=(row,i,tier)=>{
    const [title,miles,fuel,gearbox,engineSpec,guide,retail,prep,grade,history]=row;
    return Object.freeze({title,miles,fuel,gearbox,engineSpec,guide,retail,prep,grade,history,
      reserve:guide+Math.round(guide*.07/25)*25,
      rival:guide+Math.round(guide*.13/25)*25,
      fee:Math.round((210+guide*.015)/5)*5,
      ask:guide+Math.max(300,Math.round(guide*.08/25)*25),
      floor:guide-125,
      note:fuel==='Electric'?'Battery condition and charging history require verification; no live battery report.':
        fuel==='Hybrid'||fuel==='Plug-in Hybrid'?
          'Hybrid system history and battery condition require inspection.':
          'Service, tyres, brakes and cosmetic condition require inspection.',
      marketTier:tier,templateId:tier+'-'+i});
  };
  const CATALOGUE=Object.freeze(Object.fromEntries(KEYS.map(k=>[k,Object.freeze(rows[k].map((row,i)=>source(row,i,k)))])));
  // Modern independent dealers can inspect all financially plausible stock
  // without an arbitrary reputation gate. Prestige models remain infrequent
  // and purchasing still requires genuine unrestricted operating cash.
  function sourcingTier2026(cash){
    return cash>=95000?'luxury':cash>=37000?'premium':
      cash>=14500?'modern':'starter';
  }
  function tierFor(cash=12500,reputation=5){
    const current=TIERS.filter(t=>cash>=t.minCash&&reputation>=t.minRep).at(-1);
    return current||TIERS[0];
  }
  function progress(cash=12500,reputation=5){
    const current=tierFor(cash,reputation), next=TIERS[TIERS.indexOf(current)+1]||null;
    return {current,next};
  }
  function pool(group,tier){
    const idx=KEYS.indexOf(tier);
    const accessible=KEYS.slice(0,Math.max(0,idx)+1);
    if(group==='seller')return accessible.flatMap(k=>CATALOGUE[k]);
    return accessible.flatMap(k=>CATALOGUE[k]);
  }
  function pick(group,tier,day,index,seen=new Set(),scenario='classic'){
    const accessible=pool(group,tier);
    // Mix all unlocked bands. The highest band appears more often without
    // erasing affordable stock or forcing unaffordable expensive lots.
    const weighting=scenario==='uk2026'?
      tier==='starter'?['starter']:
      tier==='modern'?['starter','starter','modern','modern','modern']:
      tier==='premium'?['starter','starter','modern','modern','modern','modern','premium']:
      ['starter','modern','modern','premium','premium','luxury','luxury']:
      tier==='starter'?['starter']:
      tier==='modern'?['starter','modern','modern','modern']:
      tier==='premium'?['starter','modern','modern','premium','premium','premium']:
      ['modern','premium','premium','luxury','luxury','luxury'];
    const desired=weighting[hash(group+'|'+day+'|'+index)%weighting.length];
    // Direct seller leads skew toward retailable, middle-grade cars; auctions
    // retain genuinely high-risk grade-4 bargains. Retail care can therefore
    // improve trust instead of every early direct seller harming reputation.
    const suitable=v=>!seen.has(v.title)&&(group!=='seller'||v.grade<=3);
    const candidates=CATALOGUE[desired].filter(suitable);
    const fallback=accessible.filter(suitable);
    const list=candidates.length?candidates:fallback;
    if(!list.length)return null;
    const chosen=list[hash(group+'|'+day+'|slot|'+index)%list.length];
    seen.add(chosen.title);
    return chosen;
  }
  // Early Deal Day is still mostly inexpensive direct sellers; later months
  // add higher-value stock only after both financial and reputation progress.
  function sellersForDealDay(cash,reputation){
    const tier=tierFor(cash,reputation).key;
    return pool('seller',tier).filter(v=>v.marketTier==='starter'||v.marketTier===tier);
  }
  function exchangeFor(vehicle){
    const tier=vehicle.retail>=38000?'premium':vehicle.retail>=18000?'modern':'starter';
    // A routine part-exchange should normally be a cheaper, retailable car,
    // not an unexpectedly dear or poor-grade liability. Condition exceptions
    // still exist in auction stock and explicit vehicle inspections.
    const fairExchange=v=>v.grade<=3&&v.guide<=vehicle.retail*.42&&
      v.retail<=Math.max(6500,vehicle.retail*1.15);
    const poolRows=CATALOGUE[tier].filter(fairExchange);
    const fallback=CATALOGUE.starter.filter(fairExchange);
    const affordable=poolRows.length?poolRows:fallback.length?fallback:CATALOGUE.starter;
    const id=Number(vehicle.id)||0;
    return affordable[hash('part-ex|'+vehicle.origin+'|'+id)%affordable.length];
  }
  window.MotorTradeMarket=Object.freeze({TIERS,CATALOGUE,PRICING_2026,MARKET_2026_REVIEW_DATE,
    priceFor,tierFor,sourcingTier2026,progress,pool,pick,sellersForDealDay,exchangeFor});
})();
