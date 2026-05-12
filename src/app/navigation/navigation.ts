import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface MenuItem {
  path?: string;
  label: string;
  exact?: boolean;
}

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class NavigationComponent {
  private authService = inject(AuthService);

  user = this.authService.currentUser;
  isLibrarian = this.authService.isLibrarian;

  menuItems = computed<MenuItem[]>(() => {
    if (this.isLibrarian()) {
      return [
        { path: '/librarian', label: 'Strona główna', exact: true },
        { path: '/advanced-search', label: 'Wyszukaj książkę' },
        { path: '/librarian/reservations', label: 'Zarządzaj rezerwacjami' },
        { path: '/librarian/readers', label: 'Zarządzaj czytelnikami' },
      ];
    }
    return [
      { path: '/', label: 'Strona główna', exact: true },
      { path: '/advanced-search', label: 'Wyszukaj Książkę' },
    ];
  });
}
