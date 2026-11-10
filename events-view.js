'use strict';
/* Month-end retail Deal Day / first-day board meeting screens. */
(() => {
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  const D=()=>window.MotorTradeEvents;
  function banner(state){
    const d=D();
    if(d.isDealDay(state.day)){
      const p=d.dealSession(state);
      return '<div class="event-banner event-deadline-banner"><div><small>FINAL DAY OF MONTH '+d.monthOf(state.day)+
        ' · '+esc(p.time)+' · '+(state.deadlineSession+1)+' OF 5</small>'+
        '<h3>DEAL DAY — CUSTOMERS ONLY</h3>'+
        '<p>Auctions are closed. Private sellers, retail customers and part-exchanges have extra reason to negotiate. '+
        'Advance each session to welcome fresh opportunities.</p></div>'+
        '<button type="button" class="secondary-button" data-page="events">OPEN DEAL DAY ↗</button></div>';
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
      ', customers get more motivated to trade. No auctions run that day. Monthly management meetings occur on each new month’s first day.</p></div>'+
      '<button type="button" class="secondary-button" data-page="events">VIEW CALENDAR ↗</button></div>';
  }
  function deadline(state){
    const d=D(),p=d.dealSession(state),phase=state.deadlineSession;
    const phases=d.PHASES.map((x,i)=>'<div class="deadline-phase '+(i===phase?'deadline-now':i<phase?'deadline-done':'')+'">'+
      '<span>'+esc(x.time)+'</span><strong>'+esc(x.name)+'</strong></div>').join('');
    const listed=state.vehicles.filter(x=>x.status==='listed').length;
    const prep=state.vehicles.filter(x=>x.status==='acquired').length;
    const today=state.sold.filter(x=>x.day===state.day);
    const total=today.reduce((n,x)=>n+x.price,0);
    const month=state.monthPlan;
    const monthSold=state.sold.filter(x=>x.day>=month.startDay&&x.day<=state.day).length;
    const noListed='<p class="event-attention">You currently have no advertised vehicles. Prepare and list stock to take advantage of motivated cash and part-exchange customers.</p>';
    return '<div class="deadline-hero"><div><small>MONTH '+d.monthOf(state.day)+
      ' · FINAL TRADING DAY · NO AUCTIONS</small><h2>DEAL DAY.</h2>'+
      '<p>'+esc(p.detail)+'</p><strong class="deadline-time">'+esc(p.time)+'</strong>'+
      '</div><div class="deadline-alert"><span>SESSION '+(phase+1)+' / '+d.PHASES.length+
      '</span><strong>'+esc(p.name)+'</strong></div></div>'+
      '<div class="deadline-timeline">'+phases+'</div>'+
      '<div class="event-metrics">'+
      '<div><span>TODAY’S RETAIL DEALS</span><strong>'+today.length+'</strong></div>'+
      '<div><span>TODAY’S SALES TURNOVER</span><strong>'+money(total)+'</strong></div>'+
      '<div><span>MONTHLY UNIT TARGET</span><strong>'+monthSold+' / '+month.unitTarget+'</strong></div>'+
      '<div><span>LISTED / NEED PREP</span><strong>'+listed+' / '+prep+'</strong></div></div>'+
      (listed?'<p class="event-good">Your advertised vehicles can attract motivated cash buyers and customers offering part-exchanges.</p>':noListed)+
      '<div class="event-action-grid">'+
      '<div><h3>SELL TO WALK-IN CUSTOMERS</h3><p>Customers are more willing to agree a fair deal as the deadline approaches, but buying decisions still depend on vehicle value. Part-exchange negotiations are also more flexible.</p>'+
      '<button type="button" class="trade-button" data-page="sales">GO TO SALES OFFICE →</button></div>'+
      '<div><h3>BUY FROM PRIVATE SELLERS</h3><p>New walk-in and private-seller leads arrive every session. Some owners will accept slightly lower offers to complete a sale today. You still need cash and forecourt space.</p>'+
      '<button type="button" class="trade-button" data-page="auctions">VIEW PRIVATE SELLERS →</button></div></div>'+
      '<p class="event-note">Auctions are unavailable throughout Deal Day. Each NEXT SESSION advances only the event clock, not the career day or daily payroll. At 17:00, CLOSE MONTH finishes the period and generates the management report. Earlier customer enquiries expire when each new session begins.</p>';
  }
  function suggestions(report){
    if(!report)return ['Set a realistic retail price before accepting offers.',
      'Preserve enough cash to repair and advertise your first vehicles.',
      'Avoid hiring more employees than your current sales can support.'];
    const result=[];
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
    const prior=previous?'<div class="meeting-metrics">'+
      '<div><small>PREVIOUS SALES</small><strong>'+previous.soldUnits+' / '+previous.targetUnits+'</strong></div>'+
      '<div><small>TURNOVER</small><strong>'+money(previous.turnover)+'</strong></div>'+
      '<div><small>GROSS MARGIN</small><strong>'+money(previous.grossMargin)+'</strong></div>'+
      '<div><small>AFTER STAFF COSTS</small><strong>'+money(previous.grossAfterStaff)+'</strong></div>'+
      '<div><small>CLOSING CASH</small><strong>'+money(previous.closingCash)+'</strong></div>'+
      '<div><small>STOCK AGED 14+ DAYS</small><strong>'+previous.agedStock+'</strong></div></div>':
      '<p class="event-note">This is your first dealership briefing. No previous sales have been recorded. Your starting capital, staff and company target are reviewed below.</p>';
    const staff=previous?.sellers.length?previous.sellers.map(s=>
      '<div class="meeting-staff-row"><span>'+esc(s.name)+'</span><strong>'+
      s.sold+' / '+s.unitTarget+' sold</strong><span>'+esc(s.exempt?'EXEMPT':s.hit?'TARGET HIT':'TARGET MISSED')+
      '</span></div>').join(''):
      '<p class="event-note">No individual sales staff results to review yet.</p>';
    const choices=Object.entries(d.FOCI).map(([id,focus])=>
      '<button type="button" class="meeting-choice" data-action="hold-meeting" data-focus="'+id+'"'+
      (done?' disabled':'')+'><strong>'+esc(focus.label)+'</strong><span>'+
      esc(focus.description)+'</span><small>AGREE THIS MONTH’S PRIORITY</small></button>').join('');
    const selected=done?'<div class="event-good"><strong>MEETING COMPLETED.</strong> Monthly priority: '+
      esc(d.FOCI[state.meetingFocus]?.label||'Routine operations')+
      '. This decision is recorded in your career.</div>':'<p class="event-attention">'+
      (state.day===1?'Initial briefing: choose a priority to start managing the business.':
        'ACTION REQUIRED: choose your priority before advancing beyond the first day of this operating month.')+'</p>';
    const record=state.meetings.slice(-4).reverse().map(x=>
      '<div class="meeting-minute"><span>MONTH '+x.month+'</span><strong>'+
      esc(d.FOCI[x.focus]?.label||x.focus)+'</strong><span>Previous sales '+x.sold+
      '/'+x.target+'</span></div>').join('');
    return '<div class="meeting-hero"><small>MONTH '+month+' · FIRST DAY · MANAGEMENT OFFICE</small>'+
      '<h2>BOARD MEETING.</h2><p>'+esc(state.name)+
      ' — review performance, agree priorities and prepare for the next trading period.</p></div>'+
      selected+prior+
      '<div class="meeting-columns"><section class="panel-card event-section"><h3>MANAGEMENT DISCUSSION</h3>'+
      '<div class="meeting-notes">'+notes.map((x,i)=>
        '<div><b>0'+(i+1)+'</b><p>'+esc(x)+'</p></div>').join('')+'</div></section>'+
      '<section class="panel-card event-section"><h3>SALES TEAM REVIEW</h3>'+staff+
      '<h3>NEW MONTH’S TARGETS</h3><p>Dealership target: <strong>'+
      state.monthPlan.unitTarget+' completed vehicles</strong> with a positive gross margin. '+
      'Turnover guidance: '+money(state.monthPlan.turnoverTarget)+
      '. Reputation at meeting: '+state.reputationScore+'/100.</p></section></div>'+
      '<section class="panel-card event-section"><h3>AGREE ONE MANAGEMENT PRIORITY</h3>'+
      '<p>These decisions produce modest, measurable effects on transactions. No guaranteed sales, free money or reputation are awarded.</p>'+
      '<div class="meeting-options">'+choices+'</div></section>'+
      (record?'<section class="panel-card event-section"><h3>RECENT MEETING MINUTES</h3>'+record+'</section>':'')+
      (previous?'<button type="button" class="secondary-button" data-page="reports">OPEN PREVIOUS MONTH’S FULL REPORT ↗</button>':'');
  }
  function render(state){
    const d=D();
    if(d.isDealDay(state.day))return deadline(state);
    if(d.isMeetingDay(state.day))return meeting(state);
    const next=30-state.day%30,meetingMonth=d.monthOf(state.day)+1;
    return '<div class="meeting-hero"><small>MANAGEMENT DIARY · MONTH '+d.monthOf(state.day)+'</small>'+
      '<h2>UPCOMING EVENTS.</h2><p>Your next customer-only Deal Day is in '+next+
      ' game days. Auctions will be closed that day. Your next management meeting is on day '+
      ((meetingMonth-1)*30+1)+'.</p></div>'+
      '<div class="event-action-grid"><div><h3>PREPARE FOR DEAL DAY</h3>'+
      '<p>Have advertised vehicles ready for retail buyers. Keep space and preparation capital available for trade-ins and private sellers.</p>'+
      '<button type="button" class="trade-button" data-page="stock">REVIEW STOCK →</button></div>'+
      '<div><h3>REVIEW THE MONTHLY TARGET</h3><p>Complete profitable retail deals before the period closes. Review employee performance and stock age.</p>'+
      '<button type="button" class="trade-button" data-page="reports">MANAGEMENT REPORT →</button></div></div>';
  }
  window.MotorTradeEventsView=Object.freeze({banner,render});
})();