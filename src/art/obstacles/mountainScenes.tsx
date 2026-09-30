import { Dust, Glow, SpeedLines } from '../fx';
import { INK, ink, shade } from '../style';
import {
  AVALANCHE,
  GOAT,
  ICE_BRIDGE,
  ICE_WALL,
  ICICLES,
  LEDGE,
  PEAK,
  ROCK_SLIDE,
} from './mountainLayout';
import { bump, clamp01, easeOut, fallen, lerp, noise, rollAngle, since } from './sceneKit';
import { eventTime, type ObstacleProps } from './types';

/*
 * World 4 (Misty Mountains) scenes, levels 25–32. Every motion is computed from `t`
 * and the prop schedule, so any frame can be drawn exactly.
 */

const STONE = '#8a8590';
const DARK = '#5e5a66';
const SNOW = '#f4f8ff';
const SNOW_SHADE = '#c8d6ea';
const ICE = '#a8e0f4';
const PINE = '#2f5e4a';
const BARK = '#6b4a32';

/** A chunky mountain rock with a snowy top, `s` px across, resting at (0, 0). */
function Boulder({ s, snow = true }: { s: number; snow?: boolean }) {
  const k = s / 60;
  return (
    <g transform={`scale(${k})`}>
      <path d="M-30 0 L-26 -30 L-6 -44 L20 -38 L30 -12 L28 0 Z" fill={STONE} {...ink(3 / k)} />
      <path d="M20 -38 L30 -12 L28 0 L8 0 Z" fill={shade(STONE, 0.3)} />
      {snow && <path d="M-26 -30 L-6 -44 L20 -38 L12 -32 L-4 -36 L-18 -26 Z" fill={SNOW} />}
    </g>
  );
}

/** A sheer drop in front of the path from a to b (a chasm down to the bottom of the screen). */
function Chasm({ a, b, color = '#3a4458' }: { a: number; b: number; color?: string }) {
  return (
    <g>
      <path
        d={`M${a - 8} -2 L${a} 16 L${a + 10} 240 L${b - 10} 240 L${b} 16 L${b + 8} -2 Z`}
        fill={color}
        {...ink(3)}
      />
      <path d={`M${a} 16 L${a + 10} 240 L${a + 30} 240 Z`} fill={shade(color, 0.3)} />
      <path
        d={`M${a + 20} 200 Q${(a + b) / 2} 150 ${b - 20} 200 L${b - 20} 240 L${a + 20} 240 Z`}
        fill="#dfe8f6"
        opacity={0.5}
      />
    </g>
  );
}

/** Snowflakes blowing sideways across the scene. */
function Blizzard({
  t,
  strength,
  x0 = -400,
  x1 = 2400,
}: {
  t: number;
  strength: number;
  x0?: number;
  x1?: number;
}) {
  if (strength <= 0) return null;
  return (
    <g fill="#ffffff" opacity={0.85 * strength}>
      {Array.from({ length: 40 }, (_, i) => {
        const span = x1 - x0;
        const x = x0 + ((i * 97 + t * (0.5 + noise(i) * 0.4)) % span);
        const y = -700 + ((i * 53 + t * 0.25) % 760);
        return <circle key={i} cx={x} cy={y} r={3 + (i % 3)} />;
      })}
    </g>
  );
}

// ---------- Level 25: rock slide ----------
// rumble → slide (rocks bounce down the mountain; he dives under the overhang) → clear.

const SLIDE_ROCKS = Array.from({ length: 9 }, (_, i) => ({
  delay: i * 170,
  size: 36 + noise(i, 3) * 40,
  hop: 2 + (i % 3),
}));

