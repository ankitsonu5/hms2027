import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./patient-list.page').then((m) => m.PatientListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./patient-form.page').then((m) => m.PatientFormPage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./patient-form.page').then((m) => m.PatientFormPage),
  },
];
