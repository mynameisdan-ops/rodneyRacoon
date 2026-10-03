import { memo, useId } from 'react';
import { Dust, SparkBurst } from '../../fx';
import { INK, ink, mix, shade, tint } from '../../style';
import { PAINTED_MINE } from '../../worlds/minePalette';
import { Glint } from '../../worlds/paintKit';
import { noise, roundPath } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { IN, OUT, WOOD, CRYSTALS, STEEL } from './kit';
import { RUNAWAY_LIFT } from './layout';
import { Pit, Rails, Chain, RoofBeam } from './parts';

// ---------- Level 7: runaway lift ----------
// board (the cage lifts him) → creak → snap (the rope breaks, the cage drops) → grab.

const P = PAINTED_MINE;

const CAGE_H = 230;
const ROPE = '#d8b070';

/** Height of the cage floor above the ground, or null once it has fallen out of sight. */
function cageLift(p: ObstacleProps): number | null {
  const boardAt = eventTime(p.events, 'board');
  const snapAt = eventTime(p.events, 'snap');
  if (p.t < boardAt) return 0;
  if (p.t < snapAt) return Math.max(0, p.heroLift);
  const dt = p.t - snapAt;
  const lift = p.heroAt(snapAt).lift - 0.003 * dt * dt;
  return lift < -520 ? null : lift;
}

/** A rope along `d`: ink, the rope, and twists. */
function Rope({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth={9} />
      <path d={d} stroke={ROPE} strokeWidth={5.5} />
      <path d={d} stroke={shade(ROPE, 0.35)} strokeWidth={5.5} strokeDasharray="2.5 6" />
    </g>
  );
}

/** Rocks in the ledge's face, from its left edge and top: x, y, width, height, lightness. */
const LEDGE_ROCKS = (
  [
    [40, 34, 160, 100, 0.3],
    [190, 24, 200, 120, 0.15],
    [380, 44, 170, 90, 0.25],
    [20, 150, 180, 130, 0.1],
    [200, 160, 150, 110, 0.28],
    [350, 140, 210, 140, 0.12],
    [550, 50, 190, 130, 0.2],
    [560, 196, 170, 120, 0.3],
  ] as const
).map(([x, y, w, h, light], i) => {
  const j = (n: number) => (noise(i * 8 + n, 6) - 0.5) * 0.12;
  const shape = roundPath([
    [x + w * (0.08 + j(0)), y + h * (0.04 + j(1))],
    [x + w * 0.55, y - h * (0.05 + j(2))],
    [x + w * (0.96 + j(3)), y + h * 0.12],
    [x + w * 1.02, y + h * (0.6 + j(4))],
    [x + w * (0.86 + j(5)), y + h],
    [x + w * 0.3, y + h * (1.03 + j(6))],
    [x - w * 0.02, y + h * (0.7 + j(7))],
    [x - w * 0.04, y + h * 0.3],
  ]);
  return { shape, light, x, y, w };
});

