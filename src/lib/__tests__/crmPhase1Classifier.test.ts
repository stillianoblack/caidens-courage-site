// eslint-disable-next-line @typescript-eslint/no-var-requires
const { classifyLegacyRows } = require('../../../netlify/functions/_lib/crmClassifier');
export {};

describe('CRM Phase 1 classification preview', () => {
  test('classifies explicit adult roles and excludes students', () => {
    const result = classifyLegacyRows({
      adultParticipants: [
        { id: 'adult-1', email: 'adult@example.com', role: 'facilitator', email_opt_in: true },
        { id: 'student-1', email: 'child@example.com', role: 'student' },
      ],
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ proposed_audience_type: 'facilitator', confidence: 'high', consent_status: 'unclear', child_exclusion_status: 'adult_source_only' });
    expect(JSON.stringify(result)).not.toContain('child@example.com');
  });

  test('suggests duplicate review without merging or selecting a winner', () => {
    const result = classifyLegacyRows({
      guardianLinks: [{ id: 'link-1', parent_email: 'same@example.com' }],
      waitlist: [{ id: 'wait-1', parent_email: 'SAME@example.com' }],
    });
    expect(result).toHaveLength(2);
    expect(result.every((row: { possible_duplicate: boolean; recommended_action: string }) => row.possible_duplicate && row.recommended_action === 'manual_review')).toBe(true);
  });

  test('does not infer an organization from email domain or confirm consent', () => {
    const [candidate] = classifyLegacyRows({ waitlist: [{ id: 'wait-2', parent_email: 'person@school.edu' }] });
    expect(candidate.proposed_organization_name).toBeNull();
    expect(candidate.consent_status).toBe('unknown');
  });
});
