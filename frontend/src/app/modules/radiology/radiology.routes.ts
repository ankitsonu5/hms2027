import { Routes } from '@angular/router';

export const RADIOLOGY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./radiology.page').then((m) => m.RadiologyPage),
  },
];
