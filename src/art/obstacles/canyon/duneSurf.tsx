import { Dust, SpeedLines } from '../../fx';
import { ink, shade } from '../../style';
import { clamp01, lerp, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { SAND } from './kit';
import { DUNE } from './layout';
import { SandStreaks } from './parts';

// ---------- Level 35: dune surf ----------
// storm (a sandstorm rolls in) → board (he jumps on at the crest) → land → off.

/** Ground height along a piecewise-linear profile of [x, lift] points. */
function profileLift(profile: readonly (readonly [number, number])[], x: number) {
  if (x <= profile[0]![0]) return 0;
  for (let i = 1; i < profile.length; i++) {
    const [x0, l0] = profile[i - 1]!;
    const [x1, l1] = profile[i]!;
    if (x <= x1) return lerp(l0, l1, (x - x0) / (x1 - x0));
  }
  return 0;
}

function boardPose(p: ObstacleProps) {
  const boardAt = eventTime(p.events, 'board');
  const offAt = eventTime(p.events, 'off');
  const riding = p.t >= boardAt && p.t < offAt;
  const x = p.t < boardAt ? DUNE.board : Math.min(p.heroX, DUNE.stop);
  const lift = riding ? p.heroLift - DUNE.seat : profileLift(DUNE.profile, x);
  const ground = profileLift(DUNE.profile, x);
  const onSlope = x > 520 && x < 1300 && lift - ground < 4;
  return { x, lift, tilt: onSlope ? 14 : 0, riding };
}

export function DuneBack(p: ObstacleProps) {
  const storm = clamp01(since(p, 'storm') / 900) - clamp01(since(p, 'land') / 1200);
  const profile = DUNE.profile.map(([x, l]) => `${x} ${-l}`).join(' L');
  return (
    <g>
      <rect x={-600} y={-900} width={3400} height={1200} fill="#b8783a" opacity={0.35 * storm} />
      {/* The sandstorm: a towering brown cloud rolling in behind him. */}
      {storm > 0 && (
        <g opacity={storm} fill="#c08850">
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={-500 + i * 140 + since(p, 'storm') * 0.15}
              cy={-160 - (i % 2) * 140}
              r={180 + noise(i) * 60}
            />
          ))}
        </g>
      )}
      <path d={`M-40 4 L${profile} L2600 0 V240 H-40 Z`} fill={SAND} {...ink(3.5)} />
      <path
        d={`M60 ${-profileLift(DUNE.profile, 60) + 24} Q300 -150 460 -176 M600 -170 Q900 -80 1240 ${-profileLift(DUNE.profile, 1240) + 20}`}
        stroke={shade(SAND, 0.15)}
        strokeWidth={10}
        fill="none"
      />
      <SandStreaks t={p.t} strength={storm} />
    </g>
  );
}

export function DuneFront(p: ObstacleProps) {
  const b = boardPose(p);
  const landAt = eventTime(p.events, 'land');
  return (
    <g>
      {b.riding && <SpeedLines x={b.x - 110} t={p.t} ys={[-30, -60, -90]} />}
      <g transform={`translate(${b.x} ${-b.lift}) rotate(${b.tilt})`}>
        <path d="M-70 -2 Q-80 -14 -60 -16 H60 Q80 -14 72 -2 Z" fill="#3a86ff" {...ink(3)} />
        <path d="M-50 -10 H50" stroke="#ffffff" strokeWidth={4} />
      </g>
      {b.riding && (
        <Dust x={b.x - 70} y={-b.lift} dt={p.t % 300} ms={300} size={0.35} color={SAND} />
      )}
      <Dust x={b.x} y={-b.lift} dt={p.t - landAt} ms={700} size={1.1} color={SAND} />
    </g>
  );
}
