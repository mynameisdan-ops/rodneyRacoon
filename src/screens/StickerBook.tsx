import { useState } from 'react';
import { avatarForProfile } from '../art/hero/avatar';
import { LEVELS, WORLDS } from '../content/levels';
import { getSticker, STICKERS } from '../content/stickers';
import { isPassed } from '../game/progress';
import type { Profile } from '../state/schema';
import { Sticker } from '../ui/Sticker';

interface Props {
  profile: Profile;
  /** The world page to open on. */
  initialWorld: number;
  onBack: () => void;
}

/** The journey sticker book: one page per world, a sticker for every level passed. */
export function StickerBook({ profile, initialWorld, onBack }: Props) {
  const [worldId, setWorldId] = useState(initialWorld);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const avatar = avatarForProfile(profile);
  const collected = STICKERS.filter((s) => isPassed(profile.progress, s.level)).length;
  const levels = LEVELS.filter((l) => l.world === worldId);
  const zoomedSticker = zoomed === null ? undefined : getSticker(zoomed);

  return (
    <div className="book">
      <div className="book__hud">
        <button type="button" className="icon-button" aria-label="Back to the map" onClick={onBack}>
          ◀
        </button>
        <h1 className="book__title">Sticker Book</h1>
        <div className="book__tabs" role="tablist">
          {WORLDS.map((w) => {
            const got = LEVELS.filter((l) => l.world === w.id && isPassed(profile.progress, l.id));
            return (
              <button
                key={w.id}
                type="button"
                role="tab"
                aria-selected={w.id === worldId}
                aria-label={w.name}
                className={w.id === worldId ? 'book__tab book__tab--on' : 'book__tab'}
                onClick={() => setWorldId(w.id)}
              >
                <span className="book__tab-num">{w.id}</span>
                <span className="book__tab-got">{got.length} / 8</span>
              </button>
            );
          })}
        </div>
        <div className="book__count">
          {collected} / {STICKERS.length}
        </div>
      </div>

      <div className="book__page">
        <div className="book__world">{WORLDS.find((w) => w.id === worldId)?.name}</div>
        <div className="book__grid" key={worldId}>
          {levels.map((l) =>
            isPassed(profile.progress, l.id) ? (
              <button
                key={l.id}
                type="button"
                className="book__slot"
                aria-label={getSticker(l.id)?.name}
                onClick={() => setZoomed(l.id)}
              >
                <Sticker levelId={l.id} avatar={avatar} width={250} />
                <span className="book__name">{getSticker(l.id)?.name}</span>
              </button>
            ) : (
              <div key={l.id} className="book__slot book__slot--empty" aria-label={`Level ${l.id}`}>
                <div className="book__empty">{l.id}</div>
              </div>
            ),
          )}
        </div>
      </div>

      {zoomedSticker && (
        <button type="button" className="book__zoom" onClick={() => setZoomed(null)}>
          <Sticker levelId={zoomedSticker.level} avatar={avatar} width={820} tilt={false} />
          <span className="book__zoom-name">{zoomedSticker.name}</span>
        </button>
      )}
    </div>
  );
}
