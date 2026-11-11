'use strict';
/* The Motor Trade v0.9.25 — Sales Office final polish. */
(() => {
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cash=x=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',
    maximumFractionDigits:0}).format(x);
  const VC=window.MotorTradeCards;
  if(!VC)throw new Error('Load vehicle-cards.js before customers-view.js');
  const statuses={
    enquiry:'NEW ENQUIRY',booked:'APPOINTMENT BOOKED',
    arrived:'CUSTOMER ON SITE',discussing:'NEGOTIATION IN PROGRESS',
    agreed:'TERMS AGREED',reserved:'DEPOSIT HELD / COLLECTION BOOKED',
    collectable:'READY FOR COLLECTION',lost:'CUSTOMER LOST'
  };
  function actions(state,vehicle,E){
    const C=E.customers,c=C.caseFor(state,vehicle.id),id=vehicle.id;
    if(!c){
      const interest=C.demand(state,vehicle);
      return interest?
        '<div class="sales-case-highlight"><strong>CONTACT POTENTIAL BUYER</strong>'+
        '<p>A potential buyer is interested in this vehicle. Contact them to log an enquiry and establish their requirements.</p>'+
        '<button type="button" class="trade-button" data-action="open-customer" data-id="'+id+
        '">CONTACT BUYER / OPEN ENQUIRY →</button></div>':
        '<div class="sales-case-quiet"><strong>NO ACTIVE RETAIL ENQUIRIES</strong>'+
        '<p>No customer wants to proceed with this particular car right now. Interest may change on another game day'+
        (E.events.isDealDay(state.day)?' or Deal Day session':'')+
        '. Review price and stock age; nothing is guaranteed.</p></div>';
    }
    const rep=E.people.salesRep(state,c);
    const who='<div class="sales-customer-meta"><span>'+esc(c.name)+'</span>'+ 
      '<span>'+esc(c.channel)+'</span><span>'+esc(statuses[c.status])+'</span>'+ 
      '<span>SALES ADVISER: '+esc(rep?.name||'Owner-managed')+
      (rep?' · '+Math.round(E.people.salesProfile(rep).commissionRate*100)+'% GROSS MARGIN COMMISSION':'')+
      '</span></div>';
    const cancel='<button type="button" class="trade-button trade-button-outline" data-action="cancel-customer" data-id="'+id+
      '">DEALERSHIP CANCELS / REFUND</button>';
    const buyerWithdraw='<button type="button" class="trade-button trade-button-secondary" data-action="customer-withdrawal" data-id="'+id+
      '">CUSTOMER CHANGES MIND</button>';
    let body='';
    switch(c.status){
      case 'enquiry':
        body='<p>'+esc(c.name)+' has enquired about this car. They have not inspected or test driven it yet.'+
          ' Book a viewing within 48 game-hours. No deposit means the vehicle remains for sale.</p>'+ 
          '<button type="button" class="trade-button" data-action="book-customer" data-id="'+id+
          '">BOOK VIEWING →</button> '+cancel;
        break;
      case 'booked':
        body='<div class="sales-case-highlight"><strong>VIEWING WITHIN 48 GAME-HOURS · NO DEPOSIT</strong>'+ 
          '<p>'+esc(c.name)+' is due on <strong>GAME DAY '+c.appointmentDay+
          '</strong>. This is an appointment, not a reservation: the car stays for sale until someone pays a deposit or completes handover.</p>'+ 
          (C.competingInterest(state,id)?'<button type="button" class="trade-button" data-action="competing-customer" data-id="'+id+
          '">SERVE ANOTHER BUYER NOW →</button><p>Another interested buyer can view and test drive now. If they do not purchase, the first booking is preserved.</p>':
          '<p>No second buyer is ready right now. The original customer can still attend their appointment.</p>')+
          '</div>'+cancel;
        break;
      case 'arrived':
        body='<p>Customer has arrived to inspect the vehicle. A test drive can reveal objections that prevent a sale.'+
          (c.standby?' Another customer has an earlier unsecured booking; it is preserved unless this buyer purchases or pays a deposit.':'')+'</p>'+ 
          '<button type="button" class="trade-button" data-action="test-drive" data-id="'+id+
          '">OFFER TEST DRIVE →</button> '+cancel;
        break;
      case 'discussing':{
        const b=E.buyers(vehicle,state);
        if(!b){body='<p>Customer is not currently available to negotiate. Try a different time.</p>';break;}
        const cashUI='<section class="sales-offer-mode"><h4>CASH PURCHASE</h4>'+
          '<small>CUSTOMER INITIAL / REVISED OFFER</small><strong>'+cash(b.cashOffer)+'</strong>'+
          '<p>Indicative maximum budget '+cash(b.cashLimit)+'. Increasing your counter risks a rejection or walkaway.</p>'+
          '<div class="trade-action-row"><button class="trade-button trade-button-secondary" type="button" data-action="counter-sale" data-id="'+id+
          '"'+(c.counters>=2?' disabled':'')+'>COUNTER +£150</button>'+
          '<button class="trade-button" type="button" data-action="agree-cash" data-id="'+id+
          '">AGREE CASH PRICE</button></div></section>';
        const part=b.exchange?'<section class="sales-offer-mode"><h4>PART-EXCHANGE PROPOSAL</h4>'+
          '<small>CUSTOMER OFFER FOR YOUR CAR</small><strong>'+cash(b.pxOffer)+'</strong>'+
          VC.mini(b.exchange,'part-ex')+
          '<p>Trade-in: '+esc(b.exchange.title)+' · '+cash(b.exchange.retail)+
          ' indicative retail · '+cash(b.exchange.prep)+' original prep estimate.</p>'+
          '<label for="px-allowance-'+id+'">AGREED PART-EX ALLOWANCE (£)</label>'+
          '<input id="px-allowance-'+id+'" class="trade-input" type="number" inputmode="numeric" min="'+
          b.exchange.floor+'" max="'+b.exchange.ask+'" value="'+b.exchange.ask+'" step="25">'+
          '<p>Allowance range '+cash(b.exchange.floor)+'–'+cash(b.exchange.ask)+
          '. Incoming car requires its own preparation and takes one forecourt space.</p>'+
          '<button type="button" class="trade-button" data-action="agree-part-ex" data-id="'+id+
          '">AGREE PART-EX TERMS</button></section>':
          '<p class="so-no-part-ex">NO PART-EXCHANGE OFFERED · Cash purchase only for this customer.</p>';
        body='<p>The test drive went well. Discuss a realistic cash price or trade-in allowance; there is no completed sale until handover.'+
          (c.standby?' The earlier unsecured appointment stays open until a deposit or completed sale.':'')+'</p>'+ 
          '<div class="sales-offer-modes">'+cashUI+part+'</div>'+cancel;
        break;
      }
      case 'agreed':
        body='<div class="sales-case-highlight"><h4>AGREEMENT REACHED</h4>'+
          '<p>Agreed '+esc(c.preferredMode==='part-ex'?'part-exchange':'cash')+
          ' sale at <strong>'+cash(c.price)+'</strong>'+
          (c.exchange?' with a '+cash(c.allowance)+' allowance for '+esc(c.exchange.title):'')+
          '. No cash has been recognised as a retail sale yet.</p>'+
          '<div class="trade-action-row"><button type="button" class="trade-button" data-action="handover-customer" data-mode="'+
          c.preferredMode+'" data-id="'+id+'">COMPLETE HANDOVER</button>'+
          '<button type="button" class="trade-button trade-button-secondary" data-action="deposit-customer" data-id="'+id+
          '">TAKE £250 DEPOSIT / LATER COLLECTION</button></div>'+
          '<p class="sales-deposit-terms">The reservation funds are held separately. Customer withdrawal may cause fair cost-based retention, while dealership fault requires a refund.</p></div>'+cancel;
        break;
      case 'reserved':
        body='<div class="sales-case-highlight"><h4>£250 CUSTOMER DEPOSIT RECEIVED</h4>'+
          '<div class="sales-payment-breakdown">'+
          '<span>Agreed price</span><strong>'+cash(c.price)+'</strong>'+
          '<span>Part-exchange allowance</span><strong>'+cash(c.allowance||0)+'</strong>'+
          '<span>Already paid</span><strong>'+cash(c.held)+'</strong>'+
          '<span>BALANCE DUE AT COLLECTION</span><strong>'+cash(C.balanceDue(c))+'</strong></div>'+
          '<p><strong>COLLECTION: GAME DAY '+c.collectionDay+'</strong> · Customer-specific preparation charged: '+cash(c.prepCost||0)+'.</p>'+
          '<p>The £250 deposit is held separately, not recognised as a vehicle sale. Buyer withdrawal can incur fair retention for recorded costs; dealership fault requires a refund.</p></div>'+buyerWithdraw+' '+cancel;
        break;
      case 'collectable':
        body='<div class="sales-case-highlight"><h4>CUSTOMER READY TO COLLECT</h4>'+
          '<div class="sales-payment-breakdown">'+
          '<span>Agreed sale price</span><strong>'+cash(c.price)+'</strong>'+
          '<span>Part-exchange allowance</span><strong>'+cash(c.allowance||0)+'</strong>'+
          '<span>Deposit already paid</span><strong>'+cash(c.held)+'</strong>'+
          '<span>BALANCE TO COLLECT TODAY</span><strong>'+cash(C.balanceDue(c))+'</strong></div>'+
          '<p><strong>COLLECTION DUE: DAY '+c.collectionDay+'</strong> · Complete handover within five game days. Collect only the outstanding balance; the held deposit is applied once.</p>'+
          '<button type="button" class="trade-button" data-action="handover-customer" data-mode="'+
          c.preferredMode+'" data-id="'+id+'">COLLECT '+cash(C.balanceDue(c))+' / HANDOVER</button></div>'+
          buyerWithdraw+' '+cancel;
        break;
      case 'lost':
        body='<div class="trade-inline-feedback trade-feedback-warning"><strong>CUSTOMER DID NOT PROCEED</strong>'+
          '<p>'+esc(c.reason||'No deal agreed.')+'</p>'+
          '<p>The next game day'+(E.events.isDealDay(state.day)?' or Deal Day session':'')+
          ' may produce another enquiry, but not automatically.</p></div>';
        break;
    }
    return who+'<div class="sales-case-content">'+body+'</div>';
  }
  const FILTERS=Object.freeze(['all','action','appointments','deposits']);
  const STEP=['LEAD / ENQUIRY','VIEWING','TEST DRIVE','AGREEMENT','COLLECTION'];
  function lead(state,v,E){
    const c=E.customers.caseFor(state,v.id),available=!c&&E.customers.demand(state,v);
    const title=c?statuses[c.status]||'CUSTOMER CASE':
      available?'BUYER INTEREST TO CONTACT':'AWAITING BUYER INTEREST';
    const step=!c?(available?0:-1):{
      enquiry:0,booked:1,arrived:1,discussing:2,agreed:3,
      reserved:4,collectable:4,lost:-1
    }[c.status]??-1;
    const actionable=available||!!c&&
      ['enquiry','arrived','discussing','agreed','collectable'].includes(c.status);
    return {c,available,title,step,actionable,
      tone:c?.status==='lost'?'lost':
        ['reserved','collectable'].includes(c?.status)?'deposit':
        actionable?'action':c?.status==='booked'?'appointment':'quiet'};
  }
  function snapshot(state,E){
    const C=E.customers,listed=state.vehicles.filter(v=>v.status==='listed');
    const rows=listed.map(v=>({vehicle:v,caseData:lead(state,v,E)}));
    const live=rows.filter(r=>r.caseData.c&&r.caseData.c.status!=='lost').length;
    const appointments=rows.filter(r=>r.caseData.c?.status==='booked').length;
    const deposits=rows.filter(r=>r.caseData.c?.held>0).length;
    return {rows,live,appointments,deposits,
      attention:rows.filter(r=>r.caseData.actionable).length,
      held:C.heldDeposits(state)};
  }
  function unit(state,entry,selected){
    const v=entry.vehicle,k=entry.caseData;
    const days=Math.max(0,state.day-v.listedDay);
    const c=k.c;
    const due=c?.status==='booked'&&c.appointmentDay!==null?' · VIEWING DAY '+c.appointmentDay:
      ['reserved','collectable'].includes(c?.status)&&c.collectionDay!==null?
        ' · COLLECTION DAY '+c.collectionDay:'';
    return '<article class="so-unit'+(selected?' so-unit-active':'')+'">'+
      '<div class="so-thumb">'+VC.photo(v,'stock')+'</div>'+
      '<button type="button" class="so-pick" data-action="select-sales" data-id="'+v.id+
      '" aria-pressed="'+String(selected)+'"><small>STOCK '+v.id+
      ' · '+days+' DAYS ADVERTISED</small><strong>'+esc(v.title)+'</strong>'+
      '<span>ASKING '+cash(v.asking)+due+'</span>'+
      '<em class="so-status so-status-'+k.tone+'">'+esc(k.title)+'</em></button></article>';
  }
  function progress(info){
    return '<div class="so-flow" aria-label="Sales progression">'+STEP.map((name,i)=>
      '<span class="'+(i<info.step?'so-flow-done':i===info.step?'so-flow-current':'')+'"'+
      (i===info.step?' aria-current="step"':'')+'>'+name+'</span>').join('')+'</div>';
  }
  function details(state,E,entry){
    const v=entry.vehicle,leadInfo=entry.caseData,c=leadInfo.c;
    const invested=v.cost+v.prepSpent;
    const indicative=v.profile?.likelySale??v.retail;
    const days=Math.max(0,state.day-v.listedDay);
    return '<article class="so-file" aria-label="Selected sales case">'+
      '<header class="so-file-head"><div><small>RETAIL FILE · STOCK '+v.id+
      (c?' · '+esc(c.channel):' · ADVERTISED VEHICLE')+'</small>'+
      '<h3>'+esc(v.title)+'</h3></div>'+
      '<span class="so-status so-status-'+leadInfo.tone+'">'+esc(leadInfo.title)+'</span></header>'+
      progress(leadInfo)+
      '<div class="so-file-grid"><section class="so-car">'+
      '<div class="so-vehicle-intro"><div class="so-car-photo">'+VC.photo(v,'stock')+'</div>'+
      '<div class="so-specs"><span>'+new Intl.NumberFormat('en-GB').format(v.miles)+
      ' MILES</span><span>'+esc(v.fuel)+' · '+esc(v.gearbox)+'</span>'+
      '<small>'+esc(v.color||'COLOUR NOT RECORDED')+' · '+days+
      ' DAYS ADVERTISED</small></div></div>'+
      '<h4>VEHICLE FINANCIALS</h4><div class="so-figures">'+
      '<div><span>ADVERTISED PRICE</span><strong>'+cash(v.asking)+'</strong></div>'+
      '<div><span>ACQUISITION + PREPARATION</span><strong>'+cash(invested)+'</strong></div>'+
      '<div><span>LIKELY ACHIEVED SALE</span><strong>'+cash(indicative)+'</strong></div>'+
      (c?.price!==null&&c?.price!==undefined?
        '<div class="so-figures-strong"><span>AGREED SALE PRICE</span><strong>'+cash(c.price)+'</strong></div>':'')+
      '</div><p class="so-caveat">Valuations are fictional. An agreed price is not a completed sale until handover.</p>'+
      '</section><section class="so-customer"><div class="so-customer-heading">'+
      '<div><small>SALES CASE MANAGEMENT</small><h4>NEXT CUSTOMER ACTION</h4></div>'+
      (c?'<span>'+esc(c.name)+'</span>':'')+'</div>'+
      actions(state,v,E)+'</section></div></article>';
  }
  function history(state){
    if(!state.sold.length)return '';
    return '<details class="so-history"><summary>RECENT COMPLETED HANDOVERS · '+
      state.sold.length+' SALES <span>VIEW HISTORY</span></summary>'+
      '<div class="so-history-list">'+state.sold.slice(-5).reverse().map(v=>
        '<div class="so-history-row"><div><strong>'+esc(v.title)+'</strong>'+
        '<small>DAY '+v.day+' · '+esc(v.color||'COLOUR NOT RECORDED')+'</small></div>'+
        '<span>SALE '+cash(v.price)+'</span><span>GROSS '+cash(v.profit)+'</span></div>'
      ).join('')+'</div></details>';
  }
  function render(state,E,{selectedId=null,filter='all'}={}){
    const s=snapshot(state,E),f=FILTERS.includes(filter)?filter:'all';
    const stats=E.customers.stats(state,state.monthPlan.startDay,state.day);
    const top='<div class="so-kpis">'+[
      ['ADVERTISED VEHICLES',s.rows.length],['ACTIVE CUSTOMER CASES',s.live],
      ['ACTION REQUIRED',s.attention],['HELD DEPOSITS',cash(s.held)]
    ].map(([name,value])=>
      '<div><small>'+name+'</small><strong>'+value+'</strong></div>').join('')+'</div>'+
      '<div class="so-activity">THIS MONTH · '+stats.enquiries+' RECORDED ENQUIRIES · '+
      stats.appointments+' VIEWINGS BOOKED · '+stats.testDrives+' TEST DRIVES · '+
      stats.completedSales+' COMPLETED HANDOVERS</div>';
    if(!s.rows.length)return {selectedId:null,html:top+
      '<div class="trade-empty so-empty"><h2>NO CARS ADVERTISED.</h2>'+
      '<p>Prepare a vehicle, pass workshop quality control, then set the retail price in Vehicle Stock.</p>'+
      '<button type="button" class="trade-button" data-page="stock">OPEN VEHICLE STOCK</button></div>'+
      history(state)};
    const filterDefs=[['all','ALL VEHICLES',s.rows.length],
      ['action','ACTION REQUIRED',s.attention],
      ['appointments','APPOINTMENTS',s.appointments],
      ['deposits','DEPOSIT HELD',s.deposits]];
    const toolbar='<div class="so-toolbar"><strong>RETAIL CASE REGISTER</strong>'+
      '<div class="so-filters" role="group" aria-label="Filter retail sales cases">'+
      filterDefs.map(([key,label,n])=>
        '<button type="button" data-action="filter-sales" data-filter="'+key+
        '" aria-pressed="'+String(key===f)+'">'+label+' <b>'+n+'</b></button>').join('')+'</div></div>';
    const filtered=s.rows.filter(r=>f==='all'||(f==='action'?r.caseData.actionable:
      f==='appointments'?r.caseData.c?.status==='booked':
      r.caseData.c?.held>0)).slice().sort((a,b)=>{
        const p=x=>x.caseData.actionable?0:x.caseData.c?.held>0?1:
          x.caseData.c?.status==='booked'?2:3;
        return p(a)-p(b)||a.vehicle.listedDay-b.vehicle.listedDay||
          a.vehicle.id-b.vehicle.id;
      });
    const selected=filtered.find(r=>r.vehicle.id===selectedId)||filtered[0]||null;
    const list=filtered.length?filtered.map(r=>unit(state,r,r.vehicle.id===selected?.vehicle.id)).join(''):
      '<p class="so-empty-filter">No vehicles match this filter. Select All Vehicles to review the full register.</p>';
    const deadline=E.events.isDealDay(state.day)?
      '<div class="so-deal-day">DEAL DAY · '+esc(E.events.outlook(state).label)+
      ' · '+esc(E.events.dealSession(state).time)+
      ' — Walk-in enquiries can change between sessions.</div>':'';
    return {selectedId:selected?.vehicle.id??null,html:top+deadline+toolbar+
      '<div class="so-layout"><aside class="so-register" aria-label="Advertised vehicle and customer cases">'+
      '<header>ADVERTISED STOCK <span>'+filtered.length+' SHOWN</span></header>'+
      '<div class="so-register-list">'+list+'</div></aside>'+
      (selected?details(state,E,selected):
        '<div class="so-file so-empty-filter">No selected customer case.</div>')+'</div>'+
      history(state)};
  }
  window.MotorTradeCustomersView=Object.freeze({render,FILTERS,lead,snapshot});
})();
