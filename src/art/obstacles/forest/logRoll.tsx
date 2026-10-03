import { memo } from 'react';
import { Dust, SpeedLines } from '../../fx';
import { ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { bump, lerp, noise, rollAngle, roundPath, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { BARK, MOSS } from './kit';
import { LOG_ROLL } from './layout';
import { LeafBurst } from './parts';

// ---------- Level 9: log roll ----------
// rumble (a huge log rolls up behind him) → ride (he runs on top) → hit (it slams into a stump).

const HEART = '#e8b878';

const SPEED_YS = [-60, -90, -120, -40];

function logX(p: ObstacleProps) {
  const rumbleAt = eventTime(p.events, 'rumble');
  const rideAt = eventTime(p.events, 'ride');
  const hitAt = eventTime(p.events, 'hit');
  if (p.t < rumbleAt) return null;
  if (p.t < rideAt) {
    const target = p.heroAt(rideAt).x;
    return lerp(LOG_ROLL.logStart, target, (p.t - rumbleAt) / (rideAt - rumbleAt));
  }
  if (p.t < hitAt) return Math.min(p.heroX, LOG_ROLL.stop);
  return LOG_ROLL.stop - 18 * bump(p.t - hitAt, 350);
}

const LR = LOG_ROLL.r;
/** The log's bark rim, a little lumpy, seen end-on. */
const LOG_EDGE = roundPath(
  Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const m = 1 + 0.035 * noise(i, 8);
    return [Math.cos(a) * LR * m, Math.sin(a) * LR * m] as const;
  }),
);
const FACE = LR - 13;

/** The log rolling end-on: its bark, moss and the rings of its cut face turn as it rolls. */
function Log({ x }: { x: number }) {
  const spin = rollAngle(x - LOG_ROLL.logStart, LR);
  return (
    <g transform={`translate(${x} ${-LR})`}>
      <g transform={`rotate(${spin})`}>
        <LogTurning />
      </g>
      <LogLight />
    </g>
  );
}

