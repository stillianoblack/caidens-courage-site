export const ADMIN_PORTAL_PATH = '/admin';
export const ADMIN_SESSION_KEY = 'cc-admin-portal-session';

export function isAdminAccessConfigured(): boolean {
  const email = process.env.REACT_APP_ADMIN_EMAIL?.trim();
  const passcode = process.env.REACT_APP_ADMIN_PASSCODE?.trim();
  return Boolean(email && passcode);
}

export function getConfiguredAdminEmail(): string | null {
  const email = process.env.REACT_APP_ADMIN_EMAIL?.trim();
  return email || null;
}

export function verifyAdminCredentials(email: string, passcode: string): boolean {
  const configuredEmail = getConfiguredAdminEmail();
  const configuredPasscode = process.env.REACT_APP_ADMIN_PASSCODE?.trim();
  if (!configuredEmail || !configuredPasscode) {
    return false;
  }

  return (
    email.trim().toLowerCase() === configuredEmail.toLowerCase() &&
    passcode.trim() === configuredPasscode
  );
}

export function readAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === '1') return true;
    return localStorage.getItem(ADMIN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeAdminSession(): void {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    localStorage.setItem(ADMIN_SESSION_KEY, '1');
  } catch {
    /* storage unavailable */
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}
