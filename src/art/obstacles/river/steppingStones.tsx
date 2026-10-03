import { ink, tint } from '../../style';
import { clamp01, fallen, lerp, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { ROCK } from './kit';
import { STONES } from './layout';
import { River, Splash, Bank, CurlWave } from './parts';

// ---------- Level 17: stepping stones ----------
// surge (a wave rolls in behind him) → s1..s4 (each stone tips and sinks after he leaves it)
// → crash (the wave breaks on the bank behind him).

export function SteppingStonesBack(p: ObstacleProps) {
  const [a, b] = STONES.channel;
  return (
    <g>
      <River a={a} b={b} level={10} t={p.t} white={clamp01(since(p, 'surge') / 800) * 0.6} />
      <Bank x={a} dir={1} />
      <Bank x={b} dir={-1} />
      {STONES.stones.map((x, i) => {
        const dt = since(p, `s${i + 1}`) - 120;
        const sink = fallen(dt, 0.0006);
        const tilt = dt > 0 ? Math.min(25, dt * 0.05) * (i % 2 ? 1 : -1) : 0;
        if (sink > 120) return null;
        return (
          <g key={x} transform={`translate(${x} ${-STONES.top + sink}) rotate(${tilt})`}>
            <path
              d="M-46 4 Q-50 -2 -36 -8 Q0 -16 36 -8 Q50 -2 46 4 L40 60 L-40 60 Z"
              fill={ROCK}
              {...ink(3)}
            />
            <path d="M-36 -8 Q0 -16 36 -8 L30 0 Q0 -6 -30 0 Z" fill={tint(ROCK, 0.35)} />
            <path d="M-40 30 H40" stroke="#5f8a4a" strokeWidth={6} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

export function SteppingStonesFront(p: ObstacleProps) {
  const surgeAt = eventTime(p.events, 'surge');
  const crashAt = eventTime(p.events, 'crash');
  if (p.t < surgeAt) return null;
  const [, b] = STONES.channel;
  const k = clamp01((p.t - surgeAt) / (crashAt - surgeAt));
  const x = lerp(STONES.waveStart, b - 60, k);
  const after = p.t - crashAt;
  const h = after < 0 ? 200 * clamp01(k * 3) : 200 * (1 - clamp01(after / 500));
  return (
    <g>
      <CurlWave x={x} level={16} h={h} t={p.t} />
      <Splash x={b - 60} y={-40} dt={after} size={1.6} />
    </g>
  );
}
