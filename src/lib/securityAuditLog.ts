import { trackEvent } from './analytics';

export type SecurityAuditEvent =
  | 'pin_revealed'
  | 'pin_copied'
  | 'pin_reset'
  | 'remembered_device_created'
  | 'remembered_device_cleared'
  | 'session_identity_cleared'
  | 'session_isolation_warning';

export function logSecurityAudit(
  event: SecurityAuditEvent,
  params: Record<string, string | number | boolean | null | undefined> = {},
): void {
  const payload = { event, ...params };
  console.info('[SECURITY_AUDIT]', payload);
  trackEvent(event, params);
}
