'use strict';
/* v0.9.30 — compact Deal Day, board meeting and management diary screens. */
(() => {
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  const D=()=>window.MotorTradeEvents;
  function banner(state){
    const d=D();
    if(d.isDealDay(state.day)){
      const p=d.dealSession(state),climate=d.outlook(state);
      return '<div class="event-banner event-deadline-banner"><div><small>FINAL DAY OF MONTH '+d.monthOf(state.day)+
        ' · '+esc(p.time)+' · '+(state.deadlineSession+1)+' OF 5</small>'+
        '<h3>DEAL DAY · '+esc(climate.label)+'</h3>'+
        '<p>Auctions are closed. '+esc(climate.description)+
        ' New enquiries and better terms are never guaranteed. Advance each session to check trading conditions.</p></div>'+
        '<button type="button" class="secondary-button" data-page="events">'+
        (state.deadlineSession>=d.PHASES.length-1?'CLOSE MONTH ↗':'OPEN DEAL DAY ↗')+
        '</button></div>';
    }
    if(d.meetingDue(state)){
      return '<div class="event-banner event-meeting-banner"><div><small>DAY 1 OF MONTH '+
        d.monthOf(state.day)+(state.day===1?' · START-UP BRIEFING':' · ACTION REQUIRED')+
        '</small><h3>MONTHLY MANAGEMENT MEETING</h3><p>'+
        (state.day===1?'Set your opening priorities and review your first sales objective.':
          'Review the last 30 days, your staff and cash position, then choose a new management focus before advancing.')+
        '</p></div><button type="button" class="secondary-button" data-page="events">ENTER MEETING ↗</button></div>';
    }
    const days=30-state.day%30;
    return '<div class="event-banner event-neutral-banner"><div><small>MONTHLY EVENTS</small>'+
      '<h3>NEXT DEAL DAY IN '+days+' GAME DAYS</h3><p>On day '+
      (Math.floor((state.day-1)/30)+1)*30+
      ', a customer-only Deal Day takes place. The result varies: some months may be very quiet, while others are busy. No auctions run that day.</p></div>'+
      '<button type="button" class="secondary-button" data-page="events">VIEW CALENDAR ↗</button></div>';
  }
  function deadline(state){
    const d=D(),p=d.dealSession(state),phase=state.deadlineSession;
    const climate=d.outlook(state);
    const sellerCount=d.leadCount(state.day,
      state.monthPlan.startingReputation,phase,state.name);
    const listed=state.vehicles.filter(x=>x.status==='listed').length;
    const prep=state.vehicles.filter(x=>x.status==='acquired').length;
    const today=state.sold.filter(x=>x.day===state.day);
    const total=today.reduce((sum,x)=>sum+x.price,0);
    const month=state.monthPlan;
    const monthSold=state.sold.filter(x=>x.day>=month.startDay&&x.day<=state.day).length;
    const phases=d.PHASES.map((x,i)=>
      '<div class="eo-phase '+(i===phase?'eo-phase-current':i<phase?'eo-phase-done':'')+'"'+
      (i===phase?' aria-current="step"':'')+'><strong>'+esc(x.time)+
      '</strong><span>'+esc(x.name)+'</span></div>').join('');
    const last=phase===d.PHASES.length-1;
    const next=last?'CLOSE MONTH':'NEXT SESSION';
    return '<div class="eo-desk eo-deal-day">'+
      '<header class="eo-heading"><div><small>MONTH '+d.monthOf(state.day)+
      ' · FINAL TRADING DAY · NO AUCTIONS</small>'+
      '<h2>DEAL DAY</h2><p>'+esc(climate.label)+' · '+esc(climate.description)+'</p></div>'+
      '<div class="eo-heading-status"><span>SESSION '+(phase+1)+' / '+d.PHASES.length+
      '</span><strong>'+esc(p.time)+'</strong><small>'+esc(p.name)+'</small></div></header>'+
      '<div class="eo-timeline" aria-label="Five Deal Day sessions">'+phases+'</div>'+
      '<div class="eo-kpis">'+
      '<div><small>PRIVATE SELLERS THIS SESSION</small><strong>'+sellerCount+'</strong></div>'+
      '<div><small>VEHICLES ADVERTISED</small><strong>'+listed+'</strong></div>'+
      '<div><small>RETAIL HANDOVERS TODAY</small><strong>'+today.length+'</strong></div>'+
      '<div><small>MONTHLY SALES TARGET</small><strong>'+monthSold+' / '+month.unitTarget+'</strong></div>'+
      '</div>'+
      '<div class="eo-session-summary"><strong>TODAY’S RETAIL TURNOVER '+money(total)+'</strong>'+
      '<span>'+prep+' vehicle'+(prep===1?'':'s')+' need preparation · '+
      (sellerCount?'Private-seller enquiries available now':'No private sellers in this session')+
      '</span></div>'+
      '<div class="eo-activities">'+
      '<section class="eo-activity"><div><small>RETAIL OPPORTUNITY</small>'+
      '<h3>SELL TO CUSTOMERS</h3>'+
      '<p>'+(listed?
        'Check buyer interest, negotiate offers and progress any collection-ready deals.':
        'No advertised cars are available for retail enquiries. Prepare and advertise stock first.')+
      '</p></div><button type="button" class="trade-button" data-page="sales">OPEN SALES OFFICE</button></section>'+
      '<section class="eo-activity"><div><small>DIRECT BUYING</small>'+
      '<h3>BUY FROM PRIVATE SELLERS</h3>'+
      '<p>'+(sellerCount?
        sellerCount+' owner '+(sellerCount===1?'enquiry is':'enquiries are')+
        ' available in this session. Check margins, prep costs and capacity.':
        'No seller leads have arrived. Another session may be different.')+
      '</p></div><button type="button" class="trade-button" data-page="auctions">'+
      'OPEN BUYING DESK</button></section></div>'+
      '<div class="eo-next-action"><strong>NEXT: '+next+'</strong>'+
      '<span>Use the top-right '+next+' control. '+
      (last?'The 17:00 session is the final chance to trade before the month closes.':
        'The next session changes the clock, not the game day or daily expenses.')+
      '</span></div>'+
      '<details class="eo-details"><summary>DEAL DAY RULES & SESSION EXPIRY</summary>'+
      '<p>Auctions are closed today. Retail demand and direct-seller enquiries vary: no sales are guaranteed. '+
      'Unresolved offers and seller leads expire when you move to the next session; paid inspection fees are not refunded. '+
      'Cash, repairs and forecourt capacity still matter. The final 17:00 session leads into month-end reporting.</p>'+
      '</details></div>';
  }
  function suggestions(report){
    if(!report)return ['Set a realistic retail price before accepting offers.',
      'Preserve enough cash to repair and advertise your first vehicles.',
      'Avoid hiring more employees than your current sales can support.'];
    const result=[];
    if(report.dealDay?.type==='quiet'||report.dealDay?.type==='subdued')
      result.push('Month-end customer traffic was '+report.dealDay.label.toLowerCase()+
        ' with '+report.dealDay.sellerEnquiries+
        ' private-seller enquiries offered. Do not assume the deadline will always rescue a missed sales target.');
    if(report.customerJourney){
      const j=report.customerJourney;
      if(j.noShows>0)result.push(j.noShows+
        ' customer(s) missed their viewing. Review follow-up procedures and avoid assuming booked appointments will convert.');
      if(j.enquiries>0&&j.completedSales*3<j.enquiries)
        result.push('Only '+j.completedSales+' of '+j.enquiries+
          ' recorded enquiries converted to completed handovers. Examine pricing, test drives and objections.');
      if(j.deposits>j.completedSales)
        result.push('Some customers paid deposits but have not collected. Check reserved stock and pending appointments.');
    }
    if(report.soldUnits<report.targetUnits)
      result.push('Sales volume was '+report.soldUnits+'/'+report.targetUnits+
        '. Review advertised pricing, customer conversions and whether enough cars were prepared.');
    else result.push('Sales volume reached the target of '+report.targetUnits+
      '. Keep quality and margins healthy rather than chasing volume at any cost.');
    if(report.grossAfterStaff<0)
      result.push('Gross vehicle margin after recorded staff costs was '+money(report.grossAfterStaff)+
        '. Consider staffing affordability and buying prices before committing to more costs.');
    else result.push('Gross margin after paid staff expenses was '+money(report.grossAfterStaff)+
      '. Protect cash flow and stock preparation reserves as the business grows.');
    if(report.agedStock>0)result.push(report.agedStock+
      ' vehicle(s) were held for 14 days or more. Review condition, pricing and seller interest.');
    if(report.payrollArrears>0)result.push('Outstanding employee obligations total '+
      money(report.payrollArrears)+'. Resolve these before expansion.');
    if(report.sellers.some(x=>!x.exempt&&!x.hit))
      result.push('Some sales employees missed their individual targets. Review coaching, training and stock availability.');
    if(report.sellers.length===0)
      result.push('No sales employees had a target. You handled the dealership’s retail sales personally.');
    return result.slice(0,6);
  }
  function meeting(state){
    const d=D(),month=d.monthOf(state.day),done=state.meetingHeldMonth===month;
    const previous=state.monthlyReports.at(-1)||null;
    const notes=suggestions(previous);
    const selectedFocus=d.FOCI[state.meetingFocus];
    const metrics=previous?[
      ['PREVIOUS SALES',previous.soldUnits+' / '+previous.targetUnits],
      ['TURNOVER',money(previous.turnover)],
      ['OPERATING CONTRIBUTION',money(previous.operatingContribution??previous.grossAfterStaff)],
      ['CLOSING CASH',money(previous.closingCash)]
    ]:[
      ['NEW MONTH SALES TARGET',String(state.monthPlan.unitTarget)],
      ['CURRENT CASH',money(state.cash)],
      ['REPUTATION',state.reputationScore+' / 100'],
      ['STAFF ON PAYROLL',String(state.staff.length)]
    ];
    const cards=metrics.map(([label,value])=>
      '<div><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong></div>').join('');
    const choices=Object.entries(d.FOCI).map(([id,focus])=>{
      const isSelected=done&&state.meetingFocus===id;
      return '<button type="button" class="eo-focus-choice'+(isSelected?' eo-focus-selected':'')+
        '" data-action="hold-meeting" data-focus="'+id+'"'+(done?' disabled':'')+
        ' aria-pressed="'+String(isSelected)+'">'+
        '<strong>'+esc(focus.label)+'</strong><span>'+esc(focus.description)+'</span>'+
        '<small>'+(isSelected?'SELECTED PRIORITY':done?'NOT SELECTED':'CHOOSE THIS PRIORITY')+'</small></button>';
    }).join('');
    const staff=previous?.sellers.length?previous.sellers.map(x=>
      '<div class="meeting-staff-row"><span>'+esc(x.name)+'</span>'+
      '<strong>'+x.sold+' / '+x.unitTarget+' sold</strong><span>'+
      esc(x.exempt?'EXEMPT':x.hit?'TARGET HIT':'TARGET MISSED')+'</span></div>').join(''):
      '<p class="event-note">No individual sales staff results to review yet.</p>';
    const record=state.meetings.slice(-4).reverse().map(x=>
      '<div class="meeting-minute"><span>MONTH '+x.month+'</span><strong>'+
      esc(d.FOCI[x.focus]?.label||x.focus)+'</strong><span>Previous sales '+
      x.sold+'/'+x.target+'</span></div>').join('');
    return '<div class="eo-desk eo-meeting">'+
      '<header class="eo-heading"><div><small>MONTH '+month+
      ' · FIRST GAME DAY · MANAGEMENT OFFICE</small><h2>BOARD MEETING</h2>'+
      '<p>'+esc(state.name)+' · Review results and set a focus for this month.</p></div>'+
      '<span class="eo-heading-chip '+(done?'eo-completed':'eo-required')+'">'+
      (done?'MEETING COMPLETED':'DECISION REQUIRED')+'</span></header>'+
      '<div class="eo-kpis">'+cards+'</div>'+
      (done?'<div class="eo-confirm"><strong>MEETING COMPLETED.</strong> '+
        'Your monthly priority is '+esc(selectedFocus?.label||'Routine operations')+
        '. This decision is recorded in your career.</div>':
        '<div class="eo-meeting-warning"><strong>ACTION REQUIRED</strong>'+
        '<span>Agree one management priority before advancing beyond the first game day.</span></div>')+
      '<section class="eo-priority"><div class="eo-section-heading"><div><small>MONTH '+month+
      ' STRATEGY</small><h3>AGREE ONE MANAGEMENT PRIORITY</h3></div>'+
      '<span>'+(done?'DECISION LOCKED':'SELECT ONE OPTION')+'</span></div>'+
      '<div class="eo-focus-grid">'+choices+'</div>'+
      '<p>Each priority has a modest, defined effect. It does not create free money or guarantee a sale.</p></section>'+
      '<div class="eo-meeting-sub"><div><small>THIS MONTH’S UNIT TARGET</small>'+
      '<strong>'+state.monthPlan.unitTarget+' COMPLETED HANDOVERS</strong></div>'+
      '<div><small>TURNOVER GUIDANCE</small><strong>'+
      money(state.monthPlan.turnoverTarget)+'</strong></div>'+
      '<div><small>REPUTATION</small><strong>'+state.reputationScore+' / 100</strong></div></div>'+
      '<details class="eo-details"><summary>MANAGEMENT DISCUSSION & PREVIOUS RESULTS</summary>'+
      '<div class="eo-detail-grid">'+
      '<section><h3>MANAGEMENT DISCUSSION</h3><div class="meeting-notes">'+
      notes.map((x,i)=>'<div><b>'+String(i+1).padStart(2,'0')+'</b><p>'+
        esc(x)+'</p></div>').join('')+'</div></section>'+
      '<section><h3>SALES TEAM REVIEW</h3>'+staff+
      '<h3>NEW MONTH’S TARGETS</h3><p>Dealership target: '+state.monthPlan.unitTarget+
      ' handovers with positive operating contribution after staff and premises costs. '+
      'Turnover guidance: '+money(state.monthPlan.turnoverTarget)+'.</p>'+
      '</section></div></details>'+
      (record?'<details class="eo-details"><summary>RECENT MEETING MINUTES</summary>'+
        '<div class="eo-minute-list">'+record+'</div></details>':'')+
      (previous?'<button type="button" class="secondary-button eo-report-link" '+
        'data-page="reports">OPEN PREVIOUS MONTH’S FULL REPORT</button>':'')+
      '</div>';
  }
  function render(state){
    const d=D();
    if(d.isDealDay(state.day))return deadline(state);
    if(d.isMeetingDay(state.day))return meeting(state);
    const month=d.monthOf(state.day);
    const next=month*30,until=next-state.day,meetingDay=next+1;
    const current=state.monthPlan;
    const sold=state.sold.filter(x=>x.day>=current.startDay&&x.day<=state.day).length;
    const listed=state.vehicles.filter(x=>x.status==='listed').length;
    const preparing=state.vehicles.filter(x=>x.status==='acquired').length;
    const focus=state.meetingHeldMonth===month?d.FOCI[state.meetingFocus]:null;
    return '<div class="eo-desk eo-calendar"><header class="eo-heading">'+
      '<div><small>MANAGEMENT DIARY · MONTH '+month+
      '</small><h2>UPCOMING EVENTS</h2>'+
      '<p>Two fixed milestones every 30-game-day operating month.</p></div>'+
      '<span class="eo-heading-chip">NORMAL TRADING</span></header>'+
      '<div class="eo-kpis">'+
      '<div><small>DAYS UNTIL DEAL DAY</small><strong>'+until+'</strong></div>'+
      '<div><small>MONTHLY HANDOVERS</small><strong>'+sold+' / '+current.unitTarget+'</strong></div>'+
      '<div><small>VEHICLES ADVERTISED</small><strong>'+listed+'</strong></div>'+
      '<div><small>CASH BALANCE</small><strong>'+money(state.cash)+'</strong></div>'+
      '</div><div class="eo-calendar-grid">'+
      '<section class="eo-schedule"><div><small>UPCOMING · GAME DAY '+next+'</small>'+
      '<h3>MONTH-END DEAL DAY</h3><strong>FIVE SESSIONS · 09:00–17:00</strong>'+
      '<p>Five sessions from 09:00 to 17:00. Buyers and private sellers may appear, '+
      'but demand is never guaranteed. Auction houses are closed on Deal Day.</p></div>'+
      '<div class="eo-schedule-foot">PREPARE: '+listed+' LISTED · '+
      preparing+' AWAITING PREPARATION</div>'+
      '<button type="button" class="trade-button" data-page="stock">CHECK VEHICLE STOCK</button></section>'+
      '<section class="eo-schedule"><div><small>NEXT MONTH · GAME DAY '+meetingDay+'</small>'+
      '<h3>MONTHLY BOARD MEETING</h3><strong>REVIEW & SET THE NEXT PRIORITY</strong>'+
      '<p>The first day of the next month is for reviewing results and choosing a sales, buying or customer-care focus.</p></div>'+
      '<div class="eo-schedule-foot">CURRENT PRIORITY: '+
      esc(focus?.label||'NOT YET SELECTED')+'</div>'+
      '<button type="button" class="trade-button" data-page="reports">REVIEW MONTHLY REPORT</button></section>'+
      '</div><p class="eo-footnote">The event calendar shows fixed game-day milestones, not a forecast of how many customers will arrive.</p></div>';
  }
  window.MotorTradeEventsView=Object.freeze({banner,render});
})();