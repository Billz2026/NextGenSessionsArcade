export const STARTING_CREDITS = 100;
export const WHEEL = Object.freeze([0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]);
export const RED = Object.freeze([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
export const BETS = Object.freeze(['red','black','odd','even','first','second','third','straight']);
export const BET_LABELS = Object.freeze({red:'Red',black:'Black',odd:'Odd',even:'Even',first:'1st 12',second:'2nd 12',third:'3rd 12',straight:'Exact number'});
const redSet = new Set(RED);
const maxUint = 4294967296;

export function pickNumber(randomSource = globalThis.crypto) {
  if (!randomSource || typeof randomSource.getRandomValues !== 'function') throw new Error('Secure randomness is unavailable.');
  const range = WHEEL.length;
  const rejectionLimit = Math.floor(maxUint / range) * range;
  const array = new Uint32Array(1);
  do { randomSource.getRandomValues(array); } while (array[0] >= rejectionLimit);
  return WHEEL[array[0] % range];
}

export function isRed(number) { return redSet.has(number); }
export function colour(number) {
  assertNumber(number);
  return number === 0 ? 'green' : isRed(number) ? 'red' : 'black';
}
function assertNumber(n) {
  if (!Number.isInteger(n) || n < 0 || n > 36) throw new RangeError('Result must be an integer from 0 through 36.');
}
export function matchesBet(bet, number, selection = null) {
  assertNumber(number);
  if (!BETS.includes(bet)) throw new RangeError('Unsupported bet.');
  if (bet === 'straight') {
    assertNumber(selection);
    return number === selection;
  }
  if (bet === 'red') return isRed(number);
  if (bet === 'black') return number !== 0 && !isRed(number);
  if (bet === 'odd') return number !== 0 && number % 2 === 1;
  if (bet === 'even') return number !== 0 && number % 2 === 0;
  if (bet === 'first') return number >= 1 && number <= 12;
  if (bet === 'second') return number >= 13 && number <= 24;
  return number >= 25 && number <= 36;
}
export function payoutMultiplier(bet) {
  if (!BETS.includes(bet)) throw new RangeError('Unsupported bet.');
  if (bet === 'straight') return 36;
  if (['first','second','third'].includes(bet)) return 3;
  return 2;
}
export function resolveBet({balance,bet,stake,number,selection = null}) {
  if (!Number.isSafeInteger(balance) || balance < 1) throw new RangeError('Not enough credits.');
  if (!Number.isSafeInteger(stake) || stake < 1 || stake > balance) throw new RangeError('Stake must be a whole number within your balance.');
  const won = matchesBet(bet,number,selection);
  const returned = won ? stake * payoutMultiplier(bet) : 0;
  if (!Number.isSafeInteger(returned) || !Number.isSafeInteger(balance - stake + returned)) throw new RangeError('Credits exceed supported range.');
  return Object.freeze({number,won,stake,returned,net:returned-stake,balanceAfter:balance-stake+returned,bet,selection});
}
export function initialRun() {
 return {version:1,balance:STARTING_CREDITS,spins:0,peak:STARTING_CREDITS,streak:0,bestStreak:0,biggestProfit:0,results:[],pending:null};
}
export function applyOutcome(run,outcome) {
 if (outcome.balanceAfter < 0) throw new RangeError('Balance cannot be negative.');
 const streak = outcome.won ? run.streak+1 : 0;
 return {...run,balance:outcome.balanceAfter,spins:run.spins+1,peak:Math.max(run.peak,outcome.balanceAfter),streak,bestStreak:Math.max(run.bestStreak,streak),biggestProfit:Math.max(run.biggestProfit,outcome.net),results:[{number:outcome.number,won:outcome.won,net:outcome.net},...run.results].slice(0,10),pending:null};
}