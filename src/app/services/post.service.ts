import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Post {
  id: string;
  author_id: string;
  author_username: string;
  author_avatar: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface PostComment {
  id: string;
  author_username: string;
  author_avatar: string;
  content: string;
  created_at: string;
}

export interface CreatePostRequest {
  content: string;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = 'http://localhost:3000/api/posts';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getFeed(page: number = 1): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.API_URL}/feed?page=${page}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createPost(content: string, imageUrl?: string): Observable<Post> {
    const body: CreatePostRequest = { content };
    if (imageUrl) body.image_url = imageUrl;
    return this.http.post<Post>(this.API_URL, body, {
      headers: this.authService.getAuthHeaders()
    });
  }

  likePost(postId: string): Observable<{ liked: boolean; likes_count: number }> {
    return this.http.post<{ liked: boolean; likes_count: number }>(
      `${this.API_URL}/${postId}/like`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getComments(postId: string): Observable<PostComment[]> {
    return this.http.get<PostComment[]>(`${this.API_URL}/${postId}/comments`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  addComment(postId: string, content: string): Observable<PostComment> {
    return this.http.post<PostComment>(
      `${this.API_URL}/${postId}/comments`, { content }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deletePost(postId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${postId}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  followUser(userId: string): Observable<{ following: boolean }> {
    return this.http.post<{ following: boolean }>(
      `http://localhost:3000/api/users/${userId}/follow`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
