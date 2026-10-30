import test from 'node:test';
import assert from 'node:assert/strict';
import {
 WHEEL, RED, BETS, STARTING_CREDITS, matchesBet, payoutMultiplier,
 resolveBet, applyOutcome, initialRun, pickNumber
} from '../games/roulette/engine.mjs';

const numbers=Array.from({length:37},(_,i)=>i);
const reds=new Set(RED);
const expected={
 red:n=>reds.has(n),black:n=>n!==0&&!reds.has(n),
 odd:n=>n!==0&&n%2===1,even:n=>n!==0&&n%2===0,
 first:n=>n>=1&&n<=12,second:n=>n>=13&&n<=24,third:n=>n>=25&&n<=36,
 straight:(n,s)=>n===s
};

test('exhaustive roulette bet matrix: 1,628 combinations and all payouts',()=>{
 assert.equal(WHEEL.length,37);
 let cases=0;
 for(const bet of BETS){
  const selections=bet==='straight'?numbers:[null];
  const multiplier=bet==='straight'?36:['first','second','third'].includes(bet)?3:2;
  assert.equal(payoutMultiplier(bet),multiplier);
  for(const selection of selections){
   for(const number of numbers){
    const win=expected[bet](number,selection);
    assert.equal(matchesBet(bet,number,selection),win,`${bet} / ${selection} / ${number}`);
    const outcome=resolveBet({balance:10000,stake:100,number,bet,selection});
    assert.equal(outcome.won,win);
    assert.equal(outcome.balanceAfter,9900+(win?100*multiplier:0));
    assert.equal(outcome.net,win?100*(multiplier-1):-100);
    cases++;
   }
  }
 }
 assert.equal(cases,1628);
});

test('zero loses on every outside bet, wins only straight zero at 36x',()=>{
 for(const bet of BETS){
  const outcome=resolveBet({balance:25000,stake:100,bet,selection:bet==='straight'?0:null,number:0});
  assert.equal(outcome.won,bet==='straight');
  assert.equal(outcome.balanceAfter,bet==='straight'?28500:24900);
 }
});

test('High Roller scales above £10m with 10 all-in red wins, then loses all on zero',()=>{
 let run={...initialRun(),balance:25000,peak:25000};
 for(let n=0;n<10;n++)run=applyOutcome(run,resolveBet({balance:run.balance,stake:run.balance,number:1,bet:'red'}));
 assert.equal(run.balance,25600000);
 assert.equal(run.peak,25600000);
 assert.equal(run.bestStreak,10);
 run=applyOutcome(run,resolveBet({balance:run.balance,stake:run.balance,number:0,bet:'red'}));
 assert.equal(run.balance,0);
 assert.equal(run.streak,0);
 assert.equal(run.peak,25600000);
});

test('safe number boundaries and half/all-in payouts',()=>{
 const max=Number.MAX_SAFE_INTEGER;
 assert.throws(()=>resolveBet({balance:max,stake:max,number:17,bet:'straight',selection:17}),RangeError);
 assert.throws(()=>resolveBet({balance:max,stake:max,number:1,bet:'red'}),RangeError);
 for(const bet of BETS){
  const selection=bet==='straight'?17:null;
  const number=bet==='straight'?17:bet==='black'?2:bet==='even'?2:bet==='second'?13:bet==='third'?25:1;
  const balance=1000000,stake=500000;
  const outcome=resolveBet({balance,stake,bet,selection,number});
  assert.ok(Number.isSafeInteger(outcome.balanceAfter));
  assert.ok(outcome.balanceAfter>=0);
 }
 assert.equal(STARTING_CREDITS,100);
});

test('fair, unbiased secure selection rejects out-of-range uint32 values',()=>{
 const limit=Math.floor(4294967296/37)*37;
 let call=0;
 const src={getRandomValues(a){a[0]=call++===0?limit:36;return a;}};
 assert.equal(pickNumber(src),WHEEL[36]);
 assert.equal(call,2);
 assert.throws(()=>pickNumber({}),/Secure randomness/);
});
