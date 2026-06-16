import {
  FAMILY_PORTAL_FALLBACK_DISPLAY_NAME,
  isLegacyCampBrandLabel,
  resolveFamilyPortalDisplayName,
} from './familyPortalDisplayName';
import { INDEPENDENT_FAMILY_PROGRAM_TYPE } from './independentFamilyProgram';

describe('familyPortalDisplayName', () => {
  it('falls back to Family Portal for independent families without a name', () => {
    expect(
      resolveFamilyPortalDisplayName({
        program: {
          programType: INDEPENDENT_FAMILY_PROGRAM_TYPE,
          programName: '',
          groupName: '',
          programCode: 'FAMILY-SMITH-2026',
        },
      }),
    ).toBe(FAMILY_PORTAL_FALLBACK_DISPLAY_NAME);
  });

  it('never surfaces Blue Ribbon branding for independent families', () => {
    expect(
      resolveFamilyPortalDisplayName({
        program: {
          programType: INDEPENDENT_FAMILY_PROGRAM_TYPE,
          programName: 'Blue Ribbon Camp',
          groupName: 'Blue Ribbon 2026',
          programCode: 'FAMILY-HOME-2026',
        },
      }),
    ).toBe(FAMILY_PORTAL_FALLBACK_DISPLAY_NAME);
  });

  it('uses the family display name when provided', () => {
    expect(
      resolveFamilyPortalDisplayName({
        program: {
          programType: INDEPENDENT_FAMILY_PROGRAM_TYPE,
          programName: "Jordan's Family",
          groupName: "Jordan's Family",
          programCode: 'FAMILY-JORDAN-2026',
        },
      }),
    ).toBe("Jordan's Family");
  });

  it('detects legacy camp brand labels', () => {
    expect(isLegacyCampBrandLabel('Blue Ribbon Camp')).toBe(true);
    expect(isLegacyCampBrandLabel('blueribbon2026')).toBe(true);
    expect(isLegacyCampBrandLabel('Sunshine Valley Camp')).toBe(false);
  });
});
