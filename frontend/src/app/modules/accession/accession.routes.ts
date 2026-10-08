import { Routes } from '@angular/router';

export const ACCESSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pending-accession/pending-accession').then(m => m.PendingAccession)
  },
  {
    path: 'accessed',
    loadComponent: () => import('./accessed/accessed').then(m => m.Accessed)
  },
  {
    path: 'settings',
    loadComponent: () => import('./accession-settings/accession-settings').then(m => m.AccessionSettings)
  },
  {
    path: 'advanced-search',
    loadComponent: () => import('./advanced-search/advanced-search').then(m => m.AdvancedSearch)
  }
];
