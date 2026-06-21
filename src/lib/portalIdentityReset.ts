import { clearLastPilotProgram } from '../config/lastPilotProgram';
import { clearBlueRibbonUnlock } from '../config/blueRibbonPortalAccess';
import { clearFamilyPortalSession } from '../config/familyPortalAccess';
import { clearPortalSessionUnlock } from '../config/portalAccess';
import { clearProgramPortalContext } from '../config/portalContext';
import { clearActiveChild } from './activeChildContext';
import { clearFacilitatorStudentContinuity } from './facilitatorSessionContinuity';
import { writeLocalKidPlaySessionId } from './kidPlaySessionService';
import { logSecurityAudit } from './securityAuditLog';
import { clearStudentPinSession } from './studentPinSession';
import { clearParentClaimContext } from '../config/parentClaimContext';

export function clearStalePortalIdentityState(reason: string): void {
  clearParentClaimContext();
  clearActiveChild();
  clearStudentPinSession();
  clearFacilitatorStudentContinuity();
  writeLocalKidPlaySessionId(null);
  logSecurityAudit('session_identity_cleared', { reason });
}

/** Full portal auth reset when switching programs or signing out. */
export function clearAllPortalAuthState(reason: string): void {
  clearStalePortalIdentityState(reason);
  clearLastPilotProgram();
  clearBlueRibbonUnlock();
  clearPortalSessionUnlock();
  clearFamilyPortalSession();
  clearProgramPortalContext();
  logSecurityAudit('session_identity_cleared', { reason: `${reason}:full_portal_auth` });
}
