import type { DragonNestRunState } from './types';

export const TOTAL_FOCUS_FLAMES = 12;
export const STARTING_COURAGE = 3;

export const createDragonNestRunState = (): DragonNestRunState => ({
  courage: STARTING_COURAGE,
  flames: 0,
  totalFlames: TOTAL_FOCUS_FLAMES,
  checkpointId: 0,
  checkpoint: { x: 190, y: 800 },
  cluesFound: [],
  babyDragonFound: false,
  complete: false,
  objective: 'FOLLOW THE FLAME TRAIL',
});

export const collectFocusFlame = (state: DragonNestRunState): DragonNestRunState => ({
  ...state,
  flames: Math.min(state.totalFlames, state.flames + 1),
  objective: state.flames + 1 >= 4 && !state.babyDragonFound ? 'FIND THE BABY DRAGON' : state.objective,
});

export const loseCourage = (state: DragonNestRunState): DragonNestRunState => ({
  ...state,
  courage: Math.max(0, state.courage - 1),
});

export const activateCheckpoint = (
  state: DragonNestRunState,
  id: number,
  checkpoint: { x: number; y: number },
): DragonNestRunState => id <= state.checkpointId ? state : ({
  ...state,
  checkpointId: id,
  checkpoint,
  courage: Math.min(STARTING_COURAGE, state.courage + 1),
});

export const recordClue = (state: DragonNestRunState, clueId: string): DragonNestRunState => (
  state.cluesFound.includes(clueId) ? state : { ...state, cluesFound: [...state.cluesFound, clueId] }
);

export const findBabyDragon = (state: DragonNestRunState): DragonNestRunState => ({
  ...state,
  babyDragonFound: true,
  objective: "REACH THE DRAGON'S NEST",
});

export const completeDragonNest = (state: DragonNestRunState): DragonNestRunState => (
  state.babyDragonFound ? { ...state, complete: true } : state
);