export function RockSlideBack(p: ObstacleProps) {
  const [o0, o1] = ROCK_SLIDE.overhang;
  const rumble = since(p, 'rumble');
  const slide = since(p, 'slide');
  return (
    <g>
      {/* The overhang: a shelf of rock jutting out from the mountainside behind the path. */}
      <path
        d={`M${o0 - 40} ${-ROCK_SLIDE.roof - 10} Q${o0} ${-ROCK_SLIDE.roof - 40} ${(o0 + o1) / 2} ${-ROCK_SLIDE.roof - 30} Q${o1 + 20} ${-ROCK_SLIDE.roof - 60} ${o1 + 120} ${-ROCK_SLIDE.roof - 140} L${o1 + 160} 4 L${o1 + 60} 4 Q${o1 + 20} ${-ROCK_SLIDE.clear} ${o1 - 30} ${-ROCK_SLIDE.clear} L${o0} ${-ROCK_SLIDE.clear} Q${o0 - 50} ${-ROCK_SLIDE.clear - 20} ${o0 - 40} ${-ROCK_SLIDE.roof - 10} Z`}
        fill={DARK}
        {...ink(3.5)}
      />
      <path
        d={`M${o0 - 30} ${-ROCK_SLIDE.roof - 16} Q${o0 + 20} ${-ROCK_SLIDE.roof - 44} ${(o0 + o1) / 2} ${-ROCK_SLIDE.roof - 34} Q${o1} ${-ROCK_SLIDE.roof - 56} ${o1 + 100} ${-ROCK_SLIDE.roof - 130} L${o1 + 80} ${-ROCK_SLIDE.roof - 100} Q${o1} ${-ROCK_SLIDE.roof - 36} ${(o0 + o1) / 2} ${-ROCK_SLIDE.roof - 18} Z`}
        fill={SNOW}
      />
      <path
        d={`M${o0 + 10} ${-ROCK_SLIDE.clear - 12} H${o1 - 40}`}
        stroke={shade(DARK, 0.4)}
        strokeWidth={6}
      />
      {/* Pebbles trickle down in the rumble. */}
      {rumble >= 0 &&
        slide < 0 &&
        [0, 1, 2, 3, 4].map((i) => {
          const dt = (rumble + i * 160) % 700;
          return (
            <circle
              key={i}
              cx={900 + i * 60 - dt * 0.3}
              cy={-600 + fallen(dt, 0.002)}
              r={6}
              fill={STONE}
              {...ink(2)}
            />
          );
        })}
      <Dust
        x={(o0 + o1) / 2}
        y={-4}
        dt={since(p, 'clear') - 100}
        ms={900}
        size={1.5}
        color="#cfc8d8"
      />
    </g>
  );
}

