import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, CommonModule], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'sanctuaryum';

  constructor(public authService: AuthService) {}
}