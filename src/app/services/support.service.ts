import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class SupportService {
    private readonly API_URL = 'http://localhost:3000/api/support';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeadersWithKey(supportKey: string): HttpHeaders {
        return this.authService.getAuthHeaders().set('X-Support-Key', supportKey);
    }

    verifyKey(key: string): Observable<any> {
        return this.http.post(`${this.API_URL}/verify-key`, { key }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    getOverview(key: string): Observable<any> {
        return this.http.get(`${this.API_URL}/overview`, {
            headers: this.getHeadersWithKey(key)
        });
    }

    searchUsers(key: string, query: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/users/search?q=${query}`, {
            headers: this.getHeadersWithKey(key)
        });
    }

    getUserDetails(key: string, userId: string): Observable<any> {
        return this.http.get(`${this.API_URL}/users/${userId}/details`, {
            headers: this.getHeadersWithKey(key)
        });
    }

    executeAction(key: string, userId: string, payload: any): Observable<any> {
        return this.http.post(`${this.API_URL}/users/${userId}/action`, payload, {
            headers: this.getHeadersWithKey(key)
        });
    }
}