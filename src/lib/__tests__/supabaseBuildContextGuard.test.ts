import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const script = path.resolve(process.cwd(), 'scripts/validateSupabaseBuildContext.js');
const productionRef = 'production-project';
const stagingRef = 'staging-project';

function run(env: Record<string, string>) {
  return spawnSync(process.execPath, [script], {
    env: { PATH: process.env.PATH || '', ...env },
    encoding: 'utf8',
  });
}

describe('Supabase build context guard', () => {
  it('rejects legacy client-side admin credentials', () => {
    const passcodeKey = ['REACT', 'APP', 'ADMIN', 'PASSCODE'].join('_');
    const result = run({
      CONTEXT: 'deploy-preview',
      [passcodeKey]: 'must-not-enter-a-client-build',
    });
    expect(result.status).toBe(1);
  });

  it('rejects a client source file that references a legacy admin variable', () => {
    const fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'admin-client-guard-'));
    const emailKey = ['REACT', 'APP', 'ADMIN', 'EMAIL'].join('_');
    fs.writeFileSync(
      path.join(fixtureDirectory, 'client.ts'),
      `const forbidden = process.env.${emailKey};`,
    );
    try {
      const result = run({ CLIENT_SOURCE_DIR: fixtureDirectory });
      expect(result.status).toBe(1);
    } finally {
      fs.rmSync(fixtureDirectory, { recursive: true, force: true });
    }
  });

  it('accepts the approved production project in production', () => {
    const result = run({
      CONTEXT: 'production',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_URL: `https://${productionRef}.supabase.co`,
    });
    expect(result.status).toBe(0);
  });

  it('rejects staging configuration in production', () => {
    const result = run({
      CONTEXT: 'production',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      REACT_APP_SUPABASE_URL: `https://${stagingRef}.supabase.co`,
    });
    expect(result.status).toBe(1);
  });

  it('rejects production configuration in previews by default', () => {
    const result = run({
      CONTEXT: 'deploy-preview',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_URL: `https://${productionRef}.supabase.co`,
    });
    expect(result.status).toBe(1);
  });
});
