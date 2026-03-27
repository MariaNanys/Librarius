import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { RegistrationComponent } from './registration/registration';
import { AdvanceSearchComponent } from './advanced-search/advanced_search';
import { RegisterSuccessComponent } from './register-succes/register_success';
import { BookDetailsComponent } from './book-details/book_details';
import { SearchResultsComponent } from './search-results/search_results';
import { UserProfileComponent } from './user-profile/user-profile';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegistrationComponent },
    { path: 'register-success', component: RegisterSuccessComponent },
    { path: 'search', component: SearchResultsComponent },
    { path: 'advanced-search', component: AdvanceSearchComponent },
    { path: 'book/:id', component: BookDetailsComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'profile', component: UserProfileComponent },
];