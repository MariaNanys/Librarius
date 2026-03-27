import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

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
    province: this.user()?.province ?? '',
    email: this.user()?.email ?? '',
  });

  getRegionName(id: number | string): string {
    const region = this.regions.find(r => r.id === Number(id));
    return region ? region.name : '';
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const data = this.editModel();
    this.http.patch(environment.apiUrl + '/auth/user', data).subscribe((result: any) => {
      this.authService.setCurrentUser(result.user ?? data);
      this.isEditing.set(false);
    });
  }
}