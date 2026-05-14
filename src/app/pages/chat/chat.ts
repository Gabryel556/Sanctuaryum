import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CryptoService } from '../../services/crypto.service';
import { DecryptPipe } from '../../pipes/decrypt.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DecryptPipe],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent implements OnInit {
  
  // 1. Dados
  currentUser = { username: 'Visitante', tag: '#0000', avatar: 'assets/images/avatar.jpg' };
  serverName = 'Sanctuaryum Oficial';
  currentChannelName = 'geral';
  
  channels = [
    { id: 1, name: 'geral', type: 'text', active: true },
    { id: 2, name: 'desenvolvimento', type: 'text', active: false },
    { id: 3, name: 'memes', type: 'text', active: false }
  ];

  messages: any[] = [];
  members = [
    { username: 'NeoDev', status: 'online', color: '#fff', avatar: '', role: 'Admin' },
    { username: 'Admin', status: 'dnd', color: '#ef4444', avatar: '', role: 'Mod' }
  ];

  newMessage = '';
  selectedMember: any = null;
  
  // Player
  isPlayerCollapsed = false;
  isPlaying = false;
  currentTrack = { title: 'Neon Blade', artist: 'MoonDeity', cover: '' };

  constructor(
    private cdr: ChangeDetectorRef,
    private crypto: CryptoService
  ) {}

  ngOnInit() {
    this.loadUser();
    // Mensagem de boas vindas cifrada
    const welcome = this.crypto.encrypt("Bem-vindo ao Sanctuaryum (Secure Channel).");
    this.messages.push({ username: 'Sistema', text: welcome, time: '10:00', avatar: '' });
  }

  loadUser() {
    const userStr = localStorage.getItem('sanc_user');
    if (userStr) this.currentUser = JSON.parse(userStr);
  }

  switchChannel(channel: any) {
    this.channels.forEach(c => c.active = false);
    channel.active = true;
    this.currentChannelName = channel.name;
    this.messages = [];
    
    setTimeout(() => {
        const msg = this.crypto.encrypt(`Você entrou em #${channel.name}`);
        this.messages.push({ username: 'Sistema', text: msg, time: 'Agora', avatar: '' });
        this.cdr.detectChanges();
    }, 100);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    // Encripta e Loga no Console
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