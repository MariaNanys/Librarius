import { Component, signal } from "@angular/core";
import { form, FormField, pattern, required, submit } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.html',
    styleUrl: './login.scss',
    imports: [FormField, RouterLink]
})

export class LoginComponent {
loginModel = signal({
    login: '',
    password: '',
});
// loginForm = form(this.loginModel);

loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.login, {message: 'Login jest wymagany'});

    pattern(schemaPath.login, /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[0-9]+)$/, {
      message: 'Login musi być prawdziwym adresem e-mail lub identyfikatorem'});
    required(schemaPath.password, {message: 'Hasło jest wymagane'});
    
  });
  onSubmit(event: Event) {
    event.preventDefault();
    submit(this.loginForm, {
      action: async () => {
        const credentials = this.loginModel();
        // In a real app, this would be async:
        // await this.authService.login(credentials);
        console.log('Logowanie z:', credentials);
      },
    });
  }

}

