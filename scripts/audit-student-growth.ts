/**
 * Read-first student growth / baseline audit.
 *
 * Usage:
 *   npm run audit:student-growth
 *   STUDENT_NAME=Caden npm run audit:student-growth
 */

import fs from 'fs';
import path from 'path';
import type { B4BaselineCheckRecord } from '../src/lib/b4BaselineCheckStorage';
import {
  classifyAssessmentV2Attempts,
  classifyModuleResultAttempts,
  classifyQuestionAttemptRows,
  type ClassifiedAttemptRecord,
} from '../src/lib/canonicalAttemptRules';
import { computeStudentGrowthSnapshot } from '../src/lib/studentGrowthMetrics';
import { groupProgressBySkillArea } from '../src/lib/familyProgressHelpers';
import type { LocalAssessmentV2Record, LocalModuleResultRecord } from '../src/lib/pilotTrackingLocalStorage';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'student-growth-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'student-growth-audit.md');

const TARGET_NAME_HINTS = ['caden', 'caiden', 'maddox'];

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

type FamilyLinkRow = {
  id: string;
  student_id: string;
  family_program_code: string;
  camp_program_code: string | null;
  parent_last_name: string | null;
  parent_claimed: boolean;
  created_at: string;
};

type AuditWarning = {
  code: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
};

type StudentAuditReport = {
  participant_id: string;
  child_name: string;
  parent_guardian: string | null;
  family_program_code: string | null;
  camp_program_code: string | null;
  grade_level: string | null;
  baseline_attempts: ClassifiedAttemptRecord[];
  week1_attempts: ClassifiedAttemptRecord[];
  week2_attempts: ClassifiedAttemptRecord[];
  replay_attempts: ClassifiedAttemptRecord[];
  challenge_attempts: ClassifiedAttemptRecord[];
  question_attempts: Array<ClassifiedAttemptRecord & { question_id: string }>;
  current_dashboard_source: {
    baseline_source: string | null;
    current_score_source: string | null;
    growth_source: string | null;
    legacy_inflated_focus_skills: Record<string, number>;
    canonical_focus_skills: Array<{
      label: string;
      baselinePct: number | null;
      currentPct: number | null;
      growthPct: number | null;
    }>;
    excluded_attempt_ids: string[];
    suspicious_values: string[];
  };
  warnings: AuditWarning[];
};

type AuditReport = {
  generated_at: string;
  supabase_project_ref: string | null;
  target_student_names: string[];
  students_audited: StudentAuditReport[];
  global_warnings: AuditWarning[];
  summary: {
    students_found: number;
    students_with_multiple_baselines: number;
    students_with_multiple_week1: number;
    students_with_multiple_week2: number;
    students_with_replay_in_growth_risk: number;
  };
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
  filters?: Record<string, string>,
): Promise<T[]> {
  const pageSize = 1000;
  const rows: T[] = [];
  let from = 0;

  while (true) {
    const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
    url.searchParams.set('select', select);
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        url.searchParams.set(key, value);
      }
    }

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

