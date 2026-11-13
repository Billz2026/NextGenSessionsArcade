'use strict';
/*
 * 2026 dealer customer service desk. ALL operations are outsourced.
 * No unlicensed MOT testing, vehicle dismantling or certificate issue.
 * MOT tests are completed by DVSA-authorised test centres; the vehicle owner
 * pays the MOT statutory fee directly to that centre. Dealer gets only a
 * separately simulated VAT-inclusive introduction commission.
 * Scrap vehicles go directly to an authorised treatment facility (ATF), who
 * pays the owner by bank transfer and is responsible for destruction records.
 * Figures are fictional learning-game assumptions, NOT market price quotes.
 * Standard-rated service referral/income output VAT is modelled conservatively
 * without reclaiming input VAT from subcontractor invoices.
 */
(() => {
  const PRODUCTS=Object.freeze({
    service:Object.freeze({label:'ROUTINE SERVICE',description:'Subcontracted oil/filter and safety service',
      gross:229,supplier:150,days:2,payer:'customer',feeNote:'Price includes illustrative VAT'}),
    repair:Object.freeze({label:'CUSTOMER REPAIRS',description:'Subcontracted brakes, tyres or minor mechanical repair',
      gross:395,supplier:275,days:3,payer:'customer',feeNote:'Price includes illustrative VAT'}),
    mot:Object.freeze({label:'MOT BOOKING REFERRAL',description:'Approved third-party MOT test centre; no in-house MOT authority',
      gross:15,supplier:0,days:1,payer:'approved-mot-centre',
      feeNote:'£15 simulated referral income; customer pays £45 MOT test fee DIRECTLY to VTS, no MOT fee received by dealer'}),
    scrap:Object.freeze({label:'SCRAP / ATF REFERRAL',description:'Refer end-of-life vehicle to licensed ATF for compliant disposal',
      gross:35,supplier:0,days:2,payer:'authorised-treatment-facility',
      feeNote:'£35 illustrative VAT-inclusive commission; ATF pays owner by bank/cheque and issues any required CoD'})
  });
  const keys=Object.keys(PRODUCTS);
  const safe=n=>Number.isSafeInteger(n)&&n>=0&&n<=100000000;
  const hash=text=>{let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h>>>0};
  const fail=(code,message)=>({ok:false,code,message});
  const success=message=>({ok:true,changed:true,message});
  const initial=()=>({jobs:[],nextId:1});
  const active=s=>(s.serviceDesk?.jobs||[]).filter(j=>j.status==='booked').length;
  const currency=n=>'£'+Number(n).toLocaleString('en-GB');
  function leads(s){
    if(s.financialScenario!=='uk2026')return [];
    const max=s.reputationScore>=65?3:s.reputationScore>=25?2:1;
    const out=[];
    for(let i=0;i<max;i++){
      const key=keys[(s.day+i+hash(s.name+'|'+s.day+'|'+i))%keys.length];
      const product=PRODUCTS[key],id='C-'+s.day+'-'+i;
      if(!s.serviceDesk?.jobs.some(j=>j.leadId===id)){
        out.push({id,day:s.day,kind:key,...product});
      }
    }
    return out;
  }
  function book(s,id){
    if(s.financialScenario!=='uk2026')return fail('mode','Customer service jobs are available in the 2026 dealer career.');
    const lead=leads(s).find(x=>x.id===id);
    if(!lead)return fail('missing','Customer service enquiry expired or already booked.');
    if(s.auctionHall?.phase==='payment')return fail('invoice','Settle the binding auction invoice first.');
    const pending=s.premises?.arrears||0;
    const protectedRepairs=window.MotorTradeWorkshop?.reserved(s)||0;
    if(lead.supplier>s.cash-pending-protectedRepairs)
      return fail('cash','Not enough unreserved cash to book the external provider and protect creditor obligations.');
    // Dynamic completion time as the work queue grows: no artificial cap on
    // external garage bookings, but overload worsens real-world turnaround.
    const queue=Math.min(5,Math.floor(active(s)/5));
    const duration=lead.days+queue,providerFailure=hash('quality|'+s.name+'|'+id)%100;
    const quality=Math.max(50,Math.min(100,74+hash('service-quality|'+s.name+'|'+id)%27));
    const delay=hash('service-delay|'+s.name+'|'+id)%7===0?2:0;
    const j={id:s.serviceDesk.nextId++,leadId:id,kind:lead.kind,
      label:lead.label,day:s.day,dueDay:s.day+duration,
      readyDay:s.day+duration+delay,providerFailure,quality,
      gross:lead.gross,supplier:lead.supplier,paid:lead.supplier,
      status:'booked',doneDay:null,rating:null,late:null,taxOutputPence:0};
    if(lead.supplier){
      s.cash-=lead.supplier;
      s.ledger.push({day:s.day,delta:-lead.supplier,
        note:'Customer services subcontractor: '+lead.label+' #'+j.id});
    }
    s.serviceDesk.jobs.push(j);
    return success(lead.label+' booked with an external provider. '+(lead.supplier?
      currency(lead.supplier)+' supplier invoice paid. ':'No dealer supplier charge. ')+
      'Promised collection in '+duration+' game day(s). Customer payment/partner commission only after completion.');
  }
  function advance(s){
    if(s.financialScenario!=='uk2026'||!s.serviceDesk)return [];
    const events=[];
    for(const j of s.serviceDesk.jobs){
      if(j.status!=='booked'||j.readyDay>s.day)continue;
      const isScrap=j.kind==='scrap';
      const failJob=j.providerFailure<7;
      const late=j.readyDay>j.dueDay;
      j.status=failJob?'failed':'completed';
      j.doneDay=s.day;j.late=late;
      j.rating=failJob?1:Math.max(2,Math.min(5,
        Math.round(j.quality/20)-(late?1:0)));
      if(!failJob){
        s.cash+=j.gross;
        s.ledger.push({day:s.day,delta:j.gross,
          note:(j.kind==='scrap'?'ATF scrap referral commission: ':
            j.kind==='mot'?'Approved MOT referral commission: ':
            'Customer services receipt: ')+j.label+' #'+j.id});
        // Gross commission or service receipt is standard-rated; the actual
        // MOT test fee and vehicle scrap owner payout never touch dealer books.
        j.taxOutputPence=Math.round(j.gross*100/6);
      }
      const delta=failJob?-2:late?-1:j.rating>=5&&j.id%4===0?1:0;
      if(delta){
        const prior=s.reputationScore;
        s.reputationScore=Math.max(0,Math.min(100,prior+delta));
        const actual=s.reputationScore-prior;
        if(actual){
          s.reputationHistory.push({day:s.day,delta:actual,
            reason:failJob?'Subcontracted customer job failed quality control':
              late?'External customer work missed promised turnaround':
              'Positive customer service quality and timely handover'});
          if(s.reputationHistory.length>90)s.reputationHistory.shift();
          s.reputation=window.MotorTradePeople.tier(s.reputationScore);
        }
      }
      events.push(j.label+' #'+j.id+(failJob?' failed final quality review; external cost lost and no customer fee collected.':
        ' completed. '+currency(j.gross)+' received ('+(j.kind==='mot'||isScrap?'partner commission':'customer invoice')+
        '). Customer rating '+j.rating+'/5'+(late?' · LATE':' · ON TIME')+'.'));
    }
    return events;
  }
  const summary=s=>{
    const jobs=s.serviceDesk?.jobs||[],complete=jobs.filter(j=>j.status==='completed'),
      failed=jobs.filter(j=>j.status==='failed');
    const last=complete.slice(-20),mean=last.length?
      Math.round(last.reduce((n,j)=>n+j.rating,0)/last.length*10)/10:null;
    return {booked:jobs.filter(j=>j.status==='booked').length,completed:complete.length,
      failed:failed.length,ratingsAverage:mean,leads:leads(s).length,
      earned:complete.reduce((n,j)=>n+j.gross-j.paid,0),
      grossReceipts:complete.reduce((n,j)=>n+j.gross,0),
      customerHappiness:mean===null?'NO RATINGS':mean+'/5'};
  };
  function valid(s){
    if(s.financialScenario!=='uk2026')return s.serviceDesk===undefined||
      (Array.isArray(s.serviceDesk.jobs)&&s.serviceDesk.jobs.length===0);
    const d=s.serviceDesk;
    if(!d||!Array.isArray(d.jobs)||d.jobs.length>15000||
       !safe(d.nextId)||d.nextId<1)return false;
    const ids=new Set(),leadsSeen=new Set();
    for(const j of d.jobs){
      if(!j||!safe(j.id)||j.id===0||j.id>=d.nextId||
         typeof j.leadId!=='string'||!/^C-\d+-\d+$/.test(j.leadId)||
         ids.has(j.id)||leadsSeen.has(j.leadId)||!keys.includes(j.kind)||
         j.label!==PRODUCTS[j.kind].label||
         !safe(j.day)||j.day<1||j.day>s.day||
         !safe(j.dueDay)||j.dueDay<=j.day||
         !safe(j.readyDay)||j.readyDay<j.dueDay||
         !safe(j.quality)||j.quality>100||
         !safe(j.providerFailure)||j.providerFailure>99||
         !safe(j.gross)||j.gross!==PRODUCTS[j.kind].gross||
         !safe(j.supplier)||j.supplier!==PRODUCTS[j.kind].supplier||
         !safe(j.paid)||j.paid!==j.supplier||
         !['booked','completed','failed'].includes(j.status)||
         !safe(j.taxOutputPence)||
         (j.status==='booked'?
           j.doneDay!==null||j.rating!==null||j.late!==null||j.taxOutputPence!==0:
           j.doneDay===null||j.doneDay<j.readyDay||j.doneDay>s.day||
           !safe(j.rating)||j.rating<1||j.rating>5||
           typeof j.late!=='boolean'||j.late!==(j.doneDay>j.dueDay)||
           j.taxOutputPence!==(j.status==='completed'?Math.round(j.gross*100/6):0)))return false;
      ids.add(j.id);leadsSeen.add(j.leadId);
    }
    return true;
  }
  const clone=s=>({jobs:s.jobs.map(x=>({...x})),nextId:s.nextId});
  window.MotorTradeServiceDesk=Object.freeze({
    PRODUCTS,initial,leads,book,advance,summary,valid,clone});
})();