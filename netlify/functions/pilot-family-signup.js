const crypto = require('crypto');
const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const { sendWelcomeEmail } = require('./_lib/emailProvider');

const REQUEST_TIMEOUT_MS = 12000;
const EMAIL_TIMEOUT_MS = 8000;

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

function withTimeout(promise, timeoutMs, timeoutCode = 'signup_timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error(timeoutCode)), timeoutMs);
      timer.unref?.();
    }),
  ]);
}

function signupWelcomeBody({ parentFirstName, childFirstName, programName, programCode, familyAccessCode, portalLink }) {
  return [
    `Hi ${parentFirstName || 'there'},`,
    '',
    "Welcome to Caiden's Courage! Your family account is ready.",
    '',
    `Family / Program Name: ${programName}`,
    `Program Code: ${programCode}`,
    `Family Access Code: ${familyAccessCode}`,
    `Child: ${childFirstName}`,
    `Family Portal: ${portalLink}`,
    '',
    'Next steps: sign in, connect to your child, and begin the first adventure.',
    '',
    'Keep this email somewhere safe. You can use these access details to return to your family portal.',
    '',
    'Need help? Reply to this email or contact hello@caidenscourage.com.',
    '',
    'Welcome aboard,',
    "The Caiden's Courage Team",
  ].join('\n');
}

exports.handler = async (event) => {
  const correlation = correlationId(event);
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, code: 'validation_error', message: 'Method not allowed.', supportCode: supportCode(correlation) }, correlation);
  }

  const supabase = getServerSupabase();
  const configuredUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
  const configuredProjectRef = (() => {
    try { return new URL(configuredUrl).hostname.split('.')[0] || ''; } catch { return ''; }
  })();
  console.info('[PILOT_SIGNUP_RUNTIME]', {
    correlationId: correlation,
    supabaseUrlPresent: Boolean(configuredUrl),
    serviceRolePresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    expectedStagingProjectMatch: Boolean(
      configuredProjectRef && configuredProjectRef === process.env.EXPECTED_STAGING_SUPABASE_PROJECT_REF
    ),
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
          ? 'Family signup is temporarily unavailable while staging is updated.'
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

    let welcomeEmailStatus = result.reused ? 'not_resent' : 'failed';
    if (!result.reused) {
      const siteUrl = String(process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://caidenscourage.com')
        .replace(/\/+$/, '');
      const portalLink = `${siteUrl}/portal`;
      const emailResult = await withTimeout(
        sendWelcomeEmail({
          recipientEmail: record.admin_email,
          subject: "Welcome to Caiden's Courage — your family access codes",
          body: signupWelcomeBody({
            parentFirstName: record.admin_first_name,
            childFirstName,
            programName: result.program.program_name || record.program_name,
            programCode: result.program.program_code,
            familyAccessCode: result.program.family_access_code,
            portalLink,
          }),
          parentFirstName: record.admin_first_name,
          childName: childFirstName,
          studentName: childFirstName,
          programName: result.program.program_name || record.program_name,
          programCode: result.program.program_code,
          familyAccessCode: result.program.family_access_code,
          portalLink,
          relatedStudentId: result.participant_id,
          relatedProgramId: result.program.id,
        }),
        EMAIL_TIMEOUT_MS,
        'email_timeout',
      ).catch((error) => ({
        success: false,
        error: error instanceof Error ? error.message : 'Welcome email delivery failed.',
      }));
      welcomeEmailStatus = emailResult.success ? 'sent' : 'failed';
      const logEmailResult = emailResult.success ? console.info : console.warn;
      logEmailResult('[PILOT_SIGNUP_WELCOME_EMAIL]', {
        correlationId: correlation,
        program_id: result.program.id,
        participant_id: result.participant_id,
        status: welcomeEmailStatus,
        provider_message_id: emailResult.providerMessageId || null,
        error: emailResult.success ? null : emailResult.error,
      });
    }

    return json(200, {
      success: true,
      program: result.program,
      participantId: result.participant_id,
      reused: Boolean(result.reused),
      welcomeEmailStatus,
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
