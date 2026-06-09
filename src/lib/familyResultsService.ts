import type { AssessmentResultRow } from './assessmentResultsService';
import { resolveTrackingProgramCode } from './activeProgramContext';
import { DASHBOARD_FETCH_TIMEOUT_MS, withTimeout } from './fetchWithTimeout';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { LocalAssessmentV2Record } from './pilotTrackingLocalStorage';
import {
  fetchAssessmentV2ForParticipants,
  type StudentParticipantRecord,
} from './pilotTrackingService';
import {
  isStudentVisibleToFamily,
  resolveFamilyVisibleChildren,
} from './studentFamilyLinkService';

export type FamilyResultEntry = {
  id: string;
  personName: string;
  role: 'student' | 'adult';
  assessmentType: string;
  assessmentLabel: string;
  latestScore: number | null;
  maxScore: number | null;
  percentScore: number | null;
  completedAt: string;
  progressSummary: string;
  source: 'legacy' | 'v2';
};

export type FamilyResultsLoad = {
  children: FamilyResultEntry[];
  adults: FamilyResultEntry[];
  error?: string;
};

function formatAssessmentLabel(type: string): string {
  switch (type) {
    case 'baseline':
      return 'B-4 Check-In';
    case 'final':
      return 'Growth Check';
    case 'adult_pre':
    case 'adult_baseline':
      return 'Parent Baseline';
    case 'adult_post':
    case 'adult_growth':
      return 'Parent Growth Check';
    default:
      return type.replace(/_/g, ' ');
  }
}

function resolvePersonName(row: {
  nickname?: string | null;
  first_name?: string | null;
  child_nickname?: string | null;
}): string {
  return row.nickname?.trim() || row.first_name?.trim() || row.child_nickname?.trim() || 'Participant';
}

function studentScoreFromLegacy(row: AssessmentResultRow): {
  score: number | null;
  max: number | null;
  pct: number | null;
} {
  const feelings = row.feelings_score ?? 0;
  const reading = row.reading_score ?? 0;
  const focus = row.focus_moves_score ?? 0;
  const total = feelings + reading + focus;
  const max = 60;
  return { score: total, max, pct: max > 0 ? Math.round((total / max) * 100) : null };
}

function adultScoreFromLegacy(row: AssessmentResultRow): {
  score: number | null;
  max: number | null;
  pct: number | null;
} {
  const score = row.total_score ?? null;
  const max = row.total_questions ?? 12;
  return {
    score,
    max,
    pct: score != null && max > 0 ? Math.round((score / max) * 100) : null,
  };
}

function scoreFromV2(row: LocalAssessmentV2Record): {
  score: number | null;
  max: number | null;
  pct: number | null;
} {
  return {
    score: row.total_score ?? null,
    max: row.max_score ?? null,
    pct: row.percent_score ?? null,
  };
}

function buildProgressSummary(role: 'student' | 'adult', pct: number | null): string {
  if (pct == null) return role === 'student' ? 'Assessment saved' : 'Reflection saved';
  if (pct >= 75) return 'Strong progress';
  if (pct >= 40) return 'Building momentum';
  return 'Getting started';
}

async function fetchLegacyRows(programCode: string): Promise<AssessmentResultRow[]> {
  if (!supabase) return [];
  const { data, error } = await withTimeout(
    supabase
      .from('assessment_results')
      .select('*')
      .eq('program_code', programCode)
      .order('completed_at', { ascending: false }),
    DASHBOARD_FETCH_TIMEOUT_MS,
    'family_assessment_results',
  );
  if (error) throw error;
  return (data ?? []) as AssessmentResultRow[];
}

async function fetchV2Rows(programCode: string): Promise<LocalAssessmentV2Record[]> {
  if (!supabase) return [];
  const { data, error } = await withTimeout(
    supabase
      .from('assessment_results_v2')
      .select('*')
      .eq('program_code', programCode)
      .order('completed_at', { ascending: false }),
    DASHBOARD_FETCH_TIMEOUT_MS,
    'family_assessment_results_v2',
  );
  if (error) throw error;
  return (data ?? []) as LocalAssessmentV2Record[];
}

