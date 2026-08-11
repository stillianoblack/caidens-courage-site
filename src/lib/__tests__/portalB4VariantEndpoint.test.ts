import fs from 'fs';
import path from 'path';

export {};

jest.mock('../../../netlify/functions/_lib/facilitatorSession', () => ({
  originIsSameHost: () => true,
  readFacilitatorSession: async () => ({
    session: { id: 'facilitator-session-1' },
    program: {
      id: 'program-1',
      program_code: 'CAMP-TEST',
      program_type: 'Camp / Youth Program',
    },
  }),
}));

describe('portal B-4 variant endpoint', () => {
  const endpoint = require('../../../netlify/functions/portal-b4-variant');

  beforeEach(() => {
    process.env.CONTEXT = 'production';
    process.env.PRODUCTION_SUPABASE_PROJECT_REF = 'bnopaocdqkknjzmmkaen';
  });

  it('accepts only the approved keys and writes legacy spark as courage', () => {
    expect(endpoint._test.normalizeVariant('spark')).toBe('courage');
    for (const variant of ['courage', 'pattern', 'shield', 'anchor', 'fusion']) {
      expect(endpoint._test.normalizeVariant(variant)).toBe(variant);
    }
    expect(endpoint._test.normalizeVariant('diagnostic-label')).toBeNull();
  });

  it('supports validated family and camp kid-session authorization without browser table access', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'netlify/functions/portal-b4-variant.js'),
      'utf8',
    );
    expect(source).toContain('authorizeFamilyCompatibilitySession');
    expect(source).toContain('participantAccessibleToFamily');
    expect(source).toContain('authorizeCampKidSession');
    expect(source).toContain("require('./_lib/campCompatibilityAuth')");
    const helper = fs.readFileSync(
      path.join(process.cwd(), 'netlify/functions/_lib/campCompatibilityAuth.js'),
      'utf8',
    );
    expect(helper).toContain('readFacilitatorSession');
    expect(helper).not.toContain("['x-camp-access-code']");
    expect(helper).toContain(".from('kid_play_sessions')");
    expect(helper).toContain(".eq('organization_id', program.id)");
    expect(source).not.toContain('portalOwnershipAuth');
    expect(source).not.toContain('getCrmRoles');
  });

  it('authorizes a claimed family-linked child without treating the family program as the child program', async () => {
    const helper = require('../../../netlify/functions/_lib/familyCompatibilityAuth');
    const participant = {
      id: '00000000-0000-4000-8000-000000000103',
      role: 'student',
      program_code: 'STAGING-CLASSROOM-2026',
    };
    const calls: Array<{ table: string; filters: Array<[string, unknown]> }> = [];
    const supabase = {
      from: (table: string) => {
        const filters: Array<[string, unknown]> = [];
        calls.push({ table, filters });
        const chain: any = {
          select: () => chain,
          eq: (column: string, value: unknown) => { filters.push([column, value]); return chain; },
          maybeSingle: async () => ({ data: { id: 'family-link-1' }, error: null }),
        };
        return chain;
      },
    };

    await expect(helper.participantAccessibleToFamily(
      supabase,
      participant,
      'STAGING-LANTERN-2026',
    )).resolves.toBe(true);
    expect(calls).toEqual([{
      table: 'student_family_links',
      filters: [
        ['student_id', participant.id],
        ['family_program_code', 'STAGING-LANTERN-2026'],
        ['parent_claimed', true],
      ],
    }]);
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
        'x-cc-deploy-context': 'production',
        'x-cc-supabase-project': 'bnopaocdqkknjzmmkaen',
        'x-camp-program-id': 'program-1',
        'x-camp-program-code': 'CAMP-TEST',
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
