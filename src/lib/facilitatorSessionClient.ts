import type { ActivePilotProgram } from '../types/pilotProgram';
import { writeActivePilotProgram } from '../config/activePilotProgram';
import { writeActivePortalRole, clearActiveAccessCode } from '../config/portalContext';
import { writePortalSessionUnlock } from '../config/portalAccess';
import { syncPortalProgramContext } from './activeProgramContext';
import { notifyPortalSessionChanged } from './portalSessionEvents';

export function activateSecureFacilitatorSession(program: ActivePilotProgram): void {
  const safeProgram: ActivePilotProgram = {
    ...program,
    adminEmail: '',
    familyAccessCode: '',
    facilitatorAccessCode: null,
  };
  writeActivePilotProgram(safeProgram);
  syncPortalProgramContext(safeProgram);
  writeActivePortalRole('facilitator');
  clearActiveAccessCode();
  writePortalSessionUnlock('pilot');
  notifyPortalSessionChanged('secure_facilitator_session');
}
