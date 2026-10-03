import { memo, useId } from 'react';
import { ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { Saguaro } from '../../worlds/canyon';
import { circles, clamp01, easeOut, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { FOAM, MUD, MUD_DEEP, MUD_LIGHT, P, WOOD, WOOD_DARK } from './kit';
import { FLASH_FLOOD } from './layout';
import { Rock, SandBurst } from './parts';

// ---------- Level 33: flash flood ----------
// rumble (pebbles hop, a roar up the wash) → flood (a muddy wave roars down the wash and crashes
// against the rock steps just under him as he scrambles up them).

const STEPS = FLASH_FLOOD.steps;
/** Where the first step's face is: the wave crashes against it. */
const WALL = STEPS[0][0] - 60;

/** The canyon's back wall and the sandstone steps up out of the wash (painted). */
const Wash = memo(function Wash() {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient
          id={`${id}wall`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-420}
          x2="0"
          y2={0}
        >
          <stop offset="0" stopColor={P.cliffLit} />
          <stop offset="0.4" stopColor={P.cliff} />
          <stop offset="1" stopColor={P.cliffShade} />
        </linearGradient>
        <linearGradient
          id={`${id}step`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={-260}
          x2="0"
          y2={0}
        >
          <stop offset="0" stopColor={P.cliff} />
          <stop offset="1" stopColor={P.cliffShade} />
        </linearGradient>
      </defs>
      {/* The canyon's far wall behind the wash, banded, with a saguaro on its rim. */}
      <path
        d="M-1000 -12 V-210 Q-700 -236 -400 -206 T200 -220 L280 -250 Q600 -286 900 -260 T1600 -270 V-12 Z"
        fill={`url(#${id}wall)`}
      />
      {P.bands.map((c, i) => (
        <path
          key={c}
          d={`M-1000 ${-180 + i * 40} Q0 ${-194 + i * 40} 1600 ${-180 + i * 40} V${-170 + i * 40} Q0 ${-184 + i * 40} -1000 ${-170 + i * 40} Z`}
          fill={c}
          opacity={0.45}
        />
      ))}
      <g stroke={P.cliffDark} strokeWidth={3} strokeLinecap="round" opacity={0.35}>
        <path d="M-700 -196 l6 120 M-380 -190 l4 90 M-60 -206 l6 140 M640 -250 l8 160 M1000 -256 l4 120" />
      </g>
      <Saguaro x={-500} y={-210} h={70} />
      <Saguaro x={860} y={-262} h={60} flip />
      {/* High-water marks on the wall: the wash floods. */}
      <path
        d="M-1000 -132 H1600"
        stroke={P.cliffShade}
        strokeWidth={4}
        strokeDasharray="30 18"
        opacity={0.5}
      />
      {/* The rock steps out of the wash, each lit along its top with a crisp shadow beneath. */}
      {STEPS.map(([x, lift], i) => {
        const x0 = x - 60;
        return (
          <g key={x}>
            <path
              d={`M${x0} 4 L${x0 - 4} ${-lift + 8} Q${x0 - 2} ${-lift} ${x0 + 8} ${-lift} H1600 V4 Z`}
              fill={`url(#${id}step)`}
            />
            <path
              d={`M${x0 - 4} ${-lift + 8} Q${x0 - 2} ${-lift} ${x0 + 8} ${-lift} H${x0 + 30} L${x0 + 20} 4 H${x0} Z`}
              fill={P.cliffLit}
              opacity={0.7}
            />
            <path d={`M${x0} ${-lift + 2} H1600`} stroke={P.sandTop} strokeWidth={5} />
            <path
              d={`M${x0 + 10} ${-lift + 26} H${x0 + 120 + i * 20}`}
              stroke={P.cliffShade}
              strokeWidth={3}
              opacity={0.5}
            />
          </g>
        );
      })}
    </g>
  );
});

/** A log riding the flood, lined, its bark and rings showing. */
const Log = memo(function Log() {
  return (
    <g>
      <rect x={-44} y={-10} width={88} height={20} rx={10} fill={WOOD} {...ink(OUT)} />
      <ellipse cx={42} cy={0} rx={7} ry={10} fill={tint(WOOD, 0.4)} {...ink(IN)} />
      <ellipse cx={42} cy={0} rx={3} ry={5} fill="none" stroke={WOOD_DARK} strokeWidth={1.4} />
      <path d="M-34 -2 H20 M-20 5 H30" stroke={WOOD_DARK} strokeWidth={IN} strokeLinecap="round" />
    </g>
  );
});

/** Where the flood's front is: it rolls down the wash and stops against the first step. */
function frontAt(p: ObstacleProps) {
  const floodAt = eventTime(p.events, 'flood');
  const x = FLASH_FLOOD.floodStart + (p.t - floodAt) * FLASH_FLOOD.speed;
  return {
    x: Math.min(WALL, x),
    crash: p.t - (floodAt + (WALL - FLASH_FLOOD.floodStart) / FLASH_FLOOD.speed),
  };
}

export function FlashFloodBack(p: ObstacleProps) {
  const rumble = since(p, 'rumble');
  const flood = since(p, 'flood');
  const { depth } = FLASH_FLOOD;
  const t = p.t;
  let water = null;
  if (flood >= 0) {
    const { x: fx, crash } = frontAt(p);
    // The wave rears up as it comes, then flattens against the steps after it crashes.
    const h = 200 * (1 - clamp01(crash / 500)) + depth * clamp01(crash / 500);
    const rise = easeOut(clamp01(flood / 600));
    const level = depth * rise;
    // Once it has crashed, the water fills up against the second step.
    const reach = crash > 0 ? WALL + (STEPS[1][0] - 60 - WALL) * clamp01(crash / 400) : fx;
    const surf = `M-1200 ${-level} L${reach - 160} ${-level} Q${reach - 90} ${-h * rise - 10} ${reach - 20} ${-h * rise} Q${reach + 26} ${-h * rise * 0.7} ${reach + 10} 4`;
    const crest = [
      ...Array.from({ length: 8 }, (_, i) => ({
        x: reach - 14 - i * 28 + 6 * Math.sin(t / 70 + i),
        y: -h * rise + 2 + i * 7 - 12 * Math.abs(Math.sin(t / 110 + i)),
        r: (26 - i * 2) * rise,
      })),
      { x: reach + 16, y: -h * rise * 0.6, r: 18 * rise },
      { x: reach + 18, y: -h * rise * 0.3, r: 14 * rise },
    ];
    const foam = Array.from({ length: 12 }, (_, i) => ({
      x: -1100 + i * 110 + ((t * 0.5 + i * 37) % 110),
      y: -level + 2,
      r: 6 + 4 * noise(i, 3),
    })).filter((f) => f.x < reach - 150);
    water = (
      <g>
        <path d={`${surf} L-1200 4 Z`} fill={MUD} />
        <path
          d={`M-1200 ${-level + 26} H${reach - 120} Q${reach - 40} ${-level * 0.6} ${reach} 4 L-1200 4 Z`}
          fill={MUD_DEEP}
          opacity={0.55}
        />
        <path d={`M-1200 ${-level + 6} H${reach - 170}`} stroke={MUD_LIGHT} strokeWidth={6} />
        <path d={surf} fill="none" {...ink(OUT)} />
        <path d={circles(foam)} fill={FOAM} {...ink(IN)} />
        {crash < 500 && (
          <g>
            <path d={circles(crest)} fill={FOAM} {...ink(IN)} />
            <path
              d={circles(
                crest.map((c) => ({ x: c.x + c.r * 0.25, y: c.y - c.r * 0.3, r: c.r * 0.4 })),
              )}
              fill="#ffffff"
            />
          </g>
        )}
        {/* A log and a tumbleweed bobbing along in it. */}
        <g
          transform={`translate(${Math.min(reach - 260, fx - 260).toFixed(1)} ${(-level - 2 + 4 * Math.sin(t / 160)).toFixed(1)}) rotate(${(6 * Math.sin(t / 220)).toFixed(1)})`}
        >
          <Log />
        </g>
        <g
          transform={`translate(${Math.min(reach - 480, fx - 480).toFixed(1)} ${(-level - 18 + 6 * Math.sin(t / 140)).toFixed(1)}) rotate(${(t * 0.2) % 360})`}
        >
          <circle r={22} fill="none" stroke={WOOD_DARK} strokeWidth={4} />
          <path
            d="M-18 -8 Q0 14 18 -8 M-14 12 Q0 -16 14 12 M-20 4 Q0 -4 20 4"
            stroke={tint(WOOD, 0.2)}
            strokeWidth={3}
            fill="none"
          />
        </g>
        <SandBurst
          x={WALL + 10}
          y={-depth}
          dt={crash}
          size={1.5}
          ms={900}
          fill={FOAM}
          shadow={MUD_LIGHT}
        />
      </g>
    );
  }
  return (
    <g>
      <Wash />
      {/* Pebbles hopping on the floor of the wash in the rumble. */}
      {rumble >= 0 && flood < 400 && (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <Rock
              key={i}
              x={-200 + i * 110}
              y={-6 - 14 * Math.abs(Math.sin(t / (70 + i * 9) + i))}
              r={6}
              spin={t * 0.3}
            />
          ))}
        </g>
      )}
      {water}
      {/* The roar of it coming: a spray of mud over the bend. */}
      {flood >= 0 && (
        <path
          d={circles(
            Array.from({ length: 6 }, (_, i) => ({
              x: frontAt(p).x - 40 - i * 30,
              y: -170 - 30 * noise(i, 2) - 20 * Math.abs(Math.sin(t / 120 + i)),
              r: 8 - i * 0.6,
            })),
          )}
          fill={shade(MUD_LIGHT, 0.05)}
          opacity={0.8}
        />
      )}
    </g>
  );
}
