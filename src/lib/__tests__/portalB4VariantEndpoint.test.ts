import fs from 'fs';
import path from 'path';

export {};

describe('portal B-4 variant endpoint', () => {
  const endpoint = require('../../../netlify/functions/portal-b4-variant');

  it('accepts only the approved keys and writes legacy spark as courage', () => {
    expect(endpoint._test.normalizeVariant('spark')).toBe('courage');
    expect(endpoint._test.normalizeVariant('fusion')).toBe('fusion');
    expect(endpoint._test.normalizeVariant('diagnostic-label')).toBeNull();
  });

  it('uses only validated family compatibility authorization in the narrow release', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'netlify/functions/portal-b4-variant.js'),
      'utf8',
    );
    expect(source).toContain('authorizeFamilyCompatibilitySession');
    expect(source).toContain('participantBelongsToFamily');
    expect(source).not.toContain('portalOwnershipAuth');
    expect(source).not.toContain('getCrmRoles');
  });
});
