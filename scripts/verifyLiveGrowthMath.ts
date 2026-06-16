/**
 * Live Supabase growth validation — verifies dashboard metrics match canonical math.
 *
 * Usage: yarn verify:live-growth
 */

import fs from 'fs';
import path from 'path';
import {
  classifyAssessmentV2Attempts,
  classifyModuleResultAttempts,
  classifyQuestionAttemptRows,
} from '../src/lib/canonicalAttemptRules';
import { getCampReadiness } from '../src/lib/campReadiness';
import { formatGrowthDelta } from '../src/lib/formatGrowthDelta';
import { getStudentGrowthMetrics } from '../src/lib/analytics/getStudentGrowthMetrics';
import { computePilotTrackingMetrics } from '../src/lib/pilotTrackingMetrics';
import { computeStudentGrowthSnapshot } from '../src/lib/studentGrowthMetrics';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../src/lib/pilotTrackingLocalStorage';
import type { PilotGrowthMetrics } from '../src/lib/pilotDashboardMetrics';
import type { StudentParticipantRecord } from '../src/lib/pilotTrackingService';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'live-growth-verification.json');
const MD_PATH = path.join(REPORTS_DIR, 'live-growth-verification.md');

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

type VerificationFlag = {
  code: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  participant_id?: string;
};

type StudentVerification = {
  participant_id: string;
  child_name: string;
  has_baseline: boolean;
  has_week1: boolean;
  has_week2: boolean;
  baseline_attempt_count: number;
  week1_attempt_count: number;
  week2_attempt_count: number;
  replay_in_growth_count: number;
  challenge_in_growth_count: number;
  growth_overall: number | null;
  flags: VerificationFlag[];
};

type GrowthMetricKey = keyof PilotGrowthMetrics;

