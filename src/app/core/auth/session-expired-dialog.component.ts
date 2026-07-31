import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-session-expired-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-content">
      <mat-icon class="dialog-icon">schedule</mat-icon>
      <h2 mat-dialog-title>Tu sesión expiró</h2>
      <p mat-dialog-content>Por seguridad, tenés que volver a iniciar sesión para seguir usando el sistema.</p>
      <div mat-dialog-actions class="dialog-actions">
        <button mat-flat-button color="primary" (click)="dialogRef.close()">
          Iniciar sesión
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-content {
      text-align: center;
      padding: 8px;
      min-width: 280px;
    }
    .dialog-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #8a5a00;
      margin-bottom: 8px;
    }
    h2 {
      margin: 0 0 8px;
      color: #101A2E;
    }
    p {
      color: #6b7280;
      margin-bottom: 20px;
    }
    .dialog-actions {
      display: flex;
      justify-content: center;
    }
  `]
})
export class SessionExpiredDialogComponent {
  constructor(public dialogRef: MatDialogRef<SessionExpiredDialogComponent>) {}
}