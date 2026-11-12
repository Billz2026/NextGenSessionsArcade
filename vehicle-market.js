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
      ['2022 Vauxhall Mokka-e Launch Edition',51000,'Electric','Automatic','50 kWh EV',8850,13350,585,3,'Partial']
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
    '2017 Ford Fiesta Zetec':{
      retail:3950,sourcePrice:3979,sourceMiles:100923,tradeGuide:1750,
      source:'https://certmotors.com/vehicles/car/Ford/Fiesta',
      note:'Model-year/mileage regression, trim and condition unverified',confidence:'medium'},
    '2018 Volkswagen Polo SE':{
      retail:7550,sourcePrice:7599,sourceMiles:101539,tradeGuide:4250,
      source:'https://certmotors.com/vehicles/car/Volkswagen/Polo',
      note:'2018 model year and mileage model; trim needs validation',confidence:'medium'},
    '2020 Vauxhall Corsa SE Premium':{
      retail:6250,sourcePrice:5795,sourceMiles:101511,tradeGuide:3450,
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
    if(!evidence)return {...base,priceAudit:{
      status:'unverified',asOf:MARKET_2026_REVIEW_DATE,
      note:'Illustrative game guide/asking prices awaiting derivative, mileage and condition benchmarking.'}};
    const guide=evidence.tradeGuide;
    return {...base,guide,retail:evidence.retail,
      reserve:guide+Math.round(guide*.07/25)*25,
      rival:guide+Math.round(guide*.13/25)*25,
      ask:guide+Math.max(300,Math.round(guide*.08/25)*25),
      floor:guide-125,
      priceAudit:{
        status:'retail-comparable',asOf:MARKET_2026_REVIEW_DATE,
        confidence:evidence.confidence,source:evidence.source,
        comparisonAsk:evidence.sourcePrice,comparisonMiles:evidence.sourceMiles,
        note:evidence.note,
        tradeGuide:'Illustrative game-model assumption, not a verified auction result'
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
  function pick(group,tier,day,index,seen=new Set()){
    const accessible=pool(group,tier);
    // Mix all unlocked bands. The highest band appears more often without
    // erasing affordable stock or forcing unaffordable expensive lots.
    const weighting=tier==='starter'?['starter']:
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
  window.MotorTradeMarket=Object.freeze({TIERS,CATALOGUE,PRICING_2026,MARKET_2026_REVIEW_DATE,priceFor,tierFor,progress,pool,pick,sellersForDealDay,exchangeFor});
})();
