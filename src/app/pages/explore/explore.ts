import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './explore.html',
  styleUrl: './explore.css'
})
export class ExploreComponent implements OnInit {
  // 1. Estado da Página
  currentMode: 'social' | 'community' = 'social';
  searchTerm: string = '';
  activeTag: string = 'Todos';

  // 2. Dados Dinâmicos do Hero (Título e Subtítulo)
  hero = {
    prefix: 'Seu mundo, ',
    gradient: 'criado por você.',
    subtitle: 'Fotos, momentos e música em harmonia.',
    featTitle: 'Em Alta',
    feedTitle: 'Para Você'
  };

  // 3. Tags
  tags: string[] = [];
  
  // 4. Dados (Simulando o que viria da API)
  socialData = [
    { title: 'Cyberpunk City Night', author: { username: 'NeoDev' }, likes: 120, img: 'https://via.placeholder.com/300x150/1e1b4b/fff', tags: ['Arte', 'Tech'] },
    { title: 'Setup Minimalista', author: { username: 'DesignMaster' }, likes: 85, img: 'https://via.placeholder.com/300x150/333/fff', tags: ['Tech', 'Lifestyle'] },
    { title: 'Abstract Flow', author: { username: 'ArtBot' }, likes: 45, img: 'https://via.placeholder.com/300x150/555/fff', tags: ['Arte'] }
  ];

  serverData = [
    { name: 'Dev House BR', members: 4500, icon: 'https://via.placeholder.com/50/222/fff', banner: 'https://via.placeholder.com/300x100/111/fff', tags: ['Dev', 'Tech'] },
    { name: 'RPG Tavern', members: 1200, icon: 'https://via.placeholder.com/50/444/fff', banner: 'https://via.placeholder.com/300x100/222/fff', tags: ['RPG', 'Jogos'] }
  ];

  // Dados que estão sendo mostrados na tela agora
  displayData: any[] = [];

  constructor() {}

  ngOnInit() {
    this.setMode('social');
  }

  // Lógica de Troca de Modo
  setMode(mode: 'social' | 'community') {
    this.currentMode = mode;
    this.activeTag = 'Todos'; // Reseta filtro
    this.searchTerm = ''; // Reseta busca

    if (mode === 'social') {
      this.hero = {
        prefix: 'Seu mundo, ',
        gradient: 'criado por você.',
        subtitle: 'Fotos, momentos e música em harmonia.',
        featTitle: 'Em Alta',
        feedTitle: 'Feed'
      };
      this.tags = ['Todos', 'Fotografia', 'Música', 'Arte', 'Tech', 'Lifestyle'];
      this.displayData = this.socialData;
    } else {
      this.hero = {
        prefix: 'Encontre sua ',
        gradient: 'Galera.',
        subtitle: 'Servidores, chats de voz e comunidades.',
        featTitle: 'Ascendidos (Top Boost)',
        feedTitle: 'Explorar Servidores'
      };
      this.tags = ['Todos', 'Jogos', 'Dev', 'RPG', 'Anime', 'Hardware'];
      this.displayData = this.serverData;
    }
  }

  // Lógica de Filtro por Tag
  filterByTag(tag: string) {
    this.activeTag = tag;
    this.applyFilters();
  }

  // Lógica de Busca
  onSearch() {
    this.applyFilters();
  }

  // Aplica Busca + Tag
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