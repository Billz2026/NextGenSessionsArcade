# Game 002 — NextGen Pinball: Neon Tilt

**Current stage:** Phase 3K — fair-play physics and sharp cabinet lettering (playable 3D prototype)

**Play:** https://billz2026.github.io/NextGenSessionsArcade/games/pinball/

An original red, amber and gold browser arcade pinball table inspired by the *feeling* of classic Windows-era pinball, not a copy of Space Cadet's assets or geometry.

## Phase 3O — DMD legibility correction

- **Verified root cause:** the display previously rasterised two rows of text at 11px / 9px into an 80×22 bitmap, then enlarged each pixel into an LED. At around 350px screen width the letters became indistinct.
- **New sharp scoreboard:** rendering uses a 1120×324 physical canvas (2× 560×162 logical size), solid bold high-contrast amber/cream arcade characters, dark non-glowing outlines and adaptive text fitting. Native glyphs are no longer sampled through the 80×22 grid. The smaller LED cells remain as unobtrusive surrounding hardware texture.
- **Animations preserved:** event priority, celebration border flash, left-to-right 260ms reveal and reduced-motion static messages still operate without text blur.
- **Layout preserved:** the scoreboard's CSS aspect ratio and parent height were kept; the older full-canvas blur and forced stretching were removed, and cabinet display-header contrast was improved.
- **Regression status:** 43 physics/gameplay tests and 15 DMD tests passed (58 combined). Native-resolution dimensions, text minimum size, actual stroke rendering, timing, priority and cache-busted script versions are all checked. Live browser visual verification remains necessary.

## Phase 3N — four real routes, reinforced steel hardware and marquee identity

- **Two additional playable shots:** a centre crossover and a Skyline loop now join the existing left orbit and right ramp. Both have sensor-triggered scores (4,500 / 6,000 before multipliers), exact authoritative raised waypoints, per-route travel durations, moving 3D ball height and distinct return feeds to flipper approaches. All four charge the existing Power Grid and contribute to combo scoring.
- **Reachability correction:** real physics simulations showed the first centre entrance was practically unreachable. Moving its inlet to (207, 426) with a 33-pixel catch width makes it consistently reachable with timed flipper play; a dedicated regression checks actual play rather than merely injecting a sensor event. The Skyline route already appeared in ordinary simulations.
- **Mechanical detailing:** rebuilt raised channels use heavy dual stainless rails, thicker bases, cast-brass joins, real cross-braces, bolted stanchions, entrance gates and anchored lower return rails. The 3D table now has four distinct raised decks, not merely painted lines. The Canvas fallback includes those two extra physical routes and matching scoring entrances.
- **Sign treatment:** the high-resolution NEON TILT panel now uses an extra-heavy Arial Black / Impact face, a dark stroke, bright coral and cream front layers, simulated embossing, a raised metallic perimeter and physical corner rivets. Canvas fallback uses equivalent non-blurred lettering.
- **Gameplay visibility:** independent, lighted centre/Skyline shot arrows and inserts, their own score/DMD callouts, updated HUD explanations and a clear four-route aim system.
- **Regression checks:** 43 pinball engine tests plus 13 DMD tests, including route sensors, scored returns, reachable centre channel and no phantom scoring. A mocked Three.js construction pass previously assembled four ramp decks and 644 meshes. Latest viewport, material realism and GPU performance require Chrome / Samsung Fold device testing.
- **Scope remains honest:** ball travel on elevated routes is guided motion on a deterministic engine rather than true 3D rigid-body physics, and multiball is not yet present. Decorative brackets are non-colliding except for original authoritative physics posts/walls.

## Phase 3M — real arcade gameplay modes and table spectacle

