import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
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
  isbn?: string;
  cover_url: string | null;
  authors: ReservationBookAuthor[];
}

export interface ReservationReader {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  region: number | null;
  date_joined: string;
  is_active: boolean;
}

export interface Reservation {
  id: number;
  status: ReservationStatus;
  start_time: string;
  end_time: string | null;
  updated_at: string;
  planned_end_time: string | null;
  library: ReservationLibrary;
  book: ReservationBook;
  reader?: ReservationReader;
}

interface PaginatedReservations {
  items: Reservation[];
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  #http = inject(HttpClient);
  #cache = inject(CacheService);

  #listCacheKey = `${environment.apiUrl}/reservations?page_size=100`;

  create(bookId: number, libraryId: number): Observable<Reservation> {
    return this.#http
      .post<Reservation>(`${environment.apiUrl}/reservations`, {
        book_id: bookId,
        library_id: libraryId,
      })
      .pipe(tap(() => this.#cache.clear(this.#listCacheKey)));
  }

  list(): Observable<Reservation[]> {
    return this.#http
      .get<PaginatedReservations>(this.#listCacheKey)
      .pipe(map((response) => response.items));
  }

  cancel(id: number): Observable<unknown> {
    return this.#http
      .delete(`${environment.apiUrl}/reservations/${id}`)
      .pipe(tap(() => this.#cache.clear(this.#listCacheKey)));
  }

  accept(id: number): Observable<Reservation> {
    return this.#http
      .put<Reservation>(`${environment.apiUrl}/reservations/${id}`, { status_id: 2 })
      .pipe(tap(() => this.#cache.clear(this.#listCacheKey)));
  }

  reject(id: number): Observable<Reservation> {
    return this.#http
      .put<Reservation>(`${environment.apiUrl}/reservations/${id}`, { status_id: 7 })
      .pipe(tap(() => this.#cache.clear(this.#listCacheKey)));
  }
}
