import { Dust, Glow, SparkBurst } from '../fx';
import { INK, ink, shade, tint } from '../style';
import { BAT_STORM, CRYSTAL_CAVERN, RAT_SWARM, RUNAWAY_LIFT } from './mineLayout';
import { crystal, STEEL, WOOD } from './mineKit';
import { Chain, Pit, PitLip, Rails, Rock, RoofBeam } from './mineParts';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 1 cavern scenes: levels 4–7. Motion is computed from `t` and the prop
 * schedule, so every frame is deterministic.
 */

const HOLE = '#140b12';

// ---------- Level 4: rat swarm ----------
// swarm (rats pour out of the hole) → grab (he swings on the chain) → letgo.

const RATS = Array.from({ length: 26 }, (_, i) => ({
  delay: i * 70,
  lane: i % 3,
  size: 0.8 + ((i * 7) % 5) * 0.08,
  shift: (i % 2) * 12,
}));

function Rat({ x, y, s, step }: { x: number; y: number; s: number; step: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M20 -10 Q42 -24 52 -8"
        fill="none"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d="M20 -10 Q42 -24 52 -8"
        fill="none"
        stroke="#e8a0a8"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d={`M-8 0 l${step * 4} -6 M10 0 l${-step * 4} -6`} stroke={INK} strokeWidth={3} />
      <ellipse cx={2} cy={-13} rx={22} ry={12} fill="#8a8494" {...ink(2.5)} />
      <ellipse cx={6} cy={-9} rx={14} ry={6} fill={shade('#8a8494', 0.25)} />
      <circle cx={-18} cy={-16} r={10} fill="#8a8494" {...ink(2.5)} />
      <circle cx={-14} cy={-27} r={6} fill="#e8a0a8" {...ink(2)} />
      <circle cx={-22} cy={-18} r={2.2} fill={INK} />
      <circle cx={-28} cy={-14} r={2.6} fill="#ff7a8a" {...ink(1)} />
    </g>
  );
}

/** The chain's lower end: hanging still, in his hands, or swinging back after he lets go. */
function chainEnd(p: ObstacleProps) {
  const { pivot, chain, reach } = RAT_SWARM;
  const grabAt = eventTime(p.events, 'grab');
  const letgoAt = eventTime(p.events, 'letgo');
  if (p.t >= grabAt && p.t < letgoAt) return { x: p.heroX, y: -(p.heroLift + reach) };
  let angle = 0.04 * Math.sin(p.t / 500);
  if (p.t >= letgoAt) {
    const dt = p.t - letgoAt;
    const a0 = Math.asin(Math.max(-1, Math.min(1, (p.heroAt(letgoAt).x - pivot.x) / chain)));
    angle = a0 * Math.cos(dt / 320) * Math.exp(-dt / 1400);
  }
  return { x: pivot.x + chain * Math.sin(angle), y: pivot.y + chain * Math.cos(angle) };
}

export function RatSwarmBack(p: ObstacleProps) {
  const { pivot, hole, ratSpeed } = RAT_SWARM;
  const swarmAt = eventTime(p.events, 'swarm');
  const end = chainEnd(p);
  const blink = Math.sin(p.t / 180) > -0.7;
  return (
    <g>
      {/* The rat hole in the tunnel wall. */}
      <path
        d={`M${hole - 50} 4 L${hole - 50} -54 Q${hole} -110 ${hole + 50} -54 L${hole + 50} 4 Z`}
        fill={HOLE}
        {...ink(3)}
      />
      <path d={`M${hole - 62} 4 V-62 M${hole + 62} 4 V-62`} stroke={WOOD} strokeWidth={14} />
      <path
        d={`M${hole - 70} -64 H${hole + 70}`}
        stroke={WOOD}
        strokeWidth={16}
        strokeLinecap="round"
      />
      {p.t < swarmAt && blink && (
        <g fill="#ffd35a">
          <circle cx={hole - 16} cy={-40} r={3.5} />
          <circle cx={hole - 4} cy={-40} r={3.5} />
          <circle cx={hole + 14} cy={-24} r={3} />
          <circle cx={hole + 24} cy={-24} r={3} />
        </g>
      )}
      <RoofBeam x={pivot.x} y={pivot.y} w={240} />
      <Chain x1={pivot.x} y1={pivot.y} x2={end.x} y2={end.y} />
      <circle cx={pivot.x} cy={pivot.y} r={9} fill={STEEL} {...ink(3)} />
      {[0, 1, 2].map((lane) =>
        RATS.filter((r) => r.lane === lane).map((r, i) => {
          const dt = p.t - swarmAt - r.delay;
          if (!(dt >= 0)) return null;
          const x = hole - ratSpeed * dt - r.shift;
          if (x < -700) return null;
          const hop = -Math.abs(Math.sin(dt / 55 + i)) * 6;
          return (
            <Rat
              key={`${lane}-${i}`}
              x={x}
              y={(lane - 1) * 9 + hop}
              s={r.size * (0.9 + lane * 0.08)}
              step={Math.sin(dt / 40)}
            />
          );
        }),
      )}
      <Dust x={hole} y={-6} dt={p.t - swarmAt} ms={900} size={0.8} />
    </g>
  );
}

