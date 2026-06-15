/**
 * Read-only audit: Week 2 pilot usage and reset impact.
 * Generates reports/week2-reset-impact.pdf (and .json).
 *
 * Usage: npm run audit:week2-reset
 */

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const PDF_PATH = path.join(REPORTS_DIR, 'week2-reset-impact.pdf');
const JSON_PATH = path.join(REPORTS_DIR, 'week2-reset-impact.json');

const WEEK_NUMBER = 2;
const WEEK_ID = 'week-2';
const CHARACTER_MISSION_IDS = ['caiden', 'miranda', 'zeke', 'charlie', 'b4'].map(
  (character) => `${character}-week-${WEEK_NUMBER}`,
);

/** Typical question count per weekly game when module_results are missing. */
const ESTIMATED_QUESTIONS_PER_WEEK2_MISSION = 3;
const WEEK_2_MODULE_IDS = new Set([
  'quest-2',
  'miranda-mystery-file-2',
  'b4-body-signal-detective',
  'charlie-floating-orange',
  'zeke-pass-the-ball',
]);

const META_ANSWER_KEYS = new Set([
  '_attempts',
  'participant_id',
  'grade_band_used',
  'grade_level_used',
  'content_version_id',
  'file_id',
  'mission_id',
  'module_id',
]);

type ParticipantRow = {
  id: string;
  nickname: string | null;
  first_name: string | null;
  program_code: string;
  role: string;
  group_name: string | null;
  created_at: string;
};

type PilotProgramRow = {
  program_code: string;
  program_name: string;
  pilot_status: string;
};

type AffectedRecord = {
  table: string;
  id: string;
  participant_id: string | null;
  participant_label: string;
  summary: string;
};

type UserWeek2Summary = {
  participant_id: string;
  label: string;
  program_code: string;
  group_name: string | null;
  missions_completed: number;
  missions_total: number;
  completion_pct: number;
  week2_fully_complete: boolean;
  questions_answered: number;
  module_result_count: number;
};

