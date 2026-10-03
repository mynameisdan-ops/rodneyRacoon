import { memo, useId } from 'react';
import { ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import {
  circles,
  clamp01,
  easeOut,
  ellipses,
  fallen,
  lerp,
  noise,
  roundPath,
  since,
} from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { LIGHT, SPRAY, SPRAY_SHADE, ROCK } from './kit';
import { GEYSER } from './layout';

// ---------- Level 21: geyser launch ----------
// rumble (the springs boil) → blast (the geyser under his rock shoots him up) → land.

const SINTER = '#f2dcae';
const SINTER_DARK = '#d79a5c';

/** Terraces of mineral crust stepping down into the pool from x (dir 1: the pool is to the right). */
function terrace(x: number, dir: 1 | -1) {
  const d = (v: number) => (x + dir * v).toFixed(1);
  return `M${d(-80)} 80 L${d(-80)} 0 Q${d(-74)} -9 ${d(-52)} -8 Q${d(-36)} -8 ${d(-32)} -1 Q${d(-18)} -2 ${d(-12)} 6 Q${d(0)} 6 ${d(6)} 13 Q${d(14)} 14 ${d(18)} 22 L${d(30)} 80 Z`;
}

/** The hot spring (painted): bright water in a basin of cream and orange mineral terraces. */
const SpringPool = memo(function SpringPool() {
  const id = useId();
  const [a, b] = GEYSER.pool;
  const mid = (a + b) / 2;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}w`} gradientUnits="userSpaceOnUse" x1="0" y1={0} x2="0" y2={80}>
          <stop offset="0" stopColor="#c4f7f2" />
          <stop offset="0.3" stopColor="#4fd2e2" />
          <stop offset="1" stopColor="#1d78b4" />
        </linearGradient>
        <linearGradient id={`${id}r`} gradientUnits="userSpaceOnUse" x1="0" y1={-8} x2="0" y2={70}>
          <stop offset="0" stopColor="#fbf0d6" />
          <stop offset="0.3" stopColor={SINTER} />
          <stop offset="0.75" stopColor="#e2a868" />
          <stop offset="1" stopColor="#b8744a" />
        </linearGradient>
      </defs>
      <path d={`M${a} 2 Q${mid} 8 ${b} 2 L${b - 30} 80 L${a + 30} 80 Z`} fill={`url(#${id}w)`} />
      <ellipse cx={mid} cy={44} rx={(b - a) * 0.3} ry={22} fill="#166aa6" opacity={0.35} />
      <path d={`M${a + 4} 2 Q${mid} 8 ${b - 4} 2`} stroke="#effffd" strokeWidth={3} fill="none" />
      {[
        [a, 1],
        [b, -1],
      ].map(([x, dir]) => {
        const d = (v: number) => x! + dir! * v;
        return (
          <g key={x}>
            <path d={terrace(x!, dir as 1 | -1)} fill={`url(#${id}r)`} />
            {/* Little pools on the steps, and the lit lips of the terraces. */}
            <path
              d={`M${d(-30)} -1 Q${d(-22)} -3 ${d(-13)} 4 Z M${d(-10)} 6 Q${d(-2)} 4 ${d(5)} 12 Z`}
              fill="#7fe0e8"
            />
            <path
              d={`M${d(-76)} -4 Q${d(-62)} -10 ${d(-40)} -7 M${d(-30)} -2 Q${d(-20)} -3 ${d(-12)} 5 M${d(-8)} 7 Q${d(2)} 6 ${d(8)} 13`}
              stroke="#fff6dc"
              strokeWidth={2.6}
              fill="none"
              strokeLinecap="round"
            />
            <g stroke={SINTER_DARK} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6}>
              <path
                d={`M${d(-60)} 4 q-3 14 2 30 M${d(-44)} 2 q3 18 -2 40 M${d(-22)} 10 q-3 16 1 34`}
              />
            </g>
          </g>
        );
      })}
      {/* Little mineral cones round the vents. */}
      {GEYSER.vents.map((x) => (
        <g key={x}>
          <path
            d={`M${x - 26} 6 Q${x - 12} -8 ${x} -8 Q${x + 12} -8 ${x + 26} 6 Z`}
            fill={SINTER}
          />
          <path
            d={`M${x - 26} 6 Q${x - 12} -8 ${x} -8 L${x - 4} 6 Z`}
            fill={SINTER_DARK}
            opacity={0.6}
          />
          <ellipse cx={x} cy={-6} rx={9} ry={3} fill="#5a3a2a" />
        </g>
      ))}
    </g>
  );
});

