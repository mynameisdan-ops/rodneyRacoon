# src/cutscenes: the scene player

`timeline.ts` is pure (no React or DOM) and tested in `timeline.test.ts`: it compiles a script
into segments, prop events and shakes, and `sampleTimeline(t)` gives the hero's x, lift, pose,
facing, prop state and caption at any time. `CutSceneView` draws one frame (backdrop, obstacle
back layer, hero, obstacle front layer) for a time the caller owns; `useSceneClock` is the
`requestAnimationFrame` clock (frame gaps capped at 100ms).

Writing scripts: `src/content/cutscenes/CLAUDE.md`. Drawing obstacles: `src/art/obstacles/CLAUDE.md`.
