import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  price: number;
  css_class: string;
}

export interface StoreData {
  balance: number;
  active_cosmetic: string | null;
  items: CosmeticItem[];
  owned_items: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private API_URL = 'http://localhost:3000/api/store';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getStoreInfo(): Observable<StoreData> {
    return this.http.get<StoreData>(this.API_URL, {
      headers: this.authService.getAuthHeaders()
    });
  }

  buyItem(cosmeticId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/buy`, { cosmetic_id: cosmeticId }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  equipItem(cosmeticId: string | null): Observable<any> {
    return this.http.post('http://localhost:3000/api/users/me/equip', { cosmetic_id: cosmeticId }, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