function matchesTargetName(row: ParticipantRow, hints: string[]): boolean {
  const haystack = [row.nickname, row.first_name, row.last_name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hints.some((hint) => haystack.includes(hint.toLowerCase()));
}

function matchesParentName(link: FamilyLinkRow, hints: string[]): boolean {
  const parent = link.parent_last_name?.trim().toLowerCase() ?? '';
  return hints.some((hint) => parent.includes(hint.toLowerCase()));
}

function pushWarning(
  warnings: AuditWarning[],
  code: string,
  severity: AuditWarning['severity'],
  message: string,
): void {
  warnings.push({ code, severity, message });
}

function auditStudent(input: {
  participant: ParticipantRow;
  familyLinks: FamilyLinkRow[];
  assessments: LocalAssessmentV2Record[];
  moduleResults: LocalModuleResultRecord[];
  questionAttempts: Array<Record<string, unknown>>;
  legacyBaselines: B4BaselineCheckRecord[];
}): StudentAuditReport {
  const warnings: AuditWarning[] = [];
  const participantId = input.participant.id;

  const assessmentAttempts = classifyAssessmentV2Attempts(
    input.assessments.filter((row) => row.participant_id === participantId),
    input.legacyBaselines.filter((row) => row.participantId === participantId),
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
  const replayAttempts = [...moduleAttempts, ...questionAttempts, ...assessmentAttempts].filter(
    (row) => row.attempt_type === 'replay',
  );
  const challengeAttempts = [...moduleAttempts, ...questionAttempts].filter(
    (row) => row.attempt_type === 'challenge',
  );

  if (baselineAttempts.length > 1) {
    pushWarning(
      warnings,
      'multiple_baseline_attempts',
      'warning',
      `${baselineAttempts.length} baseline attempts found; only earliest canonical should drive growth.`,
    );
  }
  if (week1Attempts.length > 1) {
    pushWarning(
      warnings,
      'multiple_week1_attempts',
      'warning',
      `${week1Attempts.length} Week 1 attempts found.`,
    );
  }
  if (week2Attempts.length > 1) {
    pushWarning(
      warnings,
      'multiple_week2_attempts',
      'warning',
      `${week2Attempts.length} Week 2 attempts found.`,
    );
  }

  const replayCounted = replayAttempts.filter((row) => row.counts_in_growth);
  if (replayCounted.length > 0) {
    pushWarning(
      warnings,
      'replay_in_growth',
      'critical',
      `${replayCounted.length} replay attempts are incorrectly counted in growth.`,
    );
  }

  const challengeCounted = challengeAttempts.filter((row) => row.counts_in_growth);
  if (challengeCounted.length > 0) {
    pushWarning(
      warnings,
      'challenge_in_growth',
      'critical',
      `${challengeCounted.length} challenge attempts are incorrectly counted in growth.`,
    );
  }

  const growthSnapshot = computeStudentGrowthSnapshot({
    participantId,
    v2Assessments: input.assessments,
    legacyBaselines: input.legacyBaselines,
    moduleResults: input.moduleResults,
    excludedAttemptCount: [...moduleAttempts, ...questionAttempts, ...assessmentAttempts].filter(
      (row) => !row.counts_in_growth,
    ).length,
  });

  const legacyInflated = groupProgressBySkillArea({
    programCode: input.participant.program_code,
    studentAssessments: input.assessments.filter((row) => row.participant_id === participantId),
    adultAssessments: [],
    studentModules: input.moduleResults.filter((row) => row.participant_id === participantId),
    adultModules: [],
    legacyBaselines: input.legacyBaselines.filter((row) => row.participantId === participantId),
  });

  const legacyMap = Object.fromEntries(
    legacyInflated.map((row) => [row.label, row.value]),
  ) as Record<string, number>;

  const suspicious: string[] = [];
  for (const skill of growthSnapshot.skills) {
    const legacyValue = legacyMap[skill.label];
    if (legacyValue != null && skill.currentPct != null && legacyValue > skill.currentPct + 10) {
      suspicious.push(
        `${skill.label}: legacy averaged ${legacyValue}% vs canonical current ${skill.currentPct}%`,
      );
      pushWarning(
        warnings,
        'inflated_legacy_average',
        'warning',
        `${skill.label} legacy average (${legacyValue}%) exceeds canonical current (${skill.currentPct}%).`,
      );
    }
    if (skill.currentPct != null && skill.currentPct > 100) {
      suspicious.push(`${skill.label}: current ${skill.currentPct}% exceeds 100`);
    }
    if (skill.baselinePct == null && skill.currentPct != null && skill.currentPct > 0) {
      pushWarning(
        warnings,
        'current_without_baseline',
        'warning',
        `${skill.label} has current scores without a canonical baseline.`,
      );
    }
  }

  if (
    legacyMap.Overall != null &&
    growthSnapshot.skills.find((row) => row.key === 'overall')?.currentPct == null &&
    legacyMap.Overall >= 80
  ) {
    pushWarning(
      warnings,
      'placeholder_or_inflated_snapshot',
      'critical',
      `Legacy Focus Skills Overall=${legacyMap.Overall}% with no canonical current source — likely inflated/placeholder.`,
    );
  }

  const familyLink = input.familyLinks.find((row) => row.student_id === participantId);

  return {
    participant_id: participantId,
    child_name: participantLabel(input.participant),
    parent_guardian: familyLink?.parent_last_name ?? null,
    family_program_code: familyLink?.family_program_code ?? null,
    camp_program_code: familyLink?.camp_program_code ?? input.participant.program_code,
    grade_level: input.participant.grade_level,
    baseline_attempts: baselineAttempts,
    week1_attempts: week1Attempts,
    week2_attempts: week2Attempts,
    replay_attempts: replayAttempts,
    challenge_attempts: challengeAttempts,
    question_attempts: questionAttempts,
    current_dashboard_source: {
      baseline_source:
        growthSnapshot.skills.find((row) => row.baselinePct != null)?.baselineSource ?? null,
      current_score_source:
        growthSnapshot.skills.find((row) => row.currentPct != null)?.currentSource ?? null,
      growth_source: growthSnapshot.hasBaseline && growthSnapshot.hasCurrent
        ? 'canonical_baseline_vs_weekly_modules'
        : null,
      legacy_inflated_focus_skills: legacyMap,
      canonical_focus_skills: growthSnapshot.skills.map((skill) => ({
        label: skill.label,
        baselinePct: skill.baselinePct,
        currentPct: skill.currentPct,
        growthPct: skill.growthPct,
      })),
      excluded_attempt_ids: [...moduleAttempts, ...questionAttempts, ...assessmentAttempts]
        .filter((row) => !row.counts_in_growth)
        .map((row) => row.id),
      suspicious_values: [...suspicious, ...growthSnapshot.warnings],
    },
    warnings,
  };
}

function renderMarkdown(report: AuditReport): string {
  const lines: string[] = [
    '# Student Growth Audit',
    '',
    `Generated: ${report.generated_at}`,
    `Supabase project: ${report.supabase_project_ref ?? 'unknown'}`,
    '',
    '## Summary',
    '',
    `- Students audited: ${report.summary.students_found}`,
    `- Multiple baseline attempts: ${report.summary.students_with_multiple_baselines}`,
    `- Multiple Week 1 attempts: ${report.summary.students_with_multiple_week1}`,
    `- Multiple Week 2 attempts: ${report.summary.students_with_multiple_week2}`,
    `- Replay-in-growth risk: ${report.summary.students_with_replay_in_growth_risk}`,
    '',
  ];

  for (const student of report.students_audited) {
    lines.push(`## ${student.child_name} (\`${student.participant_id}\`)`);
    lines.push('');
    lines.push(`- Parent/guardian: ${student.parent_guardian ?? '—'}`);
    lines.push(`- Family program: ${student.family_program_code ?? '—'}`);
    lines.push(`- Camp/program: ${student.camp_program_code ?? '—'}`);
    lines.push(`- Grade: ${student.grade_level ?? '—'}`);
    lines.push('');
    lines.push('### CURRENT DASHBOARD SOURCE');
    lines.push('');
    lines.push(`- Baseline source: ${student.current_dashboard_source.baseline_source ?? '—'}`);
    lines.push(`- Current score source: ${student.current_dashboard_source.current_score_source ?? '—'}`);
    lines.push(`- Growth source: ${student.current_dashboard_source.growth_source ?? '—'}`);
    lines.push('');
    lines.push('#### Canonical Focus Skills');
    lines.push('');
    lines.push('| Skill | Baseline | Current | Growth |');
    lines.push('| --- | --- | --- | --- |');
    for (const skill of student.current_dashboard_source.canonical_focus_skills) {
      lines.push(
        `| ${skill.label} | ${skill.baselinePct ?? '—'} | ${skill.currentPct ?? '—'} | ${skill.growthPct ?? '—'} |`,
      );
    }
    lines.push('');
    lines.push('#### Legacy inflated averages (old dashboard logic)');
    lines.push('');
    for (const [label, value] of Object.entries(student.current_dashboard_source.legacy_inflated_focus_skills)) {
      lines.push(`- ${label}: ${value}%`);
    }
    lines.push('');
    lines.push(`- Excluded attempts: ${student.current_dashboard_source.excluded_attempt_ids.length}`);
    if (student.current_dashboard_source.suspicious_values.length) {
      lines.push('');
      lines.push('#### Suspicious values');
      lines.push('');
      for (const item of student.current_dashboard_source.suspicious_values) {
        lines.push(`- ${item}`);
      }
    }
    lines.push('');
    lines.push('### Attempt counts');
    lines.push('');
    lines.push(`- Baseline attempts: ${student.baseline_attempts.length}`);
    lines.push(`- Week 1 attempts: ${student.week1_attempts.length}`);
    lines.push(`- Week 2 attempts: ${student.week2_attempts.length}`);
    lines.push(`- Replay attempts: ${student.replay_attempts.length}`);
    lines.push(`- Challenge attempts: ${student.challenge_attempts.length}`);
    lines.push(`- Question attempt rows: ${student.question_attempts.length}`);
    lines.push('');
    if (student.warnings.length) {
      lines.push('### Warnings');
      lines.push('');
      for (const warning of student.warnings) {
        lines.push(`- **${warning.severity.toUpperCase()}** \`${warning.code}\`: ${warning.message}`);
      }
      lines.push('');
    }
  }

  if (report.global_warnings.length) {
    lines.push('## Global warnings');
    lines.push('');
    for (const warning of report.global_warnings) {
      lines.push(`- **${warning.severity.toUpperCase()}** \`${warning.code}\`: ${warning.message}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

async function runAudit(): Promise<AuditReport> {
  loadEnvLocal();
  const url = process.env.REACT_APP_SUPABASE_URL?.trim();
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

  const nameHints = (process.env.STUDENT_NAME ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const targetHints = nameHints.length ? nameHints : TARGET_NAME_HINTS;

  if (!url || !key) {
    return {
      generated_at: new Date().toISOString(),
      supabase_project_ref: null,
      target_student_names: targetHints,
      students_audited: [],
      global_warnings: [
        {
          code: 'missing_supabase_env',
          severity: 'critical',
          message: 'Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY — audit ran without live data.',
        },
      ],
      summary: {
        students_found: 0,
        students_with_multiple_baselines: 0,
        students_with_multiple_week1: 0,
        students_with_multiple_week2: 0,
        students_with_replay_in_growth_risk: 0,
      },
    };
  }

  const projectRef =
    process.env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF?.trim() ||
    /^https:\/\/([^.]+)\.supabase\.co/.exec(url)?.[1] ||
    null;

  const [participants, familyLinks, assessments, moduleResults, questionAttempts] = await Promise.all([
    fetchAll<ParticipantRow>(
      url,
      key,
      'participants',
      'id, nickname, first_name, last_name, program_code, role, group_name, grade_level, created_at',
    ),
    fetchAll<FamilyLinkRow>(
      url,
      key,
      'student_family_links',
      'id, student_id, family_program_code, camp_program_code, parent_last_name, parent_claimed, created_at',
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

  const students = participants.filter((row) => row.role === 'student');
  const targetStudents = students.filter(
    (row) =>
      matchesTargetName(row, targetHints) ||
      familyLinks.some((link) => link.student_id === row.id && matchesParentName(link, targetHints)),
  );

  const audited = targetStudents.map((participant) =>
    auditStudent({
      participant,
      familyLinks,
      assessments,
      moduleResults,
      questionAttempts,
      legacyBaselines: [],
    }),
  );

  return {
    generated_at: new Date().toISOString(),
    supabase_project_ref: projectRef,
    target_student_names: targetHints,
    students_audited: audited,
    global_warnings: targetStudents.length
      ? []
      : [
          {
            code: 'target_student_not_found',
            severity: 'warning',
            message: `No students matched name hints: ${targetHints.join(', ')}`,
          },
        ],
    summary: {
      students_found: audited.length,
      students_with_multiple_baselines: audited.filter((row) => row.baseline_attempts.length > 1).length,
      students_with_multiple_week1: audited.filter((row) => row.week1_attempts.length > 1).length,
      students_with_multiple_week2: audited.filter((row) => row.week2_attempts.length > 1).length,
      students_with_replay_in_growth_risk: audited.filter((row) =>
        row.warnings.some((warning) => warning.code === 'replay_in_growth'),
      ).length,
    },
  };
}

async function main(): Promise<void> {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const report = await runAudit();
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(MD_PATH, renderMarkdown(report), 'utf8');

  console.log('\n=== Student Growth Audit ===\n');
  console.log(`Students audited: ${report.summary.students_found}`);
  for (const student of report.students_audited) {
    console.log(`\n${student.child_name} (${student.participant_id})`);
    console.log(`  Baseline attempts: ${student.baseline_attempts.length}`);
    console.log(`  Week 1 attempts: ${student.week1_attempts.length}`);
    console.log(`  Week 2 attempts: ${student.week2_attempts.length}`);
    console.log(`  Replay: ${student.replay_attempts.length} | Challenge: ${student.challenge_attempts.length}`);
    console.log(`  Dashboard baseline source: ${student.current_dashboard_source.baseline_source ?? '—'}`);
    console.log(`  Dashboard current source: ${student.current_dashboard_source.current_score_source ?? '—'}`);
    for (const skill of student.current_dashboard_source.canonical_focus_skills) {
      console.log(
        `  ${skill.label}: baseline=${skill.baselinePct ?? '—'} current=${skill.currentPct ?? '—'} growth=${skill.growthPct ?? '—'}`,
      );
    }
    if (student.warnings.length) {
      console.log(`  Warnings: ${student.warnings.length}`);
    }
  }

  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${MD_PATH}`);

  const hasCritical = [
    ...report.global_warnings,
    ...report.students_audited.flatMap((row) => row.warnings),
  ].some((warning) => warning.severity === 'critical');

  if (hasCritical) {
    process.exitCode = 1;
  }
}

void main();
