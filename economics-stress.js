'use strict';
/*
 * Deterministic commercial stress sensitivities, not market forecasts.
 * Model assumes every quoted sale completes during its stated 30-day period
 * with the AFTER-ACQUISITION/FEES/DELIVERY/REPAIR/VAT cash contribution
 * specified by the scenario. No stock financing/settlement lag, debt, interest,
 * supplier credit, claim probabilities, demand curves, tax refunds or resale
 * guarantees are inferred. Real historical sales and ledgers are untouched.
 *
 * Uses real 2026 career operating costs and payroll state as anchors, and
 * explicitly conservative hypothetical sales and aftersales outcomes.
 * Business failure appears as unfunded commitments, NOT a negative bank balance.
 */
(() => {
  const ints=x=>Number.isSafeInteger(x)&&x>=0;
  const fail=msg=>{throw new Error(msg)};
  const resolve=(state,E)=>{
    if(state.financialScenario!=='uk2026')fail('Cash-flow stress requires 2026 Independent career');
    const premises=E.premises.costs(state);
    const payroll=state.employmentScenario==='uk2026-payroll'?
      state.staff.reduce((n,s)=>n+
        E.employment.monthlyQuote(E.employment.baseSalary(s,state.day),
          {allowanceRemaining:0}).employerCost,0):0;
    const reserves=(E.workshop.reserved(state)||0)+
      (E.vat.enabled(state)?Math.ceil(E.vat.outstandingPence(state)/100):0)+
      (E.aftersales.pendingRefunds(state)||0)+
      (state.employmentScenario==='uk2026-payroll'?
        E.employment.liabilities(state).total:0);
    return {
      cash:state.cash,initialReserves:reserves,
      baselineMonthlyOverhead:premises.monthlyCashGuide,
      monthlyStaffCost:payroll,
      initialGameDay:state.day
    };
  };
  function project(state,E,params={}){
    const s=resolve(state,E);
    const months=params.months??12,
      units=params.unitsPerMonth??0,
      cashContribution=params.contributionPerSale??0,
      annualClaim=params.annualClaimCost??0;
    if(!ints(months)||months<1||months>60||
      !ints(units)||units>8||!ints(cashContribution)||cashContribution>20000||
      !ints(annualClaim)||annualClaim>20000)fail('Invalid stress scenario assumptions');
    let cash=Math.max(0,s.cash-s.initialReserves),
      unpaid=Math.max(0,s.initialReserves-s.cash),
      firstShortfall=unpaid>0?0:null,totalUnits=0,claims=0,
      totalOutflow=0,totalContribution=0;
    const rows=[];
    for(let month=1;month<=months;month++){
      // Annual insurance paid in cash again after 360 simulated days.
      // With no other premiums, days 361/721/1081/1441 require £3,000.
      const initialDay=s.initialGameDay+(month-1)*30;
      const premium=Array.from({length:30},(_,d)=>initialDay+d).filter(day=>
        day>1&&(day-1)%360===0).length*3000;
      const claim=annualClaim&&month%12===7?annualClaim:0;
      const contribution=units*cashContribution,
        expense=s.baselineMonthlyOverhead+s.monthlyStaffCost+premium+claim;
      const funds=cash+contribution;
      if(funds<expense&&firstShortfall===null)firstShortfall=month;
      // No overdraft, borrowing or negative bank cash is manufactured.
      // New monthly cash is applied to older unpaid bills before any spendable
      // balance is shown.
      const usable=funds-unpaid-expense;
      cash=Math.max(0,usable);
      unpaid=Math.max(0,-usable);
      totalUnits+=units;claims+=claim;
      totalContribution+=contribution;totalOutflow+=expense;
      rows.push({month,units,contribution,overhead:s.baselineMonthlyOverhead,
        staff:s.monthlyStaffCost,premium,claim,expense,cash,unpaid});
    }
    return {months,unitsPerMonth:units,contributionPerSale:cashContribution,
      annualClaimCost:annualClaim,openingCash:s.cash,
      protectedStartingLiabilities:s.initialReserves,
      monthlyCashOverhead:s.baselineMonthlyOverhead,
      monthlyConservativeStaff:s.monthlyStaffCost,
      totalUnits,totalContribution,totalOutflow,totalClaims:claims,
      firstCashShortfallMonth:firstShortfall,
      endingBankCash:cash,unfundedCommitments:unpaid,rows,
      warning:'Illustrative cash-flow sensitivity only. Unit contribution is an assumed after-VAT-and-prep amount; sale completion, stock funding and timing are not forecast.'};
  }
  function sensitivity(state,E,months=12){
    return [
      {name:'Low volume / low margin',...project(state,E,{
        months,unitsPerMonth:1,contributionPerSale:700,annualClaimCost:2500})},
      {name:'Three monthly sales',...project(state,E,{
        months,unitsPerMonth:3,contributionPerSale:1000,annualClaimCost:2500})},
      {name:'Strong sales, adverse claim',...project(state,E,{
        months,unitsPerMonth:4,contributionPerSale:1400,annualClaimCost:5000})}
    ];
  }
  window.MotorTradeCashStress=Object.freeze({project,sensitivity,resolve});
})();
