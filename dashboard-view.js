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
  const titleCase=s=>String(s).toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());
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
    const booked=customers.filter(c=>c.status==='booked'&&
      Number.isSafeInteger(c.appointmentDay)&&c.appointmentDay>=state.day).length;
    const dueViewing=customers.filter(c=>c.status==='booked'&&
      Number.isSafeInteger(c.appointmentDay)&&c.appointmentDay<=state.day+1).length;
    const unread=state.messages.filter(m=>!m.read).length;
    const reserved=E.workshop.reserved(state);
    const arrears=(state.payrollArrears||0)+(state.premises?.arrears||0);
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
      const due=lot?state.auctionHall.currentBid+lot.fee:null;
      add(0,'auction-invoice','Settle your auction purchase',
        due==null?'A winning hammer invoice needs payment before trading can continue.':
          money(due)+' due including the buyer fee. Vehicle awaits workshop transfer.',
        'auctionHall','PAY INVOICE','urgent');
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
    if(state.payrollArrears>0)
      add(3,'payroll','Outstanding staff wages',
        money(state.payrollArrears)+' remains owed to employees.',
        'staff','REVIEW PAYROLL','urgent');
    if(state.premises?.arrears>0)
      add(4,'rent','Unpaid premises overheads',
        money(state.premises.arrears)+' in rent and utilities outstanding.',
        'business','VIEW COSTS','urgent');
    if(dueViewing)
      add(5,'viewing',dueViewing+' customer viewing'+(dueViewing===1?'':'s')+' due',
        'Manage booked viewings and any buyers ready for negotiation.',
        'sales','OPEN SALES','attention');
    if(unassessed||quoted||qc)
      add(6,'workshop',unassessed+quoted+qc+' vehicle'+(unassessed+quoted+qc===1?'':'s')+' need workshop decisions',
        [unassessed?'Assess '+unassessed:0,quoted?'Quote '+quoted:0,qc?'Quality-check '+qc:0]
          .filter(Boolean).join(' · ')+'.',
        'workshop','OPEN WORKSHOP','attention');
    if(prepared)
      add(7,'prepared',prepared+' prepared vehicle'+(prepared===1?'':'s')+' not yet listed',
        'Set retail asking prices to start attracting buyers.',
        'stock','LIST VEHICLES','attention');
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
    if(tasks.length<3)
      add(14,'finances','Check your operating position',
        'Review cash commitments, staffing costs and this month’s contribution.',
        'finance','OPEN FINANCES');
    if(tasks.length<3)
      add(15,'work-plan','Review this week’s stock plan',
        'Balance buying, repairs and selling before taking on more overheads.',
        'stock','VIEW STOCK');
    tasks.sort((a,b)=>a.rank-b.rank);
    return {
      day:state.day,report,listed,awaitingPrep,unassessed,prepared,booked,unread,
      reserved,arrears,age,unitsLeft,daysToGo,auctionOpen,auctionDay,
      auctionWeekday,tasks:tasks.slice(0,3)
    };
  }
  function priorities(model){
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
      ['BOOKED VIEWINGS',model.booked,'sales'],
      ['OUTSTANDING BILLS',money(model.arrears),'finance'],
      ['CAREER SALES',state.sales,'reports']
    ];
    return items.map(([label,value,page])=>
      '<button type="button" class="dashboard-operations-item" data-page="'+page+
      '" aria-label="'+label+': '+esc(value)+'"><small>'+label+'</small>'+
      '<strong>'+esc(value)+'</strong></button>').join('');
  }
  window.MotorTradeDashboardView=Object.freeze({snapshot,priorities,operations});
})();
