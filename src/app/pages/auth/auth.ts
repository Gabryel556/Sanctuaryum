import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent {
  isLoginMode = true;
  is2faMode = false;
  challengeToken = '';
  twoFactorCode = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  rememberMe = false;

  loginEmail = '';
  loginPassword = '';
  regEmail = '';
  regUsername = '';
  regPassword = '';
  regConfirmPassword = '';

  showLoginPassword = false;
  showRegPassword = false;
  showRegConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.is2faMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.requires_2fa) {
          this.is2faMode = true;
          this.challengeToken = res.challenge_token || '';
          this.successMessage = 'Por favor, insira o código 2FA do seu aplicativo.';
          setTimeout(() => this.successMessage = '', 3000);
        } else {
          this.router.navigate(['/feed']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Erro ao fazer login.';
      }
    });
  }

  onVerify2Fa(): void {
    if (!this.twoFactorCode || this.twoFactorCode.length < 6) {
      this.errorMessage = 'Insira um código de 6 dígitos.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login2Fa(this.challengeToken, this.twoFactorCode).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Código inválido ou expirado.';
      }
    });
  }

  onRegister(): void {
    if (!this.regEmail || !this.regUsername || !this.regPassword || !this.regConfirmPassword) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }
    if (this.regPassword !== this.regConfirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }
    if (this.regPassword.length < 8) {
      this.errorMessage = 'A senha deve ter pelo menos 8 caracteres.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.regEmail, this.regUsername, this.regPassword, this.regConfirmPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Conta criada com sucesso!';
        setTimeout(() => this.router.navigate(['/feed']), 800);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Erro ao criar conta.';
      }
    });
  }
}
