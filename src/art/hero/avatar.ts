import { HAIR_COLORS, SKIN_TONES, type HairStyle } from '../../content/avatar';
import type { Gear } from '../../content/shop';

export interface AvatarConfig {
  skin: string;
  hairStyle: HairStyle;
  hairColor: string;
  shirt: string;
  pants: string;
  shoes: string;
  /** Shop items worn (hat, cape, pack, pet). */
  gear?: Gear;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKIN_TONES[1].value,
  hairStyle: 'short',
  hairColor: HAIR_COLORS[1].value,
  shirt: '#e63946',
  pants: '#2d4a7a',
  shoes: '#3b2a20',
};

/**
 * Until the avatar builder (M8) stores a full config, a player's shirt color is their avatar,
 * plus whatever they wear from the shop.
 */
export function avatarForProfile(profile: { color: string; gear?: Gear }): AvatarConfig {
  return { ...DEFAULT_AVATAR, shirt: profile.color, gear: profile.gear };
}
