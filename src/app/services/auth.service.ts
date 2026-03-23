import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class AuthService {
    #http: HttpClient = inject(HttpClient);

    currentUser = signal<{ first_name: string } | null>(this.#getUserFromStorage());

    #getUserFromStorage() {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    setCurrentUser(user: { first_name: string }) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
    }
    // W pliku auth.service.ts upewnij się, że metoda logout wygląda tak:
  logout() {
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // <-- Dodajemy usunięcie tokena!
      this.currentUser.set(null);
  }

    register(data: any): Observable<any> {
        return this.#http.post(environment.apiUrl + '/auth/register', data);
    }
    login(data: any): Observable<any> {
        return this.#http.post(environment.apiUrl + '/auth/login', data);
    }

}