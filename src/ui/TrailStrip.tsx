import { useEffect, useId, useState } from 'react';
import { CHASER_BOX } from '../art/chaserData';
import { Chaser } from '../art/chasers';
import type { AvatarConfig } from '../art/hero/avatar';
import { Hero, type HeroPose } from '../art/hero/Hero';
import { OBSTACLES } from '../art/obstacles/registry';
import type { ObstacleArt, ObstacleId } from '../art/obstacles/types';
import { getTheme } from '../art/worlds/themes';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import { CONFIG } from '../game/config';
import type { SessionState } from '../game/session';
import { chaserFront, heroX as trailX, TRAIL_END } from './trailLayout';

interface Props {
  worldId: number;
  /** The obstacle waiting at the end of the trail (a flag if there is none). */
  obstacle?: ObstacleId;
  avatar: AvatarConfig;
  /** 0..1, how far along the trail the hero is. */
  progress: number;
  /** 0..1, how much of the page time has gone (moves the danger behind him). */
  elapsed: number;
  /** The latest answer feedback; each new `seq` triggers a walk or stumble. */
  feedback?: SessionState['feedback'];
  /** Whether the sun (the page timer) is moving. */
  running: boolean;
  /** Pose once the page is over. */
  endPose?: HeroPose;
}

const HEIGHT = 240;
const PATH_Y = 206;
const HERO_SIZE = 116;
/** How far the far scenery drifts over a whole page. */
const CAMERA_TRAVEL = 700;
/** The obstacle preview is drawn at the same scale as the strip's hero (116px vs 200px). */
const GOAL_SCALE = 0.58;
/** How long a walk step or stumble plays, in ms. */
const MOVE_MS = { correct: 560, wrong: 650, reveal: 650 } as const;
const CHASER_SCALE = 0.85;

/**
 * The scene at the top of the page. The hero walks toward the obstacle a step
 * per correct answer and stumbles on a miss; the sun crossing the sky is the timer.
 */
export function TrailStrip({
  worldId,
  obstacle,
  avatar,
  progress,
  elapsed,
  feedback,
  running,
  endPose,
}: Props) {
  // The pose plays until its time is up; only the timer callback sets state.
  const [settledSeq, setSettledSeq] = useState(0);
  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setSettledSeq(feedback.seq), MOVE_MS[feedback.kind]);
    return () => clearTimeout(id);
  }, [feedback]);

  const moving = feedback && feedback.seq !== settledSeq ? feedback.kind : null;
  let pose: HeroPose = 'idle';
  if (moving === 'correct') pose = 'walk';
  else if (moving) pose = 'stumble';
  else if (endPose) pose = endPose;

  const heroX = trailX(progress);
  return (
    <div className="trail">
      <WorldBackdrop
        worldId={worldId}
        height={HEIGHT}
        horizon={120}
        groundTop={168}
        pathY={PATH_Y}
        detail={0.55}
        scroll={progress * CAMERA_TRAVEL}
        parallax={{ near: 0 }}
      >
        <Goal obstacle={obstacle} />
      </WorldBackdrop>
      <div
        className={getTheme(worldId).kind === 'mine' ? 'trail__sun trail__sun--mine' : 'trail__sun'}
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
          transform: `translateX(${chaserFront(progress, elapsed) - CHASER_BOX.w * CHASER_SCALE}px)`,
          top: PATH_Y + 6 - CHASER_BOX.ground * CHASER_SCALE,
        }}
      >
        <Chaser worldId={worldId} scale={CHASER_SCALE} />
      </div>
      <div
        className="trail__hero"
        style={{
          transform: `translateX(${heroX}px)`,
          top: PATH_Y - (HERO_SIZE * 163) / 170,
        }}
      >
        <Hero
          key={moving === 'wrong' || moving === 'reveal' ? `s${feedback?.seq}` : 'hero'}
          avatar={avatar}
          pose={pose}
          size={HERO_SIZE}
        />
      </div>
    </div>
  );
}

/**
 * A small, still preview of the obstacle ahead, so kids can see where they're heading. `art`
 * draws it in another style (the M7b painted test).
 */
export function Goal({ obstacle, art: drawn }: { obstacle?: ObstacleId; art?: ObstacleArt }) {
  const clipId = useId();
  if (!obstacle) {
    return (
      <g transform={`translate(${TRAIL_END + 110} ${PATH_Y - 92})`}>
        <rect x={-5} y={0} width={10} height={96} rx={4} fill="#7a4a24" />
        <path d="M4 4 L 74 22 L 4 42 Z" fill="#e8743b" />
      </g>
    );
  }
  const art = drawn ?? OBSTACLES[obstacle];
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
