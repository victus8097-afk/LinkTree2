import { Injectable, signal } from '@angular/core';

/**
 * خدمة بسيطة للتحكم في النوافذ المنبثقة على مستوى التطبيق،
 * مثل نافذة تسجيل الدخول (Auth Modal) التي تظهر من شريط التنقل أو الصفحة الرئيسية.
 */
@Injectable({ providedIn: 'root' })
export class UiService {
  readonly authModalOpen = signal(false);

  openAuthModal(): void {
    this.authModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.authModalOpen.set(false);
  }
}
