import { useCallback, useEffect, useState } from 'react';
import { avatarForProfile } from './art/hero/avatar';
import { installAudio, setAudioSettings } from './audio/engine';
import { getCutScene } from './content/cutscenes';
import { getLevel } from './content/levels';
import { planPage, type Answer, type PagePlan } from './game/adaptive';
import { isUnlocked } from './game/progress';
import { createRng, randomSeed } from './game/rng';
import type { CoinReward } from './game/rewards';
import type { PageEvaluation } from './game/scoring';
import { CutSceneScreen } from './screens/CutSceneScreen';
import { PageScreen } from './screens/PageScreen';
import { ProfileEditor } from './screens/ProfileEditor';
import { ProfileSelect } from './screens/ProfileSelect';
import { ResultsScreen } from './screens/ResultsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ShopScreen } from './screens/ShopScreen';
import { StickerBook } from './screens/StickerBook';
import { TrailMap } from './screens/TrailMap';
import { WorldsMap } from './screens/WorldsMap';
import { useActiveProfile, useGame } from './state/store';
import { Stage } from './ui/Stage';

export type Screen =
  | { name: 'profiles' }
  /** `profileId` undefined = creating a new player; `from` = where to go back to. */
  | { name: 'editProfile'; profileId?: string; from?: 'settings' }
  /** The parent's settings, open on a player's page if `playerId` is set. */
  | { name: 'settings'; playerId?: string }
  /** One world's trail; `worldId` undefined = the world the player is up to. */
  | { name: 'map'; worldId?: number }
  /** The overview of all worlds; `from` = the world just finished (the hero walks on from it). */
  | { name: 'worlds'; from?: number }
  /** `attempt` remounts the page so a retry gets fresh problems. */
  | { name: 'page'; levelId: number; attempt: number; plan: PagePlan }
  | {
      name: 'results';
      levelId: number;
      evaluation: PageEvaluation;
      reward: CoinReward;
      /** The page was the level's first pass (its sticker is new). */
      newSticker: boolean;
    }
  | { name: 'scene'; levelId: number }
  /** The shop and the sticker book go back to the trail map of `worldId`. */
  | { name: 'shop'; worldId: number }
  | { name: 'stickers'; worldId: number };

/** Screens that work before a player is picked; every other screen needs one. */
const NO_PLAYER: ReadonlySet<Screen['name']> = new Set(['profiles', 'editProfile', 'settings']);

/** `start` opens a screen other than player selection (the dev-only #demo links use it). */
export function App({ start }: { start?: Screen }) {
  const status = useGame((s) => s.status);
  const init = useGame((s) => s.init);

  const audio = useGame((s) => s.data.audio);

  useEffect(() => {
    void init();
    installAudio();
  }, [init]);
  useEffect(() => setAudioSettings(audio), [audio]);

  return (
    <Stage>
      {status === 'loading' && <div className="splash">Loading…</div>}
      {status === 'blocked' && (
        <div className="splash splash--message">
          This game was saved by a newer version. Please reload or update the app.
        </div>
      )}
      {status === 'ready' && <Game start={start} />}
    </Stage>
  );
}

