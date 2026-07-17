const crypto = require('crypto');
const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');

const REQUEST_TIMEOUT_MS = 12000;

function safeText(value, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeText(value, 320));
}

function supportCode(value) {
  return String(value || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'SIGNUP';
}

function validIdempotencyKey(value) {
  return /^[a-zA-Z0-9._:-]{8,160}$/.test(String(value || ''));
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCodeToken(length = 6) {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('');
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error('signup_timeout')), timeoutMs);
      timer.unref?.();
    }),
  ]);
}

exports.handler = async (event) => {
  const correlation = correlationId(event);
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, code: 'validation_error', message: 'Method not allowed.', supportCode: supportCode(correlation) }, correlation);
  }

  const supabase = getServerSupabase();
  const configuredUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
  console.info('[PILOT_SIGNUP_RUNTIME]', {
    correlationId: correlation,
    supabaseUrlPresent: Boolean(configuredUrl),
    serviceRolePresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
  if (!supabase) {
    return json(503, { success: false, code: 'configuration_error', message: 'Family signup is not configured.', supportCode: supportCode(correlation) }, correlation);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, code: 'validation_error', message: 'Invalid signup request.', supportCode: supportCode(correlation) }, correlation);
  }

  const record = body?.record || {};
  const childFirstName = safeText(body?.childFirstName, 80);
  const idempotencyHeader = event.headers?.['x-idempotency-key'] || event.headers?.['X-Idempotency-Key'];
  const idempotencyKey = validIdempotencyKey(idempotencyHeader)
    ? String(idempotencyHeader)
    : crypto.randomUUID();

  if (
    record.program_type !== 'independent_family' ||
    !safeText(record.admin_email, 320) ||
    !safeText(record.admin_first_name, 80) ||
    !safeText(record.program_name) ||
    !childFirstName ||
    record.agreed_to_terms !== true
  ) {
    return json(400, {
      success: false,
      code: 'validation_error',
      message: 'Complete the parent, child, and terms fields before continuing.',
      supportCode: supportCode(correlation),
    }, correlation);
  }

  if (!validEmail(record.admin_email)) {
    return json(400, {
      success: false,
      code: 'validation_error',
      message: 'Enter a valid parent or guardian email.',
      supportCode: supportCode(correlation),
    }, correlation);
  }

  const codeToken = randomCodeToken();
  const transactionRecord = {
    ...record,
    program_code: `CMP-${codeToken}`,
    family_access_code: `FAM-${codeToken}`,
    facilitator_access_code: null,
  };

  console.info('[PILOT_SIGNUP_PAYLOAD]', {
    correlationId: correlation,
    programType: record.program_type,
    hasParentEmail: Boolean(record.admin_email),
    hasParentName: Boolean(record.admin_first_name),
    hasChildName: Boolean(childFirstName),
    agreedToTerms: record.agreed_to_terms === true,
    browserSuppliedProgramCode: Boolean(record.program_code),
    browserSuppliedFamilyCode: Boolean(record.family_access_code),
  });

  console.info('[PILOT_SIGNUP_STEP]', { correlationId: correlation, step: 'transaction_start' });
  try {
    const { data, error } = await withTimeout(
      supabase.rpc('create_independent_family_signup', {
        signup_record: transactionRecord,
        child_first_name_input: childFirstName,
        idempotency_key_input: idempotencyKey,
      }),
      REQUEST_TIMEOUT_MS,
    );

    if (error) {
      console.warn('[PILOT_SIGNUP_FAILED]', {
        correlationId: correlation,
        step: 'transaction',
        databaseCode: error.code || 'unknown',
        errorCategory: /create_independent_family_signup|schema cache|does not exist/i.test(error.message || '')
          ? 'missing_migration'
          : error.code === '23505' ? 'duplicate' : 'database_error',
      });
      const missingMigration = /create_independent_family_signup|schema cache|does not exist/i.test(error.message || '');
      const duplicate = error.code === '23505';
      return json(missingMigration ? 503 : duplicate ? 409 : 500, {
        success: false,
        code: missingMigration ? 'configuration_error' : duplicate ? 'duplicate' : 'server_error',
        message: missingMigration
          ? 'Family signup is temporarily unavailable while the service is updated.'
          : duplicate
            ? 'This family signup conflicts with an existing account. Sign in or contact support.'
            : 'Could not create family access right now. Please try again.',
        supportCode: supportCode(correlation),
      }, correlation);
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.program || !result?.participant_id) {
      throw new Error('invalid_transaction_response');
    }

    console.info('[PILOT_SIGNUP_STEP]', {
      correlationId: correlation,
      step: 'transaction_complete',
      program_id: result.program.id,
      participant_id: result.participant_id,
      reused: Boolean(result.reused),
    });
    return json(200, {
      success: true,
      program: result.program,
      participantId: result.participant_id,
      reused: Boolean(result.reused),
      redirectDestination: '/family-hub',
    }, correlation);
  } catch (error) {
    const timedOut = error instanceof Error && error.message === 'signup_timeout';
    console.warn('[PILOT_SIGNUP_FAILED]', {
      correlationId: correlation,
      step: timedOut ? 'timeout' : 'unexpected',
    });
    return json(timedOut ? 504 : 500, {
      success: false,
      code: timedOut ? 'timeout' : 'server_error',
      message: timedOut
        ? 'Creating family access took too long. Please try again.'
        : 'Could not create family access right now. Please try again.',
      supportCode: supportCode(correlation),
    }, correlation);
  }
};
