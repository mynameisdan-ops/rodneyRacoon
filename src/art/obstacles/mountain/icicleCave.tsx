import { memo, useId } from 'react';
import { ink, PROP_IN as IN, PROP_OUT as OUT, tint } from '../../style';
import { circles, clamp01, fallen, heroPasses, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { ICE, ICE_DEEP, ICE_LIGHT, NS, P } from './kit';
import { ICICLES } from './layout';
import { Icicles, SnowBurst } from './parts';

// ---------- Level 30: icicle cave ----------
// rumble (the icicles shiver) → fall (each icicle drops once he's `behind` px past it, so they
// crash down in a wave right behind him as he dashes through).

const [A, B] = ICICLES.cave;
const TOP = -ICICLES.ceiling;
const G = 0.004;

/** The icicles along the ceiling: where each hangs and how long it is. */
const LIST = Array.from({ length: Math.floor((B - 40 - (A + 60)) / 110) + 1 }, (_, i) => ({
  x: A + 60 + i * 110,
  len: 100 + 70 * noise(i, 2),
}));

/** The ceiling's wavy underside at x. */
const ceilingAt = (x: number) => TOP + 10 * Math.sin(x / 70) + 6 * Math.sin(x / 23);

/** The cave (painted): its glowing ice walls, light falling through cracks, an icy floor. */
const Cave = memo(function Cave() {
  const id = useId();
  let under = '';
  for (let x = B - 40; x >= A + 40; x -= 20) under += ` L${x} ${ceilingAt(x).toFixed(1)}`;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}glow`} cx="0.5" cy="0.85" r="0.75">
          <stop offset="0" stopColor="#d4f6ff" />
          <stop offset="0.45" stopColor="#6ec4ec" />
          <stop offset="1" stopColor="#2a62a8" />
        </radialGradient>
        <linearGradient
          id={`${id}outer`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-900}
          x2="0"
          y2={0}
        >
          <stop offset="0" stopColor="#bfe2f8" />
          <stop offset="1" stopColor="#5f9bd0" />
        </linearGradient>
        <linearGradient id={`${id}beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* The back wall glowing blue, ice columns and frost on it, and the floor's sheen. */}
      <path
        d={`M${A - 40} -12 L${A + 40} ${TOP - 40} H${B - 40} L${B + 40} -12 Z`}
        fill={`url(#${id}glow)`}
      />
      <g fill={ICE_LIGHT} opacity={0.35}>
        {[0.12, 0.3, 0.52, 0.7, 0.88].map((f, i) => {
          const x = A + (B - A) * f;
          return (
            <path
              key={f}
              d={`M${x - 18} -12 Q${x - 26} ${TOP / 2} ${x - 12} ${TOP + 20} L${x + 14} ${TOP + 20} Q${x + 24} ${TOP / 2} ${x + 20} -12 Z`}
              opacity={0.6 + 0.4 * noise(i, 3)}
            />
          );
        })}
      </g>
      <g fill="#ffffff" opacity={0.28}>
        {[0.2, 0.45, 0.62, 0.8].map((f, i) => {
          const x = A + (B - A) * f;
          return <path key={f} d={`M${x} ${-60 - 80 * noise(i, 5)} l40 -70 l30 30 l-24 90 Z`} />;
        })}
      </g>
      <g stroke="#e6f9ff" strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.5}>
        {[0.16, 0.4, 0.66, 0.9].map((f) => {
          const x = A + (B - A) * f;
          return <path key={f} d={`M${x} -140 q20 -20 40 0 t40 0 M${x + 20} -200 q16 -14 32 0`} />;
        })}
      </g>
      {/* Light falling through cracks in the roof. */}
      <g fill={`url(#${id}beam)`}>
        {[0.28, 0.58, 0.83].map((f) => {
          const x = A + (B - A) * f;
          return (
            <path
              key={f}
              d={`M${x - 14} ${TOP} L${x + 14} ${TOP} L${x + 110} -12 L${x + 30} -12 Z`}
            />
          );
        })}
      </g>
      <path d={`M${A - 30} -14 H${B + 30} V14 H${A - 30} Z`} fill="#bfeaff" opacity={0.45} />
      <path
        d={`M${A} -4 H${B}`}
        stroke="#ffffff"
        strokeWidth={3}
        strokeDasharray="60 40 20 50"
        opacity={0.7}
      />
      {/* The ice around the tunnel: outer faces, the roof's thickness and its wavy underside. */}
      <path
        d={`M${A - 150} -12 Q${A - 120} -300 ${A - 60} ${TOP - 120} L${A - 40} -900 H${B + 40} L${B + 60} ${TOP - 120} Q${B + 120} -300 ${B + 150} -12 L${B + 40} -12 Q${B + 10} ${TOP + 60} ${B - 40} ${ceilingAt(B - 40).toFixed(1)}${under} Q${A + 10} ${TOP + 60} ${A - 40} -12 Z`}
        fill={`url(#${id}outer)`}
      />
      <path
        d={`M${A - 40} -12 Q${A + 10} ${TOP + 60} ${A + 40} ${ceilingAt(A + 40).toFixed(1)}`}
        stroke="#e6f9ff"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${B + 40} -12 Q${B + 10} ${TOP + 60} ${B - 40} ${ceilingAt(B - 40).toFixed(1)}`}
        stroke="#2a5c9c"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
      <g fill="#e6f8ff" opacity={0.45}>
        <path
          d={`M${A - 110} -40 Q${A - 90} -260 ${A - 50} ${TOP - 100} L${A - 30} ${TOP - 40} Q${A - 70} -200 ${A - 80} -40 Z`}
        />
        <path
          d={`M${B + 60} ${TOP - 100} Q${B + 100} -260 ${B + 120} -40 L${B + 90} -40 Q${B + 80} -220 ${B + 44} ${TOP - 40} Z`}
        />
      </g>
      <Icicles x0={A + 40} x1={B - 40} y={TOP + 6} len={24} seed={9} />
      {/* Snow banked against the cave's sides outside. */}
      <path
        d={`M${A - 220} -12 Q${A - 160} -60 ${A - 110} -40 Q${A - 90} -30 ${A - 60} -12 Z`}
        fill={P.snowTop}
      />
      <path
        d={`M${B + 60} -12 Q${B + 100} -40 ${B + 140} -50 Q${B + 200} -60 ${B + 240} -12 Z`}
        fill={P.snowTop}
      />
    </g>
  );
});

/** A big icicle (lined): its top at (0, 0), `len` long, ridged, shining down its lit side. */
const Icicle = memo(function Icicle({ len }: { len: number }) {
  return (
    <g>
      <path
        d={`M-17 0 Q-14 ${len * 0.4} -3 ${len - 6} L0 ${len} L3 ${len - 6} Q12 ${len * 0.4} 17 0 Z`}
        fill={ICE}
        {...ink(OUT)}
        {...NS}
      />
      <path
        d={`M4 2 Q10 ${len * 0.4} 2 ${len - 8} L0 ${len - 2} Q-2 ${len * 0.5} -4 2 Z`}
        fill={ICE_DEEP}
        opacity={0.45}
      />
      <path
        d={`M-9 6 Q-8 ${len * 0.35} -3 ${len * 0.7}`}
        stroke="#ffffff"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M-15 ${len * 0.18} Q0 ${len * 0.22} 14 ${len * 0.18} M-11 ${len * 0.42} Q0 ${len * 0.46} 10 ${len * 0.42}`}
        stroke={tint(ICE_DEEP, 0.3)}
        strokeWidth={IN}
        fill="none"
        {...NS}
      />
    </g>
  );
});

