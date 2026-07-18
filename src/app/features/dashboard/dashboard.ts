import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { AuthService } from '../../core/services/auth.service';
import { Profile } from '../../core/models/profile.model';

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
  private readonly router = inject(Router);

  readonly profile = signal<Profile | null>(null);
  readonly links = signal<{ id: string; profileId: string; title: string; url: string; position: number }[]>([]);
  readonly loading = signal(true);

  readonly editMode = signal(false);
  readonly editName = signal('');
  readonly editBio = signal('');
  readonly editAvatarUrl = signal('');
  readonly savingProfile = signal(false);

  readonly newTitle = signal('');
  readonly newUrl = signal('');
  readonly adding = signal(false);
  readonly linkError = signal<string | null>(null);
  readonly copied = signal(false);

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    const mine = await this.profiles.getMine();
    this.profile.set(mine);
    if (mine) {
      const list = await this.linksService.listByProfile(mine.id);
      this.links.set(list);
      this.editAvatarUrl.set(mine.avatarUrl || '');
    }
    this.loading.set(false);
  }

  get profileLink(): string {
    const handle = this.profile()?.handle;
    if (!handle) return window.location.origin;
    return `${window.location.origin}/${handle}`;
  }

  initial(name: string): string {
    return (name || '؟').trim().charAt(0) || '؟';
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.profileLink);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.copied.set(false);
    }
  }

  openEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.editName.set(p.displayName);
    this.editBio.set(p.bio);
    this.editAvatarUrl.set(p.avatarUrl || '');
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
      });
      this.profile.set(updated);
      this.editMode.set(false);
    } finally {
      this.savingProfile.set(false);
    }
  }

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
      this.links.set([...this.links(), created]);
      this.newTitle.set('');
      this.newUrl.set('');
    } catch (err: unknown) {
      this.linkError.set(err instanceof Error ? err.message : 'تعذّر إضافة الرابط.');
    } finally {
      this.adding.set(false);
    }
  }

  async removeLink(id: string): Promise<void> {
    this.links.set(this.links().filter((l) => l.id !== id));
    try {
      await this.linksService.remove(id);
    } catch (err: unknown) {
      this.linkError.set(err instanceof Error ? err.message : 'تعذّر حذف الرابط.');
      this.load();
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/']);
  }
}
