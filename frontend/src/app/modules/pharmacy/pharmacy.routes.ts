import { Routes } from '@angular/router';

export const PHARMACY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pharmacy.page').then((m) => m.PharmacyPage),
  },
  {
    path: 'sale/new',
    loadComponent: () => import('./pharmacy-sale-form.page').then((m) => m.PharmacySaleFormPage),
  },
];
