import { Dust, SpeedLines } from '../../fx';
import { ink, shade } from '../../style';
import { bump, lerp, rollAngle, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { BARK } from './kit';
import { LOG_ROLL } from './layout';
import { LeafBurst } from './parts';

// ---------- Level 9: log roll ----------
// rumble (a huge log rolls up behind him) → ride (he runs on top) → hit (it slams into a stump).

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

function Log({ x }: { x: number }) {
  const { r } = LOG_ROLL;
  const spin = rollAngle(x - LOG_ROLL.logStart, r);
  return (
    <g transform={`translate(${x} ${-r})`}>
      <circle r={r} fill={BARK} {...ink(4)} />
      <circle r={r - 10} fill="#d9a86a" {...ink(2)} />
      <g transform={`rotate(${spin})`} fill="none" stroke={shade('#d9a86a', 0.35)} strokeWidth={3}>
        <circle r={r - 24} />
        <circle r={r - 38} />
        <path d={`M0 0 L${r - 12} 6`} strokeWidth={4} stroke={shade('#d9a86a', 0.5)} />
        <circle r={5} fill={shade('#d9a86a', 0.4)} />
      </g>
      <path
        d={`M${-r * 0.7} ${r * 0.55} A${r} ${r} 0 0 0 ${r * 0.55} ${r * 0.7}`}
        stroke={shade(BARK, 0.4)}
        strokeWidth={8}
        fill="none"
      />
    </g>
  );
}

function Stump({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M-50 4 L-44 -96 L44 -96 L52 4 Z" fill={BARK} {...ink(3.5)} />
      <path d="M10 -96 L44 -96 L52 4 L18 4 Z" fill={shade(BARK, 0.35)} />
      <ellipse cx={0} cy={-96} rx={44} ry={12} fill="#d9a86a" {...ink(3)} />
      <ellipse
        cx={0}
        cy={-96}
        rx={26}
        ry={6}
        fill="none"
        stroke={shade('#d9a86a', 0.35)}
        strokeWidth={2}
      />
      <path
        d="M-50 4 Q-70 -4 -76 6 M52 4 Q70 -2 78 8"
        stroke={BARK}
        strokeWidth={8}
        strokeLinecap="round"
      />
    </g>
  );
}

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
