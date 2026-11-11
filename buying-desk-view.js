'use strict';
/* v0.9.16 — Compact direct-seller acquisition workspace.
 * Pure rendering: all prices, affordability and purchasing go through the
 * existing engine. No simulated DVLA, DVSA or HPI service is implied.
 */
(() => {
  const VC=window.MotorTradeCards;
  if(!VC)throw new Error('Load vehicle-cards.js before buying-desk-view.js');
  const money=VC.money,esc=VC.esc;
  const miles=n=>new Intl.NumberFormat('en-GB').format(n)+' mi';
  function condition(car){
    const grade=car.profile?.grade??car.grade;
    return grade<=2?'GOOD':grade===3?'AVERAGE':'ATTENTION';
  }
  function position(quote){
    if(quote.expectedMargin<0)return {kind:'loss',label:'PROJECTED LOSS',text:'At this offer, the expected retail proceeds do not cover acquisition, expected repairs and any paid inspection. Avoid this purchase or renegotiate.'};
    if(quote.price>quote.maxBid)return {kind:'risk',label:'ABOVE BUYING CEILING',text:'Your offer exceeds the suggested buying ceiling by '+money(quote.price-quote.maxBid)+'. The deal may still show a gross margin, but it falls below your target trading contribution.'};
    return {kind:'good',label:'WITHIN BUYING CEILING',text:'The offer is within the modelled buying ceiling. Profit is still uncertain until the car is prepared and actually sold.'};
  }
  function figures(car,state,E,offer){
    const inspected=!!state.reports?.[car.id];
    const quote=E.quote(car,'seller',offer,inspected);
    const reserved=E.workshop.reserved(state);
    // Buying cash: offer now; projected prep must be retained for the workshop.
    // The engine's hard affordability gate also protects any actual hidden fault.
    const remaining=state.cash-reserved-offer-quote.prep;
    return {quote,inspected,remaining,reserved,position:position(quote)};
  }
  function toolbar(state,E,sellers,selected){
    const negotiating=sellers.filter(x=>state.negotiations?.[x.id]?.status==='counter'&&
      !state.vehicles.some(v=>v.origin===x.id)).length;
    const available=sellers.filter(x=>!state.vehicles.some(v=>v.origin===x.id)&&
      state.negotiations?.[x.id]?.status!=='walked').length;
    const reserved=E.workshop.reserved(state);
    const cards=[
      ['PRIVATE SELLER LEADS',sellers.length,'AVAILABLE '+available],
      ['ACTIVE COUNTEROFFERS',negotiating,negotiating?'DECISION NEEDED':'NO OPEN COUNTERS'],
      ['FORECOURT SPACES',state.capacity-state.vehicles.length,
        state.vehicles.length+' / '+state.capacity+' OCCUPIED'],
      ['WORKING CASH',money(Math.max(0,state.cash-reserved)),
        reserved?'REPAIRS RESERVED '+money(reserved):'NO REPAIR CASH COMMITTED']
    ];
    return '<div class="buy-desk-stats">'+cards.map(([label,value,note])=>
      '<div class="buy-stat"><small>'+label+'</small><strong>'+value+
      '</strong><span>'+note+'</span></div>').join('')+'</div>';
  }
  function leadStatus(car,state){
    const negotiation=state.negotiations?.[car.id];
    if(state.vehicles.some(v=>v.origin===car.id)||state.sold.some(v=>v.origin===car.id))
      return ['ACQUIRED','done'];
    if(negotiation?.status==='walked')return ['SELLER LEFT','closed'];
    if(negotiation?.status==='counter')return ['COUNTER '+money(negotiation.counter),'counter'];
    return ['NEW LEAD','new'];
  }
  function leadList(state,E,sellers,selectedId){
    return '<aside class="buy-leads" aria-labelledby="buy-leads-title">'+
      '<div class="buy-leads-heading"><div><small>DIRECT BUYING</small>'+
      '<h2 id="buy-leads-title">SELLER SHORTLIST</h2></div>'+
      '<span>'+sellers.length+' LEADS</span></div>'+
      '<div class="buy-lead-list">'+sellers.map((car,i)=>{
        const [label,kind]=leadStatus(car,state);
        const selected=car.id===selectedId;
        const approach=E.sellerApproach(state,car);
        return '<button type="button" class="buy-lead '+(selected?'buy-lead-selected ':'')+
          'buy-lead-'+kind+'" data-action="select-seller" data-id="'+esc(car.id)+
          '" aria-pressed="'+selected+'">'+
          '<div class="buy-lead-top"><span>LEAD '+String(i+1).padStart(2,'0')+
          ' · '+esc(approach.label)+'</span><b>'+esc(label)+'</b></div>'+
          '<strong>'+esc(car.title)+'</strong>'+
          '<div class="buy-lead-facts"><span>'+miles(car.miles)+
          '</span><span>GRADE '+car.profile.grade+
          '</span><span>'+esc(car.fuel)+'</span></div>'+
          '<div class="buy-lead-bottom"><span>OWNER ASKS</span><b>'+money(car.ask)+'</b></div>'+
          '</button>';
      }).join('')+'</div>'+
      '<p class="buy-leads-tip">These are fictional customer leads, not live classified adverts. Selecting a vehicle does not reserve it.</p>'+
    '</aside>';
  }
  function pricing(car,state,E,offer){
    const {quote,inspected,remaining,reserved,position:signal}=figures(car,state,E,offer);
    const quotes=[
      ['OWNER ASKING',money(car.ask)],
      ['TRADE VALUE',money(quote.trade)],
      ['LIKELY ACHIEVED SALE',money(quote.likelySale)],
      ['SUGGESTED MAX OFFER',money(quote.maxBid)]
    ];
    return '<div class="buy-valuation" aria-label="Vehicle buying appraisal">'+
      '<div class="buy-valuation-heading"><div><small>THE NUMBERS</small><strong>BUYING APPRAISAL</strong></div>'+
      '<span>'+esc(inspected?'INSPECTED':'UNINSPECTED')+'</span></div>'+
      '<div class="buy-value-grid">'+quotes.map(([label,value])=>
        '<div><small>'+label+'</small><strong>'+value+'</strong></div>').join('')+'</div>'+
      '<div class="buy-budget-table">'+
        '<div><span>Offer being considered</span><b id="desk-offer-'+esc(car.id)+'">'+money(offer)+'</b></div>'+
        '<div><span>Expected preparation / risk allowance</span><b id="desk-prep-'+esc(car.id)+'">'+money(quote.prep)+'</b></div>'+
        '<div><span>Inspection paid</span><b>'+money(quote.inspection)+'</b></div>'+
        '<div><span>Modelled total investment</span><b id="desk-total-'+esc(car.id)+'">'+money(quote.total)+'</b></div>'+
        '<div class="buy-budget-total"><span>PROJECTED GROSS CONTRIBUTION</span>'+
          '<b id="desk-projection-'+esc(car.id)+'" class="'+(quote.expectedMargin<0?'buy-negative':'')+'">'+money(quote.expectedMargin)+'</b></div>'+
        '<div><span>Indicative cash after offer and prep reserves</span><b id="desk-headroom-'+esc(car.id)+'"'+
          (remaining<0?' class="buy-negative"':'')+'>'+money(remaining)+'</b></div>'+
      '</div>'+
      '<div id="desk-signal-'+esc(car.id)+'" class="buy-decision buy-decision-'+signal.kind+'">'+
        '<strong>'+signal.label+'</strong><p>'+esc(signal.text)+'</p></div>'+
      '<p class="buy-budget-note">Gross contribution is an estimate before staff, premises, VAT/tax, retail finance and aftersales liabilities. Uninspected repair budgets include a risk allowance; actual faults can cost more. Existing repair reserves ('+
        money(reserved)+') are protected separately from your offer.</p></div>';
  }
  function tradingControls(car,state,E,offer,reportCard,leadFeedback){
    const [status,kind]=leadStatus(car,state);
    const deal=state.negotiations?.[car.id];
    const closed=['done','closed'].includes(kind);
    const approach=E.sellerApproach(state,car);
    const f=figures(car,state,E,offer);
    const required=f.quote.prep;
    const cannot=state.vehicles.length>=state.capacity?
      'FORECOURT FULL — sell stock before buying again.':
      offer+required+E.workshop.reserved(state)>state.cash?
        'INSUFFICIENT CASH — protected repair funding would be breached.':'';
    const proposed=deal?.status==='counter'?
      '<div class="buy-counter"><small>OWNER COUNTEROFFER · ROUND '+deal.rounds+'</small>'+
        '<strong>SELLER COUNTEROFFER: '+money(deal.counter)+'</strong>'+
        '<p>The owner has not accepted your offer. Accept the counter, revise your offer, or walk away. No money has changed hands.</p></div>':'';
    const notices=kind==='done'?
      '<div class="trade-inline-feedback trade-feedback-success">PURCHASED — vehicle is now in Vehicle Stock. Assess and prepare it before listing.</div>':
      kind==='closed'?'<div class="trade-inline-feedback trade-feedback-warning">OWNER WALKED AWAY — this lead is closed for today.</div>':'';
    const controls=closed?
      '<button type="button" class="trade-button" disabled>ENQUIRY CLOSED</button>'+
      (kind==='done'?'<button type="button" class="trade-button trade-button-secondary" data-page="stock">VIEW VEHICLE STOCK</button>':''):
      '<div class="buy-offer-actions">'+
        '<label for="seller-offer-'+esc(car.id)+'">YOUR OFFER (£)'+
        '<input class="trade-input" id="seller-offer-'+esc(car.id)+'" type="number"'+
        ' inputmode="numeric" min="100" max="'+car.ask+'" step="25" value="'+offer+'"></label>'+
        '<button type="button" class="trade-button" data-action="buy-seller" data-id="'+esc(car.id)+'">'+
          (deal?.status==='counter'?'REVISE OFFER':'MAKE AN OFFER')+'</button></div>'+
      (deal?.status==='counter'?
        '<div class="buy-counter-actions"><button type="button" class="trade-button trade-button-secondary" data-action="accept-seller-counter" data-id="'+esc(car.id)+'">ACCEPT '+money(deal.counter)+'</button>'+
        '<button type="button" class="trade-button trade-button-outline" data-action="walk-seller" data-id="'+esc(car.id)+'">WALK AWAY</button></div>':'');
    return '<div class="buy-trading">'+
      '<div class="buy-seller-story"><span>SELLER POSITION · '+esc(approach.label)+'</span>'+
        '<p>'+esc(approach.description)+'</p></div>'+
      '<div class="buy-trading-heading"><strong>NEGOTIATE THE PURCHASE</strong>'+
        '<small>NO BUYER FEE · CASH PURCHASE</small></div>'+
      proposed+notices+leadFeedback(car.id)+
      (cannot&&!closed?'<p class="trade-purchase-warning">'+esc(cannot)+'</p>':'')+
      controls+
      '<div class="buy-deal-terms"><strong>WHEN A DEAL IS AGREED</strong><p>Purchase cash is debited once, your vehicle joins stock and the workshop must assess it. An owner may counter or withdraw after an unreasonable offer. A paid inspection is non-refundable.</p></div>'+
    '</div>';
  }
  function render(state,E,opts={}){
    const sellers=E.marketFor(state).sellers;
    const active=opts.selectedId&&sellers.some(x=>x.id===opts.selectedId)?
      opts.selectedId:sellers[0]?.id??null;
    const intro=toolbar(state,E,sellers,active);
    if(!sellers.length)return {selectedId:null,html:intro+
      '<div class="buy-no-leads"><h2>NO PRIVATE SELLERS THIS SESSION.</h2>'+
      '<p>Lead volume varies with daily footfall and Deal Day conditions. Do not invent a purchase or force a vehicle deal. Return next session or review existing stock.</p>'+
      '<button class="trade-button trade-button-secondary" data-page="stock">OPEN VEHICLE STOCK</button></div>'};
    const car=sellers.find(x=>x.id===active);
    const draft=opts.drafts&&Number.isSafeInteger(opts.drafts[active])?
      opts.drafts[active]:null;
    const negotiation=state.negotiations?.[active];
    const offer=draft!==null?draft:
      negotiation?.status==='counter'?negotiation.counter:car.ask;
    const report=opts.reportCard(car,'seller',offer);
    const heading='<div class="buy-detail-top"><span>VEHICLE REVIEW · '+esc(car.id)+'</span>'+
      '<span>GRADE '+car.profile.grade+'/5 · '+condition(car)+'</span></div>';
    const detail='<section class="buy-seller-focus" aria-label="Selected private seller">'+heading+
      '<div class="buy-focus-content"><div class="buy-vehicle">'+VC.heading(car,'seller','SELLER VEHICLE · '+esc(car.id))+
      '<p class="buy-car-note">'+esc(car.note||'')+'</p>'+
      '<div class="buy-inspection-prompt"><strong>BEFORE YOU BUY</strong>'+
        '<p>Inspect mileage, service history, MOT advisories and condition. A paid inspection may reveal a hidden repair before you commit.</p></div>'+
      report+'</div>'+
      '<div class="buy-deal-workspace">'+
        pricing(car,state,E,offer)+
        tradingControls(car,state,E,offer,opts.reportCard,opts.leadFeedback)+
      '</div></div></section>';
    return {selectedId:active,html:intro+
      '<div class="buy-main-grid">'+leadList(state,E,sellers,active)+detail+'</div>'+
      '<p class="buy-disclosure">All seller identities, inspection reports and valuations are fictional. Representative vehicle photography is not evidence of the exact vehicle. No live DVSA, DVLA or HPI verification is performed.</p>'};
  }
  window.MotorTradeBuyingDeskView=Object.freeze({render,figures,position});
})();