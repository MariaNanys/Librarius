import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core'; // DODANO: signal
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators'; // DODANO: tap
import { environment } from '../../../environments/environment';

export interface SearchBookResult {
  id: number;
  title: string;
  isbn: string;
  integration_source: number;
  data_source: string;
  google_id: string;
  publisher: string;
  published_year: number;
  description: string;
  page_count: number;
  print_type: string;
  category: string;
  cover_url: string;
  language: string;
  last_updated: string;
  authors: { id: number; name: string }[];
  libraries: { id: number; name: string; city: string; region: number; is_available: boolean }[];
}

export interface BookCover {
  id: number;
  cover_url: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  #http = inject(HttpClient);

  // ==========================================
  // STAN WYSZUKIWANIA GLOBALNEGO (SYGNAŁY)
  // ==========================================
  searchResults = signal<SearchBookResult[]>([]);
  isSearchLoading = signal<boolean>(false);

  // ==========================================
  // METODY WYSZUKIWANIA
  // ==========================================
  
  /**
   * Wywołuje API z podanym ciągiem znaków i zapisuje wyniki w Sygnale.
   */
  searchBooksByString(searchTerm: string): Observable<SearchBookResult[]> {
    this.isSearchLoading.set(true);

    // Parametr zapytania. Zależnie od konfiguracji Twojego backendu,
    // nazwa parametru to może być 'q', 'query', 'title' lub 'search'.
    // Zakładam tu popularne 'q' (np. /api/search/books?q=wiedźmin).
    const params = new HttpParams().set('q', searchTerm);

    return this.#http.get<SearchBookResult[]>(`${environment.apiUrl}/search/books`, { params }).pipe(
      // 'tap' pozwala nam przechwycić dane i zapisać je do Sygnału,
      // zanim powędrują dalej do komponentu
      tap({
        next: (results) => {
          console.log('[Service] Otrzymano wyniki wyszukiwania:', results);
          this.searchResults.set(results); // Zapisujemy wyniki globalnie!
          this.isSearchLoading.set(false);
        },
        error: (err) => {
          console.error('[Service] Błąd wyszukiwania:', err);
          this.searchResults.set([]); // W razie błędu czyścimy wyniki
          this.isSearchLoading.set(false);
        }
      })
    );
  }

  // ==========================================
  // POZOSTAŁE METODY (BEZ ZMIAN)
  // ==========================================

  /**
   * Losuje 8 unikalnych ID i pobiera ich dane równolegle.
   */
  getRandomCovers(): Observable<BookCover[]> {
    const randomIds = new Set<number>();
    while (randomIds.size < 8) {
      randomIds.add(Math.floor(Math.random() * 1349) + 1);
    }

    const requests: Observable<any>[] = Array.from(randomIds).map(id => 
      this.#http.get<any>(`${environment.apiUrl}/books/${id}`).pipe(
        catchError(() => of(null)) 
      )
    );

    return forkJoin(requests).pipe(
      map(responses => {
        const validResponses = responses.filter(res => res !== null);
        return validResponses.map(book => ({
          id: book.id,
          cover_url: book.cover_url
        }));
      })
    );
  }

  getBookDetails(id: string | number): Observable<any> {
    return this.#http.get<any>(`${environment.apiUrl}/books/${id}`);
  }
}