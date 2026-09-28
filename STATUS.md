# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 27, 2026 (after M0 + M1). The full design and milestones are in `docs/PLAN.md`.

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

- **M0 and M1 are done** (branch `m0-m1-core-loop`). Levels 1-8 (World 1, addition) are playable
  as timed pages with placeholder art. Run it with `npm install` then `npm run dev`.
- **M0 Scaffold:** Vite 8 + TypeScript 6 + React 19, ESLint, Prettier (Markdown excluded), Vitest 5,
  `vite-plugin-pwa` (SVG icon only so far) and `.claude/launch.json`.
- **M1 Core loop:**
  - `src/game/` (pure, tested): seeded RNG, config, World 1 generators (within 5, within 10,
    doubles, make-10 as `7 + _ = 10`, within 20, review mix), page generation without
    back-to-back repeats, the page-session reducer, and pass/star scoring. 34 unit tests.
  - `src/content/levels.ts`: levels 1-8 with obstacles and captions (level 8 is the rope-bridge boss).
  - UI: a 1280×800 stage scaled to fit, a "turn sideways" hint in portrait, level select, a 3-2-1
    countdown, the page (hero walks per correct answer, sun timer, pad and keyboard, auto-submit,
    a second try, then the answer is revealed), and a results screen with a text card standing in
    for the cut scene.
  - Checked in the browser: pass (2 and 3 stars), fail by timeout, retry with fresh problems,
    on-screen pad taps, portrait hint, scaling. No console errors.
- **Not saved yet:** best stars are kept in memory only, and every level is unlocked (M2 adds both).
- **Still open:**
  - the final title and the story opening
  - whether levels unlock strictly in order
  - what comes after level 40

## Known gaps / notes for later

- There is no pause. The page keeps running while the "turn sideways" hint shows or when the app
  is in the background. Consider pausing (and hiding the problem) on `visibilitychange` and in portrait.
- PNG icons (192/512) are needed for the best Android install experience (M10).
- `vite.config.ts` has no GitHub Pages `base` yet (M10).
- Typing `0` for a two-digit answer waits for a second digit, as designed (auto-submit only fires
  at the answer's length). The ✓ key submits early.

## Next steps

1. **M2:** profiles (zustand + IndexedDB via `idb-keyval`, versioned save), the trail map
   replacing the level select, and level unlocks.
2. **M3-M10** in the order `docs/PLAN.md` §9 lists them.
