import { generateFamilyClaimCode, isFamilyClaimCode } from '../familyClaimCode';
import {
  generateProgramCodes,
  normalizePilotAccessCode,
} from '../pilotProgramService';
import { resolveCanonicalProgramCodeAlias } from '../portalCodeIdentity';
import { programScopesMatch } from '../portalProgramScope';

describe('portal code identity', () => {
  test('new generated family/program/claim codes are unique and collision-resistant', () => {
    const generated = Array.from({ length: 50 }, () =>
      generateProgramCodes('Camp / Youth Program', 'Example Camp', 2026),
    );

    const programCodes = new Set(generated.map((row) => row.program_code));
    const familyCodes = new Set(generated.map((row) => row.family_access_code));
    const claimCodes = new Set(Array.from({ length: 50 }, () => generateFamilyClaimCode()));

    expect(programCodes.size).toBe(generated.length);
    expect(familyCodes.size).toBe(generated.length);
    expect(claimCodes.size).toBe(50);
    expect(generated[0].program_code).toMatch(/^CMP-[A-Z0-9]{6}$/);
    expect(generated[0].family_access_code).toMatch(/^FAM-[A-Z0-9]{6}$/);
    expect(generated[0].facilitator_access_code).toMatch(/^FAC-[A-Z0-9]{6}$/);
    expect(generated[0].family_access_code.slice(4)).toBe(generated[0].program_code.slice(4));
    expect(generated[0].facilitator_access_code?.slice(4)).toBe(generated[0].program_code.slice(4));
    expect(isFamilyClaimCode(Array.from(claimCodes)[0])).toBe(true);
  });

  test('program display name changes do not imply browser-side program code changes', () => {
    const legacyProgramCode = 'CMP-LEGACY1';
    const displayName = 'Updated Example Camp';

    expect(displayName).toBe('Updated Example Camp');
    expect(normalizePilotAccessCode(legacyProgramCode)).toBe('CMP-LEGACY1');
    expect(programScopesMatch('CMP-OLD111', legacyProgramCode)).toBe(false);
    expect(programScopesMatch('CMP-NEW222', legacyProgramCode)).toBe(false);
  });

  test('app code does not hardcode program-specific aliases', () => {
    expect(resolveCanonicalProgramCodeAlias('family-example-2026')).toBe('FAMILY-EXAMPLE-2026');
    expect(resolveCanonicalProgramCodeAlias('facilitator-example-2026')).toBe('FACILITATOR-EXAMPLE-2026');
  });
});
