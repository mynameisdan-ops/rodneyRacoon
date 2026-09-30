import { Dust, SpeedLines } from '../fx';
import { INK, ink, shade, tint } from '../style';
import { DAM, FALLS, GEYSER, RAFT, RAPIDS, RISING, ROPE_BRIDGE, STONES } from './riverLayout';
import { bump, clamp01, easeOut, fallen, lerp, noise, since } from './sceneKit';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 3 (Rushing River) scenes, levels 17–24. Every motion is computed from `t`
 * and the prop schedule, so any frame can be drawn exactly.
 */

const WATER = '#3aa0d8';
const DEEP = '#2376b0';
const FOAM = '#e8f8ff';
const ROCK = '#8a8d96';
const WOOD = '#9a6a3e';
const BARK = '#6b4a32';
const BANK = '#5a9a48';
const SPEED_YS = [-50, -80, -110, -30];

/** A stretch of river from a to b whose surface is at `level` (y), with moving ripples. */
function River({
  a,
  b,
  level,
  t,
  flow = 0.35,
  white = 0,
}: {
  a: number;
  b: number;
  level: number;
  t: number;
  flow?: number;
  /** 0..1: how much whitewater. */
  white?: number;
}) {
  const n = Math.max(4, Math.round((b - a) / 90));
  let top = `M${a} ${level}`;
  for (let i = 1; i <= n; i++) {
    const x = lerp(a, b, i / n);
    const amp = 5 + 8 * white;
    top += ` Q${x - (b - a) / n / 2} ${level + amp * Math.sin(t / 160 + i * 1.7)} ${x} ${level}`;
  }
  const ripples = Math.round((b - a) / 110);
  return (
    <g>
      <path d={`${top} L${b} 240 L${a} 240 Z`} fill={WATER} {...ink(3)} />
      <path d={`M${a} ${level + 40} H${b} V240 H${a} Z`} fill={DEEP} opacity={0.5} />
      <g stroke={FOAM} strokeWidth={4} strokeLinecap="round" opacity={0.8}>
        {Array.from({ length: ripples }, (_, i) => {
          const x = a + 20 + ((t * flow + i * 110 * 1.37) % (b - a - 60));
          return <path key={i} d={`M${x} ${level + 18 + (i % 3) * 22} h ${24 + (i % 2) * 18}`} />;
        })}
      </g>
      {white > 0 && (
        <g fill={FOAM} opacity={0.9 * white} {...ink(1.5)}>
          {Array.from({ length: n * 2 }, (_, i) => {
            const x = a + ((i * 57 + t * flow * 1.3) % (b - a));
            return (
              <circle
                key={i}
                cx={x}
                cy={level - 2 + 6 * Math.sin(t / 90 + i)}
                r={6 + (i % 3) * 3}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}

/** Spray drops bursting up from (x, y). */
function Splash({ x, y, dt, size = 1 }: { x: number; y: number; dt: number; size?: number }) {
  if (!(dt >= 0 && dt < 900)) return null;
  return (
    <g fill={FOAM} {...ink(2)} opacity={1 - dt / 900}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = -Math.PI * (0.15 + (0.7 * i) / 8);
        const v = (0.45 + 0.3 * noise(i, 2)) * size;
        const px = x + Math.cos(a) * v * dt;
        const py = y + Math.sin(a) * v * dt + 0.0012 * dt * dt;
        return <circle key={i} cx={px} cy={py} r={(7 + 5 * noise(i, 4)) * size} />;
      })}
    </g>
  );
}

function Bank({ x, dir, depth = 200 }: { x: number; dir: 1 | -1; depth?: number }) {
  // The river's edge: a grassy lip dropping to the water, on the left (dir 1) or right (-1).
  return (
    <path
      d={`M${x - dir * 40} -2 L${x} -2 Q${x + dir * 14} 20 ${x + dir * 6} ${depth} L${x - dir * 40} ${depth} Z`}
      fill={shade(BANK, 0.2)}
      {...ink(3)}
    />
  );
}

/** A curling wave, `h` tall, whose front is at x, sitting on `level`. */
function CurlWave({ x, level, h, t }: { x: number; level: number; h: number; t: number }) {
  if (h < 4) return null;
  const k = h / 220;
  return (
    <g transform={`translate(${x} ${level}) scale(${k})`}>
      <path
        d="M-420 30 Q-300 20 -200 -40 Q-110 -150 -10 -210 Q60 -236 90 -180 Q60 -196 40 -170 Q20 -140 50 -120 Q10 -100 -10 -60 Q-20 -10 0 30 Z"
        fill={WATER}
        {...ink(4 / Math.max(k, 0.3))}
      />
      <path
        d="M-380 30 Q-260 10 -150 -60 Q-90 -110 -60 -40 Q-80 0 -60 30 Z"
        fill={DEEP}
        opacity={0.5}
      />
      <path
        d="M-160 -80 Q-80 -170 20 -196"
        stroke={tint(WATER, 0.5)}
        strokeWidth={10}
        fill="none"
        strokeLinecap="round"
      />
      <g fill={FOAM} {...ink(2.5)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={70 - i * 22 + 4 * Math.sin(t / 80 + i)}
            cy={-190 + i * 6}
            r={16 - i * 2}
          />
        ))}
        <circle cx={10} cy={20} r={14} />
        <circle cx={-30} cy={26} r={10} />
      </g>
    </g>
  );
}

// ---------- Level 17: stepping stones ----------
// surge (a wave rolls in behind him) → s1..s4 (each stone tips and sinks after he leaves it)
// → crash (the wave breaks on the bank behind him).

export function SteppingStonesBack(p: ObstacleProps) {
  const [a, b] = STONES.channel;
  return (
    <g>
      <River a={a} b={b} level={10} t={p.t} white={clamp01(since(p, 'surge') / 800) * 0.6} />
      <Bank x={a} dir={1} />
      <Bank x={b} dir={-1} />
      {STONES.stones.map((x, i) => {
        const dt = since(p, `s${i + 1}`) - 120;
        const sink = fallen(dt, 0.0006);
        const tilt = dt > 0 ? Math.min(25, dt * 0.05) * (i % 2 ? 1 : -1) : 0;
        if (sink > 120) return null;
        return (
          <g key={x} transform={`translate(${x} ${-STONES.top + sink}) rotate(${tilt})`}>
            <path
              d="M-46 4 Q-50 -2 -36 -8 Q0 -16 36 -8 Q50 -2 46 4 L40 60 L-40 60 Z"
              fill={ROCK}
              {...ink(3)}
            />
            <path d="M-36 -8 Q0 -16 36 -8 L30 0 Q0 -6 -30 0 Z" fill={tint(ROCK, 0.35)} />
            <path d="M-40 30 H40" stroke="#5f8a4a" strokeWidth={6} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

export function SteppingStonesFront(p: ObstacleProps) {
  const surgeAt = eventTime(p.events, 'surge');
  const crashAt = eventTime(p.events, 'crash');
  if (p.t < surgeAt) return null;
  const [, b] = STONES.channel;
  const k = clamp01((p.t - surgeAt) / (crashAt - surgeAt));
  const x = lerp(STONES.waveStart, b - 60, k);
  const after = p.t - crashAt;
  const h = after < 0 ? 200 * clamp01(k * 3) : 200 * (1 - clamp01(after / 500));
  return (
    <g>
      <CurlWave x={x} level={16} h={h} t={p.t} />
      <Splash x={b - 60} y={-40} dt={after} size={1.6} />
    </g>
  );
}

// ---------- Level 18: beaver dam ----------
// crack (water spurts through) → burst (logs pop out behind him as he runs the top).

function logBurstAt(p: ObstacleProps, x: number) {
  const burstAt = eventTime(p.events, 'burst');
  const start = p.heroAt(burstAt).x - DAM.lag;
  const [a] = DAM.dam;
  if (x <= start) return burstAt + ((x - a) / Math.max(1, start - a)) * 200;
  return burstAt + 200 + (x - start) / DAM.run;
}

function Beaver({ x, y, wave }: { x: number; y: number; wave: number }) {
  const fur = '#8a5a34';
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={24} ry={22} fill={fur} {...ink(2.5)} />
      <circle cx={-8} cy={-18} r={6} fill={fur} {...ink(2)} />
      <circle cx={8} cy={-18} r={6} fill={fur} {...ink(2)} />
      <circle cx={-8} cy={-4} r={3} fill={INK} />
      <circle cx={8} cy={-4} r={3} fill={INK} />
      <ellipse cx={0} cy={6} rx={8} ry={5} fill="#3a2418" />
      <rect x={-5} y={10} width={10} height={8} rx={2} fill="#fff6e0" {...ink(1.5)} />
      <path
        d={`M20 -4 q 14 ${-12 - wave * 10} 10 ${-26 - wave * 6}`}
        stroke={INK}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M20 -4 q 14 ${-12 - wave * 10} 10 ${-26 - wave * 6}`}
        stroke={fur}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

export function BeaverDamBack(p: ObstacleProps) {
  const [a, b] = DAM.dam;
  const crack = since(p, 'crack');
  const burst = since(p, 'burst');
  const logs = [];
  for (let x = a + 20; x < b - 10; x += 46) logs.push(x);
  return (
    <g>
      {/* The lake behind the dam, high up, and the river below it. */}
      <path d={`M${a} ${-DAM.top + 16} H${b} V-40 H${a} Z`} fill={WATER} opacity={0.9} />
      <River a={a - 40} b={b + 40} level={40} t={p.t} white={clamp01(burst / 600)} />
      <Bank x={a - 40} dir={1} />
      <Bank x={b + 40} dir={-1} />
      {/* The dam: a ramp of sticks up to a top walkway of logs. */}
      <path
        d={`M${a - 40} 0 L${a} ${-DAM.top} H${b} L${b + 40} 0 L${b + 20} 60 H${a - 20} Z`}
        fill={shade(WOOD, 0.35)}
        {...ink(3)}
      />
      {logs.map((x, i) => {
        const dt = p.t - logBurstAt(p, x);
        const y = -DAM.top + fallen(dt, 0.002) - (dt > 0 ? dt * 0.35 : 0);
        if (y > 260) return null;
        return (
          <g
            key={x}
            transform={`translate(${x} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.5 : (i % 3) * 3})`}
          >
            <rect x={-24} y={-6} width={48} height={18} rx={8} fill={BARK} {...ink(2.5)} />
            <ellipse cx={24} cy={3} rx={5} ry={8} fill="#d9a86a" {...ink(1.5)} />
          </g>
        );
      })}
      {/* Water spurting through the cracks toward us. */}
      {crack >= 0 &&
        [0.25, 0.5, 0.75].map((f, i) => {
          const x = lerp(a, b, f);
          const h =
            (30 + 50 * clamp01(crack / 600)) *
            (1 + (burst > 0 ? 1.5 : 0)) *
            (0.8 + 0.2 * Math.sin(p.t / 70 + i));
          return (
            <path
              key={f}
              d={`M${x - 8} ${-DAM.top + 30} Q${x + h * 0.6} ${-DAM.top + 20} ${x + h} ${40} L${x + h - 26} ${40} Q${x + h * 0.4} ${-DAM.top + 44} ${x - 8} ${-DAM.top + 44} Z`}
              fill={FOAM}
              {...ink(2)}
            />
          );
        })}
      {/* The beavers wave hello, then dive out of the way. */}
      {DAM.beavers.map((x, i) => {
        const dive = burst - i * 80;
        const y = dive < 0 ? 20 - 20 * clamp01(crack / 300) : 20 + dive * 0.25;
        return y < 70 ? <Beaver key={x} x={x} y={y} wave={Math.sin(p.t / 120 + i)} /> : null;
      })}
      <Splash x={(a + b) / 2} y={0} dt={burst} size={1.4} />
    </g>
  );
}

// ---------- Level 19: rapids ride ----------
// board (he hops on a floating log) → drop (it flies off the step) → splash → off.

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

// ---------- Level 20: rope bridge ----------
// snap (the planks ahead fall away) → he goes hand over hand along the rope → climbs up.

export function RopeBridgeBack(p: ObstacleProps) {
  const [a, b] = ROPE_BRIDGE.gorge;
  const [g0, g1] = ROPE_BRIDGE.gap;
  const snap = since(p, 'snap');
  const planks = [];
  for (let x = a + 4; x < b - 4; x += 44) planks.push(x);
  const sag = 12 + 10 * bump(snap, 700);
  return (
    <g>
      <path
        d={`M${a - 16} -4 L${a} 20 L${a + 30} 240 L${b - 30} 240 L${b} 20 L${b + 16} -4 Z`}
        fill="#2a3a44"
        {...ink(3)}
      />
      <path
        d={`M${a + 40} 150 Q${(a + b) / 2} 120 ${b - 40} 150 L${b - 40} 240 L${a + 40} 240 Z`}
        fill={WATER}
      />
      <path
        d={`M${a + 60} 150 h 80 M${a + 300} 146 h 120 M${b - 200} 150 h 90`}
        stroke={FOAM}
        strokeWidth={5}
        strokeLinecap="round"
      />
      {[a - 10, b + 10].map((x) => (
        <rect
          key={x}
          x={x - 9}
          y={-ROPE_BRIDGE.rope - 30}
          width={18}
          height={ROPE_BRIDGE.rope + 36}
          rx={4}
          fill={BARK}
          {...ink(3)}
        />
      ))}
      {planks.map((x, i) => {
        const inGap = x > g0 - 22 && x < g1 + 22;
        const dt = inGap ? snap - Math.abs(x - (g0 + g1) / 2) * 0.6 : -1;
        const y = fallen(dt, 0.0028);
        if (y > 300) return null;
        return (
          <g
            key={x}
            transform={`translate(${x + 20} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.5 : 0})`}
          >
            <rect x={-20} y={-6} width={40} height={12} rx={2} fill={WOOD} {...ink(2.5)} />
          </g>
        );
      })}
      {/* The hand rope he hangs from. */}
      <path
        d={`M${a - 10} ${-ROPE_BRIDGE.rope} Q${(a + b) / 2} ${-ROPE_BRIDGE.rope + sag} ${b + 10} ${-ROPE_BRIDGE.rope}`}
        stroke={INK}
        strokeWidth={9}
        fill="none"
      />
      <path
        d={`M${a - 10} ${-ROPE_BRIDGE.rope} Q${(a + b) / 2} ${-ROPE_BRIDGE.rope + sag} ${b + 10} ${-ROPE_BRIDGE.rope}`}
        stroke="#c9a66b"
        strokeWidth={5}
        fill="none"
      />
      <Dust x={(g0 + g1) / 2} y={-10} dt={snap} ms={700} size={0.9} />
    </g>
  );
}

// ---------- Level 21: geyser launch ----------
// rumble (the springs boil) → blast (the geyser under his rock shoots him up) → land.

function Geyser({ x, dt, h }: { x: number; dt: number; h: number }) {
  if (!(dt >= 0 && dt < 2200)) return null;
  const rise = easeOut(clamp01(dt / 250)) * (1 - clamp01((dt - 1500) / 700));
  const top = -h * rise;
  const w = 34;
  return (
    <g>
      <path
        d={`M${x - w} 10 Q${x - w * 0.6} ${top * 0.5} ${x - w * 0.8} ${top} Q${x} ${top - 40} ${x + w * 0.8} ${top} Q${x + w * 0.6} ${top * 0.5} ${x + w} 10 Z`}
        fill={tint(WATER, 0.4)}
        {...ink(3)}
      />
      <path d={`M${x - 8} 0 V${top + 20}`} stroke={FOAM} strokeWidth={10} strokeLinecap="round" />
      <g fill={FOAM} {...ink(2)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={x + (i - 2) * 22 + 6 * Math.sin(dt / 60 + i)}
            cy={top - 10 + 10 * Math.sin(dt / 80 + i * 2)}
            r={14 + noise(i) * 8}
          />
        ))}
      </g>
    </g>
  );
}

export function GeyserBack(p: ObstacleProps) {
  const [a, b] = GEYSER.pool;
  const rumble = since(p, 'rumble');
  const blast = since(p, 'blast');
  const [v1] = GEYSER.vents;
  // His rock lid rides up with him, then drops back onto the vent.
  const blastAt = eventTime(p.events, 'blast');
  const release = blastAt + 500;
  const lid =
    p.t < blastAt
      ? 30
      : p.t < release
        ? p.heroLift
        : Math.max(30, p.heroAt(release).lift - fallen(p.t - release, 0.003));
  return (
    <g>
      <path
        d={`M${a} 2 Q${(a + b) / 2} 16 ${b} 2 L${b - 20} 60 L${a + 20} 60 Z`}
        fill="#6ec8d8"
        {...ink(3)}
      />
      {/* Steam and bubbles as the springs boil. */}
      {rumble >= 0 &&
        Array.from({ length: 8 }, (_, i) => {
          const cycle = (rumble + i * 190) % 1200;
          return (
            <circle
              key={i}
              cx={a + 40 + i * ((b - a - 80) / 7) + 10 * Math.sin(cycle / 200)}
              cy={-cycle * 0.12}
              r={10 + cycle * 0.03}
              fill="#ffffff"
              opacity={0.5 * (1 - cycle / 1200)}
            />
          );
        })}
      {GEYSER.vents.map((x, i) => (
        <Geyser key={x} x={x} dt={blast - i * 350} h={i === 0 ? 420 : 300} />
      ))}
      <g transform={`translate(${v1} ${-lid + 16})`}>
        <path d="M-56 4 Q-50 -14 0 -16 Q50 -14 56 4 L44 22 L-44 22 Z" fill={ROCK} {...ink(3)} />
        <path d="M-44 -8 Q0 -16 44 -8" stroke={tint(ROCK, 0.4)} strokeWidth={5} fill="none" />
      </g>
    </g>
  );
}

// ---------- Level 22: waterfall slide ----------
// crack (the top rock breaks) → he slides down the chute → launch (off the lip, over the pool).

export function FallsBack(p: ObstacleProps) {
  const [[c0x, c0l], [c1x, c1l]] = FALLS.chute;
  const [p0, p1] = FALLS.pool;
  const crack = since(p, 'crack');
  const slide = crack >= 0;
  return (
    <g>
      {/* The waterfall pouring down from the cliff onto the top of the chute. */}
      <rect
        x={c0x - 10}
        y={-900}
        width={70}
        height={900 - c0l}
        fill={tint(WATER, 0.25)}
        {...ink(3)}
      />
      <g stroke={FOAM} strokeWidth={5} strokeLinecap="round">
        {[0, 1, 2, 3, 4].map((i) => {
          const y = -900 + ((p.t * 0.9 + i * 170) % (900 - c0l - 30));
          return <path key={i} d={`M${c0x + 6 + (i % 3) * 16} ${y} v 30`} />;
        })}
      </g>
      {/* Rock steps up to the top. */}
      {FALLS.steps.map(([x, lift]) => (
        <path key={x} d={`M${x - 50} 4 V${-lift} H${x + 40} V4 Z`} fill={ROCK} {...ink(3)} />
      ))}
      {/* The chute: a smooth wet rock slope with water rushing down it. */}
      <path
        d={`M${c0x - 20} ${-c0l} L${c1x} ${-c1l} L${c1x + 20} ${-c1l + 10} L${c1x + 20} 6 L${c0x - 20} 6 Z`}
        fill={shade(ROCK, 0.15)}
        {...ink(3)}
      />
      <path
        d={`M${c0x - 20} ${-c0l - 6} L${c1x + 10} ${-c1l - 6}`}
        stroke={WATER}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d={`M${c0x} ${-c0l - 9} L${c1x} ${-c1l - 9}`}
        stroke={FOAM}
        strokeWidth={3}
        strokeDasharray="20 30"
        strokeDashoffset={-p.t * 0.6}
      />
      {/* The pool he flies over. */}
      <River a={p0} b={p1} level={8} t={p.t} white={0.5} />
      <Bank x={p0} dir={1} />
      <Bank x={p1} dir={-1} />
      {/* The top rock cracks away as he starts to slide. */}
      {slide && (
        <g
          transform={`translate(${c0x - 30 - crack * 0.05} ${-c0l + fallen(crack - 150, 0.002)}) rotate(${-crack * 0.05})`}
        >
          <path d="M-26 0 L-18 -20 L14 -24 L26 0 Z" fill={ROCK} {...ink(2.5)} />
        </g>
      )}
      <Splash x={c1x + 60} y={0} dt={since(p, 'launch')} size={1.2} />
    </g>
  );
}

// ---------- Level 23: rising water ----------
// flood (a wall of water pours in) → he climbs the root ladder → safe (up on the ledge).

export function RisingBack(p: ObstacleProps) {
  const { cliff, ledge, ladder } = RISING;
  const flood = since(p, 'flood');
  // The water climbs after him but stays below his feet, rising up the cliff once he's safe.
  const rise = lerp(80, -240, easeOut(clamp01(flood / 2600)));
  const level = flood < 0 ? 80 : Math.max(rise, -p.heroLift + 60);
  return (
    <g>
      {/* The cliff and its high ledge running on to the right. */}
      <path d={`M${cliff} 6 L${cliff + 10} ${-ledge} H2400 V6 Z`} fill="#8a7a6a" {...ink(3.5)} />
      <path
        d={`M${cliff + 10} ${-ledge} H2400 V${-ledge + 22} H${cliff + 8} Z`}
        fill={BANK}
        {...ink(3)}
      />
      <path
        d={`M${cliff + 60} ${-ledge + 80} l 40 20 M${cliff + 200} ${-ledge + 160} l 60 -10 M${cliff + 120} -60 l 30 30`}
        stroke={shade('#8a7a6a', 0.35)}
        strokeWidth={4}
      />
      {/* The root ladder hanging down the cliff face. */}
      <g stroke={INK} strokeWidth={9} strokeLinecap="round">
        <path
          d={`M${ladder - 22} ${-ledge - 4} Q${ladder - 30} ${-ledge / 2} ${ladder - 22} 0`}
          fill="none"
        />
        <path
          d={`M${ladder + 22} ${-ledge - 4} Q${ladder + 14} ${-ledge / 2} ${ladder + 22} 0`}
          fill="none"
        />
      </g>
      <g stroke="#7a5234" strokeWidth={5} strokeLinecap="round">
        <path
          d={`M${ladder - 22} ${-ledge - 4} Q${ladder - 30} ${-ledge / 2} ${ladder - 22} 0`}
          fill="none"
        />
        <path
          d={`M${ladder + 22} ${-ledge - 4} Q${ladder + 14} ${-ledge / 2} ${ladder + 22} 0`}
          fill="none"
        />
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M${ladder - 24} ${-20 - i * 42} H${ladder + 22}`} stroke="#7a5234" />
        ))}
      </g>
      {flood >= 0 && <River a={-700} b={cliff + 4} level={level} t={p.t} flow={0.8} white={0.8} />}
      <Splash x={-100} y={level} dt={flood} size={2} />
    </g>
  );
}

// ---------- Level 24 (boss): cross the river ----------
// build (logs roll in, a rope binds them, a sail pops up) → sail (push off)
// → wave (a giant wave lifts the raft) → splash → beach.

function raftPose(p: ObstacleProps) {
  const sailAt = eventTime(p.events, 'sail');
  const beachAt = eventTime(p.events, 'beach');
  const riding = p.t >= sailAt && p.t < beachAt;
  const x = p.t < sailAt ? RAFT.raftRest : Math.min(p.heroX, RAFT.beach);
  const deckY = riding ? -p.heroLift : -RAFT.deck + 3 * Math.sin(p.t / 300);
  const waveAt = eventTime(p.events, 'wave');
  const splashAt = eventTime(p.events, 'splash');
  let tilt = 0;
  if (p.t >= waveAt && p.t < splashAt)
    tilt = (p.t - waveAt) / (splashAt - waveAt) < 0.55 ? -14 : 12;
  return { x, deckY, tilt, riding };
}

export function RaftBack(p: ObstacleProps) {
  const [a, b] = RAFT.river;
  const waveAt = eventTime(p.events, 'wave');
  const splashAt = eventTime(p.events, 'splash');
  const raft = raftPose(p);
  const sail = easeOut(clamp01((since(p, 'build') - 1150) / 300));
  const inWave = p.t >= waveAt && p.t < splashAt + 700;
  const waveH = inWave ? Math.max(0, -raft.deckY - RAFT.deck) + 40 : 0;
  return (
    <g>
      <River a={a} b={b} level={10} t={p.t} flow={0.5} white={clamp01(since(p, 'sail') / 1000)} />
      <Bank x={a} dir={1} />
      {/* The far beach. */}
      <path
        d={`M${b - 40} 4 Q${b + 20} -6 ${b + 80} -2 L2600 -2 V240 H${b - 60} Z`}
        fill="#e6cf98"
        {...ink(3)}
      />
      {inWave && p.t < splashAt && <CurlWave x={raft.x + 80} level={14} h={waveH} t={p.t} />}
      {/* The mast and sail stand behind him. */}
      <g transform={`translate(${raft.x} ${raft.deckY}) rotate(${raft.tilt})`}>
        {sail > 0 && (
          <g transform={`scale(1 ${sail})`}>
            <path d="M-80 0 V-190" stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <path d="M-80 0 V-190" stroke={WOOD} strokeWidth={5} strokeLinecap="round" />
            <path d="M-74 -180 Q-4 -120 -14 -40 L-74 -40 Z" fill="#f3e6cf" {...ink(3)} />
            <path d="M-58 -140 L-34 -70" stroke="#e8743b" strokeWidth={8} />
          </g>
        )}
      </g>
      <Splash x={raft.x} y={0} dt={p.t - splashAt} size={1.8} />
    </g>
  );
}

export function RaftFront(p: ObstacleProps) {
  const build = since(p, 'build');
  const raft = raftPose(p);
  if (build < 0) return null;
  // Three logs roll in, then the rope wraps them, then the sail pops up.
  const logsIn = [0, 1, 2].map((i) => easeOut(clamp01((build - i * 220) / 400)));
  const rope = clamp01((build - 900) / 250);
  return (
    <g transform={`translate(${raft.x} ${raft.deckY}) rotate(${raft.tilt})`}>
      {logsIn.map((k, i) =>
        k > 0 ? (
          <g key={i} transform={`translate(${lerp(-400 + i * 60, 0, k)} ${i * 2})`}>
            <rect
              x={-110}
              y={i * 12}
              width={220}
              height={20}
              rx={10}
              fill={i % 2 ? BARK : shade(BARK, 0.15)}
              {...ink(2.5)}
            />
            <ellipse cx={110} cy={i * 12 + 10} rx={6} ry={10} fill="#d9a86a" {...ink(1.5)} />
          </g>
        ) : null,
      )}
      {rope > 0 &&
        [-70, 70].map((x) => (
          <path
            key={x}
            d={`M${x} -2 V${38 * rope}`}
            stroke="#c9a66b"
            strokeWidth={7}
            strokeLinecap="round"
          />
        ))}
      {raft.riding && <SpeedLines x={-140} t={p.t} ys={[-30, -60, -90]} />}
    </g>
  );
}
