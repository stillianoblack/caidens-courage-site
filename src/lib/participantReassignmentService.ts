import { isSupabaseConfigured, supabase } from './supabaseClient';

export type ParticipantReassignmentInput = {
  oldProgramCode: string;
  newProgramCode: string;
  participantId?: string;
  nickname?: string;
  firstName?: string;
};

export type ReassignmentTableCount = {
  table: string;
  count: number;
};

export type ParticipantReassignmentPreview = {
  input: ParticipantReassignmentInput;
  participantIds: string[];
  tables: ReassignmentTableCount[];
  log: string[];
  error?: string;
};

const TRACKING_TABLES = [
  'participants',
  'module_results',
  'assessment_results_v2',
  'assessment_results',
  'student_gallery_items',
] as const;

function normalizeCode(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? '';
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function buildParticipantFilter(input: ParticipantReassignmentInput): {
  participantIds: string[];
  participantWhereSql: string;
  assessmentLegacyWhereSql: string;
  log: string[];
} {
  const oldCode = normalizeCode(input.oldProgramCode);
  const participantId = normalizeText(input.participantId);
  const nickname = normalizeText(input.nickname);
  const firstName = normalizeText(input.firstName);
  const log: string[] = [
    `old_program_code: ${oldCode}`,
    `new_program_code: ${normalizeCode(input.newProgramCode)}`,
    `participant_id: ${participantId || '(none)'}`,
  ];

  if (participantId) {
    const where = `id = '${escapeSql(participantId)}' AND program_code = '${escapeSql(oldCode)}'`;
    return {
      participantIds: [participantId],
      participantWhereSql: where,
      assessmentLegacyWhereSql: `(student_id = '${escapeSql(participantId)}' OR nickname = (SELECT nickname FROM public.participants WHERE id = '${escapeSql(participantId)}' LIMIT 1) OR child_nickname = (SELECT nickname FROM public.participants WHERE id = '${escapeSql(participantId)}' LIMIT 1)) AND program_code = '${escapeSql(oldCode)}'`,
      log,
    };
  }

  if (!nickname && !firstName) {
    throw new Error('Provide participant_id or nickname/first_name for reassignment matching.');
  }

  const clauses = [`program_code = '${escapeSql(oldCode)}'`];
  if (nickname) clauses.push(`lower(nickname) = lower('${escapeSql(nickname)}')`);
  if (firstName) clauses.push(`lower(first_name) = lower('${escapeSql(firstName)}')`);
  const where = clauses.join(' AND ');
  log.push(`match: nickname=${nickname || '(any)'}, first_name=${firstName || '(any)'}`);

  const legacyClauses = [`program_code = '${escapeSql(oldCode)}'`];
  if (nickname) {
    legacyClauses.push(
      `(lower(nickname) = lower('${escapeSql(nickname)}') OR lower(child_nickname) = lower('${escapeSql(nickname)}'))`,
    );
  }
  if (firstName) {
    legacyClauses.push(`lower(first_name) = lower('${escapeSql(firstName)}')`);
  }

  return {
    participantIds: [],
    participantWhereSql: where,
    assessmentLegacyWhereSql: legacyClauses.join(' AND '),
    log,
  };
}

/** Read-only preview — counts rows that would be reassigned. */
export async function previewParticipantReassignment(
  input: ParticipantReassignmentInput,
): Promise<ParticipantReassignmentPreview> {
  const oldCode = normalizeCode(input.oldProgramCode);
  const newCode = normalizeCode(input.newProgramCode);

  if (!oldCode || !newCode) {
    return {
      input,
      participantIds: [],
      tables: [],
      log: [],
      error: 'Old and new program codes are required.',
    };
  }

  if (oldCode === newCode) {
    return {
      input,
      participantIds: [],
      tables: [],
      log: [],
      error: 'Old and new program codes must be different.',
    };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return {
      input,
      participantIds: [],
      tables: [],
      log: [],
      error: 'Supabase is not configured.',
    };
  }

  try {
    const filter = buildParticipantFilter(input);
    const participantIds = [...filter.participantIds];

    if (!participantIds.length) {
      let query = supabase.from('participants').select('id').eq('program_code', oldCode);
      const matchNickname = normalizeText(input.nickname);
      const matchFirstName = normalizeText(input.firstName);
      if (matchNickname) query = query.ilike('nickname', matchNickname);
      if (matchFirstName) query = query.ilike('first_name', matchFirstName);
      const { data, error } = await query;
      if (error) throw error;
      for (const row of data ?? []) {
        if (row.id) participantIds.push(row.id);
      }
    }

    if (!participantIds.length) {
      return {
        input,
        participantIds: [],
        tables: TRACKING_TABLES.map((table) => ({ table, count: 0 })),
        log: [...filter.log, 'matched_participants: 0'],
        error: 'No matching participants found for the provided criteria.',
      };
    }

    const tables: ReassignmentTableCount[] = [];
    const log = [...filter.log, `matched_participants: ${participantIds.length}`, `participant_ids: ${participantIds.join(', ')}`];

    for (const table of TRACKING_TABLES) {
      let count = 0;
      if (table === 'participants') {
        const { count: rowCount, error } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true })
          .in('id', participantIds);
        if (error) throw error;
        count = rowCount ?? 0;
      } else if (table === 'assessment_results') {
        const idFilters = participantIds.map((id) => `student_id.eq.${id}`).join(',');
        const nickname = normalizeText(input.nickname);
        const legacyFilter = nickname
          ? `${idFilters},nickname.ilike.${nickname},child_nickname.ilike.${nickname}`
          : idFilters;
        const { count: rowCount, error } = await supabase
          .from('assessment_results')
          .select('*', { count: 'exact', head: true })
          .eq('program_code', oldCode)
          .or(legacyFilter);
        if (error) throw error;
        count = rowCount ?? 0;
      } else {
        const { count: rowCount, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .eq('program_code', oldCode)
          .in('participant_id', participantIds);
        if (error) throw error;
        count = rowCount ?? 0;
      }
      tables.push({ table, count });
      log.push(`${table}: ${count} row(s)`);
    }

    log.push(`planned_new_program_code: ${newCode}`);

    return { input, participantIds, tables, log };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not preview reassignment.';
    return { input, participantIds: [], tables: [], log: [], error: message };
  }
}

