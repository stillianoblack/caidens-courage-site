import {
  FAMILY_PORTAL_FALLBACK_DISPLAY_NAME,
  isLegacyCampBrandLabel,
  resolveFamilyPortalDisplayName,
} from './familyPortalDisplayName';
import { INDEPENDENT_FAMILY_PROGRAM_TYPE } from './independentFamilyProgram';

describe('familyPortalDisplayName', () => {
  it('falls back to Family Portal when no display name is saved', () => {
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

  it('shows user-entered display names including camp-like labels', () => {
    expect(
      resolveFamilyPortalDisplayName({
        program: {
          programType: INDEPENDENT_FAMILY_PROGRAM_TYPE,
          programName: 'Blue Ribbon',
          groupName: 'Blue Ribbon',
          programCode: 'FAMILY-HOME-2026',
        },
      }),
    ).toBe('Blue Ribbon');
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

  it('detects legacy camp brand labels in stale session storage', () => {
    expect(isLegacyCampBrandLabel('Blue Ribbon Camp')).toBe(true);
    expect(isLegacyCampBrandLabel('blueribbon2026')).toBe(true);
    expect(isLegacyCampBrandLabel('Sunshine Valley Camp')).toBe(false);
  });
});
