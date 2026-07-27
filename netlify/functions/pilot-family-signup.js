const crypto = require('crypto');
const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const { sendWelcomeEmail } = require('./_lib/emailProvider');
const {
  createDeliveryAttempt,
  recipientIdentifier,
  updateDeliveryAttempt,
} = require('./_lib/emailDeliveryLog');

const REQUEST_TIMEOUT_MS = 12000;
const EMAIL_TIMEOUT_MS = 8000;
const STAFF_PROGRAM_TYPES = new Set([
  'Camp / Youth Program',
  'Teacher / Classroom',
  'After-School Program',
  'School',
  'District',
  'Homeschool Group',
]);

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

function generatedCodes(independentFamily) {
  const token = randomCodeToken();
  return {
    program_code: `CMP-${token}`,
    family_access_code: `FAM-${token}`,
    facilitator_access_code: independentFamily ? null : `FAC-${token}`,
  };
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

function siteUrl() {
  return String(process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://caidenscourage.com')
    .replace(/\/+$/, '');
}

function recipientRole(programType) {
  return ['Teacher / Classroom', 'School', 'District'].includes(programType)
    ? 'educator'
    : 'facilitator';
}

async function deliverWelcome(supabase, input) {
  const emailPayload = {
    recipientEmail: input.record.admin_email,
    emailType: 'welcome',
    templateType: input.templateType,
    programType: input.programType,
    recipientRole: input.recipientRole,
    recipientName: input.record.admin_first_name,
    learnerName: input.childFirstName || null,
    programName: input.program.program_name || input.record.program_name,
    familyAccessCode: input.program.family_access_code,
    facilitatorAccessCode: input.program.facilitator_access_code,
    ...(input.templateType === 'staff' ? { programCode: input.program.program_code } : {}),
    portalLink: `${siteUrl()}/portal`,
    relatedStudentId: input.participantId || null,
    relatedProgramId: input.program.id,
    correlationId: input.correlation,
    deliveryEventKey: `pilot-program:${input.program.id}:${input.templateType === 'staff' ? 'admin' : 'parent'}-welcome`,
    emailProvider: 'resend',
  };
  const queuedLog = await createDeliveryAttempt(supabase, emailPayload).catch(() => ({
    logged: false,
    reason: 'delivery_log_unavailable',
  }));
  const emailResult = queuedLog.duplicate
    ? {
        success: true,
        duplicateSuppressed: true,
        providerMessageId: queuedLog.existing?.provider_message_id || null,
      }
    : await withTimeout(
        sendWelcomeEmail(emailPayload),
        EMAIL_TIMEOUT_MS,
        'email_timeout',
      ).catch((error) => ({
        success: false,
        error: error instanceof Error ? error.message : 'Welcome email delivery failed.',
      }));
  if (!queuedLog.duplicate) {
    await updateDeliveryAttempt(
      supabase,
      queuedLog.id,
      emailResult.success ? 'sent' : 'failed',
      {
        providerMessageId: emailResult.providerMessageId || null,
        errorMessage: emailResult.success ? null : emailResult.error,
        retryEligible: !emailResult.success,
        correlationId: input.correlation,
      },
    ).catch(() => ({ logged: false, reason: 'delivery_log_unavailable' }));
  }
  console[emailResult.success ? 'info' : 'warn']('[PILOT_SIGNUP_WELCOME_EMAIL]', {
    correlationId: input.correlation,
    program_id: input.program.id,
    participant_id: input.participantId || null,
    recipient_identifier: recipientIdentifier(input.record.admin_email),
    template_type: input.templateType,
    status: emailResult.success ? 'sent' : 'failed',
    duplicate_suppressed: Boolean(emailResult.duplicateSuppressed),
    provider_message_id: emailResult.providerMessageId || null,
    error_category: emailResult.success ? null : 'welcome_email_delivery_failed',
  });
  return emailResult.success ? (emailResult.duplicateSuppressed ? 'duplicate_suppressed' : 'sent') : 'failed';
}

async function findProgramByIdempotencyKey(supabase, idempotencyKey) {
  const { data, error } = await supabase
    .from('pilot_programs')
    .select('*')
    .eq('signup_idempotency_key', idempotencyKey)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function createStaffProgram(supabase, record, idempotencyKey) {
  const existing = await findProgramByIdempotencyKey(supabase, idempotencyKey);
  if (existing) return { program: existing, reused: true };

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const transactionRecord = {
      ...record,
      ...generatedCodes(false),
      signup_idempotency_key: idempotencyKey,
    };
    const { data, error } = await supabase
      .from('pilot_programs')
      .insert(transactionRecord)
      .select('*')
      .single();
    if (!error && data) return { program: data, reused: false };
    if (error?.code !== '23505') throw error;
    const raced = await findProgramByIdempotencyKey(supabase, idempotencyKey);
    if (raced) return { program: raced, reused: true };
  }
  throw new Error('access_code_collision');
}

async function createCampParentProgram(supabase, body, idempotencyKey) {
  const requestedCode = safeText(body?.requestedProgramCode, 160);
  const record = body?.record || {};
  if (
    !requestedCode ||
    !safeText(record.admin_email, 320) ||
    !safeText(record.admin_first_name, 80) ||
    !safeText(record.program_name)
  ) {
    return { error: 'validation_error' };
  }
  const { data: existing, error: lookupError } = await supabase
    .from('pilot_programs')
    .select('*')
    .eq('program_code', requestedCode)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return { program: existing, reused: true };
  const payload = {
    ...record,
    program_type: 'independent_family',
    program_code: requestedCode,
    family_access_code: `${requestedCode}-FAMILY`,
    facilitator_access_code: null,
    signup_idempotency_key: idempotencyKey,
  };
  const { data, error } = await supabase.from('pilot_programs').insert(payload).select('*').single();
  if (!error && data) return { program: data, reused: false };
  if (error?.code === '23505') {
    const { data: raced } = await supabase
      .from('pilot_programs')
      .select('*')
      .eq('program_code', requestedCode)
      .maybeSingle();
    if (raced) return { program: raced, reused: true };
  }
  throw error;
}

exports.handler = async (event) => {
  const correlation = correlationId(event);
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, code: 'validation_error', message: 'Method not allowed.', supportCode: supportCode(correlation) }, correlation);
  }

  const supabase = getServerSupabase();
  console.info('[PILOT_SIGNUP_RUNTIME]', {
    correlationId: correlation,
    supabaseUrlPresent: Boolean(process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL),
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

  if (body?.flow === 'camp_parent_program') {
    try {
      const result = await createCampParentProgram(supabase, body, idempotencyKey);
      if (result.error) {
        return json(400, {
          success: false,
          code: result.error,
          message: 'Complete the parent information before continuing.',
        }, correlation);
      }
      return json(200, {
        success: true,
        program: result.program,
        reused: Boolean(result.reused),
        redirectDestination: '/family-hub',
      }, correlation);
    } catch {
      return json(500, {
        success: false,
        code: 'server_error',
        message: 'Could not set up your family portal. Please try again.',
      }, correlation);
    }
  }

  const independentFamily = record.program_type === 'independent_family';
  const staffProgram = STAFF_PROGRAM_TYPES.has(record.program_type);
  if (
    (!independentFamily && !staffProgram) ||
    !safeText(record.admin_email, 320) ||
    !safeText(record.admin_first_name, 80) ||
    !safeText(record.program_name) ||
    (independentFamily && !childFirstName) ||
    record.agreed_to_terms !== true
  ) {
    return json(400, {
      success: false,
      code: 'validation_error',
      message: independentFamily
        ? 'Complete the parent, child, and terms fields before continuing.'
        : 'Complete the program, administrator, and terms fields before continuing.',
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

  const transactionRecord = {
    ...record,
    ...generatedCodes(independentFamily),
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
    if (staffProgram) {
      const result = await withTimeout(
        createStaffProgram(supabase, record, idempotencyKey),
        REQUEST_TIMEOUT_MS,
      );
      const welcomeEmailStatus = result.reused
        ? 'not_resent'
        : await deliverWelcome(supabase, {
            record,
            program: result.program,
            programType: record.program_type,
            recipientRole: recipientRole(record.program_type),
            templateType: 'staff',
            correlation,
          });
      return json(200, {
        success: true,
        program: result.program,
        reused: Boolean(result.reused),
        welcomeEmailStatus,
        redirectDestination: '/program-dashboard?welcome=1',
      }, correlation);
    }

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

    let welcomeEmailStatus = result.reused ? 'not_resent' : 'failed';
    if (!result.reused) {
      welcomeEmailStatus = await deliverWelcome(supabase, {
        record,
        program: result.program,
        participantId: result.participant_id,
        childFirstName,
        programType: 'independent_family',
        recipientRole: 'parent_guardian',
        templateType: 'family',
        correlation,
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
