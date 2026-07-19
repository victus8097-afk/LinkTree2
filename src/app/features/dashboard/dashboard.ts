<<<<<<< HEAD
import { Component, OnInit, inject, signal, computed } from '@angular/core';
=======
import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';
<<<<<<< HEAD
import { Profile } from '../../core/models/profile.model';
import { Link } from '../../core/models/link.model';

interface LinkWithEdit extends Link {
  _editing?: boolean;
  _editTitle?: string;
  _editUrl?: string;
  _dragOver?: boolean;
=======
import { Profile, PROFILE_TEMPLATES } from '../../core/models/profile.model';
import { Link, LINK_CATEGORIES } from '../../core/models/link.model';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton';
import { CountUpComponent } from '../../shared/components/count-up/count-up';

interface LinkWithEdit extends Link {
  _editing?: boolean; _editTitle?: string; _editUrl?: string; _editCategory?: string;
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
}

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, SkeletonComponent, CountUpComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  readonly profiles = inject(ProfileService);
  readonly linksService = inject(LinkService);
  readonly auth = inject(AuthService);
  readonly ui = inject(UiService);
  private readonly router = inject(Router);

  readonly profile = signal<Profile | null>(null);
  readonly links = signal<LinkWithEdit[]>([]);
<<<<<<< HEAD
  readonly loading = signal(true);

  readonly editMode = signal(false);
  readonly editName = signal('');
  readonly editBio = signal('');
  readonly editAvatarUrl = signal('');
  readonly editThemeColor = signal('');
  readonly editBgColor = signal('');
=======
  readonly loading = signal(true); readonly skeleton = signal(true);

  // edit
  readonly editMode = signal(false); readonly editName = signal(''); readonly editBio = signal('');
  readonly editAvatarUrl = signal(''); readonly editCoverUrl = signal('');
  readonly editThemeColor = signal(''); readonly editBgColor = signal('');
  readonly editTemplate = signal(''); readonly editPassword = signal('');
  readonly editCustomTitle = signal(''); readonly editCustomCss = signal('');
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
  readonly savingProfile = signal(false);

  // links
  readonly newTitle = signal(''); readonly newUrl = signal(''); readonly newCategory = signal('custom');
  readonly adding = signal(false); readonly linkError = signal<string | null>(null); readonly copied = signal(false);

<<<<<<< HEAD
  // إحصائيات النقرات
  readonly clickStats = signal<Record<string, number>>({});
  readonly showAnalytics = signal(false);

  // إعادة ترتيب بالسحب
  private dragIdx: number | null = null;

  readonly profileLink = computed(() => {
    const handle = this.profile()?.handle;
    if (!handle) return window.location.origin;
    return `${window.location.origin}/${handle}`;
  });

  readonly qrCodeUrl = computed(() => {
    const url = encodeURIComponent(this.profileLink());
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${url}&bgcolor=140d24&color=a855f7`;
  });

  readonly totalClicks = computed(() => {
    const stats = this.clickStats();
    return Object.values(stats).reduce((sum, c) => sum + c, 0);
  });

  async ngOnInit(): Promise<void> {
    await this.load();
  }
=======
  // analytics
  readonly clickStats = signal<Record<string, number>>({}); readonly showAnalytics = signal(false);
  readonly activeCategory = signal<string>('all'); readonly searchQuery = signal('');
  private dragIdx: number | null = null;
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2

  readonly templates = PROFILE_TEMPLATES; readonly categories = LINK_CATEGORIES;

  readonly profileLink = computed(() => { const h = this.profile()?.handle; return h ? `${window.location.origin}/${h}` : window.location.origin; });
  readonly qrCodeUrl = computed(() => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.profileLink())}&bgcolor=140d24&color=a855f7`);

  readonly filteredLinks = computed(() => {
    let list = [...this.links()].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    const cat = this.activeCategory(); if (cat !== 'all') list = list.filter((l) => l.category === cat);
    const q = this.searchQuery().trim().toLowerCase();
    if (q) list = list.filter((l) => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q));
    return list;
  });

