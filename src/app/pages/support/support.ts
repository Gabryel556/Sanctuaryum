import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../services/support.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.html'
})
export class SupportComponent implements OnInit {
  // Estado de Autenticação
  supportKey: string = '';
  isAuthorized: boolean = false;
  operatorLevel: string = '';
  operatorName: string = '';

  // Métricas do Dashboard
  metrics: any = null;
  auditTrail: any[] = [];

  // Pesquisa e Gerenciamento
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedUser: any = null;

  // Formulários de Ação
  actionAmount: number = 0;
  actionReason: string = '';
  actionCosmetic: string = '';
  actionRole: string = 'membro';

  constructor(
    private supportService: SupportService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const savedKey = localStorage.getItem('sanct_support_key');
    if (savedKey) {
      this.supportKey = savedKey;
      this.authenticate();
    }
  }

  authenticate() {
    if (!this.supportKey.trim()) return;

    this.supportService.verifyKey(this.supportKey).subscribe({
      next: (res) => {
        this.isAuthorized = true;
        this.operatorLevel = res.level;
        this.operatorName = res.operator.username;
        localStorage.setItem('sanct_support_key', this.supportKey);
        this.loadDashboard();
      },
      error: (err) => {
        alert(err.error?.error || 'Chave inválida ou expirada.');
        this.logout();
      }
    });
  }

  loadDashboard() {
    this.supportService.getOverview(this.supportKey).subscribe({
      next: (res) => {
        this.metrics = res;
        this.auditTrail = res.recent_actions;
      },
      error: () => this.logout()
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) return;
    this.supportService.searchUsers(this.supportKey, this.searchQuery).subscribe({
      next: (res) => this.searchResults = res,
      error: (err) => console.error(err)
    });
  }

  selectUser(userId: string) {
    this.supportService.getUserDetails(this.supportKey, userId).subscribe({
      next: (res) => this.selectedUser = res,
      error: (err) => alert('Erro ao buscar detalhes.')
    });
  }

  executeAction(actionType: string) {
    if (!this.selectedUser) return;

    const payload: any = { action_type: actionType };

    if (['MINT_COINS', 'DEBIT_COINS'].includes(actionType)) {
      payload.amount = this.actionAmount;
    } else if (actionType === 'BAN') {
      if (!this.actionReason) return alert('Informe o motivo da suspensão.');
      payload.text = this.actionReason;
    } else if (actionType === 'SET_COSMETIC') {
      payload.text = this.actionCosmetic;
    } else if (actionType === 'SET_ROLE') {
      payload.text = this.actionRole;
    }

    this.supportService.executeAction(this.supportKey, this.selectedUser.id, payload).subscribe({
      next: (res) => {
        alert(res.message || 'Ação executada com sucesso.');
        this.selectUser(this.selectedUser.id); // Recarrega os dados do usuário
        this.loadDashboard(); // Atualiza as métricas globais
      },
      error: (err) => alert(err.error?.error || 'Falha ao executar ação.')
    });
  }

  logout() {
    this.isAuthorized = false;
    this.supportKey = '';
    this.selectedUser = null;
    localStorage.removeItem('sanct_support_key');
  }
}