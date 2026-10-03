import { memo, useId } from 'react';
import { Glow } from '../../fx';
import { INK, PROP_IN as IN, shade, tint } from '../../style';
import { Flower, GrassClump, MossRock, Pebbles } from '../../worlds/paintKit';
import { Saguaro } from '../../worlds/canyon';
import { circles, clamp01, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { P, SAND, SAND_SHADE } from './kit';
import { HILL } from './layout';
import { SandStreaks } from './parts';

// ---------- Level 39: the last hill ----------
// wind (a gale blows down the hill and pushes him back) → calm (at the top the wind drops and he
// sees home far away, its window lit).

/** Home, far off in the valley below (painted): the farmhouse, its lit window, a tree, a windmill. */
const FarHome = memo(function FarHome() {
  return (
    <g>
      <ellipse cx={10} cy={6} rx={170} ry={18} fill={P.scrub} opacity={0.7} />
      <path d="M-170 6 Q-80 -14 10 -10 Q100 -14 180 6 Z" fill="#a8b860" />
      {/* The tree beside the house. */}
      <rect x={-92} y={-40} width={8} height={40} fill={P.woodDark} />
      <circle cx={-88} cy={-52} r={22} fill="#4a8a4a" />
      <circle cx={-82} cy={-58} r={14} fill="#6aa85a" />
      {/* The house: walls, a red roof, the porch, and a warm light in the window. */}
      <rect x={-50} y={-48} width={100} height={48} fill="#f0dcb4" />
      <rect x={-50} y={-48} width={28} height={48} fill={shade('#f0dcb4', 0.2)} />
      <path d="M-62 -46 L0 -86 L62 -46 Z" fill="#c8402e" />
      <path d="M-62 -46 L0 -86 L0 -78 L-48 -46 Z" fill={tint('#c8402e', 0.2)} />
      <rect x={28} y={-80} width={12} height={22} fill="#8a3a2a" />
      <rect x={-14} y={-34} width={18} height={18} fill="#ffd35a" />
      <rect x={14} y={-30} width={16} height={30} fill={P.woodDark} />
      <path d="M-56 -2 H60" stroke={P.woodDark} strokeWidth={3} />
      {/* The windmill and a fence. */}
      <path
        d="M90 0 L100 -70 L110 0 M95 -30 H105"
        stroke={P.woodDark}
        strokeWidth={3}
        fill="none"
      />
      <g transform="translate(100 -74)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d="M0 0 L22 -3 L22 3 Z" fill="#e8e0d0" transform={`rotate(${i * 60})`} />
        ))}
      </g>
      <path
        d="M-160 -4 H-60 M70 -4 H160"
        stroke={P.woodDark}
        strokeWidth={2.4}
        strokeDasharray="2 12"
      />
    </g>
  );
});