  readonly totalClicks = computed(() => Object.values(this.clickStats()).reduce((s, c) => s + c, 0));
  readonly categoryCounts = computed(() => { const m: Record<string, number> = {}; for (const l of this.links()) { const c = l.category || 'custom'; m[c] = (m[c] || 0) + 1; } return m; });
  readonly views = computed(() => this.profile()?.views ?? 0);

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true); this.skeleton.set(true);
    const mine = await this.profiles.getMine(); this.profile.set(mine);
    if (mine) {
      const list = await this.linksService.listByProfile(mine.id);
<<<<<<< HEAD
      this.links.set(list.map((l) => ({ ...l })));
      this.editAvatarUrl.set(mine.avatarUrl || '');
      this.editThemeColor.set(mine.themeColor || '');
      this.editBgColor.set(mine.bgColor || '');
=======
      this.links.set(list.map((l) => ({ ...l, category: l.category || 'custom', pinned: l.pinned || false })));
      this.editAvatarUrl.set(mine.avatarUrl || ''); this.editCoverUrl.set(mine.coverUrl || '');
      this.editThemeColor.set(mine.themeColor || ''); this.editBgColor.set(mine.bgColor || '');
      this.editTemplate.set(mine.template || ''); this.editPassword.set(mine.password || '');
      this.editCustomTitle.set(mine.title || ''); this.editCustomCss.set(mine.css || '');
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
      this.clickStats.set(this.linksService.getClickStats(mine.id));
    }
    await new Promise((r) => setTimeout(r, 400)); this.skeleton.set(false); this.loading.set(false);
  }

<<<<<<< HEAD
  /** لعرض أول حرف */
  initial(name: string): string {
    return (name || '؟').trim().charAt(0) || '؟';
  }

  // ===== نسخ الرابط =====
  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profileLink());
      this.copied.set(true);
      this.ui.showToast('تم نسخ الرابط!', 'success');
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.ui.showToast('تعذّر النسخ', 'error');
    }
  }

  // ===== تحرير الملف الشخصي =====
  openEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.editName.set(p.displayName);
    this.editBio.set(p.bio);
    this.editAvatarUrl.set(p.avatarUrl || '');
    this.editThemeColor.set(p.themeColor || '');
    this.editBgColor.set(p.bgColor || '');
    this.editMode.set(true);
  }
