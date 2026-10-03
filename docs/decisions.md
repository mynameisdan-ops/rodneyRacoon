# Decisions and session log

A dated entry per session or milestone: what was built or decided, and why. Newest last. Keep each
entry under 10 lines, and when this file passes about 150 lines move the older entries to
`docs/archive/`. Earlier entries: `docs/archive/decisions-2026-09.md` (Sep 27–30, 2026: M0–M7).
The design is in `docs/PLAN.md`; the current snapshot is in `STATUS.md`.

- **2026-10-03: Restructured for cheaper sessions and easier expansion** (merged to `main`).
  - Docs: a shorter `CLAUDE.md` plus area guides (`src/**/CLAUDE.md`, loaded only when that folder
    is read) holding the recipes; PLAN and STATUS trimmed; the M0–M7 log archived; handled
    feedback cleared; `.claude/settings.json` blocks reading `package-lock.json`.
  - Code: one file per obstacle in a folder per world, a script file per world, a world art
    registry instead of switches, gear art per slot, a CSS file per screen (imported in cascade
    order), one-row level and shop tables, `npm run check`, dev `#demo/<screen>` links, and
    `content.test.ts`, which names whatever a new world or level is missing.
  - Nothing a player sees changed: 3,032 renders (every scene frame, backdrop, pose, item and
    screen) matched before and after, and the built CSS has the same rules. Dropped the unused
    meadow backdrop (an unknown world now draws World 1). The same day it was merged into the
    unmerged `m7b-cartoon-look`, re-splitting its repainted art the same way (renders matched).
