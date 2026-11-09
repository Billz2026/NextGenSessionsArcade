# NextGen Sessions Arcade

A browser arcade project under active design. The live website currently has **no playable games**; this is intentional while the interface and arcade identity are established.

## Current homepage
- A NextGen Sessions-branded arcade lobby with a stylised virtual cabinet, an attract-screen-style standby display and a six-bay arcade floor.
- Six **unassigned** cabinet positions, not promises of particular games or genres.
- "00 GAMES LIVE" is accurate. The page does not link to unfinished games.
- Responsive desktop, phone and folding-screen layouts, using static HTML/CSS and no JavaScript or build step.
- The official NextGen Sessions image at `assets/nextgen-header-wordmark-2026.webp` is preserved unchanged. The arcade sub-brand uses `assets/arcade-wordmark.svg`.

## Archived games
On 9 November 2026, High Roll Run roulette and Neon Tilt pinball, including their game source, game-specific tests, and workflows, were preserved intact on branch:

`archive/roulette-pinball-before-arcade-redesign-2026-11-09`

These games are **not deployed in the main GitHub Pages branch**. The archive remains a public GitHub branch, so the code is accessible on GitHub but the game URLs are no longer served as working pages.

No game has been selected for cabinet 001. Interface design comes first.

## Technical and testing
- Live website: https://billz2026.github.io/NextGenSessionsArcade/
- GitHub Pages source: `main`, `/ (root)`.
- Site files: `index.html`, `styles.css`, `404.html`, `assets/`.
- Automated site checks: `node --test tests/site.test.mjs`.
