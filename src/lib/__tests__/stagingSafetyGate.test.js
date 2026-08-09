const {
  projectRefFromUrl,
  validateStagingTarget,
  verifyTableShape,
} = require('../../../scripts/lib/stagingSafetyGate');

const stagingRef = 'aaaaaaaaaaaaaaaaaaaa';
const productionRef = 'bbbbbbbbbbbbbbbbbbbb';

function validConfig(overrides = {}) {
  return {
    environmentName: 'staging',
    allowMutations: 'true',
    supabaseUrl: `https://${stagingRef}.supabase.co`,
    detectedProjectRef: stagingRef,
    expectedStagingProjectRef: stagingRef,
    productionProjectRef: productionRef,
    linkedProjectRef: stagingRef,
    serviceRoleKey: 'test-only-placeholder',
    ...overrides,
  };
}

describe('staging database safety gate', () => {
  test('extracts only valid Supabase project references', () => {
    expect(projectRefFromUrl(`https://${stagingRef}.supabase.co`)).toBe(stagingRef);
    expect(projectRefFromUrl('https://example.com')).toBeNull();
    expect(projectRefFromUrl('not-a-url')).toBeNull();
  });

  test('accepts an explicitly approved and consistently linked staging target', () => {
    expect(validateStagingTarget(validConfig())).toEqual([]);
  });

  test.each([
    ['missing environment', { environmentName: '' }],
    ['mutation flag disabled', { allowMutations: 'false' }],
    ['missing expected staging ref', { expectedStagingProjectRef: '' }],
    ['missing production ref', { productionProjectRef: '' }],
    ['URL mismatch', { detectedProjectRef: 'cccccccccccccccccccc' }],
    ['CLI link mismatch', { linkedProjectRef: 'cccccccccccccccccccc' }],
    [
      'production target',
      {
        detectedProjectRef: productionRef,
        expectedStagingProjectRef: productionRef,
        linkedProjectRef: productionRef,
      },
    ],
  ])('rejects %s', (_label, override) => {
    expect(validateStagingTarget(validConfig(override))).not.toEqual([]);
  });

  test('checks required columns with a zero-row REST request', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: true });
    await verifyTableShape(validConfig(), 'participants', ['id', 'role'], fetchImpl);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toContain('/rest/v1/participants?');
    expect(fetchImpl.mock.calls[0][0]).toContain('limit=0');
    expect(fetchImpl.mock.calls[0][1].headers.apikey).toBe('test-only-placeholder');
  });

  test('fails when a required table or column is absent', async () => {
    await expect(
      verifyTableShape(validConfig(), 'participants', ['missing_column'], async () => ({ ok: false })),
    ).rejects.toThrow('Required table or columns are missing');
  });
});
