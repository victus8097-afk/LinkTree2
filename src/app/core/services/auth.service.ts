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

  /** يُستقر عند اكتمال قراءة جلسة المصادقة الأولية (مهم لحرّاس المسارات). */
  readonly sessionReady: Promise<void>;

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
  }

  /** إرسال رابط دخول آمن (Magic Link) عبر البريد، أو تسجيل دخول فوري في وضع العرض. */
  async sendMagicLink(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    this.loading.set(true);
    this.message.set(null);
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
      } else {
        const user: AuthUser = {
          id: 'local-' + Math.random().toString(36).slice(2),
          email: normalized,
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
        this._user.set(user);
        this.message.set({ type: 'success', text: 'تم تسجيل الدخول (وضع العرض التجريبي).' });
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'تعذّر إرسال رابط الدخول، حاول مرة أخرى.';
      this.message.set({ type: 'error', text });
    } finally {
      this.loading.set(false);
    }
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
