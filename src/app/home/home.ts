import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
// NOWE: Dodałem Router do importów z @angular/router
import { RouterLink, Router } from "@angular/router"; 
import { BookService, BookCover } from '../services/book.service'; 

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
  imports: [RouterLink]
})
export class HomeComponent implements OnInit {
  private bookService = inject(BookService);
  private cdr = inject(ChangeDetectorRef); 
  
  // NOWE: Wstrzykujemy Router, żeby móc przekierować użytkownika po wyszukaniu
  private router = inject(Router);

  recentBooks: BookCover[] = []; 
  isLoading = true; 

  readonly defaultBookImages: string[] = [
    '/assets/book_1.webp',
    '/assets/book_2.webp',
    '/assets/book_3.webp',
    '/assets/book_4.webp'
  ];

  ngOnInit(): void {
    this.bookService.getRandomCovers().subscribe({
      next: (books) => {
        // Zamiast po prostu przypisywać, przelatujemy przez tablicę i ustawiamy okładki RAZ
        this.recentBooks = books.map(book => ({
          ...book,
          // Nadpisujemy cover_url na gotowy adres (z bazy lub wylosowany)
          cover_url: this.getBookCover(book.cover_url) 
        }));

        this.isLoading = false; 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Błąd pobierania nowości:', err);
        this.isLoading = false; 
        this.cdr.detectChanges(); 
      }
    });
  }

  // Zwraca URL okładki (z bazy lub losową z domyślnych)
  getBookCover(dbUrl: string | null | undefined): string {
    if (dbUrl) return dbUrl;
    const randomIndex = Math.floor(Math.random() * this.defaultBookImages.length);
    return this.defaultBookImages[randomIndex];
  }

  // NOWE: Funkcja odpalana po wciśnięciu Enter lub kliknięciu w lupę
  onSearch(searchTerm: string): void {
    const query = searchTerm.trim();
    
    if (query) {
      console.log('Szukam książki o tytule:', query);
      // Przekierowujemy na podstronę /search i doklejamy to co wpisał użytkownik
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }
}