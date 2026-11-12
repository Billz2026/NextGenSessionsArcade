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
    const transport=lot?E.auctionTransport(state,lot):null;
    const auctionInvoice=lot&&auctionFee!==null&&transport?auction.currentBid+auctionFee+transport.gross:0;
    const vat=E.vat;
    const vatOutstanding=vat.enabled(state)?vat.outstandingPence(state):0;
    const vatReserve=Math.ceil(vatOutstanding/100);
    const employment=E.employment.liabilities(state);
    const currentGross=state.payroll2026?
      Object.values(state.payroll2026.earnings).reduce((n,e)=>
        n+e.salary+e.commission+(e.notice||0),0):0;
    const refundLiability=E.aftersales.pendingRefunds(state);
    const heldReturns=E.aftersales.enabled(state)?
      state.aftersales.cases.filter(x=>x.heldReturned).reduce((n,x)=>
        n+x.heldReturned.cost,0):0;
    return {cash:state.cash,reserved,vatOutstanding,vatReserve,
      employment,currentGross,refundLiability,heldReturns,
      afterReserve:state.cash-reserved-vatReserve-employment.total-refundLiability,
      stock:r.stockCapital+heldReturns,held,arrears,staffDaily,premisesDaily,
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
    const is2026=state.financialScenario==='uk2026';
    const modernPayroll=E.employment.is2026(state);
    const workingLabel=E.aftersales.enabled(state)?'CASH AFTER REPAIR, VAT, PAYROLL & REFUND RESERVES':
      modernPayroll?'CASH AFTER REPAIR, VAT & PAYROLL RESERVES':
      is2026?'CASH AFTER REPAIR & VAT RESERVES':
      noRepairReserve?'WORKING CASH AVAILABLE':'CASH AFTER REPAIR RESERVES';
    const workingDetail=E.aftersales.enabled(state)?'Less repair, tax, payroll and agreed customer-refund liabilities':
      modernPayroll?'Less booked repairs, accrued VAT and due payroll liabilities; before ordinary bills':
      is2026?'Less booked repair reserves and accrued output VAT; before routine bills':
      noRepairReserve?'No workshop funds reserved · before upcoming bills':
        'After earmarked repairs · before upcoming bills';
    const contribution=is2026?r.operatingAfterVat:r.operatingContribution;
    const operatingDetail=contribution<0?
      'NEGATIVE THIS MONTH · After staff, core costs and provisional VAT output':
      contribution>0?
        'POSITIVE THIS MONTH · After staff, core costs and provisional VAT output':
        'BREAK-EVEN SO FAR · Before unmodelled business liabilities';
    const top='<div class="fin-primary">'+
      tile('CASH BALANCE',money(x.cash),'Dealership cash held today · includes repair reserves',' fin-tile-hero')+
      tile(workingLabel,money(x.afterReserve),workingDetail,
        x.afterReserve<0?' fin-tile-alert':'')+
      tile('INVESTED IN UNSOLD VEHICLES',money(x.stock),
        (state.vehicles.length+(E.aftersales.enabled(state)?state.aftersales.cases.filter(k=>k.heldReturned).length:0))+
        ' vehicle assets still owned (including any offsite consumer returns)')+
      tile(is2026?'MONTH CONTRIBUTION AFTER OUTPUT VAT':'MONTH OPERATING CONTRIBUTION',money(contribution),operatingDetail,
        contribution<0?' fin-tile-loss':'')+
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
      '<p class="fin-warning">AUCTION PAYMENT PENDING: '+money(x.auctionInvoice)+
        ' includes hammer, buyer fee and simulated outsourced transport where applicable.</p>':'';
    const commitments='<section class="fin-panel"><div class="fin-panel-head"><div>'+
      '<small>CASH COMMITMENTS</small><h3>WHAT IS ALREADY SPOKEN FOR?</h3></div>'+
      '<button type="button" class="fin-text-button" data-page="workshop">WORKSHOP</button></div>'+
      line('Workshop cash earmarked',money(x.reserved))+
      (is2026?line('Accrued output VAT protected',E.vat.pence(x.vatOutstanding)): '')+
      (E.aftersales.enabled(state)?
        line('Accepted customer refunds & collection owed',money(x.refundLiability),
          x.refundLiability?' fin-due':'')+
        line('Returned cars held offsite (capital value)',money(x.heldReturns)):'')+
      line(modernPayroll?'Base wage accrual / day (indicative)':'Wages per game day',money(x.staffDaily))+
      (modernPayroll?
        line('Current calendar-month wages accrued',money(x.currentGross))+
        line('Net salaries awaiting payment',money(x.employment.wages),
          x.employment.wages?' fin-due':'')+
        line('PAYE + employer NI awaiting remittance',money(x.employment.hmrc))+
        line('Pension provider contribution outstanding',money(x.employment.pension))+
        line('Total due payroll liabilities',money(x.employment.total),
          x.employment.total?' fin-due':'')+
        line('Employment expense accrued in game month',money(r.staffCosts)):'')+
      line(state.financialScenario==='uk2026'?'Core operating expense per day':'Premises per game day',money(x.premisesDaily))+
      (state.financialScenario==='uk2026'?line('Cash overhead budget per 30 days',money(E.premises.costs(state).monthlyCashGuide)):'')+
      line('Outstanding bills',money(x.arrears),x.arrears?' fin-due':'')+
      notice+auctionNotice+
      '<p class="fin-detail">Repair reserves remain within the bank balance. For the new 2026 scenario, PAYE, pension and employer NI have their own remittance obligations after wages are paid; the outstanding balances are protected above. Future unaccrued salaries remain a forecast, not a cash debit.</p>'+
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
    const vat=E.vat;
    const nowDue=vat.enabled(state)?vat.maturedPence(state):0;
    const rolling=vat.rollingTurnover(state);
    const upcoming=vat.enabled(state)?vat.entries(state)
      .filter(x=>x.vat.outputPence>0).map(x=>x.vat.dueDay)
      .filter(day=>day>=state.day).sort((a,b)=>a-b)[0]:null;
    const vatPanel=is2026?'<section class="fin-panel"><div class="fin-panel-head"><div>'+
      '<small>VAT / TAX LIABILITIES</small><h3>SECOND-HAND MOTOR VAT MODEL</h3></div></div>'+
      line('Registration scenario',state.vatRegistrationDay===1?'Voluntary registration from opening':'Legacy pilot — VAT model not active')+
      line('Trailing 365-day taxable sales',money(rolling))+
      line('Statutory turnover threshold (2026)',money(vat.THRESHOLD))+
      line('VAT output accrued (less remittances)',vat.pence(x.vatOutstanding))+
      (E.aftersales.enabled(state)?line('VAT credit carried after full refunds',
        vat.pence(vat.creditBalancePence(state))):'')+
      line('VAT past simulated due date',vat.pence(nowDue),nowDue>0?' fin-due':'')+
      (upcoming?line('Next modelled quarterly filing date',
        vat.dateForDay(upcoming).toLocaleDateString('en-GB')):'')+
      '<p class="fin-detail">For new 2026 careers, used vehicles are ASSUMED margin-scheme eligible. Tax is 1/6 of a positive vehicle purchase-to-sale margin, not 20% of profit. Whole-pound VAT cash remittances fall due after simulated calendar quarters. Buyer-fee invoice classification and margin eligibility must be verified on real purchases. Input VAT recovery, proper VAT returns and full VRN/VIN stockbook are not yet modelled; the aftersales pilot reverses eligible VAT output on paid full refunds.</p>'+
      '</section>':'';
    const LIQUIDITY=window.MotorTradeRetailLiquidity;
    const liquidity=is2026&&LIQUIDITY?LIQUIDITY.snapshot(state,E):null;
    const liquidityPanel=liquidity?
      '<section class="fin-panel"><div class="fin-panel-head"><div>'+
      '<small>PHASE 8 · OPERATIONAL RISK</small><h3>STOCK TURN & CASH RUNWAY</h3></div>'+
      '<button type="button" class="fin-text-button" data-page="stock">REVIEW STOCK</button></div>'+
      line('Bank cash',money(liquidity.cash))+
      line('Protected workshop, VAT, payroll & refunds',money(liquidity.committed))+
      line('Uncommitted bank cash',money(liquidity.freeCash))+
      line('Routine cash costs / 30 game days (incl. conservative wages)',money(liquidity.monthlyBurn))+
      line('Cash-only runway, no stock sales',liquidity.cashRunwayDays===null?'Not calculable':
        liquidity.cashRunwayDays+' GAME DAYS')+
      line('Prudent three-month operating reserve',money(liquidity.threeMonthBuffer))+
      (liquidity.belowBuffer?'<p class="fin-warning">WARNING: Cash after existing commitments is below a three-month operating-cost reserve. This is an advisory warning, not an artificial ban on trading.</p>':'')+
      line('Cash already tied up in owned stock',money(liquidity.stockInvested))+
      line('Illustrative aggregate aged realisation',money(liquidity.stockIndicative))+
      line('Units held 30+ / 60+ game days',liquidity.aged30+' / '+liquidity.aged60)+
      '<p class="fin-detail">This is a cash-only runway if there are no future sales and no new stock purchases. Unpaid arrears and future exceptional claims can shorten it. Stock values are scenario sensitivities, NOT cash, liquidations, verified wholesale bids or booked impairment. Stock proceeds require an actual buyer, agreement, payment and collection.</p></section>':'';
    const STRESS=window.MotorTradeCashStress;
    const stressPanel=is2026&&STRESS?
      '<details class="fin-panel"><summary>12 / 36 / 60-MONTH CASH-FLOW STRESS SENSITIVITIES</summary>'+
      '<p class="fin-detail">Illustrative sensitivity, NOT a business forecast. The per-sale contribution assumption already deducts vehicle buying, auction fees, repair, transport and provisional VAT. Each vehicle is assumed bought and sold within the same month: this omits working capital tied in stock, delays, finance and unsold vehicles. No loan/overdraft is invented. Existing tax, repair and accepted refund liabilities reduce available cash at the outset.</p>'+
      [12,36,60].map(months=>{
        const low=STRESS.project(state,E,{months,unitsPerMonth:1,
          contributionPerSale:700,annualClaimCost:2500});
        const target=STRESS.project(state,E,{months,unitsPerMonth:3,
          contributionPerSale:1000,annualClaimCost:2500});
        const high=STRESS.project(state,E,{months,unitsPerMonth:4,
          contributionPerSale:1400,annualClaimCost:5000});
        const explain=x=>'Bank '+money(x.endingBankCash)+
          ', unpaid '+money(x.unfundedCommitments)+
          (x.firstCashShortfallMonth!==null?
            ', first shortfall month '+x.firstCashShortfallMonth:
            ', no projected shortfall');
        return '<h4>'+months+' GAME MONTHS</h4>'+
          line('1 sale/mo · £700 each, £2,500 claim/year',explain(low))+
          line('3 sales/mo · £1,000 each, £2,500 claim/year',explain(target))+
          line('4 sales/mo · £1,400 each, £5,000 claim/year',explain(high));
      }).join('')+
      '<p class="fin-detail">Your scenario uses the current forecourt overhead budget and conservative full employer payroll before NI relief. Insurance renewal is charged every 360 game days. Unpaid commitments are not hidden as borrowing or negative bank cash. Never rely on these outcomes as guaranteed profits or actual future sales.</p>'+
      '</details>':'';
    const footer='<p class="fin-disclosure">Simulation figures only. The 2026 output VAT model is provisional and not statutory net profit or a statutory VAT return; employer taxes, reclaimable input VAT, aftersales liabilities, corporation tax and depreciation require further implementation.</p>';
    return {snapshot:x,html:top+openingPanel+liquidityPanel+vatPanel+stressPanel+cashflow+'<div class="fin-secondary">'+
      commitments+performance+'</div>'+footer};
  }
  function category(note){
    if(/^(Retail |Customer deposit applied|Customer-specific |Fair cancellation)/.test(note))return 'CUSTOMER / SALE';
    if(/^(Auction purchase|Auction transport|Direct purchase|Part-exchange acquisition|Pre-purchase inspection)/.test(note))return 'VEHICLE BUYING';
    if(/^(Workshop |Preparation and inspection)/.test(note))return 'WORKSHOP';
    if(/^(Staff |Sales commission|Recruitment )/.test(note))return 'STAFF';
    if(/^VAT (output|remittance)/.test(note))return 'TAX / VAT';
    if(/^Aftersales /.test(note))return 'CUSTOMER REMEDIES';
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