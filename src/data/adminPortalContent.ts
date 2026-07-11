export type AdminPortalTabId =
  | 'manage-accounts'
  | 'add-student'
  | 'design-system'
  | 'pilot-programs'
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
  | 'crm-provider-settings';

export const ADMIN_PORTAL_PAGE = {
  title: 'Admin Portal',
  subtitle: 'Manage programs, accounts, commerce, design system tools, and pilot cleanup.',
} as const;

export const ADMIN_PORTAL_TABS: Array<{ id: AdminPortalTabId; label: string }> = [
  { id: 'manage-accounts', label: 'Manage Accounts' },
  { id: 'add-student', label: 'Add Student' },
  { id: 'design-system', label: 'Design System' },
  { id: 'pilot-programs', label: 'Pilot Programs' },
  { id: 'adventures', label: 'Adventures' },
  { id: 'data-cleanup', label: 'Data Cleanup' },
  { id: 'commerce', label: 'Commerce' },
  ...(process.env.REACT_APP_AUDIENCE_CRM_DISPLAY_ENABLED === 'true'
    ? [
        { id: 'crm-overview' as const, label: 'CRM Overview' },
        { id: 'crm-contacts' as const, label: 'CRM Contacts' },
        { id: 'crm-organizations' as const, label: 'CRM Organizations' },
        { id: 'crm-classification' as const, label: 'Classification Preview' },
      ]
    : []),
  ...(process.env.REACT_APP_AUDIENCE_CRM_WORKFLOWS_DISPLAY_ENABLED === 'true'
    ? [
        { id: 'crm-add-contact' as const, label: 'Add Contact' },
        { id: 'crm-segments' as const, label: 'CRM Segments' },
        { id: 'crm-tasks' as const, label: 'CRM Tasks' },
        { id: 'crm-activity' as const, label: 'CRM Activity' },
      ]
    : []),
  ...(process.env.REACT_APP_AUDIENCE_PROVIDER_DISPLAY_ENABLED === 'true'
    ? [
        { id: 'crm-email-journeys' as const, label: 'Email Journeys' },
        { id: 'crm-kit-subscribers' as const, label: 'Kit Subscribers' },
        { id: 'crm-email-performance' as const, label: 'Email Performance' },
        { id: 'crm-subscriber-reconciliation' as const, label: 'Subscriber Reconciliation' },
        { id: 'crm-sync-activity' as const, label: 'Sync Activity' },
        { id: 'crm-provider-settings' as const, label: 'Provider Settings' },
      ]
    : []),
];

export const DEFAULT_ADMIN_PORTAL_TAB: AdminPortalTabId = 'manage-accounts';

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
