'use strict';
/* The Motor Trade v0.9.9 — one-at-a-time, user-paced vehicle auction hall. */
(() => {
  const VC=window.MotorTradeCards;
  if(!VC)throw new Error('Load vehicle-cards.js before auction-hall-view.js');
  const money=VC.money,esc=VC.esc;
  const quoteMoney=n=>n===null?'QUOTE REQUIRED':money(n);
  const status={
    won:'HAMMERED TO YOU',lost:'RIVAL WON',passed:'PASSED',unsold:'UNSOLD',owned:'PREVIOUS PURCHASE'
  };
  function resultRow(r){
    const className=r.kind==='won'?'auction-result-won':
      r.kind==='lost'?'auction-result-lost':'auction-result-neutral';
    return '<div class="auction-result-row '+className+'"><span>LOT '+esc(r.lotNumber)+
      '</span><div><strong>'+esc(r.title)+'</strong><small>'+esc(status[r.kind]||r.kind)+
      (r.hammer?' · HAMMER '+money(r.hammer):'')+'</small></div><b>'+
      (r.kind==='won'?money(r.total)+' ALL-IN':'£0 SPENT')+'</b></div>';
  }
  function render(state,E,reportCard,previewId=null){
    const h=state.auctionHall,lots=E.marketFor(state).auctions;
    const own=state.auctionHistory.filter(x=>x.kind==='won');
    const nextDay=E.nextAuctionDay(state.day);
    const nextWeekday=(nextDay-1)%7===0?'MONDAY':'TUESDAY';
    const history=state.auctionHistory.slice(-10).reverse();
    const won=h.results.filter(r=>r.kind==='won').length;
    const header='<div class="auction-hall-head"><div><span>INDEPENDENT MOTOR AUCTION · GAME DAY '+
      state.day+'</span><h2>AUCTION <em>HALL.</em></h2>'+
      '<p>One auction per game week, normally Monday (Tuesday when Monday is Deal Day). Bid until either dealer drops out. '+
      'Each lot stays open until resolved, with no real-time timer.</p></div>'+
      '<div class="auction-head-metrics"><div><small>LOTS TODAY</small><strong>'+lots.length+'</strong></div>'+
      '<div><small>ACTIVE LOT</small><strong>'+(h.phase==='finished'||!lots.length?'—':E.lotNumber(h.index))+'</strong></div>'+
      '<div><small>WON TODAY</small><strong>'+won+'</strong></div>'+
      '<div><small>CAREER AUCTION WINS</small><strong>'+own.length+'</strong></div></div></div>';
    const notice='<p class="trade-alert">All amounts are simulated GBP. '+
      (state.financialScenario==='uk2026'?'Buyer-fee bands use the published April 2026 BCA Blue Standard VAT-inclusive schedule, not a universal auction quotation. Over £24,999 requires a direct fee quote. Transport, storage and optional inspections are extra. ':'')+
      'A winning bid becomes binding when the hammer falls. '+
      'Confirm the separate invoice for the winning bid PLUS buyer fee before the car joins your workshop. Preparation funds are protected, not spent at the auction. '+
      'A paid inspection is optional and non-refundable. A lot without a met vendor reserve remains unsold. '+
      'No fees are charged for losing or passing. Competitor bidding is fixed for the day and cannot be rerolled.</p>';
    const catalogue=lots.length?'<div class="auction-catalogue"><h3>NUMBERED LOT CATALOGUE</h3>'+
      '<div class="auction-catalogue-list">'+lots.map((lot,i)=>{
        const r=h.results[i],active=i===h.index&&h.phase!=='finished';
        const spent=state.vehicles.some(v=>v.origin===lot.id)||state.sold.some(v=>v.origin===lot.id);
        return '<article class="auction-catalogue-item '+(active?'auction-catalogue-active':'')+
          (r?' auction-catalogue-done':'')+'"><span>LOT '+E.lotNumber(i)+'</span>'+
          '<strong>'+esc(lot.title)+'</strong>'+
          '<small>'+esc(lot.fuel)+' · '+esc(lot.gearbox)+' · GRADE '+lot.profile.grade+
          ' · GUIDE '+money(lot.guide)+'</small><b>'+ (r?status[r.kind]:active?'ON THE ROSTRUM':spent?'ALREADY OWNED':'UPCOMING')+
          '</b><button type="button" class="auction-catalogue-review" data-action="preview-auction" data-id="'+
          esc(lot.id)+'">VIEW LOT REPORT</button></article>';
      }).join('')+'</div></div>':'';
    if(!lots.length)
      return header+notice+'<div class="trade-empty auction-closed"><h2>AUCTION HOUSE CLOSED TODAY.</h2>'+
        '<p>Auctions run once each game week, normally Monday; never weekends. NEXT SESSION: '+nextWeekday+' · GAME DAY '+nextDay+
        ' (in '+(nextDay-state.day)+' game day'+(nextDay-state.day===1?'':'s')+'). '+
        (state.day%30===0?'Deal Day is also closed to auction bidding. ':'')+
        'Private sellers remain available through the Buying Desk.</p>'+
        '<button type="button" class="trade-button" data-page="auctions">OPEN BUYING DESK</button></div>'+
        (history.length?'<div class="panel-card auction-results"><h3>PREVIOUS HAMMER RESULTS</h3>'+history.map(resultRow).join('')+'</div>':'');
    if(h.phase==='finished')
      return header+notice+catalogue+
        '<div class="panel-card auction-finished"><h3>HAMMER RESULTS · SESSION COMPLETE</h3>'+
        '<p>Every lot has now left the auction ring. Any cars you purchased are in Vehicle Stock for assessment and repair.</p>'+
        h.results.map(resultRow).join('')+
        '<div class="auction-final-actions"><button type="button" class="trade-button" data-page="stock">VIEW VEHICLE STOCK</button>'+
        '<button type="button" class="trade-button trade-button-secondary" data-page="auctions">PRIVATE SELLER DESK</button></div></div>';
    const lot=lots[h.index],current=h.currentBid||lot.guide;
    const previewLot=lots.find(x=>x.id===previewId&&x.id!==lot.id)||null;
    const preview=previewLot?'<section class="panel-card auction-preview"><div class="auction-preview-head"><div><span>CATALOGUE INSPECTION · NOT ON THE ROSTRUM</span><h3>LOT '+
      E.lotNumber(lots.indexOf(previewLot))+' · '+esc(previewLot.title)+
      '</h3></div><button type="button" class="trade-button trade-button-secondary" data-action="close-auction-preview">CLOSE PREVIEW</button></div>'+
      '<div class="auction-preview-body">'+VC.heading(previewLot,'auction',
      'CATALOGUE LOT '+E.lotNumber(lots.indexOf(previewLot)))+
      reportCard(previewLot,'auction',previewLot.guide+250)+
      '<p>Review this lot ahead of its turn. You cannot bid on it until the current lot is finished.</p></div></section>':'';
    const paymentDue=h.phase==='payment';
    const expectedNext=paymentDue?current:current+100,inspection=!!state.reports?.[lot.id];
    const q=E.quote(lot,'auction',expectedNext,inspection);
    const hammerFee=E.auctionFee(state,lot,current);
    const feeUnknown=q.feeQuoteRequired;
    const intelligence=E.people.buyerEstimate(state,lot.rival);
    const already=state.vehicles.some(v=>v.origin===lot.id)||
      state.sold.some(v=>v.origin===lot.id);
    const statusText=h.phase==='result'?(status[h.results.at(-1).kind]||'LOT ENDED'):
      h.phase==='catalogue'?'AWAITING THE AUCTIONEER':
      paymentDue?'HAMMER FALLEN · PAYMENT REQUIRED':
      h.leader==='rival'?'RIVAL DEALER LEADS':'YOU LEAD';
    const controls=paymentDue?
      '<button type="button" class="trade-button auction-primary" data-action="settle-auction">FINALISE PAYMENT · '+
      quoteMoney(hammerFee===null?null:current+hammerFee)+'</button>':
      h.phase==='catalogue'?
      (feeUnknown?
        '<button type="button" class="trade-button trade-button-outline" data-action="pass-auction">SKIP — BUYER FEE NOT QUOTED</button>':
        '<button type="button" class="trade-button auction-primary" data-action="start-auction">OPEN BIDDING — LOT '+
        E.lotNumber(h.index)+'</button>'+
        '<button type="button" class="trade-button trade-button-outline" data-action="pass-auction">SKIP THIS LOT</button>'):
      h.phase==='bidding'?
      (feeUnknown?
        '<button type="button" class="trade-button trade-button-outline" data-action="pass-auction">PASS — FEE QUOTE REQUIRED</button>':
        '<button type="button" class="trade-button auction-primary" data-action="bid-live-auction" data-increment="100">BID +£100</button>'+
        '<button type="button" class="trade-button" data-action="bid-live-auction" data-increment="250">BID +£250</button>'+
        '<button type="button" class="trade-button trade-button-secondary" data-action="bid-live-auction" data-increment="500">BID +£500</button>'+
        '<button type="button" class="trade-button trade-button-outline" data-action="pass-auction">PASS / LEAVE LOT</button>'):
      '<button type="button" class="trade-button auction-primary" data-action="next-auction-lot">'+
      (h.index+1>=lots.length?'FINISH SESSION & VIEW RESULTS':'NEXT LOT '+E.lotNumber(h.index+1))+
      '</button>';
    const cashWarning=paymentDue?'':state.vehicles.length>=state.capacity?
      '<p class="auction-risk">YOUR FORECOURT IS FULL. You cannot bid again until you sell stock.</p>':
      feeUnknown?'<p class="auction-risk">PUBLISHED BUYER FEE UNAVAILABLE ABOVE £24,999. Obtain an individual auctioneer quotation before bidding.</p>':
      E.workshop.reserved(state)+expectedNext+q.fee+
        lot.profile.basePrep+(lot.profile.hiddenFault?.cost||0)>state.cash?
      '<p class="auction-risk">The next £100 bid may exceed available cash after buyer fees and reserved preparation. Consider passing.</p>':'';
    const log=h.feed.length?'<div class="auction-feed" aria-live="polite">'+
      h.feed.slice(-12).map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>':
      '<div class="auction-feed"><p>Inspect the lot before opening the bidding. When you bid, competitors respond immediately.</p></div>';
    const settlement=paymentDue?'<div class="auction-hammer-result auction-hammer-won">'+
      '<strong>HAMMER DOWN — RIVAL DEALER HAS DROPPED OUT</strong><p>Winning hammer '+money(current)+
      ' + buyer fee '+quoteMoney(hammerFee)+' = TOTAL DUE '+quoteMoney(hammerFee===null?null:current+hammerFee)+
      '. Finalise payment to deduct this amount and transfer the car to Vehicle Stock for workshop assessment. '+
      'The auction cannot continue or advance the game day until this invoice is paid.</p></div>':'';
    const resolved=h.phase==='result'?'<div class="auction-hammer-result '+(h.results.at(-1).kind==='won'?'auction-hammer-won':'')+'">'+
      '<strong>'+esc(status[h.results.at(-1).kind])+'</strong><p>'+
      esc(h.results.at(-1).detail)+'</p></div>':'';
    const lotView='<div class="auction-active-grid">'+
      '<article class="panel-card auction-current">'+
      '<div class="auction-rostrum"><span>ON THE ROSTRUM · LOT '+E.lotNumber(h.index)+
      ' / '+lots.length+'</span><strong>'+esc(statusText)+'</strong></div>'+
      '<div class="auction-car-content">'+VC.heading(lot,'auction','LOT '+E.lotNumber(h.index)+' · '+esc(lot.id))+
      '<div class="auction-prices"><div><small>GUIDE</small><strong>'+money(lot.guide)+'</strong></div>'+
      '<div><small>'+(state.financialScenario==='uk2026'?'FEE AT GUIDE (INDICATIVE)':'BUYER FEE')+'</small><strong>'+quoteMoney(lot.fee)+'</strong></div>'+
      '<div><small>KNOWN PREP ESTIMATE</small><strong>'+money(lot.profile.basePrep+(inspection?(lot.profile.hiddenFault?.cost||0):0))+'</strong></div>'+
      '<div><small>LIKELY RETAIL SALE</small><strong>'+money(lot.profile.likelySale)+'</strong></div></div>'+
      reportCard(lot,'auction',expectedNext)+
      '</div></article>'+
      '<aside class="panel-card auction-bid-box"><div class="auction-bid-box-top"><small>LIVE HAMMER POSITION</small>'+
      '<strong>'+money(current)+'</strong><span>'+esc(statusText)+'</span></div>'+
      '<div class="auction-bid-maths"><div><span>'+(paymentDue?'WINNING HAMMER':'NEXT £100 BID')+'</span><b>'+money(expectedNext)+'</b></div>'+
      '<div><span>PLUS BUYER FEE AT SHOWN BID</span><b>'+quoteMoney(q.fee)+'</b></div>'+
      '<div><span>PLUS EXPECTED PREPARATION</span><b>'+money(q.prep)+'</b></div>'+
      '<div><span>PROJECTED GROSS CONTRIBUTION</span><b class="'+(q.expectedMargin!==null&&q.expectedMargin<0?'auction-negative':'')+'">'+quoteMoney(q.expectedMargin)+'</b></div></div>'+
      (intelligence?'<div class="people-bid-intel">VEHICLE BUYER INTELLIGENCE: COMPETITOR BID RANGE '+
        money(intelligence.lower)+'–'+money(intelligence.upper)+
        '. Forecast only — not the actual reserve or final bid.</div>':'')+
      settlement+resolved+cashWarning+
      '<div class="auction-controls">'+controls+'</div>'+
      '<div class="auction-activity"><h3>AUCTIONEER ACTIVITY</h3>'+log+'</div></aside></div>';
    const results=h.results.length?'<div class="panel-card auction-results"><h3>TODAY\'S HAMMER HISTORY</h3>'+
      h.results.map(resultRow).join('')+'</div>':'';
    const recent=history.filter(x=>x.day<state.day).length?
      '<div class="panel-card auction-results"><h3>RECENT SESSION RESULTS</h3>'+
      history.filter(x=>x.day<state.day).slice(0,6).map(resultRow).join('')+'</div>':'';
    return header+notice+catalogue+preview+lotView+results+recent;
  }
  window.MotorTradeAuctionHallView=Object.freeze({render});
})();
