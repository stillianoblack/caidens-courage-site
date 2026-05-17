/** Focus Flame move ids (stable for state, scoring, and HUD badges). */
export const FOCUS_FLAME_MOVE_IDS = [
  'Spark Breath',
  'Anchor Step',
  'B-4 Pause',
  'Flame Draw',
  'Brave Choice',
] as const;

export type FocusFlameMove = (typeof FOCUS_FLAME_MOVE_IDS)[number];

export type FocusFlameMoveConfig = {
  id: FocusFlameMove;
  /** Kid-friendly action line after the move name (e.g. “slow breaths”). */
  tagline: string;
  /** Optional helper shown under the choice label on step 4. */
  helper: string;
  /** Compact HUD badge label when a move is selected. */
  hudShort: string;
};

export const FOCUS_FLAME_MOVES: readonly FocusFlameMoveConfig[] = [
  {
    id: 'Spark Breath',
    tagline: 'slow breaths',
    helper: 'Take slow breaths.',
    hudShort: 'Spark',
  },
  {
    id: 'Anchor Step',
    tagline: 'feel your feet',
    helper: 'Feel your feet on the ground.',
    hudShort: 'Anchor',
  },
  {
    id: 'B-4 Pause',
    tagline: 'pause first',
    helper: 'Pause before reacting.',
    hudShort: 'B-4',
  },
  {
    id: 'Flame Draw',
    tagline: 'draw your feelings',
    helper: 'Draw what you feel.',
    hudShort: 'Draw',
  },
  {
    id: 'Brave Choice',
    tagline: 'ask for help',
    helper: 'Ask someone you trust.',
    hudShort: 'Brave',
  },
];

export function focusFlameMoveChoiceLabel(move: FocusFlameMove): string {
  const cfg = FOCUS_FLAME_MOVES.find((m) => m.id === move);
  return cfg ? `${cfg.id} — ${cfg.tagline}` : move;
}

export function focusFlameMoveAriaLabel(move: FocusFlameMove): string {
  return focusFlameMoveChoiceLabel(move);
}

export function focusFlameMoveHudShort(move: FocusFlameMove): string {
  const cfg = FOCUS_FLAME_MOVES.find((m) => m.id === move);
  return cfg?.hudShort ?? 'Brave';
}
