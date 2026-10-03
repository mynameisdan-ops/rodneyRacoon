import { memo, useId } from 'react';
import { ink, mix, PROP_IN as IN, PROP_OUT as OUT, shade } from '../../style';
import { SnowPine } from '../../worlds/mountain';
import { ellipses, fallen, noise, since } from '../sceneKit';
import type { ObstacleProps } from '../types';
import { CLIFF, CLIFF_DARK, ICE, ICE_DEEP, ICE_LIGHT, NS, P } from './kit';
import { ICE_WALL } from './layout';
import { SnowBurst, SnowLedge } from './parts';

// ---------- Level 31: ice wall ----------
// climb (he climbs the frozen waterfall; chips of ice rain past him) → slip (a foothold breaks
// and he drops before catching himself) → he climbs on and over the top.

const { wall: X, top: H } = ICE_WALL;
/** The frozen falls run from the wall's face to here; the cliff's rock goes on to the right. */
const FALLS_END = X + 230;
const mixIce = mix(ICE, ICE_DEEP, 0.35);

/** The cliff beside the falls (painted), and the plateau running on at the top. */
const Cliff = memo(function Cliff() {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-H} x2="0" y2={0}>
          <stop offset="0" stopColor={CLIFF} />
          <stop offset="1" stopColor={CLIFF_DARK} />
        </linearGradient>
      </defs>
      <path d={`M${X + 120} -4 L${X + 110} ${-H} H3000 V-4 Z`} fill={`url(#${id})`} />
      <g fill="#c2c5e6" opacity={0.4}>
        <path
          d={`M${FALLS_END + 40} ${-H + 30} L${FALLS_END + 120} ${-H + 20} L${FALLS_END + 100} -120 L${FALLS_END + 50} -90 Z`}
        />
        <path
          d={`M${FALLS_END + 220} ${-H + 60} L${FALLS_END + 300} ${-H + 40} L${FALLS_END + 280} -60 L${FALLS_END + 230} -40 Z`}
        />
      </g>
      <g stroke={CLIFF_DARK} strokeWidth={3} fill="none" opacity={0.45}>
        <path
          d={`M${FALLS_END + 30} -160 q60 8 140 -4 M${FALLS_END + 160} -240 q70 6 150 -8 M${FALLS_END + 80} -60 l12 30`}
        />
      </g>
      <SnowLedge x0={FALLS_END + 150} x1={FALLS_END + 260} y={-170} depth={10} />
      <SnowLedge x0={X - 30} x1={1500} y={-H} depth={16} />
      <SnowPine x={FALLS_END + 120} y={-H - 2} h={80} />
      <SnowPine x={FALLS_END + 330} y={-H - 2} h={60} flip />
      <path d={`M${X - 120} -12 Q${X - 60} -40 ${X} -30 L${X} -12 Z`} fill={P.snowTop} />
    </g>
  );
});

/**
 * The frozen falls' columns, back ones first: middle x, width, where each ends (0 reaches the
 * ground; a column ending higher tapers to a dripping tip) and how far its sides bulge.
 */
const COLS = [
  { x: X + 52, w: 40, end: -70, bulge: 6, back: true },
  { x: X + 128, w: 44, end: -130, bulge: 8, back: true },
  { x: X + 196, w: 42, end: -40, bulge: 6, back: true },
  { x: X + 10, w: 50, end: 0, bulge: 12, back: false },
  { x: X + 88, w: 56, end: 0, bulge: 16, back: false },
  { x: X + 160, w: 48, end: -10, bulge: 12, back: false },
  { x: X + 222, w: 30, end: -170, bulge: 4, back: false },
];

