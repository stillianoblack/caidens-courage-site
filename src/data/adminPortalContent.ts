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
  | 'crm-classification';

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
