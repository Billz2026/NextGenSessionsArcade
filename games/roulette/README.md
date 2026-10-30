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

## Arcade polish V3
- The previously empty right-side space now contains a live **Run Monitor** displaying the run's peak balance, biggest single-spin profit, longest winning streak and status.
- A winning segment is highlighted precisely on the 37-pocket wheel. The stationary pointer and ball align with the displayed outcome. Page refreshes restore the wheel to the last result, including spins recovered from locked, in-progress outcomes.
- Gold result flashes, a brighter pointer landing effect, visible HOT STREAK status, and NEW PERSONAL BEST modal styling add arcade feedback.
- The controls keep their existing betting and scoring mechanics. Official NextGen Sessions logo files are unchanged.
- Respect reduced-motion preferences for decorative bursts and transitions.

## Validation for V3
Checked DOM control bindings, JS parsing, CSS rule balancing, all 37 possible pocket resting angles, winning and losing spin flows, a three-win HOT STREAK, personal-best banking, new-run reset, and interrupted-spin recovery.

## Foldable layout V4
The unfolded Galaxy Z Fold7 uses a narrow, near-square CSS viewport (measured Chrome portrait ~749 px wide; landscape ~832 px). At 700–1023 CSS px, the game shows a sticky wheel rail and a compact but readable two-column betting layout; the controls scroll normally and the wheel stays in view. At widths under 700 px (including the Fold7 cover display), the game stacks vertically. This is CSS-only: no change to bets, random selection, records, or the original branding assets. Test the real unfolded device in portrait and landscape in addition to desktop DevTools simulation.
