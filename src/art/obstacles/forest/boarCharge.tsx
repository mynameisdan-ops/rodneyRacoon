import { memo } from 'react';
import { Dust, SpeedLines } from '../../fx';
import { INK, ink, PROP_IN as IN, PROP_OUT as OUT, shade, tint } from '../../style';
import { bump, clamp01, easeOut, lerp, noise, since } from '../sceneKit';
import { eventTime, type ObstacleProps } from '../types';
import { BARK, LEAF, MOSS } from './kit';
import { BOAR } from './layout';
import { LeafBurst } from './parts';

// ---------- Level 13: boar charge ----------
// snort (a boar trots in and paws the ground) → charge → crash (into the bush) → it trots off.

/**
 * A clump of foliage drawn like his props: overlapping lobes under one bold outline (the ink is a
 * wider stroke behind the fills, so the inner overlaps stay clean), leaf tips poking out around
 * its edge, a shadowed underside and a lit top. `lobes` are [x, y, r]. Use it memoized: it's a
 * lot of shapes.
 */
function LinedFoliage({
  lobes,
  color = LEAF,
}: {
  lobes: readonly (readonly number[])[];
  color?: string;
}) {
  return (
    <g>
      {/* Leaf tips, drawn first so the lobes cover all but the ends that stick out. */}
      {lobes.map(([x, y, r], i) =>
        Array.from({ length: 8 }, (_, j) => {
          const a = (j / 8) * Math.PI * 2 + i * 0.7;
          const s = (r! / 26) * (0.8 + 0.4 * noise(i * 8 + j, 2));
          return (
            <path
              key={`${i}-${j}`}
              d="M0 0 Q7 -5.5 16 0 Q7 5.5 0 0 Z"
              transform={`translate(${x! + Math.cos(a) * r! * 0.84} ${y! + Math.sin(a) * r! * 0.84}) rotate(${(a * 180) / Math.PI}) scale(${s})`}
              fill={Math.sin(a) < -0.2 ? tint(color, 0.2) : shade(color, 0.2)}
              {...ink(1.5 / s)}
            />
          );
        }),
      )}
      <g fill={INK} stroke={INK} strokeWidth={OUT * 2}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill={shade(color, 0.28)}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill={color}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x! + r! * 0.12} cy={y! - r! * 0.16} r={r! * 0.86} />
        ))}
      </g>
      <g fill={tint(color, 0.35)}>
        {lobes.map(([x, y, r], i) => (
          <circle key={i} cx={x! + r! * 0.3} cy={y! - r! * 0.42} r={r! * 0.38} />
        ))}
      </g>
    </g>
  );
}

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

const FUR = '#8a6450';
const SNOUT = '#f0a0a8';

