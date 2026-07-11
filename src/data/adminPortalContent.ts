export type AdminPortalTabId =
  | 'manage-accounts'
  | 'add-student'
  | 'design-system'
  | 'pilot-programs'
  | 'adventures'
  | 'data-cleanup'
  | 'commerce';

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
