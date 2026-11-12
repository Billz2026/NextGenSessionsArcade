'use strict';
/*
 * The Motor Trade v0.6 — 30-day operating months and recorded management
 * results. No real tax, DVLA records, warranty-cost accrual or statutory
 * accounts. Historical reports are snapshots, not regenerated forecasts.
 */
(() => {
  const PERIOD=30, HISTORY_LIMIT=120;
  const unitBase=score=>score>=80?6:score>=60?5:score>=40?4:score>=20?3:2;
  const money=n=>Math.round(n/100)*100;
  const dayStart=day=>Math.floor((day-1)/PERIOD)*PERIOD+1;
  const monthOf=day=>Math.floor((day-1)/PERIOD)+1;
  const whole=n=>Number.isSafeInteger(n);
  const sum=(list,field)=>list.reduce((n,item)=>n+item[field],0);
  const limit=(n,min,max)=>Math.max(min,Math.min(max,n));
  const completed=(sold,start,end)=>sold.filter(v=>v.day>=start&&v.day<=end);
  const transactions=(ledger,start,end)=>ledger.filter(v=>v.day>=start&&v.day<=end);
  const targetFor=(score,days=PERIOD)=>{
    const tier=unitBase(score);
    // Two-space independent forecourt: targets rise with trust, but never
    // assume the player already owns a larger premises or workshop.
    const unitTarget=days<PERIOD?Math.max(1,Math.ceil(tier*days/PERIOD)):tier;
    const retailGuide=score>=80?8500:score>=60?7750:
      score>=40?7000:score>=20?6000:5250;
    return {unitTarget,turnoverTarget:money(unitTarget*retailGuide),
      marginTarget:money(unitTarget*(score>=60?850:score>=20?700:600))};
  };
  function staffTarget(plan,employee,day){
    if(employee.role!=='sales')return null;
    const first=Math.max(day+1,employee.startDay,plan.startDay);
    const days=Math.max(0,plan.endDay-first+1);
    const units=days<7?0:Math.max(1,Math.ceil(plan.unitTarget*days/
      Math.max(1,plan.endDay-plan.startDay+1)));
    return {id:employee.id,name:employee.name,role:'sales',
      startDay:first,expectedDays:days,unitTarget:units};
  }
  function openingCash(state,startDay){
    // A migrated career may have already traded within the current period.
    // Derive its opening balance from recorded ledger, not a guess.
    const movements=state.ledger.filter(x=>x.day>=startDay&&x.day<=state.day)
      .reduce((n,x)=>n+x.delta,0);
    return state.cash-movements;
  }
  function plan(state,{migrating=false}={}){
    const start=migrating?state.day:dayStart(state.day);
    const end=dayStart(state.day)+PERIOD-1;
    const days=end-start+1;
    const target=targetFor(state.reputationScore,days);
    const next={
      month:monthOf(state.day),startDay:start,endDay:end,
      standardStartDay:dayStart(state.day),partial:start!==dayStart(state.day),
      openingCash:migrating?openingCash(state,start):state.cash,
      startingReputation:state.reputationScore,
      ...target,staffTargets:[]
    };
    for(const employee of state.staff){
      const assigned=staffTarget(next,employee,Math.max(start-1,employee.hiredDay));
      if(assigned)next.staffTargets.push(assigned);
    }
    return next;
  }
  function initialize(state,{migrating=false}={}){
    state.monthlyReports=[];
    state.monthPlan=plan(state,{migrating});
    return state;
  }
  function onHire(state,employee){
    const p=state.monthPlan;
    if(!p||employee.role!=='sales'||p.staffTargets.some(x=>x.id===employee.id))return;
    p.staffTargets.push(staffTarget(p,employee,state.day));
  }
  function categorize(note){
    if(note.startsWith('Retail sale:')||
       note.startsWith('Retail balance received on collection:')||
       note.startsWith('Customer deposit applied to retail sale:'))return 'retailReceipts';
    if(note.startsWith('Auction purchase:'))return 'auctionPurchases';
    if(note.startsWith('Auction transport:'))return 'auctionTransport';
    if(note.startsWith('VAT remittance:'))return 'vatPayments';
    if(note.startsWith('Direct purchase:'))return 'sellerPurchases';
    if(note.startsWith('Part-exchange acquisition:'))return 'partExchangePurchases';
    if(note.startsWith('Preparation and inspection:')||
       note.startsWith('Workshop repair booking:')||
       note.startsWith('Workshop transfer to outside garage:')||
       note.startsWith('Workshop quality rectification:'))return 'preparation';
    if(note.startsWith('Workshop assessment:'))return 'inspections';
    if(note.startsWith('Pre-purchase inspection:'))return 'inspections';
    if(note.startsWith('Aftersales refund:'))return 'customerRefunds';
    if(note.startsWith('Aftersales price reduction:'))return 'customerAdjustments';
    if(note.startsWith('Aftersales collection:'))return 'customerCollection';
    if(note.startsWith('Aftersales repair:'))return 'customerRepairs';
    if(note.startsWith('Staff payroll monthly net wages settlement'))return 'payrollCash';
    if(note.startsWith('Staff HMRC PAYE and NI remittance'))return 'hmrcRemittance';
    if(note.startsWith('Staff workplace pension remittance'))return 'pensionRemittance';
    if(note.startsWith('Staff payroll'))return 'payroll';
    if(note.startsWith('Sales commission:'))return 'commission';
    if(note.startsWith('Recruitment and onboarding:'))return 'recruitment';
    if(note.startsWith('Staff development:')||
       note.startsWith('Staff welfare intervention:'))return 'training';
    if(note.startsWith('Staff exit and provisional notice payment:'))return 'staffExit';
    if(note.startsWith('Premises overhead payment'))return 'premisesPayments';
    if(note.startsWith('Premises investment:'))return 'premisesInvestment';
    return 'other';
  }
  const categories=['retailReceipts','auctionPurchases','auctionTransport','sellerPurchases',
    'partExchangePurchases','preparation','inspections','payroll','commission',
    'recruitment','training','staffExit','other','premisesPayments','premisesInvestment','vatPayments',
    'payrollCash','hmrcRemittance','pensionRemittance',
    'customerRefunds','customerCollection','customerRepairs','customerAdjustments'];
  function statement(state){
    const p=state.monthPlan;
    const sales=completed(state.sold,p.startDay,p.endDay);
    const disposals=completed(state.wholesale||[],p.startDay,p.endDay);
    const ledger=transactions(state.ledger,p.startDay,p.endDay);
    const bucket=Object.fromEntries(categories.map(k=>[k,0]));
    for(const row of ledger)bucket[categorize(row.note)]+=row.delta;
    const saleCount=sales.length;
    const turnover=sum(sales,'price');
    const settled=state.aftersalesScenario==='cra2015-2026'?
      state.aftersales.history.filter(x=>x.day>=p.startDay&&x.day<=p.endDay):[];
    const accepted=state.aftersalesScenario==='cra2015-2026'?
      state.aftersales.cases.filter(x=>x.refundApprovedDay!==null&&
        x.refundApprovedDay>=p.startDay&&x.refundApprovedDay<=p.endDay):[];
    // Customer remedy is an accrued cost on the day liability is AGREED,
    // not when the bank eventually pays. The vehicle's original cost
    // returns to stock on physical recovery; the original sale margin is
    // reversed exactly once. Collection is another operating expense.
    const refundTurnover=sum(accepted,'refundAmount');
    const grossMargin=sum(sales,'profit')+sum(disposals,'profit')-
      accepted.reduce((n,x)=>n+(x.remedy==='price-reduction'?
        x.refundAmount:(state.sold.find(s=>s.id===x.saleId)?.profit||0)),0);
    const aftercareCost=-bucket.customerRepairs+sum(accepted,'collectionCost');
    const premisesExpense=ledger.filter(x=>x.note.startsWith('Premises expense accrued: £'))
      .reduce((n,x)=>n+Number(/^Premises expense accrued: £(\d+)/.exec(x.note)?.[1]||0),0);
    const inflow=ledger.filter(x=>x.delta>0).reduce((n,x)=>n+x.delta,0);
    const outflow=-ledger.filter(x=>x.delta<0).reduce((n,x)=>n+x.delta,0);
    const modernPayroll=state.employmentScenario==='uk2026-payroll';
    const accrued=ledger.filter(x=>/^(Staff salary expense accrued: £|Staff commission accrued: £|Staff notice expense accrued: £|Staff employer charges accrued: £)/.test(x.note))
      .reduce((n,x)=>n+Number(/^Staff (?:salary expense|commission|notice expense|employer charges) accrued: £(\d+)/.exec(x.note)?.[1]||0),0);
    const payrollCost=modernPayroll?
      accrued-(bucket.recruitment+bucket.training+bucket.staffExit):
      -(bucket.payroll+bucket.commission+bucket.recruitment+
        bucket.training+bucket.staffExit);
    const payrollCashPaid=modernPayroll?
      -(bucket.payrollCash+bucket.hmrcRemittance+bucket.pensionRemittance):0;
    const prepCost=-bucket.preparation;
    const acquisitions=-(bucket.auctionPurchases+bucket.auctionTransport+
      bucket.sellerPurchases+bucket.partExchangePurchases);
    const soldModes={
      cash:sales.filter(v=>v.mode==='cash').length,
      partExchange:sales.filter(v=>v.mode==='part-ex').length
    };
    const salespersonStats=p.staffTargets.map(item=>{
      const theirDeals=sales.filter(s=>s.salespersonId===item.id);
      const count=theirDeals.length;
      const onTeam=state.staff.some(s=>s.id===item.id);
      return {...item,sold:count,turnover:sum(theirDeals,'price'),
        grossMargin:sum(theirDeals,'profit'),
        hit:item.unitTarget>0&&count>=item.unitTarget,
        exempt:item.unitTarget===0,employedAtClose:onTeam};
    });
    const stock=state.vehicles.map(v=>({
      id:v.id,title:v.title,status:v.status,source:v.source,
      age:Math.max(0,state.day-v.acquiredDay),
      cashInvested:v.cost+v.prepSpent+(v.status==='acquired' &&
        ['in-progress','quality-check'].includes(v.workshop?.stage)?
        v.workshop.repairCost:0),
      asking:v.asking,repairToPay:v.status==='acquired' &&
        !['in-progress','quality-check'].includes(v.workshop?.stage)?
        v.prepBudget:0,
      workshopStage:v.workshop?.stage??'unknown',
      workshopDaysLeft:v.workshop?.remainingDays??0
    }));
    const operatingContribution=grossMargin-payrollCost-premisesExpense-aftercareCost;
    const vatOutputAccruedPence=state.financialScenario==='uk2026'?
      [...sales,...disposals].reduce((n,v)=>n+(v.vat?.outputPence||0),0)-
      sum(settled,'creditedVatPence'):0;
    // The game ledger is whole-pound cash. Show a conservative pound-rounded
    // expense bridge while retaining the underlying pence liability exactly.
    const operatingAfterVat=operatingContribution-
      Math.ceil(vatOutputAccruedPence/100);
    const vatPayments=-bucket.vatPayments;
    const met=saleCount>=p.unitTarget && grossMargin>0&&
      (state.financialScenario==='uk2026'?operatingAfterVat:operatingContribution)>0;
    const report={
      month:p.month,monthLabel:'MONTH '+p.month,
      startDay:p.startDay,endDay:p.endDay,partial:p.partial,
      startingReputation:p.startingReputation,
      closingReputation:state.reputationScore,
      targetUnits:p.unitTarget,targetTurnover:p.turnoverTarget,
      targetMargin:p.marginTarget,
      soldUnits:saleCount,turnover,grossMargin,
      wholesaleUnits:disposals.length,wholesaleProfit:sum(disposals,'profit'),
      averageMargin:saleCount?Math.round(grossMargin/saleCount):0,
      targetMet:met,turnoverMet:turnover>=p.turnoverTarget,
      marginMet:grossMargin>=p.marginTarget,
      grossAfterStaff:grossMargin-payrollCost,
      ...(state.aftersalesScenario==='cra2015-2026'?{
        aftercareCost,refundTurnover,
        refundedUnits:accepted.filter(x=>x.remedy!=='price-reduction').length,
        priceReducedUnits:accepted.filter(x=>x.remedy==='price-reduction').length,
        netRetailTurnover:turnover-refundTurnover}:{}),
      premisesExpense,premisesPaid:-bucket.premisesPayments,
      premisesInvestment:-bucket.premisesInvestment,
      premisesArrears:state.premises?.arrears??0,
      operatingContribution,operatingAfterVat,vatOutputAccruedPence,vatPayments,
      openingCash:p.openingCash,closingCash:state.cash,
      cashIn:inflow,cashOut:outflow,netCashChange:inflow-outflow,
      totalAcquisitions:acquisitions,prepCost,staffCosts:payrollCost,
      ledgerBreakdown:bucket,salesModes:soldModes,
      sellers:salespersonStats,
      stock,stockCount:stock.length,
      stockCapital:stock.reduce((n,x)=>n+x.cashInvested,0),
      agedStock:stock.filter(x=>x.age>=14).length,
      stockAwaitingPrep:stock.filter(x=>x.status==='acquired').length,
      workshopInProgress:stock.filter(x=>x.workshopStage==='in-progress').length,
      workshopQualityChecks:stock.filter(x=>x.workshopStage==='quality-check').length,
      workshopWaiting:stock.filter(x=>['unassessed','quoted'].includes(x.workshopStage)).length,
      payrollArrears:state.payrollArrears,staffHeadcount:state.staff.length,
      ...(modernPayroll?{payrollCashPaid,
        payrollStatutoryDue:window.MotorTradeEmployment.liabilities(state).hmrc+
          window.MotorTradeEmployment.liabilities(state).pension}:{}),
      customerTrustEvents:state.reputationHistory.filter(x=>x.day>=p.startDay&&x.day<=p.endDay).map(x=>({...x})),
      customerJourney:window.MotorTradeCustomers?
        window.MotorTradeCustomers.stats(state,p.startDay,Math.min(state.day,p.endDay)):null,
      customerHoldingAtClose:window.MotorTradeCustomers?
        window.MotorTradeCustomers.heldDeposits(state):0,
      customerPreparationExpense:-ledger.filter(x=>x.note.startsWith(
        'Customer-specific collection preparation:')).reduce((n,x)=>n+x.delta,0),
      cancellationCostRecovery:ledger.filter(x=>x.note.startsWith(
        'Fair cancellation cost recovery:')).reduce((n,x)=>n+x.delta,0),
      bestDeal:sales.length?[...sales].sort((a,b)=>b.profit-a.profit)[0].title:null,
      worstDeal:sales.length?[...sales].sort((a,b)=>a.profit-b.profit)[0].title:null
    };
    return report;
  }
  function close(state){
    const p=state.monthPlan;
    if(state.day!==p.endDay)return null;
    const r=statement(state);
    const D=window.MotorTradeEvents;
    const climate=D?.conditions(p.endDay,state.name)||null;
    const deadlineSales=state.sold.filter(v=>v.day===p.endDay);
    r.dealDay=climate?{
      type:climate.type,label:climate.label,
      sellerEnquiries:D.PHASES.reduce((n,_,phase)=>
        n+D.leadCount(p.endDay,p.startingReputation,phase,state.name),0),
      retailSales:deadlineSales.length,
      turnover:sum(deadlineSales,'price'),grossMargin:sum(deadlineSales,'profit')
    }:null;
    const staffConsequences=[];
    for(const staff of r.sellers){
      const employee=state.staff.find(s=>s.id===staff.id);
      if(!employee||staff.exempt)continue;
      const change=staff.hit?3:-5;
      employee.morale=limit(employee.morale+change,0,100);
      staffConsequences.push({id:staff.id,name:staff.name,met:staff.hit,moraleChange:change});
    }
    // Volume never rewards repeated loss-making deals. Penalty for a
    // serious shortfall is small and reversible through good customer care.
    let repDelta=0;
    if(r.targetMet&&r.operatingContribution>0)repDelta=1;
    else if(r.soldUnits<Math.ceil(r.targetUnits*.5))repDelta=-1;
    const old=state.reputationScore;
    state.reputationScore=limit(old+repDelta,0,100);
    repDelta=state.reputationScore-old;
    if(repDelta!==0){
      const reason=repDelta>0?'Monthly sales goal achieved with positive operating contribution':
        'Monthly sales volume significantly below plan';
      const event={day:state.day,delta:repDelta,reason};
      state.reputationHistory.push(event);
      r.customerTrustEvents.push({...event});
      if(state.reputationHistory.length>90)state.reputationHistory.shift();
    }
    state.reputation=window.MotorTradePeople.tier(state.reputationScore);
    r.closingReputation=state.reputationScore;
    r.reputationChange=r.closingReputation-r.startingReputation;
    r.staffOutcomes=staffConsequences;
    r.managementComment=r.targetMet?
      'Company sales target achieved with a positive operating contribution after recurring premises costs.':
      r.soldUnits>=r.targetUnits?
        'Volume reached, but costs consumed the trading margin. Review buying, staffing and premises overheads.':
        'Sales target missed. Review stock age, sales performance and operating costs.';
    state.monthlyReports.push(r);
    if(state.monthlyReports.length>HISTORY_LIMIT)state.monthlyReports.shift();
    return r;
  }
  function next(state){
    if(state.day!==dayStart(state.day))throw Error('New month must begin on its first day');
    state.monthPlan=plan(state);
  }
  const nonneg=n=>whole(n)&&n>=0&&n<=100000000;
  function validPlan(p,day){
    return p&&typeof p==='object'&&!Array.isArray(p)&&
      whole(p.month)&&p.month===monthOf(day)&&
      whole(p.startDay)&&p.startDay>=dayStart(day)&&p.startDay<=day&&
      whole(p.endDay)&&p.endDay===dayStart(day)+PERIOD-1&&
      whole(p.standardStartDay)&&p.standardStartDay===dayStart(day)&&
      typeof p.partial==='boolean'&&p.partial===(p.startDay!==p.standardStartDay)&&
      whole(p.openingCash)&&p.openingCash>=0&&p.openingCash<=100000000&&
      whole(p.startingReputation)&&p.startingReputation>=0&&p.startingReputation<=100&&
      whole(p.unitTarget)&&p.unitTarget>=1&&p.unitTarget<=6&&
      nonneg(p.turnoverTarget)&&nonneg(p.marginTarget)&&
      Array.isArray(p.staffTargets)&&p.staffTargets.length<=100&&
      p.staffTargets.every(s=>s&&whole(s.id)&&s.id>0&&
        typeof s.name==='string'&&s.name.length<60&&s.role==='sales'&&
        whole(s.startDay)&&s.startDay>=p.startDay&&s.startDay<=p.endDay+1&&
        whole(s.expectedDays)&&s.expectedDays>=0&&s.expectedDays<=30&&
        whole(s.unitTarget)&&s.unitTarget>=0&&s.unitTarget<=6)&&
      new Set(p.staffTargets.map(x=>x.id)).size===p.staffTargets.length;
  }
  function validReport(r){
    if(!r||typeof r!=='object'||Array.isArray(r)||!whole(r.month)||r.month<1||
      typeof r.monthLabel!=='string'||r.monthLabel.length>30||
      !whole(r.startDay)||!whole(r.endDay)||r.startDay>r.endDay||
      typeof r.partial!=='boolean'||!nonneg(r.soldUnits)||
      !nonneg(r.targetUnits)||!nonneg(r.turnover)||!whole(r.grossMargin)||
      !whole(r.averageMargin)||typeof r.targetMet!=='boolean'||
      !whole(r.openingCash)||!whole(r.closingCash)||
      !nonneg(r.cashIn)||!nonneg(r.cashOut)||!whole(r.netCashChange)||
      !Array.isArray(r.stock)||r.stock.length>100||
      !Array.isArray(r.sellers)||r.sellers.length>100||
      !Array.isArray(r.customerTrustEvents)||r.customerTrustEvents.length>200||
      !r.ledgerBreakdown||typeof r.ledgerBreakdown!=='object'||
      !categories.every(k=>whole(r.ledgerBreakdown[k])||
        (['premisesPayments','premisesInvestment','auctionTransport','vatPayments',
          'payrollCash','hmrcRemittance','pensionRemittance',
          'customerRefunds','customerCollection','customerRepairs','customerAdjustments'].includes(k)&&r.ledgerBreakdown[k]===undefined))||
      !whole(r.staffCosts)||!whole(r.payrollArrears))return false;
    if(r.premisesExpense!==undefined&&(
      !nonneg(r.premisesExpense)||!nonneg(r.premisesPaid)||
      !nonneg(r.premisesInvestment)||!nonneg(r.premisesArrears)||
      !whole(r.operatingContribution)||
      r.operatingContribution!==r.grossAfterStaff-r.premisesExpense-(r.aftercareCost||0)))return false;
    if(r.payrollCashPaid!==undefined&&(
      !nonneg(r.payrollCashPaid)||!nonneg(r.payrollStatutoryDue)))return false;
    if(r.aftercareCost!==undefined&&(
      !nonneg(r.aftercareCost)||!nonneg(r.refundTurnover)||
      !nonneg(r.refundedUnits)||!nonneg(r.priceReducedUnits)||
      !whole(r.netRetailTurnover)))return false;
    if(r.vatOutputAccruedPence!==undefined&&(
      !whole(r.vatOutputAccruedPence)||!whole(r.operatingAfterVat)||
      !nonneg(r.vatPayments)))return false;
    if(r.customerHoldingAtClose!==undefined&&
      (!nonneg(r.customerHoldingAtClose)||r.customerHoldingAtClose>1000))return false;
    if(r.customerPreparationExpense!==undefined&&
      (!nonneg(r.customerPreparationExpense)||!nonneg(r.cancellationCostRecovery??0)))return false;
    if(r.customerJourney!=null){
      const j=r.customerJourney;
      const keys=['enquiries','appointments','attended','noShows','testDrives',
        'declinedTestDrives','agreements','deposits','refunds','completedSales','counterRejections'];
      if(typeof j!=='object'||Array.isArray(j)||
         !keys.every(k=>nonneg(j[k])&&j[k]<=10000))return false;
    }
    if(r.dealDay!=null&&(
      typeof r.dealDay!=='object'||
      !['quiet','subdued','steady','busy','exceptional'].includes(r.dealDay.type)||
      typeof r.dealDay.label!=='string'||r.dealDay.label.length>40||
      !nonneg(r.dealDay.sellerEnquiries)||r.dealDay.sellerEnquiries>25||
      !nonneg(r.dealDay.retailSales)||!nonneg(r.dealDay.turnover)||
      !whole(r.dealDay.grossMargin)
    ))return false;
    return r.openingCash+r.netCashChange===r.closingCash &&
      r.cashIn-r.cashOut===r.netCashChange &&
      r.sellers.every(s=>s&&whole(s.id)&&typeof s.name==='string'&&
        nonneg(s.sold)&&nonneg(s.unitTarget));
  }
  function restore(state,saved){
    if(saved.version<5){
      initialize(state,{migrating:true});
      return true;
    }
    if(!validPlan(saved.monthPlan,state.day)||
      !Array.isArray(saved.monthlyReports)||
      saved.monthlyReports.length>HISTORY_LIMIT||
      !saved.monthlyReports.every(validReport))return false;
    const p=saved.monthPlan;
    const cashSince=state.ledger.filter(l=>l.day>=p.startDay&&l.day<=state.day)
      .reduce((n,l)=>n+l.delta,0);
    if(p.openingCash+cashSince!==state.cash)return false;
    state.monthPlan=JSON.parse(JSON.stringify(p));
    state.monthlyReports=JSON.parse(JSON.stringify(saved.monthlyReports));
    return true;
  }
  window.MotorTradeMonthly=Object.freeze({
    PERIOD,monthOf,dayStart,targetFor,initialize,onHire,
    statement,close,next,restore,validPlan,validReport
  });
})();
