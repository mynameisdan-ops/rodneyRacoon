import { useState } from 'react';
import { useMusic } from '../audio/hooks';
import { PROFILE_COLORS } from '../content/profiles';
import { AGES, DEFAULT_AGE } from '../content/skills';
import { MAX_NAME_LENGTH, type Profile } from '../state/schema';
import { cleanName, type ProfileFields } from '../state/store';
import { avatarForProfile } from '../art/hero/avatar';
import { Hero } from '../art/hero/Hero';

interface Props {
  /** Undefined when creating a new player. */
  profile?: Profile;
  /** Colors already used by other players, so a new player gets a different default. */
  takenColors: string[];
  /** Hide Cancel when this is the very first player. */
  canCancel: boolean;
  onSave: (fields: ProfileFields) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function ProfileEditor({
  profile,
  takenColors,
  canCancel,
  onSave,
  onDelete,
  onCancel,
}: Props) {
  const [name, setName] = useState(profile?.name ?? '');
  const [color, setColor] = useState<string>(
    () =>
      profile?.color ??
      (PROFILE_COLORS.find((c) => !takenColors.includes(c.value)) ?? PROFILE_COLORS[0]).value,
  );
  const [autoSubmit, setAutoSubmit] = useState(profile?.autoSubmit ?? false);
  // New players start at a middle age; players saved before ages existed show none picked.
  const [age, setAge] = useState<number | null>(profile ? profile.age : DEFAULT_AGE);
  const [unlockAll, setUnlockAll] = useState(profile?.unlockAll ?? false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  useMusic('title');
  const valid = cleanName(name).length > 0;

  if (confirmingDelete && profile && onDelete) {
    return (
      <div className="editor editor--confirm">
        <h1>Delete {profile.name}?</h1>
        <p className="editor__warning">All of {profile.name}'s stars and progress will be gone.</p>
        <div className="editor__actions">
          <button
            type="button"
            className="big-button big-button--quiet"
            onClick={() => setConfirmingDelete(false)}
          >
            Keep
          </button>
          <button type="button" className="big-button big-button--danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave({ name, color, autoSubmit, age, unlockAll });
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
          {/* For the parent: whether answers wait for ✓ / Enter or are checked as soon as they're typed. */}
          <div className="editor__label editor__label--gap">Answers</div>
          <div className="editor__submit" role="radiogroup" aria-label="Answers">
            {[
              { auto: false, icon: '✓', text: 'Press to check' },
              { auto: true, icon: '⚡', text: 'Automatic' },
            ].map((o) => (
              <button
                key={o.text}
                type="button"
                role="radio"
                aria-checked={autoSubmit === o.auto}
                className={autoSubmit === o.auto ? 'choice choice--on' : 'choice'}
                onClick={() => setAutoSubmit(o.auto)}
              >
                <span className="choice__icon">{o.icon}</span>
                {o.text}
              </button>
            ))}
          </div>
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
          {/* For the parent: open every level, e.g. to jump ahead to the right difficulty. */}
          <div className="editor__label editor__label--gap">Levels</div>
          <div className="editor__submit" role="radiogroup" aria-label="Levels">
            {[
              { all: false, icon: '🔒', text: 'One by one' },
              { all: true, icon: '🔓', text: 'All open' },
            ].map((o) => (
              <button
                key={o.text}
                type="button"
                role="radio"
                aria-checked={unlockAll === o.all}
                className={unlockAll === o.all ? 'choice choice--on' : 'choice'}
                onClick={() => setUnlockAll(o.all)}
              >
                <span className="choice__icon">{o.icon}</span>
                {o.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="editor__actions">
        {profile && onDelete && (
          <button
            type="button"
            className="big-button big-button--quiet editor__delete"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </button>
        )}
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
