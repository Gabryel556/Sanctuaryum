import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  activeTab: string = 'account';

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}