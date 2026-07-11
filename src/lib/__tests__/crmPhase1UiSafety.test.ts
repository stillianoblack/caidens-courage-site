import fs from 'fs';
import path from 'path';

describe('CRM Phase 1 UI safety', () => {
  test('classification view has a persistent preview-only warning and no mutation controls', () => {
    const source = fs.readFileSync(path.resolve(process.cwd(), 'src/components/admin/tabs/AdminCrmTab.tsx'), 'utf8');
    expect(source).toContain('Preview only. No contacts, users, organizations, memberships, or email subscribers are being created or changed.');
    expect(source).not.toMatch(/>\s*(Import|Merge|Enroll|Sync|Convert)\s*</i);
  });

  test('CRM browser data access uses protected functions and a Supabase session', () => {
    const source = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/crmApi.ts'), 'utf8');
    expect(source).toContain('supabase.auth.getSession()');
    expect(source).toContain('/.netlify/functions/');
    expect(source).not.toContain(".from('contacts')");
  });
});
