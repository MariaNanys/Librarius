// 1. Upewnij się, że importujesz ChangeDetectorRef
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-book-details',
  templateUrl: './book_details.html',
  styleUrl: './book_details.scss',
  standalone: true
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  
  // 2. Wstrzykujemy ChangeDetectorRef
  private cdr = inject(ChangeDetectorRef);

  bookId: string | null = null;
  bookDetails: any = null;
  isLoading = true;
  isExpanded = false;

  readonly fallbackDescription = 'Brak opisu dla tej książki. Lorem ipsum dolor sit amet, consectetur adipiscing elit...';

  get displayDescription(): string {
    return this.bookDetails?.description || this.fallbackDescription;
  }

  get isLongDescription(): boolean {
    return this.displayDescription.length > 200; 
  }

  toggleDescription(event: Event): void {
    event.preventDefault(); 
    this.isExpanded = !this.isExpanded;
  }

  libraries = [
    { name: 'Biblioteka narodowa', address: 'ul. Ogrodowa 58, Gdańsk', available: true },
    { name: 'Biblioteka miejska nr 23', address: 'ul. Hoża 28, Gdańsk', available: false }
  ];

  ngOnInit(): void {
    // 3. Zamieniamy 'snapshot' na 'subscribe', by nasłuchiwać zmian w pasku adresu
    this.route.paramMap.subscribe(params => {
      this.bookId = params.get('id');
      
      // Resetujemy stan przy każdym załadowaniu nowego ID
      this.isLoading = true;
      this.bookDetails = null;

      if (this.bookId) {
        this.bookService.getBookDetails(this.bookId).subscribe({
          next: (data) => {
            this.bookDetails = data;
            this.isLoading = false;
            
            // 4. SZTURCHAMY ANGULARA: "Hej, dane przyszły, przerysuj widok!"
            this.cdr.detectChanges(); 
          },
          error: (err) => {
            console.error('Błąd pobierania szczegółów:', err);
            this.isLoading = false;
            
            // W razie błędu też wymuszamy przerysowanie
            this.cdr.detectChanges(); 
          }
        });
      }
    });
  }

  getCover(url: string | null | undefined): string {
    return url ? url : '/assets/book_1.webp'; 
  }
}