const fs = require('fs');
const https = require('https');
const path = require('path');
const { assertStagingReadOnlyTarget } = require('./lib/stagingSafetyGate');

const ROOT = path.resolve(__dirname, '..');

function readLocalEnv() {
  return Object.fromEntries(
    fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      }),
  );
}

function query(projectRef, accessToken, sql) {
  const payload = JSON.stringify({ query: sql });
  return new Promise((resolve, reject) => {
    const request = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (response) => {
      let body = '';
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode !== 200 && response.statusCode !== 201) {
          reject(new Error(`Staging diagnostic query rejected with HTTP ${response.statusCode}.`));
          return;
        }
        resolve(JSON.parse(body));
      });
    });
    request.on('error', reject);
    request.write(payload);
    request.end();
  });
}

function maskEmail(value) {
  const email = String(value || '');
  const [local, domain] = email.split('@');
  if (!local || !domain) return null;
  return `${local.slice(0, 2)}***@${domain}`;
}

function suffix(value) {
  const text = String(value || '');
  return text ? `…${text.slice(-6)}` : null;
}

async function main() {
  const config = assertStagingReadOnlyTarget();
  const env = readLocalEnv();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) throw new Error('SUPABASE_ACCESS_TOKEN is required.');

  const rows = await query(config.detectedProjectRef, accessToken, `
    select
      program.id::text as program_id,
      program.program_code,
      program.program_name,
      program.admin_email,
      program.created_at,
      participant.id::text as participant_id,
      participant.first_name,
      participant.nickname,
      participant.child_age_range,
      participant.grade_level,
      participant.b4_variant_key,
      link.id::text as family_link_id,
      link.family_program_code,
      link.parent_claimed,
      (select count(*)::int from public.portal_program_memberships membership
        where membership.program_id = program.id and membership.status = 'active') as active_memberships,
      (select count(*)::int from public.portal_participant_access access
        where access.participant_id = participant.id and access.status = 'active') as active_participant_grants
    from public.pilot_programs program
    left join public.participants participant
      on participant.program_code = program.program_code and participant.role = 'student'
    left join public.student_family_links link
      on link.student_id = participant.id and link.family_program_code = program.program_code
    where program.program_type = 'independent_family'
      and program.pilot_status <> 'archived'
    order by program.created_at desc, participant.created_at asc
    limit 8
  `);
  const counts = await query(config.detectedProjectRef, accessToken, `
    with latest as (
      select id, program_code
      from public.pilot_programs
      where program_type = 'independent_family' and pilot_status <> 'archived'
      order by created_at desc
      limit 1
    ), family_participants as (
      select participant.id, participant.nickname, participant.first_name
      from public.participants participant
      join latest on latest.program_code = participant.program_code
      where participant.role = 'student'
    )
    select
      (select count(*)::int from latest) as family_rows,
      (select count(*)::int from family_participants) as participant_rows,
      (select count(*)::int from public.student_family_links link
        join family_participants participant on participant.id = link.student_id
        join latest on latest.program_code = link.family_program_code) as family_link_rows,
      (select count(*)::int from family_participants
        where lower(btrim(coalesce(nickname, first_name, ''))) in ('student','child','player')) as placeholder_rows,
      (select count(*)::int from public.admin_audit_events audit
        join family_participants participant on participant.id = audit.target_id
        where audit.action = 'family_child_created') as child_create_audit_rows,
      (select count(*)::int from public.module_results result
        join latest on latest.program_code = result.program_code) as module_result_rows,
      (select count(*)::int from public.assessment_results_v2 result
        join latest on latest.program_code = result.program_code) as assessment_v2_rows
  `);

  console.log(JSON.stringify({
    projectRef: config.detectedProjectRef,
    latestFamilyCounts: counts[0] || {},
    rows: rows.map((row) => ({
      programId: suffix(row.program_id),
      programCode: suffix(row.program_code),
      programName: row.program_name,
      parentEmail: maskEmail(row.admin_email),
      createdAt: row.created_at,
      participantId: suffix(row.participant_id),
      firstName: row.first_name,
      nickname: row.nickname,
      childAgeRange: row.child_age_range,
      gradeLevel: row.grade_level,
      b4Variant: row.b4_variant_key,
      familyLinkId: suffix(row.family_link_id),
      familyProgramMatches: row.family_program_code === row.program_code,
      parentClaimed: row.parent_claimed,
      activeMemberships: row.active_memberships,
      activeParticipantGrants: row.active_participant_grants,
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
