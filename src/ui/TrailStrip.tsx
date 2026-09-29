import { useEffect, useState } from 'react';
import type { AvatarConfig } from '../art/hero/avatar';
import { Hero, type HeroPose } from '../art/hero/Hero';
import { OBSTACLES } from '../art/obstacles/registry';
import type { ObstacleId } from '../art/obstacles/types';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import { CONFIG } from '../game/config';
import type { SessionState } from '../game/session';

interface Props {
  worldId: number;
  /** The obstacle waiting at the end of the trail (a flag if there is none). */
  obstacle?: ObstacleId;
  avatar: AvatarConfig;
  /** 0..1, how far along the trail the hero is. */
  progress: number;
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
const TRAIL_START = 70;
const TRAIL_END = 1030;
/** How far the far scenery drifts over a whole page. */
const CAMERA_TRAVEL = 700;
/** The obstacle preview is drawn at the same scale as the strip's hero (116px vs 200px). */
const GOAL_SCALE = 0.58;
/** How long a walk step or stumble plays, in ms. */
const MOVE_MS = { correct: 560, wrong: 650, reveal: 650 } as const;

/**
 * The scene at the top of the page. The hero walks toward the obstacle a step
 * per correct answer and stumbles on a miss; the sun crossing the sky is the timer.
 */
export function TrailStrip({
  worldId,
  obstacle,
  avatar,
  progress,
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

  const heroX = TRAIL_START + (TRAIL_END - TRAIL_START) * progress;
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
        className="trail__sun"
        style={{
          animationDuration: `${CONFIG.pageSeconds}s`,
          animationPlayState: running ? 'running' : 'paused',
        }}
      />
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

/** A small, still preview of the obstacle ahead, so kids can see where they're heading. */
function Goal({ obstacle }: { obstacle?: ObstacleId }) {
  if (!obstacle) {
    return (
      <g transform={`translate(${TRAIL_END + 110} ${PATH_Y - 92})`}>
        <rect x={-5} y={0} width={10} height={96} rx={4} fill="#7a4a24" />
        <path d="M4 4 L 74 22 L 4 42 Z" fill="#e8743b" />
      </g>
    );
  }
  const art = OBSTACLES[obstacle];
  const still = { t: 0, state: 'idle', since: 0, events: [], heroX: -1000, heroLift: 0 };
  return (
    <g transform={`translate(${TRAIL_END + 80} ${PATH_Y}) scale(${GOAL_SCALE})`}>
      <art.back {...still} />
      {art.front && <art.front {...still} />}
    </g>
  );
}
