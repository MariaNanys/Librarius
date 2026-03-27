import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './search_results.html',
  styleUrl: './search_results.scss'
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  // Wstrzykujemy serwis jako publiczny, aby HTML miał dostęp do sygnałów
  public bookService = inject(BookService);

  // Sygnał przechowujący szukaną frazę (do wyświetlenia w nagłówku)
  searchQuery = signal<string>('');

  ngOnInit() {
    // Nasłuchujemy na zmiany parametru 'q' w adresie URL
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      if (q) {
        this.searchQuery.set(q);
        // Odpalamy zapytanie do serwisu. 
        // Wyniki same zaktualizują sygnał bookService.searchResults()
        this.bookService.searchBooksByString(q).subscribe();
      }
    });
  }

  // Funkcja pomocnicza: łączy imiona i nazwiska autorów po przecinku
  getAuthorsList(authors: { id: number; name: string }[]): string {
    if (!authors || authors.length === 0) return 'Brak autora';
    return authors.map(a => a.name).join(', ');
  }

  // Funkcja fallback na brak okładki z bazy
  getCover(url: string | null | undefined): string {
    return url ? url : '/assets/book_1.webp';
  }
}