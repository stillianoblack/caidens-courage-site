// eslint-disable-next-line @typescript-eslint/no-var-requires
const { assignmentAllows, bearerToken, maskEmail } = require('../../../netlify/functions/_lib/crmAuth');
export {};

describe('CRM Phase 1 authorization primitives', () => {
  test('ignores client role and reads only a bearer token', () => {
    expect(bearerToken({ headers: { authorization: 'Bearer trusted-token', 'x-crm-role': 'internal_admin' } })).toBe('trusted-token');
    expect(bearerToken({ headers: { 'x-crm-role': 'internal_admin' } })).toBeNull();
  });

  test('denies cross-organization access', () => {
    const assignment = { role: 'organization_admin', organizationId: 'org-a' };
    expect(assignmentAllows(assignment, 'organizations:read', 'org-a')).toBe(true);
    expect(assignmentAllows(assignment, 'organizations:read', 'org-b')).toBe(false);
  });

  test('allows approved read roles but never invents write permission', () => {
    expect(assignmentAllows({ role: 'read_only_admin', organizationId: null }, 'crm:read', null)).toBe(true);
    expect(assignmentAllows({ role: 'audience_admin', organizationId: null }, 'crm:write', null)).toBe(false);
  });

  test('masks adult email values', () => {
    expect(maskEmail('Adult.Person@example.com')).toBe('a***@example.com');
  });
});