// ---------- Level 5: crystal cavern ----------
// crumble (the ledge gives way) → sink1..3 (each spire drops after he leaves it).

const SHARDS = Array.from({ length: 6 }, (_, i) => ({ x: 90 + i * 95, delay: i * 260 }));
const LEDGE_BITS = Array.from({ length: 4 }, (_, i) => ({ x: -44 + i * 20, delay: i * 90 }));

function Spire({ x, dy, tilt, color }: { x: number; dy: number; tilt: number; color: string }) {
  return (
    <g transform={`translate(${x} ${dy - CRYSTAL_CAVERN.spireTop}) rotate(${tilt} 0 0)`}>
      <Glow x={0} y={-10} r={120} color={color} />
      {/* Smaller crystals growing out of its sides. */}
      <path d="M-30 60 L-78 10 L-62 2 L-24 40 Z" fill={tint(color, 0.15)} {...ink(3)} />
      <path d="M24 90 L74 40 L84 52 L28 116 Z" fill={shade(color, 0.15)} {...ink(3)} />
      <path d="M-45 -4 L45 -4 L30 120 L5 260 L-25 120 Z" fill={color} {...ink(3.5)} />
      <path d="M5 -4 L45 -4 L30 120 L5 260 Z" fill={shade(color, 0.3)} />
      <path d="M-30 6 L-16 110" stroke={tint(color, 0.6)} strokeWidth={5} strokeLinecap="round" />
      <path d="M-45 -4 L45 -4 L38 8 L-38 8 Z" fill={tint(color, 0.35)} {...ink(2.5)} />
    </g>
  );
}

export function CrystalCavernBack(p: ObstacleProps) {
  const [a, b] = CRYSTAL_CAVERN.pit;
  const crumbleAt = eventTime(p.events, 'crumble');
  return (
    <g>
      <Pit a={a} b={b} />
      {SHARDS.map((s, i) => {
        const dt = p.t - crumbleAt - s.delay;
        if (!(dt >= 0)) return null;
        const y = -620 + 0.003 * dt * dt;
        if (y > 260) return null;
        const c = crystal(i);
        return (
          <g key={i} transform={`translate(${s.x} ${y}) rotate(${dt * 0.2})`}>
            <path d="M0 -26 L12 0 L0 26 L-12 0 Z" fill={c} {...ink(2.5)} />
            <path d="M0 -26 L12 0 L0 26 Z" fill={shade(c, 0.3)} />
          </g>
        );
      })}
      {CRYSTAL_CAVERN.spires.map((x, i) => {
        const sinkAt = eventTime(p.events, `sink${i + 1}`);
        const dt = p.t - sinkAt;
        const sinking = dt >= 0;
        return (
          <Spire
            key={x}
            x={x}
            dy={sinking ? 0.0022 * dt * dt : 0}
            tilt={sinking ? (i % 2 ? 1 : -1) * 0.012 * dt : 0}
            color={crystal(i)}
          />
        );
      })}
      <PitLip a={a} b={b} />
      {/* The crumbling edge of the ledge he starts on. */}
      {LEDGE_BITS.map((bit, i) => {
        const dt = p.t - crumbleAt - bit.delay;
        const falling = dt >= 0;
        const y = falling ? 0.0025 * dt * dt : 0;
        if (y > 260) return null;
        return <Rock key={i} x={bit.x} y={y} s={14} spin={falling ? dt * 0.25 : (i * 17) % 20} />;
      })}
      <Dust x={0} y={-4} dt={p.t - crumbleAt} ms={800} size={0.8} />
    </g>
  );
}

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
