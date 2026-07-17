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
          profile_id: profileId,
          title,
          url,
          position: await this.nextPosition(profileId),
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
    };
    const all = this.localLinks();
    all.push(link);
    this.saveLocal(all);
    return link;
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
}
