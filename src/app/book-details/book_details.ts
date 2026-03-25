import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../services/book.service';
// Jeśli masz już komponent wyszukiwarki jako osobny, możesz go tu zaimportować. 
// Na razie zakładam, że zrobimy to w jednym widoku dla spójności z Twoim plikiem home.

@Component({
  selector: 'app-book_details',
  templateUrl: './book_details.html',
  styleUrl: './book_details.scss',
  standalone: true
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);

  bookId: string | null = null;
  bookDetails: any = null;
  isLoading = true;
  // --- ZMIENNE DO OPISU ---
  isExpanded = false;
// Stała na wypadek braku opisu
  readonly fallbackDescription = 'Brak opisu dla tej książki. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

  // Funkcja zwracająca opis (rzeczywisty lub zastępczy)
  get displayDescription(): string {
    return this.bookDetails?.description || this.fallbackDescription;
  }

  // Getter sprawdzający, czy faktycznie wyświetlany opis jest długi
  get isLongDescription(): boolean {
    return this.displayDescription.length > 200; 
  }
  // Funkcja przełączająca stan rozwinięcia
  toggleDescription(event: Event): void {
    event.preventDefault(); // Zapobiega skakaniu strony do góry po kliknięciu w link <a href="#">
    this.isExpanded = !this.isExpanded;
  }

  // Tymczasowe dane (mock) dla listy bibliotek, aby odwzorować makietę
  libraries = [
    { name: 'Biblioteka narodowa', address: 'ul. Ogrodowa 58, Gdańsk', available: true },
    { name: 'Biblioteka miejska nr 23', address: 'ul. Hoża 28, Gdańsk', available: false }
  ];

  ngOnInit(): void {
    // Pobieramy ID z parametru URL (np. /book/1187)
    this.bookId = this.route.snapshot.paramMap.get('id');

    if (this.bookId) {
      this.bookService.getBookDetails(this.bookId).subscribe({
        next: (data) => {
          this.bookDetails = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Błąd pobierania szczegółów:', err);
          this.isLoading = false;
        }
      });
    }
  }

  // Funkcja fallback dla okładki (w razie braku w bazie)
  getCover(url: string | null | undefined): string {
    return url ? url : '/assets/book_1.webp'; 
  }
}