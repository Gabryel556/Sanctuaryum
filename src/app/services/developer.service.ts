import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Bot {
  id: string;
  bot_name: string;
  token?: string;
  tokenVisible?: boolean;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeveloperService {
  private readonly API_URL = 'http://localhost:3000/api/developer/bots';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  listBots(): Observable<Bot[]> {
    return this.http.get<Bot[]>(this.API_URL, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createBot(botName: string): Observable<Bot> {
    return this.http.post<Bot>(this.API_URL, { bot_name: botName }, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
