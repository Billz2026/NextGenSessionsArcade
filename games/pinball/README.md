# Game 002 — NextGen Pinball: Neon Tilt

**Current stage:** Phase 3C — desktop layout and mechanical-playfield polish (playable preview)

**Play:** https://billz2026.github.io/NextGenSessionsArcade/games/pinball/

An original red, amber and gold browser arcade pinball table inspired by the *feeling* of classic Windows-era pinball, not a copy of Space Cadet's assets or geometry.

## Phase 3C improvements
- **Desktop cockpit:** roughly 60/40 machine-to-HUD columns, capped at 1,450 CSS pixels for better composition.
- **Larger playfield:** original desktop table cap raised from 438px to as much as 585px depending on viewport, with separate narrower-laptop rules.
- **Fit Table button:** at desktop widths, switch from the enlarged cabinet to an alternative whole-table view that accounts for the browser viewport height; it changes only layout, never game physics.
- **Mechanical artwork:** extra moulded plastics, engraved guide rails, populated playfield decals, lamp banks, brighter inserts and enhanced physical material detail.
- **Functional lighting:** 2×, Frenzy and target-bank indicators follow actual engine events; bumper caps briefly flash when registered hits occur.
- **Rendering:** static high-resolution metalwork and artwork remain cached; live ball/targets/lamps/flippers are drawn above it.
- **Game logic:** no new mission mechanics added in this pass, existing scoring remains compatible.

## Implemented

- A rebuilt, hand-rendered 420 × 700 playfield with a cached 2× mechanical background, enamel cabinet edges, detailed metal rails, glass reflections, dimensional-looking ramps, recessed lamps, layered bumpers, chrome flippers and ball trails.
- 240 Hz fixed-step ball physics: manual motor-driven flippers, hold-and-release plunger, wall/post collisions, bumpers and slingshots.
- Three standard balls, four-second single-use ball-save window per ball, and one earnable extra ball.
- N-G-S upper lanes: complete all three for a 20-second 2× multiplier.
- Bumper Frenzy: ten bumper hits activate a 15-second 2× bumper mode.
- Target Bank: activate all four stand-up targets for 25,000 bonus points.
- Night Ride: connect a ramp and an orbit within eight seconds to earn a 40,000-point jackpot.
- Complete all four unique missions to earn one extra ball.
- End-of-ball bonus, local personal best and Top 5 records.
- Visible mission progress and timed scoring mode on the arcade HUD.
- Desktop keyboard controls and simultaneous mobile/Fold touch controls.
- Synthesized sound effects are muted by default; reduced-motion preference suppresses decorative flashes.

## How to play

1. Start Game.
2. Hold and release Space or the onscreen Launch button to fire the plunger.
3. Left Arrow / A = left flipper. Right Arrow / D = right flipper.
4. Hit the ramp and orbit to chase the Night Ride combo. Complete all four missions for the extra ball.
5. Scores are stored in this browser only. No purchases, cash stakes or prizes.

## Technical details and limitations

The ramp/orbit traversal currently uses a time-based guided ball path and is **not** yet a full 3D rigid-body ramp simulation. The layered Canvas artwork simulates mechanical depth but is **not** a 3D scene or a photographic/pre-rendered table. The game is an early playable visual rebuild, not a validated commercial-quality pinball simulation. Multiball, physical device tuning, shot accessibility balancing and a complete cross-browser/manual QA pass are still pending.

Do not claim this meets the visual target of the old Windows Space Cadet table until it has been visually compared in a browser and the user has approved its presentation. Real play sessions on desktop, narrow smartphones and Samsung Fold are required.

## Tests

Run locally:

\`\`\`bash
node --test tests/roulette-engine.test.mjs tests/pinball-engine.test.mjs
\`\`\`

Regression checks cover launches, collision responses, flipper impulses, drains, mission progression, guided shots, ball save, score multipliers and extra balls. A GitHub Actions workflow also runs these on relevant changes.

## Next release gate (Phase 3C)

- Actual desktop and Fold 7 gameplay QA.
- Balance miss/drain rate, shot accessibility, and round duration.
- Check touch and keyboard controls through full games.
- Inspect small-screen readability, sounds and animations.
- Only then replace the homepage's upcoming tile with a playable Game 002 tile.
