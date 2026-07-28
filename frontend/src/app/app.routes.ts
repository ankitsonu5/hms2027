import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./modules/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'patient',
        loadChildren: () =>
          import('./modules/patient/patient.routes').then((m) => m.PATIENT_ROUTES),
      },
      {
        path: 'opd',
        loadChildren: () => import('./modules/opd/opd.routes').then((m) => m.OPD_ROUTES),
      },
      {
        path: 'emergency',
        loadChildren: () =>
          import('./modules/emergency/emergency.routes').then((m) => m.EMERGENCY_ROUTES),
      },
      {
        path: 'laboratory',
        loadChildren: () =>
          import('./modules/laboratory/laboratory.routes').then((m) => m.LABORATORY_ROUTES),
      },
      {
        path: 'pharmacy',
        loadChildren: () =>
          import('./modules/pharmacy/pharmacy.routes').then((m) => m.PHARMACY_ROUTES),
      },
      {
        path: 'ipd',
        loadChildren: () => import('./modules/ipd/ipd.routes').then((m) => m.IPD_ROUTES),
      },
      {
        path: 'radiology',
        loadChildren: () =>
          import('./modules/radiology/radiology.routes').then((m) => m.RADIOLOGY_ROUTES),
      },
      {
        path: 'billing',
        loadChildren: () =>
          import('./modules/billing/billing.routes').then((m) => m.BILLING_ROUTES),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./modules/inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES),
      },
      {
        path: 'compliance',
        loadChildren: () =>
          import('./modules/compliance/compliance.routes').then((m) => m.COMPLIANCE_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./modules/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
