import type { AvatarConfig } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import { OBSTACLES } from '../art/obstacles/registry';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import type { CutScene } from '../content/cutscenes';
import { cameraFor, sampleTimeline, type Timeline } from './timeline';
import './cutscene.css';

/** The ground line the hero walks on, in the 1280×800 scene. */
const SCENE_GROUND = 640;
const HERO_SIZE = 200;
/** Feet position inside the Hero drawing (its viewBox is 100×170), scaled to HERO_SIZE. */
const FEET_X = (52 * HERO_SIZE) / 170;
const FEET_Y = (163 * HERO_SIZE) / 170;

interface Props {
  scene: CutScene;
  timeline: Timeline;
  worldId: number;
  avatar: AvatarConfig;
  caption: string;
  /** Scene time, ms. */
  t: number;
}

/** Draws one frame of a cut scene. The caller owns the clock. */
export function CutSceneView({ scene, timeline, worldId, avatar, caption, t }: Props) {
  const frame = sampleTimeline(timeline, t);
  const cam = cameraFor(frame.x, scene.width);
  const art = OBSTACLES[scene.obstacle];
  const propArgs = {
    t,
    state: frame.propState,
    since: frame.propSince,
    events: timeline.propEvents,
    heroX: frame.x - scene.anchor,
    heroLift: frame.lift,
  };
  const obstacleAt = `translate(${scene.anchor - cam} ${SCENE_GROUND})`;
  const flip = frame.facing === 'left' ? -1 : 1;
  const { shake } = frame;
  const shaking = shake.x !== 0 || shake.y !== 0;

  return (
    <div className="scene">
      <div
        className="scene__world"
        // Zoom in a touch while shaking so the edges never show.
        style={
          shaking ? { transform: `translate(${shake.x}px, ${shake.y}px) scale(1.03)` } : undefined
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
        >
          <g transform={obstacleAt}>
            <art.back {...propArgs} />
          </g>
          {scene.sign && <Signpost x={scene.sign.x - cam} text={scene.sign.text} />}
          {/* Shadow on the surface under him; it shrinks as he jumps higher. */}
          <ellipse
            cx={frame.x - cam}
            cy={SCENE_GROUND - frame.floor + 2}
            rx={52 * Math.max(0.4, 1 - (frame.lift - frame.floor) / 250)}
            ry={9}
            fill="rgba(0,0,0,0.18)"
          />
          <g
            transform={`translate(${frame.x - cam} ${SCENE_GROUND - frame.lift}) scale(${flip} 1) translate(${-FEET_X} ${-FEET_Y})`}
          >
            <Hero avatar={avatar} pose={frame.pose} size={HERO_SIZE} shadow={false} />
          </g>
          {art.front && (
            <g transform={obstacleAt}>
              <art.front {...propArgs} />
            </g>
          )}
        </WorldBackdrop>
      </div>
      {frame.showCaption && <div className="scene__caption">{caption}</div>}
    </div>
  );
}

function Signpost({ x, text }: { x: number; text: string }) {
  return (
    <g transform={`translate(${x} ${SCENE_GROUND - 10})`}>
      <rect x={-7} y={-170} width={14} height={176} rx={4} fill="#7a5230" />
      <path
        d="M-120 -170 H150 L185 -135 L150 -100 H-120 Z"
        fill="#c79a6b"
        stroke="#7a5230"
        strokeWidth={5}
      />
      <text
        x={15}
        y={-126}
        textAnchor="middle"
        fontSize={28}
        fontWeight={900}
        fill="#3b2a20"
        fontFamily="inherit"
      >
        {text}
      </text>
    </g>
  );
}
