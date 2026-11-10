'use strict';
/* The Motor Trade v0.4: UI for fictional vehicle dossiers, without any API calls. */
(() => {
  const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  const miles=n=>new Intl.NumberFormat('en-GB').format(n)+' miles';
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(car,kind,{open=false,inspected=false,price=null}={}) {
    if(!car?.profile)return '';
    const p=car.profile,E=window.MotorTradeEngine;
    const quote=kind==='stock'?null:E.quote(car,kind,price,inspected);
    const totalPrep=p.basePrep+(p.hiddenFault?.cost||0);
    const showExtra=inspected||kind==='stock';
    const hidden=showExtra?
      (p.hiddenFault?esc(p.hiddenFault.item)+' — '+money(p.hiddenFault.cost):
        'No additional issue revealed in this simulated assessment'):
      'Not yet verified. A paid inspection may reveal additional repairs.';
    const numbers=quote?[
      ['TRADE VALUE',p.trade],['LIKELY SALE',p.likelySale],
      ['RECOMMENDED MAX',quote.maxBid],['EST. CONTRIBUTION',quote.expectedMargin]
    ]:[
      ['LIKELY SALE',p.likelySale],['ACTUAL PREP QUOTE',totalPrep],
      ['BUY COST',car.cost],['PROJECTED CONTRIBUTION',p.likelySale-car.cost-totalPrep]
    ];
    const stats='<div class="intel-numbers">'+numbers.map(([label,value],i)=>
      '<div><span>'+label+'</span><strong'+(quote&&i===3?' id="projection-'+esc(car.id)+'"':'')+
      (value<0?' class="intel-loss"':'')+'>'+money(value)+'</strong></div>').join('')+'</div>';
    const forecast=quote?'<p class="intel-formula">Forecast: likely sale − offer − fees − expected repairs − inspection if paid. '+
      (inspected?'Inspected cost estimate.':'Uninspected risk allowance included.')+'</p>':'';
    const breakdown=quote?'<h4>MAXIMUM BID / OFFER WORKING</h4>'+
      '<div class="intel-repair"><span>Likely achieved sale</span><strong>'+money(quote.likelySale)+'</strong></div>'+
      '<div class="intel-repair"><span>Expected repair allowance</span><strong>− '+money(quote.prep)+'</strong></div>'+
      '<div class="intel-repair"><span>Buyer fees</span><strong>− '+money(quote.fee)+'</strong></div>'+
      '<div class="intel-repair"><span>Pre-purchase inspection if paid</span><strong>− '+money(quote.inspection)+'</strong></div>'+
      '<div class="intel-repair"><span>Target trading contribution</span><strong>− '+money(quote.targetMargin)+'</strong></div>'+
      '<div class="intel-repair intel-repair-total"><span>Indicative maximum offer (rounded)</span><strong>'+
        money(quote.maxBid)+'</strong></div>'+
      '<p class="intel-small">At your entered offer of '+money(quote.price)+
        ', estimated contribution is '+money(quote.expectedMargin)+
        '. A negative value indicates an expected loss before overheads.</p>':'';
    const known=p.knownRepairs.map(r=>
      '<div class="intel-repair"><span>'+esc(r.item)+'</span><strong>'+money(r.cost)+'</strong></div>').join('');
    const openReport=open?'<div class="intel-expanded"><div class="intel-grid">'+
      '<div><small>ENGINE</small><strong>'+esc(p.engine)+'</strong></div>'+
      '<div><small>PREVIOUS KEEPERS (SIMULATED)</small><strong>'+p.owners+'</strong></div>'+
      '<div><small>CONDITION GRADE</small><strong>'+p.grade+' / 5</strong></div>'+
      '<div><small>SERVICE HISTORY</small><strong>'+esc(car.history)+'</strong></div>'+
      '<div><small>MOT (SIMULATED)</small><strong>'+esc(p.mot.result)+' · '+p.mot.monthsRemaining+' MONTHS LEFT</strong></div>'+
      '<div><small>LAST RECORDED MOT MILEAGE</small><strong>'+miles(p.mot.recordedMiles)+'</strong></div>'+
      '<div><small>LOCAL DEMAND</small><strong>'+esc(p.demand)+'</strong></div>'+
      '<div><small>RETAIL ASKING GUIDE</small><strong>'+money(p.retail)+'</strong></div></div>'+
      '<p class="intel-disclaimer">All registration, MOT and valuation information is fictional. Not connected to DVLA, DVSA or a pricing provider.</p>'+
      '<h4>MOT ADVISORIES</h4><p class="intel-small">'+
        (p.mot.advisories.length?esc(p.mot.advisories.join(' · ')):'No advisories recorded in this fictional report')+'</p>'+
      '<h4>KNOWN PREPARATION ITEMS</h4>'+known+
      '<div class="intel-repair intel-repair-total"><span>Known repair estimate</span><strong>'+money(p.basePrep)+'</strong></div>'+
      '<h4>ADDITIONAL CONDITION RISK</h4><p class="intel-small">'+hidden+'</p>'+breakdown+
      (kind==='stock'?'<p class="intel-small">Workshop quotation, including any additional fault: '+
         money(totalPrep)+'. This amount is payable on preparation.</p>':'')+
      '<div class="intel-foot">'+(kind==='stock'?'':inspected?
        '<span class="intel-inspected">INSPECTION PAID · '+money(p.inspectionFee)+'</span>':
        '<button type="button" class="trade-button trade-button-secondary" data-action="inspect-lead" data-id="'+esc(car.id)+
          '" data-kind="'+kind+'">BUY INSPECTION · '+money(p.inspectionFee)+'</button>')+'</div></div>':'';
    return '<section class="intel-panel"><div class="intel-top">'+
      '<span>VEHICLE FILE '+esc(p.ref)+' · GRADE '+p.grade+'</span>'+
      '<button type="button" class="intel-toggle" data-action="toggle-report" data-id="'+esc(car.id)+
      '" data-kind="'+kind+'" aria-expanded="'+String(open)+'">'+(open?'HIDE REPORT':'VIEW FULL REPORT')+' ▾</button>'+
      '</div>'+stats+forecast+openReport+'</section>';
  }
  window.MotorTradeVehicleView=Object.freeze({render});
})();
