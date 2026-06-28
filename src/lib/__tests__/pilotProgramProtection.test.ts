import {
  getPilotProgramProtectionDecision,
  resolvePilotProgramProtectionLevel,
} from '../pilotProgramProtection';

describe('pilot program protection levels', () => {
  test('testing programs can archive, delete, and regenerate codes', () => {
    const program = { protection_level: 'testing' as const, pilot_status: 'active' as const };

    expect(getPilotProgramProtectionDecision(program, 'archive').allowed).toBe(true);
    expect(getPilotProgramProtectionDecision(program, 'delete').allowed).toBe(true);
    expect(getPilotProgramProtectionDecision(program, 'regenerate_codes').allowed).toBe(true);
  });

  test('pilot programs cannot delete or regenerate codes', () => {
    const program = { protection_level: 'pilot' as const, pilot_status: 'active' as const };

    expect(getPilotProgramProtectionDecision(program, 'archive').allowed).toBe(true);
    expect(getPilotProgramProtectionDecision(program, 'archive').requiresConfirmation).toBe(true);
    expect(getPilotProgramProtectionDecision(program, 'delete').allowed).toBe(false);
    expect(getPilotProgramProtectionDecision(program, 'regenerate_codes').allowed).toBe(false);
  });

  test('production programs cannot archive, delete, regenerate, or change portal type', () => {
    const program = { protection_level: 'production' as const, pilot_status: 'active' as const };

    expect(getPilotProgramProtectionDecision(program, 'archive').allowed).toBe(false);
    expect(getPilotProgramProtectionDecision(program, 'delete').allowed).toBe(false);
    expect(getPilotProgramProtectionDecision(program, 'regenerate_codes').allowed).toBe(false);
    expect(getPilotProgramProtectionDecision(program, 'change_portal_type').allowed).toBe(false);
  });

  test('changing protection level changes permissions', () => {
    const base = { pilot_status: 'active' as const };

    expect(getPilotProgramProtectionDecision({ ...base, protection_level: 'testing' }, 'delete').allowed).toBe(true);
    expect(getPilotProgramProtectionDecision({ ...base, protection_level: 'internal' }, 'delete').allowed).toBe(false);
    expect(getPilotProgramProtectionDecision({ ...base, protection_level: 'pilot' }, 'regenerate_codes').allowed).toBe(false);
    expect(getPilotProgramProtectionDecision({ ...base, protection_level: 'production' }, 'archive').allowed).toBe(false);
  });

  test('protection comes from protection_level only', () => {
    const testing = { protection_level: 'testing' as const, pilot_status: 'active' as const };
    const internal = { protection_level: 'internal' as const, pilot_status: 'active' as const };

    expect(getPilotProgramProtectionDecision(testing, 'delete').allowed).toBe(true);
    expect(getPilotProgramProtectionDecision(testing, 'regenerate_codes').allowed).toBe(true);
    expect(getPilotProgramProtectionDecision(internal, 'delete').allowed).toBe(false);
    expect(getPilotProgramProtectionDecision(internal, 'delete').requiresConfirmation).toBe(false);
    expect(getPilotProgramProtectionDecision(internal, 'regenerate_codes').requiresConfirmation).toBe(true);
  });

  test('changing labels does not imply protection changes', () => {
    const program = {
      program_name: 'Test Program',
      group_name: 'Morning Group',
      protection_level: 'pilot' as const,
      pilot_status: 'active' as const,
    };
    const afterDisplayName = { ...program, program_name: 'Updated Test Program' };
    const afterGroupName = { ...program, group_name: 'Afternoon Group' };

    expect(resolvePilotProgramProtectionLevel(afterDisplayName)).toBe('pilot');
    expect(resolvePilotProgramProtectionLevel(afterGroupName)).toBe('pilot');
  });

  test('changing protection level does not affect code fields', () => {
    const before = {
      protection_level: 'testing' as const,
      program_code: 'CMP-X7Q4P2',
      family_access_code: 'FAM-X7Q4P2',
      facilitator_access_code: 'FAC-X7Q4P2',
    };
    const after = { ...before, protection_level: 'production' as const };

    expect(after.program_code).toBe(before.program_code);
    expect(after.family_access_code).toBe(before.family_access_code);
    expect(after.facilitator_access_code).toBe(before.facilitator_access_code);
  });
});
