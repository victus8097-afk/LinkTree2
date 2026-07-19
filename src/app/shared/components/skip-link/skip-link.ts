import { Component } from '@angular/core';

@Component({
  selector: 'app-skip-link',
  standalone: true,
  template: `<a class="skip" href="#main-content">تخطي إلى المحتوى</a>`,
  styles: [
    `
      .skip {
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--brand);
        color: #fff;
        padding: 0.6rem 1.4rem;
        border-radius: 0 0 12px 12px;
        z-index: 10000;
        font-weight: 700;
        text-decoration: none;
        transition: top 0.2s ease;
      }
      .skip:focus {
        top: 0;
      }
    `,
  ],
})
export class SkipLinkComponent {}
