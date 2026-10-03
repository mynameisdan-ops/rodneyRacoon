import { memo, useId } from 'react';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { PAINTED_RIVER } from '../../worlds/riverPalette';
import { fallen, heroPasses, roundPath, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { WATER, LIGHT, FOAM, SPRAY_SHADE, ROCK, MOSS } from './kit';
import { FALLS } from './layout';
import { River, Bank, Splash } from './parts';

// ---------- Level 22: waterfall slide ----------
// crack (the top rock breaks) → he slides down the chute → launch (off the lip, over the pool).

/** The cliff behind the falls (painted): rock lit from the right, with ledges, moss and ferns. */
const P = PAINTED_RIVER;

const FallsCliff = memo(function FallsCliff() {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P.cliffDark} />
          <stop offset="0.5" stopColor={P.cliff} />
          <stop offset="0.9" stopColor={P.cliff} />
          <stop offset="1" stopColor={P.cliffLight} />
        </linearGradient>
      </defs>
      <path
        d="M30 6 L44 -900 L452 -900 Q440 -600 456 -420 Q470 -320 440 -250 L420 6 Z"
        fill={`url(#${id})`}
      />
      {/* Cracks running down it, and strata across it. */}
      <g stroke={P.cliffDark} fill="none" strokeLinecap="round" opacity={0.45}>
        <path d="M120 -900 q14 160 -6 330 q-12 150 6 300" strokeWidth={4} />
        <path d="M230 -900 q-10 120 8 260 q14 120 -4 220" strokeWidth={3} />
        <path d="M380 -780 q12 140 -8 260 q-10 100 6 200" strokeWidth={3.5} />
        <path d="M70 -330 q10 120 -4 230" strokeWidth={3} />
      </g>
      <g stroke={P.cliffDark} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.3}>
        <path d="M60 -620 q120 14 240 0 M50 -520 q140 12 260 -4 M70 -410 q90 10 170 0 M60 -180 q60 8 90 0" />
      </g>
      {/* Ledges, lit along the top with a shadow under, and tufts of grass on them. */}
      {[
        [56, -700, 90],
        [250, -560, 110],
        [44, -380, 80],
        [330, -440, 90],
        [150, -250, 70],
      ].map(([x, y, w]) => (
        <g key={`${x}${y}`}>
          <path
            d={`M${x} ${y! + 4} h${w} q-${w! * 0.5} 10 -${w} 6 Z`}
            fill={P.cliffDark}
            opacity={0.5}
          />
          <path
            d={`M${x} ${y} h${w}`}
            stroke={P.cliffLight}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <path
            d={`M${x! + w! * 0.3} ${y} q-4 -14 -10 -18 q10 4 14 14 q2 -12 10 -16 q-4 8 -4 20 Z`}
            fill={P.reed}
          />
        </g>
      ))}
      <g fill={P.moss}>
        <path d="M44 -460 q40 -14 80 0 q-40 10 -80 0 Z" />
        <path d="M380 -330 q30 -12 60 0 q-30 8 -60 0 Z" />
        <path d="M50 -250 q30 -10 60 0 q-30 8 -60 0 Z" />
      </g>
      <g fill={P.reed}>
        <path d="M416 -300 q20 -30 34 -20 q-14 4 -20 24 Z M420 -296 q26 -10 30 6 q-14 -8 -30 -6 Z" />
        <path d="M54 -330 q-20 -30 -30 -16 q12 2 18 22 Z" />
      </g>
    </g>
  );
});

