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

- **2026-09-30: Tablet report and feedback** (`fb-older-kids-chaser`). The tablet play-through went
  fine with no bugs, so no stutter fixes were needed. From `docs/feedback.md`:
  - *Slightly harder for older kids.* A 9-year-old was already at the top rating for every World 1
    skill, so ratings alone couldn't go higher. New `olderReach` in `game/adaptive.ts`: for each year
    a player is older than a skill's typical age, the level's band top rises 0.1 (at most 0.3) and
    the page gets 1 more problem (at most 3). It scales with the rating, so a struggling older
    child still starts from the level's easy end. Numbers in `CONFIG.adaptive.olderReach`.
  - *A danger he escapes from on the page.* A chaser runs behind the hero on the page strip, one
    per world (boulder, bee swarm, flood wave, snowball, dust devil; `art/chasers.tsx`). It moves
    at 85% of the pace that finishes the page right at time's up, so a child on pace pulls away and
    a slow one sees it close in, but it never gets closer than 55px to his heels (`ui/trailLayout.ts`,
    tested). After a passed page it falls back and fades. Motion is CSS only. The trail now starts
    at x = 190 so the chaser is on screen from the start, and the timer sun starts to the right of him.

- **2026-09-30: M5, Worlds 2–5** (`m5-worlds`, not merged yet).
  - **Skills and generators** (`game/problems.ts`): 15 new base skills (− within 10 and 20, missing
    addend, ± whole tens, 2-digit + and − with and without regrouping, × 0/1/2/10, × 5, × 3/4, × 6–9,
    ÷ by 1/2/5/10, ÷ 3/4, ÷ 6–9) and 7 mixes. `MIXES` replaces the one hard-coded review: each mix
    lists the base skills it draws from, and facts keep their own skill, so a missed fact comes back
    on its own level and on every mix that includes it. Tests cover operand ranges, correct answers,
    no negatives or remainders, carrying/borrowing always (or never) happening, and difficulty moving
    the ranges. Times facts come in both orders (3 × 7 and 7 × 3); × 0 and × 8/9 join only at higher
    difficulty. Every answer is at most 100.
  - **Levels 9–40** (`content/levels.ts`) with problem ranges (fewer problems for 2-digit mental
    math, 8–13, than for table facts, 10–18) and bands; two levels on one skill split the band.
    Skill ages in `content/skills.ts` run from 6 to 10. Loading a save now accepts −, × and ÷ facts
    and checks that they hold; no save-format change was needed (new skill ids only widen what loads).
  - **Backdrops**: forest (canopy, light shafts, misty tree rows, big trunks, fireflies), river (hills
    with a far waterfall, the river behind the bank), mountains (snowy peaks, pines, snowfield) and
    canyon (low sun, mesas, striped cliffs, cacti). Shared helpers in `art/worlds/sceneryKit.ts`
    (seamless ridges, spots) and `scenery.tsx` (clouds, ground, path, stones).
  - **32 cut scenes**, each with a threat, an escalation, a hero action and a triumph (PLAN §3 lists
    them). Layouts per world (`forestLayout.ts` … `canyonLayout.ts`) keep art and scripts in step;
    motion helpers in `obstacles/sceneKit.ts`. Things that must meet (the log under his feet, the
    tumbleweed under the top of his jump, the train's flatcar when he lands) are computed from
    `heroAt()` and the prop schedule rather than tuned by hand. Every scene passes the existing test
    (4–14s, a caption, he ends past the obstacle, on something solid, on screen; every frame draws
    with no NaN). Each was checked frame by frame in headless Chrome.
  - Found in checking: only ~160px of a scene shows below the ground line, so pits and gorges stay
    shallow and the action happens at or above the ground. The train is drawn behind him (it had
    looked like it ran through him). Page-strip previews showed empty ground because each scene's
    key object sits away from its anchor; obstacles now have a `focus` and the preview is clipped
    to the end of the trail.
  - Also: the answer box has a fixed two-digit width (it used to grow as digits were typed, a small
    layout shift and a hint at the length); a third digit shrinks the text instead. Problems showing
    4+ digits use 104px type so `100 ÷ 10` fits. The last scene ends with "You made it home!".
  - **To check in play:** whether 8–13 two-digit problems a minute is right for the 9-year-old;
    how the busier scenes run on the tablet.

- **2026-09-30: M5 merged; world overview and the unlock switch (feedback).**
  - Merged `m5-worlds` into `main` at the user's request (lint, 302 tests and build passed).
  - Feedback: "at the end of World 1 there was no way on; return to an overview map." (Played before
    M5, when World 2 didn't exist.) New `WorldsMap` screen: the five worlds as cards (a scaled-down
    backdrop, number badge, name, stars) on a paper map with a trail ending at the family's house.
    Locked worlds are greyed with a lock; a finished world's badge turns green. After a boss scene
    the button reads "Next world ▶" and opens the overview, where the hero walks from the old world
    to the new one (a CSS transition started by a timer, since requestAnimationFrame stops in a
    hidden window); tapping a world opens its trail map. The trail map has a folded-map button to
    open the overview any time, and the scene's "Map" button opens the world just played.
  - Feedback: "unlock levels in settings." Pulled forward from M10 as a per-player switch in the
    player editor ("Levels: 🔒 one by one / 🔓 all open"), since that editor is where the parent
    settings live until the Settings screen. Save format v4 adds `unlockAll` (off for old saves);
    `isUnlocked()` takes it. The color swatches went to one row so the editor still fits 800px.
  - Checked in the browser at 1280×800 and 915×412: the editor fits; all-open unlocks every stop and
    world; a real play of level 8 → "Old Mine Shaft complete!" → "Next world ▶" → the hero walks to
    World 2 → its trail map with level 9 current.

- **2026-09-30: M7, rewards** (`m7-rewards`, merged to `main` the same day at the user's request).
  - **Coins** (`game/rewards.ts`, `CONFIG.coins`, tested): +1 per right answer, combo bursts at 5,
    10, 15 right first try in a row (+2, +3, +5; the streak rule matches the page's combo counter),
    and on a pass +1 per 5 s left, +10 first pass (+25 boss), +5 per new star. Decided: a page that
    needs a retry still pays for its right answers (always encouraging), and replays pay too
    (replaying is practice, which is the point). A great first page pays about 50; the shop's
    21 items total about 2,800, so a child buys something after the first level or two and the
    last pets and the crown take real play. `PageEvaluation` now carries `secondsLeft`.
  - **Save format v5**: `coins`, `owned` and `gear` per player (old saves start at 0 and nothing).
    Loading drops unknown items and gear that isn't owned or is in the wrong slot.
  - **Shop** (`content/shop.ts` data, `game/shop.ts` buy/wear logic, `ShopScreen`): hats, capes,
    packs and pets drawn as `<Hero>` layers in `art/hero/gear.tsx`, and alone as `ItemIcon` (each
    slot has a viewBox around where it sits on the hero). Shop capes use a longer shape than the
    default cape, which hardly showed from the side. Pets stand just ahead of the hero (behind him
    the page's chaser would run into them) and hop when he walks; `pet={false}` in cut scenes.
    Tapping an item tries it on (a little hop), one more tap buys it and puts it on; "Need N more"
    when short. Try-on uses the idle pose: the cheer pose's arm covered the face.
  - **Sticker book**: stickers are stills of each level's cut scene with the player's own hero,
    cropped around him (`ui/Sticker.tsx`), so 40 stickers needed no new art and change with his
    gear. Each moment was picked from a contact sheet (`#moments-1-4`, a dev page) screenshotted
    with headless Chrome. The book shows a world per page with its count, empty slots show the
    level number, and a sticker opens large on tap.
  - **Results screen**: a tally of coin rows with icons that pop in, a counting total, and the
    new sticker on a first pass. **Map**: a dock at the bottom right opens the sticker book and
    the shop (with the coin count). **Page**: the combo badge turns into a gold burst with the
    bonus at 5, 10, 15.
  - Checked in the browser at 1280×800 and 915×412: a real page of level 9 paid 54 (14 + 5 + 10 +
    10 + 15, as the tally showed), bursts at 5 and 10, the new sticker; buying and wearing in the
    shop, a pet on the map and the page strip, the book and the large view.

- **2026-10-02: Direction change, and the M7b style test** (`m7b-cartoon-look`, not merged).
  - Reviewed the state (M0–M7 merged, nothing new in feedback, not deployed yet) with the user, who
    changed the plan: before M8, a graphics pass so the game looks and moves like a Saturday-morning
    cartoon (Pokémon is the reference); and M8 becomes avatars drawn from photos the user provides,
    replacing the in-app builder with a camera crop. The photos are never committed or stored.
  - **Style test** (dev page `#style`; `#style-scene-kid` for the scene), built apart from the game so
    nothing changes until a direction is approved:
    - A new hero (`art/toon/ToonHero.tsx`) in a **three-quarter view**: big anime eyes (iris,
      two highlights, a thick upper lid whose slant carries the mood), bold silhouette lines and
      thin inner ones, one crisp shadow per part, a rim light, hair in big locks with a shine band
      and a shadow cast on the forehead. Two builds to choose from: `kid` (big head, ~3.3 heads
      tall) and `lean` (~4.3 heads). Six expressions (`art/hero/expressions.ts`), each pose with
      its own default. It keeps `Hero`'s joints and class names, so every pose in hero.css works.
    - Found: in a three-quarter view the near arm hangs on the *left* of his body, so raised arms
      that swing forward cross his face. The near limbs moved left, and the raised-arm poses got
      their own angles (`toonHero.css`) that lift the arm beside his head.
    - Scenes size him by **reach** (hands 175px above his feet in the swing pose, what every
      vine, rope and ledge is laid out for): the kid build draws at ~212px, the lean at ~192px.
    - A **painted forest** (`art/toon/paintedForest.tsx`, `WorldBackdrop painted`): gradient sky,
      sun glow and light shafts through the canopy, tree rows fading into fog, trunks without ink
      lines but with a rim light and moss, dappled light on the floor. Only the hero and the props
      he touches keep ink lines, as in anime. Level 12's gully and water were repainted too.
    - **Cartoon beats in the timeline** (pure, tested in `cartoonBeats.test.ts`): an `expr` field on
      blocking steps; `impact`, `action` (focus lines) and `emote` ("!", sweat, sparkle) steps; and
      squash and stretch computed from the timeline (a crouch before a jump, a stretch with
      vertical speed, a springy squash on landing). The test scene also pushes the camera in on
      the big moment and draws speed lines behind him when he moves fast.
    - **Performance** (headless Chrome, the 5.5 s vine scene, CPU throttled 5×): now ~14 ms a frame;
      the new look ~19 ms (1,580 SVG elements vs 930); with each backdrop layer drawn once as an
      image (`WorldBackdrop raster`) and the scene on its own compositor layer, ~16 ms. So the
      painted look should ship rasterized; the tablet check decides.
  - Waiting on the user: kid or lean, and whether the direction is right, before Phase B.

- **2026-10-02 (later): Lean, and directing the scenes** (`m7b-cartoon-look`, not merged).
  - The user picked the **lean** build and asked for the art to go further, starting with more
    dynamic animation. What made the motion stiff: poses snapped, his body stayed upright, his cape
    and hair ignored his speed, the camera only slid and shook, and the timing never changed.
  - **Direction steps in the timeline** (pure, tested): `camera` (zoom and Dutch tilt, eased with a
    small overshoot; a big zoom frames his face), `cutin` (the anime close-up panel), `slow` (slow
    motion) and `freeze` (hit-stop). Slow motion and freezes are a time warp: the clock runs real
    time to `realDuration` and `scriptTime()` maps it to scene time, so props and moves still count
    in scene ms. The frame also reports `lean` (into a run, along a jump's arc, with a swing),
    `crouch` (the wind-up before a jump) and `landing` (time since he touched down).
  - **Hero:** a crouch pose (knees bent, arms back), pose changes that blend over ~110 ms instead
    of snapping, and `wind` that swings his cape back and streams locks of hair. The head takes a
    line weight, so the close-up keeps thin lines.
  - **The view:** he tilts with `lean` (around his hands while hanging, so they stay on the vine);
    a motion arc behind leaps and swings and afterimages when he really flies; dust on landing and
    under a run; a foreground layer of big dark leaves that slides past faster than the ground.
  - **Cut-in** (`art/toon/CutIn.tsx`): a slanted panel slams across with his face over a burst of
    light and focus lines, a light sweep, and whips away. No words, so it works for non-readers.
  - **The directed vine swing** (`#style-scene-dynamic`): the flood hits, the frame freezes on the
    burst, the camera snaps to his surprised face, the cut-in, a crouch and a leap under a tilted
    camera, the swing slows at the bottom of its arc, and the landing freezes with dust and sparkles.
    Found in checking: a freeze must start a few frames after its impact, or it holds an empty burst.
  - **Performance** (5× CPU throttle, warm runs): now ~14 ms a frame, v1 ~17 ms, directed ~18 ms.

- **2026-10-02 (evening): Smears, a livelier page strip, detailed backgrounds** (`m7b-cartoon-look`).
  - Asked for by the user after the directed scene.
  - **Smear frames** (`Smear` in `toonFx.tsx`, `smearBands` in `toonBuilds.ts`): on his fastest
    moves (leaps and swings past ~0.42 px/ms, anything past ~0.85) he stretches along his motion
    and streaks of his own colors (cape, one wide tunic streak, pants and hair through it) tear off
    toward where he was 60 ms before, ending in ragged tips. First try used a streak per body
    part, and the thin boot and pants streaks read as sticks under him. The vine scene's two leaps
    got quicker so they smear.
  - **Livelier page strip** (`ui/ToonTrailStrip.tsx`, motion in the pure, tested
    `ui/stripMotion.ts`): a right answer is a 50 ms crouch, a 340 ms dash that overshoots a touch
    (dust, speed lines, a smear, lean, cape streaming) and a springy landing with sparkles and a
    smile; a wrong one a stumble, a sweat drop and a 300 ms shake of the strip; 5, 10 and 15 in a
    row slam in a strip-sized cut-in of his shouting face. His face watches the danger (worried
    within 170 px). Dev builds play pages with it at `?toon`; `#style-page` loops a page of
    answers by itself over today's strip. Feedback starts on the frame of the answer (the crouch).
  - **Detailed backgrounds** (`art/toon/paintKit.tsx`, a kit for every painted world): leaf
    clusters with single leaves around their edges and lit tops, grass clumps, fern fronds, mossy
    rocks, flowers, leaf litter, mushroom groups, ivy and bark grooves. The forest now has two rows
    of canopy, vines with leaves, lit crowns in the fog rows, roots, knots, ivy, bushes, ferns and
    a fallen log, and a floor of grass, flowers, litter, path ruts and stones. A foreground of big
    dark leaves slides past in scenes only (`WorldBackdrop foreground`; on the strip it hid the
    trail).
  - **Performance:** the painted layers are images, so the detail costs nothing per frame (hiding
    them saved ~1.5 ms). The cost was React redrawing the hero every frame as `wind` changed: the
    hero is now memoized (avatar compared by its looks) and wind kept in tenths. At 5× CPU
    throttle in the dev build: today's scene ~10.3 ms a frame, the directed one ~14.5 ms (it was
    ~17.5); the slow frames are the afterimages and the cut-in. Production React will be faster;
    the tablet decides.

- **2026-10-02 (night): M7b Phase B, the cartoon look made real** (`m7b-cartoon-look`).
  - The user approved the look ("make it real, start phase B"). The style test's pieces replaced
    the game's own, in place; `src/art/toon/` and the `#style` pages are gone.
  - **The hero** (`art/hero/Hero.tsx`): the lean three-quarter-view hero is now `Hero`
    everywhere (map, page strip, scenes, results, shop, profile cards, stickers), memoized, with
    `expression` and `wind` props and the new `crouch` pose. The `kid` build was dropped: gear is
    fitted to one body (`art/hero/body.ts`: `BODY`, `SCENE_SIZE`, `capeColor`, `smearBands`).
    `hero.css` took the cartoon pose angles (raised near arms go up or back, beside his head),
    the crouch, the 110 ms pose blending, and lost the old mouth overrides (faces are
    expressions now).
  - **Gear redrawn** (`art/hero/gear.tsx`): hats are drawn in the head's own units and ride
    inside `Head`, so they turn with it and show in the cut-in close-up; hair above a hat's band
    is clipped (`HAT_LINE` in `gearLayout.ts`), so spikes don't poke through a helmet (the crown
    sits on top of the hair instead). Capes fit the new shoulders (shop capes longer, with a
    scalloped hem); packs sit on his back past the tunic's left edge (the map tube sticks up
    behind his shoulder); pets got bolder lines and shiny two-highlight eyes. Each shop icon is
    framed around its own drawing (`iconView`).
  - **Scenes:** the directed view is `CutSceneView` (signposts restored). `CutSceneScreen` runs
    its clock in real time and maps it to scene time (`scriptTime`), so slow motion and freezes
    play; the gallery scrubber scrubs real time. Level 12 plays the directed vine swing; the
    other 39 scripts get their beats world by world (Phase C). Smears, afterimages and the motion
    arc are only for moves he makes himself (in the air, or a hard sprint for the smear): on
    carts, rafts, sleds and trains they looked like a ghost riding along.
  - **Page strip:** the lively strip is `TrailStrip` on every page (the `?toon` flag is gone);
    `#strip` plays a page of answers by itself.
  - **Backdrops:** the painted forest is the forest (`worlds/forest.tsx`, `paintKit.tsx`), drawn
    as images in scenes and on the strip (`raster`); the maps draw it as shapes. The other four
    worlds keep their flat layers (rasterized too) until Phase C. The painted vine swing is the
    real one (`obstacles/vineSwing.tsx`).
  - **Dev pages:** `#scene-12` opens a level's scene in the scrubber and `#scene-12-2600` shows
    one frame at 2.6 s of real time; `#gallery-gear` (or `poses`, `icons`, `gear-poses`, `hair`,
    `stickers`, `scenes`) shows one gallery section, small enough to screenshot.
  - **Checked:** every pose and all 21 items in the gallery, every level's sticker moments
    (level 12's moved to 0.6, mid-swing, as 0.5 now lands on the cut-in), a real page of level 12
    (the combo cut-in at 5), results, the shop at 1280×800 and 915×412.
  - **Performance** (headless Chrome, dev build, 5× CPU throttle): level 12 plays at ~15.7 ms a
    frame once running (the style test measured ~15 ms the same way), level 1 ~11 ms. New: a
    scene's first frames draw the backdrop into images, one ~430 ms frame under throttle (the
    clock caps a frame at 100 ms, so it pauses rather than skips). Worth warming the images
    during the results screen if the tablet shows it (Phase E).

- **2026-10-02 (late night): M7b Phase C, World 1 painted and directed** (`m7b-cartoon-look`).
  - **The painted mine** (`worlds/mine.tsx`, colors in `minePalette.ts`, drawn as images in
    scenes and on the strip like the forest): a deep cavern glowing amber far away (rows of
    stalagmite clusters, mounds and stepped mesas fading into a warm haze, a far rock arch, a
    winding tower, a trestle with lanterns, far crystal glows); a rock ceiling whose undersides
    catch the lantern light, stalactites with drips, and a crack letting a shaft of daylight in
    with roots hanging from it; timber sets with knee braces and wedges, hanging lanterns in
    pools of warm light; glowing crystal clusters, barrels, crates, a pickaxe and a shovel, ore
    heaps with gold, glowing mushrooms; a gravel floor with pebbles, puddles, nuggets and crystal
    sprouts; painted rails; and a front layer of dark rocks with a glinting crystal. The paint
    kit gained `Pebbles`, `Glint` and moss-less `MossRock`. Warm and inviting rather than a
    dark hole (the first screen, "Who's playing?", shows it too).
  - **Obstacles repainted** (`mineParts`, `mineCarts`, `mineCaverns`): what he touches is lined
    like him (bold silhouette, thin inner lines, one crisp shadow shape and a rim light, lit
    from the upper right; the weights are `PROP_OUT`/`PROP_IN` in `style.ts`): the cart, a lumpy
    boulder (its cracks turn as it rolls while its shadow and shine stay put), the buffer, the
    ore cart, cute rats and bats with big shiny eyes, crystal spires, the lift cage, rope and
    chain, the little engine. The ground around them is painted: pits fading to black with a
    near lip shaded like the floor, the trestles, ramps, cave-in mass, rat hole, crack, the
    lift's upper ledge (natural rock), roof beams, and level 8's daylight canyon. The page-strip
    boulder matches (pebbles hop ahead of it).
  - **Directed scripts** for levels 1–8 (`content/cutscenes.ts`): every threat lands with an
    impact and a hit-stop, the camera snaps to his face, a cut-in shows him deciding (1, 2, 3,
    7, 8), the big move plays in slow motion under focus lines and a tilted camera, and landings
    freeze, shake and sparkle. Beats are timed to the props' own events (the boulder lands 450 ms
    after 'rumble', the lantern 390 ms after 'crash', the rats reach him ~850 ms after 'swarm').
    Where a freeze lands mid-ride, the move is split into a short stretch at the same speed and
    the rest, so the cart's speed never jumps. Level 8's first rocks now fall behind him.
  - **New:** `CutScene.foreground: false` keeps the cave's foreground rocks out of level 8's
    daylight. Stickers 1, 2, 3, 4 and 8 moved to their new best moments (the boulder behind the
    cart, the cart in flight, the wall bursting, the swing over the rats, the train over the
    canyon). Dev pages: `#gallery-worlds` (or `#gallery-worlds-1`) shows each world's backdrop
    as the scene, the map and the strip draw it; `#strip-L1` plays the strip with level 1's
    world and obstacle.
  - **Checked:** every beat of all 8 scenes in headless Chrome, `#moments-1-8`, the sticker
    gallery, the strip (`#strip-danger-0-L1`), and the real player select, trail map and page.
  - **Performance** (dev build, headless Chrome, 5× CPU throttle, main-thread work per frame,
    measured the same way for both): the detailed animals first cost more (rat swarm 17.4 →
    23.0 ms); memoizing the static parts of rats, bats, carts, the engine, the boulder and the
    spires (only their transforms change per frame) brought the mine scenes to ~17–19.6 ms,
    level 12's range (17–20 ms). A scene's first-frame hitch (drawing the backdrop into images)
    is ~210 ms for the mine vs ~330 ms for the forest. The tablet decides (Phase E).
