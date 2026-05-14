import { Routes } from '@angular/router';
import { ExploreComponent } from './pages/explore/explore';
import { ChatComponent} from './pages/chat/chat';
import { Music } from './pages/music/music';
import { Profile } from './pages/profile/profile';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: 'explore', pathMatch: 'full' },
  { path: 'explore', component: ExploreComponent },
  { path: 'chat', component: ChatComponent},
  { path: 'waves', component: Music },
  { path: 'profile', component: Profile },
  { path: 'settings', component: Settings },
  { path: '**', redirectTo: 'explore' }
];