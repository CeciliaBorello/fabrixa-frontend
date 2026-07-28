import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <button mat-icon-button class="back-button" (click)="router.navigate([ruta])">
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
  @Input() ruta = '/';

  constructor(public router: Router) {}
}