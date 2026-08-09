const fs = require('fs');
const https = require('https');
const path = require('path');
const { assertStagingDatabaseSafety, resolveConfiguration } = require('./lib/stagingSafetyGate');

const ROOT = path.resolve(__dirname, '..');

function readLocalEnv() {
  return Object.fromEntries(
    fs
      .readFileSync(path.join(ROOT, '.env.local'), 'utf8')
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
    const request = https.request(
      {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${projectRef}/database/query`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if (response.statusCode !== 200 && response.statusCode !== 201) {
            reject(new Error(`Staging verification query failed with HTTP ${response.statusCode}.`));
            return;
          }
          resolve(JSON.parse(body));
        });
      },
    );
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

  const result = await query(
    config.detectedProjectRef,
    accessToken,
    `
      select
        (select count(*)::int from public.pilot_programs where id in (
          '00000000-0000-4000-8000-000000000100', '00000000-0000-4000-8000-000000000110'
        )) as fixture_programs,
        (select count(*)::int from public.participants where id in (
          '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000102',
          '00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000104'
        )) as fixture_participants,
        (select count(*)::int from public.student_family_links where id in (
          '00000000-0000-4000-8000-000000000120', '00000000-0000-4000-8000-000000000121'
        )) as fixture_family_links,
        (select count(*)::int from public.assessment_results where id = '00000000-0000-4000-8000-000000000130')
          as fixture_legacy_baselines,
        (select count(*)::int from public.assessment_results_v2 where id = '00000000-0000-4000-8000-000000000131')
          as fixture_b4_completions,
        (select count(*)::int from public.player_progress where id = '00000000-0000-4000-8000-000000000151')
          as fixture_progress_rows,
        (select count(*)::int from public.player_wallets where participant_id = '00000000-0000-4000-8000-000000000103')
          as fixture_wallets,
        (select count(*)::int from (
          select lower(btrim(admin_email))
          from public.pilot_programs
          where program_type = 'independent_family' and pilot_status <> 'archived'
          group by lower(btrim(admin_email))
          having count(*) > 1
        ) duplicate_groups) as duplicate_independent_family_email_groups,
        (select count(*)::int
          from public.student_family_links link
          left join public.participants participant on participant.id = link.student_id
          where participant.id is null) as orphan_family_links,
        (select count(*)::int
          from public.participants
          where role = 'student'
            and lower(btrim(coalesce(nickname, first_name, ''))) in ('student', 'child', 'player'))
          as placeholder_students,
        (select count(*)::int from (
          select program_code, lower(btrim(coalesce(nickname, first_name)))
          from public.participants
          where role = 'student'
          group by program_code, lower(btrim(coalesce(nickname, first_name)))
          having count(*) > 1
        ) duplicate_students) as duplicate_student_identity_groups
    `,
  );
  const summary = result[0] || {};
  console.log(JSON.stringify(summary, null, 2));
  if (
    summary.duplicate_independent_family_email_groups ||
    summary.orphan_family_links ||
    summary.placeholder_students ||
    summary.duplicate_student_identity_groups
  ) {
    throw new Error('Critical signup precheck failed. Only aggregate staging conflict counts were printed.');
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
