import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';
import { Profile } from '../../core/models/profile.model';
import { Link } from '../../core/models/link.model';

interface LinkWithEdit extends Link {
  _editing?: boolean;
  _editTitle?: string;
  _editUrl?: string;
  _dragOver?: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule],
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
  readonly loading = signal(true);

  readonly editMode = signal(false);
  readonly editName = signal('');
  readonly editBio = signal('');
  readonly editAvatarUrl = signal('');
  readonly editThemeColor = signal('');
  readonly editBgColor = signal('');
  readonly savingProfile = signal(false);

  readonly newTitle = signal('');
  readonly newUrl = signal('');
  readonly adding = signal(false);
  readonly linkError = signal<string | null>(null);
  readonly copied = signal(false);

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

  async load(): Promise<void> {
    this.loading.set(true);
    const mine = await this.profiles.getMine();
    this.profile.set(mine);
    if (mine) {
      const list = await this.linksService.listByProfile(mine.id);
      this.links.set(list.map((l) => ({ ...l })));
      this.editAvatarUrl.set(mine.avatarUrl || '');
      this.editThemeColor.set(mine.themeColor || '');
      this.editBgColor.set(mine.bgColor || '');
      this.clickStats.set(this.linksService.getClickStats(mine.id));
    }
    this.loading.set(false);
  }

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

  cancelEdit(): void {
    this.editMode.set(false);
  }

  async saveProfile(): Promise<void> {
    const p = this.profile();
    if (!p) return;
    this.savingProfile.set(true);
    try {
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

  async addLink(): Promise<void> {
    const p = this.profile();
    if (!p) return;
    const title = this.newTitle().trim();
    const url = this.newUrl().trim();
    if (!title || !url) {
      this.linkError.set('الرجاء تعبئة العنوان والرابط.');
      return;
    }
    if (!this.isValidUrl(url)) {
      this.linkError.set('الرجاء إدخال رابط صحيح (مثل example.com).');
      return;
    }
    this.adding.set(true);
    this.linkError.set(null);
    try {
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
}
