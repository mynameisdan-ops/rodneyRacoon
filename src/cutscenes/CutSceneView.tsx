import { CutIn } from '../art/hero/CutIn';
import type { AvatarConfig } from '../art/hero/avatar';
import { capeColor, SCENE_SIZE, smearBands } from '../art/hero/body';
import { Hero } from '../art/hero/Hero';
import {
  DashLines,
  Dust,
  EmoteSign,
  FocusLines,
  ImpactBurst,
  ImpactFlash,
  MotionTrail,
  Smear,
} from '../art/fx';
import { OBSTACLES } from '../art/obstacles/registry';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import { wornItem } from '../content/shop';
import type { CutScene } from '../content/cutscenes';
import { cameraFor, sampleTimeline, type SceneFrame, type Timeline } from './timeline';
import './cutscene.css';

/*
 * Draws one frame of a cut scene, directed like a Saturday-morning cartoon (M7b):
 * - his body leans and tilts with how he moves, crouches before a jump, squashes and stretches,
 *   and his cape and hair stream with his speed;
 * - fast moves leave afterimages, a motion arc or a smear; landings and running kick up dust;
 * - the camera frames him: close-ups, a Dutch tilt, a push-in on the big moment, shakes;
 * - focus lines, impact bursts, emotes and the anime cut-in.
 * Everything is a function of scene time, so any frame draws exactly. The caller owns the clock
 * (see `scriptTime` for slow motion and freezes).
 */

const W = 1280;
const H = 800;
const SCENE_GROUND = 640;
/** How far the camera pushes in on him at the peak of a big moment. */
const PUSH_IN = 0.08;
/** Hands this far above his feet in the swing pose, the reach every scene is laid out for. */
const REACH_PX = 175;
const size = SCENE_SIZE;
/** Afterimages trail this far behind him (ms) when he's moving fast. */
const GHOSTS = [
  { ms: 55, opacity: 0.32 },
  { ms: 110, opacity: 0.16 },
];
const DUST = '#dcc89a';

