import { SpeedLines } from '../../fx';
import { INK, ink, shade } from '../../style';
import { clamp01, easeOut, lerp, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { WOOD, BARK } from './kit';
import { RAFT } from './layout';
import { River, Splash, Bank, CurlWave } from './parts';

// ---------- Level 24 (boss): cross the river ----------
// build (logs roll in, a rope binds them, a sail pops up) → sail (push off)
// → wave (a giant wave lifts the raft) → splash → beach.

function raftPose(p: ObstacleProps) {
  const sailAt = eventTime(p.events, 'sail');
  const beachAt = eventTime(p.events, 'beach');
  const riding = p.t >= sailAt && p.t < beachAt;
  const x = p.t < sailAt ? RAFT.raftRest : Math.min(p.heroX, RAFT.beach);
  const deckY = riding ? -p.heroLift : -RAFT.deck + 3 * Math.sin(p.t / 300);
  const waveAt = eventTime(p.events, 'wave');
  const splashAt = eventTime(p.events, 'splash');
  let tilt = 0;
  if (p.t >= waveAt && p.t < splashAt)
    tilt = (p.t - waveAt) / (splashAt - waveAt) < 0.55 ? -14 : 12;
  return { x, deckY, tilt, riding };
}

export function RaftBack(p: ObstacleProps) {
  const [a, b] = RAFT.river;
  const waveAt = eventTime(p.events, 'wave');
  const splashAt = eventTime(p.events, 'splash');
  const raft = raftPose(p);
  const sail = easeOut(clamp01((since(p, 'build') - 1150) / 300));
  const inWave = p.t >= waveAt && p.t < splashAt + 700;
  const waveH = inWave ? Math.max(0, -raft.deckY - RAFT.deck) + 40 : 0;
  return (
    <g>
      <River a={a} b={b} level={10} t={p.t} flow={0.5} white={clamp01(since(p, 'sail') / 1000)} />
      <Bank x={a} dir={1} />
      {/* The far beach. */}
      <path
        d={`M${b - 40} 4 Q${b + 20} -6 ${b + 80} -2 L2600 -2 V240 H${b - 60} Z`}
        fill="#e6cf98"
        {...ink(3)}
      />
      {inWave && p.t < splashAt && <CurlWave x={raft.x + 80} level={14} h={waveH} t={p.t} />}
      {/* The mast and sail stand behind him. */}
      <g transform={`translate(${raft.x} ${raft.deckY}) rotate(${raft.tilt})`}>
        {sail > 0 && (
          <g transform={`scale(1 ${sail})`}>
            <path d="M-80 0 V-190" stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <path d="M-80 0 V-190" stroke={WOOD} strokeWidth={5} strokeLinecap="round" />
            <path d="M-74 -180 Q-4 -120 -14 -40 L-74 -40 Z" fill="#f3e6cf" {...ink(3)} />
            <path d="M-58 -140 L-34 -70" stroke="#e8743b" strokeWidth={8} />
          </g>
        )}
      </g>
      <Splash x={raft.x} y={0} dt={p.t - splashAt} size={1.8} />
    </g>
  );
}

export function RaftFront(p: ObstacleProps) {
  const build = since(p, 'build');
  const raft = raftPose(p);
  if (build < 0) return null;
  // Three logs roll in, then the rope wraps them, then the sail pops up.
  const logsIn = [0, 1, 2].map((i) => easeOut(clamp01((build - i * 220) / 400)));
  const rope = clamp01((build - 900) / 250);
  return (
    <g transform={`translate(${raft.x} ${raft.deckY}) rotate(${raft.tilt})`}>
      {logsIn.map((k, i) =>
        k > 0 ? (
          <g key={i} transform={`translate(${lerp(-400 + i * 60, 0, k)} ${i * 2})`}>
            <rect
              x={-110}
              y={i * 12}
              width={220}
              height={20}
              rx={10}
              fill={i % 2 ? BARK : shade(BARK, 0.15)}
              {...ink(2.5)}
            />
            <ellipse cx={110} cy={i * 12 + 10} rx={6} ry={10} fill="#d9a86a" {...ink(1.5)} />
          </g>
        ) : null,
      )}
      {rope > 0 &&
        [-70, 70].map((x) => (
          <path
            key={x}
            d={`M${x} -2 V${38 * rope}`}
            stroke="#c9a66b"
            strokeWidth={7}
            strokeLinecap="round"
          />
        ))}
      {raft.riding && <SpeedLines x={-140} t={p.t} ys={[-30, -60, -90]} />}
    </g>
  );
}
