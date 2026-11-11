'use strict';
/* Business premises management. Each figure is illustrative game economics. */
(() => {
  const cash=n=>new Intl.NumberFormat('en-GB',{
    style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  function card(state,site,kind,title,description){
    const q=site.quote(state,kind);
    const width=kind==='forecourt'?site.capacity(state):site.bays(state);
    const current=site.costs(state),name=kind==='forecourt'?'forecourt spaces':'repair bays';
    if(q.maximum)return '<article class="premises-option"><h3>'+title+'</h3>'+
      '<strong>'+width+' '+name+'</strong><p>'+description+
      '</p><p>Maximum facility size reached. Upkeep continues each game day.</p>'+
      '<span class="premises-max">FULLY EXPANDED</span></article>';
    const copy='£'+q.cost.toLocaleString('en-GB')+' investment, plus '+
      cash(q.dailyIncrease)+'/day in rent and utilities.';
    const reason=!q.eligible?'REQUIRES '+q.requiredReputation+' REPUTATION':
      q.shortfall?'SHORT BY '+cash(q.shortfall):'UPGRADE FACILITY';
    return '<article class="premises-option"><h3>'+title+'</h3>'+
      '<strong>'+q.current+' → '+q.next+' '+name+'</strong>'+
      '<p>'+description+'</p>'+
      '<div class="premises-quote"><span>EXPANSION COST</span><b>'+cash(q.cost)+'</b>'+
      '<span>EXTRA DAILY OVERHEAD</span><b>'+cash(q.dailyIncrease)+'</b>'+
      '<span>REQUIRED CASH INCLUDING RESERVES</span><b>'+cash(q.requiredCash)+'</b>'+
      '<span>REPUTATION REQUIRED</span><b>'+q.requiredReputation+'/100</b></div>'+
      '<p>'+copy+' Buying additional capacity does not add staff or vehicles automatically.</p>'+
      '<button type="button" class="trade-button" data-action="upgrade-premises" data-kind="'+
      kind+'"'+(!q.eligible||q.shortfall?' disabled':'')+'>'+reason+'</button></article>';
  }
  function render(state,site){
    const d=site.costs(state);
    const monthly=window.MotorTradeMonthly?.statement(state);
    return '<section class="panel-card premises-section">'+
      '<div class="panel-card-header"><div><p class="section-overline">PROPERTY STRATEGY / CASH FLOW</p>'+
      '<h2>EXPANSION & RUNNING COSTS</h2></div><span class="tiny-index">OWNER DECISIONS</span></div>'+
      '<div class="premises-metrics">'+
      [['FORECOURT SPACES',site.capacity(state)],['PHYSICAL WORKSHOP BAYS',site.bays(state)],
       ['RENT PER GAME DAY',cash(d.rent)],['UTILITIES PER GAME DAY',cash(d.utilities)],
       ['TOTAL DAILY OVERHEAD',cash(d.total)],['OVERHEADS OWED',cash(state.premises.arrears)]]
       .map(([label,value])=>'<div><small>'+label+'</small><strong>'+value+'</strong></div>').join('')+
      '</div><p class="trade-alert premises-notice">Fixed premises overheads accrue once per game day, even without sales. '+
      'Payments use unreserved cash, so workshop preparation funds remain protected. If the business cannot pay, '+
      'arrears remain and prolonged non-payment damages reputation. Figures are fictional balancing estimates, not real UK lease quotes.</p>'+
      '<div class="premises-upgrades">'+
      card(state,site,'forecourt','EXPAND THE FORECOURT',
        'More cars can be purchased and held at once. Unsold stock still ties up cash.')+
      card(state,site,'workshop','EXPAND THE WORKSHOP',
        'More simultaneous in-house jobs become possible when enough technicians are hired.')+
      '</div><p class="premises-note">Current 30-day overhead guide: '+cash(d.monthlyGuide)+
      '. Overheads accrued this management month: '+cash(monthly?.premisesExpense??0)+
      '. Capital expansion costs reduce cash but are tracked separately from recurring rent and utilities.</p>'+
      '</section>';
  }
  window.MotorTradePremisesView=Object.freeze({render});
})();
