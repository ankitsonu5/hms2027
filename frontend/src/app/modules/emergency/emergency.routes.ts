import { Routes } from '@angular/router';

export const EMERGENCY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./emergency-list.page').then((m) => m.EmergencyListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./emergency-form.page').then((m) => m.EmergencyFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./emergency-form.page').then((m) => m.EmergencyFormPage),
  },
];