/** A round, grumpy-cute boar (no glare, tiny tusks), its head at local −x. */
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
  return (
    <g transform={`translate(${x} 0) scale(${facing} 1)`}>
      {[-40, -18, 22, 44].map((lx, i) => {
        const d = `M${lx} -30 L${lx + (i % 2 ? step : -step) * 10} -5`;
        const far = i === 1 || i === 3;
        return (
          <g key={lx} strokeLinecap="round">
            <path d={d} stroke={INK} strokeWidth={14} />
            <path d={d} stroke={far ? shade(FUR, 0.35) : shade(FUR, 0.15)} strokeWidth={8} />
          </g>
        );
      })}
      <BoarBody />
      <BoarHead dazed={dazed} />
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

const BoarBody = memo(function BoarBody() {
  return (
    <g>
      <path
        d="M66 -72 q18 -8 14 10 q-3 9 -11 3"
        stroke={INK}
        strokeWidth={3.2}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={0} cy={-62} rx={70} ry={44} fill={FUR} {...ink(OUT + 0.4)} />
      <path d="M-64 -46 Q0 -8 66 -48 Q44 -24 0 -22 Q-42 -24 -64 -46 Z" fill={shade(FUR, 0.3)} />
      <path
        d="M14 -104 Q48 -100 66 -78"
        stroke={tint(FUR, 0.45)}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      {/* A bristly mane along its back. */}
      <path
        d="M-52 -94 L-44 -114 L-34 -100 L-22 -120 L-10 -103 L4 -122 L14 -103 L28 -116 L34 -99 Q-6 -108 -52 -94 Z"
        fill={shade(FUR, 0.35)}
        {...ink(IN + 0.6)}
      />
    </g>
  );
});

const BoarHead = memo(function BoarHead({ dazed }: { dazed: boolean }) {
  return (
    <g transform="translate(-68 -58)">
      <path d="M8 -24 L20 -48 L26 -20 Z" fill={FUR} {...ink(IN + 0.8)} />
      <path d="M12 -26 L19 -40 L22 -24 Z" fill={SNOUT} />
      <ellipse cx={0} cy={0} rx={34} ry={30} fill={FUR} {...ink(OUT)} />
      <path d="M-30 14 Q-10 32 26 18 Q6 26 -14 22 Z" fill={shade(FUR, 0.3)} />
      <path
        d="M8 -26 Q24 -20 30 -6"
        stroke={tint(FUR, 0.45)}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={-30} cy={8} rx={15} ry={13} fill={SNOUT} {...ink(OUT - 0.6)} />
      <ellipse cx={-35} cy={7} rx={2.6} ry={3.6} fill={shade(SNOUT, 0.6)} />
      <ellipse cx={-26} cy={7} rx={2.6} ry={3.6} fill={shade(SNOUT, 0.6)} />
      <ellipse cx={-27} cy={0} rx={4} ry={2} fill="#ffd8de" />
      <path d="M-18 18 Q-24 30 -32 26 Q-26 24 -24 17 Z" fill="#fff6e0" {...ink(IN)} />
      {dazed ? (
        <path
          d="M-14 -16 q6 -4 9 1 q2 6 -5 7 q-6 0 -5 -6 q2 -8 11 -6"
          stroke={INK}
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <g>
          <ellipse cx={-9} cy={-9} rx={6} ry={7} fill="#fff" {...ink(1.6)} />
          <circle cx={-11} cy={-8} r={3.4} fill={INK} />
          <circle cx={-12.2} cy={-9.6} r={1.2} fill="#fff" />
          <path d="M-18 -19 L0 -14" stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
});

/** The tree he climbs, with the branch he stands on (memoized: it never moves). */
const BoarTree = memo(function BoarTree() {
  const { tree, branch } = BOAR;
  const limb = `M${tree + 20} ${-branch - 30} Q${tree + 120} ${-branch + 6} ${tree + 240} ${-branch - 10}`;
  return (
    <g>
      <path
        d={`M${tree - 40} 6 L${tree - 34} -700 L${tree + 34} -700 L${tree + 40} 6 Z`}
        fill={BARK}
        {...ink(OUT)}
      />
      <path
        d={`M${tree - 40} 6 L${tree - 34} -700 L${tree - 12} -700 L${tree - 16} 6 Z`}
        fill={shade(BARK, 0.3)}
      />
      <path
        d={`M${tree + 30} -690 L${tree + 36} -6`}
        stroke={tint(BARK, 0.45)}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <g stroke={shade(BARK, 0.45)} strokeWidth={IN} fill="none" strokeLinecap="round">
        <path
          d={`M${tree - 6} -640 q6 120 -2 240 M${tree + 14} -520 q-6 100 2 200 M${tree - 18} -300 q5 90 -2 180 M${tree + 10} -200 q-4 80 2 150`}
        />
      </g>
      <ellipse cx={tree + 6} cy={-420} rx={9} ry={14} fill={shade(BARK, 0.55)} {...ink(IN)} />
      {/* Roots flaring into the ground, a little moss on them. */}
      <path
        d={`M${tree - 38} 2 Q${tree - 62} -2 ${tree - 76} 8 L${tree - 44} 8 Z`}
        fill={BARK}
        {...ink(IN + 0.8)}
      />
      <path
        d={`M${tree + 38} 2 Q${tree + 64} -4 ${tree + 80} 8 L${tree + 46} 8 Z`}
        fill={BARK}
        {...ink(IN + 0.8)}
      />
      <path
        d={`M${tree - 64} 2 Q${tree - 56} -8 ${tree - 44} -6 Q${tree - 50} 0 ${tree - 56} 4 Z`}
        fill={MOSS}
        {...ink(IN)}
      />
      <g fill="none" strokeLinecap="round">
        <path d={limb} stroke={INK} strokeWidth={30} />
        <path d={limb} stroke={BARK} strokeWidth={23} />
        <path d={limb} transform="translate(0 5)" stroke={shade(BARK, 0.3)} strokeWidth={8} />
        <path d={limb} transform="translate(0 -7)" stroke={tint(BARK, 0.45)} strokeWidth={4} />
      </g>
      <LinedFoliage
        lobes={[
          [tree + 212, -branch - 36, 20],
          [tree + 240, -branch - 52, 28],
          [tree + 272, -branch - 38, 24],
          [tree + 230, -branch - 84, 22],
          [tree + 266, -branch - 78, 24],
          [tree + 296, -branch - 58, 18],
        ]}
      />
    </g>
  );
});

/** The bush the boar crashes into. */
const BoarBush = memo(function BoarBush() {
  return (
    <g>
      <LinedFoliage
        lobes={[
          [-46, -46, 46],
          [30, -58, 58],
          [-10, -98, 44],
          [62, -30, 34],
          [-78, -24, 30],
        ]}
      />
      <g fill="#e2452f" {...ink(1.4)}>
        <circle cx={-30} cy={-70} r={5} />
        <circle cx={20} cy={-96} r={4.5} />
        <circle cx={50} cy={-50} r={5} />
      </g>
    </g>
  );
});

export function BoarChargeBack(p: ObstacleProps) {
  const { bush } = BOAR;
  const crash = since(p, 'crash');
  const shakeBush = 8 * bump(crash, 500) * Math.sin(p.t / 30);
  return (
    <g>
      <BoarTree />
      <g transform={`translate(${bush + shakeBush} 0)`}>
        <BoarBush />
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
        <g>
          <g transform={`translate(${boar.x + 90} 0) scale(-1 1)`}>
            <SpeedLines x={0} t={p.t} ys={[-30, -60, -90]} />
          </g>
          <Dust x={boar.x + 60} y={-4} dt={p.t % 260} ms={260} size={0.4} color="#c8b090" />
        </g>
      )}
      <Boar {...boar} t={p.t} />
    </g>
  );
}
