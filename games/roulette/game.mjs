import {WHEEL,BETS,BET_LABELS,STARTING_CREDITS,pickNumber,colour,resolveBet,applyOutcome,initialRun} from './engine.mjs';
const RUN_KEY='ngs_arcade_roulette_run_v1',RECORD_KEY='ngs_arcade_roulette_records_v1';
const $=id=>document.getElementById(id);
const el={balance:$('balance'),best:$('best-score'),spins:$('spins-count'),streak:$('streak-count'),stake:$('stake-value'),stakeSummary:$('stake-summary'),spin:$('spin-button'),bank:$('bank-button'),allIn:$('all-in'),clear:$('clear-bet'),result:$('wheel-result'),resultKicker:$('result-kicker'),resultText:$('result-text'),resultSub:$('result-sub'),recent:$('recent-list'),hint:$('game-hint'),numbers:$('exact-number'),numberRow:$('number-row'),rotor:$('wheel-rotor'),orbit:$('ball-orbit'),canvas:$('wheel-canvas'),sound:$('sound-toggle'),dialog:$('end-dialog'),dialogTitle:$('end-title'),dialogMessage:$('end-message'),dialogScore:$('end-score'),endRecord:$('end-record'),newRun:$('new-run'),close:$('end-close')};
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
function saveRun(){safeStorage.write(RUN_KEY,run);}
function saveRecords(){safeStorage.write(RECORD_KEY,records);}
function format(n){return n.toLocaleString('en-GB');}
function beep(freq=440,duration=.07,type='sine'){
 if(!soundEnabled)return;
 try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioContext.currentTime);g.gain.setValueAtTime(.04,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch{}
}
function updateUI(){
 el.balance.textContent=format(run.balance);el.best.textContent=format(records.best);el.spins.textContent=format(run.spins);el.streak.textContent=format(run.streak);
 el.stake.textContent=format(stake);el.stakeSummary.textContent=format(stake)+' CREDIT'+(stake===1?'':'S')+' ON '+(bet==='straight'?'NUMBER '+selection:BET_LABELS[bet].toUpperCase());
 el.numberRow.hidden=bet!=='straight';el.numbers.value=String(selection);
 const idle=phase==='ready'&&run.balance>0;
 for(const button of document.querySelectorAll('[data-bet]')){const selected=button.dataset.bet===bet;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));button.disabled=!idle;}
 for(const button of document.querySelectorAll('[data-add]'))button.disabled=!idle||stake>=run.balance;
 el.clear.disabled=!idle||stake===0;el.allIn.disabled=!idle||stake===run.balance;el.numbers.disabled=!idle;
 el.spin.disabled=!idle||stake<1||stake>run.balance;
 el.spin.textContent=phase==='spinning'?'SPINNING…':phase==='finished'?'RUN COMPLETE':'SPIN THE WHEEL ↻';
 el.bank.disabled=!idle||run.spins===0;
 $('foot-peak').textContent='Peak '+format(run.peak);$('foot-biggest').textContent='Biggest win '+format(run.biggestProfit);$('foot-streak').textContent='Best streak '+format(run.bestStreak);
 el.recent.replaceChildren();
 if(!run.results.length){const s=document.createElement('span');s.className='empty-recent';s.textContent='No spins yet';el.recent.append(s);}
 else for(const row of run.results){const badge=document.createElement('span');badge.className='recent-ball '+colour(row.number);badge.textContent=String(row.number);badge.title=row.number+' '+colour(row.number)+' — '+(row.won?'win':'loss');el.recent.append(badge);}
}
function flashResult(kicker,text,sub,tone=''){el.result.className='wheel-result '+tone;el.resultKicker.textContent=kicker;el.resultText.textContent=text;el.resultSub.textContent=sub;}
function setBet(value){if(phase!=='ready'||run.balance===0||!BETS.includes(value))return;bet=value;beep(510,.04);updateUI();}
function addStake(amount){if(phase!=='ready'||!Number.isSafeInteger(amount)||amount<0)return;stake=Math.min(run.balance,stake+amount);beep(330,.035);updateUI();}
function recordScore(score){records.history.unshift(score);records.history=records.history.slice(0,20);const isRecord=score>records.best;records.best=Math.max(records.best,score);saveRecords();return isRecord;}
function finishRun(busted){
 if(phase==='finished')return;
 phase='finished';const banked=busted?0:run.balance,record=recordScore(banked);safeStorage.write(RUN_KEY,null);
 el.dialogTitle.textContent=busted?'OUT OF CREDITS':'SCORE BANKED';
 el.dialogMessage.textContent=busted?'Your run is over. Every new run starts fresh with 100 credits.':'Run complete after '+run.spins+' spin'+(run.spins===1?'':'s')+'.';
 el.dialogScore.textContent=format(banked);el.endRecord.textContent=record?'NEW PERSONAL BEST!':'Personal best: '+format(records.best);
 el.hint.textContent=busted?'Balance reached zero. Start a fresh run.':'Your ending balance is now your banked score.';
 updateUI();beep(busted?230:760,.15);if(!el.dialog.open)el.dialog.showModal();
}
function onResolved(outcome){
 run=applyOutcome(run,outcome);saveRun();phase='ready';const c=colour(outcome.number).toUpperCase();
 if(outcome.won){flashResult('WINNING NUMBER',outcome.number+' '+c,'+'+format(outcome.net)+' credits · '+run.streak+' in a row','winner');beep(700,.12);}
 else{flashResult('WINNING NUMBER',outcome.number+' '+c,'−'+format(outcome.stake)+' credits','loser');beep(230,.09);}
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
 phase='spinning';flashResult('WHEEL IN MOTION','SPINNING…','The result is locked');el.hint.textContent='Spin in progress. Betting is locked.';updateUI();beep(410,.1,'triangle');
 const index=WHEEL.indexOf(number),step=360/WHEEL.length;
 const remaining=((-index*step-wheelAngle)%360+360)%360;
 const target=wheelAngle+5*360+remaining,duration=reducedMotion?100:3400;
 let start=null;cancelAnimationFrame(animationFrame);
 const frame=time=>{
  if(start===null)start=time;
  const p=Math.min(1,(time-start)/duration),easing=1-Math.pow(1-p,4);
  el.rotor.style.transform='rotate('+(wheelAngle+(target-wheelAngle)*easing)+'deg)';
  el.orbit.style.transform='rotate('+(-5*360*easing)+'deg)';
  if(p<1)animationFrame=requestAnimationFrame(frame);
  else{wheelAngle=target%360;el.rotor.style.transform='rotate('+wheelAngle+'deg)';el.orbit.style.transform='rotate(0deg)';onResolved(outcome);}
 };
 animationFrame=requestAnimationFrame(frame);
}
function bank(){if(phase!=='ready'||run.spins<1||run.balance===0)return;finishRun(false);}
function startNew(){cancelAnimationFrame(animationFrame);run=initialRun();bet='red';selection=7;stake=5;phase='ready';wheelAngle=0;el.rotor.style.transform='rotate(0deg)';el.orbit.style.transform='rotate(0deg)';saveRun();if(el.dialog.open)el.dialog.close();flashResult('READY TO PLAY','PLACE YOUR BET','Choose a wager and press SPIN');el.hint.textContent='New run started with 100 virtual credits.';updateUI();}
function drawWheel(){
 const cv=el.canvas,ctx=cv.getContext('2d');if(!ctx)return;
 const c=cv.width/2,outer=252,ring=205,step=Math.PI*2/WHEEL.length;
 ctx.clearRect(0,0,cv.width,cv.height);
 const disc=ctx.createRadialGradient(c-50,c-70,15,c,c,260);disc.addColorStop(0,'#eac86e');disc.addColorStop(.65,'#ad7a32');disc.addColorStop(1,'#5c361e');
 ctx.beginPath();ctx.arc(c,c,outer+13,0,Math.PI*2);ctx.fillStyle='#090808';ctx.fill();ctx.strokeStyle='#d6a74c';ctx.lineWidth=5;ctx.stroke();
 ctx.beginPath();ctx.arc(c,c,outer,0,Math.PI*2);ctx.fillStyle=disc;ctx.fill();
 WHEEL.forEach((number,i)=>{
   const angle=-Math.PI/2+i*step;ctx.beginPath();ctx.moveTo(c,c);ctx.arc(c,c,outer-13,angle-step/2,angle+step/2);ctx.closePath();
   ctx.fillStyle=number===0?'#167b53':colour(number)==='red'?'#b62f35':'#161719';ctx.fill();ctx.strokeStyle='rgba(236,198,113,.45)';ctx.lineWidth=1.3;ctx.stroke();
   ctx.save();ctx.translate(c,c);ctx.rotate(angle+Math.PI/2);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 16px Arial, sans-serif';ctx.fillStyle='#f9edd6';ctx.fillText(String(number),0,-226);ctx.restore();
 });
 ctx.beginPath();ctx.arc(c,c,ring,0,Math.PI*2);ctx.fillStyle='#8d5b24';ctx.fill();ctx.beginPath();ctx.arc(c,c,ring-10,0,Math.PI*2);ctx.fillStyle='#151011';ctx.fill();
 ctx.beginPath();ctx.arc(c,c,129,0,Math.PI*2);ctx.fillStyle=disc;ctx.fill();ctx.beginPath();ctx.arc(c,c,118,0,Math.PI*2);ctx.fillStyle='#171012';ctx.fill();
 ctx.strokeStyle='#b58b42';ctx.lineWidth=4;ctx.beginPath();ctx.arc(c,c,117,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='#f3c74f';ctx.textAlign='center';ctx.font='900 65px Arial, sans-serif';ctx.fillText('NGS',c,c+15);ctx.font='800 21px Arial,sans-serif';ctx.fillStyle='#ff665b';ctx.fillText('001',c,c+49);
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
else if(run.spins>0){const last=run.results[0];flashResult('LAST RESULT',last.number+' '+colour(last.number).toUpperCase(),last.won?'Last spin won':'Last spin lost',last.won?'winner':'loser');el.hint.textContent='Your previous run has been restored.';}
updateUI();saveRun();