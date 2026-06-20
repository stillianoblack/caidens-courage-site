import { CHARACTER_COMIC_ICONS, CHARACTER_HOTSPOT_IMAGES } from '../design-system/kids-adventure/characterThemes';

export const COURAGE_IN_THE_DARK_BG = '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp';

export type CourageMapHotspotId = 'caiden' | 'miranda' | 'zeke' | 'charlie' | 'b4';
export type CourageMapHotspotColor = 'gold' | 'purple' | 'green' | 'orange' | 'blue';

export type CourageInTheDarkMission = {
  id: CourageMapHotspotId;
  characterName: string;
  label: string;
  token: string;
  thumbnail: string;
  color: CourageMapHotspotColor;
  accentClass: string;
  /** Center point on the map (%). Adjust x/y to nudge placement. */
  position: { x: number; y: number };
  size: { width: number; height: number };
  description: string;
  rewardText: string;
  targetGameSlug: string;
  /** When set, bypasses slug routing and opens this href directly. */
  directHref?: string;
  locked?: boolean;
};

/** Alias for map hotspot consumers — same shape as mission records. */
export type CourageMapHotspot = CourageInTheDarkMission;

/**
 * Single source of truth for Week 1 Courage in the Dark adventures.
 * Used by the adventure map hotspots and the mission list view.
 */
export const courageInTheDarkMissions: CourageInTheDarkMission[] = [
  {
    id: 'caiden',
    characterName: 'Caiden',
    label: 'Courage by the Bridge',
    token: CHARACTER_HOTSPOT_IMAGES.caiden,
    thumbnail: CHARACTER_COMIC_ICONS.caiden,
    color: 'gold',
    accentClass: 'from-yellow-300 to-blue-500',
    position: { x: 36, y: 29.5 },
    size: { width: 17, height: 25 },
    description: 'Help Caiden step into the cave and choose courage when the dark feels big.',
    rewardText: '+25 Focus Coins • Cave Explorer Badge',
    targetGameSlug: 'caiden-courage-in-the-dark',
    locked: false,
  },
  {
    id: 'miranda',
    characterName: 'Miranda',
    label: "Miranda's Mystery",
    token: CHARACTER_HOTSPOT_IMAGES.miranda,
    thumbnail: CHARACTER_COMIC_ICONS.miranda,
    color: 'purple',
    accentClass: 'from-purple-400 to-fuchsia-500',
    position: { x: 17, y: 51.5 },
    size: { width: 17, height: 25 },
    description: 'Help Miranda investigate the clues and notice what her body is trying to say.',
    rewardText: '+25 Focus Coins • Mystery Solver Badge',
    targetGameSlug: 'miranda-mystery',
    locked: false,
  },
  {
    id: 'zeke',
    characterName: 'Zeke',
    label: "Zeke's Cave Challenge",
    token: CHARACTER_HOTSPOT_IMAGES.zeke,
    thumbnail: CHARACTER_COMIC_ICONS.zeke,
    color: 'orange',
    accentClass: 'from-orange-300 to-amber-600',
    position: { x: 65, y: 45.5 },
    size: { width: 18, height: 26 },
    description: 'Help Zeke cross the bridge by slowing down, thinking clearly, and trying again.',
    rewardText: '+25 Focus Coins • Brave Bridge Badge',
    targetGameSlug: 'zeke-bridge-challenge',
    locked: false,
  },
  {
    id: 'charlie',
    characterName: 'Charlie Perk',
    label: "Charlie's Discovery Zone",
    token: CHARACTER_HOTSPOT_IMAGES.charlie,
    thumbnail: CHARACTER_COMIC_ICONS.charlie,
    color: 'green',
    accentClass: 'from-emerald-300 to-green-600',
    position: { x: 84, y: 62.5 },
    size: { width: 17, height: 25 },
    description: 'Explore the rainforest with Charlie Perk and discover funny nature clues.',
    rewardText: '+25 Focus Coins • Nature Explorer Badge',
    targetGameSlug: 'charlie-discovery-zone',
    locked: false,
  },
  {
    id: 'b4',
    characterName: 'B-4',
    label: 'B-4 Check-In Station',
    token: CHARACTER_HOTSPOT_IMAGES.b4,
    thumbnail: CHARACTER_COMIC_ICONS.b4,
    color: 'blue',
    accentClass: 'from-sky-300 to-blue-600',
    position: { x: 50, y: 59.5 },
    size: { width: 16, height: 24 },
    description: 'Check in with B-4, name your feeling, and power up your Focus Flame.',
    rewardText: '+10 Focus Coins • Daily Check-In Spark',
    targetGameSlug: 'b4-self-check-in',
    locked: false,
  },
];

/** @deprecated Use courageInTheDarkMissions — kept for existing map imports. */
export const courageMapHotspots = courageInTheDarkMissions;