- **Upper-lane skill shot:** first N/G/S upper rollover within six simulated seconds of a genuine launch scores a one-time 12,000-point bonus; saved-ball relaunches do not yield duplicate skill shots.
- **Shot combos:** consecutive ramp or orbit hits within seven seconds build a chain (maximum five); the second onward earn 5,000/10,000/15,000/20,000 points before existing scoring multipliers. Chain expires with inactivity or a drain.
- **Power Grid:** each ramp/orbit hit charges one of three physically represented insert lamps. Three hits activate an 18-second NEON RUSH hurry-up; hit the actual scoop sensor within time for a 50,000-point jackpot (plus its standard 8,000-point scoop value). Missing the deadline resets charges to one, so players can rebuild momentum.
- **Spinner Overdrive:** five qualifying spinner crossings activate a 14-second mode; further spinner crossings earn an extra 3,000 points on top of each normal hit. All scoring goes through the existing authoritative game engine and persists to the existing high scores.
- **Table reacts visibly:** three new raised chrome/gold Power Grid lamp sockets, a fortified scoop guard and a jackpot glow ring communicate active targets. Ramp/orbit inserts and spinner arrows respond to mode/chain states. A 2D fallback renders the same progress.
- **DMD and score panel:** actual events announce SKILL SHOT, COMBO, JACKPOT LIT, NEON RUSH, OVERDRIVE and timeouts with priority-based flashing; a new mission-header indicator shows Grid charge or remaining mode seconds; mode status and sound effects are updated.
- **Testing:** all 38 engine and 13 DMD regression tests pass (51 total). A mocked 3D construction test built 488 meshes, including all three Power Grid lamps, and exercised normal and reduced-motion frames.
- **Honest scope boundary:** this is a mode-driven scoring and visual-feedback upgrade; *true multiball is not implemented*. It requires an actual multi-ball collision/simulation subsystem and should not be simulated with fictitious messages. Live Chrome/Fold visuals and play balance still need human validation.

## Phase 3L — clarity and cabinet identity

- **Unified 3D sign:** the old pair of stretched glowing labels was replaced with one 2048×560 texture on the 3D marquee, containing warm-cream NEXTGEN SESSIONS, large coral NEON TILT, a deliberate dark stroke, brass rules and a dark enamel background. There is no blurred lettering.
- **Readable 2D fallback:** the same clear NEON TILT treatment, without spaced-out letters or baked blur, is applied to the classic Canvas table.
- **Clear playfield zones:** removed large faint ghost letters and purple haze; repainted an original navy/indigo enamel background with restrained circuit motifs and physically plausible printed scoring regions.
- **Legible shot and lower-table callouts:** high-contrast printed areas for POWER GRID, ORBIT, RAMP, TARGET BANK, NIGHT RIDE and BALL SAVE, plus separate backed 3D plaques for JACKPOT, RAMP, ORBIT, FRENZY and BALL SAVE.
- **HUD hierarchy:** strengthened the score contrast, small labels, mission rows and Start/Restart buttons without changing HUD section heights or keyboard controls.
- **3D QA:** renderer smoke-tested constructing 475 meshes, rendering two frames and verifying a single high-resolution sign and the key zone labels. All 42 gameplay and DMD tests passed in the current test harness.
- **Still required:** live Chrome 100%-zoom desktop and Samsung Fold screenshots, text legibility and full gameplay evaluation. No new mechanics or changes to the no-scroll desktop contract.

## Phase 3K — gameplay fairness and clear lettering

- **Tuned ball response:** gravity reduced from 920 to 780 playfield units/s², physical flipper length increased from 65 to 71, with a slightly more forgiving bat contact radius. The 3D paddle geometry was lengthened to match the actual physics.
- **Outlane protection:** two symmetric physical rebound posts at (130, 641) and (290, 641) now reduce unavoidable lower-playfield escapes. These are real collision objects and also appear in the 3D and fallback artwork.
- **Ball-save fairness:** initial save window increased from 4 to 11 seconds after each launch; it remains **one use per ball**, so a player can still lose through missed flipper shots. Existing game-over, extra ball and scoring rules remain unchanged.
- **No endless trapping:** testing showed the old stationary bats could hold a ball at the centre indefinitely. With the revised bats and lower posts, an unattended game eventually drains, while active flipper timing keeps the ball alive noticeably longer.
- **Sharp table branding:** the 3D NEON TILT sign and NEXTGEN SESSIONS wordmark use high-resolution, high-contrast raster textures with no baked shadow blur, better texture filtering and an outline for readability.
- **Verification:** 31 gameplay tests plus 11 DMD tests pass, including explicit timed ball-save, no-trap and sustained-play checks. A mocked Three.js runtime successfully built the revised 3D table and verified sharp, unblurred sign labels.
- **Quality boundary:** automated simulations demonstrate an improvement but are not a replacement for actual full-game Chrome/Fold playtests. The table remains a prototype with 2D physics and guided raised ramp travel.

