import { Component, inject, signal } from "@angular/core";
import { form, FormField, pattern, required, submit } from "@angular/forms/signals";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { jwtDecode } from "jwt-decode";
import { firstValueFrom } from "rxjs"; // <-- Dodano ten import

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [FormField]
})
export class LoginComponent {
  authService: AuthService = inject(AuthService);
  private router = inject(Router);

  loginModel = signal({
    login: '',
    password: '',
  });

  user = signal<{ first_name: string } | null>(null);

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.login, { message: 'Login jest wymagany' });
    pattern(schemaPath.login, /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]+)$/, {
      message: 'Login musi być prawdziwym adresem e-mail lub identyfikatorem'
    });
    required(schemaPath.password, { message: 'Hasło jest wymagane' });
  });
  cacheService: any;

onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, {
      action: async () => {
        const credentials = this.loginModel();
        
        try {
          // 1. Wysyłamy login i hasło, odbieramy token
          const result: any = await firstValueFrom(this.authService.login(credentials));
          
          // 2. ZAPISUJEMY TOKEN - to bardzo ważne, żeby AuthInterceptor mógł go od razu dokleić do kolejnego zapytania!
          localStorage.setItem('token', result.token);
          
          // 3. Dekodujemy token, aby wyciągnąć z niego ID użytkownika (klucz 'sub')
          const decodedToken: any = jwtDecode(result.token);
          const userId = decodedToken.sub; // W Twoim tokenie to jest np. "22"
          
          // 4. NOWE: Pobieramy pełne dane użytkownika z API!
          // Twój AuthInterceptor automatycznie doda tutaj nagłówek "Authorization: Bearer ..."
          const userProfile: any = await firstValueFrom(this.authService.getUserProfile(userId));
          
          console.log('Pełny profil z backendu:', userProfile);
          
          // 5. Zapisujemy pobrane imię do stanu aplikacji
          // (Możesz tu przekazać cały obiekt userProfile, jeśli w przyszłości 
          // będziesz chciał wyświetlać też np. last_name albo email w nawigacji)
          this.authService.setCurrentUser({ first_name: userProfile.first_name });
          
          // 6. Przekierowujemy na stronę główną
          await this.router.navigate(['/']);
          
        } catch (error) {
          console.error('Błąd logowania lub pobierania profilu:', error);
        }
      },
    });
  }
}