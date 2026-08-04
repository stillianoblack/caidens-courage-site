import { verifyFacilitatorSessionForProgram } from '../facilitatorSessionApi';

const program = {
  id: 'blue-ribbon',
  programCode: 'BLUE-RIBBON',
  programName: 'Blue Ribbon Results Academy',
  programType: 'camp',
};

describe('secure facilitator Return To Session', () => {
  afterEach(() => jest.restoreAllMocks());

  test('accepts a valid HttpOnly-backed facilitator session for the same program', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, program }),
    } as Response);
    await expect(verifyFacilitatorSessionForProgram(' blue-ribbon ')).resolves.toMatchObject({
      status: 'authorized',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/.netlify/functions/facilitator-session',
      expect.objectContaining({ credentials: 'include', method: 'GET' }),
    );
  });

  test('rejects a valid session scoped to a different program', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, program: { ...program, programCode: 'OTHER' } }),
    } as Response);
    await expect(verifyFacilitatorSessionForProgram('BLUE-RIBBON')).resolves.toEqual({
      status: 'wrong_program',
    });
  });

  test('does not accept email as a facilitator credential', () => {
    const gate = require('fs').readFileSync(
      require('path').resolve(process.cwd(), 'src/components/kid-play-shell/KidPlayRosterLockGate.tsx'),
      'utf8',
    );
    expect(gate).toContain('Return to Explorers');
    expect(gate).toContain('verifyFacilitatorSessionForProgram');
    expect(gate).not.toContain('Facilitator email');
    expect(gate).not.toContain('clearKidPlayRosterLockWithEmail');
  });
});
