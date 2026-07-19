import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div
      class="skel"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="radius()"
      [class.skel--circle]="circle()"
      [class.skel--text]="variant() === 'text'"
      [class.skel--card]="variant() === 'card'"
      aria-hidden="true"
    >
      @if (variant() === 'card') {
        <div class="skel__line" style="width:60%"></div>
        <div class="skel__line" style="width:80%"></div>
        <div class="skel__line" style="width:40%"></div>
      }
    </div>
  `,
  styles: [
    `
      .skel {
        background: linear-gradient(
          90deg,
          var(--surface-2) 25%,
          color-mix(in srgb, var(--brand) 15%, var(--surface-2)) 50%,
          var(--surface-2) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
        display: block;
      }

      .skel--circle {
        width: 48px;
        height: 48px;
        border-radius: 50%;
      }

      .skel--text {
        height: 14px;
        border-radius: 7px;
        width: 100%;
      }

      .skel--card {
        padding: 1.25rem;
        border-radius: 16px;
        display: grid;
        gap: 0.6rem;
        width: auto;
        height: auto;
        min-height: 100px;
      }

      .skel__line {
        height: 12px;
        border-radius: 6px;
        background: color-mix(in srgb, var(--border) 60%, transparent);
        animation: shimmer 1.5s ease-in-out infinite;
        background-size: 200% 100%;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `,
  ],
})
export class SkeletonComponent {
  readonly width = input('100%');
  readonly height = input('16px');
  readonly radius = input('8px');
  readonly circle = input(false);
  readonly variant = input<'text' | 'card' | 'block'>('block');
}
