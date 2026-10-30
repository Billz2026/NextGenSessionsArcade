import test from 'node:test';
import assert from 'node:assert/strict';
import {WHEEL,STARTING_CREDITS,resolveBet,applyOutcome,initialRun,matchesBet} from '../games/roulette/engine.mjs';

const HIGH_START=25_000;
function highRun(){return {...initialRun(),balance:HIGH_START,peak:HIGH_START};}

test('High Roller starts at £25k without changing Classic starting credits',()=>{
 assert.equal(STARTING_CREDITS,100);
 const h=highRun(),c=initialRun();
 assert.equal(h.balance,25000);assert.equal(h.peak,25000);
 assert.equal(c.balance,100);assert.equal(c.peak,100);
});

test('six consecutive all-in even-money wins reach £1.6 million',()=>{
 let r=highRun();
 for(let i=0;i<6;i++){
  const bet=resolveBet({balance:r.balance,stake:r.balance,bet:'red',number:1});
  r=applyOutcome(r,bet);
 }
 assert.equal(r.balance,1_600_000);
 assert.equal(r.bestStreak,6);
 assert.equal(r.peak,1_600_000);
});

test('one straight-up win returns £900k; a second winning even-money spin surpasses £1m',()=>{
 let r=highRun();
 r=applyOutcome(r,resolveBet({balance:r.balance,stake:25_000,bet:'straight',selection:17,number:17}));
 assert.equal(r.balance,900_000);
 r=applyOutcome(r,resolveBet({balance:r.balance,stake:900_000,bet:'black',number:2}));
 assert.equal(r.balance,1_800_000);
});

test('loss on an all-in wager loses the entire fictional cash balance',()=>{
 let r=highRun();
 r=applyOutcome(r,resolveBet({balance:r.balance,stake:r.balance,bet:'red',number:0}));
 assert.equal(r.balance,0);assert.equal(r.spins,1);assert.equal(r.peak,HIGH_START);
});

test('roulette probabilities remain exactly standard European roulette',()=>{
 assert.equal(WHEEL.length,37);
 assert.equal(WHEEL.filter(n=>matchesBet('red',n)).length,18);
 assert.equal(WHEEL.filter(n=>matchesBet('straight',n,17)).length,1);
 assert.equal(WHEEL.filter(n=>matchesBet('first',n)).length,12);
});

test('rejects stakes beyond safe integer payout range',()=>{
 const balance=Number.MAX_SAFE_INTEGER-100;
 assert.throws(()=>resolveBet({balance,stake:balance,bet:'straight',selection:17,number:17}),RangeError);
});
