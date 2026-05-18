import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService, UserPublic } from '../../services/auth.service';

interface SupportActionLog {
  id: string;
  operator_username: string;
  action_type: string;
  target_username: string | null;
  details: string;
  created_at: string;
}

interface SupportOverview {
  total_users: number;
  coins_in_circulation: number;
  pending_deletions: number;
  active_bots: number;
  flagged_posts: number;
  total_keys: number;
  recent_actions: SupportActionLog[];
}

interface SupportUserDetail {
  id: string;
  username: string;
  email: string;
  created_at: string;
  sanc_coins: number;
  active_cosmetic: string | null;
  avatar_url: string | null;
  is_verified_artist: boolean;
  role: string;
  is_suspended: boolean;
  deletion_days_remaining: number | null;
  history: SupportActionLog[];
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.html',
  styleUrl: './support.css'
})
export class SupportComponent implements OnInit {
  accessKey = '';
  accessLevel: 'none' | 'pagamento' | 'tecnico' | 'moderacao' | 'master' = 'none';
  accessGranted = false;
  errorMessage = '';
  sessionKey = '';
  operator: UserPublic | null = null;

  // Overview / Stats
  overview: SupportOverview | null = null;

  // User search & detail
  searchQuery = '';
  searchResults: UserPublic[] = [];
  selectedUser: SupportUserDetail | null = null;
  selectedUserLoading = false;

  // Actions fields
  actionAmount: number | null = null;
  actionText = '';

  // Demo key generator
  newKeyGenerated = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // If the operator has a saved support session key, retrieve it
    const storedKey = localStorage.getItem('sanc_support_session_key');
    if (storedKey) {
      this.accessKey = storedKey;
      this.verifyKey();
    }
  }

  // Obter cabeçalhos com a chave de suporte
  getSupportHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Support-Key': this.sessionKey,
      'Content-Type': 'application/json'
    });
  }

  // Gerar Nova Chave de Teste vinculado à conta ativa do usuário
  generateTestKey() {
    this.errorMessage = '';
    const headers = this.authService.getAuthHeaders();
    this.http.post<{ key_code: string, level: string }>(
      'http://localhost:3000/api/support/generate-key',
      { level: 'master' },
      { headers }
    ).subscribe({
      next: (res) => {
        this.newKeyGenerated = res.key_code;
        this.accessKey = res.key_code;
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Erro ao gerar chave de suporte para testes.';
      }
    });
  }

  // Verificar Chave de Suporte
  verifyKey() {
    this.errorMessage = '';
    const key = this.accessKey.trim();

    if (!key) {
      this.errorMessage = 'Por favor, insira uma chave de acesso.';
      return;
    }

    this.http.post<{ key_id: string, operator: UserPublic, level: string }>(
      'http://localhost:3000/api/support/verify-key',
      { key }
    ).subscribe({
      next: (res) => {
        this.sessionKey = key;
        this.operator = res.operator;
        this.accessLevel = res.level as any;
        this.accessGranted = true;
        localStorage.setItem('sanc_support_session_key', key);
        this.loadOverview();
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Chave de suporte inválida, inativa ou expirada.';
        this.accessGranted = false;
        this.accessLevel = 'none';
        localStorage.removeItem('sanc_support_session_key');
      }
    });
  }

  // Carregar Visão Geral do Sistema
  loadOverview() {
    this.http.get<SupportOverview>(
      'http://localhost:3000/api/support/overview',
      { headers: this.getSupportHeaders() }
    ).subscribe({
      next: (res) => {
        this.overview = res;
      },
      error: (err) => {
        this.errorMessage = 'Erro ao carregar visão geral: ' + (err.error?.error || err.message);
      }
    });
  }

  // Buscar Usuário Independente
  searchUsers() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.http.get<UserPublic[]>(
      `http://localhost:3000/api/support/users/search?q=${encodeURIComponent(this.searchQuery)}`,
      { headers: this.getSupportHeaders() }
    ).subscribe({
      next: (res) => {
        this.searchResults = res;
      },
      error: (err) => {
        console.error('Erro na busca de habitantes:', err);
      }
    });
  }

  // Selecionar Habitante e ver Detalhes Exaustivos
  selectUser(user: UserPublic) {
    this.selectedUserLoading = true;
    this.selectedUser = null;

    this.http.get<SupportUserDetail>(
      `http://localhost:3000/api/support/users/${user.id}/details`,
      { headers: this.getSupportHeaders() }
    ).subscribe({
      next: (res) => {
        this.selectedUser = res;
        this.selectedUserLoading = false;
        // Limpar inputs de ações
        this.actionAmount = null;
        this.actionText = '';
      },
      error: (err) => {
        alert('Erro ao carregar detalhes do habitante: ' + (err.error?.error || err.message));
        this.selectedUserLoading = false;
      }
    });
  }

  // Executar Ação no Usuário com Auditoria
  executeAction(actionType: string) {
    if (!this.selectedUser) return;

    const payload = {
      action_type: actionType,
      amount: this.actionAmount,
      text: this.actionText
    };

    this.http.post<{ success: boolean, message: string }>(
      `http://localhost:3000/api/support/users/${this.selectedUser.id}/action`,
      payload,
      { headers: this.getSupportHeaders() }
    ).subscribe({
      next: (res) => {
        alert(res.message || 'Ação de suporte executada com sucesso.');
        // Recarregar dados do habitante selecionado e visão geral
        this.selectUser({ id: this.selectedUser!.id, username: this.selectedUser!.username, email: this.selectedUser!.email, created_at: this.selectedUser!.created_at });
        this.loadOverview();
      },
      error: (err) => {
        alert('Erro ao executar ação de suporte: ' + (err.error?.error || err.message));
      }
    });
  }

  // Encerrar Sessão
  logoutSupport() {
    this.accessGranted = false;
    this.accessLevel = 'none';
    this.accessKey = '';
    this.sessionKey = '';
    this.operator = null;
    this.overview = null;
    this.searchResults = [];
    this.selectedUser = null;
    this.newKeyGenerated = '';
    localStorage.removeItem('sanc_support_session_key');
  }
}
