import { Component, inject, signal } from "@angular/core";
import { email, form, FormField, minLength, pattern, required, submit, validate } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
    selector: 'app-registration',
    templateUrl: './registration.html',
    styleUrl: './registration.scss',
    imports: [FormField, RouterLink]
})

export class RegistrationComponent {
    authService: AuthService = inject(AuthService);
    registrationModel = signal({
        first_name: '',
        last_name: '',
        region: '',
        email: '',
        password: '',
        repeatPassword: ''
    });
    // loginForm = form(this.loginModel);
    regions = [
        'Dolnośląskie',
        'Kujawsko-Pomorskie',
        'Lubelskie',
        'Lubuskie',
        'Łódzkie',
        'Małopolskie',
        'Mazowieckie',
        'Opolskie',
        'Podkarpackie',
        'Podlaskie',
        'Pomorskie',
        'Śląskie',
        'Świętokrzyskie',
        'Warmińsko-Mazurskie',
        'Wielkopolskie',
        'Zachodniopomorskie'
    ];

    formSubmitted = signal(false);
    private _registrationForm = form(this.registrationModel, (schemaPath) => {
        required(schemaPath.first_name, { message: 'Imię jest wymagane' });
        required(schemaPath.last_name, { message: 'Nazwisko jest wymagane' });
        required(schemaPath.region, { message: 'Wojewódźtwo jest wymagane' });
        required(schemaPath.email, { message: 'E-mail jest wymagany' });
        email(schemaPath.email, { message: 'Niepoprawny email' });
        required(schemaPath.password, { message: 'Hasło jest wymagane' });
        minLength(schemaPath.password, 8, { message: 'Hasło musi zawierać min 8 znaków' });
        pattern(
            schemaPath.password,
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
            {
                message: 'Hasło musi zawierać małą literę, dużą literę i znak specjalny'
            }
        );
        required(schemaPath?.repeatPassword, { message: 'Powtórzenie hasło jest wymagane' });


        validate(schemaPath?.repeatPassword, () => {
            const { password, repeatPassword } = this.registrationModel();

            if (password !== repeatPassword) {
                return {
                    kind: 'passwordMismatch',
                    message: 'Wprowadzone hasła się różnią'
                };
            }

            return null;
        });
    });
    public get registrationForm() {
        return this._registrationForm;
    }
    public set registrationForm(value) {
        this._registrationForm = value;
    }
    onSubmit(event: Event) {
        event.preventDefault();
        submit(this.registrationForm, {
            action: async () => {
                const { repeatPassword, ...data } = this.registrationModel();
                this.authService.register(data).subscribe((result) => {
                    console.log(result);
                })
                this.formSubmitted.set(true);
            },
        });
    }

}