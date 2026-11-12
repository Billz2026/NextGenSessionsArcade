'use strict';
/*
 * Phase 8B — UK2026 dealer cash controls (simulation, not legal insolvency).
 * No automatic bankruptcy: UK insolvent companies may sometimes continue
 * under professional advice or formal procedures, and cash-flow and balance-
 * sheet solvency differ. This game models an operational creditor hold only.
 * https://www.gov.uk/guidance/director-information-hub-insolvency
 *
 * All figures here are derived from existing ledgers/liabilities. No new
 * credit, bank money, legal claim, cash transaction or save field is created.
 */
(() => {
  const E=window.MotorTradeEmployment,V=window.MotorTradeVat,
    W=window.MotorTradeWorkshop,A=window.MotorTradeAftersales,
    SITE=window.MotorTradePremises,P=window.MotorTradePeople;
  if(![E,V,W,A,SITE,P].every(Boolean))
    throw new Error('Load payroll, VAT, workshop, aftersales, premises and people before commercial controls');
  const modern=s=>s.financialScenario==='uk2026';
  const ceilPence=p=>Math.ceil(Math.max(0,p)/100);
  function status(state){
    const repair=W.reserved(state);
    const vat=V.enabled(state)?ceilPence(V.outstandingPence(state)):0;
    // The engine settles whole pounds only. A carried 1–99p VAT residue
    // cannot be paid with the integer-pound ledger and is NOT grounds for
    // freezing sourcing. Count only matured, payable whole-pound amounts.
    const maturedVat=V.enabled(state)?Math.floor(V.maturedPence(state)/100):0;
    const refunds=A.pendingRefunds(state);
    const payroll=state.employmentScenario==='uk2026-payroll'?
      E.liabilities(state).total:Math.max(0,state.payrollArrears||0);
    const premises=Math.max(0,state.premises?.arrears||0);
    const wagesArrears=Math.max(0,state.payrollArrears||0);
    // Do not double-count wages already included in E.liabilities().
    const commitments=repair+vat+refunds+payroll+premises;
    const freeBank=Math.max(0,state.cash-commitments);
    const monthlyStaff=(state.staff||[]).reduce((n,s)=>n+(
      state.employmentScenario==='uk2026-payroll'?
        E.monthlyQuote(E.baseSalary(s,state.day),{allowanceRemaining:0}).employerCost:
        P.dailyCost(s)*30),0);
    const monthlyOperating=SITE.costs(state).monthlyCashGuide+monthlyStaff;
    const minimumBuffer=Math.ceil(monthlyOperating*14/30);
    // Accepted customer remedies are real obligations; not all are legally overdue
    // immediately, but owner-financed fresh stock is a discretionary use of cash.
    const overdue=premises+wagesArrears+maturedVat;
    const creditorHold=modern(state)&&(overdue>0||refunds>0);
    const shortfall=Math.max(0,commitments-state.cash);
    const runway=monthlyOperating>0?Math.floor(freeBank/monthlyOperating*30):null;
    const tier=!modern(state)?'classic':
      creditorHold?'creditor-hold':
      freeBank<minimumBuffer?'critical':
      freeBank<monthlyOperating?'watch':'operating';
    return {tier,creditorHold,repair,vat,maturedVat,refunds,payroll,
      premises,wagesArrears,overdue,commitments,shortfall,freeBank,
      monthlyOperating,minimumBuffer,runway,bankCash:state.cash};
  }
  function buyingGate(state,cost,preparation,{settlement=false}={}){
    if(!modern(state))return null;
    const f=status(state);
    if(!settlement&&f.creditorHold)return {
      ok:false,code:'creditor-hold',
      message:'CREDITOR HOLD: settle recorded premises/payroll/VAT arrears and agreed customer refunds before committing cash to further stock. Existing paid stock can still be sold or disposed of.'
    };
    // A hammered auction invoice is binding: a voluntary buffer cannot
    // retroactively invalidate it; all already-recorded liabilities remain.
    const buffer=settlement?0:f.minimumBuffer;
    const required=cost+preparation+f.commitments+buffer;
    if(required>state.cash)return {
      ok:false,code:'cash',
      message:'Purchase needs £'+required.toLocaleString('en-GB')+
        ' including price, preparation, existing creditor obligations'+
        (buffer?' and a 14-day core operating buffer':'')+
        '; only £'+state.cash.toLocaleString('en-GB')+' is in the bank. No overdraft is assumed.'
    };
    return null;
  }
  window.MotorTradeCommercialControls=Object.freeze({status,buyingGate});
})();