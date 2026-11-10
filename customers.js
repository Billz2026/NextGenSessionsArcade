'use strict';
/*
 * The Motor Trade v0.9 — customer journey.
 * Fictional enquiries are reproducible for a vehicle, dealer and game date.
 * Enquiries, appointments, test drives and signed offers are distinct steps.
 * Deposits are held in a separate virtual customer-holding balance; they
 * never enter trading cash and are fully returned on cancellation.
 */
(() => {
  const D=window.MotorTradeEvents;
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
    let percent=65-Math.round(overpriced*100)-(grade>=4?12:0)+
      Math.floor(state.reputationScore/8);
    if(D.isDealDay(state.day)){
      const c=D.outlook(state);
      percent+=c.type==='quiet'?-13:c.type==='subdued'?-5:
        c.type==='busy'?9:c.type==='exceptional'?13:0;
    }
    return chance('buyer|'+leadKey(state,vehicle),clamp(percent,8,91));
  }
  function open(state,id){
    const vehicle=state.vehicles.find(v=>v.id===id);
    if(!vehicle||vehicle.status!=='listed')return fail('stock','Advertise a retail-ready vehicle first.');
    if(caseFor(state,id))return fail('existing','This car already has an active customer case.');
    if(!demand(state,vehicle))return fail('no-enquiry','No customer has enquired about this car this session. Try another day or review its price.');
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
      channel:walkIn?'MONTH-END WALK-IN':(hash('channel|'+key)%2?'ONLINE':'TELEPHONE'),
      status:walkIn?'arrived':'enquiry',preferredMode:preferPX?'part-ex':'cash',
      appointmentDay:null,agreedDay:null,price:null,allowance:null,
      collectionDay:null,held:0,counters:0,reason:'',
      exchange:null
    };
    state.customerCases[String(id)]=c;
    vehicle.cashOffer=null;
    append(state,c,'enquiry',c.channel);
    return ok(c.name+' contacted the dealership about '+vehicle.title+
      (walkIn?'. The customer is here now for a viewing.':
        '. Book a viewing before proceeding to a test drive.'));
  }
  function book(state,id){
    const c=caseFor(state,id);
    if(!c||c.status!=='enquiry')return fail('stage','A new enquiry is required to book a viewing.');
    c.appointmentDay=state.day+1+(hash('appointment|'+c.id)%3);
    c.status='booked';
    append(state,c,'appointment','Day '+c.appointmentDay);
    return ok(c.name+' has booked a viewing for day '+c.appointmentDay+
      '. Attendance is not guaranteed.');
  }
  function testDrive(state,id){
    const c=caseFor(state,id);
    const v=state.vehicles.find(x=>x.id===id);
    if(!c||!v||c.status!=='arrived')return fail('stage','The customer must attend a viewing before a test drive.');
    const key='test-drive|'+c.id;
    const grade=v.profile?.grade||3;
    const pass=chance(key,clamp(81-(grade>=4?19:0)+
      Math.floor(state.reputationScore/12),35,94));
    append(state,c,pass?'test-drive-pass':'test-drive-reject',
      pass?'Customer wants to discuss terms':'Customer did not proceed');
    if(!pass){
      c.status='lost';
      c.reason='Customer did not like the condition or driving experience.';
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
      clamp(75+(state.reputationScore>=40?6:0)-(c.counters-1)*15,15,90));
    if(!receptive){
      const walk=chance('walk|'+c.id+'|'+c.counters,58);
      append(state,c,'counter-rejected',walk?'Customer walked away':'Customer declined increase');
      if(walk){
        c.status='lost';
        c.reason='Customer walked away after a counteroffer.';
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
      ' Complete handover today or take a fully refundable £250 reservation deposit for later collection.');
  }
  function deposit(state,id){
    const c=caseFor(state,id);
    if(!c||c.status!=='agreed')return fail('stage','Agree the sale before taking a reservation deposit.');
    c.held=250;
    c.collectionDay=state.day+1+(hash('collection|'+c.id)%2);
    c.status='reserved';
    append(state,c,'deposit','£250 held separately until collection or refund');
    return ok('£250 reservation deposit held separately for '+c.name+
      '. Collection booked for day '+c.collectionDay+
      '. This is not trading income and is fully refundable if the deal is cancelled.');
  }
  function cancel(state,id){
    const c=caseFor(state,id);
    if(!c||!['enquiry','booked','arrived','discussing','agreed','reserved','collectable'].includes(c.status))
      return fail('stage','No open customer arrangement can be cancelled.');
    const refunded=c.held;
    c.status='lost';
    c.held=0;
    c.reason='Customer or dealership cancelled the arrangement.';
    append(state,c,refunded?'deposit-refunded':'cancelled',
      refunded?'£250 returned from segregated holding funds':'No deposit held');
    return ok('Customer arrangement cancelled.'+
      (refunded?' £250 deposit fully refunded from customer holding funds.':
       ' No money was collected.'));
  }
  function ready(state,id){
    const c=caseFor(state,id);
    return c&&['agreed','collectable'].includes(c.status)&&
      (c.status!=='agreed'||c.agreedDay===state.day);
  }
  function complete(state,id){
    const c=caseFor(state,id);
    if(!ready(state,id))return fail('stage','A test drive, agreed terms and an eligible handover are required.');
    append(state,c,'sale',c.preferredMode);
    delete state.customerCases[String(id)];
    return ok(c.held?'Deposit applied on handover and sale completed.':
      'Customer collected the vehicle and the sale completed.');
  }
  function failCase(state,c,type,reason){
    const refunded=c.held;
    c.held=0;
    c.status='lost';
    c.reason=reason;
    append(state,c,type,reason+(refunded?' £250 fully refunded from held customer funds.':''));
    return reason+(refunded?' The £250 reservation deposit was refunded.':'');
  }
  function advanceDay(state){
    const notices=[];
    for(const c of Object.values(state.customerCases)){
      if(c.status==='lost'){
        if(c.createdDay<state.day)delete state.customerCases[String(c.vehicleId)];
        continue;
      }
      if(c.status==='booked'&&state.day>=c.appointmentDay){
        if(chance('show|'+c.id,clamp(77+Math.floor(state.reputationScore/9),65,93))){
          c.status='arrived';
          append(state,c,'arrived','Attended appointment');
          notices.push(c.name+' arrived for the viewing of stock '+c.vehicleId+'.');
        }else{
          notices.push(failCase(state,c,'no-show','Customer failed to attend their appointment.'));
        }
      }else if(c.status==='reserved'&&state.day>=c.collectionDay){
        if(chance('collect|'+c.id,83)){
          c.status='collectable';
          append(state,c,'collection-due','Customer ready to collect');
          notices.push(c.name+' is ready to collect stock '+c.vehicleId+'.');
        }else{
          notices.push(failCase(state,c,'deposit-refunded','Customer cancelled before collection.'));
        }
      }else if(c.status==='collectable'&&state.day>c.collectionDay+2){
        notices.push(failCase(state,c,'deposit-refunded',
          'Customer withdrew after the agreed collection date passed.'));
      }else if(['enquiry','arrived','discussing','agreed'].includes(c.status)&&
        c.createdDay<state.day){
        notices.push(failCase(state,c,'expired','Customer enquiry expired without a completed agreement.'));
      }
    }
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
    return {enquiries:n('enquiry'),appointments:n('appointment'),
      attended:n('arrived'),noShows:n('no-show'),
      testDrives:n('test-drive-pass')+n('test-drive-reject'),
      declinedTestDrives:n('test-drive-reject'),
      agreements:n('agreement'),deposits:n('deposit'),
      refunds:n('deposit-refunded'),completedSales:n('sale'),
      counterRejections:n('counter-rejected')};
  }
  function valid(state,saved){
    if(saved.version<8){
      state.customerCases={};state.customerHistory=[];
      return true;
    }
    const cases=saved.customerCases,history=saved.customerHistory;
    if(!cases||typeof cases!=='object'||Array.isArray(cases)||
      !Array.isArray(history)||history.length>2000||
      Object.keys(cases).length>state.capacity)return false;
    const no=(x,max=100000000)=>ints(x)&&x>=0&&x<=max;
    const validCase=([id,c])=>/^\d+$/.test(id)&&c&&
      c.vehicleId===Number(id)&&state.vehicles.some(v=>v.id===c.vehicleId&&v.status==='listed')&&
      typeof c.id==='string'&&/^C-\d+-\d+-\d+-\d+$/.test(c.id)&&
      typeof c.name==='string'&&c.name.length>=2&&c.name.length<70&&
      typeof c.channel==='string'&&c.channel.length<=30&&
      STATUS.includes(c.status)&&['cash','part-ex'].includes(c.preferredMode)&&
      no(c.createdDay,36500)&&c.createdDay>=1&&c.createdDay<=state.day&&
      no(c.createdSession,4)&&
      ['appointmentDay','agreedDay','collectionDay'].every(k=>
        c[k]===null||(no(c[k],36505)&&c[k]>=c.createdDay))&&
      ['price','allowance'].every(k=>c[k]===null||no(c[k]))&&
      no(c.held,250)&&[0,250].includes(c.held)&&
      no(c.counters,2)&&typeof c.reason==='string'&&c.reason.length<200&&
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
          c.allowance<=c.exchange.ask&&c.allowance<c.price));
    if(!Object.entries(cases).every(validCase))return false;
    const types=['enquiry','appointment','test-drive-pass','test-drive-reject',
      'counter-accepted','counter-rejected','agreement','deposit','deposit-refunded',
      'cancelled','arrived','no-show','expired','collection-due','sale'];
    if(!history.every(h=>h&&no(h.day,36500)&&h.day>=1&&h.day<=state.day&&
      no(h.vehicleId,100000)&&h.vehicleId>0&&
      typeof h.leadId==='string'&&h.leadId.length<=50&&
      types.includes(h.type)&&typeof h.detail==='string'&&h.detail.length<=120))
      return false;
    state.customerCases=Object.fromEntries(Object.entries(cases).map(([key,c])=>
      [key,{...c,exchange:c.exchange?{...c.exchange}:null}]));
    state.customerHistory=history.map(h=>({...h}));
    return true;
  }
  window.MotorTradeCustomers=Object.freeze({
    caseFor,demand,open,book,testDrive,negotiate,agree,deposit,cancel,
    ready,complete,advanceDay,nextSession,stats,valid,heldDeposits
  });
})();