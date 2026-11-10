'use strict';
/* v0.5 management screens. Data is fictional and escaped for HTML strings. */
(() => {
  const esc=x=>String(x).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
  const gbp=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',
    maximumFractionDigits:0}).format(n);
  const roleName={sales:'SALES EXECUTIVE',buyer:'VEHICLE BUYER',technician:'PREP TECHNICIAN'};
  const traits={
    sales:[['Sales', 'sales'],['Negotiation','negotiation'],['Customer care','care'],['Reliability','reliability']],
    buyer:[['Negotiation','negotiation'],['Vehicle knowledge','knowledge'],['Reliability','reliability'],['Customer care','care']],
    technician:[['Diagnostics','diagnostics'],['Efficiency','efficiency'],['Reliability','reliability'],['Customer care','care']]
  };
  const bar=(name,value)=>
    '<div class="people-trait"><span>'+esc(name)+'</span><div class="people-track">'+
    '<span style="width:'+value*5+'%"></span></div><b>'+value+'/20</b></div>';
  function header(person){
    return '<div class="people-head"><div><span class="people-role">'+
      esc(roleName[person.role])+'</span><h3>'+esc(person.name)+'</h3>'+
      '<small>'+person.experience+' YEARS EXPERIENCE</small></div>'+
      '<span class="people-salary">'+gbp(person.monthlySalary)+'<small>BASE / MONTH</small></span></div>';
  }
  const labels={
    sales:'Influences buyer offers and customer-service reputation. Commission: 3% of positive gross deal margin.',
    buyer:'Can secure more competitive private-seller agreements and provide auction rival-bid intelligence.',
    technician:'Can reduce the basic labour/preparation allowance. Additional fault and parts costs remain.'
  };
  function applicants(state,P){
    const candidates=P.applicants(state.day);
    return candidates.map(candidate=>{
      const filled=state.staff.some(e=>e.role===candidate.role);
      const paused=state.staff.length>=P.MAX_STAFF;
      const traitsHtml=traits[candidate.role].map(([a,k])=>bar(a,candidate.skills[k])).join('');
      return '<article class="people-card">'+header(candidate)+
        '<div class="people-traits">'+traitsHtml+'</div>'+
        '<p class="people-caption">'+esc(labels[candidate.role])+'</p>'+
        '<div class="people-card-footer"><span>ONBOARDING '+gbp(P.HIRING_FEE)+
        ' · STARTS NEXT DAY</span>'+
        '<button type="button" class="trade-button" data-action="hire-staff" data-id="'+
          esc(candidate.id)+'"'+(filled||paused?' disabled':'')+'>'+
          (filled?'ROLE FILLED':paused?'TEAM FULL':'HIRE EMPLOYEE')+'</button></div></article>';
    }).join('');
  }
  function roster(state,P){
    if(!state.staff.length)return '<div class="trade-empty"><h2>OWNER OPERATED.</h2>'+
      '<p>You handle vehicle sourcing, sales and workshop coordination. Hiring adds expertise and ongoing expenses.</p></div>';
    return state.staff.map(employee=>{
      const active=P.active(state,employee.role)?.id===employee.id;
      const status=state.payrollArrears>0?'PAYROLL OVERDUE':
        state.day<employee.startDay?'STARTS DAY '+employee.startDay:
        employee.trainingUntil!==null&&state.day<employee.trainingUntil?
        'TRAINING UNTIL DAY '+employee.trainingUntil:
        active?'AVAILABLE':'UNAVAILABLE';
      return '<article class="people-card">'+header(employee)+
        '<div class="people-meta"><span>'+esc(status)+'</span>'+
        '<span>MORALE '+employee.morale+'/100</span>'+
        '<span>'+employee.deals+' DEALS · '+employee.workDone+' PREP JOBS</span></div>'+
        '<div class="people-traits">'+traits[employee.role].map(([a,k])=>bar(a,employee.skills[k])).join('')+'</div>'+
        '<p class="people-caption">'+esc(labels[employee.role])+'</p>'+
        '<div class="people-card-footer"><span>DAILY WAGE PROVISION '+gbp(P.dailyCost(employee))+'</span>'+
        '<div class="people-actions"><button type="button" class="trade-button trade-button-secondary" data-action="train-staff" data-id="'+employee.id+'">TRAIN · '+gbp(P.TRAINING_FEE)+'</button>'+
        '<button type="button" class="trade-button people-release" data-action="release-staff" data-id="'+employee.id+'">RELEASE</button></div></div></article>';
    }).join('');
  }
  const levels=[
    {min:0,max:19,name:'NEW TRADER'},
    {min:20,max:39,name:'LOCAL DEALER'},
    {min:40,max:59,name:'TRUSTED DEALER'},
    {min:60,max:79,name:'REGIONAL SPECIALIST'},
    {min:80,max:100,name:'PRESTIGE DEALER'}
  ];
  function reputation(state){
    const score=state.reputationScore;
    const turnover=state.sold.reduce((n,s)=>n+s.price,0);
    const next=levels.find(l=>score<l.max+1)||levels[levels.length-1];
    const upcoming=levels.find(l=>l.min>score);
    const history=[...state.reputationHistory].reverse().slice(0,20);
    const milestones=levels.map(l=>'<div class="reputation-tier '+(score>=l.min?'rep-tier-earned':'')+
      '"><div><strong>'+esc(l.name)+'</strong><small>'+l.min+'–'+l.max+' / 100</small></div>'+
      '<span>'+(score>=l.min?'REACHED':'LOCKED')+'</span></div>').join('');
    const entries=history.length?history.map(entry=>
      '<div class="reputation-event"><span>DAY '+entry.day+'</span><strong class="'+
      (entry.delta>=0?'rep-positive':'rep-negative')+'">'+(entry.delta>0?'+':'')+
      entry.delta+'</strong><p>'+esc(entry.reason)+'</p></div>').join(''):
      '<p class="people-caption">Your reputation history begins after your first completed sale or payroll issue.</p>';
    return '<div class="reputation-highlight"><div><small>DEALERSHIP STANDING</small>'+
      '<h2>'+esc(state.reputation)+'</h2><strong>'+score+'<span> / 100</span></strong>'+
      '<p>'+(upcoming?'NEXT LEVEL AT '+upcoming.min+' REPUTATION':
        'HIGHEST REPUTATION TIER REACHED')+'</p></div>'+
      '<div class="reputation-track"><span style="width:'+score+'%"></span></div></div>'+
      '<div class="people-metrics"><div><span>VEHICLES SOLD</span><strong>'+state.sold.length+
      '</strong></div><div><span>LIFETIME SALES TURNOVER</span><strong>'+gbp(turnover)+
      '</strong></div><div><span>ACTIVE STAFF</span><strong>'+state.staff.length+
      '</strong></div><div><span>PAYROLL OWED</span><strong>'+gbp(state.payrollArrears)+'</strong></div></div>'+
      '<p class="trade-alert">Reputation rises through completed deals, vehicle condition and good customer care. '+
      'High-risk vehicles, inflated prices and unpaid wages can reduce it. Higher tiers will support premium seller opportunities in a later update; '+
      'this release does not yet generate luxury stock.</p>'+
      '<div class="reputation-layout"><section class="panel-card people-section"><h3>REPUTATION LEVELS</h3>'+
      milestones+'</section><section class="panel-card people-section"><h3>RECENT CUSTOMER & STAFF OUTCOMES</h3>'+
      entries+'</section></div>'+
      '<div class="panel-card people-section"><h3>LONG-TERM PRESTIGE TARGET</h3>'+
      '<p>Future prestige seller market: target 80+ reputation and '+gbp(500000)+
      ' lifetime sales turnover. Your current turnover is '+gbp(turnover)+
      '. This is a development target, not an unlocked car market yet.</p></div>';
  }
  function totals(state,P){
    const wages=state.staff.reduce((sum,employee)=>sum+P.dailyCost(employee),0);
    const total=state.staff.reduce((sum,employee)=>sum+employee.monthlySalary,0);
    return '<div class="people-metrics"><div><span>EMPLOYEES</span><strong>'+
      state.staff.length+' / '+P.MAX_STAFF+'</strong></div>'+
      '<div><span>DAILY WAGE SETTLEMENT</span><strong>'+gbp(wages)+'</strong></div>'+
      '<div><span>MONTHLY BASE PAY</span><strong>'+gbp(total)+'</strong></div>'+
      '<div><span>UNPAID PAYROLL / NOTICE</span><strong>'+gbp(state.payrollArrears)+'</strong></div></div>';
  }
  window.MotorTradePeopleView=Object.freeze({applicants,roster,reputation,totals});
})();
