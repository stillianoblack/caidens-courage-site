import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../..');
const migrationPath = path.join(
  repoRoot,
  'supabase/migrations/20260804000100_participant_quests_server_only.sql',
);
const servicePath = path.join(repoRoot, 'src/lib/participantQuestService.ts');
const hookPath = path.join(repoRoot, 'src/hooks/useParticipantQuests.ts');
const panelPath = path.join(
  repoRoot,
  'src/components/courage-in-the-dark/CourageQuestListPanel.tsx',
);

const migration = fs.readFileSync(migrationPath, 'utf8');
const service = fs.readFileSync(servicePath, 'utf8');
const hook = fs.readFileSync(hookPath, 'utf8');
const panel = fs.readFileSync(panelPath, 'utf8');

describe('participant quests server-only migration contract', () => {
  test('matches the columns queried and written by the quest service', () => {
    for (const column of [
      'participant_id',
      'quest_period',
      'quest_key',
      'progress_count',
      'target_count',
      'reward_type',
      'reward_value',
      'reward_coins',
      'period_anchor',
      'claimed_at',
      'created_at',
      'updated_at',
    ]) {
      expect(migration).toContain(column);
    }

    expect(service).toContain(".from('participant_quests')");
    expect(service).toContain(
      "onConflict: 'participant_id,quest_period,quest_key,period_anchor'",
    );
  });

  test('restricts period and reward values used by frontend normalization', () => {
    expect(migration).toContain("quest_period in ('daily', 'weekly', 'monthly')");
    expect(migration).toContain("reward_type in ('flame', 'chest', 'badge')");
    expect(migration).toContain('progress_count <= target_count');
    expect(migration).toContain('target_count > 0');
  });

  test('prevents duplicate participant quest assignments', () => {
    expect(migration).toContain(
      'on public.participant_quests (participant_id, quest_period, quest_key, period_anchor)',
    );
    expect(migration).toContain('period_anchor text not null');
    expect(migration).toContain('alter column period_anchor set not null');
  });

  test('reconciles an earlier setup-script table without rewriting quest rows', () => {
    expect(migration).toContain("conrelid = 'public.participant_quests'::regclass");
    expect(migration).toContain('create unique index if not exists');
    expect(migration).not.toMatch(/\b(update|delete|truncate)\s+public\.participant_quests\b/i);
  });

  test('isolates students and programs by denying all browser-role access', () => {
    expect(migration).toContain('force row level security');
    expect(migration).toContain('revoke all on table public.participant_quests from anon');
    expect(migration).toContain(
      'revoke all on table public.participant_quests from authenticated',
    );
    expect(migration).toContain(
      'grant select, insert, update, delete on table public.participant_quests to service_role',
    );
    expect(migration).not.toMatch(/using\s*\(\s*true\s*\)/i);
    expect(migration).not.toMatch(/with\s+check\s*\(\s*true\s*\)/i);
    expect(migration).not.toMatch(/create\s+policy/i);
  });

  test('uses participant ownership and cascade semantics without duplicating program identity', () => {
    expect(migration).toContain(
      'participant_id uuid not null references public.participants (id) on delete cascade',
    );
    expect(migration).not.toMatch(/\bprogram_code\b/);
    expect(migration).not.toMatch(/\bprogram_id\b/);
  });

  test('preserves distinct loading, loaded, empty, and error UI states', () => {
    expect(hook).toContain('setLoading(true)');
    expect(hook).toContain('setQuests(rows)');
    expect(hook).toContain("We couldn\\'t load quests right now.");
    expect(panel).toContain('loading && quests.length === 0');
    expect(panel).toContain('!loading && error && quests.length === 0');
    expect(panel).toContain('!loading && !error && quests.length === 0');
  });
});
