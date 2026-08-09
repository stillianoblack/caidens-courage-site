const { json, maskEmail, requireCrmRequest, writeAdminAuditEvent } = require('./_lib/crmAuth');

exports.handler = async (event) => {
  const auth = await requireCrmRequest(event, { flag: 'AUDIENCE_CRM_READ_ENABLED', permission: 'provider:read' });
  if (auth.response) return auth.response;
  const { supabase, correlationId } = auth.context;
  if (event.httpMethod === 'POST') {
    const writable = process.env.AUDIENCE_PROVIDER_SYNC_ENABLED === 'true' && process.env.KIT_PROVIDER_ENABLED === 'true' && process.env.KIT_WRITE_OPERATIONS_ENABLED === 'true';
    await writeAdminAuditEvent(supabase, auth.context, { action:'kit_diagnostics_dry_run', targetType:'provider_account', metadata:{ writable, network_request:false } });
    return json(200, { status:'dry_run_complete', serverReachable:true, networkRequest:false, subscriberChanged:false, message:writable ? 'Pipeline is configured, but diagnostics never sends a subscriber automatically.' : 'Provider writes are disabled. Configuration and authorization checks passed without contacting Kit.' }, correlationId);
  }
  if (event.httpMethod !== 'GET') return json(405, { error:'Method not allowed.' }, correlationId);
  const [result, deliveries] = await Promise.all([
    supabase.from('email_sync_outbox').select('id,contact_id,operation,internal_segment_key,status,created_at,updated_at,contacts(primary_email),email_sync_attempts(result_status,sanitized_error,completed_at)').order('created_at',{ascending:false}).limit(25),
    supabase.from('learning_communication_deliveries').select('id,communication_type,reporting_period_start,reporting_period_end,status,student_id,created_at,sent_at').order('created_at',{ascending:false}).limit(25),
  ]);
  const rows = result.data || []; const attempts = rows.flatMap((row) => (row.email_sync_attempts || []).map((attempt) => ({ ...attempt, row }))).sort((a,b) => String(b.completed_at || '').localeCompare(String(a.completed_at || '')));
  const last = attempts[0]; const success = attempts.find((item) => item.result_status === 'completed'); const error = attempts.find((item) => item.sanitized_error);
  return json(200, { provider:'kit', configured:Boolean(process.env.KIT_API_KEY), serverReachable:true, flags:{ providerEnabled:process.env.KIT_PROVIDER_ENABLED === 'true', writesEnabled:process.env.KIT_WRITE_OPERATIONS_ENABLED === 'true', globalSyncEnabled:process.env.AUDIENCE_PROVIDER_SYNC_ENABLED === 'true' }, lastAttemptAt:last?.completed_at || rows[0]?.created_at || null, lastSuccessfulAt:success?.completed_at || null, mostRecentError:error?.sanitized_error || null, eventType:last?.row?.operation || rows[0]?.operation || null, internalIdentifier:last?.row?.contact_id || rows[0]?.contact_id || null, intendedTag:last?.row?.internal_segment_key || rows[0]?.internal_segment_key || null, maskedEmail:maskEmail(last?.row?.contacts?.primary_email || rows[0]?.contacts?.primary_email), recentEvents:rows.map((row) => ({ id:row.id,eventType:row.operation,status:row.status,createdAt:row.created_at,maskedEmail:maskEmail(row.contacts?.primary_email),intendedTag:row.internal_segment_key })), communicationDeliveries:deliveries.data || [] }, correlationId);
};
