import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  activeTab: string = 'account';
  userEmail: string = '';
  username: string = '';

  // 2FA variables
  is2faEnabled: boolean = false;
  show2faSetup: boolean = false;
  twoFaSecret: string = '';
  twoFaQrUrl: string = '';
  twoFaSetupCode: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.userEmail = user.email;
      this.username = user.username;
      // We can check if 2FA is active based on a flag or state, or keep track of it
      // Let's call /api/auth/me or verify in user object. Wait, the user object can have a 2fa field
      // Let's assume user.is_2fa_enabled can be checked or we just query/track.
      // For now, let's assume we can enable it dynamically.
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  start2FaSetup() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.enable2Fa().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.twoFaSecret = res.secret;
        // Use standard secure QR generator API
        this.twoFaQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=8b5cf6&bgcolor=18181b&data=${encodeURIComponent(res.otpauth_url)}`;
        this.show2faSetup = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Erro ao iniciar setup de 2FA.';
      }
    });
  }

  confirm2FaSetup() {
    if (!this.twoFaSetupCode || this.twoFaSetupCode.length < 6) {
      this.errorMessage = 'Insira um código de 6 dígitos.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verify2FaSetup(this.twoFaSetupCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.is2faEnabled = true;
        this.show2faSetup = false;
        this.successMessage = res.message || '2FA ativado com sucesso!';
        // Update user state if needed
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Código incorreto. Tente novamente.';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}