import type { ParentConnectionStatus } from './studentPinService';
import { parentConnectionStatusLabel } from './studentPinService';
import type { StudentFamilyLink } from './studentFamilyLinkService';
import { isParentConnectedForLink } from './portalIdentity';
import { resolveParentGuardianDisplayName } from './studentDisplayName';

export function resolveRosterParentConnectionStatus(link: StudentFamilyLink | undefined): {
  status: ParentConnectionStatus;
  label: string;
} {
  const parentEmail = link?.parent_email?.trim() || '';

  if (link?.parent_claimed && !parentEmail) {
    console.warn('[PARENT_IDENTITY] connected_missing_profile', {
      link_id: link.id,
      student_id: link.student_id,
      camp_program_code: link.camp_program_code,
    });
    return { status: 'connected', label: 'Connected — missing profile' };
  }

  const status: ParentConnectionStatus = isParentConnectedForLink(link)
    ? 'connected'
    : parentEmail
      ? 'invited'
      : 'unclaimed';

  if (status === 'connected') {
    const displayName = resolveParentGuardianDisplayName(link ?? {});
    if (displayName === '—') {
      console.warn('[PARENT_IDENTITY] connected_missing_name', {
        link_id: link?.id,
        student_id: link?.student_id,
        camp_program_code: link?.camp_program_code,
      });
      return { status, label: 'Connected — missing profile' };
    }
  }

  return { status, label: parentConnectionStatusLabel(status) };
}
