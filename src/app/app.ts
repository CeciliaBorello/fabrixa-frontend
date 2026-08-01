import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/auth/auth.service';
import { filter } from 'rxjs';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Fabrixa');
  enLogin = signal(false);

  constructor(
    public auth: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.enLogin.set(this.router.url.startsWith('/login'));
      });
  }

  logout() {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Cerrar sesión',
        mensaje: '¿Seguro que querés cerrar sesión?',
        textoConfirmar: 'Cerrar sesión',
        peligroso: false
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.auth.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}