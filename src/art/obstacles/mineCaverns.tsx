import { memo, useId } from 'react';
import { Dust, SparkBurst } from '../fx';
import { INK, ink, mix, shade, tint } from '../style';
import { PAINTED_MINE } from '../worlds/minePalette';
import { Glint } from '../worlds/paintKit';
import { BAT_STORM, CRYSTAL_CAVERN, RAT_SWARM, RUNAWAY_LIFT } from './mineLayout';
import { CRYSTALS, crystal, IN, OUT, STEEL, WOOD } from './mineKit';
import { Chain, Pit, PitLip, Rails, Rock, RoofBeam } from './mineParts';
import { noise, roundPath } from './sceneKit';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 1 cavern scenes: levels 4–7. Motion is computed from `t` and the prop schedule, so every
 * frame is deterministic. The animals and what he touches are lined like him; holes, cracks,
 * ledges and roof beams are painted like the backdrop (M7b).
 */

const P = PAINTED_MINE;

/** A dark opening in the rock, painted: deepest in the middle, lit a little around its rim. */
function HoleDefs({ id }: { id: string }) {
  return (
    <radialGradient id={id} cx="0.5" cy="0.6" r="0.6">
      <stop offset="0" stopColor="#05030a" />
      <stop offset="0.7" stopColor="#1a0f18" />
      <stop offset="1" stopColor="#3a2430" />
    </radialGradient>
  );
}

// ---------- Level 4: rat swarm ----------
// swarm (rats pour out of the hole) → grab (he swings on the chain) → letgo.

const RATS = Array.from({ length: 26 }, (_, i) => ({
  delay: i * 70,
  lane: i % 3,
  size: 0.8 + ((i * 7) % 5) * 0.08,
  shift: (i % 2) * 12,
}));
const FUR = '#9a90a6';
const PINK = '#f4a0b0';

/**
 * A round little rat scampering left, big shiny eye and all. Only its feet move, so its tail and
 * body are drawn once (memoized): a swarm is a lot of rats to redraw every frame.
 */
function Rat({ x, y, s, step }: { x: number; y: number; s: number; step: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <RatTail />
      <ellipse cx={12 + step * 4} cy={-2} rx={6} ry={3.5} fill={PINK} {...ink(1.8)} />
      <ellipse cx={-8 - step * 4} cy={-2} rx={5} ry={3} fill={PINK} {...ink(1.8)} />
      <RatBody />
    </g>
  );
}

const RatTail = memo(function RatTail() {
  return (
    <g fill="none" strokeLinecap="round">
      <path d="M20 -10 Q42 -26 54 -8" stroke={INK} strokeWidth={4.4} />
      <path d="M20 -10 Q42 -26 54 -8" stroke={PINK} strokeWidth={2.2} />
    </g>
  );
});

const RatBody = memo(function RatBody() {
  return (
    <g>
      <ellipse cx={3} cy={-14} rx={23} ry={13} fill={FUR} {...ink(2.6)} />
      <path d="M-18 -8 Q2 2 24 -9 Q22 -3 12 -2 Q-6 0 -18 -8 Z" fill={shade(FUR, 0.3)} />
      <path
        d="M-6 -25 Q10 -28 20 -20"
        stroke={tint(FUR, 0.55)}
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={-18} cy={-18} r={11} fill={FUR} {...ink(2.6)} />
      <ellipse cx={-29} cy={-14} rx={7} ry={5} fill={FUR} {...ink(2.2)} />
      <ellipse cx={-12} cy={-29} rx={7} ry={8} fill={FUR} {...ink(2.2)} />
      <ellipse cx={-12} cy={-28.5} rx={4} ry={5} fill={PINK} />
      <ellipse cx={-20} cy={-20} rx={3.2} ry={3.8} fill={INK} />
      <circle cx={-21} cy={-21.6} r={1.3} fill="#fff" />
      <circle cx={-19.2} cy={-18.6} r={0.7} fill="#fff" />
      <ellipse cx={-15} cy={-13} rx={3} ry={1.8} fill={PINK} opacity={0.7} />
      <circle cx={-35} cy={-15} r={2.6} fill="#ff7a8a" {...ink(1.2)} />
      <path
        d="M-32 -12 l-9 2 M-32 -11 l-8 5"
        stroke={INK}
        strokeWidth={0.9}
        strokeLinecap="round"
      />
    </g>
  );
});

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

