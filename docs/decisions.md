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

- **2026-09-28: M4 Cut scenes and pause** (branch `m4-cut-scenes`).
  - `src/cutscenes/timeline.ts` (pure, tested): scripts of blocking steps (`walk`, `move`, `jump` with an
    arc, `hold`) and instant ones (`prop`, `caption`, `face`) compile to a timeline; `sampleTimeline(t)`
    gives the hero's x, lift, the surface under him (for the shadow), pose, facing, prop state and caption.
    The camera follows the hero (`cameraFor`) in scenes wider than 1280px.
  - `src/art/obstacles/`: 8 World 1 obstacles drawn around an anchor on the ground line, each with a back
    layer and optionally a front one (grass in front of his legs, the near bridge rope): tall grass that
    parts, a muddy puddle with a splash, a fence stile, bees that drift after him, stepping logs in a
    stream, a windy hill with a path over it, a sleeping bull that peeks, and a rope bridge whose deck sags
    under his feet over a gorge. Motion is computed from scene time (not CSS), so any frame is exact.
  - `src/content/cutscenes.ts`: the 8 scenes as data; the boss scene is 2300px wide and ends at a signpost
    to the Whispering Forest. Tests check every level has a scene of 4–14s, that he ends past the obstacle,
    on the ground and on screen, that the camera stays inside the backdrop tile, and that every obstacle
    renders in every state without NaNs.
  - **Decided:** after a pass the flow is results (stars) → Continue → cut scene → Map / Next level, with a
    Skip button rather than tap-to-skip (so a 6-year-old can't skip by accident). Captions sit at the top.
    No animation library: a `requestAnimationFrame` clock with frame gaps capped at 100ms, so a
    backgrounded app resumes where it left off. The level 6 caption became "Whoosh! What a wind!" (he has
    no hat).
  - The page strip previews the level's obstacle at the end of the trail instead of a flag.
  - **Pause:** a ⏸ button; the page also pauses itself when the app is backgrounded or the tablet turns to
    portrait. The problem is hidden and the pad locked while paused; only Continue resumes (not while still
    hidden or in portrait). Paused time counts neither against the minute nor toward the problem's answer
    time (a `pausedFor` action in the session reducer).
  - **Fixed:** the stage could end up scaled to 0 if the window had no size when the app started (a
    background tab, possibly an app launch); it now measures its container with a `ResizeObserver`.
  - Dev gallery: every scene with a scrub slider and Play.
  - Checked in the browser: scenes frame by frame (after fixing a shadow that rose with the hero, a hill
    that blended into the field, and a caption covering the ravine), the full flow page → results → scene →
    next level, and pause (button, background, resume). No console errors. 74 tests.
  - Not done: the tablet check. The repo is private, so GitHub Pages needs a paid plan or a public repo.

- **2026-09-28: Playtest feedback → Enter to submit, M4b planned.** Feedback in `docs/feedback.txt`: answers
  shouldn't be taken from the first thing typed; obstacles should be epic; the art should engage a 9-year-old
  ("between Math Pirates and Zelda", not ABC Mouse).
  - Built on `m4-cut-scenes`: `createSession(..., { autoSubmit })`, default off, so answers wait for Enter
    / ✓. `Profile.autoSubmit` with `SAVE_VERSION = 2` (v1 saves load with Enter). An "Answers: Press to
    check / Automatic" choice in the player editor, which moves to Settings in M10. The ✓ key never lights
    up when the digit count matches, because that would give away the answer's length.
  - Decided: a per-profile switch rather than removing auto-submit (the 6-year-old may prefer it). The art
    stays code-drawn SVG, restyled cel-shaded, with no `filter`, for tablet performance. The hero becomes a
    young adventurer. New milestone M4b (art direction + epic World 1) comes before M5, so the 32 new scenes
    are made once in the new style. M4b starts with a style test for approval.
  - To check in play: with Enter, 60s may be tight for the later World 1 levels; tune the counts in
    `levels.ts` if so.

- **2026-09-28: M4b style test.** World 1 became the **Old Mine Shaft** (the user's new level plan in PLAN §3:
  cart race, cart jump, wall smash, rat swarm, and a mine-train escape over the canyon as the boss). Built the
  style test on `m4b-art-direction` for approval:
  - `src/art/style.ts`: ink outline, `mix`/`shade`/`tint`. Shading is done with overlay shapes; there are no
    filters anywhere now (the old `brightness` filter on the back limbs is gone, which was a tablet suspect).
  - The hero is redrawn as a young adventurer (tunic, cape, belt, satchel, bracers, boots) at about 4 heads
    tall, with elbows and knees. Poses: run, leap, brace, ride, slide, swing, fall, alongside the old ones.
    The feet stay at (52, 163) in the 100×170 view, so every screen that places him still works.
  - Themes are `outdoor` | `mine`. The mine layers are a rock ceiling with stalactites, a hazy far cavern
    with lanterns, timber frames with hanging lanterns and glowing crystals, and a rocky floor with rails.
    Glows are stacked translucent circles, not blur. Backdrop tiles overlap by 1px to hide the seam.
  - Timeline: `run`, `move` with `ease` (chained in/linear/out moves keep a steady speed), `jump` with a
    pose, and `shake`, which the view applies as a transform. Props get the whole event schedule
    (`eventTime`), so the boulder can be exactly over the pit when 'drop' fires.
  - Level 1 "Cart race!": rumble, then the boulder crashes down, he braces, jumps in the cart and races with
    the boulder rolling 300px behind. It smashes the trestle and drops into the pit, then the cart hits the
    buffer and flings him into a leap and a cheer (7.4s).
  - Not yet: levels 2–8 still use the meadow obstacles on the mine backdrop, UI chrome and font (B5), and
    `zoom`/`fx`/`slowmo` steps (props draw their own effects so far). The page timer is still the sun,
    which reads as a lantern glow in the mine.
  - New feedback arrived in `docs/feedback.txt` (a parent menu for starting difficulty and detailed
    settings). Not acted on yet; it fits M6/M10.

- **2026-09-28: M4b rolled out to World 1, then M6 adaptive difficulty.**
  - **M4b** (`m4b-art-direction`): scenes for levels 2–8 built per PLAN §3. Cart jump (a ramp
    and the gap), wall smash (an ore cart through a cave-in), rat swarm (a chain swing), crystal
    cavern (sinking spires), bat storm (a slide under a beam), runaway lift (the rope snaps, he climbs
    the chain) and the boss mine train (a rockfall chases it out of the mine; it jumps the canyon).
    The meadow obstacle art is removed. Props get `heroAt(t)`, which the rockfall and the falling lift
    use. The cut-scene test draws every frame of every scene. UI chrome: ink-outlined buttons, keys
    and chips, parchment behind the problem, a wooden pad, Lilita One (bundled via @fontsource and
    precached, so it works offline) for titles and buttons but not the problem digits (tabular, no
    layout shift), and a lantern-style timer in the mine.
  - `docs/feedback.md` (it replaced feedback.txt) asked for a clearer face with a nose. Added a
    nose, bigger eyes and upper lids. (The earlier parent-menu note was removed from the file; the
    age setting and M10 Settings cover part of it.)
  - **M6** (`m6-adaptive-difficulty`, branched from M4b): `game/adaptive.ts` holds ratings per skill,
    `planPage` (count and difficulty from the level's range and band, plus up to 30% weak facts), the
    rating steps (3★ +0.15, pass +0.06, fail −0.12), and weak facts (a miss or second try logs one;
    3 right-and-quick answers in a row retire it; at most 30 kept). Problems now carry their
    `skill`, so review pages can bring back facts from their sub-skills. Levels got
    `problems: [min, max]` and `band`.
  - Age: the parent picks 5–10+ in the player editor. The start rating is 0.5 at the skill's typical
    age, ±0.25 a year. Changing the age resets the ratings. Save format v3 adds `age`, `ratings`
    and `weakFacts`; older saves load with no age (age 7 is used).
  - Decided: ✕ still records nothing, so quitting doesn't lower a rating. Seeing the ratings,
    pinning them and turning adapting off wait for the Settings screen in M10.

- **2026-09-28: Merged M4, M4b and M6 into `main`.** The user asked to merge so they can play the
  current game. Each branch was merged in order with `--no-ff` (m4-cut-scenes, m4b-art-direction,
  m6-adaptive-difficulty); the branches were stacked, so there were no conflicts. `main` now matches
  `m6-adaptive-difficulty`. Lint, 121 tests and the build pass on `main`. The tablet check that was
  meant to close M4 hasn't happened; it's now scheduled before M5 in PLAN's known gaps.
