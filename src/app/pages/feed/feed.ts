import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserPublic } from '../../services/auth.service';
import { PostService, Post } from '../../services/post.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.html',
  styleUrl: './feed.css'
})
export class FeedComponent implements OnInit {
  currentUser: UserPublic | null = null;
  posts: Post[] = [];
  newPostContent = '';
  isComposing = false;
  isLoadingFeed = true;

  trendingTags = ['#Fotografia', '#GameDev', '#MúsicaIndie', '#CyberArt', '#RetroWave'];

  suggestedUsers = [
    { username: 'NeoDev', bio: 'Full-stack & Cyberpunk', avatar: '' },
    { username: 'ArtBot', bio: 'Digital Art & AI', avatar: '' },
    { username: 'SynthWave', bio: 'Produtor Musical', avatar: '' },
  ];

  constructor(
    private authService: AuthService,
    private postService: PostService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    this.loadFeed();
  }

  loadFeed() {
    this.isLoadingFeed = true;
    this.postService.getFeed(1).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoadingFeed = false;
      },
      error: (err) => {
        console.error('Erro ao carregar feed', err);
        this.isLoadingFeed = false;
      }
    });
  }

  createPost() {
    if (!this.newPostContent.trim()) return;
    this.isComposing = true;
    this.postService.createPost(this.newPostContent).subscribe({
      next: (newPost) => {
        this.posts.unshift(newPost);
        this.newPostContent = '';
        this.isComposing = false;
      },
      error: (err) => {
        console.error('Erro ao criar post', err);
        this.isComposing = false;
      }
    });
  }

  toggleLike(post: Post) {
    // Otimista
    post.is_liked = !post.is_liked;
    post.likes_count += post.is_liked ? 1 : -1;
    
    this.postService.likePost(post.id).subscribe({
      error: (err) => {
        // Reverter em caso de erro
        post.is_liked = !post.is_liked;
        post.likes_count += post.is_liked ? 1 : -1;
        console.error('Erro ao curtir post', err);
      }
    });
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  getInitial(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  getAvatarColor(username: string): string {
    const colors = ['#8b5cf6', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
