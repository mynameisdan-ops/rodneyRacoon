import { useEffect, useId, useState } from 'react';
import { CHASER_BOX } from '../art/chaserData';
import { Chaser } from '../art/chasers';
import { DashLines, Dust, EmoteSign, Smear } from '../art/fx';
import type { AvatarConfig } from '../art/hero/avatar';
import { capeColor, SCENE_SIZE, smearBands } from '../art/hero/body';
import { CutIn } from '../art/hero/CutIn';
import type { Expression } from '../art/hero/expressions';
import { Hero, type HeroPose } from '../art/hero/Hero';
import { OBSTACLES } from '../art/obstacles/registry';
import type { ObstacleId } from '../art/obstacles/registry';
import { getWorldArt } from '../art/worlds/registry';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import { wornItem } from '../content/shop';
import { CONFIG } from '../game/config';
import type { SessionState } from '../game/session';
import { CUTIN_COMBOS, STRIP_MS, stripMotion } from './stripMotion';
import { chaserFront, heroX as trailX, TRAIL_END } from './trailLayout';

/*
 * The scene at the top of the page: the hero on the trail toward the obstacle, the danger
 * behind him, and the sun crossing the sky (the page timer). Every answer is a little moment
 * (M7b): a right one is a crouch and a dash with dust, speed lines and a smear, then a springy
 * landing and a smile; a wrong one a stumble, a sweat drop and a shake of the strip; 5, 10 and 15
 * in a row slam in a cut-in of his face. His face watches the danger: calm when he's ahead,
 * worried when it's close.
 */

const HEIGHT = 240;
const PATH_Y = 206;
const CAMERA_TRAVEL = 700;
const CHASER_SCALE = 0.85;
/** The strip draws him at 116/200 of his cut-scene size. */
const SIZE = (116 / 200) * SCENE_SIZE;
/** The obstacle preview is drawn at the same scale as the strip's hero. */
const GOAL_SCALE = 116 / 200;
/** Closer than this (px) and he starts to look worried. */
const DANGER = 170;

interface Props {
  worldId: number;
  /** The obstacle waiting at the end of the trail (a flag if there is none). */
  obstacle?: ObstacleId;
  avatar: AvatarConfig;
  /** 0..1, how far along the trail the hero is. */
  progress: number;
  /** 0..1, how much of the page time has gone (moves the danger behind him). */
  elapsed: number;
  /** The latest answer feedback; each new `seq` plays a dash or a stumble. */
  feedback?: SessionState['feedback'];
  /** Whether the sun (the page timer) is moving. */
  running: boolean;
  /** Pose once the page is over. */
  endPose?: HeroPose;
  /** Right answers in a row (5, 10 and 15 get the cut-in). */
  combo?: number;
  /** Screenshots (the dev strip demo): hold the moment `dt` ms after an answer from `from`. */
  debug?: { dt: number; from: number };
}

/** Milliseconds since the answer numbered `seq` (0 right after it changes), on animation frames. */
function useSinceAnswer(seq: number): number {
  const [clock, setClock] = useState({ seq: 0, dt: Infinity });
  useEffect(() => {
    if (seq === 0) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - start;
      setClock({ seq, dt });
      if (dt < 1500) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seq]);
  return clock.seq === seq ? clock.dt : 0;
}

