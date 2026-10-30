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

## Fold7 V5 fix
The V4 narrow two-column layout was rejected: it shrank the wheel to 254–284 CSS pixels and compressed chips. At unfolded portrait widths, V5 stacks a full-size (up to 365px) wheel over desktop-style betting controls; landscape uses a larger side-by-side wheel and readable controls with normal vertical scrolling. No wheel animation maths, ball trajectory, probabilities or records are modified. A real Fold7 check is still required before calling device QA complete.

## Same spin across devices
The same JavaScript wheel rotation, 3.9-second standard timing, ball path and pocket-resolution logic operate at every screen size. The canvas is rendered at up to 2× device pixel density to preserve numbered-pocket clarity on Fold7. Orientation and fold/unfold redraw without rerolling. If Android requests reduced motion, a visible opt-in button enables full desktop-speed spins without overriding that accessibility preference silently.

## Spin animation correction (V7)
- A Galaxy Fold7 browser reporting `prefers-reduced-motion` formerly shortened the wheel from 3.9 seconds to 0.18 seconds without an obvious explanation. Full Spin (3.9 seconds) is now the default on desktop, Fold7 and other mobile browsers, regardless of that automatic setting.
- The animation choice is explicit and persistent: a clearly labelled Full Spin / Short Spin control sits directly above Spin. Short Spin remains available for accessibility.
- The same roulette wheel rotation, ball path, settled pocket and payout logic are used across devices. The game engine and stored records are unchanged.

The V7 preference uses a fresh `_motion_v2` key so old automatic short-spin settings cannot silently carry over. Every device starts with Full Spin on this release; choosing Short Spin is still saved locally.

## High Roller mode — V8
Two independent gameplay modes share the fair, unaltered European roulette engine:
- **Classic:** original 100-credit starting bankroll and original run/records storage keys retained. Classic scores never compete against High Roller scores.
- **High Roller:** £25,000 **fictional** starting cash, chips £100/£500/£1,000/£5,000/£10,000, HALF and ALL IN. Display uses the £ sign for entertainment only; no monetary value, payouts, purchases, prizes or withdrawal.
- Switching modes outside an active spin preserves the unfinished run and stored records for each mode. Both recover a locked result after refresh, without rerolls. The mode last selected is remembered.
- High Roller cumulative peak achievements: £100K Bronze, £500K Silver, £1M Millionaire, £5M Elite and £10M Legend. A win crossing a new milestone triggers a short display; earned milestones persist via completed-run peak history and are not additional credits.
- A separate top-10 local leaderboard appears for each mode. New entries store the banked score, spin count, biggest single-spin profit, run peak and streak. Classic's old bare numeric records are migrated in memory without deleting the existing personal best.
- All wagers remain integer virtual units; potentially unsafe JavaScript-integer payouts are prevented. The 37-pocket roulette distribution and standard European payouts are unchanged.

## V9 desktop High Roller alignment
A desktop-only styling pass at 1151px and wider reduces the wheel by roughly 10%, tightens stats, bets, Run Monitor and animation controls, moves the Spin/Bank buttons higher, and makes the betting stake a horizontal amount strip with regular chip sizing. At >=1400px, the eight High Roller chip buttons fit one row. HALF no longer resembles an active selection. The responsive Fold7 rules, wheel mechanics, fair odds, saved runs and official branding stay unchanged.
