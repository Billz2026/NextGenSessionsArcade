'use strict';
/* v0.6 monthly management report UI. Uses recorded events only. */
(() => {
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',
    maximumFractionDigits:0}).format(n);
  const signed=n=>(n>0?'+':'')+money(n);
  function cell(label,value,detail='',flag=''){
    return '<div class="report-metric '+flag+'"><small>'+esc(label)+'</small>'+
      '<strong>'+esc(value)+'</strong>'+(detail?'<span>'+esc(detail)+'</span>':'')+'</div>';
  }
  function amount(label,value,positive=false){
    return '<div class="report-line"><span>'+esc(label)+'</span><strong'+
      (value<0?' class="report-negative"':positive?' class="report-positive"':'')+'>'+
      money(value)+'</strong></div>';
  }
  function countLine(label,value){
    return '<div class="report-line"><span>'+esc(label)+
      '</span><strong>'+value+'</strong></div>';
  }
  function progress(actual,target,label){
    const pct=target>0?Math.min(100,Math.round(actual*100/target)):100;
    return '<div class="report-progress"><div class="report-progress-head"><span>'+esc(label)+
      '</span><strong>'+actual+' / '+target+'</strong></div>'+
      '<div class="report-track"><span style="width:'+pct+'%"></span></div></div>';
  }
  function liveGoals(state,M){
    const r=M.statement(state);
    const remaining=Math.max(0,state.monthPlan.endDay-state.day);
    const toGo=Math.max(0,r.targetUnits-r.soldUnits);
    return '<div class="report-teaser"><div><small>MONTH '+r.month+' · '+remaining+
      ' DAYS REMAINING</small><h3>MONTHLY SALES TARGET</h3>'+
      '<p>'+r.soldUnits+' / '+r.targetUnits+' units completed · '+toGo+
      ' still required</p></div><div class="report-teaser-side"><strong>'+
      Math.round(r.soldUnits/Math.max(1,r.targetUnits)*100)+'%</strong>'+
      '<button type="button" data-page="reports" class="secondary-button">OPEN MONTHLY REPORT ↗</button></div></div>';
  }
  function archivePicker(state,chosen){
    const completed=[...state.monthlyReports].reverse();
    return '<div class="report-picker"><button type="button" data-action="select-report" data-month="current"'+
      (chosen==='current'?' aria-current="true"':'')+'>CURRENT MONTH '+state.monthPlan.month+
      '</button>'+completed.map(x=>'<button type="button" data-action="select-report" data-month="'+x.month+'"'+
      (String(x.month)===String(chosen)?' aria-current="true"':'')+'>'+
      'MONTH '+x.month+' · '+(x.targetMet?'TARGET HIT':'TARGET MISSED')+'</button>').join('')+'</div>';
  }
  const nameByCategory={
    auctionPurchases:'Auction vehicle purchases',sellerPurchases:'Direct seller acquisitions',
    partExchangePurchases:'Part-exchange allowances',preparation:'Stock preparation',
    inspections:'Pre-purchase inspections',payroll:'Wages paid',
    commission:'Sales commission paid',recruitment:'Recruitment / onboarding',
    training:'Staff training',staffExit:'Staff exits / notice',other:'Other recorded cash movements'
  };
  function renderReport(state,M,selected='current'){
    const historical=String(selected)!=='current';
    const chosen=historical?state.monthlyReports.find(x=>String(x.month)===String(selected)):null;
    const r=chosen||M.statement(state);
    const isClosed=!!chosen;
    const currentPlan=state.monthPlan;
    const remaining=isClosed?0:Math.max(0,currentPlan.endDay-state.day);
    const status=isClosed?(r.targetMet?'MONTH CLOSED · TARGET MET':'MONTH CLOSED · TARGET MISSED'):
      r.targetMet?'ON TRACK · TARGET REACHED':'MONTH IN PROGRESS';
    const outcome=r.targetMet?'report-good':'report-risk';
    const historicLabel=r.partial?'PARTIAL RECORD · UPGRADED CAREER':'FULL OPERATING PERIOD';
    const gap=r.targetUnits-r.soldUnits;
    const companyWarning=r.soldUnits>=r.targetUnits&&r.grossMargin<=0?
      'Sales volume reached, but the gross margin is not positive. This does not count as achieving the company goal.':'';
    const reportHeader='<header class="report-heading '+(isClosed?outcome:'')+'">'+
      '<div><small>MONTH '+r.month+' · GAME DAYS '+r.startDay+'–'+r.endDay+
      ' · '+(isClosed?historicLabel:'LIVE BUSINESS POSITION')+'</small>'+
      '<h2>MANAGEMENT REVIEW</h2>'+
      '<p>'+(isClosed?esc(r.managementComment):
        'This is the live position. The result is locked when day '+r.endDay+
        ' finishes. Targets are fixed until the next operating month.')+'</p>'+
      '</div><span>'+status+'</span></header>';
    const badges='<div class="report-metric-grid">'+
      cell('VEHICLES SOLD',String(r.soldUnits),'Target: '+r.targetUnits+' vehicles',
        gap<=0?'report-value-positive':'')+
      cell('RETAIL SALES TURNOVER',money(r.turnover),'Planning guide: '+money(r.targetTurnover))+
      cell('GROSS TRADE MARGIN',money(r.grossMargin),
        'Planning guide: '+money(r.targetMargin),r.grossMargin<0?'report-value-negative':'')+
      cell('AFTER STAFF COSTS',money(r.grossAfterStaff),
        'Not net profit · excludes overheads / tax',r.grossAfterStaff<0?'report-value-negative':'')+
      cell('CASH AT END OF PERIOD',money(r.closingCash),'Opening: '+money(r.openingCash))+
      cell('REPUTATION',r.closingReputation+'/100',
        'Starting '+r.startingReputation+'/100')+
      '</div>';
    const targets='<section class="panel-card report-section"><h3>MONTHLY OBJECTIVES</h3>'+
      progress(r.soldUnits,r.targetUnits,'Mandatory dealership unit target')+
      progress(r.turnover,r.targetTurnover,'Sales turnover guidance')+
      progress(Math.max(0,r.grossMargin),r.targetMargin,'Gross trading margin guidance')+
      (companyWarning?'<p class="report-alert">'+companyWarning+'</p>':'')+
      '<p class="report-muted">Target outcome requires the unit count AND a positive gross vehicle margin. '+
      'Turnover and margin figures are secondary benchmarks, not additional mandatory gates. '+
      (isClosed?'This target was set at the start of the period.':
      'Targets change for the next month if reputation changes.')+'</p></section>';
    const source=r.ledgerBreakdown;
    const cash='<section class="panel-card report-section"><h3>CASH FLOW & FINANCES</h3>'+
      amount('Opening cash',r.openingCash)+
      amount('Total cash received',r.cashIn,true)+
      amount('Total cash paid',-r.cashOut)+
      amount('Net cash movement',r.netCashChange)+
      amount('Closing cash',r.closingCash,true)+
      '<hr/>'+amount('Retail sales proceeds',source.retailReceipts,true)+
      Object.entries(nameByCategory).map(([key,label])=>
        amount(label,source[key])).join('')+
      '<hr/>'+amount('Vehicle gross trading margin',r.grossMargin)+
      amount('Recorded staff expenses paid',-r.staffCosts)+
      amount('Gross margin less staff costs',r.grossAfterStaff)+
      '<p class="report-muted">Gross margin is recognised when a vehicle sells, whereas buying and preparation affect cash immediately. '+
      'Some inspection costs may remain outside realised vehicle margin until stock is sold. '+
      'These are game management figures, not statutory accounts, taxable profit or a VAT calculation.</p></section>';
    const saleLine='<section class="panel-card report-section"><h3>SALES & PURCHASING</h3>'+
      countLine('Cash retail sales',r.salesModes.cash)+
      countLine('Retail sales with part-exchanges',r.salesModes.partExchange)+
      amount('Acquisition expenditure',r.totalAcquisitions)+
      amount('Preparation spending',r.prepCost)+
      amount('Average gross margin per sold vehicle',r.averageMargin)+
      '<div class="report-highlow"><p><small>HIGHEST MARGIN VEHICLE</small>'+
      esc(r.bestDeal||'No sales yet')+'</p><p><small>LOWEST MARGIN VEHICLE</small>'+
      esc(r.worstDeal||'No sales yet')+'</p></div></section>';
    const stockTable=r.stock.length?r.stock.map(v=>
      '<div class="report-stock-row"><span>'+esc(v.title)+
      '<small>'+esc(v.status.toUpperCase())+' · '+v.age+' DAYS HELD · '+esc(v.source.toUpperCase())+
      '</small></span><strong>'+money(v.cashInvested)+'</strong></div>').join(''):
      '<p class="report-muted">No unsold stock held at this period close.</p>';
    const inventory='<section class="panel-card report-section"><h3>STOCK & WORKING CAPITAL</h3>'+
      countLine('Vehicles on forecourt',r.stockCount)+
      amount('Acquisition / prep cash tied in stock',r.stockCapital)+
      countLine('Cars aged 14+ days',r.agedStock)+
      countLine('Cars awaiting preparation',r.stockAwaitingPrep)+
      (Number.isSafeInteger(r.workshopInProgress)?
        countLine('Active workshop repairs',r.workshopInProgress)+
        countLine('Final quality checks outstanding',r.workshopQualityChecks)+
        countLine('Unassessed or unbooked stock',r.workshopWaiting):
        '<p class="report-muted">Historical report: detailed workshop breakdown not recorded.</p>')+
      (Number.isSafeInteger(r.wholesaleUnits)?
        countLine('Wholesale stock disposals',r.wholesaleUnits)+
        amount('Trading contribution from wholesale exits',r.wholesaleProfit):'')+
      stockTable+'</section>';
    const peopleRows=r.sellers.length?r.sellers.map(s=>
      '<div class="report-staff-row"><div><strong>'+esc(s.name)+'</strong>'+
      '<span>'+(s.employedAtClose?'EMPLOYED':'LEFT DEALERSHIP')+
      (s.exempt?' · SHORT TENURE':'')+'</span></div>'+
      '<div><strong>'+s.sold+' / '+s.unitTarget+'</strong><small>SALES / TARGET</small></div>'+
      '<div><strong>'+money(s.turnover)+'</strong><small>TURNOVER</small></div>'+
      '<div><strong>'+money(s.grossMargin)+'</strong><small>GROSS MARGIN</small></div>'+
      '<span class="report-staff-result">'+(s.exempt?'NOT ASSESSED':s.hit?'TARGET HIT':'TARGET MISSED')+
      '</span></div>').join(''):
      '<p class="report-muted">No employed salesperson had a target in this period. The owner handles customer sales.</p>';
    const staff='<section class="panel-card report-section"><h3>SALES TEAM SCORECARDS</h3>'+
      peopleRows+
      '<p class="report-muted">A salesperson is credited only for deals closed while actively working. '+
      'Training and late recruitment can reduce their individual target. At month end, performance affects employee morale. '+
      'Staff costs are separate from gross vehicle margin.</p></section>';
    const recent=r.customerTrustEvents.length?[...r.customerTrustEvents].reverse().slice(0,10).map(e=>
      '<div class="report-event"><span>DAY '+e.day+'</span>'+
      '<b class="'+(e.delta<0?'report-negative':'report-positive')+'">'+(e.delta>0?'+':'')+e.delta+
      '</b><p>'+esc(e.reason)+'</p></div>').join(''):
      '<p class="report-muted">No recorded reputation changes in this operating period.</p>';
    const trust='<section class="panel-card report-section"><h3>CUSTOMER TRUST & RISKS</h3>'+
      countLine('Reputation opening',r.startingReputation)+
      countLine('Reputation closing',r.closingReputation)+
      amount('Outstanding staff wages / notice',r.payrollArrears)+
      '<h4>RECORDED REPUTATION EVENTS</h4>'+recent+
      '<p class="report-muted">Customer surveys, warranty claims and formal complaints are not simulated yet. '+
      'This report includes only trust signals and financial events that the current game actually records.</p></section>';
    const d=r.dealDay;
    const dealDaySection=d?'<section class="panel-card report-section"><h3>MONTH-END DEAL DAY REVIEW</h3>'+
      '<p class="report-muted">Market conditions: <strong>'+esc(d.label)+
      '</strong>. Demand was generated by this month’s fictional market model, not guaranteed.</p>'+
      countLine('Private-seller enquiries offered across five sessions',d.sellerEnquiries)+
      countLine('Retail sales completed on Deal Day',d.retailSales)+
      amount('Retail turnover on Deal Day',d.turnover)+
      amount('Gross trade margin on Deal Day',d.grossMargin)+
      '<p class="report-muted">Available enquiries are not guaranteed purchases. Results depend on which cars you listed, negotiations, available funds and customer demand. A busy month can still be unprofitable.</p></section>':
      '<section class="panel-card report-section"><h3>MONTH-END DEAL DAY REVIEW</h3>'+
      '<p class="report-muted">'+(isClosed?
        'This historical report predates detailed Deal Day market tracking. No figures have been invented.':
        'Deal Day outcomes are not known yet. The completed results will be recorded when the month closes.')+
      '</p></section>';
    return archivePicker(state,selected)+reportHeader+badges+targets+
      '<div class="report-columns">'+cash+saleLine+inventory+staff+trust+dealDaySection+'</div>'+
      '<p class="trade-alert report-caveat">Operating months currently contain 30 game days. '+
      'Actual calendar months, UK payroll law, VAT, tax, rents, financing, warranties and statutory accounts '+
      'require a future business-economics release. All transactions, figures and vehicle markets are fictional.</p>';
  }
  window.MotorTradeMonthlyView=Object.freeze({renderReport,liveGoals});
})();
