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

        <nav class="footer__col" aria-label="المنصة">
          <strong>المنصة</strong>
          <a routerLink="/" fragment="features">المميزات</a>
          <a routerLink="/" fragment="how">كيفية العمل</a>
          <a routerLink="/" fragment="faq">الأسئلة الشائعة</a>
        </nav>

        <nav class="footer__col" aria-label="روابط">
          <strong>روابط</strong>
          <a routerLink="/">الرئيسية</a>
          <a href="https://github.com/victus8097-afk/LinkTree2" target="_blank" rel="noopener">GitHub</a>
        </nav>

        <nav class="footer__col" aria-label="قانوني">
          <strong>قانوني</strong>
          <a routerLink="/">الخصوصية</a>
          <a routerLink="/">الشروط</a>
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
        margin-top: auto;
      }
      .footer__inner {
        max-width: 1120px;
        margin: 0 auto;
        padding: 2.5rem 1.25rem 1.5rem;
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 2rem;
      }
      .footer__brand {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
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
        font-size: 0.9rem;
      }
      .footer__col {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .footer__col strong {
        color: var(--text);
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
      }
      .footer__col a {
        color: var(--muted);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.88rem;
        transition: color 0.2s ease;
      }
      .footer__col a:hover {
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

      @media (max-width: 640px) {
        .footer__inner {
          grid-template-columns: 1fr 1fr;
        }
      }
    `,
  ],
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
