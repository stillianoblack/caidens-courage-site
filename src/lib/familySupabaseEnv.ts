import { isSupabaseConfigReady } from './supabaseClient';

const EXPECTED_PROJECT_REF = process.env.REACT_APP_SUPABASE_EXPECTED_PROJECT_REF?.trim() || '';

export function extractSupabaseProjectRef(url?: string | null): string | null {
  const value = url?.trim();
  if (!value) return null;
  const match = value.match(/https:\/\/([^.]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

export function getSupabaseProjectRef(): string | null {
  return extractSupabaseProjectRef(process.env.REACT_APP_SUPABASE_URL);
}

let envWarningLogged = false;

/** Dev-only warnings when Supabase env is missing or points at an unexpected project. */
export function warnSupabaseEnvInDevelopment(): void {
  if (process.env.NODE_ENV !== 'development' || envWarningLogged) return;
  envWarningLogged = true;

  if (!isSupabaseConfigReady()) {
    console.warn(
      '[LOCAL_DATA_DEBUG] Supabase env missing. Localhost may not show production data. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env.local.',
    );
    return;
  }

  const projectRef = getSupabaseProjectRef();
  if (EXPECTED_PROJECT_REF && projectRef && projectRef !== EXPECTED_PROJECT_REF) {
    console.warn('[LOCAL_DATA_DEBUG] Supabase project ref differs from expected production project.', {
      current: projectRef,
      expected: EXPECTED_PROJECT_REF,
    });
  }
}

export type LocalDataDebugPayload = {
  programCode: string;
  familyContext: Record<string, unknown>;
  linkedChildCount: number;
  fallbackChildCount: number;
  onboarding: Record<string, unknown>;
  errors?: string[];
};

/** Safe dev-only diagnostics — never logs secrets or service keys. */
export function logLocalDataDebug(payload: LocalDataDebugPayload): void {
  if (process.env.NODE_ENV !== 'development') return;

  warnSupabaseEnvInDevelopment();

  console.info('[LOCAL_DATA_DEBUG]', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'ssr',
    program_code: payload.programCode || null,
    family_context: payload.familyContext,
    supabase_project_ref: getSupabaseProjectRef(),
    linked_children: payload.linkedChildCount,
    fallback_children: payload.fallbackChildCount,
    onboarding: payload.onboarding,
    errors: payload.errors?.length ? payload.errors : undefined,
  });
}

/** Dev-only banner helper when roster is empty but Supabase is configured. */
export function warnWhenNoChildrenInDevelopment(childCount: number): string | null {
  if (process.env.NODE_ENV !== 'development') return null;
  warnSupabaseEnvInDevelopment();
  if (!isSupabaseConfigReady()) {
    return 'No child records found for this environment. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env.local.';
  }
  if (childCount === 0) {
    console.warn('[LOCAL_DATA_DEBUG] No child records found for this environment.');
    return 'No child records found for this environment.';
  }
  return null;
}