const LogTurning = memo(function LogTurning() {
  return (
    <g>
      <path d={LOG_EDGE} fill={BARK} {...ink(OUT + 1)} />
      <g stroke={shade(BARK, 0.45)} strokeWidth={IN} strokeLinecap="round">
        {Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + 0.1;
          return (
            <path
              key={i}
              d={`M${Math.cos(a) * (LR - 5)} ${Math.sin(a) * (LR - 5)} L${Math.cos(a) * (LR + 1)} ${Math.sin(a) * (LR + 1)}`}
            />
          );
        })}
      </g>
      {/* Moss and a little mushroom riding round on the bark. */}
      <path
        d={`M${-LR * 0.98} ${-LR * 0.2} A${LR} ${LR} 0 0 1 ${-LR * 0.55} ${-LR * 0.84} L${-LR * 0.5} ${-LR * 0.74} A${LR - 10} ${LR - 10} 0 0 0 ${-LR * 0.86} ${-LR * 0.17} Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <g transform={`rotate(-58) translate(0 ${-LR - 1})`}>
        <path d="M-3 0 Q-4 -7 -2 -11 L2 -11 Q4 -7 3 0 Z" fill="#f3e6cf" {...ink(1.2)} />
        <path
          d="M-11 -9 Q-10 -21 0 -22 Q10 -21 11 -9 Q0 -12 -11 -9 Z"
          fill="#e2452f"
          {...ink(1.4)}
        />
        <circle cx={-3} cy={-16} r={2} fill="#fff" />
        <circle cx={4} cy={-13} r={1.6} fill="#fff" />
      </g>
      {/* The cut face: rings, a crack, the heart. */}
      <circle r={FACE} fill={HEART} {...ink(IN + 0.5)} />
      <g fill="none" stroke={shade(HEART, 0.28)} strokeWidth={IN}>
        <circle r={FACE - 14} />
        <circle r={FACE - 28} />
        <circle r={FACE - 42} />
      </g>
      <path
        d={`M2 -2 L${FACE - 6} 6 M${FACE * 0.45} 2 l8 -9`}
        stroke={shade(HEART, 0.5)}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <circle r={4.5} fill={shade(HEART, 0.42)} />
    </g>
  );
});

const LogLight = memo(function LogLight() {
  return (
    <g>
      <path
        d={`M${-FACE * 0.97} ${FACE * 0.24} A${FACE} ${FACE} 0 0 0 ${FACE * 0.3} ${FACE * 0.95} Q${-FACE * 0.45} ${FACE * 0.62} ${-FACE * 0.97} ${FACE * 0.24} Z`}
        fill={shade(HEART, 0.3)}
        opacity={0.55}
      />
      <path
        d={`M${LR * 0.15} ${-LR * 0.9} A${LR * 0.92} ${LR * 0.92} 0 0 1 ${LR * 0.88} ${-LR * 0.26}`}
        stroke={tint(BARK, 0.5)}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

/** The stump the log slams into: bark, a cut top with rings, moss, roots and mushrooms. */
const Stump = memo(function Stump({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-46 2 Q-70 -4 -86 8 L-58 8 Z" fill={BARK} {...ink(IN + 0.8)} />
      <path d="M46 2 Q72 -6 88 8 L56 8 Z" fill={BARK} {...ink(IN + 0.8)} />
      <path d="M-50 4 L-44 -96 L44 -96 L52 4 Z" fill={BARK} {...ink(OUT)} />
      <path d="M-50 4 L-44 -96 L-22 -96 L-26 4 Z" fill={shade(BARK, 0.3)} />
      <path d="M40 -88 L46 -4" stroke={tint(BARK, 0.5)} strokeWidth={2.4} strokeLinecap="round" />
      <g stroke={shade(BARK, 0.45)} strokeWidth={IN} strokeLinecap="round" fill="none">
        <path d="M-8 -80 q4 30 -2 60 M18 -70 q-4 24 2 52 M-30 -60 q3 20 -1 40" />
      </g>
      <ellipse cx={0} cy={-96} rx={44} ry={12} fill={HEART} {...ink(OUT - 0.6)} />
      <g fill="none" stroke={shade(HEART, 0.3)} strokeWidth={IN}>
        <ellipse cx={0} cy={-96} rx={30} ry={7.5} />
        <ellipse cx={0} cy={-96} rx={15} ry={3.6} />
      </g>
      <path
        d="M-44 -96 Q-40 -110 -18 -106 Q-30 -100 -26 -92 Q-38 -92 -44 -96 Z"
        fill={MOSS}
        {...ink(IN)}
      />
      <g transform="translate(-58 6)">
        <path d="M-3 0 Q-4 -9 -2 -14 L2 -14 Q4 -9 3 0 Z" fill="#f3e6cf" {...ink(1.3)} />
        <path
          d="M-12 -12 Q-11 -26 0 -27 Q11 -26 12 -12 Q0 -15 -12 -12 Z"
          fill="#e8a33a"
          {...ink(1.5)}
        />
        <circle cx={-3} cy={-20} r={2.2} fill="#fff" />
      </g>
    </g>
  );
});

export function LogRollBack(p: ObstacleProps) {
  const x = logX(p);
  return (
    <g>
      <Stump x={LOG_ROLL.stump} />
      {x !== null && <Log x={x} />}
      <Dust x={LOG_ROLL.logStart + 300} y={-4} dt={since(p, 'rumble') - 200} ms={900} size={1.2} />
      <Dust x={LOG_ROLL.stump - 60} y={-10} dt={since(p, 'hit')} ms={800} size={1.2} />
      <LeafBurst x={LOG_ROLL.stump} y={-120} dt={since(p, 'hit')} count={12} />
    </g>
  );
}

export function LogRollFront(p: ObstacleProps) {
  const riding = since(p, 'ride') >= 0 && since(p, 'hit') < 0;
  return riding ? <SpeedLines x={p.heroX - 80} t={p.t} ys={SPEED_YS} /> : null;
}
