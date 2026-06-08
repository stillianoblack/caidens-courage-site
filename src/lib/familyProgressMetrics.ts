import { listTrackedStudentModules } from '../data/moduleTrackingRegistry';
import type { B4BaselineCheckRecord } from './b4BaselineCheckStorage';
import { formatGrowthFromRecord } from './pilotDashboardMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from './pilotTrackingLocalStorage';

export type FamilyProgressTone = 'story' | 'reading' | 'focus' | 'creative' | 'overall';

export type FamilyProgressRow = {
  key: string;
  label: string;
  pct: number;
  tone: FamilyProgressTone;
};

export type FamilyFocusSkill = {
  label: string;
  value: number;
};

export type FamilyProgressSnapshot = {
  rows: FamilyProgressRow[];
  focusSkills: FamilyFocusSkill[];
  recentActivity: string[];
  hasActivity: boolean;
  overallLabel: string;
};

const PROGRESS_LABELS: Array<{ key: string; label: string; tone: FamilyProgressTone }> = [
  { key: 'story', label: 'Story Activities', tone: 'story' },
  { key: 'reading', label: 'Reading Games', tone: 'reading' },
  { key: 'focus', label: 'Focus Moves', tone: 'focus' },
  { key: 'creative', label: 'Creative Activities', tone: 'creative' },
  { key: 'overall', label: 'Overall', tone: 'overall' },
];

const CATEGORY_CHARACTERS: Record<Exclude<FamilyProgressTone, 'overall'>, string[]> = {
  story: ['caiden'],
  reading: ['miranda'],
  focus: ['b4'],
  creative: ['charlie'],
};

function normalizeProgramCode(programCode?: string): string {
  return programCode?.trim().toUpperCase() ?? '';
}

function countModulesForCharacter(character: string): number {
  return listTrackedStudentModules().filter((row) => row.character === character).length;
}

function categoryTotals(): Record<Exclude<FamilyProgressTone, 'overall'>, number> {
  return {
    story: countModulesForCharacter('caiden') || 1,
    reading: countModulesForCharacter('miranda') || 1,
    focus: countModulesForCharacter('b4') || 1,
    creative: countModulesForCharacter('charlie') || 1,
  };
}

function filterModulesForProgram(
  rows: LocalModuleResultRecord[],
  programCode?: string,
): LocalModuleResultRecord[] {
  const code = normalizeProgramCode(programCode);
  if (!code) return [];
  return rows.filter((row) => normalizeProgramCode(row.program_code) === code);
}

function filterAssessmentsForProgram(
  rows: LocalAssessmentV2Record[],
  programCode?: string,
): LocalAssessmentV2Record[] {
  const code = normalizeProgramCode(programCode);
  if (!code) return [];
  return rows.filter((row) => normalizeProgramCode(row.program_code) === code);
}

function filterBaselinesForProgram(
  rows: B4BaselineCheckRecord[],
  programCode?: string,
): B4BaselineCheckRecord[] {
  const code = normalizeProgramCode(programCode);
  if (!code) return [];
  return rows.filter((row) => normalizeProgramCode(row.programCode) === code && Boolean(row.completedAt));
}

function completedModulesByCharacter(
  modules: LocalModuleResultRecord[],
): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  modules.forEach((row) => {
    const character = row.character?.trim().toLowerCase();
    if (!character) return;
    if (!map[character]) map[character] = new Set();
    map[character].add(row.module_id);
  });
  return map;
}

function categoryPct(
  completedByCharacter: Record<string, Set<string>>,
  tone: Exclude<FamilyProgressTone, 'overall'>,
  baselineBoost = 0,
): number {
  const totals = categoryTotals();
  const total = totals[tone] + (tone === 'focus' ? baselineBoost : 0);
  if (total <= 0) return 0;

  let completed = 0;
  CATEGORY_CHARACTERS[tone].forEach((character) => {
    completed += completedByCharacter[character]?.size ?? 0;
  });

  if (tone === 'focus') {
    completed += baselineBoost;
  }

  return Math.min(100, Math.round((completed / total) * 100));
}

function buildRecentActivity(
  modules: LocalModuleResultRecord[],
  baselines: B4BaselineCheckRecord[],
  assessments: LocalAssessmentV2Record[] = [],
  adultEvents: string[] = [],
): string[] {
  const moduleItems = modules
    .slice()
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 5)
    .map((row) => `${row.module_title} completed`);

  const v2Items = assessments
    .filter((row) => row.role === 'student')
    .slice()
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
    .slice(0, 3)
    .map((row) => {
      const answers = row.answers_json as { nickname?: string } | undefined;
      const name = answers?.nickname?.trim();
      const label =
        row.assessment_type === 'baseline'
          ? 'B-4 Check-In'
          : row.assessment_type === 'final'
            ? 'Growth Check'
            : row.assessment_type.replace(/_/g, ' ');
      return name ? `${name} completed ${label}` : `${label} completed`;
    });

  const coveredNames = new Set(
    assessments
      .filter((row) => row.role === 'student' && row.assessment_type === 'baseline')
      .map((row) => {
        const answers = row.answers_json as { nickname?: string } | undefined;
        return answers?.nickname?.trim().toLowerCase() ?? '';
      })
      .filter(Boolean),
  );

  const baselineItems = baselines
    .slice()
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .filter((row) => !coveredNames.has(row.nickname.trim().toLowerCase()))
    .slice(0, 3)
    .map((row) =>
      row.nickname
        ? `${row.nickname} completed B-4 Check-In`
        : 'B-4 Check-In completed',
    );

  return [...adultEvents, ...moduleItems, ...v2Items, ...baselineItems].slice(0, 6);
}

