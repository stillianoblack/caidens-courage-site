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

  it('supports validated family and camp kid-session authorization without browser table access', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'netlify/functions/portal-b4-variant.js'),
      'utf8',
    );
    expect(source).toContain('authorizeFamilyCompatibilitySession');
    expect(source).toContain('participantBelongsToFamily');
    expect(source).toContain('authorizeCampKidSession');
    expect(source).toContain(".eq('facilitator_access_code', accessCode)");
    expect(source).toContain(".from('kid_play_sessions')");
    expect(source).toContain(".eq('child_id', participantId)");
    expect(source).not.toContain('portalOwnershipAuth');
    expect(source).not.toContain('getCrmRoles');
  });

  it('authorizes an active facilitator-launched camp session only when program and participant match', async () => {
    const participantId = '11111111-1111-4111-8111-111111111111';
    const rows: Record<string, unknown> = {
      pilot_programs: {
        id: 'program-1',
        program_code: 'CAMP-TEST',
        program_type: 'Camp / Youth Program',
      },
      participants: { id: participantId, role: 'student', program_code: 'CAMP-TEST' },
      kid_play_sessions: {
        id: 'session-1',
        child_id: participantId,
        participant_id: participantId,
        session_source: 'facilitator_roster_launch',
        status: 'active',
      },
    };
    const supabase = {
      from: (table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          neq: () => chain,
          maybeSingle: async () => ({ data: rows[table], error: null }),
        };
        return chain;
      },
    };
    const result = await endpoint._test.authorizeCampKidSession({
      headers: {
        'x-camp-program-code': 'CAMP-TEST',
        'x-camp-access-code': 'FAC-TEST',
        'x-kid-session-id': 'session-1',
      },
    }, supabase, participantId);
    expect(result).toEqual({ authorized: true, code: 'camp_facilitator_session' });
  });

  it('treats a null confirmation timestamp as onboarding-required state', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'netlify/functions/portal-b4-variant.js'),
      'utf8',
    );
    expect(source).toContain("const state = normalized && data.b4_variant_selected_at ? 'saved' : 'onboarding_required'");
    expect(source).toContain("selectionRequired: state === 'onboarding_required'");
  });
});
