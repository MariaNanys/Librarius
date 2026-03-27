import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";

export interface User {
    first_name: string;
    last_name: string;
    email: string;
    province: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    #http: HttpClient = inject(HttpClient);

    currentUser = signal<User | null>(this.#getUserFromStorage());

    #getUserFromStorage(): User | null {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    setCurrentUser(user: User) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
    }

    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.currentUser.set(null);
    }

    register(data: any): Observable<any> {
        return this.#http.post(environment.apiUrl + '/auth/register', data);
    }

    login(data: any): Observable<any> {
        return this.#http.post(environment.apiUrl + '/auth/login', data);
    }

    getUserProfile(userId: string | number): Observable<any> {
        return this.#http.get(environment.apiUrl + '/users/' + userId);
    }
}