const fs = require('fs');
const https = require('https');
const path = require('path');
const { assertStagingDatabaseSafety, resolveConfiguration } = require('./lib/stagingSafetyGate');

const ROOT = path.resolve(__dirname, '..');
const TEST_EMAIL = 'aurora-rls-e2e-20260713@fictional.example';

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
          const safeMessage = (() => {
            try {
              return JSON.parse(body)?.message || 'query rejected';
            } catch {
              return 'query rejected';
            }
          })();
          reject(new Error(`Staging signup verification failed with HTTP ${response.statusCode}: ${safeMessage}`));
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

async function main() {
  await assertStagingDatabaseSafety({ requireLegacyBaseline: true });
  const config = resolveConfiguration();
  const env = readLocalEnv();
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) throw new Error('SUPABASE_ACCESS_TOKEN is required.');

  const escapedEmail = TEST_EMAIL.replace(/'/g, "''");
  const result = await query(config.detectedProjectRef, accessToken, `
    with family as (
      select id, program_code
      from public.pilot_programs
      where lower(btrim(admin_email)) = '${escapedEmail}'
        and program_type = 'independent_family'
        and pilot_status <> 'archived'
    )
    select
      (select count(*)::int from family) as family_rows,
      (select count(*)::int from public.participants participant
        join family on family.program_code = participant.program_code
        where participant.role = 'student') as student_rows,
      (select count(*)::int from public.participants participant
        join family on family.program_code = participant.program_code
        where participant.role = 'student'
          and participant.first_name = 'Aurora Test'
          and participant.nickname = 'Aurora Test'
          and participant.child_age_range = '3rd–5th') as correctly_named_and_graded_students,
      (select count(*)::int from public.student_family_links link
        join family on family.program_code = link.camp_program_code
          and family.program_code = link.family_program_code
        join public.participants participant on participant.id = link.student_id
          and participant.program_code = family.program_code
        where link.parent_email = '${escapedEmail}'
          and link.parent_claimed = true) as valid_family_links,
      (select count(*)::int from public.participants participant
        join family on family.program_code = participant.program_code
        where participant.role = 'student'
          and lower(btrim(coalesce(participant.nickname, participant.first_name, ''))) in
            ('student', 'child', 'player')) as placeholder_students,
      (select count(*)::int from auth.users where lower(email) = '${escapedEmail}') as auth_users_created,
      (select count(*)::int from public.contacts where lower(primary_email) = '${escapedEmail}') as crm_contacts_created
  `);

  const summary = result[0] || {};
  console.log(JSON.stringify(summary, null, 2));
  if (summary.family_rows !== 1 || summary.student_rows !== 1 ||
    summary.correctly_named_and_graded_students !== 1 || summary.valid_family_links !== 1 ||
    summary.placeholder_students !== 0 ||
      summary.auth_users_created !== 0 || summary.crm_contacts_created !== 0) {
    throw new Error('The staging family-signup invariants did not pass.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
