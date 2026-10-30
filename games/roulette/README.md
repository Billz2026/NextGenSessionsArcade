# High Roll Run — Game 001
A standalone NextGen Sessions Arcade browser game.

## Gameplay
- Start with 100 fictional credits.
- Select one wager: red, black, odd, even, first/second/third dozen, or an exact number from 0–36.
- Select a whole-credit stake, then spin. All 37 wheel pockets are selected with equal probability.
- A red, black, odd or even win returns 2× the stake; a dozen win returns 3×; an exact number returns 36×.
- **Bank Score** ends a run and saves its final balance locally. Going to zero ends a run with a score of zero.
- Runs and personal bests are stored locally in this browser. In-progress spins are committed before animation so refreshes cannot reroll a result.
- Optional synthesized sound defaults off; reduced-motion preferences shorten the animation.

## Technical
Plain HTML/CSS plus ES modules. `engine.mjs` is side-effect free and tested with Node's built-in test runner. `game.mjs` manages display, persistence and wheel animation.

## Scope / transparency
All balances are fictional. No real money, purchases, prizes or credits with monetary value. This is a chance-based game, not a test of predictive skill. European roulette's house edge is approximately 2.70%. Scores are device-local and are not suitable for a trusted global leaderboard.

## Visual V2
A multi-layered metallic roulette wheel with genuine 37-pocket numbering, upright central badge, animated ball track, arcade win burst, streak feedback, cabinet lighting and tactile betting controls. Gameplay probabilities and score persistence are unchanged.
