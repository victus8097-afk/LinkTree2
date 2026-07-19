import { Component, OnInit, inject, signal, computed } from '@angular/core';
<<<<<<< HEAD
=======
import { FormsModule } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { UiService } from '../../core/services/ui.service';
<<<<<<< HEAD
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
=======
import { Profile, PROFILE_TEMPLATES } from '../../core/models/profile.model';
import { Link } from '../../core/models/link.model';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

interface LinkWithIcon extends Link { icon: string; iconType: 'brand'|'custom'; domain: string; }

@Component({
  selector: 'app-public-profile',
  imports: [RouterLink, FormsModule, SkeletonComponent],
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.scss',
})
export class PublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profiles = inject(ProfileService);
  private readonly linksService = inject(LinkService);
  private readonly ui = inject(UiService);
<<<<<<< HEAD

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
=======
  private readonly titleSvc = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  readonly profile = signal<Profile|null>(null); readonly links = signal<Link[]>([]);
  readonly loading = signal(true); readonly notFound = signal(false);
  readonly error = signal<string|null>(null);
  readonly password = signal(''); readonly passwordRequired = signal(false); readonly passwordError = signal(false);
  readonly showShare = signal(false); readonly copied = signal(false);

  readonly activeTemplate = computed(() => { const p = this.profile(); return p?.template ? PROFILE_TEMPLATES.find(t => t.id === p.template) : null; });
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2

  readonly sortedLinks = computed<LinkWithIcon[]>(() =>
    [...this.links()].sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(l => ({ ...l, ...this.getLinkIcon(l.url, l.title), domain: this.getDomain(l.url) }))
  );

