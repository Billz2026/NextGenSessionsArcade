'use strict';
/*
 * The Motor Trade — deterministic, fictional trading engine.
 * Prices and buyer behaviour are gameplay examples, not live valuations.
 * Gross trading margin is before tax, VAT adjustments and business overheads.
 */
(() => {
  const STARTING_CASH = 12500;
  const CAPACITY = 2;
  const VERSION = 7;
  const W = window.MotorTradeWorkshop;
  if (!W) throw new Error('Load workshop.js before trading.js');
  const D = window.MotorTradeEvents;
  if (!D) throw new Error('Load events.js before trading.js');
  const M = window.MotorTradeMonthly;
  if (!M) throw new Error('Load monthly.js before trading.js');
  const P = window.MotorTradePeople;
  if (!P) throw new Error('Load people.js before trading.js');
  const I = window.MotorTradeIntel;
  if (!I) throw new Error('Load vehicle-intel.js before trading.js');
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
  // Seeded, stable daily supply: the same career day gives the same listings
  // after reload, while volume, models, valuations and mileage vary across days.
  const sample = (day,index,salt) => {
    let v = ((day * 374761393) ^ (index * 668265263) ^ salt) >>> 0;
    v = Math.imul(v ^ (v >>> 13),1274126177) >>> 0;
    return (v ^ (v >>> 16)) >>> 0;
  };
  const nearest25 = n => Math.round(n / 25) * 25;
  function market(day, reputationScore=0, session=0, dealershipName='',periodReputation=reputationScore) {
    // Customer-only Deal Day; auction-house sessions never operate at month end.
    // The period's opening reputation remains fixed when sales are made.
    const special=D.customers(day,periodReputation,session,SELLERS,I.profile,dealershipName);
    if(special)return special;
    const auctionCount = day === 1 ? 3 :
      (sample(day,0,17) % 7 === 0 ? 0 : 1 + (sample(day,1,29) % 3));
    const baselineSellers = day === 1 ? 2 :
      (sample(day,0,31) % 5 === 0 ? 0 : 1 + (sample(day,1,37) % 3));
    // Established traders attract an extra seller enquiry on busier days.
    const sellerCount = Math.min(4,baselineSellers +
      (day>1 && reputationScore>=40 && baselineSellers>0 ? 1 : 0));
    // Some days have no auctions or no private sellers, but never an empty market.
    const aCount = auctionCount || sellerCount ? auctionCount : 1;
    const auctions = Array.from({length:aCount}, (_,i) => {
      const base = AUCTIONS[day === 1 ? i : (sample(day,0,8) % AUCTIONS.length + i * 2) % AUCTIONS.length];
      const offset = day === 1 ? 0 : nearest25((sample(day,i,91) % 851) - 425);
      const guide = Math.max(850,base.guide + offset);
      const delta = guide - base.guide;
      const miles = base.miles + (day === 1 ? 0 : ((sample(day,i,54) % 250) - 125) * 100);
      const fee = base.fee + (day === 1 ? 0 : 25 * ((sample(day,i,82) % 3) - 1));
      return {...base,guide,reserve:base.reserve+delta,rival:base.rival+delta,
        retail:base.retail+delta, miles, fee,
        id:'A-' + day + '-' + i,kind:'auction',day};
    });
    const sellers = Array.from({length:sellerCount}, (_,i) => {
      const base = SELLERS[day === 1 ? i : (sample(day,0,21) % SELLERS.length + i) % SELLERS.length];
      const offset = day === 1 ? 0 : nearest25((sample(day,i,51) % 601) - 300);
      const ask = Math.max(950,base.ask + offset);
      const delta = ask - base.ask;
      const miles = base.miles + (day === 1 ? 0 : ((sample(day,i,44) % 250) - 125) * 100);
      return {...base,ask,floor:base.floor+delta,retail:base.retail+delta,
        miles,id:'S-' + day + '-' + i,kind:'seller',day};
    });
    return {
      auctions:auctions.map(car=>({...car,profile:I.profile(car)})),
      sellers:sellers.map(car=>({...car,profile:I.profile(car)}))
    };
  }
  const marketFor=state=>market(state.day,state.reputationScore,state.deadlineSession,
    state.name,state.monthPlan?.startingReputation??state.reputationScore);
  function create(name, messages) {
    const state={
      version:VERSION,name,day:1,cash:STARTING_CASH,capacity:CAPACITY,
      stock:0,sales:0,reputation:P.tier(5),messages,
      vehicles:[],sold:[],ledger:[],nextId:1,negotiations:{},auctionBids:{},reports:{},
      ...P.initial()
    };
    M.initialize(state);
    Object.assign(state,D.initial());
    return state;
  }
  function normalize(saved) {
    if (!saved || ![1,2,3,4,5,6,VERSION].includes(saved.version) ||
      typeof saved.name !== 'string' || saved.name.trim().length < 2 ||
      saved.name.trim().length > 36 || !integer(saved.day) ||
      saved.day < 1 || saved.day > MAX_DAY || !Array.isArray(saved.messages)) return null;
    const validMessages = saved.messages.every(m =>
      m && integer(m.id) && integer(m.day) && typeof m.from === 'string' &&
      typeof m.subject === 'string' && typeof m.preview === 'string' &&
      typeof m.body === 'string' && typeof m.read === 'boolean' &&
      (m.linkPage === null || ['dashboard','inbox','auctions','stock','sales','finance','staff','reputation','reports','business'].includes(m.linkPage)));
    if (!validMessages) return null;
    const messages = saved.messages.map(m => ({
      id:m.id,day:m.day,from:m.from,subject:m.subject,preview:m.preview,
      body:m.body,linkPage:m.linkPage,read:m.read
    }));
    if (saved.version === 1) {
      // Previous release contained no trade transactions; keep name, day and inbox.
      if (saved.cash !== STARTING_CASH || saved.capacity !== CAPACITY) return null;
      const legacy=create(saved.name.trim(),messages);
      legacy.day=saved.day;
      return M.initialize(legacy,{migrating:true});
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
      (v.prepSpent === 0 || (v.prepSpent>0 &&
        (saved.version===VERSION? v.prepSpent<=100000 : v.prepSpent<=v.prepBudget))) &&
      cashValue(v.retail) && integer(v.acquiredDay) &&
      v.acquiredDay >= 1 && v.acquiredDay <= saved.day &&
      (v.status !== 'listed' || (cashValue(v.asking) && v.asking > 0)) &&
      (v.status === 'acquired' ? v.prepSpent===0 : v.prepSpent>0) &&
      (v.cashOffer === null || v.cashOffer === undefined || cashValue(v.cashOffer)) &&
      (saved.version === 2 || I.validProfile(v.profile)) &&
      (saved.version === 2 || v.prepBudget === v.profile.basePrep +
        (v.profile.hiddenFault?.cost || 0)) &&
      (saved.version!==VERSION || W.valid(v,saved.day));
    const goodSold = s => s && integer(s.id) && typeof s.title === 'string' &&
      integer(s.day) && s.day >= 1 && s.day <= saved.day &&
      cashValue(s.price) && integer(s.profit) && ['cash','part-ex'].includes(s.mode) &&
      (s.profile==null || I.validProfile(s.profile));
    const goodLedger = l => l && integer(l.day) && l.day >= 1 && l.day <= saved.day &&
      integer(l.delta) && Math.abs(l.delta) <= 10000000 &&
      typeof l.note === 'string' && l.note.length < 200;
    if (!saved.vehicles.every(goodVehicle) || !saved.sold.every(goodSold) ||
        !saved.ledger.every(goodLedger)) return null;
    // Older v2 careers do not yet have negotiation history.
    const negotiations = saved.negotiations ?? {};
    const auctionBids = saved.auctionBids ?? {};
    const reports = saved.reports ?? {};
    const isPlain = x => x && typeof x === 'object' && !Array.isArray(x);
    if (!isPlain(negotiations) || !isPlain(auctionBids) || !isPlain(reports) ||
      Object.keys(negotiations).length > 200 || Object.keys(auctionBids).length > 200 ||
      Object.keys(reports).length > 50) return null;
    const validNegotiations = Object.entries(negotiations).every(([id,v]) =>
      /^S-[0-9]+-[0-9]+$/.test(id) && v && ['counter','walked'].includes(v.status) &&
      integer(v.rounds) && v.rounds >= 1 && v.rounds <= 3 &&
      cashValue(v.counter) && cashValue(v.lastOffer));
    const validBids = Object.entries(auctionBids).every(([id,v]) =>
      /^A-[0-9]+-[0-9]+$/.test(id) && v && ['outbid','lost'].includes(v.status) &&
      integer(v.attempts) && v.attempts >= 1 && v.attempts <= 2 &&
      cashValue(v.lastBid));
    const validReports = Object.entries(reports).every(([key,record]) =>
      /^(A|S)-[0-9]+-[0-9]+$/.test(key) && record &&
      cashValue(record.fee) && record.fee<=250 && record.day===saved.day);
    if (!validNegotiations || !validBids || !validReports) return null;
    const workforce=saved.version>=4 ? saved :
      {...P.initial(),reputationScore:P.legacyScore(saved.sold.length)};
    if (!P.valid(workforce,saved.day)) return null;
    const ids = [...saved.vehicles,...saved.sold].map(v => v.id);
    if (new Set(ids).size !== ids.length || ids.some(id => id >= saved.nextId)) return null;
    const balance = STARTING_CASH + sum(saved.ledger,'delta');
    if (balance !== saved.cash || balance < 0 || balance > 100000000) return null;
    const restored={
      version:VERSION,name:saved.name.trim(),day:saved.day,cash:balance,capacity:CAPACITY,
      stock:saved.vehicles.length,sales:saved.sold.length,
      reputation:P.tier(workforce.reputationScore),messages,
      vehicles:saved.vehicles.map(v => ({
        ...v,workshop:saved.version===VERSION?{...v.workshop}:W.initial(v),
        profile:saved.version===2?I.legacyProfile(v):
          {...v.profile,knownRepairs:v.profile.knownRepairs.map(x=>({...x})),
            mot:{...v.profile.mot,advisories:[...v.profile.mot.advisories]},
            hiddenFault:v.profile.hiddenFault?{...v.profile.hiddenFault}:null}
      })),
      sold:saved.sold.map(v => ({...v,profile:v.profile?{...v.profile,
        knownRepairs:v.profile.knownRepairs.map(r=>({...r})),
        mot:{...v.profile.mot,advisories:[...v.profile.mot.advisories]},
        hiddenFault:v.profile.hiddenFault?{...v.profile.hiddenFault}:null}:null})),
      ledger:saved.ledger.map(v => ({...v})),nextId:saved.nextId,
      negotiations:Object.fromEntries(Object.entries(negotiations).map(([k,v])=>[k,{...v}])),
      auctionBids:Object.fromEntries(Object.entries(auctionBids).map(([k,v])=>[k,{...v}])),
      reports:Object.fromEntries(Object.entries(reports).map(([k,v])=>[k,{...v}])),
      ...P.clone(workforce)
    };
    if(!M.restore(restored,saved))return null;
    if(!D.restore(restored,saved))return null;
    return restored;
  }
  const fail = (code, message) => ({ok:false,code,message});
  const success = message => ({ok:true,message});
  function pay(state, delta, note) {
    state.cash += delta;
    state.ledger.push({day:state.day,delta,note});
  }
  function addCar(state, template, source, cost, ref) {
    const p = template.profile || I.profile({...template,id:ref,kind:source});
    const inspected = !!state.reports?.[ref];
    const inspectionFee = inspected ? state.reports[ref].fee : 0;
    const profile = {...p,inspected};
    // Inspection is paid before purchase, so include it in the unit's
    // acquisition basis for contribution margin without charging twice.
    const v = {
      id:state.nextId++,title:template.title,miles:template.miles,
      fuel:template.fuel,gearbox:template.gearbox,history:template.history,
      note:template.note,retail:p.retail,
      source,origin:ref,cost:cost+inspectionFee,
      profile,prepBudget:p.basePrep+(p.hiddenFault?.cost||0),
      prepSpent:0,status:'acquired',asking:null,cashOffer:null,acquiredDay:state.day,
      listedDay:null
    };
    v.workshop=W.initial(v);
    state.vehicles.push(v);
    state.stock = state.vehicles.length;
    return v;
  }
  function canBuy(state, cost, preparation) {
    if (state.vehicles.length >= state.capacity) return fail('capacity','Your forecourt is full. Sell a vehicle before buying another.');
    // No lending or wholesale exit yet: reserve preparation for *all* acquired cars.
    // Otherwise a second purchase could consume the cash needed to retail the first.
    const pendingPrep=W.reserved(state);
    if (cost + preparation + pendingPrep > state.cash)
      return fail('cash','Not enough cash to buy this car while reserving all required stock preparation.');
    return null;
  }
  // An unsuccessful maximum bid does not incur a buyer's fee in this
  // fictional auction. Winning removes the hammer amount + buyer fee.
  function acquireAuction(state,id,bid) {
    const lot = marketFor(state).auctions.find(v => v.id === id);
    if (!lot) return fail('expired','This auction listing has expired. Advance the day for new vehicles.');
    const activity = (state.auctionBids ??= {})[id];
    if (activity?.status === 'lost') return fail('closed','This lot is closed to your dealership for today.');
    if (!integer(bid) || bid < lot.guide || bid > 100000)
      return fail('bid','Enter a valid maximum bid of at least the guide price.');
    if (state.vehicles.some(v => v.origin === lot.id)) return fail('owned','You have already bought this lot. Check Vehicle Stock.');
    const requiredPrep=lot.profile.basePrep+(lot.profile.hiddenFault?.cost||0);
    const blocked = canBuy(state,bid + lot.fee,requiredPrep);
    if (blocked) return blocked;
    if (bid < Math.max(lot.rival,lot.reserve)) {
      const attempts = (activity?.attempts ?? 0) + 1;
      const closed = attempts >= 2;
      state.auctionBids[id] = {status:closed?'lost':'outbid',attempts,lastBid:bid};
      return {...fail(closed?'lost':'outbid',
        closed ? 'A rival dealer has secured this lot. No fee charged; look at another car.' :
        'Outbid on this lot. No fee charged. You can raise your maximum bid once more.'),changed:true};
    }
    pay(state,-(bid+lot.fee),'Auction purchase: '+lot.title+' (bid '+bid+', buyer fee '+lot.fee+')');
    addCar(state,lot,'auction',bid+lot.fee,lot.id);
    if(activity) delete state.auctionBids[id];
    return success('Won '+lot.title+' at £'+bid.toLocaleString('en-GB')+
      '. Buyer fee £'+lot.fee.toLocaleString('en-GB')+' charged. Vehicle added to stock.');
  }
  function acquireSeller(state,id,offer) {
    const car = marketFor(state).sellers.find(v => v.id === id);
    if (!car) return fail('expired','This seller is no longer available. Check the next day’s leads.');
    if (state.vehicles.some(v => v.origin === car.id)) return fail('owned','This vehicle has already been purchased. View Vehicle Stock.');
    const previous = (state.negotiations ??= {})[id];
    if (previous?.status === 'walked') return fail('walked','The owner has left. This opportunity has closed.');
    if (!integer(offer) || offer < 100 || offer > car.ask)
      return fail('offer','Enter an offer between £100 and the seller’s asking price.');
    const requiredPrep=car.profile.basePrep+(car.profile.hiddenFault?.cost||0);
    const blocked = canBuy(state,offer,requiredPrep);
    if (blocked) return blocked;
    if (previous?.status === 'counter' && offer >= previous.counter) {
      pay(state,-offer,'Direct purchase: '+car.title);
      addCar(state,car,'seller',offer,car.id);
      delete state.negotiations[id];
      return success('Deal agreed at £'+offer.toLocaleString('en-GB')+'. '+car.title+' is now in Vehicle Stock.');
    }
    const effectiveFloor=Math.max(100,car.floor-P.buyerDiscount(state)-
      D.sellerDiscount(state,car.id)-D.meetingBonus(state,'buying'));
    if (!previous && offer >= effectiveFloor + 25) {
      pay(state,-offer,'Direct purchase: '+car.title);
      addCar(state,car,'seller',offer,car.id);
      return success('Owner accepted £'+offer.toLocaleString('en-GB')+'. '+car.title+' added to stock.');
    }
    if (offer < effectiveFloor - 175 || (previous && previous.rounds >= 2)) {
      state.negotiations[id] = {status:'walked',counter:0,
        rounds:Math.min(3,(previous?.rounds ?? 0)+1),lastOffer:offer};
      return {...fail('walked','The owner rejected £'+offer.toLocaleString('en-GB')+
        ' and walked away. No purchase or fee recorded.'),changed:true};
    }
    const rounds=(previous?.rounds ?? 0)+1;
    const counter = previous
      ? Math.max(effectiveFloor+25,previous.counter-50)
      : Math.min(car.ask,effectiveFloor+125);
    state.negotiations[id]={status:'counter',counter,rounds,lastOffer:offer};
    return {...fail('counter','Seller declined £'+offer.toLocaleString('en-GB')+
      ' and countered at £'+counter.toLocaleString('en-GB')+
      '. Accept the counter or make one final offer.'),changed:true};
  }
  function walkSeller(state,id) {
    const car = marketFor(state).sellers.find(v => v.id === id);
    if (!car) return fail('expired','This seller is no longer available.');
    if (state.vehicles.some(v => v.origin === id)) return fail('owned','You already bought this car.');
    const previous = (state.negotiations ??= {})[id];
    state.negotiations[id]={status:'walked',counter:0,
      rounds:Math.max(1,Math.min(3,previous?.rounds ?? 1)),lastOffer:previous?.lastOffer ?? 0};
    return {...success('You walked away from '+car.title+'. No cash was spent.'),changed:true};
  }

  function inspectLead(state,kind,id) {
    if (!['auction','seller'].includes(kind)) return fail('source','Unknown vehicle source.');
    const catalogue=marketFor(state);
    const leads = kind==='auction'?catalogue.auctions:catalogue.sellers;
    const car=leads.find(v=>v.id===id);
    if (!car) return fail('expired','That vehicle is no longer offered for sale.');
    if (state.vehicles.some(v=>v.origin===id)) return fail('owned','This car is already in your stock.');
    if (state.negotiations?.[id]?.status==='walked' ||
        state.auctionBids?.[id]?.status==='lost') return fail('closed','This opportunity is closed.');
    if (state.reports?.[id]) return fail('inspected','This inspection has already been purchased.');
    const pending=W.reserved(state);
    const charge=car.profile.inspectionFee;
    if (state.cash < charge + pending)
      return fail('cash','Not enough unreserved cash to pay for this inspection.');
    pay(state,-charge,'Pre-purchase inspection: '+car.title);
    (state.reports??={})[id]={fee:charge,day:state.day};
    const hidden=car.profile.hiddenFault;
    return success('Inspection charged £'+charge+'. '+
      (hidden?'Additional issue: '+hidden.item+' (£'+hidden.cost+').':
        'No additional faults discovered in the simulated inspection.')+
      ' Updated valuation available in the report.');
  }
  function reportFor(state,kind,id) {
    if(kind==='stock'){
      const car=own(state.vehicles,Number(id));
      return car?{...car,profile:car.profile,inspected:!!car.profile?.inspected}:null;
    }
    const catalogue=marketFor(state);
    const leads=kind==='auction'?catalogue.auctions:
      kind==='seller'?catalogue.sellers:[];
    const car=leads.find(x=>x.id===id);
    return car?{...car,inspected:!!state.reports?.[id]}:null;
  }
  function assessStock(state,id){return W.assess(state,id);}
  function startPrep(state,id,method){return W.start(state,id,method);}
  function finishPrep(state,id){return W.quality(state,id);}
  function transferPrep(state,id){return W.transfer(state,id);}
  function advanceWorkshop(state){return W.advance(state);}
  function prepQuote(state,id,method){
    const v=own(state.vehicles,id);
    return v?W.quote(state,v,method):null;
  }
  // Previous prepare() was instant. Intentionally do not expose it as a
  // shortcut: game progress must now pass through workshop time and QC.
  function advertise(state, id, asking) {
    const vehicle = own(state.vehicles,id);
    if (!vehicle) return fail('missing','Vehicle not found in your stock.');
    if (vehicle.status === 'acquired') return fail('prep','Workshop repairs and a passed final quality check are required before retail advertising.');
    if (!integer(asking) || asking < 500 || asking > 75000)
      return fail('price','Enter a retail price between £500 and £75,000.');
    if (asking < Math.floor(vehicle.retail * .5) || asking > Math.ceil(vehicle.retail * 1.8))
      return fail('price','Choose a plausible asking price based on the fictional market estimate.');
    vehicle.asking = asking;vehicle.status = 'listed';vehicle.listedDay = state.day;
    vehicle.cashOffer = null;
    return success(vehicle.title + ' is advertised at ' + asking + '. Check the Sales Office.');
  }
  function pxTemplate(vehicle) { return EXCHANGES[(vehicle.id - 1) % EXCHANGES.length]; }
  function buyers(vehicle,state=null) {
    if (vehicle.status !== 'listed') return null;
    if(state && D.isDealDay(state.day) && !D.retailActive(state,vehicle))return null;
    // Buyers benchmark against a market-derived achievable retail value.
    // An inflated asking price does not force an unrealistically high offer.
    const fair = vehicle.profile?.likelySale ?? (vehicle.asking - 250);
    const support=state?P.salesBonus(state):0;
    const motivation=state?D.customerBonus(state,vehicle):0;
    const meetingPush=state?D.meetingBonus(state,'sales'):0;
    const reputationAdvantage=state&&state.reputationScore>=40?50:0;
    const limit=Math.max(500,Math.min(vehicle.asking-90,
      fair+Math.round(support/3)+reputationAdvantage+
      Math.round(motivation*.65)+meetingPush));
    const start=Math.max(500,Math.min(limit,vehicle.asking-400+support+
      motivation+meetingPush,fair-125+support+motivation+meetingPush));
    const standardPx=pxTemplate(vehicle);
    const px=state&&D.isDealDay(state.day)?
      D.partExchangeAvailable(state,vehicle)?
        {...standardPx,floor:Math.max(100,standardPx.floor-
          D.partExchangeDiscount(state,vehicle))}:null:
      standardPx;
    return {
      cashOffer:vehicle.cashOffer === null ? start : vehicle.cashOffer,
      cashLimit:limit,
      pxOffer:Math.max(500,Math.min(vehicle.asking-220+Math.round(support/2)+
        Math.round(motivation*.8)+meetingPush,
        fair+50+Math.round(support/3)+reputationAdvantage+
          Math.round(motivation*.65)+meetingPush)),
      exchange:px
    };
  }
  function counter(state, id) {
    const vehicle = own(state.vehicles,id);
    if (!vehicle || vehicle.status !== 'listed') return fail('missing','Advertise a vehicle first.');
    const buyer = buyers(vehicle,state);
    if(!buyer)return fail('no-buyer','No retail customer is interested in this vehicle during the current session. Try the next session.');
    if (buyer.cashOffer + 150 > buyer.cashLimit)
      return fail('rejected','The cash buyer refuses to increase their offer again.');
    vehicle.cashOffer = buyer.cashOffer + 150;
    return success('Your counteroffer was accepted. Cash buyer now offers ' + vehicle.cashOffer + '.');
  }
  function completeSale(state, id, mode, allowance) {
    const vehicle = own(state.vehicles,id);
    if (!vehicle || vehicle.status !== 'listed') return fail('missing','Advertise a car before making a sale.');
    if (!['cash','part-ex'].includes(mode)) return fail('mode','Unknown sale type.');
    const buyer = buyers(vehicle,state);
    if(!buyer)return fail('no-buyer','No retail customer enquiry for this car in the current session. A later session may be different.');
    if(mode==='part-ex'&&!buyer.exchange)
      return fail('no-part-ex','The current customer is not offering a part-exchange. Try a cash sale or wait for another enquiry.');
    const price = mode === 'cash' ? buyer.cashOffer : buyer.pxOffer;
    let px = null;
    if (mode === 'part-ex') {
      px = buyer.exchange;
      if (!integer(allowance) || allowance < px.floor || allowance > px.ask)
        return fail('part-ex','Part-exchange allowance rejected by the customer. Revalue within their acceptable range.');
      if (allowance >= price) return fail('part-ex','Part-exchange allowance must be below the agreed sale price.');
      const pendingPrep=W.reserved(state);
      const pxProfile=I.profile({...px,id:'PX-'+state.day+'-'+vehicle.id,kind:'part-ex'});
      if (state.cash + price - allowance < pendingPrep +
        pxProfile.basePrep+(pxProfile.hiddenFault?.cost||0))
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
      profile:vehicle.profile?{...vehicle.profile}:null,
      exchange: px ? px.title : null,allowance:px ? allowance : 0
    });
    if (px) addCar(state,px,'part-ex',allowance,'PX-' + state.day + '-' + vehicle.id);
    state.stock = state.vehicles.length;
    state.sales = state.sold.length;
    const review=P.sale(state,vehicle,price,realised);
    state.reputation=P.tier(state.reputationScore);
    const completed=state.sold[state.sold.length-1];
    completed.reputationDelta=review.reputationDelta;
    completed.salesCommission=review.commission;
    completed.salespersonId=review.salespersonId ?? null;
    completed.salespersonName=review.salespersonName ?? 'Owner-managed';
    return success(
      vehicle.title + ' sold for ' + price +
      (px ? '; accepted ' + px.title + ' in part-ex for ' + allowance + '.' : '.') +
      ' Gross trade margin: ' + realised + ' before overheads and tax.'+
      ' Reputation '+(review.reputationDelta>=0?'+':'')+review.reputationDelta+
      ' ('+state.reputation+').'
    );
  }
  function totalMargin(state) { return sum(state.sold,'profit'); }
  function staffDay(state) {
    const out=P.advance(state);
    state.reputation=P.tier(state.reputationScore);
    return out;
  }
  function hireStaff(state,id){
    const result=P.hire(state,id);
    if(result.ok){
      const newest=state.staff[state.staff.length-1];
      M.onHire(state,newest);
    }
    return result;
  }
  window.MotorTradeEngine = Object.freeze({
    VERSION, STARTING_CASH, CAPACITY,people:P,staffDay,monthly:M,events:D,
    workshop:W,assessStock,startPrep,finishPrep,transferPrep,advanceWorkshop,prepQuote,hireStaff,
    market,create,normalize,acquireAuction,acquireSeller,walkSeller,
    inspectLead,reportFor,quote:I.quote,
    advertise,buyers,counter,completeSale,totalMargin
  });
})();
