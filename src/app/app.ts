import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/auth/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Fabrixa');
  enHome = signal(true);

  constructor(private auth: AuthService, private router: Router) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.enHome.set(this.router.url === '/');
      });
  }

  get estaLogueado(): boolean {
    return !!localStorage.getItem('fabrixa_token');
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}