export function RockSlideFront(p: ObstacleProps) {
  const slide = since(p, 'slide');
  if (slide < 0) return null;
  return (
    <g>
      {SLIDE_ROCKS.map((r, i) => {
        const dt = slide - r.delay;
        if (dt < 0) return null;
        // Along a slope from the upper right to the lower left, hopping as it goes.
        const u = dt / 2000;
        if (u > 1) return null;
        const x = lerp(1500, -700, u);
        const base = lerp(-700, -20, u);
        const y = base - 140 * Math.abs(Math.sin(Math.PI * u * r.hop));
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${-rollAngle(1500 - x, r.size / 2)})`}>
            <Boulder s={r.size} snow={i % 2 === 0} />
          </g>
        );
      })}
    </g>
  );
}

// ---------- Level 26: crumbling ledge ----------
// gust (the wind howls) → crumble (the ledge breaks into gaps) → he leaps them.

export function LedgeBack(p: ObstacleProps) {
  const gust = since(p, 'gust');
  const crumble = since(p, 'crumble');
  return (
    <g>
      {/* The sheer drop in front of the ledge. */}
      <path d="M-400 14 H1800 V240 H-400 Z" fill="#8a96b0" />
      <path d="M-400 14 H1800" stroke={INK} strokeWidth={3} />
      <g fill={shade('#8a96b0', 0.15)}>
        {[-200, 200, 600, 1000, 1400].map((x) => (
          <path key={x} d={`M${x} 14 L${x + 40} 120 L${x + 90} 240 L${x - 30} 240 Z`} />
        ))}
      </g>
      {LEDGE.gaps.map(([a, b], i) => {
        const dt = crumble - i * 120;
        return (
          <g key={a}>
            {dt >= 0 && <Chasm a={a} b={b} color="#4a5670" />}
            {/* The chunks of ledge falling away. */}
            {[0, 1, 2].map((j) => {
              const y = fallen(dt - j * 60, 0.0025);
              if (y > 300) return null;
              const x = a + ((b - a) * (j + 0.5)) / 3;
              return (
                <g
                  key={j}
                  transform={`translate(${x} ${y}) rotate(${dt > 0 ? (j - 1) * dt * 0.15 : 0})`}
                >
                  <path
                    d={`M${-(b - a) / 6 - 4} -2 H${(b - a) / 6 + 4} L${(b - a) / 8} 30 H${-(b - a) / 8} Z`}
                    fill={STONE}
                    {...ink(2.5)}
                  />
                  <path
                    d={`M${-(b - a) / 6 - 4} -2 H${(b - a) / 6 + 4} V4 H${-(b - a) / 6 - 4} Z`}
                    fill={SNOW}
                  />
                </g>
              );
            })}
            <Dust x={(a + b) / 2} y={10} dt={dt} ms={700} size={0.7} color="#dfe6f2" />
          </g>
        );
      })}
      {/* Gusts of wind. */}
      {gust >= 0 && (
        <g
          stroke="#ffffff"
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
          opacity={0.7 * (1 - clamp01((gust - 2500) / 800))}
        >
          {[0, 1, 2, 3].map((i) => {
            const x = -300 + ((gust * 0.9 + i * 400) % 1800);
            const y = -120 - i * 70;
            return <path key={i} d={`M${x} ${y} q 60 -20 120 0 t 120 0 q 30 -30 0 -40`} />;
          })}
        </g>
      )}
    </g>
  );
}

// ---------- Level 27: avalanche ----------
// crack (the snowfield breaks) → grab (he hangs from a branch as the wave rushes under) → settle.

export function AvalancheBack(p: ObstacleProps) {
  const { tree, branch } = AVALANCHE;
  const crack = since(p, 'crack');
  return (
    <g>
      {/* A big pine, with the strong branch he grabs. */}
      <path
        d={`M${tree + 60} 6 L${tree + 66} -700 L${tree + 104} -700 L${tree + 110} 6 Z`}
        fill={BARK}
        {...ink(3.5)}
      />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${tree - 40 + i * 20} ${-420 - i * 110} L${tree + 85} ${-620 - i * 110} L${tree + 210 - i * 20} ${-420 - i * 110} Z`}
          fill={PINE}
          {...ink(3)}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${tree - 20 + i * 20} ${-430 - i * 110} L${tree + 85} ${-470 - i * 110} L${tree + 190 - i * 20} ${-430 - i * 110}`}
          stroke={SNOW}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path
        d={`M${tree + 70} ${-branch - 10} Q${tree - 20} ${-branch + 4} ${tree - 110} ${-branch - 8}`}
        stroke={INK}
        strokeWidth={26}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${tree + 70} ${-branch - 10} Q${tree - 20} ${-branch + 4} ${tree - 110} ${-branch - 8}`}
        stroke={BARK}
        strokeWidth={19}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${tree + 40} ${-branch - 20} Q${tree - 20} ${-branch - 8} ${tree - 100} ${-branch - 18}`}
        stroke={SNOW}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
      {/* The crack across the snowfield up the mountain. */}
      {crack >= 0 && (
        <path
          d="M-600 -520 l 60 20 l 40 -14 l 70 24 l 50 -10"
          stroke={INK}
          strokeWidth={4}
          fill="none"
          strokeDasharray={`${Math.min(260, crack * 0.6)} 400`}
        />
      )}
    </g>
  );
}

export function AvalancheFront(p: ObstacleProps) {
  const crackAt = eventTime(p.events, 'crack');
  const grabAt = eventTime(p.events, 'grab');
  if (p.t < crackAt) return null;
  const hit = grabAt + 400;
  const v = (AVALANCHE.tree - 60 - AVALANCHE.snowStart) / (hit - crackAt);
  const front = AVALANCHE.snowStart + (p.t - crackAt) * v;
  const h = AVALANCHE.wave;
  // The new snow it leaves behind stays, all the way back up the slope.
  const back = AVALANCHE.snowStart;
  // Once the wave has passed he drops onto the new snow it left behind.
  const settledTop = -AVALANCHE.settled;
  return (
    <g>
      <path
        d={`M${back - 200} 30 L${back} ${settledTop} L${front - 260} ${settledTop} Q${front - 150} ${-h - 10} ${front - 40} ${-h * 0.9} Q${front + 20} ${-h * 0.6} ${front + 30} 30 Z`}
        fill={SNOW}
        {...ink(3.5)}
      />
      <path
        d={`M${back} ${settledTop + 18} H${front - 200} Q${front - 110} ${-h * 0.4} ${front - 30} ${-h * 0.3}`}
        stroke={SNOW_SHADE}
        strokeWidth={10}
        fill="none"
      />
      <g fill={SNOW} {...ink(2.5)}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx={front - 30 - i * 28 + 8 * Math.sin(p.t / 70 + i)}
            cy={-h * 0.8 - 30 * noise(i, 3) - 16 * Math.abs(Math.sin(p.t / 120 + i))}
            r={18 + noise(i) * 12}
          />
        ))}
      </g>
      {front > 0 && <SpeedLines x={front - 300} t={p.t} ys={[-40, -80, -120]} />}
    </g>
  );
}

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

// ---------- Level 29: ice bridge ----------
// crack → shatter (the ice breaks up behind him as he slides across).

function iceFallAt(p: ObstacleProps, x: number) {
  const shatterAt = eventTime(p.events, 'shatter');
  const start = p.heroAt(shatterAt).x - ICE_BRIDGE.lag;
  const [a] = ICE_BRIDGE.crevasse;
  if (x <= start) return shatterAt + ((x - a) / Math.max(1, start - a)) * 200;
  // He runs a moment, then slides; the break keeps pace with him.
  return shatterAt + 250 + (x - start) / ICE_BRIDGE.speed;
}

export function IceBridgeBack(p: ObstacleProps) {
  const [a, b] = ICE_BRIDGE.crevasse;
  const crack = since(p, 'crack');
  const pieces = [];
  for (let x = a; x < b; x += 50) pieces.push(x);
  return (
    <g>
      <Chasm a={a} b={b} color="#2e4a6a" />
      {pieces.map((x, i) => {
        const dt = p.t - iceFallAt(p, x + 25);
        const y = fallen(dt, 0.0026);
        if (y > 300) return null;
        return (
          <g
            key={x}
            transform={`translate(${x + 25} ${y}) rotate(${dt > 0 ? (noise(i) - 0.5) * dt * 0.3 : 0})`}
          >
            <path
              d={`M-26 -4 H26 L${18 + (i % 3) * 3} 26 L${-20 + (i % 2) * 4} 30 Z`}
              fill={ICE}
              {...ink(2.5)}
            />
            <path d="M-20 0 H16" stroke="#ffffff" strokeWidth={4} opacity={0.8} />
          </g>
        );
      })}
      {/* Cracks spreading across the ice. */}
      {crack >= 0 && (
        <g stroke={INK} strokeWidth={2.5} fill="none">
          {[0, 1, 2, 3].map((i) => {
            const x = a + 80 + i * 170;
            const len = Math.min(1, crack / 500) * 40;
            return (
              <path
                key={i}
                d={`M${x} 0 l ${len * 0.5} ${len * 0.3} l ${len * 0.4} -${len * 0.2} l ${len * 0.6} ${len * 0.35}`}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}

// ---------- Level 30: icicle cave ----------
// rumble → fall (icicles crash down right behind him as he dashes through).

export function IcicleCaveBack(p: ObstacleProps) {
  const [a, b] = ICICLES.cave;
  const top = -ICICLES.ceiling;
  const fallAt = eventTime(p.events, 'fall');
  const icicles = [];
  for (let x = a + 60; x < b - 40; x += 110) icicles.push(x);
  const rumble = since(p, 'rumble');
  return (
    <g>
      {/* The cave: an icy ceiling and walls, glowing blue inside. */}
      <path
        d={`M${a - 120} 4 L${a - 60} ${top - 60} Q${(a + b) / 2} ${top - 140} ${b + 60} ${top - 60} L${b + 120} 4 L${b + 40} 4 Q${b} ${top + 40} ${b - 60} ${top} H${a + 60} Q${a} ${top + 40} ${a - 40} 4 Z`}
        fill="#6a9ac8"
        {...ink(3.5)}
      />
      <path
        d={`M${a - 40} 4 Q${a} ${top + 40} ${a + 60} ${top} H${b - 60} Q${b} ${top + 40} ${b + 40} 4 Z`}
        fill="#bfe4f8"
        opacity={0.35}
      />
      <Glow x={(a + b) / 2} y={top / 2} r={380} color="#dff4ff" />
      {icicles.map((x, i) => {
        // Each drops once he is safely past it.
        let dropAt = Infinity;
        if (p.t >= fallAt) {
          for (let t = fallAt; t <= p.t; t += 20) {
            if (p.heroAt(t).x > x + ICICLES.behind) {
              dropAt = t;
              break;
            }
          }
        }
        const dt = p.t - dropAt;
        const len = 90 + noise(i, 2) * 70;
        const wobble = rumble >= 0 && dt < 0 ? 2 * Math.sin(p.t / 30 + i) : 0;
        const y = top + fallen(dt, 0.004);
        const landed = y - top + len > -top;
        const iy = landed ? -len : y;
        return (
          <g key={x}>
            {!landed ? (
              <path
                transform={`translate(${x + wobble} ${iy})`}
                d={`M-18 0 L18 0 L2 ${len} L-2 ${len} Z`}
                fill={ICE}
                {...ink(2.5)}
              />
            ) : (
              <g transform={`translate(${x} 0)`}>
                <path d="M-30 4 L-10 -30 L6 -10 L22 -40 L34 4 Z" fill={ICE} {...ink(2.5)} />
              </g>
            )}
            {landed && (
              <Dust
                x={x}
                y={-6}
                dt={dt - Math.sqrt((-top - len) / 0.004)}
                ms={600}
                size={0.6}
                color="#e8f6ff"
              />
            )}
                pieces={debrisPieces(i + 3, 4)}
                color={ICE}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

// ---------- Level 31: ice wall ----------
// climb → slip (a foothold breaks and he drops a little) → he climbs on to the top.

export function IceWallBack(p: ObstacleProps) {
  const { wall, top } = ICE_WALL;
  const slip = since(p, 'slip');
  return (
    <g>
      <path d={`M${wall - 20} 6 L${wall - 10} ${-top} H3000 V6 Z`} fill={ICE} {...ink(3.5)} />
      <g fill="#ffffff" opacity={0.55}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M${wall + 20 + i * 70} ${-top + 20} q -12 ${120 + i * 20} 6 ${top - 60}`}
            stroke="#ffffff"
            strokeWidth={8}
            fill="none"
          />
        ))}
      </g>
      <path
        d={`M${wall - 14} ${-top - 4} H3000 V${-top + 16} H${wall - 12} Z`}
        fill={SNOW}
        {...ink(2.5)}
      />
      {/* The foothold that breaks away. */}
      <g
        transform={`translate(${wall - 16} ${-120 + fallen(slip, 0.003)}) rotate(${slip > 0 ? slip * 0.3 : 0})`}
      >
        {fallen(slip, 0.003) < 200 && <path d="M-16 -10 H10 L4 12 H-12 Z" fill={ICE} {...ink(2)} />}
      </g>
      <g fill={ICE} {...ink(2)}>
        {[0, 1, 2].map((i) => {
          const dt = since(p, 'climb') - 600 - i * 700;
          const y = -top + fallen(dt, 0.003);
          return dt > 0 && y < 60 ? (
            <path key={i} d={`M${wall + 40 + i * 30} ${y} l 16 -6 l 6 16 Z`} />
          ) : null;
        })}
      </g>
    </g>
  );
}

