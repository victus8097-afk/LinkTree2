import { Component, afterNextRender, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-confetti',
  standalone: true,
  template: `<canvas class="confetti-canvas" aria-hidden="true"></canvas>`,
  styles: [
    `
      .confetti-canvas {
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        width: 100vw;
        height: 100vh;
      }
    `,
  ],
})
export class ConfettiComponent {
  private readonly el = inject(ElementRef);

  constructor() {
    afterNextRender(() => this.launch());
  }

  private launch(): void {
    const canvas = this.el.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const colors = ['#a855f7', '#6366f1', '#2ecc71', '#f97316', '#ec4899', '#eab308', '#06b6d4', '#f3eefc'];
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; rotation: number; rotSpeed: number; shape: number }[] = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: 1.5 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.5 ? 0 : 1,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(frame * 0.02 + p.y * 0.01) * 0.5;
        p.y += p.vy;
        p.vy += 0.03;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - frame / 200);
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      frame++;
      if (frame < 160) requestAnimationFrame(animate);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.remove(); }
    };
    requestAnimationFrame(animate);
  }
}
