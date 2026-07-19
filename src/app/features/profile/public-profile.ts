import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { UiService } from '../../core/services/ui.service';
import { Profile, PROFILE_TEMPLATES } from '../../core/models/profile.model';
import { Link } from '../../core/models/link.model';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';

interface LinkWithIcon extends Link { icon: string; iconType: 'brand'|'custom'; domain: string; }

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
  private readonly titleSvc = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  readonly profile = signal<Profile|null>(null); readonly links = signal<Link[]>([]);
  readonly loading = signal(true); readonly notFound = signal(false);
  readonly error = signal<string|null>(null);
  readonly password = signal(''); readonly passwordRequired = signal(false); readonly passwordError = signal(false);
  readonly showShare = signal(false); readonly copied = signal(false);

  readonly activeTemplate = computed(() => { const p = this.profile(); return p?.template ? PROFILE_TEMPLATES.find(t => t.id === p.template) : null; });

  readonly sortedLinks = computed<LinkWithIcon[]>(() =>
    [...this.links()].sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(l => ({ ...l, ...this.getLinkIcon(l.url, l.title), domain: this.getDomain(l.url) }))
  );

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
  }
  initial(n:string):string { return (n||'؟').trim().charAt(0)||'؟'; }
  getDomain(url:string):string { try { return new URL(url).hostname.replace('www.',''); } catch { return ''; } }
  getProfileImage():string|null { return this.profile()?.avatarUrl ?? null; }
  getCoverImage():string|null { return this.profile()?.coverUrl ?? null; }

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
}