interface Props {
  scene: CutScene;
  timeline: Timeline;
  worldId: number;
  avatar: AvatarConfig;
  /** Draw the backdrop layers as images (see WorldBackdrop); a still (a sticker) needn't. */
  raster?: boolean;
  /** Left out for a still (a sticker), which shows no caption. */
  caption?: string;
  /** Scene time, ms (see `scriptTime` for slow motion and freezes). */
  t: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function CutSceneView({
  scene,
  timeline,
  worldId,
  avatar,
  raster = true,
  caption,
  t,
}: Props) {
  const frame = sampleTimeline(timeline, t);
  const cam = cameraFor(frame.x, scene.width);
  const art = OBSTACLES[scene.obstacle];
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
  const heroX = frame.x - cam;
  const heroY = SCENE_GROUND - frame.lift;
  const groundY = SCENE_GROUND - frame.floor;
  const big = frame.impacts.find((m) => m.size >= 1);

  // Where the middle of his body has been over the last moments (screen px), for the motion
  // arc, and how fast it's going.
  const body = (time: number) => {
    const f = sampleTimeline(timeline, Math.max(0, time));
    return { x: f.x - cam, y: SCENE_GROUND - f.lift - size * 0.45 };
  };
  const trail = Array.from({ length: 10 }, (_, i) => body(t - i * 20));
  const bodySpeed = Math.hypot(trail[0]!.x - trail[3]!.x, trail[0]!.y - trail[3]!.y) / 60;
  // A motion arc behind leaps and swings, and afterimages when he's really flying.
  // Only moves he makes himself: riding a cart or sliding down a chute carries him steadily,
  // which reads as speed lines, not a burst.
  const airborne = frame.pose === 'leap' || frame.pose === 'swing' || frame.pose === 'jump';
  const arc = t > 60 && airborne && bodySpeed > 0.22;
  // In tenths, so the hero only redraws when it changes visibly.
  const wind = Math.round(clamp(bodySpeed * 1.1, 0, 1) * 10) / 10;
  // On the fastest moves he smears: stretched along his motion, with streaks of his colors
  // torn off behind him. Afterimages show the moves that are fast but not that fast.
  const smear =
    t > 60
      ? airborne
        ? clamp((bodySpeed - 0.42) / 0.4, 0, 1)
        : frame.pose === 'run'
          ? clamp((bodySpeed - 0.85) / 0.4, 0, 1)
          : 0
      : 0;
  const fast = t > 60 && airborne && bodySpeed > 0.5 && smear < 0.3;
  const vx = trail[0]!.x - trail[2]!.x;
  const vy = trail[0]!.y - trail[2]!.y;
  const heading = (Math.atan2(vy, vx) * 180) / Math.PI;
  const stretch =
    smear > 0
      ? `translate(${trail[0]!.x} ${trail[0]!.y}) rotate(${heading}) scale(${1 + 0.45 * smear} ${1 - 0.16 * smear}) rotate(${-heading}) translate(${-trail[0]!.x} ${-trail[0]!.y})`
      : undefined;
  const before = sampleTimeline(timeline, Math.max(0, t - 60));

  const figure = (f: SceneFrame, opacity = 1, key?: string) => (
    <g key={key} transform={placeHero(f, cam)} opacity={opacity}>
      <Hero
        avatar={avatar}
        pose={f.crouch ? 'crouch' : f.pose}
        expression={f.crouch ? 'determined' : f.expr}
        size={size}
        shadow={false}
        pet={false}
        wind={wind}
      />
    </g>
  );

  return (
    <div className="scene">
      <div className="scene__world scene__world--layer" style={cameraStyle(frame, heroX, heroY)}>
        <WorldBackdrop
          worldId={worldId}
          height={H}
          horizon={330}
          groundTop={470}
          pathY={SCENE_GROUND}
          scroll={cam}
          smooth={false}
          raster={raster}
          foreground={scene.foreground ?? true}
        >
          <FocusLines cx={heroX} cy={heroY - size * 0.45} t={t} strength={frame.action} />
          <g transform={obstacleAt}>
            <art.back {...propArgs} />
          </g>
          {scene.sign && <Signpost x={scene.sign.x - cam} text={scene.sign.text} />}
          {/* His shadow on the surface under him (none while he hangs from something). */}
          {frame.pose !== 'swing' && frame.pose !== 'climb' && (
            <ellipse
              cx={heroX}
              cy={groundY + 2}
              rx={52 * Math.max(0.4, 1 - (frame.lift - frame.floor) / 250) * frame.squash.sx}
              ry={9}
              fill="rgba(20,10,40,0.22)"
            />
          )}
          {frame.pose === 'run' && frame.lift === frame.floor && (
            <Dust
              x={heroX - flip * 24}
              y={groundY}
              dt={t % 220}
              ms={220}
              size={0.22}
              color={DUST}
            />
          )}
          {frame.landing !== null && (
            <Dust x={heroX} y={groundY} dt={frame.landing} ms={450} size={0.6} color={DUST} />
          )}
          {Math.abs(frame.speed) > 0.45 && frame.pose === 'run' && (
            <DashLines
              x={heroX - flip * size * 0.18}
              feetY={heroY}
              height={size * 0.85}
              t={t}
              dir={frame.speed > 0 ? 1 : -1}
            />
          )}
          {arc && smear === 0 && <MotionTrail points={trail} width={size * 0.42} />}
          <Smear
            now={{ x: heroX, y: heroY }}
            then={{ x: before.x - cam, y: SCENE_GROUND - before.lift }}
            height={size * 0.94}
            bands={smearBands(
              avatar,
              size,
              wornItem(avatar.gear, 'cape')?.color ?? capeColor(avatar.shirt),
            )}
            strength={smear}
          />
          {fast &&
            GHOSTS.map((g) =>
              figure(sampleTimeline(timeline, t - g.ms), g.opacity, `ghost${g.ms}`),
            )}
          <g transform={stretch}>{figure(frame)}</g>
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
          {big && <ImpactFlash dt={big.dt} w={W} h={H} />}
        </WorldBackdrop>
      </div>
      {frame.cutin && (
        <CutIn dt={frame.cutin.dt} ms={frame.cutin.ms} expr={frame.cutin.expr} avatar={avatar} />
      )}
      {frame.showCaption && caption && <div className="scene__caption">{caption}</div>}
    </div>
  );
}

/**
 * Places the hero: his feet at his spot, his body tilted by `lean` (around his hips, or around
 * his hands while he hangs from a vine or a rope so they stay on it), then squashed or stretched
 * around his feet.
 */
function placeHero(f: SceneFrame, cam: number): string {
  const flip = f.facing === 'left' ? -1 : 1;
  const hanging = f.pose === 'swing' || f.pose === 'climb';
  const pivot = hanging ? -REACH_PX : -size * 0.42;
  const feetX = (52 * size) / 170;
  const feetY = (163 * size) / 170;
  return `translate(${f.x - cam} ${SCENE_GROUND - f.lift}) rotate(${flip * f.lean} 0 ${pivot}) scale(${flip * f.squash.sx} ${f.squash.sy}) translate(${-feetX} ${-feetY})`;
}

/**
 * The camera: the script's zoom and tilt, a push-in during focus lines, and shakes, all framed on
 * him. Zooming in moves him toward the middle of the screen, as far as the edges allow; a tilt
 * zooms in enough that no corner shows.
 */
function cameraStyle(f: SceneFrame, heroX: number, heroY: number) {
  const shaking = f.shake.x !== 0 || f.shake.y !== 0;
  let zoom = f.camera.zoom * (1 + PUSH_IN * f.action) * (shaking ? 1.03 : 1);
  const tilt = f.camera.tilt;
  const rad = (Math.abs(tilt) * Math.PI) / 180;
  if (tilt !== 0) zoom = Math.max(zoom, Math.cos(rad) + (W / H) * Math.sin(rad) + 0.03);
  zoom = Math.max(1, zoom);
  if (zoom === 1 && !shaking) return undefined;
  // Frame his body; a big zoom is a close-up, framed on his face.
  const close = Math.max(0, Math.min(1, (zoom - 1.3) / 0.5));
  const fx = heroX;
  const fy = heroY - size * (0.45 + 0.42 * close);
  const k = Math.min(1, (zoom - 1) / 0.4) * (0.7 + 0.25 * close);
  const tx = clamp((W / 2 - fx) * k, -(zoom - 1) * (W - fx), (zoom - 1) * fx);
  const ty = clamp((H / 2 - fy) * k, -(zoom - 1) * (H - fy), (zoom - 1) * fy);
  return {
    transform: `translate(${tx + f.shake.x}px, ${ty + f.shake.y}px) rotate(${tilt}deg) scale(${zoom})`,
    transformOrigin: `${fx}px ${fy}px`,
  };
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
