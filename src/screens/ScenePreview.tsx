import { useMemo, useState } from 'react';
import { DEFAULT_AVATAR } from '../art/hero/avatar';
import { getCutScene } from '../content/cutscenes';
import type { LevelDef } from '../content/levels';
import { CutSceneView } from '../cutscenes/CutSceneView';
import { buildTimeline } from '../cutscenes/timeline';
import { CutSceneScreen } from './CutSceneScreen';

/** Dev-only: scrub through a cut scene frame by frame, or play it for real. */
export function ScenePreview({ level, onClose }: { level: LevelDef; onClose: () => void }) {
  const scene = getCutScene(level.id)!;
  const timeline = useMemo(() => buildTimeline(scene.script), [scene]);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(0);

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
      <div className="scene-preview__bar">
        <button type="button" className="big-button big-button--quiet" onClick={onClose}>
          Back
        </button>
        <input
          type="range"
          aria-label="Scene time"
          min={0}
          max={timeline.duration}
          step={50}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
        />
        <span className="scene-preview__time">
          {(t / 1000).toFixed(2)}s / {(timeline.duration / 1000).toFixed(1)}s
        </span>
        <button type="button" className="big-button" onClick={() => setPlaying(Date.now())}>
          Play
        </button>
      </div>
    </div>
  );
}
