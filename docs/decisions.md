# Decisions and session log

A dated entry per session or milestone: what was built or decided, and why. Newest last. Keep each
entry under 10 lines, and when this file passes about 150 lines move the older entries to
`docs/archive/`. Earlier entries: `docs/archive/decisions-2026-09.md` (Sep 27–30, 2026: M0–M7)
and `docs/archive/decisions-2026-10.md` (Oct 2, 2026: M7b's style test, Phase B, and Phase C's
mine and forest). The design is in `docs/PLAN.md`; the current snapshot is in `STATUS.md`.

- **2026-10-02: M7b Phase C, World 3, the Rushing River** (`m7b-cartoon-look`): levels 17–24.
  - **Painted backdrop** (`worlds/river.tsx`, colors in `riverPalette.ts`), rasterized like the
    forest and the mine: puffy clouds lit on top and blue underneath, a few birds, the sun's glow,
    snowy peaks far off (a glimpse of World 4), rows of hills with trees fading into the haze, a
    tall waterfall off a rounded cliff with a rainbow in its mist; the wide turquoise river with
    weeping willows, bushes and cattails on the far bank (and their reflections), mossy rocks
    with foam round them, lily pads with water lilies, and a mother duck with three ducklings; a
    sandy near shore where the water laps, sunny grass with flowers, clover, pebbles and
    butterflies, and the path; and a `front` layer of tall reeds and cattails at the corners.
  - **Obstacles repainted** (`obstacles/riverScenes.tsx`): what he touches and the animals are
    lined, the ground around them painted, as in Worlds 1 and 2. New rule for water: the river
    itself is painted (lighter at the surface, a bright moving surface line, ripples drifting
    downstream, painted foam), with the channel's far shore behind it so the path doesn't seem
    to run on over the water; water that acts (the curling wave, splashes with a crown of water,
    jets, spurts, the geysers) is cel-drawn with lines, like a cartoon's effects. Lined mossy
    stepping stones that dip as he lands and sink once he's left them; a dam of sticks and mud
    with logs on top, and cute beavers (buck teeth, shiny eyes, paddle tails) who peek out and
    wave, then dive; a log with a leafy twig riding the rapids over a painted step; rope-bridge
    planks, posts and ropes over a deep painted gorge (lit facets, vines, mist, a river far
    below); a hot spring in cream-and-orange mineral terraces with steam, bubbles, a lined rock
    lid and rippling jets; a painted cliff behind the waterfall with ledges and grass, lined rock
    steps and chute; a painted cliff and a lined root ladder for the flood; the raft's lined
    logs, rope ties and striped sail with a pennant, and a painted beach. The page-strip chaser is
    a cartoon flood wave with claws of foam and a happy fish leaping out of it.
  - **Props that wait for him**: new `heroPasses()` (sceneKit) gives when his feet first reach a
    point after a moment, cached per scene. The stones sink once he's left them, the dam's logs
    pop out 110px behind wherever he is, and the waterfall's cracked rock falls when he slides
    off, so a script can hold him for a close-up or a cut-in without the ground vanishing under
    him. The wave in level 17 bursts up at the left bank and rolls on, but never comes within
    190px of him (it rears up while he stops); the geyser's first jet stays under his rock.
  - **Directed scripts** for levels 17–24: impacts with hit-stops, close-ups of his face, cut-ins,
    slow motion, focus lines and a tilted camera, emotes and sparkling landings, timed to the
    props: the wave bursting up behind him on the stones, the beavers' wave and the dam bursting,
    the surprised cut-in before the rapids' drop and the splash-down (the 60 ms after it split off
    so it can freeze without a speed jump), the planks snapping, the geyser blast and the hang
    time, the cracked top rock and the flight over the pool, the wave breaking behind him before
    the climb, and the boss raft surfing the giant wave in slow motion. Checked beat by beat with
    `#scene-N-ms` shots; fixes from them: the wave clipped to the river channel, the splash-down
    burst lowered to the waterline, level 23's break moved behind him and its close-up delayed,
    level 24's cut-in moved to the wave's rise (a cut-in counts scene time, so slow motion
    stretched it over the splash-down), its sign moved clear of the sail, the beaver lake strip
    dropped. Stickers 22 and 23 moved to 0.6 (23's 0.4 landed on its cut-in).
  - **Camera fix (all worlds)**: a tilt turns the world about him, not about the middle of the
    screen, so with him near an edge a corner of the screen could look past the edge of the world
    (seen in level 17's last hops). The camera now checks the screen's corners and eases the
    framing back toward him (where the turn leaves the most slack) until they're covered.
  - **Performance** (dev build, 5× CPU throttle, best of three runs: they vary ±25% today): 17
    20.5 ms, 18 19.1, 19 20.4, 20 16.6, 21 19.2, 22 19.0, 23 15.6, 24 18.1, with level 12 at 20.0 in
    the same runs. The first version cost up to 23.9 ms; without their art levels 19 and 21 ran at
    13.6, and a CPU profile showed React's dev-build element creation dominating, so the many small
    moving pieces (foam, ripples, drops, steam, bubbles, speed lines) are now drawn as one path per
    group (new `circles()` / `ellipses()` in sceneKit) and the river's gradient is memoized. The
    first-frame hitch is ~600–660 ms vs the forest's 700–1000 ms in the same conditions. The main
    chunk is now 613 kB (176 kB gzipped).

- **2026-10-03: Restructured for cheaper sessions and easier expansion** (on `main`, then merged
  into `m7b-cartoon-look`).
  - Docs: a shorter `CLAUDE.md` plus area guides (`src/**/CLAUDE.md`, loaded only when that folder
    is read) holding the recipes and M7b's art rules; PLAN and STATUS trimmed; older log entries
    archived; handled feedback cleared; `.claude/settings.json` blocks reading `package-lock.json`.
  - Code: one file per obstacle in a folder per world, a script file per world, a world art
    registry (theme, layers, front layer, painted sky, chaser, timer) instead of switches, gear art
    per slot (`art/hero/gear/`), a CSS file per screen (imported in cascade order), one-row level
    and shop tables, `npm run check`, dev `#demo/<screen>` links, and `content.test.ts`.
  - Merging into M7b, the repainted art was split the same way: all 3,227 renders (every scene
    frame, backdrop, pose, face, item, cut-in, strip moment and screen) match M7b's, and the built
    CSS has the same rules. Dropped the unused meadow backdrop (an unknown world draws World 1).

- **2026-10-03: M7b finished: Worlds 4 and 5 repainted and directed, the UI restyled, merged**
  (`m7b-cartoon-look` → `main`).
  - **World 4, the mountains:** painted peaks lit from the upper right with mist at their feet,
    snowy pine slopes with a log cabin, a sunlit snowfield with a snow hare, and young pines in
    front. Obstacles repainted (rock slide off a cliff's snowy top, crumbling ledge over a misty
    valley, avalanche under a lined pine, a cute mountain goat, an ice bridge over a painted
    crevasse, a glowing icicle cave, a frozen waterfall of ice columns, the storm sled with
    lightning) and levels 25–32 directed; a snowball chaser with a bunting riding on top.
  - **World 5, the canyon home:** golden hour (low sun, pink-lit clouds, a far balloon), banded
    mesas, a red canyon wall with a windmill, a desert floor with saguaros, prickly pears and a
    lizard. A gorge that runs off into the distance; flood, zip line (with a hawk), sandstorm and
    sandboard, tumbleweeds, a stone arch, a steam train over a trestle, the windy last hill with
    home in view, and the homestead with a twister, the family, the dog and fireworks; levels
    33–40 directed; a dust-devil chaser. The chunk-size warning moved to 800 kB (722 kB, 201 kB
    gzipped).
  - **Phase D, the UI:** `styles/cartoon.css`, last in the cascade, restyles looks only: sunburst
    backdrops, outlined titles that pop in, lit buttons, keys and cards with a squash, cel-shaded
    map stops, faint halftone paper behind the problem. Checked at 1280×800 and 915×412.
  - **Phase E (the tablet check) skipped at the user's request:** M10's tablet testing covers it
    (frame cost and the first-frame hitch). Dev-build frame cost at 5× CPU throttle over each
    scene: levels 25–40 run 14.7–19.9 ms vs level 12's 20 ms; the hitch is 470–530 ms vs the
    river's 720. Level 30's icicles first cost 38 ms because they wobbled every frame; they now
    shiver only in the rumble.


- **2026-10-03: M9, audio** (`m9-audio`; M8 skipped for now at the user's request, as it waits
  for photos). Everything is synthesized with Web Audio (`src/audio/`), with no files.
  - **Effects:** 47 recipes (`sfx.ts`), all in C major and gentle (a miss is a soft "bwom").
    Pad digits play notes of a pentatonic scale; the right-answer chime climbs with the streak.
    Buttons click through one delegated listener (`data-sound` picks another sound or `off`).
  - **Scenes:** `sceneCues` (pure, tested) turns each timeline into sounds in real time: jumps,
    landings, impacts sized like their bursts, rumbles for shakes, cut-in slashes, emotes, and
    a table of the props' states (`content/sounds.ts`; a test makes every prop state pick one).
  - **Music:** a small notation and sequencer: the title theme and one per world, the world's
    theme without its tune on a timed page (so it doesn't distract) and soft under a scene;
    stings for results and bosses. Save v6 adds per-device volumes and the map's mute button.
    Levels measured offline on `#sounds` (effects peak 0.1–0.7, the limiter takes the rest).
