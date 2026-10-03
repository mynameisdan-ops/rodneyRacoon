import { memo, useId } from 'react';
import { Dust, Glow, SparkBurst } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { Flower, GrassClump } from '../../worlds/paintKit';
import { Saguaro } from '../../worlds/canyon';
import { circles, clamp01, easeOut, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { P, SAND, SAND_SHADE, WOOD_DARK } from './kit';
import { HOME } from './layout';

// ---------- Level 40 (boss): home ----------
// storm (the sky darkens and a twister rises between him and home) → clear (he has leapt the
// garden fence; it spins away and the sun breaks through) → home (the porch light comes on, the
// door opens, his family steps out waving, the dog bounds to him, fireworks).

const [H0, H1] = HOME.house;
const HW = H1 - H0;
const WALL = '#f2e2c0';
const ROOF = '#c8402e';
const SKIN = '#f2c49a';

/** The lane, the garden and the farmhouse (painted), with its windows and porch lantern. */
const Homestead = memo(function Homestead({ lit }: { lit: boolean }) {
  const id = useId();
  const glass = lit ? '#ffd35a' : '#c8b88a';
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}lawn`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-60}
          x2="0"
          y2={60}
        >
          <stop offset="0" stopColor="#a8c868" />
          <stop offset="1" stopColor="#7aa04a" />
        </linearGradient>
      </defs>
      {/* The tree behind the house and the windmill beyond it. */}
      <g transform={`translate(${H1 + 260} -12)`}>
        <path
          d="M-10 0 L-26 -360 L26 -360 L10 0 Z"
          fill="none"
          stroke={WOOD_DARK}
          strokeWidth={7}
        />
        <path
          d="M-20 -120 H20 M-16 -240 H16 M-20 -120 L16 -240 M20 -120 L-16 -240"
          stroke={WOOD_DARK}
          strokeWidth={4}
        />
        <g transform="translate(0 -372)">
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              d="M0 0 L60 -8 L60 8 Z"
              fill={i % 2 ? '#e8e0d0' : '#c8c0b0'}
              transform={`rotate(${i * 36})`}
            />
          ))}
          <circle r={9} fill="#8a8078" />
        </g>
      </g>
      <g transform={`translate(${H0 - 120} -12)`}>
        <path d="M-14 0 Q-10 -90 -18 -160 L18 -160 Q10 -90 14 0 Z" fill={WOOD_DARK} />
        <circle cx={-40} cy={-190} r={70} fill="#3e7a3e" />
        <circle cx={40} cy={-200} r={74} fill="#3e7a3e" />
        <circle cx={0} cy={-250} r={80} fill="#4a8a46" />
        <circle cx={30} cy={-270} r={46} fill="#6aa85a" />
        <circle cx={60} cy={-220} r={30} fill="#6aa85a" />
        <circle cx={-20} cy={-200} r={9} fill="#e8502e" />
        <circle cx={30} cy={-180} r={8} fill="#e8502e" />
        <circle cx={-50} cy={-230} r={8} fill="#e8502e" />
      </g>
      {/* The lawn around the house. */}
      <path
        d={`M${HOME.gate - 140} -12 Q${H0} -40 ${H1 + 400} -14 L${H1 + 400} 4 L${HOME.gate - 140} 4 Z`}
        fill={`url(#${id}lawn)`}
      />
      {/* The house: walls of boards, the porch roof on its posts, a red roof and chimney. */}
      <rect x={H0} y={-250} width={HW} height={240} fill={WALL} />
      <rect x={H0} y={-250} width={60} height={240} fill={shade(WALL, 0.18)} />
      <g stroke={shade(WALL, 0.25)} strokeWidth={2} opacity={0.6}>
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${H0} ${-236 + i * 22} H${H1}`} />
        ))}
      </g>
      <rect x={H1 - 80} y={-410} width={34} height={90} fill="#a03a2a" />
      <rect x={H1 - 84} y={-418} width={42} height={12} fill="#7a2a20" />
      <path d={`M${H0 - 40} -246 L${(H0 + H1) / 2} -400 L${H1 + 40} -246 Z`} fill={ROOF} />
      <path
        d={`M${H0 - 40} -246 L${(H0 + H1) / 2} -400 L${(H0 + H1) / 2} -380 L${H0 - 10} -246 Z`}
        fill={tint(ROOF, 0.25)}
      />
      <path d={`M${H0 - 40} -246 H${H1 + 40}`} stroke={shade(ROOF, 0.35)} strokeWidth={8} />
      {/* The windows, warm with light, and the round one in the gable. */}
      {[H0 + 30, H1 - 100].map((x) => (
        <g key={x}>
          <rect x={x - 6} y={-206} width={82} height={68} rx={4} fill={WOOD_DARK} />
          <rect x={x} y={-200} width={70} height={56} rx={2} fill={glass} />
          <path
            d={`M${x + 35} -200 V-144 M${x} -172 H${x + 70}`}
            stroke={WOOD_DARK}
            strokeWidth={4}
          />
          <rect x={x - 8} y={-140} width={86} height={14} rx={3} fill="#a8683a" />
          <circle cx={x + 10} cy={-146} r={7} fill="#ff6a8a" />
          <circle cx={x + 30} cy={-148} r={7} fill="#ffd23f" />
          <circle cx={x + 50} cy={-146} r={7} fill="#ff6a8a" />
          <circle cx={x + 66} cy={-148} r={6} fill="#b48aff" />
        </g>
      ))}
      <circle cx={(H0 + H1) / 2} cy={-310} r={22} fill={WOOD_DARK} />
      <circle cx={(H0 + H1) / 2} cy={-310} r={16} fill={glass} />
      {/* The porch: its roof, posts, steps and the door. */}
      <rect x={H0 + 110} y={-112} width={80} height={102} rx={4} fill="#7a4a2e" />
      <circle cx={H0 + 176} cy={-60} r={4.5} fill="#f2c14a" />
      <path
        d={`M${H0 - 30} -128 H${H1 + 30} L${H1 + 18} -112 H${H0 - 18} Z`}
        fill={shade(ROOF, 0.15)}
      />
      <path
        d={`M${H0 - 10} -112 V-10 M${H1 + 10} -112 V-10 M${(H0 + H1) / 2 + 40} -112 V-10`}
        stroke="#f6efe2"
        strokeWidth={10}
      />
      <rect x={H0 - 30} y={-14} width={HW + 60} height={14} fill="#a8683a" />
      <rect x={H0 + 96} y={0} width={108} height={8} fill="#8a5432" />
      {/* The porch lantern. */}
      <path d={`M${H0 + 230} -128 V-112`} stroke={INK} strokeWidth={3} />
      <rect
        x={H0 + 220}
        y={-112}
        width={20}
        height={26}
        rx={5}
        fill={lit ? '#fff3b0' : '#b0a080'}
        stroke={WOOD_DARK}
        strokeWidth={3}
      />
      {/* The mailbox at the end of the lane, and flowers along the beds. */}
      <g transform={`translate(${HOME.gate - 380} 0)`}>
        <rect x={-5} y={-82} width={10} height={84} fill={WOOD_DARK} />
        <rect x={-28} y={-114} width={56} height={34} rx={15} fill="#3a86ff" />
        <rect x={-28} y={-114} width={18} height={34} rx={8} fill={shade('#3a86ff', 0.25)} />
        <path
          d="M24 -110 V-134 H42 V-124 H28"
          fill="#c0392b"
          stroke={shade('#c0392b', 0.3)}
          strokeWidth={2}
        />
      </g>
      {Array.from({ length: 14 }, (_, i) => {
        const x = HOME.gate - 100 + i * 70 + 20 * noise(i, 3);
        return (
          <g key={i}>
            <GrassClump
              x={x}
              y={-10}
              s={0.8}
              dark="#5a8a3a"
              light="#9ac868"
              seed={i * 7 + 2}
              blades={6}
            />
            <Flower x={x + 10} y={-8} s={1.1} color={P.flowers[i % 4]!} />
            <Flower x={x + 24} y={-6} s={0.9} color={['#ff6a8a', '#ffffff', '#ffd23f'][i % 3]!} />
          </g>
        );
      })}
      <Saguaro x={HOME.gate - 560} y={-12} h={100} />
    </g>
  );
});

/** The garden fence and gate (lined: he leaps it), white pickets from x0 to x1. */
const Fence = memo(function Fence() {
  const x0 = HOME.gate - 110;
  const x1 = HOME.gate + 40;
  const pickets = [];
  for (let x = x0; x <= x1; x += 26) pickets.push(x);
  return (
    <g>
      <rect
        x={x0 - 6}
        y={-62}
        width={x1 - x0 + 30}
        height={10}
        rx={3}
        fill="#f6efe2"
        {...ink(IN + 1)}
      />
      <rect
        x={x0 - 6}
        y={-30}
        width={x1 - x0 + 30}
        height={10}
        rx={3}
        fill="#f6efe2"
        {...ink(IN + 1)}
      />
      {pickets.map((x) => (
        <g key={x}>
          <path d={`M${x} 2 V-76 L${x + 8} -88 L${x + 16} -76 V2 Z`} fill="#fbf6ec" {...ink(OUT)} />
          <path d={`M${x + 10} -74 V-2`} stroke="#d8cdb8" strokeWidth={4} />
        </g>
      ))}
    </g>
  );
});

/** Someone from his family (lined), facing left toward him, waving. `look` picks hair and clothes. */
function Person({ x, wave, t, look }: { x: number; wave: number; t: number; look: 0 | 1 }) {
  const shirt = look ? '#3a7ac8' : '#2e9a62';
  const pants = look ? '#4a4a6a' : '#6a4a8a';
  const hair = look ? '#3a2a22' : '#7a4a2a';
  const arm = -130 + 30 * Math.sin(t / 150 + wave);
  const rad = (arm * Math.PI) / 180;
  return (
    <g transform={`translate(${x} 0)`}>
      <ellipse cx={0} cy={2} rx={40} ry={7} fill="#2a3a1a" opacity={0.25} />
      {/* Legs and shoes. */}
      <path
        d="M-14 -100 L-16 -8 M10 -100 L12 -8"
        stroke={INK}
        strokeWidth={22}
        strokeLinecap="round"
      />
      <path
        d="M-14 -100 L-16 -8 M10 -100 L12 -8"
        stroke={pants}
        strokeWidth={22 - 2 * OUT}
        strokeLinecap="round"
      />
      <path
        d="M-34 0 Q-34 -12 -18 -12 L-6 -10 L-6 0 Z M-8 0 Q-8 -12 8 -12 L20 -10 L20 0 Z"
        fill="#4a3428"
        {...ink(IN + 1)}
      />
      {/* The far arm, down by the side. */}
      <path
        d="M18 -170 Q28 -130 22 -100"
        stroke={INK}
        strokeWidth={17}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 -170 Q28 -130 22 -100"
        stroke={shade(shirt, 0.2)}
        strokeWidth={17 - 2 * IN}
        strokeLinecap="round"
        fill="none"
      />
      {/* The body. */}
      <path
        d="M-30 -96 Q-34 -150 -24 -178 Q0 -190 24 -178 Q34 -150 30 -96 Z"
        fill={shirt}
        {...ink(OUT)}
      />
      <path
        d="M-30 -96 Q-34 -150 -24 -178 Q-14 -182 -8 -180 Q-18 -140 -12 -96 Z"
        fill={shade(shirt, 0.25)}
      />
      <path d="M-12 -180 Q0 -168 12 -180" stroke={tint(shirt, 0.5)} strokeWidth={3} fill="none" />
      {/* The near arm, waving. */}
      <g transform="translate(-20 -168)">
        <path
          d={`M0 0 L${(46 * Math.cos(rad)).toFixed(1)} ${(46 * Math.sin(rad)).toFixed(1)}`}
          stroke={INK}
          strokeWidth={18}
          strokeLinecap="round"
        />
        <path
          d={`M0 0 L${(46 * Math.cos(rad)).toFixed(1)} ${(46 * Math.sin(rad)).toFixed(1)}`}
          stroke={shirt}
          strokeWidth={18 - 2 * IN}
          strokeLinecap="round"
        />
        <circle
          cx={56 * Math.cos(rad)}
          cy={56 * Math.sin(rad)}
          r={10}
          fill={SKIN}
          {...ink(IN + 1)}
        />
      </g>
      {/* The head: three-quarter view, big shiny eyes, a happy smile. */}
      <g transform="translate(-2 -214)">
        {look === 0 && (
          <path
            d="M-26 -10 Q-40 30 -26 52 Q-6 44 0 20 Q20 50 34 44 Q40 10 24 -16 Z"
            fill={hair}
            {...ink(OUT)}
          />
        )}
        <path
          d="M-26 0 Q-28 -30 0 -32 Q28 -30 26 0 Q26 28 0 32 Q-26 28 -26 0 Z"
          fill={SKIN}
          {...ink(OUT)}
        />
        <path d="M14 -24 Q26 -10 22 12 Q18 26 4 30 Q18 10 14 -24 Z" fill={shade(SKIN, 0.15)} />
        <circle cx={18} cy={4} r={6} fill={SKIN} {...ink(IN + 1)} />
        {look === 1 ? (
          <path
            d="M-28 -6 Q-30 -36 0 -38 Q30 -36 28 -4 Q20 -18 4 -20 Q-14 -24 -28 -6 Z"
            fill={hair}
            {...ink(OUT)}
          />
        ) : (
          <path
            d="M-28 -2 Q-30 -38 2 -38 Q30 -36 28 -2 Q14 -26 -6 -22 Q-20 -18 -28 -2 Z"
            fill={hair}
            {...ink(OUT)}
          />
        )}
        {/* Eyes looking left at him, with two highlights each. */}
        {[-14, 4].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={0} rx={5.5} ry={7} fill="#ffffff" {...ink(1.4)} />
            <ellipse cx={ex - 1.5} cy={1} rx={3.6} ry={5} fill="#5a3a24" />
            <circle cx={ex - 0.4} cy={-1.4} r={1.6} fill="#ffffff" />
            <circle cx={ex - 2.4} cy={3} r={0.8} fill="#ffffff" />
            <path
              d={`M${ex - 6} -9 Q${ex} -11 ${ex + 5} -8`}
              stroke={INK}
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
        <path d="M-6 8 L-8 13 L-4 13" stroke={shade(SKIN, 0.35)} strokeWidth={1.6} fill="none" />
        <path
          d="M-14 17 Q-6 25 4 18 Q-4 22 -14 17 Z"
          fill="#c84a4a"
          stroke={INK}
          strokeWidth={1.6}
        />
        <ellipse cx={-20} cy={12} rx={4} ry={2.4} fill="#ff9aa8" opacity={0.7} />
        <ellipse cx={10} cy={12} rx={4} ry={2.4} fill="#ff9aa8" opacity={0.7} />
      </g>
    </g>
  );
}

/** The dog (lined): fluffy and golden, tongue out, tail wagging, bounding along. */
function Dog({ x, t, run }: { x: number; t: number; run: boolean }) {
  const hop = run ? 22 * Math.abs(Math.sin(t / 110)) : 10 * Math.abs(Math.sin(t / 160));
  const fur = '#e0a858';
  const wag = 20 * Math.sin(t / 60);
  return (
    <g transform={`translate(${x.toFixed(1)} ${(-hop).toFixed(1)})`}>
      <path
        d={`M28 -30 Q${46 + wag * 0.4} ${-52 - Math.abs(wag) * 0.3} ${40 + wag} -64`}
        stroke={INK}
        strokeWidth={13}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M28 -30 Q${46 + wag * 0.4} ${-52 - Math.abs(wag) * 0.3} ${40 + wag} -64`}
        stroke={fur}
        strokeWidth={13 - 2 * IN}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M-18 -16 L-24 0 M16 -16 L20 0" stroke={INK} strokeWidth={11} strokeLinecap="round" />
      <path
        d="M-18 -16 L-24 0 M16 -16 L20 0"
        stroke={shade(fur, 0.15)}
        strokeWidth={11 - 2 * IN}
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={-30} rx={34} ry={20} fill={fur} {...ink(OUT)} />
      <path d="M-30 -24 Q0 -10 30 -24 Q20 -12 0 -12 Q-20 -12 -30 -24 Z" fill={shade(fur, 0.2)} />
      <g transform="translate(-34 -52)">
        <path d="M14 -8 Q22 -22 10 -26 Q4 -16 8 -6 Z" fill={shade(fur, 0.3)} {...ink(IN)} />
        <circle cx={0} cy={0} r={20} fill={fur} {...ink(OUT)} />
        <ellipse cx={-14} cy={6} rx={12} ry={9} fill="#f6e2c0" {...ink(IN)} />
        <ellipse cx={-24} cy={2} rx={4.5} ry={3.4} fill={INK} />
        <path d="M-16 13 Q-14 24 -8 22 Q-6 16 -10 12 Z" fill="#ff7a8a" {...ink(1.2)} />
        <ellipse cx={-6} cy={-4} rx={4} ry={5} fill={INK} />
        <circle cx={-5} cy={-6} r={1.6} fill="#ffffff" />
        <path d="M4 -10 Q-6 -26 -16 -14 Q-6 -10 4 -10 Z" fill={shade(fur, 0.3)} {...ink(IN)} />
      </g>
    </g>
  );
}

