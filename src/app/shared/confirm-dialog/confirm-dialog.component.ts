import { Component, Inject } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligroso?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <mat-icon class="dialog-icon" [class.danger]="data.peligroso">
        {{ data.peligroso ? 'warning' : 'help_outline' }}
      </mat-icon>
      <h2 mat-dialog-title>{{ data.titulo }}</h2>
      <p mat-dialog-content>{{ data.mensaje }}</p>
      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="dialogRef.close(false)">
          {{ data.textoCancelar || 'Cancelar' }}
        </button>
        <button
          mat-flat-button
          [color]="data.peligroso ? 'warn' : 'primary'"
          (click)="dialogRef.close(true)">
          {{ data.textoConfirmar || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      text-align: center;
      padding: 8px;
      min-width: 280px;
    }
    .dialog-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .dialog-icon.danger {
      color: #c0392b;
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
      gap: 8px;
    }
  `]
})

export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}