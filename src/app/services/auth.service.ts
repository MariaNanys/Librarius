import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { jwtDecode } from "jwt-decode";

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

    currentUser = signal<User | null>(this.#getUserFromStorage());

    #getUserFromStorage(): User | null {
        const token = localStorage.getItem('token');
        return token ? jwtDecode(token) : null;
    }

    setUserToStorage(token: string) {
        this.currentUser.set(jwtDecode(token));
    }

    logout() {
        this.logoutBackend().subscribe((result) => {
        localStorage.removeItem('token');
        this.currentUser.set(null);
        })
    }

    logoutBackend(): Observable<any> {
        return this.#http.post(environment.apiUrl + '/auth/logout', {token:localStorage.getItem('token')});
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

    updateUser(userId: number, data: Partial<User>): Observable<any> {
    return this.#http.put(environment.apiUrl + '/users/'+userId, data);
    }
}