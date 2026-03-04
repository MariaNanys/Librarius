import { Component, signal } from '@angular/core';
import { NavigationComponent } from './navigation/navigation';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss', 
  imports: [NavigationComponent]
})
export class App {
  protected readonly title = signal('Librarius');
}
