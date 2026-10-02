import type { AvatarConfig } from '../hero/avatar';
import { OBSTACLES } from '../obstacles/registry';
import type { ObstacleArt, ObstacleId } from '../obstacles/types';
import { WorldBackdrop } from '../worlds/WorldBackdrop';
import type { CutScene } from '../../content/cutscenes';
import { cameraFor, sampleTimeline, type Timeline } from '../../cutscenes/timeline';
import { PaintedVineSwingBack } from './paintedVineSwing';
import { DashLines, EmoteSign, FocusLines, ImpactBurst, ImpactFlash } from './toonFx';
import { ToonHero } from './ToonHero';
import { swingReach, type Build } from './toonBuilds';
import '../../cutscenes/cutscene.css';

/*
 * The M7b style test's cut-scene view: CutSceneView with the new hero, the painted backdrop and
 * the cartoon effects (squash and stretch, focus lines, impacts, speed lines, emotes). If the
 * look is approved, this becomes CutSceneView.
 */

const SCENE_GROUND = 640;
/** Obstacles repainted so far (the rest draw their flat versions). */
const PAINTED: Partial<Record<ObstacleId, ObstacleArt>> = {
  'vine-swing': { ...OBSTACLES['vine-swing'], back: PaintedVineSwingBack },
};
/** How far the camera pushes in on him at the peak of a big moment. */
const PUSH_IN = 0.08;
/** Hands this far above his feet in the swing pose, the reach every scene is laid out for. */
const REACH_PX = 175;

interface Props {
  scene: CutScene;
  timeline: Timeline;
  worldId: number;
  avatar: AvatarConfig;
  build: Build;
  /** Draw the backdrop layers as images (see WorldBackdrop). */
  raster?: boolean;
  caption?: string;
  t: number;
}

export function ToonSceneView({
  scene,
  timeline,
  worldId,
  avatar,
  build,
  raster = false,
  caption,
  t,
}: Props) {
  const size = (REACH_PX * 170) / swingReach(build);
  const feetX = (52 * size) / 170;
  const feetY = (163 * size) / 170;
  const frame = sampleTimeline(timeline, t);
  const cam = cameraFor(frame.x, scene.width);
  const art = PAINTED[scene.obstacle] ?? OBSTACLES[scene.obstacle];
  const propArgs = {
    t,
    state: frame.propState,
    since: frame.propSince,
    events: timeline.propEvents,
    heroAt: (time: number) => {
      const f = sampleTimeline(timeline, time);
      return { x: f.x - scene.anchor, lift: f.lift };
    },
    heroX: frame.x - scene.anchor,
    heroLift: frame.lift,
  };
  const obstacleAt = `translate(${scene.anchor - cam} ${SCENE_GROUND})`;
  const flip = frame.facing === 'left' ? -1 : 1;
  const { shake, squash } = frame;
  const shaking = shake.x !== 0 || shake.y !== 0;
  const heroX = frame.x - cam;
  const heroY = SCENE_GROUND - frame.lift;
  const big = frame.impacts.find((m) => m.size >= 1);

  return (
    <div className="scene">
      <div
        className="scene__world scene__world--layer"
        // Zoom in a touch while shaking so the edges never show, and push in on the big moment.
        style={
          shaking || frame.action > 0
            ? {
                transform: `translate(${shake.x}px, ${shake.y}px) scale(${(shaking ? 1.03 : 1) * (1 + PUSH_IN * frame.action)})`,
                transformOrigin: `${heroX}px ${heroY - size * 0.5}px`,
              }
            : undefined
        }
      >
        <WorldBackdrop
          worldId={worldId}
          height={800}
          horizon={330}
          groundTop={470}
          pathY={SCENE_GROUND}
          scroll={cam}
          smooth={false}
          painted
          raster={raster}
        >
          <FocusLines cx={heroX} cy={heroY - size * 0.45} t={t} strength={frame.action} />
          <g transform={obstacleAt}>
            <art.back {...propArgs} />
          </g>
          {/* His shadow on the surface under him (none while he hangs from something). */}
          {frame.pose !== 'swing' && frame.pose !== 'climb' && (
            <ellipse
              cx={heroX}
              cy={SCENE_GROUND - frame.floor + 2}
              rx={52 * Math.max(0.4, 1 - (frame.lift - frame.floor) / 250) * squash.sx}
              ry={9}
              fill="rgba(20,10,40,0.22)"
            />
          )}
          {Math.abs(frame.speed) > 0.45 && (
            <DashLines
              x={heroX - flip * size * 0.18}
              feetY={heroY}
              height={size * 0.85}
              t={t}
              dir={frame.speed > 0 ? 1 : -1}
            />
          )}
          <g
            transform={`translate(${heroX} ${heroY}) scale(${flip * squash.sx} ${squash.sy}) translate(${-feetX} ${-feetY})`}
          >
            <ToonHero
              avatar={avatar}
              build={build}
              pose={frame.pose}
              expression={frame.expr}
              size={size}
              shadow={false}
            />
          </g>
          {art.front && (
            <g transform={obstacleAt}>
              <art.front {...propArgs} />
            </g>
          )}
          {frame.impacts.map((m, i) => (
            <ImpactBurst key={i} x={m.x - cam} y={SCENE_GROUND - m.lift} dt={m.dt} size={m.size} />
          ))}
          {frame.emote && (
            <EmoteSign
              emote={frame.emote.emote}
              x={heroX}
              y={heroY - size * 0.95}
              dt={frame.emote.dt}
            />
          )}
          {big && <ImpactFlash dt={big.dt} w={1280} h={800} />}
        </WorldBackdrop>
      </div>
      {frame.showCaption && caption && <div className="scene__caption">{caption}</div>}
    </div>
  );
}
