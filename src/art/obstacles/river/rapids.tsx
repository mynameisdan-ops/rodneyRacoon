import { SpeedLines } from '../../fx';
import { ink, shade, tint } from '../../style';
import { clamp01, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { FOAM, ROCK, BARK } from './kit';
import { RAPIDS } from './layout';
import { River, Splash, Bank } from './parts';

// ---------- Level 19: rapids ride ----------
// board (he hops on a floating log) → drop (it flies off the step) → splash → off.

const SPEED_YS = [-50, -80, -110, -30];

function waterAt(x: number) {
  return x < RAPIDS.drop ? RAPIDS.waterBefore : RAPIDS.waterAfter;
}

function rapidsLog(p: ObstacleProps) {
  const boardAt = eventTime(p.events, 'board');
  const offAt = eventTime(p.events, 'off');
  const riding = p.t >= boardAt && p.t < offAt;
  const x = p.t < boardAt ? RAPIDS.logRest : Math.min(p.heroX, RAPIDS.stop);
  // Riding, the log's top is under his feet; otherwise it floats on the water.
  const y = riding ? -p.heroLift : waterAt(x) - RAPIDS.logTop + 3 * Math.sin(p.t / 300);
  return { x, y, riding };
}

export function RapidsBack(p: ObstacleProps) {
  const [a, b] = RAPIDS.channel;
  const white = 0.3 + 0.7 * clamp01(since(p, 'board') / 800);
  return (
    <g>
      <River a={a} b={RAPIDS.drop} level={RAPIDS.waterBefore} t={p.t} flow={0.6} white={white} />
      <River a={RAPIDS.drop} b={b} level={RAPIDS.waterAfter} t={p.t} flow={0.6} white={white} />
      {/* The step the river pours over. */}
      <path
        d={`M${RAPIDS.drop - 6} ${RAPIDS.waterBefore} Q${RAPIDS.drop + 20} ${RAPIDS.waterBefore + 4} ${RAPIDS.drop + 30} ${RAPIDS.waterAfter + 4}`}
        stroke={FOAM}
        strokeWidth={10}
        fill="none"
      />
      {[400, 760, 1350].map((x, i) => (
        <g key={x} transform={`translate(${x} ${waterAt(x) + 6})`}>
          <path d="M-30 6 Q-24 -22 0 -24 Q24 -22 30 6 Z" fill={ROCK} {...ink(2.5)} />
          <path
            d="M-40 8 q 12 -8 22 0 M18 8 q 12 -8 24 0"
            stroke={FOAM}
            strokeWidth={4}
            fill="none"
          />
          {i === 1 && (
            <path d="M-14 -16 Q0 -22 12 -16" stroke={tint(ROCK, 0.4)} strokeWidth={4} fill="none" />
          )}
        </g>
      ))}
      <Bank x={a} dir={1} />
      <Bank x={b} dir={-1} />
    </g>
  );
}

export function RapidsFront(p: ObstacleProps) {
  const log = rapidsLog(p);
  const flyAt = eventTime(p.events, 'drop');
  const splashAt = eventTime(p.events, 'splash');
  const tilt = p.t >= flyAt && p.t < splashAt ? -8 + 18 * ((p.t - flyAt) / (splashAt - flyAt)) : 0;
  const rolling = log.riding && p.t < splashAt + 400;
  return (
    <g>
      {rolling && <SpeedLines x={log.x - 110} t={p.t} ys={SPEED_YS} />}
      <g transform={`translate(${log.x} ${log.y}) rotate(${tilt})`}>
        <rect x={-100} y={0} width={200} height={34} rx={17} fill={BARK} {...ink(3.5)} />
        <rect x={-92} y={4} width={184} height={8} rx={4} fill={tint(BARK, 0.25)} />
        <ellipse cx={100} cy={17} rx={9} ry={17} fill="#d9a86a" {...ink(2.5)} />
        <path d="M-60 20 H40" stroke={shade(BARK, 0.35)} strokeWidth={3} />
      </g>
      <Splash x={log.x} y={RAPIDS.waterAfter} dt={p.t - splashAt} size={1.5} />
    </g>
  );
}
