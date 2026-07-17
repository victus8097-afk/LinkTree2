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
          <a routerLink="/" [fragment]="'features'">المميزات</a>
          <a routerLink="/" [fragment]="'how'">كيفية العمل</a>
        </nav>

        <div class="nav__actions">
          @if (auth.isAuthenticated()) {
            @if (profile(); as p) {
              <div class="nav__user">
                <span class="avatar avatar--sm">{{ initial(p.displayName) }}</span>
                <span class="nav__user-name">{{ p.displayName }}</span>
              </div>
            }
            <a class="btn btn--ghost" routerLink="/dashboard">لوحة التحكم</a>
            <button class="btn btn--ghost" type="button" (click)="logout()">خروج</button>
          } @else {
            <button class="btn btn--ghost" type="button" (click)="ui.openAuthModal()">دخول</button>
            <button class="btn btn--primary" type="button" (click)="ui.openAuthModal()">
              أنشئ صفحتك
            </button>
          }
        </div>
      </div>
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
        padding: 0.85rem 1.25rem;
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
      .brand__mark {
        font-size: 1.4rem;
      }
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
        transition: color 0.2s ease;
      }
      .nav__links a:hover {
        color: var(--text);
      }
      .nav__actions {
        margin-inline-start: auto;
        display: flex;
        align-items: center;
        gap: 0.6rem;
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
        font-size: 0.95rem;
      }
      .avatar--sm {
        width: 34px;
        height: 34px;
        font-size: 0.95rem;
      }
      @media (max-width: 640px) {
        .nav__links {
          display: none;
        }
        .nav__user-name {
          display: none;
        }
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

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.profiles.getMine().then((p) => this.profile.set(p));
    }
  }

  initial(name: string): string {
    return (name || '؟').trim().charAt(0) || '؟';
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
    this.profile.set(null);
    this.router.navigate(['/']);
  }
}
