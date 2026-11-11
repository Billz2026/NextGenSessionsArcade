'use strict';
/*
 * The Motor Trade v0.9.8 — fictional premises and fixed-cost decisions.
 * Figures are game balancing assumptions, not UK commercial lease quotes.
 * Capital expenditure is a cash investment, not recurring operating expense.
 * Daily overheads accrue even if cash is unavailable; unpaid obligations
 * survive saves and cannot be discharged from reserved vehicle repair money.
 */
(() => {
  const FORECOURT=Object.freeze([4,6,8,10]);
  const WORKSHOP=Object.freeze([4,6,8]);
  const FOR_REP=Object.freeze([20,40,80]);
  const WORK_REP=Object.freeze([40,80]);
  const FOR_COST=Object.freeze([1800,3600,6500]);
  const WORK_COST=Object.freeze([2600,4800]);
  const integer=Number.isSafeInteger;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const initial=()=>({forecourtLevel:0,workshopLevel:0,arrears:0});
  const capacity=s=>FORECOURT[s.premises?.forecourtLevel??0]??4;
  const bays=s=>WORKSHOP[s.premises?.workshopLevel??0]??4;
  function costs(s){
    const f=s.premises?.forecourtLevel??0;
    const w=s.premises?.workshopLevel??0;
    const rent=[18,26,35,47][f]??18;
    const utilities=([7,9,11,14][f]??7)+([0,4,10][w]??0);
    const workshopLease=[0,10,22][w]??0;
    return {rent:rent+workshopLease,utilities,
      total:rent+workshopLease+utilities,monthlyGuide:(rent+workshopLease+utilities)*30};
  }
  function quote(state,kind){
    if(!['forecourt','workshop'].includes(kind))return null;
    const f=kind==='forecourt',level=f?state.premises.forecourtLevel:state.premises.workshopLevel;
    const sizes=f?FORECOURT:WORKSHOP,rep=f?FOR_REP:WORK_REP,fees=f?FOR_COST:WORK_COST;
    if(level>=sizes.length-1)return {kind,maximum:true};
    const requiredReputation=rep[level],cost=fees[level];
    const after={
      premises:{...state.premises,[f?'forecourtLevel':'workshopLevel']:level+1}
    };
    const beforeDaily=costs(state).total,afterDaily=costs(after).total;
    const repairReserve=window.MotorTradeWorkshop?.reserved(state)??0;
    const wages=(state.staff||[]).reduce((n,e)=>
      n+Math.ceil(e.monthlySalary/30),0);
    // Repairs and outstanding wages stay protected. One week of rent plus
    // three days of staff wages protects a newly expanded dealership.
    const protectedCash=repairReserve+state.payrollArrears+state.premises.arrears+
      7*afterDaily+3*wages;
    const requiredCash=cost+protectedCash;
    return {kind,maximum:false,current:sizes[level],next:sizes[level+1],
      level:level+1,cost,requiredReputation,eligible:state.reputationScore>=requiredReputation,
      currentDaily:beforeDaily,newDaily:afterDaily,dailyIncrease:afterDaily-beforeDaily,
      protectedCash,requiredCash,shortfall:Math.max(0,requiredCash-state.cash)};
  }
  function upgrade(state,kind){
    const q=quote(state,kind);
    if(!q)return {ok:false,code:'kind',message:'Unknown premises upgrade.'};
    if(q.maximum)return {ok:false,code:'max',message:'This facility is already at maximum capacity.'};
    if(!q.eligible)return {ok:false,code:'reputation',message:'Reach '+q.requiredReputation+
      ' reputation before upgrading '+kind+' facilities.'};
    if(q.shortfall)return {ok:false,code:'cash',message:'Premises expansion needs £'+
      q.requiredCash.toLocaleString('en-GB')+' cash, including the £'+
      q.cost.toLocaleString('en-GB')+' investment and protected wage, rent and repair buffers. '+
      'You are £'+q.shortfall.toLocaleString('en-GB')+' short.'};
    state.cash-=q.cost;
    state.ledger.push({day:state.day,delta:-q.cost,
      note:'Premises investment: '+kind+' level '+q.level});
    state.premises[kind==='forecourt'?'forecourtLevel':'workshopLevel']=q.level;
    state.capacity=capacity(state);
    return {ok:true,message:(kind==='forecourt'?'Forecourt':'Workshop')+
      ' expanded to '+q.next+(kind==='forecourt'?' vehicle spaces.':' repair bays.')+
      ' £'+q.cost.toLocaleString('en-GB')+' invested; recurring overhead increases £'+
      q.dailyIncrease+' per game day.'};
  }
  function advance(state){
    const due=costs(state);
    state.ledger.push({day:state.day,delta:0,
      note:'Premises expense accrued: £'+due.total+' (rent £'+due.rent+
        ', utilities £'+due.utilities+')'});
    state.premises.arrears+=due.total;
    const repairReserve=window.MotorTradeWorkshop?.reserved(state)??0;
    const available=Math.max(0,state.cash-repairReserve);
    const paid=Math.min(available,state.premises.arrears);
    if(paid){
      state.cash-=paid;
      state.premises.arrears-=paid;
      state.ledger.push({day:state.day,delta:-paid,note:'Premises overhead payment'});
    }
    // A missed rent bill is not free money. An extended unpaid balance hurts
    // reputation, but one difficult trading day will not ruin a new business.
    let reputationDelta=0;
    if(state.premises.arrears>due.total*7&&state.day%7===0){
      const before=state.reputationScore;
      state.reputationScore=clamp(before-1,0,100);
      reputationDelta=state.reputationScore-before;
      if(reputationDelta){
        state.reputationHistory.push({day:state.day,delta:reputationDelta,
          reason:'Extended unpaid premises expenses damaged supplier confidence'});
        if(state.reputationHistory.length>90)state.reputationHistory.shift();
      }
    }
    return {due:due.total,paid,arrears:state.premises.arrears,reputationDelta};
  }
  function valid(record){
    return !!record&&typeof record==='object'&&!Array.isArray(record)&&
      integer(record.forecourtLevel)&&record.forecourtLevel>=0&&record.forecourtLevel<FORECOURT.length&&
      integer(record.workshopLevel)&&record.workshopLevel>=0&&record.workshopLevel<WORKSHOP.length&&
      integer(record.arrears)&&record.arrears>=0&&record.arrears<=10000000;
  }
  const clone=record=>({...record});
  window.MotorTradePremises=Object.freeze({
    FORECOURT,WORKSHOP,initial,capacity,bays,costs,quote,upgrade,advance,valid,clone
  });
})();
