import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiService } from '../../core/services/ui.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {
  readonly ui = inject(UiService);
  readonly auth = inject(AuthService);
}
