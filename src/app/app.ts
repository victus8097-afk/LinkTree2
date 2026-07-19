import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container';
<<<<<<< HEAD

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuthModalComponent, ToastContainerComponent],
=======
import { SkipLinkComponent } from './shared/components/skip-link/skip-link';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuthModalComponent, ToastContainerComponent, SkipLinkComponent],
>>>>>>> 7520dfc138125112298cb2c79528ace99c8440d2
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
