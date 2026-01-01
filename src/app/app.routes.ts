import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'asset-list',
    loadComponent: () => import('./pages/asset-list/asset-list.component').then(m => m.AssetListComponent)
  },
  {
    path: 'asset-list/:categoryId',
    loadComponent: () => import('./pages/asset-list/asset-list.component').then(m => m.AssetListComponent)
  },
  {
    path: 'asset-detail/:id',
    loadComponent: () => import('./pages/asset-detail/asset-detail.component').then(m => m.AssetDetailComponent)
  },
  {
    path: 'assets/:floor/:type',
    loadComponent: () => import('./pages/asset-list/asset-list.component').then(m => m.AssetListComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
