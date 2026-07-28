import { Routes } from '@angular/router';

export const IPD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ipd.page').then((m) => m.IpdPage),
  },
  {
    path: 'admit',
    loadComponent: () => import('./ipd-admission-form.page').then((m) => m.IpdAdmissionFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./ipd-admission-form.page').then((m) => m.IpdAdmissionFormPage),
  },
];
