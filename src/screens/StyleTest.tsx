import { useState } from 'react';
import { DEFAULT_AVATAR, type AvatarConfig } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import { HERO_POSES } from '../art/hero/poses';
import { EXPRESSIONS } from '../art/hero/expressions';
import { ToonHero } from '../art/toon/ToonHero';
import { swingReach, type Build } from '../art/toon/toonBuilds';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import { HAIR_COLORS, HAIR_STYLES, SKIN_TONES } from '../content/avatar';
import { TrailStrip } from '../ui/TrailStrip';
import { heroX } from '../ui/trailLayout';

const AVATARS: AvatarConfig[] = HAIR_STYLES.map((hairStyle, i) => ({
  ...DEFAULT_AVATAR,
  hairStyle,
  hairColor: HAIR_COLORS[[1, 0, 4][i]!]!.value,
  skin: SKIN_TONES[[1, 3, 0][i]!]!.value,
  shirt: ['#e63946', '#3a86ff', '#2a9d5c'][i]!,
}));

/**
 * Dev-only (open with #style): the M7b style test. The current art next to the proposed
 * Saturday-morning-cartoon look, to pick a direction before anything in the game changes.
 * `view` shows one section on its own (#style-faces, #style-faces-lean ...), for screenshots.
 */
export function StyleTest({ view }: { view?: string }) {
  const fromHash = location.hash.split('-')[2];
  const [build, setBuild] = useState<Build>(fromHash === 'kid' ? 'kid' : 'lean');
  const show = (section: string) => !view || view === section;
  const open = (hash: string) => {
    location.hash = hash;
    location.reload();
  };
  return (
    <div className="gallery">
      {!view && (
        <div className="gallery__row">
          {(['now', 'v1', 'dynamic'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className="big-button"
              onClick={() => open(`#style-scene-${m}`)}
            >
              Scene: {m}
            </button>
          ))}
        </div>
      )}
      {show('heroes') && (
        <>
          <h1>Heroes: now · kid · lean</h1>
          <div className="gallery__row">
            <figure>
              <Hero avatar={DEFAULT_AVATAR} size={320} />
              <figcaption>now</figcaption>
            </figure>
            <figure>
              <ToonHero avatar={DEFAULT_AVATAR} build="kid" size={320} />
              <figcaption>kid</figcaption>
            </figure>
            <figure>
              <ToonHero avatar={DEFAULT_AVATAR} build="lean" size={320} />
              <figcaption>lean</figcaption>
            </figure>
            <figure>
              <Hero avatar={DEFAULT_AVATAR} size={116} />
              <ToonHero avatar={DEFAULT_AVATAR} build="kid" size={116} />
              <ToonHero avatar={DEFAULT_AVATAR} build="lean" size={116} />
              <figcaption>page-strip size</figcaption>
            </figure>
          </div>
        </>
      )}
      {!view && (
        <div className="gallery__row">
          {(['lean', 'kid'] as const).map((b) => (
            <button
              key={b}
              type="button"
              className={b === build ? 'big-button' : 'big-button big-button--quiet'}
              onClick={() => setBuild(b)}
            >
              {b}
            </button>
          ))}
        </div>
      )}
      {show('faces') && (
        <>
          <h1>Expressions ({build})</h1>
          <div className="gallery__row">
            {EXPRESSIONS.map((e) => (
              <figure key={e}>
                <div className="style-test__face">
                  <ToonHero avatar={DEFAULT_AVATAR} build={build} expression={e} size={520} />
                </div>
                <figcaption>{e}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      {show('hair') && (
        <>
          <h1>Hair and skin ({build})</h1>
          <div className="gallery__row">
            {AVATARS.map((a, i) => (
              <figure key={i}>
                <ToonHero avatar={a} build={build} size={300} />
                <figcaption>{a.hairStyle}</figcaption>
              </figure>
            ))}
            {AVATARS.map((a, i) => (
              <figure key={`f${i}`}>
                <div className="style-test__face">
                  <ToonHero avatar={a} build={build} size={520} />
                </div>
              </figure>
            ))}
          </div>
        </>
      )}
      {show('strip') && (
        <>
          <h1>Page strip: now · kid · lean</h1>
          <div className="style-test__strips">
            <TrailStrip
              worldId={2}
              obstacle="vine-swing"
              avatar={DEFAULT_AVATAR}
              progress={0.4}
              elapsed={0.35}
              running={false}
            />
            {(['kid', 'lean'] as const).map((b) => (
              <PaintedStrip key={b} build={b} />
            ))}
          </div>
        </>
      )}
      {show('poses') && (
        <>
          <h1>Poses ({build})</h1>
          <div className="gallery__row style-test__poses">
            {HERO_POSES.map((pose) => (
              <figure key={pose}>
                <ToonHero avatar={DEFAULT_AVATAR} build={build} pose={pose} size={200} />
                <figcaption>{pose}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** The page strip's backdrop, painted, with the new hero standing where TrailStrip puts him. */
function PaintedStrip({ build }: { build: Build }) {
  // The same reach-based size as in scenes, scaled like the strip's 116px hero (200px in scenes).
  const size = (116 / 200) * ((175 * 170) / swingReach(build));
  return (
    <div className="trail">
      <WorldBackdrop
        worldId={2}
        height={240}
        horizon={120}
        groundTop={168}
        pathY={206}
        detail={0.55}
        scroll={0.4 * 700}
        parallax={{ near: 0 }}
        painted
      />
      <div
        className="trail__hero"
        style={{
          transform: `translateX(${heroX(0.4)}px)`,
          top: 206 - (size * 163) / 170,
          marginLeft: -(size * 52) / 170,
        }}
      >
        <ToonHero avatar={DEFAULT_AVATAR} build={build} size={size} />
      </div>
    </div>
  );
}