function buildFocusSkills(
  modules: LocalModuleResultRecord[],
  baselines: B4BaselineCheckRecord[],
  assessments: LocalAssessmentV2Record[],
): FamilyFocusSkill[] {
  const studentAssessments = assessments.filter((row) => row.role === 'student');
  if (studentAssessments.length > 0) {
    const avg = (pick: (row: LocalAssessmentV2Record) => number | undefined) => {
      const values = studentAssessments
        .map(pick)
        .filter((value): value is number => typeof value === 'number');
      if (!values.length) return 0;
      return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    };

    const focus = avg((row) => row.focus_score);
    const confidence = avg((row) => row.confidence_score);
    const reading = avg((row) => row.reading_score);
    const overall = avg((row) => row.percent_score) || Math.round((focus + confidence + reading) / 3);

    return [
      { label: 'Executive Function', value: focus },
      { label: 'Self-Regulation', value: confidence },
      { label: 'Focus Recovery', value: reading },
      { label: 'Overall', value: overall },
    ];
  }

  const latestBaseline = baselines[0];
  if (latestBaseline) {
    const growth = formatGrowthFromRecord(latestBaseline);
    return [
      { label: 'Executive Function', value: growth.focus },
      { label: 'Self-Regulation', value: growth.confidence },
      { label: 'Focus Recovery', value: growth.reading },
      { label: 'Overall', value: growth.overall },
    ];
  }

  if (modules.length > 0) {
    const scores = modules
      .map((row) => row.percent_score)
      .filter((value): value is number => typeof value === 'number');
    const average =
      scores.length > 0
        ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
        : 0;
    return [
      { label: 'Executive Function', value: average },
      { label: 'Self-Regulation', value: average },
      { label: 'Focus Recovery', value: average },
      { label: 'Overall', value: average },
    ];
  }

  return [
    { label: 'Executive Function', value: 0 },
    { label: 'Self-Regulation', value: 0 },
    { label: 'Focus Recovery', value: 0 },
    { label: 'Overall', value: 0 },
  ];
}

export function computeFamilyProgressSnapshot(input: {
  programCode?: string;
  moduleResults?: LocalModuleResultRecord[];
  assessmentResults?: LocalAssessmentV2Record[];
  legacyBaselines?: B4BaselineCheckRecord[];
  adultBaselineComplete?: boolean;
  adultGrowthComplete?: boolean;
}): FamilyProgressSnapshot {
  const modules = filterModulesForProgram(input.moduleResults ?? [], input.programCode);
  const assessments = filterAssessmentsForProgram(input.assessmentResults ?? [], input.programCode);
  const baselines = filterBaselinesForProgram(input.legacyBaselines ?? [], input.programCode);

  const hasV2StudentBaseline = assessments.some(
    (row) => row.role === 'student' && row.assessment_type === 'baseline',
  );
  const hasBaselineFocusMoves =
    hasV2StudentBaseline ||
    baselines.some((row) => row.completedModules.includes('focus-moves') || Boolean(row.completedAt));
  const baselineBoost = hasBaselineFocusMoves ? 1 : 0;

  const hasActivity =
    modules.length > 0 ||
    assessments.length > 0 ||
    baselines.length > 0 ||
    Boolean(input.adultBaselineComplete) ||
    Boolean(input.adultGrowthComplete);

  const adultEvents: string[] = [];
  if (input.adultBaselineComplete) {
    adultEvents.push('Parent completed Adult Baseline');
  }
  if (input.adultGrowthComplete) {
    adultEvents.push('Parent completed Growth Check');
  }

  if (!hasActivity) {
    return {
      rows: PROGRESS_LABELS.map(({ key, label, tone }) => ({
        key,
        label,
        pct: 0,
        tone,
      })),
      focusSkills: buildFocusSkills([], [], []),
      recentActivity: [],
      hasActivity: false,
      overallLabel: 'Getting Started',
    };
  }

  const completedByCharacter = completedModulesByCharacter(modules);
  const story = categoryPct(completedByCharacter, 'story');
  const reading = categoryPct(completedByCharacter, 'reading');
  const focus = categoryPct(completedByCharacter, 'focus', baselineBoost);
  const creative = categoryPct(completedByCharacter, 'creative');
  const overall = Math.round((story + reading + focus + creative) / 4);

  return {
    rows: PROGRESS_LABELS.map(({ key, label, tone }) => ({
      key,
      label,
      pct:
        tone === 'story'
          ? story
          : tone === 'reading'
            ? reading
            : tone === 'focus'
              ? focus
              : tone === 'creative'
                ? creative
                : overall,
      tone,
    })),
    focusSkills: buildFocusSkills(modules, baselines, assessments),
    recentActivity: buildRecentActivity(modules, baselines, assessments, adultEvents),
    hasActivity: true,
    overallLabel: overall >= 75 ? 'Strong Progress' : overall >= 25 ? 'Building Momentum' : 'Getting Started',
  };
}
