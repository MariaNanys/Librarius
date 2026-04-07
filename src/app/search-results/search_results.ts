import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../services/book.service';
// NOWOŚĆ: Importujemy serwis od zaawansowanego wyszukiwania
import { SearchAdvanceService } from '../services/search-advance.service'; 

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './search_results.html',
  styleUrl: './search_results.scss'
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  public bookService = inject(BookService);
  // NOWOŚĆ: Wstrzykujemy serwis do komponentu
  private searchAdvanceService = inject(SearchAdvanceService); 

  searchQuery = signal<string>('');

ngOnInit() {
    this.route.queryParams.subscribe(params => {
      
      if (params['advanced']) {
        // 1. Zbieramy filtry BEZ autora na czas ładowania
        const parts: string[] = [];
        
        if (params['title']) parts.push(`tytuł: "${params['title']}"`);
        if (params['isbn']) parts.push(`ISBN: ${params['isbn']}`);
        if (params['publisher']) parts.push(`wydawca: "${params['publisher']}"`);
        if (params['published_year_min']) parts.push(`od ${params['published_year_min']} r.`);
        if (params['published_year_max']) parts.push(`do ${params['published_year_max']} r.`);
        if (params['language']) parts.push(`wybrany język`);
        
        // Wyświetlamy to, co mamy do tej pory (bez migania brzydkim tekstem)
        this.searchQuery.set(parts.length > 0 ? `Zaawansowane (${parts.join(', ')})` : 'Kryteria zaawansowane');
        
        const payload = { ...params };
        delete payload['advanced'];

        this.bookService.isSearchLoading.set(true);
        this.searchAdvanceService.searchAdvanced(payload).subscribe({
          next: (results) => {
            this.bookService.searchResults.set(results); 
            this.bookService.isSearchLoading.set(false);

            // 2. Mamy dane! Jeśli w wyszukiwaniu był autor, wyciągamy go z wyników
            if (results.length > 0 && params['author_id']) {
              const firstBook = results[0]; 
              const searchedAuthor = firstBook.authors.find((a: any) => a.id == params['author_id']);

              if (searchedAuthor) {
                // Kopiujemy nasze bazowe filtry
                const finalParts = [...parts];
                // Wrzucamy imię i nazwisko na sam początek listy (metoda unshift)
                finalParts.unshift(`autor: "${searchedAuthor.name}"`);
                
                // Ustawiamy docelowy, piękny napis!
                this.searchQuery.set(`Zaawansowane (${finalParts.join(', ')})`);
              }
            }
          },
          error: (err) => {
            console.error('Błąd wyszukiwania zaawansowanego:', err);
            this.bookService.searchResults.set([]);
            this.bookService.isSearchLoading.set(false);
          }
        });

      } else if (params['q']) {
        const q = params['q'];
        this.searchQuery.set(q);
        this.bookService.searchBooksByString(q).subscribe();
      }
    });
  }

  getAuthorsList(authors: { id: number; name: string }[]): string {
    if (!authors || authors.length === 0) return 'Brak autora';
    return authors.map(a => a.name).join(', ');
  }

  getCover(url: string | null | undefined): string {
    return url ? url : '/assets/book_1.webp';
  }
}