import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { email, form, FormField, required, submit } from "@angular/forms/signals";
import { AuthService } from "../services/auth.service";

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.scss',
    imports: [FormField, RouterLink]
})

export class ForgotPasswordComponent {
    private authService = inject(AuthService);
    forgotModel = signal({
        email: ''
    });

    formSubmitted = signal(false);
    submittedEmail = signal('');
    submitError = signal<string | null>(null);

    private _forgotForm = form(this.forgotModel, (schemaPath) => {
        required(schemaPath.email, { message: 'E-mail jest wymagany' });
        email(schemaPath.email, { message: 'Niepoprawny email' });
    });
    public get forgotForm() {
        return this._forgotForm;
    }
    public set forgotForm(value) {
        this._forgotForm = value;
    }

    onSubmit(event: Event) {
        event.preventDefault();
        submit(this.forgotForm, {
            action: async () => {
                const formValues = this.forgotModel();
                this.submitError.set(null);
                this.authService.requestPasswordReset(formValues.email).subscribe({
                    next: () => {
                        this.submittedEmail.set(formValues.email);
                        this.formSubmitted.set(true);
                    },
                    error: (err) => {
                        console.error('Błąd z serwera:', err);
                        this.submitError.set('Wystąpił błąd. Spróbuj ponownie.');
                    }
                });
            },
        });
    }

    resendLink() {
        this.authService.requestPasswordReset(this.submittedEmail()).subscribe({
            error: (err) => console.error('Błąd z serwera:', err),
        });
    }
}
