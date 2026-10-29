import { isProtectedAcademyPath } from '../academyAccessPaths';

describe('academy access paths', () => {
  test('protects kid experiences and leaves parent, camp facilitator, and preview routes open', () => {
    expect(isProtectedAcademyPath('/portal/kids/caiden/quest-1')).toBe(true);
    expect(isProtectedAcademyPath('/family-hub/kids/caiden/quest-1')).toBe(true);
    expect(isProtectedAcademyPath('/family-hub/weekly-adventures')).toBe(true);
    expect(isProtectedAcademyPath('/portal/family/weekly-adventures')).toBe(true);
    expect(isProtectedAcademyPath('/portal/family/settings')).toBe(false);
    expect(isProtectedAcademyPath('/portal/facilitator/weekly-modules')).toBe(false);
    expect(isProtectedAcademyPath('/preview/arcade')).toBe(false);
  });
});
