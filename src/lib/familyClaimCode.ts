import { PORTAL_PATH } from '../config/courageRoutes';

const CLAIM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CLAIM_CODE_PATTERN = /^CLAIM-[A-Z0-9]{5}-[A-Z0-9]{5}$/;

export function isFamilyClaimCode(value: string): boolean {
  return CLAIM_CODE_PATTERN.test(value.trim().toUpperCase());
}

export function generateFamilyClaimCode(prefix = 'CLAIM'): string {
  let token = '';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  for (let i = 0; i < bytes.length; i += 1) {
    token += CLAIM_ALPHABET[bytes[i] % CLAIM_ALPHABET.length];
  }
  return `${prefix}-${token.slice(0, 5)}-${token.slice(5)}`;
}

export function buildFamilyClaimUrl(claimCode: string, origin?: string): string {
  const base = (origin ?? (typeof window !== 'undefined' ? window.location.origin : '')).replace(
    /\/+$/,
    '',
  );
  const code = encodeURIComponent(claimCode.trim());
  return `${base}${PORTAL_PATH}?code=${code}&audience=parents&claim=1`;
}

export function buildStudentLoginUrl(origin?: string): string {
  const base = (origin ?? (typeof window !== 'undefined' ? window.location.origin : '')).replace(
    /\/+$/,
    '',
  );
  return `${base}/kids/login`;
}

export function buildStudentLoginInstructions(input: {
  studentName: string;
  programName: string;
  programCode: string;
  pin: string;
  origin?: string;
}): string {
  return [
    'Student Login Instructions',
    '',
    'Student Name:',
    input.studentName,
    '',
    'Student PIN:',
    input.pin,
    '',
    'Open:',
    buildStudentLoginUrl(input.origin),
    '',
    'Enter your student PIN to continue your adventure.',
  ].join('\n');
}