export function TrailStrip({
  worldId,
  obstacle,
  avatar,
  progress,
  elapsed,
  feedback,
  running,
  endPose,
  combo = 0,
  debug,
}: Props) {
  const seq = feedback?.seq ?? 0;
  // Where he dashes from: the spot he had reached before this answer.
  const [track, setTrack] = useState({ seq, from: progress, to: progress });
  if (seq !== track.seq) setTrack({ seq, from: track.to, to: progress });
  const live = useSinceAnswer(seq);
  const dt = debug ? debug.dt : seq === 0 ? Infinity : live;
  const from = debug ? debug.from : track.from;
  const kind = feedback?.kind ?? null;
  const m = stripMotion(kind, dt, from, progress, endPose);

  const x = trailX(m.pos);
  const chaser = chaserFront(progress, elapsed);
  const happyAfter = kind === 'correct' && m.landing !== null;
  let expr: Expression = 'calm';
  if (endPose === 'cheer') expr = 'happy';
  else if (m.dash !== null || m.pose === 'crouch') expr = 'determined';
  else if (m.pose === 'stumble') expr = 'worried';
  else if (happyAfter) expr = 'happy';
  else if (running && x - chaser < DANGER) expr = 'worried';

  const feetX = (52 * SIZE) / 170;
  const feetY = (163 * SIZE) / 170;
  const cape = wornItem(avatar.gear, 'cape')?.color ?? capeColor(avatar.shirt);
  const dashStart = trailX(from);
  const smear = m.dash === null ? 0 : Math.sin(Math.PI * m.dash);
  const behind = trailX(stripMotion(kind, dt - 60, from, progress).pos);
  const sinceLanding = dt - STRIP_MS.crouch - STRIP_MS.dash;
  const cutin = kind === 'correct' && (CUTIN_COMBOS as readonly number[]).includes(combo);

  return (
    <div className="trail">
      <div
        className="trail__shake"
        style={m.shake ? { transform: `translateX(${m.shake}px)` } : undefined}
      >
        <WorldBackdrop
          worldId={worldId}
          height={HEIGHT}
          horizon={120}
          groundTop={168}
          pathY={PATH_Y}
          detail={0.55}
          scroll={m.pos * CAMERA_TRAVEL}
          parallax={{ near: 0 }}
          smooth={false}
          raster
        >
          <Goal obstacle={obstacle} />
          {kind === 'correct' && (
            <Dust
              x={dashStart - 10}
              y={PATH_Y}
              dt={dt - STRIP_MS.crouch}
              ms={420}
              size={0.32}
              color="#dcc89a"
            />
          )}
          {m.landing !== null && (
            <Dust x={x} y={PATH_Y} dt={m.landing} ms={360} size={0.22} color="#dcc89a" />
          )}
          {m.dash !== null && (
            <DashLines x={x - SIZE * 0.2} feetY={PATH_Y} height={SIZE * 0.8} t={dt} dir={1} />
          )}
          <Smear
            now={{ x, y: PATH_Y }}
            then={{ x: behind, y: PATH_Y }}
            height={SIZE * 0.94}
            bands={smearBands(avatar, SIZE, cape)}
            strength={smear}
          />
          <ellipse cx={x} cy={PATH_Y + 2} rx={28 * m.squash.sx} ry={5} fill="rgba(20,10,40,0.22)" />
          <g
            transform={`translate(${x} ${PATH_Y}) rotate(${m.lean} 0 ${-SIZE * 0.42}) scale(${m.squash.sx} ${m.squash.sy}) translate(${-feetX} ${-feetY})`}
          >
            <Hero
              key={m.pose === 'stumble' ? `s${seq}` : 'hero'}
              avatar={avatar}
              pose={m.pose}
              expression={expr}
              size={SIZE}
              shadow={false}
              wind={Math.round(m.wind * 10) / 10}
            />
          </g>
          {/* A little sparkle when he lands, a sweat drop when he slips. */}
          {kind === 'correct' && sinceLanding >= 0 && sinceLanding < 900 && (
            <g transform={`translate(${x} ${PATH_Y - SIZE * 0.95}) scale(0.55)`}>
              <EmoteSign emote="sparkle" x={0} y={0} dt={sinceLanding} />
            </g>
          )}
          {kind !== 'correct' && kind !== null && dt < 1000 && (
            <g transform={`translate(${x} ${PATH_Y - SIZE * 0.95}) scale(0.55)`}>
              <EmoteSign emote="sweat" x={0} y={0} dt={dt} />
            </g>
          )}
        </WorldBackdrop>
        <div
          className={
            getWorldArt(worldId).timer === 'lantern' ? 'trail__sun trail__sun--mine' : 'trail__sun'
          }
          style={{
            animationDuration: `${CONFIG.pageSeconds}s`,
            animationPlayState: running ? 'running' : 'paused',
          }}
        />
        <div
          className={[
            'trail__chaser',
            running ? '' : 'chaser--still',
            endPose === 'cheer' ? 'trail__chaser--gone' : '',
          ].join(' ')}
          style={{
            transform: `translateX(${chaser - CHASER_BOX.w * CHASER_SCALE}px)`,
            top: PATH_Y + 6 - CHASER_BOX.ground * CHASER_SCALE,
          }}
        >
          <Chaser art={getWorldArt(worldId).chaser} scale={CHASER_SCALE} />
        </div>
      </div>
      {cutin && <CutIn dt={dt} ms={STRIP_MS.cutin} expr="shout" avatar={avatar} layout="strip" />}
    </div>
  );
}

/** A small, still preview of the obstacle ahead, so kids can see where they're heading. */
function Goal({ obstacle }: { obstacle?: ObstacleId }) {
  const clipId = useId();
  if (!obstacle) {
    return (
      <g transform={`translate(${TRAIL_END + 110} ${PATH_Y - 92})`}>
        <rect x={-5} y={0} width={10} height={96} rx={4} fill="#7a4a24" />
        <path d="M4 4 L 74 22 L 4 42 Z" fill="#e8743b" />
      </g>
    );
  }
  const art = OBSTACLES[obstacle];
  const still = {
    t: 0,
    state: 'idle',
    since: 0,
    events: [],
    heroX: -1000,
    heroLift: 0,
    heroAt: () => ({ x: -1000, lift: 0 }),
  };
  // Show the obstacle from its focus point on, clipped to the end of the trail.
  const x = TRAIL_END + 80 - (art.focus ?? 0) * GOAL_SCALE;
  return (
    <g clipPath={`url(#${clipId})`}>
      <defs>
        <clipPath id={clipId}>
          <rect x={TRAIL_END + 40} y={0} width={400} height={HEIGHT} />
        </clipPath>
      </defs>
      <g transform={`translate(${x} ${PATH_Y}) scale(${GOAL_SCALE})`}>
        <art.back {...still} />
        {art.front && <art.front {...still} />}
      </g>
    </g>
  );
}
