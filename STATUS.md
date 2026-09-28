# Status: The Long Way Home (rodneyRacoon)

Last updated: Sep 27, 2026 (after M2). The full design and milestones are in `docs/PLAN.md`.

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

- **M0, M1 and M2 are done.** M0-M1 are on `main`; M2 is on branch `m2-profiles-map`.
  World 1 (levels 1-8, addition) is playable, with saved players and a trail map.
  Run it with `npm install` then `npm run dev`.
- **M0 Scaffold:** Vite 8 + TypeScript 6 + React 19, ESLint, Prettier (Markdown excluded), Vitest 5,
  `vite-plugin-pwa` (SVG icon only so far), `.claude/launch.json`, and `.gitattributes` forcing LF
  line endings (the repo has `core.autocrlf=true`; Prettier expects LF).
- **M1 Core loop:**
  - `src/game/` (pure, tested): seeded RNG, config, World 1 generators (within 5, within 10,
    doubles, make-10 as `7 + _ = 10`, within 20, review mix), page generation without
    back-to-back repeats, the page-session reducer, and pass/star scoring.
  - `src/content/levels.ts`: levels 1-8 with obstacles and captions (level 8 is the rope-bridge boss).
  - The page: a 3-2-1 countdown, the hero walks per correct answer, sun timer, pad and keyboard,
    auto-submit, a second try, then the answer is revealed. The results screen has a text card
    standing in for the cut scene.
- **M2 Profiles, saving, map:**
  - `src/game/progress.ts` (pure, tested): strict in-order unlocks, best stars, plays/passes,
    current level, total stars.
  - `src/state/schema.ts`: versioned save (`SAVE_VERSION = 1`) with a `migrate()` that sanitizes
    damaged data and refuses saves from a newer app (`NewerSaveError`, shown as a "please update"
    screen, and never overwritten). `persistence.ts` uses IndexedDB (`idb-keyval`, db
    `long-way-home`) with ordered writes and asks for persistent storage. `store.ts` is zustand.
  - Screens: "Who's playing?" (up to 6 players, the last player is highlighted, ✎ to edit),
    the player editor (name up to 12 characters, 8 named shirt colors, a new player defaults to
    an unused color, delete with a confirm step), and the trail map (8 stops on a winding path,
    locked/passed/current states, stars per stop, the hero at the current level, a boss label,
    a player chip to switch, total stars, world arrows ready for more worlds). If saving fails
    (e.g. private browsing), the map shows a small warning and play continues in memory.
  - On first launch with no players the game opens straight into "New player".
  - Checked in the browser: create, rename and delete a player; separate progress per player;
    progress survives a reload; passing unlocks the next level; Next level and quit. No console
    errors. 42 unit tests.
- **Decided (was open):** levels unlock strictly in order. A parent "unlock any level" switch is
  planned for Settings (M10).
- **Still open:**
  - the final title and the story opening
  - what comes after level 40

## Known gaps / notes for later

- There is no pause. The page keeps running while the "turn sideways" hint shows or when the app
  is in the background. Consider pausing (and hiding the problem) on `visibilitychange` and in portrait.
- Leaving a page with ✕ doesn't count as a play (nothing is recorded).
- PNG icons (192/512) are needed for the best Android install experience (M10).
- `vite.config.ts` has no GitHub Pages `base` yet (M10).
- Typing `0` for a two-digit answer waits for a second digit, as designed (auto-submit only fires
  at the answer's length). The ✓ key submits early.
- When editing files with Python on Windows, open them with `newline=''` or Python writes CRLF.

## Next steps

1. **M3 Art system:** the paper-doll `<Hero>` with poses (idle, walk, jump, climb, cheer,
   stumble), world background layers, and the trail strip on the page using them. It replaces
   `PlaceholderHero` (profile `color` becomes the first avatar setting).
2. **M4-M10** in the order `docs/PLAN.md` §9 lists them.
