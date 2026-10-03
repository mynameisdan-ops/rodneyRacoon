import { SparkTrail, SpeedLines } from '../../fx';
import { INK, ink, shade, tint } from '../../style';
import { lerp, rollAngle, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { RED_DARK, WOOD, IRON } from './kit';
import { TRAIN } from './layout';

// ---------- Level 38: canyon train ----------
// whistle (the train comes up behind) → board (he lands on the flatcar) → off (onto the platform).

function trainX(p: ObstacleProps) {
  const whistleAt = eventTime(p.events, 'whistle');
  const boardAt = eventTime(p.events, 'board');
  const offAt = eventTime(p.events, 'off');
  if (p.t < whistleAt) return null;
  if (p.t < boardAt)
    return lerp(TRAIN.start, p.heroAt(boardAt).x, (p.t - whistleAt) / (boardAt - whistleAt));
  if (p.t < offAt) return p.heroX;
  return p.heroAt(offAt).x + (p.t - offAt) * TRAIN.speed;
}

function Wheel({ x, spin }: { x: number; spin: number }) {
  return (
    <g transform={`translate(${x} -22) rotate(${spin})`}>
      <circle r={22} fill={IRON} {...ink(3)} />
      <path d="M-18 0 H18 M0 -18 V18" stroke={tint(IRON, 0.4)} strokeWidth={4} />
      <circle r={5} fill={tint(IRON, 0.5)} />
    </g>
  );
}

function Train({ x, t }: { x: number; t: number }) {
  const spin = rollAngle(x, 22);
  const deck = -TRAIN.deck;
  return (
    <g>
      {/* The flatcar he rides (its deck at x). */}
      <g transform={`translate(${x} 0)`}>
        <rect x={-120} y={deck} width={240} height={26} fill={WOOD} {...ink(3)} />
        <rect x={-110} y={deck + 26} width={220} height={40} fill={IRON} {...ink(3)} />
        {[-80, 80].map((wx) => (
          <Wheel key={wx} x={wx} spin={spin} />
        ))}
        <path d={`M120 ${deck + 40} H160`} stroke={INK} strokeWidth={6} />
      </g>
      {/* A boxcar and the engine ahead of it. */}
      <g transform={`translate(${x + 300} 0)`}>
        <rect x={-130} y={deck - 90} width={260} height={130} rx={6} fill={RED_DARK} {...ink(3)} />
        <path d={`M-100 ${deck - 60} H100`} stroke={shade(RED_DARK, 0.3)} strokeWidth={5} />
        <rect x={-120} y={deck + 40} width={240} height={26} fill={IRON} {...ink(3)} />
        {[-80, 80].map((wx) => (
          <Wheel key={wx} x={wx} spin={spin} />
        ))}
        <path d={`M130 ${deck + 40} H170`} stroke={INK} strokeWidth={6} />
      </g>
      <g transform={`translate(${x + 620} 0)`}>
        <rect
          x={-150}
          y={deck - 50}
          width={200}
          height={100}
          rx={40}
          fill="#2e4a5a"
          {...ink(3.5)}
        />
        <rect x={40} y={deck - 110} width={100} height={160} rx={8} fill="#2e4a5a" {...ink(3.5)} />
        <rect x={60} y={deck - 90} width={60} height={46} rx={6} fill="#ffd35a" {...ink(2.5)} />
        <rect x={-110} y={deck - 110} width={36} height={60} fill={IRON} {...ink(3)} />
        <path d={`M-160 ${deck + 40} L-190 ${deck + 64} H-140 Z`} fill="#c0392b" {...ink(2.5)} />
        {[-100, 0, 90].map((wx) => (
          <Wheel key={wx} x={wx} spin={spin} />
        ))}
        {/* Puffs of steam from the stack. */}
        {[0, 1, 2, 3].map((i) => {
          const k = (t / 500 + i * 0.25) % 1;
          return (
            <circle
              key={i}
              cx={-92 - k * 160}
              cy={deck - 130 - k * 120}
              r={18 + k * 30}
              fill="#ffffff"
              opacity={0.8 * (1 - k)}
              {...ink(2)}
            />
          );
        })}
      </g>
    </g>
  );
}

export function TrainBack(p: ObstacleProps) {
  const x = trainX(p);
  const [p0, p1] = TRAIN.platform;
  return (
    <g>
      {/* The track along the canyon floor. */}
      <rect x={-1600} y={-12} width={4400} height={8} fill="#a9b4c0" {...ink(2)} />
      {/* The station platform and its water tower. */}
      <rect
        x={p0}
        y={-TRAIN.platformTop}
        width={p1 - p0}
        height={TRAIN.platformTop + 4}
        fill={WOOD}
        {...ink(3)}
      />
      <path
        d={`M${p0 + 10} ${-TRAIN.platformTop + 10} H${p1 - 10}`}
        stroke={shade(WOOD, 0.3)}
        strokeWidth={4}
      />
      <g transform={`translate(${p1 - 120} ${-TRAIN.platformTop})`}>
        <path d="M-40 0 L-30 -160 M40 0 L30 -160 M-34 -80 H34" stroke={WOOD} strokeWidth={9} />
        <rect
          x={-50}
          y={-250}
          width={100}
          height={100}
          rx={10}
          fill={shade(WOOD, 0.2)}
          {...ink(3)}
        />
        <path d="M-56 -250 L0 -290 L56 -250 Z" fill={RED_DARK} {...ink(3)} />
      </g>
      {/* The train runs on the track behind him, so it never runs through him. */}
      {x !== null && <Train x={x} t={p.t} />}
    </g>
  );
}

export function TrainFront(p: ObstacleProps) {
  const x = trainX(p);
  if (x === null) return null;
  const moving = since(p, 'whistle') >= 0;
  return (
    <g>
      {moving && <SpeedLines x={x - 140} t={p.t} ys={[-60, -100, -140]} />}
      {moving && <SparkTrail x={x - 80} y={-6} t={p.t} />}
    </g>
  );
}
