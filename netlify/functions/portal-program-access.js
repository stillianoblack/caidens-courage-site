const { correlationId, getServerSupabase, json } = require('./_lib/crmAuth');
const { safeText } = require('./_lib/familyCompatibilityAuth');
const { validateClientRuntime } = require('./_lib/supabaseRuntime');
const {
  cookieHeader,
  createFacilitatorSession,
  originIsSameHost,
  safeProgram,
} = require('./_lib/facilitatorSession');

const ACCESS_CODE_RE = /^[A-Z0-9-]{3,120}$/;
const CLAIM_CODE_RE = /^CLAIM-/;
const OPTIONAL_ALIAS_OBJECT_CODES = new Set(['PGRST205', '42P01']);
const ALIAS_PERMISSION_CODES = new Set(['42501']);

function parentFamilyProgramCode(parentEmail) {
  return `FAMILY-${require('crypto').createHash('sha256').update(parentEmail).digest('hex').slice(0, 12).toUpperCase()}`;
}

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

function classifyAliasLookupError(error) {
  const code = safeText(error?.code, 40).toUpperCase();
  if (OPTIONAL_ALIAS_OBJECT_CODES.has(code)) return 'alias_object_unavailable';
  if (ALIAS_PERMISSION_CODES.has(code)) return 'alias_permission_denied';
  return 'alias_database_unavailable';
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
  if (aliasError) {
    const aliasLookupStatus = classifyAliasLookupError(aliasError);
    // Aliases are an optional compatibility layer. A missing table or a denied
    // optional lookup must not convert an otherwise unknown code into a 503.
    if (aliasLookupStatus !== 'alias_database_unavailable') {
      return { program: null, aliasLookupStatus };
    }
    return {
      error: 'alias_lookup_unavailable',
      errorStage: 'alias_lookup',
      errorCategory: aliasLookupStatus,
    };
  }
  if (!alias?.program_code) return { program: null, aliasLookupStatus: 'alias_not_found' };

  const { data: aliasProgram, error: aliasProgramError } = await supabase
    .from('pilot_programs')
    .select(select)
    .eq('program_code', safeText(alias.program_code, 120))
    .eq('pilot_status', 'active')
    .maybeSingle();
  if (aliasProgramError) {
    return {
      error: 'program_lookup_failed',
      errorStage: 'alias_program_lookup',
      errorCategory: 'database_unavailable',
    };
  }
  if (!aliasProgram) return { program: null, aliasLookupStatus: 'alias_target_not_found' };
  return {
    program: aliasProgram,
    role: resolveRoleFromAliasType(alias.alias_type),
    aliasLookupStatus: 'alias_resolved',
  };
}

async function findProgramByClaimCode(supabase, claimCode) {
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .select('id, first_name, nickname, program_code, guardian_email')
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
    invitedParentEmail: normalizeEmail(participant.guardian_email),
    claimCodeContext: {
      participantId: String(participant.id),
      childDisplayName:
        safeText(participant.nickname, 120) || safeText(participant.first_name, 120) || 'Child',
      campProgramCode: safeText(participant.program_code, 120),
    },
  };
}

