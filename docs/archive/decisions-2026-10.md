# Decisions and session log: Oct 2, 2026 (M7b Phases A–C)

Moved here from `docs/decisions.md` on Oct 3, 2026; the entries are unchanged. Newest last.
Paths have since moved (the obstacle art and scripts are in a folder or file per world, the
gear in `art/hero/gear/`, CSS in a file per screen); see `CLAUDE.md` for the current layout.

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

- **2026-10-02: M7b Phase C, the forest's other seven scenes** (`m7b-cartoon-look`). The forest's
  backdrop was already painted (Phase B) and level 12 directed; this did levels 9–11 and 13–16.
  - **Obstacles repainted** (`obstacles/forestScenes.tsx`), the World 1 way: what he touches and
    the animals are lined (`PROP_OUT`/`PROP_IN`, a crisp shadow and a rim light); the ground around
    them is painted. The log rolls end-on with its rings, a crack, moss and a little mushroom
    riding round on the bark; a mossy stump with roots; curling bramble stems with thorns, leaves
    and berries; a sapling pole with a leafy tip; a painted hollow with glowing mushrooms under a
    lined root chute, and the path breaking up into it; a grumpy-cute boar (bristly mane, pink
    snout, tiny tusks, shiny eyes, dizzy stars) with a lined tree, branch and bush (new
    `LinedFoliage`: lobes under one bold outline with leaf tips poking out); spotted mushroom caps
    with gills over a bog that darkens into glossy, bubbling mud; lined planks, posts and rope
    over a painted misty ravine; and for the boss a looping root, a mossy arch, a painted chasm,
    a painted night sky and moon, and softly glowing fireflies. The page-strip bees are round and
    fuzzy with big shiny eyes and a dotted flight trail (no stingers).
  - **Directed scripts** for levels 9, 10, 11, 13, 14, 15 and 16: impacts with hit-stops, close-ups,
    cut-ins (9, 10, 14, 16), slow motion under focus lines and a tilted camera, sparkling
    landings, timed to the props (the log arrives under him as he lands; the boar passes beneath
    the branch ~60 ms after he lands there, in slow motion; the bridge's planks still fall at his
    heels). The log's slam and level 16's landing split a move so the freeze lands without a
    speed jump. Level 16's root burst was moved on screen after a check showed it firing outside
    the close-up. Sticker 9 moved to 0.5 (0.3 now lands on the cut-in).
  - **Performance** (dev build, 5× CPU throttle, main-thread work per frame, same method as
    World 1): levels 9 14.9 ms, 10 17.9, 11 14.1, 13 14.9, 14 18.0, 15 14.2, 16 18.5. The bramble
    vault first cost 24.0 ms (each stem's curve rebuilt every frame to sway); drawing each stem
    once per height (memoized) and swaying it with a rotation brought it below the old art's 20.3.
