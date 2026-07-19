import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Profile, ProfileInput, ProfileRow, mapProfile } from '../models/profile.model';

const LOCAL_PROFILES_KEY = 'wasla_profiles';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async getByHandle(handle: string): Promise<Profile | null> {
    const h = handle.trim().toLowerCase();
    if (this.supabase.isConfigured && this.supabase.client) {
      const { data, error } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('handle', h)
        .maybeSingle();
      if (error || !data) return null;
      // increment view count
      this.incrementViews(h);
      return mapProfile(data as ProfileRow);
    }
    const p = this.localProfiles().find((p) => p.handle.toLowerCase() === h) ?? null;
    if (p) this.incrementViews(h);
    return p;
  }

  async getMine(): Promise<Profile | null> {
    const user = this.auth.user();
    if (!user) return null;
    if (this.supabase.isConfigured && this.supabase.client) {
      const { data } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      return data ? mapProfile(data as ProfileRow) : null;
    }
    return this.localProfiles().find((p) => p.id === user.id) ?? null;
  }

  /** هل الرابط متاح (غير مستخدم من قبل)؟ */
  async isHandleAvailable(handle: string): Promise<boolean> {
    const h = handle.trim().toLowerCase();
    if (!h) return false;
    if (this.supabase.isConfigured && this.supabase.client) {
      const { data } = await this.supabase.client
        .from('profiles')
        .select('handle')
        .eq('handle', h)
        .maybeSingle();
      return !data;
    }
    return !this.localProfiles().some((p) => p.handle.toLowerCase() === h);
  }

  async create(input: ProfileInput): Promise<Profile> {
    const user = this.auth.user();
    if (!user) throw new Error('يجب تسجيل الدخول أولاً.');
    if (this.supabase.isConfigured && this.supabase.client) {
      const row = {
        id: user.id,
        handle: input.handle.trim().toLowerCase(),
        display_name: input.displayName.trim(),
        bio: input.bio.trim(),
        email: input.email.trim().toLowerCase(),
        avatar_url: input.avatarUrl ?? null,
        theme_color: input.themeColor ?? null,
        bg_color: input.bgColor ?? null,
        password: input.password ?? null,
        template: input.template ?? null,
        verified: true,
        views: 0,
      };
      const { data, error } = await this.supabase.client
        .from('profiles')
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      return mapProfile(data as ProfileRow);
    }
    const profile: Profile = {
      id: user.id,
      handle: input.handle.trim().toLowerCase(),
      displayName: input.displayName.trim(),
      bio: input.bio.trim(),
      email: input.email.trim().toLowerCase(),
      avatarUrl: input.avatarUrl ?? null,
      themeColor: input.themeColor ?? null,
      bgColor: input.bgColor ?? null,
      password: input.password ?? null,
      template: input.template ?? null,
      verified: true,
      views: 0,
      createdAt: new Date().toISOString(),
    };
    const all = this.localProfiles();
    all.push(profile);
    this.saveLocal(all);
    return profile;
  }

  async update(profile: Profile): Promise<Profile> {
    if (this.supabase.isConfigured && this.supabase.client) {
      const { data, error } = await this.supabase.client
        .from('profiles')
        .update({
          display_name: profile.displayName,
          bio: profile.bio,
          avatar_url: profile.avatarUrl ?? null,
          theme_color: profile.themeColor ?? null,
          bg_color: profile.bgColor ?? null,
          password: profile.password ?? null,
          template: profile.template ?? null,
        })
        .eq('id', profile.id)
        .select()
        .single();
      if (error) throw error;
      return mapProfile(data as ProfileRow);
    }
    const all = this.localProfiles();
    const idx = all.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...profile };
      this.saveLocal(all);
    }
    return profile;
  }

  /** جلب ملفات شخصية (لأغراض إدارية - محلي فقط) */
  getAllProfiles(): Profile[] {
    if (this.supabase.isConfigured && this.supabase.client) {
      return []; // Supabase fetch would require admin
    }
    return this.localProfiles();
  }

  /** زيادة عداد المشاهدات */
  private incrementViews(handle: string): void {
    const all = this.localProfiles();
    const idx = all.findIndex((p) => p.handle.toLowerCase() === handle.toLowerCase());
    if (idx >= 0) {
      all[idx] = { ...all[idx], views: (all[idx].views || 0) + 1 };
      this.saveLocal(all);
    }
  }

  private localProfiles(): Profile[] {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    return raw ? (JSON.parse(raw) as Profile[]) : [];
  }

  private saveLocal(profiles: Profile[]): void {
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
  }
}
