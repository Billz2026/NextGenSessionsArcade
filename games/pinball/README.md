# Game 002 — NextGen Pinball: Neon Tilt
## Phase 3A · Physics Prototype

Play: https://billz2026.github.io/NextGenSessionsArcade/games/pinball/

This is a playable proof-of-concept, not the final pinball table. Game 001 (Roulette) and the arcade homepage are intentionally unchanged.

### Included
- 420 × 700 original neon table and responsive virtual cabinet.
- Fixed-step 240 Hz ball simulation with gravity, velocity cap, rebound and wall/post collisions.
- Two player-controlled flippers with motor timing, reactive collision impulses and simultaneous touch controls.
- Hold-to-charge plunger with open shooter-lane exit.
- Three pop bumpers (250 points) and two slingshots (100 points).
- Three-ball session, drains, game-over and local-browser personal best.
- Synthetic sound (off by default), reduced-motion-aware scoring effects.
- Pointer, touch and desktop controls. No external JavaScript libraries.

### Controls
| Action | Desktop | Touch |
|---|---|---|
| Start/restart | Enter / buttons | Start/restart buttons |
| Left flipper | Left Arrow or A | Left touch button or left lower playfield |
| Right flipper | Right Arrow or D | Right touch button or right lower playfield |
| Charge/launch | Hold then release Space or Down Arrow | Hold then release Launch button |

Focus loss cancels a held charge rather than launching accidentally. Gameplay uses a fixed simulation step, independent of animation frame rate.

### Tests
\`\`\`bash
node --test tests/pinball-engine.test.mjs
\`\`\`
A GitHub Actions workflow runs pinball and existing roulette engine tests on relevant commits.

### Out of scope for 3A
Mission targets, ramp geometry, orbit scoring, multiball, advanced rigid-body collisions, final cabinet artwork, online leaderboards. This prototype is intended for controls/physics feedback before Phase 3B.

### Release quality gates
Do not promote to a featured homepage game until physical device testing on desktop, narrow phone, and unfolded Samsung Fold is complete and the ball/flipper interaction has been playtested.
