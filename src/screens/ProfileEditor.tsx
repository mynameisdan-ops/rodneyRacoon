import { useState } from 'react';
import { useMusic } from '../audio/hooks';
import { PROFILE_COLORS } from '../content/profiles';
import { AGES, DEFAULT_AGE } from '../content/skills';
import { MAX_NAME_LENGTH, type Profile } from '../state/schema';
import { cleanName, type ProfileFields } from '../state/store';
import { avatarForProfile } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';

/** What the editor sets: name and color, and the age for a new player. */
export type EditorFields = Pick<ProfileFields, 'name' | 'color'> & { age?: number | null };

interface Props {
  /** Undefined when creating a new player. */
  profile?: Profile;
  /** Colors already used by other players, so a new player gets a different default. */
  takenColors: string[];
  /** Hide Cancel when this is the very first player. */
  canCancel: boolean;
  onSave: (fields: EditorFields) => void;
  onCancel: () => void;
}

/**
 * A player's name and color (the kids can change these). A new player also gets an age, which
 * sets where the difficulty starts; the parent's other settings are in Settings.
 */
export function ProfileEditor({ profile, takenColors, canCancel, onSave, onCancel }: Props) {
  const [name, setName] = useState(profile?.name ?? '');
  const [color, setColor] = useState<string>(
    () =>
      profile?.color ??
      (PROFILE_COLORS.find((c) => !takenColors.includes(c.value)) ?? PROFILE_COLORS[0]).value,
  );
  const [age, setAge] = useState<number>(DEFAULT_AGE);
  useMusic('title');
  const valid = cleanName(name).length > 0;

  return (
    <form
      className="editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave(profile ? { name, color } : { name, color, age });
      }}
    >
      {/* Name sits at the top so a tablet's on-screen keyboard doesn't cover it. */}
      <div className="editor__top">
        <h1 className="editor__title">{profile ? 'Change player' : 'New player'}</h1>
        <input
          className="editor__name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Your name"
          aria-label="Name"
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          autoFocus={!profile}
        />
      </div>

      <div className="editor__middle">
        <div className="editor__preview">
          <Hero avatar={avatarForProfile({ color })} pose="cheer" size={280} />
        </div>
        <div>
          <div className="editor__label">Pick a color</div>
          <div className="editor__colors" role="radiogroup" aria-label="Color">
            {PROFILE_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={c.value === color}
                aria-label={c.name}
                className={c.value === color ? 'swatch swatch--on' : 'swatch'}
                style={{ background: c.value }}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>
          {!profile && (
            <>
              {/* For the parent: the age sets where each skill's difficulty starts. */}
              <div className="editor__label editor__label--gap">Age</div>
              <div className="editor__ages" role="radiogroup" aria-label="Age">
                {AGES.map((a, i) => (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={age === a}
                    className={age === a ? 'choice choice--age choice--on' : 'choice choice--age'}
                    onClick={() => setAge(a)}
                  >
                    {i === AGES.length - 1 ? `${a}+` : a}
                  </button>
                ))}
              </div>
              <p className="editor__hint">More settings for grown-ups: ⚙ on the players screen.</p>
            </>
          )}
        </div>
      </div>

      <div className="editor__actions">
        {canCancel && (
          <button type="button" className="big-button big-button--quiet" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="big-button" disabled={!valid}>
          {profile ? 'Save' : "Let's go!"}
        </button>
      </div>
    </form>
  );
}
