# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 28, 2026. Design and milestones: `docs/PLAN.md`. What was built and decided, milestone by
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

- **M0–M2 merged to `main`:** World 1 (levels 1–8, addition) is playable as timed pages, with saved
  players (up to 6) and a trail map. Levels unlock strictly in order.
- **M3 built on branch `m3-art-system`, pushed, not merged:** the drawn hero with poses and parallax world
  backdrops on every screen. Merge after a look in the browser (`npm run dev`; the art gallery is at
  `#gallery`).
- **Checks:** 48 unit tests, lint and build pass. CI runs them on every push (GitHub Actions).
- **Known gaps (scheduled in `docs/PLAN.md`):** no pause when the app is backgrounded or in portrait (M4);
  tablet performance untested (M4 preview deploy); the ✕ exit records nothing (decide before stats);
  PNG icons and the Pages `base` path (M10).
- **Still open:** the final title and story opening; what comes after level 40.

## Next steps

1. Look at M3 in the browser, then merge `m3-art-system` to `main`.
2. **M4 Cut scenes** (branch `m4-cut-scenes`): a timeline-driven `CutScenePlayer` (`walkTo`, `jump`,
   `useProp`, `camera`, `caption`, `wait`), reusable obstacle templates (tall grass, puddle, fence, bees,
   stepping logs, windy hill, sleeping bull, rope bridge) and World 1's 8 scenes as data, replacing the
   results screen's text card and the page strip's flag. Also in M4: pause on `visibilitychange` and in
   portrait, and a preview deploy to try on the tablet.
3. **M5–M10** in the order `docs/PLAN.md` §9 lists them.
