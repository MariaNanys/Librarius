import { Component, inject, OnInit, ChangeDetectorRef, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { BookService } from '../services/book.service';
import { AuthService } from '../services/auth.service';
import { SearchAdvanceService } from '../services/search-advance.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book_details.html',
  styleUrl: './book_details.scss',
  standalone: true,
  imports: [RouterLink]
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location); 
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private searchAdvanceService = inject(SearchAdvanceService);
  private cdr = inject(ChangeDetectorRef);

  bookId: string | null = null;
  bookDetails: any = null;
  libraries: any = null;
  isLoading = true;
  isExpanded = false;

  redirectLink = computed(() => {
    
    return this.authService.currentUser() !== null ? '/reservation' : '/login';
  });

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

  ngOnInit(): void {
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

  handleReservation(libraryId: number): void {
    if (this.isLoggedIn) {
      console.log('Rozpoczynam rezerwację w bibliotece:', libraryId);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  toggleDescription(event: Event): void {
    event.preventDefault();
    this.isExpanded = !this.isExpanded;
  }

  getCover(url: string | null | undefined): string {
    return url ? url : '/assets/book_1.webp';
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
}