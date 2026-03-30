import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Dodano Router
import { Location } from '@angular/common'; // Dodano Location
import { BookService } from '../services/book.service';
import { forkJoin } from 'rxjs';

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
  private cdr = inject(ChangeDetectorRef);

  // --- STAN KOMPONENTU ---
  bookId: string | null = null;
  bookDetails: any = null;
  reservationDetails: any = null;
  isLoading = true;
  isExpanded = false;

  readonly fallbackDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

  // --- MOCK DANYCH BIBLIOTEK ---
  libraries = [
    { name: 'Biblioteka narodowa', address: 'ul. Ogrodowa 58, Gdańsk', available: true },
    { name: 'Biblioteka miejska nr 23', address: 'ul. Hoża 28, Gdańsk', available: false }
  ];

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
        forkJoin([this.bookService.getBookDetails(this.bookId),this.bookService.getBookDetails(this.bookId)])
        .subscribe({
          next: (data) => {
            this.bookDetails = data[0];
            this.reservationDetails = data[1];
            this.isLoading = false;
            this.cdr.detectChanges(); // Wymuszamy przerysowanie widoku
          },
          error: (err) => {
            console.error('Błąd pobierania szczegółów:', err);
            this.isLoading = false;
            this.cdr.detectChanges(); // Wymuszamy przerysowanie widoku
          }
        });
      }
    });
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