function normalizeEmail(value) { return String(value || '').trim().toLowerCase(); }
function buildReconciliationPreview(localContacts, subscribers) {
  const localsByEmail = new Map();
  for (const contact of localContacts || []) {
    const email = normalizeEmail(contact.primary_email);
    if (!email) continue;
    const list = localsByEmail.get(email) || []; list.push(contact); localsByEmail.set(email, list);
  }
  const seen = new Set(); const rows = [];
  for (const subscriber of subscribers || []) {
    const email = normalizeEmail(subscriber.email_address); const matches = localsByEmail.get(email) || []; seen.add(email);
    const localRestrictive = matches.some((item) => ['unsubscribed','suppressed'].includes(item.communication_status));
    const remoteRestrictive = ['cancelled','bounced','complained','inactive'].includes(subscriber.state);
    rows.push({ masked_email: email ? `${email[0]}***@${email.split('@')[1]}` : null, remote_subscriber_id: String(subscriber.id), remote_status: subscriber.state, local_match_count: matches.length, status_conflict: (localRestrictive && !remoteRestrictive) || (remoteRestrictive && matches.some((item) => item.communication_status === 'confirmed')), proposed_action: matches.length > 1 ? 'manual_review' : matches.length === 1 ? (remoteRestrictive ? 'suppress_locally' : 'link_existing') : 'create_contact_later' });
  }
  for (const [email, matches] of localsByEmail) if (!seen.has(email)) rows.push({ masked_email: `${email[0]}***@${email.split('@')[1]}`, remote_subscriber_id: null, remote_status: null, local_match_count: matches.length, status_conflict: false, proposed_action: matches.length > 1 ? 'manual_review' : 'hold' });
  return rows;
}
module.exports = { buildReconciliationPreview, normalizeEmail };
