import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { jwtDecode } from "jwt-decode";
import { tap } from 'rxjs/operators';
import { Router } from "@angular/router";

export interface User {
  sub: number;
  first_name: string;
  last_name: string;
  email: string;
  region: string;
  role_id?: number;
  library_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #http: HttpClient = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.checkSessionTimeout();
    setInterval(() => {
      this.checkSessionTimeout();
    }, 60000)
  }
  currentUser = signal<User | null>(this.#getUserFromStorage());
  isLibrarian = computed(() => {
    const user = this.currentUser();
    return !!user && !!user.role_id;
  });
  refreshUserFromProfile(profile: any) {
    const current = this.currentUser();
    if (current) {
      this.currentUser.set({
        ...current,
        first_name: profile.first_name,
        last_name: profile.last_name,
        region: profile.region,
        email: profile.email,
      });
    }
  }
  #getUserFromStorage(): User | null {
    const token = localStorage.getItem('token');
    return token ? jwtDecode(token) : null;
  }

  setUserToStorage(token: string) {
    this.currentUser.set(jwtDecode(token));
  }
  isLoggedIn(): boolean {
    return !!this.currentUser();
  }
  logout() {
    const token = localStorage.getItem('token');
    this.currentUser.set(null);
    if (token) {
      this.#http.post(`${environment.apiUrl}/auth/logout`, { token }).subscribe(()=> {
        this.router.navigate(['/login']);
        localStorage.removeItem('token');
        localStorage.removeItem('login_timestamp');
      });
    } 
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
    if (loginTime == null) return;

    const now = new Date().getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (now - Number(loginTime) > oneDayInMs) {
      console.warn('Sesja wygasła (minęły 24h). Wylogowywanie...');
      this.logout();
    }
  }
}