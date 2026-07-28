import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./billing-list.page').then((m) => m.BillingListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./billing-form.page').then((m) => m.BillingFormPage),
  },
  {
    path: ':id',
    loadComponent: () => import('./billing-form.page').then((m) => m.BillingFormPage),
  },
];
