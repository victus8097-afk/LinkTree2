import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-auth-modal',
  imports: [FormsModule],
  template: `
    @if (ui.authModalOpen()) {
      <div
        class="overlay"
        (click)="onBackdrop($event)"
        role="dialog"
        aria-modal="true"
        aria-label="تسجيل الدخول"
      >
        <div class="card" (click)="$event.stopPropagation()">
          <button class="card__close" type="button" aria-label="إغلاق" (click)="close()">✕</button>

          <div class="card__head">
            <span class="card__icon">🔗</span>
            <h2>ادخل إلى وصلة</h2>
            <p>أدخل بريدك الإلكتروني لإرسال رابط دخول آمن — بدون كلمات مرور.</p>
          </div>

          @if (auth.message()?.type === 'success') {
            <div class="alert alert--success">
              <strong>✔ تم الإرسال!</strong>
              <p>{{ auth.message()?.text }}</p>
              @if (auth.debugLink(); as link) {
                <a class="debug-link" [href]="link" target="_blank" rel="noopener">
                  🔗 افتح رابط الدخول (للتطوير)
                </a>
              }
            </div>
          } @else {
            <form class="form" (ngSubmit)="submit()" #f="ngForm">
              <label class="field">
                <span>البريد الإلكتروني</span>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  placeholder="you@example.com"
                  required
                  autocomplete="email"
                  [disabled]="auth.loading()"
                />
              </label>

              @if (auth.message()?.type === 'error') {
                <div class="alert alert--error">{{ auth.message()?.text }}</div>
              }

              <button
                class="btn btn--primary btn--block"
                type="submit"
                [disabled]="auth.loading()"
              >
                @if (auth.loading()) {
                  <span class="spinner"></span> جارٍ الإرسال…
                } @else {
                  إرسال رابط الدخول
                }
              </button>
            </form>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        background: color-mix(in srgb, #0b0617 65%, transparent);
        backdrop-filter: blur(6px);
        display: grid;
        place-items: center;
        padding: 1.25rem;
        animation: fade 0.2s ease;
      }
      .card {
        position: relative;
        width: 100%;
        max-width: 420px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 22px;
        padding: 2rem 1.75rem;
        box-shadow: 0 30px 80px color-mix(in srgb, #0b0617 45%, transparent);
        animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .card__close {
        position: absolute;
        inset-inline-start: 1rem;
        top: 1rem;
        background: var(--surface-2);
        border: 1px solid var(--border);
        color: var(--muted);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        line-height: 1;
      }
      .card__head {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .card__icon {
        font-size: 2rem;
      }
      .card__head h2 {
        margin: 0.4rem 0 0.3rem;
        font-size: 1.4rem;
        color: var(--text);
      }
      .card__head p {
        color: var(--muted);
        font-size: 0.92rem;
        line-height: 1.6;
        margin: 0;
      }
      .alert p {
        margin: 0.35rem 0 0;
      }
      .debug-link {
        display: inline-block;
        margin-top: 0.75rem;
        color: var(--brand);
        font-weight: 700;
        font-size: 0.88rem;
        text-decoration: none;
        padding: 0.4rem 0.8rem;
        background: var(--surface-2);
        border-radius: 8px;
        border: 1px dashed var(--border);
        word-break: break-all;
      }
      .debug-link:hover {
        background: var(--bg);
      }
    `,
  ],
})
export class AuthModalComponent {
  readonly ui = inject(UiService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');

  close(): void {
    this.ui.closeAuthModal();
    this.auth.clearMessage();
    this.auth.debugLink.set(null);
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  async submit(): Promise<void> {
    if (!this.email().trim()) return;
    await this.auth.sendMagicLink(this.email());

    // في وضع العرض التجريبي (localStorage) يتم تسجيل الدخول فوراً.
    if (this.auth.user() && !this.auth.resendAvailable()) {
      this.email.set('');
      this.close();
      this.router.navigate(['/onboarding']);
    }
  }
}
