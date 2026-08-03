import { ACTIVE_ACCESS_CODE_KEY, ACTIVE_PORTAL_ROLE_KEY } from '../config/portalContext';

const FACILITATOR_LAST_PROGRAM_KEY = 'lastPilotProgram:facilitator';
const LEGACY_LAST_PROGRAM_KEY = 'lastPilotProgram';
const REMEMBERED_ACCESS_KEY = 'cc-remembered-program-access';
const REMEMBERED_DEVICE_KEY = 'cc-remembered-device-session';

function removeIfFacilitator(key: string): void {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    const role = String(parsed?.user_type || parsed?.role || '').toLowerCase();
    if (
      role === 'facilitator' ||
      parsed?.portal_role === 'facilitator' ||
      parsed?.facilitator_id ||
      parsed?.program?.facilitatorAccessCode
    ) {
      localStorage.removeItem(key);
    }
  } catch {
    localStorage.removeItem(key);
  }
}

/** One-time/idempotent removal of legacy facilitator secrets from browser storage. */
export function clearInsecureFacilitatorCredentialStorage(): void {
  try {
    const role = localStorage.getItem(ACTIVE_PORTAL_ROLE_KEY);
    if (role === 'facilitator') localStorage.removeItem(ACTIVE_ACCESS_CODE_KEY);
    localStorage.removeItem(FACILITATOR_LAST_PROGRAM_KEY);
    removeIfFacilitator(LEGACY_LAST_PROGRAM_KEY);
    removeIfFacilitator(REMEMBERED_ACCESS_KEY);
    removeIfFacilitator(REMEMBERED_DEVICE_KEY);
    const rawProgram = localStorage.getItem('activePilotProgram');
    if (role === 'facilitator' && rawProgram) {
      const program = JSON.parse(rawProgram);
      localStorage.setItem('activePilotProgram', JSON.stringify({
        ...program,
        adminEmail: '',
        familyAccessCode: '',
        facilitatorAccessCode: null,
      }));
    }
  } catch {
    // Browser storage can be unavailable or contain stale malformed data.
  }
  try {
    const raw = sessionStorage.getItem('cc-facilitator-student-continuity');
    if (raw) {
      const parsed = JSON.parse(raw);
      delete parsed.activeAccessCode;
      sessionStorage.setItem('cc-facilitator-student-continuity', JSON.stringify(parsed));
    }
  } catch {
    try { sessionStorage.removeItem('cc-facilitator-student-continuity'); } catch { /* noop */ }
  }
}
