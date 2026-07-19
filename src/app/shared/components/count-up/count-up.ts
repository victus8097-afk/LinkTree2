import { Component, input, signal, effect, ElementRef, inject, OnChanges } from '@angular/core';

@Component({
  selector: 'app-count-up',
  standalone: true,
  template: `<span>{{ display() }}</span>`,
})
export class CountUpComponent {
  readonly end = input(0);
  readonly duration = input(1500);
  readonly prefix = input('');
  readonly suffix = input('');

  readonly display = signal('0');

  private el = inject(ElementRef);
  private animated = false;
  private observer: IntersectionObserver | null = null;

  constructor() {
    effect(() => {
      const target = this.end();
      if (target > 0 && !this.animated) {
        this.setupObserver();
      }
    });
  }

  private setupObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.animate();
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          this.animate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  private animate(): void {
    this.animated = true;
    const target = this.end();
    const dur = this.duration();
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      this.display.set(this.prefix() + Math.round(eased * target) + this.suffix());
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }
}
