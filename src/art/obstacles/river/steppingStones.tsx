import { memo, useId } from 'react';
import { ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import {
  bump,
  clamp01,
  easeOut,
  fallen,
  heroPasses,
  lerp,
  noise,
  roundPath,
  since,
} from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { FOAM, ROCK, MOSS } from './kit';
import { STONES } from './layout';
import { River, Bank, Splash, CurlWave } from './parts';

// ---------- Level 17: stepping stones ----------
// surge (a wave rolls in behind him) → s1..s4 (each stone tips and sinks after he leaves it)
// → crash (the wave breaks on the bank behind him).

/** Bubbles rising where something has gone under at (x, y). */
function Bubbles({ x, y, dt }: { x: number; y: number; dt: number }) {
  if (!(dt >= 0 && dt < 900)) return null;
  return (
    <g fill="none" stroke={FOAM} strokeWidth={2}>
      {[0, 1, 2, 3].map((i) => {
        const ph = ((dt + i * 150) % 600) / 600;
        return (
          <circle
            key={i}
            cx={x + (noise(i, 2) - 0.5) * 34}
            cy={y - ph * 16}
            r={2 + ph * 4}
            opacity={(1 - ph) * (1 - dt / 900)}
          />
        );
      })}
    </g>
  );
}

const STONE_EDGE = roundPath([
  [-44, 34],
  [-43, 12],
  [-30, 2],
  [0, -2],
  [28, 1],
  [42, 10],
  [46, 34],
  [40, 74],
  [-38, 74],
]);

/** A stepping stone with its top at (0, 0): mossy, wet and shiny. */
const Stone = memo(function Stone({ i }: { i: number }) {
  const m = 6 + 10 * noise(i, 3);
  return (
    <g>
      <path d={STONE_EDGE} fill={ROCK} {...ink(OUT)} />
      <path d="M-43 13 Q-47 34 -40 56 L-24 56 Q-32 34 -29 9 Z" fill={shade(ROCK, 0.3)} />
      <path
        d="M-12 22 l7 9 l-3 10"
        stroke={shade(ROCK, 0.45)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M-34 7 Q-22 -6 ${m} -3 Q${m - 10} 3 -10 6 Q-14 14 -20 9 Q-26 12 -34 7 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <path
        d="M-28 3 Q-18 -3 -6 -2"
        stroke={tint(MOSS, 0.45)}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M16 0 Q36 3 43 17"
        stroke={tint(ROCK, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={20} cy={9} rx={8} ry={2.6} fill="#ffffff" opacity={0.65} />
    </g>
  );
});

export function SteppingStonesBack(p: ObstacleProps) {
  const clip = useId();
  const [a, b] = STONES.channel;
  const sunk = STONES.stones.map((x, i) => {
    const landAt = eventTime(p.events, `s${i + 1}`);
    const dt = p.t - heroPasses(p, x + 30, landAt) - 120;
    return { land: p.t - landAt, dt, sink: fallen(dt, 0.0006) };
  });
  return (
    <g>
      <River a={a} b={b} level={10} t={p.t} white={clamp01(since(p, 'surge') / 800) * 0.6} />
      <clipPath id={clip}>
        <rect x={a} y={-400} width={b - a} height={416} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        {STONES.stones.map((x, i) => {
          const { land, dt, sink } = sunk[i]!;
          if (sink > 110) return null;
          const tilt = dt > 0 ? Math.min(25, dt * 0.05) * (i % 2 ? 1 : -1) : 0;
          // It bobs on the current, and dips under him as he lands.
          const y = -STONES.top + 1.5 * Math.sin(p.t / 380 + i * 2) + 5 * bump(land, 220) + sink;
          return (
            <g key={x} transform={`translate(${x} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)})`}>
              <Stone i={i} />
            </g>
          );
        })}
      </g>
      {/* Foam rings where the stones meet the water, and bubbles as each one goes under. */}
      {STONES.stones.map((x, i) => {
        const { dt, sink } = sunk[i]!;
        const ring = 1 - clamp01((sink - 20) / 40);
        return (
          <g key={x}>
            {ring > 0 && (
              <ellipse
                cx={x}
                cy={11}
                rx={52 - 12 * (1 - ring)}
                ry={5}
                fill="none"
                stroke={FOAM}
                strokeWidth={4}
                opacity={0.9 * ring}
              />
            )}
            <Bubbles x={x} y={10} dt={dt - 500} />
          </g>
        );
      })}
      <Bank x={a} dir={1} />
      <Bank x={b} dir={-1} />
    </g>
  );
}

export function SteppingStonesFront(p: ObstacleProps) {
  const clip = useId();
  const surgeAt = eventTime(p.events, 'surge');
  const crashAt = eventTime(p.events, 'crash');
  if (p.t < surgeAt) return null;
  const [a, b] = STONES.channel;
  const k = clamp01((p.t - surgeAt) / (crashAt - surgeAt));
  // It rolls along the channel but never catches him (it rears up while he stops).
  const x = Math.min(lerp(STONES.waveStart, b - 60, k), p.heroX - 190);
  const after = p.t - crashAt;
  // It bursts up out of the river at the bank, then follows him.
  const h =
    after < 0 ? 200 * easeOut(clamp01((p.t - surgeAt) / 400)) : 200 * (1 - clamp01(after / 500));
  return (
    <g>
      <Splash x={a + 50} y={4} dt={p.t - surgeAt} size={1.5} />
      <clipPath id={clip}>
        <rect x={a - 4} y={-600} width={b - a + 300} height={900} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <CurlWave x={x} level={16} h={h} t={p.t} />
      </g>
      <Splash x={b - 60} y={-30} dt={after} size={1.6} />
    </g>
  );
}