<<<<<<< HEAD
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
=======
  readonly profileUrl = computed(() => { const h = this.profile()?.handle; return h ? `${window.location.origin}/${h}` : window.location.origin; });
  readonly qrCodeUrl = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.profileUrl())}&bgcolor=0b0617&color=a855f7`);

  private SOCIAL: Record<string,{pattern:RegExp;icon:string}> = {
    instagram:{pattern:/instagram\.com|insta\.gr/i,icon:'📷'}, twitter:{pattern:/twitter\.com|x\.com/i,icon:'𝕏'},
    youtube:{pattern:/youtube\.com|youtu\.be/i,icon:'▶️'}, tiktok:{pattern:/tiktok\.com/i,icon:'🎵'},
    snapchat:{pattern:/snapchat\.com/i,icon:'👻'}, linkedin:{pattern:/linkedin\.com/i,icon:'💼'},
    github:{pattern:/github\.com/i,icon:'🐙'}, behance:{pattern:/behance\.net/i,icon:'🎨'},
    dribbble:{pattern:/dribbble\.com/i,icon:'🏀'}, telegram:{pattern:/t\.me|telegram\.me/i,icon:'📩'},
    whatsapp:{pattern:/wa\.me|whatsapp\.com/i,icon:'💬'}, facebook:{pattern:/facebook\.com|fb\.com/i,icon:'📘'},
    spotify:{pattern:/spotify\.com/i,icon:'🎧'}, medium:{pattern:/medium\.com/i,icon:'📝'},
    twitch:{pattern:/twitch\.tv/i,icon:'🎮'}, discord:{pattern:/discord\.gg|discord\.com/i,icon:'💬'},
    email:{pattern:/^mailto:/i,icon:'📧'}, phone:{pattern:/^tel:/i,icon:'📞'},
  };

  getLinkIcon(url:string,title:string):{icon:string;iconType:'brand'|'custom'} {
    const lu=url.toLowerCase(), lt=title.toLowerCase();
    for (const [,c] of Object.entries(this.SOCIAL)) if (c.pattern.test(lu)||c.pattern.test(lt)) return {icon:c.icon,iconType:'brand'};
    return {icon:'🔗',iconType:'custom'};
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
  }
  initial(n:string):string { return (n||'؟').trim().charAt(0)||'؟'; }
  getDomain(url:string):string { try { return new URL(url).hostname.replace('www.',''); } catch { return ''; } }
  getProfileImage():string|null { return this.profile()?.avatarUrl ?? null; }
  getCoverImage():string|null { return this.profile()?.coverUrl ?? null; }

<<<<<<< HEAD
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
=======
  async ngOnInit() { const h=this.route.snapshot.paramMap.get('handle')??''; if(!h){this.notFound.set(true);this.loading.set(false);return;} await this.load(h); }
  async reload() { const h=this.route.snapshot.paramMap.get('handle')??''; if(!h){this.notFound.set(true);this.loading.set(false);return;} await this.load(h); }

  async load(handle:string) {
    this.loading.set(true); this.error.set(null);
    try {
      const profile = await this.profiles.getByHandle(handle);
      if (!profile) { this.notFound.set(true); this.loading.set(false); return; }
      if (profile.password) { this.profile.set(profile); this.passwordRequired.set(true); this.loading.set(false); return; }
      await this.loadProfileData(profile);
    } catch { this.error.set('حدث خطأ.'); this.loading.set(false); }
  }

  async unlock() { const p=this.profile(); if(!p||this.password()!==p.password){this.passwordError.set(true);return;} this.passwordError.set(false); this.passwordRequired.set(false); this.loading.set(true); await this.loadProfileData(p); }

  async loadProfileData(profile:Profile) {
    this.profile.set(profile);
    const t = profile.title || profile.displayName;
    this.titleSvc.setTitle(`${t} | وصلة`);
    this.meta.updateTag({name:'description',content:profile.bio||`${t} على وصلة`});
    this.meta.updateTag({property:'og:title',content:`${t} | وصلة`});
    this.meta.updateTag({property:'og:description',content:profile.bio||`صفحة ${t} على وصلة`});
    this.meta.updateTag({property:'og:url',content:this.profileUrl()});
    this.injectJsonLd(profile);
    if (profile.css) this.injectCustomCss(profile.css);
    const links = await this.linksService.listByHandle(profile.handle);
    this.links.set(links);
    this.loading.set(false);
  }

  private injectJsonLd(p:Profile) {
    const head = this.doc.head;
    head.querySelector('script[type="application/ld+json"]')?.remove();
    const ld = {
      '@context':'https://schema.org','@type':'Person',
      name:p.displayName, description:p.bio, url:this.profileUrl(),
      sameAs: this.links().map(l=>l.url),
    };
    const s = this.doc.createElement('script') as HTMLScriptElement;
    s.type='application/ld+json'; s.textContent=JSON.stringify(ld);
    head.appendChild(s);
  }

  private injectCustomCss(css:string) {
    const head = this.doc.head;
    head.querySelector('style[data-wasla-css]')?.remove();
    const s = this.doc.createElement('style') as HTMLStyleElement;
    s.setAttribute('data-wasla-css',''); s.textContent = css;
    head.appendChild(s);
  }

  async trackClick(link:Link) { try { await this.linksService.trackClick(link.id); } catch {} }
  async copyProfileLink() { try { await navigator.clipboard.writeText(this.profileUrl()); this.copied.set(true); this.ui.showToast('تم نسخ الرابط!','success'); setTimeout(()=>this.copied.set(false),2000); } catch { this.ui.showToast('تعذّر النسخ','error'); } }
  toggleShare() { this.showShare.update(v=>!v); }
  shareTo(p:string) {
    const url=encodeURIComponent(this.profileUrl()), name=encodeURIComponent(this.profile()?.displayName||'');
    const m:Record<string,string>={twitter:`https://twitter.com/intent/tweet?text=${name}&url=${url}`,whatsapp:`https://wa.me/?text=${name}%20${url}`,telegram:`https://t.me/share/url?url=${url}&text=${name}`};
    window.open(m[p],'_blank','noopener');
  }
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
}
