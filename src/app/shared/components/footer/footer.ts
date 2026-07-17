import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <span class="brand__mark">🔗</span>
          <span class="brand__name">وصلة</span>
          <p class="footer__tag">اجمع كل روابطك ومنصاتك في صفحة واحدة أنيقة.</p>
        </div>
        <nav class="footer__links" aria-label="روابط التذييل">
          <a routerLink="/" [fragment]="'features'">المميزات</a>
          <a routerLink="/" [fragment]="'how'">كيفية العمل</a>
          <a routerLink="/onboarding">أنشئ صفحتك</a>
        </nav>
      </div>
      <div class="footer__bottom">
        <span>© {{ year }} وصلة — جميع الحقوق محفوظة.</span>
        <span class="footer__made">صُنع بحب 💜 لربط المحتوى العربي</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        border-top: 1px solid var(--border);
        background: var(--surface);
        margin-top: 4rem;
      }
      .footer__inner {
        max-width: 1120px;
        margin: 0 auto;
        padding: 2.5rem 1.25rem 1.5rem;
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        justify-content: space-between;
      }
      .footer__brand {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 320px;
      }
      .brand__name {
        font-weight: 800;
        font-size: 1.4rem;
        background: var(--gradient);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .footer__tag {
        color: var(--muted);
        line-height: 1.7;
        margin: 0;
      }
      .footer__links {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .footer__links a {
        color: var(--muted);
        text-decoration: none;
        font-weight: 600;
        transition: color 0.2s ease;
      }
      .footer__links a:hover {
        color: var(--brand);
      }
      .footer__bottom {
        border-top: 1px solid var(--border);
        max-width: 1120px;
        margin: 0 auto;
        padding: 1.1rem 1.25rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: space-between;
        color: var(--muted);
        font-size: 0.85rem;
      }
    `,
  ],
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
