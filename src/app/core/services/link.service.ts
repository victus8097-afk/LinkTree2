import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ProfileService } from './profile.service';
import { Link, LinkInput, LinkRow, mapLink } from '../models/link.model';

const LOCAL_LINKS_KEY = 'wasla_links';

@Injectable({ providedIn: 'root' })
export class LinkService {
  private readonly supabase = inject(SupabaseService);
  private readonly profiles = inject(ProfileService);

  /** جلب روابط الملف الشخصي مرتبة حسب الترتيب. */
  async listByHandle(handle: string): Promise<Link[]> {
    const profile = await this.profiles.getByHandle(handle);
    if (!profile) return [];
    return this.listByProfile(profile.id);
  }

  async listByProfile(profileId: string): Promise<Link[]> {
    if (this.supabase.isConfigured && this.supabase.client) {
      const { data, error } = await this.supabase.client
        .from('links')
        .select('*')
        .eq('profile_id', profileId)
        .order('position', { ascending: true });
      if (error) throw error;
      return (data as LinkRow[]).map(mapLink);
    }
    return this.localLinks()
      .filter((l) => l.profileId === profileId)
      .sort((a, b) => a.position - b.position);
  }

  async add(profileId: string, input: LinkInput): Promise<Link> {
    const title = input.title.trim();
    const url = this.normalizeUrl(input.url.trim());
    if (this.supabase.isConfigured && this.supabase.client) {
      const { data, error } = await this.supabase.client
        .from('links')
        .insert({
          profile_id: profileId, title, url,
          position: await this.nextPosition(profileId),
          category: input.category ?? null,
          password: input.password ?? null,
          pinned: input.pinned ?? false,
        })
        .select()
        .single();
      if (error) throw error;
      return mapLink(data as LinkRow);
    }
    const link: Link = {
      id: 'local-' + Math.random().toString(36).slice(2),
      profileId,
      title,
      url,
      position: await this.nextPosition(profileId),
      createdAt: new Date().toISOString(),
      category: input.category ?? null,
      password: input.password ?? null,
      pinned: input.pinned ?? false,
    };
    const all = this.localLinks();
    all.push(link);
    this.saveLocal(all);
    return link;
  }

  async update(link: Link): Promise<Link> {
    if (this.supabase.isConfigured && this.supabase.client) {
      const { data, error } = await this.supabase.client
        .from('links')
        .update({ title: link.title, url: link.url, position: link.position, category: link.category, password: link.password, pinned: link.pinned })
        .eq('id', link.id)
        .select()
        .single();
      if (error) throw error;
      return mapLink(data as LinkRow);
    }
    const all = this.localLinks();
    const idx = all.findIndex((l) => l.id === link.id);
    if (idx >= 0) {
      all[idx] = { ...link };
      this.saveLocal(all);
    }
    return link;
  }

  /** إعادة ترتيب الروابط (مصفوفة من id بالترتيب الجديد). */
  async reorder(profileId: string, orderedIds: string[]): Promise<void> {
    // تحديث الموضع لكل رابط حسب الترتيب الجديد
    const list = await this.listByProfile(profileId);
    const idToLink = new Map(list.map((l) => [l.id, l]));

    const updates = orderedIds
      .map((id, index) => {
        const link = idToLink.get(id);
        return link ? { ...link, position: index } : null;
      })
      .filter((l): l is Link => l !== null);

    if (this.supabase.isConfigured && this.supabase.client) {
      // تحديث كل رابط على حدة
      await Promise.all(
        updates.map((link) =>
          this.supabase.client!
            .from('links')
            .update({ position: link.position })
            .eq('id', link.id),
        ),
      );
      return;
    }

    // محلياً: استبدل القائمة كلها
    const all = this.localLinks().filter((l) => l.profileId !== profileId);
    all.push(...updates);
    this.saveLocal(all);
  }

  async remove(linkId: string): Promise<void> {
    if (this.supabase.isConfigured && this.supabase.client) {
      const { error } = await this.supabase.client
        .from('links')
        .delete()
        .eq('id', linkId);
      if (error) throw error;
      return;
    }
    this.saveLocal(this.localLinks().filter((l) => l.id !== linkId));
  }

  private async nextPosition(profileId: string): Promise<number> {
    const list = await this.listByProfile(profileId);
    return list.length;
  }

  /** يضيف https:// إن لم يكن الرابط يحمل مخططاً. */
  private normalizeUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return 'https://' + url;
  }

  private localLinks(): Link[] {
    const raw = localStorage.getItem(LOCAL_LINKS_KEY);
    return raw ? (JSON.parse(raw) as Link[]) : [];
  }

  private saveLocal(links: Link[]): void {
    localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(links));
  }

  /** تتبع نقرة على الرابط (للتحليلات) */
  async trackClick(linkId: string): Promise<void> {
    if (this.supabase.isConfigured && this.supabase.client) {
      const { error } = await this.supabase.client
        .from('link_clicks')
        .insert({ link_id: linkId, clicked_at: new Date().toISOString() });
      if (error) console.warn('Failed to track click:', error);
    }
    // محلياً: تخزين العداد في localStorage
    const key = `wasla_click_${linkId}`;
    const raw = localStorage.getItem(key);
    const count = raw ? parseInt(raw, 10) + 1 : 1;
    localStorage.setItem(key, String(count));
  }

  /** جلب عدد النقرات لرابط (محلياً فقط) */
  getClickCount(linkId: string): number {
    const raw = localStorage.getItem(`wasla_click_${linkId}`);
    return raw ? parseInt(raw, 10) : 0;
  }

  /** جلب إحصائيات كل روابط الملف الشخصي */
  getClickStats(profileId: string): Record<string, number> {
    const stats: Record<string, number> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('wasla_click_')) {
        const id = key.replace('wasla_click_', '');
        stats[id] = parseInt(localStorage.getItem(key) || '0', 10);
      }
    }
    return stats;
  }
}
