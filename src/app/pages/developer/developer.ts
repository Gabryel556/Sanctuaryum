import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeveloperService, Bot } from '../../services/developer.service';

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './developer.html',
  styleUrl: './developer.css'
})
export class DeveloperComponent implements OnInit {
  bots: Bot[] = [];
  newBotName = '';
  isCreating = false;
  showCreateForm = false;

  constructor(private developerService: DeveloperService) { }

  ngOnInit() {
    this.loadBots();
  }

  loadBots() {
    this.developerService.listBots().subscribe({
      next: (bots) => {
        this.bots = bots.map(b => ({ ...b, tokenVisible: false }));
      },
      error: (err) => {
        console.error('Erro ao carregar bots do servidor', err);
      }
    });
  }

  createBot() {
    if (!this.newBotName.trim()) return;
    this.isCreating = true;

    this.developerService.createBot(this.newBotName).subscribe({
      next: (newBot) => {
        // O token só é retornado na criação e deve ficar visível para o desenvolvedor copiar
        const botWithVisibility = {
          ...newBot,
          tokenVisible: true
        };
        this.bots.unshift(botWithVisibility);
        this.newBotName = '';
        this.isCreating = false;
        this.showCreateForm = false;
      },
      error: (err) => {
        console.error('Erro ao criar bot no servidor', err);
        this.isCreating = false;
      }
    });
  }

  toggleToken(bot: Bot) {
    bot.tokenVisible = !bot.tokenVisible;
  }

  copyToken(token: string | undefined) {
    if (token) {
      navigator.clipboard.writeText(token);
    }
  }

  getMaskedToken(token: string | undefined): string {
    if (!token) return 'SANC.BOT.••••••••••••••••••••••••';
    return token.substring(0, 15) + '••••••••••••••••••••';
  }
}
