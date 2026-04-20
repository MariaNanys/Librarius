import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../services/book.service';
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
  private searchAdvanceService = inject(SearchAdvanceService); 

  searchQuery = signal<string>('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      
      if (params['advanced']) {
        const parts: string[] = [];
        
        if (params['title']) parts.push(`tytuł: "${params['title']}"`);
        if (params['isbn']) parts.push(`ISBN: ${params['isbn']}`);
        if (params['publisher']) parts.push(`wydawca: "${params['publisher']}"`);
        if (params['published_year_min']) parts.push(`od ${params['published_year_min']} r.`);
        if (params['published_year_max']) parts.push(`do ${params['published_year_max']} r.`);
        if (params['languages']) parts.push(`wybrany język`);
        
        this.searchQuery.set(parts.length > 0 ? `Zaawansowane (${parts.join(', ')})` : 'Kryteria zaawansowane');
        
        const payload = { ...params };
        delete payload['advanced'];

        this.bookService.isSearchLoading.set(true);
        this.searchAdvanceService.searchAdvanced(payload).subscribe({
          next: (response: any) => {
            let safeResults = [];
            
            if (response && response.items && Array.isArray(response.items)) {
              safeResults = response.items;
            } else if (Array.isArray(response)) {
              safeResults = response;
            }

            this.bookService.searchResults.set(safeResults); 
            this.bookService.isSearchLoading.set(false);

            if (safeResults.length > 0 && params['author_ids']) {
              const firstBook = safeResults[0]; 
              
              if (firstBook.authors && Array.isArray(firstBook.authors)) {
                  const ids = params['author_ids'].split(',');
                  const searchedAuthors = firstBook.authors.filter((a: any) => ids.includes(a.id.toString()));

                  if (searchedAuthors.length > 0) {
                    const finalParts = [...parts];
                    const names = searchedAuthors.map((a: any) => a.name).join(', ');
                    finalParts.unshift(`autor: "${names}"`);
                    this.searchQuery.set(`Zaawansowane (${finalParts.join(', ')})`);
                  }
              }
            }
          },
          error: (err) => {
            console.error(err);
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