import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class SearchAdvanceService {
  #http: HttpClient = inject(HttpClient);

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
    return this.#http.get(`${environment.apiUrl}/search/books/advanced`, {
      params: payload
    });
  }
}