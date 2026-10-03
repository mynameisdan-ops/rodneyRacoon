import { memo, useId } from 'react';
import { INK, ink, PROP_IN as IN, shade, tint } from '../../style';
import { PAINTED_RIVER } from '../../worlds/riverPalette';
import { clamp01, easeOut, lerp, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { LEAF } from './kit';
import { RISING } from './layout';
import { River, Splash, CurlWave } from './parts';

// ---------- Level 23: rising water ----------
// flood (a wall of water pours in) → he climbs the root ladder → safe (up on the ledge).

const P = PAINTED_RIVER;

const ROOT = '#7a5234';

/** The cliff and its high ledge running on to the right (painted), with grass and ferns on top. */
const RisingCliff = memo(function RisingCliff() {
  const id = useId();
  const { cliff, ledge } = RISING;
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-ledge} x2="0" y2={10}>
          <stop offset="0" stopColor={P.cliffLight} />
          <stop offset="0.25" stopColor={P.cliff} />
          <stop offset="1" stopColor={P.cliffDark} />
        </linearGradient>
      </defs>
      <path
        d={`M${cliff - 6} 8 Q${cliff - 2} ${-ledge * 0.5} ${cliff + 8} ${-ledge + 6} L${cliff + 14} ${-ledge} H2400 V8 Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${cliff - 6} 8 Q${cliff - 2} ${-ledge * 0.5} ${cliff + 8} ${-ledge + 6} L${cliff + 30} ${-ledge + 10} Q${cliff + 18} ${-ledge * 0.5} ${cliff + 24} 8 Z`}
        fill={P.cliffDark}
        opacity={0.5}
      />
      <g stroke={P.cliffDark} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.4}>
        <path d={`M${cliff + 40} ${-ledge + 70} q160 14 320 -2 T${cliff + 900} ${-ledge + 66}`} />
        <path
          d={`M${cliff + 30} ${-ledge + 150} q180 12 360 -4 T${cliff + 1000} ${-ledge + 146}`}
        />
        <path d={`M${cliff + 50} ${-ledge + 230} q140 10 280 -2 T${cliff + 860} ${-ledge + 226}`} />
        <path
          d={`M${cliff + 120} ${-ledge + 90} l20 30 l-8 26 M${cliff + 420} ${-ledge + 170} l-16 28`}
        />
      </g>
      <g fill={P.moss}>
        <path d={`M${cliff + 60} ${-ledge + 150} q40 -16 80 0 q-40 10 -80 0 Z`} />
        <path d={`M${cliff + 300} ${-ledge + 70} q30 -12 60 0 q-30 8 -60 0 Z`} />
        <path d={`M${cliff + 200} -40 q50 -18 100 0 q-50 12 -100 0 Z`} />
      </g>
      {/* The grassy top of the ledge. */}
      <path
        d={`M${cliff + 8} ${-ledge + 4} Q${cliff + 10} ${-ledge - 8} ${cliff + 30} ${-ledge - 6} H2400 V${-ledge + 18} H${cliff + 40} Q${cliff + 20} ${-ledge + 22} ${cliff + 8} ${-ledge + 4} Z`}
        fill={P.groundTop}
      />
      <path
        d={`M${cliff + 40} ${-ledge + 14} H2400 V${-ledge + 22} H${cliff + 44} Z`}
        fill={P.grass}
      />
      <g fill={P.grass}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = cliff + 50 + i * 130 + noise(i, 3) * 40;
          return (
            <path
              key={i}
              d={`M${x - 8} ${-ledge - 4} Q${x - 4} ${-ledge - 18} ${x - 10} ${-ledge - 26} Q${x} ${-ledge - 16} ${x + 1} ${-ledge - 4} Q${x + 4} ${-ledge - 20} ${x + 10} ${-ledge - 22} Q${x + 6} ${-ledge - 12} ${x + 8} ${-ledge - 4} Z`}
            />
          );
        })}
      </g>
      <g>
        {[0, 1, 2, 3].map((i) => {
          const x = cliff + 110 + i * 210;
          return (
            <g key={i}>
              <path d={`M${x} ${-ledge - 4} V${-ledge - 14}`} stroke="#3f8a3a" strokeWidth={2} />
              <circle cx={x} cy={-ledge - 17} r={4.4} fill={P.flowers[i % 4]} />
              <circle cx={x} cy={-ledge - 17} r={1.6} fill="#ffc531" />
            </g>
          );
        })}
      </g>
    </g>
  );
});

