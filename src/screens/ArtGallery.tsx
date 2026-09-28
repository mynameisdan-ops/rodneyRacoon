import { useState } from 'react';
import { HAIR_COLORS, HAIR_STYLES, SKIN_TONES } from '../content/avatar';
import { DEFAULT_AVATAR } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import { HERO_POSES, type HeroPose } from '../art/hero/poses';

/** Dev-only page (open with #gallery in a dev build) for checking art at a glance. */
export function ArtGallery() {
  const [stumbleKey, setStumbleKey] = useState(0);
  return (
    <div className="gallery">
      <h1>Hero poses</h1>
      <div className="gallery__row">
        {HERO_POSES.map((pose: HeroPose) => (
          <figure key={pose} onClick={() => pose === 'stumble' && setStumbleKey((k) => k + 1)}>
            <Hero
              key={pose === 'stumble' ? stumbleKey : pose}
              avatar={DEFAULT_AVATAR}
              pose={pose}
              size={260}
            />
            <figcaption>{pose}</figcaption>
          </figure>
        ))}
      </div>
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
    </div>
  );
}
