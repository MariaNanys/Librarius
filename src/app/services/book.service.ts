import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BookCover {
  id: number;
  cover_url: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  #http = inject(HttpClient);

  /**
   * Losuje 8 unikalnych ID i pobiera ich dane równolegle.
   */
  getRandomCovers(): Observable<BookCover[]> {
    // 1. Losujemy 8 UNIKALNYCH liczb z przedziału 1 - 1349 za pomocą Set
    const randomIds = new Set<number>();
    while (randomIds.size < 8) {
      randomIds.add(Math.floor(Math.random() * 1349) + 1);
    }

    // 2. Tworzymy tablicę 8 zapytań HTTP
    const requests: Observable<any>[] = Array.from(randomIds).map(id => 
      this.#http.get<any>(`${environment.apiUrl}/books/${id}`).pipe(
        // Jeśli backend rzuci np. 404 (książka nie istnieje), zwracamy null zamiast wywalać całą stronę
        catchError(() => of(null)) 
      )
    );

    // 3. forkJoin wysyła wszystkie 8 zapytań naraz i czeka na ich zakończenie
    return forkJoin(requests).pipe(
      map(responses => {
        // KAMERA 1: Sprawdzamy, co zwróciły wszystkie zapytania
        console.log('[Service] Surowe odpowiedzi z 8 zapytań:', responses);

        const validResponses = responses.filter(res => res !== null);
        
        // KAMERA 2: Sprawdzamy, ile zapytań nie zwróciło błędu (nie jest nullem)
        console.log(`[Service] Poprawnych książek (bez błędów): ${validResponses.length}`);

        return validResponses.map(book => ({
          id: book.id,
          cover_url: book.cover_url
        }));
      })
    );
  }

  // Twoja przyszła metoda dla pojedynczego widoku detali
  getBookDetails(id: string | number): Observable<any> {
    return this.#http.get<any>(`${environment.apiUrl}/books/${id}`);
  }
}