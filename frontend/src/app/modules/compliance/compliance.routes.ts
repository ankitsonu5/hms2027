import { Routes } from '@angular/router';

export const COMPLIANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./compliance.page').then((m) => m.CompliancePage),
  },
];
