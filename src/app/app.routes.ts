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
import { LibrarianReadersComponent } from './librarian/readers/readers';
import { librarianGuard } from './guards/librarian.guard';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
    { path: 'register', component: RegistrationComponent, canActivate: [guestGuard] },
    { path: 'register-success', component: RegisterSuccessComponent },
    { path: 'search', component: SearchResultsComponent },
    { path: 'advanced-search', component: AdvanceSearchComponent },
    { path: 'book/:id', component: BookDetailsComponent },
    { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
    { path: 'reservations', component: MyReservationsComponent, canActivate: [authGuard] },
    {
        path: 'librarian',
        canActivate: [librarianGuard],
        children: [
            { path: '', component: LibrarianDashboardComponent },
            { path: 'reservations', component: LibrarianReservationsComponent },
            { path: 'readers', component: LibrarianReadersComponent },
        ],
    },
];
