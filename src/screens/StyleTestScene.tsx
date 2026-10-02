import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_AVATAR } from '../art/hero/avatar';
import { ToonSceneView } from '../art/toon/ToonSceneView';
import type { Build } from '../art/toon/toonBuilds';
import { getCutScene, type CutScene } from '../content/cutscenes';
import { getLevel } from '../content/levels';
import { CutSceneView } from '../cutscenes/CutSceneView';
import { buildTimeline } from '../cutscenes/timeline';

/**
 * Level 12 (the vine swing) with cartoon beats: the same moves and timing, plus his faces, a "!"
 * when the gully floods, an impact as the water crashes in, focus lines while he swings, and
 * sparkles when he lands.
 */
const TOON_VINE: CutScene = {
  ...getCutScene(12)!,
  script: {
    startX: 150,
    steps: [
      { do: 'walk', x: 500, ms: 1000 },
      { do: 'prop', state: 'flood' },
      { do: 'shake', ms: 700, amp: 9 },
      { do: 'impact', x: 750, lift: 40, size: 1.2 },
      { do: 'emote', emote: 'alert' },
      { do: 'hold', pose: 'brace', ms: 550 },
      { do: 'hold', pose: 'brace', ms: 350, expr: 'determined' },
      { do: 'caption' },
      { do: 'jump', x: 602.5, lift: 129.5, height: 60, ms: 450, pose: 'leap' },
      { do: 'prop', state: 'grab' },
      { do: 'action', ms: 1100 },
      { do: 'move', x: 750, lift: 90, ms: 550, pose: 'swing', ease: 'in' },
      { do: 'move', x: 897.5, lift: 129.5, ms: 550, pose: 'swing', ease: 'out' },
      { do: 'prop', state: 'letgo' },
      { do: 'jump', x: 1100, height: 70, ms: 550, pose: 'leap' },
      { do: 'impact', x: 1100, lift: 0, size: 0.55 },
      { do: 'emote', emote: 'sparkle' },
      { do: 'hold', pose: 'cheer', ms: 1500 },
    ],
  },
};

type Mode = 'now' | Build | 'raster';

/**
 * Dev-only: the vine swing now and in the proposed look, to scrub or play. `#style-scene-kid`
 * opens it in a mode; `#style-scene-kid-2600` shows one frame without the controls (screenshots).
 */
export function StyleTestScene({ initial, still }: { initial: Mode; still?: number }) {
  const level = getLevel(12)!;
  const [mode, setMode] = useState<Mode>(initial);
  const scene = mode === 'now' ? getCutScene(12)! : TOON_VINE;
  const timeline = useMemo(() => buildTimeline(scene.script), [scene]);
  const [t, setT] = useState(still ?? 0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let time = 0;
    const tick = (now: number) => {
      time = Math.min(timeline.duration, time + Math.min(100, now - last));
      last = now;
      setT(time);
      if (time < timeline.duration) raf.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, timeline]);

  const view =
    mode === 'now' ? (
      <CutSceneView
        scene={scene}
        timeline={timeline}
        worldId={level.world}
        avatar={DEFAULT_AVATAR}
        caption={level.caption}
        t={t}
      />
    ) : (
      <ToonSceneView
        scene={scene}
        timeline={timeline}
        worldId={level.world}
        avatar={DEFAULT_AVATAR}
        build={mode === 'raster' ? 'kid' : mode}
        raster={mode === 'raster'}
        caption={level.caption}
        t={t}
      />
    );
  if (still !== undefined) return <div className="scene-preview">{view}</div>;
  return (
    <div className="scene-preview">
      {view}
      <div className="scene-preview__bar">
        {(['now', 'kid', 'lean', 'raster'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={m === mode ? 'big-button' : 'big-button big-button--quiet'}
            onClick={() => {
              setMode(m);
              setPlaying(false);
            }}
          >
            {m}
          </button>
        ))}
        <input
          type="range"
          aria-label="Scene time"
          min={0}
          max={timeline.duration}
          step={25}
          value={Math.min(t, timeline.duration)}
          onChange={(e) => {
            setPlaying(false);
            setT(Number(e.target.value));
          }}
        />
        <span className="scene-preview__time">{(t / 1000).toFixed(2)}s</span>
        <button
          type="button"
          className="big-button"
          onClick={() => {
            setT(0);
            setPlaying(true);
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
}
