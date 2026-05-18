import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserPublic } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  activeTab: string = 'posts';
  isEditingBio = false;
  user: UserPublic | null = null;

  displayName = '';
  username = '';
  email = '';
  joinDate = '';
  bio = 'Ainda sem bio...';
  themeColor = '#8b5cf6';
  isVerifiedArtist = false;

  posts: any[] = [];
  postsLoaded = false;

  badges = ['Early Adopter'];
  colorOptions = ['#8b5cf6', '#6366f1', '#ec4899', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4'];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUserValue();
    if (this.user) {
      this.username = this.user.username;
      this.displayName = this.user.username;
      this.email = this.user.email;
      this.joinDate = new Date(this.user.created_at).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });
    }

    setTimeout(() => {
      this.postsLoaded = true;
      this.posts = [
        {
          content: 'Primeiro post no Sanctuaryum! 🚀',
          likes: 5,
          comments: 2,
          time: 'agora'
        }
      ];
    }, 600);
  }

  setThemeColor(color: string) {
    this.themeColor = color;
  }

  saveBio() {
    this.isEditingBio = false;
  }

  getInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }
}
