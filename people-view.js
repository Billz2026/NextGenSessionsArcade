'use strict';
/* v0.9.32 employment desk. Data is fictional and escaped for HTML strings. */
(() => {
  const esc=x=>String(x).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
  const gbp=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',
    maximumFractionDigits:0}).format(n);
  const roleName={sales:'SALES EXECUTIVE',buyer:'VEHICLE BUYER',technician:'PREP TECHNICIAN',supervisor:'STAFF SUPERVISOR'};
  const traits={
    sales:[['Sales', 'sales'],['Negotiation','negotiation'],['Customer care','care'],['Reliability','reliability']],
    buyer:[['Negotiation','negotiation'],['Vehicle knowledge','knowledge'],['Reliability','reliability'],['Customer care','care']],
    technician:[['Diagnostics','diagnostics'],['Efficiency','efficiency'],['Reliability','reliability'],['Customer care','care']],
    supervisor:[['People leadership','care'],['Staff communication','negotiation'],['Reliability','reliability'],['Trade knowledge','knowledge']]
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
    sales:'Creates more enquiries, gets buyers to view sooner and improves test-drive conversion and negotiations. Higher performers earn a larger share of positive gross margin.',
    buyer:'Can secure more competitive private-seller agreements and provide auction rival-bid intelligence.',
    technician:'Runs one assigned in-house repair at a time. More technicians enable parallel preparation, but wages and parts still cost money.',
    supervisor:'Manages routine rota and morale check-ins automatically each week. Escalates costed staff-support proposals to you for approval or refusal. One supervisor maximum; salary continues daily.'
  };
  function salesForecast(person,P){
    if(person.role!=='sales')return '';
    const p=P.salesProfile(person);
    return '<div class="people-caption"><strong>SALES IMPACT:</strong> +'+p.enquiryLift+
      ' percentage points to enquiry chance · +'+p.driveLift+
      ' to drive conversion · '+(p.fastViewing?'NEXT-DAY VIEWINGS':'UP TO 48-HOUR VIEWINGS')+
      ' · '+Math.round(p.commissionRate*100)+'% commission on positive gross margin.</div>';
  }
  function applicants(state,P){
    const candidates=P.applicants(state.day);
    const cards=candidates.map(candidate=>{
      const already=state.staff.some(e=>e.name===candidate.name);
      const filled=state.staff.filter(e=>e.role===candidate.role).length>=
        P.roleLimit(state,candidate.role);
      const paused=state.staff.length>=P.staffLimit(state);
      const traitsHtml=traits[candidate.role].map(([a,k])=>bar(a,candidate.skills[k])).join('');
      const quote=P.hireQuote(state,candidate);
      const costText='REQUIRES '+gbp(quote.required)+' TOTAL CASH · '+P.WAGE_COVER_DAYS+
        ' DAYS WAGE COVER · PROTECTED REPAIRS '+gbp(quote.protectedStock)+
        (quote.shortfall?' · SHORT BY '+gbp(quote.shortfall):' · AFFORDABLE NOW');
      return '<article class="people-card">'+header(candidate)+
        '<div class="people-traits">'+traitsHtml+'</div>'+
        '<p class="people-caption">'+esc(labels[candidate.role])+'</p>'+
        salesForecast(candidate,P)+
        '<div class="people-card-footer"><span>'+costText+'</span>'+
        '<button type="button" class="trade-button" data-action="hire-staff" data-id="'+
          esc(candidate.id)+'"'+(already||filled||paused||!!quote.shortfall?' disabled':'')+'>'+
          (already?'ALREADY HIRED':filled?(candidate.role==='technician'?'TECHNICIAN PLACES FULL':'ROLE FILLED'):
            paused?'TEAM FULL':quote.shortfall?'NOT ENOUGH CASH':'HIRE EMPLOYEE')+
          '</button></div></article>';
    });
    const names={sales:'SALES EXECUTIVES',buyer:'VEHICLE BUYERS',technician:'WORKSHOP TECHNICIANS',supervisor:'STAFF SUPERVISORS'};
    return '<p class="trade-alert">Applicants refresh every seven game days. Choose one staff supervisor to manage routine morale concerns and propose owner-approved interventions. Hire technicians up to your unlocked workshop capacity. '+
      'Each hire needs a £'+P.HIRING_FEE+' onboarding charge, protected repair funds and '+P.WAGE_COVER_DAYS+
      ' days of team wages; monthly salaries continue afterward. A new employee starts the following game day.</p>'+
      ['supervisor','technician','sales','buyer'].map(role=>
        '<section class="people-recruit-group"><h3>'+names[role]+' · '+
        candidates.filter(c=>c.role===role).length+' CANDIDATES · '+
        state.staff.filter(e=>e.role===role).length+'/'+P.roleLimit(state,role)+' HIRED</h3>'+
        '<div class="people-recruit-grid">'+candidates.filter(c=>c.role===role).map(c=>
          cards[candidates.indexOf(c)]).join('')+'</div></section>').join('');
  }
  function roster(state,P){
    if(!state.staff.length)return '<div class="trade-empty"><h2>OWNER OPERATED.</h2>'+
      '<p>You handle vehicle sourcing, sales and workshop coordination. Hiring adds expertise and ongoing expenses.</p></div>';
    return state.staff.map(employee=>{
      const active=P.isActive(state,employee);
      const assigned=employee.role==='technician'?state.vehicles.find(v=>
        v.workshop?.technicianId===employee.id&&v.workshop.method==='internal'&&
        ['in-progress','quality-check'].includes(v.workshop.stage)):null;
      const status=state.payrollArrears>0?'PAYROLL OVERDUE':
        state.day<employee.startDay?'STARTS DAY '+employee.startDay:
        employee.trainingUntil!==null&&state.day<employee.trainingUntil?
        'TRAINING UNTIL DAY '+employee.trainingUntil:
        active?(assigned?'ASSIGNED TO STOCK '+assigned.id:'AVAILABLE'):'UNAVAILABLE';
      return '<article class="people-card">'+header(employee)+
        '<div class="people-meta"><span>'+esc(status)+'</span>'+
        '<span>MORALE '+employee.morale+'/100</span>'+
        '<span>'+employee.deals+' DEALS · '+employee.workDone+' PREP JOBS</span></div>'+
        '<div class="people-traits">'+traits[employee.role].map(([a,k])=>bar(a,employee.skills[k])).join('')+'</div>'+
        '<p class="people-caption">'+esc(labels[employee.role])+'</p>'+salesForecast(employee,P)+
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
    const technicians=state.staff.filter(s=>s.role==='technician').length;
    const salespeople=state.staff.filter(s=>s.role==='sales').length;
    const next=state.reputationScore<40?'6 technician places at 40 reputation':
      state.reputationScore<80?'8 technician places at 80 reputation':null;
    return '<div class="people-metrics"><div><span>EMPLOYEES</span><strong>'+
      state.staff.length+' / '+P.staffLimit(state)+'</strong></div>'+
      '<div><span>DAILY WAGE SETTLEMENT</span><strong>'+gbp(wages)+'</strong></div>'+
      '<div><span>MONTHLY BASE PAY</span><strong>'+gbp(total)+'</strong></div>'+
      '<div><span>UNPAID PAYROLL / NOTICE</span><strong>'+gbp(state.payrollArrears)+'</strong></div>'+
      '<div><span>IN-HOUSE TECHNICIANS</span><strong>'+technicians+' / '+P.technicianLimit(state)+'</strong></div>'+
      '<div><span>SALES EXECUTIVES</span><strong>'+salespeople+' / '+P.salesLimit(state)+'</strong></div>'+ 
      '</div><p class="trade-alert">You can hire four technicians immediately, subject to a clear three-day wage buffer. '+
      'Each works on a separate vehicle. You can hire one sales executive at first, two at 40 reputation and three at 80, alongside one buyer. '+
      (next?'NEXT UNLOCK: '+next+'.':'All eight technician places are unlocked.')+'</p>';
  }

  /* v0.9.31 — Staff control centre. Read-only view over existing people rules. */
  const DESK_MODES=Object.freeze(['team','candidates']);
  const DESK_ROLES=Object.freeze(['all','sales','buyer','technician','supervisor']);
  const groupName={sales:'SALES',buyer:'BUYING',technician:'WORKSHOP',supervisor:'MANAGEMENT'};
  function employeeStatus(state,P,e){
    const assigned=e.role==='technician'?state.vehicles.find(v=>
      v.workshop?.technicianId===e.id&&v.workshop.method==='internal'&&
      ['in-progress','quality-check'].includes(v.workshop.stage)):null;
    if(state.payrollArrears>0)return {name:'PAYROLL OVERDUE',tone:'warning'};
    if(state.day<e.startDay)return {name:'STARTS DAY '+e.startDay,tone:'waiting'};
    if(e.trainingUntil!==null&&state.day<e.trainingUntil)
      return {name:'TRAINING TO DAY '+e.trainingUntil,tone:'waiting'};
    if(!P.isActive(state,e))return {name:'UNAVAILABLE',tone:'warning'};
    if(assigned)return {name:'WORKING · STOCK '+assigned.id,tone:'busy'};
    return {name:'AVAILABLE',tone:'available'};
  }
  function recruitStatus(state,P,c){
    const hired=state.staff.some(e=>e.name===c.name);
    const roleFull=state.staff.filter(e=>e.role===c.role).length>=P.roleLimit(state,c.role);
    const teamFull=state.staff.length>=P.staffLimit(state);
    const quote=P.hireQuote(state,c);
    const reason=hired?'ALREADY EMPLOYED':roleFull?'ROLE CAPACITY FULL':
      teamFull?'TEAM FULL':quote.shortfall?'INSUFFICIENT CASH':'CAN HIRE';
    return {reason,quote,canHire:!hired&&!roleFull&&!teamFull&&!quote.shortfall};
  }
  function deskCounts(state,P){
    const candidatePool=P.applicants(state.day);
    const employed=state.staff;
    return {employed:employed.length,active:employed.filter(e=>P.isActive(state,e)).length,
      techniciansFree:P.availableTechnicians(state).length,
      daily:employed.reduce((n,e)=>n+P.dailyCost(e),0),
      monthly:employed.reduce((n,e)=>n+e.monthlySalary,0),
      rolesUsed:employed.length,rolesTotal:P.staffLimit(state),
      candidates:candidatePool.length,
      hireable:candidatePool.filter(c=>recruitStatus(state,P,c).canHire).length};
  }
  function staffRow(state,P,person,mode,selected){
    const hired=mode==='team',info=hired?employeeStatus(state,P,person):
      recruitStatus(state,P,person);
    const label=hired?info.name:info.reason;
    const tone=hired?info.tone:info.canHire?'available':'warning';
    const id=hired?'e:'+person.id:'c:'+person.id;
    return '<button type="button" class="sd-person'+(selected?' sd-person-active':'')+
      '" data-action="select-person" data-person="'+esc(id)+'"'+
      ' aria-pressed="'+String(selected)+'">'+
      '<span class="sd-person-main"><small>'+esc(roleName[person.role])+'</small>'+
      '<strong>'+esc(person.name)+'</strong><span>'+gbp(person.monthlySalary)+
      ' / MONTH · '+person.experience+' YEARS EXPERIENCE</span></span>'+
      '<em class="sd-tag sd-tag-'+tone+'">'+esc(label)+'</em></button>';
  }
  function skillSection(person,P){
    const roleInfo=person.role==='sales'?'ROLE IMPACT & COMMISSION':'HOW THIS ROLE HELPS';
    return '<section class="sd-competence"><div class="sd-section-head"><h4>SKILLS & EXPERIENCE</h4>'+
      '<span>RATINGS OUT OF 20</span></div><div class="sd-skills">'+
      traits[person.role].map(([name,key])=>bar(name,person.skills[key])).join('')+
      '</div><details class="sd-role-impact"><summary>'+roleInfo+'</summary>'+
      '<p>'+esc(labels[person.role])+'</p>'+salesForecast(person,P)+'</details></section>';
  }
  function employeeDetail(state,P,e){
    const info=employeeStatus(state,P,e);
    const dayRate=P.dailyCost(e);
    const notice=dayRate*7;
    const protectedFunds=P.hireQuote(state,e).protectedStock;
    const cooldown=e.lastTrainingDay&&state.day-e.lastTrainingDay<14;
    const training=e.trainingUntil!==null&&state.day<e.trainingUntil;
    const affordable=state.cash>=P.TRAINING_FEE+protectedFunds+state.payrollArrears;
    const block=training?'ALREADY TRAINING':cooldown?
      'NEXT TRAINING DAY '+(e.lastTrainingDay+14):!affordable?'INSUFFICIENT UNRESERVED CASH':'';
    return '<div class="sd-dossier"><header class="sd-file-head"><div><small>EMPLOYEE FILE · ID '+
      e.id+' · '+esc(roleName[e.role])+'</small><h3>'+esc(e.name)+'</h3></div>'+
      '<span class="sd-tag sd-tag-'+info.tone+'">'+esc(info.name)+'</span></header>'+
      '<div class="sd-staff-summary">'+
      '<div><small>MONTHLY BASE WAGE</small><strong>'+gbp(e.monthlySalary)+'</strong></div>'+
      '<div><small>DAILY PAYROLL</small><strong>'+gbp(dayRate)+'</strong></div>'+
      '<div><small>MORALE</small><strong>'+e.morale+' / 100</strong></div>'+
      '<div><small>START DATE</small><strong>DAY '+e.startDay+'</strong></div></div>'+
      '<div class="sd-person-detail"><div>'+skillSection(e,P)+
      '<div class="sd-performance"><div><small>RETAIL DEALS</small><strong>'+e.deals+
      '</strong></div><div><small>PREPARATION JOBS</small><strong>'+e.workDone+
      '</strong></div><div><small>HIRED DAY</small><strong>'+e.hiredDay+
      '</strong></div></div></div><div class="sd-control"><div class="sd-section-head">'+
      '<h4>EMPLOYEE DECISIONS</h4><span>CONFIRMED ACTIONS</span></div>'+
      '<div class="sd-action-panel"><h5>STAFF TRAINING</h5>'+
      '<p>Costs '+gbp(P.TRAINING_FEE)+'. The employee is unavailable for two game days. '+
      'Role-specific skills and morale improve; wages still continue.</p>'+
      (block?'<p class="sd-issue">'+esc(block)+'</p>':'')+
      '<button type="button" class="trade-button" data-action="train-staff" data-id="'+e.id+'"'+
      (block?' disabled':'')+'>AUTHORISE TRAINING · '+gbp(P.TRAINING_FEE)+'</button></div>'+
      '<details class="sd-release"><summary>RELEASE EMPLOYEE / NOTICE COST</summary>'+
      '<p>Seven game days of provisional notice pay: <strong>'+gbp(notice)+'</strong>. '+
      'This may create unpaid payroll obligations if funds are insufficient. '+
      'The employee immediately leaves the team.</p>'+
      '<button type="button" class="trade-button people-release" data-action="release-staff" '+
      'data-id="'+e.id+'">RELEASE '+esc(e.name.toUpperCase())+'</button></details>'+
      '</div></div></div>';
  }
  function candidateDetail(state,P,c){
    const info=recruitStatus(state,P,c),q=info.quote;
    const todayCash=state.cash;
    const currentDaily=state.staff.reduce((n,e)=>n+P.dailyCost(e),0);
    const staffDaily=P.dailyCost(c);
    return '<div class="sd-dossier"><header class="sd-file-head"><div><small>RECRUITMENT FILE · '+
      esc(roleName[c.role])+'</small><h3>'+esc(c.name)+'</h3></div>'+
      '<span class="sd-tag sd-tag-'+(info.canHire?'available':'warning')+'">'+
      esc(info.reason)+'</span></header>'+
      '<div class="sd-staff-summary">'+
      '<div><small>MONTHLY BASE WAGE</small><strong>'+gbp(c.monthlySalary)+'</strong></div>'+
      '<div><small>DAILY PAYROLL ADDED</small><strong>'+gbp(staffDaily)+'</strong></div>'+
      '<div><small>EXPERIENCE</small><strong>'+c.experience+' YEARS</strong></div>'+
      '<div><small>ROLE CAPACITY</small><strong>'+
      state.staff.filter(e=>e.role===c.role).length+' / '+P.roleLimit(state,c.role)+
      '</strong></div></div>'+
      '<div class="sd-person-detail"><div>'+skillSection(c,P)+
      '</div><div class="sd-control"><div class="sd-section-head"><h4>HIRING DECISION</h4>'+
      '<span>STARTS NEXT GAME DAY</span></div>'+
      '<div class="sd-hire-figures">'+
      '<div><span>DEALERSHIP CASH TODAY</span><strong>'+gbp(todayCash)+'</strong></div>'+
      '<div><span>ONE-OFF ONBOARDING FEE</span><strong>'+gbp(P.HIRING_FEE)+'</strong></div>'+
      '<div><span>PROTECTED VEHICLE REPAIRS</span><strong>'+gbp(q.protectedStock)+'</strong></div>'+
      '<div><span>TEAM WAGES PER DAY AFTER HIRE</span><strong>'+gbp(q.dailyWages)+'</strong></div>'+
      '<div><span>3-DAY WAGE COVER</span><strong>'+
      gbp(q.dailyWages*P.WAGE_COVER_DAYS)+'</strong></div>'+
      (state.payrollArrears?'<div><span>EXISTING PAYROLL ARREARS</span><strong>'+
        gbp(state.payrollArrears)+'</strong></div>':'')+
      '<div class="sd-required"><span>TOTAL CASH NEEDED TO HIRE</span><strong>'+
      gbp(q.required)+'</strong></div></div>'+
      (q.shortfall?'<p class="sd-issue">SHORT BY '+gbp(q.shortfall)+
        '. Increase cash before taking on this salary.</p>':'')+
      (!info.canHire&&!q.shortfall?'<p class="sd-issue">'+esc(info.reason)+
        '. This role or candidate cannot be hired right now.</p>':'')+
      '<button type="button" class="trade-button" data-action="hire-staff" data-id="'+
      esc(c.id)+'"'+(info.canHire?'':' disabled')+'>'+
      (info.canHire?'HIRE '+esc(c.name.toUpperCase())+' · '+gbp(P.HIRING_FEE):
        'CANNOT HIRE · '+esc(info.reason))+'</button>'+
      '<p class="sd-fine">Hiring charges only the onboarding fee now. '+gbp(staffDaily)+
      ' daily wages begin thereafter. Cash is reserved for three days of total payroll, '+
      'existing arrears and outstanding vehicle preparation.</p>'+
      '</div></div></div>';
  }
  function staffDesk(state,P,{mode=null,role='all',selectedId=null}={}){
    const counts=deskCounts(state,P);
    const activeMode=DESK_MODES.includes(mode)?mode:
      state.staff.length?'team':'candidates';
    const f=DESK_ROLES.includes(role)?role:'all';
    const source=activeMode==='team'?state.staff:P.applicants(state.day);
    const filtered=source.filter(person=>f==='all'||person.role===f);
    const chosen=filtered.find(p=>(activeMode==='team'?'e:':'c:')+p.id===selectedId)||
      filtered[0]||null;
    const chosenId=chosen?(activeMode==='team'?'e:':'c:')+chosen.id:null;
    const week=Math.floor((state.day-1)/7);
    const nextRefresh=(week+1)*7+1;
    const quick='<div class="sd-kpis">'+[
      ['EMPLOYEES HIRED',counts.employed+' / '+counts.rolesTotal],
      ['ACTIVE TODAY',String(counts.active)],
      ['DAILY WAGE BILL',gbp(counts.daily)],
      ['CANDIDATES ON MARKET',String(counts.candidates)]
    ].map(([title,value])=>'<div><small>'+title+'</small><strong>'+value+
      '</strong></div>').join('')+'</div>';
    const alert=state.payrollArrears?
      '<div class="sd-cash-alert"><strong>UNPAID WAGES '+gbp(state.payrollArrears)+'</strong>'+
      '<span>Employees are unavailable while payroll arrears remain outstanding.</span></div>':
      state.cash<counts.daily*3&&counts.employed?
      '<div class="sd-cash-alert"><strong>PAYROLL RISK</strong><span>Cash '+gbp(state.cash)+
      ' is less than three days of wages ('+gbp(counts.daily*3)+').</span></div>':'';
    const toolbar='<div class="sd-toolbar"><div class="sd-tabs" role="group" aria-label="Employee or candidate records">'+
      '<button type="button" data-action="staff-desk-mode" data-mode="team" aria-pressed="'+
      String(activeMode==='team')+'">YOUR TEAM <b>'+counts.employed+'</b></button>'+
      '<button type="button" data-action="staff-desk-mode" data-mode="candidates" aria-pressed="'+
      String(activeMode==='candidates')+'">AVAILABLE CANDIDATES <b>'+counts.candidates+'</b></button>'+
      '</div><div class="sd-roles" role="group" aria-label="Filter employment roles">'+
      DESK_ROLES.map(id=>'<button type="button" data-action="staff-desk-role" data-role="'+id+
        '" aria-pressed="'+String(f===id)+'">'+
        (id==='all'?'ALL ROLES':groupName[id])+'</button>').join('')+
      '</div></div>';
    const listing=filtered.length?filtered.map(p=>staffRow(state,P,p,activeMode,p===chosen)).join(''):
      '<div class="sd-no-results">'+(activeMode==='team'?
        'No employees in this role yet. Review candidates to fill the vacancy.':
        'No candidates match this role this week.')+'</div>';
    const body=chosen?(activeMode==='team'?employeeDetail(state,P,chosen):
      candidateDetail(state,P,chosen)):
      '<div class="sd-dossier sd-no-results">No '+(activeMode==='team'?
        'staff records':'applicants')+' to display. Select a different role or tab.</div>';
    const context=activeMode==='team'?
      '<span>ACTIVE TECHNICIANS FREE '+counts.techniciansFree+
      ' · MONTHLY BASE PAY '+gbp(counts.monthly)+'</span>':
      '<span>'+counts.hireable+' AFFORDABLE / ELIGIBLE TO HIRE · REFRESHES DAY '+
      nextRefresh+'</span>';
    return {mode:activeMode,role:f,selectedId:chosenId,counts,
      html:quick+alert+toolbar+
      '<div class="sd-context">'+context+'</div>'+
      '<div class="sd-layout"><aside class="sd-register" aria-label="'+
      (activeMode==='team'?'Current employees':'Candidate shortlist')+'">'+
      '<div class="sd-register-head">'+(activeMode==='team'?'CONTRACTED EMPLOYEES':'WEEKLY RECRUITMENT SHORTLIST')+
      '<span>'+filtered.length+' SHOWN</span></div>'+
      '<div class="sd-register-list">'+listing+'</div></aside>'+body+'</div>'+
      '<details class="sd-policy"><summary>EMPLOYMENT RULES & PAYROLL EXPLANATION</summary>'+
      '<p>Staff join on the following game day. Training takes two days, during which their work stops. '+
      'Base wages are settled daily at approximately 1/30 of the monthly salary. Bonuses and '+
      'provisional notice charges can increase payroll. Employer taxes, pensions, UK contracts '+
      'and statutory notice rules are not simulated. Candidates change every seven game days. '+
      'Hiring is limited by staffing places, role capacity and protected cash.</p></details>'};
  }

  window.MotorTradePeopleView=Object.freeze({applicants,roster,reputation,totals,
    staffDesk,deskCounts,employeeStatus,recruitStatus,DESK_MODES,DESK_ROLES});
})();
