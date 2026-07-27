import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../../..');

describe('pilot outcomes security architecture', () => {
  it('protects every outcome function with the existing admin authorization boundary', () => {
    for (const file of [
      'admin-pilot-outcomes.js',
      'admin-pilot-rollout.js',
      'admin-pilot-outcomes-report.js',
    ]) {
      const source = fs.readFileSync(path.join(root, 'netlify/functions', file), 'utf8');
      expect(source).toContain('requireAdmin(event)');
    }
  });

  it('does not perform privileged browser-direct reads', () => {
    const client = fs.readFileSync(path.join(root, 'src/lib/pilotOutcomesApi.ts'), 'utf8');
    const component = fs.readFileSync(
      path.join(root, 'src/components/admin/tabs/AdminPilotOutcomesTab.tsx'),
      'utf8',
    );
    expect(client).not.toContain(".from('");
    expect(component).not.toContain(".from('");
    expect(client).toContain("credentials: 'same-origin'");
    expect(client).not.toContain('Authorization:');
    expect(client).not.toContain('Bearer');
  });

  it('does not expose access codes, pins, raw emails, or correlation identifiers in the UI', () => {
    const component = fs.readFileSync(
      path.join(root, 'src/components/admin/tabs/AdminPilotOutcomesTab.tsx'),
      'utf8',
    );
    expect(component).not.toMatch(/access[_ ]code|family[_ ]claim|student[_ ]pin|correlationId|admin_email/i);
  });

  it('provides text equivalents for visual bars', () => {
    const component = fs.readFileSync(
      path.join(root, 'src/components/admin/tabs/AdminPilotOutcomesTab.tsx'),
      'utf8',
    );
    expect(component).toContain('sr-only');
    expect(component).toContain('description=');
  });
});
