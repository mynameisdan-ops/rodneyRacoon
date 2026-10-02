import { useMemo } from 'react';
import type { AvatarConfig } from '../art/hero/avatar';
import { getCutScene } from '../content/cutscenes';
import { getLevel } from '../content/levels';
import { getSticker } from '../content/stickers';
import { CutSceneView } from '../cutscenes/CutSceneView';
import { buildTimeline, cameraFor, sampleTimeline } from '../cutscenes/timeline';

interface Props {
  levelId: number;
  avatar: AvatarConfig;
  /** Width in design px; the height follows the sticker's 9:7 shape. */
  width: number;
  /** Tilt it a little, like a sticker stuck on by hand. */
  tilt?: boolean;
  /** Override the sticker's moment (the gallery uses it to pick one). */
  moment?: number;
}

/** The part of the 1280×800 scene a sticker shows, around the hero. */
const CROP_W = 600;
const CROP_H = 466;
const GROUND = 640;
/** The white border (matches `.sticker` in styles.css). */
const BORDER = 7;

/** A level's sticker: a still from its cut scene, with the player's own hero in it. */
export function Sticker({ levelId, avatar, width, tilt = true, moment }: Props) {
  const level = getLevel(levelId);
  const scene = getCutScene(levelId);
  const def = getSticker(levelId);
  const timeline = useMemo(() => (scene ? buildTimeline(scene.script) : undefined), [scene]);
  if (!level || !scene || !def || !timeline) return null;

  const t = (moment ?? def.moment) * timeline.duration;
  const frame = sampleTimeline(timeline, t);
  const heroOnScreen = frame.x - cameraFor(frame.x, scene.width);
  const cropX = clamp(heroOnScreen - CROP_W / 2, 0, 1280 - CROP_W);
  const cropY = clamp(GROUND - frame.lift - 330, 0, 800 - CROP_H);
  const scale = (width - 2 * BORDER) / CROP_W;
  const angle = tilt ? ((levelId * 37) % 7) - 3 : 0;

  return (
    <div
      className="sticker"
      style={{ width, height: CROP_H * scale + 2 * BORDER, transform: `rotate(${angle}deg)` }}
      aria-label={def.name}
    >
      <div
        className="sticker__scene"
        style={{ transform: `scale(${scale}) translate(${-cropX}px, ${-cropY}px)` }}
      >
        <CutSceneView
          scene={scene}
          timeline={timeline}
          worldId={level.world}
          avatar={avatar}
          raster={false}
          t={t}
        />
      </div>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
