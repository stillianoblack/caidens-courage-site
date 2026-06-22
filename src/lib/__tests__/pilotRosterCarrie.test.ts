import { formatParentGuardianShort } from '../pilotStudentProgress';
import { resolveRosterParentConnectionStatus } from '../parentGuardianIdentity';
import type { StudentFamilyLink } from '../studentFamilyLinkService';

const baseLink = (overrides: Partial<StudentFamilyLink> = {}): StudentFamilyLink =>
  ({
    id: 'link-1',
    student_id: 'student-carrie',
    camp_program_code: 'CAMP-2026',
    family_program_code: null,
    parent_first_name: null,
    parent_email: null,
    parent_last_name: null,
    parent_phone: null,
    relationship: null,
    parent_claimed: false,
    claimed_at: null,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as StudentFamilyLink;

describe('pilot roster Carrie scenario', () => {
  test('student added without parent info shows Parent/Guardian em dash', () => {
    const link = baseLink({ parent_last_name: null, parent_email: null });

    expect(formatParentGuardianShort('', '')).toBe('—');
    expect(formatParentGuardianShort('', 'Pending')).toBe('—');
    expect(resolveRosterParentConnectionStatus(link).label).toBe('Parent not connected');
  });

  test('legacy Pending stub does not render as a parent name', () => {
    const link = baseLink({ parent_last_name: 'Pending' });

    expect(formatParentGuardianShort('', 'Pending')).toBe('—');
    expect(resolveRosterParentConnectionStatus(link).label).toBe('Parent not connected');
  });
});
