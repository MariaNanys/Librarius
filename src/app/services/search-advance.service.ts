import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookService } from './book.service';

@Injectable({
  providedIn: 'root'
})
export class SearchAdvanceService {
  #http: HttpClient = inject(HttpClient);
  #bookService: BookService = inject(BookService);

  getAuthors(): Observable<{ id: number; name: string }[]> {
    return this.#http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/authors`);
  }

  getCategories(): Observable<{ id: number; name: string }[]> {
    return this.#http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/categories`);
  }

  getLanguages(): Observable<{ code: string; display: string }[]> {
    return this.#http.get<{ code: string; display: string }[]>(`${environment.apiUrl}/books/languages`);
  }

  searchBooks(payload: any): Observable<any> {
    return this.#http.get(`${environment.apiUrl}/search/books`, {
      params: payload
    });
  }

  searchAdvanced(payload: any): Observable<any> {
    return this.#http.get<any>(`${environment.apiUrl}/search/books/advanced`, { params: payload }).pipe(
      tap(response => {
        if (response && response.items) {
          this.#bookService.searchResults.set(response.items);
          this.#bookService.currentPage.set(response.page);
          this.#bookService.totalPages.set(response.total_pages);
        }
        this.#bookService.isSearchLoading.set(false);
      })
    );
  }
}