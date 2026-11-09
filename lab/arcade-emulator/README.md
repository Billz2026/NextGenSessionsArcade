# NextGen Sessions Arcade — Emulator Lab (branch-only proof of concept)

**Scope:** An isolated arcade/console ROM loader behind a GitHub branch. It is *not* linked from or deployed with the live six-tile homepage. No ROMs, BIOS files, commercial artwork or emulator binaries are committed.

## What is implemented

- A NextGen Sessions-branded arcade cabinet shell, with a system chooser and local ROM-file picker/drag-and-drop area.
- Core options: FBNeo (`arcade`), MAME 2003 (`mame2003`), NES (`nes`), SNES (`snes`), Mega Drive (`segaMD`), Game Boy (`gb`).
- The selected file is passed as a **browser blob URL** to the documented `EJS_gameUrl` integration. Our page does not send the file to our server, but **EmulatorJS scripts are loaded from a third-party CDN** and run in the user's browser, so don't describe this as a privacy guarantee.
- Version-locked EmulatorJS **4.2.3** at `https://cdn.emulatorjs.org/4.2.3/data/`; assets are loaded only when the user presses LOAD.
- Public UI displays loading, ready and game-start signals from documented hooks.
- No auto-upload, no ROM URL sharing, no embedded ROMs. The emulator's own local browser storage/save-state behaviour is separate.
- A clear reload/reselect path prevents duplicate emulator instances after launch.

## Local launch from the branch

This prototype is **not on GitHub Pages**. GitHub's source-view links do not execute its JavaScript.

1. Clone the repository, then run `git switch prototype/arcade-emulator-local-rom-2026-11-09`.
2. From the repository root run `python -m http.server 8000`.
3. Open `http://localhost:8000/lab/arcade-emulator/`.
4. Select **ARCADE / FBNeo** or **ARCADE / MAME 2003** to test a *matching* and legally usable ZIP ROM set. Or choose NES for a simpler sanity test.
5. Click LOAD INTO CABINET. When ready, press the emulator's own START GAME control. If needed, configure controls using the toolbar.

Requires a browser with WebAssembly support and an Internet connection for the versioned EmulatorJS CDN. Use Chrome on Windows first, then test the Samsung Z Fold 7.

## ROM rights, licences and compatibility

- **Do not commit or publish commercial ROMs** until the specific right to host and redistribute is documented.
- The original Looping ROM on MAME's website is authorised for **non-commercial use** from its official download page; MAME explicitly says this does not authorise third-party redistribution or commercial use.
- FBNeo expects ROM-set compatibility; a current MAME ZIP isn't automatically supported.
- Some MAME games need parents/BIOS; this prototype supplies neither.
- Core/software licences must be reviewed independently (FBNeo has non-commercial restrictions).
- This is a **smoke-test shell**, not proof of successful game emulation. No verified game-level performance or touch-control QA yet.

## Required manual QA before public integration

1. Desktop Chrome: load a legally usable matching arcade ZIP and get real gameplay/audio.
2. Verify coin/start, four directions, action buttons, pause, fullscreen, remapping and exit.
3. Test a lawfully usable NES ROM to isolate integration from arcade ROM-set issues.
4. Repeat on the Z Fold 7 folded, unfolded, landscape and with a gamepad.
5. Record the emulator/core version, exact ROM-set compatibility and licence.
6. Only then decide whether to deploy a public game with confirmed redistribution rights.

Documentation: https://emulatorjs.org/docs/ and https://www.mamedev.org/legal.html
