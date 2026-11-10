'use strict';
/* V0.9.1 real-vehicle photograph catalogue.
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
      note:'Same XP130 generation and silver colour; regional trim may differ'}
  ]);
  const PHOTO_LIBRARY=Object.freeze(IMG.map(x=>Object.freeze(x)));
  const RANGES=Object.freeze([
    {model:'Ford Focus',name:'Mk3',from:2011,to:2018},
    {model:'Ford Fiesta',name:'Mk7 facelift',from:2013,to:2017},
    {model:'Volkswagen Polo',name:'6R facelift',from:2014,to:2017},
    {model:'Nissan Qashqai',name:'J11',from:2014,to:2017},
    {model:'Peugeot 208',name:'Mk1 facelift',from:2015,to:2019},
    {model:'Vauxhall Corsa',name:'D',from:2006,to:2014},
    {model:'Vauxhall Corsa',name:'E',from:2015,to:2019},
    {model:'Hyundai i20',name:'GB',from:2014,to:2020},
    {model:'Toyota Yaris',name:'XP130',from:2011,to:2014},
    {model:'Toyota Yaris',name:'XP130 facelift',from:2015,to:2017},
    {model:'Honda Jazz',name:'GE',from:2008,to:2015},
    {model:'Kia Rio',name:'UB',from:2011,to:2017},
    {model:'Volkswagen Golf',name:'Mk7',from:2012,to:2019}
  ]);
  const COLOURS=Object.freeze(['Black','Silver','Grey','White','Blue','Red']);
  function hash(s){let x=2166136261;for(const c of String(s))x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;return x>>>0;}
  function identity(vehicle){
    const title=String(vehicle?.title||'');
    const year=Number(title.slice(0,4));
    const spec=RANGES.find(x=>title.includes(x.model)&&year>=x.from&&year<=x.to);
    return {model:spec?.model??'Unknown',generation:spec?.name??'Unknown',year:Number.isInteger(year)?year:0};
  }
  function describe(car){
    const id=identity(car);
    const preferred=PHOTO_LIBRARY.filter(x=>x.model===id.model&&x.generation===id.generation&&id.year>=x.start&&id.year<=x.end);
    const key=car.origin||car.id||car.title;
    // All vehicles have one immutable colour. The first image's real colour
    // is prioritised for existing catalogue coverage; some vehicles still
    // have other colours with a deliberately explicit photo placeholder.
    const color=preferred.length&&hash(String(key)+'|colour')%5!==0?
      preferred[hash(String(key)+'|photo')%preferred.length].color:
      COLOURS[hash(String(key)+'|palette')%COLOURS.length];
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