/** A rock step `lift` px tall, its top at -lift, from -50 to 40 (lined: he jumps on it). */
const StepRock = memo(function StepRock({ lift }: { lift: number }) {
  const edge = roundPath([
    [-50, 8],
    [-52, -lift * 0.5],
    [-46, -lift + 2],
    [-10, -lift - 2],
    [30, -lift],
    [42, -lift + 8],
    [44, -lift * 0.4],
    [40, 8],
  ]);
  return (
    <g>
      <path d={edge} fill={ROCK} {...ink(OUT)} />
      <path
        d={`M-50 0 Q-52 ${-lift * 0.5} -44 ${-lift + 6} L-32 ${-lift + 6} Q-38 ${-lift * 0.5} -34 2 Z`}
        fill={shade(ROCK, 0.3)}
      />
      <path
        d={`M6 ${-lift - 1} Q34 ${-lift} 41 ${-lift + 12}`}
        stroke={tint(ROCK, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M-42 ${-lift + 2} Q-24 ${-lift - 8} -6 ${-lift - 2} Q-18 ${-lift + 4} -28 ${-lift + 6} Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <path
        d={`M-8 ${-lift * 0.6} l7 10 l-3 10`}
        stroke={shade(ROCK, 0.45)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** The chute: a smooth wet rock slope with water rushing down it (lined: he slides on it). */
const ChuteRock = memo(function ChuteRock() {
  const [[c0x, c0l], [c1x, c1l]] = FALLS.chute;
  return (
    <g>
      <path
        d={`M${c0x - 20} ${-c0l} L${c1x} ${-c1l} Q${c1x + 14} ${-c1l - 2} ${c1x + 22} ${-c1l + 8} L${c1x + 24} 6 L${c0x - 20} 6 Z`}
        fill={shade(ROCK, 0.08)}
        {...ink(OUT)}
      />
      <path
        d={`M${c0x - 20} ${-c0l + 30} L${c1x - 60} ${-c1l + 40} L${c1x - 40} 6 L${c0x - 20} 6 Z`}
        fill={shade(ROCK, 0.3)}
      />
      {/* Strata running along the slope, and a few cracks. */}
      <g
        stroke={shade(ROCK, 0.35)}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      >
        {[34, 78, 130].map((d) => (
          <path key={d} d={`M${c0x - 6} ${-c0l + d} L${c1x - d * 1.6} ${-c1l + d * 0.7}`} />
        ))}
      </g>
      <g stroke={shade(ROCK, 0.45)} strokeWidth={IN} fill="none" strokeLinecap="round">
        <path
          d={`M${c0x + 40} ${-c0l + 70} l18 22 l-6 18 M${c0x + 220} ${-c0l + 120} l14 20 M${c1x - 180} ${-c1l + 30} l10 16 l-4 14`}
        />
      </g>
      <path
        d={`M${c0x - 18} ${-c0l + 4} L${c1x - 4} ${-c1l + 4}`}
        stroke={tint(ROCK, 0.5)}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M${c0x + 60} ${-c0l + 120} q30 -20 60 -16 q-20 14 -60 16 Z M${c1x - 120} ${-c1l + 40} q24 -14 50 -10 q-20 10 -50 10 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
    </g>
  );
});

export function FallsBack(p: ObstacleProps) {
  const [[c0x, c0l], [c1x, c1l]] = FALLS.chute;
  const [p0, p1] = FALLS.pool;
  const crack = since(p, 'crack');
  // How long since he slid off the top (the cracked corner falls then).
  const fall = Math.max(0, p.t - heroPasses(p, c0x, eventTime(p.events, 'crack')));
  return (
    <g>
      <FallsCliff />
      {/* The waterfall pouring down the cliff onto the top of the chute. */}
      <rect x={c0x - 10} y={-900} width={70} height={900 - c0l} fill={P.fall} />
      <rect x={c0x - 10} y={-900} width={14} height={900 - c0l} fill="#ffffff" opacity={0.6} />
      <rect x={c0x + 44} y={-900} width={16} height={900 - c0l} fill={LIGHT} opacity={0.7} />
      <g stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeDasharray="34 50">
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${c0x + 8 + i * 16} -900 V${-c0l - 10}`}
            strokeDashoffset={-(p.t * 0.9 + i * 30)}
          />
        ))}
      </g>
      <g>
        {[0, 1, 2, 3].map((i) => {
          const ph = ((p.t + i * 120) % 480) / 480;
          return (
            <g key={i} opacity={1 - ph * 0.6}>
              <circle
                cx={c0x + 4 + i * 16}
                cy={-c0l - 8 - ph * 10}
                r={10 + ph * 5}
                fill={SPRAY_SHADE}
              />
              <circle cx={c0x + 5 + i * 16} cy={-c0l - 10 - ph * 10} r={9 + ph * 4} fill={FOAM} />
            </g>
          );
        })}
      </g>
      {FALLS.steps.map(([x, lift]) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <StepRock lift={lift} />
        </g>
      ))}
      <ChuteRock />
      {/* Water rushing down the chute. */}
      <path
        d={`M${c0x - 18} ${-c0l - 7} L${c1x + 10} ${-c1l - 7}`}
        stroke={WATER}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d={`M${c0x - 16} ${-c0l - 11} L${c1x + 8} ${-c1l - 11}`}
        stroke={LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d={`M${c0x} ${-c0l - 8} L${c1x} ${-c1l - 8}`}
        stroke={FOAM}
        strokeWidth={3}
        strokeDasharray="20 30"
        strokeDashoffset={-p.t * 0.6}
        strokeLinecap="round"
      />
      {/* The pool he flies over. */}
      <River a={p0} b={p1} level={8} t={p.t} white={0.5} />
      <Bank x={p0} dir={1} level={8} />
      <Bank x={p1} dir={-1} level={8} />
      {/* The corner of the top rock cracks, and tumbles away as he slides off. */}
      <g
        transform={`translate(${(c0x - 52 - fall * 0.06).toFixed(1)} ${(-c0l + 2 + fallen(fall, 0.002)).toFixed(1)}) rotate(${(-Math.max(0, fall) * 0.12).toFixed(1)})`}
      >
        <path
          d="M-20 2 Q-22 -12 -12 -20 Q2 -26 14 -20 Q22 -12 20 2 Z"
          fill={ROCK}
          {...ink(OUT - 0.4)}
        />
        <path d="M-20 2 Q-22 -12 -12 -20 L-6 -18 Q-14 -8 -10 2 Z" fill={shade(ROCK, 0.3)} />
        <path
          d="M2 -23 Q16 -20 20 -8"
          stroke={tint(ROCK, 0.6)}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
        {crack >= 0 && (
          <path
            d="M-4 -24 L2 -14 L-3 -7 L4 2"
            stroke={INK}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
          />
        )}
      </g>
      <Splash x={c1x + 60} y={4} dt={since(p, 'launch')} size={1.2} />
    </g>
  );
}
