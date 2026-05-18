import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, StoreData, CosmeticItem } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store.html'
})
export class StoreComponent implements OnInit {
  storeData: StoreData | null = null;
  isLoading = true;
  currentUser: any = null;

  constructor(
    private storeService: StoreService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadStore();
  }

  loadStore() {
    this.isLoading = true;
    this.storeService.getStoreInfo().subscribe({
      next: (data) => {
        this.storeData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar loja', err);
        this.isLoading = false;
      }
    });
  }

  hasItem(id: string): boolean {
    return this.storeData?.owned_items.includes(id) || false;
  }

  isEquipped(id: string): boolean {
    return this.storeData?.active_cosmetic === id;
  }

  buy(item: CosmeticItem) {
    if (!this.storeData || this.storeData.balance < item.price) return;

    if (confirm(`Deseja comprar ${item.name} por ${item.price} SancCoins?`)) {
      this.storeService.buyItem(item.id).subscribe({
        next: () => {
          alert('Compra realizada com sucesso!');
          this.loadStore();
        },
        error: (err) => {
          alert(err.error?.error || 'Erro ao comprar item');
        }
      });
    }
  }

  equip(item: CosmeticItem) {
    this.storeService.equipItem(item.id).subscribe({
      next: () => {
        if (this.storeData) {
          this.storeData.active_cosmetic = item.id;
        }
        if (this.currentUser) {
          this.currentUser.active_cosmetic = item.css_class;
          this.authService.updateUserCosmetic(item.css_class);
        }
      },
      error: (err) => {
        alert(err.error?.error || 'Erro ao equipar item');
      }
    });
  }

  unequip() {
    this.storeService.equipItem(null).subscribe({
      next: () => {
        if (this.storeData) {
          this.storeData.active_cosmetic = null;
        }
        if (this.currentUser) {
          this.currentUser.active_cosmetic = null;
          this.authService.updateUserCosmetic(undefined);
        }
      }
    });
  }
}
