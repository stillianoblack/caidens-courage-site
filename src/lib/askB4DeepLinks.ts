import { PROGRAM_DASHBOARD_PATH, PROGRAM_BASELINE_CHECK_PATH } from '../config/courageRoutes';
import { familyDownloadsTabPath, familyGoalsPath, familyPortalPath } from './familyPortalPaths';
import type { ActivityCategoryId } from '../data/pilotDashboardContent';
import { programDashboardTabPath } from './programDashboardNav';
import type { RosterFilterId } from './pilotOverviewInsights';

const ACTIVITY_TAB_IDS = new Set<ActivityCategoryId>([
  'coloring-pages',
  'printable-activities',
  'reflection-journals',
  'b4-reset-tools',
  'focus-flame-lab',
  'weekly-activities',
]);

export function isActivityLibraryTab(value: string): value is ActivityCategoryId {
  return ACTIVITY_TAB_IDS.has(value as ActivityCategoryId);
}

export function activitiesLibraryTabPath(tab: ActivityCategoryId): string {
  return `${programDashboardTabPath('activities-library')}?tab=${encodeURIComponent(tab)}`;
}

export function rosterFilterPath(filter: RosterFilterId): string {
  return `${programDashboardTabPath('roster')}?filter=${encodeURIComponent(filter)}`;
}

export function certificatesReadyFilterPath(): string {
  return `${programDashboardTabPath('certificates')}?filter=ready`;
}

export function facilitatorBaselineCheckPath(studentId?: string): string {
  const base = PROGRAM_BASELINE_CHECK_PATH;
  const id = studentId?.trim();
  if (!id) return base;
  return `${base}?studentId=${encodeURIComponent(id)}`;
}

export function resultsNeedsAttentionPath(): string {
  return `${programDashboardTabPath('results')}#needs-attention`;
}

export function studentGalleryPendingPath(): string {
  return `${programDashboardTabPath('student-gallery')}?tab=pending-review`;
}

export function studentGalleryCommunityPath(): string {
  return `${programDashboardTabPath('student-gallery')}?tab=community`;
}

export function programGoalsPath(): string {
  return `${PROGRAM_DASHBOARD_PATH}?openGoals=1`;
}

/** Map common natural-language prompts to deep links (starter chips + answer actions). */
export function resolveAskB4PromptDeepLink(
  text: string,
  mode: 'kid' | 'family' | 'facilitator',
  pathname?: string,
): string | undefined {
  const normalized = text.trim().toLowerCase();

  const facilitatorLinks: Record<string, string> = {
    'where are the coloring pages?': activitiesLibraryTabPath('coloring-pages'),
    'which activity helps with reading?': activitiesLibraryTabPath('weekly-activities'),
    'what should i teach this week?': programDashboardTabPath('weekly-modules'),
    'how should i start week 1?': programDashboardTabPath('weekly-modules'),
    'which students need attention?': resultsNeedsAttentionPath(),
    'who has not completed baseline?': rosterFilterPath('missing-baseline'),
    'how do i approve gallery uploads?': studentGalleryPendingPath(),
    'which activity supports self-regulation?': activitiesLibraryTabPath('b4-reset-tools'),
    'help me choose program goals': programGoalsPath(),
    'what should we do for week 1?': programDashboardTabPath('weekly-modules'),
    'open program settings': programDashboardTabPath('overview'),
    'where are certificates?': programDashboardTabPath('certificates'),
    'open community gallery': studentGalleryCommunityPath(),
  };

  const familyLinks: Record<string, string> = {
    'help me pick an activity': familyPortalPath('continue-learning', pathname),
    "show my child's progress": familyPortalPath('', pathname),
    'show my child\u2019s progress': familyPortalPath('', pathname),
    'explain these scores': familyPortalPath('results', pathname),
    'help me update family goals': familyGoalsPath(pathname),
    'where are the coloring pages?': familyDownloadsTabPath('coloring-pages', pathname),
    'show coloring pages': familyDownloadsTabPath('coloring-pages', pathname),
    'how do i submit artwork?': familyPortalPath('gallery', pathname),
    'which activity helps with reading?': familyPortalPath('characters', pathname),
    'which activity helps with focus?': familyPortalPath('characters', pathname),
    'how can i help my child focus?': familyPortalPath('characters', pathname),
    'what should we try first?': familyPortalPath('continue-learning', pathname),
    'what does the b-4 baseline mean?': familyPortalPath('baseline-check', pathname),
    'where is my child\u2019s certificate?': familyPortalPath('certificates', pathname),
    "where is my child's certificate?": familyPortalPath('certificates', pathname),
    'help me choose family goals': familyGoalsPath(pathname),
    'open family goals': familyGoalsPath(pathname),
    'child progress': familyPortalPath('', pathname),
    'family overview': familyPortalPath('', pathname),
    certificates: familyPortalPath('certificates', pathname),
    gallery: familyPortalPath('gallery', pathname),
  };

  const table = mode === 'facilitator' ? facilitatorLinks : mode === 'family' ? familyLinks : {};
  return table[normalized];
}
