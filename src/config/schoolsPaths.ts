/** Canonical school-facing hub — anchor sections for nav dropdown. */
export const SCHOOLS_PATH = '/schools';

export const SCHOOLS_PILOT_HASH = 'pilot';
export const SCHOOLS_TEACHER_RESOURCES_HASH = 'teacher-resources';
export const SCHOOLS_TRAINING_GUIDES_HASH = 'training-guides';

export const schoolsHref = (hash?: string): string =>
  hash ? `${SCHOOLS_PATH}#${hash}` : SCHOOLS_PATH;

/** Legacy paths → /schools hash targets (client-side redirects). */
export const LEGACY_SCHOOL_HASH_MAP: Record<string, string> = {
  'pilot-program': SCHOOLS_PILOT_HASH,
  'request-information': SCHOOLS_PILOT_HASH,
  'camp-pilot-partnerships': SCHOOLS_PILOT_HASH,
  'camp-courage-toolkit': SCHOOLS_PILOT_HASH,
  'teacher-resources': SCHOOLS_TEACHER_RESOURCES_HASH,
  'sel-framework': '',
  'whats-included': '',
  testimonials: '',
  'what-is-camp-courage': '',
};
