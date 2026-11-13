'use strict';
/*
 * The Motor Trade v0.9 — customer journey.
 * Fictional enquiries are reproducible for a vehicle, dealer and game date.
 * Enquiries, appointments, test drives and signed offers are distinct steps.
 * Deposits are held in a separate virtual customer-holding account.
 * At delivery only the remaining customer balance is paid; any deposit is
 * transferred into business cash without double counting. A buyer's change
 * of mind can result in fair retention for actual extra costs recorded by
 * the simulation; dealer fault and legacy refundable terms return all.
 */
(() => {
  const D=window.MotorTradeEvents;
  const P=window.MotorTradePeople;
  const L=window.MotorTradeRetailLiquidity;
  if(!P)throw new Error('Load people.js before customers.js');
  if(!L)throw new Error('Load retail-liquidity.js before customers.js');
  const ints=Number.isSafeInteger;
  const STATUS=Object.freeze(['enquiry','booked','arrived','discussing','agreed',
    'reserved','collectable','lost']);
  const FIRST=['Alex','Sam','Jamie','Taylor','Jordan','Morgan','Charlie',
    'Harper','Riley','Casey','Drew','Avery','Robin','Ellis','Frankie'];
  const LAST=['Patel','Jones','Ahmed','Williams','Singh','Brown','Khan',
    'Evans','Wilson','Taylor','Clarke','Morgan','Shah','Davies','Ali'];
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function hash(text){
    let h=2166136261;
    for(const ch of String(text))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
    h=Math.imul(h^(h>>>15),2246822507)>>>0;
    return (h^(h>>>13))>>>0;
  }
  const chance=(key,percent)=>hash(key)%100<percent;
  const fail=(code,message)=>({ok:false,code,message});
  const ok=(message)=>({ok:true,changed:true,message});
  const caseFor=(state,id)=>state.customerCases?.[String(id)]??null;
  const slot=state=>D.isDealDay(state.day)?state.deadlineSession:0;
  const leadKey=(state,vehicle)=>[
    state.name,state.day,slot(state),vehicle.id,vehicle.origin
  ].join('|');
  const heldDeposits=state=>Object.values(state.customerCases??{})
    .reduce((n,c)=>n+(c.held||0),0);
  function funds(state,c,type,delta){
    (state.customerFunds??=[]).push({day:state.day,vehicleId:c.vehicleId,
      leadId:c.id,type,delta});
    if(state.customerFunds.length>4000)state.customerFunds.shift();
  }
  function customerPrep(state,c){
    // Simulated customer-specific valet, collection inspection, holding
    // paperwork and re-advertising administration: costs actually charged
    // to the business, not a fictitious automatic right to keep a deposit.
    return Math.min(250,75+25*(hash('delivery-work|'+c.id)%8));
  }
  function balanceDue(c){
    return c?Math.max(0,(c.price||0)-(c.allowance||0)-(c.held||0)):0;
  }
  function append(state,caseObj,type,detail=''){
    state.customerHistory.push({day:state.day,vehicleId:caseObj.vehicleId,
      leadId:caseObj.id,type,detail:detail.slice(0,120)});
    if(state.customerHistory.length>2000)state.customerHistory.shift();
  }
  function demand(state,vehicle){
    if(vehicle?.status!=='listed')return false;
    if(caseFor(state,vehicle.id))return false;
    if(D.isDealDay(state.day)&&!D.retailActive(state,vehicle))return false;
    const fair=vehicle.profile?.likelySale||vehicle.retail;
    const overpriced=Math.max(0,(vehicle.asking-fair)/Math.max(fair,1));
    const grade=vehicle.profile?.grade||3;
    const modern=state.financialScenario==='uk2026';
    let percent=modern?
      L.enquiryPercent(state,vehicle,P.salesImpact(state,vehicle.id).enquiryLift):
      65-Math.round(overpriced*100)-(grade>=4?12:0)+
        Math.floor(state.reputationScore/8)+P.salesImpact(state,vehicle.id).enquiryLift;
    if(D.isDealDay(state.day)){
      const c=D.outlook(state);
      percent+=c.type==='quiet'?-13:c.type==='subdued'?-5:
        c.type==='busy'?9:c.type==='exceptional'?13:0;
    }
    // These are scenario probabilities, not measured independent-dealer lead rates.
    return chance('buyer|'+leadKey(state,vehicle),clamp(percent,modern?1:8,modern?48:91));
  }
  function priceCheckCandidate(state){
    // After a genuinely silent fortnight the fictional online listing can
    // attract a price-question, even when none of the normal day-by-day
    // serious enquiries materialised. This is a game pacing safeguard, NOT
    // a guaranteed buyer or an empirically measured real-world lead rate.
    if(state.financialScenario!=='uk2026'||D.isDealDay(state.day))return null;
    if(state.customerHistory.some(h=>h.type==='enquiry'&&h.day>=state.day-12))return null;
    return state.vehicles.filter(v=>v.status==='listed'&&
      v.listedDay!=null&&state.day-v.listedDay>=12&&!caseFor(state,v.id))
      .sort((a,b)=>L.value(state,a).gapRatio-L.value(state,b).gapRatio||
        a.listedDay-b.listedDay||a.id-b.id)[0]||null;
  }
  function open(state,id,source='normal'){
    const vehicle=state.vehicles.find(v=>v.id===id);
    if(!vehicle||vehicle.status!=='listed')return fail('stock','Advertise a retail-ready vehicle first.');
    if(caseFor(state,id))return fail('existing','This car already has an active customer case.');
    const priceQuestion=source==='online-price-question'&&
      priceCheckCandidate(state)?.id===id;
    const advertisedPriceCheck=source==='advert-price-check';
    if(!priceQuestion&&!demand(state,vehicle))return fail('no-enquiry',
      'No customer has enquired about this car this session. Try another day or review its price.');
    const key=leadKey(state,vehicle);
    const mode=hash('mode|'+key)%100;
    const preferPX=mode<38&&
      (!D.isDealDay(state.day)||D.partExchangeAvailable(state,vehicle));
    const walkIn=D.isDealDay(state.day);
    const c={
      id:'C-'+state.day+'-'+slot(state)+'-'+vehicle.id+'-'+
        (hash('lead-identity|'+key)%1000000),
      vehicleId:id,createdDay:state.day,createdSession:slot(state),
      name:FIRST[hash('first|'+key)%FIRST.length]+' '+
        LAST[hash('last|'+key)%LAST.length],
      channel:priceQuestion||advertisedPriceCheck?'ONLINE PRICE QUESTION':
        walkIn?'MONTH-END WALK-IN':(hash('channel|'+key)%2?'ONLINE':'TELEPHONE'),
      status:walkIn?'arrived':'enquiry',preferredMode:preferPX?'part-ex':'cash',
      appointmentDay:null,agreedDay:null,price:null,allowance:null,
      collectionDay:null,held:0,counters:0,reason:'',
      terms:'in-person',prepCost:0,exchange:null,
      quotedPrice:null,quoteStatus:'none',quoteRounds:0,
      remote:false,remoteInspected:false,remoteAttempted:false,
      salespersonId:P.salesRep(state,id)?.id??null
    };
    state.customerCases[String(id)]=c;
    vehicle.cashOffer=null;
    // This is a genuine inbound lead handled by the assigned active sales
    // executive. It counts as work, not a completed deal or earned commission.
    const assigned=P.salesRep(state,c);
    if(assigned)assigned.workDone++;
    append(state,c,'enquiry',c.channel);
    return ok(c.name+' contacted the dealership about '+vehicle.title+
      (priceQuestion?'. They asked whether your asking price is negotiable. This is not a firm offer or a promised sale. Book a viewing if you want to progress.':
        walkIn?'. The customer is here now for a viewing.':
        '. Book a viewing before proceeding to a test drive.'));
  }
  function quote(state,id,asking,limit){
    const c=caseFor(state,id),v=state.vehicles.find(v=>v.id===id);
    if(state.financialScenario!=='uk2026'||!c||c.status!=='enquiry'||!v)
      return fail('stage','An active 2026 customer enquiry is required to discuss a price.');
    if(!ints(asking)||asking<500||asking>v.asking)
      return fail('price','Quote a whole-pound price between £500 and your advertised asking price.');
    if(!ints(limit)||limit<500||limit>100000)
      return fail('budget','The customer budget is not available.');
    if((c.quoteRounds||0)>=3)
      return fail('limit','This customer will not consider another price quote.');
    c.quoteRounds=(c.quoteRounds||0)+1;
    if(asking>limit){
      if(c.quoteRounds>=3){
        c.status='lost';
        c.reason='Customer walked away after repeated quotes above their budget.';
        append(state,c,'price-walk',c.reason);
        return {ok:false,changed:true,code:'walked',message:c.name+
          ' ended the price discussion. No deposit or sale was taken.'};
      }
      c.quoteStatus='counter';
      c.quotedPrice=limit;
      append(state,c,'price-counter','Buyer budget £'+limit+' vs quote £'+asking);
      return ok(c.name+' cannot pay £'+asking+'. They counter at £'+limit+
        '. You can accept, quote another price, or book a viewing without agreeing the price.');
    }
    c.quoteStatus='accepted';c.quotedPrice=asking;
    v.cashOffer=asking;
    append(state,c,'price-agreed','Provisional pre-viewing price £'+asking);
    return ok(c.name+' is happy with the proposed £'+asking+
      ' subject to inspection. Next, book a viewing for tomorrow or offer a refundable £250 remote reservation. This is not a sale.');
  }
  function acceptPriceCounter(state,id){
    const c=caseFor(state,id),v=state.vehicles.find(v=>v.id===id);
    if(!c||c.status!=='enquiry'||c.quoteStatus!=='counter'||
      !ints(c.quotedPrice)||!v)
      return fail('stage','An active customer counteroffer is required.');
    c.quoteStatus='accepted';
    v.cashOffer=c.quotedPrice;
    append(state,c,'price-agreed','Dealer accepted buyer budget £'+c.quotedPrice);
    return ok('You accepted '+c.name+"'s £"+c.quotedPrice+
      ' provisional price. The customer can book a next-day viewing or consider a refundable remote deposit.');
  }
  function remoteReserve(state,id){
    const c=caseFor(state,id),v=state.vehicles.find(v=>v.id===id);
    if(state.financialScenario!=='uk2026'||!c||!v||c.status!=='enquiry'||
      c.quoteStatus!=='accepted'||!ints(c.quotedPrice))
      return fail('stage','First agree a provisional price during the phone or online enquiry.');
    if(c.remoteAttempted)
      return fail('already','You have already invited this buyer to reserve remotely.');
    const expense=customerPrep(state,c);
    const outstanding=window.MotorTradeWorkshop?.reserved(state)??0;
    if(state.cash-expense<outstanding)
      return fail('cash','The dealership cannot fund the promised collection preparation.');
    c.remoteAttempted=true;
    const saving=(v.asking-c.quotedPrice)/Math.max(v.asking,1);
    const interest=clamp((c.channel==='ONLINE PRICE QUESTION'?35:55)+
      Math.round(Math.max(0,saving)*60),30,75);
    if(!chance('remote-deposit-willing|'+c.id,interest)){
      append(state,c,'reservation-declined','Buyer wants an inspection before paying');
      return {ok:false,changed:true,code:'declined',message:c.name+
        ' likes the price but will not leave a deposit before viewing the car. Offer a 24-hour appointment.'};
    }
    Object.assign(c,{status:'agreed',agreedDay:state.day,price:c.quotedPrice,
      allowance:0,exchange:null,preferredMode:'cash',remote:true,
      remoteInspected:false,terms:'distance-refundable'});
    append(state,c,'agreement','Provisional remote reservation, subject to inspection');
    const paid=deposit(state,id);
    if(!paid.ok)throw new Error('Remote deposit preflight mismatch: '+paid.message);
    return ok(c.name+' left a refundable £250 phone/online deposit. The remaining £'+
      balanceDue(c)+' is due on arrival after collection inspection, day '+c.collectionDay+
      '. Funds are held separately; the sale has not happened.');
  }
  function inspectRemote(state,id){
    const c=caseFor(state,id);
    if(!c||c.status!=='collectable'||!c.remote)
      return fail('stage','A remote-reservation buyer must be due to collect the car.');
    if(c.remoteInspected)return fail('already','The collection inspection has already passed.');
    const grade=state.vehicles.find(v=>v.id===id)?.profile?.grade||3;
    const happy=chance('remote-collection-inspection|'+c.id,
      clamp(90-(grade>=4?16:grade===3?8:0),63,94));
    if(!happy){
      const amounts=settle(state,c,'dealer');
      c.status='lost';c.reason='Buyer rejected the car on arrival.';
      append(state,c,'collection-rejected','£'+amounts.refunded+' refunded');
      return {ok:false,changed:true,code:'inspection-rejected',message:c.name+
        ' declined the car after inspecting it. The full £'+amounts.refunded+
        ' deposit was refunded. No further money or sale recorded.'};
    }
    c.remoteInspected=true;
    append(state,c,'collection-inspected','Car accepted on arrival');
    return ok(c.name+' accepted the car on collection. Collect the remaining £'+
      balanceDue(c)+' and complete the handover. The £250 deposit applies exactly once.');
  }
  function book(state,id){
    const c=caseFor(state,id);
    if(!c||c.status!=='enquiry')return fail('stage','A new enquiry is required to book a viewing.');
    // Not every price-check is a buyer: initial questions should be useful
    // interactions but cannot automatically become 100% viewing conversions.
    if(state.financialScenario==='uk2026'&&c.channel==='ONLINE PRICE QUESTION'&&
       c.quoteStatus!=='accepted'&&!chance('price-check-qualified|'+c.id,
         clamp(48+Math.floor(P.salesImpact(state,c).enquiryLift*.8),45,73))){
      const message=failCase(state,c,'expired',
        'The caller only wanted a price indication and is not ready to arrange a viewing.');
      return {ok:false,changed:true,code:'unqualified',message};
    }
    // Off-site advertised vehicles need a booked 48-hour viewing transfer.
    // £35 is an illustrative round-trip contractor fee, paid only when a
    // genuine appointment is accepted, even if the buyer ultimately no-shows.
    const vehicle=state.vehicles.find(v=>v.id===id);
    const offsite=state.financialScenario==='uk2026'&&
      vehicle?.storageLocation==='offsite';
    if(offsite){
      const fee=35,reserve=window.MotorTradeWorkshop?.reserved(state)||0;
      if(state.cash<reserve+fee)return fail('cash',
        'The £35 external vehicle presentation transfer needs unreserved cash.');
      state.cash-=fee;
      state.ledger.push({day:state.day,delta:-fee,note:'Off-site viewing transfer: '+vehicle.title});
      vehicle.cost+=fee;
      vehicle.viewingArriveDay=state.day+2;
    }
    c.appointmentDay=state.financialScenario==='uk2026'?
      state.day+(offsite?2:1):
      state.day+1+(P.salesImpact(state,c).fastViewing?0:hash('appointment|'+c.id)%2);
    c.status='booked';
    append(state,c,'appointment','Day '+c.appointmentDay);
    return ok(c.name+' has booked a viewing for day '+c.appointmentDay+
      (state.financialScenario==='uk2026'?
        (offsite?' (48 hours; vehicle transfer booked and £35 paid).':
          ' (next game day / 24 hours).'):' (within 48 game-hours).')+
      ' No deposit was paid: the vehicle stays advertised and available to other buyers.');
  }
  function competingInterest(state,id){
    const c=caseFor(state,id),vehicle=state.vehicles.find(v=>v.id===id);
    if(!vehicle||vehicle.status!=='listed'||!c||c.status!=='booked'||
      c.held||c.standby||state.day>=c.appointmentDay||D.isDealDay(state.day))
      return false;
    const modern=state.financialScenario==='uk2026';
    const fair=modern?L.value(state,vehicle).indicative:
      (vehicle.profile?.likelySale||vehicle.retail);
    const overpriced=Math.max(0,(vehicle.asking-fair)/Math.max(fair,1));
    const percent=modern?
      clamp(8-Math.round(overpriced*60)-(vehicle.profile?.grade>=4?3:0)+
        Math.floor(state.reputationScore/25)+
        Math.floor(P.salesImpact(state,id).enquiryLift/4),1,24):
      clamp(58-Math.round(overpriced*90)-
        (vehicle.profile?.grade>=4?9:0)+Math.floor(state.reputationScore/10)+
        Math.floor(P.salesImpact(state,id).enquiryLift/2),12,88);
    // Stable within the same game day: repeated clicks cannot reroll demand.
    return chance('other-buyer|'+state.name+'|'+state.day+'|'+id+'|'+c.id,percent);
  }
  function attendBooked(state,c,notices){
    if(state.day<c.appointmentDay)return;
    // A short-notice viewing is a much stronger indicator of intent.
    const modern=state.financialScenario==='uk2026';
    const turnsUp=chance('show|'+c.id,modern?
      clamp(77+Math.floor(state.reputationScore/20)+
        P.salesImpact(state,c).arrivalLift,65,91):
      clamp(96+Math.floor(state.reputationScore/15)+
        P.salesImpact(state,c).arrivalLift,90,99));
    if(turnsUp){
      c.status='arrived';
      append(state,c,'arrived','Attended scheduled viewing on day '+state.day);
      if(notices)notices.push(c.name+' arrived for the viewing of stock '+c.vehicleId+'.');
    }else{
      const detail=failCase(state,c,'no-show','Customer failed to attend their appointment.');
      if(notices)notices.push(detail);
    }
  }
  function restoreBooked(state,c,notices){
    if(!c.standby)return false;
    const booked={...c.standby,standby:null};
    state.customerCases[String(c.vehicleId)]=booked;
    // A rival's negotiated offer must not carry into the original buyer's price.
    const vehicle=state.vehicles.find(v=>v.id===c.vehicleId);
    if(vehicle)vehicle.cashOffer=null;
    append(state,booked,'appointment-restored','Competing buyer did not purchase; viewing still booked.');
    attendBooked(state,booked,notices);
    return true;
  }
  function serveCompeting(state,id){
    const booked=caseFor(state,id),vehicle=state.vehicles.find(v=>v.id===id);
    if(!booked||booked.status!=='booked'||!vehicle||vehicle.status!=='listed')
      return fail('stage','A live, unsecured appointment is required for another viewing.');
    if(!competingInterest(state,id))
      return fail('no-enquiry','There is no second buyer available for this car at the moment.');
    const key='other-buyer|'+state.name+'|'+state.day+'|'+id+'|'+booked.id;
    const mode=hash('mode|'+key)%100;
    const c={
      id:'C-'+state.day+'-'+slot(state)+'-'+id+'-'+(hash('identity|'+key)%1000000),
      vehicleId:id,createdDay:state.day,createdSession:slot(state),
      name:FIRST[hash('first|'+key)%FIRST.length]+' '+
        LAST[hash('last|'+key)%LAST.length],
      channel:'WALK-IN',status:'arrived',
      preferredMode:mode<38?'part-ex':'cash',
      appointmentDay:null,agreedDay:null,price:null,allowance:null,
      collectionDay:null,held:0,counters:0,reason:'',
      terms:'in-person',prepCost:0,exchange:null,
      quotedPrice:null,quoteStatus:'none',quoteRounds:0,
      remote:false,remoteInspected:false,remoteAttempted:false,
      salespersonId:P.salesRep(state,id+1)?.id??null,
      standby:{...booked,standby:null}
    };
    state.customerCases[String(id)]=c;
    vehicle.cashOffer=null;
    append(state,c,'enquiry','Competing walk-in while earlier viewing remained unsecured');
    append(state,c,'arrived','Customer on site for immediate viewing');
    return ok(c.name+' is here to view stock '+id+' now. The original appointment remains booked unless this customer pays a deposit or buys the car. Offer a test drive before agreeing a sale.');
  }
  function testDrive(state,id){
    const c=caseFor(state,id);
    const v=state.vehicles.find(x=>x.id===id);
    if(!c||!v||c.status!=='arrived')return fail('stage','The customer must attend a viewing before a test drive.');
    const key='test-drive|'+c.id;
    const grade=v.profile?.grade||3;
    // An attended test drive is a strong buying signal. Condition still matters.
    const modern=state.financialScenario==='uk2026';
    const pass=chance(key,modern?
      clamp(79-(grade>=4?13:0)+Math.floor(state.reputationScore/20)+
        P.salesImpact(state,c).driveLift,52,94):
      clamp(91-(grade>=4?15:0)+Math.floor(state.reputationScore/12)+
        P.salesImpact(state,c).driveLift,65,98));
    append(state,c,pass?'test-drive-pass':'test-drive-reject',
      pass?'Customer wants to discuss terms':'Customer did not proceed');
    if(!pass){
      c.status='lost';
      c.reason='Customer did not like the condition or driving experience.';
      restoreBooked(state,c);
      return {ok:false,changed:true,code:'drive-rejected',
        message:c.name+' declined to proceed after the test drive. No sale was made.'};
    }
    c.status='discussing';
    return ok(c.name+' completed a satisfactory test drive. You can now discuss cash or part-exchange terms.');
  }
  function negotiate(state,vehicle,current,limit){
    const c=caseFor(state,vehicle.id);
    if(!c||c.status!=='discussing')return fail('stage','A completed test drive is required before negotiations.');
    if(c.counters>=2)return fail('limit','This customer will not consider another counteroffer.');
    const next=current+150;
    c.counters++;
    if(next>limit){
      append(state,c,'counter-rejected','Beyond customer budget');
      return {ok:false,changed:true,code:'rejected',message:c.name+
        ' cannot increase their offer beyond their budget.'};
    }
    const receptive=chance('counter|'+c.id+'|'+c.counters,
      clamp((state.financialScenario==='uk2026'?66:82)+
      (state.reputationScore>=40?6:0)-(c.counters-1)*12+
      P.salesImpact(state,c).counterLift,35,
      state.financialScenario==='uk2026'?90:96));
    if(!receptive){
      const walk=chance('walk|'+c.id+'|'+c.counters,25);
      append(state,c,'counter-rejected',walk?'Customer walked away':'Customer declined increase');
      if(walk){
        c.status='lost';
        c.reason='Customer walked away after a counteroffer.';
        restoreBooked(state,c);
      }
      return {ok:false,changed:true,code:walk?'walked':'rejected',
        message:c.name+(walk?' walked away after the higher counteroffer.':
          ' declined the increase. Their last offer remains available.')};
    }
    vehicle.cashOffer=next;
    append(state,c,'counter-accepted','Increase of £150');
    return ok(c.name+' has agreed to increase the cash offer to £'+next+'.');
  }
  function agree(state,id,mode,price,allowance,exchange){
    const c=caseFor(state,id);
    if(!c||c.status!=='discussing')return fail('stage','The customer must complete a test drive and negotiate first.');
    if(!['cash','part-ex'].includes(mode))return fail('mode','Invalid sale method.');
    if(mode==='part-ex'&&c.preferredMode!=='part-ex')
      return fail('mode','This customer is not offering a part-exchange.');
    if(!ints(price)||price<500||price>100000)return fail('price','Invalid negotiated price.');
    if(mode==='part-ex'&&(!exchange||!ints(allowance)||allowance<exchange.floor||
       allowance>exchange.ask||allowance>=price))
      return fail('allowance','Part-exchange allowance is outside the agreed customer range.');
    Object.assign(c,{status:'agreed',agreedDay:state.day,
      price,allowance:mode==='part-ex'?allowance:0,
      exchange:mode==='part-ex'?{...exchange}:null,preferredMode:mode});
    append(state,c,'agreement',mode);
    return ok('Agreement reached with '+c.name+' for £'+price+
      (mode==='part-ex'?' including a £'+allowance+' part-exchange allowance.':'.')+
      ' Complete handover today or take a £250 reservation deposit under clear cancellation terms for later collection.');
  }
  function deposit(state,id){
    const c=caseFor(state,id);
    if(!c||c.status!=='agreed')return fail('stage','Agree the sale before taking a reservation deposit.');
    const expense=customerPrep(state,c);
    const reserved=window.MotorTradeWorkshop?.reserved(state)??0;
    if(state.cash-expense<reserved)
      return fail('cash','Insufficient unreserved dealership cash for the '+expense+
        ' customer-specific collection preparation cost. Do not accept a reservation you cannot service.');
    const vehicle=state.vehicles.find(v=>v.id===id);
    const remoteOffsite=c.remote&&state.financialScenario==='uk2026'&&
      vehicle?.storageLocation==='offsite';
    if(remoteOffsite&&state.cash<reserved+expense+35)
      return fail('cash','Insufficient unreserved cash for off-site collection logistics.');
    // The held £250 customer deposit is not spendable dealer cash.
    c.held=250;
    if(c.terms!=='distance-refundable')c.terms='in-person';
    c.prepCost=expense;
    c.collectionDay=state.day+(remoteOffsite?2:
      1+(c.remote?0:hash('collection|'+c.id)%2));
    if(remoteOffsite){
      // The £35 collection transfer is a dealership expense at the point of
      // confirmed reservation. It is not paid from the held customer deposit.
      const transferFee=35;
      state.cash-=transferFee;
      state.ledger.push({day:state.day,delta:-transferFee,
        note:'Off-site viewing transfer: '+vehicle.title});
      vehicle.cost+=transferFee;
      vehicle.viewingArriveDay=c.collectionDay;
    }
    if(c.standby){
      append(state,c.standby,'appointment-displaced',
        'Car secured by another buyer paying a deposit; no deposit on original viewing.');
      c.standby=null;
    }
    c.status='reserved';
    funds(state,c,'received',250);
    state.cash-=expense;
    state.ledger.push({day:state.day,delta:-expense,
      note:'Customer-specific collection preparation: '+c.name+' / stock '+id});
    append(state,c,'deposit','£250 received into separate holding; customer-specific work £'+expense);
    return ok('£250 deposit taken and held separately for '+c.name+
      '. Collection day '+c.collectionDay+'. Customer owes '+balanceDue(c)+
      ' at handover. You paid £'+expense+' in customer-specific preparation. '+
      (c.remote?'Phone/online reservation: full refund if buyer cancels before collection.':
      'In-person buyer withdrawal: any retained amount is limited to recorded direct costs; dealer fault receives a full refund.'));
  }
  function settle(state,c,reason='buyer'){
    const held=c.held||0;
    if(!held)return {retained:0,refunded:0};
    // Old v0.9 customers agreed to unconditional refunds; honour them.
    const retained=reason==='buyer'&&c.terms==='in-person'?
      Math.min(held,c.prepCost||0):0;
    const refunded=held-retained;
    if(refunded)funds(state,c,'refunded',-refunded);
    if(retained){
      funds(state,c,'retained',-retained);
      state.cash+=retained;
      state.ledger.push({day:state.day,delta:retained,
        note:'Fair cancellation cost recovery: '+c.name+' / stock '+c.vehicleId});
    }
    c.held=0;
    return {retained,refunded};
  }
  function cancel(state,id,reason='buyer'){
    const c=caseFor(state,id);
    if(!c||!['enquiry','booked','arrived','discussing','agreed','reserved','collectable'].includes(c.status))
      return fail('stage','No open customer arrangement can be cancelled.');
    if(!['buyer','dealer'].includes(reason))return fail('reason','Invalid cancellation reason.');
    const amounts=settle(state,c,reason);
    c.status='lost';
    c.reason=reason==='buyer'?'Customer withdrew from the purchase.':
      'Dealership cancelled and refunded all remaining customer funds.';
    append(state,c,amounts.refunded?'deposit-refunded':'cancelled',
      'Customer deposit: £'+amounts.retained+' retained against recorded costs; £'+
      amounts.refunded+' refunded.');
    if(amounts.retained)append(state,c,'deposit-retained',
      'Direct costs recovered: £'+amounts.retained);
    restoreBooked(state,c);
    return ok(c.reason+(amounts.refunded?' £'+amounts.refunded+' refunded.':'')+
      (amounts.retained?' £'+amounts.retained+' retained against recorded customer-specific costs.':''));
  }
  function ready(state,id){
    const c=caseFor(state,id);
    return c&&['agreed','collectable'].includes(c.status)&&
      (c.status!=='agreed'||c.agreedDay===state.day)&&
      (!c.remote||c.remoteInspected===true);
  }
  function complete(state,id){
    const c=caseFor(state,id);
    if(!ready(state,id))return fail('stage','A test drive, agreed terms and an eligible handover are required.');
    const appliedDeposit=c.held||0;
    if(appliedDeposit){
      funds(state,c,'applied',-appliedDeposit);
      c.held=0;
    }
    append(state,c,'sale',c.preferredMode);
    if(c.standby)append(state,c.standby,'appointment-displaced',
      'Car sold to competing buyer before original unsecured appointment.');
    delete state.customerCases[String(id)];
    return {ok:true,changed:true,appliedDeposit,message:appliedDeposit?
      'Deposit transferred from holding account; balance paid at handover.':
      'Customer collected the vehicle and the sale completed.'};
  }
  function failCase(state,c,type,reason){
    const money=settle(state,c,'buyer');
    c.status='lost';
    c.reason=reason;
    append(state,c,type==='deposit-refunded'?'cancelled':type,reason);
    if(money.refunded)append(state,c,'deposit-refunded','£'+money.refunded+' returned');
    if(money.retained)append(state,c,'deposit-retained','£'+money.retained+' direct costs recovered');
    return reason+(money.retained?' £'+money.retained+' of the deposit retained against costs.':'')+
      (money.refunded?' £'+money.refunded+' refunded.':'');
  }
  function queueEnquiries(state){
    // Modern independent-dealer leads are real in-game customer cases, not
    // transient screen-only prompts. Generate once on the actual new game
    // day, never on page render/reload. No lead without advertised stock.
    if(state.financialScenario!=='uk2026')return [];
    const received=[];
    for(const vehicle of state.vehicles){
      if(vehicle.status!=='listed'||caseFor(state,vehicle.id)||!demand(state,vehicle))continue;
      // Some real advertising contacts are only asking about the price.
      // Record them as such so more interaction does not turn directly into
      // an implausibly high rate of completed sales.
      const type=hash('intent|'+leadKey(state,vehicle))%100<40?
        'advert-price-check':'normal';
      const result=open(state,vehicle.id,type);
      if(result.ok){
        const c=caseFor(state,vehicle.id);
        received.push('NEW RETAIL ENQUIRY: '+c.name+' for stock '+vehicle.id+
          '. Respond in the Sales Office within three game days.');
      }
    }
    if(!received.length){
      const target=priceCheckCandidate(state);
      if(target){
        const reply=open(state,target.id,'online-price-question');
        if(reply.ok){
          const c=caseFor(state,target.id);
          received.push('NEW RETAIL ENQUIRY: '+c.name+
            ' has asked about negotiating stock '+target.id+
            ' asking price. This is an initial price question, NOT a firm offer. Open Sales Office to respond within three game days.');
        }
      }
    }
    return received;
  }
  function salespersonCallback(state,c,notices){
    if(state.financialScenario!=='uk2026'||c.status!=='enquiry'||
      state.day!==c.createdDay+1)return;
    const rep=P.salesRep(state,c);
    if(!rep||state.customerHistory.some(h=>
      h.type==='sales-follow-up'&&h.leadId===c.id))return;
    // A paid representative calls back ONE time, the day after a lead.
    // This is not a free buyer or automatic sale. The buyer can fail to
    // answer, decline a viewing or still reject the car on a test drive.
    rep.workDone++;
    const chanceToReach=clamp(43+P.salesImpact(state,c).enquiryLift+
      Math.floor(rep.skills.care/3),43,76);
    if(chance('callback-connected|'+c.id,chanceToReach)){
      const result=book(state,c.vehicleId);
      append(state,c,'sales-follow-up',result.ok?
        rep.name+' contacted buyer and booked a viewing':
        rep.name+' spoke to a price-only caller who was not ready to view');
      notices.push(result.ok?
        'SALES CALLBACK: '+rep.name+' booked '+c.name+' to view stock '+c.vehicleId+
          ' on day '+c.appointmentDay+'. No sale is agreed.':
        'SALES CALLBACK: '+rep.name+' spoke to '+c.name+
          '; buyer declined a viewing after discussing the price.');
    }else{
      append(state,c,'sales-follow-up',rep.name+' called but buyer did not answer');
      notices.push('SALES CALLBACK: '+rep.name+' tried to reach '+c.name+
        ' about stock '+c.vehicleId+'; the buyer has not responded.');
    }
  }
  function advanceDay(state){
    const notices=[];
    for(const c of Object.values(state.customerCases)){
      salespersonCallback(state,c,notices);
      if(c.status==='lost'){
        if(!restoreBooked(state,c,notices)&&c.createdDay<state.day)
          delete state.customerCases[String(c.vehicleId)];
        continue;
      }
      if(c.status==='booked'&&state.day>=c.appointmentDay){
        attendBooked(state,c,notices);
      }else if(c.status==='reserved'&&state.day>=c.collectionDay){
        // A paid deposit is a genuine reservation, so no competing buyers.
        if(chance('collect|'+c.id,
          state.financialScenario==='uk2026'?90:96)){
          c.status='collectable';
          append(state,c,'collection-due','Customer ready to collect');
          notices.push(c.name+' is ready to collect stock '+c.vehicleId+'.');
        }else{
          notices.push(failCase(state,c,'deposit-refunded','Customer cancelled before collection.'));
        }
      }else if(c.status==='collectable'&&state.day>c.collectionDay+5){
        notices.push(failCase(state,c,'deposit-refunded',
          'Customer withdrew after the collection grace period passed.'));
      }else if((c.status==='enquiry'&&state.day-c.createdDay>=3)||
        (['arrived','discussing','agreed'].includes(c.status)&&
        c.createdDay<state.day)){
        notices.push(failCase(state,c,'expired','Customer enquiry expired without a completed agreement.'));
        restoreBooked(state,c,notices);
      }
    }
    notices.push(...queueEnquiries(state));
    return notices;
  }
  function nextSession(state){
    for(const c of Object.values(state.customerCases)){
      if(['reserved','collectable'].includes(c.status))continue;
      if(c.status==='lost'){
        delete state.customerCases[String(c.vehicleId)];
        continue;
      }
      if(c.createdDay!==state.day||c.createdSession===state.deadlineSession)continue;
      failCase(state,c,'expired','Customer left as the next Deal Day session began.');
      delete state.customerCases[String(c.vehicleId)];
    }
  }
  function stats(state,startDay,endDay){
    const events=state.customerHistory.filter(x=>x.day>=startDay&&x.day<=endDay);
    const n=type=>events.filter(e=>e.type===type).length;
    return {enquiries:n('enquiry'),salesFollowUps:n('sales-follow-up'),
      appointments:n('appointment'),
      attended:n('arrived'),noShows:n('no-show'),
      testDrives:n('test-drive-pass')+n('test-drive-reject'),
      declinedTestDrives:n('test-drive-reject'),
      agreements:n('agreement'),deposits:n('deposit'),
      refunds:n('deposit-refunded'),retainedDeposits:n('deposit-retained'),
      retainedAmount:state.customerFunds?.filter(x=>x.type==='retained'&&
        x.day>=startDay&&x.day<=endDay).reduce((n,x)=>n-x.delta,0)||0,
      completedSales:n('sale'),
      counterRejections:n('counter-rejected')};
  }
  function valid(state,saved){
    if(saved.version<8){
      state.customerCases={};state.customerHistory=[];state.customerFunds=[];
      return true;
    }
    const cases=saved.customerCases,history=saved.customerHistory;
    if(!cases||typeof cases!=='object'||Array.isArray(cases)||
      !Array.isArray(history)||history.length>2000||
      Object.keys(cases).length>(state.financialScenario==='uk2026'?
        Math.min(250,state.vehicles.length):state.capacity))return false;
    const no=(x,max=100000000)=>ints(x)&&x>=0&&x<=max;
    const validCase=([id,c])=>/^\d+$/.test(id)&&c&&
      c.vehicleId===Number(id)&&state.vehicles.some(v=>v.id===c.vehicleId&&v.status==='listed')&&
      typeof c.id==='string'&&/^C-\d+-\d+-\d+-\d+$/.test(c.id)&&
      typeof c.name==='string'&&c.name.length>=2&&c.name.length<70&&
      typeof c.channel==='string'&&c.channel.length<=30&&
      STATUS.includes(c.status)&&['cash','part-ex'].includes(c.preferredMode)&&
      no(c.createdDay,36500)&&c.createdDay>=1&&c.createdDay<=state.day&&
      no(c.createdSession,4)&&
      (c.salespersonId==null||(ints(c.salespersonId)&&c.salespersonId>0&&
        c.salespersonId<100000))&&
      ['appointmentDay','agreedDay','collectionDay'].every(k=>
        c[k]===null||(no(c[k],36505)&&c[k]>=c.createdDay))&&
      ['price','allowance'].every(k=>c[k]===null||no(c[k]))&&
      no(c.held,250)&&[0,250].includes(c.held)&&
      no(c.counters,2)&&typeof c.reason==='string'&&c.reason.length<200&&
      (c.quotedPrice==null||no(c.quotedPrice))&&
      (c.quoteStatus==null||['none','counter','accepted'].includes(c.quoteStatus))&&
      (c.quoteRounds==null||no(c.quoteRounds,3))&&
      (c.remote==null||typeof c.remote==='boolean')&&
      (c.remoteInspected==null||typeof c.remoteInspected==='boolean')&&
      (c.remoteAttempted==null||typeof c.remoteAttempted==='boolean')&&
      (c.exchange===null||(c.exchange&&typeof c.exchange==='object'&&
        typeof c.exchange.title==='string'&&no(c.exchange.ask)&&no(c.exchange.floor)))&&
      (!['reserved','collectable'].includes(c.status)||c.held===250)&&
      (!['agreed','reserved','collectable'].includes(c.status)||
        no(c.price)&&c.price>=500)&&
      (c.status!=='lost'||c.held===0)&&
      (!['agreed','reserved','collectable'].includes(c.status)||
        c.price<=state.vehicles.find(v=>v.id===c.vehicleId).asking)&&
      (c.preferredMode!=='part-ex'||!['agreed','reserved','collectable'].includes(c.status)||
        (c.exchange&&c.allowance>=c.exchange.floor&&
          c.allowance<=c.exchange.ask&&c.allowance<c.price))&&
      (!c.standby||(c.standby.standby==null&&c.standby.status==='booked'&&
        c.standby.held===0&&c.standby.vehicleId===c.vehicleId&&
        !['booked','reserved','collectable'].includes(c.status)&&
        validCase([id,c.standby])));
    if(!Object.entries(cases).every(validCase))return false;
    const types=['enquiry','sales-follow-up','price-counter','price-agreed','price-walk',
      'reservation-declined','collection-inspected','collection-rejected',
      'appointment','appointment-restored','appointment-displaced',
      'test-drive-pass','test-drive-reject',
      'counter-accepted','counter-rejected','agreement','deposit','deposit-refunded',
      'deposit-retained','cancelled','arrived','no-show','expired','collection-due','sale'];
    if(!history.every(h=>h&&no(h.day,36500)&&h.day>=1&&h.day<=state.day&&
      no(h.vehicleId,100000)&&h.vehicleId>0&&
      typeof h.leadId==='string'&&h.leadId.length<=50&&
      types.includes(h.type)&&typeof h.detail==='string'&&h.detail.length<=120))
      return false;
    const existingFunds=saved.version>=9?saved.customerFunds:
      Object.values(cases).filter(c=>c.held>0).map(c=>({
        day:c.agreedDay??c.createdDay,vehicleId:c.vehicleId,
        leadId:c.id,type:'received',delta:c.held
      }));
    if(!Array.isArray(existingFunds)||existingFunds.length>4000)return false;
    const typesOfFunds=['received','refunded','retained','applied'];
    if(!existingFunds.every(v=>v&&no(v.day,36500)&&v.day>=1&&v.day<=state.day&&
      no(v.vehicleId,100000)&&v.vehicleId>0&&
      typeof v.leadId==='string'&&v.leadId.length<70&&
      typesOfFunds.includes(v.type)&&ints(v.delta)&&
      (v.type==='received'?v.delta===250:v.delta<0&&v.delta>=-250)))return false;
    if(existingFunds.reduce((n,x)=>n+x.delta,0)!==Object.values(cases)
      .reduce((n,c)=>n+(c.held||0),0))return false;
    if(saved.version>=9&&!Object.values(cases).every(c=>
      ['in-person','legacy-refundable','distance-refundable'].includes(c.terms)&&
      no(c.prepCost,250)&&
      (c.held===0||c.terms==='legacy-refundable'||c.prepCost>=75)))return false;
    state.customerCases=Object.fromEntries(Object.entries(cases).map(([key,c])=>
      [key,{...c,terms:saved.version>=9?c.terms:'legacy-refundable',
        prepCost:saved.version>=9?c.prepCost:0,
        exchange:c.exchange?{...c.exchange}:null,
        standby:c.standby?{...c.standby,standby:null}:null}]));
    state.customerHistory=history.map(h=>({...h}));
    state.customerFunds=existingFunds.map(v=>({...v}));
    return true;
  }
  window.MotorTradeCustomers=Object.freeze({
    caseFor,demand,open,quote,acceptPriceCounter,remoteReserve,inspectRemote,
    book,competingInterest,serveCompeting,testDrive,negotiate,agree,deposit,cancel,
    ready,complete,advanceDay,queueEnquiries,nextSession,stats,valid,heldDeposits,balanceDue,customerPrep
  });
})();