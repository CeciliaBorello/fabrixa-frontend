import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-icon-button class="back-button" (click)="volver()">
      <mat-icon>arrow_back</mat-icon>
    </button>
  `,
  styles: [`
    .back-button {
      color: #101A2E;
    }
  `]
})
export class BackButtonComponent {
  @Input() ruta = '/'; // se usa solo como respaldo si no hay historial

  constructor(private router: Router, private location: Location) {}

  volver() {
    // si hay historial de navegación dentro de la app, volvemos ahí
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // si entraron por URL directa (sin historial previo), vamos a la ruta de respaldo
      this.router.navigate([this.ruta]);
    }
  }
}