'use strict';
/**
 * UK observed auction RESULTS and UK retail ADVERTS (small manual research sample).
 * Date checked: 13 November 2026. This is NOT a licensed trade-price feed.
 *
 * The auctioneer displays "Sale Price" (or a completed lot price); its fee and
 * VAT inclusion in that displayed amount must be confirmed against an invoice.
 * It is NOT an automatic BCA Blue Standard hammer / trade guide.
 *
 * All retail figures are ASKING prices on DIFFERENT physical cars.
 * No record is authorised for automatic repricing or forecasted profits.
 * Only small factual excerpts of primary lot results, not copyrighted photos
 * or listing text, are retained with source links for provenance.
 */
(() => {
 const AUCTION=Object.freeze([
  {
    "id": "BW-2026-10-08-11",
    "auction": "Brightwells Cars",
    "saleDate": "2026-10-08",
    "lotNo": 11,
    "make": "Toyota",
    "model": "Aygo",
    "trim": "x-play",
    "year": 2021,
    "miles": 12716,
    "engine": "1.0 VVT-i",
    "fuel": "Petrol",
    "gearbox": "Manual",
    "body": "hatchback",
    "doors": 5,
    "priceGBP": 6100,
    "buyerPremiumRate": 0.075,
    "buyerPremiumMinimumGBP": 250,
    "priceIncludesFees": null,
    "sourceUrl": "https://fd.brightwells.com/department/cars/sale/6059/lot/924094",
    "notes": "Lot listed as x-play TSS 998cc 5-speed manual; No VAT on vehicle; seller Company; V5 absent at lot; MOT 7 Oct 2026. Reported sale/bid price basis relative to buyer premium unconfirmed."
  },
  {
    "id": "BW-2026-11-05-62",
    "auction": "Brightwells Cars",
    "saleDate": "2026-11-05",
    "lotNo": 62,
    "make": "Ford",
    "model": "Fiesta",
    "trim": "ST-2",
    "year": 2021,
    "miles": 34090,
    "engine": "1.5 EcoBoost 200",
    "fuel": "Petrol",
    "gearbox": "Manual",
    "body": "hatchback",
    "doors": 5,
    "priceGBP": 8551,
    "buyerPremiumRate": 0.075,
    "buyerPremiumMinimumGBP": 375,
    "priceIncludesFees": null,
    "sourceUrl": "https://fd.brightwells.com/department/cars/sale/6065/lot/930811",
    "notes": "2021 5-door ST-2 Turbo 1,496cc six-speed manual petrol; seller Police; vehicle VAT status Inclusive of VAT; buyer premium excludes VAT. Auction lists four services, but condition and prep costs remain unknown."
  },
  {
    "id": "BW-2026-11-05-08",
    "auction": "Brightwells Cars",
    "saleDate": "2026-11-05",
    "lotNo": 8,
    "make": "Audi",
    "model": "A3",
    "trim": "Sport 40 TFSI e",
    "year": 2022,
    "miles": 74925,
    "engine": "1.4 TFSI plug-in hybrid",
    "fuel": "Plug-in Hybrid",
    "gearbox": "Automatic",
    "body": "hatchback",
    "doors": 5,
    "priceGBP": 10900,
    "buyerPremiumRate": null,
    "buyerPremiumMinimumGBP": null,
    "priceIncludesFees": null,
    "sourceUrl": "https://fd.brightwells.com/department/cars/sale/6065/lot/932077",
    "notes": "2022 A3 Sport 40 TFSI e S-tronic 5-door, Brightwells public sale results. Lot-specific VAT and buyer premium not independently recorded here."
  },
  {
    "id": "BW-2026-10-08-06",
    "auction": "Brightwells Cars",
    "saleDate": "2026-10-08",
    "lotNo": 6,
    "make": "Ford",
    "model": "Fiesta",
    "trim": "Zetec TDCi",
    "year": 2018,
    "miles": 61602,
    "engine": "TDCi output not confirmed",
    "fuel": "Diesel",
    "gearbox": "Manual",
    "body": "hatchback",
    "doors": 5,
    "priceGBP": 4333,
    "buyerPremiumRate": null,
    "buyerPremiumMinimumGBP": null,
    "priceIncludesFees": null,
    "sourceUrl": "https://fd.brightwells.com/department/cars/sale/6059?pageSize=100",
    "notes": "Primary catalogue records 2018 Fiesta Zetec TDCi 61,602mi sale £4,333; diesel not comparable with petrol Zetec game templates, engine output not verified."
  },
  {
    "id": "BW-2026-10-08-02",
    "auction": "Brightwells Cars",
    "saleDate": "2026-10-08",
    "lotNo": 2,
    "make": "Kia",
    "model": "Ceed",
    "trim": "2 CRDi ISG",
    "year": 2019,
    "miles": 41157,
    "engine": "CRDi unspecified",
    "fuel": "Diesel",
    "gearbox": "Unknown",
    "body": "estate",
    "doors": 5,
    "priceGBP": 6530,
    "buyerPremiumRate": null,
    "buyerPremiumMinimumGBP": null,
    "priceIncludesFees": null,
    "sourceUrl": "https://fd.brightwells.com/department/cars/sale/6059?pageSize=100",
    "notes": "2019 Kia Ceed 2 CRDi estate, not 2021 Ceed 2 petrol hatchback in UK beta. Transmission and exact diesel output unconfirmed."
  },
  {
    "id": "BW-2026-11-05-19",
    "auction": "Brightwells Cars",
    "saleDate": "2026-11-05",
    "lotNo": 19,
    "make": "Kia",
    "model": "Niro",
    "trim": "3 PHEV",
    "year": 2021,
    "miles": 40806,
    "engine": "1.6 petrol plug-in hybrid",
    "fuel": "Plug-in Hybrid",
    "gearbox": "Automatic",
    "body": "estate",
    "doors": 5,
    "priceGBP": 10870,
    "buyerPremiumRate": null,
    "buyerPremiumMinimumGBP": null,
    "priceIncludesFees": null,
    "sourceUrl": "https://fd.brightwells.com/department/cars/sale/6065?pageSize=All",
    "notes": "2021 Niro 3 PHEV S-A, not the catalogue's 2020 Niro 2 self-charging HEV; not eligible cross-powertrain comparable."
  },
  {
    "id": "BW-2026-11-05-72",
    "auction": "Brightwells Cars",
    "saleDate": "2026-11-05",
    "lotNo": 72,
    "make": "Peugeot",
    "model": "3008",
    "trim": "Allure BlueHDi",
    "year": 2021,
    "miles": 142190,
    "engine": "BlueHDi output unverified",
    "fuel": "Diesel",
    "gearbox": "Unknown",
    "body": "suv",
    "doors": 5,
    "priceGBP": 2500,
    "buyerPremiumRate": null,
    "buyerPremiumMinimumGBP": null,
    "priceIncludesFees": null,
    "sourceUrl": "https://fd.brightwells.com/department/cars/sale/6065?pageSize=All",
    "notes": "High mileage 142,190mi explicitly UNWARRANTED; game has 2021 3008 1.5 BlueHDi 130 EAT8 at 74k miles. Never use as same-grade calibration."
  },
  {
    "id": "BW-2026-11-05-87",
    "auction": "Brightwells Cars",
    "saleDate": "2026-11-05",
    "lotNo": 87,
    "make": "Tesla",
    "model": "Model Y",
    "trim": "Performance AWD",
    "year": 2023,
    "miles": 71791,
    "engine": "Dual motor Performance",
    "fuel": "Electric",
    "gearbox": "Automatic",
    "body": "suv",
    "doors": 5,
    "priceGBP": 20270,
    "buyerPremiumRate": null,
    "buyerPremiumMinimumGBP": null,
    "priceIncludesFees": null,
    "sourceUrl": "https://fd.brightwells.com/department/cars/sale/6065?pageSize=All",
    "notes": "Tesla Model Y Performance AWD, not the game Model Y Long Range; trim and range/battery differ. Conditions of sale and fee treatment unverified."
  }
].map(Object.freeze));
 const RETAIL=Object.freeze([
  {
    "id": "ATU-2026-09-25-AYGO",
    "snapshotDate": "2026-09-25",
    "make": "Toyota",
    "model": "Aygo",
    "trim": "x-play",
    "year": 2021,
    "miles": 12709,
    "engine": "1.0 VVT-i",
    "fuel": "Petrol",
    "gearbox": "Manual",
    "body": "hatchback",
    "doors": 5,
    "askingGBP": 9010,
    "sourceUrl": "https://www.autouncle.co.uk/en-gb/d/43946816-used-2021-toyota-aygo-x-play-72-bhp",
    "notes": "Retail advert £9,010, 12,709mi, 5-door manual petrol as of 25 Sep 2026. A different vehicle, with advertised asking (not achieved) price."
  },
  {
    "id": "CG-2026-11-13-ST2",
    "snapshotDate": "2026-11-13",
    "make": "Ford",
    "model": "Fiesta",
    "trim": "ST-2",
    "year": 2021,
    "miles": 32000,
    "engine": "1.5 EcoBoost 200",
    "fuel": "Petrol",
    "gearbox": "Manual",
    "body": "hatchback",
    "doors": 5,
    "askingGBP": 14990,
    "sourceUrl": "https://www.cargurus.co.uk/Cars/l-Used-2021-Ford-Fiesta-ST-2-ev673049",
    "notes": "UK dealer advertised ST-2 Navigation 5dr 32,000mi at £14,990; as-observed 13 Nov 2026, different unit from auction."
  },
  {
    "id": "TF-2026-11-13-ST2",
    "snapshotDate": "2026-11-13",
    "make": "Ford",
    "model": "Fiesta",
    "trim": "ST-2",
    "year": 2021,
    "miles": 47000,
    "engine": "1.5 EcoBoost 200",
    "fuel": "Petrol",
    "gearbox": "Manual",
    "body": "hatchback",
    "doors": 5,
    "askingGBP": 12895,
    "sourceUrl": "https://www.tfcarshinckley.co.uk/used-ford-fiesta-hinckley-leicestershire-8296399",
    "notes": "UK dealer advertised 2021 1.5T 200PS ST-2 5-door manual, 47,000mi at £12,895; longer mileage than auction."
  },
  {
    "id": "ATU-2026-11-11-A3",
    "snapshotDate": "2026-11-11",
    "make": "Audi",
    "model": "A3",
    "trim": "Sport 40 TFSI e",
    "year": 2022,
    "miles": 75972,
    "engine": "1.4 TFSI plug-in hybrid",
    "fuel": "Plug-in Hybrid",
    "gearbox": "Automatic",
    "body": "unknown",
    "doors": 5,
    "askingGBP": 14295,
    "sourceUrl": "https://www.autouncle.co.uk/en-gb/d/44718974-used-2022-audi-a3-sport",
    "notes": "2022 A3 Sport 40 TFSI e 5dr S tronic £14,295 at 75,972mi. Aggregator contradicts itself on sedan vs 5-door body, so body match NOT certified."
  }
].map(Object.freeze));
 const PAIRS=Object.freeze([
  {
    "auctionId": "BW-2026-10-08-11",
    "retailId": "ATU-2026-09-25-AYGO",
    "status": "matched-derivative-unadjusted",
    "note": "2021 Aygo x-play manual, same 5-door body and virtually identical mileage; retail ad was recorded 13 days BEFORE auction. Different physical cars; source says TSS on auction unit; no evidence of equal condition."
  },
  {
    "auctionId": "BW-2026-11-05-62",
    "retailId": "CG-2026-11-13-ST2",
    "status": "matched-derivative-unadjusted",
    "note": "2021 Fiesta ST-2 5dr 1.5 turbo manual, 2,090-mile difference, 8 days between auction close and observed retail advert; 2 different vehicles, options/condition can differ."
  },
  {
    "auctionId": "BW-2026-11-05-62",
    "retailId": "TF-2026-11-13-ST2",
    "status": "matched-derivative-unadjusted",
    "note": "2021 ST-2 5dr manual same powertrain; 12,910-mile difference and possible equipment variation; less strong than the 32k-mile retail listing."
  },
  {
    "auctionId": "BW-2026-11-05-08",
    "retailId": "ATU-2026-11-11-A3",
    "status": "body-verification-needed",
    "note": "2022 A3 40 TFSI e Sport S tronic matches broadly but retailer body tagged Sedan despite 5dr description; refuse high-confidence body match."
  }
].map(Object.freeze));
 const byId=(arr,id)=>arr.find(x=>x.id===id);
 const integer=n=>Number.isSafeInteger(n)&&n>0;
 const dayDifference=(a,b)=>Math.abs(Math.round((Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/86400000));
 const sameDerivative=(sale,ask)=>{
   if(!sale||!ask)return false;
   for(const key of ['make','model','trim','year','engine','fuel','gearbox','body','doors']){
     if(sale[key]!==ask[key]||sale[key]==='unknown'||ask[key]==='unknown'||sale[key]==='Unknown'||ask[key]==='Unknown')return false;
   }
   return Math.abs(sale.miles-ask.miles)<=Math.max(5000,Math.round(sale.miles*.30))&&
      dayDifference(sale.saleDate,ask.snapshotDate)<=60;
 };
 const spread=(auctionId,retailId)=>{
   const a=byId(AUCTION,auctionId),r=byId(RETAIL,retailId);
   if(!a||!r)return null;
   return Object.freeze({auctionId,retailId,
     sameDerivative:sameDerivative(a,r),
     grossDifferenceInAdvertAndReportedAuctionPrices:r.askingGBP-a.priceGBP,
     classifiedAs:'UNADJUSTED DIFFERENT-CAR ASK-MINUS-RESULT — NOT REALISED DEALER PROFIT',
     includesFees:false,retailSaleConfirmed:false});
 };
 const snapshotFor=template=>{
   // Strict by design: BCA-settled simulated lots have NO verified,
   // account-specific BCA wholesale sold data in this public Brightwells
   // source sample. Cross-auctioneer fees/condition must NOT be substituted.
   // We also require >=3 exact independent sold-price observations and
   // >=3 retail listings from compatible mileage, before even reviewing a
   // prospective source-based game guide. No auto price changes.
   const exact=AUCTION.filter(x=>x.make+' '+x.model+' '+x.trim===
      String(template?.title||'').replace(/^\\d{4}\\s+/,'') &&
      x.year===Number(String(template.title).slice(0,4)) &&
      x.fuel===template.fuel&&x.gearbox===template.gearbox);
   return Object.freeze({status:'not-calibrated',templateTitle:template?.title||'',
      directlyComparablePublicSales:exact.length,requiredIndependentSales:3,
      eligibleBcaSoldPrices:0,priceToApply:null,
      note:'Brightwells sale results and dealer retail asks are different evidence types; BCA tariff, condition and exact UK derivative comparability are unproven. Do not reprice this model.'});
 };
 if(AUCTION.length!==8||RETAIL.length!==4||PAIRS.length!==4||
    new Set(AUCTION.map(x=>x.id)).size!==AUCTION.length||
    new Set(RETAIL.map(x=>x.id)).size!==RETAIL.length)throw Error('Invalid UK observed-market evidence');
 for(const a of AUCTION){
   if(!integer(a.priceGBP)||!integer(a.miles)||a.year<2010||a.year>2026||
     !a.sourceUrl.startsWith('https://')||a.priceIncludesFees!==null||
     !Number.isSafeInteger(a.lotNo))throw Error('Invalid auction evidence '+a.id);
 }
 for(const r of RETAIL){
   if(!integer(r.askingGBP)||!integer(r.miles)||!r.sourceUrl.startsWith('https://'))
     throw Error('Invalid retail evidence '+r.id);
 }
 for(const p of PAIRS){
   if(!byId(AUCTION,p.auctionId)||!byId(RETAIL,p.retailId))throw Error('Broken pair '+p.auctionId);
 }
 window.MotorTradeObservedMarket=Object.freeze({AUCTION,RETAIL,PAIRS,sameDerivative,spread,snapshotFor,
   auditedAt:'2026-11-13',kind:'public-observations-only-no-automatic-prices'});
})();
