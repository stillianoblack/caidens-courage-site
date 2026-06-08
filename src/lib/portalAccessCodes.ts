/** Legacy demo codes — not stored in Supabase. */
const LEGACY_DEMO_CODES = new Set([
  'BLUERIBBON2026',
  'BLUERIBBON',
  'BLUERIBBONFAMILY',
  'BLUERIBBONKIDS',
]);

const PROGRAM_CODE_PREFIXES = [
  'CAMP',
  'TEACHER',
  'AFTERSCHOOL',
  'SCHOOL',
  'DISTRICT',
  'HOMESCHOOL',
];

export function normalizeAccessCodeInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function isLegacyDemoAccessCode(raw: string): boolean {
  return LEGACY_DEMO_CODES.has(normalizeAccessCodeInput(raw));
}

/** Program signup codes follow PREFIX-NAME-YEAR(-FAMILY|-FACILITATOR). */
export function looksLikeProgramAccessCode(raw: string): boolean {
  const normalized = normalizeAccessCodeInput(raw);
  if (!normalized || isLegacyDemoAccessCode(raw)) return false;
  const prefix = normalized.split('-')[0];
  if (!PROGRAM_CODE_PREFIXES.includes(prefix)) return false;
  return normalized.includes('-');
}

export const PORTAL_DB_UNAVAILABLE_MESSAGE =
  'Portal database connection is unavailable. Please try again later or contact the Caiden\'s Courage team.';