/** Shards of ice flung out where an icicle smashed at x, and the heap it leaves. */
function Smash({ x, dt, i }: { x: number; dt: number; i: number }) {
  const shards = Array.from({ length: 8 }, (_, k) => {
    const a = -Math.PI * (0.12 + (0.76 * k) / 7);
    const v = 0.35 + 0.25 * noise(k + i * 9, 3);
    const s = 5 + 5 * noise(k + i * 9, 5);
    const px = x + Math.cos(a) * v * dt;
    const py = Math.min(-s, -4 + Math.sin(a) * v * dt + 0.0016 * dt * dt);
    return `M${(px - s).toFixed(1)} ${py.toFixed(1)} L${px.toFixed(1)} ${(py - s * 1.4).toFixed(1)} L${(px + s).toFixed(1)} ${py.toFixed(1)} Z`;
  });
  return (
    <g>
      <path
        d={`M${x - 34} 0 L${x - 26} -16 L${x - 10} -12 L${x - 4} -26 L${x + 10} -14 L${x + 24} -20 L${x + 32} 0 Z`}
        fill={ICE}
        {...ink(IN)}
      />
      <path
        d={`M${x - 26} -16 L${x - 10} -12 L${x - 4} -26 L${x + 10} -14 L${x + 2} -6 L${x - 18} -6 Z`}
        fill={ICE_LIGHT}
      />
      <path
        d={`M${x - 10} -12 L${x - 6} 0 M${x + 10} -14 L${x + 14} 0`}
        stroke={ICE_DEEP}
        strokeWidth={1.4}
      />
      {dt < 900 && (
        <path d={shards.join('')} fill={ICE} opacity={1 - clamp01((dt - 600) / 300)} {...ink(IN)} />
      )}
    </g>
  );
}

export function IcicleCaveBack(p: ObstacleProps) {
  const fallAt = eventTime(p.events, 'fall');
  const rumble = since(p, 'rumble');
  return (
    <g>
      <Cave />
      {LIST.map(({ x, len }, i) => {
        // Each drops once he is safely past it.
        const dropAt = heroPasses(p, x + ICICLES.behind, fallAt);
        const dt = p.t - dropAt;
        const top = ceilingAt(x) - 4;
        const drop = top + len;
        const landAt = Math.sqrt(-drop / G);
        if (dt >= landAt) {
          return (
            <g key={x}>
              <Smash x={x} dt={dt - landAt} i={i} />
              <SnowBurst x={x} y={-4} dt={dt - landAt} size={0.5} ms={600} />
            </g>
          );
        }
        // They shiver in the rumble, then hang still (a still roof is far cheaper to draw).
        const shiver = rumble >= 0 && dt < 0 ? 1 - clamp01((rumble - 900) / 500) : 0;
        const wobble = shiver > 0 ? 3 * shiver * Math.sin(p.t / 28 + i * 2) : 0;
        return (
          <g
            key={x}
            transform={`translate(${x} ${(top + fallen(dt, G)).toFixed(1)}) rotate(${wobble.toFixed(1)})`}
          >
            <Icicle len={len} />
          </g>
        );
      })}
      {/* Chips of ice and snow sifting down from the roof in the rumble. */}
      {rumble >= 0 && rumble < 2200 && (
        <path
          d={circles(
            Array.from({ length: 10 }, (_, i) => {
              const ph = ((rumble + i * 170) % 700) / 700;
              return { x: A + 100 + i * 105 + 10 * noise(i, 4), y: TOP + 20 + ph * 380, r: 3 };
            }),
          )}
          fill="#ffffff"
          opacity={0.85}
        />
      )}
    </g>
  );
}