/** One column of ice (lined), hanging from the lip at the top. */
function Column({ c, i, grad }: { c: (typeof COLS)[number]; i: number; grad: string }) {
  const l = c.x - c.w / 2;
  const r = c.x + c.w / 2;
  const top = -H - 4;
  const end = c.end;
  const body =
    end < 0
      ? `M${l} ${top} Q${l - c.bulge} ${(top + end) / 2} ${l + c.w * 0.25} ${end - 20} L${c.x} ${end + 14} L${r - c.w * 0.25} ${end - 20} Q${r + c.bulge} ${(top + end) / 2} ${r} ${top} Z`
      : `M${l} ${top} Q${l - c.bulge} ${top / 2} ${l - c.bulge * 0.4} 4 H${r + c.bulge * 0.4} Q${r + c.bulge} ${top / 2} ${r} ${top} Z`;
  const lit = `M${l + c.w * 0.2} ${top + 16} Q${l + c.w * 0.12 - c.bulge * 0.4} ${(top + end) / 2} ${c.x - 4} ${end - 30} Q${c.x + 2 - c.bulge * 0.2} ${(top + end) / 2} ${c.x + 2} ${top + 26} Z`;
  return (
    <g>
      <path d={body} fill={c.back ? mixIce : `url(#${grad})`} />
      <path
        d={`M${c.x + c.w * 0.18} ${top} Q${r + c.bulge * 0.6} ${(top + end) / 2} ${c.x + 4} ${end - 4} L${r - 4} ${top} Z`}
        fill={ICE_DEEP}
        opacity={0.4}
      />
      {!c.back && <path d={lit} fill={ICE_LIGHT} opacity={0.9} />}
      <path
        d={`M${l + 4} ${top + (H + end) * (0.35 + 0.1 * (i % 3))} q${c.w * 0.45} ${6 + c.bulge * 0.3} ${c.w - 8} 0`}
        stroke={shade(ICE_DEEP, 0.15)}
        strokeWidth={IN}
        fill="none"
        {...NS}
      />
      <path d={body} fill="none" {...ink(c.back ? IN + 1 : OUT)} />
    </g>
  );
}

/**
 * The frozen waterfall (lined: he climbs it): columns of ice of every width and length hanging
 * from a snowy rock lip, the long ones fused into a heap of ice at the foot.
 */
const Falls = memo(function Falls() {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={-H} x2="0" y2={0}>
          <stop offset="0" stopColor={ICE_LIGHT} />
          <stop offset="0.45" stopColor={ICE} />
          <stop offset="1" stopColor={mixIce} />
        </linearGradient>
      </defs>
      {COLS.map((c, i) => (
        <Column key={i} c={c} i={i} grad={id} />
      ))}
      {/* The heap of ice at the foot, lit along its top. */}
      <path
        d={`M${X - 50} 4 Q${X - 40} -34 ${X + 10} -36 Q${X + 60} -50 ${X + 110} -38 Q${X + 150} -46 ${X + 190} -30 Q${X + 220} -20 ${X + 236} 4 Z`}
        fill={ICE}
        {...ink(OUT)}
      />
      <path
        d={`M${X - 30} -24 Q${X + 10} -40 ${X + 60} -42 Q${X + 110} -40 ${X + 170} -30`}
        stroke="#ffffff"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      {/* The rock lip the falls pour over, under its snow. */}
      <path
        d={`M${X - 34} ${-H + 6} Q${X - 30} ${-H - 10} ${X - 10} ${-H - 14} H${FALLS_END + 20} V${-H + 4} Q${X + 120} ${-H - 2} ${X - 34} ${-H + 6} Z`}
        fill={CLIFF}
      />
      <SnowLedge x0={X - 40} x1={FALLS_END + 30} y={-H - 12} depth={16} />
    </g>
  );
});

/** A foothold of ice (lined) that he stands on halfway up, until it breaks away. */
const Foothold = memo(function Foothold() {
  return (
    <g>
      <path d="M-26 -6 L14 -8 L8 10 L-20 14 Z" fill={ICE} {...ink(OUT)} />
      <path d="M-24 -4 L10 -6" stroke={ICE_LIGHT} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
});

export function IceWallBack(p: ObstacleProps) {
  const slip = since(p, 'slip');
  const climb = since(p, 'climb');
  const hold = fallen(slip, 0.0026);
  // Chips of ice raining down past him as he climbs.
  const chips =
    climb >= 0
      ? [0, 1, 2, 3].flatMap((i) => {
          const dt = (climb - 300 - i * 520) % 2100;
          if (climb - 300 - i * 520 < 0) return [];
          const y = -H + fallen(dt, 0.0028);
          if (y > 20) return [];
          return [
            {
              x: X + 30 + 40 * noise(i, 5) + dt * 0.02,
              y,
              rx: 7 + 3 * noise(i, 6),
              ry: 5,
              rot: dt * 0.4,
            },
          ];
        })
      : [];
  return (
    <g>
      <Cliff />
      <Falls />
      {hold < 260 && (
        <g
          transform={`translate(${X - 12} ${(-158 + hold).toFixed(1)}) rotate(${slip > 0 ? (slip * 0.3).toFixed(1) : 0})`}
        >
          <Foothold />
        </g>
      )}
      <SnowBurst x={X - 10} y={-158} dt={slip} size={0.35} ms={500} />
      {chips.length > 0 && <path d={ellipses(chips)} fill={ICE_LIGHT} {...ink(IN)} />}
    </g>
  );
}
