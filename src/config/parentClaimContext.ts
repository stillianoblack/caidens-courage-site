export const PARENT_CLAIM_EMAIL_KEY = 'parentClaimEmail';
export const PARENT_CLAIM_PHONE_KEY = 'parentClaimPhone';
export const PARENT_CLAIM_LAST_NAME_KEY = 'parentClaimLastName';
export const PARENT_CLAIM_CONFIRMED_KEY = 'parentClaimConfirmed';

export type ParentClaimContext = {
  email: string;
  phone?: string;
  lastName?: string;
  confirmed: boolean;
};

export function readParentClaimContext(): ParentClaimContext | null {
  try {
    const email = localStorage.getItem(PARENT_CLAIM_EMAIL_KEY)?.trim() ?? '';
    const phone = localStorage.getItem(PARENT_CLAIM_PHONE_KEY)?.trim() ?? '';
    if (!email && !phone) return null;
    return {
      email,
      phone: phone || undefined,
      lastName: localStorage.getItem(PARENT_CLAIM_LAST_NAME_KEY)?.trim() || undefined,
      confirmed: localStorage.getItem(PARENT_CLAIM_CONFIRMED_KEY) === 'true',
    };
  } catch {
    return null;
  }
}

export function hasConfirmedParentClaim(scope?: ParentClaimContext | null): boolean {
  const claim = scope ?? readParentClaimContext();
  if (!claim?.confirmed) return false;
  const email = claim.email?.trim() ?? '';
  const phone = claim.phone?.replace(/\D/g, '') ?? '';
  return Boolean(email || phone);
}

export function writeParentClaimContext(input: ParentClaimContext): void {
  try {
    localStorage.setItem(PARENT_CLAIM_EMAIL_KEY, input.email.trim());
    if (input.phone?.trim()) {
      localStorage.setItem(PARENT_CLAIM_PHONE_KEY, input.phone.trim());
    } else {
      localStorage.removeItem(PARENT_CLAIM_PHONE_KEY);
    }
    if (input.lastName?.trim()) {
      localStorage.setItem(PARENT_CLAIM_LAST_NAME_KEY, input.lastName.trim());
    } else {
      localStorage.removeItem(PARENT_CLAIM_LAST_NAME_KEY);
    }
    localStorage.setItem(PARENT_CLAIM_CONFIRMED_KEY, input.confirmed ? 'true' : 'false');
  } catch {
    /* localStorage unavailable */
  }
}

export function clearParentClaimContext(): void {
  try {
    localStorage.removeItem(PARENT_CLAIM_EMAIL_KEY);
    localStorage.removeItem(PARENT_CLAIM_PHONE_KEY);
    localStorage.removeItem(PARENT_CLAIM_LAST_NAME_KEY);
    localStorage.removeItem(PARENT_CLAIM_CONFIRMED_KEY);
  } catch {
    /* localStorage unavailable */
  }
}
