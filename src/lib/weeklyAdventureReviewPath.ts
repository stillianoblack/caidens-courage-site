import { familyPortalPath } from './familyPortalPaths';
import {
  WEEKLY_VIEW_MISSIONS_VALUE,
  WEEKLY_VIEW_PARAM,
  WEEKLY_WEEK_PARAM,
  weeklyAdventureWeekAnchor,
} from './weeklyAdventureRouteContext';

export function resolveWeeklyAdventureReviewHref(
  pathname: string,
  weekNumber: number,
  participantId?: string | null,
): string {
  const base = familyPortalPath('continue-learning', pathname);
  const params = new URLSearchParams();
  params.set(WEEKLY_VIEW_PARAM, WEEKLY_VIEW_MISSIONS_VALUE);
  params.set(WEEKLY_WEEK_PARAM, String(weekNumber));
  if (participantId?.trim()) {
    params.set('participant', participantId.trim());
  }
  return `${base}?${params.toString()}#${weeklyAdventureWeekAnchor(weekNumber)}`;
}
