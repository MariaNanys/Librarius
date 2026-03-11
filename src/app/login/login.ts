import { Component, inject, signal } from "@angular/core";
import { form, FormField, pattern, required, submit } from "@angular/forms/signals";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [FormField, RouterLink,]
})

export class LoginComponent {
  authService: AuthService = inject(AuthService);
  loginModel = signal({
    login: '',
    password: '',
  });
  private router = inject(Router);
  user = signal<{ first_name: string } | null>(null);
  constructor() {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      this.user.set(JSON.parse(storedUser));
    }

  }
  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.login, { message: 'Login jest wymagany' });

    pattern(schemaPath.login, /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]+)$/, {
      message: 'Login musi być prawdziwym adresem e-mail lub identyfikatorem'
    });
    required(schemaPath.password, { message: 'Hasło jest wymagane' });

  });
  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, {
      action: async () => {
        const credentials = this.loginModel();
        this.authService.login(credentials).subscribe((result: any) => {
          console.log(result);
          this.authService.setCurrentUser(result.user);
          this.router.navigate(['/']);
        })
      },
    });
  }

}

