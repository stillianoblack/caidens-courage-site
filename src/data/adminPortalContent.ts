export type AdminPortalTabId =
  | 'dashboard'
  | 'manage-accounts'
  | 'add-student'
  | 'design-system'
  | 'pilot-programs'
  | 'pilot-outcomes'
  | 'adventures'
  | 'data-cleanup'
  | 'commerce'
  | 'crm-overview'
  | 'crm-contacts'
  | 'crm-organizations'
  | 'crm-classification'
  | 'crm-add-contact'
  | 'crm-segments'
  | 'crm-tasks'
  | 'crm-activity'
  | 'crm-email-journeys'
  | 'crm-kit-subscribers'
  | 'crm-email-performance'
  | 'crm-subscriber-reconciliation'
  | 'crm-sync-activity'
  | 'crm-provider-settings'
  | 'question-bank'
  | 'kit-diagnostics';

export const ADMIN_PORTAL_PAGE = {
  title: 'Admin Portal',
  subtitle: 'Manage programs, accounts, commerce, design system tools, and pilot cleanup.',
} as const;

export const ADMIN_PORTAL_TABS: Array<{ id: AdminPortalTabId; label: string }> = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'manage-accounts', label: 'Accounts' },
  { id: 'add-student', label: 'Students' },
  { id: 'design-system', label: 'Design System' },
  { id: 'pilot-programs', label: 'Pilot Programs' },
  { id: 'pilot-outcomes', label: 'Pilot Outcomes' },
  { id: 'adventures', label: 'Adventures' },
  { id: 'data-cleanup', label: 'Data Cleanup' },
  { id: 'commerce', label: 'Commerce' },
  ...(process.env.REACT_APP_LEARNING_CONTENT_ENABLED === 'true'
    ? [{ id: 'question-bank' as const, label: 'Question Bank' }]
    : []),
  ...(process.env.REACT_APP_AUDIENCE_CRM_DISPLAY_ENABLED === 'true'
    ? [
        { id: 'crm-overview' as const, label: 'CRM Overview' },
        { id: 'crm-contacts' as const, label: 'People' },
        { id: 'crm-organizations' as const, label: 'Organizations' },
        { id: 'crm-classification' as const, label: 'Review' },
      ]
    : []),
  ...(process.env.REACT_APP_AUDIENCE_CRM_WORKFLOWS_DISPLAY_ENABLED === 'true'
    ? [
        { id: 'crm-add-contact' as const, label: 'Add Contact' },
        { id: 'crm-segments' as const, label: 'Segments' },
        { id: 'crm-tasks' as const, label: 'Tasks' },
        { id: 'crm-activity' as const, label: 'Activity' },
      ]
    : []),
  ...(process.env.REACT_APP_AUDIENCE_PROVIDER_DISPLAY_ENABLED === 'true'
    ? [
        { id: 'crm-email-journeys' as const, label: 'Campaigns' },
        { id: 'crm-kit-subscribers' as const, label: 'Subscribers' },
        { id: 'crm-email-performance' as const, label: 'Analytics' },
        { id: 'crm-subscriber-reconciliation' as const, label: 'Sync Review' },
        { id: 'crm-sync-activity' as const, label: 'Activity Log' },
        { id: 'crm-provider-settings' as const, label: 'Provider Settings' },
        { id: 'kit-diagnostics' as const, label: 'Kit Diagnostics' },
      ]
    : []),
];

export const DEFAULT_ADMIN_PORTAL_TAB: AdminPortalTabId = 'dashboard';

export type AdminNavGroup = { id: string; label: string; items: Array<{ id: AdminPortalTabId; label: string; advanced?: boolean }> };
const visible = new Map(ADMIN_PORTAL_TABS.map((item) => [item.id, item]));
const items = (...definitions: Array<{ id: AdminPortalTabId; label: string; advanced?: boolean }>) => definitions.filter((item) => visible.has(item.id));
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  { id: 'people', label: 'People', items: items({ id: 'manage-accounts', label: 'Accounts' }, { id: 'add-student', label: 'Students' }) },
  { id: 'crm', label: 'CRM', items: items({ id: 'crm-overview', label: 'Overview' }, { id: 'crm-contacts', label: 'People' }, { id: 'crm-organizations', label: 'Organizations' }, { id: 'crm-add-contact', label: 'Add Contact' }, { id: 'crm-classification', label: 'Review', advanced: true }, { id: 'crm-segments', label: 'Segments', advanced: true }, { id: 'crm-tasks', label: 'Tasks' }, { id: 'crm-activity', label: 'Activity' }) },
  { id: 'marketing', label: 'Marketing', items: items({ id: 'crm-email-journeys', label: 'Campaigns' }, { id: 'crm-kit-subscribers', label: 'Subscribers' }, { id: 'crm-email-performance', label: 'Analytics' }, { id: 'crm-subscriber-reconciliation', label: 'Sync Review', advanced: true }, { id: 'crm-sync-activity', label: 'Activity Log', advanced: true }, { id: 'crm-provider-settings', label: 'Provider Settings', advanced: true }, { id: 'kit-diagnostics', label: 'Kit Diagnostics', advanced: true }) },
  { id: 'commerce', label: 'Commerce', items: items({ id: 'commerce', label: 'Products / Membership Plans' }) },
  { id: 'programs', label: 'Programs', items: items({ id: 'pilot-programs', label: 'Pilot Programs' }, { id: 'pilot-outcomes', label: 'Pilot Outcomes' }, { id: 'adventures', label: 'Adventures' }, { id: 'question-bank', label: 'Question Bank' }) },
  { id: 'system', label: 'System', items: items({ id: 'data-cleanup', label: 'Data Cleanup' }, { id: 'design-system', label: 'Design System' }) },
];

export const ADMIN_DESIGN_SYSTEM_SECTIONS = [
  'Buttons',
  'Cards',
  'Forms',
  'Modals',
  'Slide-outs',
  'Full-page settings layout',
  'Question / game interaction pattern',
  'Feedback panels',
  'Character cards',
  'Status pills',
] as const;
