import { Route, Routes } from '@angular/router';
import { ADMIN_MENU, REGISTRATION_MENU, ACCESSION_MENU, AdminGroup } from '../../core/admin-menu';
import { ModulePlaceholderPage } from './module-placeholder.page';
import { RegisterPatientPage } from './register-patient.page';
import { AppointmentListPage } from './appointment-list.page';

/** Menu paths that have a real page; everything else falls back to the placeholder. */
const IMPLEMENTED: Record<string, any> = {
  '/registration': RegisterPatientPage,
  '/registration/appointments/list': AppointmentListPage,
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
  ...routesFor(ADMIN_MENU),
  ...routesFor(REGISTRATION_MENU),
  ...routesFor(ACCESSION_MENU),
];
