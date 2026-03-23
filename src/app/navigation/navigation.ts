import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class NavigationComponent {
  private authService = inject(AuthService);
  private router = inject(Router); // <-- Wstrzykujemy Router
  
  user = this.authService.currentUser;
  
  menuItems = signal([
    { path: '/categories', label: 'Kategorie' },
    { path: '/search', label: 'Wyszukaj Książkę' },
  ])
  menuItemsLoged = signal([
    { path: '/reservations', label: 'Moje rezerwacje' },
    { path: '/user', label: 'Moje dane' },
  ])
// Nasza nowa metoda do wylogowywania
  onLogout() {
    this.authService.logout(); // Czyści sygnał i localStorage
    this.router.navigate(['/login']); // Przekierowuje na stronę logowania (lub na '/')
  }
}