type LiveGrowthVerificationReport = {
  generated_at: string;
  supabase_project_ref: string | null;
  summary: {
    active_students: number;
    missing_baselines: number;
    week1_complete: number;
    week2_complete: number;
    dashboard_math_mismatches: number;
    replay_in_growth_risk: number;
    challenge_in_growth_risk: number;
    duplicate_baseline_students: number;
    flags_total: number;
    flags_critical: number;
  };
  program_metrics: {
    dashboard: {
      baseline: PilotGrowthMetrics;
      current: PilotGrowthMetrics;
      growth: PilotGrowthMetrics;
      participation: {
        students_enrolled: number;
        baseline_checks_completed: number;
        module_completions: number;
        unique_modules_completed: number;
      };
    };
    canonical: {
      baseline: PilotGrowthMetrics;
      current: PilotGrowthMetrics;
      growth: PilotGrowthMetrics;
    };
    growth_mismatches: Array<{
      metric: GrowthMetricKey;
      dashboard: number;
      canonical: number;
      delta: number;
    }>;
  };
  camp_readiness: ReturnType<typeof getCampReadiness>;
  students: StudentVerification[];
  flags: VerificationFlag[];
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

function participantLabel(row: Pick<ParticipantRow, 'nickname' | 'first_name' | 'last_name' | 'id'>): string {
  return (
    row.nickname?.trim() ||
    row.first_name?.trim() ||
    row.last_name?.trim() ||
    row.id.slice(0, 8)
  );
}

function compareGrowthMetrics(
  dashboard: PilotGrowthMetrics,
  canonical: PilotGrowthMetrics,
): LiveGrowthVerificationReport['program_metrics']['growth_mismatches'] {
  const keys: GrowthMetricKey[] = ['overall', 'reading', 'confidence', 'focus'];
  const mismatches: LiveGrowthVerificationReport['program_metrics']['growth_mismatches'] = [];

  for (const metric of keys) {
    const delta = Math.abs((dashboard[metric] ?? 0) - (canonical[metric] ?? 0));
    if (delta > 0) {
      mismatches.push({
        metric,
        dashboard: dashboard[metric] ?? 0,
        canonical: canonical[metric] ?? 0,
        delta,
      });
    }
  }

  return mismatches;
}

function verifyStudent(input: {
  participant: ParticipantRow;
  assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  questionAttempts: Array<Record<string, unknown>>;
}): StudentVerification {
  const flags: VerificationFlag[] = [];
  const participantId = input.participant.id;

  const assessmentAttempts = classifyAssessmentV2Attempts(
    input.assessments.filter((row) => row.participant_id === participantId),
    [],
  );
  const moduleAttempts = classifyModuleResultAttempts(
    input.moduleResults.filter((row) => row.participant_id === participantId),
  );
  const questionAttempts = classifyQuestionAttemptRows(
    input.questionAttempts
      .filter((row) => row.participant_id === participantId)
      .map((row) => row as never),
  );

  const baselineAttempts = assessmentAttempts.filter((row) => row.attempt_type === 'baseline');
  const week1Attempts = [...moduleAttempts, ...questionAttempts].filter((row) => row.week_number === 1);
  const week2Attempts = [...moduleAttempts, ...questionAttempts].filter((row) => row.week_number === 2);
  const replayInGrowth = [...moduleAttempts, ...questionAttempts, ...assessmentAttempts].filter(
    (row) => row.attempt_type === 'replay' && row.counts_in_growth,
  );
  const challengeInGrowth = [...moduleAttempts, ...questionAttempts].filter(
    (row) => row.attempt_type === 'challenge' && row.counts_in_growth,
  );

  if (!baselineAttempts.length) {
    flags.push({
      code: 'missing_baseline',
      severity: 'warning',
      message: 'No canonical baseline attempt found.',
      participant_id: participantId,
    });
  }
  if (baselineAttempts.length > 1) {
    flags.push({
      code: 'duplicate_baseline',
      severity: 'warning',
      message: `${baselineAttempts.length} baseline attempts found.`,
      participant_id: participantId,
    });
  }
  if (week1Attempts.length > 1) {
    flags.push({
      code: 'duplicate_week1',
      severity: 'info',
      message: `${week1Attempts.length} Week 1 attempts found.`,
      participant_id: participantId,
    });
  }
  if (week2Attempts.length > 1) {
    flags.push({
      code: 'duplicate_week2',
      severity: 'info',
      message: `${week2Attempts.length} Week 2 attempts found.`,
      participant_id: participantId,
    });
  }
  if (replayInGrowth.length > 0) {
    flags.push({
      code: 'replay_in_growth',
      severity: 'critical',
      message: `${replayInGrowth.length} replay attempts incorrectly counted in growth.`,
      participant_id: participantId,
    });
  }
  if (challengeInGrowth.length > 0) {
    flags.push({
      code: 'challenge_in_growth',
      severity: 'critical',
      message: `${challengeInGrowth.length} challenge attempts incorrectly counted in growth.`,
      participant_id: participantId,
    });
  }

  const snapshot = computeStudentGrowthSnapshot({
    participantId,
    v2Assessments: input.assessments,
    legacyBaselines: [],
    moduleResults: input.moduleResults,
  });

  if (!snapshot.hasBaseline && snapshot.hasCurrent) {
    flags.push({
      code: 'current_without_baseline',
      severity: 'warning',
      message: 'Current weekly scores exist without a canonical baseline.',
      participant_id: participantId,
    });
  }

  const overallSkill = snapshot.skills.find((row) => row.key === 'overall');

  return {
    participant_id: participantId,
    child_name: participantLabel(input.participant),
    has_baseline: snapshot.hasBaseline,
    has_week1: week1Attempts.some((row) => row.counts_in_growth),
    has_week2: week2Attempts.some((row) => row.counts_in_growth),
    baseline_attempt_count: baselineAttempts.length,
    week1_attempt_count: week1Attempts.length,
    week2_attempt_count: week2Attempts.length,
    replay_in_growth_count: replayInGrowth.length,
    challenge_in_growth_count: challengeInGrowth.length,
    growth_overall: overallSkill?.growthPct ?? null,
    flags,
  };
}

function renderMarkdown(report: LiveGrowthVerificationReport): string {
  const lines: string[] = [
    '# Live Growth Verification',
    '',
    `Generated: ${report.generated_at}`,
    `Supabase project: ${report.supabase_project_ref ?? 'unknown'}`,
    '',
    '## Summary',
    '',
    `- Active students: ${report.summary.active_students}`,
    `- Missing baselines: ${report.summary.missing_baselines}`,
    `- Week 1 complete: ${report.summary.week1_complete}`,
    `- Week 2 complete: ${report.summary.week2_complete}`,
    `- Dashboard math mismatches: ${report.summary.dashboard_math_mismatches}`,
    `- Replay in growth risk: ${report.summary.replay_in_growth_risk}`,
    `- Challenge in growth risk: ${report.summary.challenge_in_growth_risk}`,
    `- Duplicate baseline students: ${report.summary.duplicate_baseline_students}`,
    `- Flags: ${report.summary.flags_total} (${report.summary.flags_critical} critical)`,
    '',
    '## Program Growth Metrics',
    '',
    '| Metric | Dashboard Baseline | Canonical Baseline | Dashboard Current | Canonical Current | Dashboard Growth | Canonical Growth |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  ];

  const metrics: GrowthMetricKey[] = ['overall', 'reading', 'confidence', 'focus'];
  for (const metric of metrics) {
    lines.push(
      `| ${metric} | ${report.program_metrics.dashboard.baseline[metric]} | ${report.program_metrics.canonical.baseline[metric]} | ${report.program_metrics.dashboard.current[metric]} | ${report.program_metrics.canonical.current[metric]} | ${formatGrowthDelta(report.program_metrics.dashboard.growth[metric])} | ${formatGrowthDelta(report.program_metrics.canonical.growth[metric])} |`,
    );
  }

  lines.push('', '## Camp Readiness', '');
  for (const item of report.camp_readiness.items) {
    lines.push(`- ${item.label}: **${item.count}** (${item.status})`);
  }

  if (report.program_metrics.growth_mismatches.length) {
    lines.push('', '## Dashboard Math Mismatches', '');
    for (const mismatch of report.program_metrics.growth_mismatches) {
      lines.push(
        `- **${mismatch.metric}**: dashboard=${mismatch.dashboard}, canonical=${mismatch.canonical} (delta ${mismatch.delta})`,
      );
    }
  }

  const flaggedStudents = report.students.filter((row) => row.flags.length > 0);
  if (flaggedStudents.length) {
    lines.push('', '## Flagged Students', '');
    for (const student of flaggedStudents) {
      lines.push(`### ${student.child_name} (\`${student.participant_id}\`)`, '');
      for (const flag of student.flags) {
        lines.push(`- **${flag.severity.toUpperCase()}** \`${flag.code}\`: ${flag.message}`);
      }
      lines.push('');
    }
  }

  const criticalFlags = report.flags.filter((row) => row.severity === 'critical');
  if (criticalFlags.length) {
    lines.push('## Critical Flags', '');
    for (const flag of criticalFlags) {
      lines.push(`- \`${flag.code}\`: ${flag.message}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function runVerification(): Promise<LiveGrowthVerificationReport> {
  loadEnvLocal();
  const url = process.env.REACT_APP_SUPABASE_URL?.trim();
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

  const emptyReport = (flags: VerificationFlag[]): LiveGrowthVerificationReport => ({
    generated_at: new Date().toISOString(),
    supabase_project_ref: null,
    summary: {
      active_students: 0,
      missing_baselines: 0,
      week1_complete: 0,
      week2_complete: 0,
      dashboard_math_mismatches: 0,
      replay_in_growth_risk: 0,
      challenge_in_growth_risk: 0,
      duplicate_baseline_students: 0,
      flags_total: flags.length,
      flags_critical: flags.filter((row) => row.severity === 'critical').length,
    },
    program_metrics: {
      dashboard: {
        baseline: { overall: 0, reading: 0, confidence: 0, focus: 0 },
        current: { overall: 0, reading: 0, confidence: 0, focus: 0 },
        growth: { overall: 0, reading: 0, confidence: 0, focus: 0 },
        participation: {
          students_enrolled: 0,
          baseline_checks_completed: 0,
          module_completions: 0,
          unique_modules_completed: 0,
        },
      },
      canonical: {
        baseline: { overall: 0, reading: 0, confidence: 0, focus: 0 },
        current: { overall: 0, reading: 0, confidence: 0, focus: 0 },
        growth: { overall: 0, reading: 0, confidence: 0, focus: 0 },
      },
      growth_mismatches: [],
    },
    camp_readiness: {
      studentCount: 0,
      requiresFollowUp: 0,
      items: [],
    },
    students: [],
    flags,
  });

  if (!url || !key) {
    return emptyReport([
      {
        code: 'missing_supabase_env',
        severity: 'critical',
        message: 'Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY.',
      },
    ]);
  }

  const projectRef =
    process.env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF?.trim() ||
    /^https:\/\/([^.]+)\.supabase\.co/.exec(url)?.[1] ||
    null;

  const [participants, assessments, moduleResults, questionAttempts] = await Promise.all([
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
    fetchAll<Record<string, unknown>>(
      url,
      key,
      'question_attempts',
      'id, participant_id, program_code, week_number, mission_id, character, question_id, grade_level, grade_band, content_version, module_id, selected_answer, correct_answer, first_selected_answer, is_correct_first_try, is_correct_final, attempt_count, used_hint, attempt_type, is_replay, attempt_scope, completed_at, created_at',
    ),
  ]);

  const students = participants.filter((row) => row.role === 'student') as StudentParticipantRecord[];
  const studentVerifications = students.map((participant) =>
    verifyStudent({
      participant,
      assessments,
      moduleResults,
      questionAttempts,
    }),
  );

  const dashboardMetrics = computePilotTrackingMetrics({
    participants: students,
    assessmentV2: assessments,
    moduleResults,
    legacyBaselines: [],
  });

  const canonicalMetrics = getStudentGrowthMetrics({
    participants: students,
    assessments,
    moduleResults,
    legacyBaselines: [],
  });

  const growthMismatches = compareGrowthMetrics(
    dashboardMetrics.growthSinceBaseline,
    canonicalMetrics.growthSinceBaseline,
  );

  const campReadiness = getCampReadiness({
    participants: students,
    assessments,
    modules: moduleResults,
    rosterPath: '/program-dashboard/roster',
    resultsPath: '/program-dashboard/results',
    weeklyModulesPath: '/program-dashboard/weekly-modules',
    certificatesPath: '/program-dashboard/certificates',
  });

  const allFlags: VerificationFlag[] = [
    ...studentVerifications.flatMap((row) => row.flags),
    ...growthMismatches.map((row) => ({
      code: 'dashboard_math_mismatch',
      severity: 'critical' as const,
      message: `${row.metric} growth mismatch: dashboard ${row.dashboard} vs canonical ${row.canonical}`,
    })),
  ];

  return {
    generated_at: new Date().toISOString(),
    supabase_project_ref: projectRef,
    summary: {
      active_students: students.length,
      missing_baselines: campReadiness.items.find((row) => row.id === 'missing-baseline')?.count ?? 0,
      week1_complete: students.length - (campReadiness.items.find((row) => row.id === 'missing-week-1')?.count ?? 0),
      week2_complete: students.length - (campReadiness.items.find((row) => row.id === 'missing-week-2')?.count ?? 0),
      dashboard_math_mismatches: growthMismatches.length,
      replay_in_growth_risk: studentVerifications.filter((row) => row.replay_in_growth_count > 0).length,
      challenge_in_growth_risk: studentVerifications.filter((row) => row.challenge_in_growth_count > 0).length,
      duplicate_baseline_students: studentVerifications.filter((row) => row.baseline_attempt_count > 1).length,
      flags_total: allFlags.length,
      flags_critical: allFlags.filter((row) => row.severity === 'critical').length,
    },
    program_metrics: {
      dashboard: {
        baseline: dashboardMetrics.baselineScores,
        current: dashboardMetrics.currentScores,
        growth: dashboardMetrics.growthSinceBaseline,
        participation: {
          students_enrolled: dashboardMetrics.studentsEnrolled,
          baseline_checks_completed: dashboardMetrics.baselineChecksCompleted,
          module_completions: dashboardMetrics.moduleCompletions,
          unique_modules_completed: dashboardMetrics.uniqueModulesCompleted,
        },
      },
      canonical: {
        baseline: canonicalMetrics.baselineScores,
        current: canonicalMetrics.currentScores,
        growth: canonicalMetrics.growthSinceBaseline,
      },
      growth_mismatches: growthMismatches,
    },
    camp_readiness: campReadiness,
    students: studentVerifications,
    flags: allFlags,
  };
}

async function main(): Promise<void> {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const report = await runVerification();
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(MD_PATH, renderMarkdown(report), 'utf8');

  console.log('\n=== Live Growth Verification ===\n');
  console.log(`Active students: ${report.summary.active_students}`);
  console.log(`Missing baselines: ${report.summary.missing_baselines}`);
  console.log(`Dashboard mismatches: ${report.summary.dashboard_math_mismatches}`);
  console.log(`Flags: ${report.summary.flags_total} (${report.summary.flags_critical} critical)`);
  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${MD_PATH}`);

  if (report.summary.flags_critical > 0) {
    process.exitCode = 1;
  }
}

void main();
