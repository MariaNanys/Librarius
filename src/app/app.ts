import { Component, inject, signal } from '@angular/core';
import { NavigationComponent } from './navigation/navigation';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from "@angular/router";
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [NavigationComponent, RouterOutlet, RouterLink]
})
export class App {
  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly title = signal('Librarius');
  user = this.authService.currentUser;
  dropdownOpen = signal(false);
  private closeTimer: any = null;

  currentPath = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  toggleDropdown() {
    const isOpening = !this.dropdownOpen();
    this.dropdownOpen.update(v => !v);

    if (isOpening) {
      this.closeTimer = setTimeout(() => {
        this.dropdownOpen.set(false);
      }, 4000);
    } else {
      clearTimeout(this.closeTimer);
    }
  }

  closeDropdown() {
    clearTimeout(this.closeTimer);
    this.dropdownOpen.set(false);
  }

  logout() {
    this.closeDropdown();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}