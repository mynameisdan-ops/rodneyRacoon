import { useCallback, useEffect, useState } from 'react';
import { getLevel } from './content/levels';
import { isUnlocked } from './game/progress';
import type { PageEvaluation } from './game/scoring';
import { PageScreen } from './screens/PageScreen';
import { ProfileEditor } from './screens/ProfileEditor';
import { ProfileSelect } from './screens/ProfileSelect';
import { ResultsScreen } from './screens/ResultsScreen';
import { TrailMap } from './screens/TrailMap';
import { useActiveProfile, useGame } from './state/store';
import { Stage } from './ui/Stage';

type Screen =
  | { name: 'profiles' }
  /** `profileId` undefined = creating a new player. */
  | { name: 'editProfile'; profileId?: string }
  | { name: 'map' }
  /** `attempt` remounts the page so a retry gets fresh problems. */
  | { name: 'page'; levelId: number; attempt: number }
  | { name: 'results'; levelId: number; evaluation: PageEvaluation };

export function App() {
  const status = useGame((s) => s.status);
  const init = useGame((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <Stage>
      {status === 'loading' && <div className="splash">Loading…</div>}
      {status === 'blocked' && (
        <div className="splash splash--message">
          This game was saved by a newer version. Please reload or update the app.
        </div>
      )}
      {status === 'ready' && <Game />}
    </Stage>
  );
}

function Game() {
  const profiles = useGame((s) => s.data.profiles);
  const lastProfileId = useGame((s) => s.data.lastProfileId);
  const saveFailed = useGame((s) => s.saveFailed);
  const createProfile = useGame((s) => s.createProfile);
  const updateProfile = useGame((s) => s.updateProfile);
  const deleteProfile = useGame((s) => s.deleteProfile);
  const selectProfile = useGame((s) => s.selectProfile);
  const recordResult = useGame((s) => s.recordResult);
  const profile = useActiveProfile();

  const [screen, setScreen] = useState<Screen>(() =>
    profiles.length === 0 ? { name: 'editProfile' } : { name: 'profiles' },
  );

  const play = useCallback(
    (levelId: number) => setScreen({ name: 'page', levelId, attempt: Date.now() }),
    [],
  );
  const toMap = useCallback(() => setScreen({ name: 'map' }), []);

  const levelId = screen.name === 'page' ? screen.levelId : undefined;
  const finish = useCallback(
    (evaluation: PageEvaluation) => {
      if (levelId === undefined) return;
      recordResult(levelId, evaluation);
      setScreen({ name: 'results', levelId, evaluation });
    },
    [levelId, recordResult],
  );

  // Everything past player selection needs an active player.
  const needsPlayer = screen.name === 'map' || screen.name === 'page' || screen.name === 'results';
  const current: Screen = needsPlayer && !profile ? { name: 'profiles' } : screen;

  switch (current.name) {
    case 'profiles':
      return (
        <ProfileSelect
          profiles={profiles}
          lastProfileId={lastProfileId}
          onSelect={(id) => {
            selectProfile(id);
            toMap();
          }}
          onEdit={(id) => setScreen({ name: 'editProfile', profileId: id })}
          onAdd={() => setScreen({ name: 'editProfile' })}
        />
      );

    case 'editProfile': {
      const editing = profiles.find((p) => p.id === current.profileId);
      const toProfiles = () => setScreen({ name: 'profiles' });
      return (
        <ProfileEditor
          key={current.profileId ?? 'new'}
          profile={editing}
          takenColors={profiles.map((p) => p.color)}
          canCancel={profiles.length > 0}
          onSave={(name, color) => {
            if (editing) {
              updateProfile(editing.id, { name, color });
              toProfiles();
            } else {
              createProfile(name, color);
              toMap();
            }
          }}
          onDelete={
            editing
              ? () => {
                  deleteProfile(editing.id);
                  setScreen(profiles.length > 1 ? { name: 'profiles' } : { name: 'editProfile' });
                }
              : undefined
          }
          onCancel={toProfiles}
        />
      );
    }

    case 'map':
      return (
        <TrailMap
          profile={profile!}
          saveFailed={saveFailed}
          onPlay={play}
          onSwitchPlayer={() => setScreen({ name: 'profiles' })}
        />
      );

    case 'page': {
      const level = getLevel(current.levelId);
      if (!level) return null;
      return (
        <PageScreen
          key={current.attempt}
          level={level}
          heroColor={profile!.color}
          onFinish={finish}
          onQuit={toMap}
        />
      );
    }

    case 'results': {
      const level = getLevel(current.levelId);
      if (!level) return null;
      const next = getLevel(level.id + 1);
      const nextOpen = next !== undefined && isUnlocked(profile!.progress, next.id);
      return (
        <ResultsScreen
          level={level}
          evaluation={current.evaluation}
          hasNext={nextOpen}
          onNext={() => next && play(next.id)}
          onRetry={() => play(level.id)}
          onMap={toMap}
        />
      );
    }
  }
}
