import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { UiService } from '../../core/services/ui.service';
import { Profile, PROFILE_TEMPLATES } from '../../core/models/profile.model';
import { Link } from '../../core/models/link.model';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

interface LinkWithIcon extends Link {
  icon: string;
  iconType: 'brand' | 'custom';
  domain: string;
}

@Component({
  selector: 'app-public-profile',
  imports: [RouterLink, FormsModule, SkeletonComponent],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.scss',
})
export class PublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profiles = inject(ProfileService);
  private readonly linksService = inject(LinkService);
  private readonly ui = inject(UiService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly profile = signal<Profile | null>(null);
  readonly links = signal<Link[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly error = signal<string | null>(null);

  // Password gate
  readonly password = signal('');
  readonly passwordRequired = signal(false);
  readonly passwordError = signal(false);

  // Share
  readonly showShare = signal(false);
  readonly copied = signal(false);

  // Template metadata
  readonly activeTemplate = computed(() => {
    const t = this.profile()?.template;
    return t ? PROFILE_TEMPLATES.find((x) => x.id === t) : null;
  });

  readonly linksWithIcons = computed<LinkWithIcon[]>(() =>
    this.links().map((link) => ({
      ...link,
      ...this.getLinkIcon(link.url, link.title),
      domain: this.getDomain(link.url),
    })),
  );

  readonly profileUrl = computed(() => {
    const handle = this.profile()?.handle;
    return handle ? `${window.location.origin}/${handle}` : window.location.origin;
  });

  readonly qrCodeUrl = computed(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.profileUrl())}&bgcolor=0b0617&color=a855f7`;
  });

  readonly pageTitle = computed(() => {
    const p = this.profile();
    return p ? `${p.displayName} | وصلة` : 'وصلة';
  });

  private readonly SOCIAL_PATTERNS: Record<string, { pattern: RegExp; icon: string }> = {
    instagram: { pattern: /instagram\.com|insta\.gr/i, icon: '📷' },
    twitter: { pattern: /twitter\.com|x\.com/i, icon: '𝕏' },
    youtube: { pattern: /youtube\.com|youtu\.be/i, icon: '▶️' },
    tiktok: { pattern: /tiktok\.com/i, icon: '🎵' },
    snapchat: { pattern: /snapchat\.com/i, icon: '👻' },
    linkedin: { pattern: /linkedin\.com/i, icon: '💼' },
    github: { pattern: /github\.com/i, icon: '🐙' },
    behance: { pattern: /behance\.net/i, icon: '🎨' },
    dribbble: { pattern: /dribbble\.com/i, icon: '🏀' },
    telegram: { pattern: /t\.me|telegram\.me/i, icon: '📩' },
    whatsapp: { pattern: /wa\.me|whatsapp\.com/i, icon: '💬' },
    facebook: { pattern: /facebook\.com|fb\.com/i, icon: '📘' },
    spotify: { pattern: /spotify\.com/i, icon: '🎧' },
    medium: { pattern: /medium\.com/i, icon: '📝' },
    twitch: { pattern: /twitch\.tv/i, icon: '🎮' },
    discord: { pattern: /discord\.gg|discord\.com/i, icon: '💬' },
    email: { pattern: /^mailto:/i, icon: '📧' },
    phone: { pattern: /^tel:/i, icon: '📞' },
  };

  private getLinkIcon(url: string, title: string): { icon: string; iconType: 'brand' | 'custom' } {
    const lowerUrl = url.toLowerCase();
    const lowerTitle = title.toLowerCase();
    for (const [, cfg] of Object.entries(this.SOCIAL_PATTERNS)) {
      if (cfg.pattern.test(lowerUrl) || cfg.pattern.test(lowerTitle)) {
        return { icon: cfg.icon, iconType: 'brand' };
      }
    }
    return { icon: '🔗', iconType: 'custom' };
  }

  initial(name: string): string {
    return (name || '؟').trim().charAt(0) || '؟';
  }

  getDomain(url: string): string {
    try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
  }

  getProfileImage(): string | null {
    return this.profile()?.avatarUrl ?? null;
  }

  async ngOnInit(): Promise<void> {
    const handle = this.route.snapshot.paramMap.get('handle') ?? '';
    if (!handle) { this.notFound.set(true); this.loading.set(false); return; }
    await this.load(handle);
  }

  async reload(): Promise<void> {
    const handle = this.route.snapshot.paramMap.get('handle') ?? '';
    if (!handle) { this.notFound.set(true); this.loading.set(false); return; }
    await this.load(handle);
  }

  private async load(handle: string): Promise<void> {
    this.loading.set(true); this.error.set(null);
    try {
      const profile = await this.profiles.getByHandle(handle);
      if (!profile) { this.notFound.set(true); this.loading.set(false); return; }

      // Password gate
      if (profile.password) {
        this.profile.set(profile);
        this.passwordRequired.set(true);
        this.loading.set(false);
        return;
      }

      await this.loadProfileData(profile);
    } catch {
      this.error.set('حدث خطأ أثناء تحميل الصفحة.');
      this.loading.set(false);
    }
  }

  /** محاولة إدخال كلمة المرور */
  async unlock(): Promise<void> {
    const p = this.profile();
    if (!p || this.password() !== p.password) {
      this.passwordError.set(true);
      return;
    }
    this.passwordError.set(false);
    this.passwordRequired.set(false);
    this.loading.set(true);
    await this.loadProfileData(p);
  }

  private async loadProfileData(profile: Profile): Promise<void> {
    this.profile.set(profile);

    // Dynamic SEO
    this.title.setTitle(`${profile.displayName} | وصلة`);
    this.meta.updateTag({ name: 'description', content: profile.bio || `${profile.displayName} على وصلة` });
    this.meta.updateTag({ property: 'og:title', content: `${profile.displayName} | وصلة` });
    this.meta.updateTag({ property: 'og:description', content: profile.bio || `صفحة ${profile.displayName} على وصلة` });
    this.meta.updateTag({ property: 'og:url', content: this.profileUrl() });

    const links = await this.linksService.listByHandle(profile.handle);
    this.links.set(links);
    this.loading.set(false);
  }

  async trackClick(link: Link): Promise<void> {
    try { await this.linksService.trackClick(link.id); } catch {}
  }

  async copyProfileLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profileUrl());
      this.copied.set(true);
      this.ui.showToast('تم نسخ الرابط!', 'success');
      setTimeout(() => this.copied.set(false), 2000);
    } catch { this.ui.showToast('تعذّر النسخ', 'error'); }
  }

  toggleShare(): void { this.showShare.update((v) => !v); }

  shareTo(platform: string): void {
    const url = encodeURIComponent(this.profileUrl());
    const name = encodeURIComponent(this.profile()?.displayName || '');
    const maps: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${name}&url=${url}`,
      whatsapp: `https://wa.me/?text=${name}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${name}`,
    };
    window.open(maps[platform], '_blank', 'noopener');
  }
}
