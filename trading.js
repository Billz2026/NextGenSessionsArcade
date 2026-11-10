'use strict';
/*
 * The Motor Trade — deterministic, fictional trading engine.
 * Prices and buyer behaviour are gameplay examples, not live valuations.
 * Gross trading margin is before tax, VAT adjustments and business overheads.
 */
(() => {
  const STARTING_CASH = 12500;
  const CAPACITY = 2;
  const VERSION = 2;
  const MAX_DAY = 36500;
  const AUCTIONS = Object.freeze([
    {title:'2016 Ford Focus Zetec',miles:81240,fuel:'Diesel',gearbox:'Manual',grade:'3',history:'Partial',guide:2950,reserve:3200,rival:3525,fee:285,prep:430,retail:6350,note:'Door paint marks, front tyres and incomplete service paperwork'},
    {title:'2014 Vauxhall Corsa Excite',miles:65410,fuel:'Petrol',gearbox:'Manual',grade:'2',history:'Full',guide:1900,reserve:2150,rival:2380,fee:225,prep:250,retail:4850,note:'Minor cosmetic wear and routine service due'},
    {title:'2017 Volkswagen Polo Match',miles:72880,fuel:'Petrol',gearbox:'Manual',grade:'3',history:'Partial',guide:3650,reserve:4100,rival:4430,fee:315,prep:390,retail:7250,note:'Scuffed alloy and brake advisory requiring attention'},
    {title:'2015 Nissan Qashqai Acenta',miles:96820,fuel:'Diesel',gearbox:'Manual',grade:'4',history:'Partial',guide:3400,reserve:3800,rival:4090,fee:335,prep:570,retail:7800,note:'Suspension knock and bodywork repairs in estimate'},
    {title:'2016 Peugeot 208 Allure',miles:60320,fuel:'Petrol',gearbox:'Manual',grade:'2',history:'Full',guide:2450,reserve:2700,rival:2970,fee:245,prep:260,retail:5450,note:'Recent MOT; tyres and servicing to confirm'}
  ]);
  const SELLERS = Object.freeze([
    {title:'2015 Hyundai i20 SE',miles:68700,fuel:'Petrol',gearbox:'Manual',history:'Full',ask:3300,floor:2975,prep:260,retail:5250,note:'Owner changing cars; service due soon'},
    {title:'2012 Toyota Yaris TR',miles:79300,fuel:'Petrol',gearbox:'Manual',history:'Partial',ask:2800,floor:2475,prep:230,retail:4450,note:'Walk-in seller; fresh MOT recommended'},
    {title:'2017 Ford Fiesta Zetec',miles:59340,fuel:'Petrol',gearbox:'Manual',history:'Full',ask:4950,floor:4580,prep:330,retail:7480,note:'Private seller upgrading; cosmetic scratches'},
    {title:'2014 Honda Jazz ES',miles:72550,fuel:'Petrol',gearbox:'Manual',history:'Full',ask:3450,floor:3150,prep:250,retail:5400,note:'Independent inspection advised before resale'}
  ]);
  const EXCHANGES = Object.freeze([
    {title:'2012 Vauxhall Corsa SXi',miles:99200,fuel:'Petrol',gearbox:'Manual',history:'Partial',ask:1900,floor:1650,prep:310,retail:3700,note:'Part-ex valuation; clutch and tyres require inspection'},
    {title:'2014 Kia Rio 2',miles:85420,fuel:'Petrol',gearbox:'Manual',history:'Partial',ask:2250,floor:1975,prep:290,retail:4550,note:'Part-ex valuation; cosmetic damage and service due'},
    {title:'2013 Ford Focus Titanium',miles:103800,fuel:'Diesel',gearbox:'Manual',history:'Partial',ask:2700,floor:2400,prep:480,retail:4950,note:'Part-ex valuation; higher-mileage risk'}
  ]);
  const integer = value => Number.isSafeInteger(value);
  const cashValue = value => integer(value) && value >= 0 && value <= 100000000;
  const own = (arr, id) => arr.find(v => v.id === id);
  const sum = (items, key) => items.reduce((total, item) => total + item[key], 0);
  function market(day) {
    const auctions = Array.from({length:3}, (_,i) => ({
      ...AUCTIONS[(day - 1 + i) % AUCTIONS.length],
      id:'A-' + day + '-' + i, kind:'auction', day
    }));
    const sellers = Array.from({length:2}, (_,i) => ({
      ...SELLERS[(day - 1 + i) % SELLERS.length],
      id:'S-' + day + '-' + i, kind:'seller', day
    }));
    return {auctions,sellers};
  }
  function create(name, messages) {
    return {
      version:VERSION,name,day:1,cash:STARTING_CASH,capacity:CAPACITY,
      stock:0,sales:0,reputation:'NEWCOMER',messages,
      vehicles:[],sold:[],ledger:[],nextId:1
    };
  }
  function normalize(saved) {
    if (!saved || ![1,VERSION].includes(saved.version) ||
      typeof saved.name !== 'string' || saved.name.trim().length < 2 ||
      saved.name.trim().length > 36 || !integer(saved.day) ||
      saved.day < 1 || saved.day > MAX_DAY || !Array.isArray(saved.messages)) return null;
    const validMessages = saved.messages.every(m =>
      m && integer(m.id) && integer(m.day) && typeof m.from === 'string' &&
      typeof m.subject === 'string' && typeof m.preview === 'string' &&
      typeof m.body === 'string' && typeof m.read === 'boolean' &&
      (m.linkPage === null || ['dashboard','inbox','auctions','stock','sales','finance','business'].includes(m.linkPage)));
    if (!validMessages) return null;
    const messages = saved.messages.map(m => ({
      id:m.id,day:m.day,from:m.from,subject:m.subject,preview:m.preview,
      body:m.body,linkPage:m.linkPage,read:m.read
    }));
    if (saved.version === 1) {
      // Previous release contained no trade transactions; keep name, day and inbox.
      if (saved.cash !== STARTING_CASH || saved.capacity !== CAPACITY) return null;
      return {...create(saved.name.trim(),messages),day:saved.day};
    }
    if (saved.capacity !== CAPACITY || !Array.isArray(saved.vehicles) ||
      !Array.isArray(saved.sold) || !Array.isArray(saved.ledger) ||
      !integer(saved.nextId) || saved.nextId < 1 ||
      !cashValue(saved.cash) || saved.vehicles.length > CAPACITY ||
      saved.vehicles.length > 250 || saved.sold.length > 20000 ||
      saved.ledger.length > 60000) return null;
    const goodVehicle = v => v && integer(v.id) && v.id > 0 && typeof v.title === 'string' &&
      v.title.length > 2 && v.title.length < 100 &&
      ['auction','seller','part-ex'].includes(v.source) &&
      ['acquired','prepared','listed'].includes(v.status) &&
      cashValue(v.cost) && cashValue(v.prepBudget) && cashValue(v.prepSpent) &&
      (v.prepSpent === 0 || v.prepSpent === v.prepBudget) &&
      cashValue(v.retail) && integer(v.acquiredDay) &&
      v.acquiredDay >= 1 && v.acquiredDay <= saved.day &&
      (v.status !== 'listed' || (cashValue(v.asking) && v.asking > 0)) &&
      (v.status === 'acquired' || v.prepSpent === v.prepBudget) &&
      (v.cashOffer === null || v.cashOffer === undefined || cashValue(v.cashOffer));
    const goodSold = s => s && integer(s.id) && typeof s.title === 'string' &&
      integer(s.day) && s.day >= 1 && s.day <= saved.day &&
      cashValue(s.price) && integer(s.profit) && ['cash','part-ex'].includes(s.mode);
    const goodLedger = l => l && integer(l.day) && l.day >= 1 && l.day <= saved.day &&
      integer(l.delta) && Math.abs(l.delta) <= 10000000 &&
      typeof l.note === 'string' && l.note.length < 200;
    if (!saved.vehicles.every(goodVehicle) || !saved.sold.every(goodSold) ||
        !saved.ledger.every(goodLedger)) return null;
    const ids = [...saved.vehicles,...saved.sold].map(v => v.id);
    if (new Set(ids).size !== ids.length || ids.some(id => id >= saved.nextId)) return null;
    const balance = STARTING_CASH + sum(saved.ledger,'delta');
    if (balance !== saved.cash || balance < 0 || balance > 100000000) return null;
    return {
      version:VERSION,name:saved.name.trim(),day:saved.day,cash:balance,capacity:CAPACITY,
      stock:saved.vehicles.length,sales:saved.sold.length,
      reputation:reputation(saved.sold.length),messages,
      vehicles:saved.vehicles.map(v => ({...v})),
      sold:saved.sold.map(v => ({...v})),
      ledger:saved.ledger.map(v => ({...v})),nextId:saved.nextId
    };
  }
  function reputation(sales) {
    return sales >= 12 ? 'ESTABLISHED' : sales >= 5 ? 'LOCAL TRADER' :
      sales >= 2 ? 'UP-AND-COMING' : 'NEWCOMER';
  }
  const fail = (code, message) => ({ok:false,code,message});
  const success = message => ({ok:true,message});
  function pay(state, delta, note) {
    state.cash += delta;
    state.ledger.push({day:state.day,delta,note});
  }
  function addCar(state, template, source, cost, ref) {
    const v = {
      id:state.nextId++,title:template.title,miles:template.miles,
      fuel:template.fuel,gearbox:template.gearbox,history:template.history,
      note:template.note,retail:template.retail,
      source,origin:ref,cost,prepBudget:template.prep,
      prepSpent:0,status:'acquired',asking:null,cashOffer:null,acquiredDay:state.day,
      listedDay:null
    };
    state.vehicles.push(v);
    state.stock = state.vehicles.length;
    return v;
  }
  function canBuy(state, cost, preparation) {
    if (state.vehicles.length >= state.capacity) return fail('capacity','Your forecourt is full. Sell a vehicle before buying another.');
    // No lending or wholesale exit yet: reserve preparation for *all* acquired cars.
    // Otherwise a second purchase could consume the cash needed to retail the first.
    const pendingPrep = state.vehicles.filter(v => v.status === 'acquired')
      .reduce((total, v) => total + v.prepBudget, 0);
    if (cost + preparation + pendingPrep > state.cash)
      return fail('cash','Not enough cash to buy this car while reserving all required stock preparation.');
    return null;
  }
  function acquireAuction(state, id, bid) {
    const lot = market(state.day).auctions.find(v => v.id === id);
    if (!lot) return fail('expired','This auction lot is no longer available today.');
    if (!integer(bid) || bid < lot.guide || bid > 100000) return fail('bid','Bid at least the displayed guide with a valid whole-pound amount.');
    const blocked = canBuy(state,bid + lot.fee,lot.prep);
    if (blocked) return blocked;
    if (state.vehicles.some(v => v.origin === lot.id)) return fail('owned','This lot is already on your forecourt.');
    if (bid < Math.max(lot.rival,lot.reserve))
      return fail('outbid','Outbid by another trader. Increase your maximum bid or walk away.');
    pay(state,-(bid + lot.fee),'Auction purchase: ' + lot.title + ' (bid ' + bid + ', buyer fee ' + lot.fee + ')');
    addCar(state,lot,'auction',bid + lot.fee,lot.id);
    return success('You won ' + lot.title + ' for ' + bid + ' plus ' + lot.fee + ' in auction fees.');
  }
  function acquireSeller(state, id, offer) {
    const car = market(state.day).sellers.find(v => v.id === id);
    if (!car) return fail('expired','That private seller is no longer available today.');
    if (!integer(offer) || offer < 100 || offer > car.ask)
      return fail('offer','Offer a valid whole-pound amount no higher than the asking price.');
    const blocked = canBuy(state,offer,car.prep);
    if (blocked) return blocked;
    if (state.vehicles.some(v => v.origin === car.id)) return fail('owned','This seller’s car is already yours.');
    if (offer < car.floor) return fail('rejected','The owner rejected your offer. They may accept a stronger price.');
    pay(state,-offer,'Direct purchase: ' + car.title);
    addCar(state,car,'seller',offer,car.id);
    return success('The owner accepted ' + offer + ' for ' + car.title + '. Added to your stock.');
  }
  function prepare(state, id) {
    const vehicle = own(state.vehicles,id);
    if (!vehicle) return fail('missing','Vehicle not found in your stock.');
    if (vehicle.status !== 'acquired') return fail('ready','This vehicle has already been prepared.');
    if (state.cash < vehicle.prepBudget) return fail('cash','Insufficient cash to complete the required preparation.');
    pay(state,-vehicle.prepBudget,'Preparation and inspection: ' + vehicle.title);
    vehicle.prepSpent = vehicle.prepBudget;
    vehicle.status = 'prepared';
    return success(vehicle.title + ' is prepared for retail. Set an asking price.');
  }
  function advertise(state, id, asking) {
    const vehicle = own(state.vehicles,id);
    if (!vehicle) return fail('missing','Vehicle not found in your stock.');
    if (vehicle.status === 'acquired') return fail('prep','Prepare the vehicle before advertising it.');
    if (!integer(asking) || asking < 500 || asking > 75000)
      return fail('price','Enter a retail price between £500 and £75,000.');
    if (asking < Math.floor(vehicle.retail * .5) || asking > Math.ceil(vehicle.retail * 1.8))
      return fail('price','Choose a plausible asking price based on the fictional market estimate.');
    vehicle.asking = asking;vehicle.status = 'listed';vehicle.listedDay = state.day;
    vehicle.cashOffer = null;
    return success(vehicle.title + ' is advertised at ' + asking + '. Check the Sales Office.');
  }
  function pxTemplate(vehicle) { return EXCHANGES[(vehicle.id - 1) % EXCHANGES.length]; }
  function buyers(vehicle) {
    if (vehicle.status !== 'listed') return null;
    const start = Math.max(500,vehicle.asking - 400);
    const limit = Math.max(start,vehicle.asking - 90);
    const px = pxTemplate(vehicle);
    return {
      cashOffer:vehicle.cashOffer === null ? start : vehicle.cashOffer,
      cashLimit:limit,
      pxOffer:Math.max(500,vehicle.asking - 220),
      exchange:px
    };
  }
  function counter(state, id) {
    const vehicle = own(state.vehicles,id);
    if (!vehicle || vehicle.status !== 'listed') return fail('missing','Advertise a vehicle first.');
    const buyer = buyers(vehicle);
    if (buyer.cashOffer + 150 > buyer.cashLimit)
      return fail('rejected','The cash buyer refuses to increase their offer again.');
    vehicle.cashOffer = buyer.cashOffer + 150;
    return success('Your counteroffer was accepted. Cash buyer now offers ' + vehicle.cashOffer + '.');
  }
  function completeSale(state, id, mode, allowance) {
    const vehicle = own(state.vehicles,id);
    if (!vehicle || vehicle.status !== 'listed') return fail('missing','Advertise a car before making a sale.');
    if (!['cash','part-ex'].includes(mode)) return fail('mode','Unknown sale type.');
    const buyer = buyers(vehicle);
    const price = mode === 'cash' ? buyer.cashOffer : buyer.pxOffer;
    let px = null;
    if (mode === 'part-ex') {
      px = buyer.exchange;
      if (!integer(allowance) || allowance < px.floor || allowance > px.ask)
        return fail('part-ex','Part-exchange allowance rejected by the customer. Revalue within their acceptable range.');
      if (allowance >= price) return fail('part-ex','Part-exchange allowance must be below the agreed sale price.');
      const pendingPrep = state.vehicles.filter(v => v.status === 'acquired')
        .reduce((total, v) => total + v.prepBudget, 0);
      if (state.cash + price - allowance < pendingPrep + px.prep)
        return fail('cash','This part-exchange would leave too little cash to prepare your existing and incoming stock.');
    }
    const realised = price - vehicle.cost - vehicle.prepSpent;
    pay(state,price,'Retail sale: ' + vehicle.title + ' (' + mode + ')');
    if (px) pay(state,-allowance,'Part-exchange acquisition: ' + px.title);
    state.vehicles = state.vehicles.filter(v => v.id !== id);
    state.sold.push({
      id:vehicle.id,title:vehicle.title,source:vehicle.source,
      day:state.day,mode,price,acquisition:vehicle.cost,
      prep:vehicle.prepSpent,profit:realised,
      exchange: px ? px.title : null,allowance:px ? allowance : 0
    });
    if (px) addCar(state,px,'part-ex',allowance,'PX-' + state.day + '-' + vehicle.id);
    state.stock = state.vehicles.length;
    state.sales = state.sold.length;
    state.reputation = reputation(state.sales);
    return success(
      vehicle.title + ' sold for ' + price +
      (px ? '; accepted ' + px.title + ' in part-ex for ' + allowance + '.' : '.') +
      ' Gross trade margin: ' + realised + ' before overheads and tax.'
    );
  }
  function totalMargin(state) { return sum(state.sold,'profit'); }
  window.MotorTradeEngine = Object.freeze({
    VERSION, STARTING_CASH, CAPACITY,
    market,create,normalize,acquireAuction,acquireSeller,
    prepare,advertise,buyers,counter,completeSale,totalMargin
  });
})();
