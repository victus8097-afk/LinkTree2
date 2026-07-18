import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { Profile } from '../../core/models/profile.model';
import { Link } from '../../core/models/link.model';

interface LinkWithIcon extends Link {
  icon: string;
  iconType: 'brand' | 'custom';
}

@Component({
  selector: 'app-public-profile',
  imports: [RouterLink],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.scss',
})
export class PublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profiles = inject(ProfileService);
  private readonly linksService = inject(LinkService);

  readonly profile = signal<Profile | null>(null);
  readonly links = signal<Link[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);
  readonly showAnalytics = signal(false);

  readonly linksWithIcons = computed<LinkWithIcon[]>(() => {
    return this.links().map(link => ({
      ...link,
      ...this.getLinkIcon(link.url, link.title)
    }));
  });

  readonly profileUrl = computed(() => {
    const handle = this.profile()?.handle;
    return handle ? `${window.location.origin}/${handle}` : window.location.origin;
  });

  private readonly SOCIAL_PATTERNS: Record<string, { pattern: RegExp; icon: string; label: string }> = {
    instagram: { pattern: /instagram\.com|insta\.gr/i, icon: '📷', label: 'Instagram' },
    twitter: { pattern: /twitter\.com|x\.com/i, icon: '𝕏', label: 'X / Twitter' },
    x: { pattern: /x\.com/i, icon: '𝕏', label: 'X' },
    youtube: { pattern: /youtube\.com|youtu\.be/i, icon: '▶️', label: 'YouTube' },
    tiktok: { pattern: /tiktok\.com/i, icon: '🎵', label: 'TikTok' },
    snapchat: { pattern: /snapchat\.com/i, icon: '👻', label: 'Snapchat' },
    linkedin: { pattern: /linkedin\.com/i, icon: '💼', label: 'LinkedIn' },
    github: { pattern: /github\.com/i, icon: '🐙', label: 'GitHub' },
    behance: { pattern: /behance\.net/i, icon: '🎨', label: 'Behance' },
    dribbble: { pattern: /dribbble\.com/i, icon: '🏀', label: 'Dribbble' },
    telegram: { pattern: /t\.me|telegram\.me/i, icon: '📩', label: 'Telegram' },
    whatsapp: { pattern: /wa\.me|whatsapp\.com/i, icon: '💬', label: 'WhatsApp' },
    email: { pattern: /mailto:/i, icon: '📧', label: 'Email' },
    phone: { pattern: /tel:/i, icon: '📞', label: 'Phone' },
    website: { pattern: /./i, icon: '🌐', label: 'Website' },
  };

  private getLinkIcon(url: string, title: string): { icon: string; iconType: 'brand' | 'custom' } {
    const lowerUrl = url.toLowerCase();
    const lowerTitle = title.toLowerCase();

    for (const [key, config] of Object.entries(this.SOCIAL_PATTERNS)) {
      if (config.pattern.test(lowerUrl) || config.pattern.test(lowerTitle)) {
        return { icon: config.icon, iconType: 'brand' };
      }
    }

    return { icon: '🔗', iconType: 'custom' };
  }

  initial(name: string): string {
    return (name || '؟').trim().charAt(0) || '؟';
  }

  async ngOnInit(): Promise<void> {
    const handle = this.route.snapshot.paramMap.get('handle') ?? '';
    if (!handle) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    await this.load(handle);
  }

  async reload(): Promise<void> {
    const handle = this.route.snapshot.paramMap.get('handle') ?? '';
    if (!handle) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    await this.load(handle);
  }

  private async load(handle: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const profile = await this.profiles.getByHandle(handle);
      if (!profile) {
        this.notFound.set(true);
        this.loading.set(false);
        return;
      }

      this.profile.set(profile);
      const links = await this.linksService.listByHandle(handle);
      this.links.set(links);
    } catch (err) {
      console.error('Failed to load profile:', err);
      this.error.set('حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة لاحقاً.');
    } finally {
      this.loading.set(false);
    }
  }

  async trackClick(link: Link): Promise<void> {
    try {
      await this.linksService.trackClick(link.id);
    } catch {
      console.warn('Failed to track click');
    }
  }

  async copyProfileLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profileUrl());
      this.showCopiedToast();
    } catch {
      this.showCopiedToast();
    }
  }

  private showCopiedToast(): void {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'تم نسخ الرابط!';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  getProfileImage(): string | null {
    const profile = this.profile();
    if (profile?.avatarUrl) return profile.avatarUrl;
    return null;
  }

  getDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return '';
    }
  }
}