import type { ActivePilotProgram, PilotProgramRecord } from '../types/pilotProgram';

export const ACTIVE_PILOT_PROGRAM_KEY = 'activePilotProgram';

export function recordToActivePilotProgram(record: PilotProgramRecord): ActivePilotProgram {
  return {
    id: record.id,
    programName: record.program_name,
    programCode: record.program_code,
    programType: record.program_type,
    adminFirstName: record.admin_first_name,
    adminEmail: record.admin_email,
    estimatedStudents: record.estimated_students,
    ageRange: record.age_range,
    groupName: record.group_name,
    familyAccessCode: record.family_access_code,
    facilitatorAccessCode: record.facilitator_access_code,
    pricingTier: record.pricing_tier,
    paymentStatus: record.payment_status,
    pilotStatus: record.pilot_status,
    agreedAt: record.agreed_at ?? '',
    createdAt: record.created_at,
  };
}

export function readActivePilotProgram(): ActivePilotProgram | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PILOT_PROGRAM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActivePilotProgram;
    if (!parsed?.programCode || !parsed?.programName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeActivePilotProgram(program: ActivePilotProgram): void {
  try {
    localStorage.setItem(ACTIVE_PILOT_PROGRAM_KEY, JSON.stringify(program));
  } catch {
    /* localStorage unavailable */
  }
}

export function clearActivePilotProgram(): void {
  try {
    localStorage.removeItem(ACTIVE_PILOT_PROGRAM_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

export function resolveActiveProgramContext(): {
  programCode: string;
  programName: string;
  groupName: string;
} | null {
  const program = readActivePilotProgram();
  if (!program) return null;
  return {
    programCode: program.programCode,
    programName: program.programName,
    groupName: program.groupName,
  };
}

export function resolveProgramDashboardBrand(program: ActivePilotProgram | null): {
  title: string;
  subtitle: string;
} {
  if (program?.programName) {
    return {
      title: program.programName,
      subtitle: 'Focus Flame Academy',
    };
  }
  return {
    title: 'Focus Flame Academy Pilot',
    subtitle: 'Focus Flame Academy',
  };
}
