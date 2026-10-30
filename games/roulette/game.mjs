import {WHEEL,BETS,BET_LABELS,STARTING_CREDITS,pickNumber,colour,resolveBet,applyOutcome,initialRun} from './engine.mjs';
const RUN_KEY='ngs_arcade_roulette_run_v1',RECORD_KEY='ngs_arcade_roulette_records_v1';
const $=id=>document.getElementById(id);
const el={balance:$('balance'),best:$('best-score'),spins:$('spins-count'),streak:$('streak-count'),stake:$('stake-value'),stakeSummary:$('stake-summary'),spin:$('spin-button'),bank:$('bank-button'),allIn:$('all-in'),clear:$('clear-bet'),result:$('wheel-result'),resultKicker:$('result-kicker'),resultText:$('result-text'),resultSub:$('result-sub'),recent:$('recent-list'),hint:$('game-hint'),numbers:$('exact-number'),numberRow:$('number-row'),rotor:$('wheel-rotor'),orbit:$('ball-orbit'),canvas:$('wheel-canvas'),wheelPanel:$('wheel-panel'),impact:$('wheel-impact'),streakCard:$('streak-stat'),streakLabel:$('streak-label'),runPanel:document.querySelector('.run-monitor'),runStatus:$('run-status'),runPeak:$('run-peak'),runBiggest:$('run-biggest'),runBestStreak:$('run-best-streak'),runDelta:$('run-delta'),runCaption:$('run-caption'),sound:$('sound-toggle'),dialog:$('end-dialog'),dialogTitle:$('end-title'),dialogMessage:$('end-message'),dialogScore:$('end-score'),endRecord:$('end-record'),newRun:$('new-run'),close:$('end-close')};
const safeStorage={read(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}},write(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch{}}};
const defaultRecords=()=>({best:0,history:[]});
function cleanRecords(raw){if(!raw||!Array.isArray(raw.history)||!Number.isSafeInteger(raw.best)||raw.best<0)return defaultRecords();return {best:raw.best,history:raw.history.filter(x=>Number.isSafeInteger(x)&&x>=0).slice(0,20)};}
const records=cleanRecords(safeStorage.read(RECORD_KEY));
function cleanRun(raw){
 if(!raw||raw.version!==1||!Number.isSafeInteger(raw.balance)||raw.balance<0||!Number.isSafeInteger(raw.spins)||raw.spins<0||raw.spins>10000000)return initialRun();
 const base=initialRun();
 for(const key of ['peak','streak','bestStreak','biggestProfit'])if(!Number.isSafeInteger(raw[key])||raw[key]<0)return base;
 if(!Array.isArray(raw.results))return base;
 const results=raw.results.filter(x=>Number.isInteger(x.number)&&x.number>=0&&x.number<=36&&typeof x.won==='boolean'&&Number.isSafeInteger(x.net)).slice(0,10);
 const pending=raw.pending;
 if(pending!==null&&pending!==undefined){
  if(!pending||!Number.isInteger(pending.number)||pending.number<0||pending.number>36||!Number.isInteger(pending.stake)||pending.stake<1||!BETS.includes(pending.bet)||pending.stake>raw.balance)return base;
  try{return applyOutcome({...raw,results,pending:null},resolveBet({balance:raw.balance,stake:pending.stake,bet:pending.bet,number:pending.number,selection:pending.selection}));}catch{return base;}
 }
 return {...raw,results,pending:null};
}
let run=cleanRun(safeStorage.read(RUN_KEY));
let bet='red',selection=7,stake=Math.min(5,run.balance),phase='ready',wheelAngle=0,animationFrame=0,soundEnabled=false,audioContext=null;
const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
let spinStartTick=0;
const relaunchAnimation=element=>{element.style.animation='none';void element.offsetWidth;element.style.animation='';};
function saveRun(){safeStorage.write(RUN_KEY,run);}
function saveRecords(){safeStorage.write(RECORD_KEY,records);}
function format(n){return n.toLocaleString('en-GB');}
function beep(freq=440,duration=.07,type='sine'){
 if(!soundEnabled)return;
 try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioContext.currentTime);g.gain.setValueAtTime(.04,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch{}
}
function updateUI(){
 el.balance.textContent=format(run.balance);el.best.textContent=format(records.best);el.spins.textContent=format(run.spins);el.streak.textContent=format(run.streak);
 const hot=run.streak>=3;el.streakCard.classList.toggle('is-hot',hot);el.streakLabel.hidden=!hot;el.streakLabel.textContent=run.streak>=5?'ON FIRE!':'HOT STREAK';
 el.stake.textContent=format(stake);el.stakeSummary.textContent=format(stake)+' CREDIT'+(stake===1?'':'S')+' ON '+(bet==='straight'?'NUMBER '+selection:BET_LABELS[bet].toUpperCase());
 el.numberRow.hidden=bet!=='straight';el.numbers.value=String(selection);
 const idle=phase==='ready'&&run.balance>0;
 for(const button of document.querySelectorAll('[data-bet]')){const selected=button.dataset.bet===bet;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));button.disabled=!idle;}
 for(const button of document.querySelectorAll('[data-add]'))button.disabled=!idle||stake>=run.balance;
 el.clear.disabled=!idle||stake===0;el.allIn.disabled=!idle||stake===run.balance;el.numbers.disabled=!idle;
 el.spin.disabled=!idle||stake<1||stake>run.balance;
 el.spin.textContent=phase==='spinning'?'SPINNING…':phase==='finished'?'RUN COMPLETE':'SPIN THE WHEEL ↻';
 el.bank.disabled=!idle||run.spins===0;
 el.runPeak.textContent=format(run.peak);el.runBiggest.textContent=format(run.biggestProfit);el.runBestStreak.textContent=format(run.bestStreak);
 const delta=run.balance-STARTING_CREDITS;
 el.runDelta.textContent=delta===0?'EVEN':(delta>0?'+':'−')+format(Math.abs(delta));
 el.runDelta.className='run-delta '+(delta>0?'positive':delta<0?'negative':'neutral');
 const low=run.balance<=20,active=phase==='ready'&&run.spins>0;
 const status=phase==='spinning'?'SPINNING':phase==='finished'?'RUN ENDED':run.spins===0?'NEW RUN':run.streak>=3?'HOT STREAK':low?'LOW CREDITS':run.balance>records.best?'RECORD IN REACH':'RUN ACTIVE';
 el.runStatus.textContent=status;
 el.runStatus.className='run-status '+(phase==='spinning'?'spinning':run.streak>=3&&active?'hot':low&&active?'low':'');
 el.runPanel.classList.toggle('hot',run.streak>=3&&active);
 el.runCaption.textContent=phase==='spinning'?'OUTCOME LOCKED · WATCH THE WHEEL':phase==='finished'?'RUN COMPLETE':run.spins===0?'START WITH 100 VIRTUAL CREDITS':low?'LOW BALANCE · CHOOSE YOUR STAKE':run.balance>records.best?'BANK NOW TO SET A PERSONAL BEST':'BANK YOUR BALANCE OR SPIN AGAIN';
 el.recent.replaceChildren();
 if(!run.results.length){const s=document.createElement('span');s.className='empty-recent';s.textContent='No spins yet';el.recent.append(s);}
 else for(const row of run.results){const badge=document.createElement('span');badge.className='recent-ball '+colour(row.number);badge.textContent=String(row.number);badge.title=row.number+' '+colour(row.number)+' — '+(row.won?'win':'loss');el.recent.append(badge);}
}
function flashResult(kicker,text,sub,tone=''){el.result.className='wheel-result '+tone;el.resultKicker.textContent=kicker;el.resultText.textContent=text;el.resultSub.textContent=sub;relaunchAnimation(el.result);}
function arcadeImpact(text,tone){
 el.impact.textContent=text;
 el.wheelPanel.classList.remove('is-spinning','is-win','is-big-win','is-loss');
 el.wheelPanel.classList.add('is-landed');
 if(tone)el.wheelPanel.classList.add(tone);
 relaunchAnimation(el.impact);
}
function clearImpact(){
 el.wheelPanel.classList.remove('is-win','is-big-win','is-loss','is-spinning','is-landed');
 el.impact.textContent='';
}
function setBet(value){if(phase!=='ready'||run.balance===0||!BETS.includes(value))return;bet=value;beep(510,.04);updateUI();}
function addStake(amount){if(phase!=='ready'||!Number.isSafeInteger(amount)||amount<0)return;stake=Math.min(run.balance,stake+amount);beep(330,.035);updateUI();}
function recordScore(score){records.history.unshift(score);records.history=records.history.slice(0,20);const isRecord=score>records.best;records.best=Math.max(records.best,score);saveRecords();return isRecord;}
function finishRun(busted){
 if(phase==='finished')return;
 phase='finished';const banked=busted?0:run.balance,record=recordScore(banked);safeStorage.write(RUN_KEY,null);
 el.dialog.classList.toggle('is-record',record);
 el.dialogTitle.textContent=busted?'OUT OF CREDITS':record?'NEW PERSONAL BEST!':'SCORE BANKED';
 el.dialogMessage.textContent=busted?'Your run is over. Every new run starts fresh with 100 credits.':'Run complete after '+run.spins+' spin'+(run.spins===1?'':'s')+'.';
 el.dialogScore.textContent=format(banked);el.endRecord.textContent=record?'NEW TOP SCORE SAVED TO THIS DEVICE':'Personal best: '+format(records.best);
 el.hint.textContent=busted?'Balance reached zero. Start a fresh run.':'Your ending balance is now your banked score.';
 updateUI();beep(busted?230:760,.15);if(!el.dialog.open)el.dialog.showModal();
}
function onResolved(outcome){
 run=applyOutcome(run,outcome);saveRun();phase='ready';drawWheel(outcome.number);const c=colour(outcome.number).toUpperCase();
 const wonBig=outcome.won&&(outcome.net>=100||outcome.bet==='straight');
 arcadeImpact(outcome.won?(wonBig?'BIG WIN +'+format(outcome.net):'WIN +'+format(outcome.net)):'−'+format(outcome.stake),outcome.won?(wonBig?'is-big-win':'is-win'):'is-loss');
 if(outcome.won){
  const streakText=run.streak>=3?' · HOT STREAK ×'+run.streak:' · '+run.streak+' win'+(run.streak===1?'':'s')+' in a row';
  flashResult('WINNING POCKET',outcome.number+' '+c,'+'+format(outcome.net)+' credits'+streakText,'winner');beep(wonBig?880:700,.16,'triangle');
 }
 else{flashResult('WINNING POCKET',outcome.number+' '+c,'−'+format(outcome.stake)+' credits','loser');beep(230,.09);}
 if(stake>run.balance)stake=run.balance;
 el.hint.textContent=outcome.won?'Nice result. Play another round or bank your score.':'Choose your next bet or bank your score.';
 updateUI();if(run.balance===0)finishRun(true);
}
function spin(){
 if(phase!=='ready'||stake<1||stake>run.balance)return;
 let number;try{number=pickNumber();}catch{el.hint.textContent='Secure random selection is unavailable. Please use an up-to-date browser.';return;}
 const activeBet=bet,activeStake=stake,activeSelection=bet==='straight'?selection:null;
 const outcome=resolveBet({balance:run.balance,bet:activeBet,stake:activeStake,selection:activeSelection,number});
 // Save locked outcome before animation. Refresh cannot reroll a losing spin.
 run.pending={bet:activeBet,stake:activeStake,selection:activeSelection,number};saveRun();
 phase='spinning';clearImpact();drawWheel();el.wheelPanel.classList.add('is-spinning');flashResult('WHEEL IN MOTION','SPINNING…','Watch the ball find its pocket');el.hint.textContent='Spin in progress. Betting is locked.';updateUI();beep(410,.1,'triangle');
 // The pocket at index i is centred at -90° on the canvas; the fixed pointer
 // is also at -90°. The final wheel angle is therefore -i * (360/37).
 const index=WHEEL.indexOf(number),step=360/WHEEL.length;
 const remaining=((-index*step-wheelAngle)%360+360)%360;
 const target=wheelAngle+5*360+remaining;
 const duration=reducedMotion?180:3900;
 const ballStart=0,ballDistance=6*360;
 let start=null;cancelAnimationFrame(animationFrame);spinStartTick=0;const ball=el.orbit.firstElementChild;if(ball)ball.style.top='8%';
 const frame=time=>{
  if(start===null)start=time;
  const p=Math.min(1,(time-start)/duration);
  const ease=1-Math.pow(1-p,4);
  const orbitEase=1-Math.pow(1-p,2.8);
  const rotation=wheelAngle+(target-wheelAngle)*ease;
  el.rotor.style.transform='rotate('+rotation+'deg)';
  el.orbit.style.transform='rotate('+(ballStart-ballDistance*orbitEase)+'deg)';
  // Ball comes inward on the last part of the spin.
  const settle=Math.max(0,(p-.76)/.24);
  if(ball)ball.style.top=(8+settle*5)+'%';
  if(!reducedMotion&&soundEnabled&&p>.64&&p<.95){
    const tick=Math.floor((p-.64)*23);
    if(tick>spinStartTick){spinStartTick=tick;beep(300+tick*14,.024,'triangle');}
  }
  if(p<1){animationFrame=requestAnimationFrame(frame);}
  else{
    wheelAngle=target%360;
    el.rotor.style.transform='rotate('+wheelAngle+'deg)';
    el.orbit.style.transform='rotate(0deg)';
    if(ball)ball.style.top='13%';
    onResolved(outcome);
  }
 };
 animationFrame=requestAnimationFrame(frame);
}
function bank(){if(phase!=='ready'||run.spins<1||run.balance===0)return;finishRun(false);}
function startNew(){cancelAnimationFrame(animationFrame);run=initialRun();bet='red';selection=7;stake=5;phase='ready';wheelAngle=0;clearImpact();drawWheel();el.dialog.classList.remove('is-record');el.rotor.style.transform='rotate(0deg)';el.orbit.style.transform='rotate(0deg)';if(el.orbit.firstElementChild)el.orbit.firstElementChild.style.top='8%';saveRun();if(el.dialog.open)el.dialog.close();flashResult('READY TO PLAY','PLACE YOUR BET','Choose a wager and press SPIN');el.hint.textContent='New run started with 100 virtual credits.';updateUI();}
function drawWheel(highlightNumber=null){
 const cv=el.canvas,ctx=cv.getContext('2d');if(!ctx)return;
 // Paint a high-resolution, layered wheel without changing the fair game logic.
 const size=560,c=280,step=Math.PI*2/WHEEL.length;
 const scale=cv.width/size;ctx.setTransform(scale,0,0,scale,0,0);
 ctx.clearRect(0,0,size,size);
 const ring=(radius,fill,stroke,width=1)=>{
  ctx.beginPath();ctx.arc(c,c,radius,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
 };
 const grad=(stops,radius=265)=>{
  const g=ctx.createLinearGradient(c-radius,c-radius,c+radius,c+radius);
  for(const [at,col] of stops)g.addColorStop(at,col);
  return g;
 };
 const gold=grad([[0,'#fff0aa'],[.12,'#ae7938'],[.32,'#3f2412'],[.54,'#f1d17a'],[.77,'#80521e'],[1,'#f4ca61']]);
 // A physical outer bezel, concentric brushed-gold rails, and deep shadow.
 ring(278,'#09090a','#5c361d',2);
 ring(268,gold,'#e5bd60',3);
 ring(256,'#130f0f','#241810',3);
 ring(249,gold,'#9e682c',3);
 ring(241,'#0c0b0d','#dfae55',2);
 // 37 real European-roulette pockets. Canvas index zero is centred under top pointer.
 WHEEL.forEach((number,i)=>{
  const a=-Math.PI/2+i*step,inner=195,outer=238;
  ctx.beginPath();ctx.arc(c,c,outer,a-step/2,a+step/2);
  ctx.arc(c,c,inner,a+step/2,a-step/2,true);ctx.closePath();
  const red=number!==0&&colour(number)==='red';
  ctx.fillStyle=number===0?'#167b50':red?'#b9363d':'#191a1e';ctx.fill();
  ctx.strokeStyle='rgba(246,199,107,.7)';ctx.lineWidth=1.5;ctx.stroke();
  if(number===highlightNumber){
    ctx.save();
    ctx.fillStyle='rgba(255,220,118,.22)';
    ctx.fill();
    ctx.strokeStyle='#fff0b3';ctx.lineWidth=5;
    ctx.shadowColor='#ffe288';ctx.shadowBlur=21;ctx.stroke();
    ctx.restore();
  }
  ctx.save();ctx.translate(c,c);ctx.rotate(a+Math.PI/2);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 15px Arial,sans-serif';
  ctx.fillStyle='#fff3d9';ctx.shadowColor='#000';ctx.shadowBlur=2;
  ctx.fillText(String(number),0,-219);ctx.restore();
 });
 ring(193,gold,'#f2cf75',3);
 ring(184,'#130e0f','#714d25',3);
 // Brushed curved base and subtle radial spokes suggest a dimensional rotor.
 const bowl=ctx.createRadialGradient(c-35,c-50,9,c,c,185);
 bowl.addColorStop(0,'#6d4933');bowl.addColorStop(.22,'#3b2924');bowl.addColorStop(.58,'#171215');bowl.addColorStop(.87,'#100c0e');bowl.addColorStop(1,'#513420');
 ring(180,bowl,'#c29446',3);
 for(let i=0;i<18;i++){
  const a=i*Math.PI/9;
  ctx.beginPath();ctx.moveTo(c+Math.cos(a)*124,c+Math.sin(a)*124);
  ctx.lineTo(c+Math.cos(a)*173,c+Math.sin(a)*173);
  ctx.strokeStyle='rgba(227,180,88,.11)';ctx.lineWidth=3;ctx.stroke();
 }
 ring(129,gold,'#d0a352',3);
 ring(119,'#140e10','#f1c26b',2);
 const glass=ctx.createRadialGradient(c-22,c-35,5,c,c,115);
 glass.addColorStop(0,'#473132');glass.addColorStop(.5,'#1c1519');glass.addColorStop(1,'#0e0b0d');
 ring(109,glass,'#8f6539',2);
 // The floating HTML hub stays upright, allowing the wheel and logo to read clearly.
}
for(let n=0;n<37;n++){const o=document.createElement('option');o.value=String(n);o.textContent=String(n);el.numbers.append(o);}
el.numbers.value=String(selection);
document.querySelectorAll('[data-bet]').forEach(b=>b.addEventListener('click',()=>setBet(b.dataset.bet)));
document.querySelectorAll('[data-add]').forEach(b=>b.addEventListener('click',()=>addStake(Number(b.dataset.add))));
el.numbers.addEventListener('change',()=>{selection=Number(el.numbers.value);updateUI();});
el.allIn.addEventListener('click',()=>{if(phase==='ready'){stake=run.balance;updateUI();beep(330,.04);}});
el.clear.addEventListener('click',()=>{if(phase==='ready'){stake=0;updateUI();}});
el.spin.addEventListener('click',spin);el.bank.addEventListener('click',bank);el.newRun.addEventListener('click',startNew);
el.close.addEventListener('click',startNew);
el.sound.addEventListener('click',()=>{soundEnabled=!soundEnabled;el.sound.setAttribute('aria-pressed',String(soundEnabled));el.sound.setAttribute('aria-label',soundEnabled?'Turn sound off':'Turn sound on');el.sound.innerHTML=soundEnabled?'SOUND ON <span aria-hidden="true">♪</span>':'SOUND OFF <span aria-hidden="true">♪</span>';if(soundEnabled)beep(520,.09);});
el.dialog.addEventListener('cancel',e=>{e.preventDefault();});
drawWheel();
if(run.balance===0){phase='finished';safeStorage.write(RUN_KEY,null);el.hint.textContent='Your last run ended at zero. Start a new run.';el.dialogTitle.textContent='OUT OF CREDITS';el.dialogMessage.textContent='Your run has ended. Start again with 100 virtual credits.';el.dialogScore.textContent='0';el.endRecord.textContent='Personal best: '+format(records.best);el.dialog.showModal();}
else if(run.spins>0&&run.results.length){
 const last=run.results[0],index=WHEEL.indexOf(last.number);
 if(index!==-1){
  wheelAngle=((-index*360/WHEEL.length)%360+360)%360;
  el.rotor.style.transform='rotate('+wheelAngle+'deg)';
  if(el.orbit.firstElementChild)el.orbit.firstElementChild.style.top='13%';
  drawWheel(last.number);
  el.wheelPanel.classList.add('is-landed');
 }
 flashResult('LAST WINNING POCKET',last.number+' '+colour(last.number).toUpperCase(),last.won?'Last spin won':'Last spin lost',last.won?'winner':'loser');
 el.hint.textContent='Your previous run has been restored.';
}
updateUI();saveRun();