'use strict';
/* The Motor Trade v0.9 — customer-case retail sales board. */
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
        '<div class="sales-case-highlight"><strong>NEW CUSTOMER ENQUIRY</strong>'+
        '<p>A customer is interested in this advertised vehicle. Contact them to establish their requirements.</p>'+
        '<button type="button" class="trade-button" data-action="open-customer" data-id="'+id+
        '">CONTACT ENQUIRY →</button></div>':
        '<div class="sales-case-quiet"><strong>NO ACTIVE RETAIL ENQUIRIES</strong>'+
        '<p>No customer wants to proceed with this particular car right now. Interest may change on another game day'+
        (E.events.isDealDay(state.day)?' or Deal Day session':'')+
        '. Review price and stock age; nothing is guaranteed.</p></div>';
    }
    const who='<div class="sales-customer-meta"><span>'+esc(c.name)+'</span>'+
      '<span>'+esc(c.channel)+'</span><span>'+esc(statuses[c.status])+'</span></div>';
    const cancel='<button type="button" class="trade-button trade-button-outline" data-action="cancel-customer" data-id="'+id+
      '">DEALERSHIP CANCELS / REFUND</button>';
    const buyerWithdraw='<button type="button" class="trade-button trade-button-secondary" data-action="customer-withdrawal" data-id="'+id+
      '">CUSTOMER CHANGES MIND</button>';
    let body='';
    switch(c.status){
      case 'enquiry':
        body='<p>'+esc(c.name)+' has enquired about this car. They have not inspected or test driven it yet.'+
          ' Book a viewing; there is a possibility they will not attend.</p>'+
          '<button type="button" class="trade-button" data-action="book-customer" data-id="'+id+
          '">BOOK VIEWING →</button> '+cancel;
        break;
      case 'booked':
        body='<p>Customer viewing booked for <strong>GAME DAY '+c.appointmentDay+
          '</strong>. The appointment may be attended, cancelled or missed. You cannot sell to them yet.</p>'+cancel;
        break;
      case 'arrived':
        body='<p>Customer has arrived to inspect the vehicle. A test drive can reveal objections that prevent a sale.</p>'+
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
          '<section class="sales-offer-mode"><h4>NO PART-EXCHANGE</h4>'+
          '<p>This customer has not offered a trade-in. Do not assume every buyer has one.</p></section>';
        body='<p>The test drive went well. Discuss a realistic cash price or trade-in allowance; there is no completed sale until handover.</p>'+
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
          '<p>Collection booked for <strong>DAY '+c.collectionDay+'</strong>. '+
          'Additional customer-specific preparation charged: '+cash(c.prepCost||0)+'. '+
          'Buyer withdrawal can result in fair retention against these recorded costs; dealer fault means a full deposit refund. '+
          'No revenue or completed vehicle sale is recorded until handover.</p></div>'+buyerWithdraw+' '+cancel;
        break;
      case 'collectable':
        body='<div class="sales-case-highlight"><h4>CUSTOMER READY TO COLLECT</h4>'+
          '<div class="sales-payment-breakdown">'+
          '<span>Agreed sale price</span><strong>'+cash(c.price)+'</strong>'+
          '<span>Part-exchange allowance</span><strong>'+cash(c.allowance||0)+'</strong>'+
          '<span>Deposit already paid</span><strong>'+cash(c.held)+'</strong>'+
          '<span>BALANCE TO COLLECT TODAY</span><strong>'+cash(C.balanceDue(c))+'</strong></div>'+
          '<p>'+esc(c.name)+' is collecting. Receive only the remaining balance. The previously held deposit transfers to the sale ledger without being charged twice.</p>'+
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
  function render(state,E){
    const C=E.customers,month=state.monthPlan,stats=C.stats(state,month.startDay,state.day);
    const listed=state.vehicles.filter(v=>v.status==='listed');
    const active=Object.values(state.customerCases).filter(c=>c.status!=='lost');
    const held=C.heldDeposits(state);
    const top='<div class="sales-pipeline-summary">'+
      [['CARS ADVERTISED',listed.length],['OPEN CUSTOMER CASES',active.length],
      ['APPOINTMENTS BOOKED',active.filter(c=>c.status==='booked').length],
      ['HELD CUSTOMER DEPOSITS',cash(held)]].map(([label,value])=>
        '<div><small>'+label+'</small><strong>'+value+'</strong></div>').join('')+'</div>'+
      '<p class="sales-pipeline-note">Appointments, test drives and negotiations may fail. '+
      'Deposits are part-payment, held in a separate customer account until collection. '+
      'Buyer cancellations can lose a fair portion linked to actual extra costs, not automatically the full amount; dealer fault requires a refund. The remaining cash balance is collected on handover.</p>'+
      '<div class="sales-pipeline-activity">THIS MONTH · '+stats.enquiries+' ENQUIRIES · '+
      stats.appointments+' APPOINTMENTS · '+stats.noShows+' NO-SHOWS · '+
      stats.testDrives+' TEST DRIVES · '+stats.completedSales+' COMPLETED SALES</div>';
    const soldCards=state.sold.slice(-4).reverse().map(v=>
      '<article class="vehicle-sold-card">'+VC.photo(v,'sold')+
      '<div class="vehicle-sold-copy"><h4>'+esc(v.title)+'</h4>'+
      '<span>'+esc(v.color||'Colour unverified')+' · Sold day '+v.day+'</span>'+
      '<div class="sales-payment-breakdown">'+
      '<span>Completed sale</span><strong>'+cash(v.price)+'</strong>'+
      '<span>Deposit already paid</span><strong>'+cash(v.depositApplied||0)+'</strong>'+
      '<span>Final balance received</span><strong>'+cash(v.customerBalancePaid??v.price)+'</strong>'+
      '<span>Gross vehicle margin</span><strong>'+cash(v.profit)+'</strong>'+
      '</div></div></article>').join('');
    const salesHistory=soldCards?'<section class="sales-sold-recent"><h3>RECENT COMPLETED HANDOVERS</h3>'+
      '<div class="sales-sold-grid">'+soldCards+'</div></section>':'';
    if(!listed.length)return top+'<div class="trade-empty"><h2>NO CARS READY FOR RETAIL.</h2>'+
      '<p>Assess, repair, pass quality control and advertise a vehicle before expecting customer enquiries.</p>'+
      '<button type="button" class="trade-button" data-page="stock">OPEN VEHICLE STOCK →</button></div>'+salesHistory;
    const deadline=E.events.isDealDay(state.day);
    const header=deadline?'<div class="deadline-retail-intro"><strong>DEAL DAY · '+
      esc(E.events.outlook(state).label)+' · '+esc(E.events.dealSession(state).time)+
      '</strong><p>Walk-in customers may arrive without appointments, but test drives, negotiations and handovers still matter. '+
      'Unfinished walk-in cases expire when the next session begins.</p></div>':'';
    return top+header+'<div class="sales-case-grid">'+listed.map(v=>
      '<article class="trade-card sales-case-card">'+
      VC.heading(v,C.caseFor(state,v.id)?.held?'reserved':'stock',
        'STOCK '+v.id+' · '+Math.max(0,state.day-v.listedDay)+' DAYS ADVERTISED')+
      '<div class="trade-pricing"><div><small>YOUR ASKING PRICE</small><strong>'+cash(v.asking)+
      '</strong></div><div><small>BUY / PREP COST</small><strong>'+cash(v.cost+v.prepSpent)+
      '</strong></div><div><small>LIKELY SALE GUIDE</small><strong>'+
      cash(v.profile?.likelySale||v.retail)+'</strong></div></div>'+
      actions(state,v,E)+'</article>').join('')+'</div>'+salesHistory;
  }
  window.MotorTradeCustomersView=Object.freeze({render});
})();