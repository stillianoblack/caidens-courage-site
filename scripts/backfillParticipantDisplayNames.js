/**
 * Safe backfill: copy first_name into nickname when nickname is empty.
 * Does not overwrite existing nicknames or set "Unknown Student".
 *
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfillParticipantDisplayNames.js
 */
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from('participants')
    .select('id, first_name, nickname, last_name')
    .eq('role', 'student');

  if (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  let updated = 0;
  for (const row of data ?? []) {
    const first = String(row.first_name || '').trim();
    const nickname = String(row.nickname || '').trim();
    if (!first || nickname) continue;
    const { error: updateError } = await supabase
      .from('participants')
      .update({ nickname: first })
      .eq('id', row.id);
    if (!updateError) updated += 1;
  }

  console.log(`Backfill complete. Updated ${updated} participant nickname(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
