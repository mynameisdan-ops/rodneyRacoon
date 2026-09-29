# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 28, 2026 (M4 + Enter to submit; M4b art direction planned). Design and milestones: `docs/PLAN.md`. What was built and decided, milestone by
milestone: `docs/decisions.md`.

## Goals

A timed mental-math adventure for the kids (ages 6 and 9), inspired by *Rodney the Raccoon*. The child's
own avatar travels home across 40 levels (5 worlds × 8, from addition within 5 up to all four operations).
Each level is a 60-second page of problems followed by an obstacle cut scene.

- An offline PWA (Vite + TypeScript + React, SVG art) for a Windows PC and an Android tablet, hosted
  on GitHub Pages.
- Adaptive difficulty with weak-fact practice, gentle retries and no "game over".
- Rewards: coins, stars, combos, an avatar shop and a sticker book.
- An avatar builder with an optional photo face that never leaves the device.
- No network calls, analytics or trackers.

**Done means:** milestone M10 is finished. The game is installed on the PC and the tablet, and all
40 levels are playable with rewards, audio and parent settings.

## Current state

- **M0–M3 merged to `main`:** World 1 (levels 1–8, addition) playable as timed pages, saved players,
  trail map, drawn hero and parallax backdrops.
- **M4 built on branch `m4-cut-scenes`, pushed, not merged:** a cut scene after every World 1 level
  (results → Continue → scene → Map / Next level, with a Skip button), the obstacle previewed in the page
  strip, and pause (⏸ button, auto-pause when backgrounded or in portrait). Scenes can be scrubbed frame
  by frame in the dev gallery (`#gallery`). After the playtest (`docs/feedback.txt`), answers are checked on
  Enter / ✓, with a per-player "Automatic" switch in the player editor (save format v2).
- **Waiting on:** the tablet check that closes M4. The repo is private, so GitHub Pages isn't free; the LAN
  preview works today (see `docs/PLAN.md`).
- **Checks:** 78 unit tests, lint and build pass; CI runs them on every push.
- **Known gaps (scheduled in `docs/PLAN.md`):** tablet performance untested; the ✕ exit records nothing
  (decide before stats); PNG icons and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. Try M4 on the tablet (LAN preview or a Pages deploy, whichever is chosen), fix anything that stutters,
   then merge `m4-cut-scenes` to `main`.
2. **M4b art direction** (playtest feedback: more epic obstacles, a less preschool look): a style test in
   `#gallery` for approval first (Meadow backdrop, adventurer hero, the level 8 scene), then the style kit,
   hero, new scene steps, UI chrome and 8 epic World 1 scenes. Details in `docs/PLAN.md` §1, §3 and §9.
3. **M5:** skills for Worlds 2–5 (subtraction, 2-digit, ×, ÷), all 40 level definitions, their world
   themes, obstacle art and cut scenes.
4. **M6–M10** in the order `docs/PLAN.md` §9 lists them.

## Handoff

- **Branch:** `m4-cut-scenes` at the M4 commit, pushed, CI green, nothing uncommitted. Not merged: M4 closes
  with the tablet check.
- **Waiting on the user:** how to get the build onto the tablet — the LAN preview (`npm run build`, then
  `npm run preview -- --host`, open the "Network" address on the tablet), making the repo public for a free
  Pages deploy, or Pages on a paid plan. Then their report on whether the cut scenes run smoothly.
- **Next action:** fix any stutter they report (suspects: the CSS `filter` on the back limbs, and the whole
  scene SVG re-rendering each frame), merge `m4-cut-scenes` to `main`, push, then start M5.
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` stops and `document.hidden` is true, so the
  page auto-pauses and scenes don't advance; to test there, override `document.hidden` and swap rAF for a
  `setTimeout` shim in the console. Long Bash heredocs can fail on Windows; write a file and run it instead.
