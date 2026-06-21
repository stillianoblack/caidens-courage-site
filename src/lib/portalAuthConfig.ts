export const PORTAL_EMAIL_NOT_REGISTERED_MESSAGE =
  'This email is not registered for this program.';

/** When true, legacy Blue Ribbon demo codes and cross-portal grants are allowed. */
export function isDevAuthBypassEnabled(): boolean {
  return process.env.REACT_APP_DEV_AUTH_BYPASS === 'true';
}

export function isLegacyDemoUnlockAllowed(): boolean {
  return isDevAuthBypassEnabled();
}
