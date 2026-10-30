import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {WHEEL,BETS,BET_LABELS,STARTING_CREDITS,colour,resolveBet,applyOutcome,initialRun} from '../games/roulette/engine.mjs';

const html=readFileSync(new URL('../games/roulette/index.html',import.meta.url),'utf8');
const game=readFileSync(new URL('../games/roulette/game.mjs',import.meta.url),'utf8')
 .replace(/^import [^\n]*\n/,'');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
const runProgram=new Function('WHEEL','BETS','BET_LABELS','STARTING_CREDITS','pickNumber',
 'colour','resolveBet','applyOutcome','initialRun','document','window',
 'localStorage','requestAnimationFrame','cancelAnimationFrame',game);
const ctx=new Proxy({},{
 get(target,key){
  if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>({addColorStop(){}});
  return key in target?target[key]:()=>{};
 },
 set(target,key,value){target[key]=value;return true;}
});
function element(id=''){
 const callbacks={},classes=new Set();
 return {
  id,dataset:{},style:{},attributes:{},textContent:'',innerHTML:'',value:'',
  disabled:false,hidden:false,open:false,firstElementChild:{style:{}},
  children:[],width:560,height:560,
  classList:{
   add(...xs){xs.forEach(x=>classes.add(x))},
   remove(...xs){xs.forEach(x=>classes.delete(x))},
   toggle(x,on){on?classes.add(x):classes.delete(x)},
   contains(x){return classes.has(x)}
  },
  addEventListener(type,callback){callbacks[type]=callback},
  fire(type){callbacks[type]?.()},
  click(){callbacks.click?.()},
  setAttribute(key,value){this.attributes[key]=value},
  append(...items){this.children.push(...items)},
  replaceChildren(...items){this.children=[...items]},
  getContext(){return ctx},
  showModal(){this.open=true},close(){this.open=false},
  get offsetWidth(){return 100}
 };
}
const createStore=(entries=[])=>{
 const map=new Map(entries);
 return {
  map,
  getItem(k){return map.get(k)??null},
  setItem(k,v){map.set(k,v)},
  data(k){return JSON.parse(map.get(k))}
 };
};
function boot(store,{reduced=false}={}){
 const el={};for(const id of ids)el[id]=element(id);
 const modes=['classic','high'].map(x=>{const b=element();b.dataset.mode=x;return b});
 const bets=['red','black','odd','even','first','second','third','straight'].map(x=>{const b=element();b.dataset.bet=x;return b});
 const chips=Array.from({length:5},()=>element());
 const achievements=[100000,500000,1000000,5000000,10000000].map(n=>{const b=element();b.dataset.milestone=String(n);b.textContent=String(n);return b});
 const doc={documentElement:element('root'),getElementById(id){return el[id]??null},
  querySelector(q){return q==='.run-monitor'?element('run-monitor'):null},
  querySelectorAll(q){
   if(q==='[data-mode]')return modes;
   if(q==='[data-bet]')return bets;
   if(q==='[data-add]')return chips;
   if(q==='[data-milestone]')return achievements;
   return [];
  },createElement(){return element()}};
 const win={devicePixelRatio:2.5,matchMedia(){return {matches:reduced}},addEventListener(){}};
 let chosen=7,frames=[];
 runProgram(WHEEL,BETS,BET_LABELS,STARTING_CREDITS,()=>chosen,
  colour,resolveBet,applyOutcome,initialRun,doc,win,store,
  f=>{frames.push(f);return frames.length},()=>{});
 const go={
  el,modes,bets,chips,achievements,
  mode(x){modes.find(b=>b.dataset.mode===x).click()},
  bet(x){bets.find(b=>b.dataset.bet===x).click()},
  choose(n){el['exact-number'].value=String(n);el['exact-number'].fire('change')},
  startSpin(n){chosen=n;el['spin-button'].click()},
  flush(ms=4200,from=0){for(let t=from;t<=ms;t+=100){const batch=frames.splice(0);for(const callback of batch)callback(t)}},
  spin(n){this.startSpin(n);this.flush()}
 };
 return go;
}

