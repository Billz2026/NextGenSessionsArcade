# NextGen Sessions Arcade

A compact, gaming-first browser arcade branded as a division of NextGen Sessions.

## Branding
The gold NextGen Sessions wordmark at `assets/nextgen-header-wordmark-2026.webp` is an exact, unmodified copy of the official music-site artwork. The red `assets/arcade-wordmark.svg` is the dedicated Arcade sub-brand. These assets have not been modified.

## Homepage
- Single-screen **desktop dashboard** targeted at standard desktop viewports, with a compact header, one welcome heading, an instantly visible six-tile library and slim footer.
- Playable Roulette beta (Game 001) and five category previews (Arcade, Reflex, Puzzle, Strategy, Sports).
- Browser-credit games remain in planning only, without purchases, real-money stakes or prizes.
- Cards are not interactive until a game exists.
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
