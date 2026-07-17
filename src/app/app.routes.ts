import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'وصلة | اجمع كل روابطك في صفحة واحدة',
    loadComponent: () => import('./features/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'onboarding',
    canActivate: [onboardingGuard],
    title: 'إعداد صفحتك | وصلة',
    loadComponent: () =>
      import('./features/onboarding/onboarding').then((m) => m.OnboardingComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    title: 'لوحة التحكم | وصلة',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: ':handle',
    title: 'وصلة',
    loadComponent: () =>
      import('./features/profile/public-profile').then((m) => m.PublicProfileComponent),
  },
  { path: '**', redirectTo: '' },
];
