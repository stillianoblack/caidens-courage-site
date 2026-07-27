export const ADMIN_PORTAL_PATH = '/admin';
export const ADMIN_SESSION_KEY = 'cc-admin-portal-session';
const ADMIN_SESSION_EMAIL_KEY = 'cc-admin-portal-session-email';

/** @deprecated Admin authorization is now server-verified through AdminAuthContext. */
export function isAdminAccessConfigured(): boolean {
  return false;
}

export function isAdminPermanentDeleteEnabled(): boolean {
  return process.env.REACT_APP_ADMIN_ALLOW_DELETE === 'true';
}

/** @deprecated Client bundles must never contain administrator identities. */
export function getConfiguredAdminEmail(): string | null {
  return null;
}

export function getConfiguredSuperAdminEmail(): string | null {
  return null;
}

/** @deprecated Client-side credentials are not an authorization mechanism. */
export function verifyAdminCredentials(email: string, passcode: string): boolean {
  void email;
  void passcode;
  return false;
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

export function readAdminSessionEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(ADMIN_SESSION_EMAIL_KEY) || localStorage.getItem(ADMIN_SESSION_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function isSuperAdminSession(): boolean {
  const superAdminEmail = getConfiguredSuperAdminEmail();
  const sessionEmail = readAdminSessionEmail();
  if (!readAdminSession() || !superAdminEmail || !sessionEmail) return false;
  return sessionEmail.trim().toLowerCase() === superAdminEmail.trim().toLowerCase();
}

export function writeAdminSession(email?: string): void {
  try {
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    localStorage.setItem(ADMIN_SESSION_KEY, '1');
    const normalizedEmail = email?.trim();
    if (normalizedEmail) {
      sessionStorage.setItem(ADMIN_SESSION_EMAIL_KEY, normalizedEmail);
      localStorage.setItem(ADMIN_SESSION_EMAIL_KEY, normalizedEmail);
    }
  } catch {
    /* storage unavailable */
  }
}

export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_EMAIL_KEY);
    localStorage.removeItem(ADMIN_SESSION_EMAIL_KEY);
  } catch {
    /* storage unavailable */
  }
}
