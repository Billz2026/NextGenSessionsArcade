'use strict';
/*
 * Phase 8 — UK independent dealer retail liquidity.
 * Forward-looking retail prices and lead probabilities below are SIMULATION
 * sensitivities, NOT observed auction hammers, completed retail sales,
 * valuations, stock write-downs, depreciation or statutory accounts.
 * Published UK backdrop: Auto Trader's 9 Nov 2026 market commentary reports
 * 29 days average retail days-to-sell in October 2026, a broad market number.
 * Cazoo's Oct 2026 market report separately estimates 49.6 days for
 * independents (typically much larger stock than this 4-space game).
 * Neither source gives a daily lead-conversion probability, so the player
 * funnel is calibrated by observed synthetic career turnover, not fit to
 * either statistic as a causal estimate.
 * https://plc.autotrader.co.uk/news-views/press-releases/commentary-q3-used-car-transactions-2026/
 * https://dealer.cazoo.co.uk/news/cazoo-market-view-reports-softening-of-used-prices-in-october-driven-by-younger-age-profile-cars/
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
    // Buyers normally expect to negotiate below asking. Comparing an
    // ADVERTISED asking price to an ACHIEVED-price estimate without this
    // buffer wrongly reduced ordinary +10% adverts to a 1% daily chance.
    // A high ask still cuts the chance of a serious buyer and caps offers at
    // achievable-value sensitivity; a price-checking caller can still ask.
    const negotiatingBuffer=0.08;
    const premium=x.gapRatio>negotiatingBuffer?
      -Math.round((x.gapRatio-negotiatingBuffer)*36):
      x.gapRatio<0?Math.min(6,Math.round(-x.gapRatio*30)):0;
    const gradePenalty=grade>=5?3:grade===4?2:0;
    // Long adverts retain a nonzero enquiry path; repricing improves demand.
    const stockPenalty=Math.min(2,Math.floor(x.advertisedDays/60));
    const reputation=Math.floor(clamp(state.reputationScore||0,0,100)/35);
    // An active paid sales executive answers inbound contacts and actively
    // markets listed stock. The contact lift is intentionally measurable but
    // does NOT guarantee a viewing, deal or additional profit after salary.
    const salesperson=Math.round(clamp(salesLift,0,16)*0.65);
    // A newly advertised, realistically priced car gets a modest initial
    // marketing boost. This 2-point uplift is a game design assumption,
    // not an independently measured UK customer conversion statistic.
    const freshListing=x.advertisedDays<21?2:0;
    const fuelAdjustment=v.fuel==='Hybrid'?2:v.fuel==='Diesel'?-1:0;
    // The larger top-of-funnel includes low-intent tyre-kickers and price
    // questions, not just buyers ready for a deposit. The game qualifies
    // prospects separately at booking; these are uncalibrated game rates.
    return clamp(14+freshListing+premium-gradePenalty-stockPenalty+reputation+
      salesperson+fuelAdjustment+marketAdjustment,4,40);
  }
  function snapshot(state,E){
    const pendingPrep=E.workshop.reserved(state);
    const tax=E.vat.enabled(state)?Math.ceil(E.vat.outstandingPence(state)/100):0;
    const claims=E.aftersales.pendingRefunds(state);
    const payroll=state.employmentScenario==='uk2026-payroll'?
      E.employment.liabilities(state).total:0;
    // Phase 8B extends creditor protection to unpaid premises. Keep both
    // Finance risk screens on the same accounting definition of free cash.
    const solvency=window.MotorTradeCommercialControls?.status(state);
    const committed=solvency?.commitments??
      pendingPrep+tax+claims+payroll;
    const freeCash=Math.max(0,state.cash-committed);
    const monthlyOverhead=E.premises.costs(state).monthlyCashGuide;
    const staffMonthly=state.staff.reduce((n,e)=>n+(
      state.employmentScenario==='uk2026-payroll'?
      E.employment.monthlyQuote(E.employment.baseSalary(e,state.day),{
        allowanceRemaining:0}).employerCost:E.people.dailyCost(e)*30),0);
    const monthlyBurn=solvency?.monthlyOperating??monthlyOverhead+staffMonthly;
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