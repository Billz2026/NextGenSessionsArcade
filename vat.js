'use strict';
/*
 * The Motor Trade: UK 2026 VAT margin scheme cash-liability pilot.
 *
 * MODELLING CONSTRAINTS:
 * - New UK2026 career elects voluntary VAT registration from opening.
 * - Fictional UK domestic second-hand cars are ASSUMED to be margin eligible.
 *   This is a game convention and NOT an assertion about actual auction invoices.
 * - Auction buyer fees under the simulated BCA Blue VAT-invoiced service are
 *   EXCLUDED from margin-scheme purchase price. Transport, inspection, repairs
 *   and overheads are also excluded. These costs remain stock/acquisition costs.
 * - Input VAT recovery is NOT yet represented. Output VAT is therefore
 *   conservative; do not describe this as a complete VAT return.
 * - VAT output is accrued to pence; the integer-pound cash ledger remits whole
 *   pounds when the assumed calendar quarter's return becomes due. Remaining
 *   pennies are carried as an outstanding liability. No lending is invented.
 * - Existing classic careers are excluded from this pilot.
 *
 * Official UK guidance checked 12 Nov 2026:
 * https://www.gov.uk/guidance/buying-and-selling-second-hand-motor-vehicles-using-the-vat-margin-scheme
 * https://www.gov.uk/guidance/recording-vat-margin-scheme-transactions
 * https://www.gov.uk/guidance/buying-and-selling-goods-at-auction-using-the-vat-margin-scheme
 * https://www.gov.uk/register-for-vat
 * https://www.gov.uk/hmrc-internal-manuals/vat-registration-manual/vatreg02400
 */