async function fetchAdultParticipants(programCode: string): Promise<StudentParticipantRecord[]> {
  if (!supabase) return [];
  const { data, error } = await withTimeout(
    supabase
      .from('participants')
      .select('id, nickname, first_name, role, program_code, created_at')
      .eq('program_code', programCode)
      .eq('role', 'adult')
      .order('created_at', { ascending: true }),
    DASHBOARD_FETCH_TIMEOUT_MS,
    'family_adult_participants',
  );
  if (error) throw error;
  return (data ?? []) as StudentParticipantRecord[];
}

function isAdultLegacyRow(row: AssessmentResultRow): boolean {
  const type = row.assessment_type?.toLowerCase() ?? '';
  return type.startsWith('adult') || row.role === 'adult' || Boolean(row.email?.trim());
}

function isStudentLegacyRow(row: AssessmentResultRow): boolean {
  return !isAdultLegacyRow(row);
}

function resultCoverageKey(personKey: string, assessmentType: string): string {
  return `${personKey.trim().toLowerCase()}::${assessmentType.trim().toLowerCase()}`;
}

function markCoverage(covered: Set<string>, personKey: string, assessmentType: string): void {
  covered.add(resultCoverageKey(personKey, assessmentType));
}

function isCovered(covered: Set<string>, personKey: string, assessmentType: string): boolean {
  return covered.has(resultCoverageKey(personKey, assessmentType));
}

