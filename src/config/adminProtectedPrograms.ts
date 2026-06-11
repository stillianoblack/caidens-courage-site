/** Pilot program codes that must never be archived or deleted from Admin Portal. */
export const PROTECTED_PILOT_PROGRAM_CODES = [
  'CAMP-BLUERIBBONAB-2026',
  'FAMILY-MADDOX-2026',
] as const;

export function isProtectedPilotProgramCode(programCode: string): boolean {
  const normalized = programCode.trim().toUpperCase();
  return PROTECTED_PILOT_PROGRAM_CODES.some((code) => code === normalized);
}

export function isAdminPermanentDeleteEnabled(): boolean {
  return process.env.REACT_APP_ADMIN_ALLOW_DELETE === 'true';
}