/** A shackle and ring where a chain hangs from a beam. */
function Ring({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={10} fill={STEEL} {...ink(OUT)} />
      <circle cx={x} cy={y} r={4} fill={shade(STEEL, 0.5)} />
      <path
        d={`M${x + 2} ${y - 7} A7 7 0 0 1 ${x + 7} ${y - 2}`}
        stroke="#fff"
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function RatSwarmBack(p: ObstacleProps) {
  const id = useId();
  const { pivot, hole, ratSpeed } = RAT_SWARM;
  const swarmAt = eventTime(p.events, 'swarm');
  const end = chainEnd(p);
  const blink = Math.sin(p.t / 180) > -0.7;
  return (
    <g>
      <defs>
        <HoleDefs id={id} />
      </defs>
      {/* The rat hole in the tunnel wall, framed with timber (painted). */}
      <path
        d={`M${hole - 50} 4 L${hole - 50} -54 Q${hole} -110 ${hole + 50} -54 L${hole + 50} 4 Z`}
        fill={`url(#${id})`}
      />
      <rect x={hole - 69} y={-64} width={14} height={68} fill={P.timber} />
      <rect x={hole - 69} y={-64} width={5} height={68} fill={P.timberDark} />
      <rect x={hole + 55} y={-64} width={14} height={68} fill={P.timber} />
      <rect x={hole + 55} y={-64} width={5} height={68} fill={P.timberDark} />
      <rect x={hole - 76} y={-74} width={152} height={15} rx={3} fill={P.timber} />
      <rect x={hole - 76} y={-64} width={152} height={5} fill={P.timberDark} />
      <rect x={hole - 76} y={-74} width={152} height={2.5} fill={P.timberLight} />
      {p.t < swarmAt && blink && (
        <g>
          {[
            [hole - 16, -40],
            [hole - 3, -40],
            [hole + 14, -24],
            [hole + 26, -24],
          ].map(([ex, ey], i) => (
            <g key={i}>
              <ellipse cx={ex} cy={ey} rx={3.2} ry={4} fill="#ffd35a" />
              <circle cx={ex! - 0.8} cy={ey! - 1.4} r={1.1} fill="#fff" />
            </g>
          ))}
        </g>
      )}
      <RoofBeam x={pivot.x} y={pivot.y} w={240} />
      <Chain x1={pivot.x} y1={pivot.y} x2={end.x} y2={end.y} />
      <Ring x={pivot.x} y={pivot.y} />
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

/** A crystal spire standing in the chasm, its flat top a stepping stone, glowing softly. */
function Spire({
  x,
  dy,
  tilt,
  color,
  glow,
}: {
  x: number;
  dy: number;
  tilt: number;
  color: string;
  glow: string;
}) {
  return (
    <g transform={`translate(${x} ${dy - CRYSTAL_CAVERN.spireTop}) rotate(${tilt} 0 0)`}>
      <SpireArt color={color} glow={glow} />
    </g>
  );
}

/** The spire itself, drawn once for its color (only its transform changes as it sinks). */
const SpireArt = memo(function SpireArt({ color, glow }: { color: string; glow: string }) {
  const lit = tint(color, 0.35);
  return (
    <g>
      <ellipse cx={0} cy={30} rx={130} ry={150} fill={glow} />
      {/* Smaller crystals growing out of its sides. */}
      <path d="M-30 60 L-78 10 L-62 2 L-24 40 Z" fill={tint(color, 0.15)} {...ink(OUT)} />
      <path d="M-78 10 L-62 2 L-50 18 Z" fill={lit} />
      <path d="M24 90 L74 40 L84 52 L28 116 Z" fill={shade(color, 0.1)} {...ink(OUT)} />
      <path d="M74 40 L84 52 L60 76 Z" fill={lit} />
      <path d="M-45 -4 L45 -4 L30 120 L5 260 L-25 120 Z" fill={color} {...ink(OUT + 0.4)} />
      {/* The shadow facet on the left, a lit one on the right, and a shine down the middle. */}
      <path d="M-45 -4 L-12 -4 L-6 120 L5 260 L-25 120 Z" fill={shade(color, 0.28)} />
      <path d="M22 -4 L45 -4 L30 120 L18 190 Z" fill={lit} opacity={0.7} />
      <path
        d="M-2 12 L4 110"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.75}
      />
      <path d="M-45 -4 L45 -4 L39 9 L-39 9 Z" fill={tint(color, 0.55)} {...ink(IN + 0.6)} />
      <Glint x={30} y={2} r={9} color="#ffffff" />
    </g>
  );
});

export function CrystalCavernBack(p: ObstacleProps) {
  const id = useId();
  const [a, b] = CRYSTAL_CAVERN.pit;
  const crumbleAt = eventTime(p.events, 'crumble');
  return (
    <g>
      <defs>
        {CRYSTALS.map((c, i) => (
          <radialGradient key={c} id={`${id}g${i}`}>
            <stop offset="0" stopColor={c} stopOpacity={0.45} />
            <stop offset="0.45" stopColor={c} stopOpacity={0.16} />
            <stop offset="1" stopColor={c} stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      <Pit a={a} b={b} />
      {SHARDS.map((s, i) => {
        const dt = p.t - crumbleAt - s.delay;
        if (!(dt >= 0)) return null;
        const y = -620 + 0.003 * dt * dt;
        if (y > 260) return null;
        const c = crystal(i);
        return (
          <g key={i} transform={`translate(${s.x} ${y}) rotate(${dt * 0.2})`}>
            <path d="M0 -26 L12 0 L0 26 L-12 0 Z" fill={c} {...ink(2.4)} />
            <path d="M0 -26 L-12 0 L0 26 Z" fill={shade(c, 0.3)} />
            <path d="M3 -14 L7 -2" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
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
            glow={`url(#${id}g${i % 3})`}
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

// ---------- Level 7: runaway lift ----------
// board (the cage lifts him) → creak → snap (the rope breaks, the cage drops) → grab.

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