=======
  @HostListener('window:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.getElementById('link-search')?.focus(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); document.getElementById('new-link-title')?.focus(); }
    if (e.key === 'Escape' && this.editMode()) this.cancelEdit();
  }

  initial(name: string): string { return (name || '؟').trim().charAt(0) || '؟'; }
  getDomain(url: string): string { try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; } }
  getCatLabel(id: string): string { return this.categories.find((c) => c.id === id)?.label || 'أخرى'; }
  getCatIcon(id: string): string { return this.categories.find((c) => c.id === id)?.icon || '🔗'; }
  getTemplateLabel(id: string): string { return this.templates.find((t) => t.id === id)?.label || '—'; }

  async copyLink() { try { await navigator.clipboard.writeText(this.profileLink()); this.copied.set(true); this.ui.showToast('تم نسخ الرابط!', 'success'); setTimeout(() => this.copied.set(false), 2000); } catch { this.ui.showToast('تعذّر النسخ', 'error'); } }

  async exportProfile() {
    const p = this.profile(); if (!p) return;
    const data = { profile: p, links: this.links().map((l) => ({ title: l.title, url: l.url, category: l.category, pinned: l.pinned })) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `wasla-${p.handle}.json`; a.click(); URL.revokeObjectURL(u);
    this.ui.showToast('تم تصدير البيانات!', 'success');
  }

  openEdit() { const p = this.profile(); if (!p) return; this.editName.set(p.displayName); this.editBio.set(p.bio); this.editAvatarUrl.set(p.avatarUrl || ''); this.editCoverUrl.set(p.coverUrl || ''); this.editThemeColor.set(p.themeColor || ''); this.editBgColor.set(p.bgColor || ''); this.editTemplate.set(p.template || ''); this.editPassword.set(p.password || ''); this.editCustomTitle.set(p.title || ''); this.editCustomCss.set(p.css || ''); this.editMode.set(true); }
  cancelEdit() { this.editMode.set(false); }

  selectTemplate(id: string) { const t = this.templates.find((x) => x.id === id); if (t) { this.editThemeColor.set(t.color); this.editBgColor.set(t.bg); this.editTemplate.set(t.id); } }

  async saveProfile() {
    const p = this.profile(); if (!p) return; this.savingProfile.set(true);
    try {
      const updated = await this.profiles.update({ ...p, displayName: this.editName().trim(), bio: this.editBio().trim(), avatarUrl: this.editAvatarUrl().trim() || null, coverUrl: this.editCoverUrl().trim() || null, themeColor: this.editThemeColor().trim() || null, bgColor: this.editBgColor().trim() || null, template: this.editTemplate().trim() || null, password: this.editPassword().trim() || null, title: this.editCustomTitle().trim() || null, css: this.editCustomCss().trim() || null });
      this.profile.set(updated); this.editMode.set(false); this.ui.showToast('تم حفظ التغييرات!', 'success');
    } catch { this.ui.showToast('تعذّر الحفظ', 'error'); } finally { this.savingProfile.set(false); }
  }

  isValidUrl(value: string): boolean { const v = value.trim(); return /^https?:\/\//i.test(v) || /^[^\s/]+\.[^\s/]+/.test(v); }
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2

  async addLink() {
    const p = this.profile(); if (!p) return; const title = this.newTitle().trim(); const url = this.newUrl().trim();
    if (!title || !url) { this.linkError.set('الرجاء تعبئة العنوان والرابط.'); return; }
    if (!this.isValidUrl(url)) { this.linkError.set('الرجاء إدخال رابط صحيح.'); return; }
    this.adding.set(true); this.linkError.set(null);
    try {
<<<<<<< HEAD
      const updated = await this.profiles.update({
        ...p,
        displayName: this.editName().trim(),
        bio: this.editBio().trim(),
        avatarUrl: this.editAvatarUrl().trim() || null,
        themeColor: this.editThemeColor().trim() || null,
        bgColor: this.editBgColor().trim() || null,
      });
      this.profile.set(updated);
      this.editMode.set(false);
      this.ui.showToast('تم حفظ التغييرات!', 'success');
    } catch {
      this.ui.showToast('تعذّر الحفظ', 'error');
    } finally {
      this.savingProfile.set(false);
    }
  }

  // ===== إضافة رابط =====
  isValidUrl(value: string): boolean {
    const v = value.trim();
    if (/^https?:\/\//i.test(v)) return true;
    return /^[^\s/]+\.[^\s/]+/.test(v);
  }
=======
      const created = await this.linksService.add(p.id, { title, url, category: this.newCategory() });
      this.links.update((list) => [...list, { ...created, category: created.category || 'custom', pinned: false }]);
      this.newTitle.set(''); this.newUrl.set(''); this.newCategory.set('custom');
      this.ui.showToast('تمت إضافة الرابط!', 'success'); document.getElementById('new-link-title')?.focus();
    } catch (err: unknown) { this.linkError.set(err instanceof Error ? err.message : 'تعذّر إضافة الرابط.'); } finally { this.adding.set(false); }
  }

  startEditLink(link: LinkWithEdit) { link._editing = true; link._editTitle = link.title; link._editUrl = link.url; link._editCategory = link.category || 'custom'; }
  cancelEditLink(link: LinkWithEdit) { link._editing = false; }
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2

  async saveEditLink(link: LinkWithEdit) {
    if (!link._editTitle?.trim() || !link._editUrl?.trim()) { this.ui.showToast('املأ العنوان والرابط.', 'error'); return; }
    try {
<<<<<<< HEAD
      const created = await this.linksService.add(p.id, { title, url });
      this.links.update((list) => [...list, { ...created }]);
      this.newTitle.set('');
      this.newUrl.set('');
      this.ui.showToast('تمت إضافة الرابط!', 'success');
    } catch (err: unknown) {
      this.linkError.set(err instanceof Error ? err.message : 'تعذّر إضافة الرابط.');
    } finally {
      this.adding.set(false);
    }
  }

  // ===== تحرير رابط ضمن القائمة =====
  startEditLink(link: LinkWithEdit): void {
    link._editing = true;
    link._editTitle = link.title;
    link._editUrl = link.url;
  }

  cancelEditLink(link: LinkWithEdit): void {
    link._editing = false;
  }

  async saveEditLink(link: LinkWithEdit): Promise<void> {
    if (!link._editTitle?.trim() || !link._editUrl?.trim()) {
      this.ui.showToast('الرجاء تعبئة العنوان والرابط.', 'error');
      return;
    }
    try {
      const updated = await this.linksService.update({
        ...link,
        title: link._editTitle.trim(),
        url: link._editUrl.trim(),
      });
      this.links.update((list) =>
        list.map((l) => (l.id === updated.id ? { ...updated } : l)),
      );
      link._editing = false;
      this.ui.showToast('تم تحديث الرابط!', 'success');
    } catch {
      this.ui.showToast('تعذّر تحديث الرابط.', 'error');
    }
  }

  // ===== حذف رابط =====
  async removeLink(id: string): Promise<void> {
    this.links.update((list) => list.filter((l) => l.id !== id));
    try {
      await this.linksService.remove(id);
      this.ui.showToast('تم حذف الرابط.', 'info');
    } catch {
      this.linkError.set('تعذّر حذف الرابط.');
      this.load();
    }
  }

  // ===== السحب والإفلات =====
  onDragStart(index: number): void {
    this.dragIdx = index;
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (this.dragIdx === null || this.dragIdx === index) return;
    this.links.update((list) => {
      const arr = [...list];
      const [moved] = arr.splice(this.dragIdx!, 1);
      arr.splice(index, 0, moved);
      return arr;
    });
    this.dragIdx = index;
  }

  onDragEnd(): void {
    this.dragIdx = null;
    this.persistOrder();
  }

  moveLink(id: string, direction: 'up' | 'down'): void {
    this.links.update((list) => {
      const arr = [...list];
      const idx = arr.findIndex((l) => l.id === id);
      if (idx === -1) return arr;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
    this.persistOrder();
  }

  private async persistOrder(): Promise<void> {
    const p = this.profile();
    if (!p) return;
    const orderedIds = this.links().map((l) => l.id);
    try {
      await this.linksService.reorder(p.id, orderedIds);
    } catch {
      // ترتيب محلي يكفي
    }
  }

  // ===== تحليلات =====
  toggleAnalytics(): void {
    this.showAnalytics.update((v) => !v);
    if (this.showAnalytics()) {
      const p = this.profile();
      if (p) this.clickStats.set(this.linksService.getClickStats(p.id));
    }
  }

  getDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  // ===== تسجيل الخروج =====
  async logout(): Promise<void> {
    await this.auth.signOut();
    this.ui.showToast('تم تسجيل الخروج.', 'info');
    this.router.navigate(['/']);
  }
=======
      const updated = await this.linksService.update({ ...link, title: link._editTitle.trim(), url: link._editUrl.trim(), category: link._editCategory || 'custom' });
      this.links.update((list) => list.map((l) => l.id === updated.id ? { ...updated, category: updated.category || 'custom' } : l));
      link._editing = false; this.ui.showToast('تم تحديث الرابط!', 'success');
    } catch { this.ui.showToast('تعذّر تحديث الرابط.', 'error'); }
  }

  async togglePin(link: LinkWithEdit) {
    const updated = await this.linksService.update({ ...link, pinned: !link.pinned });
    this.links.update((list) => list.map((l) => l.id === updated.id ? { ...updated } : l));
    this.ui.showToast(updated.pinned ? 'تم تثبيت الرابط 📌' : 'تم إلغاء التثبيت', 'info');
  }

  async removeLink(id: string) { this.links.update((list) => list.filter((l) => l.id !== id)); try { await this.linksService.remove(id); this.ui.showToast('تم حذف الرابط.', 'info'); } catch { this.linkError.set('تعذّر حذف الرابط.'); this.load(); } }

  onDragStart(index: number) { this.dragIdx = index; }
  onDragOver(event: DragEvent, index: number) { event.preventDefault(); if (this.dragIdx === null || this.dragIdx === index) return; this.links.update((list) => { const arr = [...list]; const [moved] = arr.splice(this.dragIdx!, 1); arr.splice(index, 0, moved); return arr; }); this.dragIdx = index; }
  onDragEnd() { this.dragIdx = null; this.persistOrder(); }
  moveLink(id: string, dir: 'up' | 'down') { this.links.update((list) => { const arr = [...list]; const idx = arr.findIndex((l) => l.id === id); if (idx === -1) return arr; const n = dir === 'up' ? idx - 1 : idx + 1; if (n < 0 || n >= arr.length) return arr; [arr[idx], arr[n]] = [arr[n], arr[idx]]; return arr; }); this.persistOrder(); }
  private async persistOrder() { const p = this.profile(); if (!p) return; try { await this.linksService.reorder(p.id, this.links().map((l) => l.id)); } catch {} }

  toggleAnalytics() { this.showAnalytics.update((v) => !v); if (this.showAnalytics()) { const p = this.profile(); if (p) this.clickStats.set(this.linksService.getClickStats(p.id)); } }
  setActiveCategory(id: string) { this.activeCategory.set(id); }

  async logout() { await this.auth.signOut(); this.ui.showToast('تم تسجيل الخروج.', 'info'); this.router.navigate(['/']); }
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
}
