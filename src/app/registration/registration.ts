import { Component, computed, HostListener, inject, signal } from "@angular/core";
import { email, form, FormField, minLength, pattern, required, submit, validate } from "@angular/forms/signals";
import { AuthService } from "../services/auth.service";

@Component({
    selector: 'app-registration',
    templateUrl: './registration.html',
    styleUrl: './registration.scss',
    imports: [FormField]
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
    { id: 16, name: 'Zachodniopomorskie' }
];

    formSubmitted = signal(false);
    submitError = signal<string | null>(null);
    isRegionOpen = signal(false);

    selectedRegionName = computed(() => {
        const id = Number(this.registrationModel().region);
        return this.regions.find(r => r.id === id)?.name ?? '';
    });

    toggleRegionDropdown() {
        this.isRegionOpen.update(v => !v);
    }

    selectRegion(id: number) {
        this.registrationModel.update(m => ({ ...m, region: String(id) }));
        this.isRegionOpen.set(false);
    }

    @HostListener('document:click')
    onDocumentClick() {
        this.isRegionOpen.set(false);
    }

    private _registrationForm = form(this.registrationModel, (schemaPath) => {
        required(schemaPath.first_name, { message: 'Imię jest wymagane' });
        required(schemaPath.last_name, { message: 'Nazwisko jest wymagane' });
        required(schemaPath.region, { message: 'Wojewódźtwo jest wymagane' });
        required(schemaPath.email, { message: 'E-mail jest wymagany' });
        email(schemaPath.email, { message: 'Niepoprawny email' });
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
            const formValues = this.registrationModel();
            const regionId = Number(formValues.region);
            const payloadToSend = {
                email: formValues.email,
                password: formValues.password,
                first_name: formValues.first_name,
                last_name: formValues.last_name,
                region: regionId
            };

            this.submitError.set(null);
            this.authService.register(payloadToSend).subscribe({
                next: (result) => {
                    this.formSubmitted.set(true);
                },
                error: (err) => {
                    console.error('Błąd z serwera:', err);
                    this.submitError.set(err?.status === 409 ? 'Użytkownik o tym adresie e-mail już istnieje.' : 'Wystąpił błąd. Spróbuj ponownie.');
                }
            });
        },
    });
}
}