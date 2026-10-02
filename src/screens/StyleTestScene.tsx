import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_AVATAR } from '../art/hero/avatar';
import { ToonSceneView } from '../art/toon/ToonSceneView';
import { getCutScene, type CutScene } from '../content/cutscenes';
import { getLevel } from '../content/levels';
import { CutSceneView } from '../cutscenes/CutSceneView';
import { buildTimeline, scriptTime } from '../cutscenes/timeline';

const LEVEL_12 = getCutScene(12)!;

/**
 * v1 (the first style test): level 12 with faces, a "!", an impact, focus lines and sparkles,
 * on the same moves and timing as the game's scene.
 */
const V1: CutScene = {
  ...LEVEL_12,
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

/**
 * Dynamic: the same scene directed like a Saturday-morning cartoon. The crash freezes for a
 * beat and the camera snaps to his surprised face; a cut-in of his determined face slams across;
 * he crouches and leaps under a tilted camera; the swing slows down at the bottom of its arc;
 * the landing freezes, kicks up dust and sparkles as the camera eases back.
 */
const DYNAMIC: CutScene = {
  ...LEVEL_12,
  script: {
    startX: 150,
    steps: [
      { do: 'walk', x: 500, ms: 1000 },
      { do: 'prop', state: 'flood' },
      { do: 'impact', x: 750, lift: 40, size: 1.2 },
      { do: 'hold', pose: 'brace', ms: 70 },
      { do: 'freeze', ms: 120 },
      { do: 'shake', ms: 700, amp: 12 },
      { do: 'emote', emote: 'alert' },
      { do: 'camera', zoom: 1.9, ms: 240 },
      { do: 'hold', pose: 'brace', ms: 530 },
      { do: 'camera', zoom: 1.08, ms: 220 },
      { do: 'cutin', ms: 820, expr: 'determined' },
      { do: 'hold', pose: 'brace', ms: 820, expr: 'determined' },
      { do: 'caption' },
      { do: 'camera', zoom: 1.22, tilt: -5, ms: 420 },
      { do: 'jump', x: 602.5, lift: 129.5, height: 70, ms: 360, pose: 'leap' },
      { do: 'prop', state: 'grab' },
      { do: 'impact', x: 602.5, lift: 304, size: 0.35 },
      { do: 'action', ms: 1100 },
      { do: 'move', x: 750, lift: 90, ms: 550, pose: 'swing', ease: 'in' },
      { do: 'slow', ms: 300, rate: 0.4 },
      { do: 'move', x: 897.5, lift: 129.5, ms: 550, pose: 'swing', ease: 'out' },
      { do: 'prop', state: 'letgo' },
      { do: 'camera', zoom: 1, ms: 380 },
      { do: 'jump', x: 1100, height: 95, ms: 420, pose: 'leap' },
      { do: 'impact', x: 1100, lift: 0, size: 0.6 },
      { do: 'hold', pose: 'cheer', ms: 50 },
      { do: 'freeze', ms: 80 },
      { do: 'shake', ms: 260, amp: 6 },
      { do: 'emote', emote: 'sparkle' },
      { do: 'camera', zoom: 1.14, ms: 200 },
      { do: 'hold', pose: 'cheer', ms: 210 },
      { do: 'camera', zoom: 1, ms: 700 },
      { do: 'hold', pose: 'cheer', ms: 1300 },
    ],
  },
};

const SCENES = { v1: V1, dynamic: DYNAMIC } as const;
export type Mode = 'now' | keyof typeof SCENES;
const MODES: readonly Mode[] = ['now', 'v1', 'dynamic'];

/**
 * Dev-only: the vine swing now, in the first style test (v1), and directed (dynamic), all with
 * the lean build. `#style-scene-dynamic` opens it in a mode; `#style-scene-dynamic-2600` shows the
 * frame at 2.6s of real time without the controls (screenshots).
 */
export function StyleTestScene({ initial, still }: { initial: Mode; still?: number }) {
  const level = getLevel(12)!;
  const [mode, setMode] = useState<Mode>(initial);
  const scene = mode === 'now' ? LEVEL_12 : SCENES[mode];
  const timeline = useMemo(() => buildTimeline(scene.script), [scene]);
  const [real, setReal] = useState(still ?? 0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let time = 0;
    const tick = (now: number) => {
      time = Math.min(timeline.realDuration, time + Math.min(100, now - last));
      last = now;
      setReal(time);
      if (time < timeline.realDuration) raf.current = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, timeline]);

  const t = scriptTime(timeline, real);
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
        build="lean"
        raster
        caption={level.caption}
        t={t}
      />
    );
  if (still !== undefined) return <div className="scene-preview">{view}</div>;
  return (
    <div className="scene-preview">
      {view}
      <div className="scene-preview__bar">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={m === mode ? 'big-button' : 'big-button big-button--quiet'}
            onClick={() => {
              setMode(m);
              setPlaying(false);
              setReal(0);
            }}
          >
            {m}
          </button>
        ))}
        <input
          type="range"
          aria-label="Scene time"
          min={0}
          max={timeline.realDuration}
          step={10}
          value={Math.min(real, timeline.realDuration)}
          onChange={(e) => {
            setPlaying(false);
            setReal(Number(e.target.value));
          }}
        />
        <span className="scene-preview__time">{(real / 1000).toFixed(2)}s</span>
        <button
          type="button"
          className="big-button"
          onClick={() => {
            setReal(0);
            setPlaying(true);
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
}
