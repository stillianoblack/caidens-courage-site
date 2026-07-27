const crypto = require('crypto');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function recipientIdentifier(value) {
  return crypto.createHash('sha256').update(normalizeEmail(value)).digest('hex');
}

function isMissingMetadataColumn(error) {
  return Boolean(
    error &&
      /program_type|recipient_role|template_type|recipient_identifier|correlation_id|retry_eligible|delivery_event_key|email_provider|schema cache|column/i.test(
        error.message || '',
      ),
  );
}

async function findDeliveryByEventKey(supabase, deliveryEventKey) {
  if (!supabase || !deliveryEventKey) return null;
  const { data, error } = await supabase
    .from('email_delivery_logs')
    .select('id,status,provider_message_id,retry_eligible')
    .eq('delivery_event_key', deliveryEventKey)
    .maybeSingle();
  if (error) {
    if (isMissingMetadataColumn(error)) return null;
    console.warn('[EMAIL_DELIVERY_LOG_LOOKUP_FAILED]', {
      event_key_present: true,
      error_category: 'delivery_log_lookup',
    });
    return null;
  }
  return data || null;
}

async function createDeliveryAttempt(supabase, payload) {
  if (!supabase) return { logged: false, reason: 'supabase_env_missing' };

  const normalizedRecipient = normalizeEmail(payload.recipientEmail);
  const baseRecord = {
    recipient_email: normalizedRecipient,
    email_type: payload.emailType || 'welcome',
    related_student_id: payload.relatedStudentId || null,
    related_family_id: payload.relatedFamilyId || null,
    related_program_id: payload.relatedProgramId || null,
    status: 'queued',
    provider_message_id: null,
    error_message: null,
    sent_at: null,
    delivered_at: null,
  };
  const metadata = {
    program_type: payload.programType || null,
    recipient_role: payload.recipientRole || null,
    template_type: payload.templateType || null,
    recipient_identifier: recipientIdentifier(normalizedRecipient),
    correlation_id: payload.correlationId || null,
    retry_eligible: false,
    delivery_event_key: payload.deliveryEventKey || null,
    email_provider: payload.emailProvider || 'resend',
  };

  let result = await supabase
    .from('email_delivery_logs')
    .insert({ ...baseRecord, ...metadata })
    .select('id')
    .maybeSingle();

  if (result.error && isMissingMetadataColumn(result.error)) {
    result = await supabase
      .from('email_delivery_logs')
      .insert(baseRecord)
      .select('id')
      .maybeSingle();
    if (!result.error) {
      return { logged: true, id: result.data?.id || null, metadataStored: false };
    }
  }

  if (result.error) {
    if (result.error.code === '23505' && payload.deliveryEventKey) {
      const existing = await findDeliveryByEventKey(supabase, payload.deliveryEventKey);
      return { logged: false, duplicate: true, existing };
    }
    console.warn('[EMAIL_DELIVERY_LOG_CREATE_FAILED]', {
      recipient_identifier: metadata.recipient_identifier,
      correlation_id: payload.correlationId || null,
      error_category: 'delivery_log_insert',
    });
    return { logged: false, reason: 'delivery_log_insert_failed' };
  }
  return { logged: true, id: result.data?.id || null, metadataStored: true };
}

async function updateDeliveryAttempt(supabase, logId, status, detail = {}) {
  if (!supabase || !logId) {
    return { logged: false, reason: supabase ? 'missing_log_id' : 'supabase_env_missing' };
  }
  const now = new Date().toISOString();
  const patch = {
    status,
    provider_message_id: detail.providerMessageId || null,
    error_message: detail.errorMessage || null,
    sent_at: status === 'sent' ? now : null,
    delivered_at: status === 'delivered' ? now : null,
    retry_eligible: status === 'failed' && detail.retryEligible !== false,
  };
  let result = await supabase.from('email_delivery_logs').update(patch).eq('id', logId);
  if (result.error && isMissingMetadataColumn(result.error)) {
    const { retry_eligible: _retryEligible, ...legacyPatch } = patch;
    result = await supabase.from('email_delivery_logs').update(legacyPatch).eq('id', logId);
  }
  if (result.error) {
    console.warn('[EMAIL_DELIVERY_LOG_UPDATE_FAILED]', {
      correlation_id: detail.correlationId || null,
      status,
      error_category: 'delivery_log_update',
    });
    return { logged: false, reason: 'delivery_log_update_failed' };
  }
  return { logged: true, id: logId };
}

module.exports = {
  createDeliveryAttempt,
  findDeliveryByEventKey,
  normalizeEmail,
  recipientIdentifier,
  updateDeliveryAttempt,
};
