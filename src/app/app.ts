import { Component, signal } from '@angular/core';
import { NavigationComponent } from './navigation/navigation';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss', 
  imports: [NavigationComponent, RouterOutlet]
})
export class App {
  protected readonly title = signal('Librarius');
}
