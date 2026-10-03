# Status: The Long Way Home (rodneyRacoon)

Last updated: Oct 3, 2026 (code and docs restructured for cheaper sessions and easier expansion;
M0–M7 on `main`). History: `docs/decisions.md`.

## Goals

A timed mental-math adventure for the kids (ages 6 and 9), inspired by *Rodney the Raccoon*. The
child's own avatar travels home across 40 levels (5 worlds × 8, from addition within 5 up to all
four operations); each level is a 60-second page of problems and then an obstacle cut scene.

- An offline PWA (Vite, TypeScript, React, SVG art) for a Windows PC and an Android tablet, hosted
  on GitHub Pages. No network calls, analytics or trackers.
- Adaptive difficulty with weak-fact practice, gentle retries and no "game over".
- Rewards: coins, stars, combos, an avatar shop and a sticker book.
- An avatar builder with an optional photo face that never leaves the device.

**Done means:** M10 is finished: the game is installed on the PC and the tablet, and all 40 levels
are playable with rewards, audio and parent settings.

## Current state

- **On `main`:** M0–M7. All 40 levels with cut scenes; adaptive difficulty with an age setting
  (older players reach a little further); a danger chasing the hero on each page; the world
  overview map; a per-player "levels: one by one / all open" switch; coins, the avatar shop
  (21 items) and the sticker book (save format v5). The World 1 tablet play-through went fine.
- **Oct 3 restructure** (nothing a player sees changed): area guides (`src/**/CLAUDE.md`) with
  recipes, one file per obstacle and a script file per world, a world art registry, a CSS file
  per screen, dev `#demo/<screen>` links, `npm run check`, and a content test that names
  anything a new world is missing.
- **In progress on its own branch:** M7b, a Saturday-morning cartoon look (`m7b-cartoon-look`,
  not merged; Worlds 1–3 repainted and directed). Its `STATUS.md` has the details, and it already
  has this restructure merged in. Art, scene and doc work belongs there until it merges.
- **Checks:** 370 unit tests, lint and build pass; CI runs them on every push.
- **Known gaps:** parent controls for adaptive difficulty, and the unlock switch's final home,
  wait for Settings (M10); PNG icons and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays the rewards and Worlds 2–5: PC with `npm run dev`, tablet with the LAN preview
   (`npm run build`, then `npm run preview -- --host`). Worth a look: coin pace against prices,
   whether gear and pets read well at tablet size, and the sticker book on the tablet (each page
   draws 8 scene stills). Notes go in `docs/feedback.md`.
2. Finish M7b on `m7b-cartoon-look` (Mountains, Canyon, the UI, the tablet check) and merge it;
   then M8 (avatars drawn from the parent's photos, as decided on that branch), M9 (audio) and
   M10 (settings, PWA polish, deploy).

## Handoff

- **Branch:** `main`, pushed. On the user's PC, `handover.md` is the user's own untracked file.
- **Waiting on the user:** a play-through of the rewards and of Worlds 2–5.
