'use strict';
/* The Motor Trade — 2026 UK consumer aftersales / Consumer Rights Act pilot.
 * This is a SIMULATION, not automatic legal determination. Reports are
 * generated for qualifying fictional non-conforming faults, not everyday wear.
 * Rights: CRA 2015 ss 19–24. Short-term rejection within first 30 days;
 * presumed inherent faults within 6 months (rebuttable); one repair chance,
 * then final rejection or price reduction; 14-day accepted refund deadline.
 * Motor vehicles may allow reasonable use deductions on final rejection.
 * The pilot elects FULL REFUNDS as goodwill and never invents mileage fees.
 * Part-exchange full-money substitution is modelled ONLY with an explicit
 * fictional customer agreement. Real cases need the original vehicle returned
 * or an actually agreed equivalent. This is NOT a six-year claims engine.
 *
 * https://www.legislation.gov.uk/ukpga/2015/15/section/20
 * https://www.legislation.gov.uk/ukpga/2015/15/section/22
 * https://www.legislation.gov.uk/ukpga/2015/15/section/23
 * https://www.legislation.gov.uk/ukpga/2015/15/section/24
 * https://www.themotorombudsman.org/knowledge/what-are-a-consumers-legal-rights-when-buying-a-car/
 */
(() => {
  const VAT=window.MotorTradeVat,REPAIR=window.MotorTradeRepairPrices;
  if(!VAT||!REPAIR)throw Error('Load vat.js and repair-prices.js before aftersales.js');
  const MODE='cra2015-2026';
  const STATUSES=Object.freeze(['open','repairing','repair-failed','resolved','refund-due','refunded',
    'reduction-due','reduced']);
  const money=x=>Number.isSafeInteger(x)&&x>=0&&x<=10000000;
  const enabled=s=>s?.aftersalesScenario===MODE;
  const initial=()=>({nextCaseId:1,cases:[],history:[]});
  const saleFor=(s,id)=>s.sold.find(x=>x.id===id);
  const caseFor=(s,id)=>s.aftersales?.cases.find(x=>x.id===id)||null;
  const legalPhase=(s,sale,reportDay=s.day)=>{
    if(!sale)return 'unknown';
    const days=reportDay-sale.day;
    if(days<=30)return 'short-term-rejection';
    const saleDate=VAT.dateForDay(sale.day);
    const sixMonths=new Date(Date.UTC(saleDate.getUTCFullYear(),
      saleDate.getUTCMonth()+6,saleDate.getUTCDate()));
    return VAT.dateForDay(reportDay)<sixMonths?
      'six-month-presumption':'later-evidence-required';
  };
  const estimatedJob=sale=>{
    const p=sale.profile||{},title=(sale.title||'').toLowerCase();
    const isEv=title.includes('tesla')||title.includes('leaf')||
      title.includes('mg4')||p.engine?.includes('EV');
    const faultKey=isEv?'evCharger':p.grade>=4?'clutchFlywheel':
      title.includes('puretech')?'puretechWetBelt':'suspension';
    return {faultKey,quote:REPAIR.quote(faultKey)?.gross||480,
      issue:isEv?'Intermittent charging fault':p.grade>=4?
        'Drivetrain mechanical fault':'Steering or suspension safety concern'};
  };
  const severity=sale=>Math.max(1,Math.min(5,sale.profile?.grade||3));
  const seed=sale=>sale.id*19+sale.day*7+sale.price;
  const willComplain=sale=>seed(sale)%100<
    [0,5,8,13,23,34][severity(sale)];
  function plannedDay(sale){
    const d=3+((sale.id*11+sale.day*7+sale.price)%38);
    return sale.day+d;
  }
  function reputation(s,delta,reason){
    const before=s.reputationScore;
    s.reputationScore=Math.min(100,Math.max(0,before+delta));
    const change=s.reputationScore-before;
    if(change){
      s.reputationHistory.push({day:s.day,delta:change,reason});
      if(s.reputationHistory.length>90)s.reputationHistory.shift();
      s.reputation=window.MotorTradePeople.tier(s.reputationScore);
    }
  }
  const fail=(code,message)=>({ok:false,code,message});
  const ok=message=>({ok:true,message});
  const collectionCost=sale=>125+25*(severity(sale)-1);
  function report(s,saleId){
    if(!enabled(s))return fail('legacy','Aftersales cases are enabled for newly created 2026 careers only.');
    const sale=saleFor(s,saleId);
    if(!sale||!sale.vehicleSnapshot)return fail('sale','No valid retail handover record exists.');
    if(s.day<sale.day)return fail('date','A claim cannot precede delivery.');
    if(s.aftersales.cases.some(x=>x.saleId===saleId))
      return fail('duplicate','That retail sale already has an active or resolved claim.');
    const job=estimatedJob(sale);
    const c={id:s.aftersales.nextCaseId++,saleId,title:sale.title,
      openedDay:s.day,phase:legalPhase(s,sale),faultKey:job.faultKey,
      issue:job.issue,quote:job.quote,repairAttempts:0,
      status:'open',repairDoneDay:null,refundApprovedDay:null,
      refundDueDay:null,refundAmount:0,collectionCost:0,
      returnedVehicleId:null,heldReturned:null,creditedVatPence:0,
      cashEquivalentConsent:false,remedy:null};
    s.aftersales.cases.push(c);
    reputation(s,-1,'Inherent customer complaint reported after retail handover');
    return ok('Consumer complaint on '+sale.title+'. Assess repair or the customer’s appropriate statutory remedy.');
  }
  function repair(s,id){
    const c=caseFor(s,id);
    if(!enabled(s)||!c)return fail('claim','Customer complaint not found.');
    if(c.status!=='open')return fail('stage','Only a newly reported claim can be repaired through this pilot.');
    if(s.cash<c.quote)return fail('cash','Outsourced consumer repair requires £'+c.quote+
      '. The customer remedy remains outstanding; insufficient funds do not extinguish legal rights.');
    s.cash-=c.quote;
    s.ledger.push({day:s.day,delta:-c.quote,
      note:'Aftersales repair: sale '+c.saleId+' ('+c.faultKey+')'});
    c.status='repairing';c.repairAttempts=1;c.repairDoneDay=s.day+4;
    return ok('Authorised '+c.quote+' VAT-inclusive outsourced remedial repair. Completion and quality-check due Day '+c.repairDoneDay+'.');
  }
  function refund(s,id){
    const c=caseFor(s,id);
    if(!enabled(s)||!c)return fail('claim','Customer complaint not found.');
    if(!['open','repair-failed'].includes(c.status))
      return fail('stage','The claim is not ready for an accepted rejection or goodwill settlement.');
    const sale=saleFor(s,c.saleId);
    if(!sale)return fail('sale','Original sale cannot be verified.');
    c.status='refund-due';c.remedy='rejection';
    c.refundApprovedDay=s.day;c.refundDueDay=s.day+14;
    c.refundAmount=sale.price;c.collectionCost=collectionCost(sale);
    // For part exchange the customer expressly accepts cash-equivalent
    // consideration for the agreed allowance. Otherwise CRA s20(11)-(12)
    // ordinarily requires return of the original consideration.
    c.cashEquivalentConsent=sale.mode==='part-ex';
    return ok('Full refund of £'+sale.price+' accepted plus £'+c.collectionCost+
      ' collection liability. Pay without undue delay (pilot latest Day '+c.refundDueDay+
      '). No automatic usage deduction. '+(c.cashEquivalentConsent?
        'Fictional customer has expressly agreed equivalent cash for the part-exchange vehicle.':''));
  }
  function reductionQuote(s,id){
    const c=caseFor(s,id),sale=c?saleFor(s,c.saleId):null;
    if(!sale||c.status!=='repair-failed')return null;
    // Negotiated individual price reduction — never a legal fixed tariff.
    return Math.min(sale.price,Math.max(200,
      Math.round((c.quote+sale.price*.06)/25)*25));
  }
  function reduce(s,id){
    const c=caseFor(s,id),offer=reductionQuote(s,id);
    if(!enabled(s)||!c||offer===null)
      return fail('stage','Price reduction is only available by consumer agreement after the repair fails.');
    c.status='reduction-due';c.remedy='price-reduction';
    c.refundApprovedDay=s.day;c.refundDueDay=s.day+14;
    c.refundAmount=offer;c.collectionCost=0;
    return ok('Customer agrees to keep the vehicle with a negotiated £'+offer+
      ' price reduction. This is a simulated case agreement, not a statutory percentage.');
  }
  function returnVehicle(s,sale,c){
    const old=sale.vehicleSnapshot;
    const copy=JSON.parse(JSON.stringify(old));
    copy.status='acquired';copy.prepSpent=0;
    const v={...copy,id:s.nextId++,acquiredDay:s.day,
      source:'seller',origin:'RETURN-'+sale.id,returnOf:sale.id,
      status:'acquired',asking:null,
      cost:sale.acquisition+sale.prep,prepSpent:0,
      workshop:window.MotorTradeWorkshop.initial(copy)};
    c.returnedVehicleId=v.id;
    if(s.vehicles.length<s.capacity){
      s.vehicles.push(v);s.stock=s.vehicles.length;
    }else c.heldReturned=v;
  }
  function settle(s,c){
    const sale=saleFor(s,c.saleId);
    if(!sale||!money(c.refundAmount)||!money(c.collectionCost))return false;
    const charge=c.refundAmount+c.collectionCost;
    if(s.cash<charge)return false;
    const reduction=c.remedy==='price-reduction';
    s.cash-=charge;
    s.ledger.push({day:s.day,delta:-c.refundAmount,
      note:(reduction?'Aftersales price reduction: sale ':'Aftersales refund: sale ')+
        c.saleId+' ('+sale.title+')'});
    if(c.collectionCost)s.ledger.push({day:s.day,delta:-c.collectionCost,
      note:'Aftersales collection: sale '+c.saleId+' ('+sale.title+')'});
    c.creditedVatPence=reduction?
      (sale.vat?.outputPence||0)-VAT.marginVatPence(
        sale.price-c.refundAmount,sale.vat?.purchaseBasis??0):
      sale.vat?.outputPence||0;
    if(c.creditedVatPence)s.ledger.push({day:s.day,delta:0,
      note:'VAT output reversal accrued: sale '+c.saleId+' ('+VAT.pence(c.creditedVatPence)+')'});
    if(!reduction)returnVehicle(s,sale,c);
    c.status=reduction?'reduced':'refunded';
    s.aftersales.history.push({day:s.day,saleId:c.saleId,refund:c.refundAmount,
      recovery:c.collectionCost,creditedVatPence:c.creditedVatPence,
      returnedVehicleId:c.returnedVehicleId,
      originalProfit:reduction?c.refundAmount:sale.profit,
      type:reduction?'price-reduction':'rejection'});
    if(s.aftersales.history.length>2000)s.aftersales.history.shift();
    reputation(s,reduction?-2:-6,reduction?
      'Customer accepted a price reduction after failed repair':
      'Customer refund after confirmed non-conforming vehicle');
    return true;
  }
  function releaseReturned(s,id){
    const c=caseFor(s,id);
    if(!c||c.status!=='refunded'||!c.heldReturned)
      return fail('stock','No recovered vehicle is waiting at offsite storage.');
    if(s.vehicles.length>=s.capacity)
      return fail('capacity','Forecourt is full. The returned vehicle remains held offsite.');
    s.vehicles.push(c.heldReturned);c.heldReturned=null;
    s.stock=s.vehicles.length;
    return ok('Recovered vehicle placed into workshop queue for re-assessment; its original stock cost is preserved.');
  }
  function advance(s){
    if(!enabled(s))return [];
    const notices=[];
    // A single deterministic reported inherent fault per sale, with realistic
    // grade-dependent incident probability. Never flag every used car.
    for(const sale of s.sold){
      if(!sale.vehicleSnapshot||s.aftersales.cases.some(x=>x.saleId===sale.id))continue;
      if(!willComplain(sale)||plannedDay(sale)>s.day||s.day-sale.day>180)continue;
      const result=report(s,sale.id);
      if(result.ok)notices.push('AFTERSALES CLAIM: '+sale.title+' — see Sales Office.');
    }
    for(const c of s.aftersales.cases){
      if(c.status==='repairing'&&s.day>=c.repairDoneDay){
        const sale=saleFor(s,c.saleId);
        const failure=(sale.id+sale.day+severity(sale))%5===0;
        c.status=failure?'repair-failed':'resolved';
        if(failure){
          reputation(s,-3,'Failed statutory consumer repair caused further inconvenience');
          notices.push('REPAIR FAILED: '+c.title+' — final rejection / price reduction may be due.');
        }else{
          reputation(s,1,'Successful outsourced consumer repair');
          notices.push('AFTERSALES REPAIRED: '+c.title+' returned to customer at no charge.');
        }
      }
      if(c.status==='refund-due'||c.status==='reduction-due'){
        const reduced=c.status==='reduction-due';
        const paid=settle(s,c);
        if(paid)notices.push(reduced?'CUSTOMER PRICE REDUCTION PAID: '+c.title+' — VAT adjusted.':'CUSTOMER REFUND PAID: '+c.title+' — vehicle recovered, VAT adjusted.');
        else if(s.day>c.refundDueDay&&
          (s.day===c.refundDueDay+1||(s.day-c.refundDueDay)%7===0)){
          reputation(s,-2,'Overdue legally accepted customer refund');
          notices.push('OVERDUE REFUND: '+c.title+'; cash shortfall does not cancel the obligation.');
        }
      }
    }
    return notices;
  }
  const creditsPence=s=>enabled(s)?s.aftersales.cases.reduce((n,c)=>
    n+(['refunded','reduced'].includes(c.status)?c.creditedVatPence:0),0):0;
  const pendingRefunds=s=>enabled(s)?s.aftersales.cases.reduce((n,c)=>
    n+(['refund-due','reduction-due'].includes(c.status)?c.refundAmount+c.collectionCost:0),0):0;
  function valid(s){
    if(!enabled(s))return s?.aftersales===undefined&&s?.aftersalesScenario===undefined;
    const a=s.aftersales;
    if(!a||!Number.isSafeInteger(a.nextCaseId)||a.nextCaseId<1||
      !Array.isArray(a.cases)||a.cases.length>2000||
      !Array.isArray(a.history)||a.history.length>2000)return false;
    // New aftersales careers preserve each delivered vehicle exactly enough
    // for a lawful unwind and independent workshop assessment on recovery.
    if(!s.sold.every(x=>x.vehicleSnapshot&&
      x.vehicleSnapshot.id===x.id&&x.vehicleSnapshot.title===x.title&&
      x.vehicleSnapshot.cost===x.acquisition&&
      x.vehicleSnapshot.prepSpent===x.prep&&
      x.vehicleSnapshot.status==='listed'))return false;
    const ids=new Set(),saleIds=new Set(),returnedIds=new Set();
    for(const c of a.cases){
      const sale=saleFor(s,c?.saleId);
      if(!c||!sale||
        !Number.isSafeInteger(c.id)||c.id<1||c.id>=a.nextCaseId||
        ids.has(c.id)||saleIds.has(c.saleId)||c.title!==sale.title||
        !STATUSES.includes(c.status)||c.openedDay<sale.day||c.openedDay>s.day||
        c.phase!==legalPhase(s,sale,c.openedDay)||
        !money(c.quote)||!money(c.refundAmount)||!money(c.collectionCost)||
        !Number.isSafeInteger(c.repairAttempts)||c.repairAttempts<0||c.repairAttempts>1||
        (c.repairAttempts===0&&c.repairDoneDay!==null)||
        (c.repairAttempts===1&&
          (!Number.isSafeInteger(c.repairDoneDay)||c.repairDoneDay<c.openedDay+4))||
        !Number.isSafeInteger(c.creditedVatPence)||c.creditedVatPence<0)return false;
      const job=estimatedJob(sale);
      if(c.quote!==job.quote||c.faultKey!==job.faultKey||c.issue!==job.issue)return false;
      ids.add(c.id);saleIds.add(c.saleId);
      const repairs=s.ledger.filter(l=>l.note===
        'Aftersales repair: sale '+c.saleId+' ('+c.faultKey+')');
      if(repairs.length!==c.repairAttempts||
        repairs.some(x=>x.delta!==-c.quote||x.day<c.openedDay))return false;
      if(['repairing','repair-failed','resolved'].includes(c.status)&&c.repairAttempts!==1)
        return false;
      if(c.status==='open'&&c.repairAttempts>0)
        return false;
      const isFull=['refund-due','refunded'].includes(c.status);
      const isReduced=['reduction-due','reduced'].includes(c.status);
      const due=isFull||isReduced;
      if(due){
        const expectedReduction=Math.min(sale.price,Math.max(200,
          Math.round((c.quote+sale.price*.06)/25)*25));
        if(!Number.isSafeInteger(c.refundApprovedDay)||
          c.refundApprovedDay<c.openedDay||c.refundApprovedDay>s.day||
          c.refundDueDay!==c.refundApprovedDay+14||
          c.refundAmount!==(isFull?sale.price:expectedReduction)||
          c.collectionCost!==(isFull?collectionCost(sale):0)||
          c.cashEquivalentConsent!==(isFull&&sale.mode==='part-ex')||
          c.remedy!==(isFull?'rejection':'price-reduction'))return false;
        if(isReduced&&c.repairAttempts!==1)return false;
      }else if(c.refundAmount!==0||c.refundApprovedDay!==null||
        c.refundDueDay!==null||c.creditedVatPence!==0||
        c.remedy!==null)return false;
      const paid=c.status==='refunded'||c.status==='reduced';
      if(paid){
        const vatOriginal=sale.vat?.outputPence||0;
        const expectedCredit=isReduced?vatOriginal-
          VAT.marginVatPence(sale.price-c.refundAmount,sale.vat?.purchaseBasis??0):
          vatOriginal;
        if(c.creditedVatPence!==expectedCredit)return false;
        const spendNote=(isReduced?'Aftersales price reduction: sale ':
          'Aftersales refund: sale ')+c.saleId+' ('+sale.title+')';
        const spend=s.ledger.filter(l=>l.note===spendNote);
        const collection=s.ledger.filter(l=>l.note===
          'Aftersales collection: sale '+c.saleId+' ('+sale.title+')');
        const credit=s.ledger.filter(l=>l.note.startsWith(
          'VAT output reversal accrued: sale '+c.saleId+' ('));
        if(spend.length!==1||spend[0].delta!==-c.refundAmount||
          collection.length!==(isFull?1:0)||
          collection.some(l=>l.delta!==-c.collectionCost)||
          credit.length!==(c.creditedVatPence?1:0)||
          credit.some(x=>x.delta!==0||x.note!==
            'VAT output reversal accrued: sale '+c.saleId+
              ' ('+VAT.pence(c.creditedVatPence)+')'))return false;
      }
      if(isFull&&paid){
        if(!Number.isSafeInteger(c.returnedVehicleId)||c.returnedVehicleId<1||
          c.returnedVehicleId>=s.nextId||returnedIds.has(c.returnedVehicleId))return false;
        returnedIds.add(c.returnedVehicleId);
        const physical=s.vehicles.find(v=>v.id===c.returnedVehicleId)||
          c.heldReturned;
        if(physical){
          if(physical.id!==c.returnedVehicleId||
            physical.returnOf!==sale.id||
            physical.origin!=='RETURN-'+sale.id||
            physical.cost<sale.acquisition+sale.prep)return false;
        }else{
          // A recovered car may legitimately be prepared and resold or
          // disposed wholesale. Never require it to remain on the forecourt
          // forever just to let the original refund record validate.
          const onward=s.sold.find(v=>v.id===c.returnedVehicleId)||
            (s.wholesale||[]).find(v=>v.id===c.returnedVehicleId);
          if(!onward||onward.origin!=='RETURN-'+sale.id||
            (onward.returnOf!==undefined&&onward.returnOf!==sale.id))
            return false;
        }
      }else if(c.returnedVehicleId!==null||c.heldReturned!==null)return false;
    }
    const settled=a.cases.filter(c=>['refunded','reduced'].includes(c.status));
    return a.history.length===settled.length&&a.history.every(h=>
      Number.isSafeInteger(h.day)&&h.day<=s.day&&
      settled.some(c=>c.saleId===h.saleId&&
        h.refund===c.refundAmount&&h.recovery===c.collectionCost&&
        h.returnedVehicleId===c.returnedVehicleId&&
        h.creditedVatPence===c.creditedVatPence&&
        h.type===(c.status==='reduced'?'price-reduction':'rejection')&&
        h.originalProfit===(c.status==='reduced'?c.refundAmount:
          saleFor(s,c.saleId).profit)));
  }
  const clone=a=>JSON.parse(JSON.stringify(a));
  window.MotorTradeAftersales=Object.freeze({MODE,STATUSES,initial,enabled,
    saleFor,caseFor,legalPhase,estimatedJob,plannedDay,willComplain,
    report,repair,refund,reduce,reductionQuote,releaseReturned,advance,creditsPence,
    pendingRefunds,valid,clone});
})();
