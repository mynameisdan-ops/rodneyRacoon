import { useEffect, useState } from 'react';
import { CHASER_BOX } from '../art/chaserData';
import { Chaser } from '../art/chasers';
import { Dust } from '../art/fx';
import type { AvatarConfig } from '../art/hero/avatar';
import type { Expression } from '../art/hero/expressions';
import type { HeroPose } from '../art/hero/poses';
import { mix, shade } from '../art/style';
import { CutIn } from '../art/toon/CutIn';
import { PAINTED_OBSTACLES } from '../art/toon/paintedObstacles';
import { DashLines, EmoteSign, Smear } from '../art/toon/toonFx';
import { ToonHero } from '../art/toon/ToonHero';
import { smearBands, swingReach } from '../art/toon/toonBuilds';
import type { ObstacleId } from '../art/obstacles/types';
import { getTheme } from '../art/worlds/themes';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import { CONFIG } from '../game/config';
import type { SessionState } from '../game/session';
import { CUTIN_COMBOS, STRIP_MS, stripMotion } from './stripMotion';
import { Goal } from './TrailStrip';
import { chaserFront, heroX as trailX } from './trailLayout';

/*
 * The page strip in the M7b cartoon look (dev builds open it with ?toon): the painted world, the
 * new hero, and every answer as a little moment. A right answer is a crouch and a dash with dust,
 * speed lines and a smear, then a springy landing and a smile; a wrong one a stumble, a sweat drop
 * and a shake of the strip; 5, 10 and 15 in a row slam in a cut-in of his face. His face watches
 * the danger behind him: calm when he's ahead, worried when it's close.
 */

const HEIGHT = 240;
const PATH_Y = 206;
const CAMERA_TRAVEL = 700;
const CHASER_SCALE = 0.85;
/** The strip draws him at 116/200 of his cut-scene size. */
const SIZE = (116 / 200) * ((175 * 170) / swingReach('lean'));
/** Closer than this (px) and he starts to look worried. */
const DANGER = 170;

interface Props {
  worldId: number;
  obstacle?: ObstacleId;
  avatar: AvatarConfig;
  progress: number;
  elapsed: number;
  feedback?: SessionState['feedback'];
  running: boolean;
  endPose?: HeroPose;
  /** Right answers in a row (5, 10 and 15 get the cut-in). */
  combo?: number;
  /** Screenshots: hold the moment `dt` ms after an answer that moved him from `from`. */
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

export function ToonTrailStrip({
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
  const cape = mix(shade(avatar.shirt, 0.45), '#2a1f4a', 0.35);
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
          painted
          raster
        >
          <Goal obstacle={obstacle} art={obstacle && PAINTED_OBSTACLES[obstacle]} />
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
            <ToonHero
              key={m.pose === 'stumble' ? `s${seq}` : 'hero'}
              avatar={avatar}
              build="lean"
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
            getTheme(worldId).kind === 'mine' ? 'trail__sun trail__sun--mine' : 'trail__sun'
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
          <Chaser worldId={worldId} scale={CHASER_SCALE} />
        </div>
      </div>
      {cutin && (
        <CutIn
          dt={dt}
          ms={STRIP_MS.cutin}
          expr="shout"
          avatar={avatar}
          build="lean"
          layout="strip"
        />
      )}
    </div>
  );
}
