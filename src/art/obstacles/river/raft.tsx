import { memo, useId } from 'react';
import { SpeedLines } from '../../fx';
import { INK, ink, mix, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { PAINTED_RIVER } from '../../worlds/riverPalette';
import { clamp01, easeOut, lerp, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { DEEP, FOAM, BARK, HEART, WOOD, ROPE, NS } from './kit';
import { RAFT } from './layout';
import { River, Bank, Splash, CurlWave } from './parts';

// ---------- Level 24 (boss): cross the river ----------
// build (logs roll in, a rope binds them, a sail pops up) → sail (push off)
// → wave (a giant wave lifts the raft) → splash → beach.

const P = PAINTED_RIVER;

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

/** The far beach (painted): sand rising out of the water, pebbles, a tuft of reeds. */
const Beach = memo(function Beach() {
  const id = useId();
  const b = RAFT.river[1];
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-8} x2="0" y2={120}>
          <stop offset="0" stopColor={P.sandLight} />
          <stop offset="0.35" stopColor={P.sand} />
          <stop offset="1" stopColor={P.sandDark} />
        </linearGradient>
      </defs>
      <path
        d={`M${b - 40} 6 Q${b + 20} -6 ${b + 80} -2 L2600 -2 V240 H${b - 60} Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${b - 40} 6 Q${b + 20} -6 ${b + 80} -2`}
        stroke={mix(P.sand, DEEP, 0.3)}
        strokeWidth={4}
        fill="none"
      />
      <path
        d={`M${b - 54} 10 Q${b - 20} 2 ${b + 10} 4`}
        stroke={FOAM}
        strokeWidth={3}
        fill="none"
      />
      <g fill={P.sandDark}>
        {[30, 90, 160, 240, 330].map((dx, i) => (
          <ellipse key={dx} cx={b + dx} cy={14 + (i % 3) * 22} rx={5 + (i % 2) * 3} ry={2.6} />
        ))}
      </g>
      <g fill={P.reed}>
        {[120, 300].map((dx) => (
          <path
            key={dx}
            d={`M${b + dx - 10} -2 Q${b + dx - 8} -26 ${b + dx - 16} -40 Q${b + dx - 2} -26 ${b + dx} -2 Q${b + dx + 4} -30 ${b + dx + 14} -36 Q${b + dx + 6} -20 ${b + dx + 8} -2 Z`}
          />
        ))}
      </g>
    </g>
  );
});

/** The raft's three logs, side by side, with their cut ends and rope bindings (lined). */
function RaftLog({ i }: { i: number }) {
  return (
    <g>
      <rect
        x={-110}
        y={i * 12}
        width={220}
        height={20}
        rx={10}
        fill={i % 2 ? BARK : shade(BARK, 0.12)}
        {...ink(OUT - 0.6)}
      />
      <path
        d={`M-100 ${i * 12 + 5} H96`}
        stroke={tint(BARK, 0.4)}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <ellipse cx={110} cy={i * 12 + 10} rx={6} ry={10} fill={HEART} {...ink(IN)} />
      <ellipse
        cx={110}
        cy={i * 12 + 10}
        rx={2.6}
        ry={4.6}
        fill="none"
        stroke={shade(HEART, 0.35)}
        strokeWidth={1}
      />
    </g>
  );
}
const MemoRaftLog = memo(RaftLog);

/** The mast and sail, standing on the deck at x -80 (lined), with a pennant at the top. */
const RaftSail = memo(function RaftSail() {
  return (
    <g>
      <path d="M-80 0 V-190" stroke={INK} strokeWidth={9} strokeLinecap="round" {...NS} />
      <path d="M-80 0 V-190" stroke={WOOD} strokeWidth={5} strokeLinecap="round" {...NS} />
      <path d="M-74 -180 Q-2 -120 -12 -40 L-74 -40 Z" fill="#f6ead2" {...ink(OUT)} {...NS} />
      <path d="M-74 -180 Q-40 -150 -30 -110 L-74 -100 Z" fill={shade('#f6ead2', 0.12)} />
      <path d="M-74 -128 L-20 -96" stroke="#e8743b" strokeWidth={9} />
      <path d="M-74 -86 L-14 -60" stroke="#3aa0d8" strokeWidth={7} />
      <rect
        x={-60}
        y={-70}
        width={16}
        height={14}
        fill="#f2c94c"
        transform="rotate(-8 -52 -63)"
        {...ink(IN)}
        {...NS}
      />
      <path d="M-80 -190 L-50 -182 L-80 -172 Z" fill="#e8463a" {...ink(IN)} {...NS} />
    </g>
  );
});

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
      <Beach />
      {inWave && p.t < splashAt && <CurlWave x={raft.x + 80} level={14} h={waveH} t={p.t} />}
      {/* The mast and sail stand behind him. */}
      <g
        transform={`translate(${raft.x.toFixed(1)} ${raft.deckY.toFixed(1)}) rotate(${raft.tilt})`}
      >
        {sail > 0.01 && (
          <g transform={`scale(1 ${sail.toFixed(3)})`}>
            <RaftSail />
          </g>
        )}
      </g>
      <Splash x={raft.x} y={6} dt={p.t - splashAt} size={1.8} />
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
    <g transform={`translate(${raft.x.toFixed(1)} ${raft.deckY.toFixed(1)}) rotate(${raft.tilt})`}>
      {logsIn.map((k, i) =>
        k > 0 ? (
          <g key={i} transform={`translate(${lerp(-400 + i * 60, 0, k).toFixed(1)} ${i * 2})`}>
            <MemoRaftLog i={i} />
          </g>
        ) : null,
      )}
      {rope > 0 &&
        [-70, 70].map((x) => (
          <g key={x}>
            <path
              d={`M${x} -2 V${(48 * rope).toFixed(1)}`}
              stroke={INK}
              strokeWidth={10}
              strokeLinecap="round"
            />
            <path
              d={`M${x} -2 V${(48 * rope).toFixed(1)}`}
              stroke={ROPE}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <path
              d={`M${x} -2 V${(48 * rope).toFixed(1)}`}
              stroke={shade(ROPE, 0.35)}
              strokeWidth={6}
              strokeDasharray="2 5"
            />
          </g>
        ))}
      {raft.riding && <SpeedLines x={-140} t={p.t} ys={[-30, -60, -90]} />}
    </g>
  );
}
