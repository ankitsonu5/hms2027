import { Routes } from '@angular/router';

export const OPD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./opd-list.page').then((m) => m.OpdListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./opd-form.page').then((m) => m.OpdFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./opd-form.page').then((m) => m.OpdFormPage),
  },
];
