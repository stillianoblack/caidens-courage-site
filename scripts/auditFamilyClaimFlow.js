#!/usr/bin/env node
/**
 * Audit family claim / student access data integrity.
 *
 * Usage: yarn audit:family-claim-flow
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const JSON_PATH = path.join(REPORTS_DIR, 'family-claim-flow-audit.json');
const MD_PATH = path.join(REPORTS_DIR, 'family-claim-flow-audit.md');

function resolveSupabase() {
  const url = (process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function resolveDisplayName(row) {
  return (
    row.nickname?.trim() ||
    row.first_name?.trim() ||
    row.display_name?.trim() ||
    row.child_name?.trim() ||
    null
  );
}

function isGenericName(row) {
  const label = resolveDisplayName(row);
  if (!label) return true;
  const lower = label.toLowerCase();
  return lower === 'child' || lower === 'unknown student';
}

async function main() {
  const supabase = resolveSupabase();
  const findings = [];

  if (!supabase) {
    findings.push({
      severity: 'info',
      kind: 'supabase_unconfigured',
      detail: 'Supabase service role env is not configured. Skipping live data checks.',
    });
  } else {
    const { data: students, error } = await supabase
      .from('participants')
      .select(
        'id, first_name, nickname, display_name, child_name, program_code, student_pin_hash, student_pin_fingerprint, student_pin_enabled, family_claim_code, parent_connection_status, role',
      )
      .eq('role', 'student');

    if (error) {
      findings.push({ severity: 'error', kind: 'query_failed', detail: error.message });
    } else {
      const claimCodeMap = new Map();

      for (const row of students ?? []) {
        const id = String(row.id);
        const programCode = String(row.program_code || '').trim();

        if (!resolveDisplayName(row)) {
          findings.push({
            severity: 'warning',
            kind: 'missing_name',
            participantId: id,
            programCode,
          });
        }

        if (isGenericName(row)) {
          const better =
            row.nickname?.trim() ||
            row.first_name?.trim() ||
            row.display_name?.trim() ||
            row.child_name?.trim();
          if (better && better.toLowerCase() !== 'child') {
            findings.push({
              severity: 'warning',
              kind: 'generic_name_with_better_field',
              participantId: id,
              programCode,
              stored: resolveDisplayName(row),
              better,
            });
          }
        }

        if (!row.student_pin_hash?.trim() || !row.student_pin_fingerprint?.trim()) {
          findings.push({
            severity: 'warning',
            kind: 'missing_pin',
            participantId: id,
            programCode,
          });
        }

        if (row.student_pin_enabled === false && row.student_pin_hash) {
          findings.push({
            severity: 'info',
            kind: 'pin_disabled',
            participantId: id,
            programCode,
          });
        }

        if (!row.family_claim_code?.trim()) {
          findings.push({
            severity: 'warning',
            kind: 'missing_family_claim_code',
            participantId: id,
            programCode,
          });
        } else {
          const code = row.family_claim_code.trim().toUpperCase();
          const scopedKey = `${programCode}|${code}`;
          if (claimCodeMap.has(scopedKey)) {
            findings.push({
              severity: 'error',
              kind: 'duplicate_claim_code_in_program',
              programCode,
              claimCode: code,
              participantIds: [claimCodeMap.get(scopedKey), id],
            });
          } else {
            claimCodeMap.set(scopedKey, id);
          }
        }

        if (row.parent_connection_status === 'connected') {
          const { data: links } = await supabase
            .from('student_family_links')
            .select('id, parent_email, parent_claimed')
            .eq('student_id', id);

          const connectedLink = (links ?? []).find(
            (link) => link.parent_claimed && link.parent_email?.trim(),
          );
          if (!connectedLink) {
            findings.push({
              severity: 'error',
              kind: 'parent_connected_without_email',
              participantId: id,
              programCode,
            });
          }
        }
      }

      const { data: orphanPins } = await supabase
        .from('participants')
        .select('id, program_code, student_pin_fingerprint')
        .eq('role', 'student')
        .not('student_pin_fingerprint', 'is', null);

      const programCodes = new Set(
        (students ?? []).map((row) => String(row.program_code || '').trim()).filter(Boolean),
      );

      for (const row of orphanPins ?? []) {
        const programCode = String(row.program_code || '').trim();
        if (!programCode || !programCodes.has(programCode)) {
          findings.push({
            severity: 'warning',
            kind: 'pin_without_matching_program_scope',
            participantId: String(row.id),
            programCode,
          });
        }
      }
    }
  }

  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const summary = {
    generatedAt: new Date().toISOString(),
    findingCount: findings.length,
    errors: findings.filter((row) => row.severity === 'error').length,
    warnings: findings.filter((row) => row.severity === 'warning').length,
    findings,
  };

  fs.writeFileSync(JSON_PATH, JSON.stringify(summary, null, 2));

  const md = [
    '# Family Claim Flow Audit',
    '',
    `Generated: ${summary.generatedAt}`,
    '',
    `- Findings: ${summary.findingCount}`,
    `- Errors: ${summary.errors}`,
    `- Warnings: ${summary.warnings}`,
    '',
    'See JSON report for full detail.',
  ].join('\n');

  fs.writeFileSync(MD_PATH, md);

  console.log(`Wrote ${JSON_PATH}`);
  console.log(`Wrote ${MD_PATH}`);
  console.log(`Findings: ${summary.findingCount} (${summary.errors} errors, ${summary.warnings} warnings)`);

  if (summary.errors > 0) {
    process.exitCode = 1;
  }
}

void main();
