import { useCallback, useEffect, useState } from 'react';
import { avatarForProfile } from './art/hero/avatar';
import { getCutScene } from './content/cutscenes';
import { getLevel } from './content/levels';
import { planPage, type Answer, type PagePlan } from './game/adaptive';
import { isUnlocked } from './game/progress';
import { createRng, randomSeed } from './game/rng';
import type { PageEvaluation } from './game/scoring';
import { CutSceneScreen } from './screens/CutSceneScreen';
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
  | { name: 'page'; levelId: number; attempt: number; plan: PagePlan }
  | { name: 'results'; levelId: number; evaluation: PageEvaluation }
  | { name: 'scene'; levelId: number };

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
    (levelId: number) => {
      const level = getLevel(levelId);
      if (!level || !profile) return;
      // The plan is fixed when the page starts, from the player's current ratings.
      const plan = planPage(level, profile, createRng(randomSeed()));
      setScreen({ name: 'page', levelId, attempt: Date.now(), plan });
    },
    [profile],
  );
  const toMap = useCallback(() => setScreen({ name: 'map' }), []);

  const levelId = screen.name === 'page' ? screen.levelId : undefined;
  const finish = useCallback(
    (evaluation: PageEvaluation, answers: Answer[]) => {
      const level = levelId === undefined ? undefined : getLevel(levelId);
      if (!level) return;
      recordResult(level, evaluation, answers);
      setScreen({ name: 'results', levelId: level.id, evaluation });
    },
    [levelId, recordResult],
  );

  // Everything past player selection needs an active player.
  const needsPlayer =
    screen.name === 'map' ||
    screen.name === 'page' ||
    screen.name === 'results' ||
    screen.name === 'scene';
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
          onSave={(name, color, autoSubmit, age) => {
            if (editing) {
              updateProfile(editing.id, { name, color, autoSubmit, age });
              toProfiles();
            } else {
              createProfile(name, color, autoSubmit, age);
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
          avatar={avatarForProfile(profile!)}
          autoSubmit={profile!.autoSubmit}
          plan={current.plan}
          onFinish={finish}
          onQuit={toMap}
        />
      );
    }

    case 'results': {
      const level = getLevel(current.levelId);
      if (!level) return null;
      const hasScene = getCutScene(level.id) !== undefined;
      return (
        <ResultsScreen
          level={level}
          avatar={avatarForProfile(profile!)}
          evaluation={current.evaluation}
          onContinue={() => (hasScene ? setScreen({ name: 'scene', levelId: level.id }) : toMap())}
          onRetry={() => play(level.id)}
          onMap={toMap}
        />
      );
    }

    case 'scene': {
      const level = getLevel(current.levelId);
      const scene = getCutScene(current.levelId);
      if (!level || !scene) return null;
      const next = getLevel(level.id + 1);
      const nextOpen = next !== undefined && isUnlocked(profile!.progress, next.id);
      return (
        <CutSceneScreen
          level={level}
          scene={scene}
          avatar={avatarForProfile(profile!)}
          hasNext={nextOpen}
          onNext={() => next && play(next.id)}
          onMap={toMap}
        />
      );
    }
  }
}
