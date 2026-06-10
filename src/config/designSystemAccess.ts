import { readAdminSession } from './adminAccess';

export { DESIGN_SYSTEM_PATH } from './courageRoutes';

/**
 * Internal design-system QA page — not linked in public or portal navigation.
 * TODO: replace dev bypass with explicit admin/dev role when portal RBAC lands.
 */
export function canAccessDesignSystem(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Local QA without admin unlock when serving production builds via localhost.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return true;
    }
  }

  return readAdminSession();
}
