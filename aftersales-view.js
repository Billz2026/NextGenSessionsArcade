'use strict';
/* 2026 consumer aftersales case desk. Every displayed liability is sourced
 * from the saved case book. There are no automatic waivers of statutory rights.
 */
(() => {
  const esc=x=>String(x).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const money=n=>new Intl.NumberFormat('en-GB',{
    style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  const labels={
    open:'CUSTOMER COMPLAINT — ACTION NEEDED',
    repairing:'REPAIR AUTHORISED — IN PROGRESS',
    'repair-failed':'REPAIR FAILED — FINAL REMEDY',
    resolved:'REPAIR COMPLETED',
    'refund-due':'ACCEPTED REFUND — PAYMENT OWED',
    refunded:'REFUNDED — RETURNED VEHICLE'
  };
  function render(state,E){
    const A=E.aftersales;
    if(!A.enabled(state))return '<section class="so-policy">'+
      '<h3>AFTERSALES / CONSUMER REMEDIES</h3>'+
      '<p>Your original career is running its established simplified economy. The new 2026 Independent Dealer career has a separate aftersales and Consumer Rights Act scenario. No historical faults or refunds have been invented in this existing save.</p>'+
      '</section>';
    const cases=state.aftersales.cases.slice().sort((a,b)=>
      ['refund-due','repair-failed','open','repairing','resolved','refunded'].indexOf(a.status)-
      ['refund-due','repair-failed','open','repairing','resolved','refunded'].indexOf(b.status));
    const pending=A.pendingRefunds(state);
    const open=cases.filter(c=>!['resolved','refunded'].includes(c.status)).length;
    const settled=cases.filter(c=>c.status==='refunded').length;
    let html='<section class="so-policy"><h2>AFTERSALES & CUSTOMER REMEDIES</h2>'+
      '<p>Dealer obligations survive handover and are not removed by a warranty exclusion. Faults are generated selectively from fictional delivered vehicles, not every sale. Confirm defects, repair without significant inconvenience or accept a legally appropriate rejection. This scenario deliberately refunds the full retail consideration on rejected cars; it does not impose an automatic mileage-use deduction.</p>'+
      '<div class="so-policy"><strong>OPEN CASES '+open+'</strong> · REFUNDS COMPLETED '+settled+
        ' · AGREED REFUNDS & COLLECTION OWED '+money(pending)+'</div>';
    if(!cases.length)html+='<p>No aftersales complaints reported yet. A qualifying fault may emerge after delivery. Cash reserves should allow for this risk.</p>';
    for(const c of cases){
      const sale=A.saleFor(state,c.saleId),days=state.day-sale.day;
      const overdue=c.status==='refund-due'&&state.day>c.refundDueDay;
      const right=c.phase==='short-term-rejection'?
        'First 30 days: short-term rejection may be available for a proven non-conforming car. Repair cannot be forced.':
        c.phase==='six-month-presumption'?
          'After 30 days / first six months: presumed delivery fault unless rebutted; repair usually offered first. A failed repair may lead to final rejection.':
          'Later claim: age, mileage, evidence and cause must be reviewed; the game cannot decide liability automatically.';
      html+='<article class="so-policy" aria-label="Consumer claim '+c.id+'">'+
        '<h3>CLAIM '+c.id+' · '+esc(c.title)+'</h3>'+
        '<p><strong>'+esc(labels[c.status])+'</strong> · Day '+c.openedDay+
          ' reported · '+days+' game days since handover</p>'+
        '<p>'+esc(c.issue)+'. Indicative independent-garage remedial job card: <strong>'+
          money(c.quote)+'</strong> including labour, parts and VAT. '+
          'This game complaint represents an assumed inherent problem; actual used-car rights depend on the evidence, age and disclosed condition.</p>'+
        '<p>'+esc(right)+'</p>';
      if(c.status==='open'){
        html+='<button type="button" class="trade-button" data-action="aftersales-repair" data-id="'+c.id+
          '">AUTHORISE REMEDIAL REPAIR · '+money(c.quote)+'</button>'+
          '<button type="button" class="trade-button trade-button-outline" data-action="aftersales-refund" data-id="'+c.id+
          '">ACCEPT FULL '+(c.phase==='short-term-rejection'?'SHORT-TERM REJECTION':'GOODWILL REFUND')+
          ' · '+money(sale.price)+'</button>';
      }
      if(c.status==='repairing')html+='<p>Outsourced garage completion due Day '+c.repairDoneDay+
        '. Customer should not be charged for a qualifying repair.</p>';
      if(c.status==='repair-failed')html+='<button type="button" class="trade-button" data-action="aftersales-refund" data-id="'+c.id+
        '">ACCEPT FINAL REJECTION · '+money(sale.price)+'</button>'+
        '<p>One genuine repair attempt failed. Do not demand unlimited repeat repairs.</p>';
      if(c.status==='refund-due')html+='<p'+(overdue?' class="sd-issue"':'')+
        '>Full customer refund '+money(c.refundAmount)+' plus dealer-paid collection '+
        money(c.collectionCost)+' is accepted and must be settled without undue delay. '+
        (overdue?'**OVERDUE** — ':'')+'Latest modelled payment Day '+c.refundDueDay+
        '. The business pays automatically when liquid funds cover both. Insufficient cash does not cancel the debt.'+
        (c.cashEquivalentConsent?' The fictional customer expressly agreed a cash-equivalent return of their original part-exchange allowance.':'')+
        '</p>';
      if(c.status==='refunded')html+='<p>Full refund paid. VAT output was reversed by '+
        E.vat.pence(c.creditedVatPence)+'. Returned vehicle #'+c.returnedVehicleId+
        (c.heldReturned?' remains held offsite because the forecourt is full.':' is back in the stock / workshop system.')+'</p>'+
        (c.heldReturned?'<button type="button" class="trade-button" data-action="aftersales-recover" data-id="'+c.id+
          '">TRANSFER RETURNED VEHICLE TO FORECOURT</button>':'');
      html+='</article>';
    }
    return html+'<details class="so-policy"><summary>CONSUMER RIGHTS AND SIMULATION LIMITS</summary>'+
      '<p>Under the Consumer Rights Act 2015, short-term rejection generally applies within 30 days for non-conforming goods; repair/replacement can suspend that period. Within six months inherent defects are generally presumed to have existed at delivery unless the seller proves otherwise. One failed repair or unreasonable delay may trigger a final rejection/price reduction. Motor vehicles may permit a reasonable use deduction on final rejection; this pilot elects no deduction, as dealer goodwill. Refunds must be made without undue delay and within 14 days after the trader agrees entitlement. The dealer normally bears reasonable return/collection costs. Claims after six months, finance-funded/HP contracts, deductions for use, legal adjudication, credit notes, original part-exchange return and full warranty underwriting still require further work. Warranty restrictions cannot remove statutory rights.</p>'+
      '</details></section>';
  }
  window.MotorTradeAftersalesView=Object.freeze({render});
})();
