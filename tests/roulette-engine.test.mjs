import test from 'node:test';
import assert from 'node:assert/strict';
import {WHEEL,RED,BETS,STARTING_CREDITS,colour,matchesBet,resolveBet,pickNumber,initialRun,applyOutcome} from '../games/roulette/engine.mjs';

test('wheel has 37 distinct valid numbers and 18 red pockets',()=>{
 assert.equal(WHEEL.length,37);assert.equal(new Set(WHEEL).size,37);
 assert.deepEqual([...WHEEL].sort((a,b)=>a-b),Array.from({length:37},(_,i)=>i));
 assert.equal(new Set(RED).size,18);
 for(let i=0;i<37;i++)assert.ok(['red','black','green'].includes(colour(i)));
});
test('correct odds for each type of bet and zero handling',()=>{
 for(const bet of BETS){
  const selection=bet==='straight'?17:null;
  const total=Array.from({length:37},(_,i)=>+matchesBet(bet,i,selection)).reduce((a,b)=>a+b,0);
  assert.equal(total,bet==='straight'?1:['first','second','third'].includes(bet)?12:18);
  if(bet!=='straight')assert.equal(matchesBet(bet,0),false);
 }
});
test('fair gross payouts, profit, exact-number zero',()=>{
 assert.equal(resolveBet({balance:100,stake:10,bet:'red',number:1}).balanceAfter,110);
 assert.equal(resolveBet({balance:100,stake:10,bet:'red',number:2}).balanceAfter,90);
 assert.equal(resolveBet({balance:100,stake:10,bet:'first',number:1}).balanceAfter,120);
 assert.equal(resolveBet({balance:100,stake:10,bet:'first',number:13}).balanceAfter,90);
 assert.equal(resolveBet({balance:100,stake:10,bet:'straight',selection:17,number:17}).balanceAfter,450);
 assert.equal(resolveBet({balance:100,stake:10,bet:'straight',selection:0,number:0}).balanceAfter,450);
 assert.equal(resolveBet({balance:100,stake:100,bet:'black',number:0}).balanceAfter,0);
});
test('rejects invalid stakes and numbers',()=>{
 for(const stake of [0,-1,101,1.5,NaN,Infinity])assert.throws(()=>resolveBet({balance:100,stake,bet:'red',number:1}),RangeError);
 for(const number of [-1,37,1.5,NaN])assert.throws(()=>resolveBet({balance:100,stake:1,bet:'red',number}),RangeError);
 assert.throws(()=>resolveBet({balance:0,stake:1,bet:'red',number:1}),RangeError);
 assert.throws(()=>resolveBet({balance:100,stake:1,bet:'straight',selection:37,number:1}),RangeError);
});
test('secure number picker rejects biased end of uint32 range',()=>{
 const lim=Math.floor(4294967296/37)*37;let calls=0;
 const src={getRandomValues(a){a[0]=calls++===0?lim:1;return a;}};
 assert.equal(pickNumber(src),WHEEL[1]);assert.equal(calls,2);
});
test('run progression, bounded history, streak reset, bust',()=>{
 let run=initialRun();assert.equal(run.balance,STARTING_CREDITS);
 for(let i=0;i<12;i++)run=applyOutcome(run,resolveBet({balance:run.balance,stake:1,bet:'red',number:1}));
 assert.equal(run.spins,12);assert.equal(run.bestStreak,12);assert.equal(run.results.length,10);assert.equal(run.balance,112);
 run=applyOutcome(run,resolveBet({balance:run.balance,stake:112,bet:'red',number:0}));
 assert.equal(run.balance,0);assert.equal(run.streak,0);assert.equal(run.peak,112);
});