import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { RegistrationComponent } from './registration/registration';
import { SearchComponent } from './search/search';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'registration', component: RegistrationComponent},
    {path: 'search', component: SearchComponent},
];
