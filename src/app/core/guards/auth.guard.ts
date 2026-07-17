import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

/**
 * يحمي لوحة التحكم (/dashboard):
 * - إن لم يكن المستخدم مسجّلاً للدخول → يُحوَّل للصفحة الرئيسية.
 * - إن كان مسجّلاً لكن بلا ملف شخصي → يُحوَّل لصفحة الإعداد (/onboarding).
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const profiles = inject(ProfileService);
  const router = inject(Router);

  await auth.sessionReady;

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  const mine = await profiles.getMine();
  if (!mine) {
    return router.createUrlTree(['/onboarding']);
  }

  return true;
};
