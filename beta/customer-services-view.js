'use strict';
/* NextGen Sessions Motor Trade UK2026: external customer-service booking desk. */
(() => {
  const S=window.MotorTradeServiceDesk;
  const W=window.MotorTradeWorkshop;
  if(!S||!W)throw Error('Load customer-services.js and workshop.js before services view');
  const money=n=>'£'+Number(n).toLocaleString('en-GB');
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(state){
    const m=S.summary(state),leadList=S.leads(state);
    const reserved=W.reserved(state)+(state.premises?.arrears||0);
    const kpi='<div class="service-metrics">'+[
      ['ENQUIRIES TODAY',m.leads],['ACTIVE CUSTOMER JOBS',m.booked],
      ['COMPLETED JOBS',m.completed],['CUSTOMER HAPPINESS',m.customerHappiness],
      ['REFERRAL / SERVICE CASH SPREAD',money(m.earned)]
    ].map(([k,v])=>'<div><small>'+k+'</small><strong>'+esc(v)+'</strong></div>').join('')+'</div>';
    const leads=leadList.map(l=>{
      const remaining=state.cash-reserved,blocked=l.supplier>remaining;
      const afterVat=l.gross-l.supplier-Math.ceil(l.gross/6);
      return '<article class="service-offer"><div><small>CUSTOMER ENQUIRY · '+esc(l.id)+'</small>'+
        '<h3>'+esc(l.label)+'</h3><p>'+esc(l.description)+'</p>'+
        '<p class="service-legal">'+esc(l.feeNote)+'</p></div>'+
        '<div class="service-price"><span>'+money(l.gross)+' RECEIVED AT COMPLETION</span>'+
        '<small>SUPPLIER OUTLAY '+money(l.supplier)+' NOW · EST. '+money(afterVat)+
        ' CONTRIBUTION AFTER OUTPUT VAT (BEFORE OVERHEADS)</small>'+
        '<button type="button" data-action="book-service-lead" data-lead="'+esc(l.id)+'"'+
        (blocked?' disabled':'')+'>BOOK EXTERNAL JOB</button></div></article>';
    }).join('');
    const active=(state.serviceDesk?.jobs||[]).filter(j=>j.status==='booked');
    const recent=(state.serviceDesk?.jobs||[]).filter(j=>j.status!=='booked').slice(-12).reverse();
    const activeHtml=active.length?active.map(j=>
      '<div class="service-job"><strong>'+esc(j.label)+' · JOB '+j.id+'</strong>'+
      '<span>BOOKED DAY '+j.day+' · PROMISED DAY '+j.dueDay+
      ' · SUPPLIER COST '+money(j.supplier)+'</span></div>').join(''):
      '<p class="service-empty">No customer jobs currently with subcontractors.</p>';
    const historyHtml=recent.length?recent.map(j=>
      '<div class="service-job"><strong>'+esc(j.label)+' · '+(j.status==='completed'?'COMPLETED':'FAILED QC')+'</strong>'+
      '<span>DAY '+j.doneDay+' · '+(j.status==='completed'?'RECEIVED '+money(j.gross):'NO CUSTOMER RECEIPT')+
      ' · RATING '+j.rating+'/5'+(j.late?' · LATE':' · ON TIME')+'</span></div>').join(''):
      '<p class="service-empty">No jobs completed yet. Completed work appears here as you advance game days.</p>';
    return '<div class="service-desk">'+kpi+
      '<section><h2>TODAY\'S CUSTOMER SERVICE ENQUIRIES</h2>'+
      '<p class="service-explain">These enquiries are independent of your used-car display. Book an actual third-party job; supplier cash is paid now and the customer or partner pays only on successful completion. Jobs take game days. Poor quality and delays reduce happiness and reputation.</p>'+
      (leads||'<p class="service-empty">All available enquiries for today have been handled. New enquiries arrive the next game day.</p>')+'</section>'+
      '<section><h2>BOOKED / IN PROGRESS</h2>'+activeHtml+'</section>'+
      '<section><h2>RECENT COMPLETIONS AND CUSTOMER RATINGS</h2>'+historyHtml+'</section>'+
      '<p class="service-explain"><strong>UK legal model:</strong> MOTs are undertaken by DVSA-approved test stations; the £45 example MOT test fee is paid directly to the station (below the £54.85 car limit), not invoiced by your dealership. End-of-life cars go directly to licensed ATFs; the ATF pays the owner by bank or cheque and handles any Certificate of Destruction. Your dealership only earns a simulated taxable referral commission. No real MOT licence or ATF authorisation is implied.</p></div>';
  }
  window.MotorTradeServiceDeskView=Object.freeze({render});
})();