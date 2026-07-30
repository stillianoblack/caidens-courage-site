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

function publicJwt(ref: string, role = 'anon') {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ref, role })}.test-signature`;
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
      REACT_APP_SUPABASE_ANON_KEY: publicJwt(productionRef),
    });
    expect(result.status).toBe(0);
  });

  it('rejects staging configuration in production', () => {
    const result = run({
      CONTEXT: 'production',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      REACT_APP_SUPABASE_URL: `https://${stagingRef}.supabase.co`,
      REACT_APP_SUPABASE_ANON_KEY: publicJwt(stagingRef),
    });
    expect(result.status).toBe(1);
  });

  it('rejects a production URL paired with a staging browser credential', () => {
    const result = run({
      CONTEXT: 'production',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_URL: `https://${productionRef}.supabase.co`,
      REACT_APP_SUPABASE_ANON_KEY: publicJwt(stagingRef),
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('browser credential');
  });

  it('accepts a browser-safe publishable key in production', () => {
    const result = run({
      CONTEXT: 'production',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_URL: `https://${productionRef}.supabase.co`,
      REACT_APP_SUPABASE_ANON_KEY: 'sb_publishable_public-test-value',
    });
    expect(result.status).toBe(0);
  });

  it('rejects production configuration in previews by default', () => {
    const result = run({
      CONTEXT: 'deploy-preview',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_URL: `https://${productionRef}.supabase.co`,
      REACT_APP_SUPABASE_ANON_KEY: publicJwt(productionRef),
    });
    expect(result.status).toBe(1);
  });

  it('rejects mismatched preview URL and browser credential projects', () => {
    const result = run({
      CONTEXT: 'deploy-preview',
      PRODUCTION_SUPABASE_PROJECT_REF: productionRef,
      REACT_APP_SUPABASE_EXPECTED_PROJECT_REF: stagingRef,
      REACT_APP_SUPABASE_URL: `https://${stagingRef}.supabase.co`,
      REACT_APP_SUPABASE_ANON_KEY: publicJwt('another-staging-project'),
    });
    expect(result.status).toBe(1);
  });
});
