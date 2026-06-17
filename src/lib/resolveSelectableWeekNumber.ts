import type { AdventureTrailWeekView } from '../types/adventureTrail';
import type { AdventureVisibilityContext } from './adventureVisibility';

export function resolveSelectableWeekNumber(
  weekNumber: number | null | undefined,
  trailWeeks: AdventureTrailWeekView[],
  visibilityCtx: AdventureVisibilityContext,
): number | null {
  if (!weekNumber || weekNumber <= 0) return null;
  const match = trailWeeks.find((row) => row.week === weekNumber);
  if (!match) return null;
  if (visibilityCtx.previewMode === 'admin') return weekNumber;
  return match.weekStatus === 'available' ? weekNumber : null;
}
