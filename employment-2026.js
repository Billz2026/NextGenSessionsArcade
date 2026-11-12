'use strict';
/* The Motor Trade: UK 2026/27 England employment and monthly payroll pilot.
 *
 * A 40-hour/week, 5-day permanent employment scenario; all fictional candidates
 * are assumed 25+ and auto-enrolled, standard 1257L-equivalent tax code,
 * England PAYE, relief-at-source pension and full company-paid sick leave.
 * No student loan, employee benefits, garnishments, tax-code changes, salary
 * sacrifice, director payroll or statutory agency worker special cases.
 *
 * Employer NI: 15% above £417/month (2026/27); Employment Allowance £10,500
 * per UK tax year in the qualifying employer scenario (non-director workers).
 * Pension: employer 3%, worker 4% plus 1% provider tax relief of monthly
 * qualifying earnings between £520 and £4,189; no automatic refund of VAT.
 * PAYE and employee NI use simplified MONTHLY (not cumulative) 2026/27 bands.
 * Salary is accrued by calendar day and NET wages paid on calendar month-end;
 * PAYE/NIC/pension accrued are remitted by 22nd of following calendar month.
 * Game bank ledger stores whole GBP; all payroll computations rounded GBP,
 * not actual HMRC pennies / RTI submissions.
 *
 * Government & regulator sources reviewed 12 Nov 2026:
 * https://www.gov.uk/national-minimum-wage-rates
 * https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
 * https://www.gov.uk/claim-employment-allowance/eligibility
 * https://www.gov.uk/workplace-pensions-employers/how-to-enrol-staff
 * https://www.thepensionsregulator.gov.uk/en/employers/new-employers/im-an-employer-who-has-to-provide-a-pension/declare-your-compliance/ongoing-duties-for-employers/earnings-thresholds
 * https://www.gov.uk/holiday-entitlement-rights
 * https://www.gov.uk/pay-paye-tax/overview
 */
