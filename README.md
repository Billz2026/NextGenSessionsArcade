# NextGen Sessions Arcade

A compact, gaming-first browser arcade branded as a division of NextGen Sessions.

## Branding
The gold NextGen Sessions wordmark at `assets/nextgen-header-wordmark-2026.webp` is an exact, unmodified copy of the official music-site artwork. The red `assets/arcade-wordmark.svg` is the dedicated Arcade sub-brand. These assets have not been modified.

## Homepage
- Single-screen **desktop dashboard** targeted at standard desktop viewports, with a compact header, one welcome heading, an instantly visible six-tile library and slim footer.
- Two playable betas: High Roll Run roulette (Game 001) and Neon Tilt pinball (Game 002), plus four future-category previews (Reflex, Puzzle, Strategy, Sports).
- Roulette uses fictional credits only; Pinball uses points. No purchases, real-money stakes or prizes.
- Both playable game cards have direct launch links; future-category cards are non-interactive.
- On mobile and small screens, the layout reflows into a scrollable grid for legibility. It is not possible to fit all tiles onto every device size without sacrificing usability.

## Technical
- Static HTML and CSS; no build step.
- CSS was rewritten cleanly, rather than stacking additional conflicting override blocks.
- HTML: `index.html`; CSS: `styles.css`; art: `assets/`.
- GitHub Pages: `main` branch, `/(root)`, at `https://billz2026.github.io/NextGenSessionsArcade/`.

The former Football Lab Manager is archived on the `archive/football-lab-manager-2026-10-30` branch and not part of the active site.

## Game 001: High Roll Run
- Playable at [games/roulette/](./games/roulette/)
- Standard 37-pocket European roulette using secure, unbiased random selection.
- 100 fictional credits per run, exact roulette payouts, bank-or-bust score runs.
- Wheel animation, recent outcomes, local run recovery and personal best scores.
- No accounts, prizes, purchased credits, real-money stakes, or public leaderboards.
- Run math tests using `node --test tests/roulette-engine.test.mjs`.

## Game 002: Neon Tilt Pinball
- Playable visual beta at [games/pinball/](./games/pinball/), linked from the homepage.
- Original cabinet, 3D table and Canvas fallback with flippers, shots, missions, jackpots and on-device scores.
- The 3D table uses a 2D physics simulation and guided routes; real multiball has not yet been built.
- Phase 4C homepage integration retains six tiles on desktop: two playable games and four future categories.
- Real Chrome desktop and Samsung Fold 7 visual/performance review remains outstanding.
- Homepage regression: `node --test tests/arcade-home.test.mjs`.
