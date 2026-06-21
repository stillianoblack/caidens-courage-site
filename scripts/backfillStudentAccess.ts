/**
 * Backfill student access fields for existing camp students:
 * - missing PIN hash/fingerprint (+ reveal value when column exists)
 * - missing family claim codes
 * - display name repair from nickname/first_name
 * - camp student_family_links stubs (does not overwrite valid parent links)
 *
 * Usage: yarn backfill:student-access [--program=CODE] [--include-pins-export]
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
const {
  generateStudentPin,
  hashStudentPin,
  generateFamilyClaimCode,
} = require('../netlify/functions/_lib/studentPinCrypto');

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'student-access-backfill.json');
const MD_PATH = path.join(REPORTS_DIR, 'student-access-backfill.md');
const PIN_EXPORT_PATH = path.join(REPORTS_DIR, 'student-access-backfill-roster-export.csv');

type ParticipantRow = {
  id: string;
  first_name: string | null;
  nickname: string | null;
  display_name: string | null;
  child_name: string | null;
  program_code: string;
  student_pin_hash: string | null;
  student_pin_fingerprint: string | null;
  student_pin_reveal_value: string | null;
  family_claim_code: string | null;
  parent_connection_status: string | null;
  role: string;
};

type BackfillAction = {
  participantId: string;
  programCode: string;
  displayName: string;
  nameRepaired: boolean;
  pinAssigned: boolean;
  claimCodeAssigned: boolean;
  linkStubCreated: boolean;
  parentConnectionStatus: string;
};

function resolveSupabase() {
  const url = (process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function resolveDisplayName(row: ParticipantRow): string {
  return (
    row.nickname?.trim() ||
    row.first_name?.trim() ||
    row.display_name?.trim() ||
    row.child_name?.trim() ||
    'Student'
  );
}

function genericStoredName(row: ParticipantRow): boolean {
  const nick = row.nickname?.trim().toLowerCase();
  const first = row.first_name?.trim().toLowerCase();
  return nick === 'child' || first === 'child' || nick === 'unknown student' || first === 'unknown student';
}

async function fingerprintTaken(
  supabase: ReturnType<typeof createClient>,
  programCode: string,
  fingerprint: string,
  exceptId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('participants')
    .select('id')
    .eq('program_code', programCode)
    .eq('student_pin_fingerprint', fingerprint)
    .neq('id', exceptId)
    .limit(1);
  return Boolean(data?.length);
}

async function assignUniquePin(
  supabase: ReturnType<typeof createClient>,
  programCode: string,
  participantId: string,
): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const pin = generateStudentPin(4);
    const { hash, fingerprint } = hashStudentPin(programCode, pin);
    const taken = await fingerprintTaken(supabase, programCode, fingerprint, participantId);
    if (taken) continue;

    const now = new Date().toISOString();
    const payload: Record<string, unknown> = {
      student_pin_hash: hash,
      student_pin_fingerprint: fingerprint,
      student_pin_enabled: true,
      student_pin_last_rotated_at: now,
      student_pin_reveal_value: pin,
    };

    let { error } = await supabase.from('participants').update(payload).eq('id', participantId);
    if (error && /student_pin_reveal_value|column/.test(error.message)) {
      delete payload.student_pin_reveal_value;
      ({ error } = await supabase.from('participants').update(payload).eq('id', participantId));
    }

    if (!error) return pin;
    if (!/duplicate|unique|23505/i.test(error.message)) {
      throw new Error(error.message);
    }
  }
  throw new Error(`Could not assign unique PIN for ${participantId}`);
}

async function ensureClaimCode(
  supabase: ReturnType<typeof createClient>,
  participantId: string,
  existing?: string | null,
): Promise<string> {
  if (existing?.trim()) return existing.trim();

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generateFamilyClaimCode();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('participants')
      .update({
        family_claim_code: code,
        family_claim_code_created_at: now,
      })
      .eq('id', participantId)
      .is('family_claim_code', null);

    if (!error) return code;
    if (!/duplicate|unique|23505/i.test(error.message)) {
      throw new Error(error.message);
    }
  }
  throw new Error(`Could not assign claim code for ${participantId}`);
}

async function ensureLinkStub(
  supabase: ReturnType<typeof createClient>,
  participantId: string,
  campProgramCode: string,
): Promise<boolean> {
  const { data: existing } = await supabase
    .from('student_family_links')
    .select('id')
    .eq('student_id', participantId)
    .eq('camp_program_code', campProgramCode)
    .limit(1);

  if (existing?.length) return false;

  const { error } = await supabase.from('student_family_links').insert({
    student_id: participantId,
    camp_program_code: campProgramCode,
    family_program_code: null,
    parent_last_name: 'Pending',
    parent_claimed: false,
    relationship: 'parent',
  });

  if (error) throw new Error(error.message);
  return true;
}

async function repairDisplayName(
  supabase: ReturnType<typeof createClient>,
  row: ParticipantRow,
): Promise<boolean> {
  if (!genericStoredName(row)) return false;

  const resolved = resolveDisplayName(row);
  if (resolved === 'Student') return false;

  const payload: Record<string, string> = {};
  if (!row.nickname?.trim() || row.nickname.trim().toLowerCase() === 'child') {
    payload.nickname = resolved;
  }
  if (!row.first_name?.trim() || row.first_name.trim().toLowerCase() === 'child') {
    payload.first_name = resolved;
  }

  if (!Object.keys(payload).length) return false;

  const { error } = await supabase.from('participants').update(payload).eq('id', row.id);
  if (error) throw new Error(error.message);
  return true;
}

async function main() {
  const programFilter = process.argv.find((arg) => arg.startsWith('--program='))?.split('=')[1]?.trim();
  const includePinExport = process.argv.includes('--include-pins-export');

  const supabase = resolveSupabase();
  if (!supabase) {
    console.error('Supabase service role env is not configured.');
    process.exit(1);
  }

  let query = supabase
    .from('participants')
    .select(
      'id, first_name, nickname, display_name, child_name, program_code, student_pin_hash, student_pin_fingerprint, student_pin_reveal_value, family_claim_code, parent_connection_status, role',
    )
    .eq('role', 'student');

  if (programFilter) {
    query = query.eq('program_code', programFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const students = (data ?? []) as ParticipantRow[];
  const { data: activePrograms } = await supabase
    .from('pilot_programs')
    .select('program_code')
    .eq('pilot_status', 'active');
  const activeCodes = new Set((activePrograms ?? []).map((row) => String(row.program_code)));

  const scopedStudents = students.filter((row) =>
    programFilter ? true : activeCodes.has(row.program_code),
  );

  const actions: BackfillAction[] = [];
  const pinExportRows: string[] = ['participant_id,display_name,program_code,pin,claim_code'];

  for (const row of scopedStudents) {
    let pinAssigned = false;
    let claimCodeAssigned = false;
    let linkStubCreated = false;
    let nameRepaired = false;
    let assignedPin: string | null = null;

    nameRepaired = await repairDisplayName(supabase, row);

    const hasPin = Boolean(row.student_pin_hash?.trim() && row.student_pin_fingerprint?.trim());
    if (!hasPin) {
      assignedPin = await assignUniquePin(supabase, row.program_code, row.id);
      pinAssigned = true;
    }

    const claimBefore = row.family_claim_code;
    const claimCode = await ensureClaimCode(supabase, row.id, claimBefore);
    claimCodeAssigned = !claimBefore?.trim();

    linkStubCreated = await ensureLinkStub(supabase, row.id, row.program_code);

    const { data: links } = await supabase
      .from('student_family_links')
      .select('parent_claimed, parent_email')
      .eq('student_id', row.id);

    const linked = (links ?? []) as Array<{ parent_claimed: boolean; parent_email: string | null }>;
    const connected = linked.some(
      (item) => item.parent_claimed && Boolean(item.parent_email?.trim()),
    );
    const invited = linked.some((item) => Boolean(item.parent_email?.trim()));
    const parentConnectionStatus = connected ? 'connected' : invited ? 'invited' : 'unclaimed';

    await supabase
      .from('participants')
      .update({ parent_connection_status: parentConnectionStatus })
      .eq('id', row.id);

    actions.push({
      participantId: row.id,
      programCode: row.program_code,
      displayName: resolveDisplayName(row),
      nameRepaired,
      pinAssigned,
      claimCodeAssigned,
      linkStubCreated,
      parentConnectionStatus,
    });

    if (includePinExport && assignedPin) {
      pinExportRows.push(
        [row.id, resolveDisplayName(row), row.program_code, assignedPin, claimCode].join(','),
      );
    }
  }

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const report = {
    generatedAt: new Date().toISOString(),
    programFilter: programFilter ?? null,
    studentsProcessed: actions.length,
    namesRepaired: actions.filter((row) => row.nameRepaired).length,
    pinsAssigned: actions.filter((row) => row.pinAssigned).length,
    claimCodesAssigned: actions.filter((row) => row.claimCodeAssigned).length,
    linkStubsCreated: actions.filter((row) => row.linkStubCreated).length,
    parentConnected: actions.filter((row) => row.parentConnectionStatus === 'connected').length,
    parentInvited: actions.filter((row) => row.parentConnectionStatus === 'invited').length,
    parentUnclaimed: actions.filter((row) => row.parentConnectionStatus === 'unclaimed').length,
    actions,
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(report, null, 2));

  const md = [
    '# Student Access Backfill',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `- Students processed: ${report.studentsProcessed}`,
    `- Names repaired: ${report.namesRepaired}`,
    `- PINs assigned: ${report.pinsAssigned}`,
    `- Claim codes assigned: ${report.claimCodesAssigned}`,
    `- Family link stubs created: ${report.linkStubsCreated}`,
    `- Parent connected: ${report.parentConnected}`,
    `- Parent invited: ${report.parentInvited}`,
    `- Parent unclaimed: ${report.parentUnclaimed}`,
    '',
    includePinExport
      ? `Secure PIN export: ${path.basename(PIN_EXPORT_PATH)}`
      : 'Run with --include-pins-export for one-time secure roster CSV.',
  ].join('\n');

  fs.writeFileSync(MD_PATH, md);

  if (includePinExport && pinExportRows.length > 1) {
    fs.writeFileSync(PIN_EXPORT_PATH, pinExportRows.join('\n'));
  }

  console.log(`Wrote ${JSON_PATH}`);
  console.log(`Wrote ${MD_PATH}`);
  if (includePinExport && pinExportRows.length > 1) {
    console.log(`Wrote ${PIN_EXPORT_PATH}`);
  }
}

void main();