async function completeParentClaim(supabase, result, claimCode, parentEmail) {
  const context = result.claimCodeContext;
  if (!context?.participantId || !parentEmail) {
    return { status: 403, code: 'credential_not_connected' };
  }

  const { data: links, error: linkError } = await supabase
    .from('student_family_links')
    .select('*')
    .eq('student_id', context.participantId)
    .eq('camp_program_code', context.campProgramCode)
    .limit(20);
  if (linkError) return { status: 503, code: 'parent_link_lookup_failed' };
  let link = (links || []).find((row) => normalizeEmail(row.parent_email) === parentEmail) || null;

  // The participant invite is the canonical recipient record. Older rows can
  // retain a prior parent email when a facilitator re-sends an invitation.
  // Repair that stale mapping server-side only after both the private claim
  // code and the participant's invited email have matched.
  if (!link && result.invitedParentEmail === parentEmail && links?.[0]?.id) {
    const repaired = await supabase
      .from('student_family_links')
      .update({ parent_email: parentEmail })
      .eq('id', links[0].id)
      .select('*')
      .single();
    if (repaired.error || !repaired.data) {
      return { status: 503, code: 'parent_link_repair_failed' };
    }
    link = repaired.data;
  }
  if (!link) return { status: 403, code: 'credential_not_connected' };

  const familyProgramCode = safeText(link.family_program_code, 120) || parentFamilyProgramCode(parentEmail);
  let { data: familyProgram, error: familyLookupError } = await supabase
    .from('pilot_programs')
    .select('*')
    .eq('program_code', familyProgramCode)
    .maybeSingle();
  if (familyLookupError) return { status: 503, code: 'family_program_lookup_failed' };

  if (!familyProgram) {
    const parentFirstName = safeText(link.parent_first_name, 80) || 'Parent';
    const parentLastName = safeText(link.parent_last_name, 80) || 'Family';
    const programName = `${parentLastName} Family`;
    const now = new Date().toISOString();
    const payload = {
      program_name: programName,
      program_code: familyProgramCode,
      program_type: 'independent_family',
      admin_first_name: parentFirstName,
      admin_email: parentEmail,
      estimated_students: 1,
      estimated_student_count_range: '1 child',
      account_context: 'household',
      portal_type: 'family',
      age_grade_band: 'Mixed Ages',
      age_grade_notes: null,
      feature_flags: {
        can_manage_students: false,
        can_invite_families: true,
        can_view_group_progress: false,
        can_print_modules: true,
        can_upload_homework: false,
        can_manage_certificates: false,
        can_send_notifications: false,
        can_access_facilitator_portal: false,
      },
      age_range: 'Mixed Ages',
      group_name: programName,
      family_access_code: `${familyProgramCode}-FAMILY`,
      facilitator_access_code: null,
      pricing_tier: 'independent_family',
      payment_status: 'paid',
      pilot_status: 'active',
      agreed_to_terms: true,
      agreed_at: now,
      signup_idempotency_key: `parent-claim:${familyProgramCode}`,
    };
    const inserted = await supabase.from('pilot_programs').insert(payload).select('*').single();
    if (inserted.error || !inserted.data) {
      if (inserted.error?.code !== '23505') return { status: 503, code: 'family_program_create_failed' };
      const raced = await supabase.from('pilot_programs').select('*').eq('program_code', familyProgramCode).maybeSingle();
      if (raced.error || !raced.data) return { status: 503, code: 'family_program_create_failed' };
      familyProgram = raced.data;
    } else {
      familyProgram = inserted.data;
    }
  }

  if (normalizeEmail(familyProgram.admin_email) !== parentEmail) {
    return { status: 403, code: 'credential_not_connected' };
  }

  const claimedAt = new Date().toISOString();
  const linkUpdate = await supabase
    .from('student_family_links')
    .update({ family_program_code: familyProgram.program_code, parent_claimed: true, claimed_at: claimedAt })
    .eq('id', link.id)
    .eq('parent_email', parentEmail);
  if (linkUpdate.error) return { status: 503, code: 'parent_link_claim_failed' };

  const participantUpdate = await supabase
    .from('participants')
    .update({ parent_connection_status: 'connected', family_claim_code_used_at: claimedAt })
    .eq('id', context.participantId)
    .eq('family_claim_code', claimCode);
  if (participantUpdate.error) return { status: 503, code: 'parent_connection_update_failed' };

  return { familyProgram, matchedStudentIds: [context.participantId] };
}

function credentialMatches(program, role, intent, credential) {
  const shouldVerify =
    (role === 'family' && program.program_type === 'independent_family' && intent === 'parent') ||
    (role === 'facilitator' && intent === 'facilitator');
  if (!shouldVerify) return { valid: true, verified: false };
  if (!credential) return { valid: role !== 'facilitator', verified: false };
  return {
    valid: normalizeEmail(program.admin_email) === credential,
    verified: normalizeEmail(program.admin_email) === credential,
  };
}

