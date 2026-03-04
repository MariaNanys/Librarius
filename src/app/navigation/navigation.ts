import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [ RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class NavigationComponent {
  menuItems = signal([
    {path: '/categories', label: 'Kategorie'},
    {path: '/libaries', label: 'Biblioteki'},
  ])
}
