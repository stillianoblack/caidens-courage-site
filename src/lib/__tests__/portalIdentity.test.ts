import type { ParentClaimContext } from '../../config/parentClaimContext';
import { resolveParentClaimState } from '../familyParentClaimState';
import {
  isParentConnected,
  isParentConnectedForLink,
  PORTAL_ACCESS_NOT_FOUND_MESSAGE,
  PORTAL_PIN_MISMATCH_MESSAGE,
  resolveParentEmailFromSources,
} from '../portalIdentity';
import {
  classifyPortalCredential,
  resolvePortalUnlockDestination,
} from '../portalUnlockRoute';
import type { StudentFamilyLink } from '../studentFamilyLinkService';

const baseLink = (overrides: Partial<StudentFamilyLink> = {}): StudentFamilyLink =>
  ({
    id: 'link-1',
    student_id: 'child-1',
    family_program_code: 'FAMILY-TEST',
    camp_program_code: 'CAMP-TEST',
    parent_email: null,
    parent_first_name: null,
    parent_last_name: null,
    parent_phone: null,
    parent_claimed: false,
    relationship: 'parent',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as StudentFamilyLink;

describe('portal identity', () => {
  test('parent connected requires stored email on claimed link', () => {
    expect(isParentConnectedForLink(baseLink({ parent_claimed: true }))).toBe(false);
    expect(
      isParentConnectedForLink(
        baseLink({ parent_claimed: true, parent_email: 'parent@example.com' }),
      ),
    ).toBe(true);
  });

  test('false positive parent_claimed without email is not connected', () => {
    const links = [baseLink({ parent_claimed: true })];
    const status = resolveParentClaimState({
      claimRequired: false,
      familyLinks: links,
      visibleChildrenCount: 1,
      programCode: 'FAMILY-TEST',
    });
    expect(status.state).toBe('pending_claim');
    expect(status.label).toBe('Parent not connected');
  });

  test('resolveParentEmailFromSources prefers linked email', () => {
    const email = resolveParentEmailFromSources({
      programCode: 'FAMILY-TEST',
      parentLink: baseLink({
        parent_claimed: true,
        parent_email: 'parent@example.com',
      }),
    });
    expect(email).toBe('parent@example.com');
  });

  test('isParentConnected is true when scoped link has email', () => {
    expect(
      isParentConnected({
        programCode: 'FAMILY-TEST',
        familyLinks: [
          baseLink({
            parent_claimed: true,
            parent_email: 'parent@example.com',
          }),
        ],
      }),
    ).toBe(true);
  });

  test('portal credential routing separates parent email and student PIN', () => {
    expect(classifyPortalCredential('4321')).toBe('student_pin');
    expect(classifyPortalCredential('parent@example.com')).toBe('parent_email');
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'CAMP-TEST-FAMILY',
        parentEmail: '4321',
        programRole: 'family',
      }),
    ).toBe('kid_shell');
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'CAMP-TEST-FAMILY',
        parentEmail: 'parent@example.com',
        programRole: 'family',
      }),
    ).toBe('family_portal');
    expect(
      resolvePortalUnlockDestination({
        accessCode: 'CAMP-TEST-FACIL',
        parentEmail: 'facilitator@camp.org',
        programRole: 'facilitator',
      }),
    ).toBe('facilitator_portal');
  });

  test('exports standardized portal access error messages', () => {
    expect(PORTAL_ACCESS_NOT_FOUND_MESSAGE).toContain('couldn');
    expect(PORTAL_PIN_MISMATCH_MESSAGE).toContain('PIN');
  });
});

describe('parent claim context without email', () => {
  test('unconfirmed claim without link email resolves empty', () => {
    const claim: ParentClaimContext = {
      email: '',
      confirmed: true,
      programCode: 'FAMILY-TEST',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    expect(
      resolveParentEmailFromSources({
        programCode: 'FAMILY-TEST',
        parentClaim: claim,
        parentLink: baseLink(),
      }),
    ).toBe('');
  });
});
