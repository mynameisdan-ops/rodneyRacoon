# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 27, 2026. The full design and milestones are in `docs/PLAN.md`.

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

- **Planning only.** The design (`docs/PLAN.md`) and working rules (`CLAUDE.md`) are written.
- **No code yet.** The git repo holds only the initial commit (README). `CLAUDE.md` and `docs/`
  are not committed yet.
- **Still open:**
  - the final title and the story opening
  - whether levels unlock strictly in order
  - what comes after level 40

## Next steps

1. Commit `CLAUDE.md`, `docs/PLAN.md` and this file.
2. **M0 Scaffold:**
   - Vite + TypeScript + React, ESLint/Prettier, Vitest, the PWA plugin and `.claude/launch.json`.
   - Done when a blank app runs and the tests run.
3. **M1 Core loop:**
   - World 1 problem generators, the 60-second page, the number pad and keyboard, and auto-submit.
   - Pass or retry, with placeholder art.
   - Done when levels 1-8 are playable as plain pages.
4. **M2:** profiles, saving, the trail map and level unlocks.
5. **M3-M10** in the order `docs/PLAN.md` §9 lists them.
