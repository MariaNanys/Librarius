import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import { RegistrationComponent } from './registration/registration';
import { AdvanceSearchComponent } from './advanced-search/advanced_search';
import { RegisterSuccessComponent } from './register-succes/register_success';
import { BookDetailsComponent } from './book-details/book_details';
import { SearchResultsComponent } from './search-results/search_results';
import { UserProfileComponent } from './user-profile/user-profile';
import { MyReservationsComponent } from './my-reservations/my-reservations';
import { LibrarianDashboardComponent } from './librarian/dashboard/dashboard';
import { LibrarianReservationsComponent } from './librarian/reservations/reservations';
import { librarianGuard } from './guards/librarian.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegistrationComponent },
    { path: 'register-success', component: RegisterSuccessComponent },
    { path: 'search', component: SearchResultsComponent },
    { path: 'advanced-search', component: AdvanceSearchComponent },
    { path: 'book/:id', component: BookDetailsComponent },
    { path: 'profile', component: UserProfileComponent },
    { path: 'reservations', component: MyReservationsComponent },
    {
        path: 'librarian',
        canActivate: [librarianGuard],
        children: [
            { path: '', component: LibrarianDashboardComponent },
            { path: 'reservations', component: LibrarianReservationsComponent },
        ],
    },
];
