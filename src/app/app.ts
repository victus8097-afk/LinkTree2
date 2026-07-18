import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { FooterComponent } from './shared/components/footer/footer';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AuthModalComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