/** The hill (painted): its sunlit slope, a trail up it, grass, rocks and saguaros on the top. */
const Hill = memo(function Hill() {
  const id = useId();
  const { top, height } = HILL;
  const slope = (x: number) => -height * Math.min(1, Math.max(0, x / top));
  return (
    <g>
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-height - 20}
          x2="0"
          y2={60}
        >
          <stop offset="0" stopColor={P.sandTop} />
          <stop offset="1" stopColor={P.sandDark} />
        </linearGradient>
      </defs>
      <path d={`M-700 4 L0 4 L${top} ${-height} H3000 V240 H-700 Z`} fill={`url(#${id})`} />
      <path
        d={`M0 4 L${top} ${-height} H3000`}
        stroke={tint(P.sandTop, 0.5)}
        strokeWidth={4}
        fill="none"
      />
      {/* The trail worn up the hill. */}
      <path
        d={`M0 10 L${top} ${-height + 6} H3000 V${-height + 22} H${top + 10} L0 26 Z`}
        fill={P.road}
        opacity={0.8}
      />
      {/* Rocks, scrub, grass and flowers along the slope (painted). */}
      {Array.from({ length: 16 }, (_, i) => {
        const x = 40 + i * 110 + 40 * noise(i, 3);
        const y = slope(x) + 44 + 60 * noise(i, 5);
        const kind = noise(i, 7);
        return kind < 0.3 ? (
          <MossRock
            key={i}
            x={x}
            y={y}
            s={0.8 + 0.4 * noise(i, 9)}
            rock={P.stone}
            seed={i * 11 + 5}
          />
        ) : kind < 0.55 ? (
          <g key={i}>
            <Flower x={x} y={y} s={1.1} color={P.flowers[i % 4]!} />
            <Flower x={x + 12} y={y + 4} s={0.9} color={P.flowers[(i + 1) % 4]!} />
            <GrassClump
              x={x - 14}
              y={y + 2}
              s={0.7}
              dark={P.grass}
              light={P.grassLight}
              seed={i * 5 + 1}
              blades={5}
            />
          </g>
        ) : kind < 0.75 ? (
          <Pebbles key={i} x={x} y={y} s={1.2} seed={i * 13 + 2} stone={P.stone} count={5} />
        ) : (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse cx={0} cy={-8} rx={20} ry={11} fill={shade(P.scrub, 0.2)} />
            <ellipse cx={4} cy={-11} rx={13} ry={7} fill={P.scrub} />
            <ellipse cx={7} cy={-14} rx={6} ry={3} fill={P.scrubLight} />
          </g>
        );
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const x = 30 + i * 170 + 50 * noise(i, 13);
        return (
          <GrassClump
            key={`g${i}`}
            x={x}
            y={slope(x) + 6}
            s={0.9}
            dark={P.grass}
            light={P.grassLight}
            seed={i * 7 + 3}
          />
        );
      })}
      <Saguaro x={top + 300} y={-height} h={110} />
      <Saguaro x={top + 620} y={-height} h={90} flip />
      <Saguaro x={260} y={slope(260) + 30} h={80} />
    </g>
  );
});

export function HillBack(p: ObstacleProps) {
  const wind = clamp01(since(p, 'wind') / 500) - clamp01(since(p, 'calm') / 600);
  const calm = clamp01(since(p, 'calm') / 900);
  const { home } = HILL;
  return (
    <g>
      {/* Home, far off, coming into view as the dust settles; its window glows. */}
      <g transform={`translate(${home.x} ${home.y}) scale(1.5)`}>
        <g opacity={0.35 + 0.65 * calm}>
          <FarHome />
        </g>
        <g opacity={calm}>
          <Glow x={-5} y={-25} r={140} color="#ffd35a" />
          <path
            d={circles(
              [0, 1, 2, 3].map((i) => ({
                x: -40 + i * 30 + 10 * Math.sin(p.t / 300 + i),
                y: -110 - 20 * noise(i, 4) - ((p.t / 20 + i * 30) % 60),
                r: 2.4,
              })),
            )}
            fill="#fff6c8"
          />
        </g>
      </g>
      <Hill />
      <SandStreaks t={p.t} strength={wind} dir={-1} />
    </g>
  );
}

/** Gusts of the gale blowing down the hill at him (cel-drawn swirls and flying sand). */
export function HillFront(p: ObstacleProps) {
  const wind = clamp01(since(p, 'wind') / 500) - clamp01(since(p, 'calm') / 600);
  if (wind <= 0) return null;
  const swirls = [0, 1, 2].map((i) => {
    const ph = ((p.t * 1.2 + i * 700) % 2100) / 2100;
    const x = p.heroX + 700 - ph * 1100;
    const y = -p.heroLift - 120 - i * 50;
    return `M${x.toFixed(1)} ${y.toFixed(1)} q-50 -16 -100 0 t-100 0 q-26 -26 0 -36 q18 6 8 18`;
  });
  const grit = Array.from({ length: 8 }, (_, i) => {
    const ph = ((p.t * 1.4 + i * 260) % 2000) / 2000;
    return {
      x: p.heroX + 700 - ph * 1200,
      y: -p.heroLift - 30 - 160 * noise(i, 3) + 10 * Math.sin(p.t / 90 + i),
      r: 4 + 3 * noise(i, 5),
    };
  });
  return (
    <g opacity={wind}>
      <path
        d={swirls.join('')}
        stroke="#fff6e4"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={swirls.join('')}
        stroke={INK}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.3}
      />
      <path d={circles(grit)} fill={SAND} stroke={INK} strokeWidth={IN} />
      <path
        d={circles(grit.map((g) => ({ ...g, x: g.x + 2, y: g.y + 2, r: g.r * 0.5 })))}
        fill={SAND_SHADE}
      />
    </g>
  );
}
