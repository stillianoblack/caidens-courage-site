import { resolveRosterPinStatus } from '../../hooks/usePilotRosterData';

describe('compatibility roster PIN status', () => {
  test('enabled compatibility PIN is ready', () => {
    expect(resolveRosterPinStatus({ compatibilitySession: true, compatibilityStatus: 'ready' }))
      .toBe('ready');
  });

  test('compatibility student without a usable PIN is missing', () => {
    expect(resolveRosterPinStatus({ compatibilitySession: true, compatibilityStatus: 'missing' }))
      .toBe('missing');
  });

  test('explicitly disabled compatibility PIN is disabled', () => {
    expect(resolveRosterPinStatus({ compatibilitySession: true, compatibilityStatus: 'disabled' }))
      .toBe('disabled');
  });

  test('non-compatibility access behavior remains unchanged', () => {
    expect(resolveRosterPinStatus({
      compatibilitySession: false,
      access: {
        student_pin_enabled: true,
        parent_connection_status: 'connected',
        family_claim_code: null,
        hasPin: true,
        pinLastRotatedAt: null,
      },
    })).toBe('ready');
    expect(resolveRosterPinStatus({
      compatibilitySession: false,
      access: {
        student_pin_enabled: false,
        parent_connection_status: 'unclaimed',
        family_claim_code: null,
        hasPin: false,
        pinLastRotatedAt: null,
      },
    })).toBe('disabled');
  });
});