function sessionProgram(program, role, accessCode, credential, credentialVerified) {
  const canonicalFamilyCode = normalizeAccessCode(program.family_access_code);
  const canonicalFacilitatorCode = normalizeAccessCode(program.facilitator_access_code);
  const familyAccessCode =
    role === 'family' && (accessCode === canonicalFamilyCode || credentialVerified)
      ? canonicalFamilyCode
      : '';
  const facilitatorAccessCode =
    role === 'facilitator' && (accessCode === canonicalFacilitatorCode || credentialVerified)
      ? canonicalFacilitatorCode
      : null;
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
  if (!validateClientRuntime(event)) {
    return json(503, { success: false, code: 'runtime_context_mismatch' }, id);
  }
  if (!originIsSameHost(event)) {
    return json(403, { success: false, code: 'invalid_request_origin' }, id);
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
  const rememberDevice = Boolean(body.rememberDevice);
  const completeClaim = body.completeParentClaim === true;
  if (!ACCESS_CODE_RE.test(accessCode)) {
    return json(400, { success: false, code: 'invalid_access_code' }, id);
  }

  const result = CLAIM_CODE_RE.test(accessCode)
    ? await findProgramByClaimCode(supabase, accessCode)
    : await findProgramByCode(supabase, accessCode);
  if (result.error) {
    console.error('[PORTAL_PROGRAM_ACCESS]', {
      correlationId: id,
      outcome: 'lookup_unavailable',
      stage: result.errorStage || 'program_lookup',
      category: result.errorCategory || 'database_unavailable',
    });
    return json(503, { success: false, code: result.error }, id);
  }
  if (!result.program || !result.role) {
    const lookupStatus = result.aliasLookupStatus || 'not_found';
    if (lookupStatus !== 'alias_not_found' && lookupStatus !== 'not_found') {
      console.warn('[PORTAL_PROGRAM_ACCESS]', {
        correlationId: id,
        outcome: 'program_not_found',
        lookupStatus,
      });
    }
    return json(404, { success: false, code: 'program_not_found', lookupStatus }, id);
  }

  if (completeClaim) {
    if (!CLAIM_CODE_RE.test(accessCode) || intent !== 'parent') {
      return json(400, { success: false, code: 'invalid_claim_request' }, id);
    }
    const claim = await completeParentClaim(supabase, result, accessCode, credential);
    if (!claim.familyProgram) {
      return json(claim.status, { success: false, code: claim.code }, id);
    }
    return json(200, {
      success: true,
      role: 'family',
      program: sessionProgram(claim.familyProgram, 'family', normalizeAccessCode(claim.familyProgram.family_access_code), credential, true),
      claimCodeContext: result.claimCodeContext,
      matchedStudentIds: claim.matchedStudentIds,
    }, id);
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

  if (result.role === 'facilitator') {
    const created = await createFacilitatorSession(
      supabase,
      result.program,
      credential,
      rememberDevice,
    );
    if (!created.token) {
      return json(503, { success: false, code: created.error }, id);
    }
    const response = json(200, {
      success: true,
      role: 'facilitator',
      program: safeProgram(result.program),
    }, id);
    return {
      ...response,
      headers: {
        ...response.headers,
        'Cache-Control': 'no-store, private',
        Pragma: 'no-cache',
        'Set-Cookie': cookieHeader(created.token, created.ttl),
      },
    };
  }

  return json(200, {
    success: true,
    role: result.role,
    program: sessionProgram(
      result.program,
      result.role,
      accessCode,
      credential,
      credentialCheck.verified,
    ),
    ...(result.claimCodeContext ? { claimCodeContext: result.claimCodeContext } : {}),
  }, id);
};
