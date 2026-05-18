import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-music',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music.html',
  styleUrl: './music.css',
})
export class Music implements OnInit {
  activeTab: string = 'inicio';
  isArtist = false;
  artistStatus: 'none' | 'pending' | 'approved' | 'rejected' = 'none';

  artistForm = {
    artistName: '',
    bio: '',
    socialLinks: '',
    genre: ''
  };

  isPlaying = false;
  currentTrackIndex = -1;

  tracks: any[] = [];
  playlists: any[] = [];
  communityPlaylists: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  playTrack(index: number) {
    this.currentTrackIndex = index;
    this.isPlaying = true;
  }

  toggleLike(track: any) {
    track.liked = !track.liked;
  }

  submitArtistApplication() {
    if (!this.artistForm.artistName || !this.artistForm.bio) return;
    this.artistStatus = 'pending';
  }

  getLikedTracks() {
    return this.tracks.filter(t => t.liked);
  }
}
