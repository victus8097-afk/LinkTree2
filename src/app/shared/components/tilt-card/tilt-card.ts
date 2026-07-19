import { Component, input, ElementRef, inject, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-tilt-card',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      :host {
        display: block;
        transform-style: preserve-3d;
        perspective: 1000px;
        transition: transform 0.1s ease;
      }
    `,
  ],
})
export class TiltCardComponent {
  readonly maxTilt = input(10);
  readonly scale = input(1.02);

  private readonly el = inject(ElementRef);

  constructor() {
    afterNextRender(() => {
      const el = this.el.nativeElement as HTMLElement;
      el.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const tilt = this.maxTilt();
        el.style.transform = `rotateY(${x * tilt}deg) rotateX(${-y * tilt}deg) scale(${this.scale()})`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'rotateY(0) rotateX(0) scale(1)';
      });
    });
  }
}
