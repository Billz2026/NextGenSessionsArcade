'use strict';
/* v0.9.20 — Compact Workshop job desk. All actions use existing engine rules. */
(() => {
  const VC=window.MotorTradeCards, P=window.MotorTradePeople;
  if(!VC||!P)throw Error('Load cards and people before workshop view');
  const esc=VC.esc, cash=VC.money;
  const FILTERS=Object.freeze(['all','action','repair','ready','listed']);
  const stages=['unassessed','quoted','in-progress','quality-check','ready'];
  const labels={unassessed:'ASSESSMENT DUE',quoted:'REPAIR APPROVAL DUE',
    'in-progress':'REPAIRS IN PROGRESS','quality-check':'QUALITY CHECK DUE',ready:'RETAIL READY'};
  const needs=v=>v.status==='acquired'&&
    ['unassessed','quoted','quality-check'].includes(v.workshop?.stage);
  const age=(s,v)=>Math.max(0,s.day-v.acquiredDay);
  function paid(v){return ['in-progress','quality-check'].includes(v.workshop?.stage)?
    Number(v.workshop.repairCost||0):Number(v.prepSpent||0);}
  function summary(s,W){
    const cars=s.vehicles;
    return {count:cars.length,action:cars.filter(needs).length,
      repair:cars.filter(v=>v.workshop?.stage==='in-progress').length,
      qc:cars.filter(v=>v.workshop?.stage==='quality-check').length,
      ready:cars.filter(v=>v.status==='prepared'&&v.workshop?.stage==='ready').length,
      listed:cars.filter(v=>v.status==='listed'&&v.workshop?.stage==='ready').length,
      reserve:W.reserved(s),
      tech:P.activeTeam(s,'technician').length,
      free:P.availableTechnicians(s).length,
      bays:P.technicianLimit(s),
      inHouse:cars.filter(v=>v.workshop?.stage==='in-progress'&&v.workshop.method==='internal').length,
      external:cars.filter(v=>v.workshop?.stage==='in-progress'&&v.workshop.method==='external').length};
  }
  function status(v){
    const stage=v.workshop?.stage||'unassessed';
    if(stage==='ready'&&v.status==='listed')return {label:'ON SALE',tone:'listed'};
    if(stage==='ready'&&v.status==='prepared')return {label:'READY TO ADVERTISE',tone:'ready'};
    return {label:stage==='in-progress'&&v.workshop.paused?'REPAIRS PAUSED':labels[stage]||'CHECK STATUS',
      tone:stage==='ready'?'ready':stage==='in-progress'?'running':needs(v)?'due':'pending'};
  }
  function unit(s,v,selected){
    const k=status(v);
    return '<article class="ws-unit'+(selected?' ws-selected':'')+'">'+
      '<div class="ws-thumb">'+VC.photo(v,'workshop')+'</div>'+
      '<button type="button" class="ws-pick" data-action="select-workshop" data-id="'+v.id+
      '" aria-pressed="'+selected+'"><small>STOCK '+v.id+' · '+esc(v.source.toUpperCase())+
      '</small><strong>'+esc(v.title)+'</strong>'+
      '<span>'+new Intl.NumberFormat('en-GB').format(v.miles)+' MI · '+age(s,v)+' DAYS HELD</span>'+
      '<em class="ws-status ws-status-'+k.tone+'">'+k.label+'</em></button></article>';
  }
  function steps(v){
    const current=Math.max(0,stages.indexOf(v.workshop?.stage));
    return '<div class="ws-steps">'+['ASSESS','APPROVE','REPAIR','QC','READY'].map((x,i)=>
      '<span class="'+(i<current?'done':i===current?'current':'')+'">'+x+'</span>').join('')+'</div>';
  }
  function items(v){
    const p=v.profile||{};
    const seen=v.workshop.stage!=='unassessed'||!!p.inspected;
    const rows=(p.knownRepairs||[]).map(x=>'<div class="ws-repair"><span>'+
      esc(x.item)+'</span><strong>'+cash(x.cost)+'</strong></div>').join('');
    const extra=seen&&p.hiddenFault?
      '<div class="ws-repair ws-fault"><span>'+esc(p.hiddenFault.item)+
      ' · diagnosed defect</span><strong>'+cash(p.hiddenFault.cost)+'</strong></div>':'';
    return '<section><h4>REPAIR REQUIREMENTS</h4>'+rows+extra+
      (!rows?'<p>No itemised information available.</p>':'')+
      (!seen?'<p class="ws-caveat">Further defects may be identified at assessment.</p>':'')+'</section>';
  }
  function costs(v){
    const job=v.workshop;
    const diagnosed=job.stage!=='unassessed'||!!v.profile?.inspected;
    const spent=paid(v),hasBooking=['in-progress','quality-check','ready'].includes(job.stage);
    const difference=hasBooking?spent-v.prepBudget:0;
    // The legacy save records the total booked repair charge, not an itemised
    // adjustment history. Only label a difference as labour saving while the
    // job remains in-house and has no paid QC rectification.
    const confirmedSaving=hasBooking&&job.method==='internal'&&job.reworks===0&&difference<0;
    const variance=hasBooking&&difference!==0?
      '<div class="ws-cost-variance"><span>'+
      (confirmedSaving?'IN-HOUSE LABOUR SAVING':'REPAIR COST ADJUSTMENT')+
      '</span><strong>'+(difference<0?'−':'+')+cash(Math.abs(difference))+'</strong></div>':'';
    const explanation=variance?
      '<p class="ws-cost-explain">'+(confirmedSaving?
        'The in-house booking costs less than the diagnosed repair budget due to technician labour savings.':
        'Booked repair totals can differ from the diagnosed budget because of provider pricing, transfer fees or paid QC rectification.')+
      '</p>':'';
    return '<div class="ws-costs">'+
      '<div><span>ACQUISITION / ASSESSMENT PAID</span><strong>'+cash(v.cost)+'</strong></div>'+
      '<div><span>DIAGNOSED REPAIR REQUIREMENT</span><strong>'+
      (diagnosed?cash(v.prepBudget):'NOT YET ASSESSED')+'</strong></div>'+
      variance+
      '<div><span>REPAIRS PAID / BOOKED</span><strong>'+cash(spent)+'</strong></div>'+
      '<div class="ws-cost-total"><span>CAPITAL INVESTED</span><strong>'+cash(v.cost+spent)+'</strong></div>'+
      '</div>'+explanation;
  }
  function quote(s,W,v,mode){
    const q=W.quote(s,v,mode);
    const occupied=mode==='external'&&s.vehicles.filter(x=>x.id!==v.id&&
      x.workshop?.stage==='in-progress'&&x.workshop.method==='external').length>=2;
    const cannot=!q||occupied||q.cost>s.cash-W.reserved(s,v.id);
    const reason=!q?'No free technician or bay':occupied?'Both external slots occupied':
      q.cost>s.cash-W.reserved(s,v.id)?'Insufficient unreserved cash':'';
    return '<div class="ws-quote"><div class="ws-quote-head"><strong>'+
      (mode==='internal'?'IN-HOUSE TECHNICIAN':'EXTERNAL GARAGE')+'</strong><b>'+
      (q?cash(q.cost):'UNAVAILABLE')+'</b></div>'+
      (q?'<span>'+q.duration+' DAYS · '+q.partsDelay+' PARTS-WAIT DAYS</span><small>'+
        esc(q.provider)+'</small>'+
        (q.saving>0?'<small class="ws-savings">IN-HOUSE LABOUR SAVING '+cash(q.saving)+'</small>':'')+
        (q.supplement>0?'<small>EXTERNAL GARAGE UPLIFT '+cash(q.supplement)+'</small>':''):'')+
      (cannot?'<p class="ws-issue">'+esc(reason)+'</p>':'')+
      '<button type="button" class="trade-button" data-action="start-workshop" data-id="'+v.id+
      '" data-method="'+mode+'"'+(cannot?' disabled':'')+'>BOOK '+
      (mode==='internal'?'IN-HOUSE':'EXTERNAL')+' REPAIR</button></div>';
  }
  function actions(s,W,v){
    const j=v.workshop,phase=j.stage;
    if(phase==='unassessed'){
      const fee=P.active(s,'technician')?30:55;
      const can=s.cash>=W.reserved(s)+fee;
      return '<div class="ws-action"><h4>NEXT / ASSESS VEHICLE</h4>'+
        '<p>Confirm the repair requirement. The assessment costs '+cash(fee)+
        ' and is added to the acquisition cost.</p>'+
        (!can?'<p class="ws-issue">Insufficient unreserved cash for assessment.</p>':'')+
        '<button type="button" class="trade-button" data-action="assess-workshop" data-id="'+v.id+
        '"'+(!can?' disabled':'')+'>AUTHORISE ASSESSMENT · '+cash(fee)+'</button></div>';
    }
    if(phase==='quoted')return '<div class="ws-action"><h4>NEXT / APPROVE REPAIRS</h4>'+
      '<p>Choose a provider. Booking charges cash now and repairs take game days.</p>'+
      '<div class="ws-quotes">'+quote(s,W,v,'internal')+quote(s,W,v,'external')+'</div></div>';
    if(phase==='in-progress'){
      const provider=j.method==='internal'?
        (s.staff.find(x=>x.id===j.technicianId)?.name||'Technician unavailable'):
        'Independent external garage';
      return '<div class="ws-action"><h4>'+ (j.paused?'REPAIRS PAUSED':'REPAIRS BOOKED') +'</h4>'+
        '<div class="ws-progress"><div><small>PROVIDER</small><strong>'+esc(provider)+'</strong></div>'+
        '<div><small>REMAINING</small><strong>'+j.remainingDays+' GAME DAYS</strong></div>'+
        '<div><small>CHARGED</small><strong>'+cash(j.repairCost)+'</strong></div></div>'+
        '<p>'+(j.paused?'Assigned technician unavailable. Return them to duty or transfer this job.':
          'Advance game days for repairs to finish. Quality control is mandatory afterward.')+'</p>'+
        (j.method==='internal'?(()=>{
          const outside=s.vehicles.filter(x=>x.id!==v.id&&
            x.workshop?.stage==='in-progress'&&x.workshop.method==='external').length;
          const full=outside>=2,affordable=s.cash>=W.reserved(s)+125;
          return (full?'<p class="ws-issue">EXTERNAL GARAGES FULL (2/2). WAIT FOR A SLOT.</p>':'')+
            (!full&&!affordable?'<p class="ws-issue">INSUFFICIENT UNRESERVED CASH FOR £125 TRANSFER.</p>':'')+
            '<button type="button" class="trade-button trade-button-secondary" '+
            'data-action="outsource-workshop" data-id="'+v.id+'"'+
            (full||!affordable?' disabled':'')+'>TRANSFER TO EXTERNAL GARAGE · £125</button>';
        })():'')+'</div>';
    }
    if(phase==='quality-check')return '<div class="ws-action"><h4>NEXT / FINAL QUALITY CHECK</h4>'+
      '<p>Repairs are complete. QC must pass before advertising; failure may require another paid repair day.</p>'+
      '<button type="button" class="trade-button" data-action="finish-workshop" data-id="'+v.id+
      '">PERFORM FINAL QUALITY CHECK</button></div>';
    if(v.status==='listed')return '<div class="ws-action ws-ready"><h4>QC PASSED / ON SALE</h4>'+
      '<p>Quality control passed on day '+(j.completedDay??'—')+'. This vehicle is already advertised. Handle customer interest in the Sales Office.</p>'+
      '<button type="button" class="trade-button" data-page="sales" data-id="'+v.id+
      '">OPEN SALES OFFICE</button></div>';
    return '<div class="ws-action ws-ready"><h4>QC PASSED / READY TO ADVERTISE</h4>'+
      '<p>Completed on day '+(j.completedDay??'—')+'. Repairs charged '+cash(v.prepSpent)+
      '. Set an asking price in Vehicle Stock.</p>'+
      '<button type="button" class="trade-button" data-page="stock" data-id="'+v.id+
      '">VIEW VEHICLE STOCK</button></div';
  }
  function disposal(v){
    if(v.status!=='acquired'||!['unassessed','quoted'].includes(v.workshop.stage))return '';
    const bid=window.MotorTradeEngine.wholesaleOffer(v);
    return '<details class="ws-disposal"><summary>TRADE DISPOSAL / CUT LOSSES</summary>'+
      '<p>Fictional trade offer '+cash(bid)+'. Selling now frees a space but can realise a loss.</p>'+
      '<button class="trade-button trade-button-outline" type="button" data-action="dispose-workshop" data-id="'+
      v.id+'">SELL TO TRADE · '+cash(bid)+'</button></details>';
  }
  function dossier(s,W,v){
    const k=status(v);
    return '<article class="ws-file"><div class="ws-file-head"><div><small>WORK ORDER · STOCK '+v.id+
      '</small><h3>'+esc(v.title)+'</h3></div><span class="ws-status ws-status-'+k.tone+'">'+k.label+
      '</span></div>'+steps(v)+
      '<div class="ws-detail"><div class="ws-detail-car">'+
      '<div class="ws-vehicle"><div class="ws-photo">'+VC.photo(v,'workshop')+'</div>'+
      '<div><small>GRADE '+esc(v.profile?.grade??'—')+' · '+esc(v.fuel)+' · '+esc(v.gearbox)+
      '</small><strong>'+new Intl.NumberFormat('en-GB').format(v.miles)+' MI</strong>'+
      '<span>'+age(s,v)+' DAYS HELD · '+esc(v.color||'UNKNOWN COLOUR')+'</span></div></div>'+
      items(v)+'<p class="ws-caveat">Simulated assessment and QC are not a real MOT or roadworthiness certificate.</p>'+
      '</div><div class="ws-detail-control">'+actions(s,W,v)+
      '<h4>COST CONTROL</h4>'+costs(v)+disposal(v)+'</div></div></article>';
  }
  function render(s,W,{filter='all',selectedId=null}={}){
    const q=summary(s,W),f=FILTERS.includes(filter)?filter:'all';
    const kpi='<div class="ws-kpis">'+[
      ['ACTION REQUIRED',q.action],['REPAIRS RUNNING',q.repair],
      ['QUALITY CHECK DUE',q.qc],['READY TO ADVERTISE',q.ready],['ON SALE',q.listed]
    ].map(([name,num])=>'<div><small>'+name+'</small><strong>'+num+'</strong></div>').join('')+
      '</div><div class="ws-capacity"><span>TECHNICIANS '+q.tech+' ACTIVE / '+q.free+' FREE · IN-HOUSE '+
      q.inHouse+'/'+q.bays+' BAYS</span><span>EXTERNAL GARAGES '+q.external+'/2</span>'+
      '<span>REPAIR FUNDS RESERVED '+cash(q.reserve)+'</span></div>';
    if(!s.vehicles.length)return {selectedId:null,html:kpi+
      '<div class="trade-empty ws-empty"><h2>NO VEHICLES TO PREPARE.</h2>'+
      '<p>Buy a vehicle at the Buying Desk or Auction Hall to create a workshop job.</p>'+
      '<button type="button" class="trade-button" data-page="auctions">OPEN BUYING DESK</button></div>'};
    const filters=[['all','ALL JOBS',q.count],['action','ACTION DUE',q.action],
      ['repair','IN REPAIR',q.repair],['ready','READY TO ADVERTISE',q.ready],
      ['listed','ON SALE',q.listed]];
    const toolbar='<div class="ws-toolbar"><strong>WORKSHOP JOB REGISTER</strong>'+
      '<div class="ws-filters" role="group" aria-label="Filter workshop jobs">'+filters.map(([key,label,n])=>
      '<button type="button" data-action="filter-workshop" data-filter="'+key+
      '" aria-pressed="'+(f===key)+'">'+label+' <b>'+n+'</b></button>').join('')+'</div></div>';
    const cars=s.vehicles.filter(v=>f==='all'||(f==='action'?needs(v):
      f==='repair'?v.workshop?.stage==='in-progress':
      f==='ready'?v.status==='prepared'&&v.workshop?.stage==='ready':
      v.status==='listed'&&v.workshop?.stage==='ready'))
      .slice().sort((a,b)=>{
        const pa=needs(a)?0:a.workshop.stage==='in-progress'?1:2;
        const pb=needs(b)?0:b.workshop.stage==='in-progress'?1:2;
        return pa-pb||a.acquiredDay-b.acquiredDay||a.id-b.id;
      });
    const chosen=cars.find(v=>v.id===selectedId)||cars[0]||null;
    const list=cars.length?cars.map(v=>unit(s,v,v.id===chosen?.id)).join(''):
      '<p class="ws-no-results">No jobs in this category. Select another filter.</p>';
    return {selectedId:chosen?.id??null,html:kpi+toolbar+
      '<div class="ws-layout"><aside class="ws-register"><header>JOBS <span>'+cars.length+
      ' SHOWN</span></header>'+list+'</aside>'+
      (chosen?dossier(s,W,chosen):'<div class="ws-file ws-no-results">No job selected.</div>')+
      '</div><p class="ws-footnote">Jobs take game days. Repair charges, reserves and staffing come from your saved career.</p>'};
  }
  window.MotorTradeWorkshopView=Object.freeze({render,summary,paid,FILTERS});
})();