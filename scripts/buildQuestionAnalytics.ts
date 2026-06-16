/**
 * Question analytics report — per-question health scoring from live attempt data.
 *
 * Usage: yarn analytics:questions
 */

import fs from 'fs';
import path from 'path';
import { getQuestionAnalytics, type QuestionAttemptAnalyticsRow } from '../src/lib/analytics/getQuestionAnalytics';
import { collectAllQuestions } from './question-audit/collectQuestions';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'question-analytics.json');
const MD_PATH = path.join(REPORTS_DIR, 'question-analytics.md');

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

type SupabaseQuestionAttemptRow = {
  participant_id: string;
  program_code: string;
  week_number?: number | null;
  mission_id: string;
  character?: string | null;
  question_id: string;
  grade_level?: string | null;
  grade_band?: string | null;
  content_version?: string | null;
  selected_answer?: string | null;
  is_correct_first_try: boolean;
  is_correct_final: boolean;
  used_hint: boolean;
  attempt_count: number;
  attempt_type?: string | null;
  is_replay?: boolean;
  attempt_scope?: string | null;
  completed_at: string;
  created_at?: string;
};

function mapAttemptRow(row: SupabaseQuestionAttemptRow): QuestionAttemptAnalyticsRow {
  return {
    participant_id: row.participant_id,
    program_code: row.program_code,
    week_number: row.week_number,
    mission_id: row.mission_id,
    character: row.character,
    question_id: row.question_id,
    grade_level: row.grade_level,
    grade_band: row.grade_band,
    content_version: row.content_version,
    is_correct_first_try: row.is_correct_first_try,
    is_correct_final: row.is_correct_final,
    used_hint: row.used_hint,
    attempt_count: row.attempt_count,
    attempt_type: row.attempt_type,
    is_replay: row.is_replay,
    attempt_scope: row.attempt_scope,
    completed_at: row.completed_at,
    selected_answer: row.selected_answer,
    response_time_ms: null,
  };
}

function buildEnrichmentMap(): Record<
  string,
  {
    character: string;
    week_number: number | null;
    mission_id: string;
    grade_band: string;
    difficulty: string;
    skill: string;
  }
> {
  const map: Record<
    string,
    {
      character: string;
      week_number: number | null;
      mission_id: string;
      grade_band: string;
      difficulty: string;
      skill: string;
    }
  > = {};

  for (const question of collectAllQuestions()) {
    map[question.questionId] = {
      character: question.character,
      week_number: question.weekNumber ?? question.week,
      mission_id: question.missionId,
      grade_band: question.gradeBand,
      difficulty: question.difficulty,
      skill: question.skillTags[0] ?? question.skillArea ?? 'Other',
    };
  }

  return map;
}

function renderMarkdown(summary: ReturnType<typeof getQuestionAnalytics>): string {
  const lines: string[] = [
    '# Question Analytics',
    '',
    `Generated: ${summary.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Questions tracked: ${summary.totalQuestionsTracked}`,
    `- Total attempts: ${summary.totalAttempts}`,
    `- Average health score: ${summary.averageHealthScore}/100`,
    `- Not enough data: ${summary.notEnoughData}`,
    `- Too easy: ${summary.tooEasy}`,
    `- Too hard: ${summary.tooHard}`,
    `- Confusing: ${summary.confusing}`,
    `- Healthy: ${summary.healthy}`,
    `- Needs rewrite: ${summary.needsRewrite}`,
    '',
    '## Classification Rules',
    '',
    '- Difficulty labels require at least 10 valid canonical attempts.',
    '- Replay, challenge, test, and practice attempts are excluded unless `attempt_scope` is `canonical`.',
    '',
    '## Lowest Health Questions',
    '',
    '| Question ID | Character | Week | Canonical Attempts | First-try % | Final % | Status | Health | Flags |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const row of summary.rows.slice(0, 40)) {
    lines.push(
      `| \`${row.question_id}\` | ${row.character} | ${row.week_number ?? '—'} | ${row.canonical_attempts} | ${row.first_try_accuracy}% | ${row.final_accuracy}% | ${row.health_label} | ${row.health_score} | ${row.health_flags.join(', ') || '—'} |`,
    );
  }

  const flagged = summary.rows.filter(
    (row) => row.health_status !== 'NOT_ENOUGH_DATA' && row.health_status !== 'HEALTHY',
  );
  if (flagged.length) {
    lines.push('', '## Health Flags', '');
    for (const row of flagged.slice(0, 30)) {
      lines.push(
        `- \`${row.question_id}\` (${row.character}, week ${row.week_number ?? '—'}): **${row.health_label}** — first-try ${row.first_try_accuracy}%, health ${row.health_score}${row.health_flags.length ? ` (${row.health_flags.join(', ')})` : ''}`,
      );
      if (row.most_selected_wrong_answer) {
        lines.push(`  - Dominant wrong answer: "${row.most_selected_wrong_answer}"`);
      }
    }
  }

  return `${lines.join('\n')}\n`;
}

async function main(): Promise<void> {
  loadEnvLocal();
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const enrichment = buildEnrichmentMap();
  let attemptRows: QuestionAttemptAnalyticsRow[] = [];

  const url = process.env.REACT_APP_SUPABASE_URL?.trim();
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

  if (url && key) {
    const raw = await fetchAll<SupabaseQuestionAttemptRow>(
      url,
      key,
      'question_attempts',
      'participant_id, program_code, week_number, mission_id, character, question_id, grade_level, grade_band, content_version, selected_answer, is_correct_first_try, is_correct_final, used_hint, attempt_count, attempt_type, is_replay, attempt_scope, completed_at, created_at',
    );
    attemptRows = raw.map(mapAttemptRow);
  }

  const summary = getQuestionAnalytics(attemptRows, enrichment);
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(MD_PATH, renderMarkdown(summary), 'utf8');

  console.log('\n=== Question Analytics ===\n');
  console.log(`Questions tracked: ${summary.totalQuestionsTracked}`);
  console.log(`Total attempts: ${summary.totalAttempts}`);
  console.log(`Average health: ${summary.averageHealthScore}/100`);
  console.log(
    `Not enough data: ${summary.notEnoughData} | Too easy: ${summary.tooEasy} | Too hard: ${summary.tooHard} | Confusing: ${summary.confusing} | Healthy: ${summary.healthy}`,
  );
  console.log(`Needs rewrite: ${summary.needsRewrite}`);
  console.log(`\nWrote ${JSON_PATH}`);
  console.log(`Wrote ${MD_PATH}`);

  if (!url || !key) {
    console.warn('\nNo Supabase credentials — report generated from empty attempt set.');
  }
}

void main();
