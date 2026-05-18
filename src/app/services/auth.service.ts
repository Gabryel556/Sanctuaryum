import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  created_at: string;
  sanc_coins?: number;
  active_cosmetic?: string;
}

export interface AuthResponse {
  requires_2fa: boolean;
  challenge_token?: string;
  token?: string;
  user?: UserPublic;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'sanctuaryum_token';
  private readonly USER_KEY = 'sanctuaryum_user';

  private currentUser$ = new BehaviorSubject<UserPublic | null>(this.getStoredUser());

  constructor(private http: HttpClient) { }

  register(email: string, username: string, password: string, confirmPassword: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, {
      email,
      username,
      password,
      confirm_password: confirmPassword,
    }).pipe(
      tap(response => {
        if (response.token) {
          this.handleAuthSuccess(response);
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, {
      email,
      password,
    }).pipe(
      tap(response => {
        if (!response.requires_2fa && response.token) {
          this.handleAuthSuccess(response);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser$.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): Observable<UserPublic | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserValue(): UserPublic | null {
    return this.currentUser$.getValue();
  }

  updateUserCosmetic(cssClass?: string) {
    const user = this.currentUser$.getValue();
    if (user) {
      user.active_cosmetic = cssClass;
      this.currentUser$.next({ ...user });
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  enable2Fa(): Observable<{ secret: string; otpauth_url: string; message: string }> {
    return this.http.post<{ secret: string; otpauth_url: string; message: string }>(
      `${this.API_URL}/enable-2fa`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  verify2FaSetup(code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/verify-2fa-setup`,
      { code },
      { headers: this.getAuthHeaders() }
    );
  }

  login2Fa(token: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login-2fa`, {
      token,
      code
    }).pipe(
      tap(response => {
        if (response.token) {
          this.handleAuthSuccess(response);
        }
      })
    );
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (response.token && response.user) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      this.currentUser$.next(response.user);
    }
  }

  private getStoredUser(): UserPublic | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
