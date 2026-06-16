/**
 * Pilot readiness report — one-page scale readiness summary.
 *
 * Usage: yarn report:pilot-readiness
 */

import fs from 'fs';
import path from 'path';
import { getCampReadiness } from '../src/lib/campReadiness';
import { getQuestionAnalytics } from '../src/lib/analytics/getQuestionAnalytics';
import { getStudentGrowthMetrics } from '../src/lib/analytics/getStudentGrowthMetrics';
import { formatGrowthDelta } from '../src/lib/formatGrowthDelta';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../src/lib/pilotTrackingLocalStorage';
import type { StudentParticipantRecord } from '../src/lib/pilotTrackingService';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const MD_PATH = path.join(REPORTS_DIR, 'pilot-readiness-report.md');
const QUESTION_ANALYTICS_PATH = path.join(REPORTS_DIR, 'question-analytics.json');

type ParticipantRow = {
  id: string;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  program_code: string;
  role: string;
  group_name: string | null;
  grade_level: string | null;
  created_at: string;
};

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function fetchAll<T>(
  supabaseUrl: string,
  supabaseKey: string,
  table: string,
  select: string,
): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
    url.searchParams.set('select', select);

    const response = await fetch(url.toString(), {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Range: `${from}-${from + pageSize - 1}`,
      },
    });

    if (response.status === 404 || response.status === 406) return [];
    if (!response.ok) {
      const body = await response.text();
      if (/does not exist|relation.*does not exist|42P01/i.test(body)) return [];
      throw new Error(`${table}: ${response.status} ${body}`);
    }

    const batch = (await response.json()) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

function readQuestionAnalyticsSummary(): ReturnType<typeof getQuestionAnalytics> | null {
  if (!fs.existsSync(QUESTION_ANALYTICS_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(QUESTION_ANALYTICS_PATH, 'utf8')) as ReturnType<
      typeof getQuestionAnalytics
    >;
  } catch {
    return null;
  }
}

function readinessVerdict(input: {
  missingBaselines: number;
  week1Rate: number;
  week2Rate: number;
  averageHealth: number;
  criticalFlags: number;
}): string {
  if (input.criticalFlags > 0) return '**Hold** — critical growth or data integrity flags detected.';
  if (input.missingBaselines > 0 && input.week1Rate < 70) {
    return '**Needs attention** — baseline and Week 1 completion gaps remain.';
  }
  if (input.averageHealth < 60) return '**Content review recommended** — question health below target.';
  if (input.week2Rate >= 70 && input.averageHealth >= 70) {
    return '**Ready to scale** — participation, growth tracking, and content health look solid.';
  }
  return '**Proceed with monitoring** — pilot metrics are usable but not all targets are met.';
}

