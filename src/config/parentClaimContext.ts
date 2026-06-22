import {
  programScopesMatch,
  resolvePortalProgramScope,
  resolvePortalProgramScopeExcludingParentClaim,
} from '../lib/portalProgramScope';
import { logSessionIsolationWarning } from '../lib/sessionIsolationLog';
import { purgeLegacyIdentityStorage } from '../lib/purgeLegacyIdentityStorage';

/** @deprecated Legacy unscoped keys — cleared on read; never restored without program scope. */
export const PARENT_CLAIM_EMAIL_KEY = 'parentClaimEmail';
export const PARENT_CLAIM_PHONE_KEY = 'parentClaimPhone';
export const PARENT_CLAIM_LAST_NAME_KEY = 'parentClaimLastName';
export const PARENT_CLAIM_CONFIRMED_KEY = 'parentClaimConfirmed';

export const SCOPED_PARENT_CLAIM_KEY = 'cc-scoped-parent-claim';

export type ParentClaimContext = {
  email: string;
  firstName?: string;
  phone?: string;
  lastName?: string;
  confirmed: boolean;
  programCode: string;
  /** Camp program where student PINs + roster rows live (differs from family programCode). */
  campProgramCode?: string;
  accessCode?: string;
  familyId?: string;
  createdAt?: string;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function clearLegacyParentClaimKeys(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(PARENT_CLAIM_EMAIL_KEY);
    localStorage.removeItem(PARENT_CLAIM_PHONE_KEY);
    localStorage.removeItem(PARENT_CLAIM_LAST_NAME_KEY);
    localStorage.removeItem(PARENT_CLAIM_CONFIRMED_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

function hasLegacyParentClaimKeys(): boolean {
  if (!isBrowser()) return false;
  try {
    return Boolean(
      localStorage.getItem(PARENT_CLAIM_EMAIL_KEY)?.trim() ||
        localStorage.getItem(PARENT_CLAIM_PHONE_KEY)?.trim(),
    );
  } catch {
    return false;
  }
}

export function readScopedParentClaimRecord(): ParentClaimContext | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SCOPED_PARENT_CLAIM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ParentClaimContext>;
    const email = parsed.email?.trim() ?? '';
    const phone = parsed.phone?.trim() ?? '';
    const programCode = parsed.programCode?.trim() ?? '';
    if ((!email && !phone) || !programCode) {
      clearScopedParentClaimRecord();
      return null;
    }
    return {
      email,
      firstName: parsed.firstName?.trim() || undefined,
      phone: phone || undefined,
      lastName: parsed.lastName?.trim() || undefined,
      confirmed: parsed.confirmed === true,
      programCode,
      campProgramCode: parsed.campProgramCode?.trim() || undefined,
      accessCode: parsed.accessCode?.trim() || undefined,
      familyId: parsed.familyId?.trim() || undefined,
      createdAt: parsed.createdAt?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

export function writeScopedParentClaimRecord(context: ParentClaimContext): void {
  if (!isBrowser()) return;
  try {
    clearLegacyParentClaimKeys();
    localStorage.setItem(
      SCOPED_PARENT_CLAIM_KEY,
      JSON.stringify({
        ...context,
        email: context.email.trim(),
        firstName: context.firstName?.trim() || undefined,
        phone: context.phone?.trim() || undefined,
        lastName: context.lastName?.trim() || undefined,
      programCode: context.programCode.trim(),
      campProgramCode: context.campProgramCode?.trim() || undefined,
      accessCode: context.accessCode?.trim() || undefined,
        familyId: context.familyId?.trim() || undefined,
        createdAt: context.createdAt?.trim() || new Date().toISOString(),
      }),
    );
  } catch {
    /* localStorage unavailable */
  }
}

export function clearScopedParentClaimRecord(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(SCOPED_PARENT_CLAIM_KEY);
  } catch {
    /* localStorage unavailable */
  }
}

export function readParentClaimContext(options?: {
  programCode?: string;
}): ParentClaimContext | null {
  purgeLegacyIdentityStorage('parent_claim_read');
  const expectedProgram =
    options?.programCode?.trim() ||
    resolvePortalProgramScopeExcludingParentClaim()?.programCode;

  const scoped = readScopedParentClaimRecord();
  if (scoped) {
    if (expectedProgram && !programScopesMatch(scoped.programCode, expectedProgram)) {
      logSessionIsolationWarning('parent_claim_program_mismatch', {
        expected_program_code: expectedProgram,
        stored_program_code: scoped.programCode,
      });
      return null;
    }
    return scoped;
  }

  if (hasLegacyParentClaimKeys()) {
    logSessionIsolationWarning('legacy_parent_claim_rejected', {});
    clearLegacyParentClaimKeys();
  }

  return null;
}

export function hasConfirmedParentClaim(scope?: ParentClaimContext | null): boolean {
  const claim = scope ?? readParentClaimContext();
  if (!claim?.confirmed) return false;
  const email = claim.email?.trim() ?? '';
  const phone = claim.phone?.replace(/\D/g, '') ?? '';
  return Boolean(email || phone);
}

export function writeParentClaimContext(
  input: Omit<ParentClaimContext, 'programCode' | 'createdAt'> & {
    programCode?: string;
    campProgramCode?: string;
    accessCode?: string;
    familyId?: string;
  },
): void {
  const scope = resolvePortalProgramScope();
  const programCode = input.programCode?.trim() || scope?.programCode;
  if (!programCode) {
    logSessionIsolationWarning('parent_claim_write_rejected', {
      reason: 'missing_program_code',
    });
    return;
  }

  writeScopedParentClaimRecord({
    email: input.email.trim(),
    firstName: input.firstName?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    lastName: input.lastName?.trim() || undefined,
    confirmed: input.confirmed,
    programCode,
    campProgramCode: input.campProgramCode?.trim() || undefined,
    accessCode: input.accessCode?.trim() || scope?.accessCode,
    familyId: input.familyId?.trim() || scope?.familyId,
    createdAt: new Date().toISOString(),
  });
}

export function clearParentClaimContext(): void {
  clearScopedParentClaimRecord();
  clearLegacyParentClaimKeys();
}
