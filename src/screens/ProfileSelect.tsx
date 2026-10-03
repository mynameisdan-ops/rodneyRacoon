import { useMusic } from '../audio/hooks';
import { totalStars } from '../game/progress';
import type { Profile } from '../state/schema';
import { avatarForProfile } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';
import { WorldBackdrop } from '../art/worlds/WorldBackdrop';
import { GearIcon } from '../ui/icons';

interface Props {
  profiles: Profile[];
  lastProfileId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
  /** The parent's settings. */
  onSettings: () => void;
}

export const MAX_PROFILES = 6;

export function ProfileSelect({
  profiles,
  lastProfileId,
  onSelect,
  onEdit,
  onAdd,
  onSettings,
}: Props) {
  useMusic('title');
  return (
    <div className="profiles">
      <WorldBackdrop worldId={1} height={800} horizon={420} groundTop={520} />
      <button
        type="button"
        className="icon-button profiles__settings"
        aria-label="Settings"
        onClick={onSettings}
      >
        <GearIcon size={44} />
      </button>
      <h1 className="profiles__title">Who's playing?</h1>
      <div className="profiles__grid">
        {profiles.map((p) => (
          <div
            key={p.id}
            className={p.id === lastProfileId ? 'profile-card profile-card--last' : 'profile-card'}
          >
            <button
              type="button"
              className="profile-card__play"
              onClick={() => onSelect(p.id)}
              aria-label={`Play as ${p.name}`}
            >
              <Hero avatar={avatarForProfile(p)} size={160} />
              <span className="profile-card__name">{p.name}</span>
              <span className="profile-card__stars">★ {totalStars(p.progress)}</span>
            </button>
            <button
              type="button"
              className="icon-button profile-card__edit"
              onClick={() => onEdit(p.id)}
              aria-label={`Change ${p.name}`}
            >
              ✎
            </button>
          </div>
        ))}
        {profiles.length < MAX_PROFILES && (
          <button type="button" className="profile-card profile-card--add" onClick={onAdd}>
            <span className="profile-card__plus">+</span>
            <span className="profile-card__name">New player</span>
          </button>
        )}
      </div>
    </div>
  );
}
