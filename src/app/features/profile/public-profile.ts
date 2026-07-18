import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { UiService } from '../../core/services/ui.service';
import { Profile } from '../../core/models/profile.model';
import { Link } from '../../core/models/link.model';

interface LinkWithIcon extends Link {
  icon: string;
  iconType: 'brand' | 'custom';
  domain: string;
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
  private readonly ui = inject(UiService);

  readonly profile = signal<Profile | null>(null);
  readonly links = signal<Link[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);
  readonly showShare = signal(false);
  readonly copied = signal(false);

  readonly linksWithIcons = computed<LinkWithIcon[]>(() => {
    return this.links().map((link) => ({
      ...link,
      ...this.getLinkIcon(link.url, link.title),
      domain: this.getDomain(link.url),
    }));
  });

  readonly profileUrl = computed(() => {
    const handle = this.profile()?.handle;
    return handle ? `${window.location.origin}/${handle}` : window.location.origin;
  });

  readonly qrCodeUrl = computed(() => {
    const url = encodeURIComponent(this.profileUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}&bgcolor=0b0617&color=a855f7`;
  });

  /** العنوان الديناميكي للصفحة */
  readonly pageTitle = computed(() => {
    const p = this.profile();
    if (!p) return 'وصلة';
    return `${p.displayName} | وصلة`;
  });

  private readonly SOCIAL_PATTERNS: Record<string, { pattern: RegExp; icon: string; label: string }> = {
    instagram: { pattern: /instagram\.com|insta\.gr/i, icon: '📷', label: 'Instagram' },
    twitter: { pattern: /twitter\.com|x\.com/i, icon: '𝕏', label: 'Twitter / X' },
    youtube: { pattern: /youtube\.com|youtu\.be/i, icon: '▶️', label: 'YouTube' },
    tiktok: { pattern: /tiktok\.com/i, icon: '🎵', label: 'TikTok' },
    snapchat: { pattern: /snapchat\.com/i, icon: '👻', label: 'Snapchat' },
    linkedin: { pattern: /linkedin\.com/i, icon: '💼', label: 'LinkedIn' },
    github: { pattern: /github\.com/i, icon: '🐙', label: 'GitHub' },
    behance: { pattern: /behance\.net/i, icon: '🎨', label: 'Behance' },
    dribbble: { pattern: /dribbble\.com/i, icon: '🏀', label: 'Dribbble' },
    telegram: { pattern: /t\.me|telegram\.me/i, icon: '📩', label: 'Telegram' },
    whatsapp: { pattern: /wa\.me|whatsapp\.com/i, icon: '💬', label: 'WhatsApp' },
    facebook: { pattern: /facebook\.com|fb\.com/i, icon: '📘', label: 'Facebook' },
    spotify: { pattern: /spotify\.com/i, icon: '🎧', label: 'Spotify' },
    medium: { pattern: /medium\.com/i, icon: '📝', label: 'Medium' },
    twitch: { pattern: /twitch\.tv/i, icon: '🎮', label: 'Twitch' },
    discord: { pattern: /discord\.gg|discord\.com/i, icon: '💬', label: 'Discord' },
    email: { pattern: /^mailto:/i, icon: '📧', label: 'Email' },
    phone: { pattern: /^tel:/i, icon: '📞', label: 'Phone' },
    website: { pattern: /./i, icon: '🌐', label: 'Website' },
  };

  private getLinkIcon(url: string, title: string): { icon: string; iconType: 'brand' | 'custom' } {
    const lowerUrl = url.toLowerCase();
    const lowerTitle = title.toLowerCase();
    for (const [, config] of Object.entries(this.SOCIAL_PATTERNS)) {
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
      // تحديث عنوان الصفحة
      document.title = `${profile.displayName} | وصلة`;

      const links = await this.linksService.listByHandle(handle);
      this.links.set(links);
    } catch {
      this.error.set('حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة لاحقاً.');
    } finally {
      this.loading.set(false);
    }
  }

  async trackClick(link: Link): Promise<void> {
    try {
      await this.linksService.trackClick(link.id);
    } catch {
      // silently ignore
    }
  }

  // ===== نسخ + مشاركة =====
  async copyProfileLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profileUrl());
      this.copied.set(true);
      this.ui.showToast('تم نسخ الرابط!', 'success');
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.ui.showToast('تعذّر النسخ', 'error');
    }
  }

  toggleShare(): void {
    this.showShare.update((v) => !v);
  }

  shareTo(platform: 'twitter' | 'whatsapp' | 'telegram'): void {
    const url = encodeURIComponent(this.profileUrl());
    const p = this.profile();
    const name = p ? encodeURIComponent(p.displayName) : 'وصلة';
    const maps: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${name}&url=${url}`,
      whatsapp: `https://wa.me/?text=${name}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${name}`,
    };
    window.open(maps[platform], '_blank', 'noopener');
  }

  getProfileImage(): string | null {
    return this.profile()?.avatarUrl ?? null;
  }

  getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }
}