## Phase 3J — reactive dot-matrix show controller

- **Rotating attract-mode messages:** PRESS START / PLAYER ONE READY, 3 BALL ARCADE / CHASE JACKPOTS, LIGHT THE TABLE / RAMP + ORBIT, and HIGH SCORE RUN / OWN THE NIGHT. Branding is no longer pointlessly repeated inside the LED screen.
- **Live gameplay status:** score and ball number, target and lane progress, ramp/orbit objectives, spinner/scoop totals, ball launch readiness, 2× scoring and Bumper Frenzy. The baseline display alternates every 4.5 seconds and automatically gives way to live events.
- **Event-linked celebrations:** ramp and orbit shots display actual awarded points (including 2× multiplier), spinner, scoop, target bank, lanes, missions, jackpot, frenzy, ball save, extra ball, ball drain and game over each have succinct message pairs.
- **Priority-based interruptions:** important game milestones override lesser messages, generic point awards do not obscure objectives, ordinary bumper hits are rate-limited, and a new game immediately clears an old game-over banner.
- **Controlled arcade presentation:** major scoring events receive a short bright amber LED pulse, border flash and left-to-right reveal; reduced-motion users see sharp static messages with no reveal or strobe.
- **QA:** 37 physics and DMD regression checks, including new cases for attract rotation, live mission/score information, 2× point awards, message priority and game reset. No scoring or physics rules altered.
- **Release constraint:** changes are committed but the published appearance and long-session gameplay have not been personally verified in Chrome or on Samsung Fold.

## Phase 3I — machine presence and readability correction

- **Compact cabinet-and-console desktop layout:** the whole existing cabinet is framed in a narrow dedicated stage instead of a huge left-hand website panel. Machine occupies most of its immediate container while the right score panel is capped at 390 CSS pixels. No gameplay or table collision dimensions are changed.
- **Larger visible machine:** reclaimed desktop header height, removed the small machine heading and nonfunctional miniature cabinet lights, reduced cabinet padding and increased the playfield height allowance to roughly `100dvh - 108px` (with separate short-screen rules).
- **No detached lighting towers:** floating pseudo-element light bars are hidden. Controlled edge reflections and trim belong to the physical cabinet itself.
- **No playfield start overlay on desktop:** the table remains unobstructed in attract mode; START GAME and the animated DMD already show what to do. The pre-existing mobile touch flow is kept.
- **Less washed-out 3D:** lowered excessive point, ambient and direct lighting intensities and reduced exposure, keeping event-driven flashes while restoring depth in chrome and plastics.
- **Sharp DMD:** removed the old renderer's blur-over-itself pass and prevented stretched canvas scaling in the desktop mission panel. LED dots and text remain a native 80×22 grid.
- **No-scroll contract preserved:** desktop continues to use a 100dvh game viewport. Basic size arithmetic was checked for representative desktop viewport widths/heights, but actual Chrome/Fold visual screenshots are still required.
- **Testing:** all 30 gameplay and DMD regression tests pass; no new gameplay missions or collision zones added.
- **Scope:** this is a refinement of the current Three.js model, **not** a claim that it now matches the Windows Space Cadet table or that final real-device QA is complete.

## Phase 3H — realistic materials, DMD clarity, immersive cabinet