type AuditReport = {
  generated_at: string;
  supabase_project_ref: string | null;
  pilot_programs: PilotProgramRow[];
  pilot_student_count: number;
  week2_users_fully_complete: number;
  week2_users_with_any_activity: number;
  total_questions_answered_week2: number;
  estimated_questions_from_mission_completions: number;
  questions_tracking_note: string;
  average_completion_pct: number;
  average_completion_pct_active_users: number;
  user_summaries: UserWeek2Summary[];
  affected_records: AffectedRecord[];
  affected_by_table: Record<string, number>;
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

function participantLabel(row: Pick<ParticipantRow, 'nickname' | 'first_name' | 'id'>): string {
  return row.nickname?.trim() || row.first_name?.trim() || row.id.slice(0, 8);
}

function isWeek2MissionId(missionId: string | null | undefined): boolean {
  if (!missionId?.trim()) return false;
  const id = missionId.trim();
  return id.endsWith(`-week-${WEEK_NUMBER}`) || id === `weekly-quest-${WEEK_ID}`;
}

function isWeek2WeekId(weekId: string | null | undefined): boolean {
  return weekId?.trim() === WEEK_ID;
}

function isWeek2ModuleId(moduleId: string | null | undefined): boolean {
  if (!moduleId?.trim()) return false;
  return WEEK_2_MODULE_IDS.has(moduleId.trim());
}

function isWeek2RewardKey(rewardKey: string | null | undefined): boolean {
  if (!rewardKey?.trim()) return false;
  const key = rewardKey.trim();
  return key.includes(WEEK_ID) || key.includes(`week-${WEEK_NUMBER}`);
}

function countQuestionsInAnswersJson(answersJson: unknown): number {
  if (!answersJson || typeof answersJson !== 'object') return 0;
  const obj = answersJson as Record<string, unknown>;
  if (obj._attempts && typeof obj._attempts === 'object' && obj._attempts !== null) {
    return Object.keys(obj._attempts as Record<string, unknown>).length;
  }
  return Object.keys(obj).filter((key) => !META_ANSWER_KEYS.has(key) && !key.startsWith('_')).length;
}

function isWeek2ModuleResult(row: {
  module_id: string;
  answers_json?: unknown;
}): boolean {
  if (isWeek2ModuleId(row.module_id)) return true;
  if (!row.answers_json || typeof row.answers_json !== 'object') return false;
  const meta = row.answers_json as Record<string, unknown>;
  const missionId = typeof meta.mission_id === 'string' ? meta.mission_id : null;
  return isWeek2MissionId(missionId);
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

    if (response.status === 404 || response.status === 406) {
      return [];
    }

    if (!response.ok) {
      const body = await response.text();
      if (/does not exist|relation.*does not exist|42P01/i.test(body)) {
        return [];
      }
      throw new Error(`${table}: ${response.status} ${body}`);
    }

    const batch = (await response.json()) as T[];
    rows.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function runAudit(): Promise<AuditReport> {
  loadEnvLocal();
  const url = process.env.REACT_APP_SUPABASE_URL?.trim();
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error('Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY in .env.local');
  }

  const projectRef =
    process.env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF?.trim() ||
    /^https:\/\/([^.]+)\.supabase\.co/.exec(url)?.[1] ||
    null;

  const pilotPrograms = await fetchAll<PilotProgramRow>(
    url,
    key,
    'pilot_programs',
    'program_code, program_name, pilot_status',
  );
  const activeProgramCodes = new Set(
    pilotPrograms.filter((row) => row.pilot_status === 'active').map((row) => row.program_code),
  );
  const allProgramCodes = new Set(pilotPrograms.map((row) => row.program_code));

  const allParticipants = await fetchAll<ParticipantRow>(
    url,
    key,
    'participants',
    'id, nickname, first_name, program_code, role, group_name, created_at',
  );

  const pilotStudents = allParticipants.filter(
    (row) =>
      row.role === 'student' &&
      (activeProgramCodes.has(row.program_code) || allProgramCodes.has(row.program_code)),
  );
  const pilotStudentIds = new Set(pilotStudents.map((row) => row.id));
  const participantLookup = new Map(allParticipants.map((row) => [row.id, row]));

  const [
    playerProgress,
    playerBadges,
    participantWeekProgress,
    participantQuests,
    moduleResults,
    rewardClaims,
    campScreenshots,
    questionAttempts,
  ] = await Promise.all([
    fetchAll<{
      id: string;
      participant_id: string;
      week_id: string;
      mission_id: string;
      badge_unlocked: string | null;
      completed_at: string;
    }>(url, key, 'player_progress', 'id, participant_id, week_id, mission_id, badge_unlocked, completed_at'),
    fetchAll<{
      id: string;
      participant_id: string;
      week_id: string;
      mission_id: string;
      badge_name: string;
      earned_at: string;
    }>(url, key, 'player_badges', 'id, participant_id, week_id, mission_id, badge_name, earned_at'),
    fetchAll<{
      id: string;
      participant_id: string;
      week_id: string;
      week_grade_level: string | null;
      started_at: string;
    }>(url, key, 'participant_week_progress', 'id, participant_id, week_id, week_grade_level, started_at'),
    fetchAll<{
      id: string;
      participant_id: string;
      quest_period: string;
      quest_key: string;
      period_anchor: string | null;
      progress_count: number;
      target_count: number;
      claimed_at: string | null;
    }>(
      url,
      key,
      'participant_quests',
      'id, participant_id, quest_period, quest_key, period_anchor, progress_count, target_count, claimed_at',
    ),
    fetchAll<{
      id: string;
      participant_id: string | null;
      module_id: string;
      module_title: string;
      character: string;
      score: number;
      max_score: number;
      answers_json: unknown;
      completed_at: string;
      program_code: string;
    }>(
      url,
      key,
      'module_results',
      'id, participant_id, module_id, module_title, character, score, max_score, answers_json, completed_at, program_code',
    ),
    fetchAll<{
      id: string;
      participant_id: string;
      reward_key: string;
      reward_name: string;
      claimed_at: string;
    }>(url, key, 'player_reward_claims', 'id, participant_id, reward_key, reward_name, claimed_at'),
    fetchAll<{
      id: string;
      participant_id: string;
      week_id: string;
      mission_id: string;
      created_at: string;
    }>(url, key, 'camp_achievement_screenshots', 'id, participant_id, week_id, mission_id, created_at'),
    fetchAll<{
      id: string;
      participant_id: string;
      module_id: string | null;
      question_id: string;
      completed_at: string;
    }>(url, key, 'question_attempts', 'id, participant_id, module_id, question_id, completed_at'),
  ]);

  const week2Progress = playerProgress.filter(
    (row) =>
      pilotStudentIds.has(row.participant_id) &&
      (isWeek2WeekId(row.week_id) || isWeek2MissionId(row.mission_id)),
  );
  const week2Badges = playerBadges.filter(
    (row) =>
      pilotStudentIds.has(row.participant_id) &&
      (isWeek2WeekId(row.week_id) || isWeek2MissionId(row.mission_id)),
  );
  const week2WeekProgress = participantWeekProgress.filter(
    (row) => pilotStudentIds.has(row.participant_id) && isWeek2WeekId(row.week_id),
  );
  const week2Quests = participantQuests.filter((row) => {
    if (!pilotStudentIds.has(row.participant_id)) return false;
    const anchor = row.period_anchor?.trim() ?? '';
    return anchor === WEEK_ID || anchor === String(WEEK_NUMBER) || row.quest_key.includes(WEEK_ID);
  });
  const week2ModuleResults = moduleResults.filter(
    (row) =>
      row.participant_id &&
      pilotStudentIds.has(row.participant_id) &&
      isWeek2ModuleResult(row),
  );
  const week2RewardClaims = rewardClaims.filter(
    (row) => pilotStudentIds.has(row.participant_id) && isWeek2RewardKey(row.reward_key),
  );
  const week2Screenshots = campScreenshots.filter(
    (row) => pilotStudentIds.has(row.participant_id) && isWeek2WeekId(row.week_id),
  );
  const week2QuestionAttempts = questionAttempts.filter(
    (row) =>
      pilotStudentIds.has(row.participant_id) &&
      (isWeek2ModuleId(row.module_id) || isWeek2MissionId(row.module_id)),
  );

  const affectedRecords: AffectedRecord[] = [];
  const pushAffected = (
    table: string,
    id: string,
    participantId: string | null,
    summary: string,
  ) => {
    const participant = participantId ? participantLookup.get(participantId) : undefined;
    affectedRecords.push({
      table,
      id,
      participant_id: participantId,
      participant_label: participant ? participantLabel(participant) : participantId ?? 'unknown',
      summary,
    });
  };

  for (const row of week2Progress) {
    pushAffected(
      'player_progress',
      row.id,
      row.participant_id,
      `${row.mission_id} · ${row.week_id}${row.badge_unlocked ? ` · badge: ${row.badge_unlocked}` : ''}`,
    );
  }
  for (const row of week2Badges) {
    pushAffected(
      'player_badges',
      row.id,
      row.participant_id,
      `${row.badge_name} · ${row.mission_id} · ${row.week_id}`,
    );
  }
  for (const row of week2WeekProgress) {
    pushAffected(
      'participant_week_progress',
      row.id,
      row.participant_id,
      `${row.week_id}${row.week_grade_level ? ` · grade: ${row.week_grade_level}` : ''}`,
    );
  }
  for (const row of week2Quests) {
    pushAffected(
      'participant_quests',
      row.id,
      row.participant_id,
      `${row.quest_period}/${row.quest_key} · anchor ${row.period_anchor ?? '—'} · ${row.progress_count}/${row.target_count}${row.claimed_at ? ' · claimed' : ''}`,
    );
  }
  for (const row of week2ModuleResults) {
    const qCount = countQuestionsInAnswersJson(row.answers_json);
    pushAffected(
      'module_results',
      row.id,
      row.participant_id,
      `${row.module_id} · ${row.character} · score ${row.score}/${row.max_score} · ${qCount} questions`,
    );
  }
  for (const row of week2RewardClaims) {
    pushAffected(
      'player_reward_claims',
      row.id,
      row.participant_id,
      `${row.reward_key} · ${row.reward_name}`,
    );
  }
  for (const row of week2Screenshots) {
    pushAffected(
      'camp_achievement_screenshots',
      row.id,
      row.participant_id,
      `${row.mission_id} · ${row.week_id}`,
    );
  }
  for (const row of week2QuestionAttempts) {
    pushAffected(
      'question_attempts',
      row.id,
      row.participant_id,
      `${row.module_id ?? '—'} · ${row.question_id}`,
    );
  }

  const missionsTotal = CHARACTER_MISSION_IDS.length;
  const userSummaries: UserWeek2Summary[] = pilotStudents.map((student) => {
    const completedMissionIds = new Set(
      week2Progress
        .filter((row) => row.participant_id === student.id)
        .map((row) => row.mission_id),
    );
    const missionsCompleted = CHARACTER_MISSION_IDS.filter((missionId) =>
      completedMissionIds.has(missionId),
    ).length;

    const userModuleResults = week2ModuleResults.filter(
      (row) => row.participant_id === student.id,
    );
    const questionsFromModules = userModuleResults.reduce(
      (sum, row) => sum + countQuestionsInAnswersJson(row.answers_json),
      0,
    );
    const questionsFromAttempts = week2QuestionAttempts.filter(
      (row) => row.participant_id === student.id,
    ).length;
    const questionsAnswered = Math.max(questionsFromModules, questionsFromAttempts);

    const completionPct =
      missionsTotal > 0 ? Math.round((missionsCompleted / missionsTotal) * 100) : 0;

    return {
      participant_id: student.id,
      label: participantLabel(student),
      program_code: student.program_code,
      group_name: student.group_name,
      missions_completed: missionsCompleted,
      missions_total: missionsTotal,
      completion_pct: completionPct,
      week2_fully_complete: missionsCompleted >= missionsTotal,
      questions_answered: questionsAnswered,
      module_result_count: userModuleResults.length,
    };
  });

  const activeUsers = userSummaries.filter(
    (row) =>
      row.missions_completed > 0 ||
      row.questions_answered > 0 ||
      row.module_result_count > 0,
  );
  const fullyCompleteUsers = userSummaries.filter((row) => row.week2_fully_complete);
  const totalQuestions = userSummaries.reduce((sum, row) => sum + row.questions_answered, 0);
  const estimatedFromMissions = userSummaries.reduce((sum, row) => {
    if (row.questions_answered > 0) return sum + row.questions_answered;
    return sum + row.missions_completed * ESTIMATED_QUESTIONS_PER_WEEK2_MISSION;
  }, 0);
  const questionsTrackingNote =
    totalQuestions > 0
      ? 'Question counts are from module_results answers_json and question_attempts.'
      : 'No Week 2 rows in module_results or question_attempts. Mission completions exist in player_progress only; estimated question counts assume 3 questions per completed Week 2 mission.';
  const averageCompletion =
    pilotStudents.length > 0
      ? Math.round(
          userSummaries.reduce((sum, row) => sum + row.completion_pct, 0) / pilotStudents.length,
        )
      : 0;
  const averageCompletionActive =
    activeUsers.length > 0
      ? Math.round(
          activeUsers.reduce((sum, row) => sum + row.completion_pct, 0) / activeUsers.length,
        )
      : 0;

  const affectedByTable: Record<string, number> = {};
  for (const row of affectedRecords) {
    affectedByTable[row.table] = (affectedByTable[row.table] ?? 0) + 1;
  }

  return {
    generated_at: new Date().toISOString(),
    supabase_project_ref: projectRef,
    pilot_programs: pilotPrograms,
    pilot_student_count: pilotStudents.length,
    week2_users_fully_complete: fullyCompleteUsers.length,
    week2_users_with_any_activity: activeUsers.length,
    total_questions_answered_week2: totalQuestions,
    estimated_questions_from_mission_completions: estimatedFromMissions,
    questions_tracking_note: questionsTrackingNote,
    average_completion_pct: averageCompletion,
    average_completion_pct_active_users: averageCompletionActive,
    user_summaries: userSummaries.sort((left, right) => right.completion_pct - left.completion_pct),
    affected_records: affectedRecords,
    affected_by_table: affectedByTable,
  };
}

const MARGIN = 48;
const PAGE_WIDTH = 612;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
  if (doc.y + height > doc.page.height - MARGIN) doc.addPage();
}

