# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A timed mental-math adventure game for kids (ages 6 and 9), inspired by the classic
*Rodney the Raccoon* math game. A little boy (the child's own avatar) journeys home
across 40 levels (5 worlds × 8). The child **only does math**. The game shows the hero
moving along the trail as answers come in, and plays an obstacle cut scene after each page.

The full design and milestones are in [docs/PLAN.md](docs/PLAN.md). Read it before starting a milestone,
and update it when a design decision changes. The tracking files:

| File | Holds |
| --- | --- |
| `docs/PLAN.md` | Design, milestones with status, scheduled gaps, open questions |
| `STATUS.md` | A short snapshot: current state, next steps, what's open |
| `docs/decisions.md` | A dated entry per session or milestone: what was built, decided and why |

## Stack

- Vite + TypeScript (strict) + React
- SVG art as React components; animation with CSS keyframes and transitions; cut scenes run on a
  `requestAnimationFrame` clock sampling a pure timeline (no animation library)
- zustand for state; IndexedDB via `idb-keyval` for saves (versioned schema with migrations)
- `vite-plugin-pwa` for offline/installable; hosted on GitHub Pages
- Vitest for unit tests
- Targets: Windows (Edge/Chrome, installed PWA) and Android tablet (Chrome, installed PWA). Landscape only.

## Commands

```bash
npm install
npm run dev        # dev server
npm run build      # type-check + production build
npm run preview    # serve the production build
npm test           # vitest (once)
npm run test:watch # vitest in watch mode
npm run lint
npm run format     # prettier --write
```

In a dev build, open `http://localhost:5173/#gallery` for the art gallery (every hero pose,
hair style and skin tone, plus every cut scene with a scrub slider to inspect any moment and a
Play button). Use it to check art changes; it is left out of production builds.

(Keep this list in sync with `package.json`.)

## Architecture rules

- `src/game/` is **pure TypeScript with no React or DOM**: problem generation, levels, adaptive
  difficulty, scoring. Everything here gets unit tests. Use a seeded RNG so tests are deterministic.
- `src/content/` is **data only** (levels, obstacles, captions, shop items, stickers). Tuning or
  writing content should never require touching game logic.
- `src/game/config.ts` holds every tunable number (timer, pass threshold, star rules, coin
  amounts, combo steps). Don't hard-code these elsewhere.
- Cut scenes are **scripts (data)** in `src/content/cutscenes.ts`, compiled by the pure
  `src/cutscenes/timeline.ts` and drawn by one `CutSceneView`, using reusable obstacle art from
  `src/art/obstacles/` (registered in `registry.ts`). Don't write one-off animation code for each
  level; obstacle motion is computed from scene time, not CSS, so any frame can be drawn exactly.
- Art uses the style kit in `src/art/style.ts`: the `INK` outline on every object, and shading as flat overlay
  shapes made with `shade()` / `tint()`. **No CSS or SVG `filter`** (slow on tablets). A theme's `kind` picks the
  backdrop layers (`outdoor`, or `mine` in `src/art/worlds/mine.tsx`).
- Obstacle art gets the scene's whole prop schedule (`events`); use `eventTime()` to time a motion to a later
  event. Shared positions go in a layout module (e.g. `mineLayout.ts`) so art and scripts agree.
- One `<Hero>` component renders the avatar everywhere (map, page strip, cut scenes, shop),
  driven by the avatar config and a `pose` prop.
- The design canvas is 1280×800 (16:10), scaled to fit the screen. Lay out in design units, not raw viewport pixels.
- Audio is synthesized with Web Audio (no audio asset files unless we decide otherwise).

## Kid-UX rules (always apply)

- Touch targets are **at least 72px**; the number pad is the main input and physical keyboard input is also supported.
- Gameplay must never depend on reading ability. Captions are short and visuals carry the story.
- Always encouraging: no "wrong!" or "game over" language. Failing a page means a gentle knock-back and a retry.
- Answers are checked on Enter / ✓ by default. A per-profile switch turns on auto-submit (checked as soon as
  the typed digit count matches the answer length). Never hint at the answer's length (e.g. by lighting up ✓).
- Respond instantly to input (under 100ms feedback). No layout shift while answering.
- Keep the problem text very large and high-contrast.

## Privacy rules (hard requirements)

- **No runtime network calls, analytics, or third-party trackers.** The app must work fully offline once installed.
- Avatar photos are stored **only** in local IndexedDB, downscaled to 256px. Never upload or log them.
- Never commit real photos of the children to the repo.

## Working conventions

- Work milestone by milestone (see PLAN.md §9). Each milestone ends with something playable.
- Verify UI changes in the browser preview at 1280×800 and a phone/tablet size before calling them done.
- New problem generators need tests covering operand ranges, answer correctness, and no negative/non-integer results where they're not allowed.
- Save-format changes need a version bump and migration in `src/state/`.
- One branch per milestone (`mN-short-name`), pushed as it goes and merged to `main` after the browser check.
  CI (`.github/workflows/ci.yml`) runs lint, tests and build on every push.
- Only one session works in this repo at a time. Before starting, check `git status` for someone else's
  uncommitted work and ask before building on it.
- When editing files with Python on Windows, open them with `newline=''`, or Python writes CRLF.

## Before ending a session

Run `/wrapup` to do all of this (the skill follows this checklist); or work through it by hand:

1. Add a dated entry to `docs/decisions.md` (what was built or decided, and why).
2. Update `STATUS.md` (state, next steps, what's open, date). Keep it short; history goes in decisions.md.
3. Update `docs/PLAN.md` if a design decision changed or a milestone moved (its status column too).
4. Update this file if the stack, commands, rules or architecture changed.
5. Run `npm run lint`, `npm test` and `npm run build`.
6. Commit to the milestone branch and push.
7. If the session was started from the project status page, mark its step as its prompt says.
