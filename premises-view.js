'use strict';
/* v0.9.35 — My Dealership compact owner HQ and facility investment desk.
 * Every amount is derived from the saved game state and existing economic
 * rules. Rendering never applies an upgrade or changes a saved career.
 */
(() => {
  const cash=n=>new Intl.NumberFormat('en-GB',{
    style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  const nfmt=n=>new Intl.NumberFormat('en-GB').format(n);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  const label=(a,b,note='')=>
    '<div class="hq-metric"><small>'+a+'</small><strong>'+b+
    '</strong><span>'+note+'</span></div>';
  const line=(a,b,extra='')=>
    '<div class="hq-cost-line'+extra+'"><span>'+a+'</span><strong>'+b+'</strong></div>';
  function figures(state,site){
    const p=site.costs(state);
    const monthly=window.MotorTradeMonthly?.statement(state);
    const reserve=window.MotorTradeWorkshop?.reserved(state)??0;
    const dailyWages=(state.staff||[]).reduce((n,person)=>
      n+Math.ceil(person.monthlySalary/30),0);
    const forecourt=site.capacity(state);
    const workshop=site.bays(state);
    const stock=state.vehicles.length;
    const activeRepairs=state.vehicles.filter(v=>
      v.workshop?.method==='internal'&&
      ['in-progress','quality-check'].includes(v.workshop.stage)).length;
    return {p,monthly,reserve,dailyWages,forecourt,workshop,stock,
      freeSpaces:Math.max(0,forecourt-stock),
      activeRepairs,
      cashAfterRepairReserves:state.cash-reserve,
      runningDaily:p.total+dailyWages,
      arrears:(state.premises?.arrears??0)+(state.payrollArrears??0)};
  }
  function card(state,site,kind){
    const q=site.quote(state,kind);
    const forecourt=kind==='forecourt';
    const current=forecourt?site.capacity(state):site.bays(state);
    const title=forecourt?'FORECOURT EXPANSION':'WORKSHOP EXPANSION';
    const short=forecourt?
      'Increase the number of vehicles you can hold at once.':
      'Increase physical repair bays; technicians are still required.';
    const unit=forecourt?'VEHICLE SPACES':'REPAIR BAYS';
    if(q.maximum)return '<article class="hq-upgrade hq-upgrade-max">'+
      '<header class="hq-upgrade-head"><div><small>FACILITY / '+
      (forecourt?'STOCK CAPACITY':'VEHICLE PREPARATION')+'</small><h3>'+title+
      '</h3></div><span class="hq-status hq-ready">MAXIMUM</span></header>'+
      '<div class="hq-upgrade-capacity"><strong>'+current+' '+unit+
      '</strong><span>FULLY EXPANDED</span></div><p>'+short+
      ' Current running costs continue each game day.</p>'+
      '<div class="hq-upgrade-max-note">No further expansion is currently available.</div></article>';
    const unlocked=q.eligible&&!q.shortfall;
    const reason=!q.eligible?'REQUIRES '+q.requiredReputation+' REPUTATION':
      q.shortfall?'SHORT BY '+cash(q.shortfall):'READY TO EXPAND';
    const status=!q.eligible?'hq-unavailable':q.shortfall?'hq-waiting':'hq-ready';
    const what=forecourt?'forecourt spaces':'repair bays';
    const value=q.current+' → '+q.next+' '+what;
    const message=!q.eligible?'Reach '+q.requiredReputation+
      ' reputation before authorising this upgrade.':
      q.shortfall?'Cash shortfall '+cash(q.shortfall)+
        '; protected repairs, wages and rent must be covered.':
      'Both reputation and cash requirements are met.';
    return '<article class="hq-upgrade"><header class="hq-upgrade-head"><div>'+
      '<small>FACILITY / '+(forecourt?'STOCK CAPACITY':'VEHICLE PREPARATION')+
      '</small><h3>'+title+'</h3></div><span class="hq-status '+status+'">'+
      escape(unlocked?'ELIGIBLE':!q.eligible?'REPUTATION LOCKED':'CASH REQUIRED')+
      '</span></header>'+
      '<div class="hq-upgrade-capacity"><strong>'+value+'</strong><span>'+short+'</span></div>'+
      '<div class="hq-upgrade-costs hq-upgrade-headline-costs">'+
      line('ONE-OFF INVESTMENT',cash(q.cost))+
      line('EXTRA COST PER GAME DAY',cash(q.dailyIncrease))+'</div>'+
      '<div class="'+(unlocked?'hq-upgrade-success':'hq-upgrade-warning')+'">'+message+'</div>'+
      '<button type="button" class="trade-button hq-invest-button" '+
      'data-action="upgrade-premises" data-kind="'+kind+'"'+
      (unlocked?'':' disabled')+'>'+
      (unlocked?'APPROVE '+cash(q.cost)+' INVESTMENT':reason)+'</button>'+
      '<details class="hq-upgrade-details"><summary>VIEW INVESTMENT REQUIREMENTS</summary>'+
      '<div class="hq-upgrade-costs">'+
      line('CASH NEEDED INCL. BUFFERS',cash(q.requiredCash))+
      line('REPUTATION REQUIRED',q.requiredReputation+' / 100')+
      '</div><p>Cash protection includes outstanding workshop preparation, payroll '+
      'obligations, the required wage cover and additional premises costs.</p>'+
      '</details></article>';
  }
  function render(state,site){
    const r=figures(state,site),p=r.p,monthly=r.monthly;
    const forecourt=site.quote(state,'forecourt'),workshop=site.quote(state,'workshop');
    const possible=[forecourt,workshop].filter(q=>!q.maximum&&q.eligible&&!q.shortfall).length;
    const nextState=r.arrears?'PAYMENT PRESSURE':
      state.cash<r.runningDaily?'CASH RUNWAY ALERT':
      r.freeSpaces===0?'FORECOURT FULL':
      possible?'EXPANSION POSSIBLE':'OPERATIONS ACTIVE';
    const metrics='<div class="hq-metrics">'+
      label('FORECOURT OCCUPANCY',r.stock+' / '+r.forecourt,
        r.freeSpaces+' '+(r.freeSpaces===1?'space':'spaces')+' available for buying')+
      label('WORKSHOP CAPACITY',r.workshop+' BAYS',
        r.activeRepairs+' in-house '+(r.activeRepairs===1?'job':'jobs')+' in progress')+
      label('DEALERSHIP CASH',cash(state.cash),
        cash(r.cashAfterRepairReserves)+' after workshop reserves')+
      label('DAILY RUNNING COST',cash(r.runningDaily),
        cash(p.total)+' premises + '+cash(r.dailyWages)+' wages')+
      '</div>';
    const head='<div class="hq-brief"><div><small>LIVE BUSINESS OPERATIONS</small>'+
      '<strong>RUNNING YOUR DEALERSHIP</strong>'+
      '<p>Monitor your physical capacity, commitments and investment options.</p></div>'+
      '<span class="hq-brief-status'+(r.arrears||state.cash<r.runningDaily?' hq-brief-alert':'')+'">'+
      nextState+'</span></div>';
    const cost='<section class="hq-cost-panel"><div class="hq-section-heading">'+
      '<div><small>FIXED COSTS / CASH DISCIPLINE</small><h3>OPERATING COMMITMENTS</h3></div>'+
      '<button type="button" class="hq-text-link" data-page="finance">FULL FINANCES</button></div>'+
      '<div class="hq-commit-grid">'+
      line('PREMISES / DAY',cash(p.total))+
      line('STAFF WAGES / DAY',cash(r.dailyWages))+
      line('WORKSHOP FUNDS RESERVED',cash(r.reserve))+
      line('MONTHLY PREMISES GUIDE',cash(p.monthlyGuide))+
      line('OUTSTANDING OBLIGATIONS',cash(r.arrears),r.arrears?' hq-due':'')+
      line('MONTH-TO-DATE PREMISES COST',cash(monthly?.premisesExpense??0))+
      '</div><p class="hq-context">Daily premises and staff costs continue even when no cars sell. '+
      'Repair reserves are part of existing cash, not an additional charge.</p></section>';
    const upgradeHead='<div class="hq-section-heading hq-upgrade-section-head">'+
      '<div><small>FACILITY INVESTMENT / OWNER APPROVAL</small>'+
      '<h3>EXPANSION & RUNNING COSTS</h3></div>'+
      '<span>'+possible+' '+(possible===1?'OPTION':'OPTIONS')+' CURRENTLY AFFORDABLE</span></div>';
    const more='<details class="hq-guidance"><summary>HOW PREMISES EXPANSION WORKS</summary>'+
      '<p>Forecourt expansion raises how many vehicles can be held. Workshop expansion '+
      'adds repair bays but does not hire technicians. Each upgrade requires a reputation '+
      'threshold, a one-off investment and sufficient money to protect existing repair work, '+
      'unpaid bills, seven days of new premises costs and three days of the full wage bill. '+
      'Only the investment is debited immediately; future rent and utilities increase per game day. '+
      'Blocked upgrades cannot be bought. These are fictional operating figures, not UK property quotations.</p>'+
      '</details>';
    const shortcuts='<nav class="hq-shortcuts" aria-label="Dealership departments">'+
      '<span>CONTINUE OPERATIONS</span>'+[
      ['stock','VEHICLE STOCK'],['workshop','WORKSHOP'],
      ['staff','YOUR STAFF'],['reports','MANAGEMENT REPORTS']].map(([page,title])=>
      '<button type="button" data-page="'+page+'">'+title+'</button>').join('')+'</nav>';
    return '<div class="hq-control">'+head+metrics+cost+upgradeHead+
      '<div class="hq-upgrades">'+card(state,site,'forecourt')+
        card(state,site,'workshop')+'</div>'+shortcuts+more+'</div>';
  }
  window.MotorTradePremisesView=Object.freeze({figures,render,card});
})();
