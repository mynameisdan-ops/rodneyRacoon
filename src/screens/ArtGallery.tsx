import { useState } from 'react';
import { HAIR_COLORS, HAIR_STYLES, SKIN_TONES } from '../content/avatar';
import { DEFAULT_AVATAR } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import { ItemIcon } from '../art/hero/ItemIcon';
import { HERO_POSES, type HeroPose } from '../art/hero/poses';
import { getCutScene } from '../content/cutscenes';
import { getLevel, LEVELS } from '../content/levels';
import { SHOP_ITEMS } from '../content/shop';
import { STICKERS } from '../content/stickers';
import { Sticker } from '../ui/Sticker';
import { ScenePreview } from './ScenePreview';

/**
 * Dev-only page (open with #gallery in a dev build) for checking art at a glance.
 * `#gallery-poses` (or `gear`, `gear-poses`, `icons`, `hair`, `stickers`) shows one section
 * on its own, for screenshots.
 */
export function ArtGallery({ section }: { section?: string }) {
  const show = (name: string) => !section || section === name;
  const [stumbleKey, setStumbleKey] = useState(0);
  const [sceneLevel, setSceneLevel] = useState<number | null>(null);

  const level = sceneLevel === null ? undefined : getLevel(sceneLevel);
  if (level) return <ScenePreview level={level} onClose={() => setSceneLevel(null)} />;

  return (
    <div className={section ? 'gallery gallery--sheet' : 'gallery'}>
      {show('scenes') && (
        <>
          <h1>Cut scenes</h1>
          <div className="gallery__row">
            {LEVELS.filter((l) => getCutScene(l.id)).map((l) => (
              <button
                key={l.id}
                type="button"
                className="big-button big-button--quiet"
                onClick={() => setSceneLevel(l.id)}
              >
                {l.id}
              </button>
            ))}
          </div>
        </>
      )}
      {show('stickers') && (
        <>
          <h1>Stickers</h1>
          <div className="gallery__row">
            {STICKERS.map((s) => (
              <figure key={s.level}>
                <Sticker
                  levelId={s.level}
                  avatar={{ ...DEFAULT_AVATAR, gear: { hat: 'explorer-hat', cape: 'star-cape' } }}
                  width={280}
                />
                <figcaption>
                  {s.level}. {s.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      {show('poses') && (
        <>
          <h1>Hero poses</h1>
          <div className="gallery__row">
            {HERO_POSES.map((pose: HeroPose) => (
              <figure key={pose} onClick={() => pose === 'stumble' && setStumbleKey((k) => k + 1)}>
                <Hero
                  key={pose === 'stumble' ? stumbleKey : pose}
                  avatar={DEFAULT_AVATAR}
                  pose={pose}
                  size={230}
                />
                <figcaption>{pose}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      {show('gear') && (
        <>
          <h1>Shop gear</h1>
          <div className="gallery__row">
            {SHOP_ITEMS.map((item) => (
              <figure key={item.id}>
                <Hero
                  avatar={{ ...DEFAULT_AVATAR, gear: { [item.slot]: item.id } }}
                  pose={item.slot === 'pet' ? 'walk' : 'idle'}
                  size={190}
                />
                <figcaption>{item.name}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      {show('icons') && (
        <>
          <h1>Shop icons</h1>
          <div className="gallery__row">
            {SHOP_ITEMS.map((item) => (
              <figure key={item.id}>
                <ItemIcon item={item} size={110} />
                <figcaption>{item.name}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      {show('gear-poses') && (
        <>
          <h1>All gear, every pose</h1>
          <div className="gallery__row">
            {HERO_POSES.map((pose) => (
              <figure key={pose}>
                <Hero
                  avatar={{
                    ...DEFAULT_AVATAR,
                    gear: { hat: 'viking-helmet', cape: 'flame-cape', pack: 'bedroll', pet: 'fox' },
                  }}
                  pose={pose}
                  size={200}
                />
                <figcaption>{pose}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      {show('hair') && (
        <>
          <h1>Hair, skin, facing</h1>
          <div className="gallery__row">
            {HAIR_STYLES.map((hairStyle, i) => (
              <figure key={hairStyle}>
                <Hero
                  avatar={{
                    ...DEFAULT_AVATAR,
                    hairStyle,
                    hairColor: HAIR_COLORS[i]!.value,
                    skin: SKIN_TONES[i * 2]!.value,
                    shirt: ['#3a86ff', '#2a9d5c', '#6a4c93'][i]!,
                  }}
                  size={260}
                  facing={i === 2 ? 'left' : 'right'}
                />
                <figcaption>{hairStyle}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Dev-only contact sheet for picking sticker moments: open `#moments-1-4` for levels 1 to 4,
 * each shown at several moments of its scene.
 */
export function StickerMoments({ from, to }: { from: number; to: number }) {
  return (
    <div className="moments">
      {LEVELS.filter((l) => l.id >= from && l.id <= to).map((l) => (
        <div key={l.id} className="moments__row">
          {[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((m) => (
            <figure key={m}>
              <Sticker levelId={l.id} avatar={DEFAULT_AVATAR} width={300} tilt={false} moment={m} />
              <figcaption>
                {l.id}: {m}
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}
