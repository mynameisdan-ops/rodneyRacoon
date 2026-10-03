# src/audio: sound effects and music (M9)

All sound is synthesized with Web Audio: no audio files, no network. The pure parts are tested;
the Web Audio parts are checked on the dev sound board (`#sounds`).

| File | What |
| --- | --- |
| `notation.ts` | Pure. Note names, chords, a lead line in eighth-note steps, and `compileSong` (adds the bass, arpeggio and drums in the song's styles) |
| `cues.ts` | Pure. `SFX_NAMES`, and `sceneCues`: a cut scene's sounds from its timeline, in real time |
| `synth.ts` | Web Audio building blocks: `tone`, `noise`, and the instruments (`playNote`, `playDrum`) |
| `sfx.ts` | One recipe per sound effect (TypeScript makes every name have one) |
| `engine.ts` | The AudioContext, the effects and music buses with the player's volumes, a limiter, unlocking on the first gesture, going quiet while hidden, button clicks, the music sequencer (`setMusic`) and stings (`playSting`) |
| `hooks.ts` | `useMusic(song, part)` for a screen's theme; `useSceneSounds` for a cut scene |

Data lives in `src/content/`: `music.ts` (the six themes and four stings) and `sounds.ts` (what
each prop state and emote in the cut scenes sounds like).

## How it plays

- The context starts on the first tap or key press (browsers require one); until then nothing
  plays, and the wanted theme starts as soon as it can. It suspends while the app is hidden.
- Every `<button>` clicks by itself (a delegated listener). `data-sound="buy"` picks another
  effect; `data-sound="off"` silences it (the number pad plays each digit's note instead).
- Screens call `useMusic`: the title theme on the player screens and the worlds overview, the
  world's theme on its map, shop and book, its `groove` (no tune, so it doesn't distract) on a
  timed page, and `quiet` under a cut scene. Results play a sting instead, and a boss scene ends
  in one. The same theme carries on across screens.
- Volumes are per device (`SaveData.audio`, save v6): sound and music at 0–3, and the map's
  speaker button mutes both.

## Add a sound effect

1. Its name in `SFX_NAMES` (`cues.ts`) and a recipe in `sfx.ts` (build it from `tone`, `noise`
   and the helpers; keep it in C major and gentle).
2. Play it with `playSfx(name, { size, ms, n })`, or from a scene through `content/sounds.ts`.
3. `#sounds`: listen, then "Measure everything": an effect should peak under about 0.8 and not
   be far quieter than its neighbours.

## Add or change a song

Edit `content/music.ts` (notation at the top of `notation.ts`; bars are 8 steps, which
`notation.test.ts` checks). New songs need an id in `SongId` and a place they play.
