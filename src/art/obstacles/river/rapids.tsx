import { memo, useId } from 'react';
import { SpeedLines } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { circles, clamp01, noise, roundPath, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { LIGHT, FOAM, SPRAY_SHADE, ROCK, MOSS, BARK, HEART, LEAF } from './kit';
import { RAPIDS } from './layout';
import { FarShore, River, Bank, Splash } from './parts';

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

const RAPIDS_ROCK = roundPath([
  [-32, 26],
  [-30, 4],
  [-14, -14],
  [6, -18],
  [24, -10],
  [32, 6],
  [34, 26],
  [0, 34],
]);

/** A rock sticking up out of the rapids, its base at the water line. */
const RiverRock = memo(function RiverRock() {
  return (
    <g>
      <path d={RAPIDS_ROCK} fill={ROCK} {...ink(OUT)} />
      <path d="M-30 6 Q-34 20 -28 30 L-12 30 Q-20 16 -16 -10 Z" fill={shade(ROCK, 0.3)} />
      <path
        d="M4 -16 Q24 -12 30 2"
        stroke={tint(ROCK, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={12} cy={-5} rx={7} ry={2.4} fill="#ffffff" opacity={0.6} />
      <path d="M-22 -2 Q-10 -16 6 -15 Q-4 -10 -8 -4 Q-16 -2 -22 -2 Z" fill={MOSS} {...ink(IN)} />
    </g>
  );
});

/** The log he rides, side on with its top at y 0: bark, a cut end with rings, a leafy twig. */
const RideLog = memo(function RideLog() {
  return (
    <g>
      <rect x={-100} y={0} width={200} height={34} rx={17} fill={BARK} {...ink(OUT)} />
      <path
        d="M-100 17 A17 17 0 0 0 -83 34 H83 A17 17 0 0 0 100 17 Q0 27 -100 17 Z"
        fill={shade(BARK, 0.3)}
      />
      <path d="M-84 6 H82" stroke={tint(BARK, 0.45)} strokeWidth={3} strokeLinecap="round" />
      <path
        d="M-70 15 h30 M-20 12 h40 M34 18 h28 M-50 24 h22"
        stroke={shade(BARK, 0.45)}
        strokeWidth={IN}
        strokeLinecap="round"
      />
      <path d="M22 1 Q38 -6 56 1 Q42 5 22 1 Z" fill={MOSS} {...ink(IN)} />
      <ellipse cx={100} cy={17} rx={10} ry={17} fill={HEART} {...ink(OUT - 0.6)} />
      <ellipse
        cx={100}
        cy={17}
        rx={6}
        ry={11}
        fill="none"
        stroke={shade(HEART, 0.3)}
        strokeWidth={IN}
      />
      <ellipse cx={100} cy={17} rx={2.6} ry={4.6} fill={shade(HEART, 0.42)} />
      <path d="M-56 2 L-62 -12" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M-56 2 L-62 -12" stroke={BARK} strokeWidth={4.6} strokeLinecap="round" />
      <path d="M-62 -12 Q-70 -24 -82 -22 Q-72 -14 -62 -12 Z" fill={LEAF} {...ink(IN)} />
      <path d="M-62 -12 Q-56 -26 -44 -26 Q-50 -16 -62 -12 Z" fill={tint(LEAF, 0.25)} {...ink(IN)} />
    </g>
  );
});

/** The step the river pours over (painted): a smooth curtain of water with foam at its foot. */
const DropFall = memo(function DropFall() {
  const id = useId();
  const x = RAPIDS.drop;
  const y0 = RAPIDS.waterBefore;
  const y1 = RAPIDS.waterAfter;
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={y0} x2="0" y2={y1 + 10}>
          <stop offset="0" stopColor={LIGHT} />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <path
        d={`M${x - 8} ${y0 - 2} Q${x + 22} ${y0} ${x + 32} ${y1 + 6} L${x + 12} ${y1 + 10} Q${x + 4} ${y0 + 16} ${x - 8} ${y0 + 12} Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${x - 6} ${y0} Q${x + 20} ${y0 + 2} ${x + 30} ${y1 + 4}`}
        stroke="#ffffff"
        strokeWidth={3}
        fill="none"
      />
    </g>
  );
});

export function RapidsBack(p: ObstacleProps) {
  const [a, b] = RAPIDS.channel;
  const white = 0.3 + 0.7 * clamp01(since(p, 'board') / 800);
  const d = RAPIDS.drop;
  return (
    <g>
      <FarShore a={a} b={b} level={RAPIDS.waterAfter} />
      <River
        a={a}
        b={d}
        level={RAPIDS.waterBefore}
        t={p.t}
        flow={0.6}
        white={white}
        shore={false}
      />
      <River a={d} b={b} level={RAPIDS.waterAfter} t={p.t} flow={0.6} white={white} shore={false} />
      <DropFall />
      {/* Foam churning at the foot of the step. */}
      <g opacity={0.85}>
        {[SPRAY_SHADE, FOAM].map((fill, layer) => (
          <path
            key={fill}
            d={circles(
              [0, 1, 2, 3, 4].map((i) => {
                const ph = ((p.t + i * 110) % 550) / 550;
                return {
                  x: d + 22 + layer + i * 14 + ph * 26,
                  y: RAPIDS.waterAfter + 4 - layer * 2 - ph * 6,
                  r: 8 - layer + 4 * noise(i, 2) + ph * (4 - layer),
                };
              }),
            )}
            fill={fill}
          />
        ))}
      </g>
      {[400, 760, 1350].map((x) => (
        <g key={x} transform={`translate(${x} ${waterAt(x) - 28})`}>
          <RiverRock />
        </g>
      ))}
      <path
        d={[400, 760, 1350]
          .map((x, i) => {
            const y = waterAt(x);
            return `M${x - 40} ${y + 3}a42 6 0 1 0 84 0a42 6 0 1 0 -84 0M${x + 40} ${y}h${(26 + 8 * Math.sin(p.t / 90 + i)).toFixed(1)}M${x + 34} ${y + 8}h${(18 + 6 * Math.sin(p.t / 70 + i)).toFixed(1)}`;
          })
          .join('')}
        fill="none"
        stroke={FOAM}
        strokeWidth={3.5}
        strokeLinecap="round"
        opacity={0.9}
      />
      <Bank x={a} dir={1} level={RAPIDS.waterBefore} />
      <Bank x={b} dir={-1} level={RAPIDS.waterAfter} />
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
      <g
        transform={`translate(${log.x.toFixed(1)} ${log.y.toFixed(1)}) rotate(${tilt.toFixed(1)})`}
      >
        <RideLog />
      </g>
      {log.riding && p.t < flyAt && (
        <path
          d={`M${log.x - 104} ${log.y + 26} q-14 -6 -30 -2 M${log.x - 100} ${log.y + 32} q-10 4 -24 4`}
          stroke={FOAM}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
      )}
      <Splash x={log.x} y={RAPIDS.waterAfter} dt={p.t - splashAt} size={1.5} />
    </g>
  );
}
