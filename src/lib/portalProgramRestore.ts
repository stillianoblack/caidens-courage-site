import { readActivePilotProgram, writeActivePilotProgram } from '../config/activePilotProgram';
import { readActiveFamilyContext } from '../config/portalContext';
import { readLastPilotProgram } from '../config/lastPilotProgram';
import type { ActivePilotProgram } from '../types/pilotProgram';

/** Safely restore activePilotProgram from localStorage when the primary key is missing. */
export function resolveActivePilotProgram(): ActivePilotProgram | null {
  const current = readActivePilotProgram();
  if (current) return current;

  const last = readLastPilotProgram();
  if (last?.program?.programCode && last.program.programName) {
    writeActivePilotProgram(last.program);
    return last.program;
  }

  const familyContext = readActiveFamilyContext();
  if (!familyContext?.programCode || !familyContext.programName) {
    return null;
  }

  const restored: ActivePilotProgram = {
    id: familyContext.programCode,
    programName: familyContext.programName,
    programCode: familyContext.programCode,
    programType: 'Homeschool Group',
    adminFirstName: '',
    adminEmail: '',
    estimatedStudents: 0,
    ageRange: 'Mixed Ages',
    groupName: familyContext.groupName,
    familyAccessCode: familyContext.familyAccessCode,
    facilitatorAccessCode: '',
    pricingTier: 'family_group',
    paymentStatus: 'paid',
    pilotStatus: 'active',
    agreedAt: '',
    createdAt: '',
  };

  writeActivePilotProgram(restored);
  return restored;
}
