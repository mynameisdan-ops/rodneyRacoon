# src/ui

Pieces shared by screens. Rules for screens and UI (CSS order, adding a screen, the `#demo`
links for checking) are in `src/screens/CLAUDE.md`. `trailLayout.ts` is the page strip's pure
geometry (the hero's pace and the chaser that never reaches him), tested in `TrailStrip.test.ts`;
`stripMotion.ts` is the pure motion of each answer on the strip (a dash, a stumble, the combo
cut-in), tested in `stripMotion.test.ts`. `#strip` plays the strip by itself (`src/art/CLAUDE.md`).
`blockLayout.ts` is the pure geometry of the "Blocks" picture of a problem (where each block ends
and starts, which leave, group frames), tested in `blockLayout.test.ts`; `BlockAid` draws it in a
fixed-size box with CSS keyframes (transform and opacity only). Check it on
`#demo/page/<level>/blocks`.
