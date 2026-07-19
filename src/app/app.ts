import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container';
import { SkipLinkComponent } from './shared/components/skip-link/skip-link';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuthModalComponent, ToastContainerComponent, SkipLinkComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
