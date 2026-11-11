'use strict';
/* v0.8 Workshop Operations UI. Safe static markup from saved game records. */
(() => {
  const VC=window.MotorTradeCards;
  if(!VC)throw new Error('Load vehicle-cards.js before workshop-view.js');
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cash=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  const stageLabels={
    unassessed:'AWAITING ASSESSMENT',quoted:'REPAIRS TO APPROVE',
    'in-progress':'IN REPAIR QUEUE','quality-check':'FINAL QUALITY CHECK',ready:'RETAIL READY'
  };
  function record(state,W,vehicle){
    const job=vehicle.workshop;
    const grade=vehicle.profile?.grade??3;
    const repairs=vehicle.profile?.knownRepairs??[];
    const hidden=vehicle.profile?.hiddenFault &&
      (job.stage!=='unassessed'||!!vehicle.profile.inspected)?
      vehicle.profile.hiddenFault:null;
    const costHtml=repairs.map(x=>
      '<div class="workshop-item"><span>'+esc(x.item)+'</span><strong>'+cash(x.cost)+'</strong></div>').join('')+
      (hidden?'<div class="workshop-item workshop-fault"><span>'+esc(hidden.item)+
      ' · additional diagnosed fault</span><strong>'+cash(hidden.cost)+'</strong></div>':'');
    const status=stageLabels[job.stage]||'STATUS UNAVAILABLE';
    let actions='';
    if(job.stage==='unassessed'){
      const staff=state.staff.find(s=>s.role==='technician');
      actions='<div class="workshop-action-panel"><p>Assess the vehicle to confirm the workshop repair requirement. '+
        'Diagnosis costs '+cash(state.cash>=0&&window.MotorTradePeople.active(state,'technician')?30:55)+
        ' and is included in the vehicle’s cost basis.</p>'+
        '<button type="button" class="trade-button" data-action="assess-workshop" data-id="'+vehicle.id+
        '">AUTHORISE ASSESSMENT</button></div>';
    } else if(job.stage==='quoted'){
      const internal=W.quote(state,vehicle,'internal');
      const external=W.quote(state,vehicle,'external');
      const createOption=(method,quote)=>{
        if(!quote)return '<div class="workshop-option workshop-disabled"><h4>IN-HOUSE TECHNICIAN</h4>'+
          '<p>All technicians are busy, training or unavailable. Hire another, finish an assigned job or use an external garage.</p></div>';
        return '<div class="workshop-option"><h4>'+(method==='internal'?'IN-HOUSE TECHNICIAN':'EXTERNAL GARAGE')+
          '</h4><strong>'+cash(quote.cost)+'</strong>'+
          '<p>Estimated '+quote.duration+' game days · '+quote.partsDelay+
          ' part(s) wait days · '+esc(quote.provider)+'</p>'+
          '<button type="button" class="trade-button" data-action="start-workshop" data-method="'+
          method+'" data-id="'+vehicle.id+'">BOOK '+(method==='internal'?'IN-HOUSE':'EXTERNAL')+
          ' REPAIR</button></div>';
      };
      actions='<div class="workshop-options">'+createOption('internal',internal)+
        createOption('external',external)+'</div>';
    } else if(job.stage==='in-progress'){
      actions='<div class="workshop-progress"><div><strong>'+
        (job.paused?'PAUSED · TECHNICIAN UNAVAILABLE':'REPAIRS BOOKED')+'</strong>'+
        '<p>'+esc(job.method==='internal'?
          'In-house: '+(state.staff.find(s=>s.id===job.technicianId)?.name||'technician unavailable'):
          'Independent external garage')+
        ' · '+job.remainingDays+' game day(s) remaining'+
        (job.partsDelay?' · '+job.partsDelay+' day(s) built in for parts':'')+'</p></div>'+
        '<div><small>REPAIR CHARGED</small><strong>'+cash(job.repairCost)+'</strong></div></div>'+
        (job.method==='internal'?
          '<button type="button" class="trade-button trade-button-secondary" data-action="outsource-workshop" data-id="'+
          vehicle.id+'">TRANSFER TO EXTERNAL GARAGE · £125</button>':'');
    } else if(job.stage==='quality-check'){
      actions='<div class="workshop-action-panel"><p>All scheduled repairs are finished. '+
        'Complete final quality control before this vehicle can be advertised. '+
        'A failed check may uncover work that costs more and delays readiness.</p>'+
        '<button type="button" class="trade-button" data-action="finish-workshop" data-id="'+vehicle.id+
        '">PERFORM FINAL QUALITY CHECK</button></div>';
    } else {
      actions='<div class="workshop-finished"><strong>RETAIL READY</strong>'+
        '<p>Vehicle passed workshop quality control on day '+job.completedDay+
        '. Actual repairs: '+cash(vehicle.prepSpent)+
        '. Assessment: '+cash(job.assessmentFee)+' (included in purchase cost).</p>'+
        '<button type="button" class="trade-button" data-page="stock">VIEW VEHICLE STOCK →</button></div>';
    }
    const canDispose=vehicle.status==='acquired'&&
      ['unassessed','quoted'].includes(job.stage);
    const disposal=canDispose?
      '<div class="workshop-disposal"><strong>STOCK EXIT / STOP THE LOSS</strong>'+
      '<p>Cannot afford or justify repairs? A fictional trade buyer currently offers '+
      cash(window.MotorTradeEngine.wholesaleOffer(vehicle))+'. '+
      'Selling now frees your space but may crystallise a loss. It does not count towards retail targets.</p>'+
      '<button type="button" class="trade-button trade-button-outline" data-action="dispose-workshop" data-id="'+
      vehicle.id+'">SELL TO TRADE</button></div>':'';
    return '<article class="workshop-job">'+VC.photo(vehicle,'workshop')+
      '<div class="workshop-job-heading"><div>'+
      '<small>'+esc(vehicle.source.toUpperCase())+' · STOCK '+vehicle.id+
      ' · GRADE '+grade+'</small><h3>'+esc(vehicle.title)+'</h3>'+
      '<span>'+esc(status)+'</span></div><div class="workshop-finance"><small>VEHICLE HELD</small>'+
      '<strong>'+Math.max(0,state.day-vehicle.acquiredDay)+' DAYS</strong></div></div>'+
      '<div class="workshop-job-body"><div class="workshop-work"><h4>VEHICLE PREPARATION PLAN</h4>'+
      (costHtml||'<p>No itemised record for this legacy stock vehicle.</p>')+
      '<div class="workshop-item workshop-total"><span>DIAGNOSED REPAIR BUDGET</span><strong>'+
      cash(vehicle.prepBudget)+'</strong></div>'+
      '<p>Workshop assessment and provider charges are separate. The final bill may be higher than the original budget.</p>'+
      '</div><div class="workshop-job-controls">'+actions+disposal+'</div></div></article>';
  }
  function render(state,W){
    const pending=state.vehicles.filter(x=>x.status==='acquired');
    const active=pending.filter(x=>x.workshop?.stage==='in-progress');
    const qc=pending.filter(x=>x.workshop?.stage==='quality-check');
    const completed=state.vehicles.filter(x=>x.workshop?.stage==='ready');
    const internal=active.filter(x=>x.workshop.method==='internal').length;
    const outside=active.filter(x=>x.workshop.method==='external').length;
    const P=window.MotorTradePeople;
    const staffed=P.activeTeam(state,'technician').length;
    const free=P.availableTechnicians(state).length;
    const info='<div class="workshop-summary">'+
      [['AWAITING RETAIL PREP',pending.length],['ACTIVE REPAIR JOBS',active.length],
        ['QUALITY CHECK DUE',qc.length],['RETAIL READY / LISTED',completed.length]]
      .map(([label,value])=>'<div><small>'+label+'</small><strong>'+value+'</strong></div>').join('')+
      '</div><div class="workshop-capacity"><span>IN-HOUSE TECHNICIANS: '+
      internal+' REPAIRS ACTIVE / '+P.technicianLimit(state)+' UNLOCKED BAYS · '+
      free+' FREE · '+staffed+' ACTIVE'+
      '</span><span>EXTERNAL GARAGE SLOTS: '+outside+'/2</span></div>'+
      '<p class="trade-alert">Repair times run in actual game days. Work paid for and completed later does not create instant retail stock. '+
      'Each active technician can repair one in-house vehicle concurrently; quality checks still reserve their assigned bay. External garages cost more but do not use your employees. '+
      'This is fictional workshop management, not a legal roadworthiness certificate or real MOT.</p>';
    if(!state.vehicles.length)return info+'<div class="trade-empty"><h2>NO VEHICLES TO PREPARE.</h2>'+
      '<p>Buy a car from the Buying Desk, then authorise its workshop assessment.</p></div>';
    const sorted=[...state.vehicles].sort((a,b)=>(a.workshop.stage==='ready')-(b.workshop.stage==='ready'));
    return info+'<div class="workshop-list">'+sorted.map(v=>record(state,W,v)).join('')+'</div>';
  }
  window.MotorTradeWorkshopView=Object.freeze({render});
})();