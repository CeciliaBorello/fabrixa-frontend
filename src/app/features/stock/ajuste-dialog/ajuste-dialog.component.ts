import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface AjusteDialogData {
  productoId: number;
  productoNombre: string;
  cantidadActual: number;
}

@Component({
  selector: 'app-ajuste-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>
      Ajustar stock — {{ data.productoNombre }}
    </h2>

    <div mat-dialog-content>
      <p class="stock-info">
        Stock actual:
        <strong>{{ data.cantidadActual }}</strong>
      </p>

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cantidad a ajustar</mat-label>

          <input
            matInput
            type="number"
            formControlName="delta"
          />

          <mat-hint>
            Positivo para sumar, negativo para restar
          </mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo</mat-label>

          <input
            matInput
            formControlName="motivo"
            placeholder="Ej: carga inicial, conteo físico..."
          />
        </mat-form-field>
      </form>
    </div>

    <div mat-dialog-actions class="dialog-actions">
      <button
        mat-button
        (click)="dialogRef.close(null)"
      >
        Cancelar
      </button>

      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="confirmar()"
      >
        Confirmar ajuste
      </button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .stock-info {
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 16px 16px;
    }
  `]
})
export class AjusteDialogComponent {

  private fb = inject(FormBuilder);

  public dialogRef = inject(
    MatDialogRef<AjusteDialogComponent>
  );

  public data = inject<AjusteDialogData>(
    MAT_DIALOG_DATA
  );

  form = this.fb.group({
    delta: [
      0,
      [
        Validators.required,
        Validators.pattern(/^-?\d+(\.\d+)?$/)
      ]
    ],
    motivo: [
      '',
      Validators.required
    ]
  });

  confirmar() {
    if (this.form.invalid) {
      return;
    }

    this.dialogRef.close(
      this.form.getRawValue()
    );
  }
}