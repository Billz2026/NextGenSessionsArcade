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
