export const COURAGE_IN_THE_DARK_BG = '/images/caidenscourage/Game-Hub/courage-in-the-dark.webp';
const CHARACTER_ASSET_DIR = '/images/caidenscourage/Game-Hub/characters';

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
    label: 'Courage in the Cave',
    token: `${CHARACTER_ASSET_DIR}/caiden-hotspot.webp`,
    thumbnail: `${CHARACTER_ASSET_DIR}/caiden-hotspot.webp`,
    color: 'gold',
    accentClass: 'from-yellow-300 to-blue-500',
    position: { x: 67, y: 48 },
    size: { width: 18, height: 26 },
    description: 'Help Caiden step into the cave and choose courage when the dark feels big.',
    rewardText: '+25 Focus Coins • Cave Explorer Badge',
    targetGameSlug: 'caiden-courage-in-the-dark',
    locked: false,
  },
  {
    id: 'miranda',
    characterName: 'Miranda',
    label: "Miranda's Mystery",
    token: `${CHARACTER_ASSET_DIR}/miranda-hotspot.webp`,
    thumbnail: `${CHARACTER_ASSET_DIR}/miranda-hotspot.webp`,
    color: 'purple',
    accentClass: 'from-purple-400 to-fuchsia-500',
    position: { x: 17, y: 54 },
    size: { width: 17, height: 25 },
    description: 'Help Miranda investigate the clues and notice what her body is trying to say.',
    rewardText: '+25 Focus Coins • Mystery Solver Badge',
    targetGameSlug: 'miranda-mystery',
    locked: false,
  },
  {
    id: 'zeke',
    characterName: 'Zeke',
    label: "Zeke's Bridge Challenge",
    token: `${CHARACTER_ASSET_DIR}/zeke-hotspot.webp`,
    thumbnail: `${CHARACTER_ASSET_DIR}/zeke-hotspot.webp`,
    color: 'green',
    accentClass: 'from-emerald-300 to-green-600',
    position: { x: 36, y: 32 },
    size: { width: 17, height: 25 },
    description: 'Help Zeke cross the bridge by slowing down, thinking clearly, and trying again.',
    rewardText: '+25 Focus Coins • Brave Bridge Badge',
    targetGameSlug: 'zeke-bridge-challenge',
    locked: false,
  },
  {
    id: 'charlie',
    characterName: 'Charlie Perk',
    label: "Charlie's Discovery Zone",
    token: `${CHARACTER_ASSET_DIR}/charlie-hotspot.webp`,
    thumbnail: `${CHARACTER_ASSET_DIR}/charlie-hotspot.webp`,
    color: 'orange',
    accentClass: 'from-orange-300 to-amber-600',
    position: { x: 79, y: 65 },
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
    token: `${CHARACTER_ASSET_DIR}/b4-hotspot.webp`,
    thumbnail: `${CHARACTER_ASSET_DIR}/b4-hotspot.webp`,
    color: 'blue',
    accentClass: 'from-sky-300 to-blue-600',
    position: { x: 50, y: 62 },
    size: { width: 16, height: 24 },
    description: 'Check in with B-4, name your feeling, and power up your Focus Flame.',
    rewardText: '+10 Focus Coins • Daily Check-In Spark',
    targetGameSlug: 'b4-self-check-in',
    locked: false,
  },
];

/** @deprecated Use courageInTheDarkMissions — kept for existing map imports. */
export const courageMapHotspots = courageInTheDarkMissions;
