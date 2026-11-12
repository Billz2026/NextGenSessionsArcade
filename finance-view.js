'use strict';
/* v0.9.27 — Read-only business finance desk.
 * Distinguishes cash, earmarked reserves, stock investment, held deposits,
 * overdue obligations, gross trading margin and operating contribution.
 * No new saved fields and no new economic transactions.
 */
(() => {
  const money=n=>new Intl.NumberFormat('en-GB',{
    style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  const esc=x=>String(x).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const FILTERS=Object.freeze(['all','in','out','noncash']);
  const signed=n=>(n>0?'+':'')+money(n);
  const tone=n=>n<0?' fin-negative':n>0?' fin-positive':'';
  function snapshot(state,E){
    const r=E.monthly.statement(state);
    const reserved=E.workshop.reserved(state);
    const staffDaily=state.staff.reduce((n,v)=>n+E.people.dailyCost(v),0);
    const premisesDaily=E.premises.costs(state).total;
    const arrears=state.payrollArrears+(state.premises?.arrears||0);
    const held=E.customers.heldDeposits(state);
    const auction=state.auctionHall;
    const lot=auction?.phase==='payment'?E.auctionLot(state):null;
    const auctionFee=lot?E.auctionFee(state,lot,auction.currentBid):null;
    const auctionInvoice=lot&&auctionFee!==null?auction.currentBid+auctionFee:0;
    return {cash:state.cash,reserved,afterReserve:state.cash-reserved,
      stock:r.stockCapital,held,arrears,staffDaily,premisesDaily,
      dailyCommitment:staffDaily+premisesDaily,
      grossLifetime:E.totalMargin(state),lifetimeSales:state.sales,
      auctionInvoice,report:r,
      cashReconciles:r.openingCash+r.cashIn-r.cashOut===state.cash};
  }
  function tile(label,number,sub,extra=''){
    return '<div class="fin-tile'+extra+'"><small>'+esc(label)+'</small>'+
      '<strong>'+esc(number)+'</strong><span>'+esc(sub)+'</span></div>';
  }
  function line(label,number,extra=''){
    return '<div class="fin-pair'+extra+'"><span>'+esc(label)+'</span>'+
      '<strong>'+esc(number)+'</strong></div>';
  }
  function summary(state,E){
    const x=snapshot(state,E),r=x.report;
    const month='MONTH '+r.month+' · DAYS '+r.startDay+'–'+r.endDay;
    const noRepairReserve=x.reserved===0;
    const workingLabel=noRepairReserve?'WORKING CASH AVAILABLE':'CASH AFTER REPAIR RESERVES';
    const workingDetail=noRepairReserve?'No workshop funds reserved · before upcoming bills':
      'After earmarked repairs · before upcoming bills';
    const operatingDetail=r.operatingContribution<0?
      'NEGATIVE THIS MONTH · After staff and premises costs':
      r.operatingContribution>0?
        'POSITIVE THIS MONTH · After staff and premises costs':
        'BREAK-EVEN SO FAR · After staff and premises costs';
    const top='<div class="fin-primary">'+
      tile('CASH BALANCE',money(x.cash),'Dealership cash held today · includes repair reserves',' fin-tile-hero')+
      tile(workingLabel,money(x.afterReserve),workingDetail,
        x.afterReserve<0?' fin-tile-alert':'')+
      tile('INVESTED IN UNSOLD VEHICLES',money(x.stock),
        state.vehicles.length+' vehicle'+(state.vehicles.length===1?'':'s')+' still owned')+
      tile('MONTH OPERATING CONTRIBUTION',money(r.operatingContribution),operatingDetail,
        r.operatingContribution<0?' fin-tile-loss':'')+
      '</div>';
    const cashflow='<section class="fin-panel fin-cashflow"><div class="fin-panel-head">'+
      '<div><small>'+month+'</small><h3>WHERE YOUR CASH WENT</h3></div>'+
      '<button type="button" class="fin-text-button" data-page="reports">FULL MONTHLY REPORT</button></div>'+
      '<div class="fin-flow">'+
      '<div><small>MONTH START</small><strong>'+money(r.openingCash)+'</strong></div>'+
      '<span aria-hidden="true">+</span>'+
      '<div><small>CASH RECEIVED</small><strong class="fin-positive">'+money(r.cashIn)+'</strong></div>'+
      '<span aria-hidden="true">−</span>'+
      '<div><small>CASH PAID OUT</small><strong class="fin-negative">'+money(r.cashOut)+'</strong></div>'+
      '<span aria-hidden="true">=</span>'+
      '<div class="fin-flow-total"><small>CASH NOW</small><strong>'+money(x.cash)+'</strong></div>'+
      '</div>'+
      '<div class="fin-flow-footer"><span>NET CASH CHANGE <b class="'+tone(r.netCashChange)+'">'+
      signed(r.netCashChange)+'</b></span><span>'+r.soldUnits+' / '+r.targetUnits+
      ' VEHICLES SOLD TOWARDS MONTHLY TARGET</span></div></section>';
    const notice=x.arrears?
      '<p class="fin-warning">UNPAID BILLS: '+money(x.arrears)+
        ' of staff or premises obligations remain outstanding.</p>':'';
    const auctionNotice=x.auctionInvoice?
      '<p class="fin-warning">AUCTION INVOICE PENDING: '+money(x.auctionInvoice)+
        ' must be settled separately before further buying.</p>':'';
    const commitments='<section class="fin-panel"><div class="fin-panel-head"><div>'+
      '<small>CASH COMMITMENTS</small><h3>WHAT IS ALREADY SPOKEN FOR?</h3></div>'+
      '<button type="button" class="fin-text-button" data-page="workshop">WORKSHOP</button></div>'+
      line('Workshop cash earmarked',money(x.reserved))+
      line('Wages per game day',money(x.staffDaily))+
      line(state.financialScenario==='uk2026'?'Core operating expense per day':'Premises per game day',money(x.premisesDaily))+
      (state.financialScenario==='uk2026'?line('Cash overhead budget per 30 days',money(E.premises.costs(state).monthlyCashGuide)):'')+
      line('Outstanding bills',money(x.arrears),x.arrears?' fin-due':'')+
      notice+auctionNotice+
      '<p class="fin-detail">Repair reserves are still included in your cash balance. Daily costs are future expenses, not money deducted twice.</p>'+
      '</section>';
    const performance='<section class="fin-panel"><div class="fin-panel-head"><div>'+
      '<small>TRADING & CUSTOMER FUNDS</small><h3>WHAT YOU HAVE EARNED</h3></div>'+
      '<button type="button" class="fin-text-button" data-page="stock">VIEW STOCK</button></div>'+
      line('Completed retail handovers',String(x.lifetimeSales))+
      line('Realised gross trade margin',money(x.grossLifetime),x.grossLifetime<0?' fin-due':'')+
      line('Customer deposits held separately',money(x.held))+
      line('This month gross trade margin',money(r.grossMargin))+
      '<p class="fin-detail">Gross margin is not cash in the bank or net profit. Deposits are held outside dealership cash until handover.</p>'+
      '</section>';
    const opening=state.startupAccounts;
    const openingPanel=opening?'<section class="fin-panel"><div class="fin-panel-head"><div>'+
      '<small>DAY-ZERO FUNDING</small><h3>HOW THIS BUSINESS WAS FUNDED</h3></div></div>'+
      line('Owner contributed capital',money(opening.ownerCapital))+
      line('Premises security deposit (asset)',money(opening.premisesDeposit))+
      line('Annual insurance prepaid (asset)',money(opening.prepaidInsurance))+
      line('Fixtures and equipment (asset)',money(opening.fixtures))+
      line('One-off launch expense',money(opening.launchExpense))+
      line('Opening bank cash',money(opening.openingBank))+
      '<p class="fin-detail">These pre-opening transactions are held in the career opening balance sheet, not posted as Month 1 sales or recurring charges. Annual insurance is expensed gradually without paying it twice. Future tax and depreciation accounting remains simplified.</p>'+
      '</section>':'';
    const footer='<p class="fin-disclosure">Simulation figures only. Operating contribution is not statutory net profit: VAT, tax, finance, depreciation, warranties and other consumer liabilities are not fully modelled.</p>';
    return {snapshot:x,html:top+openingPanel+cashflow+'<div class="fin-secondary">'+
      commitments+performance+'</div>'+footer};
  }
  function category(note){
    if(/^(Retail |Customer deposit applied|Customer-specific |Fair cancellation)/.test(note))return 'CUSTOMER / SALE';
    if(/^(Auction purchase|Direct purchase|Part-exchange acquisition|Pre-purchase inspection)/.test(note))return 'VEHICLE BUYING';
    if(/^(Workshop |Preparation and inspection)/.test(note))return 'WORKSHOP';
    if(/^(Staff |Sales commission|Recruitment )/.test(note))return 'STAFF';
    if(/^Premises /.test(note))return 'PREMISES';
    return 'OTHER';
  }
  function rows(state,filter){
    const f=FILTERS.includes(filter)?filter:'all';
    return [...state.ledger].reverse().filter(row=>f==='all'||(
      f==='in'?row.delta>0:f==='out'?row.delta<0:row.delta===0));
  }
  function ledger(state,{filter='all',expanded=false}={}){
    const f=FILTERS.includes(filter)?filter:'all';
    const all=rows(state,f),visible=expanded?all:all.slice(0,6);
    const count=f==='all'?state.ledger.length:all.length;
    const tabs=[['all','ALL ENTRIES'],['in','MONEY IN'],['out','MONEY OUT'],['noncash','NON-CASH']];
    const controls='<div class="fin-ledger-top"><div><small>ALL RECONCILED TRANSACTIONS</small>'+
      '<h3>TRANSACTION HISTORY</h3></div><div class="fin-ledger-filters" role="group" aria-label="Filter financial transactions">'+
      tabs.map(([key,label])=>'<button type="button" data-action="filter-ledger" data-filter="'+key+
        '" aria-pressed="'+String(f===key)+'">'+label+'</button>').join('')+'</div></div>';
    const entries=visible.length?visible.map(entry=>
      '<div class="fin-entry"><time>DAY '+String(entry.day).padStart(2,'0')+'</time>'+
      '<div class="fin-entry-desc"><small>'+category(entry.note)+'</small><span>'+esc(entry.note)+'</span></div>'+
      '<strong class="'+(entry.delta>0?'fin-positive':entry.delta<0?'fin-negative':'fin-neutral')+'">'+
        (entry.delta===0?'£0 · NON-CASH':(entry.delta>0?'+':'−')+money(Math.abs(entry.delta)))+
      '</strong></div>').join(''):
      '<p class="fin-ledger-empty">'+(state.ledger.length?
        'No transactions match this filter.':'No transactions recorded yet. Your opening cash was '+
        money(state.cash)+'.')+'</p>';
    const toggle=all.length>6?'<button type="button" class="fin-show-more" data-action="toggle-ledger" '+
      'aria-expanded="'+String(expanded)+'">'+
      (expanded?'SHOW RECENT 6 ENTRIES':'VIEW ALL '+count+' ENTRIES')+'</button>':'';
    return {controls,html:entries+'<div class="fin-ledger-bottom">'+
      '<span>SHOWING '+visible.length+' OF '+count+' ENTRIES</span>'+toggle+'</div>'};
  }
  window.MotorTradeFinanceView=Object.freeze({snapshot,summary,ledger,FILTERS});
})();