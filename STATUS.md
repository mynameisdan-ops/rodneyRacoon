# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 28, 2026 (M4, M4b and M6 merged to main).
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

- **On `main` (pushed):** M0–M4b and M6. World 1 is the **Old Mine Shaft**: 8 timed levels
  (addition), each followed by an epic cut scene (cart race, cart jump, wall smash, rat swarm, crystal
  cavern, bat storm, runaway lift, mine-train boss). Also on `main`:
  - the cel-shaded adventurer hero, the mine backdrop and the UI chrome;
  - pause, and Enter / ✓ to answer (a per-player "Automatic" switch);
  - adaptive difficulty (ratings per skill, missed facts brought back) with an **age** picker (5–10+)
    in the player editor that sets the starting point. Save format v3.
- **Checks:** 121 unit tests, lint and build pass on `main`; CI runs them on every push.
- **Not yet done:** the tablet check (performance of scenes and glows, and whether the difficulty
  feels right for each child). It's scheduled before M5 in `docs/PLAN.md`.
- **Known gaps:** the parent controls for adaptive difficulty (see the ratings, pin, turn off) wait
  for Settings in M10; PNG icons and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. The user plays World 1 on the PC (`npm run dev`) and on the tablet (LAN preview: `npm run build`,
   then `npm run preview -- --host`, open the "Network" address). Fix any stutter or difficulty feedback.
2. **M5:** Worlds 2–5: skills and generators (with tests), 32 levels with problem ranges and bands,
   skill ages in `content/skills.ts`, world backdrops, and scenes that follow the scene recipe in
   PLAN §3. Branch `m5-worlds`.
3. M7–M10 in the order `docs/PLAN.md` §9 lists them.

## Handoff

- **Branch:** `main` at the merge of M6, pushed, nothing uncommitted. The milestone branches are merged.
- **Waiting on the user:** their play-through and tablet report; any feedback goes in `docs/feedback.md`.
- **Gotchas:** in a hidden browser pane `requestAnimationFrame` stops and `document.hidden` is true, so
  pages auto-pause and scenes don't advance; scrub scenes with the gallery slider. The dev server's file
  watcher sometimes misses edits made by tools; `touch` the file. Long Bash heredocs fail on Windows;
  write a script file to the scratchpad and run it.
