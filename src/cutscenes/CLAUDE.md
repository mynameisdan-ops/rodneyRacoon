# src/cutscenes: the scene player

`timeline.ts` is pure (no React or DOM) and tested (`timeline.test.ts`, `cartoonBeats.test.ts`):
it compiles a script into segments, prop events, shakes and the directing beats, and
`sampleTimeline(t)` gives the hero's x, lift, pose, face, facing, prop state and caption at any
scene time. Slow motion and freezes make real time differ from scene time: run the clock to
`realDuration` and sample `scriptTime(timeline, real)`. `CutSceneView` draws one frame (backdrop,
obstacle back layer, hero with his squash, lean, wind and smears, obstacle front layer, the
backdrop's front layer, effects and cut-ins) for a time the caller owns; `useSceneClock` is the
`requestAnimationFrame` clock (frame gaps capped at 100ms).

Writing scripts: `src/content/cutscenes/CLAUDE.md`. Drawing obstacles: `src/art/obstacles/CLAUDE.md`.
