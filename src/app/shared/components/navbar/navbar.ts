import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { UiService } from '../../../core/services/ui.service';
import { Profile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  template: `
    <header class="nav">
      <div class="nav__inner">
        <a class="brand" routerLink="/" aria-label="وصلة - الصفحة الرئيسية">
          <span class="brand__mark">🔗</span>
          <span class="brand__name">وصلة</span>
        </a>

        <nav class="nav__links" aria-label="روابط سريعة">
          <a routerLink="/" fragment="features">المميزات</a>
          <a routerLink="/" fragment="how">كيفية العمل</a>
        </nav>

        <div class="nav__actions">
          @if (auth.isAuthenticated()) {
            @if (profile(); as p) {
              <div class="nav__user">
                <span class="avatar avatar--sm">{{ initial(p.displayName) }}</span>
                <span class="nav__user-name">{{ p.displayName }}</span>
              </div>
            }
            <a class="btn btn--ghost btn--sm" routerLink="/dashboard">لوحة التحكم</a>
            <button class="btn btn--ghost btn--sm" type="button" (click)="logout()">خروج</button>
          } @else {
            <button class="btn btn--ghost btn--sm" type="button" (click)="ui.openAuthModal()">دخول</button>
            <button class="btn btn--primary btn--sm" type="button" (click)="ui.openAuthModal()">
              أنشئ صفحتك
            </button>
          }

          <!-- Mobile menu toggle -->
          <button class="btn-menu" type="button" (click)="toggleMenu()" aria-label="القائمة">
            <span [class.open]="menuOpen()">☰</span>
          </button>
        </div>
      </div>

      <!-- Mobile dropdown -->
      @if (menuOpen()) {
        <div class="nav__mobile" (click)="menuOpen.set(false)">
          <a routerLink="/" fragment="features" (click)="menuOpen.set(false)">المميزات</a>
          <a routerLink="/" fragment="how" (click)="menuOpen.set(false)">كيفية العمل</a>
          @if (auth.isAuthenticated()) {
            <a routerLink="/dashboard" (click)="menuOpen.set(false)">لوحة التحكم</a>
            <button class="btn btn--ghost" type="button" (click)="logout()">خروج</button>
          } @else {
            <button class="btn btn--primary btn--block" type="button" (click)="openAuthAndClose()">
              أنشئ صفحتك
            </button>
          }
        </div>
      }
    </header>
  `,
  styles: [
    `
      .nav {
        position: sticky;
        top: 0;
        z-index: 50;
        background: color-mix(in srgb, var(--bg) 80%, transparent);
        backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--border);
      }
      .nav__inner {
        max-width: 1120px;
        margin: 0 auto;
        padding: 0.75rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 800;
        font-size: 1.35rem;
        color: var(--text);
        text-decoration: none;
        letter-spacing: -0.02em;
      }
      .brand__mark { font-size: 1.4rem; }
      .brand__name {
        background: var(--gradient);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .nav__links {
        display: flex;
        gap: 1.25rem;
        margin-inline-start: 1rem;
      }
      .nav__links a {
        color: var(--muted);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.92rem;
        transition: color 0.2s ease;
      }
      .nav__links a:hover { color: var(--text); }
      .nav__actions {
        margin-inline-start: auto;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .nav__user {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding-inline-end: 0.25rem;
      }
      .nav__user-name {
        font-weight: 700;
        color: var(--text);
        font-size: 0.92rem;
      }

      /* Mobile */
      .btn-menu {
        display: none;
        background: none;
        border: none;
        color: var(--text);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.25rem;
        line-height: 1;
        transition: transform 0.2s ease;
      }
      .btn-menu .open { transform: rotate(90deg); }

      .nav__mobile {
        display: none;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem 1.25rem;
        border-top: 1px solid var(--border);
        background: var(--surface);
      }
      .nav__mobile a {
        color: var(--text);
        text-decoration: none;
        font-weight: 600;
        padding: 0.5rem 0;
      }

      @media (max-width: 640px) {
        .nav__links { display: none; }
        .nav__user-name { display: none; }
        .btn-menu { display: block; }
        .nav__mobile { display: flex; }
        .nav__actions .btn--sm { padding: 0.4rem 0.7rem; font-size: 0.82rem; }
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly ui = inject(UiService);
  private readonly profiles = inject(ProfileService);
  private readonly router = inject(Router);

  readonly profile = signal<Profile | null>(null);
  readonly menuOpen = signal(false);

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.profiles.getMine().then((p) => this.profile.set(p));
    }
  }

  initial(name: string): string {
    return (name || '؟').trim().charAt(0) || '؟';
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  openAuthAndClose(): void {
    this.menuOpen.set(false);
    this.ui.openAuthModal();
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    this.profile.set(null);
    this.menuOpen.set(false);
    this.router.navigate(['/']);
  }
}
