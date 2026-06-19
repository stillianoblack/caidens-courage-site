const crypto = require('crypto');

const PBKDF2_ITERATIONS = 120_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

const BLOCKED_PINS = new Set([
  '0000',
  '1111',
  '1234',
  '4321',
  '9999',
  '000000',
  '111111',
  '123456',
  '654321',
  '999999',
]);

function normalizePinInput(value) {
  return String(value || '').replace(/\D/g, '').trim();
}

function generateStudentPin(length = 4) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    let pin = '';
    for (let i = 0; i < length; i += 1) {
      pin += String(Math.floor(Math.random() * 10));
    }
    if (!BLOCKED_PINS.has(pin)) return pin;
  }
  return String(Math.floor(1000 + Math.random() * 8999));
}

function hashStudentPin(programCode, pin) {
  const normalized = normalizePinInput(pin);
  const salt = crypto.randomBytes(SALT_BYTES);
  const hashBytes = crypto.pbkdf2Sync(normalized, salt, PBKDF2_ITERATIONS, HASH_BYTES, 'sha256');
  const fingerprint = buildPinFingerprint(programCode, normalized);
  const hash = `pbkdf2-sha256:${PBKDF2_ITERATIONS}:${salt.toString('base64')}:${hashBytes.toString('base64')}`;
  return { hash, fingerprint };
}

function verifyStudentPinHash(programCode, pin, storedHash) {
  const normalized = normalizePinInput(pin);
  const parts = String(storedHash || '').split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256') return false;
  const iterations = Number(parts[1]);
  const salt = Buffer.from(parts[2], 'base64');
  const expected = Buffer.from(parts[3], 'base64');
  const actual = crypto.pbkdf2Sync(normalized, salt, iterations, expected.length, 'sha256');
  return crypto.timingSafeEqual(actual, expected);
}

function buildPinFingerprint(programCode, pin) {
  const payload = `${String(programCode || '').trim().toUpperCase()}|${normalizePinInput(pin)}`;
  return crypto.createHash('sha256').update(payload).digest('base64');
}

function generateFamilyClaimCode(prefix = 'CLAIM') {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  const bytes = crypto.randomBytes(10);
  for (let i = 0; i < bytes.length; i += 1) {
    token += alphabet[bytes[i] % alphabet.length];
  }
  return `${prefix}-${token.slice(0, 5)}-${token.slice(5)}`;
}

module.exports = {
  BLOCKED_PINS,
  normalizePinInput,
  generateStudentPin,
  hashStudentPin,
  verifyStudentPinHash,
  buildPinFingerprint,
  generateFamilyClaimCode,
};
