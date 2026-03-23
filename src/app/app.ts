import { Component, inject, signal } from '@angular/core';
import { NavigationComponent } from './navigation/navigation';
import { RouterLink, RouterOutlet } from "@angular/router";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss', 
  imports: [NavigationComponent, RouterOutlet, RouterLink]
})
export class App {
  protected readonly title = signal('Librarius');
  private authService = inject(AuthService);
  
  // Pobieramy sygnał bezpośrednio z AuthService
  user = this.authService.currentUser;
}