(() => {
  const V=window.MotorTradeVat;
  if(!V)throw Error('Load vat.js before employment-2026.js');
  const REQUIRED_HOURS=40, LEAVE_DAYS=28, ALLOWANCE=10500;
  const LIMITS=Object.freeze({
    employerNiRate:0.15,employerNiMonthlyThreshold:417,
    employeeNiPrimaryMonthly:1048,employeeNiUpperMonthly:4189,
    pensionLowerMonthly:520,pensionUpperMonthly:4189,
    incomeTaxMonthlyAllowance:1047.50,incomeTaxBasicMonthly:37700/12,
    employmentAllowance:ALLOWANCE
  });
  const validPounds=x=>Number.isSafeInteger(x)&&x>=0&&x<=100000000;
  const round=x=>Math.round(x);
  const fmt=x=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',
    maximumFractionDigits:0}).format(x);
  const date=day=>V.dateForDay(day);
  const periodKey=day=>date(day).toISOString().slice(0,7);
  const daysInMonth=day=>{
    const d=date(day);
    return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();
  };
  const isMonthEnd=day=>date(day).getUTCDate()===daysInMonth(day);
  const taxYear=day=>{
    const d=date(day);
    const y=d.getUTCFullYear()-(d.getUTCMonth()<3||
      (d.getUTCMonth()===3&&d.getUTCDate()<6)?1:0);
    return y+'-'+String(y+1).slice(2);
  };
  const minimumWage=day=>{
    const d=date(day);
    // Rates effective from 1 April; 2027 is published on GOV.UK.
    return d.getUTCFullYear()>2026&&
      (d.getUTCFullYear()>2027||d.getUTCMonth()>=3)?13.21:12.71;
  };
  const minimumMonthly=(hours,day)=>Math.ceil(minimumWage(day)*hours*52/12);
  const baseSalary=(employee,day)=>Math.max(
    employee.monthlySalary,minimumMonthly(employee.contractHours??REQUIRED_HOURS,day));
  const is2026=state=>state?.employmentScenario==='uk2026-payroll';
  function monthlyQuote(gross,{allowanceRemaining=ALLOWANCE}={}){
    if(!validPounds(gross)||!validPounds(allowanceRemaining))return null;
    const employerNiGross=round(Math.max(0,gross-LIMITS.employerNiMonthlyThreshold)*LIMITS.employerNiRate);
    const niRelief=Math.min(employerNiGross,allowanceRemaining);
    const employerNi=employerNiGross-niRelief;
    const pensionable=Math.max(0,Math.min(gross,LIMITS.pensionUpperMonthly)-LIMITS.pensionLowerMonthly);
    const employerPension=round(pensionable*.03);
    const workerPension=round(pensionable*.04); // relief-at-source employee net contribution
    const taxRelief=round(pensionable*.01);
    const employeeNi=round(Math.max(0,
      Math.min(gross,LIMITS.employeeNiUpperMonthly)-LIMITS.employeeNiPrimaryMonthly)*.08+
      Math.max(0,gross-LIMITS.employeeNiUpperMonthly)*.02);
    const taxable=Math.max(0,gross-LIMITS.incomeTaxMonthlyAllowance);
    const paye=round(Math.min(taxable,LIMITS.incomeTaxBasicMonthly)*.20+
      Math.max(0,taxable-LIMITS.incomeTaxBasicMonthly)*.40);
    const net=gross-workerPension-employeeNi-paye;
    return {gross,employerNiGross,niRelief,employerNi,employerPension,
      employeeNi,workerPension,pensionTaxRelief:taxRelief,paye,net,
      employerCost:gross+employerNi+employerPension,
      hmrc:paye+employeeNi+employerNi,
      pension:workerPension+employerPension};
  }
  const initial=()=>({
    scheme:'england-2026-monthly',period:null,earnings:{},wagesDue:0,
    hmrc:[],pension:[],allowanceYear:'2026-27',allowanceUsed:0,
    history:[],leaveTaken:{},sickTaken:{},lastAdvanceDay:0,
    cumulative:{net:0,hmrc:0,pension:0}
  });
  function clone(p){
    return JSON.parse(JSON.stringify(p));
  }
  // Full-time employees have 28 paid days incl public holidays by contract.
  // The simulation schedules 4 x 5-day paid leave blocks annually, plus
  // statutory-looking bank-holiday closure days (not a guaranteed calendar for
  // future years). This simplification is openly disclosed in the employee UI.
  // Sick days: a deterministic ~3-day/year full-pay employer benefit.
  const BANK_2026=Object.freeze(['2026-01-01','2026-04-03','2026-04-06',
    '2026-05-04','2026-05-25','2026-08-31','2026-12-25','2026-12-28']);
  const BANK_2027=Object.freeze(['2027-01-01','2027-03-26','2027-03-29',
    '2027-05-03','2027-05-31','2027-08-30','2027-12-27','2027-12-28']);
  function absence(employee,day){
    const d=date(day),wd=d.getUTCDay();
    if(wd===0||wd===6)return 'rest';
    const dateKey=d.toISOString().slice(0,10);
    const bank=d.getUTCFullYear()===2026?BANK_2026:BANK_2027;
    if(bank.includes(dateKey))return 'paid holiday';
    const month=d.getUTCMonth()+1, offset=(employee.id%3);
    const holidayMonths=[2+offset,5+offset,8+offset,11+offset].map(m=>(m-1)%12+1);
    if(holidayMonths.includes(month)){
      const block=7+((employee.id*5+month)%14);
      const from=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),block));
      while(from.getUTCDay()!==1)from.setUTCDate(from.getUTCDate()+1);
      const dayOfMonth=d.getUTCDate();
      if(dayOfMonth>=from.getUTCDate()&&dayOfMonth<from.getUTCDate()+5)return 'paid holiday';
    }
    const nth=Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-
      Date.UTC(d.getUTCFullYear(),0,1))/86400000)+1;
    if([53,162,291].some((n,i)=>nth===n+(employee.id*13+i*7)%12))return 'sick leave (full company pay)';
    return null;
  }
  function dueDayForMonth(day){
    const d=date(day);
    return V.dayForDate(new Date(Date.UTC(d.getUTCFullYear(),
      d.getUTCMonth()+1,22)));
  }
  function accruedDaily(monthlySalary,day){
    const d=date(day),n=d.getUTCDate(),last=daysInMonth(day);
    return Math.floor(monthlySalary*n/last)-Math.floor(monthlySalary*(n-1)/last);
  }
  function creditPeriod(state,p){
    const key=periodKey(state.day);
    // Sales/notice decisions can occur after a calendar-month payroll has
    // already closed on the morning of that game date. They then belong to
    // the NEXT month, not an already-paid payslip.
    return isMonthEnd(state.day)&&p.history.some(h=>h.period===key)?
      periodKey(state.day+1):key;
  }
  function creditCommission(state,employee,amount){
    if(!is2026(state)||!validPounds(amount))return false;
    const p=state.payroll2026;
    const target=creditPeriod(state,p);
    if(p.period!==target){
      if(p.period!==null)return false;
      p.period=target;
    }
    const id=String(employee.id);
    const row=p.earnings[id]??={salary:0,commission:0,notice:0};
    row.commission+=amount;
    state.ledger.push({day:state.day,delta:0,
      note:'Staff commission accrued: £'+amount+' ('+employee.name+')'});
    return true;
  }
  function creditOtherPay(state,employee,amount,kind='notice'){
    if(!is2026(state)||!validPounds(amount)||kind!=='notice')return false;
    const p=state.payroll2026;
    const target=creditPeriod(state,p);
    if(p.period===null)p.period=target;
    if(p.period!==target)return false;
    const id=String(employee.id),row=p.earnings[id]??={salary:0,commission:0,notice:0};
    row.notice=(row.notice||0)+amount;
    state.ledger.push({day:state.day,delta:0,
      note:'Staff notice expense accrued: £'+amount+' ('+employee.name+')'});
    return true;
  }
  function write(state,delta,note){
    state.cash+=delta;
    state.ledger.push({day:state.day,delta,note});
  }
  function protectedCash(state){
    const repairs=(state.vehicles||[]).filter(v=>v.status==='acquired').reduce((n,v)=>n+
      (['in-progress','quality-check'].includes(v.workshop?.stage)?0:v.prepBudget),0);
    const vat=V.enabled(state)?Math.ceil(V.outstandingPence(state)/100):0;
    return repairs+vat;
  }
  function settleCash(state,p){
    let wagesPaid=0,hmrcPaid=0,pensionPaid=0;
    const liquid=()=>Math.max(0,state.cash-protectedCash(state));
    if(p.wagesDue>0){
      const wageAmount=Math.min(p.wagesDue,liquid());
      if(wageAmount>0){
        write(state,-wageAmount,'Staff payroll monthly net wages settlement');
        p.wagesDue-=wageAmount;wagesPaid+=wageAmount;
      }
    }
    for(const [name,queue,note] of [
      ['hmrc',p.hmrc,'Staff HMRC PAYE and NI remittance'],
      ['pension',p.pension,'Staff workplace pension remittance']
    ]){
      for(const bill of queue){
        if(state.day<bill.dueDay||bill.remaining<=0)continue;
        const payment=Math.min(bill.remaining,liquid());
        if(payment){
          write(state,-payment,note+' ('+bill.period+')');
          bill.remaining-=payment;
          if(name==='hmrc')hmrcPaid+=payment;else pensionPaid+=payment;
        }
      }
    }
    p.hmrc=p.hmrc.filter(x=>x.remaining>0);
    p.pension=p.pension.filter(x=>x.remaining>0);
    state.payrollArrears=p.wagesDue;
    return {wagesPaid,hmrcPaid,pensionPaid};
  }
  function closePeriod(state){
    const p=state.payroll2026;
    if(!p.period||!isMonthEnd(state.day))return null;
    const tax=taxYear(state.day);
    if(p.allowanceYear!==tax){
      p.allowanceYear=tax;p.allowanceUsed=0;
    }
    const dueDay=dueDayForMonth(state.day);
    const pays=[];
    let totalGross=0,totalCommission=0,totalEmployerNi=0,totalPension=0,
      totalNet=0,totalHmrc=0,totalPensionDue=0,totalRelief=0;
    for(const id of Object.keys(p.earnings).sort((a,b)=>Number(a)-Number(b))){
      const row=p.earnings[id];
      const gross=row.salary+row.commission+(row.notice||0);
      if(!gross)continue;
      const x=monthlyQuote(gross,{allowanceRemaining:ALLOWANCE-p.allowanceUsed});
      p.allowanceUsed+=x.niRelief;
      totalGross+=gross;totalCommission+=row.commission;
      totalEmployerNi+=x.employerNi;totalPension+=x.employerPension;
      totalNet+=x.net;totalHmrc+=x.hmrc;totalPensionDue+=x.pension;
      totalRelief+=x.niRelief;
      pays.push({id:Number(id),...x});
    }
    const breakdown={period:p.period,day:state.day,dueDay,pays,gross:totalGross,
      commission:totalCommission,employerNi:totalEmployerNi,
      employerPension:totalPension,allowanceRelief:totalRelief,
      netWages:totalNet,hmrc:totalHmrc,pension:totalPensionDue};
    p.wagesDue+=totalNet;
    p.cumulative.net+=totalNet;
    p.cumulative.hmrc+=totalHmrc;
    p.cumulative.pension+=totalPensionDue;
    if(totalHmrc)p.hmrc.push({period:p.period,dueDay,remaining:totalHmrc});
    if(totalPensionDue)p.pension.push({period:p.period,dueDay,remaining:totalPensionDue});
    p.history.push(breakdown);
    if(p.history.length>36)p.history.shift();
    const oncosts=totalEmployerNi+totalPension;
    if(oncosts)state.ledger.push({day:state.day,delta:0,
      note:'Staff employer charges accrued: £'+oncosts+
        ' (NI £'+totalEmployerNi+', pension £'+totalPension+')'});
    p.period=null;p.earnings={};
    return breakdown;
  }
  function advance(state){
    if(!is2026(state))return null;
    const p=state.payroll2026;
    if(!p||p.scheme!=='england-2026-monthly')throw Error('Missing 2026 payroll book');
    if(p.lastAdvanceDay===state.day)return {payroll:0,paid:0,arrears:p.wagesDue,
      gross:0,employerNi:0,employerPension:0,allowanceRelief:0,
      netWages:0,hmrcPaid:0,pensionPaid:0,periodClose:null};
    if(p.lastAdvanceDay>state.day)throw Error('Payroll cannot advance backwards in game time');
    const key=periodKey(state.day);
    if(p.period!==null&&p.period!==key)throw Error('Prior payroll period not closed');
    p.period=key;
    let payroll=0;
    for(const e of state.staff){
      if(e.startDay>state.day)continue;
      const salary=baseSalary(e,state.day);
      // When the verified statutory hourly rate rises, honour it on payroll
      // rather than relying on extra sales commission to fix an illegal base.
      if(salary>e.monthlySalary)e.monthlySalary=salary;
      const base=accruedDaily(salary,state.day);
      const row=p.earnings[String(e.id)]??={salary:0,commission:0,notice:0};
      row.salary+=base;payroll+=base;
      if(base)state.ledger.push({day:state.day,delta:0,
        note:'Staff salary expense accrued: £'+base+' ('+e.name+')'});
      const off=absence(e,state.day);
      if(off==='paid holiday'||off?.startsWith('sick leave')){
        const dict=off==='paid holiday'?p.leaveTaken:p.sickTaken;
        const k=e.id+':'+date(state.day).getUTCFullYear();
        dict[k]=(dict[k]||0)+1;
      }
    }
    const report=closePeriod(state);
    const paid=settleCash(state,p);
    p.lastAdvanceDay=state.day;
    return {payroll,paid:paid.wagesPaid,arrears:p.wagesDue,
      gross:report?.gross??0,employerNi:report?.employerNi??0,
      employerPension:report?.employerPension??0,
      allowanceRelief:report?.allowanceRelief??0,
      netWages:report?.netWages??0,hmrcPaid:paid.hmrcPaid,
      pensionPaid:paid.pensionPaid,periodClose:report};
  }
  const liabilities=state=>{
    const p=state.payroll2026;
    return !is2026(state)||!p?{wages:0,hmrc:0,pension:0,total:0}:
      {wages:p.wagesDue,
       hmrc:p.hmrc.reduce((n,x)=>n+x.remaining,0),
       pension:p.pension.reduce((n,x)=>n+x.remaining,0),
       total:p.wagesDue+p.hmrc.reduce((n,x)=>n+x.remaining,0)+
         p.pension.reduce((n,x)=>n+x.remaining,0)};
  };
  const quoteHire=(state,candidate)=>{
    const active=state.staff.reduce((sum,e)=>sum+monthlyQuote(baseSalary(e,state.day)).employerCost,0);
    const hireCost=monthlyQuote(baseSalary(candidate,state.day)).employerCost;
    const forecastNI=state.payroll2026?.allowanceUsed>=ALLOWANCE;
    return {monthlyEmployerCost:active+hireCost,
      candidateMonthlyEmployerCost:hireCost,
      employerNiConservative:forecastNI,
      salary:baseSalary(candidate,state.day),
      holiday:LEAVE_DAYS,weeklyHours:candidate.contractHours??REQUIRED_HOURS};
  };
  function valid(state){
    if(!is2026(state))return true;
    const p=state.payroll2026;
    if(!p||p.scheme!=='england-2026-monthly'||
      !(p.period===null||/^20\d\d-(0[1-9]|1[0-2])$/.test(p.period))||
      !p.earnings||typeof p.earnings!=='object'||Array.isArray(p.earnings)||
      !validPounds(p.wagesDue)||!validPounds(p.allowanceUsed)||
      !Number.isSafeInteger(p.lastAdvanceDay)||p.lastAdvanceDay<0||p.lastAdvanceDay>state.day||
      p.allowanceUsed>ALLOWANCE||
      !/^(20\d\d)-(\d\d)$/.test(p.allowanceYear)||
      !Array.isArray(p.hmrc)||!Array.isArray(p.pension)||
      !Array.isArray(p.history)||p.history.length>36||
      !p.leaveTaken||!p.sickTaken||!p.cumulative||
      !validPounds(p.cumulative.net)||!validPounds(p.cumulative.hmrc)||
      !validPounds(p.cumulative.pension))return false;
    for(const row of Object.values(p.earnings))
      if(!row||!validPounds(row.salary)||!validPounds(row.commission)||
        (row.notice!==undefined&&!validPounds(row.notice)))return false;
    const validBills=a=>a.every(x=>x&&
      /^20\d\d-(0[1-9]|1[0-2])$/.test(x.period)&&
      Number.isSafeInteger(x.dueDay)&&x.dueDay>0&&
      validPounds(x.remaining));
    if(!validBills(p.hmrc)||!validBills(p.pension))return false;
    if(!p.history.every(h=>h&&/^20\d\d-(0[1-9]|1[0-2])$/.test(h.period)&&
      Number.isSafeInteger(h.day)&&h.day>=1&&h.day<=state.day&&
      validPounds(h.gross)&&validPounds(h.netWages)&&
      validPounds(h.hmrc)&&validPounds(h.pension)&&validPounds(h.allowanceRelief)&&
      Array.isArray(h.pays)&&h.pays.every(x=>validPounds(x.gross)&&validPounds(x.net))))return false;
    if(state.payrollArrears!==p.wagesDue)return false;
    const totalPaid=note=>(state.ledger||[]).filter(x=>note(x.note))
      .reduce((n,x)=>n-x.delta,0);
    const settledNet=totalPaid(n=>n==='Staff payroll monthly net wages settlement');
    const settledHmrc=totalPaid(n=>n.startsWith('Staff HMRC PAYE and NI remittance ('));
    const settledPension=totalPaid(n=>n.startsWith('Staff workplace pension remittance ('));
    if(p.cumulative.net-settledNet!==p.wagesDue||
       p.cumulative.hmrc-settledHmrc!==p.hmrc.reduce((n,x)=>n+x.remaining,0)||
       p.cumulative.pension-settledPension!==p.pension.reduce((n,x)=>n+x.remaining,0))
      return false;
    // Keep cash and liabilities distinct, with a source amount for every
    // salary month; changing a payable amount must break reconciliation.
    if(p.history.some(h=>h.pays.reduce((n,x)=>n+x.gross,0)!==h.gross||
      h.pays.reduce((n,x)=>n+x.net,0)!==h.netWages||
      h.pays.reduce((n,x)=>n+x.hmrc,0)!==h.hmrc||
      h.pays.reduce((n,x)=>n+x.pension,0)!==h.pension||
      h.pays.reduce((n,x)=>n+x.employerNi,0)!==h.employerNi||
      h.pays.reduce((n,x)=>n+x.employerPension,0)!==h.employerPension))
      return false;
    // Every statutory payment must have a recorded month's payroll history.
    for(const bill of [...p.hmrc,...p.pension]){
      if(!p.history.some(h=>h.period===bill.period&&h.dueDay===bill.dueDay))return false;
    }
    return true;
  }
  window.MotorTradeEmployment=Object.freeze({
    REQUIRED_HOURS,LEAVE_DAYS,ALLOWANCE,LIMITS,is2026,initial,clone,
    date,periodKey,daysInMonth,isMonthEnd,taxYear,minimumWage,minimumMonthly,
    baseSalary,monthlyQuote,absence,dueDayForMonth,accruedDaily,
    creditCommission,creditOtherPay,advance,liabilities,quoteHire,valid
  });
})();
