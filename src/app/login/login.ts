import { Component, inject, signal } from "@angular/core";
import { form, FormField, pattern, required, submit } from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { jwtDecode } from "jwt-decode";
import { firstValueFrom } from "rxjs"; // <-- Dodano ten import

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [FormField, RouterLink,]
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
          const result: any = await firstValueFrom(this.authService.login(credentials));
          
          // 1. Zapisujemy sam token do localStorage (przyda się do zapytań API)
          localStorage.setItem('token', result.token);
          
          // 2. Dekodujemy token, aby wyciągnąć imię
          const decodedToken: any = jwtDecode(result.token);
          
          // 3. Używamy Twojej gotowej metody z AuthService!
          // Zapisze ona imię w localStorage i zaktualizuje Twój sygnał currentUser
          this.authService.setCurrentUser({ first_name: decodedToken.first_name });
          
          await this.router.navigate(['/']);
          
        } catch (error) {
          console.error('Błąd logowania:', error);
        }
      },
    });
  }
}