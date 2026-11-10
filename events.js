'use strict';
/* The Motor Trade — monthly retail Deal Day and management meetings.
 * A 'month' is the game's 30-day accounting period, not a calendar month.
 * Incentives apply only to retail consumers/private sellers, never auctions.
 */
(() => {
  const PHASES=Object.freeze([
    {time:'09:00',name:'MORNING ENQUIRIES',detail:'Private sellers arrive and retail buyers begin comparing stock.'},
    {time:'11:00',name:'NEW CUSTOMER LEADS',detail:'A fresh group of owners arrive looking for quick agreements.'},
    {time:'13:00',name:'LUNCHTIME NEGOTIATIONS',detail:'Time-sensitive retail and part-exchange enquiries continue.'},
    {time:'15:00',name:'AFTERNOON PUSH',detail:'Motivated sellers reconsider their prices; retail buyers are more decisive.'},
    {time:'17:00',name:'FINAL HOUR',detail:'Last chance to complete customer transactions before the month closes.'}
  ]);
  const FOCI=Object.freeze({
    sales:{label:'Improve retail conversions',description:'Customer offers improve modestly when negotiating listed stock.'},
    buying:{label:'Protect buying margins',description:'The purchasing team works harder to secure a better direct-seller deal.'},
    care:{label:'Prioritise customer care',description:'Good-condition, fairly priced sales earn an extra point of customer trust.'}
  });
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const monthOf=day=>Math.floor((day-1)/30)+1;
  const isDealDay=day=>day%30===0;
  const isMeetingDay=day=>(day-1)%30===0;
  const initial=()=>({deadlineSession:0,meetingHeldMonth:0,meetingFocus:'steady',meetings:[]});
  const meetingDue=state=>isMeetingDay(state.day)&&state.meetingHeldMonth!==monthOf(state.day);
  const meetingBlocksContinue=state=>state.day>1&&meetingDue(state);
  function dealSession(state){
    return isDealDay(state.day)?PHASES[clamp(state.deadlineSession,0,4)]:null;
  }
  function advanceSession(state){
    if(!isDealDay(state.day))return {ok:false,message:'Today is not the final trading day.'};
    if(state.deadlineSession>=PHASES.length-1)
      return {ok:false,closing:true,message:'Final hour complete. Close the month to see your results.'};
    state.deadlineSession++;
    // Buyers and private sellers refresh between sessions; unresolved
    // enquiries expire. Paid inspections are never refunded.
    for(const vehicle of state.vehicles){
      if(vehicle.status==='listed')vehicle.cashOffer=null;
    }
    state.negotiations={};
    state.reports={};
    const count=leadCount(state.day,state.monthPlan?.startingReputation??state.reputationScore,
      state.deadlineSession,state.name);
    return {ok:true,changed:true,closing:false,
      message:'Deal Day '+PHASES[state.deadlineSession].time+
      ': '+(count===0?'No new private-seller leads this session.':
        count+' private seller '+(count===1?'enquiry':'enquiries')+' arrived.')+
      ' Auction houses remain closed.'};
  }
  // Each operating month has a seeded climate that stays fixed across
  // refreshes, saves, and trading sessions. This is a fictional variability
  // model, not a claim about actual seasonal UK car-market data.
  const CLIMATES=Object.freeze({
    quiet:Object.freeze({label:'QUIET MONTH',description:'Low footfall. Some sessions may have no customer enquiries.',
      arrival:[75,95,100],interest:24,motivation:8,partEx:30,privateChance:10}),
    subdued:Object.freeze({label:'SLOW TRADING',description:'A few enquiries, with owners and buyers generally cautious.',
      arrival:[48,85,100],interest:38,motivation:15,partEx:45,privateChance:18}),
    steady:Object.freeze({label:'STEADY TRADING',description:'Normal footfall. Some sellers may want to complete quickly.',
      arrival:[23,72,95,100],interest:58,motivation:28,partEx:60,privateChance:30}),
    busy:Object.freeze({label:'BUSY MONTH END',description:'More enquiries and potential quick deals, but not all customers will negotiate.',
      arrival:[9,40,80,100],interest:77,motivation:44,partEx:76,privateChance:48}),
    exceptional:Object.freeze({label:'VERY BUSY MONTH END',description:'Unusually high customer interest. Good opportunities are possible, not guaranteed.',
      arrival:[2,12,51,84,100],interest:90,motivation:57,partEx:85,privateChance:63})
  });
  function mix(input){
    // FNV-1a with an avalanche pass; changes in month/name/phase give
    // a stable, dispersed but non-predictably varying simulated market.
    let h=2166136261;
    for(const letter of String(input))h=Math.imul(h^letter.charCodeAt(0),16777619)>>>0;
    h=Math.imul(h^(h>>>15),2246822507)>>>0;
    h=Math.imul(h^(h>>>13),3266489909)>>>0;
    return (h^(h>>>16))>>>0;
  }
  const chance=(key,percent)=>mix(key)%100<percent;
  function conditions(day,name=''){
    const month=monthOf(day);
    const roll=mix('monthly-climate|'+String(name).toLowerCase()+'|'+month)%100;
    const type=roll<24?'quiet':roll<43?'subdued':
      roll<75?'steady':roll<95?'busy':'exceptional';
    return {month,type,...CLIMATES[type]};
  }
  const outlook=state=>conditions(state.day,state.name);
  function leadCount(day,reputation,phase,name=''){
    if(!isDealDay(day))return 0;
    const c=conditions(day,name);
    const roll=mix('visitors|'+name+'|'+monthOf(day)+'|'+phase)%100;
    const picked=c.arrival.findIndex(limit=>roll<limit);
    const extra=(reputation>=40&&chance('trusted|'+name+'|'+day+'|'+phase,28))?1:0;
    return clamp(picked+extra,0,5);
  }
  function customers(day,reputation,phase,templates,profile,name=''){
    if(!isDealDay(day))return null;
    const count=leadCount(day,reputation,phase,name);
    const result=Array.from({length:count},(_,i)=>{
      const key='lead|'+name+'|'+day+'|'+phase+'|'+i;
      const base=templates[mix(key+'|template')%templates.length];
      const adjustment=25*((mix(key+'|ask')%21)-10);
      const ask=Math.max(750,base.ask+adjustment);
      const delta=ask-base.ask;
      const miles=Math.max(3000,base.miles+((mix(key+'|miles')%105)-52)*100);
      const wantsQuickSale=chance(key+'|urgency',conditions(day,name).privateChance);
      return {...base,ask,floor:Math.max(100,base.floor+delta),
        retail:Math.max(1100,base.retail+delta),miles,
        id:'S-'+day+'-'+(10+phase*10+i),day,kind:'seller',
        note:base.note+(wantsQuickSale?
          ' · Owner hopes to complete today but will negotiate.':
          ' · Owner is checking the market and may walk away.')};
    });
    return {auctions:[],sellers:result.map(car=>({...car,profile:profile(car)}))};
  }
  function sellerDiscount(state,id=''){
    if(!isDealDay(state.day))return 0;
    const c=outlook(state),key='private|'+state.name+'|'+state.day+'|'+id;
    if(!chance(key,c.privateChance))return 0;
    return 35+25*(mix(key+'|value')%5)+state.deadlineSession*5;
  }
  function retailActive(state,vehicle){
    if(!isDealDay(state.day))return true;
    const c=outlook(state);
    return chance('retail-footfall|'+state.name+'|'+state.day+'|'+
      state.deadlineSession+'|'+(vehicle.origin||vehicle.id),
      Math.min(96,c.interest+(state.monthPlan?.startingReputation>=40?4:0)));
  }
  function customerBonus(state,vehicle){
    if(!isDealDay(state.day))return 0;
    const c=outlook(state);
    const key='retail-urgency|'+state.name+'|'+state.day+'|'+
      state.deadlineSession+'|'+(vehicle.origin||vehicle.id);
    if(!chance(key,c.motivation))return 0;
    return 40+25*(mix(key+'|value')%5)+state.deadlineSession*5;
  }
  function partExchangeAvailable(state,vehicle){
    if(!isDealDay(state.day))return true;
    const c=outlook(state);
    return chance('px-interest|'+state.name+'|'+state.day+'|'+
      state.deadlineSession+'|'+(vehicle.origin||vehicle.id),c.partEx);
  }
  function partExchangeDiscount(state,vehicle){
    if(!isDealDay(state.day))return 0;
    const c=outlook(state);
    const key='px-urgency|'+state.name+'|'+state.day+'|'+
      state.deadlineSession+'|'+(vehicle.origin||vehicle.id);
    if(!chance(key,c.motivation))return 0;
    return 25+25*(mix(key+'|value')%3)+state.deadlineSession*5;
  }
  function meetingBonus(state,kind){
    if(kind==='sales'&&state.meetingFocus==='sales')return 55;
    if(kind==='buying'&&state.meetingFocus==='buying')return 45;
    return 0;
  }
  function careBonus(state,car,achievedPrice){
    const grade=car.profile?.grade??3;
    const fair=car.profile?.likelySale??achievedPrice;
    return state.meetingFocus==='care'&&grade<=3&&achievedPrice<=fair+250?1:0;
  }
  function holdMeeting(state,focus){
    if(!isMeetingDay(state.day))
      return {ok:false,message:'Monthly management meetings are held on the first day of each operating month.'};
    const month=monthOf(state.day);
    if(state.meetingHeldMonth===month)
      return {ok:false,message:'This month\'s meeting is already complete.'};
    if(!Object.prototype.hasOwnProperty.call(FOCI,focus))
      return {ok:false,message:'Choose a valid management priority.'};
    const previous=state.monthlyReports.at(-1)||null;
    const minute={
      month,day:state.day,focus,
      previousMonth:previous?.month??null,
      sold:previous?.soldUnits??0,
      target:previous?.targetUnits??0,
      grossMargin:previous?.grossMargin??0,
      agedStock:previous?.agedStock??0,
      staffCosts:previous?.staffCosts??0,
      cash:state.cash,
      reputation:state.reputationScore
    };
    state.meetingHeldMonth=month;
    state.meetingFocus=focus;
    state.meetings.push(minute);
    if(state.meetings.length>120)state.meetings.shift();
    return {ok:true,changed:true,message:
      'Month '+month+' management meeting completed. Priority: '+
      FOCI[focus].label+'. Review the new monthly targets and act on your decisions.'};
  }
  function restore(state,saved){
    if(saved.version<6){
      Object.assign(state,initial());
      // A migrated game on month 2+ may hold its new meeting immediately;
      // no fabricated historical minutes or deadlines are inserted.
      return true;
    }
    const p=saved;
    if(!Number.isSafeInteger(p.deadlineSession)||
      p.deadlineSession<0||p.deadlineSession>=PHASES.length||
      (!isDealDay(state.day)&&p.deadlineSession!==0)||
      !Number.isSafeInteger(p.meetingHeldMonth)||p.meetingHeldMonth<0||
      p.meetingHeldMonth>monthOf(state.day)||
      !['steady',...Object.keys(FOCI)].includes(p.meetingFocus)||
      !Array.isArray(p.meetings)||p.meetings.length>120)return false;
    if(!p.meetings.every(m=>m&&typeof m==='object'&&
      Number.isSafeInteger(m.month)&&m.month>=1&&m.month<=monthOf(state.day)&&
      Number.isSafeInteger(m.day)&&m.day>=1&&m.day<=state.day&&
      typeof m.focus==='string'&&Object.hasOwn(FOCI,m.focus)&&
      (m.previousMonth===null||Number.isSafeInteger(m.previousMonth))&&
      ['sold','target','grossMargin','agedStock','staffCosts','cash','reputation'].every(k=>
        Number.isSafeInteger(m[k]))))return false;
    if(p.meetings.length){
      const last=p.meetings.at(-1);
      if(last.month>p.meetingHeldMonth||
        (last.month===p.meetingHeldMonth&&last.focus!==p.meetingFocus))return false;
    }
    Object.assign(state,{
      deadlineSession:p.deadlineSession,meetingHeldMonth:p.meetingHeldMonth,
      meetingFocus:p.meetingFocus,meetings:p.meetings.map(x=>({...x}))
    });
    return true;
  }
  window.MotorTradeEvents=Object.freeze({
    PHASES,FOCI,monthOf,isDealDay,isMeetingDay,initial,meetingDue,
    meetingBlocksContinue,dealSession,advanceSession,customers,
    conditions,outlook,leadCount,retailActive,partExchangeAvailable,
    sellerDiscount,customerBonus,partExchangeDiscount,meetingBonus,
    careBonus,holdMeeting,restore
  });
})();