// ---------- Level 32 (boss): over the peak ----------
// storm → sled (he jumps on at the peak) → land (over the crevasse) → off; the storm clears.

function groundLift(x: number) {
  const pts = PEAK.profile;
  if (x <= pts[0][0]) return 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, l0] = pts[i - 1]!;
    const [x1, l1] = pts[i]!;
    if (x <= x1) return lerp(l0, l1, (x - x0) / (x1 - x0));
  }
  return 0;
}

function sledPose(p: ObstacleProps) {
  const sledAt = eventTime(p.events, 'sled');
  const offAt = eventTime(p.events, 'off');
  const riding = p.t >= sledAt && p.t < offAt;
  const x = p.t < sledAt ? PEAK.sled : Math.min(p.heroX, PEAK.stop);
  const lift = riding ? p.heroLift - PEAK.seat : groundLift(x);
  const slope = x > 480 && x < 1500 && lift - groundLift(x) < 4 ? 12 : 0;
  return { x, lift, slope, riding };
}

export function PeakBack(p: ObstacleProps) {
  const [c0, c1] = PEAK.crevasse;
  const storm = clamp01(since(p, 'storm') / 900) - clamp01(since(p, 'land') / 1000);
  const flash =
    since(p, 'storm') >= 0 ? Math.max(bump((since(p, 'storm') % 1700) - 900, 160), 0) : 0;
  const profile = PEAK.profile.map(([x, l]) => `${x} ${-l}`).join(' L');
  const sun = clamp01(since(p, 'land') / 1000);
  return (
    <g>
      <rect x={-600} y={-900} width={3400} height={1200} fill="#2a3048" opacity={0.45 * storm} />
      <g opacity={sun}>
        <Glow x={1900} y={-560} r={200} color="#fff3b0" />
        <circle cx={1900} cy={-560} r={50} fill="#fff3b0" {...ink(3)} />
      </g>
      {/* The mountain shoulder: up to the peak, then a long run down. */}
      <path
        d={`M-40 4 L${profile} L${c0 - 60} 0 L${c0} 0 L${c0} 240 L-40 240 Z`}
        fill={SNOW}
        {...ink(3.5)}
      />
      <path
        d={`M100 ${-groundLift(100) + 20} L400 -200 L480 -200 L1300 ${-groundLift(1300) + 16}`}
        stroke={SNOW_SHADE}
        strokeWidth={10}
        fill="none"
      />
      <path d={`M${c0 - 80} 0 L${c0 - 10} -30 L${c0} 0 Z`} fill={SNOW} {...ink(3)} />
      <Chasm a={c0} b={c1} color="#3a5070" />
      <path d={`M${c1} 4 H2600 V240 H${c1} Z`} fill={SNOW} {...ink(3)} />
      <path d={`M${c1} 4 H2600`} stroke={SNOW} strokeWidth={6} />
      {/* A lightning bolt far off, with the flash. */}
      {flash > 0 && (
        <g>
          <rect
            x={-600}
            y={-900}
            width={3400}
            height={1200}
            fill="#ffffff"
            opacity={0.35 * flash}
          />
          <path
            d="M1300 -800 L1250 -640 L1300 -640 L1230 -480"
            stroke="#fff6a0"
            strokeWidth={10}
            fill="none"
            strokeLinejoin="round"
          />
        </g>
      )}
      <Blizzard t={p.t} strength={storm} />
    </g>
  );
}

