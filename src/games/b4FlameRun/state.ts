export type FlameRunState = {
  score: number;
  distance: number;
  flames: number;
  streak: number;
  bestStreak: number;
  multiplier: number;
  courage: number;
  focusModeUntil: number;
};

export const createFlameRunState = (): FlameRunState => ({
  score: 0,
  distance: 0,
  flames: 0,
  streak: 0,
  bestStreak: 0,
  multiplier: 1,
  courage: 3,
  focusModeUntil: 0,
});

export const streakMultiplier = (streak: number): number => (
  streak >= 20 ? 4 : streak >= 10 ? 3 : streak >= 5 ? 2 : 1
);

export const collectFlame = (state: FlameRunState, now: number): FlameRunState => {
  const streak = state.streak + 1;
  const multiplier = streakMultiplier(streak);
  return {
    ...state,
    flames: state.flames + 1,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    multiplier,
    score: state.score + (100 * multiplier),
    focusModeUntil: streak >= 20 ? now + 5000 : state.focusModeUntil,
  };
};

export const addDistance = (state: FlameRunState, meters: number): FlameRunState => ({
  ...state,
  distance: state.distance + meters,
  score: state.score + Math.round(meters * 2),
});

export const loseCourage = (state: FlameRunState): FlameRunState => ({
  ...state,
  courage: Math.max(0, state.courage - 1),
  streak: 0,
  multiplier: 1,
  focusModeUntil: 0,
});

export const isRunOver = (state: FlameRunState): boolean => state.courage === 0;

export const scrollSpeedFor = (elapsedSeconds: number): number => (
  Math.min(660, 355 + Math.floor(elapsedSeconds / 30) * 32)
);
