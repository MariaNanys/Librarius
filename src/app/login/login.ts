import { Component, inject, signal } from "@angular/core";
import { form, FormField, pattern, required, submit } from "@angular/forms/signals";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { jwtDecode } from "jwt-decode";
import { firstValueFrom } from "rxjs";

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

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.login, { message: 'Login jest wymagany' });
    pattern(schemaPath.login, /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]+)$/, {
      message: 'Login musi być prawdziwym adresem e-mail'
    });
    required(schemaPath.password, { message: 'Hasło jest wymagane' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, {
      action: async () => {
        const credentials = this.loginModel();
        try {
          const result: any = await firstValueFrom(this.authService.login(credentials));
          localStorage.setItem('token', result.token);
          this.authService.setUserToStorage(result.token);
          await this.router.navigate(['/']);
        } catch (error) {
          console.error('Błąd logowania lub pobierania profilu:', error);
        }
      },
    });
  }
}