export function PeakFront(p: ObstacleProps) {
  const sled = sledPose(p);
  const landAt = eventTime(p.events, 'land');
  const sledAt = eventTime(p.events, 'sled');
  const flying = p.t >= eventTime(p.events, 'jump') && p.t < landAt;
  const tilt = flying
    ? -10 +
      20 * clamp01((p.t - eventTime(p.events, 'jump')) / (landAt - eventTime(p.events, 'jump')))
    : sled.slope;
  return (
    <g>
      {sled.riding && !flying && <SpeedLines x={sled.x - 120} t={p.t} ys={[-30, -60, -90]} />}
      <g transform={`translate(${sled.x} ${-sled.lift}) rotate(${tilt})`}>
        <path
          d="M-70 -4 H60 Q86 -4 84 -30"
          stroke={INK}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M-70 -4 H60 Q86 -4 84 -30"
          stroke="#c0392b"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        <rect x={-66} y={-26} width={124} height={14} rx={4} fill={BARK} {...ink(2.5)} />
        <path d="M-50 -12 V-4 M30 -12 V-4" stroke={INK} strokeWidth={5} />
      </g>
      {sled.riding && p.t >= sledAt && (
        <Dust
          x={sled.x - 60}
          y={-sled.lift}
          dt={(p.t - sledAt) % 400}
          ms={400}
          size={0.4}
          color="#ffffff"
        />
      )}
      <Dust x={sled.x} y={-sled.lift} dt={p.t - landAt} ms={800} size={1.2} color="#ffffff" />
    </g>
  );
}
