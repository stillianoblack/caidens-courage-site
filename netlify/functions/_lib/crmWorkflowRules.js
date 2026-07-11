const COMMUNICATION_RANK = { confirmed: 0, unknown: 1, unclear: 1, unsubscribed: 2, suppressed: 3 };
const PROMOTIONAL_SEGMENTS = new Set(['general_prospect','camp_lead','school_lead','family_prospect','book_customer','active_family_member','active_camp_partner','active_school_partner','newsletter_eligible','product_updates_eligible']);

function mostRestrictiveStatus(statuses) {
  return (statuses || []).reduce((winner, status) =>
    (COMMUNICATION_RANK[status] ?? 1) > (COMMUNICATION_RANK[winner] ?? 1) ? status : winner, 'confirmed');
}

function applyConsentEvent(current, event) {
  const currentStatus = current?.status || 'unknown';
  const nextStatus = mostRestrictiveStatus([currentStatus, event.status_after]);
  const mayBecomeConfirmed = currentStatus === 'unknown' || currentStatus === 'unclear';
  return {
    status: event.status_after === 'confirmed' && mayBecomeConfirmed ? 'confirmed' : nextStatus,
    effective_at: event.occurred_at,
    source: event.source,
    version: (current?.version || 0) + 1,
  };
}

function evaluateSegment(segmentKey, facts) {
  const evidence = [];
  const exclusions = [];
  const communication = mostRestrictiveStatus(facts.communicationStatuses || ['unknown']);
  if (PROMOTIONAL_SEGMENTS.has(segmentKey)) {
    if (facts.doNotEnroll !== false) exclusions.push('do_not_enroll');
    if (communication !== 'confirmed') exclusions.push(`communication_${communication}`);
  }
  const prospectStages = new Set(['prospect','qualified_lead','proposal_sent']);
  const has = (interest) => (facts.interests || []).includes(interest);
  const customer = facts.customerStatus === 'verified_active';
  let ruleMatch = false;
  switch (segmentKey) {
    case 'general_prospect': ruleMatch = prospectStages.has(facts.lifecycle) && !customer; evidence.push('prospect_lifecycle'); break;
    case 'camp_lead': ruleMatch = prospectStages.has(facts.lifecycle) && (has('camp_program') || facts.audienceType === 'camp_leader'); evidence.push('camp_evidence'); break;
    case 'school_lead': ruleMatch = prospectStages.has(facts.lifecycle) && (has('school_program') || facts.audienceType === 'school_leader'); evidence.push('school_evidence'); break;
    case 'family_prospect': ruleMatch = prospectStages.has(facts.lifecycle) && has('family_membership'); evidence.push('family_interest'); break;
    case 'newsletter_eligible': ruleMatch = (facts.confirmedPurposes || []).includes('newsletter'); evidence.push('newsletter_consent'); break;
    case 'product_updates_eligible': ruleMatch = (facts.confirmedPurposes || []).includes('product_updates'); evidence.push('product_updates_consent'); break;
    case 'marketing_consent_unclear': ruleMatch = ['unknown','unclear'].includes(communication); break;
    case 'unsubscribed': ruleMatch = communication === 'unsubscribed'; break;
    case 'suppressed': ruleMatch = communication === 'suppressed'; break;
    case 'book_customer': ruleMatch = customer && facts.customerType === 'book'; break;
    case 'active_family_member': ruleMatch = customer && facts.customerType === 'family'; break;
    case 'active_camp_partner': ruleMatch = customer && facts.customerType === 'camp'; break;
    case 'active_school_partner': ruleMatch = customer && facts.customerType === 'school'; break;
    default: exclusions.push('unsupported_rule');
  }
  if (!ruleMatch) exclusions.push('rule_not_matched');
  if (customer && ['general_prospect','camp_lead','school_lead','family_prospect'].includes(segmentKey)) exclusions.push('customer_supersedes_prospect');
  return { eligible: ruleMatch && exclusions.length === 0, evidence, exclusion: [...new Set(exclusions)], ruleVersion: '1', communicationStatus: communication };
}

function validateAdultContact(input) {
  if (['student','child'].includes(String(input.contactKind || '').toLowerCase())) return { ok: false, error: 'Children cannot be CRM contacts.' };
  if (input.communicationStatus === 'confirmed' && (!input.consentSource || !input.consentTimestamp || !input.noticeVersion)) return { ok: false, error: 'Confirmed marketing requires explicit consent evidence.' };
  return { ok: true, value: { ...input, doNotEnroll: input.doNotEnroll !== false } };
}

module.exports = { COMMUNICATION_RANK, applyConsentEvent, evaluateSegment, mostRestrictiveStatus, validateAdultContact };
