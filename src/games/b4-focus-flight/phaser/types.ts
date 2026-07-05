export type FlameType = 'spark' | 'anchor' | 'ember' | 'guardian';
export type FlameRarity = 'common' | 'medium' | 'rare' | 'future';

export type FlameCounts = Record<FlameType, number>;

export interface B4FocusFlightHudState {
  score: number;
  hearts: number;
  timeLeft: number;
  combo: number;
  levelName: string;
  objectiveText: string;
  sparkCollected: number;
  sparkGoal: number;
  muted: boolean;
  paused: boolean;
}

export interface B4FocusFlightResult {
  score: number;
  flames: FlameCounts;
  bestCombo: number;
  stars: number;
  completed: boolean;
  levelName: string;
  objectiveText: string;
  sparkCollected: number;
  sparkGoal: number;
  objectiveComplete: boolean;
  timedOut: boolean;
  missionText: string;
}

export interface FlameDefinition {
  id: FlameType;
  label: string;
  texture: string;
  score: number;
  rarity: FlameRarity;
  glowColor: number;
  particleColor: number;
  spawnWeight: number;
}

export const emptyFlameCounts = (): FlameCounts => ({
  spark: 0,
  anchor: 0,
  ember: 0,
  guardian: 0,
});

export const B4_FOCUS_FLIGHT_EVENTS = {
  hud: 'b4-focus-flight:hud',
  result: 'b4-focus-flight:result',
  restart: 'b4-focus-flight:restart',
  pauseToggle: 'b4-focus-flight:pause-toggle',
  muteToggle: 'b4-focus-flight:mute-toggle',
} as const;