/** The root ladder hanging down the cliff (lined: he climbs it), with leaves and vine ties. */
const RootLadder = memo(function RootLadder() {
  const { ledge, ladder } = RISING;
  const rails = [
    `M${ladder - 22} ${-ledge - 4} Q${ladder - 34} ${-ledge * 0.7} ${ladder - 20} ${-ledge * 0.45} Q${ladder - 10} ${-ledge * 0.22} ${ladder - 24} 2`,
    `M${ladder + 22} ${-ledge - 4} Q${ladder + 12} ${-ledge * 0.7} ${ladder + 24} ${-ledge * 0.45} Q${ladder + 32} ${-ledge * 0.22} ${ladder + 20} 2`,
  ];
  const rungs = Array.from({ length: 7 }, (_, i) => -20 - i * 42);
  return (
    <g>
      {rungs.map((y) => (
        <path
          key={y}
          d={`M${ladder - 26} ${y} Q${ladder} ${y + 4} ${ladder + 26} ${y}`}
          stroke={INK}
          strokeWidth={8.4}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {rungs.map((y) => (
        <path
          key={`f${y}`}
          d={`M${ladder - 26} ${y} Q${ladder} ${y + 4} ${ladder + 26} ${y}`}
          stroke={shade(ROOT, 0.1)}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {rails.map((d) => (
        <g key={d}>
          <path d={d} stroke={INK} strokeWidth={12} strokeLinecap="round" fill="none" />
          <path d={d} stroke={ROOT} strokeWidth={8} strokeLinecap="round" fill="none" />
          <path
            d={d}
            transform="translate(2 -1)"
            stroke={tint(ROOT, 0.4)}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ))}
      {/* Vines tying the rungs on, and leaves sprouting from the roots. */}
      {rungs.map((y, i) =>
        [-1, 1].map((side) => (
          <path
            key={`${y}${side}`}
            d={`M${ladder + side * 25} ${y - 6} l${-side * 4} 6 l${side * 5} 4`}
            stroke="#3f8f3a"
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
            opacity={i % 2 ? 1 : 0.85}
          />
        )),
      )}
      {[
        [ladder - 32, -ledge * 0.72, -140],
        [ladder + 30, -ledge * 0.5, -30],
        [ladder - 30, -ledge * 0.3, 200],
        [ladder + 28, -ledge * 0.15, 10],
      ].map(([x, y, rot], i) => (
        <path
          key={i}
          d="M0 0 Q7 -5.5 16 0 Q7 5.5 0 0 Z"
          transform={`translate(${x} ${y}) rotate(${rot})`}
          fill={i % 2 ? LEAF : tint(LEAF, 0.25)}
          {...ink(IN)}
        />
      ))}
    </g>
  );
});

export function RisingBack(p: ObstacleProps) {
  const { cliff } = RISING;
  const flood = since(p, 'flood');
  // The water climbs after him but stays below his feet, rising up the cliff once he's safe.
  const rise = lerp(80, -240, easeOut(clamp01(flood / 2600)));
  const level = flood < 0 ? 80 : Math.max(rise, -p.heroLift + 60);
  // A wall of water rushes in from the left as the flood begins, then sinks into the rising pool.
  const front = clamp01(flood / 650);
  const waveH = flood < 0 ? 0 : 150 * clamp01(flood / 200) * (1 - clamp01((flood - 600) / 400));
  return (
    <g>
      <RisingCliff />
      <RootLadder />
      {flood >= 0 && (
        <River a={-700} b={cliff + 4} level={level} t={p.t} flow={0.8} white={0.8} shore={false} />
      )}
      <CurlWave x={lerp(-760, -20, easeOut(front))} level={level + 6} h={waveH} t={p.t} />
      <Splash x={40} y={Math.min(level, 40)} dt={flood - 600} size={1.6} />
    </g>
  );
}
