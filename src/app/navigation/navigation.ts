import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class NavigationComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;
  
  menuItems = signal([
    { path: '/categories', label: 'Kategorie' },
    { path: '/libaries', label: 'Biblioteki' },
  ])
  menuItemsLoged = signal([
    { path: '/logout', label: 'Wyloguj' },
  ])

}