(() => {
  const START=Date.UTC(2026,10,9); // game Day 1: Monday 9 November 2026
  const DAY_MS=86400000,THRESHOLD=90000;
  const safe=n=>Number.isSafeInteger(n)&&n>=0&&n<=100000000;
  const pence=n=>'£'+(n/100).toFixed(2);
  const enabled=state=>state?.financialScenario==='uk2026'&&
    Number.isSafeInteger(state.vatRegistrationDay)&&state.vatRegistrationDay>=1;
  const dateForDay=day=>new Date(START+(day-1)*DAY_MS);
  const dayForDate=d=>Math.round((d.getTime()-START)/DAY_MS)+1;
  const periodForDay=day=>{
    const d=dateForDay(day);
    const q=Math.floor(d.getUTCMonth()/3);
    return d.getUTCFullYear()+'-Q'+(q+1);
  };
  function dueDayForSale(day){
    const d=dateForDay(day),q=Math.floor(d.getUTCMonth()/3);
    // Simulation assumes calendar-quarter returns: one month plus seven days
    // after quarter end, e.g. 2026-Q4 returns due 7 Feb 2027.
    return dayForDate(new Date(Date.UTC(d.getUTCFullYear(),q*3+4,7)));
  }
  function marginVatPence(sellingPrice,purchasePrice){
    if(!safe(sellingPrice)||!safe(purchasePrice))return null;
    return Math.round(Math.max(0,sellingPrice-purchasePrice)*100/6);
  }
  function record(purchasePrice,sellingPrice,day){
    const outputPence=marginVatPence(sellingPrice,purchasePrice);
    if(outputPence===null||!Number.isSafeInteger(day)||day<1)return null;
    return {scheme:'assumed-eligible-margin',purchaseBasis:purchasePrice,
      sellingPrice,outputPence,period:periodForDay(day),
      dueDay:dueDayForSale(day)};
  }
  const entries=state=>[...(state?.sold||[]),...(state?.wholesale||[])]
    .filter(x=>x?.vat?.scheme==='assumed-eligible-margin');
  const outputPence=state=>entries(state).reduce((n,x)=>n+x.vat.outputPence,0);
  const paidPence=state=>(state?.ledger||[])
    .filter(x=>x.note==='VAT remittance: output VAT on eligible used-car margins')
    .reduce((n,x)=>n-x.delta*100,0);
  const creditPence=state=>state.aftersalesScenario==='cra2015-2026'?
    (state.aftersales?.cases||[]).reduce((n,c)=>n+
      (c.status==='refunded'?c.creditedVatPence:0),0):0;
  const outstandingPence=state=>Math.max(0,
    outputPence(state)-creditPence(state)-paidPence(state));
  const creditBalancePence=state=>Math.max(0,
    paidPence(state)+creditPence(state)-outputPence(state));
  const maturedPence=(state,day=state.day)=>Math.max(0,
    entries(state).filter(x=>x.vat.dueDay<=day)
      .reduce((n,x)=>n+x.vat.outputPence,0)-
    creditPence(state)-paidPence(state));
  const rollingTurnover=(state,day=state.day)=>{
    const from=day-364;
    const refunded=new Set(state.aftersalesScenario==='cra2015-2026'?
      (state.aftersales?.cases||[])
        .filter(x=>x.status==='refunded'&&x.refundApprovedDay<=day)
        .map(x=>x.saleId):[]);
    return Math.max(0,(state.sold||[]).reduce((n,s)=>
      n+(s.day>=from&&s.day<=day&&!refunded.has(s.id)?s.price:0),0)+
      (state.wholesale||[]).reduce((n,s)=>
        n+(s.day>=from&&s.day<=day?s.proceeds:0),0));
  };
  function advance(state){
    if(!enabled(state))return {paid:0,duePence:0,outputPence:0};
    const due=maturedPence(state);
    const amount=Math.min(Math.max(0,state.cash),Math.floor(due/100));
    if(amount){
      state.cash-=amount;
      state.ledger.push({day:state.day,delta:-amount,
        note:'VAT remittance: output VAT on eligible used-car margins'});
    }
    return {paid:amount,duePence:maturedPence(state),
      outputPence:outstandingPence(state)};
  }
  function valid(state){
    if(!enabled(state))return state?.financialScenario!=='uk2026'||
      (state.vatRegistrationDay===0&&
       !state.ledger.some(x=>x.note.startsWith('VAT remittance:'))&&
       [...state.sold,...(state.wholesale||[])].every(x=>x.vat===undefined));
    if(state.vatRegistrationDay<1||state.vatRegistrationDay>state.day+1)return false;
    for(const x of [...state.sold,...(state.wholesale||[])]){
      if(x.day<state.vatRegistrationDay)continue;
      if(!x.vat||x.vat.scheme!=='assumed-eligible-margin'||!safe(x.vat.purchaseBasis)||
         x.vat.purchaseBasis>(x.acquisition??x.basis))return false;
      const sellingPrice=x.price??x.proceeds;
      const expected=record(x.vat.purchaseBasis,sellingPrice,x.day);
      if(!expected||Object.keys(expected).some(k=>expected[k]!==x.vat[k]))return false;
    }
    const remits=state.ledger.filter(x=>x.note.startsWith('VAT remittance:'));
    if(remits.some(r=>r.note!=='VAT remittance: output VAT on eligible used-car margins'||
      !Number.isSafeInteger(r.delta)||r.delta>=0||r.day<1))return false;
    if(paidPence(state)>outputPence(state))return false;
    // The VAT cash payment should not occur before the earliest eligible tax
    // return. In this simplified game it cannot be paid in advance.
    const first=entries(state).filter(x=>x.vat.outputPence>0)
      .reduce((day,x)=>Math.min(day,x.vat.dueDay),Infinity);
    if(remits.some(x=>x.day<first))return false;
    return true;
  }
  window.MotorTradeVat=Object.freeze({THRESHOLD,START,
    dateForDay,dayForDate,periodForDay,dueDayForSale,marginVatPence,record,
    enabled,entries,outputPence,paidPence,creditPence,creditBalancePence,outstandingPence,maturedPence,
    rollingTurnover,advance,valid,pence});
})();
