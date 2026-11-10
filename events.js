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
    state.negotiations={};
    state.reports={};
    return {ok:true,changed:true,closing:false,
      message:'Deal Day '+PHASES[state.deadlineSession].time+
      ': new private-seller leads have arrived. Auctions remain closed.'};
  }
  const seed=(day,phase,index,salt)=>{
    let x=((day*3667)^(phase*2153)^(index*1511)^salt)>>>0;
    x=Math.imul(x^(x>>>15),2246822507)>>>0;
    return (x^(x>>>13))>>>0;
  };
  function customers(day,reputation,phase,templates,profile){
    if(!isDealDay(day))return null;
    const count=clamp(2+(phase%2)+(reputation>=40?1:0),2,4);
    const result=Array.from({length:count},(_,i)=>{
      const base=templates[(day+phase*2+i)%templates.length];
      const adjustment=25*((seed(day,phase,i,33)%17)-8);
      const ask=Math.max(750,base.ask+adjustment);
      const delta=ask-base.ask;
      const miles=Math.max(3000,base.miles+(seed(day,phase,i,61)%105-52)*100);
      return {...base,ask,floor:Math.max(100,base.floor+delta),
        retail:Math.max(1100,base.retail+delta),miles,
        id:'S-'+day+'-'+(10+phase*10+i),day,kind:'seller',
        note:base.note+' · Month-end customer enquiry, looking to complete today.'};
    });
    return {auctions:[],sellers:result.map(car=>({...car,profile:profile(car)}))};
  }
  function sellerDiscount(state){
    if(!isDealDay(state.day))return 0;
    return 65+state.deadlineSession*15;
  }
  function customerBonus(state){
    if(!isDealDay(state.day))return 0;
    return 75+state.deadlineSession*30;
  }
  function partExchangeDiscount(state){
    return isDealDay(state.day)?45+state.deadlineSession*10:0;
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
    sellerDiscount,customerBonus,partExchangeDiscount,meetingBonus,
    careBonus,holdMeeting,restore
  });
})();