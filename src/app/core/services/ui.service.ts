import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

let nextId = 1;

/**
 * خدمة مركزية للتوست (Toast) وإدارة النوافذ المنبثقة على مستوى التطبيق.
 */
@Injectable({ providedIn: 'root' })
export class UiService {
  readonly authModalOpen = signal(false);

  /** قائمة التوستات النشطة */
  readonly toasts = signal<Toast[]>([]);

  openAuthModal(): void {
    this.authModalOpen.set(true);
  }

  closeAuthModal(): void {
    this.authModalOpen.set(false);
  }

  /** عرض توست مؤقت */
  showToast(message: string, type: Toast['type'] = 'info', duration = 2500): void {
    const id = nextId++;
    this.toasts.update((list) => [...list, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => this.dismissToast(id), duration);
    }
  }

  /** إخفاء توست معيّن */
  dismissToast(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
