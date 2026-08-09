const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', '..');
const inventory = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/audits/production-schema-inventory.json'), 'utf8'),
);
const baseline = fs.readFileSync(
  path.join(root, 'supabase/schema/production_legacy_baseline.sql'),
  'utf8',
);
const seed = fs.readFileSync(path.join(root, 'supabase/seeds/staging_fictional_seed.sql'), 'utf8');
const cleanup = fs.readFileSync(
  path.join(root, 'supabase/seeds/staging_fictional_cleanup.sql'),
  'utf8',
);

describe('production-compatible staging artifacts', () => {
  test('baseline object counts match captured production metadata', () => {
    const publicTableCount = inventory.tables.filter(
      (table) => table.schema_name === 'public' && ['r', 'p'].includes(table.relation_kind),
    ).length;
    const publicFunctionCount = inventory.functions.filter(
      (fn) => fn.schema_name === 'public',
    ).length;
    const publicTriggerCount = inventory.triggers.filter(
      (trigger) => trigger.schema_name === 'public',
    ).length;

    expect((baseline.match(/^CREATE TABLE /gm) || []).length).toBe(publicTableCount);
    expect((baseline.match(/^CREATE POLICY /gm) || []).length).toBe(0);
    expect(baseline).toContain('staging_legacy_rls.sql');
    expect((baseline.match(/^CREATE OR REPLACE FUNCTION /gm) || []).length).toBe(publicFunctionCount);
    expect((baseline.match(/^CREATE TRIGGER /gm) || []).length).toBe(publicTriggerCount);
  });

  test('baseline is guarded and contains no application-row inserts', () => {
    expect(baseline).toContain('SELECT private.assert_staging_safety(false);');
    expect(baseline).not.toMatch(/^INSERT\s+INTO\s+/im);
    expect(baseline).not.toContain('auth.users VALUES');
    expect(baseline).not.toMatch(/API[_ -]?KEY|ACCESS[_ -]?TOKEN|PASSWORD\s*=/i);
  });

  test('fictional seed and cleanup are guarded and limited to fixed fixtures', () => {
    expect(seed).toContain('SELECT private.assert_staging_safety(true);');
    expect(cleanup).toContain('SELECT private.assert_staging_safety(true);');
    expect(seed).toContain('@fictional.example');
    expect(seed).not.toMatch(/London|yahoo\.com|gmail\.com/i);
    expect(seed).not.toMatch(
      /INSERT\s+INTO\s+(?:auth\.users|public\.(?:contacts|provider_contacts|email_sync_outbox))/i,
    );
    expect(cleanup).toMatch(/00000000-0000-4000-8000-0000000001\d\d/);
  });
});
