import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { form, FormField, minLength, pattern, required, submit, validate } from "@angular/forms/signals";
import { AuthService } from "../services/auth.service";

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.scss',
    imports: [FormField, RouterLink]
})

export class ResetPasswordComponent implements OnInit {
    private authService = inject(AuthService);
    private route = inject(ActivatedRoute);

    uid = '';
    token = '';

    resetModel = signal({
        password: '',
        repeatPassword: ''
    });

    formSubmitted = signal(false);
    submitError = signal<string | null>(null);
    linkError = signal<string | null>(null);

    private _resetForm = form(this.resetModel, (schemaPath) => {
        required(schemaPath.password, { message: 'Hasło jest wymagane' });
        minLength(schemaPath.password, 12, { message: 'Hasło musi zawierać min 12 znaków' });
        pattern(
            schemaPath.password,
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
            {
                message: 'Hasło musi zawierać małą literę, dużą literę i znak specjalny'
            }
        );
        required(schemaPath?.repeatPassword, { message: 'Powtórzenie hasła jest wymagane' });

        validate(schemaPath?.repeatPassword, () => {
            const { password, repeatPassword } = this.resetModel();

            if (password !== repeatPassword) {
                return {
                    kind: 'passwordMismatch',
                    message: 'Wprowadzone hasła się różnią'
                };
            }

            return null;
        });
    });
    public get resetForm() {
        return this._resetForm;
    }
    public set resetForm(value) {
        this._resetForm = value;
    }

    ngOnInit(): void {
        const params = this.route.snapshot.queryParamMap;
        this.uid = params.get('uid') ?? '';
        this.token = params.get('token') ?? '';
        if (!this.uid || !this.token) {
            this.linkError.set('Link do resetu hasła jest nieprawidłowy lub niekompletny.');
        }
    }

    onSubmit(event: Event) {
        event.preventDefault();
        if (!this.uid || !this.token) return;
        submit(this.resetForm, {
            action: async () => {
                const formValues = this.resetModel();
                this.submitError.set(null);
                this.authService.confirmPasswordReset(this.uid, this.token, formValues.password).subscribe({
                    next: () => {
                        this.authService.currentUser.set(null);
                        localStorage.removeItem('token');
                        localStorage.removeItem('login_timestamp');
                        this.formSubmitted.set(true);
                    },
                    error: (err) => {
                        console.error('Błąd z serwera:', err);
                        this.submitError.set(err?.status === 400 ? 'Link do resetu hasła jest nieprawidłowy lub wygasł.' : 'Nie udało się ustawić nowego hasła. Spróbuj ponownie.');
                    }
                });
            },
        });
    }
}
