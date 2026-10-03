import { Dust, SparkBurst } from '../../fx';
import { INK, ink, shade } from '../../style';
import { eventTime, type ObstacleProps } from '../types';
import { STEEL, WOOD } from './kit';
import { RUNAWAY_LIFT } from './layout';
import { Pit, Rails, Chain, RoofBeam } from './parts';

// ---------- Level 7: runaway lift ----------
// board (the cage lifts him) → creak → snap (the rope breaks, the cage drops) → grab.

const CAGE_H = 230;

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

export function RunawayLiftBack(p: ObstacleProps) {
  const { shaft, cage, chainX, pulley, ledge } = RUNAWAY_LIFT;
  const creakAt = eventTime(p.events, 'creak');
  const snapAt = eventTime(p.events, 'snap');
  const lift = cageLift(p);
  const top = lift === null ? 0 : -(lift + CAGE_H);
  const sinceSnap = p.t - snapAt;
  return (
    <g>
      {/* The upper ledge, reached by the lift. */}
      <path
        d={`M${ledge.x} ${-ledge.lift} L1400 ${-ledge.lift} L1400 4 L${ledge.x + 20} 4 L${ledge.x + 8} -120 L${ledge.x + 18} -240 Z`}
        fill="#5a3d30"
        {...ink(3.5)}
      />
      <path
        d={`M${ledge.x} ${-ledge.lift} L1400 ${-ledge.lift} V${-ledge.lift + 10} H${ledge.x + 2} Z`}
        fill="#7a5538"
      />
      <Rails a={ledge.x + 20} b={1400} lift={ledge.lift} />
      <Pit a={shaft[0]} b={shaft[1]} />
      <RoofBeam x={(pulley.x + chainX) / 2 + 20} y={pulley.y - 10} w={260} />
      <Chain x1={chainX} y1={pulley.y + 10} x2={chainX} y2={-40} />
      {/* The pulley and the rope: whole, or a broken end whipping about. */}
      {lift !== null && sinceSnap < 0 && (
        <path
          d={`M${cage} ${pulley.y} V${top}`}
          stroke="#c9a26b"
          strokeWidth={6}
          {...{ strokeLinecap: 'round' }}
        />
      )}
      {sinceSnap >= 0 && (
        <path
          d={`M${cage} ${pulley.y} q${30 * Math.sin(sinceSnap / 60) * Math.exp(-sinceSnap / 600)} 60 0 ${Math.max(30, 140 - sinceSnap * 0.3)}`}
          fill="none"
          stroke="#c9a26b"
          strokeWidth={6}
          strokeLinecap="round"
        />
      )}
      <circle cx={cage} cy={pulley.y} r={22} fill={STEEL} {...ink(3.5)} />
      <circle cx={cage} cy={pulley.y} r={6} fill={INK} />
      <SparkBurst x={cage} y={pulley.y + 20} dt={sinceSnap} ms={500} count={12} />
      <Dust x={cage} y={pulley.y + 30} dt={p.t - creakAt} ms={700} size={0.5} />
      {lift !== null && (
        <g transform={`translate(${cage} ${-lift})`}>
          <path
            d={`M-80 ${-CAGE_H} H80 M-80 -120 H80 M-60 ${-CAGE_H} L60 -10 M60 ${-CAGE_H} L-60 -10`}
            stroke={shade(WOOD, 0.35)}
            strokeWidth={5}
          />
          <rect x={-86} y={-CAGE_H - 12} width={172} height={16} rx={3} fill={WOOD} {...ink(3)} />
          <rect x={-88} y={-8} width={176} height={16} rx={3} fill={WOOD} {...ink(3)} />
          {[-80, 80].map((x) => (
            <rect
              key={x}
              x={x - 6}
              y={-CAGE_H}
              width={12}
              height={CAGE_H}
              fill={WOOD}
              {...ink(3)}
            />
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
      <rect x={-86} y={-66} width={172} height={10} rx={3} fill={WOOD} {...ink(2.5)} />
      {[-40, 40].map((x) => (
        <rect
          key={x}
          x={x - 3}
          y={-66}
          width={6}
          height={60}
          fill={shade(WOOD, 0.15)}
          {...ink(2)}
        />
      ))}
    </g>
  );
}
