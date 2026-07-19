import { Component, input, signal } from '@angular/core';
import { SkeletonComponent } from '../skeleton/skeleton';

@Component({
  selector: 'app-image-loader',
  standalone: true,
  imports: [SkeletonComponent],
  template: `
    @if (!error()) {
      @if (!loaded() && placeholder()) {
        <app-skeleton [circle]="circle()" [width]="width()" [height]="height()" />
      }
      <img
        [src]="src()"
        [alt]="alt()"
        [class]="imgClass()"
        [style.width]="width()"
        [style.height]="height()"
        [style.border-radius]="radius()"
        [style.object-fit]="fit()"
        [class.hidden]="!loaded()"
        loading="lazy"
        (load)="loaded.set(true)"
        (error)="error.set(true)"
      />
    } @else if (fallback()) {
      <span [style.width]="width()" [style.height]="height()" class="fallback">{{ fallback() }}</span>
    }
  `,
  styles: [
    `
      :host { display: inline-block; position: relative; }
      .hidden { opacity: 0; position: absolute; }
      img { transition: opacity 0.3s ease; }
      .fallback {
        display: inline-grid; place-items: center;
        background: var(--surface-2); border-radius: 12px;
        color: var(--muted); font-weight: 700; font-size: 1.2rem;
      }
    `,
  ],
})
export class ImageLoaderComponent {
  readonly src = input.required<string>();
  readonly alt = input('');
  readonly width = input('auto');
  readonly height = input('auto');
  readonly circle = input(false);
  readonly radius = input('12px');
  readonly fit = input('cover');
  readonly imgClass = input('');
  readonly placeholder = input(true);
  readonly fallback = input('');

  readonly loaded = signal(false);
  readonly error = signal(false);
}