- **Studio PBR reflections:** a new original procedural equirectangular softbox environment is converted into a PMREM reflection map at runtime. Chrome, brushed nickel, gold, clear-coat enamel and plastic respond to reflected lighting rather than relying solely on flat gradients. No third-party photographs or copyrighted table artwork.
- **Better dimensional depth:** ramp decks now include proper thickness with top, side and underside faces, supported spines and real fastener details. Bumper skirts use the same positions as collision geometry; rubber collars and flipper base plates have distinct materials.
- **Camera and printed artwork:** a subtle off-axis camera improves material parallax without cropping the table. Original playfield printing marks ramp/orbit regions, target bank, night ride and lower return paths.
- **Larger physical DMD:** the 80×22 LED screen now uses more readable 11px/9px bitmap typography, shortened mission callouts and a restrained warm-light reveal. The responsive panel fills more width.
- **Immersive fullscreen:** hides site header and top border, expands the cabinet inside the viewport, and gives the score console a dedicated fullscreen layout; no scrolling for desktop players. Browser fullscreen requires a user click.
- **Accessibility/performance:** motion reveals respect reduced-motion settings; if PMREM setup fails, the 3D game retains direct lights. If Three.js fails altogether, the original 2D game stays playable.
- **Tests:** the 29 existing engine/DMD checks are retained with an additional typography test. Mocked 3D construction also verified the revised ramp decks and optional reflection environment.
- **Still a prototype:** the model is custom procedural Three.js geometry, not an externally sculpted Blender/glTF asset; ball physics still uses a deterministic 2D solver with elevated guided ramp travel. Live Chrome/Fold visuals, GPU performance and full session playtesting remain release blockers.

## Phase 3G — mechanical 3D and pinball dot-matrix display

- **3D structural detailing:** original procedural meshes for raised ramp decking, physically separate plastic covers, wire supports, guide hardware, cast-metal fasteners, lane gates, brackets, rubber posts, target bank shielding and shooter-lane safety cover. All the hardware remains three-dimensional in Three.js.
- **Aligned ball and track geometry:** physics now exports shared `RAMP_PATH` and `ORBIT_PATH` arrays, which the Three.js wireforms, elevated decks and guided travelling ball all consume. The ball's render height follows the same path to prevent clipping through high ramps.
- **Dot-matrix display:** a live 80×22 LED-style canvas in the former empty mission panel. It shows score, ball readiness, jackpots, missions, spinner/scoop hits and end-of-game messages. Higher-priority events take precedence over ordinary hits.
- **Desktop viewport:** the no-scroll 100dvh desktop cockpit is retained; on mobile/Fold the DMD becomes a short landscape display below missions. It hides on extremely short desktop browser windows rather than compressing the flipper controls.
- **Tests:** 26 pinball physics/shot tests plus 3 DMD logic tests, with the CI workflow expanded accordingly; Three.js and hardware construction also pass a mocked 3D runtime smoke test.
- **Scope boundary:** the detailed components are procedural Three.js meshes, not externally authored Blender/glTF assets. Guided 3D ramp visuals now align better with the simplified 2D game engine, but the ball is not yet running a true 3D rigid-body physics simulation. GPU performance and realistic lighting still need actual browser/desktop/Fold checks before a public launch.

## Phase 3F — Bigger / Flashier / Full Screen Presence

- **Large-table desktop pass:** tighter header, cabinet and flipper controls, allowing the full playfield to claim more of the available browser height while preserving the no-scroll contract at desktop widths.
- **Illuminated cabinet side towers:** the unused dark side areas of the landscape desktop cockpit now contain softly chasing red/amber cabinet lighting rather than empty blocks.
- **Tighter 3D framing:** less wasted black space inside the WebGL view, without intentionally cropping the upper or lower table. The table is portrait-oriented, so the maximum size is ultimately constrained by browser viewport height; browser Fullscreen produces a greater size increase.
- **Visible additive light bloom:** a shared, procedurally generated radial glow texture adds soft haloes to the 34 table inserts, upper rollovers, bumper caps, scoop and spinner; this avoids an expensive multi-pass postprocessor.
- **More vivid original playfield art:** richer blue-violet enamel base, warm copper/plastic accents and brighter cyan/pink/amber inserts.
- **Event-driven light choreography:** significant shots, missions, scoops, frenzy and extra-ball events trigger short cabinet light bursts; no fake score or mechanical events are introduced.
- **Reduced motion:** suppresses moving patterns and event bursts while leaving static gameplay-readable lamps in place.
- **Current limitation:** Code tests and a mocked WebGL renderer pass, but live browser layout, GPU performance and brightness have **not** been independently verified. Request fresh 100%-zoom desktop and unfolded Fold 7 screenshots before declaring the build polished.

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
