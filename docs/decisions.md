# Decisions and session log

A dated entry per session or milestone: what was built, what was decided and why. Newest last. The design
itself is in `docs/PLAN.md`; the current snapshot is in `STATUS.md`.

- **2026-09-27: Plan and rules.** Wrote `docs/PLAN.md` (design, 40 levels, milestones M0–M10) and
  `CLAUDE.md` (stack, architecture and kid-UX rules, privacy rules).

- **2026-09-27: M0 Scaffold.** Vite 8 + TypeScript 6 + React 19, ESLint, Prettier (Markdown excluded),
  Vitest 5, `vite-plugin-pwa` (SVG icon only so far), `.claude/launch.json`, and `.gitattributes` forcing LF
  line endings (the repo has `core.autocrlf=true`; Prettier expects LF). When editing files with Python on
  Windows, open them with `newline=''` or Python writes CRLF.

- **2026-09-27: M1 Core loop.**
  - `src/game/` (pure, tested): seeded RNG, config, World 1 generators (within 5, within 10, doubles,
    make-10 as `7 + _ = 10`, within 20, review mix), page generation without back-to-back repeats, the
    page-session reducer, and pass/star scoring.
  - `src/content/levels.ts`: levels 1–8 with obstacles and captions (level 8 is the rope-bridge boss).
  - The page: a 3-2-1 countdown, the hero walks per correct answer, sun timer, pad and keyboard,
    auto-submit, a second try, then the answer is revealed. The results screen has a text card standing
    in for the cut scene.
  - Decided: typing `0` for a two-digit answer waits for a second digit (auto-submit fires only at the
    answer's length); the ✓ key submits early.

- **2026-09-27: M2 Profiles, saving, map.**
  - `src/game/progress.ts` (pure, tested): strict in-order unlocks, best stars, plays/passes, current
    level, total stars.
  - `src/state/schema.ts`: versioned save (`SAVE_VERSION = 1`) with a `migrate()` that sanitizes damaged
    data and refuses saves from a newer app (`NewerSaveError`, shown as a "please update" screen, and never
    overwritten). `persistence.ts` uses IndexedDB (`idb-keyval`, db `long-way-home`) with ordered writes
    and asks for persistent storage. `store.ts` is zustand.
  - Screens: "Who's playing?" (up to 6 players, the last player highlighted, ✎ to edit), the player editor
    (name up to 12 characters, 8 named shirt colors, a new player defaults to an unused color, delete with
    a confirm step), and the trail map (8 stops on a winding path, locked/passed/current states, stars per
    stop, the hero at the current level, a boss label, a player chip to switch, total stars, world arrows
    ready for more worlds). If saving fails (e.g. private browsing), the map shows a small warning and play
    continues in memory. First launch with no players opens straight into "New player".
  - **Decided:** levels unlock strictly in order; a parent "unlock any level" switch is planned for
    Settings (M10).
  - Checked in the browser: create, rename and delete a player; separate progress per player; progress
    survives a reload; passing unlocks the next level; Next level and quit. No console errors. 42 tests.

- **2026-09-27: M3 Art system** (branch `m3-art-system`).
  - `src/art/hero/`: the `<Hero>` paper doll (SVG, facing right, big-head kid proportions) with arm/leg
    groups that rotate from their joints, poses in `hero.css` (idle with blink, walk, jump, climb, cheer
    with open mouth, one-shot stumble with frown), `facing` and `size` props. `AvatarConfig` (skin, hair
    style and color, shirt, pants, shoes); options live in `src/content/avatar.ts`.
  - **Decided:** `avatarForProfile()` maps a profile's `color` to the shirt until the builder (M8) stores
    a full avatar. `PlaceholderHero` is gone.
  - `src/art/worlds/`: `WorldBackdrop` draws sky, drifting clouds, far hills, a tree/bush line and near
    ground with flowers, plus an optional dirt path. Each layer is a doubled 1280px tile with its own
    parallax speed. Scenery is placed with the seeded RNG, so it is the same every time. Colors per world
    in `themes.ts` (only the meadow so far; other worlds fall back to it).
  - **Decided:** animation is CSS keyframes and transitions; the `motion` library isn't used (add it only if
    the M4 cut scenes need it).
  - Used on every screen: "Who's playing?", the editor (cheering preview), the trail map, the page strip
    (a step per correct answer, a stumble on a miss, a cheer at the end of a passed page) and results.
  - Dev art gallery at `#gallery` (dev builds only; confirmed absent from the production bundle).
  - Checked in the browser: every screen, pose switching during play, no console errors or warnings.

- **2026-09-28: Project review.** Adopted the shared tracking convention used across the family's
  projects: `docs/PLAN.md` is the forward plan with milestone status; `STATUS.md` is a short snapshot;
  this file is the session log (the M0–M3 detail moved here from STATUS.md). `CLAUDE.md` now ends with a
  before-ending-a-session checklist and a branch-per-milestone rule. The plan now records the unlock and
  animation decisions and schedules the known gaps: pause and a tablet preview deploy in M4, the ✕-exit
  rule before stats. Added GitHub Actions CI (lint, test, build) and tests for the avatar options and the
  seeded backdrops (48 tests).
