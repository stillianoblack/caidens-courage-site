import { fetchPortalProgramAccess } from '../portalProgramAccessApi';

const fetchMock = jest.fn();

describe('portal program access client', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  test('uses the server endpoint and accepts mapped session metadata', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        role: 'family',
        program: {
          programCode: 'FAMILY-ABC123',
          programName: 'Trace Family',
        },
      }),
    });

    const result = await fetchPortalProgramAccess({
      accessCode: 'FAM-ABC123',
      intent: 'parent',
      credential: 'parent@example.com',
    });

    expect(result.status).toBe('found');
    expect(fetchMock).toHaveBeenCalledWith(
      '/.netlify/functions/portal-program-access',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  test('maps rejected credentials without exposing a program', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ code: 'credential_not_connected' }),
    });

    await expect(fetchPortalProgramAccess({
      accessCode: 'FAM-ABC123',
      intent: 'parent',
      credential: 'wrong@example.com',
    })).resolves.toEqual({ status: 'invalid_credential' });
  });
});
