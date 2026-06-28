import { buildProgramDisplayNameUpdatePayload } from '../familyProgramDisplayNameService';

describe('program display labels are separate from access-code identity', () => {
  test('editing display name does not include any access-code updates', () => {
    const payload = buildProgramDisplayNameUpdatePayload({
      displayName: 'GDI Camp',
      groupName: 'Summer Pilot',
    });

    expect(payload).toEqual({
      program_name: 'GDI Camp',
      group_name: 'Summer Pilot',
    });
    expect(payload).not.toHaveProperty('program_code');
    expect(payload).not.toHaveProperty('family_access_code');
    expect(payload).not.toHaveProperty('facilitator_access_code');
  });

  test('existing Blue Ribbon Results Academy codes remain unchanged when labels change', () => {
    const before = {
      program_name: 'Blue Ribbon Results Academy',
      group_name: 'Blue Ribbon',
      program_code: 'CAMP-BLUERIBBONRESULTSACADEMY-2026',
      family_access_code: 'CAMP-BLUERIBBONRESULTSACADEMY-2026-FAMILY',
      facilitator_access_code: 'FAC-BLUERIBBONRESULTSACADEMY-2026',
    };

    const payload = buildProgramDisplayNameUpdatePayload({
      displayName: 'Blue Ribbon Results Academy Pilot',
      groupName: 'Blue Ribbon Cohort',
    });
    const after = { ...before, ...payload };

    expect(after.program_name).toBe('Blue Ribbon Results Academy Pilot');
    expect(after.group_name).toBe('Blue Ribbon Cohort');
    expect(after.program_code).toBe(before.program_code);
    expect(after.family_access_code).toBe(before.family_access_code);
    expect(after.facilitator_access_code).toBe(before.facilitator_access_code);
  });
});
