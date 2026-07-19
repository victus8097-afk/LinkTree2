import { Component, inject } from '@angular/core';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of ui.toasts(); track toast.id) {
        <div
          class="toast toast--{{ toast.type }}"
          (click)="ui.dismissToast(toast.id)"
          role="alert"
        >
          <span class="toast__icon">
            @if (toast.type === 'success') { ✔ }
            @else if (toast.type === 'error') { ✕ }
            @else { ℹ }
          </span>
          <span class="toast__msg">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        bottom: 1.5rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        pointer-events: none;
      }

      .toast {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.75rem 1.2rem;
        border-radius: 14px;
        background: var(--surface);
        border: 1px solid var(--border);
        color: var(--text);
        font-weight: 600;
        font-size: 0.9rem;
        box-shadow: 0 12px 40px color-mix(in srgb, #0b0617 40%, transparent);
        pointer-events: auto;
        cursor: pointer;
        animation: toastIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        max-width: 380px;
      }

      .toast--success {
        border-color: color-mix(in srgb, #2ecc71 50%, var(--border));
      }

      .toast--error {
        border-color: color-mix(in srgb, #ff6b6b 50%, var(--border));
      }

      .toast__icon {
        font-size: 1rem;
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        display: inline-grid;
        place-items: center;
        border-radius: 50%;
        font-weight: 800;
      }

      .toast--success .toast__icon {
        background: color-mix(in srgb, #2ecc71 25%, transparent);
        color: #2ecc71;
      }

      .toast--error .toast__icon {
        background: color-mix(in srgb, #ff6b6b 25%, transparent);
        color: #ff6b6b;
      }

      .toast--info .toast__icon {
        background: color-mix(in srgb, var(--brand) 25%, transparent);
        color: var(--brand);
      }

      @keyframes toastIn {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @media (max-width: 480px) {
        .toast {
          max-width: 90vw;
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  readonly ui = inject(UiService);
}
