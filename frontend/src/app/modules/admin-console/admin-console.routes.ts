import { Route, Routes } from '@angular/router';
import { ADMIN_MENU, REGISTRATION_MENU, ACCESSION_MENU, AdminGroup } from '../../core/admin-menu';
import { ModulePlaceholderPage } from './module-placeholder.page';
import { RegisterPatientPage } from './register-patient.page';
import { AppointmentListPage } from './appointment-list.page';
import { AppointmentCalendarPage } from './appointment-calendar.page';
import { TestListPage } from './test-master/test-list.page';
import { LabMastersPage } from './test-master/lab-masters.page';
import { BillingListPage } from '../billing/billing-list.page';
import { InvoicePage } from '../billing/invoice.page';
import { BillingFormPage } from '../billing/billing-form.page';
import { OrganizationListPage } from './organization-list.page';
import { PhlebotomistListPage } from './phlebotomist-list.page';
import { PhlebotomistDashboardPage } from './phlebotomist-dashboard.page';
import { HomeCollectionListPage } from './home-collection-list.page';
import { HomeCollectionCalendarPage } from './home-collection-calendar.page';
import { DictionaryMappingPage } from './dictionary-mapping.page';
import { ReportSettingsPage } from './report-settings.page';
import { BillSettingsPage } from './bill-settings.page';
import { InvoiceSettingsPage } from './invoice-settings.page';
import { CancelledTestsPage } from './cancelled-tests.page';
import { PendingReportsPage } from './pending-reports.page';
import { DepartmentListPage } from './department-list.page';
import { SmartReportSettingsPage } from './smart-report-settings.page';
import { ClinicianListPage } from './clinician-list.page';

/** Menu paths that have a real page; everything else falls back to the placeholder. */
const IMPLEMENTED: Record<string, any> = {
  '/registration': RegisterPatientPage,
  '/registration/appointments/list': AppointmentListPage,
  '/registration/appointments/calendar': AppointmentCalendarPage,
  '/registration/billing-history/bill-settlements': BillingListPage,
  '/registration/billing-history/add-test-to-bill': BillingFormPage,
  '/registration/billing-history/invoice': InvoicePage,
  '/test-profile-management/test-list': TestListPage,
  '/client-management': OrganizationListPage,
  '/department/list': DepartmentListPage,
  '/department': DepartmentListPage,
  '/registration/home-collection/collections': HomeCollectionListPage,
  '/registration/home-collection/calendar': HomeCollectionCalendarPage,
  '/registration/home-collection/phlebotomists': PhlebotomistListPage,
  '/registration/home-collection/phlebotomist-dashboard': PhlebotomistDashboardPage,
  '/test-profile-management/dictionary-mapping': DictionaryMappingPage,
  '/test-profile-management/report-settings': ReportSettingsPage,
  '/test-profile-management/bill-settings': BillSettingsPage,
  '/test-profile-management/invoice-settings': InvoiceSettingsPage,
  '/test-profile-management/cancelled-tests': CancelledTestsPage,
  '/test-profile-management/other-settings': LabMastersPage,
  '/registration/report-print/pending': PendingReportsPage,
  '/smart-report-settings': SmartReportSettingsPage,
  '/clinician-management': ClinicianListPage,
};

const strip = (p: string) => p.replace(/^\//, '');

/**
 * Every menu entry gets a real route, derived from the menu definitions so the
 * nav and the router can never drift apart. Entries flagged `live` that have no
 * IMPLEMENTED page are owned by another module and are skipped.
 */
function routesFor(menu: AdminGroup[]): Routes {
  return menu.flatMap((group): Route[] => {
    if (!group.children?.length) {
      const page = IMPLEMENTED[group.path];
      if (!page && group.live) return [];
      return [
        {
          path: strip(group.path),
          component: page ?? ModulePlaceholderPage,
          data: { title: group.label },
        },
      ];
    }

    return [
      {
        path: strip(group.path),
        children: [
          { path: '', redirectTo: group.children[0].path, pathMatch: 'full' },
          ...group.children
            .filter((child) => !child.link)
            .map((child) => ({
              path: child.path,
              component: IMPLEMENTED[`${group.path}/${child.path}`] ?? ModulePlaceholderPage,
              data: { title: child.label, parent: group.label },
            })),
        ],
      },
    ];
  });
}

export const ADMIN_ROUTES: Routes = [
  // Test editor (create / edit). Listed before the menu-derived routes so it wins.
  {
    path: 'test-profile-management/test-list/:id',
    loadComponent: () => import('./test-master/test-editor.page').then((m) => m.TestEditorPage),
    data: { title: 'Test', parent: 'Test/Profile Management' },
  },
  ...routesFor(ADMIN_MENU),
  ...routesFor(REGISTRATION_MENU),
  ...routesFor(ACCESSION_MENU),
];
