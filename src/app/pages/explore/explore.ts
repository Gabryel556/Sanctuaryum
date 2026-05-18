import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.html',
  styleUrl: './explore.css'
})
export class ExploreComponent implements OnInit {
  currentMode: 'social' | 'community' = 'social';
  searchTerm: string = '';
  activeTag: string = 'Todos';

  hero = {
    prefix: 'Seu mundo, ',
    gradient: 'criado por você.',
    subtitle: 'Fotos, momentos e música em harmonia.',
    featTitle: 'Em Alta',
    feedTitle: 'Feed'
  };

  tags: string[] = [];
  socialData: any[] = [];
  serverData: any[] = [];
  displayData: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.setMode('social');
  }

  setMode(mode: 'social' | 'community') {
    this.currentMode = mode;
    this.activeTag = 'Todos';
    this.searchTerm = '';

    if (mode === 'social') {
      this.hero = {
        prefix: 'Seu mundo, ',
        gradient: 'criado por você.',
        subtitle: 'Fotos, momentos e música em harmonia.',
        featTitle: 'Em Alta',
        feedTitle: 'Feed'
      };
      this.tags = ['Todos', 'Fotografia', 'Música', 'Arte', 'Tech', 'Lifestyle'];
      this.loadSocialData();
    } else {
      this.hero = {
        prefix: 'Encontre sua ',
        gradient: 'Galera.',
        subtitle: 'Servidores, chats de voz e comunidades.',
        featTitle: 'Ascendidos (Top Boost)',
        feedTitle: 'Explorar Servidores'
      };
      this.tags = ['Todos', 'Jogos', 'Dev', 'RPG', 'Anime', 'Hardware'];
      this.loadServerData();
    }
  }

  loadSocialData() {
    this.http.get<any[]>('http://localhost:3000/api/posts/feed', {
      headers: this.authService.getAuthHeaders()
    }).subscribe({
      next: (posts) => {
        this.socialData = posts.map(p => ({
          id: p.id,
          title: p.content,
          likes: p.likes_count,
          author: { username: p.author_username },
          tags: ['Geral']
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erro ao carregar posts para exploração:', err);
      }
    });
  }

  loadServerData() {
    this.http.get<any[]>('http://localhost:3000/api/servers/explore', {
      headers: this.authService.getAuthHeaders()
    }).subscribe({
      next: (servers) => {
        this.serverData = servers.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          icon_url: s.icon_url,
          members_count: s.members_count,
          is_promoted: s.is_promoted,
          tags: s.is_promoted ? ['Destaque'] : ['Comunidade']
        }));
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erro ao carregar servidores para exploração:', err);
      }
    });
  }

  filterByTag(tag: string) {
    this.activeTag = tag;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    const source = this.currentMode === 'social' ? this.socialData : this.serverData;
    const term = this.searchTerm.toLowerCase();

    this.displayData = source.filter((item: any) => {
      const name = (item.title || item.name || '').toLowerCase();
      const itemTags = item.tags || [];
      
      const matchesSearch = name.includes(term);
      const matchesTag = this.activeTag === 'Todos' || itemTags.includes(this.activeTag);

      return matchesSearch && matchesTag;
    });
  }
}