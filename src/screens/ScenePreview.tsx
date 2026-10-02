import { useMemo, useState } from 'react';
import { DEFAULT_AVATAR } from '../art/hero/avatar';
import { getCutScene } from '../content/cutscenes';
import type { LevelDef } from '../content/levels';
import { CutSceneView } from '../cutscenes/CutSceneView';
import { buildTimeline, scriptTime } from '../cutscenes/timeline';
import { CutSceneScreen } from './CutSceneScreen';

/**
 * Dev-only: scrub through a cut scene frame by frame (in real time, so freeze frames and slow
 * motion show as they play), or play it for real. With `still` (ms of real time) it shows just
 * that frame, for screenshots.
 */
export function ScenePreview({
  level,
  onClose,
  still,
}: {
  level: LevelDef;
  onClose: () => void;
  still?: number;
}) {
  const scene = getCutScene(level.id)!;
  const timeline = useMemo(() => buildTimeline(scene.script), [scene]);
  const [real, setReal] = useState(still ?? 0);
  const [playing, setPlaying] = useState(0);
  const t = scriptTime(timeline, real);

  if (playing) {
    return (
      <CutSceneScreen
        key={playing}
        level={level}
        scene={scene}
        avatar={DEFAULT_AVATAR}
        hasNext={false}
        onNext={() => {}}
        onMap={() => setPlaying(0)}
      />
    );
  }
  return (
    <div className="scene-preview">
      <CutSceneView
        scene={scene}
        timeline={timeline}
        worldId={level.world}
        avatar={DEFAULT_AVATAR}
        caption={level.caption}
        t={t}
      />
      {still === undefined && (
        <div className="scene-preview__bar">
          <button type="button" className="big-button big-button--quiet" onClick={onClose}>
            Back
          </button>
          <input
            type="range"
            aria-label="Scene time"
            min={0}
            max={timeline.realDuration}
            step={10}
            value={real}
            onChange={(e) => setReal(Number(e.target.value))}
          />
          <span className="scene-preview__time">
            {(real / 1000).toFixed(2)}s / {(timeline.realDuration / 1000).toFixed(1)}s
          </span>
          <button type="button" className="big-button" onClick={() => setPlaying(Date.now())}>
            Play
          </button>
        </div>
      )}
    </div>
  );
}
