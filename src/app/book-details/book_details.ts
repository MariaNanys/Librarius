import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { ReservationService } from '../services/reservation.service';
import { SearchAdvanceService } from '../services/search-advance.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book_details.html',
  styleUrl: './book_details.scss',
  standalone: true,
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private searchAdvanceService = inject(SearchAdvanceService);
  private cdr = inject(ChangeDetectorRef);

  bookId: string | null = null;
  bookDetails: any = null;
  libraries: any = null;
  languageMap: Record<string, string> = {};
  isLoading = true;
  isExpanded = false;
  isLibrarian = this.authService.isLibrarian;

  popupOpen = false;
  selectedLibraryId: number | null = null;
  isLibraryDropdownOpen = false;
  isSaving = false;
  saveError = '';
  successPopupOpen = false;

  private redirectTimeoutHandle: number | null = null;

  readonly fallbackDescription = 'Lorem ipsum dolor sit amet...';

  get displayDescription(): string {
    return this.bookDetails?.description || this.fallbackDescription;
  }

  get isLoggedIn(): boolean {
    return !!this.authService.currentUser();
  }

  get isLongDescription(): boolean {
    return this.displayDescription.length > 200;
  }

  get selectedLibrary(): any {
    if (this.selectedLibraryId === null || !this.libraries) return null;
    return this.libraries.find((l: any) => l.id === this.selectedLibraryId) ?? null;
  }

  get selectedLibraryName(): string {
    const lib = this.selectedLibrary;
    return lib ? `${lib.name}, ${lib.city}` : '';
  }

  get librarianAvailability(): { available: boolean; label: string } | null {
    if (!this.isLibrarian() || !this.libraries) return null;
    const user = this.authService.currentUser();
    if (!user?.library_id) return null;
    const myLib = this.libraries.find((l: any) => l.id === user.library_id);
    if (!myLib) return null;
    return {
      available: myLib.is_available,
      label: myLib.is_available ? 'Dostępna' : 'Niedostępna',
    };
  }

  ngOnInit(): void {
    this.searchAdvanceService.getLanguages().subscribe({
      next: data => {
        data.forEach(l => this.languageMap[l.code] = l.display);
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });

    this.route.paramMap.subscribe(params => {
      this.bookId = params.get('id');
      this.isLoading = true;

      if (this.bookId) {
        this.bookService.getBookDetails(this.bookId)
          .subscribe({
            next: (data) => {
              this.bookDetails = data;
              this.libraries = data?.libraries || [];
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Błąd:', err);
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeoutHandle !== null) {
      clearTimeout(this.redirectTimeoutHandle);
    }
  }

  handleReservation(libraryId: number): void {
    if (this.isLoggedIn) {
      this.openPopup(libraryId);
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleDescription(event: Event): void {
    event.preventDefault();
    this.isExpanded = !this.isExpanded;
  }

  getCover(url: string | null | undefined): string {
    return url ? url : '/assets/book_1.webp';
  }

  getLanguageDisplay(code: string | null | undefined): string {
    if (!code) return 'Brak danych';
    return this.languageMap[code.toLowerCase()] || code.toUpperCase();
  }

  goBack(): void {
    this.location.back();
  }

  onSearch(searchTerm: string): void {
    const query = searchTerm.trim();
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  openPopup(libraryId: number): void {
    this.selectedLibraryId = libraryId;
    this.saveError = '';
    this.popupOpen = true;
    this.isLibraryDropdownOpen = false;
  }

  closePopup(): void {
    this.popupOpen = false;
    this.selectedLibraryId = null;
    this.isSaving = false;
    this.saveError = '';
    this.isLibraryDropdownOpen = false;
  }

  toggleLibraryDropdown(): void {
    this.isLibraryDropdownOpen = !this.isLibraryDropdownOpen;
  }

  selectLibrary(id: number, available: boolean): void {
    if (!available) return;
    this.selectedLibraryId = id;
    this.isLibraryDropdownOpen = false;
    this.saveError = '';
  }

  confirmReservation(): void {
    const lib = this.selectedLibrary;
    const libId = this.selectedLibraryId;
    if (!this.bookDetails || libId === null || !lib?.is_available) {
      return;
    }
    this.isSaving = true;
    this.saveError = '';
    this.reservationService.create(this.bookDetails.id, libId).subscribe({
      next: () => {
        this.closePopup();
        this.successPopupOpen = true;
        this.cdr.detectChanges();
        this.scheduleSuccessRedirect();
      },
      error: (err) => {
        console.error('Błąd rezerwacji:', err);
        this.saveError = 'Nie udało się utworzyć rezerwacji.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  private scheduleSuccessRedirect(): void {
    if (this.redirectTimeoutHandle !== null) {
      clearTimeout(this.redirectTimeoutHandle);
    }
    this.redirectTimeoutHandle = window.setTimeout(() => {
      this.successPopupOpen = false;
      this.redirectTimeoutHandle = null;
      this.cdr.detectChanges();
      this.router.navigate(['/reservations']);
    }, 2000);
  }
}
