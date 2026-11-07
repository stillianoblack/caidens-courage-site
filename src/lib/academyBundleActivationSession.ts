import { readLastPilotProgramForRole } from '../config/lastPilotProgram';
import { readActivePortalRole } from '../config/portalContext';

export type SignedInBundleFamily = {
  parentEmail: string;
  familyAccessCode: string;
};

/** Read the family already signed in by the existing portal. Does not create an account. */
export function readSignedInFamilyForActivation(): SignedInBundleFamily | null {
  if (readActivePortalRole() !== 'family') return null;
  const family = readLastPilotProgramForRole('family');
  const parentEmail = family?.admin_email?.trim() || '';
  const familyAccessCode = family?.family_access_code?.trim() || '';
  if (!parentEmail || !familyAccessCode) return null;
  return { parentEmail, familyAccessCode };
}
