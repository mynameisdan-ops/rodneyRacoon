import { Dust } from '../../fx';
import { INK, ink, shade } from '../../style';
import { clamp01, easeOut, lerp, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { STONE, SNOW } from './kit';
import { GOAT } from './layout';

// ---------- Level 28: goat ride ----------
// goat (it bounds in) → ride (he's on its back, up the ledges) → top → off (it bounds away).

function goatPose(p: ObstacleProps) {
  const goatAt = eventTime(p.events, 'goat');
  const rideAt = eventTime(p.events, 'ride');
  const offAt = eventTime(p.events, 'off');
  if (p.t < goatAt) return null;
  if (p.t < rideAt) {
    const k = easeOut(clamp01((p.t - goatAt) / 700));
    const hop = 30 * Math.abs(Math.sin((p.t - goatAt) / 120)) * (1 - k);
    return { x: lerp(GOAT.goatStart, GOAT.goatRest, k), lift: hop, facing: -1, leap: k < 1 };
  }
  if (p.t < offAt) return { x: p.heroX, lift: p.heroLift - GOAT.saddle, facing: 1, leap: true };
  const dt = p.t - offAt;
  const start = p.heroAt(offAt);
  return {
    x: start.x + 60 + dt * 0.6,
    lift: GOAT.top + 80 * Math.abs(Math.sin(dt / 200)),
    facing: 1,
    leap: true,
  };
}

function Goat({
  x,
  lift,
  facing,
  leap,
  t,
}: {
  x: number;
  lift: number;
  facing: number;
  leap: boolean;
  t: number;
}) {
  const fur = '#f2ece0';
  const legs = leap ? 20 : 8 * Math.sin(t / 60);
  return (
    <g transform={`translate(${x} ${-lift}) scale(${facing} 1)`}>
      {[-34, -16, 20, 38].map((lx, i) => (
        <path
          key={lx}
          d={`M${lx} -44 L${lx + (i < 2 ? -legs : legs)} -2`}
          stroke={INK}
          strokeWidth={10}
          strokeLinecap="round"
        />
      ))}
      <ellipse cx={0} cy={-66} rx={56} ry={30} fill={fur} {...ink(3)} />
      <path d="M-40 -46 Q0 -30 44 -48" stroke={shade(fur, 0.2)} strokeWidth={8} fill="none" />
      <g transform="translate(52 -92)">
        <path d="M-10 26 L-4 -4 L14 -6 L22 20 Z" fill={fur} {...ink(2.5)} />
        <ellipse cx={14} cy={-8} rx={20} ry={14} fill={fur} {...ink(2.5)} />
        <path
          d="M2 -18 Q-20 -40 -34 -20"
          stroke="#8a7a6a"
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={18} cy={-12} r={3} fill={INK} />
        <path d="M24 2 q 4 10 -2 16" stroke="#ffffff" strokeWidth={6} fill="none" />
      </g>
      <path
        d="M-56 -76 q -14 -8 -10 -20"
        stroke={INK}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function GoatBack() {
  return (
    <g>
      {/* Ledges stepping up to the high plateau. */}
      {GOAT.ledges.map(([x, lift]) => (
        <path
          key={x}
          d={`M${x - 70} 4 V${-lift} H3000 V4 Z`}
          fill={lift === GOAT.top ? STONE : shade(STONE, 0.1 * (3 - lift / 100))}
          {...ink(3.5)}
        />
      ))}
      {GOAT.ledges.map(([x, lift]) => (
        <path
          key={`s${x}`}
          d={`M${x - 74} ${-lift - 2} H${x + 80} Q${x + 60} ${-lift + 12} ${x - 60} ${-lift + 10} Z`}
          fill={SNOW}
          {...ink(2)}
        />
      ))}
      <path d={`M1040 ${-GOAT.top - 2} H3000 V${-GOAT.top + 12} H1040 Z`} fill={SNOW} />
    </g>
  );
}

export function GoatFront(p: ObstacleProps) {
  const goat = goatPose(p);
  if (!goat) return null;
  return (
    <g>
      <Goat {...goat} t={p.t} />
      <Dust
        x={GOAT.goatRest + 40}
        y={-4}
        dt={since(p, 'goat') - 700}
        ms={500}
        size={0.6}
        color="#dfe6f2"
      />
    </g>
  );
}