function sectionTitle(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 28);
  doc.moveDown(0.4);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#1a365d').text(text, MARGIN, doc.y, {
    width: CONTENT_WIDTH,
  });
  doc.moveDown(0.25);
}

function bodyText(doc: PDFKit.PDFDocument, text: string, options?: { bold?: boolean; size?: number }): void {
  doc
    .font(options?.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(options?.size ?? 10)
    .fillColor('#1a202c')
    .text(text, MARGIN, doc.y, { width: CONTENT_WIDTH, lineGap: 2 });
}

async function generatePdf(report: AuditReport): Promise<void> {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'LETTER' });
    const stream = fs.createWriteStream(PDF_PATH);
    doc.pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(24).fillColor('#1a365d').text("Caiden's Courage", MARGIN, 72);
    doc.fontSize(18).text('Week 2 Reset Impact Audit', MARGIN, doc.y + 4);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#4a5568')
      .text(`Generated ${new Date(report.generated_at).toLocaleString()}`, MARGIN, doc.y + 10);
    doc.text(`Supabase project: ${report.supabase_project_ref ?? 'unknown'}`, MARGIN, doc.y + 4);
    doc.text('Read-only audit — no data was modified.', MARGIN, doc.y + 4);

    doc.addPage();
    sectionTitle(doc, 'Executive Summary');
    bodyText(doc, `Pilot programs tracked: ${report.pilot_programs.length}`);
    bodyText(doc, `Pilot student accounts: ${report.pilot_student_count}`);
    bodyText(doc, `Users who fully completed Week 2 (5/5 map missions): ${report.week2_users_fully_complete}`);
    bodyText(doc, `Users with any Week 2 activity: ${report.week2_users_with_any_activity}`);
    bodyText(doc, `Total Week 2 questions answered (tracked in module_results): ${report.total_questions_answered_week2}`);
    bodyText(
      doc,
      `Estimated Week 2 questions from mission completions: ${report.estimated_questions_from_mission_completions}`,
    );
    bodyText(doc, report.questions_tracking_note);
    bodyText(doc, `Average Week 2 completion % (all pilot users): ${report.average_completion_pct}%`);
    bodyText(
      doc,
      `Average Week 2 completion % (users with activity): ${report.average_completion_pct_active_users}%`,
    );
    doc.moveDown(0.4);
    bodyText(doc, 'Week 2 completion uses player_progress mission ids:', { bold: true });
    for (const missionId of CHARACTER_MISSION_IDS) {
      bodyText(doc, `• ${missionId}`);
    }
    doc.moveDown(0.4);
    bodyText(doc, 'Week 2 question counts use module_results for game module ids:', { bold: true });
    for (const moduleId of WEEK_2_MODULE_IDS) {
      bodyText(doc, `• ${moduleId}`);
    }

    doc.addPage();
    sectionTitle(doc, 'Pilot Programs');
    if (report.pilot_programs.length === 0) {
      bodyText(doc, 'No pilot_programs rows found.');
    } else {
      for (const program of report.pilot_programs) {
        bodyText(
          doc,
          `${program.program_code} — ${program.program_name} (${program.pilot_status})`,
        );
      }
    }

    doc.addPage();
    sectionTitle(doc, 'Per-User Week 2 Summary');
    const activeSummaries = report.user_summaries.filter(
      (row) => row.missions_completed > 0 || row.questions_answered > 0 || row.module_result_count > 0,
    );
    if (activeSummaries.length === 0) {
      bodyText(doc, 'No pilot users have Week 2 progress or question activity.');
    } else {
      for (const user of activeSummaries) {
        ensureSpace(doc, 44);
        bodyText(
          doc,
          `${user.label} · ${user.program_code}${user.group_name ? ` · ${user.group_name}` : ''}`,
          { bold: true },
        );
        bodyText(
          doc,
          `Missions ${user.missions_completed}/${user.missions_total} (${user.completion_pct}%) · Questions answered: ${user.questions_answered} · Module results: ${user.module_result_count}${user.week2_fully_complete ? ' · FULLY COMPLETE' : ''}`,
        );
        bodyText(doc, `participant_id: ${user.participant_id}`, { size: 8 });
        doc.moveDown(0.2);
      }
    }

    doc.addPage();
    sectionTitle(doc, 'Records That Would Be Affected By A Week 2 Reset');
    bodyText(
      doc,
      `Total affected records: ${report.affected_records.length}. A reset would remove or invalidate these rows across ${Object.keys(report.affected_by_table).length} tables.`,
    );
    doc.moveDown(0.3);
    for (const [table, count] of Object.entries(report.affected_by_table).sort((a, b) => b[1] - a[1])) {
      bodyText(doc, `${table}: ${count}`);
    }

    doc.addPage();
    sectionTitle(doc, 'Affected Record Detail');
    if (report.affected_records.length === 0) {
      bodyText(doc, 'No Week 2 records found for current pilot users.');
    } else {
      for (const record of report.affected_records) {
        ensureSpace(doc, 36);
        bodyText(doc, `${record.table} · ${record.id}`, { bold: true });
        bodyText(doc, `${record.participant_label} (${record.participant_id ?? 'no participant'})`);
        bodyText(doc, record.summary, { size: 9 });
        doc.moveDown(0.15);
      }
    }

    doc.end();
  });
}

async function main(): Promise<void> {
  console.log('[audit:week2-reset] Running read-only Supabase audit…');
  const report = await runAudit();
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await generatePdf(report);
  console.log('[audit:week2-reset] Wrote', JSON_PATH);
  console.log('[audit:week2-reset] Wrote', PDF_PATH);
  console.log('[audit:week2-reset] Summary:');
  console.log(`  Pilot students: ${report.pilot_student_count}`);
  console.log(`  Week 2 fully complete: ${report.week2_users_fully_complete}`);
  console.log(`  Week 2 questions (tracked): ${report.total_questions_answered_week2}`);
  console.log(`  Week 2 questions (estimated): ${report.estimated_questions_from_mission_completions}`);
  console.log(`  Average completion %: ${report.average_completion_pct}%`);
  console.log(`  Affected records: ${report.affected_records.length}`);
}

main().catch((error) => {
  console.error('[audit:week2-reset] Failed:', error);
  process.exit(1);
});
