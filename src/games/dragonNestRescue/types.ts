export type DragonNestObjective = 'FOLLOW THE FLAME TRAIL' | 'FIND THE BABY DRAGON' | "REACH THE DRAGON'S NEST";

export type DragonNestRunState = {
  courage: number;
  flames: number;
  totalFlames: number;
  checkpointId: number;
  checkpoint: { x: number; y: number };
  cluesFound: string[];
  babyDragonFound: boolean;
  complete: boolean;
  objective: DragonNestObjective;
};

export type DragonNestResult = {
  complete: boolean;
  courage: number;
  flames: number;
  totalFlames: number;
};

export type DragonNestHud = Pick<DragonNestRunState, 'courage' | 'flames' | 'totalFlames' | 'objective'> & {
  message: string;
};

export const DRAGON_NEST_EVENTS = {
  ready: 'dragon-nest:ready',
  hud: 'dragon-nest:hud',
  result: 'dragon-nest:result',
  restart: 'dragon-nest:restart',
  direction: 'dragon-nest:direction',
  inspect: 'dragon-nest:inspect',
} as const;
