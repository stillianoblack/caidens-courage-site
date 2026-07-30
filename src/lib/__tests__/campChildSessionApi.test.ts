import {
  campCompatibilityHeaders,
  getCampCompatibilityParticipantDirectory,
  launchCampCompatibilityChildSession,
} from '../campChildSessionApi';

const participantId = '11111111-1111-4111-8111-111111111111';
const sessionId = '22222222-2222-4222-8222-222222222222';

function response(body: Record<string, unknown>, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'X-Correlation-Id': 'camp-session-correlation' }),
    json: async () => body,
  } as Response;
}

describe('camp child session transport', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('activePortalRole', 'facilitator');
    localStorage.setItem('activeAccessCode', 'FAC-TEST');
    localStorage.setItem('activePilotProgram', JSON.stringify({
      id: '33333333-3333-4333-8333-333333333333',
      programName: 'Test Camp',
      programCode: 'CAMP-TEST',
    }));
    jest.restoreAllMocks();
  });

  test('sends program identity and facilitator proof without participant secrets', () => {
    expect(campCompatibilityHeaders(sessionId)).toEqual({
      'Content-Type': 'application/json',
      'X-Camp-Program-Id': '33333333-3333-4333-8333-333333333333',
      'X-Camp-Program-Code': 'CAMP-TEST',
      'X-Camp-Access-Code': 'FAC-TEST',
      'X-Kid-Session-Id': sessionId,
    });
  });

  test('deduplicates concurrent facilitator launches and returns sanitized session metadata', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(response({
      success: true,
      reused: false,
      session: {
        id: sessionId,
        child_id: participantId,
        participant_id: participantId,
        organization_id: '33333333-3333-4333-8333-333333333333',
        launched_by_user_id: null,
        session_source: 'facilitator_roster_launch',
        device_mode: 'shared_camp_device',
        status: 'active',
      },
    }));

    const first = launchCampCompatibilityChildSession({ participantId });
    const second = launchCampCompatibilityChildSession({ participantId });
    const [one, two] = await Promise.all([first, second]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(one.session.id).toBe(sessionId);
    expect(two.session.id).toBe(sessionId);
    const request = fetchMock.mock.calls[0];
    expect(request[0]).toBe('/.netlify/functions/family-child-session');
    expect(request[1]).toEqual(expect.objectContaining({ method: 'POST' }));
    expect(String(request[1]?.body)).not.toContain('PIN');
    expect(String(request[1]?.body)).not.toContain('FAC-TEST');
  });

  test('loads a sanitized facilitator participant directory through the same endpoint', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(response({
      success: true,
      participants: [{
        id: participantId,
        nickname: 'Ace',
        first_name: 'Trace',
        last_name: 'Tester',
        role: 'student',
        program_code: 'CAMP-TEST',
        created_at: '2026-07-17T00:00:00.000Z',
        grade_level: '3',
        grade_band: '2-3',
        allow_stretch_level: true,
        b4_variant_key: 'courage',
        b4_variant_selected_at: null,
      }],
    }));
    const rows = await getCampCompatibilityParticipantDirectory();
    expect(rows).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/.netlify/functions/family-child-session',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ action: 'roster' }) }),
    );
  });
});
