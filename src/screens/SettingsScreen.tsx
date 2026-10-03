import { useEffect, useState, type ReactNode } from 'react';
import { useMusic } from '../audio/hooks';
import { LEVELS } from '../content/levels';
import { AGES, SKILL_LABEL } from '../content/skills';
import { CONFIG } from '../game/config';
import { isPassed, totalStars } from '../game/progress';
import { overall, skillRows, weakestFacts } from '../game/stats';
import { install, useInstallState } from '../pwa';
import type { AudioSettings, Profile, VolumeLevel } from '../state/schema';
import type { ProfileFields } from '../state/store';
import { SpeakerIcon } from '../ui/icons';
import { Stars } from '../ui/Stars';

/**
 * Settings (PLAN §7), for the parent and not locked: this device's sound, each player's
 * settings and progress (answers by fact family, the facts to practise, recent pages), and
 * installing the app. Reading isn't needed to play, but this screen is for grown-ups.
 */

type Tab = { kind: 'sound' } | { kind: 'player'; id: string } | { kind: 'app' };

interface Props {
  profiles: Profile[];
  audio: AudioSettings;
  /** Open on this player's page. */
  initialPlayer?: string;
  onAudio: (patch: Partial<AudioSettings>) => void;
  onUpdate: (id: string, patch: Partial<ProfileFields>) => void;
  /** Change a player's name and color (the player editor). */
  onEditLook: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function SettingsScreen({
  profiles,
  audio,
  initialPlayer,
  onAudio,
  onUpdate,
  onEditLook,
  onReset,
  onDelete,
  onBack,
}: Props) {
  useMusic('title');
  const [tab, setTab] = useState<Tab>(() =>
    initialPlayer && profiles.some((p) => p.id === initialPlayer)
      ? { kind: 'player', id: initialPlayer }
      : { kind: 'sound' },
  );
  const player = tab.kind === 'player' ? profiles.find((p) => p.id === tab.id) : undefined;
  const on = (t: Tab) =>
    t.kind === tab.kind && (t.kind !== 'player' || (tab.kind === 'player' && t.id === tab.id));

  return (
    <div className="settings">
      <div className="settings__hud">
        <button type="button" className="icon-button" aria-label="Back" onClick={onBack}>
          ◀
        </button>
        <h1 className="settings__title">Settings</h1>
      </div>
      <div className="settings__body">
        <nav className="settings__tabs" aria-label="Settings">
          <TabButton on={on({ kind: 'sound' })} onClick={() => setTab({ kind: 'sound' })}>
            <SpeakerIcon size={34} on={!audio.muted && (audio.sound > 0 || audio.music > 0)} />
            Sound
          </TabButton>
          {profiles.map((p) => (
            <TabButton
              key={p.id}
              on={on({ kind: 'player', id: p.id })}
              onClick={() => setTab({ kind: 'player', id: p.id })}
            >
              <span className="player-chip__dot" style={{ background: p.color }} />
              {p.name}
            </TabButton>
          ))}
          <TabButton on={on({ kind: 'app' })} onClick={() => setTab({ kind: 'app' })}>
            <span className="settings__tab-icon">⬇</span>
            The app
          </TabButton>
        </nav>
        <div className="settings__panel">
          {tab.kind === 'sound' && <SoundPanel audio={audio} onAudio={onAudio} />}
          {player && (
            <PlayerPanel
              key={player.id}
              player={player}
              onUpdate={(patch) => onUpdate(player.id, patch)}
              onEditLook={() => onEditLook(player.id)}
              onReset={() => onReset(player.id)}
              onDelete={() => {
                onDelete(player.id);
                setTab({ kind: 'sound' });
              }}
            />
          )}
          {tab.kind === 'app' && <AppPanel />}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={on ? 'settings__tab settings__tab--on' : 'settings__tab'}
      aria-current={on}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** A row of big radio buttons with a label in front. */
function Choices<T extends string | number | boolean | null>({
  label,
  value,
  options,
  onPick,
}: {
  label: string;
  value: T;
  options: { value: T; text: string }[];
  onPick: (value: T) => void;
}) {
  return (
    <div className="settings__row">
      <div className="settings__label">{label}</div>
      <div className="settings__choices" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            className={value === o.value ? 'choice choice--on' : 'choice'}
            onClick={() => onPick(o.value)}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

const VOLUMES: { value: VolumeLevel; text: string }[] = [
  { value: 0, text: 'Off' },
  { value: 1, text: 'Low' },
  { value: 2, text: 'Medium' },
  { value: 3, text: 'High' },
];

function SoundPanel({
  audio,
  onAudio,
}: {
  audio: AudioSettings;
  onAudio: (patch: Partial<AudioSettings>) => void;
}) {
  return (
    <div className="settings__section">
      <h2>Sound on this device</h2>
      {/* Picking a volume also turns the map's mute off, so the change can be heard. */}
      <Choices
        label="Sound effects"
        value={audio.muted ? null : audio.sound}
        options={VOLUMES}
        onPick={(sound) => sound !== null && onAudio({ sound, muted: false })}
      />
      <Choices
        label="Music"
        value={audio.muted ? null : audio.music}
        options={VOLUMES}
        onPick={(music) => music !== null && onAudio({ music, muted: false })}
      />
      {audio.muted && (
        <div className="settings__row">
          <div className="settings__label">Muted</div>
          <div className="settings__choices">
            <span className="settings__value settings__value--small">
              The speaker button on the map turned the sound off.
            </span>
            <button type="button" className="choice" onClick={() => onAudio({ muted: false })}>
              Turn it back on
            </button>
          </div>
        </div>
      )}
      <p className="settings__note">
        The speaker button on the map turns all sound off and on without changing these.
      </p>
    </div>
  );
}

const HARDEST_TEXT = ['Easy', 'Medium', 'Hard', 'No limit'];

function PlayerPanel({
  player,
  onUpdate,
  onEditLook,
  onReset,
  onDelete,
}: {
  player: Profile;
  onUpdate: (patch: Partial<ProfileFields>) => void;
  onEditLook: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const [view, setView] = useState<'settings' | 'progress'>('settings');
  const [confirm, setConfirm] = useState<'reset' | 'delete' | null>(null);

  if (confirm) {
    const reset = confirm === 'reset';
    return (
      <div className="settings__section settings__confirm">
        <h2>{reset ? `Start ${player.name}'s journey over?` : `Delete ${player.name}?`}</h2>
        <p className="settings__note">
          {reset
            ? 'Levels, stars, stickers, difficulty and stats start again from the beginning. Coins, gear and settings are kept.'
            : `All of ${player.name}'s stars, stickers, coins and progress will be gone.`}
        </p>
        <div className="settings__actions">
          <button
            type="button"
            className="big-button big-button--quiet"
            onClick={() => setConfirm(null)}
          >
            Keep
          </button>
          <button
            type="button"
            className="big-button big-button--danger"
            onClick={() => {
              setConfirm(null);
              if (reset) onReset();
              else onDelete();
            }}
          >
            {reset ? 'Start over' : 'Delete'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings__section">
      <div className="settings__views" role="tablist">
        {(['settings', 'progress'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            className={view === v ? 'settings__view settings__view--on' : 'settings__view'}
            onClick={() => setView(v)}
          >
            {v === 'settings' ? 'Settings' : 'Progress'}
          </button>
        ))}
        <div className="settings__player-actions">
          <button type="button" className="choice" onClick={onEditLook}>
            Name &amp; color
          </button>
          <button type="button" className="choice" onClick={() => setConfirm('reset')}>
            Start over
          </button>
          <button
            type="button"
            className="choice settings__delete"
            onClick={() => setConfirm('delete')}
          >
            Delete
          </button>
        </div>
      </div>
      {view === 'settings' ? (
        <>
          <Choices
            label="Age"
            value={player.age}
            options={AGES.map((a, i) => ({
              value: a,
              text: i === AGES.length - 1 ? `${a}+` : `${a}`,
            }))}
            onPick={(age) => onUpdate({ age })}
          />
          <Choices
            label="Answers"
            value={player.autoSubmit}
            options={[
              { value: false, text: 'Press ✓ to check' },
              { value: true, text: 'Check by themselves' },
            ]}
            onPick={(autoSubmit) => onUpdate({ autoSubmit })}
          />
          <Choices
            label="Levels"
            value={player.unlockAll}
            options={[
              { value: false, text: 'Open one by one' },
              { value: true, text: 'All open' },
            ]}
            onPick={(unlockAll) => onUpdate({ unlockAll })}
          />
          <Choices
            label="Time per page"
            value={player.pageSeconds}
            options={CONFIG.pageChoices.map((s) => ({ value: s, text: `${s} s` }))}
            onPick={(pageSeconds) => onUpdate({ pageSeconds })}
          />
          <Choices
            label="Difficulty"
            value={player.adapts}
            options={[
              { value: true, text: 'Adapts' },
              { value: false, text: 'Stays put' },
            ]}
            onPick={(adapts) => onUpdate({ adapts })}
          />
          <Choices
            label="Hardest"
            value={player.hardest}
            options={CONFIG.adaptive.hardestChoices.map((h, i) => ({
              value: h,
              text: HARDEST_TEXT[i] ?? `${h}`,
            }))}
            onPick={(hardest) => onUpdate({ hardest })}
          />
          <p className="settings__note">
            A new age restarts the difficulty. Difficulty adapts inside each level, never above
            Hardest.
          </p>
        </>
      ) : (
        <ProgressView player={player} />
      )}
    </div>
  );
}

const percent = (v: number) => `${Math.round(v * 100)}%`;
const seconds = (v: number) => `${v.toFixed(1)} s`;

function ProgressView({ player }: { player: Profile }) {
  const rows = skillRows(player.stats);
  const all = overall(player.stats);
  const passed = LEVELS.filter((l) => isPassed(player.progress, l.id)).length;
  const pages = Object.values(player.progress).reduce((n, p) => n + p.plays, 0);
  const weak = weakestFacts(player.weakFacts);
  const recent = player.stats.recent.slice(0, 10);

  return (
    <div className="progress">
      <div className="progress__summary">
        <Stat label="Levels passed" value={`${passed} / ${LEVELS.length}`} />
        <Stat label="Stars" value={`★ ${totalStars(player.progress)}`} />
        <Stat label="Pages played" value={`${pages}`} />
        <Stat label="Right" value={all.answered ? percent(all.right) : '–'} />
        <Stat label="Per answer" value={all.answered ? seconds(all.seconds) : '–'} />
      </div>
      {all.answered === 0 && (
        <p className="settings__note">
          Stats start with the next page {player.name} plays (pages played before this update count
          in levels and stars only).
        </p>
      )}
      <div className="progress__columns">
        <div>
          <h3>By fact family</h3>
          {rows.length > 0 ? (
            <table className="progress__table">
              <thead>
                <tr>
                  <th>Facts</th>
                  <th>Answered</th>
                  <th>Right</th>
                  <th>1st try</th>
                  <th>Per answer</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.skill}>
                    <td>{SKILL_LABEL[r.skill]}</td>
                    <td>{r.answered}</td>
                    <td>
                      <span className="progress__bar" style={{ width: `${r.right * 64}px` }} />
                      {percent(r.right)}
                    </td>
                    <td>{percent(r.firstTry)}</td>
                    <td>{seconds(r.seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="settings__note">Nothing yet.</p>
          )}
        </div>
        <div>
          <h3>Facts to practise (times missed)</h3>
          {weak.length > 0 ? (
            <ul className="progress__facts">
              {weak.map((w) => (
                <li key={w.problem.key}>
                  <span className="progress__fact">
                    {w.problem.a} {w.problem.op} {w.problem.b} = {w.problem.result}
                  </span>
                  <span className="progress__misses">{w.misses}×</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="settings__note">None right now.</p>
          )}
          <h3>Recent pages</h3>
          {recent.length > 0 ? (
            <table className="progress__table progress__table--pages">
              <tbody>
                {recent.map((p) => (
                  <tr key={`${p.at}-${p.level}`}>
                    <td>{when(p.at)}</td>
                    <td>Level {p.level}</td>
                    <td>
                      {p.right}/{p.total}
                    </td>
                    <td>{p.passed ? <Stars count={p.stars} size={20} /> : 'retry'}</td>
                    <td>{p.seconds} s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="settings__note">None yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="progress__stat">
      <div className="progress__value">{value}</div>
      <div className="progress__label">{label}</div>
    </div>
  );
}

function when(at: number): string {
  const d = new Date(at);
  const day = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${day}, ${time}`;
}

function AppPanel() {
  const installState = useInstallState();
  const [kept, setKept] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    void navigator.storage?.persisted?.().then((p) => live && setKept(p));
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="settings__section">
      <h2>The app</h2>
      <div className="settings__row">
        <div className="settings__label">Install</div>
        {installState === 'installed' ? (
          <div className="settings__value">Installed ✓</div>
        ) : installState === 'ready' ? (
          <button type="button" className="big-button" onClick={() => void install()}>
            Install the game
          </button>
        ) : (
          <div className="settings__value settings__value--small">
            In Chrome or Edge, open the browser menu and choose “Install” (on an Android tablet:
            “Add to Home screen”).
          </div>
        )}
      </div>
      <p className="settings__note">
        Once installed it works with no internet. Everything stays on this device: no accounts, no
        ads, no tracking.
        {kept === true && ' The browser has agreed to keep the progress safe.'}
        {kept === false &&
          ' Clearing this browser’s site data would erase the progress, so leave it be.'}
      </p>
      <p className="settings__note">Version of {__BUILD_DATE__}.</p>
    </div>
  );
}
