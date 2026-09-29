# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 28, 2026 (M4b rolled out; M6 adaptive difficulty built).
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

- **Merged to `main`:** M0–M3 (timed pages, profiles, map, hero, backdrops).
- **Built on branches, pushed, not merged** (each branches from the one before):
  - `m4-cut-scenes`: cut scenes, pause, Enter / ✓ to answer with a per-player "Automatic" switch.
  - `m4b-art-direction`: World 1 is the **Old Mine Shaft**, with all 8 epic scenes (cart race, cart
    jump, wall smash, rat swarm, crystal cavern, bat storm, runaway lift, mine-train boss), the adventurer
    hero (now with a nose), the mine backdrop, and the UI chrome (ink outlines, parchment, a wooden pad,
    the Lilita One font, a lantern timer).
  - `m6-adaptive-difficulty`: ratings per skill that set each page's size and difficulty, missed facts
    brought back until they're answered fast, and an **age** picker (5–10+) in the player editor that
    sets the starting point. Save format v3.
- **Checks:** 121 unit tests, lint and build pass; CI runs them on every push.
- **Waiting on:** the tablet check (LAN preview), which closes M4 and M4b; then merge all three in order.
- **Known gaps:** the parent controls for adaptive difficulty (see the ratings, pin, turn off) wait
  for Settings in M10; PNG icons and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. On the tablet: play World 1 end to end (LAN preview: `npm run build`, then
   `npm run preview -- --host`). Check the scenes run smoothly and the difficulty feels right for each
   child's age. Fix anything that stutters.
2. Merge `m4-cut-scenes`, then `m4b-art-direction`, then `m6-adaptive-difficulty` into `main`.
3. **M5:** Worlds 2–5 (skills, 32 levels with problem ranges and bands, skill ages, backdrops, scenes
   per the scene recipe). Then M7–M10.

## Handoff

- **Branch:** `m6-adaptive-difficulty`, pushed, nothing uncommitted.
- **Waiting on the user:** the tablet run; feedback on the scenes and on how hard each child finds it.
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` stops and `document.hidden` is true, so
  pages auto-pause and scenes don't advance; scrub scenes with the gallery slider. The dev server's file
  watcher sometimes misses edits made by tools; `touch` the file. Long Bash heredocs fail on Windows;
  write a script file to the scratchpad and run it.
