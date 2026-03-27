import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
  // NOWY SYGNAŁ NA NOWOŚCI Z HOME:
  recentBooksCache = signal<BookCover[]>([]);

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
    const params = new HttpParams().set('q', searchTerm);

    return this.#http.get<SearchBookResult[]>(`${environment.apiUrl}/search/books`, { params }).pipe(
      tap({
        next: (results) => {
          console.log('[Service] Otrzymano wyniki wyszukiwania:', results);
          this.searchResults.set(results);
          this.isSearchLoading.set(false);
        },
        error: (err) => {
          console.error('[Service] Błąd wyszukiwania:', err);
          this.searchResults.set([]);
          this.isSearchLoading.set(false);
        }
      })
    );
  }
  

  // ==========================================
  // POZOSTAŁE METODY
  // ==========================================

  /**
   * Pobiera konkretne okładki książek na podstawie sztywnej listy ID.
   */
 getSpecificCovers(): Observable<BookCover[]> {
    // 1. SPRAWDZAMY CZY MAMY JUŻ DANE W SYGNALE
    if (this.recentBooksCache().length > 0) {
      console.log('[Service] Zwracam nowości z Sygnału (bez zapytania HTTP)');
      // Zwracamy gotowe dane z sygnału udając odpowiedź HTTP za pomocą 'of()'
      return of(this.recentBooksCache());
    }

    // 2. JEŚLI NIE MAMY DANYCH, ROBIMY ZAPYTANIE (tylko za pierwszym razem)
    const specificIds = [56, 59, 60, 62, 63, 78, 89, 90];

    const requests: Observable<any>[] = specificIds.map(id => 
      this.#http.get<any>(`${environment.apiUrl}/books/${id}`).pipe(
        catchError(() => of(null)) 
      )
    );

    return forkJoin(requests).pipe(
      map(responses => {
        const validResponses = responses.filter(res => res !== null);
        const mappedBooks = validResponses.map(book => ({
          id: book.id,
          cover_url: book.cover_url
        }));
        
        // 3. ZAPISUJEMY WYNIK DO SYGNAŁU NA PRZYSZŁOŚĆ
        this.recentBooksCache.set(mappedBooks);
        
        return mappedBooks;
      })
    );
  }

  getBookDetails(id: string | number): Observable<any> {
    return this.#http.get<any>(`${environment.apiUrl}/books/${id}`);
  }
}