/** Generates SQL for manual execution in Supabase — does not run updates. */
export function generateParticipantReassignmentSql(input: ParticipantReassignmentInput): {
  sql: string;
  log: string[];
  error?: string;
} {
  const oldCode = normalizeCode(input.oldProgramCode);
  const newCode = normalizeCode(input.newProgramCode);

  if (!oldCode || !newCode) {
    return { sql: '', log: [], error: 'Old and new program codes are required.' };
  }

  if (oldCode === newCode) {
    return { sql: '', log: [], error: 'Old and new program codes must be different.' };
  }

  try {
    const filter = buildParticipantFilter(input);
    const participantSubquery = `SELECT id FROM public.participants WHERE ${filter.participantWhereSql}`;
    const log = [
      ...filter.log,
      '-- Review counts before running. Execute in a transaction and verify row counts.',
      '-- BEGIN;',
    ];

    const statements = [
      `-- participants (${filter.participantWhereSql})`,
      `UPDATE public.participants SET program_code = '${escapeSql(newCode)}' WHERE ${filter.participantWhereSql};`,
      `-- module_results (participant_id in matched participants)`,
      `UPDATE public.module_results SET program_code = '${escapeSql(newCode)}' WHERE program_code = '${escapeSql(oldCode)}' AND participant_id IN (${participantSubquery});`,
      `-- assessment_results_v2`,
      `UPDATE public.assessment_results_v2 SET program_code = '${escapeSql(newCode)}' WHERE program_code = '${escapeSql(oldCode)}' AND participant_id IN (${participantSubquery});`,
      `-- assessment_results (legacy)`,
      `UPDATE public.assessment_results SET program_code = '${escapeSql(newCode)}' WHERE ${filter.assessmentLegacyWhereSql};`,
      `-- student_gallery_items`,
      `UPDATE public.student_gallery_items SET program_code = '${escapeSql(newCode)}' WHERE program_code = '${escapeSql(oldCode)}' AND (student_nickname IN (SELECT nickname FROM public.participants WHERE ${filter.participantWhereSql}) OR program_code = '${escapeSql(oldCode)}');`,
      '-- COMMIT;',
    ];

    return { sql: statements.join('\n\n'), log };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not generate SQL.';
    return { sql: '', log: [], error: message };
  }
}