function Game({ start }: { start?: Screen }) {
  const profiles = useGame((s) => s.data.profiles);
  const lastProfileId = useGame((s) => s.data.lastProfileId);
  const saveFailed = useGame((s) => s.saveFailed);
  const createProfile = useGame((s) => s.createProfile);
  const updateProfile = useGame((s) => s.updateProfile);
  const deleteProfile = useGame((s) => s.deleteProfile);
  const resetProgress = useGame((s) => s.resetProgress);
  const selectProfile = useGame((s) => s.selectProfile);
  const recordResult = useGame((s) => s.recordResult);
  const buyItem = useGame((s) => s.buyItem);
  const toggleItem = useGame((s) => s.toggleItem);
  const audio = useGame((s) => s.data.audio);
  const muted = audio.muted;
  const setAudio = useGame((s) => s.setAudio);
  const profile = useActiveProfile();

  const [screen, setScreen] = useState<Screen>(
    () => start ?? (profiles.length === 0 ? { name: 'editProfile' } : { name: 'profiles' }),
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
      if (!level || !profile) return;
      const newSticker = evaluation.passed && (profile.progress[level.id]?.passes ?? 0) === 0;
      const reward = recordResult(level, evaluation, answers);
      if (!reward) return;
      setScreen({ name: 'results', levelId: level.id, evaluation, reward, newSticker });
    },
    [levelId, profile, recordResult],
  );

  // Everything past player selection needs an active player.
  const current: Screen = !NO_PLAYER.has(screen.name) && !profile ? { name: 'profiles' } : screen;

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
          onSettings={() => setScreen({ name: 'settings' })}
        />
      );

    case 'settings':
      return (
        <SettingsScreen
          profiles={profiles}
          audio={audio}
          initialPlayer={current.playerId}
          onAudio={setAudio}
          onUpdate={updateProfile}
          onEditLook={(id) => setScreen({ name: 'editProfile', profileId: id, from: 'settings' })}
          onReset={resetProgress}
          onDelete={(id) => {
            deleteProfile(id);
            if (profiles.length <= 1) setScreen({ name: 'editProfile' });
          }}
          onBack={() => setScreen({ name: 'profiles' })}
        />
      );

    case 'editProfile': {
      const editing = profiles.find((p) => p.id === current.profileId);
      const back = () =>
        setScreen(
          current.from === 'settings' && editing
            ? { name: 'settings', playerId: editing.id }
            : { name: 'profiles' },
        );
      return (
        <ProfileEditor
          key={current.profileId ?? 'new'}
          profile={editing}
          takenColors={profiles.map((p) => p.color)}
          canCancel={profiles.length > 0}
          onSave={({ name, color, age }) => {
            if (editing) {
              updateProfile(editing.id, { name, color });
              back();
            } else {
              createProfile(name, color, { age: age ?? null });
              toMap();
            }
          }}
          onCancel={back}
        />
      );
    }

    case 'map':
      return (
        <TrailMap
          profile={profile!}
          initialWorld={current.worldId}
          saveFailed={saveFailed}
          muted={muted}
          onToggleSound={() => setAudio({ muted: !muted })}
          onPlay={play}
          onWorlds={() => setScreen({ name: 'worlds' })}
          onShop={(worldId) => setScreen({ name: 'shop', worldId })}
          onStickers={(worldId) => setScreen({ name: 'stickers', worldId })}
          onSwitchPlayer={() => setScreen({ name: 'profiles' })}
        />
      );

    case 'shop':
      return (
        <ShopScreen
          profile={profile!}
          worldId={current.worldId}
          onBuy={buyItem}
          onToggle={toggleItem}
          onBack={() => setScreen({ name: 'map', worldId: current.worldId })}
        />
      );

    case 'stickers':
      return (
        <StickerBook
          profile={profile!}
          initialWorld={current.worldId}
          onBack={() => setScreen({ name: 'map', worldId: current.worldId })}
        />
      );

    case 'worlds':
      return (
        <WorldsMap
          profile={profile!}
          from={current.from}
          onOpenWorld={(worldId) => setScreen({ name: 'map', worldId })}
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
          blocks={profile!.blocks}
          pageSeconds={profile!.pageSeconds}
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
          reward={current.reward}
          newSticker={current.newSticker}
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
      const nextOpen =
        next !== undefined && isUnlocked(profile!.progress, next.id, profile!.unlockAll);
      // After a world's last level, the overview shows the hero walking on to the next world.
      const newWorld = next !== undefined && next.world !== level.world;
      return (
        <CutSceneScreen
          level={level}
          scene={scene}
          avatar={avatarForProfile(profile!)}
          hasNext={nextOpen}
          nextLabel={newWorld ? 'Next world ▶' : 'Next level ▶'}
          onNext={() =>
            newWorld ? setScreen({ name: 'worlds', from: level.world }) : next && play(next.id)
          }
          onMap={() => setScreen({ name: 'map', worldId: level.world })}
        />
      );
    }
  }
}
