import type { FlameRunState } from './state';

export type FlameRunHud = FlameRunState & { focusMode: boolean; message: string; progress: number; zone: string };
export type FlameRunResult = Pick<FlameRunState, 'score' | 'distance' | 'flames' | 'bestStreak'> & { bestScore: number };

export const FLAME_RUN_EVENTS = {
  ready: 'flame-run:ready',
  hud: 'flame-run:hud',
  result: 'flame-run:result',
  start: 'flame-run:start',
  jump: 'flame-run:jump',
  slide: 'flame-run:slide',
  pause: 'flame-run:pause',
  resume: 'flame-run:resume',
  pauseState: 'flame-run:pause-state',
  restart: 'flame-run:restart',
} as const;
