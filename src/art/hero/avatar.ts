import { HAIR_COLORS, SKIN_TONES, type HairStyle } from '../../content/avatar';

export interface AvatarConfig {
  skin: string;
  hairStyle: HairStyle;
  hairColor: string;
  shirt: string;
  pants: string;
  shoes: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKIN_TONES[1].value,
  hairStyle: 'short',
  hairColor: HAIR_COLORS[1].value,
  shirt: '#e63946',
  pants: '#2d4a7a',
  shoes: '#3b2a20',
};

/** Until the avatar builder (M8) stores a full config, a player's shirt color is their avatar. */
export function avatarForProfile(profile: { color: string }): AvatarConfig {
  return { ...DEFAULT_AVATAR, shirt: profile.color };
}
