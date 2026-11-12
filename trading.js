'use strict';
/*
 * The Motor Trade — deterministic, fictional trading engine.
 * Prices and buyer behaviour are gameplay examples, not live valuations.
 * Gross trading margin is before tax, VAT adjustments and business overheads.
 */
(() => {
  const STARTING_CASH = 12500;
  // Legacy careers retain their authentic £12,500 ledger base.
  const STANDARD_STARTUP=Object.freeze({
    mode:'uk2026',ownerCapital:60000,openingBank:50000,
    premisesDeposit:3000,prepaidInsurance:3000,fixtures:2000,launchExpense:2000
  });
  const CAPACITY = 4;
  const VERSION = 15;
  const PH = window.MotorTradePhotos;
  if(!PH)throw new Error('Load vehicle-photos.js before trading.js');
  const MARKET = window.MotorTradeMarket;
  if(!MARKET)throw new Error('Load vehicle-market.js before trading.js');
  const AUCTION_FEES=window.MotorTradeAuctionFees;
  if(!AUCTION_FEES)throw new Error('Load auction-fees.js before trading.js');
  const TRANSPORT=window.MotorTradeTransport;
  if(!TRANSPORT)throw new Error('Load auction-transport.js before trading.js');
  const C = window.MotorTradeCustomers;
  if(!C)throw new Error('Load customers.js before trading.js');
  const W = window.MotorTradeWorkshop;
  if (!W) throw new Error('Load workshop.js before trading.js');
  const D = window.MotorTradeEvents;
  if (!D) throw new Error('Load events.js before trading.js');
  const M = window.MotorTradeMonthly;
  if (!M) throw new Error('Load monthly.js before trading.js');
  const P = window.MotorTradePeople;
  if (!P) throw new Error('Load people.js before trading.js');
  const SITE = window.MotorTradePremises;
  if (!SITE) throw new Error('Load premises.js before trading.js');
  const I = window.MotorTradeIntel;
  if (!I) throw new Error('Load vehicle-intel.js before trading.js');
  const MAX_DAY = 36500;
  // Stock templates are maintained in vehicle-market.js. Never mutate the
  // curated rows: daily price, mileage and identifiers are generated below.
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
  // Game calendar starts Monday 9 November 2026. Normally Monday auction;
  // where Monday is month-end Deal Day, use Tuesday of the SAME game week.
  // This guarantees exactly one weekday auction per week, never weekends.
  function scheduledAuctionDay(day){
    const monday=1+Math.floor((day-1)/7)*7;
    return D.isDealDay(monday)?monday+1:monday;
  }
  const auctionDay=day=>integer(day)&&day>=1&&day===scheduledAuctionDay(day);
  function nextAuctionDay(day){
    const thisWeek=scheduledAuctionDay(day);
    return thisWeek>day?thisWeek:scheduledAuctionDay(day+7);
  }
  function market(day,reputationScore=0,session=0,dealershipName='',
    periodReputation=reputationScore,cash=STARTING_CASH,feeScenario='classic') {
    const tier=MARKET.tierFor(cash,reputationScore).key;
    const dealSellers=MARKET.sellersForDealDay(cash,reputationScore).map(x=>MARKET.priceFor(x,feeScenario));
    const special=D.customers(day,periodReputation,session,dealSellers,I.profile,dealershipName);
    if(special)return {auctions:[],sellers:special.sellers.map(x=>({...x,...PH.describe(x)}))};
    const auctionCount=auctionDay(day)?
      (day===1?3:3+(sample(day,1,29)%3)):0;
    const baselineSellers=day===1?2:
      (sample(day,0,31)%5===0?0:1+(sample(day,1,37)%3));
    const sellerCount=Math.min(4,baselineSellers+
      (day>1&&reputationScore>=40&&baselineSellers>0?1:0));
    const aCount=auctionCount;
    const usedAuction=new Set(),usedSeller=new Set();
    const starter=MARKET.CATALOGUE.starter;
    const auctions=Array.from({length:aCount},(_,i)=>{
      const base=MARKET.priceFor(day===1?starter[i]:MARKET.pick('auction',tier,day,i,usedAuction),feeScenario);
      const offset=day===1?0:nearest25((sample(day,i,91)%851)-425);
      const guide=Math.max(850,base.guide+offset);
      const delta=guide-base.guide;
      const miles=Math.max(3500,base.miles+
        (day===1?0:((sample(day,i,54)%250)-125)*100));
      const modern=feeScenario==='uk2026';
      const fee=modern?AUCTION_FEES.feeAtHammer(guide):
        base.fee+(day===1?0:25*((sample(day,i,82)%3)-1));
      return {...base,guide,reserve:base.reserve+delta,rival:base.rival+delta,
        retail:base.retail+delta,miles,fee,
        ...(modern?{feeModel:'bca-blue-2026',feeQuoteRequired:fee===null}:{}),
        id:'A-'+day+'-'+i,kind:'auction',day};
    });
    const sellers=Array.from({length:sellerCount},(_,i)=>{
      const base=MARKET.priceFor(day===1?starter[3+i]:MARKET.pick('seller',tier,day,i,usedSeller),feeScenario);
      const offset=day===1?0:nearest25((sample(day,i,51)%601)-300);
      const ask=Math.max(950,base.ask+offset);
      const delta=ask-base.ask;
      const miles=Math.max(3500,base.miles+
        (day===1?0:((sample(day,i,44)%250)-125)*100));
      return {...base,ask,floor:Math.max(100,base.floor+delta),
        retail:base.retail+delta,miles,
        id:'S-'+day+'-'+i,kind:'seller',day};
    });
    return {
      auctions:auctions.map(car=>({...car,...PH.describe(car),profile:I.profile(car)})),
      sellers:sellers.map(car=>({...car,...PH.describe(car),profile:I.profile(car)}))
    };
  }
  // Daily catalogues must never reroll after a purchase, inspection or sale.
  // Opening cash is reconstructed from the existing ledger, avoiding a new
  // save field and preserving all v1-v9 careers. Reputation access is reviewed
  // at each 30-day management period, not halfway through a trading session.
  function marketStatus(state){
    const todaysMovement=state.ledger.reduce((n,x)=>n+(x.day===state.day?x.delta:0),0);
    const openingCash=state.cash-todaysMovement;
    const periodRep=state.monthPlan?.startingReputation??state.reputationScore;
    return MARKET.progress(openingCash,periodRep);
  }
  const marketFor=state=>{
    const status=marketStatus(state);
    const todaysMovement=state.ledger.reduce((n,x)=>n+(x.day===state.day?x.delta:0),0);
    return market(state.day,state.monthPlan?.startingReputation??state.reputationScore,
      state.deadlineSession,state.name,
      state.monthPlan?.startingReputation??state.reputationScore,
      state.cash-todaysMovement,state.financialScenario==='uk2026'?'uk2026':'classic');
  };
  // Weekly live auctions: sequential numbered lots; bids continue until one
  // dealer drops out. When the highest bid meets reserve, the hammer creates
  // a separate invoice that must be paid before workshop transfer.
  const auctionPhases=['catalogue','bidding','payment','result','finished'];
  const auctionKinds=['won','lost','passed','unsold','owned'];
  const auctionIncrements=[100,250,500];
  const initialAuctionHall=day=>({
    day,index:0,phase:'catalogue',currentBid:0,leader:'none',
    playerBid:0,rivalFolded:false,rounds:0,feed:[],results:[]
  });
  const lotNumber=index=>String(index+1).padStart(3,'0');
  // The new 2026 scenario uses a *published account tariff* for the hammer;
  // classic careers retain the original lot-level fictional fee.
  function auctionFee(state,lot,hammer){
    if(state.financialScenario==='uk2026')
      return AUCTION_FEES.feeAtHammer(hammer);
    return lot?.fee??null;
  }
  function auctionTransport(state,lotOrId){
    if(state.financialScenario!=='uk2026')return {
      gross:0,routeMiles:0,routeReal:false,scenario:'classic-no-transport'};
    return TRANSPORT.quote(lotOrId);
  }
  function auctionLot(state){
    return marketFor(state).auctions[state.auctionHall.index]||null;
  }
  function auctionValid(state){
    const h=state.auctionHall,history=state.auctionHistory;
    if(!h||typeof h!=='object'||Array.isArray(h)||
       !Array.isArray(history)||history.length>160||
       !integer(h.day)||h.day!==state.day||
       !integer(h.index)||h.index<0||
       !auctionPhases.includes(h.phase)||
       !integer(h.currentBid)||h.currentBid<0||h.currentBid>100000||
       !['none','rival','player'].includes(h.leader)||
       !integer(h.playerBid)||h.playerBid<0||h.playerBid>100000||
       typeof h.rivalFolded!=='boolean'||
       !integer(h.rounds)||h.rounds<0||h.rounds>250||
       !Array.isArray(h.feed)||h.feed.length>65||
       !h.feed.every(entry=>typeof entry==='string'&&entry.length<=160)||
       !Array.isArray(h.results)||h.results.length>20)return false;
    const lots=marketFor(state).auctions;
    if(h.index>lots.length||
       (h.phase==='finished'&&h.index!==lots.length)||
       (h.phase!=='finished'&&h.index>=lots.length&&lots.length>0)||
       (h.phase==='result'&&h.results.length!==h.index+1)||
       (h.phase!=='result'&&h.results.length!==h.index)||
       (h.phase==='catalogue'&&
         (h.currentBid!==0||h.playerBid!==0||h.rounds!==0||h.feed.length>0))||
       (h.phase==='bidding'&&
         (h.currentBid<lots[h.index].guide||h.leader==='none'||h.rounds>250))||
       (h.phase==='payment'&&(!lots[h.index]||h.leader!=='player'||
         !h.rivalFolded||h.currentBid!==h.playerBid||
         h.currentBid<lots[h.index].reserve))||
       (h.phase==='finished'&&h.feed.length>0))return false;
    const validResult=r=>r&&typeof r==='object'&&!Array.isArray(r)&&
      integer(r.day)&&r.day>=1&&r.day<=state.day&&
      /^A-[0-9]+-[0-9]+$/.test(r.lotId)&&
      typeof r.title==='string'&&r.title.length>=2&&r.title.length<100&&
      typeof r.lotNumber==='string'&&/^\d{3}$/.test(r.lotNumber)&&
      auctionKinds.includes(r.kind)&&
      integer(r.hammer)&&r.hammer>=0&&r.hammer<=100000&&
      integer(r.fee)&&r.fee>=0&&r.fee<=5000&&
      (r.kind==='won'?r.hammer>0&&r.fee>0:r.fee===0)&&
      integer(r.total)&&r.total===r.hammer+r.fee&&
      typeof r.detail==='string'&&r.detail.length<=160;
    if(!history.every(validResult)||!h.results.every(validResult))return false;
    if(state.financialScenario==='uk2026'&&
       [...history,...h.results].some(r=>r.kind==='won'&&
         r.fee!==AUCTION_FEES.feeAtHammer(r.hammer)))return false;
    if(h.results.some((r,i)=>r.day!==state.day||r.lotId!==lots[i]?.id||
      r.lotNumber!==lotNumber(i)))return false;
    if(h.phase==='bidding'&&h.leader==='player'&&
      h.currentBid>=lots[h.index].reserve)return false;
    const winners=[...history,...h.results].filter(r=>r.kind==='won');
    return winners.every(r=>{
      const purchase=state.ledger.some(l=>l.day===r.day&&
        l.delta===-r.total&&
        l.note.startsWith('Auction purchase: '+r.title+' (bid '+r.hammer+
          ', buyer fee '+r.fee+')'));
      if(!purchase)return false;
      if(state.financialScenario!=='uk2026')return true;
      const delivery=TRANSPORT.quote(r.lotId);
      return !!delivery&&state.ledger.some(l=>l.day===r.day&&
        l.delta===-delivery.gross&&
        l.note==='Auction transport: '+r.title+' (lot '+r.lotId+
          ', simulated '+delivery.routeMiles+' miles)');
    });
  }
  function resolveAuction(state,kind,hammer,detail){
    const h=state.auctionHall,lot=auctionLot(state);
    const fee=kind==='won'?auctionFee(state,lot,hammer):0;
    if(fee===null)return fail('fee-quote','Auctioneer fee quotation required for this hammer. No invoice can be finalised.');
    const result={day:state.day,lotId:lot.id,
      lotNumber:lotNumber(h.index),title:lot.title,
      kind,hammer,fee,total:hammer+fee,detail};
    h.results.push(result);
    state.auctionHistory.push({...result});
    if(state.auctionHistory.length>160)state.auctionHistory.shift();
    h.phase='result';
    h.feed.push(detail);
    if(h.feed.length>65)h.feed=h.feed.slice(-65);
    return {ok:true,changed:true,message:detail};
  }
  function startAuction(state){
    const h=state.auctionHall;
    if(h.phase!=='catalogue')return fail('stage','Finish the current lot before opening bidding.');
    const lot=auctionLot(state);
    if(!lot)return fail('closed','No auction lots are available in this session.');
    if(state.vehicles.some(v=>v.origin===lot.id)||
       state.sold.some(v=>v.origin===lot.id)||
       state.auctionHistory.some(r=>r.kind==='won'&&r.lotId===lot.id))
      return resolveAuction(state,'owned',0,
        'LOT '+lotNumber(h.index)+' was already purchased before the Auction Hall update. No additional charge.');
    h.phase='bidding';h.currentBid=lot.guide;h.leader='rival';
    h.playerBid=0;h.rivalFolded=false;h.rounds=0;
    h.feed=['LOT '+lotNumber(h.index)+' · '+lot.title+' enters the ring.',
      'Regional dealer opens bidding at £'+lot.guide.toLocaleString('en-GB')+'.'];
    return {ok:true,changed:true,message:'Bidding is open for LOT '+lotNumber(h.index)+
      '. The opening rival bid is £'+lot.guide.toLocaleString('en-GB')+
      '. Bid in increments or walk away.'};
  }
  function bidLiveAuction(state,increment){
    const h=state.auctionHall;
    if(h.phase!=='bidding')return fail('stage','Open this lot for bidding first.');
    if(!auctionIncrements.includes(increment))return fail('bid','Choose a £100, £250 or £500 increment.');
    if(h.leader!=='rival')return fail('stage','Only raise against another dealer. The bidding has already ended.');
    const lot=auctionLot(state);
    if(!lot)return fail('closed','This auction lot is no longer available.');
    const bid=h.currentBid+increment;
    if(bid>100000)return fail('bid','The live bid exceeds the supported auction price.');
    if(state.vehicles.some(v=>v.origin===lot.id))
      return fail('owned','This car has already been bought.');
    const fee=auctionFee(state,lot,bid);
    if(fee===null)return fail('fee-quote','No published buyer fee above £24,999 under the 2026 Blue Standard schedule. Obtain a quotation before bidding on this high-value lot.');
    const transport=auctionTransport(state,lot);
    if(!transport)return fail('transport','Auction collection cost could not be estimated.');
    const requiredPrep=lot.profile.basePrep+(lot.profile.hiddenFault?.cost||0);
    const blocked=canBuy(state,bid+fee+transport.gross,requiredPrep);
    if(blocked)return blocked;
    const money=n=>'£'+n.toLocaleString('en-GB');
    h.currentBid=bid;h.playerBid=bid;h.leader='player';h.rounds++;
    h.feed.push('YOU bid '+money(bid)+' (+'+money(increment)+').');
    // The competitor never rerolls on repeated actions: its maximum was fixed
    // when the daily market catalogue was generated.
    if(!h.rivalFolded&&bid+100<=lot.rival){
      h.currentBid=bid+100;h.leader='rival';
      h.feed.push('Regional dealer counters at '+money(h.currentBid)+'.');
      if(h.feed.length>65)h.feed=h.feed.slice(-65);
      return {ok:true,changed:true,message:'Rival dealer has outbid you at '+
        money(h.currentBid)+'. Raise your bid or pass. No money has been taken.'};
    }
    h.rivalFolded=true;
    h.feed.push('Regional dealer cannot match '+money(bid)+' and withdraws.');
    if(bid<lot.reserve){
      h.feed.push('Auctioneer: vendor reserve not met — lot remains unsold.');
      return resolveAuction(state,'unsold',0,'LOT '+lotNumber(h.index)+
        ' received no competing bid above '+money(bid)+
        ', but the vendor reserve was not met. No sale or buyer fee.');
    }
    // Hammer is final, but ownership and payment transfer occur only after
    // the separate buyer invoice has been confirmed.
    h.phase='payment';
    h.feed.push('HAMMER DOWN at '+money(bid)+'. Rival is out. Payment required before collection.');
    if(h.feed.length>65)h.feed=h.feed.slice(-65);
    return {ok:true,changed:true,message:'HAMMER FALLEN — LOT '+lotNumber(h.index)+
      ' at '+money(bid)+'. Rival dealer has dropped out. Finalise payment of '+
      money(bid+fee+transport.gross)+' including buyer fee '+money(fee)+
      (transport.gross?' and simulated transport '+money(transport.gross):'')+
      ' to transfer the car into your workshop.'};
  }
  function settleAuction(state){
    const h=state.auctionHall;
    if(h.phase!=='payment')return fail('stage','There is no outstanding auction invoice.');
    const lot=auctionLot(state);
    if(!lot)return fail('closed','This auction invoice cannot be matched to a lot.');
    if(state.vehicles.some(v=>v.origin===lot.id)||
       state.auctionHistory.some(r=>r.kind==='won'&&r.lotId===lot.id))
      return fail('owned','This lot has already been settled. No second payment is permitted.');
    const hammer=h.currentBid;
    const fee=auctionFee(state,lot,hammer);
    const transport=auctionTransport(state,lot);
    if(!transport)return fail('transport','Cannot price this auction collection route.');
    if(fee===null)return fail('fee-quote','The published 2026 tariff has no rate for this hammer. Payment cannot be assumed.');
    const requiredPrep=lot.profile.basePrep+(lot.profile.hiddenFault?.cost||0);
    const blocked=canBuy(state,hammer+fee+transport.gross,requiredPrep);
    if(blocked)return blocked;
    pay(state,-(hammer+fee),'Auction purchase: '+lot.title+
      ' (bid '+hammer+', buyer fee '+fee+')');
    if(transport.gross)pay(state,-transport.gross,'Auction transport: '+lot.title+
      ' (lot '+lot.id+', simulated '+transport.routeMiles+' miles)');
    addCar(state,lot,'auction',hammer+fee+transport.gross,lot.id);
    h.feed.push('SETTLED. £'+hammer.toLocaleString('en-GB')+
      ' hammer plus £'+fee.toLocaleString('en-GB')+
      ' buyer fee paid. Car sent for workshop assessment.');
    return resolveAuction(state,'won',hammer,'LOT '+lotNumber(h.index)+
      ' PAID & TRANSFERRED TO WORKSHOP: £'+(hammer+fee).toLocaleString('en-GB')+
      ' (£'+hammer.toLocaleString('en-GB')+' hammer + £'+fee.toLocaleString('en-GB')+
      ' buyer fee). Any optional paid inspection is separate.');
  }
  function passAuction(state){
    const h=state.auctionHall;
    if(!['catalogue','bidding'].includes(h.phase))
      return fail('stage','This lot is already decided. Move to the next lot.');
    const lot=auctionLot(state);
    if(!lot)return fail('closed','There are no remaining auction lots.');
    if(h.phase==='catalogue')return resolveAuction(state,'passed',0,
      'LOT '+lotNumber(h.index)+' skipped before bidding. No fee charged.');
    // Refusing to match the last rival bid awards the car to the rival only
    // if its actual bid meets reserve. Never invent a higher hammer amount.
    if(h.leader==='player'&&h.currentBid<lot.reserve)
      return resolveAuction(state,'unsold',0,'LOT '+lotNumber(h.index)+
        ' remained unsold below reserve. No sale or buyer fee.');
    if(h.leader==='player')
      return fail('stage','You already hold the winning bid; settle the hammer first.');
    const rivalWins=h.currentBid>=lot.reserve;
    return resolveAuction(state,rivalWins?'lost':'unsold',
      rivalWins?h.currentBid:0,
      rivalWins?'LOT '+lotNumber(h.index)+
        ' SOLD TO RIVAL for £'+h.currentBid.toLocaleString('en-GB')+
        '. You declined to match and pay no fee.':'LOT '+lotNumber(h.index)+
        ' UNSOLD. You withdrew and the last rival bid did not meet the vendor reserve. No fee.');

  }
  function nextAuctionLot(state){
    const h=state.auctionHall;
    if(h.phase!=='result')return fail('stage','Finish or pass this lot before continuing.');
    const length=marketFor(state).auctions.length;
    h.index++;h.currentBid=0;h.playerBid=0;h.rounds=0;h.rivalFolded=false;
    h.feed=[];h.leader='none';h.phase=h.index>=length?'finished':'catalogue';
    return {ok:true,changed:true,message:h.phase==='finished'?
      'Today’s Auction Hall has finished. Review the results or return tomorrow.':
      'LOT '+lotNumber(h.index)+' is on the rostrum. Inspect it before opening the bidding.'};
  }
  function rollAuctionHall(state){
    state.auctionHall=initialAuctionHall(state.day);
  }

  function create(name, messages, mode='classic') {
    const standard=mode==='uk2026';
    const state={
      version:VERSION,name,day:1,cash:standard?STANDARD_STARTUP.openingBank:STARTING_CASH,capacity:CAPACITY,
      ...(standard?{financialScenario:'uk2026',startupAccounts:{...STANDARD_STARTUP}}:{}),
      stock:0,sales:0,reputation:P.tier(5),messages,
      vehicles:[],sold:[],wholesale:[],ledger:[],nextId:1,negotiations:{},auctionBids:{},reports:{},
      customerCases:{},customerHistory:[],customerFunds:[],
      auctionHall:initialAuctionHall(1),auctionHistory:[],
      inboxLedgerCursor:0,
      premises:SITE.initial(),...P.initial()
    };
    M.initialize(state);
    Object.assign(state,D.initial());
    return state;
  }
  function normalize(saved) {
    if (!saved || ![1,2,3,4,5,6,7,8,9,10,11,12,13,14,VERSION].includes(saved.version) ||
      typeof saved.name !== 'string' || saved.name.trim().length < 2 ||
      saved.name.trim().length > 36 || !integer(saved.day) ||
      saved.day < 1 || saved.day > MAX_DAY || !Array.isArray(saved.messages)) return null;
    const validMessages = saved.messages.every(m =>
      m && integer(m.id) && integer(m.day) && typeof m.from === 'string' &&
      typeof m.subject === 'string' && typeof m.preview === 'string' &&
      typeof m.body === 'string' && typeof m.read === 'boolean' &&
      (m.category===undefined||['operations','staff','accounts','sales','reports'].includes(m.category))&&
      (m.decision===undefined||['approved','declined'].includes(m.decision))&&
      (m.reference===undefined||m.reference===null||
        (typeof m.reference==='string'&&m.reference.length>0&&m.reference.length<=150))&&
      (m.linkPage === null || ['dashboard','inbox','auctions','stock','sales','finance','staff','reputation','reports','business','workshop','events','auctionHall'].includes(m.linkPage)));
    if (!validMessages) return null;
    const messages = saved.messages.map(m => ({
      id:m.id,day:m.day,from:m.from,subject:m.subject,preview:m.preview,
      body:m.body,linkPage:m.linkPage,read:m.read,
      ...(m.category?{category:m.category}:{}),
      ...(m.reference?{reference:m.reference}:{}),
      ...(m.decision?{decision:m.decision}:{})
    }));
    if (saved.version === 1) {
      // Previous release contained no trade transactions; keep name, day and inbox.
      if (saved.cash !== STARTING_CASH || ![2,CAPACITY].includes(saved.capacity)) return null;
      const legacy=create(saved.name.trim(),messages);
      legacy.day=saved.day;
      legacy.auctionHall=initialAuctionHall(saved.day);
      return M.initialize(legacy,{migrating:true});
    }
    if(saved.version>=12&&(!saved.auctionHall||!Array.isArray(saved.auctionHistory)))return null;
    // An untouched old catalogue can be refreshed after a day change without
    // losing any bid or payment. Never silently discard a live or decided lot.
    const staleEmptyHall=saved.version>=12&&saved.auctionHall?.day!==saved.day&&
      saved.auctionHall?.phase==='catalogue'&&saved.auctionHall?.index===0&&
      saved.auctionHall?.currentBid===0&&saved.auctionHall?.rounds===0&&
      Array.isArray(saved.auctionHall?.feed)&&saved.auctionHall.feed.length===0&&
      Array.isArray(saved.auctionHall?.results)&&saved.auctionHall.results.length===0;
    const site=saved.version>=10?saved.premises:SITE.initial();
    if(saved.version<10&&Array.isArray(saved.staff)){
      // Existing v9 careers could already employ six or eight technicians.
      // Honour their paid-for team and fitted capacity rather than suddenly
      // forcing them into four bays on upgrade to the premises simulation.
      const existingTechnicians=saved.staff.filter(e=>e?.role==='technician').length;
      site.workshopLevel=existingTechnicians>6?2:existingTechnicians>4?1:0;
    }
    if(!SITE.valid(site))return null;
    const expectedCapacity=SITE.capacity({premises:site});
    if(saved.version>=13&&(!integer(saved.inboxLedgerCursor)||
      saved.inboxLedgerCursor<0||saved.inboxLedgerCursor>saved.ledger?.length))return null;
    if ((saved.version>=10?saved.capacity!==expectedCapacity:![2,CAPACITY].includes(saved.capacity)) || !Array.isArray(saved.vehicles) ||
      !Array.isArray(saved.sold) || !Array.isArray(saved.ledger) ||
      !integer(saved.nextId) || saved.nextId < 1 ||
      !cashValue(saved.cash) || saved.vehicles.length > expectedCapacity ||
      saved.vehicles.length > 250 || saved.sold.length > 20000 ||
      saved.ledger.length > 60000 ||
      (saved.version>=12&&(!Array.isArray(saved.wholesale)||saved.wholesale.length>20000)))return null;
    const validLook=v=>typeof v.color==='string'&&PH.COLOURS.includes(v.color)&&
      typeof v.generation==='string'&&v.generation.length>0&&v.generation.length<48&&
      (PH.identity(v).generation===v.generation);
    const goodVehicle = v => v && integer(v.id) && v.id > 0 && typeof v.title === 'string' &&
      v.title.length > 2 && v.title.length < 100 &&
      ['auction','seller','part-ex'].includes(v.source) &&
      ['acquired','prepared','listed'].includes(v.status) &&
      cashValue(v.cost) && cashValue(v.prepBudget) && cashValue(v.prepSpent) &&
      (v.prepSpent === 0 || (v.prepSpent>0 &&
        (saved.version>=7? v.prepSpent<=100000 : v.prepSpent<=v.prepBudget))) &&
      cashValue(v.retail) && integer(v.acquiredDay) &&
      v.acquiredDay >= 1 && v.acquiredDay <= saved.day &&
      (v.status !== 'listed' || (cashValue(v.asking) && v.asking > 0)) &&
      (v.status === 'acquired' ? v.prepSpent===0 : v.prepSpent>0) &&
      (v.cashOffer === null || v.cashOffer === undefined || cashValue(v.cashOffer)) &&
      (saved.version === 2 || I.validProfile(v.profile)) &&
      (saved.version === 2 || v.prepBudget === v.profile.basePrep +
        (v.profile.hiddenFault?.cost || 0)) &&
      (saved.version<7 || W.valid(v,saved.day)) &&
      (saved.version<10 || validLook(v));
    const goodSold = s => s && integer(s.id) && typeof s.title === 'string' &&
      integer(s.day) && s.day >= 1 && s.day <= saved.day &&
      cashValue(s.price) && integer(s.profit) && ['cash','part-ex'].includes(s.mode) &&
      (s.profile==null || I.validProfile(s.profile));
    const goodLedger = l => l && integer(l.day) && l.day >= 1 && l.day <= saved.day &&
      integer(l.delta) && Math.abs(l.delta) <= 10000000 &&
      typeof l.note === 'string' && l.note.length < 200;
    const wholesale=saved.wholesale??[];
    const goodWholesale=d=>d&&integer(d.id)&&d.id>0&&
      typeof d.title==='string'&&d.title.length<100&&
      integer(d.day)&&d.day>=1&&d.day<=saved.day&&
      cashValue(d.proceeds)&&cashValue(d.basis)&&
      integer(d.profit)&&d.profit===d.proceeds-d.basis;
    if (!Array.isArray(wholesale)||!wholesale.every(goodWholesale)||
      !saved.vehicles.every(goodVehicle) || !saved.sold.every(goodSold) ||
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
    const ids = [...saved.vehicles,...saved.sold,...wholesale].map(v => v.id);
    if (new Set(ids).size !== ids.length || ids.some(id => id >= saved.nextId)) return null;
    // The starting cash source varies by scenario. Owner equity, refundable
    // deposits, prepaid insurance and fixtures are not trading revenue/costs.
    const standard=saved.financialScenario==='uk2026';
    if(saved.financialScenario!==undefined&&!standard)return null;
    if(standard){
      if(saved.version<15||!saved.startupAccounts||
         Object.keys(STANDARD_STARTUP).some(k=>saved.startupAccounts[k]!==STANDARD_STARTUP[k]))return null;
    }
    const balance = (standard?STANDARD_STARTUP.openingBank:STARTING_CASH) + sum(saved.ledger,'delta');
    if (balance !== saved.cash || balance < 0 || balance > 100000000) return null;
    const restored={
      version:VERSION,name:saved.name.trim(),day:saved.day,cash:balance,capacity:expectedCapacity,
      ...(standard?{financialScenario:'uk2026',startupAccounts:{...STANDARD_STARTUP}}:{}),
      premises:SITE.clone(site),
      inboxLedgerCursor:saved.version>=13?saved.inboxLedgerCursor:saved.ledger.length,
      // Migrate older daily auction saves: keep completed results in history,
      // but remove an obsolete mid-session catalogue on a closed weekday.
      auctionHall:saved.version>=11&&!staleEmptyHall&&
        (saved.version>=12||saved.day===1)?
        JSON.parse(JSON.stringify(saved.auctionHall)):initialAuctionHall(saved.day),
      auctionHistory:saved.version>=11?JSON.parse(JSON.stringify(saved.auctionHistory)):[],
      stock:saved.vehicles.length,sales:saved.sold.length,
      reputation:P.tier(workforce.reputationScore),messages,
      vehicles:saved.vehicles.map(v => ({
        ...v,...(saved.version<10?PH.describe(v):{}),workshop:saved.version>=7?{...v.workshop}:W.initial(v),
        profile:saved.version===2?I.legacyProfile(v):
          {...v.profile,knownRepairs:v.profile.knownRepairs.map(x=>({...x})),
            mot:{...v.profile.mot,advisories:[...v.profile.mot.advisories]},
            hiddenFault:v.profile.hiddenFault?{...v.profile.hiddenFault}:null}
      })),
      wholesale:wholesale.map(d=>({...d,...(saved.version<10?PH.describe(d):{})})),
      sold:saved.sold.map(v => ({...v,...(saved.version<10?PH.describe(v):{}),profile:v.profile?{...v.profile,
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
    if(!C.valid(restored,saved))return null;
    if(!auctionValid(restored))return null;
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
      listedDay:null,
      color:template.color||PH.describe({...template,origin:ref}).color,
      generation:template.generation||PH.identity(template).generation
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
    const fee=auctionFee(state,lot,bid);
    if(fee===null)return fail('fee-quote','No published buyer fee for this hammer above £24,999. Obtain an individual quotation before buying.');
    const transport=auctionTransport(state,lot);
    if(!transport)return fail('transport','Cannot price this auction collection route.');
    const blocked = canBuy(state,bid + fee+transport.gross,requiredPrep);
    if (blocked) return blocked;
    if (bid < Math.max(lot.rival,lot.reserve)) {
      const attempts = (activity?.attempts ?? 0) + 1;
      const closed = attempts >= 2;
      state.auctionBids[id] = {status:closed?'lost':'outbid',attempts,lastBid:bid};
      return {...fail(closed?'lost':'outbid',
        closed ? 'A rival dealer has secured this lot. No fee charged; look at another car.' :
        'Outbid on this lot. No fee charged. You can raise your maximum bid once more.'),changed:true};
    }
    pay(state,-(bid+fee),'Auction purchase: '+lot.title+' (bid '+bid+', buyer fee '+fee+')');
    if(transport.gross)pay(state,-transport.gross,'Auction transport: '+lot.title+
      ' (lot '+lot.id+', simulated '+transport.routeMiles+' miles)');
    addCar(state,lot,'auction',bid+fee+transport.gross,lot.id);
    if(activity) delete state.auctionBids[id];
    return success('Won '+lot.title+' at £'+bid.toLocaleString('en-GB')+
      '. Buyer fee £'+fee.toLocaleString('en-GB')+' charged. Vehicle added to stock.');
  }
  // The same seller keeps the same fictional negotiating temperament for
  // the session. It changes counteroffer movement, never resets after reload.
  // Hidden reservation prices remain private to the seller.
  function sellerApproach(state,car){
    const index=Number(String(car.id).split('-').at(-1))||0;
    const isDeadline=D.isDealDay(state.day);
    const motivated=isDeadline&&D.sellerDiscount(state,car.id)>0;
    const mode=state.day===1?'standard':motivated?'quick':
      ['standard','quick','firm','standard'][sample(state.day,index,141)%4];
    const strategies={
      standard:{label:'PRIVATE OWNER',description:'The owner wants a straightforward sale but will weigh your offer against their expectations. An unrealistic opening price can end the discussion.',firstCounter:125,concession:50},
      quick:{label:'TIME-SENSITIVE OWNER',description:'The owner would prefer a prompt, uncomplicated sale and may concede more during counteroffers. Their minimum price is still not guaranteed.',firstCounter:100,concession:75},
      firm:{label:'PRICE-CONSCIOUS OWNER',description:'The owner is not under obvious pressure to sell. Expect a firmer counteroffer and be prepared to walk away if the numbers do not work.',firstCounter:175,concession:25}
    };
    return strategies[mode];
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
    const approach=sellerApproach(state,car);
    const counter = previous
      ? Math.max(effectiveFloor+25,previous.counter-approach.concession)
      : Math.min(car.ask,effectiveFloor+approach.firstCounter);
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
    // Do not sell inspections once the lot has passed, sold or hammered.
    if(kind==='auction' && (state.auctionHall.results.some(r=>r.lotId===id) ||
       (state.auctionHall.phase==='payment' && auctionLot(state)?.id===id)))
      return fail('closed','This auction lot has finished bidding. Inspections are no longer available.');
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
    const current=C.caseFor(state,id);
    if(current&&['agreed','reserved','collectable'].includes(current.status))
      return fail('reserved','An agreed or reserved vehicle cannot be repriced until the customer arrangement is cancelled.');
    vehicle.asking = asking;vehicle.status = 'listed';vehicle.listedDay = state.day;
    vehicle.cashOffer = null;
    return success(vehicle.title + ' is advertised at ' + asking + '. Check the Sales Office.');
  }
  function pxTemplate(vehicle,state=null) {
    const base=MARKET.priceFor(MARKET.exchangeFor(vehicle),state?.financialScenario||'classic');
    const origin='PX-'+vehicle.acquiredDay+'-'+vehicle.id;
    return {...base,origin,...PH.describe({...base,origin})};
  }
  function buyers(vehicle,state=null) {
    if (vehicle.status !== 'listed') return null;
    if(state && D.isDealDay(state.day) && !C.caseFor(state,vehicle.id) && !D.retailActive(state,vehicle))return null;
    // Buyers benchmark against a market-derived achievable retail value.
    // An inflated asking price does not force an unrealistically high offer.
    const fair = vehicle.profile?.likelySale ?? (vehicle.asking - 250);
    const support=state?P.salesBonus(state,C.caseFor(state,vehicle.id)||vehicle.id):0;
    const motivation=state?D.customerBonus(state,vehicle):0;
    const meetingPush=state?D.meetingBonus(state,'sales'):0;
    const reputationAdvantage=state&&state.reputationScore>=40?50:0;
    const limit=Math.max(500,Math.min(vehicle.asking-90,
      fair+Math.round(support/3)+reputationAdvantage+
      Math.round(motivation*.65)+meetingPush));
    const start=Math.max(500,Math.min(limit,vehicle.asking-400+support+
      motivation+meetingPush,fair-125+support+motivation+meetingPush));
    const standardPx=pxTemplate(vehicle,state);
    const customer=state?C.caseFor(state,vehicle.id):null;
    const px=customer?
      customer.preferredMode==='part-ex'?
        (state&&D.isDealDay(state.day)?
          {...standardPx,floor:Math.max(100,standardPx.floor-
            D.partExchangeDiscount(state,vehicle))}:standardPx):null:
      state&&D.isDealDay(state.day)?
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
  function counter(state,id){
    const v=own(state.vehicles,id);
    if(!v||v.status!=='listed')return fail('missing','Advertise the vehicle first.');
    const buyer=buyers(v,state);
    if(!buyer)return fail('no-buyer','No interested customer is currently available.');
    return C.negotiate(state,v,buyer.cashOffer,buyer.cashLimit);
  }
  const openCustomer=(state,id)=>C.open(state,id);
  const bookCustomer=(state,id)=>C.book(state,id);
  const competingCustomer=(state,id)=>C.serveCompeting(state,id);
  const testDrive=(state,id)=>C.testDrive(state,id);
  const depositCustomer=(state,id)=>C.deposit(state,id);
  const cancelCustomer=(state,id,reason='buyer')=>C.cancel(state,id,reason);
  const advanceCustomers=state=>C.advanceDay(state);
  const nextCustomerSession=state=>C.nextSession(state);
  function agreeCustomer(state,id,mode,allowance){
    const v=own(state.vehicles,id),c=C.caseFor(state,id);
    if(!v||v.status!=='listed')return fail('missing','Vehicle must be advertised.');
    if(!c||c.status!=='discussing')
      return fail('stage','Customer must attend and complete a successful test drive before a deal can be agreed.');
    const b=buyers(v,state);
    if(!b)return fail('no-buyer','Current customer is no longer available.');
    if(mode==='part-ex'&&!b.exchange)
      return fail('part-ex','This customer is not offering a part-exchange.');
    const price=mode==='cash'?b.cashOffer:b.pxOffer;
    return C.agree(state,id,mode,price,allowance,b.exchange);
  }
  function completeSale(state,id,mode,allowance){
    const v=own(state.vehicles,id);
    if(!v||v.status!=='listed')return fail('missing','Advertise a car before handover.');
    const c=C.caseFor(state,id);
    if(!C.ready(state,id))
      return fail('customer','Complete the customer enquiry, appointment, test drive and agreement before handing over.');
    if(!['cash','part-ex'].includes(mode)||mode!==c.preferredMode)
      return fail('mode','Handover method must match the agreed customer deal.');
    const price=c.price;
    const px=mode==='part-ex'?c.exchange:null;
    const agreedAllowance=c.allowance||0;
    if(mode==='part-ex'){
      if(!px||!integer(agreedAllowance)||agreedAllowance<px.floor||
        agreedAllowance>px.ask||agreedAllowance>=price)
        return fail('part-ex','Agreed part-exchange figures are no longer valid.');
      if(allowance!==undefined&&allowance!==null&&allowance!==agreedAllowance)
        return fail('part-ex','The allowance cannot change after the customer agreement.');
      const pendingPrep=W.reserved(state);
      const pxProfile=I.profile({...px,id:'PX-'+c.agreedDay+'-'+v.id,kind:'part-ex'});
      if(state.cash+price-agreedAllowance<pendingPrep+
        pxProfile.basePrep+(pxProfile.hiddenFault?.cost||0))
        return fail('cash','Insufficient funds to complete this part-exchange and reserve vehicle preparation.');
    }
    const result=C.complete(state,id);
    if(!result.ok)return result;
    const realised=price-v.cost-v.prepSpent;
    // The customer paid the deposit earlier. On collection they pay only
    // the remaining cash balance; the existing deposit transfers from its
    // segregated holding account. Both credits total the agreed sale price.
    const depositApplied=result.appliedDeposit||0;
    const cashBalance=price-depositApplied-agreedAllowance;
    pay(state,cashBalance,'Retail balance received on collection: '+v.title+
      ' ('+mode+')');
    if(depositApplied)pay(state,depositApplied,
      'Customer deposit applied to retail sale: '+v.title);
    if(px)state.ledger.push({day:state.day,delta:0,
      note:'Part-exchange acquisition: '+px.title+
        ' (non-cash allowance £'+agreedAllowance+')'});
    state.vehicles=state.vehicles.filter(x=>x.id!==id);
    state.sold.push({
      id:v.id,title:v.title,source:v.source,day:state.day,mode,price,
      color:v.color,generation:v.generation,origin:v.origin,
      depositApplied,customerBalancePaid:cashBalance,
      acquisition:v.cost,prep:v.prepSpent,profit:realised,
      profile:v.profile?{...v.profile}:null,
      exchange:px?px.title:null,allowance:px?agreedAllowance:0
    });
    if(px)addCar(state,px,'part-ex',agreedAllowance,'PX-'+c.agreedDay+'-'+v.id);
    state.stock=state.vehicles.length;state.sales=state.sold.length;
    const review=P.sale(state,v,price,realised,c);
    state.reputation=P.tier(state.reputationScore);
    const completed=state.sold.at(-1);
    completed.reputationDelta=review.reputationDelta;
    completed.salesCommission=review.commission;
    completed.salesCommissionRatePct=review.commissionRatePct;
    completed.salespersonId=review.salespersonId??null;
    completed.salespersonName=review.salespersonName??'Owner-managed';
    return success(v.title+' handed over to '+c.name+' for £'+price+
      (depositApplied?' (deposit £'+depositApplied+
        ' already paid; cash balance £'+cashBalance+' received at collection)':
        px?' (cash balance £'+cashBalance+' received after part-exchange allowance)':'')+
      (px?'; part-exchange allowance £'+agreedAllowance+'.':'.')+
      ' Gross trading margin: £'+realised+' before overheads, tax and aftersales.');
  }
  function wholesaleOffer(vehicle){
    // Simplified emergency trade bid. A trade outlet is not a retail sale
    // or guaranteed profit; dispose of unprepared stock at a loss.
    return Math.max(150,Math.round(Math.min(
      vehicle.profile?.trade||vehicle.retail*.55,vehicle.cost*.88)/25)*25);
  }
  function disposeStock(state,id){
    const vehicle=own(state.vehicles,id);
    if(!vehicle)return fail('missing','Vehicle not found.');
    if(vehicle.status!=='acquired'||!['unassessed','quoted'].includes(vehicle.workshop?.stage))
      return fail('stage','Trade disposal is available only before repair work has been booked.');
    const proceeds=wholesaleOffer(vehicle);
    const basis=vehicle.cost;
    pay(state,proceeds,'Wholesale stock disposal: '+vehicle.title);
    state.wholesale.push({id:vehicle.id,title:vehicle.title,day:state.day,
      proceeds,basis,profit:proceeds-basis,color:vehicle.color,
      generation:vehicle.generation});
    state.vehicles=state.vehicles.filter(v=>v.id!==id);
    state.stock=state.vehicles.length;
    return success(vehicle.title+' disposed of to a fictional trade buyer for £'+
      proceeds+'. Trading loss £'+Math.max(0,basis-proceeds)+
      '. No retail sale, target credit or reputation benefit.');
  }
  function totalMargin(state) { return sum(state.sold,'profit')+
    sum(state.wholesale,'profit'); }
  function premisesDay(state){
    const out=SITE.advance(state);
    state.reputation=P.tier(state.reputationScore);
    return out;
  }
  const upgradePremises=(state,kind)=>SITE.upgrade(state,kind);
  function staffDay(state) {
    const out=P.advance(state);
    state.reputation=P.tier(state.reputationScore);
    return out;
  }
  function decideStaffMorale(state,messageId,approve){
    return P.decideMorale(state,messageId,approve);
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
    VERSION, STARTING_CASH, STANDARD_STARTUP, CAPACITY,people:P,staffDay,premises:SITE,premisesDay,
    auctionDay,nextAuctionDay,auctionFee,auctionTransport,settleAuction,
    startAuction,bidLiveAuction,passAuction,nextAuctionLot,rollAuctionHall,
    auctionLot,lotNumber,auctionValid,
    upgradePremises,monthly:M,events:D,
    customers:C,openCustomer,bookCustomer,competingCustomer,testDrive,depositCustomer,
    cancelCustomer,advanceCustomers,nextCustomerSession,agreeCustomer,
    workshop:W,assessStock,startPrep,finishPrep,transferPrep,advanceWorkshop,prepQuote,
    wholesaleOffer,disposeStock,hireStaff,decideStaffMorale,
    market,marketFor,marketStatus,sellerApproach,create,normalize,acquireAuction,acquireSeller,walkSeller,
    inspectLead,reportFor,quote:I.quote,
    advertise,buyers,counter,completeSale,totalMargin
  });
})();
