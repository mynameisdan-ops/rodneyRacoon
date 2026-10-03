import { Dust, SpeedLines } from '../../fx';
import { INK, ink, shade, tint } from '../../style';
import { bump, clamp01, easeOut, lerp, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { BARK, LEAF } from './kit';
import { BOAR } from './layout';
import { LeafBurst } from './parts';

// ---------- Level 13: boar charge ----------
// snort (a boar trots in and paws the ground) → charge → crash (into the bush) → it trots off.

function boarPose(p: ObstacleProps) {
  const snortAt = eventTime(p.events, 'snort');
  const chargeAt = eventTime(p.events, 'charge');
  const crashAt = eventTime(p.events, 'crash');
  const { boarStart, bush } = BOAR;
  if (p.t < snortAt) return null;
  if (p.t < chargeAt) {
    const x = lerp(boarStart, 900, easeOut(clamp01((p.t - snortAt) / 500)));
    return { x, step: Math.sin(p.t / 90), dazed: false, facing: -1 };
  }
  if (p.t < crashAt) {
    return {
      x: lerp(900, bush + 90, (p.t - chargeAt) / (crashAt - chargeAt)),
      step: Math.sin(p.t / 45),
      dazed: false,
      facing: -1,
    };
  }
  const dt = p.t - crashAt;
  // Sits dazed for a moment, then trots off the way it came, a bit sheepish.
  if (dt < 900) return { x: bush + 90 + 10 * bump(dt, 250), step: 0, dazed: true, facing: -1 };
  return { x: bush + 90 + (dt - 900) * 0.5, step: Math.sin(p.t / 70), dazed: false, facing: 1 };
}

function Boar({
  x,
  step,
  dazed,
  facing,
  t,
}: {
  x: number;
  step: number;
  dazed: boolean;
  facing: number;
  t: number;
}) {
  const fur = '#7a5a48';
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      {/* Legs. */}
      {[-40, -18, 22, 44].map((lx, i) => (
        <path
          key={lx}
          d={`M${lx} -30 L${lx + (i % 2 ? step : -step) * 10} -2`}
          stroke={INK}
          strokeWidth={12}
          strokeLinecap="round"
        />
      ))}
      <ellipse cx={0} cy={-62} rx={70} ry={44} fill={fur} {...ink(3.5)} />
      <path d="M-60 -76 Q0 -130 60 -86 Q20 -96 -60 -76 Z" fill={shade(fur, 0.35)} {...ink(2.5)} />
      <ellipse cx={10} cy={-40} rx={46} ry={16} fill={shade(fur, 0.25)} />
      {/* Head, facing left (local −x). */}
      <g transform="translate(-68 -60)">
        <ellipse cx={0} cy={0} rx={34} ry={28} fill={fur} {...ink(3)} />
        <path d="M-8 -26 L0 -44 L10 -24 Z" fill={shade(fur, 0.3)} {...ink(2)} />
        <ellipse cx={-30} cy={8} rx={14} ry={12} fill="#e8a0a8" {...ink(2.5)} />
        <circle cx={-34} cy={6} r={2.5} fill={INK} />
        <circle cx={-26} cy={6} r={2.5} fill={INK} />
        <path
          d="M-22 18 q-6 10 -14 8"
          stroke="#fff6e0"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        {dazed ? (
          <path d="M-12 -12 l8 8 m0 -8 l-8 8" stroke={INK} strokeWidth={3} />
        ) : (
          <g>
            <circle cx={-8} cy={-8} r={4} fill={INK} />
            <path d="M-16 -18 L0 -12" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        )}
      </g>
      <path d="M68 -70 q16 -6 12 10" stroke={INK} strokeWidth={3} fill="none" />
      {dazed && (
        <g transform={`translate(-68 -120) rotate(${t * 0.3})`} fill="#ffd35a" {...ink(1.5)}>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              transform={`rotate(${i * 120}) translate(26 0)`}
              d="M0 -8 L2.5 -2.5 L8 0 L2.5 2.5 L0 8 L-2.5 2.5 L-8 0 L-2.5 -2.5 Z"
            />
          ))}
        </g>
      )}
    </g>
  );
}

export function BoarChargeBack(p: ObstacleProps) {
  const { tree, branch, bush } = BOAR;
  const crash = since(p, 'crash');
  const shakeBush = 8 * bump(crash, 500) * Math.sin(p.t / 30);
  return (
    <g>
      {/* The tree and the branch he climbs onto. */}
      <path
        d={`M${tree - 40} 6 L${tree - 34} -700 L${tree + 34} -700 L${tree + 40} 6 Z`}
        fill={BARK}
        {...ink(3.5)}
      />
      <path
        d={`M${tree + 8} 6 L${tree + 12} -700 L${tree + 34} -700 L${tree + 40} 6 Z`}
        fill={shade(BARK, 0.35)}
      />
      <path
        d={`M${tree + 20} ${-branch - 30} Q${tree + 120} ${-branch + 6} ${tree + 240} ${-branch - 10}`}
        stroke={INK}
        strokeWidth={30}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${tree + 20} ${-branch - 30} Q${tree + 120} ${-branch + 6} ${tree + 240} ${-branch - 10}`}
        stroke={BARK}
        strokeWidth={23}
        fill="none"
        strokeLinecap="round"
      />
      <g fill={LEAF} {...ink(2.5)}>
        <circle cx={tree + 250} cy={-branch - 40} r={36} />
        <circle cx={tree + 220} cy={-branch - 64} r={26} />
      </g>
      {/* The bush the boar crashes into. */}
      <g transform={`translate(${bush + shakeBush} 0)`} fill={LEAF} {...ink(3)}>
        <circle cx={-40} cy={-50} r={50} />
        <circle cx={30} cy={-60} r={60} />
        <circle cx={-10} cy={-100} r={46} />
        <circle cx={10} cy={-80} r={24} fill={tint(LEAF, 0.2)} stroke="none" />
      </g>
      <LeafBurst x={bush + 20} y={-90} dt={crash} count={14} />
    </g>
  );
}

export function BoarChargeFront(p: ObstacleProps) {
  const boar = boarPose(p);
  if (!boar) return null;
  const snort = since(p, 'snort');
  const charge = since(p, 'charge');
  return (
    <g>
      {charge < 0 && (
        <Dust x={boar.x + 50} y={-4} dt={(snort % 600) - 100} ms={400} size={0.5} color="#8a7050" />
      )}
      {charge >= 0 && since(p, 'crash') < 0 && (
        <g transform={`translate(${boar.x + 90} 0) scale(-1 1)`}>
          <SpeedLines x={0} t={p.t} ys={[-30, -60, -90]} />
        </g>
      )}
      <Boar {...boar} t={p.t} />
    </g>
  );
}
