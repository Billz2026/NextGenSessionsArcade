# Game 002 — NextGen Pinball: Neon Tilt

**Current stage:** Phase 3C — desktop layout and mechanical-playfield polish (playable preview)

**Play:** https://billz2026.github.io/NextGenSessionsArcade/games/pinball/

An original red, amber and gold browser arcade pinball table inspired by the *feeling* of classic Windows-era pinball, not a copy of Space Cadet's assets or geometry.

## Phase 3E — full and reactive arcade-table pass

- **More screen presence:** moved the 3D camera closer, reduced unused view margins, and kept the whole table and essential controls inside the no-scroll desktop cockpit.
- **Busy 3D playfield:** added 34 recessed, individually emissive circular lamp assemblies, 10 3D shot arrows, new lane/plastic guides, post hardware, detailed side guards, lighted score labels, 9 backbox chase bars and cabinet-side LEDs.
- **True gameplay-linked lighting:** top/target indicators, orbit and ramp lights, spinner and scoop hardware, active ball save, timed multiplier, Frenzy, jackpots, and ready-state attract effects all reflect actual engine state.
- **Signature working features:** metal spinner gate at y=365 awards 1,250 points per qualifying crossing and rotates; right-hand scoop at (316,444) captures a rising ball, awards 8,000 points and ejects it after a 0.67-second delay. Both use fixed simulation time and retain anti-repeat guards.
- **More convincing mechanical feedback:** the plunger handle moves with charge, ball enters the scoop cup, and bumper lamps react to registered impacts.
- **Fallback parity:** 2D Canvas also draws the spinner and scoop so gameplay remains understandable when the 3D library cannot be loaded.
- **Regression coverage:** physics tests extended from 20 to 25 scenarios including new scoring, cooldowns, capture/eject and state reset.
- **Quality boundary:** real 3D geometry and responsive effects are implemented, but ramp/orbit simulation still uses the older guided motion. This remains a beta, pending desktop and Samsung Fold real-device playtests.

## Phase 3D — immersive 3D desktop build

- **No-scroll desktop game view:** at desktop widths (1121 CSS px and above), the page uses the actual 100dvh browser viewport. The machine, flippers, score, plunger, mission display and personal scores fit inside a single screen at normal zoom. Short laptop viewport heights use an additional compact layout.
- **Pinball-first composition:** the title area and long help/footer are hidden on desktop so the physical table and score console dominate. Smaller screens still allow normal scrolling for accessible touch controls.
- **Actual 3D rendering:** Three.js WebGL scene with 3D lacquered cabinet, metal wall rails, raised-looking tube ramps, physically modelled bumper assemblies, plastic slings, steel inlanes, stand-up targets, rotating 3D flippers, spherical chrome ball and real-time lights.
- **Game state remains unchanged:** the existing deterministic two-dimensional engine still provides the ball position, flipper angles, targets, scores, missions and drain rules. 3D visuals do not imply 3D ball or ramp physics.
- **Graceful fallback:** the prior 2D Canvas renderer remains usable if WebGL or the Three.js module cannot load. The 3D/2D switch allows comparing them. Touch input passes to an invisible input canvas behind the pointer-transparent WebGL canvas.
- **Performance:** lower resolution and shadow-map settings on screens at or below 1120 CSS px.
- **Dependency:** the 3D view imports pinned Three.js 0.180.0 from jsDelivr at runtime. Offline play uses the existing 2D fallback, but a first offline load of game scripts still requires the site files to be cached.
- **Release status:** this is a 3D visual prototype with a simplified 2D physics engine. It has not yet been visually tested on a real Samsung Fold 7 or validated for professional-grade physical realism.

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
