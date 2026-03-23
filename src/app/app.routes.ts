import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { RegistrationComponent } from './registration/registration';
import { SearchComponent } from './search/search';
import { RegisterSuccessComponent } from './register-succes/register_success';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegistrationComponent},
    {path: 'register-success', component: RegisterSuccessComponent},
    {path: 'search', component: SearchComponent},
];
