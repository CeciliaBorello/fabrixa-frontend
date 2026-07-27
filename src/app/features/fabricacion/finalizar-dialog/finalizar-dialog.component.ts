import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormGroup
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface FinalizarDialogData {
  productoNombre: string;
  cantidadPlanificada: number;
}

@Component({
  selector: 'app-finalizar-dialog',
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
      Finalizar producción — {{ data.productoNombre }}
    </h2>

    <div mat-dialog-content>
      <p class="planificado">
        Cantidad planificada:
        <strong>{{ data.cantidadPlanificada }}</strong>
      </p>

      <form [formGroup]="form">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cantidad realmente producida</mat-label>

          <input
            matInput
            type="number"
            step="0.001"
            formControlName="cantidadProducida"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Número de lote</mat-label>

          <input
            matInput
            formControlName="numeroLote"
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de vencimiento (opcional)</mat-label>

          <input
            matInput
            type="date"
            formControlName="fechaVencimiento"
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
        Finalizar
      </button>

    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .planificado {
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
export class FinalizarDialogComponent {

  private fb = inject(FormBuilder);

  public dialogRef = inject(
    MatDialogRef<FinalizarDialogComponent>
  );

  public data = inject<FinalizarDialogData>(
    MAT_DIALOG_DATA
  );

  form: FormGroup = this.fb.group({
    cantidadProducida: [
      this.data.cantidadPlanificada,
      [
        Validators.required,
        Validators.min(0.001)
      ]
    ],
    numeroLote: [
      '',
      Validators.required
    ],
    fechaVencimiento: ['']
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