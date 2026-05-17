export const FOCUS_POINT_AWARDS = {
  tinyBeat: 10,
  feeling: 10,
  body: 10,
  move: 20,
  practice: 10,
  reasoning: 10,
} as const;

/** One-time award when the child steadies the flame in the scene moment (same total as former 3-tap beat). */
export const FLAME_STEADY_POINT_AWARD = FOCUS_POINT_AWARDS.tinyBeat;

/** @deprecated Former per-tap awards (3 + 3 + 4 = 10); use FLAME_STEADY_POINT_AWARD. */
export const FLAME_TAP_POINT_AWARDS = [3, 3, 4] as const;

/** Points earned in one full adventure (beat + all three steps). */
export const ADVENTURE_FOCUS_POINTS =
  FOCUS_POINT_AWARDS.tinyBeat +
  FOCUS_POINT_AWARDS.feeling +
  FOCUS_POINT_AWARDS.reasoning +
  FOCUS_POINT_AWARDS.body +
  FOCUS_POINT_AWARDS.reasoning +
  FOCUS_POINT_AWARDS.move +
  FOCUS_POINT_AWARDS.reasoning +
  FOCUS_POINT_AWARDS.practice;

export function focusFlameRankLabel(points: number): string {
  if (points >= 60) return 'Focus Flame Guide';
  if (points >= 40) return 'Brave Helper';
  if (points >= 20) return 'Body Listener';
  if (points >= 10) return 'Feeling Finder';
  return 'Spark Starter';
}
