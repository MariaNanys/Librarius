import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable, of } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { catchError, finalize, tap } from 'rxjs/operators';

export interface User {
  sub: number;
  first_name: string;
  last_name: string;
  email: string;
  region: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #http: HttpClient = inject(HttpClient);

  constructor() {
    this.checkSessionTimeout();
    setInterval(() => {
    this.checkSessionTimeout();
  }, 60000)
  }
  currentUser = signal<User | null>(this.#getUserFromStorage());
  router: any;

  #getUserFromStorage(): User | null {
    const token = localStorage.getItem('token');
    return token ? jwtDecode(token) : null;
  }

  setUserToStorage(token: string) {
    this.currentUser.set(jwtDecode(token));
  }

  logout() {
    this.currentUser.set(null);
    this.#http.post(`${environment.apiUrl}/auth/logout`, {token: localStorage.getItem('token')}).pipe(
      catchError(() => {
        return of(null);
      }),
      finalize(() => {
        this.router.navigate(['/auth/login']);
        localStorage.clear();
      })
    ).subscribe();
  }

  logoutBackend(): Observable<any> {
    return this.#http.post(environment.apiUrl + '/auth/logout', { token: localStorage.getItem('token') });
  }

  register(data: any): Observable<any> {
    return this.#http.post(environment.apiUrl + '/auth/register', data);
  }

  login(credentials: any) {
    return this.#http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        const now = new Date().getTime();
        localStorage.setItem('token', response.token);
        localStorage.setItem('login_timestamp', now.toString());

        this.currentUser.set(response.user);
      })
    );
  }

  getUserProfile(userId: string | number): Observable<any> {
    return this.#http.get(environment.apiUrl + '/users/' + userId);
  }

  updateUser(userId: number, data: Partial<User>): Observable<any> {
    return this.#http.put(environment.apiUrl + '/users/' + userId, data);
  }

  public checkSessionTimeout() {
    const loginTime = localStorage.getItem('login_timestamp');
    if (!loginTime) return;

    const now = new Date().getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (now - Number(loginTime) > oneDayInMs) {
      console.warn('Sesja wygasła (minęły 24h). Wylogowywanie...');
      this.logout();
    }
  }
}