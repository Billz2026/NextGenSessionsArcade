'use strict';
/* v0.9.18 — Vehicle Stock: single source of truth for inventory and capital.
 * All figures are derived from existing career records; no new save fields.
 */
(() => {
  const VC=window.MotorTradeCards;
  if(!VC)throw new Error('Load vehicle-cards.js before stock-view.js');
  const esc=VC.esc,money=VC.money;
  const mileage=n=>new Intl.NumberFormat('en-GB').format(n)+' mi';
  const FILTERS=Object.freeze(['all','prep','ready','listed']);
  const labelSource={auction:'AUCTION PURCHASE',seller:'PRIVATE SELLER','part-ex':'PART EXCHANGE'};
  function group(v){
    if(v.status==='listed')return 'listed';
    if(v.status==='prepared')return 'ready';
    return 'prep';
  }
  function phase(v){
    if(v.status==='listed')return {label:'ON SALE',tone:'listed',next:'SALES OFFICE'};
    if(v.status==='prepared')return {label:'READY TO ADVERTISE',tone:'ready',next:'SET RETAIL PRICE'};
    const stage=v.workshop?.stage;
    const words={
      unassessed:'AWAITING ASSESSMENT',
      quoted:'REPAIR APPROVAL DUE',
      'in-progress':v.workshop?.paused?'REPAIRS PAUSED':'REPAIRS IN PROGRESS',
      'quality-check':'FINAL QUALITY CHECK DUE'
    };
    return {label:words[stage]||'WORKSHOP REQUIRED',tone:'prep',next:'WORKSHOP'};
  }
  function figures(v){
    const stage=v.workshop?.stage;
    const booked=['in-progress','quality-check'].includes(stage);
    // Repairs are charged when booked but prepSpent is recorded only on QC.
    // They must never disappear from cash invested while a job is underway.
    const paidRepairs=booked?Number(v.workshop.repairCost||0):Number(v.prepSpent||0);
    const futurePrep=v.status==='acquired'&&['unassessed','quoted'].includes(stage)?
      Number(v.prepBudget||0):0;
    const invested=Number(v.cost||0)+paidRepairs;
    const likely=Number(v.profile?.likelySale??v.retail);
    const likelySale=v.status==='listed'&&Number.isSafeInteger(v.asking)?
      Math.min(v.asking,likely):likely;
    return {acquisition:v.cost,paidRepairs,invested,futurePrep,
      likelySale,contribution:likelySale-invested-futurePrep};
  }
  function summary(state){
    const vehicles=state.vehicles;
    return {count:vehicles.length,spaces:Math.max(0,state.capacity-vehicles.length),
      prep:vehicles.filter(v=>group(v)==='prep').length,
      ready:vehicles.filter(v=>group(v)==='ready').length,
      listed:vehicles.filter(v=>group(v)==='listed').length,
      invested:vehicles.reduce((n,v)=>n+figures(v).invested,0),
      reserved:vehicles.reduce((n,v)=>n+figures(v).futurePrep,0)};
  }
  function inventoryRow(v,state,selected){
    const p=phase(v),age=Math.max(0,state.day-v.acquiredDay);
    const f=figures(v),ageClass=age>=45?'stock-age-critical':age>=30?'stock-age-warning':'';
    return '<article class="stock-unit'+(selected?' stock-unit-selected':'')+'">'+
      '<div class="stock-unit-thumb">'+VC.photo(v,'stock')+'</div>'+
      '<button type="button" class="stock-unit-select" data-action="select-stock" data-id="'+v.id+
        '" aria-pressed="'+selected+'">'+
        '<span class="stock-unit-kicker">STOCK '+v.id+' · '+esc(labelSource[v.source]||v.source.toUpperCase())+'</span>'+
        '<strong>'+esc(v.title)+'</strong>'+
        '<small>'+mileage(v.miles)+' · '+esc(v.fuel)+' · '+esc(v.gearbox)+'</small>'+
        '<span class="stock-unit-bottom"><span class="stock-status stock-status-'+p.tone+'">'+p.label+'</span>'+
        '<b class="'+ageClass+'">'+age+' DAYS</b></span>'+
        '<span class="stock-unit-cost">INVESTED '+money(f.invested)+'</span>'+
      '</button></article>';
  }
  function costRow(label,amount,strong=false){
    return '<div'+(strong?' class="stock-cost-emphasis"':'')+'><span>'+esc(label)+
      '</span><strong>'+money(amount)+'</strong></div>';
  }
  function controls(v,state){
    const p=phase(v),stage=v.workshop?.stage;
    if(v.status==='acquired'){
      const guidance=stage==='in-progress'?
        (v.workshop.paused?'Repairs paused — review staffing or transfer the job.':
          v.workshop.remainingDays+' game day(s) remaining before quality control.'):
        stage==='quality-check'?'Repairs finished; final quality control is due.':
        stage==='quoted'?'Review the workshop quote and authorise repairs.':
        'Start with a workshop assessment before authorising repairs.';
      return '<div class="stock-action-box"><h4>NEXT DECISION · '+esc(p.next)+'</h4>'+
        '<p>'+esc(guidance)+'</p>'+
        '<button type="button" class="trade-button" data-page="workshop" data-id="'+v.id+
        '">OPEN WORKSHOP</button></div>';
    }
    const caseRecord=state.customerCases?.[String(v.id)];
    const locked=v.status==='listed'&&caseRecord&&
      ['agreed','reserved','collectable'].includes(caseRecord.status);
    const price=Number.isSafeInteger(v.asking)?v.asking:v.retail;
    return '<div class="stock-action-box"><h4>NEXT DECISION · '+p.next+'</h4>'+
      (v.status==='listed'?'<p>Advertising is live. Buyer interest and agreements are managed in the Sales Office.</p>':
        '<p>Quality control has passed. Set your asking price to advertise the car.</p>')+
      (locked?'<p class="stock-lock-note">PRICING LOCKED · An active customer agreement must be resolved in the Sales Office.</p>':'')+
      '<div class="stock-price-action"><label for="stock-price-'+v.id+
      '">RETAIL ASKING PRICE (£)<input class="trade-input" id="stock-price-'+v.id+
      '" type="number" inputmode="numeric" min="500" max="75000" step="50" value="'+price+'"'+
      (locked?' disabled':'')+'></label>'+
      '<button type="button" class="trade-button" data-action="list-stock" data-id="'+v.id+
      '"'+(locked?' disabled':'')+'>'+(v.status==='listed'?'UPDATE PRICE':'ADVERTISE VEHICLE')+
      '</button></div>'+
      (v.status==='listed'?'<button type="button" class="trade-button trade-button-secondary" data-page="sales" data-id="'+v.id+
      '">OPEN SALES OFFICE</button>':'')+'</div>';
  }
  function dossier(v,state,reportCard){
    const f=figures(v),p=phase(v),age=Math.max(0,state.day-v.acquiredDay);
    const grade=v.profile?.grade??3;
    const source=labelSource[v.source]||v.source.toUpperCase();
    const risk=age>=45?'HIGH STOCK AGE · CAPITAL IS TIED UP':
      age>=30?'STOCK AGE WARNING · REVIEW PRICING AND DEMAND':'';
    const ageModel=state.financialScenario==='uk2026'?
      window.MotorTradeRetailLiquidity?.value(state,v):null;
    const reviewTarget=ageModel&&v.status==='listed'?
      Math.max(500,Math.round(ageModel.indicative/50)*50):null;
    const reviewNeeded=ageModel&&ageModel.advertisedDays>=30&&
      Number.isSafeInteger(v.asking)&&v.asking>=reviewTarget+100;
    const priceReview=reviewNeeded?
      '<div class="stock-aged-alert"><strong>30+ DAYS ADVERTISED · REVIEW PRICE</strong>'+
      '<p>Simulated achievable-price sensitivity is around '+money(reviewTarget)+
      ' versus your current '+money(v.asking)+' ask. Consider revising the price using the control below. '+
      (reviewTarget<f.invested?'That may crystallise a loss against cash invested; review trade exit costs as well.':
      'Repricing may improve enquiries but reduces possible margin.')+
      ' This is not a buyer offer or a verified market valuation, and no sale is guaranteed.</p></div>':'';
    return '<section class="stock-dossier" aria-label="Selected vehicle file">'+
      '<div class="stock-dossier-top"><div><span>VEHICLE FILE · STOCK '+v.id+'</span>'+
      '<strong>'+esc(v.title)+'</strong></div><span class="stock-status stock-status-'+p.tone+'">'+p.label+'</span></div>'+
      '<div class="stock-dossier-grid"><div class="stock-dossier-vehicle">'+
      VC.heading(v,'stock',source+' · STOCK '+v.id)+
      '<p class="stock-dossier-note">'+esc(v.note||'')+'</p>'+
      '<div class="stock-facts"><div><small>ACQUIRED</small><strong>GAME DAY '+v.acquiredDay+'</strong></div>'+
      '<div><small>DAYS HELD</small><strong class="'+(age>=30?'stock-age-warning':'')+'">'+age+'</strong></div>'+
      '<div><small>SOURCE</small><strong>'+esc(source)+'</strong></div>'+
      '<div><small>CONDITION</small><strong>GRADE '+grade+' / 5</strong></div></div>'+
      (risk?'<div class="stock-aged-alert">'+risk+'</div>':'')+
      priceReview+
      reportCard(v,'stock',v.asking??v.retail)+'</div>'+
      '<div class="stock-dossier-finance"><div class="stock-finance-heading">'+
      '<small>STOCK UNIT FINANCIALS</small><h3>THE NUMBERS.</h3></div>'+
      '<div class="stock-cost-table">'+
      costRow('Acquisition incl. inspection / assessment',f.acquisition)+
      costRow('Repairs already paid / booked',f.paidRepairs)+
      costRow('CASH INVESTED TO DATE',f.invested,true)+
      costRow('Unspent preparation requirement',f.futurePrep)+
      costRow('Modelled likely achieved sale',f.likelySale)+
      (ageModel?costRow('Aged-stock downside sale sensitivity',ageModel.indicative):'')+
      '<div class="stock-cost-emphasis stock-margin'+(f.contribution<0?' stock-margin-loss':'')+
      '"><span>PROJECTED GROSS CONTRIBUTION</span><strong>'+money(f.contribution)+'</strong></div>'+
      '</div>'+
      '<p class="stock-finance-note">Cash invested includes paid repair bookings even before final QC. Unspent preparation is a protected estimate, not money already paid. Likely sale is a fictional projection'+
      (v.status==='listed'?' capped at your asking price':'')+
      '. Gross contribution excludes wages, premises, tax, aftersales and other overheads.'+
      (ageModel?' The aged-stock figure is a separate 1.5%/30-day downside sensitivity after day 30, capped at 18%; it is NOT a verified selling price, booked impairment, or cash receipt. Original advertised stock age is retained when repricing.':'')+'</p>'+
      controls(v,state)+
      '</div></div></section>';
  }
  function render(state,{filter='all',selectedId=null,reportCard=()=>''}={}){
    const value=FILTERS.includes(filter)?filter:'all';
    const stats=summary(state);
    const metrics=[
      ['VEHICLES',stats.count,'CAPACITY '+state.capacity],
      ['CASH INVESTED',money(stats.invested),'IN EXISTING STOCK'],
      ['UNSPENT PREP',money(stats.reserved),'WORKSHOP FUNDING'],
      ['ADVERTISED',stats.listed,'RETAIL MARKET'],
      ['FREE SPACES',stats.spaces,'READY FOR PURCHASE']
    ];
    const head='<div class="stock-kpi-strip">'+metrics.map(([label,number,note])=>
      '<div class="stock-kpi"><small>'+label+'</small><strong>'+number+
      '</strong><span>'+note+'</span></div>').join('')+'</div>';
    if(!state.vehicles.length)return {selectedId:null,html:head+
      '<div class="trade-empty stock-empty"><h2>YOUR FORECOURT IS EMPTY.</h2>'+
      '<p>Purchase a vehicle at the weekly Auction Hall or negotiate directly with a private seller. New purchases automatically enter this stock register.</p>'+
      '<div class="stock-empty-actions"><button type="button" class="trade-button" data-page="auctions">OPEN BUYING DESK</button>'+
      '<button type="button" class="trade-button trade-button-secondary" data-page="auctionHall">OPEN AUCTION HALL</button></div></div>'};
    const filters=[['all','ALL STOCK',stats.count],['prep','IN PREPARATION',stats.prep],
      ['ready','RETAIL READY',stats.ready],['listed','ADVERTISED',stats.listed]];
    const toolbar='<div class="stock-toolbar"><div><small>LIVE FORECOURT REGISTER</small>'+
      '<strong>'+state.vehicles.length+' ACTIVE UNITS</strong></div>'+
      '<div class="stock-filters" role="group" aria-label="Filter stock">'+
      filters.map(([name,label,count])=>'<button type="button" data-action="filter-stock" data-filter="'+name+
        '" aria-pressed="'+(value===name)+'">'+label+' <b>'+count+'</b></button>').join('')+'</div></div>';
    const eligible=state.vehicles.filter(v=>value==='all'||group(v)===value)
      .slice().sort((a,b)=>a.acquiredDay-b.acquiredDay||a.id-b.id);
    const selected=eligible.find(v=>v.id===selectedId)||eligible[0]||null;
    const list=eligible.length?eligible.map(v=>inventoryRow(v,state,selected?.id===v.id)).join(''):
      '<div class="stock-list-empty">No vehicles in this category. Choose another filter to review your active stock.</div>';
    return {selectedId:selected?.id??null,html:head+toolbar+
      '<div class="stock-workspace"><aside class="stock-register" aria-label="Current vehicle inventory">'+
      '<div class="stock-register-title">STOCK REGISTER <span>'+eligible.length+' SHOWN</span></div>'+
      '<div class="stock-register-list">'+list+'</div></aside>'+
      (selected?dossier(selected,state,reportCard):
        '<div class="stock-dossier stock-list-empty">Choose another category to view a vehicle file.</div>')+
      '</div><p class="stock-disclosure">Vehicle history, values and customer demand are simulated. Vehicle photos are representative and are not vehicle-specific evidence.</p>'};
  }
  window.MotorTradeStockView=Object.freeze({render,figures,summary,phase,FILTERS});
})();