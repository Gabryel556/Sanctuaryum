import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../services/crypto.service';
import { DecryptPipe } from '../../pipes/decrypt.pipe';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DecryptPipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent implements OnInit {

  currentUser = { username: 'Visitante', tag: '#0000', avatar: '' };
  serverName = 'Sanctuaryum Nexus';
  currentChannelName = 'Frequência Geral';

  channels = [
    { id: 1, name: 'Geral', type: 'text', active: true },
    { id: 2, name: 'Avisos', type: 'text', active: false },
    { id: 3, name: 'Lounge (Voz)', type: 'voice', active: false }
  ];

  messages: any[] = [];
  members: any[] = [];

  newMessage = '';
  selectedMember: any = null;

  isPlayerCollapsed = false;
  isPlaying = false;
  currentTrack = { title: 'Neon Blade', artist: 'MoonDeity', cover: '' };

  constructor(
    private cdr: ChangeDetectorRef,
    private crypto: CryptoService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.loadUser();

    try {
      const myJwk = await this.crypto.generateMyKeys();
      await this.crypto.computeSharedSecret(myJwk);
    } catch (e) {
      console.error("Erro na inicialização da criptografia de chaves:", e);
    }
  }

  loadUser() {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.currentUser = {
        username: user.username,
        tag: '#' + user.id.substring(0, 4),
        avatar: ''
      };
    }
  }

  switchChannel(channel: any) {
    this.channels.forEach(c => c.active = false);
    channel.active = true;
    this.currentChannelName = channel.name;
    this.messages = [];

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const encrypted = this.crypto.encrypt(this.newMessage);
    console.log('🔒 [Chat] Msg Cifrada:', encrypted);

    this.messages.push({
      username: this.currentUser.username,
      text: encrypted,
      time: 'Agora',
      avatar: this.currentUser.avatar
    });

    this.newMessage = '';
    setTimeout(() => {
      const list = document.getElementById('messages-list');
      if (list) list.scrollTop = list.scrollHeight;
    }, 50);
  }

  viewProfile(member: any) { this.selectedMember = member; }
  closeProfile() { this.selectedMember = null; }
  togglePlayer() { this.isPlayerCollapsed = !this.isPlayerCollapsed; }
  togglePlay() { this.isPlaying = !this.isPlaying; }
}