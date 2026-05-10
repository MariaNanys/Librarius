import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Library {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  region: number | null;
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  #http = inject(HttpClient);

  get(id: number): Observable<Library> {
    return this.#http.get<Library>(`${environment.apiUrl}/libraries/${id}`);
  }
}
