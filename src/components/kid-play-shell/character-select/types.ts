import type { CharacterThemeId } from '../../../design-system/kids-adventure/characterThemes';

export type CharacterRosterEntry = {
  id: string;
  name: string;
  imageSrc: string | null;
  themeId?: CharacterThemeId | null;
  locked?: boolean;
  complete?: boolean;
};

export type CharacterSelectProfileData = {
  id: string;
  name: string;
  tagline: string;
  imageSrc: string | null;
  theme: string;
  themeId?: CharacterThemeId | null;
  focusSkills: string[];
  traits: string[];
  missionsCompleted: string;
  discoveriesUnlocked: string;
  nextReward?: string | null;
};

export type CharacterStatField = {
  label: string;
  value: string;
};