const FIREWORKS = [
  { x: 900, y: -560, at: 600, color: '#ffd35a' },
  { x: 1480, y: -640, at: 1100, color: '#ff70a6' },
  { x: 1180, y: -520, at: 1600, color: '#43e0cf' },
  { x: 1720, y: -560, at: 2100, color: '#a07bff' },
  { x: 1000, y: -660, at: 2500, color: '#ff8a3c' },
];

/** A firework bursting in the sky (cel): sparks flying out on trails, then twinkling as they fall. */
function Firework({ x, y, dt, color }: { x: number; y: number; dt: number; color: string }) {
  if (!(dt >= -400 && dt < 1500)) return null;
  if (dt < 0) {
    // The rocket going up.
    const k = 1 + dt / 400;
    return <circle cx={x} cy={y + 300 * (1 - k)} r={4} fill="#fff6c8" />;
  }
  const r = 20 + easeOut(clamp01(dt / 700)) * 120;
  const fall = 0.00006 * dt * dt;
  const fade = 1 - clamp01((dt - 800) / 700);
  return (
    <g opacity={fade} strokeLinecap="round">
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const x1 = x + Math.cos(a) * r * 0.55;
        const y1 = y + Math.sin(a) * r * 0.55 + fall;
        const x2 = x + Math.cos(a) * r;
        const y2 = y + Math.sin(a) * r + fall;
        return (
          <g key={i}>
            <path
              d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`}
              stroke={color}
              strokeWidth={6}
            />
            <circle cx={x2} cy={y2} r={4} fill="#ffffff" />
          </g>
        );
      })}
      <circle cx={x} cy={y + fall} r={r * 0.25} fill={tint(color, 0.5)} opacity={0.4} />
    </g>
  );
}

/** The storm's strength 0..1: it gathers at 'storm' and clears away after 'clear'. */
const stormOf = (p: ObstacleProps) =>
  clamp01(since(p, 'storm') / 800) - clamp01(since(p, 'clear') / 1000);

export function HomeBack(p: ObstacleProps) {
  const storm = stormOf(p);
  const home = since(p, 'home');
  const sun = clamp01(since(p, 'clear') / 1000);
  const t = p.t;
  return (
    <g>
      {/* The sun breaking through once the storm clears. */}
      {sun > 0 && (
        <g opacity={sun * (1 - clamp01(home / 3000) * 0.5)}>
          <g fill="#fff3c0" opacity={0.3}>
            {[-30, -10, 10, 30].map((a) => (
              <path
                key={a}
                d="M0 0 L-34 900 L34 900 Z"
                transform={`translate(1350 -640) rotate(${a})`}
              />
            ))}
          </g>
        </g>
      )}
      <Homestead lit={home >= 0} />
      <Fence />
      {home >= 0 && (
        <g opacity={clamp01(home / 400)}>
          <Glow x={H0 + 230} y={-100} r={170} color="#ffd35a" />
          <Glow x={H0 + 65} y={-172} r={90} color="#ffd35a" />
          <Glow x={H1 - 65} y={-172} r={90} color="#ffd35a" />
        </g>
      )}
      {/* His family stepping out of the door to the porch steps, waving. */}
      {home >= 0 && (
        <g>
          <Person x={H0 + 150 - 110 * easeOut(clamp01(home / 700))} wave={0} t={t} look={0} />
          <Person
            x={H0 + 150 + 60 * easeOut(clamp01((home - 250) / 700))}
            wave={1.5}
            t={t}
            look={1}
          />
        </g>
      )}
      {FIREWORKS.map((f, i) => (
        <Firework key={i} x={f.x} y={f.y} dt={home - f.at} color={f.color} />
      ))}
      {home >= 0 && <SparkBurst x={(H0 + H1) / 2} y={-420} dt={home % 900} ms={800} count={12} />}
      {/* The storm darkening the sky. */}
      {storm > 0 && (
        <g opacity={storm}>
          <rect x={-700} y={-900} width={3600} height={1200} fill="#4a2a4a" opacity={0.35} />
          <path
            d={circles(
              Array.from({ length: 14 }, (_, i) => ({
                x: -500 + i * 230 + ((t * 0.04) % 230),
                y: -660 + 40 * noise(i, 3),
                r: 100 + 40 * noise(i, 5),
              })),
            )}
            fill="#5a3a5a"
          />
          <path
            d={circles(
              Array.from({ length: 14 }, (_, i) => ({
                x: -470 + i * 230 + ((t * 0.04) % 230),
                y: -700 + 40 * noise(i, 3),
                r: 66 + 30 * noise(i, 5),
              })),
            )}
            fill="#7a5272"
          />
        </g>
      )}
    </g>
  );
}

/** The twister's half-width at height h (px up): narrow at the ground, wide at the top. */
const funnel = (h: number, s: number) => (16 + 110 * (h / 430) ** 1.4) * s;

/**
 * The twister (cel): a lined funnel of whirling sand, bands of dust swirling round it, leaves
 * caught up in it, and a cloud of dust churning at its foot.
 */
function Twister({ t, s }: { t: number; s: number }) {
  const n = 12;
  const wob = (i: number) => 14 * Math.sin(t / 110 + i * 0.7) * s;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= n; i++) {
    const h = (430 * i) / n;
    const w = funnel(h, s);
    left.push(`${(wob(i) - w).toFixed(1)} ${(-h * s).toFixed(1)}`);
    right.push(`${(wob(i) + w).toFixed(1)} ${(-h * s).toFixed(1)}`);
  }
  const outline = `M${left.join(' L')} Q${wob(n).toFixed(1)} ${(-430 * s - 30 * s).toFixed(1)} ${right[n]} L${right.slice(0, n).reverse().join(' L')} Z`;
  // Bands of dust swirling round it, drifting up.
  const bands = Array.from({ length: 6 }, (_, i) => {
    const h = (((t * 0.12 + i * 72) % 430) + 430) % 430;
    const w = funnel(h, s);
    const x = wob((h / 430) * n);
    const y = -h * s;
    return `M${(x - w).toFixed(1)} ${y.toFixed(1)} Q${x.toFixed(1)} ${(y + 16 * s).toFixed(1)} ${(x + w).toFixed(1)} ${(y - 4 * s).toFixed(1)}`;
  });
  return (
    <g>
      <path d={outline} fill={SAND} />
      <path
        d={`M${left.join(' L')} L${wob(n).toFixed(1)} ${(-430 * s).toFixed(1)} L${left
          .map((p) => p.replace(/^(-?[\d.]+)/, (v) => (+v * 0.35).toFixed(1)))
          .reverse()
          .join(' L')} Z`}
        fill={SAND_SHADE}
        opacity={0.8}
      />
      <path
        d={bands.join('')}
        stroke={shade(SAND, 0.35)}
        strokeWidth={IN + 2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={bands.slice(0, 3).join('')}
        stroke={tint(SAND, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        transform={`translate(0 ${-8 * s})`}
      />
      <path d={outline} fill="none" {...ink(OUT)} />
      {/* Leaves whirling round it. */}
      {[0, 1, 2, 3].map((i) => {
        const a = t / 140 + i * 1.6;
        const h = 80 + i * 90;
        const r = funnel(h, s) + 20 * s;
        return (
          <path
            key={i}
            d="M0 0 Q5 -5 12 0 Q5 5 0 0 Z"
            fill={i % 2 ? '#6aa85a' : '#e8a040'}
            stroke={INK}
            strokeWidth={1.4}
            transform={`translate(${(Math.cos(a) * r).toFixed(1)} ${(-h * s + Math.sin(a) * 10).toFixed(1)}) rotate(${(a * 60) % 360}) scale(1.4)`}
            opacity={Math.sin(a) > -0.3 ? 1 : 0.5}
          />
        );
      })}
    </g>
  );
}

export function HomeFront(p: ObstacleProps) {
  const stormT = since(p, 'storm');
  const clear = since(p, 'clear');
  const home = since(p, 'home');
  return (
    <g>
      {stormT >= 0 &&
        (() => {
          // The twister grows between him and home, then spins away up into the sky.
          const grow = easeOut(clamp01(stormT / 700));
          const leave = clamp01(clear / 900);
          const s = grow * (1 - leave * 0.6);
          if (s <= 0.02 || leave >= 1) return null;
          return (
            <g
              transform={`translate(${HOME.twister + leave * 700} ${-leave * 500})`}
              opacity={1 - leave}
            >
              <Twister t={p.t} s={s} />
              <Dust x={0} y={-4} dt={stormT % 500} ms={500} size={0.6 * s + 0.1} color="#e0b888" />
            </g>
          );
        })()}
      {/* The dog bounding down the steps to meet him. */}
      {home >= 0 && (
        <Dog x={H0 + 120 - 160 * easeOut(clamp01((home - 300) / 1100))} t={p.t} run={home < 1400} />
      )}
    </g>
  );
}
