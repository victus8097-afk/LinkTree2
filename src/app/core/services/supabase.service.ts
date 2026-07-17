import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  /** عميل Supabase أو null عند العمل في وضع العرض التجريبي. */
  readonly client: SupabaseClient | null;
  /** هل تم ضبط إعدادات Supabase؟ */
  readonly isConfigured: boolean;

  constructor() {
    const url = environment.supabaseUrl?.trim();
    const key = environment.supabaseAnonKey?.trim();
    if (url && key) {
      this.client = createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
      this.isConfigured = true;
    } else {
      this.client = null;
      this.isConfigured = false;
    }
  }
}

export type { User };
