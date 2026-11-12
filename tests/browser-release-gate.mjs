'use strict';
/*
 * The Motor Trade -- real Chromium release gate.
 * Works against this checked-out PR via localhost. No public deployment.
 * Every business action uses an actual clickable on-screen control.
 * The live production engine independently validates the saved career.
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL=process.env.GAME_BASE_URL||'http://127.0.0.1:4173';
const OUT='browser-evidence';
await mkdir(OUT,{recursive:true});
const browser=await chromium.launch({headless:true});
let checks=0;
function ok(condition,detail){assert.ok(condition,detail);checks++;}
function equal(actual,expected,detail){assert.equal(actual,expected,detail);checks++;}
const failures=[];
async function run(label,func){
  try{await func();console.log('BROWSER_PASS '+label);}
  catch(error){failures.push({label,error:String(error.stack||error)});console.error('BROWSER_FAIL '+label+' '+(error.stack||error));}
}
const make=async(viewport)=>{
  const context=await browser.newContext({viewport,deviceScaleFactor:1,
    isMobile:viewport.width<600,hasTouch:viewport.width<600,
    reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#menu-new-career').waitFor({state:'visible'});
  return {context,page,errors};
};
const state=page=>page.evaluate(()=>{
  const raw=localStorage.getItem('the-motor-trade-career-v1');
  if(!raw)throw Error('No career saved in localStorage');
  const rawCareer=JSON.parse(raw);
  if(!window.MotorTradeEngine.normalize(JSON.parse(raw)))
    throw Error('Saved career failed production MotorTradeEngine.normalize');
  const ledgerBalance=rawCareer.startupAccounts?.openingBank??12500;
  const actualBank=ledgerBalance+rawCareer.ledger.reduce((n,x)=>n+x.delta,0);
  if(rawCareer.cash!==actualBank)throw Error('Live bank and stored ledger do not reconcile');
  return rawCareer;
});
async function start(page,name){
  await page.locator('#menu-new-career').click();
  ok(await page.locator('#screen-setup').isVisible(),'New Career must open the setup screen');
  await page.locator('#dealership-name').fill(name);
  ok(await page.locator('#career-realism').isChecked(),'UK2026 realistic career should be default');
  await page.locator('.setup-submit').click();
  await page.locator('#screen-career').waitFor({state:'visible'});
  const s=await state(page);
  equal(s.financialScenario,'uk2026','Started the realistic UK career');
  equal(s.cash,50000,'£50k real opening bank');
  return s;
}
async function nav(page,key){
  await page.locator('.career-nav button[data-page="'+key+'"]').click();
  await page.locator('[data-panel="'+key+'"]').waitFor({state:'visible'});
  equal(await page.locator('#topbar-page').innerText(),
    ({dashboard:'DASHBOARD',auctions:'BUYING DESK',auctionHall:'AUCTION HALL',
      stock:'VEHICLE STOCK',workshop:'WORKSHOP OPERATIONS',sales:'SALES OFFICE',
      finance:'FINANCES',inbox:'INBOX',reports:'MANAGEMENT REPORTS',
      events:'EVENTS & MEETINGS',staff:'STAFF & RECRUITMENT',
      reputation:'REPUTATION',business:'MY DEALERSHIP'})[key],
    key+' routes to correct page');
}
async function overflow(page,name){
  const expected=page.viewportSize().width;
  const data=await page.evaluate(()=>{
    const w=innerWidth;
    return {viewport:w,root:document.documentElement.scrollWidth,
      body:document.body.scrollWidth,
      visual:visualViewport?.width,client:document.documentElement.clientWidth,
      offenders:[...document.querySelectorAll('body *')].map(el=>{
        const r=el.getBoundingClientRect();
        return {tag:el.tagName,className:typeof el.className==='string'?el.className.slice(0,80):'',
          left:Math.round(r.left),right:Math.round(r.right),
          width:Math.round(r.width)}
      }).filter(x=>x.right>w+8&&x.width>50).slice(0,12)};
  });
  ok(data.root<=expected+4&&data.body<=expected+4&&data.viewport<=expected+4&&
     data.client<=expected+4,
    name+' horizontal viewport overflow vs requested '+expected+'px: '+JSON.stringify(data));
}
async function clickAction(page,action,sub=''){
  const target=page.locator('[data-panel]:not([hidden]) [data-action="'+action+'"]'+sub).first();
  await target.click({timeout:10000});
}
async function dayForward(page){
  let prev=(await state(page)).day;
  for(let i=0;i<9;i++){
    let s=await state(page);
    if(s.day>prev){ok(s.day===prev+1,'A Continue advances exactly one day');return;}
    if(s.day>1&&windowIsMeeting(s)){
      await nav(page,'events');
      const choose=page.locator('[data-panel="events"] [data-action="hold-meeting"][data-focus="sales"]');
      await choose.click();
    }
    await page.locator('#continue-day').click();
    s=await state(page);
    if(s.day>prev){ok(s.day===prev+1,'One ordinary day progressed');return;}
  }
  throw Error('Unable to move the real UI past Deal Day / board meeting on day '+prev);
}
function windowIsMeeting(s){return (s.day-1)%30===0&&s.meetingHeldMonth!==(Math.floor((s.day-1)/30)+1);}
async function capture(page,name){
  // Capture from the top. Full-page screenshots otherwise bake fixed-position
  // elements (including the offscreen keyboard-only skip link) into the image
  // at the current scroll offset, misrepresenting the visible player UI.
  await page.evaluate(()=>{
    document.documentElement.style.scrollBehavior='auto';
    window.scrollTo(0,0);
  });
  const shot=await page.screenshot({path:OUT+'/'+name+'.png',fullPage:true,animations:'disabled'});
  const actual=shot.readUInt32BE(16),expected=page.viewportSize().width;
  ok(actual<=expected+4,
    name+' full-page screenshot expanded horizontally from '+expected+'px to '+actual+'px');
}

const sizes=[
  {name:'desktop-1440',viewport:{width:1440,height:900}},
  {name:'tablet-768',viewport:{width:768,height:1024}},
  {name:'phone-390',viewport:{width:390,height:844}},
  {name:'phone-360',viewport:{width:360,height:780}}
];
const PAGES=['dashboard','auctions','auctionHall','stock','workshop','sales',
  'finance','reports','events','staff','reputation','business','inbox'];
for(const item of sizes){
  await run(item.name+' layout/nav/save',async()=>{
    const {page,context,errors}=await make(item.viewport);
    try{
      await overflow(page,item.name+' initial menu');
      await start(page,'Browser QA '+item.name);
      await capture(page,item.name+'-dashboard');
      for(const key of PAGES){
        await nav(page,key);
        await overflow(page,item.name+' '+key);
        if(['stock','finance','auctions'].includes(key))
          await capture(page,item.name+'-'+key);
      }
      const original=await state(page);
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('#menu-continue').waitFor({state:'visible'});
      await page.locator('#menu-continue').click();
      const restored=await state(page);
      equal(restored.cash,original.cash,'Reload preserves opening bank');
      equal(restored.day,original.day,'Reload preserves game day');
      equal(restored.ledger.length,original.ledger.length,'Reload does not duplicate charges');
      equal(errors.length,0,'No uncaught browser JavaScript: '+JSON.stringify(errors));
    }finally{await context.close();}
  });
}
async function retailJourney(viewport,label){
  const {page,context,errors}=await make(viewport);
  try{
    await start(page,'Actual Trading Browser QA');
    await nav(page,'auctions');
    let s=await state(page);
    const leads=await page.locator('#market-sellers [data-action="select-seller"]').count();
    ok(leads>0,'Real Buying Desk contains selectable owner leads');
    const market=await page.evaluate(()=>{
      const s=JSON.parse(localStorage.getItem('the-motor-trade-career-v1'));
      return window.MotorTradeEngine.marketFor(s).sellers.map(x=>({id:x.id,ask:x.ask}));
    });
    const choice=market[0];
    await page.locator('#market-sellers [data-action="select-seller"][data-id="'+choice.id+'"]').click();
    await page.locator('#seller-offer-'+choice.id).fill(String(choice.ask));
    const before=await state(page);
    await clickAction(page,'buy-seller','[data-id="'+choice.id+'"]');
    s=await state(page);
    equal(s.vehicles.length,1,'Bought one actual owner-sourced vehicle');
    equal(s.cash,before.cash-choice.ask,'Private owner purchase debits exactly agreed offer');
    ok(s.ledger.some(x=>x.note.startsWith('Direct purchase: ')),'Cash purchase is in permanent ledger');
    await capture(page,label+'-actual-private-owner-purchase');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('#menu-continue').click();
    s=await state(page);
    equal(s.vehicles.length,1,'Reload preserves owned car');
    await nav(page,'workshop');
    const vehicleId=s.vehicles[0].id;
    const assessment=page.locator('[data-panel="workshop"] [data-action="assess-workshop"][data-id="'+vehicleId+'"]');
    ok((await assessment.innerText()).includes('£80'),'Modern assessment button must quote £80 when no mechanic exists');
    const assessmentBank=s.cash;
    await assessment.click();
    s=await state(page);
    equal(s.cash,assessmentBank-80,'Exact quoted UK2026 assessment charged');
    await clickAction(page,'start-workshop','[data-id="'+vehicleId+'"][data-method="external"]');
    s=await state(page);
    equal(s.vehicles[0].workshop.stage,'in-progress','Repairs booked, not instantly completed');
    ok(s.vehicles[0].workshop.repairCost>0,'Workshop expense genuinely paid');
    await capture(page,label+'-actual-workshop-booked');
    for(let i=0;i<15;i++){
      s=await state(page);
      if(s.vehicles[0].status==='prepared')break;
      if(s.vehicles[0].workshop.stage==='quality-check'){
        await nav(page,'workshop');
        await clickAction(page,'finish-workshop','[data-id="'+vehicleId+'"]');
      }else{
        await dayForward(page);
      }
    }
    s=await state(page);
    equal(s.vehicles[0].status,'prepared','Actual repair time and QC passed');
    await nav(page,'stock');
    const asking=Math.round(s.vehicles[0].profile.likelySale/50)*50;
    await page.locator('#stock-price-'+vehicleId).fill(String(asking));
    await clickAction(page,'list-stock','[data-id="'+vehicleId+'"]');
    s=await state(page);
    equal(s.vehicles[0].asking,asking,'Retail price posted via onscreen stock form');
    equal(s.vehicles[0].status,'listed','Car advertised after QC');
    const listDay=s.vehicles[0].listedDay;
    await capture(page,label+'-actual-retail-listing');
    let sold=false;
    for(let i=0;i<145&&!sold;i++){
      await nav(page,'sales');
      let turn=await state(page);
      const c=turn.customerCases[String(vehicleId)];
      if(!c){
        if(await page.locator('[data-panel="sales"] [data-action="open-customer"][data-id="'+vehicleId+'"]').count())
          await clickAction(page,'open-customer','[data-id="'+vehicleId+'"]');
      }
      turn=await state(page);
      const active=turn.customerCases[String(vehicleId)];
      if(active?.status==='enquiry')await clickAction(page,'book-customer','[data-id="'+vehicleId+'"]');
      if(active?.status==='arrived')await clickAction(page,'test-drive','[data-id="'+vehicleId+'"]');
      turn=await state(page);
      if(turn.customerCases[String(vehicleId)]?.status==='discussing')
        await clickAction(page,'agree-cash','[data-id="'+vehicleId+'"]');
      turn=await state(page);
      if(['agreed','collectable'].includes(turn.customerCases[String(vehicleId)]?.status))
        await clickAction(page,'handover-customer','[data-id="'+vehicleId+'"]');
      turn=await state(page);
      if(turn.sold.some(x=>x.id===vehicleId)){sold=true;break;}
      await dayForward(page);
    }
    s=await state(page);
    ok(sold,'Real retail buyer must eventually proceed through actual visit, test drive and handover');
    equal(s.sold.filter(x=>x.id===vehicleId).length,1,'Exactly one retail handover recorded');
    ok(s.sold[0].day>listDay,'No instant retail exit without genuine lead');
    ok(s.ledger.some(x=>x.note.startsWith('Retail balance received on collection:')),'Real bank receipt');
    await nav(page,'finance');
    await capture(page,label+'-actual-completed-sale-finances');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('#menu-continue').click();
    const restored=await state(page);
    equal(restored.sold.length,1,'Real retail sale survives reload');
    equal(restored.cash,s.cash,'Reload never creates another sale receipt');
    equal(restored.ledger.length,s.ledger.length,'Reload never duplicates invoices');
    equal(errors.length,0,'No uncaught JS while completing 150-day retail lifecycle: '+JSON.stringify(errors));
  }finally{await context.close();}
}
await run('desktop full retail lifecycle',()=>retailJourney({width:1440,height:900},'desktop'));
await run('phone-390 full touch retail lifecycle',()=>retailJourney({width:390,height:844},'phone-390'));
await run('desktop auction binding invoice and settlement',async()=>{
  const {page,context,errors}=await make({width:1365,height:768});
  try{
    await start(page,'Auction Browser QA');
    await nav(page,'auctionHall');
    let s=await state(page);
    ok(s.auctionHall.phase==='catalogue','Auction opens with visible catalogue');
    await clickAction(page,'start-auction');
    s=await state(page);
    equal(s.auctionHall.phase,'bidding','Auction rostrum began genuine live bidding');
    for(let i=0;i<35;i++){
      s=await state(page);
      if(s.auctionHall.phase!=='bidding')break;
      await clickAction(page,'bid-live-auction','[data-increment="500"]');
    }
    s=await state(page);
    ok(['payment','result'].includes(s.auctionHall.phase),
      'Repeated bids should resolve as sold or below-reserve, not run forever');
    if(s.auctionHall.phase==='payment'){
      const before=s.cash,vehicleCount=s.vehicles.length;
      await page.locator('#continue-day').click();
      s=await state(page);
      equal(s.day,1,'Binding hammered invoice blocks moving game calendar');
      equal(s.cash,before,'Hammer does not debit bank before invoice paid');
      await capture(page,'desktop-actual-auction-invoice');
      await clickAction(page,'settle-auction');
      s=await state(page);
      equal(s.vehicles.length,vehicleCount+1,'Settlement transfers exact car into stock');
      ok(s.cash<before,'Winning auction and transport debits bank on payment');
      ok(s.ledger.some(x=>x.note.startsWith('Auction purchase:')),'Ledger includes fee-backed auction purchase');
    }else{
      ok(!s.vehicles.length,'Below reserve leaves original car unpurchased');
    }
    equal(errors.length,0,'No uncaught auction JS errors');
  }finally{await context.close();}
});

await browser.close();
console.log('BROWSER_RELEASE_GATE '+JSON.stringify({checks,failures:failures.length,viewports:sizes.map(x=>x.name)}));
if(failures.length)process.exitCode=1;
