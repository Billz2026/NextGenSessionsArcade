'use strict';
/* The Motor Trade v0.9.11 — read-only dashboard decision model.
 * Everything is derived from a current career. No additional saved state,
 * invented transactions, timers or approximate "net profit" claims.
 */
(() => {
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money=n=>new Intl.NumberFormat('en-GB',{
    style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  // A unit target and a profitable month are different claims. This indicator
  // reports vehicle volume only; operating contribution is a separate KPI.
  function salesProgress(report,daysToGo){
    if(report.targetUnits===0)return {text:'No unit target set',positive:false};
    const over=report.soldUnits-report.targetUnits;
    if(over>0)return {text:'✓ Unit target exceeded by '+over+' vehicle'+(over===1?'':'s'),positive:true};
    if(over===0)return {text:'✓ Unit target reached',positive:true};
    const remaining=-over;
    return {text:remaining+' sale'+(remaining===1?'':'s')+' to target · '+daysToGo+
      ' game day'+(daysToGo===1?'':'s')+' left',positive:false};
  }
  function snapshot(state,E){
    const report=E.monthly.statement(state);
    const events=E.events,customers=Object.values(state.customerCases||{});
    const vehicles=state.vehicles||[];
    const listed=vehicles.filter(v=>v.status==='listed').length;
    const awaitingPrep=vehicles.filter(v=>v.status==='acquired').length;
    const unassessed=vehicles.filter(v=>v.workshop?.stage==='unassessed').length;
    const quoted=vehicles.filter(v=>v.workshop?.stage==='quoted').length;
    const qc=vehicles.filter(v=>v.workshop?.stage==='quality-check').length;
    const prepared=vehicles.filter(v=>v.status==='prepared').length;
    const pendingEnquiries=customers.filter(c=>c.status==='enquiry').length;
    const booked=customers.filter(c=>c.status==='booked'&&
      Number.isSafeInteger(c.appointmentDay)&&c.appointmentDay>=state.day).length;
    const dueViewing=customers.filter(c=>c.status==='booked'&&
      Number.isSafeInteger(c.appointmentDay)&&c.appointmentDay<=state.day+1).length;
    const unread=state.messages.filter(m=>!m.read).length;
    const reserved=E.workshop.reserved(state);
    const arrears=(state.payrollArrears||0)+(state.premises?.arrears||0)+
      E.aftersales.pendingRefunds(state);
    const age=vehicles.filter(v=>v.status==='listed'&&state.day-v.acquiredDay>=14).length;
    const auctionOpen=E.auctionDay(state.day)&&state.auctionHall?.phase!=='finished';
    const auctionDay=auctionOpen?state.day:E.nextAuctionDay(state.day);
    const auctionWeekday=(auctionDay-1)%7===0?'MON':'TUE';
    const daysToGo=Math.max(0,state.monthPlan.endDay-state.day);
    const unitsLeft=Math.max(0,report.targetUnits-report.soldUnits);
    const tasks=[];
    const add=(rank,key,title,description,page,action,tone='normal')=>
      tasks.push({rank,key,title,description,page,action,tone});
    if(state.auctionHall?.phase==='payment'){
      const lot=E.auctionLot(state);
      const auctionFee=lot?E.auctionFee(state,lot,state.auctionHall.currentBid):null;
      const transport=lot?E.auctionTransport(state,lot):null;
      const due=lot&&auctionFee!==null&&transport?state.auctionHall.currentBid+auctionFee+transport.gross:null;
      add(0,'auction-invoice','Settle your auction purchase',
        due==null?'A winning hammer invoice needs payment before trading can continue.':
          money(due)+' due including the buyer fee and simulated delivery where applicable. Vehicle awaits workshop transfer.',
        'auctionHall','PAY INVOICE','urgent');
    }
    if(E.aftersales.enabled(state)){
      const cases=state.aftersales.cases;
      const owed=cases.filter(x=>['refund-due','reduction-due'].includes(x.status));
      const claims=cases.filter(x=>['open','repair-failed'].includes(x.status));
      const cost=E.aftersales.pendingRefunds(state);
      if(owed.length)
        add(0.5,'aftersales-refunds',owed.length+' agreed customer remedy payment'+(owed.length===1?'':'s')+' outstanding',
          money(cost)+' due including collection; an accepted statutory refund remains owed even when the bank is short.',
          'sales','REVIEW CUSTOMER REFUNDS','urgent');
      if(claims.length)
        add(2.5,'aftersales-claims',claims.length+' unresolved consumer fault claim'+(claims.length===1?'':'s'),
          'Confirm remedy, authorise a timely repair or accept the appropriate rejection / reduction.',
          'sales','OPEN AFTERSALES','urgent');
    }
    if(events.meetingDue(state))
      add(1,'board-meeting','Complete management meeting',
        'Agree this month’s management focus before advancing the game day.',
        'events','OPEN MEETING','urgent');
    if(events.isDealDay(state.day)){
      const closing=state.deadlineSession>=events.PHASES.length-1;
      add(2,'deal-day',closing?'Close the trading month':'Run your Deal Day session',
        closing?'The final session is complete. Review and close the month.':
          'Deal Day session '+(state.deadlineSession+1)+' of '+events.PHASES.length+
          ' · '+events.dealSession(state).time+'.',
        'events',closing?'CLOSE MONTH':'OPEN DEAL DAY','urgent');
    }
    const solvency=state.financialScenario==='uk2026'?
      window.MotorTradeCommercialControls?.status(state):null;
    if(solvency?.creditorHold)
      add(2.8,'creditor-hold','New vehicle buying restricted by unpaid obligations',
        money(solvency.overdue+solvency.refunds)+' in recorded overdue bills or accepted customer remedies. Sell stock and settle creditors before sourcing more vehicles.',
        'finance','REVIEW CREDITOR HOLD','urgent');
    if(state.payrollArrears>0)
      add(3,'payroll','Outstanding staff wages',
        money(state.payrollArrears)+' remains owed to employees.',
        'staff','REVIEW PAYROLL','urgent');
    if(state.premises?.arrears>0)
      add(4,'rent','Unpaid premises overheads',
        money(state.premises.arrears)+(state.financialScenario==='uk2026'?' in operating bills outstanding.':' in rent and utilities outstanding.'),
        'business','VIEW COSTS','urgent');
    if(dueViewing)
      add(5,'viewing',dueViewing+' customer viewing'+(dueViewing===1?'':'s')+' due',
        'Manage booked viewings and any buyers ready for negotiation.',
        'sales','OPEN SALES','attention');
    if(pendingEnquiries)
      add(5.5,'new-enquiries',pendingEnquiries+' customer '+
        (pendingEnquiries===1?'enquiry':'enquiries')+' awaiting your response',
        'A buyer has contacted your dealership about advertised stock. Book a viewing in the Sales Office before the enquiry expires.',
        'sales','RESPOND TO CUSTOMERS','attention');
    if(unassessed||quoted||qc)
      add(6,'workshop',unassessed+quoted+qc+' vehicle'+(unassessed+quoted+qc===1?'':'s')+' need workshop decisions',
        [unassessed?'Assess '+unassessed:0,quoted?'Quote '+quoted:0,qc?'Quality-check '+qc:0]
          .filter(Boolean).join(' · ')+'.',
        'workshop','OPEN WORKSHOP','attention');
    if(prepared)
      add(7,'prepared',prepared+' prepared vehicle'+(prepared===1?'':'s')+' not yet listed',
        'Set retail asking prices to start attracting buyers.',
        'stock','LIST VEHICLES','attention');
    if(vehicles.length>0&&listed===0)
      add(7.5,'not-advertised','No vehicles are advertised for retail',
        'You own '+vehicles.length+' vehicle'+(vehicles.length===1?'':'s')+
        ', but buying alone cannot create customer interest. Complete workshop preparation and set asking prices to start receiving enquiries.',
        prepared?'stock':'workshop',prepared?'LIST VEHICLES':'PREPARE STOCK','attention');
    if(vehicles.length===0)
      add(8,'empty-stock','Your forecourt is empty',
        'No cars in stock or ready for retail. Review sourcing options and buying costs.',
        E.auctionDay(state.day)?'auctionHall':'auctions','SOURCE STOCK','attention');
    if(age)
      add(9,'aged-stock',age+' ageing listed vehicle'+(age===1?'':'s'),
        'On the forecourt for 14+ days. Check prices and buyer interest.',
        'stock','REVIEW PRICES','attention');
    if(unread)
      add(10,'inbox',unread+' unread message'+(unread===1?'':'s'),
        'Review recent management and trading communications.',
        'inbox','READ INBOX');
    if(unitsLeft&&daysToGo<=5)
      add(11,'monthly-target',unitsLeft+' sale'+(unitsLeft===1?'':'s')+' needed for monthly target',
        daysToGo+' game day'+(daysToGo===1?'':'s')+' remaining. The operating contribution must also be positive.',
        'reports','REVIEW TARGET','attention');
    if(auctionOpen&&state.auctionHall?.phase!=='payment')
      add(12,'auction-live','Weekly auction session is open',
        'Review numbered lots and bidding limits before purchasing.',
        'auctionHall','ENTER AUCTION');
    if(tasks.length<3&&booked)
      add(13,'appointments',booked+' upcoming booked viewing'+(booked===1?'':'s'),
        'Your sales team has appointments in the pipeline.',
        'sales','VIEW PIPELINE');
    if(report.operatingContribution<0&&report.soldUnits>0&&daysToGo<=5)
      add(13,'negative-contribution','Trading costs exceed your vehicle margin',
        'Current-month operating contribution is '+money(report.operatingContribution)+
          '. Review costs and selling margins before the month closes.',
        'finance','REVIEW OPERATING COSTS','attention');
    // Only suggest the next auction if there is room to buy; never pad the
    // management desk with generic advice when the dealership is healthy.
    if(tasks.length<3&&!auctionOpen&&vehicles.length<state.capacity&&
       auctionDay>state.day&&state.auctionHall?.phase!=='payment'){
      const gap=auctionDay-state.day;
      add(14,'next-auction','Prepare for Day '+auctionDay+' auction',
        (auctionWeekday==='TUE'?'Tuesday':'Monday')+' session in '+gap+
          ' game day'+(gap===1?'':'s')+'. Plan your maximum bid, fees and repair budget.',
        'auctionHall','VIEW AUCTION SCHEDULE');
    }
    tasks.sort((a,b)=>a.rank-b.rank);
    return {
      day:state.day,report,listed,awaitingPrep,unassessed,prepared,booked,pendingEnquiries,unread,
      reserved,arrears,age,unitsLeft,daysToGo,auctionOpen,auctionDay,
      auctionWeekday,tasks:tasks.slice(0,3)
    };
  }
  function priorities(model){
    if(!model.tasks.length)return '<div class="dashboard-all-clear">'+
      '<strong>No urgent decisions outstanding</strong><small>Your current stock, '+
      'appointments and bills show no action requiring immediate attention.</small></div>';
    return model.tasks.map((t,i)=>
      '<button type="button" class="dashboard-action-row dashboard-action-'+esc(t.tone)+
      '" data-page="'+esc(t.page)+'" aria-label="'+esc(t.title)+' — '+esc(t.action)+'">'+
      '<span class="dashboard-action-number">'+String(i+1).padStart(2,'0')+'</span>'+
      '<span class="dashboard-action-copy"><strong>'+esc(t.title)+'</strong>'+
      '<small>'+esc(t.description)+'</small></span>'+
      '<span class="dashboard-action-link">'+esc(t.action)+' <span aria-hidden="true">↗</span></span></button>'
    ).join('');
  }
  function operations(model,state){
    const items=[
      ['LISTED FOR SALE',model.listed,'stock'],
      ['AWAITING PREP',model.awaitingPrep,'workshop'],
      ['ACTIVE BUYER CASES',model.pendingEnquiries+model.booked,'sales'],
      ['OUTSTANDING BILLS',money(model.arrears),'finance'],
      ['CAREER SALES',state.sales,'reports']
    ];
    return items.map(([label,value,page])=>
      '<button type="button" class="dashboard-operations-item" data-page="'+page+
      '" aria-label="'+label+': '+esc(value)+'"><small>'+label+'</small>'+
      '<strong>'+esc(value)+'</strong></button>').join('');
  }
  window.MotorTradeDashboardView=Object.freeze({snapshot,salesProgress,priorities,operations});
})();
