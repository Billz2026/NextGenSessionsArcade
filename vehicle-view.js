'use strict';
/* The Motor Trade v0.4: UI for fictional vehicle dossiers, without any API calls. */
(() => {
  const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
  const miles=n=>new Intl.NumberFormat('en-GB').format(n)+' miles';
  const quoteMoney=n=>n===null?'QUOTE REQUIRED':money(n);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(car,kind,{open=false,inspected=false,price=null,inspectionClosed=false}={}) {
    if(!car?.profile)return '';
    const p=car.profile,E=window.MotorTradeEngine;
    const evidence=window.MotorTradeAccuracy?.lookup(car)||
      {status:'pending',note:'No specification source registry available.'};
    const proof=evidence.status==='manufacturer'?
      '<div class="vehicle-spec-proof"><strong>UK MODEL SPECIFICATION SOURCED</strong>'+
      '<p>'+esc(evidence.note)+'</p><a target="_blank" rel="noopener noreferrer" href="'+
      esc(evidence.url)+'">VIEW MANUFACTURER EVIDENCE</a></div>':
      evidence.status==='corroborated'?
      '<div class="vehicle-spec-proof vehicle-spec-pending"><strong>SPECIFICATION CORROBORATED · NOT FACTORY VERIFIED</strong>'+
      '<p>'+esc(evidence.note)+'</p><a target="_blank" rel="noopener noreferrer" href="'+
      esc(evidence.url)+'">VIEW SUPPORTING SOURCE</a></div>':
      '<div class="vehicle-spec-proof vehicle-spec-pending"><strong>MODEL SPECIFICATION · REVIEW PENDING</strong>'+
      '<p>'+esc(evidence.note)+'</p></div>';
    const quote=kind==='stock'?null:E.quote(car,kind,price,inspected);
    const totalPrep=p.basePrep+(p.hiddenFault?.cost||0);
    const booked=car.workshop?.repairCost||0;
    const outstanding=car.workshop?.stage==='ready'?car.prepSpent:
      (['in-progress','quality-check'].includes(car.workshop?.stage)?
        booked:totalPrep);
    const prepLabel=car.workshop?.stage==='ready'?'ACTUAL REPAIR SPEND':
      booked?'BOOKED REPAIR COST':'INITIAL REPAIR BUDGET';
    const showExtra=inspected||
      (kind==='stock'&&(car.workshop?.stage!=='unassessed'||!!p.inspected));
    const hidden=showExtra?
      (p.hiddenFault?esc(p.hiddenFault.item)+' — '+money(p.hiddenFault.cost):
        'No additional issue revealed in this simulated assessment'):
      'Not yet verified. A paid inspection may reveal additional repairs.';
    const numbers=quote?[
      ['TRADE VALUE',p.trade],['LIKELY SALE',p.likelySale],
      ['RECOMMENDED MAX',quote.maxBid],['EST. CONTRIBUTION',quote.expectedMargin]
    ]:[
      ['LIKELY SALE',p.likelySale],[prepLabel,outstanding],
      ['BUY COST',car.cost],['PROJECTED CONTRIBUTION',p.likelySale-car.cost-outstanding]
    ];
    const stats='<div class="intel-numbers">'+numbers.map(([label,value],i)=>
      '<div><span>'+label+'</span><strong'+(quote&&i===3?' id="projection-'+esc(car.id)+'"':'')+
      (value!==null&&value<0?' class="intel-loss"':'')+'>'+quoteMoney(value)+'</strong></div>').join('')+'</div>';
    const forecast=quote?'<p class="intel-formula">'+(quote.feeQuoteRequired?'Published tariff unavailable for this bid — obtain auctioneer fee quote. ': 'Forecast: likely sale − offer − fees − expected repairs − inspection if paid. ')+
      (inspected?'Inspected cost estimate.':'Uninspected risk allowance included.')+'</p>':'';
    const breakdown=quote?'<h4>MAXIMUM BID / OFFER WORKING</h4>'+
      '<div class="intel-repair"><span>Likely achieved sale</span><strong>'+money(quote.likelySale)+'</strong></div>'+
      '<div class="intel-repair"><span>Expected repair allowance</span><strong>− '+money(quote.prep)+'</strong></div>'+
      '<div class="intel-repair"><span>Buyer fees at this offer</span><strong>− '+quoteMoney(quote.fee)+'</strong></div>'+
      '<div class="intel-repair"><span>Pre-purchase inspection if paid</span><strong>− '+money(quote.inspection)+'</strong></div>'+
      '<div class="intel-repair"><span>Target trading contribution</span><strong>− '+money(quote.targetMargin)+'</strong></div>'+
      '<div class="intel-repair intel-repair-total"><span>Indicative maximum offer (rounded)</span><strong>'+
        money(quote.maxBid)+'</strong></div>'+
      '<p class="intel-small">At your entered offer of '+money(quote.price)+
        ', estimated contribution is '+quoteMoney(quote.expectedMargin)+
        '. A negative value indicates an expected loss before overheads.</p>':'';
    const known=p.knownRepairs.map(r=>
      '<div class="intel-repair"><span>'+esc(r.item)+'</span><strong>'+money(r.cost)+'</strong></div>').join('');
    const valuation=car.priceAudit;
    const marketProof=kind==='stock'?'':valuation?.status==='retail-comparable'?
      '<div class="vehicle-spec-proof"><strong>2026 RETAIL PRICE COMPARABLE · '+esc(valuation.confidence.toUpperCase())+' CONFIDENCE</strong>'+
      '<p>Comparator asking '+money(valuation.comparisonAsk)+' at '+miles(valuation.comparisonMiles)+
      '. '+esc(valuation.note)+'. As of '+esc(valuation.asOf)+
      '. No verified wholesale/hammer observation. Auction guide is still a simulation assumption.</p>'+
      '<a href="'+esc(valuation.source)+'" target="_blank" rel="noopener noreferrer">VIEW COMPARATOR</a></div>':
      '<div class="vehicle-spec-proof vehicle-spec-pending"><strong>2026 VALUATION REQUIRES VERIFICATION</strong>'+
      '<p>Trade guide and retail asking are provisional game figures, not live CAP/Auction or exact-match dealer quotes.</p></div>';
    const openReport=open?'<div class="intel-expanded"><div class="intel-grid">'+
      '<div><small>ENGINE / POWERTRAIN</small><strong>'+esc(p.engine)+'</strong></div>'+
      '<div><small>PREVIOUS KEEPERS (SIMULATED)</small><strong>'+p.owners+'</strong></div>'+
      '<div><small>CONDITION GRADE</small><strong>'+p.grade+' / 5</strong></div>'+
      '<div><small>SERVICE HISTORY</small><strong>'+esc(car.history)+'</strong></div>'+
      '<div><small>MOT (SIMULATED)</small><strong>'+esc(p.mot.result)+' · '+p.mot.monthsRemaining+' MONTHS LEFT</strong></div>'+
      '<div><small>LAST RECORDED MOT MILEAGE</small><strong>'+miles(p.mot.recordedMiles)+'</strong></div>'+
      '<div><small>LOCAL DEMAND</small><strong>'+esc(p.demand)+'</strong></div>'+
      '<div><small>RETAIL ASKING GUIDE</small><strong>'+money(p.retail)+'</strong></div></div>'+
      proof+marketProof+
      '<p class="intel-disclaimer">Mileage, prior keepers, MOT, service history, buying and selling valuations are fictional gameplay estimates. They are not DVLA, DVSA, CAP HPI or Auto Trader records. Manufacturer evidence, when linked, verifies only the model derivative and powertrain.</p>'+
      '<h4>MOT ADVISORIES</h4><p class="intel-small">'+
        (p.mot.advisories.length?esc(p.mot.advisories.join(' · ')):'No advisories recorded in this fictional report')+'</p>'+
      '<h4>'+(p.repairBasis?'ILLUSTRATIVE 2026 WORKSHOP JOB CARD':'KNOWN PREPARATION ITEMS')+'</h4>'+known+
      (p.repairBasis?'<p class="intel-small">'+esc(p.repairBasis)+'. These jobs are simulated planning estimates, not confirmed defects or a supplier invoice. The separate assessment fee is charged once.</p>':'')+
      '<div class="intel-repair intel-repair-total"><span>Known repair estimate</span><strong>'+money(p.basePrep)+'</strong></div>'+
      (p.majorExposure?'<h4>UNCONFIRMED POWERTRAIN EXPOSURE</h4>'+
        '<p class="intel-small">'+esc(p.majorExposure.item)+': possible additional '+money(p.majorExposure.maxIndicativeCost)+
        ' if inspection or records warrant this repair. '+esc(p.majorExposure.note)+
        ' The projected risk allowance is not a paid repair bill.</p>':'')+
      '<h4>ADDITIONAL CONDITION RISK</h4><p class="intel-small">'+hidden+'</p>'+breakdown+
      (kind==='stock'?'<p class="intel-small">Original diagnosed repair budget: '+
         money(totalPrep)+'. '+(car.workshop?.stage==='ready'?
           'Actual completed repairs: '+money(car.prepSpent)+'.':
           booked?'Workshop charges already booked: '+money(booked)+'.':
           'The workshop will issue a separate paid quotation. Sales are blocked until final quality control passes.')+
         '</p>':'')+
      '<div class="intel-foot">'+(kind==='stock'?'':inspected?
        '<span class="intel-inspected">INSPECTION PAID · '+money(p.inspectionFee)+'</span>':
        inspectionClosed?'<span class="intel-closed">LOT CLOSED · INSPECTION UNAVAILABLE</span>':
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
