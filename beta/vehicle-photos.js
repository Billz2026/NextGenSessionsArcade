'use strict';
/* V0.9.2 real-vehicle photograph catalogue.
 * Each photograph below is a genuine Wikimedia Commons file with a verified
 * model/generation and colour. Never recolour a photograph or use another
 * colour/model when the exact match is absent.
 * URLs are served by Wikimedia; the game does not copy image bytes.
 */
(() => {
  const IMG=Object.freeze([
    {id:'qashqai-j11-black',model:'Nissan Qashqai',generation:'J11',start:2014,end:2017,
      color:'Black',file:'Nissan Qashqai Tekna (II) – Frontansicht, 24. August 2014, Düsseldorf.jpg',
      author:'M 93',license:'CC BY-SA 3.0 DE',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/de/deed.en',
      note:'Same generation and colour; pictured Tekna trim may differ'},
    {id:'focus-mk3-black',model:'Ford Focus',generation:'Mk3',start:2011,end:2018,
      color:'Black',file:'Ford Focus 2.0 TDCi Sport C346 Panther Black Metallic (2).jpg',
      author:'Damian B Oh',license:'CC BY-SA 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same Mk3 generation and black colour; trim may differ'},
    {id:'fiesta-mk7-red',model:'Ford Fiesta',generation:'Mk7 facelift',start:2013,end:2017,
      color:'Red',file:'2016 Ford Fiesta SE Hatchback in Ruby Red Metallic Tinted Clearcoat, Front Right, 2023-07-13.jpg',
      author:'Elise240SX',license:'CC BY-SA 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same facelift generation and red colour; market-specific trim may differ'},
    {id:'polo-6r-white',model:'Volkswagen Polo',generation:'6R facelift',start:2014,end:2017,
      color:'White',file:'2017 Volkswagen Polo (6R MY17) 66TSI Trendline 5-door hatchback (2017-07-15) 01.jpg',
      author:'EurovisionNim',license:'CC BY-SA 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same 6R facelift generation and white colour; trim may differ'},
    {id:'yaris-xp130-silver',model:'Toyota Yaris',generation:'XP130',start:2011,end:2014,
      color:'Silver',file:'2012 Toyota Yaris (NCP130R) YR 5-door hatchback (2012-06-04).jpg',
      author:'OSX',license:'Public domain',
      licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',
      note:'Same XP130 generation and silver colour; regional trim may differ'},
    {id:'corsa-d-red',model:'Vauxhall Corsa',generation:'D',start:2006,end:2014,
      color:'Red',file:'2014 Vauxhall Corsa Excite - 1229cc 1.2 (85PS) Petrol - Flame Red - 03-2024, Front.jpg',
      author:'Harvey Bold',license:'CC BY 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
      note:'Same Corsa D generation and red colour; photographed 2014 Excite trim'},
    {id:'208-facelift-silver',model:'Peugeot 208',generation:'Mk1 facelift',start:2015,end:2019,
      color:'Silver',file:'2016 Peugeot 208 Allure PureTech - 1200cc 1.2 (100PS) Petrol - Silver - 07-2024, Front.jpg',
      author:'Harvey Bold',license:'CC0 1.0',
      licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',
      note:'Same facelift generation, silver colour and Allure trim; specification may differ'},
    {id:'jazz-ge-grey',model:'Honda Jazz',generation:'GE',start:2008,end:2015,
      color:'Grey',file:'2014 Honda Jazz ES Plus i-VTEC - 1339cc 1.3 (100PS) Petrol - Grey - 02-2024, Front.jpg',
      author:'Harvey Bold',license:'CC BY 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
      note:'Same GE generation and grey colour; photographed ES Plus trim'},
    {id:'yaris-xp210-hybrid-red',model:'Toyota Yaris',generation:'XP210',start:2020,end:2022,
      color:'Red',fuel:'Hybrid',file:'2020 Toyota Yaris Design HEV CVT 1.5 Front.jpg',
      author:'Vauxford',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same XP210 generation and red colour; pictured UK Design hybrid'},
    {id:'jazz-mk4-hybrid-white',model:'Honda Jazz',generation:'Mk4',start:2020,end:2022,
      color:'White',fuel:'Hybrid',file:'2020 Honda Jazz SE i-MMD CVT 1.5 Front.jpg',
      author:'Vauxford',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same fourth-generation Jazz hybrid, white colour and UK SE trim'},
    {id:'qashqai-j12-white',model:'Nissan Qashqai',generation:'J12',start:2021,end:2023,
      color:'White',fuel:'Petrol',file:'2021 Nissan Qashqai Premiere Edition DIG-T - 1332cc 1.3 (140PS) Petrol - Arctic White - 04-2024, Front.jpg',
      author:'Harvey Bold',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
      note:'Same J12 body and white paint; pictured Premiere Edition, not Acenta'},
    {id:'corsa-f-electric-silver',model:'Vauxhall Corsa',generation:'F',start:2020,end:2022,
      color:'Silver',fuel:'Electric',file:'2021 Vauxhall Corsa-e Elite NAV.jpg',
      author:'Vauxford',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same F generation and silver colour; pictured Corsa-e Elite Nav'},
    {id:'peugeot-208-p21-blue',model:'Peugeot 208',generation:'P21',start:2020,end:2022,
      color:'Blue',fuel:'Petrol',file:'2020 Peugeot 208 GT Line PureTech 1.2 Front.jpg',
      author:'Vauxford',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same second-generation 208 and blue colour; photographed GT Line trim'},
    {id:'peugeot-e208-p21-grey',model:'Peugeot 208',generation:'P21',start:2020,end:2022,
      color:'Grey',fuel:'Electric',file:'2020 Peugeot e-208 Allure Front.jpg',
      author:'Vauxford',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same second-generation e-208, grey colour and Allure trim'},
    {id:'mg4-first-white',model:'MG4 EV',generation:'1st generation',start:2022,end:2025,
      color:'White',fuel:'Electric',file:'MG4 EV Automesse Ludwigsburg 2022 1X7A5874.jpg',
      author:'Alexander Migl',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'First-generation white MG4 EV; pictured trim may differ'},
    {id:'model3-white-pre-refresh',model:'Tesla Model 3',generation:'Pre-refresh',start:2019,end:2023,
      color:'White',fuel:'Electric',file:'2022-01-28 Tesla Model 3.jpg',
      author:'Lobester00',license:'CC BY-SA 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Pre-2024 body style and white paint; photographed market-spec trim may differ'},
    {id:'corsa-e-energy-red',model:'Vauxhall Corsa',generation:'E',start:2015,end:2019,
      color:'Red',fuel:'Petrol',
      file:'2019 Vauxhall Corsa Energy - 1398cc 1.4 (90PS) Petrol - Red - 01-2025, Front.jpg',
      author:'Harvey Bold',license:'CC0 1.0',
      licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',
      note:'Corsa E body and red paint; photographed 2019 Energy 1.4, trim and year may differ'},
    {id:'rio-yb-red',model:'Kia Rio',generation:'YB',start:2017,end:2022,
      color:'Red',
      file:'2017 Kia Rio (YB) S 5-door hatchback (2017-07-15) 01.jpg',
      author:'EurovisionNim',license:'CC BY-SA 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Rio YB body and red paint; photographed Australian S trim, specifications may differ'},
    {id:'yaris-xp130-facelift-silver',model:'Toyota Yaris',generation:'XP130 facelift',
      start:2017,end:2019,color:'Silver',fuel:'Petrol',
      file:'2018 Toyota Yaris LE in Classic Silver Metallic, Front Right, 04-03-2022.jpg',
      author:'Elise240SX',license:'CC BY-SA 4.0',
      licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
      note:'Same XP130 2017 facelift hatchback in silver; North American LE differs in trim'}
  ]);
  const PHOTO_LIBRARY=Object.freeze(IMG.map(x=>Object.freeze(x)));
  // The generation catalogue covers the entire fictional 2026 stock pool.
  // Existing historic names retain their original generation when reloaded.
  const RANGES=Object.freeze([
    {model:'Ford Focus',name:'Mk3',from:2011,to:2018},
    {model:'Ford Focus',name:'Mk4',from:2019,to:2021},
    {model:'Ford Focus',name:'Mk4 facelift',from:2022,to:2025},
    {model:'Ford Fiesta',name:'Mk7 facelift',from:2013,to:2017},
    {model:'Ford Fiesta',name:'Mk8',from:2018,to:2023},
    {model:'Ford Puma',name:'Mk2',from:2019,to:2026},
    {model:'Volkswagen Polo',name:'6R facelift',from:2014,to:2017},
    {model:'Volkswagen Polo',name:'AW',from:2018,to:2021},
    {model:'Volkswagen Polo',name:'AW facelift',from:2022,to:2026},
    {model:'Volkswagen Golf',name:'Mk7',from:2012,to:2019},
    {model:'Volkswagen Golf',name:'Mk8',from:2020,to:2023},
    {model:'Volkswagen Golf',name:'Mk8 facelift',from:2024,to:2026},
    {model:'Vauxhall Corsa',name:'D',from:2006,to:2014},
    {model:'Vauxhall Corsa',name:'E',from:2015,to:2019},
    {model:'Vauxhall Corsa',name:'F',from:2020,to:2023},
    {model:'Vauxhall Corsa',name:'F facelift',from:2024,to:2026},
    {model:'Vauxhall Mokka',name:'Mk2',from:2021,to:2024},
    {model:'Vauxhall Mokka',name:'Mk2 facelift',from:2025,to:2026},
    {model:'Peugeot 208',aliases:['Peugeot 208','Peugeot e-208'],name:'Mk1 facelift',from:2015,to:2019},
    {model:'Peugeot 208',aliases:['Peugeot 208','Peugeot e-208'],name:'P21',from:2020,to:2023},
    {model:'Peugeot 208',aliases:['Peugeot 208','Peugeot e-208'],name:'P21 facelift',from:2024,to:2026},
    {model:'Hyundai i20',name:'GB',from:2014,to:2020},
    {model:'Hyundai i20',name:'BC3',from:2021,to:2026},
    {model:'Hyundai Tucson',name:'NX4',from:2021,to:2026},
    {model:'Hyundai Ioniq 5',name:'NE',from:2021,to:2026},
    {model:'Toyota Yaris',name:'XP130',from:2011,to:2014},
    {model:'Toyota Yaris',name:'XP130 facelift',from:2015,to:2019},
    {model:'Toyota Yaris',name:'XP210',from:2020,to:2026},
    {model:'Toyota Corolla',name:'E210',from:2019,to:2026},
    {model:'Honda Jazz',name:'GE',from:2008,to:2015},
    {model:'Honda Jazz',name:'GK',from:2016,to:2019},
    {model:'Honda Jazz',name:'Mk4',from:2020,to:2026},
    {model:'Kia Rio',name:'UB',from:2011,to:2016},
    {model:'Kia Rio',name:'YB',from:2017,to:2026},
    {model:'Kia Sportage',name:'NQ5',from:2021,to:2026},
    {model:'Nissan Qashqai',name:'J11',from:2014,to:2020},
    {model:'Nissan Qashqai',name:'J12',from:2021,to:2023},
    {model:'Nissan Qashqai',name:'J12 facelift',from:2024,to:2026},
    {model:'Nissan Leaf',name:'ZE1',from:2018,to:2024},
    {model:'MG4 EV',name:'1st generation',from:2022,to:2025},
    {model:'Tesla Model 3',name:'Pre-refresh',from:2019,to:2023},
    {model:'Tesla Model 3',name:'Highland',from:2024,to:2026},
    {model:'Tesla Model Y',name:'Pre-refresh',from:2021,to:2024},
    {model:'Tesla Model Y',name:'Juniper',from:2025,to:2026},
    {model:'BMW 3 Series',aliases:['BMW 320d','BMW 330e'],name:'G20',from:2019,to:2026},
    {model:'BMW X5',name:'G05',from:2018,to:2026},
    {model:'Audi A3',name:'8Y',from:2020,to:2026},
    {model:'Audi Q5',name:'FY',from:2017,to:2024},
    {model:'Audi e-tron',name:'GE',from:2018,to:2022},
    {model:'Mercedes-Benz A-Class',aliases:['Mercedes-Benz A200'],name:'W177',from:2018,to:2026},
    {model:'Mercedes-Benz E-Class',aliases:['Mercedes-Benz E300e'],name:'W213 facelift',from:2020,to:2023},
    {model:'Mercedes-Benz S-Class',aliases:['Mercedes-Benz S350d'],name:'W223',from:2021,to:2026},
    {model:'Volvo XC40',name:'Mk1',from:2018,to:2026},
    {model:'Porsche Macan',name:'95B',from:2014,to:2024},
    {model:'Porsche Taycan',name:'J1',from:2019,to:2023},
    {model:'Range Rover Velar',name:'L560',from:2017,to:2026},
    {model:'Range Rover Sport',name:'L461',from:2022,to:2026},
    {model:'Land Rover Defender',name:'L663',from:2020,to:2026}
  ]);
  const COLOURS=Object.freeze(['Black','Silver','Grey','White','Blue','Red']);
  // Stable, neutral-heavy UK-style paint distribution for fictional lots.
  // A game's paint colour must never be chosen to fit an available image:
  // the car exists first; a representative photograph may or may not exist.
  const PAINT_POOL=Object.freeze(['Black','Grey','White','Silver','Black',
    'Grey','White','Silver','Blue','Red']);
  function hash(s){let x=2166136261;for(const c of String(s))x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;return x>>>0;}
  function identity(vehicle){
    const title=String(vehicle?.title||'');
    const year=Number(title.slice(0,4));
    const spec=RANGES.find(x=>(x.aliases||[x.model]).some(name=>title.includes(name))&&
      year>=x.from&&year<=x.to);
    // New UK models without an individually checked generation retain their
    // truthful name and a visible unverified-generation status. Never invent a
    // Mk code or select a similar-looking photograph for these vehicles.
    const namedModel=title.replace(/^\d{4}\s+/,'').trim()||'Unspecified vehicle';
    return {model:spec?.model??namedModel,
      generation:spec?.name??'Generation not yet verified',
      year:Number.isInteger(year)?year:0};
  }
  function describe(car){
    const id=identity(car);
    const key=car.origin||car.id||car.title;
    const color=PAINT_POOL[hash(String(key)+'|paint')%PAINT_POOL.length];
    return {...id,color};
  }
  function select(car){
    if(!car)return null;
    const id=identity(car);
    const colour=car.color;
    // A stored vehicle generation must agree with the generation derived
    // from its title; never silently use a mismatched photograph.
    if(car.generation!==id.generation)return null;
    if(typeof colour!=='string'||!COLOURS.includes(colour))return null;
    return PHOTO_LIBRARY.find(x=>x.model===id.model&&
      x.generation===id.generation&&x.color===colour&&
      (!x.fuel||!car.fuel||x.fuel===car.fuel)&&
      id.year>=x.start&&id.year<=x.end)||null;
  }
  function url(photo){
    return photo?
      'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(photo.file)+'?width=960':null;
  }
  function source(photo){
    return photo?
      'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(photo.file).replace(/%20/g,'_'):null;
  }
  window.MotorTradePhotos=Object.freeze({LIBRARY:PHOTO_LIBRARY,COLOURS,
    identity,describe,select,url,source});
})();