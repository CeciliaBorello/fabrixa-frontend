import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-button class="back-button" (click)="volver()">
      <mat-icon>arrow_back</mat-icon>
      {{ texto }}
    </button>
  `,
  styles: [`
    .back-button {
      color: #101A2E;
      margin-bottom: 1rem;
    }
    .back-button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class BackButtonComponent {
  @Input() texto = 'Volver';
  @Input() ruta = '/usuarios';

  constructor(private router: Router) {}

  volver() {
    this.router.navigate([this.ruta]);
  }
}