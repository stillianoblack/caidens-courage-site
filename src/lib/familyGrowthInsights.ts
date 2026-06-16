import { inferModuleWeekNumber } from './canonicalAttemptRules';
import type { FamilyRecommendedNext } from './familyOverviewRecommendations';
import type { FamilyRecentActivityItem } from './familyProgressMetrics';
import type { LocalModuleResultRecord } from './pilotTrackingLocalStorage';
import type { FamilyFocusSkillGrowth, SkillGrowthKey } from './studentGrowthMetrics';

export const FAMILY_GROWTH_SECTION_TOOLTIP = `Focus Skills Snapshot shows your child's baseline, current progress, and growth using completed learning activities. Retakes and practice replays are excluded.

Baseline: your child's first valid starting score.
Current: your child's current score from completed weekly missions.
Growth: the change from baseline to current progress, shown in points.`;

export type FamilyRecentGrowthSummary = {
  strongestArea: string | null;
  strongestDelta: number | null;
  newestCompletion: string | null;
  latestCertificate: string | null;
  recommendedHeadline: string;
  recommendedBody: string;
  recommendedHref: string;
  recommendedCta: string;
};

function matchesSkillModule(skillKey: SkillGrowthKey, row: LocalModuleResultRecord): boolean {
  const area = row.skill_area?.toLowerCase() ?? '';
  const character = row.character?.toLowerCase() ?? '';

  switch (skillKey) {
    case 'executive':
      return area.includes('focus') || character === 'b4' || character === 'caiden';
    case 'selfRegulation':
      return area.includes('feel') || character === 'miranda';
    case 'focusRecovery':
      return area.includes('read') || character === 'zeke' || character === 'charlie';
    case 'overall':
      return true;
    default:
      return false;
  }
}

export function getRelatedMissionsForSkill(
  skillKey: SkillGrowthKey,
  moduleResults: LocalModuleResultRecord[],
  participantId?: string | null,
): string[] {
  const studentModules = moduleResults
    .filter(
      (row) =>
        row.role === 'student' &&
        row.completed_at &&
        (!participantId?.trim() || row.participant_id === participantId),
    )
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  const titles: string[] = [];
  const seen = new Set<string>();

  for (const row of studentModules) {
    if (!matchesSkillModule(skillKey, row)) continue;
    const key = row.module_id?.trim() || row.module_title?.trim() || row.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    titles.push(row.module_title?.trim() || 'Weekly mission');
    if (titles.length >= 3) break;
  }

  return titles;
}

export function buildSkillB4Insight(
  skill: FamilyFocusSkillGrowth,
  childName: string,
): string {
  const name = childName.trim() || 'Your child';

  if (skill.baselinePct == null) {
    return `Complete the B-4 Baseline Check to start tracking ${skill.label.toLowerCase()}.`;
  }

  if (skill.currentPct == null) {
    return `${name} has a baseline for ${skill.label.toLowerCase()}. Complete a weekly mission to see growth.`;
  }

  if (skill.growthPct == null) {
    return `${name} is building ${skill.label.toLowerCase()} skills week by week.`;
  }

  if (skill.growthPct >= 8) {
    switch (skill.key) {
      case 'executive':
        return `${name} is showing stronger planning and task completion compared to baseline.`;
      case 'selfRegulation':
        return `${name} is handling feelings and choices with more confidence than at baseline.`;
      case 'focusRecovery':
        return `${name} is bouncing back and staying with reading tasks more steadily.`;
      default:
        return `${name} is making encouraging overall progress compared to baseline.`;
    }
  }

  if (skill.growthPct <= -8) {
    return `${name} may be working through harder material in ${skill.label.toLowerCase()}. Extra encouragement can help.`;
  }

  return `${name} is holding steady in ${skill.label.toLowerCase()} while building consistency.`;
}

export function buildSkillConversationStarter(skillKey: SkillGrowthKey): string {
  switch (skillKey) {
    case 'executive':
      return 'Ask: What helped you slow down and choose your answer?';
    case 'selfRegulation':
      return 'Ask: What feeling showed up today, and what helped you handle it?';
    case 'focusRecovery':
      return 'Ask: What part of the story was easiest to understand?';
    case 'overall':
    default:
      return 'Ask: What did you feel proud of in this week\'s mission?';
  }
}

export function buildFamilyRecentGrowthSummary(input: {
  skills: FamilyFocusSkillGrowth[];
  moduleResults: LocalModuleResultRecord[];
  participantId?: string | null;
  recentActivity: FamilyRecentActivityItem[];
  recommendation: FamilyRecommendedNext;
}): FamilyRecentGrowthSummary {
  const classified = input.skills.filter((skill) => skill.growthPct != null);
  const strongest = classified
    .slice()
    .sort((a, b) => (b.growthPct ?? 0) - (a.growthPct ?? 0))[0];

  const studentModules = input.moduleResults
    .filter(
      (row) =>
        row.role === 'student' &&
        row.completed_at &&
        (!input.participantId?.trim() || row.participant_id === input.participantId),
    )
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  const latestModule = studentModules[0];
  const weekNumber = latestModule
    ? inferModuleWeekNumber({
        module_id: latestModule.module_id,
        mission_id: latestModule.module_id,
      })
    : null;

  const newestCompletion = latestModule
    ? weekNumber
      ? `Week ${weekNumber} — ${latestModule.module_title?.trim() || 'Weekly mission'}`
      : latestModule.module_title?.trim() || 'Weekly mission completed'
    : null;

  const latestCertificate =
    input.recentActivity.find((item) => item.kind === 'certificate')?.label ?? null;

  return {
    strongestArea: strongest?.label ?? null,
    strongestDelta: strongest?.growthPct ?? null,
    newestCompletion,
    latestCertificate,
    recommendedHeadline: input.recommendation.headline,
    recommendedBody: input.recommendation.body,
    recommendedHref: input.recommendation.href,
    recommendedCta: input.recommendation.cta,
  };
}
