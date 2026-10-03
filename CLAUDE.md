# CLAUDE.md

A timed mental-math adventure for two kids (ages 6 and 9), inspired by *Rodney the Raccoon*. The
child's own avatar journeys home across 40 levels (5 worlds × 8). The child **only does math**:
each right answer moves the hero along the trail, and each passed page ends in an obstacle cut scene.

## Read only what the task needs

- `STATUS.md`: current state and next steps. Read it first.
- `docs/PLAN.md`: design and milestones. Read the section for the task, not the whole file.
- `docs/decisions.md`: the dated log. Append only; read its last entry, not the whole file.
  Older entries are in `docs/archive/` (grep it for the history of a decision).
- `docs/feedback.md`: play-test notes waiting to be handled.
- Area guides: `src/game/`, `src/content/`, `src/content/cutscenes/`, `src/art/`,
  `src/art/obstacles/`, `src/screens/` and `src/state/` each have a `CLAUDE.md` with that area's
  rules and step-by-step recipes (add a skill, level, world, obstacle, shop item, screen, save
  field). They load when you read files there; read one directly when planning work in an area.
- Skip `package-lock.json` (use `npm ls <pkg>`), `dist/` and `node_modules/`.

## Stack

Vite, TypeScript (strict), React 19, zustand, `idb-keyval` (IndexedDB saves with versioned
migrations), `vite-plugin-pwa`, Vitest. Art is SVG in React components; animation is CSS, and cut
scenes sample a pure timeline on a `requestAnimationFrame` clock. Hosted on GitHub Pages; runs as
an installed PWA on Windows (Edge/Chrome) and an Android tablet (Chrome), landscape only.

## Commands

```bash
npm install
npm run check      # lint + type-check + tests + build, quiet; run once before committing
npm run dev        # http://localhost:5173
npm test           # vitest once (npm run test:watch to watch)
npm run lint
npm run build      # type-check + production build
npm run preview    # serve the build (add -- --host for the tablet on the LAN)
npm run format     # prettier --write
```

Dev-only pages: `#demo/<screen>` opens any screen with made-up players in memory (list in
`src/screens/CLAUDE.md`); `#gallery` (or one section, e.g. `#gallery-gear`) shows all the art;
`#scene-12` scrubs a level's scene and `#scene-12-2600` shows one frame; `#strip` plays the page
strip by itself; `#moments-1-4` is the sticker contact sheet (details in `src/art/CLAUDE.md`).
(Keep this section in sync with `package.json`.)

## Code map

| Path | What |
| --- | --- |
| `src/App.tsx`, `src/main.tsx` | Screen router (a `Screen` union, no URL routing); entry and dev pages |
| `src/game/` | Pure logic: problems, adaptive difficulty, scoring, coins, shop, progress, `config.ts` |
| `src/content/` | Data: levels, skills, stickers, shop items; `cutscenes/` has a script file per world |
| `src/cutscenes/` | The pure timeline, `CutSceneView` and the scene clock |
| `src/art/` | Style kit, `<Hero>` (body, faces, cut-in) and gear, painted backdrops and their registry, chasers, fx |
| `src/art/obstacles/` | Obstacle art: a folder per world, one file per obstacle |
| `src/screens/`, `src/ui/` | Screens and shared UI, each with its own CSS file (order: `src/styles.css`) |
| `src/state/` | zustand store, save schema and migrations, IndexedDB |
| `src/dev/` | Dev-only helpers (`#demo`) |

## Rules that always apply

- `src/game/` is pure TypeScript (no React or DOM) with unit tests and a seeded RNG.
  `src/content/` is data only: writing or tuning content never needs a logic change.
- Every tunable gameplay number lives in `src/game/config.ts`.
- The look is a **Saturday-morning cartoon** (M7b): the hero and what he touches are lined and
  cel-shaded, backgrounds are painted (rules in `src/art/CLAUDE.md`). **No CSS or SVG `filter`**
  (slow on tablets). One `<Hero>` renders the avatar everywhere.
- The design canvas is 1280×800 (16:10), scaled to fit: lay out in design units.
- Audio is synthesized with Web Audio (no audio files unless we decide otherwise).

**Kid UX**
- Touch targets are **at least 72px**. The number pad is the main input; a keyboard works too.
- Gameplay never depends on reading: captions are short and the visuals carry the story.
- Always encouraging: no "wrong!" or "game over". A failed page is a gentle knock-back and a retry.
- Answers are checked on Enter / ✓; a per-profile switch turns on auto-submit (checked once the
  digit count matches the answer). Never hint at the answer's length (e.g. by lighting up ✓).
- Respond to input in under 100ms, with no layout shift while answering. The problem text is very
  large and high-contrast.

**Privacy (hard requirements)**
- No runtime network calls, analytics or trackers. The app works fully offline once installed.
- The app has no photo feature: avatars are drawn from photos the parent shares (M8). Never
  commit, store or log those photos, and keep the children's names out of the repo (presets are
  unnamed). Never commit real photos of the children.

## Working conventions

- Work milestone by milestone (PLAN §9), each ending in something playable, on a branch per
  milestone (`mN-short-name`) that is pushed as it goes and merged to `main` after a browser check
  at 1280×800 and a phone or tablet size. CI runs lint, tests and build on every push.
- One session at a time: check `git status` first and ask before building on uncommitted work.
  Also check `git branch -r --no-merged main`: work that touches the same files belongs on an
  unmerged milestone branch, or must wait for it.
- Gotchas: a hidden browser pane barely runs `requestAnimationFrame` (pages auto-pause, scenes
  crawl): screenshot `#scene-N-ms` or `#gallery-<section>` frames with headless Chrome instead.
  The dev server sometimes misses edits made by tools: `touch` the file. On Windows, long Bash
  heredocs fail (run a script file instead), and Python must open files with `encoding='utf-8'`
  and `newline=''` (the files contain −, × and ÷; CRLF otherwise).

## Before ending a session

Run `/wrapup` (it follows this list), or by hand:

1. `npm run check`.
2. Append a dated entry to `docs/decisions.md`: what was built or decided, and why, in under 10
   lines. Past about 150 lines, move older entries to `docs/archive/`.
3. Update `STATUS.md` (state, next steps, what's open, date), keeping it short.
4. Update `docs/PLAN.md` if a design decision changed or a milestone moved (status column too).
5. Update this file or an area guide if the stack, commands, rules or structure changed.
6. Commit to the milestone branch and push.
7. If the session was started from the project status page, mark its step as its prompt says.
