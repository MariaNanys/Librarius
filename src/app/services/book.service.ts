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

export interface Books {
  items: any[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
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

  searchResults = signal<SearchBookResult[]>([]);
  isSearchLoading = signal<boolean>(false);
  recentBooksCache = signal<BookCover[]>([]);

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalItems = signal<number>(0);

searchBooksByString(searchTerm: string, page: number = 1): Observable<any> {
  this.isSearchLoading.set(true);

  const params = new HttpParams()
    .set('q', searchTerm)
    .set('page', page.toString()); 

  return this.#http.get<any>(`${environment.apiUrl}/search/books`, { params }).pipe(
    tap(response => {
      if (response && response.items) {
        this.searchResults.set(response.items);
        this.currentPage.set(response.page);
        this.totalPages.set(response.total_pages);
      }
      this.isSearchLoading.set(false);
    })
  );
}

  getSpecificCovers(): Observable<BookCover[]> {
    if (this.recentBooksCache().length > 0) {
      return of(this.recentBooksCache());
    }

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
        
        this.recentBooksCache.set(mappedBooks);
        return mappedBooks;
      })
    );
  }

  getBooks(page: number = 0, limit: number = 12): Observable<Books> {
    return this.#http.get<any>(`${environment.apiUrl}/books?page=${page}&page_size=${limit}`);
  }

  getBookDetails(id: string | number): Observable<any> {
    return this.#http.get<any>(`${environment.apiUrl}/books/${id}`);
  }
}