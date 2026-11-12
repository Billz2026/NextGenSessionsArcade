'use strict';
/*
 * Phase 8 — UK independent dealer retail liquidity.
 * Forward-looking retail prices and lead probabilities below are SIMULATION
 * sensitivities, NOT observed auction hammers, completed retail sales,
 * valuations, stock write-downs, depreciation or statutory accounts.
 * Published UK backdrop: Auto Trader's 9 Nov 2026 market commentary reports
 * 29 days average retail days-to-sell in October 2026. This is a broad market
 * statistic, not a measured conversion rate for a four-space independent.
 * https://plc.autotrader.co.uk/news-views/press-releases/commentary-q3-used-car-transactions-2026/
 * Use historical retail comparables as a starting point, then disclose model
 * uncertainty; never reroll purchases or generate cash simply by looking.
 */
(() => {
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const heldDays=(state,v)=>Math.max(0,state.day-(v.acquiredDay||state.day));
  const listedDays=(state,v)=>v.listedDay==null?0:Math.max(0,state.day-v.listedDay);
  function value(state,v){
    const raw=Math.max(500,Math.min(
      Number(v.profile?.likelySale)||Number(v.retail)||500,
      Number(v.retail)||Number(v.profile?.likelySale)||500));
    const stockDays=heldDays(state,v);
    // Scenario haircut for old stock, NOT evidence that the market declined.
    // Aged cars can also appreciate; this is a downside-sensitive assumption.
    const haircut=clamp(Math.floor(Math.max(0,stockDays-30)/30)*0.015,0,0.18);
    const indicative=Math.max(500,Math.round((raw*(1-haircut))/25)*25);
    const ask=Number.isSafeInteger(v.asking)?v.asking:indicative;
    return {stockDays,advertisedDays:listedDays(state,v),comparable:raw,
      indicative,ageHaircutPct:Math.round(haircut*1000)/10,
      excessAsk:Math.max(0,ask-indicative),
      gapRatio:(ask-indicative)/Math.max(500,indicative)};
  }
  function enquiryPercent(state,v,salesLift=0,marketAdjustment=0){
    const x=value(state,v);
    const grade=v.profile?.grade||3;
    const premium=x.gapRatio>0?-Math.round(x.gapRatio*95):
      Math.min(8,Math.round(-x.gapRatio*40));
    const gradePenalty=grade>=5?7:grade===4?4:0;
    const stockPenalty=Math.min(7,Math.floor(x.advertisedDays/30)*2);
    const reputation=Math.floor(clamp(state.reputationScore||0,0,100)/20);
    const salesperson=Math.round(clamp(salesLift,0,16)*0.4);
    const fuelAdjustment=v.fuel==='Hybrid'?2:v.fuel==='Diesel'?-1:0;
    return clamp(12+premium-gradePenalty-stockPenalty+reputation+
      salesperson+fuelAdjustment+marketAdjustment,1,40);
  }
  function snapshot(state,E){
    const pendingPrep=E.workshop.reserved(state);
    const tax=E.vat.enabled(state)?Math.ceil(E.vat.outstandingPence(state)/100):0;
    const claims=E.aftersales.pendingRefunds(state);
    const payroll=state.employmentScenario==='uk2026-payroll'?
      E.employment.liabilities(state).total:0;
    const committed=pendingPrep+tax+claims+payroll;
    const freeCash=Math.max(0,state.cash-committed);
    const monthlyOverhead=E.premises.costs(state).monthlyCashGuide;
    const staffMonthly=state.staff.reduce((n,e)=>n+(
      state.employmentScenario==='uk2026-payroll'?
      E.employment.monthlyQuote(E.employment.baseSalary(e,state.day),{
        allowanceRemaining:0}).employerCost:E.people.dailyCost(e)*30),0);
    const monthlyBurn=monthlyOverhead+staffMonthly;
    const stock=state.vehicles.map(v=>{
      const estimate=value(state,v);
      const paidRepairs=['in-progress','quality-check'].includes(v.workshop?.stage)?
        Number(v.workshop.repairCost||0):Number(v.prepSpent||0);
      const invested=Number(v.cost||0)+paidRepairs;
      return {id:v.id,title:v.title,...estimate,invested,
        atRisk:Math.max(0,invested-estimate.indicative),
        aged30:estimate.stockDays>=30,aged60:estimate.stockDays>=60};
    });
    const totalInvested=stock.reduce((n,x)=>n+x.invested,0);
    const estimatedRealisation=stock.reduce((n,x)=>n+x.indicative,0);
    return {cash:state.cash,committed,freeCash,monthlyBurn,
      cashRunwayDays:monthlyBurn?Math.floor(freeCash/monthlyBurn*30):null,
      threeMonthBuffer:monthlyBurn*3,
      belowBuffer:freeCash<monthlyBurn*3,
      stockCount:stock.length,stockInvested:totalInvested,
      stockIndicative:estimatedRealisation,
      downsideShortfall:stock.reduce((n,x)=>n+x.atRisk,0),
      aged30:stock.filter(x=>x.aged30).length,
      aged60:stock.filter(x=>x.aged60).length,stock};
  }
  window.MotorTradeRetailLiquidity=Object.freeze({
    heldDays,listedDays,value,enquiryPercent,snapshot
  });
})();