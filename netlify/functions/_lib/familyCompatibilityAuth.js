function safeText(value, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

async function authorizeFamilyCompatibilitySession(event, supabase) {
  const programCode = safeText(event.headers?.['x-family-program-code']);
  const accessCode = safeText(event.headers?.['x-family-access-code']);
  if (!programCode || !accessCode) return { status: 401, code: 'missing_session' };

  const { data, error } = await supabase
    .from('pilot_programs')
    .select('id, program_code, program_name, program_type, family_access_code, admin_email, admin_first_name, group_name')
    .eq('program_code', programCode)
    .eq('family_access_code', accessCode)
    .eq('program_type', 'independent_family')
    .neq('pilot_status', 'archived')
    .maybeSingle();
  if (error) return { status: 503, code: 'session_lookup_failed' };
  if (!data) return { status: 403, code: 'invalid_session' };
  return { program: data };
}

function participantBelongsToFamily(participant, programCode) {
  return participant?.role === 'student' && participant?.program_code === programCode;
}

module.exports = {
  authorizeFamilyCompatibilitySession,
  participantBelongsToFamily,
  safeText,
};