/** The upper ledge the lift goes up to (painted): a cliff of rock blocks with its track on top. */
const LiftLedge = memo(function LiftLedge() {
  const id = useId();
  const { ledge } = RUNAWAY_LIFT;
  const top = -ledge.lift;
  const x0 = ledge.x;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P.wallLight} />
          <stop offset="0.1" stopColor={P.wall} />
          <stop offset="1" stopColor={shade(P.wall, 0.3)} />
        </linearGradient>
      </defs>
      <path
        d={`M${x0} ${top} L1400 ${top} L1400 4 L${x0 + 20} 4 L${x0 + 8} -120 L${x0 + 18} -240 Z`}
        fill={`url(#${id})`}
      />
      <g transform={`translate(${x0 + 30} ${top + 14})`}>
        {LEDGE_ROCKS.map((r, i) => {
          const c = mix(P.wall, P.wallLight, r.light);
          return (
            <g key={i}>
              <path d={r.shape} fill={shade(c, 0.32)} />
              <path d={r.shape} fill={c} transform="translate(3 -5)" />
              <path
                d={`M${r.x + r.w * 0.22} ${r.y + 2} Q${r.x + r.w * 0.55} ${r.y - 6} ${r.x + r.w * 0.85} ${r.y + 6}`}
                stroke={tint(c, 0.35)}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>
      <path d={`M${x0} ${top} L1400 ${top} V${top + 14} H${x0 + 2} Z`} fill={P.groundTop} />
      <path d={`M${x0} ${top + 14} H1400`} stroke={shade(P.wall, 0.4)} strokeWidth={4} />
      <CrystalTuft x={x0 + 260} y={top + 290} color={CRYSTALS[1]} />
      <CrystalTuft x={x0 + 620} y={top + 250} color={CRYSTALS[0]} />
      <Rails a={x0 + 20} b={1400} lift={ledge.lift} />
    </g>
  );
});

/** A few small crystals sprouting from rock (painted, they glint). */
function CrystalTuft({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M${x - 14} ${y} L${x - 8} ${y - 26} L${x - 2} ${y} Z`} fill={color} />
      <path d={`M${x - 4} ${y} L${x + 3} ${y - 38} L${x + 10} ${y} Z`} fill={tint(color, 0.2)} />
      <path d={`M${x + 3} ${y - 38} L${x + 10} ${y} L${x + 4} ${y} Z`} fill={shade(color, 0.3)} />
      <path d={`M${x + 8} ${y} L${x + 14} ${y - 18} L${x + 19} ${y} Z`} fill={color} />
      <Glint x={x + 1} y={y - 30} r={6} color="#ffffff" />
    </g>
  );
}

export function RunawayLiftBack(p: ObstacleProps) {
  const { shaft, cage, chainX, pulley } = RUNAWAY_LIFT;
  const creakAt = eventTime(p.events, 'creak');
  const snapAt = eventTime(p.events, 'snap');
  const lift = cageLift(p);
  const top = lift === null ? 0 : -(lift + CAGE_H);
  const sinceSnap = p.t - snapAt;
  return (
    <g>
      <LiftLedge />
      <Pit a={shaft[0]} b={shaft[1]} />
      <RoofBeam x={(pulley.x + chainX) / 2 + 20} y={pulley.y - 10} w={260} />
      <Chain x1={chainX} y1={pulley.y + 10} x2={chainX} y2={-40} />
      {/* The rope: whole, or a broken end whipping about. */}
      {lift !== null && sinceSnap < 0 && <Rope d={`M${cage} ${pulley.y} V${top}`} />}
      {sinceSnap >= 0 && (
        <Rope
          d={`M${cage} ${pulley.y} q${30 * Math.sin(sinceSnap / 60) * Math.exp(-sinceSnap / 600)} 60 0 ${Math.max(30, 140 - sinceSnap * 0.3)}`}
        />
      )}
      <circle cx={cage} cy={pulley.y} r={22} fill={STEEL} {...ink(OUT)} />
      <path
        d={`M${cage + 4} ${pulley.y - 17} A17 17 0 0 1 ${cage + 17} ${pulley.y - 4}`}
        stroke="#fff"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={cage} cy={pulley.y} r={6} fill={INK} />
      <SparkBurst x={cage} y={pulley.y + 20} dt={sinceSnap} ms={500} count={12} />
      <Dust x={cage} y={pulley.y + 30} dt={p.t - creakAt} ms={700} size={0.5} />
      {lift !== null && (
        <g transform={`translate(${cage} ${-lift})`}>
          <path
            d={`M-80 ${-CAGE_H} H80 M-80 -120 H80 M-60 ${-CAGE_H} L60 -10 M60 ${-CAGE_H} L-60 -10`}
            stroke={shade(WOOD, 0.4)}
            strokeWidth={5}
          />
          <rect x={-86} y={-CAGE_H - 12} width={172} height={16} rx={3} fill={WOOD} {...ink(OUT)} />
          <rect x={-84} y={-CAGE_H - 1} width={168} height={4} fill={shade(WOOD, 0.35)} />
          <path
            d={`M-80 ${-CAGE_H - 8} H80`}
            stroke={tint(WOOD, 0.5)}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <rect x={-88} y={-8} width={176} height={16} rx={3} fill={WOOD} {...ink(OUT)} />
          <rect x={-86} y={3} width={172} height={4} fill={shade(WOOD, 0.35)} />
          {[-80, 80].map((x) => (
            <g key={x}>
              <rect x={x - 6} y={-CAGE_H} width={12} height={CAGE_H} fill={WOOD} {...ink(OUT)} />
              <rect
                x={x - 5}
                y={-CAGE_H + 2}
                width={4}
                height={CAGE_H - 4}
                fill={shade(WOOD, 0.3)}
              />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

export function RunawayLiftFront(p: ObstacleProps) {
  const lift = cageLift(p);
  if (lift === null) return null;
  const { cage } = RUNAWAY_LIFT;
  return (
    <g transform={`translate(${cage} ${-lift})`}>
      <rect x={-86} y={-66} width={172} height={11} rx={3} fill={WOOD} {...ink(IN + 1)} />
      <path d="M-80 -62.5 H80" stroke={tint(WOOD, 0.5)} strokeWidth={1.8} strokeLinecap="round" />
      {[-40, 40].map((x) => (
        <rect
          key={x}
          x={x - 3}
          y={-66}
          width={6}
          height={60}
          fill={shade(WOOD, 0.15)}
          {...ink(IN + 0.5)}
        />
      ))}
    </g>
  );
}
