const CODE_SUFFIX_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export type PortalCodeKind = 'program' | 'family' | 'claim';

export function normalizeAccessCodeForIdentity(value?: string | null): string {
  return value?.trim().toUpperCase().replace(/\s+/g, '') ?? '';
}

export function resolveCanonicalProgramCodeAlias(value?: string | null): string {
  return normalizeAccessCodeForIdentity(value);
}

export function programCodesEquivalent(left?: string | null, right?: string | null): boolean {
  const a = resolveCanonicalProgramCodeAlias(left);
  const b = resolveCanonicalProgramCodeAlias(right);
  return Boolean(a && b && a === b);
}

function randomCodeSuffix(length = 4): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((byte) => CODE_SUFFIX_ALPHABET[byte % CODE_SUFFIX_ALPHABET.length])
    .join('');
}

export function slugifyAccessCodeToken(value: string, fallback = 'PROGRAM'): string {
  const slug = value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '');
  return slug || fallback;
}

export function appendCollisionResistantSuffix(baseCode: string, length = 4): string {
  return `${baseCode.replace(/-+$/g, '')}-${randomCodeSuffix(length)}`;
}

export function generateStablePilotCodeToken(): string {
  return randomCodeSuffix(6);
}

export function generateClaimAccessCode(): string {
  return `CLAIM-${randomCodeSuffix(4)}-${randomCodeSuffix(4)}`;
}
