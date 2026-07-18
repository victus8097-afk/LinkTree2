import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { UiService } from '../../core/services/ui.service';

type HandleStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';
type Step = 'details' | 'confirm';

@Component({
  selector: 'app-onboarding',
  imports: [FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class OnboardingComponent {
  readonly profiles = inject(ProfileService);
  readonly auth = inject(AuthService);
  readonly ui = inject(UiService);
  private readonly router = inject(Router);

  readonly displayName = signal('');
  readonly handle = signal('');
  readonly bio = signal('');
  readonly handleStatus = signal<HandleStatus>('idle');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly step = signal<Step>('details');

  private checkTimer: ReturnType<typeof setTimeout> | null = null;

  onHandleInput(raw: string): void {
    const clean = raw
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .slice(0, 30);
    this.handle.set(clean);
    this.scheduleCheck();
  }

  private scheduleCheck(): void {
    const value = this.handle();
    if (this.checkTimer) clearTimeout(this.checkTimer);
    if (value.length < 3) {
      this.handleStatus.set(value ? 'invalid' : 'idle');
      return;
    }
    this.handleStatus.set('checking');
    this.checkTimer = setTimeout(() => this.runCheck(value), 400);
  }

  private async runCheck(value: string): Promise<void> {
    if (value !== this.handle()) return;
    const available = await this.profiles.isHandleAvailable(value);
    if (value !== this.handle()) return;
    this.handleStatus.set(available ? 'available' : 'taken');
  }

  get canSubmit(): boolean {
    return (
      this.displayName().trim().length > 0 &&
      this.handleStatus() === 'available' &&
      !this.submitting()
    );
  }

  goToConfirm(): void {
    if (!this.canSubmit) return;
    this.step.set('confirm');
  }

  goBack(): void {
    this.step.set('details');
  }

  async submit(): Promise<void> {
    if (!this.canSubmit) return;
    this.submitting.set(true);
    this.error.set(null);
    try {
      const user = this.auth.user();
      if (!user) {
        this.ui.openAuthModal();
        this.router.navigate(['/']);
        return;
      }
      await this.profiles.create({
        displayName: this.displayName().trim(),
        handle: this.handle(),
        bio: this.bio().trim(),
        email: user.email,
      });
      this.ui.showToast('تم إنشاء صفحتك بنجاح! 🎉', 'success');
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'تعذّر حفظ البيانات، حاول مرة أخرى.');
    } finally {
      this.submitting.set(false);
    }
  }

  initial(name: string): string {
    return (name || '؟').trim().charAt(0) || '؟';
  }
}
