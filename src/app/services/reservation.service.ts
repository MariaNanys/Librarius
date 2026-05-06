import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';

export interface ReservationStatus {
  id: number;
  name: string;
}

export interface ReservationLibrary {
  id: number;
  name: string;
  address: string;
  city: string;
  region: number;
}

export interface ReservationBookAuthor {
  id: number;
  name: string;
}

export interface ReservationBook {
  id: number;
  title: string;
  cover_url: string | null;
  authors: ReservationBookAuthor[];
}

export interface Reservation {
  id: number;
  status: ReservationStatus;
  start_time: string;
  end_time: string | null;
  library: ReservationLibrary;
  book: ReservationBook;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  #http = inject(HttpClient);
  #cache = inject(CacheService);

  #listCacheKey = `${environment.apiUrl}/reservations`;

  create(bookId: number, libraryId: number): Observable<Reservation> {
    return this.#http
      .post<Reservation>(`${environment.apiUrl}/reservations`, {
        book_id: bookId,
        library_id: libraryId,
      })
      .pipe(tap(() => this.#cache.clear(this.#listCacheKey)));
  }

  list(): Observable<Reservation[]> {
    return this.#http.get<Reservation[]>(`${environment.apiUrl}/reservations`);
  }

  cancel(id: number): Observable<unknown> {
    return this.#http
      .delete(`${environment.apiUrl}/reservations/${id}`)
      .pipe(tap(() => this.#cache.clear(this.#listCacheKey)));
  }
}
