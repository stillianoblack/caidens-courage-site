const crypto = require('crypto');
const { maskEmail } = require('./crmAuth');

function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function pseudonym(sourceType, sourceId, email) {
  const salt = process.env.CRM_PSEUDONYM_SALT || 'local-test-only';
  return crypto.createHmac('sha256', salt).update(`${sourceType}:${sourceId}:${email}`).digest('hex').slice(0, 20);
}

function sourceCandidate(sourceType, sourceId, email, details = {}) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return {
    sourceType,
    sourceId: String(sourceId || ''),
    normalizedEmail: normalized,
    proposedAudienceType: details.audienceType || 'unknown',
    proposedOrganizationType: details.organizationType || null,
    proposedOrganizationName: details.organizationName || null,
    confidence: details.confidence || 'unknown',
    ambiguityReasons: details.ambiguityReasons || [],
    accountRelationshipStatus: details.accountRelationshipStatus || 'unknown',
    consentStatus: details.consentStatus || 'unknown',
    recommendedAction: details.recommendedAction || 'hold',
    evidenceSummary: details.evidenceSummary || 'Adult-bearing source requires review.',
  };
}

function classifyLegacyRows(input) {
  const raw = [];
  for (const row of input.adultParticipants || []) {
    if (String(row.role || '').toLowerCase() === 'student') continue;
    const role = String(row.adult_role || row.role || '').toLowerCase();
    raw.push(sourceCandidate('adult_participant', row.id, row.email, {
      audienceType: role.includes('teacher') ? 'teacher' : role.includes('facilitator') ? 'facilitator' : 'unknown',
      organizationName: row.organization || null,
      confidence: role ? 'high' : 'low',
      consentStatus: row.email_opt_in === true ? 'unclear' : 'unknown',
      recommendedAction: role ? 'eligible_for_later_reviewed_import' : 'hold',
      evidenceSummary: 'Explicit non-student participant role; legacy opt-in boolean is not complete consent evidence.',
    }));
  }
  for (const row of input.guardianLinks || []) {
    raw.push(sourceCandidate('guardian_link', row.id, row.parent_email, {
      audienceType: 'parent_guardian', confidence: 'high', consentStatus: 'unknown',
      recommendedAction: 'eligible_for_later_reviewed_import',
      evidenceSummary: 'Adult email appears in a guardian relationship field; no child details are returned.',
    }));
  }
  for (const row of input.pilotPrograms || []) {
    const type = String(row.program_type || '').toLowerCase();
    raw.push(sourceCandidate('pilot_administrator', row.id, row.admin_email, {
      audienceType: type.includes('camp') ? 'camp_leader' : type.includes('school') ? 'school_leader' : 'program_administrator',
      organizationType: type.includes('camp') ? 'camp' : type.includes('school') ? 'school' : null,
      organizationName: row.program_name || null,
      confidence: 'medium', consentStatus: 'unknown', recommendedAction: 'manual_review',
      ambiguityReasons: ['Program administrator email does not prove organization ownership or marketing consent.'],
      evidenceSummary: 'Program administrator field provides medium-confidence adult context.',
    }));
  }
  for (const row of input.waitlist || []) {
    raw.push(sourceCandidate('pilot_waitlist', row.id, row.parent_email, {
      audienceType: 'parent_guardian', confidence: 'medium', consentStatus: 'unknown',
      recommendedAction: 'manual_review',
      ambiguityReasons: ['Waitlist interest does not establish durable marketing consent.'],
      evidenceSummary: 'Adult waitlist field indicates interest but requires consent review.',
    }));
  }

  const valid = raw.filter(Boolean);
  const countsByEmail = new Map();
  valid.forEach((item) => countsByEmail.set(item.normalizedEmail, (countsByEmail.get(item.normalizedEmail) || 0) + 1));
  return valid.map((item) => {
    const duplicate = countsByEmail.get(item.normalizedEmail) > 1;
    return {
      pseudonymous_candidate_id: pseudonym(item.sourceType, item.sourceId, item.normalizedEmail),
      masked_email: maskEmail(item.normalizedEmail),
      source_types: [item.sourceType],
      source_count: 1,
      proposed_audience_type: item.proposedAudienceType,
      proposed_organization_type: item.proposedOrganizationType,
      proposed_organization_name: item.proposedOrganizationName,
      confidence: item.confidence,
      ambiguity_reasons: duplicate ? [...item.ambiguityReasons, 'Possible duplicate normalized adult email.'] : item.ambiguityReasons,
      child_exclusion_status: 'adult_source_only',
      account_relationship_status: item.accountRelationshipStatus,
      consent_status: item.consentStatus,
      recommended_action: duplicate ? 'manual_review' : item.recommendedAction,
      evidence_summary: item.evidenceSummary,
      possible_duplicate: duplicate,
    };
  });
}

async function loadClassificationPreview(supabase, pagination) {
  const range = [pagination.from, pagination.to];
  const [participants, links, programs, waitlist, childCount] = await Promise.all([
    supabase.from('participants').select('id,email,role,adult_role,organization,email_opt_in').neq('role', 'student').not('email', 'is', null).range(...range),
    supabase.from('student_family_links').select('id,parent_email').not('parent_email', 'is', null).range(...range),
    supabase.from('pilot_programs').select('id,admin_email,program_name,program_type').not('admin_email', 'is', null).range(...range),
    supabase.from('pilot_waitlist').select('id,parent_email').not('parent_email', 'is', null).range(...range),
    supabase.from('participants').select('id', { count: 'exact', head: true }).eq('role', 'student').not('email', 'is', null),
  ]);
  const errors = [participants, links, programs, waitlist].filter((result) => result.error).map((result) => result.error.message);
  if (errors.length) throw new Error('One or more legacy classification sources are unavailable.');
  const candidates = classifyLegacyRows({
    adultParticipants: participants.data, guardianLinks: links.data, pilotPrograms: programs.data, waitlist: waitlist.data,
  });
  const summary = {
    candidates: candidates.length,
    adult_eligible: candidates.filter((item) => item.recommended_action === 'eligible_for_later_reviewed_import').length,
    excluded_as_child: childCount.count || 0,
    manual_review: candidates.filter((item) => item.recommended_action === 'manual_review').length,
    held: candidates.filter((item) => item.recommended_action === 'hold').length,
    possible_duplicates: candidates.filter((item) => item.possible_duplicate).length,
    consent_confirmed: candidates.filter((item) => item.consent_status === 'confirmed').length,
    consent_unclear_or_unknown: candidates.filter((item) => ['unclear', 'unknown'].includes(item.consent_status)).length,
  };
  return { candidates, summary };
}

module.exports = { classifyLegacyRows, loadClassificationPreview, normalizeEmail, sourceCandidate };
