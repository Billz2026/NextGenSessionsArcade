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
    sales:'Handles enquiries, makes next-day callbacks, attempts to book viewings and improves test-drive conversion. Wages and employer costs continue even when no cars sell; commission applies only to completed profitable deals.',
    buyer:'Can secure more competitive private-seller agreements and provide auction rival-bid intelligence.',
    technician:'Runs one assigned in-house repair at a time. More technicians enable parallel preparation, but wages and parts still cost money.',
    supervisor:'Manages routine rota and morale check-ins automatically each week. Escalates costed staff-support proposals to you for approval or refusal. One supervisor maximum; salary continues daily.'
  };
  function salesForecast(person,P){
    if(person.role!=='sales')return '';
    const p=P.salesProfile(person);
    return '<div class="people-caption"><strong>SALES IMPACT:</strong> +'+p.enquiryLift+
      ' lead-generation score (partly applied to the daily chance) · +'+p.driveLift+
      ' test-drive boost · NEXT-DAY BUYER CALLBACKS · '+(p.fastViewing?'NEXT-DAY VIEWINGS':'UP TO 48-HOUR VIEWINGS')+
      ' · '+Math.round(p.commissionRate*100)+'% commission on positive gross margin.'+
      ' Buyer callbacks, contact volume and appointment conversion depend on their availability and skills. Extra contacts are NOT guaranteed extra sales.</div>';
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
        '<span>'+employee.deals+' DEALS · '+employee.workDone+
        (employee.role==='sales'?' CUSTOMER CONTACTS':' PREP JOBS')+'</span></div>'+
        '<div class="people-traits">'+traits[employee.role].map(([a,k])=>bar(a,employee.skills[k])).join('')+'</div>'+
        '<p class="people-caption">'+esc(labels[employee.role])+'</p>'+salesForecast(employee,P)+
        '<div class="people-card-footer"><span>DAILY WAGE PROVISION '+gbp(P.dailyCost(employee))+'</span>'+
        '<div class="people-actions"><button type="button" class="trade-button trade-button-secondary" data-action="train-staff" data-id="'+employee.id+'">TRAIN · '+gbp(P.TRAINING_FEE)+'</button>'+
        '<button type="button" class="trade-button people-release" data-action="release-staff" data-id="'+employee.id+'">RELEASE</button></div></div></article>';
    }).join('');
  }
  const levels=[
    {min:0,max:19,name:'NEW TRADER',benefit:'Starting reputation tier'},
    {min:20,max:39,name:'LOCAL DEALER',benefit:'First forecourt expansion becomes eligible'},
    {min:40,max:59,name:'TRUSTED DEALER',benefit:'Extra sales and technician hiring capacity'},
    {min:60,max:79,name:'REGIONAL SPECIALIST',benefit:'Regional standing; luxury market needs 65+ and cash'},
    {min:80,max:100,name:'PRESTIGE DEALER',benefit:'Highest staff capacity and premises eligibility'}
  ];
  function reputation(state){
    const score=Math.max(0,Math.min(100,state.reputationScore));
    const current=levels.find(l=>score>=l.min&&score<=l.max)||levels[0];
    const next=levels.find(l=>l.min>score)||null;
    const points=next?next.min-score:0;
    const pct=Math.max(0,Math.min(100,score));
    const sales=state.sold||[];
    const totalTurnover=sales.reduce((n,row)=>n+row.price,0);
    const events=Array.isArray(state.reputationHistory)?state.reputationHistory:[];
    const latest=[...events].reverse();
    const recent=events.filter(e=>e.day>=Math.max(1,state.day-29));
    const delta=recent.reduce((n,e)=>n+e.delta,0);
    const deltaLabel=(delta>0?'+':'')+delta;
    const deltaTone=delta>0?' rep-good':delta<0?' rep-bad':'';
    const payroll=state.payrollArrears||0;
    const premises=state.premises?.arrears||0;
    const firstTarget=next?next.min:100;
    const earnedTier=levels.findIndex(x=>x===current);
    const tierRows=levels.map((l,i)=>{
      const standing=i===earnedTier?'CURRENT':i<earnedTier?'BELOW CURRENT':'NOT YET REACHED';
      const cls=i===earnedTier?' rep-current':i<earnedTier?' rep-passed':' rep-locked';
      return '<div class="rep-stage'+cls+'"><span class="rep-stage-no">'+
        String(i+1).padStart(2,'0')+'</span><div class="rep-stage-name">'+
        '<strong>'+esc(l.name)+'</strong><small>'+esc(l.benefit)+'</small></div>'+
        '<span class="rep-stage-range">'+l.min+'–'+l.max+'</span>'+
        '<em>'+standing+'</em></div>';
    }).join('');
    const entry=row=>{
      const positive=row.delta>0,negative=row.delta<0;
      return '<div class="rep-change"><span>DAY '+row.day+'</span>'+
        '<strong class="'+(positive?'rep-good':negative?'rep-bad':'')+'">'+
        (row.delta>0?'+':'')+row.delta+'</strong>'+
        '<p>'+esc(row.reason)+'</p></div>';
    };
    const last=latest.slice(0,2);
    const newest=last.length?last.map(entry).join(''):
      '<div class="rep-empty">No reputation changes recorded yet. Completed deals and '+
      'operating issues will appear here.</div>';
    const more=latest.slice(2);
    const cashNumber=gbp(totalTurnover);
    const risk=payroll?
      '<div class="rep-risk"><strong>PAYROLL NEEDS ATTENTION</strong><span>'+
        gbp(payroll)+' in unpaid staff obligations can affect trust.</span>'+
        '<button type="button" data-page="staff">OPEN STAFF DESK</button></div>':
      premises?
      '<div class="rep-risk"><strong>PREMISES BILLS OUTSTANDING</strong><span>'+
        gbp(premises)+' due. Extended arrears can lower reputation.</span>'+
        '<button type="button" data-page="finance">VIEW FINANCES</button></div>':
      '<div class="rep-priority"><strong>KEEP THE MOMENTUM</strong>'+
        '<span>Prepare vehicles properly, price realistically and complete quality handovers.</span>'+
        '<button type="button" data-page="workshop">VIEW WORKSHOP</button></div>';
    const scoreHero='<section class="rep-hero" aria-label="Current dealership reputation">'+
      '<div class="rep-hero-id"><div><small>YOUR DEALERSHIP STANDING</small>'+
        '<h2>'+esc(current.name)+'</h2>'+
        '<p>'+esc(state.name)+' · Day '+state.day+'</p></div>'+
        '<div class="rep-score"><strong>'+score+'</strong><span>/ 100</span></div></div>'+
      '<div class="rep-progress" role="progressbar" aria-label="Reputation score" '+
        'aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+score+'">'+
        '<div style="width:'+pct+'%"></div></div>'+
      '<div class="rep-next"><span>'+(next?
        '<strong>'+points+' POINT'+(points===1?'':'S')+' TO '+esc(next.name)+'</strong>'+
        ' · NEXT TIER AT '+firstTarget:
        '<strong>HIGHEST REPUTATION TIER</strong> · KEEP CUSTOMER TRUST HIGH')+
        '</span><span>CURRENT SCORE '+score+' / 100</span></div></section>';
    const metrics='<div class="rep-kpis">'+
      [['VEHICLES HANDED OVER',String(sales.length),'Completed retail sales'],
       ['LIFETIME SALES TURNOVER',cashNumber,'Completed sales only'],
       ['LAST 30 GAME DAYS',deltaLabel+' POINTS','Recorded reputation change'],
       ['PAYROLL OBLIGATIONS',gbp(payroll),'Outstanding staff wages / notice']].map(
        ([label,value,note],i)=>'<div class="rep-kpi'+(i===2?deltaTone:i===3&&payroll?' rep-alert':'')+'">'+
          '<small>'+label+'</small><strong>'+esc(value)+'</strong><span>'+note+
        '</span></div>').join('')+'</div>';
    const main='<div class="rep-main-grid">'+
      '<section class="rep-panel"><div class="rep-panel-head"><div><small>CAREER PROGRESSION</small>'+
        '<h3>REPUTATION LEVELS</h3></div><span>5 TIERS</span></div>'+
        '<div class="rep-stage-list">'+tierRows+'</div>'+
        '<p class="rep-panel-note">Tier limits are recalculated from your current score. '+
        'Staffing and premises changes also require available capacity and cash.</p></section>'+
      '<section class="rep-panel"><div class="rep-panel-head"><div><small>WHAT SHAPES THE SCORE</small>'+
        '<h3>BUILDING TRUST</h3></div><span>REAL GAME EVENTS</span></div>'+
        '<div class="rep-drivers"><div><strong>BUILDS REPUTATION</strong>'+
        '<p>Completed handovers of good-condition cars; strong customer care and fair prices.</p></div>'+
        '<div><strong>CAN DAMAGE REPUTATION</strong>'+
        '<p>Poor-condition stock, inflated retail prices and unresolved payroll or long-overdue premises bills.</p></div></div>'+
        risk+
        '<div class="rep-quick-links"><button type="button" data-page="sales">SALES OFFICE</button>'+
        '<button type="button" data-page="stock">VEHICLE STOCK</button>'+
        '<button type="button" data-page="reports">MANAGEMENT REPORTS</button></div>'+
      '</section></div>';
    const history='<section class="rep-panel rep-history"><div class="rep-panel-head">'+
        '<div><small>RECORDED CUSTOMER & STAFF OUTCOMES</small>'+
        '<h3>REPUTATION HISTORY</h3></div><span>'+events.length+' EVENTS RECORDED</span></div>'+
      '<div class="rep-history-preview">'+newest+'</div>'+
      (more.length?'<details class="rep-more"><summary>VIEW '+more.length+
        ' MORE RECORDED CHANGES</summary><div class="rep-history-all">'+
        more.map(entry).join('')+'</div></details>':'')+'</section>';
    const future='<details class="rep-future"><summary>LONG-TERM PRESTIGE TARGET & MARKET ELIGIBILITY</summary>'+
      '<div class="rep-future-body"><p><strong>Live market rules:</strong> Modern stock needs £18,500 opening cash and 15 reputation; '+
      'premium stock needs £42,000 and 40 reputation; luxury stock needs £110,000 and 65 reputation. '+
      'The market checks cash and the monthly starting reputation, not just the tier name.</p>'+
      '<p><strong>Future development concept:</strong> a separate prestige-seller milestone of 80+ reputation '+
      'and £500,000 lifetime sales turnover. You currently have '+score+
      ' reputation and '+cashNumber+' in completed turnover. '+
      'That separate milestone is not an additional unlock in this version.</p></div></details>';
    return '<div class="rep-control">'+scoreHero+metrics+main+history+future+
      '<p class="rep-disclosure">Reputation and trading results are fictional simulation values. '+
      'A higher score alone does not guarantee customers, profitable stock or cash.</p></div>';
  }
  function totals(state,P){
    const wages=state.staff.reduce((sum,employee)=>sum+P.dailyCost(employee),0);
    const total=state.staff.reduce((sum,employee)=>sum+employee.monthlySalary,0);
    const modern=state.employmentScenario==='uk2026-payroll';
    const loaded=modern?state.staff.reduce((sum,e)=>sum+
      window.MotorTradeEmployment.monthlyQuote(e.monthlySalary,{allowanceRemaining:0}).employerCost,0):0;
    const technicians=state.staff.filter(s=>s.role==='technician').length;
    const salespeople=state.staff.filter(s=>s.role==='sales').length;
    const next=state.reputationScore<40?'6 technician places at 40 reputation':
      state.reputationScore<80?'8 technician places at 80 reputation':null;
    return '<div class="people-metrics"><div><span>EMPLOYEES</span><strong>'+
      state.staff.length+' / '+P.staffLimit(state)+'</strong></div>'+
      '<div><span>'+(modern?'DAILY BASE ACCRUAL (EST.)':'DAILY WAGE SETTLEMENT')+'</span><strong>'+gbp(wages)+'</strong></div>'+
      '<div><span>MONTHLY BASE PAY</span><strong>'+gbp(total)+'</strong></div>'+ 
      (modern?'<div><span>FULL EMPLOYER COST BEFORE NI RELIEF</span><strong>'+gbp(loaded)+'</strong></div>':'')+
      '<div><span>UNPAID PAYROLL / NOTICE</span><strong>'+gbp(state.payrollArrears)+'</strong></div>'+
      '<div><span>IN-HOUSE TECHNICIANS</span><strong>'+technicians+' / '+P.technicianLimit(state)+'</strong></div>'+
      '<div><span>SALES EXECUTIVES</span><strong>'+salespeople+' / '+P.salesLimit(state)+'</strong></div>'+ 
      '</div><p class="trade-alert">'+(modern?'Full employer costs include NI and pensions before Employment Allowance. New independent forecourts must upgrade before in-house technician recruitment. ':'You can hire four technicians immediately, subject to a clear three-day wage buffer. ')+
      'Each works on a separate vehicle. You can hire one sales executive at first, two at 40 reputation and three at 80, alongside one buyer. '+
      (next?'NEXT UNLOCK: '+next+'.':'All eight technician places are unlocked.')+
      ' On a three-car forecourt, employing a full-time salesperson may still cost more than the extra gross margin they generate. Compare genuine completed deals against all-in wages before hiring.</p>';
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
    if(state.employmentScenario==='uk2026-payroll'){
      const off=window.MotorTradeEmployment.absence(e,state.day);
      if(off)return {name:off.toUpperCase(),tone:'waiting'};
    }
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
    const candidatePool=P.applicants(state.day,state);
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
      '<div><small>'+(state.employmentScenario==='uk2026-payroll'?'DAILY SALARY ACCRUAL (EST.)':'DAILY PAYROLL')+'</small><strong>'+gbp(dayRate)+'</strong></div>'+
      '<div><small>MORALE</small><strong>'+e.morale+' / 100</strong></div>'+
      '<div><small>START DATE</small><strong>DAY '+e.startDay+'</strong></div></div>'+
      (state.employmentScenario==='uk2026-payroll'?'<p class="sd-fine">Contract: '+e.contractHours+' paid hours/week, '+e.ageBand+' adult rate; pension enrolled; paid holiday entitlement '+window.MotorTradeEmployment.LEAVE_DAYS+' days/year including bank holidays. Holiday and full-pay company sick leave reduce availability while salary continues.</p>':'')+
      '<div class="sd-person-detail"><div>'+skillSection(e,P)+
      '<div class="sd-performance"><div><small>RETAIL DEALS</small><strong>'+e.deals+
      '</strong></div><div><small>'+(e.role==='sales'?'CUSTOMER CONTACTS':'PREPARATION JOBS')+'</small><strong>'+e.workDone+
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
      '<div><small>'+(state.employmentScenario==='uk2026-payroll'?'DAILY BASE ACCRUAL':'DAILY PAYROLL ADDED')+'</small><strong>'+gbp(staffDaily)+'</strong></div>'+
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
      '<div><span>'+(state.employmentScenario==='uk2026-payroll'?'30-DAY EMPLOYMENT BUFFER':'3-DAY WAGE COVER')+'</span><strong>'+
      gbp(state.employmentScenario==='uk2026-payroll'?q.monthlyEmployerCost:q.dailyWages*P.WAGE_COVER_DAYS)+'</strong></div>'+
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
      '<p class="sd-fine">'+(state.employmentScenario==='uk2026-payroll'? 'Joining fee now; full base salary accrues after starting. Net wages settle on calendar-month payday, then PAYE/NI and pension contributions are remitted. Hiring requires a month of total employment cost including NI and pension before any Employment Allowance offset, with outstanding stock and tax reserves protected.':'Hiring charges only the onboarding fee now. '+gbp(staffDaily)+' daily wages begin thereafter. Cash is reserved for three days of total payroll, existing arrears and outstanding vehicle preparation.')+'</p>'+
      '</div></div></div>';
  }
  function staffDesk(state,P,{mode=null,role='all',selectedId=null}={}){
    const counts=deskCounts(state,P);
    const activeMode=DESK_MODES.includes(mode)?mode:
      state.staff.length?'team':'candidates';
    const f=DESK_ROLES.includes(role)?role:'all';
    const source=activeMode==='team'?state.staff:P.applicants(state.day,state);
    const filtered=source.filter(person=>f==='all'||person.role===f);
    const chosen=filtered.find(p=>(activeMode==='team'?'e:':'c:')+p.id===selectedId)||
      filtered[0]||null;
    const chosenId=chosen?(activeMode==='team'?'e:':'c:')+chosen.id:null;
    const week=Math.floor((state.day-1)/7);
    const nextRefresh=(week+1)*7+1;
    const quick='<div class="sd-kpis">'+[
      ['EMPLOYEES HIRED',counts.employed+' / '+counts.rolesTotal],
      ['ACTIVE TODAY',String(counts.active)],
      [state.employmentScenario==='uk2026-payroll'?'DAILY SALARY ACCRUAL':'DAILY WAGE BILL',gbp(counts.daily)],
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
      '<p>'+(state.employmentScenario==='uk2026-payroll'?
        '2026 independent: 40 contracted paid hours/week, 28 paid days of holiday including bank holidays, and full-pay company sick leave as an assumed benefit. Salary accrues daily, but wages are paid monthly. PAYE/NI and workplace pension cash is separately remitted. Eligibility for £10,500 Employment Allowance is assumed. This is indicative non-cumulative payroll rather than actual HMRC RTI or an individually verified employment contract.':
        'Classic careers pay wages daily at 1/30 salary; NI, pensions and statutory contracts remain unmodelled.')+'</p></details>'};
  }

  window.MotorTradePeopleView=Object.freeze({applicants,roster,reputation,totals,
    staffDesk,deskCounts,employeeStatus,recruitStatus,DESK_MODES,DESK_ROLES});
})();