/** A geyser jet `h` tall at x, `dt` after it blew (cel-drawn water, with foam at the top). */
function Geyser({ x, dt, h, cap = -Infinity }: { x: number; dt: number; h: number; cap?: number }) {
  if (!(dt >= 0 && dt < 2200)) return null;
  const rise = easeOut(clamp01(dt / 250)) * (1 - clamp01((dt - 1500) / 700));
  // `cap`: the top can't pass the underside of the rock it's pushing.
  const top = Math.max(-h * rise, cap);
  if (top > -8) return null;
  // Its sides ripple as the water rushes up.
  const edge = (scale: number, shift: number) => {
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let i = 0; i <= 6; i++) {
      const f = i / 6;
      const y = lerp(8, top + 12, f);
      const w = (lerp(24, 32, f) + 5 * Math.sin(dt / 45 - f * 9)) * scale;
      left.push([x + shift - w, y]);
      right.unshift([x + shift + w + 4 * scale * Math.sin(dt / 50 - f * 8 + 1.4), y]);
    }
    return roundPath([...left, ...right]);
  };
  const crown = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
    x: x + (i - 3) * 15 + 5 * Math.sin(dt / 60 + i),
    y: top - 4 - 14 * Math.sin((i / 6) * Math.PI) + 6 * Math.sin(dt / 80 + i * 2),
    r: 12 + noise(i) * 8,
  }));
  return (
    <g>
      {/* Steam billowing round the jet. */}
      <path
        d={circles([
          { x: x - 30, y: top * 0.55, r: 34 },
          { x: x + 34, y: top * 0.75, r: 30 },
          { x: x - 10, y: top * 0.9, r: 40 },
        ])}
        fill="#ffffff"
        opacity={0.28}
      />
      <path d={edge(1, 0)} fill="#dcf4ff" {...ink(IN + 0.8)} />
      <path d={edge(0.5, -10)} fill={SPRAY_SHADE} opacity={0.75} />
      <path d={edge(0.22, 9)} fill="#ffffff" />
      <path
        d={`M${x - 14} 0 V${top + 30}`}
        stroke={LIGHT}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="22 34"
        strokeDashoffset={dt * 0.9}
      />
      {/* Foam boiling round its foot, the crown of foam on top, and drops thrown out of it. */}
      <path
        d={circles([
          ...[-30, -12, 10, 28].map((dx, i) => ({
            x: x + dx,
            y: 2 + 3 * Math.sin(dt / 70 + i),
            r: 10 - (i % 2) * 2,
          })),
          ...crown,
        ])}
        fill={SPRAY}
        {...ink(IN + 0.3)}
      />
      <path
        d={circles(crown.map((c) => ({ x: c.x + c.r * 0.25, y: c.y - c.r * 0.3, r: c.r * 0.4 })))}
        fill="#ffffff"
      />
      <path
        d={ellipses(
          [0, 1, 2, 3, 4, 5].map((i) => {
            const ph = ((dt + i * 95) % 570) / 570;
            const side = i % 2 ? 1 : -1;
            return {
              x: x + side * (16 + ph * (50 + i * 8)),
              y: top - 14 - ph * 50 + ph * ph * 190,
              rx: 5,
              ry: 6.5,
              rot: 0,
            };
          }),
        )}
        fill={SPRAY}
        opacity={0.85}
        {...ink(IN)}
      />
    </g>
  );
}

const LID_EDGE = roundPath([
  [-58, 22],
  [-54, 4],
  [-36, -1],
  [0, -3],
  [36, -1],
  [54, 4],
  [58, 22],
  [40, 36],
  [-40, 36],
]);

/** The rock lid he stands on over the vent, its top at y 0. */
const LidRock = memo(function LidRock() {
  return (
    <g>
      <path d={LID_EDGE} fill={ROCK} {...ink(OUT)} />
      <path d="M-56 8 Q-58 24 -46 34 L-30 34 Q-42 22 -40 2 Z" fill={shade(ROCK, 0.3)} />
      <path
        d="M20 -1 Q46 1 54 12"
        stroke={tint(ROCK, 0.6)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-8 12 l6 8 l-2 8 M18 16 l8 6"
        stroke={shade(ROCK, 0.45)}
        strokeWidth={IN}
        fill="none"
        strokeLinecap="round"
      />
      <path d="M-40 30 Q0 40 40 30 Q30 37 0 38 Q-30 37 -40 30 Z" fill={SINTER_DARK} opacity={0.7} />
    </g>
  );
});

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
  const boil = rumble >= 0 ? clamp01(rumble / 600) : 0;
  return (
    <g>
      <SpringPool />
      {/* Steam and bubbles as the springs boil (a little steam even before), fading in two steps. */}
      {[0, 1].map((late) => (
        <path
          key={`s${late}`}
          d={circles(
            Array.from({ length: 8 }, (_, i) => {
              const cycle = (p.t * (0.6 + boil * 0.8) + i * 190) % 1200;
              return {
                x: a + 40 + i * ((b - a - 80) / 7) + 10 * Math.sin(cycle / 200),
                y: -cycle * 0.12,
                r: cycle < 600 === !late ? 10 + cycle * 0.03 : 0,
              };
            }).filter((c) => c.r > 0),
          )}
          fill="#ffffff"
          opacity={(0.16 + 0.34 * boil) * (late ? 0.4 : 0.85)}
        />
      ))}
      {boil > 0 &&
        [0, 1].map((late) => (
          <path
            key={`b${late}`}
            d={circles(
              Array.from({ length: 6 }, (_, i) => {
                const ph = ((rumble + i * 170) % 520) / 520;
                return {
                  x: a + 60 + i * ((b - a - 120) / 5),
                  y: 8 - ph * 6,
                  r: ph < 0.5 === !late ? 2 + ph * 5 : 0,
                };
              }).filter((c) => c.r > 0),
            )}
            fill="none"
            stroke="#effffd"
            strokeWidth={2.4}
            opacity={boil * (late ? 0.3 : 0.8)}
          />
        ))}
      {GEYSER.vents.map((x, i) => (
        <Geyser
          key={x}
          x={x}
          dt={blast - i * 350}
          h={[370, 280, 220][i]!}
          cap={i === 0 && p.t < release ? -lid + 30 : undefined}
        />
      ))}
      <g transform={`translate(${v1} ${(-lid).toFixed(1)})`}>
        <LidRock />
      </g>
    </g>
  );
}
