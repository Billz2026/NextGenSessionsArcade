# NextGen Sessions Arcade

The arcade is being designed as a tile-first website. There are currently **zero playable games**.

## Homepage (tile system)
- A compact gaming-division masthead and status panel sit above the game-selection area.
- The primary interface is **six uniform arcade-cabinet tiles**, ordered 001–006.
- Each tile follows an identical contract: numbered header, cabinet-inspired art, game identity area, and status/footer. No tile is clickable while no game exists.
- Slots are unassigned; no game selection is implied.
- Desktop: a compact 3×2 tile grid that is designed to fit within a typical desktop viewport at 100% browser zoom (short viewport heights may still scroll).
- Tablets and unfolded phones: 2 columns. Narrow phone screens: 1 column.
- Existing official brand assets are preserved unchanged: `assets/nextgen-header-wordmark-2026.webp` and `assets/arcade-wordmark.svg`.
- Static HTML/CSS only; no JavaScript framework or build step.
- Tests: `node --test tests/site.test.mjs`.

## Archive
High Roll Run roulette and Neon Tilt pinball, including their source, original workflows and tests, were preserved intact on:
`archive/roulette-pinball-before-arcade-redesign-2026-11-09`.

These prototypes are not published on the live `main` branch. The archive is a public source-control branch, not a game collection on the website.

## Future game integration
Once a game is chosen and reaches release quality, its slot can receive unique title/art, a genuine play link, and a live status without changing the surrounding layout. Keep the tiles uniform and retain separate desktop/fold/phone layouts.

Live URL: https://billz2026.github.io/NextGenSessionsArcade/


## Single-machine homepage (2026-11-09)
The main page now features exactly one large NextGen Sessions cabinet showing an embedded version of the existing Looping MAME 0.243 player. The embedded URL uses `?embed=1`, which presents the local ROM selector inside the CRT, not an external upload column. When LOAD is pressed, the embedded layout switches to the live emulator screen without reloading it. Both on-cabinet and top-row fullscreen controls use the browser Fullscreen API. The page never uploads, stores or distributes `looping.zip`; the visitor selects a file locally every time. Game audio remains unverified and is explicitly disclosed. The previous six-tile homepage is retained in the archive branch `archive/six-tile-arcade-before-single-cabinet-2026-11-09`.
