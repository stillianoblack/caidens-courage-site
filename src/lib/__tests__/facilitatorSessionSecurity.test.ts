const fs = require('fs');
const path = require('path');

export {};

function read(relative: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');
}

describe('secure facilitator session architecture', () => {
  test('uses an opaque HttpOnly host cookie and hashes tokens before persistence', () => {
    const source = read('netlify/functions/_lib/facilitatorSession.js');
    expect(source).toContain("__Host-cc_facilitator_session");
    expect(source).toContain('HttpOnly');
    expect(source).toContain('Secure');
    expect(source).toContain('SameSite=Lax');
    expect(source).toContain("createHash('sha256')");
    expect(source).toContain("from('facilitator_compatibility_sessions')");
    expect(source).toContain("revoke_reason: 'reauthorized'");
    expect(source).not.toContain('facilitator_access_code');
  });

  test('all compatibility requests rely on cookies instead of raw access headers', () => {
    const client = read('src/lib/campChildSessionApi.ts');
    const auth = read('netlify/functions/_lib/campCompatibilityAuth.js');
    expect(client).toContain("credentials: 'include'");
    expect(client).not.toContain('X-Camp-Access-Code');
    expect(auth).toContain('readFacilitatorSession');
    expect(auth).not.toContain("['x-camp-access-code']");
  });
});
