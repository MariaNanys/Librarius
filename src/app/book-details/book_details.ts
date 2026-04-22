import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Dodano Router
import { Location } from '@angular/common'; // Dodano Location
import { BookService } from '../services/book.service';
import { forkJoin, of } from 'rxjs';
import { SearchAdvanceService } from '../services/search-advance.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-book-details',
  templateUrl: './book_details.html',
  styleUrl: './book_details.scss',
  standalone: true
})
export class BookDetailsComponent implements OnInit {
  // --- WSTRZYKIWANIE ZALEŻNOŚCI ---
  private route = inject(ActivatedRoute);
  private router = inject(Router); // Potrzebne do przekierowania po wpisaniu nowej frazy
  private location = inject(Location); // Potrzebne do przycisku "Wstecz"
  private bookService = inject(BookService);
  private searchAdvanceService = inject(SearchAdvanceService);
  private cdr = inject(ChangeDetectorRef);

  // --- STAN KOMPONENTU ---
  bookId: string | null = null;
  bookDetails: any = null;
  libraries: any = null;
  isLoading = true;
  isExpanded = false;

  readonly fallbackDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

  

  // --- GETTERY I OBSŁUGA OPISU ---
  get displayDescription(): string {
    return this.bookDetails?.description || this.fallbackDescription;
  }

// Sprawdzamy, czy faktycznie wyświetlany opis (displayDescription) jest długi
  get isLongDescription(): boolean {
    return this.displayDescription.length > 200; 
  }

  toggleDescription(event: Event): void {
    event.preventDefault(); 
    this.isExpanded = !this.isExpanded;
  }

  // --- CYKL ŻYCIA KOMPONENTU (POBIERANIE DANYCH) ---
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.bookId = params.get('id');
      
      // Resetujemy stan przy każdym załadowaniu nowego ID
      this.isLoading = true;
      this.bookDetails = null;

     if (this.bookId) {
          // 1. Zapytanie o szczegóły książki (główne, musi się udać)
          this.bookService.getBookDetails(this.bookId)
          
        .subscribe({
          next: (data) => {
            this.bookDetails = data; 
            if (data && data.libraries.length > 0) {
              this.libraries = data.libraries;
            } else {
              this.libraries = [];
            }
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Błąd pobierania głównych szczegółów książki:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    })
  }
      

  getCover(url: string | null | undefined): string {
    return url ? url : '/assets/book_1.webp'; 
  }

  // --- NOWE METODY: NAWIGACJA I WYSZUKIWANIE ---

  // Metoda wywoływana przez przycisk powrotu
  goBack(): void {
    this.location.back();
  }

  // Metoda wywoływana z inputa (po Enter lub kliknięciu w lupę)
  onSearch(searchTerm: string): void {
    const query = searchTerm.trim();
    if (query) {
      console.log('Nowe wyszukiwanie z detali książki:', query);
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }
}