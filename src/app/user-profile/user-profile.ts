import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { form, FormField, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-user-profile',
  imports: [FormField],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent {
  private authService = inject(AuthService);

  user = this.authService.currentUser;
  isEditing = signal(false);

  regions = [
    { id: 1, name: 'Dolnośląskie' },
    { id: 2, name: 'Kujawsko-Pomorskie' },
    { id: 3, name: 'Lubelskie' },
    { id: 4, name: 'Lubuskie' },
    { id: 5, name: 'Łódzkie' },
    { id: 6, name: 'Małopolskie' },
    { id: 7, name: 'Mazowieckie' },
    { id: 8, name: 'Opolskie' },
    { id: 9, name: 'Podkarpackie' },
    { id: 10, name: 'Podlaskie' },
    { id: 11, name: 'Pomorskie' },
    { id: 12, name: 'Śląskie' },
    { id: 13, name: 'Świętokrzyskie' },
    { id: 14, name: 'Warmińsko-Mazurskie' },
    { id: 15, name: 'Wielkopolskie' },
    { id: 16, name: 'Zachodniopomorskie' },
  ];

  editModel = signal({
    first_name: this.user()?.first_name ?? '',
    last_name: this.user()?.last_name ?? '',
    region: this.user()?.region ?? '',
    email: this.user()?.email ?? '',
  });

  editForm = form(this.editModel, (s) => {
    required(s.first_name, { message: 'Imię jest wymagane' });
    required(s.last_name, { message: 'Nazwisko jest wymagane' });
    required(s.email, { message: 'Email jest wymagany' });
  });

  getRegionName(id: number | string): string {
    const region = this.regions.find(r => r.id === Number(id));
    return region ? region.name : '';
  }

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.editForm, {
      action: async () => {
        const data = this.editModel();
        this.authService.updateUser(data).subscribe((result: any) => {
          this.authService.setCurrentUser(result.user ?? data);
          this.isEditing.set(false);
        });
      }
    });
  }
}