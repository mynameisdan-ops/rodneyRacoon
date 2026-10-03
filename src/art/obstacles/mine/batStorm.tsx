import { Glow, SparkBurst } from '../../fx';
import { INK, ink, shade } from '../../style';
import { eventTime, type ObstacleProps } from '../types';
import { WOOD, HOLE } from './kit';
import { BAT_STORM } from './layout';
import { Rock, RoofBeam } from './parts';

// ---------- Level 6: bat storm ----------
// crash (the lantern falls and shatters) → bats (they burst out of the crack) .

const BATS = Array.from({ length: 22 }, (_, i) => ({
  delay: i * 45,
  lane: i % 3,
  shift: (i % 4) * 18,
}));
const BAT = '#5b3d8a';

function Bat({ x, y, flap }: { x: number; y: number; flap: number }) {
  const wing = (dir: 1 | -1) => (
    <path
      transform={`rotate(${dir * flap * 35} ${dir * 8} -4)`}
      d={`M${dir * 8} -6 Q${dir * 30} -24 ${dir * 42} -8 Q${dir * 34} -6 ${dir * 30} 2 Q${dir * 22} -2 ${dir * 16} 6 Q${dir * 12} 0 ${dir * 8} 4 Z`}
      fill={shade(BAT, 0.15)}
      {...ink(2.5)}
    />
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {wing(-1)}
      {wing(1)}
      <path d="M-9 -8 L-6 -20 L-1 -10 M9 -8 L6 -20 L1 -10" fill={BAT} {...ink(2)} />
      <ellipse cx={0} cy={0} rx={11} ry={13} fill={BAT} {...ink(2.5)} />
      <circle cx={-4} cy={-3} r={3.6} fill="#fff" {...ink(1)} />
      <circle cx={4} cy={-3} r={3.6} fill="#fff" {...ink(1)} />
      <circle cx={-4.6} cy={-2.6} r={1.6} fill={INK} />
      <circle cx={3.4} cy={-2.6} r={1.6} fill={INK} />
    </g>
  );
}

function Lantern({ t, crashAt }: { t: number; crashAt: number }) {
  const { x, y: hangY } = BAT_STORM.lantern;
  const dt = t - crashAt;
  const falling = dt >= 0;
  const floorY = -14;
  const y = falling ? Math.min(floorY, hangY + 0.003 * dt * dt) : hangY + 2 * Math.sin(t / 400);
  const landedAt = Math.sqrt((floorY - hangY) / 0.003);
  const broken = falling && dt >= landedAt;
  const glow = broken ? Math.max(0, 1 - (dt - landedAt) / 700) : 1;
  return (
    <g>
      {!falling && <path d={`M${x} ${hangY - 60} V${y - 12}`} stroke={INK} strokeWidth={3} />}
      {falling && !broken && (
        <path d={`M${x} ${hangY - 60} V${hangY - 30}`} stroke={INK} strokeWidth={3} />
      )}
      <g opacity={glow}>
        <Glow x={x} y={y} r={160} color="#ffc64d" />
      </g>
      <g
        transform={`translate(${x} ${y}) rotate(${broken ? 70 : falling ? dt * 0.2 : 0}) scale(1.6)`}
      >
        <rect
          x={-8}
          y={-12}
          width={16}
          height={20}
          rx={3}
          fill={broken ? '#6b5a3a' : '#ffc64d'}
          {...ink(2)}
        />
        <path d="M-8 -2 H8 M0 -12 V8" stroke={INK} strokeWidth={1.5} />
        <path d="M-10 -12 H10 L6 -17 H-6 Z" fill="#3a2a22" {...ink(2)} />
      </g>
      {broken && <SparkBurst x={x} y={floorY} dt={dt - landedAt} ms={500} count={12} />}
    </g>
  );
}

export function BatStormBack(p: ObstacleProps) {
  const { crack, beam, beamClear, lantern } = BAT_STORM;
  const crashAt = eventTime(p.events, 'crash');
  const [b0, b1] = beam;
  return (
    <g>
      <path
        d={`M${crack.x - 40} ${crack.y - 60} L${crack.x - 10} ${crack.y - 20} L${crack.x - 30} ${crack.y + 20} L${crack.x + 10} ${crack.y + 60} L${crack.x + 30} ${crack.y + 10} L${crack.x + 12} ${crack.y - 30} L${crack.x + 26} ${crack.y - 70} Z`}
        fill={HOLE}
        {...ink(3)}
      />
      <RoofBeam x={lantern.x} y={lantern.y - 70} w={220} />
      <Lantern t={p.t} crashAt={crashAt} />
      {/* The fallen beam he slides under, resting on two rock piles. */}
      {[b0, b1].map((x, i) => (
        <g key={x}>
          <Rock x={x} y={0} s={40} spin={i ? 6 : -4} />
          <Rock x={x + (i ? -6 : 8)} y={-42} s={34} spin={i ? -8 : 10} />
          <Rock x={x + (i ? 4 : -2)} y={-82} s={34} spin={i ? 12 : -6} />
          <Rock x={x} y={-118} s={22} />
        </g>
      ))}
      <g transform={`rotate(-3 ${(b0 + b1) / 2} ${-beamClear})`}>
        <rect
          x={b0 - 40}
          y={-beamClear - 28}
          width={b1 - b0 + 80}
          height={28}
          rx={5}
          fill={WOOD}
          {...ink(3.5)}
        />
        <rect
          x={b0 - 40}
          y={-beamClear - 8}
          width={b1 - b0 + 80}
          height={8}
          fill={shade(WOOD, 0.35)}
        />
        <path
          d={`M${b0 + 20} ${-beamClear - 20} h40 M${b1 - 70} ${-beamClear - 18} h50`}
          stroke={shade(WOOD, 0.45)}
          strokeWidth={3}
        />
      </g>
    </g>
  );
}

export function BatStormFront(p: ObstacleProps) {
  const { crack } = BAT_STORM;
  const batsAt = eventTime(p.events, 'bats');
  return (
    <g>
      {BATS.map((bat, i) => {
        const dt = p.t - batsAt - bat.delay;
        if (!(dt >= 0)) return null;
        const x = crack.x - 0.8 * dt - bat.shift;
        if (x < -700) return null;
        const y =
          crack.y + 200 * Math.min(1, dt / 700) + 40 * Math.sin(dt / 170 + i * 1.7) + bat.lane * 18;
        return <Bat key={i} x={x} y={y} flap={Math.sin(dt / 35 + i)} />;
      })}
    </g>
  );
}
