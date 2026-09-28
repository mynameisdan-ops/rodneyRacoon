import { totalStars } from '../game/progress';
import type { Profile } from '../state/schema';
import { PlaceholderHero } from '../ui/PlaceholderHero';

interface Props {
  profiles: Profile[];
  lastProfileId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onAdd: () => void;
}

export const MAX_PROFILES = 6;

export function ProfileSelect({ profiles, lastProfileId, onSelect, onEdit, onAdd }: Props) {
  return (
    <div className="profiles">
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
              <PlaceholderHero color={p.color} size={150} />
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
