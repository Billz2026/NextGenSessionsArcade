# Looping browser compatibility test (public page, no hosted ROM)

Visit `https://billz2026.github.io/NextGenSessionsArcade/lab/looping-browser/` once this folder is deployed from main.

This is an **unlinked technical test**. The six-cabinet homepage is deliberately not modified. **No ROMs or game assets are included.** The user picks their own `looping.zip` from the browser.

## Why this emulator core?

- The supplied **Looping (Europe)** original ROM has checksums identical to the `ROM_START(looping)` definition in **MAME 0.243**, verified in upstream source `mamedev/mame` tag `mame0243` (`src/mame/drivers/looping.cpp`).
- EmulatorJS 4.2.3's official CDN provides FBNeo and MAME 2003, but **not MAME 0.243**.
- **www.emulatorjs.com** (a distinct third-party website, not the official emulatorjs.org project) documents an `EJS_core = 'mame0.243'` option using `https://www.emulatorjs.com/loader.js`.
- This page loads that third-party script **only after a ROM is verified and the user presses LOAD**. This is an *experimental integration*: the live game engine, its actual availability and running frame rate have not yet been verified by real-browser testing.

## What is validated?

Browser reads ZIP central directory, compares the **14 expected filenames, file sizes and CRC32s** from MAME 0.243. This is a compatibility preflight, not proof of actual emulation.

After validation, the page creates a temporary `blob:` URL and passes it to the third-party emulator. **Our own site does not upload the ROM**, but third-party JavaScript on the page has access to file data. Do not present this as a complete privacy guarantee.

## Browser test checklist

1. Open link in Windows Chrome.
2. Select the *original* Looping (Europe) ZIP, which passes 14/14.
3. Press LOAD; wait for emulator's own play prompt.
4. Try `5` coin, `1` start, arrows and Ctrl for shooting.
5. Check video, audio, input, fullscreen and whether it can run at full speed.
6. Capture error screenshots or Chrome DevTools console logs for integration problems.
7. Test Samsung Fold later. This MAME 0.243 core is separate from the earlier official EmulatorJS 4.2.3 prototype and must be security/licence-reviewed before any production release.

**Game rights:** No commercial ROM or BIOS hosted. The user supplies their own file. No suggestion that the public arcade is licensed to redistribute Looping.

References:
- https://github.com/mamedev/mame/blob/mame0243/src/mame/drivers/looping.cpp
- https://www.emulatorjs.com/core/arcade.html

## Fix for observed “Unsupported Game” error (9 Nov 2026)

The user screenshot confirmed 14/14 chips matched but displayed “Unsupported Game” inside the third-party emulator. One plausible root cause is that the earlier `blob:` URL stripped the `.zip` filename, a known arcade emulation issue. We replaced the blob URL with an ephemeral service-worker-backed same-origin `/local/looping.zip` request. This may resolve file-extension detection; **actual gameplay is still not confirmed** until a new browser test. The third-party mame0.243 core may have other unsupported-game limitations.

## Focus-first cabinet UX update (9 November 2026)

The existing MAME 0.243 core and scoped in-memory ROM service worker have **not changed**. After the third-party core emits the game-start callback:
- The ROM upload/configuration column is hidden and the running game moves to the centre as a larger cabinet.
- A compact command strip supplies real on-screen fullscreen and change-ROM controls, keyboard instructions, an arcade exit link, and current status messages.
- Fullscreen expands the outer cabinet via the browser Fullscreen API; the emulator's own fullscreen button is retained.
- The third-party EmulatorJS toolbar is requested to show fewer nonessential buttons using the supported upstream `EJS_Buttons` interface; the fork might ignore that optional setting. The underlying controls remain available.
- CSS adapts the active view for desktop, narrow phone and unfolded/folded layouts; actual hardware testing remains to be done.

No game is automatically hosted or loaded, and no royalty/licensing claim is made.

## Audio troubleshooting added (9 Nov 2026)

The user confirmed no audible game sound. We do **not** yet know whether the problem is browser mute/output, the emulator fork or MAME's imperfect Looping sound driver. The MAME source marks Looping as `MACHINE_IMPERFECT_SOUND`; an older major regression was resolved in MAME 0.243, but not every sound issue is fixed.

- The prototype now requests `EJS_volume=1` at startup. Existing saved user mute state may take precedence.
- When running, the **TEST SOUND** button attempts `EJS_emulator.setVolume(1)` if available, then plays a *short synthesized browser test beep* via a new AudioContext directly in the click handler. The beep is a diagnostic only, not music or a replacement for Looping audio.
- If the beep is audible while Looping remains silent, check the emulator speaker icon, Windows audio mixer and try the same ROM in local MAME 0.289. A working test beep establishes browser output, **not** core audio health.
- If the beep is also silent, check Windows output device, Chrome tab/site mute, sound mixer and volume.
- Do not claim audio is repaired until tested on the user's hardware.

References: https://emulatorjs.org/docs/options/#ejs_volume and https://mametesters.org/view.php?id=8289.
