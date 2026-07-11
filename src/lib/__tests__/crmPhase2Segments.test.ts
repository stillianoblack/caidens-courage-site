// eslint-disable-next-line @typescript-eslint/no-var-requires
const { evaluateSegment } = require('../../../netlify/functions/_lib/crmWorkflowRules');
export {};

const base = { lifecycle: 'prospect', interests: ['camp_program'], audienceType: 'camp_leader', communicationStatuses: ['confirmed'], confirmedPurposes: ['marketing'], doNotEnroll: false, customerStatus: 'none' };
describe('CRM Phase 2 local segments', () => {
  test('camp lead needs adult evidence, consent, prospect stage and enrollment approval', () => {
    expect(evaluateSegment('camp_lead', base).eligible).toBe(true);
    expect(evaluateSegment('camp_lead', { ...base, doNotEnroll: true }).eligible).toBe(false);
  });
  test('customer without consent is excluded from promotional segment', () => {
    const result = evaluateSegment('active_camp_partner', { ...base, customerStatus: 'verified_active', customerType: 'camp', communicationStatuses: ['unknown'] });
    expect(result.eligible).toBe(false);
    expect(result.exclusion).toContain('communication_unknown');
  });
  test('customer status supersedes conflicting prospect nurture', () => {
    expect(evaluateSegment('camp_lead', { ...base, customerStatus: 'verified_active', customerType: 'camp' }).eligible).toBe(false);
  });
  test('newsletter requires purpose-specific confirmed consent', () => {
    expect(evaluateSegment('newsletter_eligible', { ...base, confirmedPurposes: ['newsletter'] }).eligible).toBe(true);
    expect(evaluateSegment('newsletter_eligible', { ...base, confirmedPurposes: [] }).eligible).toBe(false);
  });
});
