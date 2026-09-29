# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 28, 2026 (M4b style test built, waiting for approval). Design and milestones: `docs/PLAN.md`. What was built and decided, milestone by
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
- **M4 on `m4-cut-scenes`, pushed, not merged:** cut scenes after every World 1 level, obstacle previews,
  pause, and answers checked on Enter / ✓ with a per-player "Automatic" switch (save format v2).
- **M4b on `m4b-art-direction` (branched from M4), pushed:** the style test. World 1 is now the **Old Mine
  Shaft**, with a cel-shaded style kit, the young-adventurer hero (13 poses), the mine backdrop (on the map,
  the page strip and in scenes) and the level 1 "Cart race!" scene. Look at it in `#gallery` → cut scene 1.
- **Waiting on:** approval of the style test, and the tablet check (the LAN preview works; see `docs/PLAN.md`).
- **Checks:** 99 unit tests, lint and build pass; CI runs them on every push.
- **Known gaps:** levels 2–8 still show meadow obstacles on the mine backdrop until the rollout; the page
  timer is still a "sun"; tablet performance untested; the ✕ exit records nothing (decide before stats);
  PNG icons and the Pages `base` path (M10).
- **New feedback, not scheduled yet:** a parent menu for starting difficulty (easy → expert) and detailed
  settings (problem type, digits, problem count) (`docs/feedback.txt`). It fits M6/M10.
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user reviews the style test (`#gallery`, cut scene 1; also the map and a level 1 page) and says
   what to change.
2. After approval, roll out M4b: scenes for levels 2–8 per PLAN §3 (cart jump, wall smash, rat swarm,
   crystal cavern, bat storm, runaway lift, boss mine-train escape), UI chrome and font, a mine-themed
   timer, then the tablet check. Merge M4 and M4b to `main`.
3. Schedule the parent-settings feedback (PLAN §7 / M6, M10), then **M5**, then **M6–M10**.

## Handoff

- **Branch:** `m4b-art-direction`, pushed. `m4-cut-scenes` is its base; neither is merged.
- **Waiting on the user:** style-test feedback; how to get the build onto the tablet.
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` stops and `document.hidden` is true, so the
  page auto-pauses and scenes don't advance; scrub scenes with the gallery slider instead. The dev server's
  file watcher sometimes misses edits made by tools (it served a stale `levels.ts`); `touch` the file.
  Long Bash heredocs can fail on Windows; write a file and run it instead.