async function main(): Promise<void> {
  loadEnvLocal();
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const url = process.env.REACT_APP_SUPABASE_URL?.trim();
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

  let students: StudentParticipantRecord[] = [];
  let assessments: LocalAssessmentV2Record[] = [];
  let moduleResults: LocalModuleResultRecord[] = [];

  if (url && key) {
    const [participants, assessmentRows, moduleRows] = await Promise.all([
      fetchAll<ParticipantRow>(
        url,
        key,
        'participants',
        'id, nickname, first_name, last_name, program_code, role, group_name, grade_level, created_at',
      ),
      fetchAll<LocalAssessmentV2Record>(
        url,
        key,
        'assessment_results_v2',
        'id, participant_id, role, program_code, group_name, assessment_type, reading_score, focus_score, confidence_score, understanding_score, support_score, total_score, max_score, percent_score, answers_json, completed_at',
      ),
      fetchAll<LocalModuleResultRecord>(
        url,
        key,
        'module_results',
        'id, participant_id, role, program_code, group_name, module_id, module_title, character, skill_area, score, max_score, percent_score, time_spent_seconds, attempt_number, answers_json, completed_at',
      ),
    ]);
    students = participants.filter((row) => row.role === 'student') as StudentParticipantRecord[];
    assessments = assessmentRows;
    moduleResults = moduleRows;
  }

  const campReadiness = getCampReadiness({
    participants: students,
    assessments,
    modules: moduleResults,
    rosterPath: '/program-dashboard/roster',
    resultsPath: '/program-dashboard/results',
    weeklyModulesPath: '/program-dashboard/weekly-modules',
    certificatesPath: '/program-dashboard/certificates',
  });

  const growth = getStudentGrowthMetrics({
    participants: students,
    assessments,
    moduleResults,
    legacyBaselines: [],
  });

  const questionAnalytics = readQuestionAnalyticsSummary() ?? getQuestionAnalytics([]);

  const activeStudents = campReadiness.studentCount;
  const missingBaselines = campReadiness.items.find((row) => row.id === 'missing-baseline')?.count ?? 0;
  const missingWeek1 = campReadiness.items.find((row) => row.id === 'missing-week-1')?.count ?? 0;
  const missingWeek2 = campReadiness.items.find((row) => row.id === 'missing-week-2')?.count ?? 0;
  const certificatesReady = campReadiness.items.find((row) => row.id === 'certificates-ready')?.count ?? 0;

  const week1Rate =
    activeStudents > 0 ? Math.round(((activeStudents - missingWeek1) / activeStudents) * 100) : 0;
  const week2Rate =
    activeStudents > 0 ? Math.round(((activeStudents - missingWeek2) / activeStudents) * 100) : 0;

  const liveGrowthPath = path.join(REPORTS_DIR, 'live-growth-verification.json');
  let criticalFlags = 0;
  if (fs.existsSync(liveGrowthPath)) {
    try {
      const live = JSON.parse(fs.readFileSync(liveGrowthPath, 'utf8')) as {
        summary?: { flags_critical?: number };
      };
      criticalFlags = live.summary?.flags_critical ?? 0;
    } catch {
      criticalFlags = 0;
    }
  }

  const verdict = readinessVerdict({
    missingBaselines,
    week1Rate,
    week2Rate,
    averageHealth: questionAnalytics.averageHealthScore,
    criticalFlags,
  });

  const lines = [
    '# Pilot Readiness Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Verdict',
    '',
    verdict,
    '',
    '## Participation & Completion',
    '',
    `| Metric | Value |`,
    `| --- | --- |`,
    `| Total active students | ${activeStudents} |`,
    `| Missing baselines | ${missingBaselines} |`,
    `| Week 1 completion rate | ${week1Rate}% |`,
    `| Week 2 completion rate | ${week2Rate}% |`,
    `| Certificates ready | ${certificatesReady} |`,
    `| Requires follow-up | ${campReadiness.requiresFollowUp} |`,
    '',
    '## Growth',
    '',
    `| Skill area | Baseline | Current | Growth |`,
    `| --- | --- | --- | --- |`,
    `| Overall | ${growth.baselineScores.overall}% | ${growth.currentScores.overall}% | ${formatGrowthDelta(growth.growthSinceBaseline.overall)} |`,
    `| Reading | ${growth.baselineScores.reading}% | ${growth.currentScores.reading}% | ${formatGrowthDelta(growth.growthSinceBaseline.reading)} |`,
    `| Feelings | ${growth.baselineScores.confidence}% | ${growth.currentScores.confidence}% | ${formatGrowthDelta(growth.growthSinceBaseline.confidence)} |`,
    `| Focus Moves | ${growth.baselineScores.focus}% | ${growth.currentScores.focus}% | ${formatGrowthDelta(growth.growthSinceBaseline.focus)} |`,
    '',
    '## Question Health',
    '',
    `| Metric | Value |`,
    `| --- | --- |`,
    `| Average health score | ${questionAnalytics.averageHealthScore}/100 |`,
    `| Not enough data | ${questionAnalytics.notEnoughData} |`,
    `| Questions too easy | ${questionAnalytics.tooEasy} |`,
    `| Questions too hard | ${questionAnalytics.tooHard} |`,
    `| Confusing questions | ${questionAnalytics.confusing} |`,
    `| Healthy questions | ${questionAnalytics.healthy} |`,
    `| Questions needing rewrite | ${questionAnalytics.needsRewrite} |`,
    '',
    '## Camp Readiness (Facilitator Coach)',
    '',
    ...campReadiness.items.map((item) => `- ${item.label}: **${item.count}**`),
    '',
    '## Scale Readiness Checklist',
    '',
    `- [${missingBaselines === 0 ? 'x' : ' '}] All students have baselines`,
    `- [${week1Rate >= 80 ? 'x' : ' '}] Week 1 completion ≥ 80%`,
    `- [${week2Rate >= 70 ? 'x' : ' '}] Week 2 completion ≥ 70%`,
    `- [${questionAnalytics.averageHealthScore >= 70 ? 'x' : ' '}] Question health average ≥ 70`,
    `- [${criticalFlags === 0 ? 'x' : ' '}] No critical growth math flags`,
    `- [${certificatesReady > 0 ? 'x' : ' '}] Students ready for certificates`,
    '',
    '_Run `yarn verify:live-growth` and `yarn analytics:questions` before scaling._',
    '',
  ];

  fs.writeFileSync(MD_PATH, lines.join('\n'), 'utf8');

  console.log('\n=== Pilot Readiness Report ===\n');
  console.log(`Active students: ${activeStudents}`);
  console.log(`Week 1 rate: ${week1Rate}% | Week 2 rate: ${week2Rate}%`);
  console.log(`Average growth overall: ${formatGrowthDelta(growth.growthSinceBaseline.overall)}`);
  console.log(`Question health: ${questionAnalytics.averageHealthScore}/100`);
  console.log(`\nWrote ${MD_PATH}`);
}

void main();
