/**
 * Single source of truth for the administration menu.
 * Both the sidebar tree and the route table are derived from this — add an entry
 * here and the nav item and its page appear together.
 */
export interface AdminLeaf {
  label: string;
  /** Path segment, relative to the group's path. */
  path: string;
  /** Absolute route to use instead of `${group.path}/${path}` — for leaves that
   *  open a module with its own second-level menu. */
  link?: string;
  /** Already implemented elsewhere — no placeholder route is generated. */
  live?: boolean;
}

export interface AdminGroup {
  label: string;
  icon: string;
  /** Absolute route. Groups with children are not themselves navigable. */
  path: string;
  children?: AdminLeaf[];
  /** Already implemented elsewhere — no placeholder route is generated. */
  live?: boolean;
}

const svg = (body: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const ADMIN_MENU: AdminGroup[] = [
  {
    label: 'Admin',
    path: '/admin',
    icon: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
    children: [
      { label: 'Registration', path: 'registration', link: '/registration', live: true },
      { label: 'Accession', path: 'accession', link: '/accession', live: true },
      { label: 'Operation', path: 'operation' },
      { label: 'Finance', path: 'finance' },
      { label: 'Reviewer', path: 'reviewer' },
      { label: 'Analytics', path: 'analytics' },
      { label: 'Audit Ready', path: 'audit-ready' },
    ],
  },
  {
    label: 'Referral Management',
    path: '/referral-management',
    icon: svg('<path d="M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M9.5 8.5 15 15"/>'),
  },
  {
    label: 'Organisation Management',
    path: '/organisation-management',
    icon: svg('<path d="M4 21V6l7-3v18M11 21V9l7 3v9M3 21h18"/>'),
  },
  {
    label: 'Profile & Report Management',
    path: '/profile-report',
    icon: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
    children: [
      { label: 'Test List', path: 'test-list' },
      { label: 'Bill Settings', path: 'bill-settings' },
      { label: 'Invoice Settings', path: 'invoice-settings' },
      { label: 'Report Settings', path: 'report-settings' },
      { label: 'Cancelled Tests', path: 'cancelled-tests' },
      { label: 'Reflex Testing Configuration', path: 'reflex-testing' },
      { label: 'Dictionary Mapping', path: 'dictionary-mapping' },
      { label: 'Other Settings', path: 'other-settings' },
    ],
  },
  {
    label: 'Smart Report Settings',
    path: '/smart-report-settings',
    icon: svg('<path d="m12 3 2.1 4.5 4.9.6-3.6 3.4.9 4.9L12 14l-4.3 2.4.9-4.9L5 8.1l4.9-.6z"/>'),
  },
  {
    label: 'Account Overview',
    path: '/dashboard',
    live: true,
    icon: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>'),
  },
  {
    label: 'List & Group Management',
    path: '/list-group',
    icon: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
    children: [
      { label: 'List Management', path: 'list-management' },
      { label: 'Add Test To List (Bulk)', path: 'add-test-bulk' },
    ],
  },
  {
    label: 'Doctor Management',
    path: '/doctor',
    icon: svg('<path d="M6 2v6a6 6 0 0 0 12 0V2"/><path d="M12 14v3a4 4 0 0 0 8 0v-1"/><circle cx="20" cy="15" r="2"/>'),
    children: [
      { label: 'Doctor List', path: 'list' },
      { label: 'Doctor Revenue Management', path: 'revenue-management' },
      { label: 'Doctor Revenue Tracker', path: 'revenue-tracker' },
    ],
  },
  {
    label: 'Department Management',
    path: '/department',
    icon: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    children: [{ label: 'Department List', path: 'list' }],
  },
  {
    label: 'Outsourcing Management',
    path: '/outsourcing-management',
    icon: svg('<path d="M4 7h11a4 4 0 0 1 0 8H8"/><path d="M7 12l-3 3 3 3"/>'),
  },
  {
    label: 'Marketing Management',
    path: '/marketing-management',
    icon: svg('<path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6"/>'),
  },
  {
    label: 'Center Management',
    path: '/center',
    icon: svg('<path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M10 12h4M12 10v4"/>'),
    children: [
      { label: 'Custom Login', path: 'custom-login' },
      { label: 'Center Details', path: 'details' },
      { label: 'Resources', path: 'resources' },
      { label: 'Resources (New)', path: 'resources-new' },
      { label: 'Feedback', path: 'feedback' },
      { label: 'Payment', path: 'payment' },
      { label: 'Online Payment', path: 'online-payment' },
      { label: 'Integrations', path: 'integrations' },
      { label: 'Instant Comments', path: 'instant-comments' },
    ],
  },
  {
    label: 'Users Management Setting',
    path: '/users-management',
    icon: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>'),
  },
  {
    label: 'Storage Management',
    path: '/storage',
    icon: svg('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'),
    children: [
      { label: 'File List', path: 'file-list' },
      { label: 'Bin', path: 'bin' },
    ],
  },
  {
    label: 'Integration Dashboard',
    path: '/integration-dashboard',
    icon: svg('<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M11 7h4a2 2 0 0 1 2 2v4"/>'),
  },
  {
    label: 'Translation',
    path: '/translation',
    icon: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>'),
    children: [{ label: 'Configuration', path: 'configuration' }],
  },
  {
    label: 'Activity Log',
    path: '/activity-log',
    icon: svg('<path d="M3 12h4l3 8 4-16 3 8h4"/>'),
  },
  {
    label: 'Advance search',
    path: '/advance-search',
    icon: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  },
];

/**
 * Second-level menu for the Registration module. Entering /registration swaps the
 * sidebar over to this list, the way Crelio's module contexts work.
 */
export const REGISTRATION_MENU: AdminGroup[] = [
  { label: 'Registration', path: '/registration', live: true, icon: svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>') },
  {
    label: 'Appointments',
    path: '/registration/appointments',
    icon: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    children: [
      { label: 'Appointment List', path: 'list' },
      { label: 'Appointments Calendar', path: 'calendar' },
      { label: 'Appointments Settings', path: 'settings' },
    ],
  },
  {
    label: 'Home Collection',
    path: '/registration/home-collection',
    icon: svg('<path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>'),
    children: [
      { label: 'Home Collections', path: 'collections' },
      { label: 'Home Collection Calendar', path: 'calendar' },
      { label: 'Phlebotomists', path: 'phlebotomists' },
      { label: 'Phlebotomist Dashboard', path: 'phlebotomist-dashboard' },
      { label: 'Phlebotomist Reports', path: 'phlebotomist-reports' },
      { label: 'Phlebotomist Tags', path: 'phlebotomist-tags' },
      { label: 'Home Collection Settings', path: 'settings' },
    ],
  },
  {
    label: 'Billing History',
    path: '/registration/billing-history',
    icon: svg('<path d="M12 8v8M9 11h6"/><circle cx="12" cy="12" r="9"/>'),
    children: [
      { label: 'Bill Settlements', path: 'bill-settlements' },
      { label: 'Advance Collection', path: 'advance-collection' },
      { label: 'Add Test to Bill', path: 'add-test-to-bill' },
      { label: 'Invoice', path: 'invoice' },
    ],
  },
  { label: 'Cash Transfer', path: '/registration/cash-transfer', icon: svg('<path d="M4 7h11a4 4 0 0 1 0 8H8"/><path d="M7 12l-3 3 3 3"/>') },
  { label: 'Archives', path: '/registration/archives', icon: svg('<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>') },
  { label: 'Report Print', path: '/registration/report-print', icon: svg('<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/>') },
  { label: 'Collection Reports', path: '/registration/collection-reports', icon: svg('<path d="M3 12h4l3 8 4-16 3 8h4"/>') },
  { label: 'Tests List', path: '/registration/tests-list', icon: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>') },
  { label: 'Operational Status', path: '/registration/operational-status', icon: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>') },
  { label: 'Advanced Search', path: '/registration/advanced-search', icon: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>') },
];

/** Second-level menu for the Accession module. */
export const ACCESSION_MENU: AdminGroup[] = [
  { label: 'Pending Accession', path: '/accession', icon: svg('<path d="M12 8v5l3 2"/><circle cx="12" cy="12" r="9"/>') },
  { label: 'Accessed', path: '/accession/accessed', icon: svg('<path d="M20 6 9 17l-5-5"/>') },
  { label: 'Accession Settings', path: '/accession/settings', icon: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>') },
  { label: 'Advanced Search', path: '/accession/advanced-search', icon: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>') },
];

/** URL prefix → the menu that replaces the default sidebar inside that module. */
export const MENU_CONTEXTS = [
  { prefix: '/registration', title: 'Registration', items: REGISTRATION_MENU },
  { prefix: '/accession', title: 'Accession', items: ACCESSION_MENU },
];
