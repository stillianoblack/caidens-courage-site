const FAMILY_CONNECTION_FALLBACK =
  'Some family connection information couldn’t be loaded. Your roster is still available.';
const GENERAL_PORTAL_FALLBACK =
  'We couldn’t load the latest program details. Please refresh and try again.';

export function friendlyPortalWarning(error: unknown): string | null {
  const raw = typeof error === 'string'
    ? error.trim()
    : error instanceof Error
      ? error.message.trim()
      : '';
  if (!raw) return null;

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[PORTAL_DATA_WARNING]', raw);
  }

  const normalized = raw.toLowerCase();
  if (
    normalized.includes('student_family_links') ||
    normalized.includes('family link') ||
    normalized.includes('family connection')
  ) {
    return FAMILY_CONNECTION_FALLBACK;
  }
  return GENERAL_PORTAL_FALLBACK;
}

export const PORTAL_FRIENDLY_ERROR_COPY = {
  familyConnection: FAMILY_CONNECTION_FALLBACK,
  general: GENERAL_PORTAL_FALLBACK,
} as const;
