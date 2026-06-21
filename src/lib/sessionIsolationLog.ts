import { logSecurityAudit } from './securityAuditLog';

export type SessionIsolationEvent =
  | 'parent_attach_program_mismatch'
  | 'parent_claim_program_mismatch'
  | 'parent_claim_write_rejected'
  | 'legacy_parent_claim_rejected'
  | 'active_child_program_mismatch'
  | 'legacy_active_child_rejected'
  | 'student_pin_program_mismatch'
  | 'facilitator_continuity_program_mismatch'
  | 'return_session_email_program_mismatch'
  | 'family_settings_parent_attach_blocked'
  | 'facilitator_email_not_registered';

export function logSessionIsolationWarning(
  event: SessionIsolationEvent,
  params: Record<string, string | number | boolean | null | undefined> = {},
): void {
  const payload = { event, ...params };
  console.warn('[SESSION_ISOLATION]', payload);
  logSecurityAudit('session_isolation_warning', { event, ...params });
}