test('all generated controls are bound and Classic legacy best is preserved',()=>{
 assert.equal(ids.length,new Set(ids).size);
 const matches=[...game.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]);
 for(const ref of matches)assert.ok(ids.includes(ref),`missing DOM ID ${ref}`);
 const store=createStore([['ngs_arcade_roulette_records_v1',
  JSON.stringify({best:315,history:[315,210]})]]);
 const ui=boot(store);
 assert.equal(ui.el['balance'].textContent,'100');
 assert.equal(ui.el['best-score'].textContent,'315');
 assert.match(html,/BEST BANKED/);
 ui.mode('high');
 assert.equal(ui.el['balance'].textContent,'£25,000');
 assert.equal(ui.el['best-score'].textContent,'£0');
 ui.mode('classic');
 assert.equal(ui.el['best-score'].textContent,'315');
});

test('full spin is 3.9 seconds even with an Android reduced-motion preference',()=>{
 const ui=boot(createStore(),{reduced:true});
 assert.match(ui.el['motion-toggle'].textContent,/FULL SPIN/);
 ui.startSpin(1);
 assert.equal(ui.el['spin-button'].disabled,true);
 ui.flush(300);
 assert.equal(ui.el['spins-count'].textContent,'0');
 // Simulate the remaining animation frames on the same UI instance.
 ui.flush(4200,400);
 assert.equal(ui.el['spins-count'].textContent,'1');
 assert.equal(ui.el['balance'].textContent,'105');
});

test('interrupted all-in zero is bankrupted and recorded exactly once on recovery',()=>{
 const store=createStore();
 const ui=boot(store);ui.mode('high');ui.el['all-in'].click();
 ui.startSpin(0); // Save a locked, losing outcome without advancing animation.
 assert.equal(store.data('ngs_arcade_roulette_high_run_v1').pending.number,0);
 const recovered=boot(store);
 assert.equal(recovered.el['end-dialog'].open,true);
 assert.equal(recovered.el['end-title'].textContent,'BANKRUPT');
 assert.equal(recovered.el['result-sub'].textContent,'−£25,000 virtual cash');
 assert.equal(store.data('ngs_arcade_roulette_high_records_v1').history.length,1);
 assert.equal(store.data('ngs_arcade_roulette_high_run_v1'),null);
 recovered.el['new-run'].click();
 const reboot=boot(store);
 assert.equal(store.data('ngs_arcade_roulette_high_records_v1').history.length,1);
 assert.equal(reboot.el['balance'].textContent,'£25,000');
});

test('interrupted winning spin restores the real net amount and cannot pay twice',()=>{
 const store=createStore();const ui=boot(store);
 ui.mode('high');ui.el['all-in'].click();ui.startSpin(7);
 const recovered=boot(store);
 assert.equal(recovered.el['balance'].textContent,'£50,000');
 assert.equal(recovered.el['result-sub'].textContent,'+£25,000 virtual cash');
 assert.equal(recovered.el['spins-count'].textContent,'1');
 assert.equal(store.data('ngs_arcade_roulette_high_run_v1').pending,null);
 const again=boot(store);
 assert.equal(again.el['balance'].textContent,'£50,000');
 assert.equal(again.el['spins-count'].textContent,'1');
 again.el['bank-button'].click();
 assert.equal(store.data('ngs_arcade_roulette_high_records_v1').best,50000);
 assert.equal(again.el['end-dialog'].open,true);
});

test('streak badge, modes and completed score leaderboard survive refresh',()=>{
 const store=createStore();const ui=boot(store);ui.mode('high');
 for(let i=0;i<3;i++)ui.spin(7);
 assert.equal(ui.el['result-streak'].hidden,false);
 assert.match(ui.el['result-streak'].textContent,/HOT STREAK ×3/);
 assert.equal(ui.el['result-sub'].textContent,'+£5,000 virtual cash');
 const refreshed=boot(store);
 assert.equal(refreshed.el['result-sub'].textContent,'+£5,000 virtual cash');
 assert.match(refreshed.el['result-streak'].textContent,/HOT STREAK ×3/);
 refreshed.el['bank-button'].click();
 assert.equal(store.data('ngs_arcade_roulette_high_records_v1').best,40000);
 refreshed.el['new-run'].click();
 refreshed.mode('classic');
 assert.equal(refreshed.el['balance'].textContent,'100');
 refreshed.mode('high');
 assert.equal(refreshed.el['best-score'].textContent,'£40,000');
});
