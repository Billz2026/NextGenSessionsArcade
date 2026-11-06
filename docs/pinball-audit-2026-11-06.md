# Neon Tilt — Phase 1 implementation audit (6 November 2026)

**Repository:** `Billz2026/NextGenSessionsArcade`  
**Baseline:** `main` at `6fcd06a27464f6e5a8774d9a72d5e67e049d205d`  
**Repair branch:** `audit/pinball-input-and-browser-qa-2026-11-06`  
**Scope:** input correctness, test health, desktop/mobile layout smoke testing. No changes to game physics, scoring rules, assets, or table geometry.

## Verified from source and existing CI

| Priority | Finding | Evidence | Branch action |
| --- | --- | --- | --- |
| P1 | Releasing a flipper button can drop a flipper still held with the keyboard, or releasing one on-table touch can drop a button-held flipper. | `game.mjs`: keyboard, button and canvas handlers independently called `setHold(side,false)`. | Fixed: single derived flipper hold from active keyboard keys, on-screen button pointers and canvas pointers; tracked multiple pointers separately. |
| P1 | Releasing the on-screen plunger early can launch while Space/ArrowDown still holds charge. | `game.mjs`: button pointer release and keyboard release independently called `engine.holdLaunch(false)`. | Fixed: charge remains active until the last input is released; pointer cancellation safely cancels if no input remains. |
| P1 | Two existing lower-hardware tests fail against an unchanged, intentional visual material update. | `tests/pinball-lower-hardware.test.mjs` expects `lowerSteel`; `render3d.mjs` uses `mouldedIvory` for the guard edge and drain lip. CI failed 2/167 tests before test correction. | Fixed stale test expectations without changing the renderer. |
| P1 | The browser smoke test did not exercise controls or responsive layouts. | `tests/pinball-browser-smoke.mjs` only checked for nonblank renderer pixels and console errors at 1690×920. | Added mixed-input regressions, aspect-ratio/horizontal-clipping assertions, and screenshots at four CSS viewport sizes. |
| P2 | 3D mobile camera and pixel ratio are selected at initial renderer construction, not recalculated when crossing the 1120px breakpoint. | `render3d.mjs` captures `const compact` once, but `resize()` only changes camera aspect and renderer size. | Deferred: responsive camera change requires visual framing verification. |
| P2 | Browser smoke can pass on 2D fallback even when the intended Three.js table fails. | Test passes on `active3D || bright2D`; `render3d.mjs` imports Three.js from a CDN. | Deferred: separate explicit 3D-capable run and fallback run with unambiguous success criteria. |
| P2 | Current collision/route alignment and full 3D presentation are not proven by a screenshot assertion. | Engine uses authoritative 2D collisions; 3D renderer paints matching geometry. Structural tests are not a human visual review. | Deferred: inspect artifacts and run full actual-play sessions on desktop and Samsung Fold. |

## First repair pass

1. Keep `games/pinball/engine.mjs` and art/rendering geometry unchanged.
2. Make active flipper and plunger states derive from all current sources, rather than last event wins.
3. Check at least desktop 1690×920, laptop 1280×720, unfolded-device proxy 760×880 and phone 390×844. These are CSS viewport proxies, not a verified Fold 7 physical-device test.
4. Ensure source tests test the existing intentional surface material, not pre-cleanup `lowerSteel`.
5. Collect CI screenshots as artifacts and review before any approval to merge.

## Merge acceptance criteria

- `Arcade physics tests` GitHub workflow completes successfully.
- `Pinball browser rendering smoke` GitHub workflow completes successfully.
- Simultaneous keyboard + pointer holds retain the flipper; a combined held Space + plunger pointer does not launch early.
- No horizontal clipping at the four tested viewports; no desktop playfield or flipper controls cut below screen.
- The screenshot artifacts are visually reviewed (automated box assertions cannot certify artistic quality).
- A real-device Fold 7 and normal desktop browser manual gameplay review remains necessary before claiming a production-quality 3D table.

**Deployment safety:** work only on the repair branch. A draft pull request is for review only; do not merge into `main` until gameplay and presentation are approved.
