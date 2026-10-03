import { memo, useId } from 'react';
import { SparkBurst } from '../../fx';
import { INK, ink, shade, tint } from '../../style';
import { PAINTED_MINE } from '../../worlds/minePalette';
import { eventTime, type ObstacleProps } from '../types';
import { IN, OUT, WOOD } from './kit';
import { BAT_STORM } from './layout';
import { Rock, RoofBeam, HoleDefs } from './parts';

// ---------- Level 6: bat storm ----------
// crash (the lantern falls and shatters) → bats (they burst out of the crack) .

const P = PAINTED_MINE;

const BATS = Array.from({ length: 22 }, (_, i) => ({
  delay: i * 45,
  lane: i % 3,
  shift: (i % 4) * 18,
}));
const BAT = '#6a4a9a';

/**
 * A round little bat with big eyes, flapping (`flap` -1..1). Only the wings move, so their
 * shapes and the body are drawn once (memoized).
 */
function Bat({ x, y, flap }: { x: number; y: number; flap: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g transform={`rotate(${-flap * 35} -8 -4)`}>
        <BatWing dir={-1} />
      </g>
      <g transform={`rotate(${flap * 35} 8 -4)`}>
        <BatWing dir={1} />
      </g>
      <BatBody />
    </g>
  );
}

const BatWing = memo(function BatWing({ dir }: { dir: 1 | -1 }) {
  return (
    <g>
      <path
        d={`M${dir * 8} -6 Q${dir * 30} -26 ${dir * 44} -8 Q${dir * 35} -6 ${dir * 31} 2 Q${dir * 23} -2 ${dir * 17} 6 Q${dir * 12} 0 ${dir * 8} 4 Z`}
        fill={shade(BAT, 0.12)}
        {...ink(2.4)}
      />
      <path
        d={`M${dir * 12} -6 L${dir * 30} 1 M${dir * 14} -8 L${dir * 22} 4`}
        stroke={shade(BAT, 0.45)}
        strokeWidth={1.1}
      />
    </g>
  );
});

const BatBody = memo(function BatBody() {
  return (
    <g>
      <path d="M-9 -8 L-7 -21 L-1 -11 M9 -8 L7 -21 L1 -11" fill={BAT} {...ink(2)} />
      <ellipse cx={0} cy={0} rx={11.5} ry={13} fill={BAT} {...ink(2.4)} />
      <path d="M-11 2 Q-8 12 0 13 Q-5 6 -6 -2 Z" fill={shade(BAT, 0.3)} />
      <path
        d="M4 -11 Q10 -8 11 -1"
        stroke={tint(BAT, 0.5)}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={-4.2} cy={-2.6} rx={3.8} ry={4.2} fill="#fff" {...ink(1)} />
      <ellipse cx={4.2} cy={-2.6} rx={3.8} ry={4.2} fill="#fff" {...ink(1)} />
      <circle cx={-3.6} cy={-2} r={2} fill={INK} />
      <circle cx={4.8} cy={-2} r={2} fill={INK} />
      <circle cx={-3} cy={-2.8} r={0.7} fill="#fff" />
      <circle cx={5.4} cy={-2.8} r={0.7} fill="#fff" />
      <path
        d="M-2.4 5 Q0 7 2.4 5"
        stroke={INK}
        strokeWidth={1.1}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
});

function Lantern({ t, crashAt, glowFill }: { t: number; crashAt: number; glowFill: string }) {
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
        <circle cx={x} cy={y} r={170} fill={glowFill} />
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
          fill={broken ? '#6b5a3a' : '#ffd36a'}
          {...ink(2)}
        />
        {!broken && <rect x={-4} y={-8} width={8} height={12} rx={2} fill="#fffbe8" />}
        <path d="M-8 -2 H8 M0 -12 V8" stroke={INK} strokeWidth={1.2} />
        <path d="M-10 -12 H10 L6 -17 H-6 Z" fill="#3a2a22" {...ink(2)} />
      </g>
      {broken && <SparkBurst x={x} y={floorY} dt={dt - landedAt} ms={500} count={12} />}
    </g>
  );
}

export function BatStormBack(p: ObstacleProps) {
  const id = useId();
  const { crack, beam, beamClear, lantern } = BAT_STORM;
  const crashAt = eventTime(p.events, 'crash');
  const [b0, b1] = beam;
  return (
    <g>
      <defs>
        <HoleDefs id={id} />
        <radialGradient id={`${id}glow`}>
          <stop offset="0" stopColor="#ffd36a" stopOpacity={0.55} />
          <stop offset="0.4" stopColor="#ffb347" stopOpacity={0.2} />
          <stop offset="1" stopColor="#ffb347" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* The crack the bats burst out of (painted), lit along its edge. */}
      <path
        d={`M${crack.x - 40} ${crack.y - 60} L${crack.x - 10} ${crack.y - 20} L${crack.x - 30} ${crack.y + 20} L${crack.x + 10} ${crack.y + 60} L${crack.x + 30} ${crack.y + 10} L${crack.x + 12} ${crack.y - 30} L${crack.x + 26} ${crack.y - 70} Z`}
        fill={`url(#${id})`}
      />
      <path
        d={`M${crack.x + 26} ${crack.y - 70} L${crack.x + 12} ${crack.y - 30} L${crack.x + 30} ${crack.y + 10} L${crack.x + 10} ${crack.y + 60}`}
        stroke={P.wallLight}
        strokeWidth={3}
        fill="none"
        opacity={0.6}
        strokeLinejoin="round"
      />
      <RoofBeam x={lantern.x} y={lantern.y - 70} w={220} />
      <Lantern t={p.t} crashAt={crashAt} glowFill={`url(#${id}glow)`} />
      {/* The fallen beam he slides under, resting on two piles of rock. */}
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
          {...ink(OUT)}
        />
        <rect
          x={b0 - 38}
          y={-beamClear - 9}
          width={b1 - b0 + 76}
          height={7}
          fill={shade(WOOD, 0.38)}
        />
        <path
          d={`M${b0 - 30} ${-beamClear - 23} H${b1 + 30}`}
          stroke={tint(WOOD, 0.5)}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <path
          d={`M${b0 + 20} ${-beamClear - 16} h40 M${b1 - 70} ${-beamClear - 14} h50`}
          stroke={shade(WOOD, 0.45)}
          strokeWidth={IN}
          strokeLinecap="round"
        />
        <circle cx={b0 - 14} cy={-beamClear - 14} r={5} fill={shade(WOOD, 0.3)} {...ink(IN)} />
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
