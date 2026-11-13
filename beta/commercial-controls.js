'use strict';
/*
 * UK2026 dealer cash, creditor and ONE-AT-A-TIME rescue-funding pilot.
 * NOT UK law, automatic insolvency protection or a real lending quotation.
 * Real directors' duties to creditors apply immediately upon insolvency:
 * https://www.gov.uk/guidance/director-information-hub-director-duties-upon-insolvency
 */
(() => {
  const EMP=window.MotorTradeEmployment,V=window.MotorTradeVat,
    W=window.MotorTradeWorkshop,A=window.MotorTradeAftersales,
    SITE=window.MotorTradePremises,P=window.MotorTradePeople;
  if(![EMP,V,W,A,SITE,P].every(Boolean))throw Error('Cash control prerequisites missing');
  const money=n=>'£'+n.toLocaleString('en-GB');
  const modern=s=>s.financialScenario==='uk2026';
  const safe=n=>Number.isSafeInteger(n)&&n>=0&&n<=100000000;
  const BRIDGE_AMOUNTS=Object.freeze([5000,10000,15000]);
  const LOAN_DAYS=60,APR=16,LATE_APR=22,ARRANGEMENT_PERCENT=3;
  const overdueVat=s=>V.enabled(s)?Math.floor(V.maturedPence(s)/100):0;
  const activeLoan=s=>s.financeBridge?.principalOutstanding>0?s.financeBridge:null;
  const loanDue=s=>{const f=activeLoan(s);return f?
    f.principalOutstanding+f.interestAccrued-f.interestPaid:0};
  const pledgedValue=s=>Math.floor((s.vehicles||[]).reduce((n,v)=>{
    const trade=v.profile?.trade??Math.floor(v.retail*.5);
    return n+Math.max(0,Math.min(v.cost||0,trade||0));
  },0)*.5/100)*100;
  function status(s){
    const repair=W.reserved(s),vat=V.enabled(s)?
      Math.ceil(V.outstandingPence(s)/100):0;
    const maturedVat=overdueVat(s);
    const refunds=A.pendingRefunds(s);
    const payroll=s.employmentScenario==='uk2026-payroll'?
      EMP.liabilities(s).total:Math.max(0,s.payrollArrears||0);
    const premises=s.premises?.arrears||0,wagesArrears=s.payrollArrears||0;
    const commitments=repair+vat+refunds+payroll+premises;
    const freeBank=Math.max(0,s.cash-commitments);
    const monthlyStaff=(s.staff||[]).reduce((n,e)=>n+(
      s.employmentScenario==='uk2026-payroll'?
        EMP.monthlyQuote(EMP.baseSalary(e,s.day),{allowanceRemaining:0}).employerCost:
        P.dailyCost(e)*30),0);
    const monthlyOperating=SITE.costs(s).monthlyCashGuide+monthlyStaff+
      (s.vehicles||[]).filter(v=>v.storageLocation==='offsite').length*12*30;
    const debtDays=(s.debtSinceDay||0)?s.day-s.debtSinceDay+1:0;
    const bridgeOverdue=activeLoan(s)&&s.day>activeLoan(s).dueDay?loanDue(s):0;
    const softArrears=premises>0&&debtDays<=14&&
      wagesArrears===0&&maturedVat===0&&refunds===0&&!bridgeOverdue;
    const creditorHold=modern(s)&&(
      wagesArrears>0||maturedVat>0||refunds>0||bridgeOverdue>0||
      (premises>0&&debtDays>14));
    const recoveryRequired=modern(s)&&debtDays>=30&&
      (premises+wagesArrears+maturedVat+refunds+bridgeOverdue)>0;
    const minimumBuffer=Math.ceil(monthlyOperating*14/30);
    const shortfall=Math.max(0,commitments-s.cash);
    const runway=monthlyOperating>0?Math.floor(freeBank/monthlyOperating*30):null;
    const tier=!modern(s)?'classic':recoveryRequired?'recovery-critical':
      creditorHold?'creditor-hold':softArrears?'early-recovery':
      freeBank<minimumBuffer?'critical':
      freeBank<monthlyOperating?'watch':'operating';
    return {tier,creditorHold,recoveryRequired,debtDays,softArrears,
      repair,vat,maturedVat,refunds,payroll,premises,wagesArrears,
      overdue:premises+wagesArrears+maturedVat+(bridgeOverdue||0),
      commitments,shortfall,freeBank,monthlyOperating,minimumBuffer,
      runway,bankCash:s.cash,bridgeOutstanding:loanDue(s),
      bridgeOverdue:bridgeOverdue||0,bridgeDueDay:activeLoan(s)?.dueDay??null,
      pledgedValue:pledgedValue(s)};
  }
  function buyingGate(s,cost,preparation,{settlement=false}={}){
    if(!modern(s))return null;
    const f=status(s);
    if(!settlement&&(f.creditorHold||f.recoveryRequired))
      return {ok:false,code:'creditor-hold',
        message:'CREDITOR RECOVERY: unpaid critical obligations or the recovery deadline prohibit NEW stock purchases. You can still service customers, sell existing cars, repay creditors or arrange eligible finance. Not a statutory insolvency safe harbour.'};
    // Hammered invoice is binding; nonessential cash buffers do not retrospectively
    // void settlement. Core creditor obligations still must be covered.
    const buffer=settlement?0:f.minimumBuffer;
    const required=cost+preparation+f.commitments+buffer;
    if(required>s.cash)return {ok:false,code:'cash',
      message:'This stock purchase requires '+money(required)+
        ' after booked preparation, existing creditors and '+(buffer?'14-day operating cash buffer.':'settled invoice costs.')+
        ' Bank cash is '+money(s.cash)+'. An overdraft has not been assumed.'};
    return null;
  }
  function financeQuote(s,amount){
    if(!modern(s)||!BRIDGE_AMOUNTS.includes(amount))return {ok:false,code:'invalid',
      message:'Choose a supported fictional funding amount.'};
    const f=status(s),loan=s.financeBridge;
    if(activeLoan(s))return {ok:false,code:'active',message:'Repay your current bridge before applying again.'};
    if(loan&&s.day<loan.drawDay+180)return {ok:false,code:'cooldown',
      message:'One emergency facility per 180 game days. No revolving free cash.'};
    if(f.debtDays<7&&s.reputationScore<35)return {ok:false,code:'eligibility',
      message:'Bridge funding is available after seven days of documented distress or from reputation 35.'};
    if(f.pledgedValue<amount)return {ok:false,code:'security',
      message:'Conservative owned-stock collateral supports only '+money(f.pledgedValue)+
        '. The loan requires sufficient vehicle security; it is not unsecured free money.'};
    const fee=Math.ceil(amount*ARRANGEMENT_PERCENT/100);
    const interest=Math.ceil(amount*APR*LOAN_DAYS/36500);
    return {ok:true,amount,fee,net:amount-fee,termDays:LOAN_DAYS,
      aprPercent:APR,lateAprPercent:LATE_APR,expectedInterest:interest,
      dueDay:s.day+LOAN_DAYS,expectedRepayment:amount+interest,
      message:'Illustrative '+money(amount)+' secured 60-day bridge; '+
        money(fee)+' setup cost, about '+money(interest)+' simple interest if repaid on day 60. No actual lender or regulated credit offer.'};
  }
  function borrow(s,amount){
    const q=financeQuote(s,amount);
    if(!q.ok)return q;
    s.financeBridge={drawDay:s.day,dueDay:q.dueDay,totalBorrowed:amount,
      principalOutstanding:amount,fee:q.fee,interestAccrued:0,
      interestPaid:0,lastAccrualDay:s.day,closedDay:null};
    s.cash+=amount;
    s.ledger.push({day:s.day,delta:amount,note:'Financing advance: secured 60-day bridge'});
    s.cash-=q.fee;
    s.ledger.push({day:s.day,delta:-q.fee,
      note:'Financing arrangement fee: secured bridge'});
    return {ok:true,changed:true,message:q.message+
      ' Cash credited '+money(q.net)+'. Pay outstanding creditors first.'};
  }
  function repay(s){
    const l=activeLoan(s);
    if(!l)return {ok:false,code:'empty',message:'No active bridge facility.'};
    const amount=loanDue(s),f=status(s);
    if(f.wagesArrears||f.maturedVat||f.refunds)
      return {ok:false,code:'creditor',
        message:'Resolve recorded wages, due VAT and accepted consumer refunds before discretionary lender repayment.'};
    if(s.cash-amount<W.reserved(s)+f.premises)
      return {ok:false,code:'cash',message:'Need '+money(amount)+
        ' to repay without using stock repair reserves or unpaid premises obligations.'};
    s.cash-=amount;
    s.ledger.push({day:s.day,delta:-amount,
      note:'Financing repayment: principal and accrued interest'});
    l.interestPaid=l.interestAccrued;
    l.principalOutstanding=0;l.closedDay=s.day;
    return {ok:true,changed:true,message:'Secured bridge fully repaid: '+money(amount)+
      '. No further loans until the 180-day cooldown has ended.'};
  }
  function advance(s){
    if(!modern(s))return {debtDays:0,loanInterest:0};
    const loan=activeLoan(s);
    let loanInterest=0;
    if(loan&&s.day>loan.lastAccrualDay){
      const elapsed=s.day-loan.drawDay;
      const normal=Math.min(elapsed,LOAN_DAYS);
      const late=Math.max(0,elapsed-LOAN_DAYS);
      const due=Math.ceil(loan.totalBorrowed*(normal*APR+late*LATE_APR)/36500);
      const target=Math.min(loan.totalBorrowed,Math.max(loan.interestAccrued,due));
      loanInterest=target-loan.interestAccrued;
      loan.interestAccrued=target;
      loan.lastAccrualDay=s.day;
      if(loanInterest)s.ledger.push({day:s.day,delta:0,
        note:'Financing interest accrued: £'+loanInterest});
    }
    const delinquent=(s.premises?.arrears||0)+(s.payrollArrears||0)+
      overdueVat(s)+A.pendingRefunds(s)+(activeLoan(s)&&s.day>loan.dueDay?loanDue(s):0);
    if(delinquent&&!s.debtSinceDay)s.debtSinceDay=s.day;
    if(!delinquent)s.debtSinceDay=0;
    const debtDays=s.debtSinceDay?s.day-s.debtSinceDay+1:0;
    if(debtDays>=30&&debtDays%7===0&&s.reputationScore>0){
      s.reputationScore--;
      s.reputationHistory.push({day:s.day,delta:-1,
        reason:'Persistent overdue obligations weakened supplier and customer trust'});
      if(s.reputationHistory.length>90)s.reputationHistory.shift();
      s.reputation=P.tier(s.reputationScore);
    }
    return {debtDays,loanInterest,loanOverdue:!!(loan&&s.day>loan.dueDay)};
  }
  function valid(s){
    if(!modern(s))return s.financeBridge===undefined||s.financeBridge===null;
    if(!safe(s.debtSinceDay||0)||s.debtSinceDay>s.day)return false;
    const l=s.financeBridge;
    if(l===undefined||l===null)return true;
    if(!safe(l.drawDay)||l.drawDay<1||l.drawDay>s.day||
       !safe(l.dueDay)||l.dueDay!==l.drawDay+LOAN_DAYS||
       !BRIDGE_AMOUNTS.includes(l.totalBorrowed)||
       !safe(l.fee)||l.fee!==Math.ceil(l.totalBorrowed*ARRANGEMENT_PERCENT/100)||
       !safe(l.principalOutstanding)||l.principalOutstanding>l.totalBorrowed||
       !safe(l.interestAccrued)||l.interestAccrued>l.totalBorrowed||
       !safe(l.interestPaid)||l.interestPaid>l.interestAccrued||
       !safe(l.lastAccrualDay)||l.lastAccrualDay<l.drawDay||l.lastAccrualDay>s.day||
       (l.closedDay!==null&&(!safe(l.closedDay)||l.closedDay<l.drawDay||l.closedDay>s.day))||
       (l.closedDay!==null)!==(l.principalOutstanding===0))return false;
    return true;
  }
  window.MotorTradeCommercialControls=Object.freeze({
    BRIDGE_AMOUNTS,LOAN_DAYS,status,buyingGate,financeQuote,borrow,repay,advance,valid
  });
})();