export async function loadFamilyResults(programCode?: string): Promise<FamilyResultsLoad> {
  const resolvedCode = programCode?.trim() || resolveTrackingProgramCode();
  if (!resolvedCode) {
    return { children: [], adults: [], error: 'Missing active program context.' };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { children: [], adults: [], error: 'Supabase is not configured.' };
  }

  try {
    const visibility = await resolveFamilyVisibleChildren(resolvedCode);
    const allowedStudentIds = visibility.allowedStudentIds;

    const [legacyRows, v2Rows, v2LinkedRows, adultParticipants] = await Promise.all([
      fetchLegacyRows(resolvedCode),
      fetchV2Rows(resolvedCode),
      fetchAssessmentV2ForParticipants(allowedStudentIds),
      fetchAdultParticipants(resolvedCode),
    ]);

    const studentParticipants = visibility.children.map((child) => {
      const participant = visibility.participants.find((row) => row.id === child.studentId);
      return (
        participant ?? {
          id: child.studentId,
          nickname: child.displayName,
          first_name: child.displayName,
          role: 'student',
          program_code: resolvedCode,
          created_at: new Date().toISOString(),
        }
      );
    });

    const mergedV2Rows = [...v2Rows, ...v2LinkedRows.results].filter((row, index, all) => {
      const key = `${row.participant_id}-${row.assessment_type}-${row.completed_at}`;
      return all.findIndex((entry) => `${entry.participant_id}-${entry.assessment_type}-${entry.completed_at}` === key) === index;
    });

    const children: FamilyResultEntry[] = [];
    const adults: FamilyResultEntry[] = [];
    const coveredChild = new Set<string>();
    const coveredAdult = new Set<string>();

    for (const row of mergedV2Rows.filter(
      (entry) =>
        entry.role === 'student' && isStudentVisibleToFamily(entry.participant_id, allowedStudentIds),
    )) {
      const participant = studentParticipants.find((p) => p.id === row.participant_id);
      const answers = row.answers_json as { nickname?: string } | undefined;
      const name =
        participant?.nickname?.trim() ||
        participant?.first_name?.trim() ||
        answers?.nickname?.trim() ||
        'Child';
      const personKey = row.participant_id || name;
      markCoverage(coveredChild, personKey, row.assessment_type);
      markCoverage(coveredChild, name, row.assessment_type);
      const key = `v2-student-${row.participant_id}-${row.assessment_type}-${row.completed_at}`;
      const scores = scoreFromV2(row);
      children.push({
        id: key,
        personName: name,
        role: 'student',
        assessmentType: row.assessment_type,
        assessmentLabel: formatAssessmentLabel(row.assessment_type),
        latestScore: scores.score,
        maxScore: scores.max,
        percentScore: scores.pct,
        completedAt: row.completed_at,
        progressSummary: buildProgressSummary('student', scores.pct),
        source: 'v2',
      });
    }

    for (const row of legacyRows.filter(isStudentLegacyRow)) {
      if (!isStudentVisibleToFamily(row.student_id, allowedStudentIds)) {
        continue;
      }
      const name = resolvePersonName(row);
      const personKey = row.student_id?.trim() || name;
      if (
        isCovered(coveredChild, personKey, row.assessment_type) ||
        isCovered(coveredChild, name, row.assessment_type)
      ) {
        continue;
      }
      const key = `legacy-student-${name.toLowerCase()}-${row.assessment_type}-${row.completed_at ?? row.created_at ?? ''}`;
      const scores = studentScoreFromLegacy(row);
      children.push({
        id: key,
        personName: name,
        role: 'student',
        assessmentType: row.assessment_type,
        assessmentLabel: formatAssessmentLabel(row.assessment_type),
        latestScore: scores.score,
        maxScore: scores.max,
        percentScore: scores.pct,
        completedAt: row.completed_at || row.created_at || '',
        progressSummary: buildProgressSummary('student', scores.pct),
        source: 'legacy',
      });
    }

    for (const row of mergedV2Rows.filter((entry) => entry.role === 'adult')) {
      const participant = adultParticipants.find((p) => p.id === row.participant_id);
      const name = participant?.first_name?.trim() || participant?.nickname?.trim() || 'Parent / Guardian';
      const personKey = row.participant_id || name;
      markCoverage(coveredAdult, personKey, row.assessment_type);
      markCoverage(coveredAdult, name, row.assessment_type);
      const key = `v2-adult-${row.participant_id}-${row.assessment_type}-${row.completed_at}`;
      const scores = scoreFromV2(row);
      adults.push({
        id: key,
        personName: name,
        role: 'adult',
        assessmentType: row.assessment_type,
        assessmentLabel: formatAssessmentLabel(row.assessment_type),
        latestScore: scores.score,
        maxScore: scores.max,
        percentScore: scores.pct,
        completedAt: row.completed_at,
        progressSummary: buildProgressSummary('adult', scores.pct),
        source: 'v2',
      });
    }

    for (const row of legacyRows.filter(isAdultLegacyRow)) {
      const name = resolvePersonName(row);
      const personKey = row.email?.trim().toLowerCase() || name;
      if (
        isCovered(coveredAdult, personKey, row.assessment_type) ||
        isCovered(coveredAdult, name, row.assessment_type)
      ) {
        continue;
      }
      const key = `legacy-adult-${name.toLowerCase()}-${row.assessment_type}-${row.completed_at ?? ''}`;
      const scores = adultScoreFromLegacy(row);
      adults.push({
        id: key,
        personName: name,
        role: 'adult',
        assessmentType: row.assessment_type,
        assessmentLabel: formatAssessmentLabel(row.assessment_type),
        latestScore: scores.score,
        maxScore: scores.max,
        percentScore: scores.pct,
        completedAt: row.completed_at || row.created_at || '',
        progressSummary: buildProgressSummary('adult', scores.pct),
        source: 'legacy',
      });
    }

    const sortByDate = (a: FamilyResultEntry, b: FamilyResultEntry) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();

    return {
      children: children.sort(sortByDate),
      adults: adults.sort(sortByDate),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not load family results.';
    return { children: [], adults: [], error: message };
  }
}
