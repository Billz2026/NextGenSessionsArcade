'use strict';
/* The Motor Trade v0.9.9 — one-at-a-time, user-paced vehicle auction hall. */
(() => {
  const VC=window.MotorTradeCards;
  if(!VC)throw new Error('Load vehicle-cards.js before auction-hall-view.js');
  const money=VC.money,esc=VC.esc;
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
    const history=state.auctionHistory.slice(-10).reverse();
    const won=h.results.filter(r=>r.kind==='won').length;
    const header='<div class="auction-hall-head"><div><span>INDEPENDENT MOTOR AUCTION · GAME DAY '+
      state.day+'</span><h2>AUCTION <em>HALL.</em></h2>'+
      '<p>Inspect the catalogue, bid against other dealers and decide what a car is worth to your business. '+
      'Each lot comes through once. There is no artificial waiting timer.</p></div>'+
      '<div class="auction-head-metrics"><div><small>LOTS TODAY</small><strong>'+lots.length+'</strong></div>'+
      '<div><small>ACTIVE LOT</small><strong>'+(h.phase==='finished'||!lots.length?'—':E.lotNumber(h.index))+'</strong></div>'+
      '<div><small>WON TODAY</small><strong>'+won+'</strong></div>'+
      '<div><small>CAREER AUCTION WINS</small><strong>'+own.length+'</strong></div></div></div>';
    const notice='<p class="trade-alert">All amounts are simulated GBP. A bid becomes binding when the hammer falls. The winning hammer and buyer fee are paid immediately; preparation cash is protected until the workshop charges for repairs. '+
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
      return header+notice+'<div class="trade-empty auction-closed"><h2>NO AUCTION SESSION TODAY.</h2>'+
        '<p>Month-end Deal Day is for retail customers and private sellers. Return on the next game day.</p>'+
        '<button type="button" class="trade-button" data-page="auctions">OPEN BUYING DESK</button></div>';
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
    const expectedNext=current+100,inspection=!!state.reports?.[lot.id];
    const q=E.quote(lot,'auction',expectedNext,inspection);
    const intelligence=E.people.buyerEstimate(state,lot.rival);
    const already=state.vehicles.some(v=>v.origin===lot.id)||
      state.sold.some(v=>v.origin===lot.id);
    const statusText=h.phase==='result'?(status[h.results.at(-1).kind]||'LOT ENDED'):
      h.phase==='catalogue'?'AWAITING THE AUCTIONEER':
      h.leader==='rival'?'RIVAL DEALER LEADS':'YOU LEAD · RESERVE NOT MET';
    const controls=h.phase==='catalogue'?
      '<button type="button" class="trade-button auction-primary" data-action="start-auction">OPEN BIDDING — LOT '+
      E.lotNumber(h.index)+'</button>'+
      '<button type="button" class="trade-button trade-button-outline" data-action="pass-auction">SKIP THIS LOT</button>':
      h.phase==='bidding'?
      '<button type="button" class="trade-button auction-primary" data-action="bid-live-auction" data-increment="100">BID +£100</button>'+
      '<button type="button" class="trade-button" data-action="bid-live-auction" data-increment="250">BID +£250</button>'+
      '<button type="button" class="trade-button trade-button-secondary" data-action="bid-live-auction" data-increment="500">BID +£500</button>'+
      '<button type="button" class="trade-button trade-button-outline" data-action="pass-auction">PASS / LEAVE LOT</button>':
      '<button type="button" class="trade-button auction-primary" data-action="next-auction-lot">'+
      (h.index+1>=lots.length?'FINISH SESSION & VIEW RESULTS':'NEXT LOT '+E.lotNumber(h.index+1))+
      '</button>';
    const cashWarning=state.vehicles.length>=state.capacity?
      '<p class="auction-risk">YOUR FORECOURT IS FULL. You cannot bid again until you sell stock.</p>':
      E.workshop.reserved(state)+expectedNext+lot.fee+
        lot.profile.basePrep+(lot.profile.hiddenFault?.cost||0)>state.cash?
      '<p class="auction-risk">The next £100 bid may exceed available cash after buyer fees and reserved preparation. Consider passing.</p>':'';
    const log=h.feed.length?'<div class="auction-feed" aria-live="polite">'+
      h.feed.slice(-12).map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>':
      '<div class="auction-feed"><p>Inspect the lot before opening the bidding. When you bid, competitors respond immediately.</p></div>';
    const resolved=h.phase==='result'?'<div class="auction-hammer-result '+(h.results.at(-1).kind==='won'?'auction-hammer-won':'')+'">'+
      '<strong>'+esc(status[h.results.at(-1).kind])+'</strong><p>'+
      esc(h.results.at(-1).detail)+'</p></div>':'';
    const lotView='<div class="auction-active-grid">'+
      '<article class="panel-card auction-current">'+
      '<div class="auction-rostrum"><span>ON THE ROSTRUM · LOT '+E.lotNumber(h.index)+
      ' / '+lots.length+'</span><strong>'+esc(statusText)+'</strong></div>'+
      '<div class="auction-car-content">'+VC.heading(lot,'auction','LOT '+E.lotNumber(h.index)+' · '+esc(lot.id))+
      '<div class="auction-prices"><div><small>GUIDE</small><strong>'+money(lot.guide)+'</strong></div>'+
      '<div><small>BUYER FEE</small><strong>'+money(lot.fee)+'</strong></div>'+
      '<div><small>KNOWN PREP ESTIMATE</small><strong>'+money(lot.profile.basePrep+(inspection?(lot.profile.hiddenFault?.cost||0):0))+'</strong></div>'+
      '<div><small>LIKELY RETAIL SALE</small><strong>'+money(lot.profile.likelySale)+'</strong></div></div>'+
      reportCard(lot,'auction',expectedNext)+
      '</div></article>'+
      '<aside class="panel-card auction-bid-box"><div class="auction-bid-box-top"><small>LIVE HAMMER POSITION</small>'+
      '<strong>'+money(current)+'</strong><span>'+esc(statusText)+'</span></div>'+
      '<div class="auction-bid-maths"><div><span>NEXT £100 BID</span><b>'+money(expectedNext)+'</b></div>'+
      '<div><span>PLUS BUYER FEE</span><b>'+money(lot.fee)+'</b></div>'+
      '<div><span>PLUS EXPECTED PREPARATION</span><b>'+money(q.prep)+'</b></div>'+
      '<div><span>PROJECTED GROSS CONTRIBUTION</span><b class="'+(q.expectedMargin<0?'auction-negative':'')+'">'+money(q.expectedMargin)+'</b></div></div>'+
      (intelligence?'<div class="people-bid-intel">VEHICLE BUYER INTELLIGENCE: COMPETITOR BID RANGE '+
        money(intelligence.lower)+'–'+money(intelligence.upper)+
        '. Forecast only — not the actual reserve or final bid.</div>':'')+
      resolved+cashWarning+
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
