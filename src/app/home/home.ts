import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
    // ZMIANA TUTAJ: Wywołujemy nową metodę z serwisu
    this.bookService.getSpecificCovers().subscribe({
      next: (books) => {
        this.recentBooks = books.map(book => ({
          ...book,
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

  getBookCover(dbUrl: string | null | undefined): string {
    if (dbUrl) return dbUrl;
    const randomIndex = Math.floor(Math.random() * this.defaultBookImages.length);
    return this.defaultBookImages[randomIndex];
  }

  onSearch(searchTerm: string): void {
    const query = searchTerm.trim();
    
    if (query) {
      console.log('Szukam książki o tytule:', query);
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }
}