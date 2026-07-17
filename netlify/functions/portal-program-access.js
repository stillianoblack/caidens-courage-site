const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const { safeText } = require('./_lib/familyCompatibilityAuth');

const ACCESS_CODE_RE = /^[A-Z0-9-]{3,120}$/;
const CLAIM_CODE_RE = /^CLAIM-/;

function normalizeAccessCode(value) {
  return safeText(value, 120).toUpperCase().replace(/\s+/g, '');
}

function normalizeEmail(value) {
  return safeText(value, 320).toLowerCase();
}

function resolveRoleFromAliasType(value) {
  return safeText(value, 80).toLowerCase().includes('family') ? 'family' : 'facilitator';
}

function resolveRoleFromProgram(program, accessCode) {
  if (normalizeAccessCode(program.family_access_code) === accessCode) return 'family';
  if (normalizeAccessCode(program.facilitator_access_code) === accessCode) return 'facilitator';
  if (normalizeAccessCode(program.program_code) !== accessCode) return null;
  return program.program_type === 'independent_family' ? 'family' : 'facilitator';
}

async function findProgramByCode(supabase, accessCode) {
  const select = [
    'id',
    'program_name',
    'program_code',
    'program_type',
    'admin_first_name',
    'admin_email',
    'estimated_students',
    'age_range',
    'group_name',
    'family_access_code',
    'facilitator_access_code',
    'pricing_tier',
    'payment_status',
    'pilot_status',
    'agreed_at',
    'created_at',
  ].join(',');

  const { data, error } = await supabase
    .from('pilot_programs')
    .select(select)
    .or(
      `family_access_code.eq.${accessCode},facilitator_access_code.eq.${accessCode},program_code.eq.${accessCode}`,
    )
    .eq('pilot_status', 'active')
    .limit(5);
  if (error) return { error: 'program_lookup_failed' };

  for (const program of data || []) {
    const role = resolveRoleFromProgram(program, accessCode);
    if (role) return { program, role };
  }

  const { data: alias, error: aliasError } = await supabase
    .from('program_code_aliases')
    .select('program_code, alias_type')
    .eq('alias_code', accessCode)
    .maybeSingle();
  if (aliasError) return { error: 'alias_lookup_failed' };
  if (!alias?.program_code) return { program: null };

  const { data: aliasProgram, error: aliasProgramError } = await supabase
    .from('pilot_programs')
    .select(select)
    .eq('program_code', safeText(alias.program_code, 120))
    .eq('pilot_status', 'active')
    .maybeSingle();
  if (aliasProgramError) return { error: 'program_lookup_failed' };
  if (!aliasProgram) return { program: null };
  return { program: aliasProgram, role: resolveRoleFromAliasType(alias.alias_type) };
}

async function findProgramByClaimCode(supabase, claimCode) {
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .select('id, first_name, nickname, program_code')
    .eq('family_claim_code', claimCode)
    .eq('role', 'student')
    .maybeSingle();
  if (participantError) return { error: 'claim_lookup_failed' };
  if (!participant?.program_code) return { program: null };

  const result = await findProgramByCode(supabase, normalizeAccessCode(participant.program_code));
  if (result.error || !result.program) return result;
  return {
    ...result,
    role: 'family',
    claimCodeContext: {
      participantId: String(participant.id),
      childDisplayName:
        safeText(participant.nickname, 120) || safeText(participant.first_name, 120) || 'Child',
      campProgramCode: safeText(participant.program_code, 120),
    },
  };
}

function credentialMatches(program, role, intent, credential) {
  const shouldVerify =
    (role === 'family' && program.program_type === 'independent_family' && intent === 'parent') ||
    (role === 'facilitator' && intent === 'facilitator');
  if (!shouldVerify || !credential) return { valid: true, verified: false };
  return {
    valid: normalizeEmail(program.admin_email) === credential,
    verified: normalizeEmail(program.admin_email) === credential,
  };
}

function sessionProgram(program, role, credential, credentialVerified) {
  const familyAccessCode = role === 'family' ? normalizeAccessCode(program.family_access_code) : '';
  const facilitatorAccessCode =
    role === 'facilitator' ? normalizeAccessCode(program.facilitator_access_code) : null;
  return {
    id: String(program.id || ''),
    programName: safeText(program.program_name, 180),
    programCode: safeText(program.program_code, 120),
    programType:
      program.program_type === 'independent_family'
        ? 'Independent Family'
        : safeText(program.program_type, 80),
    adminFirstName: safeText(program.admin_first_name, 120),
    // The stored email is never returned. A verified submitted email may be echoed so
    // existing client session code can retain its current, non-authoritative shape.
    adminEmail: credentialVerified ? credential : '',
    estimatedStudents: Number(program.estimated_students || 0),
    ageRange: safeText(program.age_range, 80),
    groupName: safeText(program.group_name, 180),
    familyAccessCode,
    facilitatorAccessCode,
    pricingTier: safeText(program.pricing_tier, 80),
    paymentStatus: safeText(program.payment_status, 80),
    pilotStatus: safeText(program.pilot_status, 80),
    agreedAt: safeText(program.agreed_at, 80),
    createdAt: safeText(program.created_at, 80) || undefined,
  };
}

exports.handler = async (event) => {
  const id = correlationId(event);
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, code: 'method_not_allowed' }, id);
  }

  const supabase = getServerSupabase();
  if (!supabase) return json(503, { success: false, code: 'service_unavailable' }, id);

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, code: 'invalid_json' }, id);
  }

  const accessCode = normalizeAccessCode(body.accessCode);
  const intent = ['student', 'parent', 'facilitator'].includes(body.intent)
    ? body.intent
    : null;
  const credential = normalizeEmail(body.credential);
  if (!ACCESS_CODE_RE.test(accessCode)) {
    return json(400, { success: false, code: 'invalid_access_code' }, id);
  }

  const result = CLAIM_CODE_RE.test(accessCode)
    ? await findProgramByClaimCode(supabase, accessCode)
    : await findProgramByCode(supabase, accessCode);
  if (result.error) return json(503, { success: false, code: result.error }, id);
  if (!result.program || !result.role) {
    return json(404, { success: false, code: 'program_not_found' }, id);
  }

  const credentialCheck = credentialMatches(
    result.program,
    result.role,
    intent,
    credential,
  );
  if (!credentialCheck.valid) {
    return json(403, { success: false, code: 'credential_not_connected' }, id);
  }

  return json(200, {
    success: true,
    role: result.role,
    program: sessionProgram(
      result.program,
      result.role,
      credential,
      credentialCheck.verified,
    ),
    ...(result.claimCodeContext ? { claimCodeContext: result.claimCodeContext } : {}),
  }, id);
};
