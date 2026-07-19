import { Injectable, computed, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface AuthUser {
  id: string;
  email: string;
}

export type AuthMessage = { type: 'success' | 'error' | 'info'; text: string } | null;

const LOCAL_USER_KEY = 'wasla_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  private readonly _user = signal<AuthUser | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  readonly loading = signal(false);
  readonly message = signal<AuthMessage>(null);

  readonly sessionReady: Promise<void>;

  /** هل تم ضبط Resend (لإرسال البريد عبر API خاصتنا بدلاً من Supabase). */
  readonly resendAvailable = signal(false);

  /** رابط الدخول المولّد (يُستخدم في وضع العرض فقط لإظهار الرابط للمطوّر). */
  readonly debugLink = signal<string | null>(null);

  constructor() {
    if (this.supabase.isConfigured && this.supabase.client) {
      const client = this.supabase.client;
      this.sessionReady = new Promise<void>((resolve) => {
        client.auth
          .getSession()
          .then(({ data }) => {
            const session = data.session;
            if (session?.user) {
              this._user.set({ id: session.user.id, email: session.user.email ?? '' });
            }
          })
          .catch(() => {})
          .finally(() => resolve());
      });
      client.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          this._user.set({ id: session.user.id, email: session.user.email ?? '' });
        } else {
          this._user.set(null);
        }
      });
    } else {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      if (raw) {
        try {
          this._user.set(JSON.parse(raw) as AuthUser);
        } catch {
          localStorage.removeItem(LOCAL_USER_KEY);
        }
      }
      this.sessionReady = Promise.resolve();
    }

    // تحقق من وجود رابط Resend callback في شريط العنوان
    this.sessionReady.then(() => this.checkCallbackToken());
  }

  /** معالجة رابط ?token=xxx (عند العودة من بريد Resend). */
  private async checkCallbackToken(): Promise<void> {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (!token) return;

    // نظّف الرابط من الـ token
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.toString());

    await this.verifyResendToken(token);
  }

  /** تحقّق من رمز Resend واستخرج المستخدم. */
  async verifyResendToken(token: string): Promise<void> {
    this.loading.set(true);
    this.message.set(null);
    try {
      const resp = await fetch('/api/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = (await resp.json()) as { success?: boolean; email?: string; error?: string };
      if (!resp.ok || !data.success) {
        this.message.set({ type: 'error', text: data.error || 'رابط غير صالح.' });
        this.loading.set(false);
        return;
      }
      // أنشئ جلسة محلّية (Resend-based)
      const user: AuthUser = {
        id: 'resend-' + Math.random().toString(36).slice(2),
        email: data.email!,
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
      this._user.set(user);
      this.message.set({ type: 'success', text: 'تم تسجيل الدخول بنجاح.' });
    } catch {
      this.message.set({ type: 'error', text: 'تعذّر التحقق من رابط الدخول.' });
    } finally {
      this.loading.set(false);
    }
  }

  /** إرسال رابط دخول آمن (Magic Link) عبر البريد، أو تسجيل دخول فوري في وضع العرض. */
  async sendMagicLink(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    this.loading.set(true);
    this.message.set(null);
    this.debugLink.set(null);

    // 1) جرّب Resend API (إن كانت /api/send-magic-link متاحة)
    try {
      const resp = await fetch('/api/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized }),
      });
      if (resp.ok) {
        const data = (await resp.json()) as { success?: boolean; message?: string; link?: string };
        this.resendAvailable.set(true);
        if (data.link) this.debugLink.set(data.link);
        this.message.set({ type: 'success', text: data.message || 'تم إرسال رابط الدخول.' });
        this.loading.set(false);
        return;
      }
    } catch {
      // /api غير موجودة (بيئة تطوير محلية بدون خادم)
    }

    // 2) رجوع إلى Supabase (إن كان مضبوطاً)
    try {
      if (this.supabase.isConfigured && this.supabase.client) {
        const { error } = await this.supabase.client.auth.signInWithOtp({
          email: normalized,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        this.message.set({
          type: 'success',
          text: 'تم إرسال رابط الدخول إلى بريدك الإلكتروني. افتح الرابط لتسجيل الدخول.',
        });
        this.loading.set(false);
        return;
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'تعذّر إرسال رابط الدخول، حاول مرة أخرى.';
      this.message.set({ type: 'error', text });
      this.loading.set(false);
      return;
    }

    // 3) وضع العرض التجريبي (localStorage)
    const user: AuthUser = {
      id: 'local-' + Math.random().toString(36).slice(2),
      email: normalized,
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this.message.set({ type: 'success', text: 'تم تسجيل الدخول (وضع العرض التجريبي).' });

    this.loading.set(false);
  }

  async signOut(): Promise<void> {
    if (this.supabase.isConfigured && this.supabase.client) {
      await this.supabase.client.auth.signOut();
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
    this._user.set(null);
  }

  clearMessage(): void {
    this.message.set(null);
  }
}
