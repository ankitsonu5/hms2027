import { Routes } from '@angular/router';

export const LABORATORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./laboratory.page').then((m) => m.LaboratoryPage),
  },
  {
    path: 'order/new',
    loadComponent: () => import('./lab-order-form.page').then((m) => m.LabOrderFormPage),
  },
  {
    path: 'order/:id',
    loadComponent: () => import('./lab-order-form.page').then((m) => m.LabOrderFormPage),
  },
  {
    path: 'results/:orderId',
    loadComponent: () => import('./lab-result-entry.page').then((m) => m.LabResultPage),
  },
];
