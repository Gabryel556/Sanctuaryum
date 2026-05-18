import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { FeedComponent } from './pages/feed/feed';
import { ExploreComponent } from './pages/explore/explore';
import { ChatComponent } from './pages/chat/chat';
import { Music } from './pages/music/music';
import { Profile } from './pages/profile/profile';
import { Settings } from './pages/settings/settings';
import { DeveloperComponent } from './pages/developer/developer';
import { StoreComponent } from './pages/store/store';
import { authGuard, noAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent, canActivate: [noAuthGuard] },
  { path: 'feed', component: FeedComponent, canActivate: [authGuard] },
  { path: 'explore', component: ExploreComponent, canActivate: [authGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'waves', component: Music, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'settings', component: Settings, canActivate: [authGuard] },
  { path: 'developer', component: DeveloperComponent, canActivate: [authGuard] },
  { path: 'loja', component: StoreComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'auth' }
];