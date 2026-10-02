import { useMemo } from 'react';
import type { AvatarConfig } from '../art/hero/avatar';
import type { CutScene } from '../content/cutscenes';
import { getWorld, LEVELS, type LevelDef } from '../content/levels';
import { CutSceneView } from '../cutscenes/CutSceneView';
import { buildTimeline, scriptTime } from '../cutscenes/timeline';
import { useSceneClock } from '../cutscenes/useSceneClock';

interface Props {
  level: LevelDef;
  scene: CutScene;
  avatar: AvatarConfig;
  hasNext: boolean;
  /** Defaults to "Next level ▶". */
  nextLabel?: string;
  onNext: () => void;
  onMap: () => void;
}

export function CutSceneScreen({ level, scene, avatar, hasNext, nextLabel, onNext, onMap }: Props) {
  const timeline = useMemo(() => buildTimeline(scene.script), [scene]);
  // The clock runs in real time; slow motion and freeze frames stretch scene time.
  const [real, skip] = useSceneClock(timeline.realDuration);
  const over = real >= timeline.realDuration;

  return (
    <div className="scene-screen">
      <CutSceneView
        scene={scene}
        timeline={timeline}
        worldId={level.world}
        avatar={avatar}
        caption={level.caption}
        t={scriptTime(timeline, real)}
      />
      {!over && (
        <button type="button" className="scene-screen__skip" onClick={skip}>
          Skip ⏭
        </button>
      )}
      {over && (
        <div className="scene-screen__end">
          {level.boss && (
            <div className="scene-screen__banner">
              {level.id === LEVELS[LEVELS.length - 1]!.id
                ? 'You made it home!'
                : `${getWorld(level.world)?.name} complete!`}
            </div>
          )}
          <div className="scene-screen__actions">
            <button type="button" className="big-button big-button--quiet" onClick={onMap}>
              Map
            </button>
            {hasNext && (
              <button type="button" className="big-button" onClick={onNext}>
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
