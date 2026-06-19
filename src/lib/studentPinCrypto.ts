const PBKDF2_ITERATIONS = 120_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

export const BLOCKED_PINS = new Set(['0000', '1111', '1234', '4321', '9999', '000000', '111111', '123456', '654321', '999999']);

export function isBlockedPin(pin: string): boolean {
  return BLOCKED_PINS.has(pin.trim());
}

export function normalizePinInput(value: string): string {
  return value.replace(/\D/g, '').trim();
}

/** Generate a random 4–6 digit PIN for pilot use. */
export function generateStudentPin(length: 4 | 5 | 6 = 4): string {
  const blocked = BLOCKED_PINS;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    let pin = '';
    for (let i = 0; i < length; i += 1) {
      pin += String(Math.floor(Math.random() * 10));
    }
    if (!blocked.has(pin)) return pin;
  }
  return `${Math.floor(1000 + Math.random() * 8999)}`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export type StoredPinHash = {
  hash: string;
  fingerprint: string;
};

export async function hashStudentPin(programCode: string, pin: string): Promise<StoredPinHash> {
  const normalized = normalizePinInput(pin);
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalized),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_BYTES * 8,
  );
  const hashBytes = new Uint8Array(derived);
  const fingerprint = await buildPinFingerprint(programCode, normalized);
  const hash = `pbkdf2-sha256:${PBKDF2_ITERATIONS}:${bytesToBase64(salt)}:${bytesToBase64(hashBytes)}`;
  return { hash, fingerprint };
}

export async function verifyStudentPinHash(
  programCode: string,
  pin: string,
  storedHash: string,
): Promise<boolean> {
  const normalized = normalizePinInput(pin);
  const parts = storedHash.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256') return false;
  const iterations = Number(parts[1]);
  const salt = base64ToBytes(parts[2]);
  const expected = base64ToBytes(parts[3]);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(normalized),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    expected.length * 8,
  );
  const actual = new Uint8Array(derived);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i += 1) {
    diff |= actual[i] ^ expected[i];
  }
  return diff === 0;
}

export async function buildPinFingerprint(programCode: string, pin: string): Promise<string> {
  const payload = `${programCode.trim().toUpperCase()}|${normalizePinInput(pin)}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  return bytesToBase64(new Uint8Array(digest));
}
