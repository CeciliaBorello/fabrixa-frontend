import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface PrecioDialogData {
  productoNombre: string;
  precioActual: number | null;
}

@Component({
  selector: 'app-precio-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Actualizar precio — {{ data.productoNombre }}</h2>

    <div mat-dialog-content>
      <p class="precio-info" *ngIf="data.precioActual != null">
        Precio actual: <strong>{{ data.precioActual | currency:'ARS' }}</strong>
      </p>
      <p class="precio-info" *ngIf="data.precioActual == null">
        Este insumo todavía no tiene precio cargado.
      </p>

      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nuevo precio</mat-label>
          <input matInput type="number" step="0.01" formControlName="precio" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo</mat-label>
          <input matInput formControlName="motivo" placeholder="Ej: actualización de proveedor" />
        </mat-form-field>
      </form>
    </div>

    <div mat-dialog-actions class="dialog-actions">
      <button mat-button (click)="dialogRef.close(null)">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="confirmar()">
        Guardar precio
      </button>
    </div>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 0.5rem; }
    .precio-info { color: #6b7280; margin-bottom: 1rem; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 8px 16px 16px; }
  `]
})
export class PrecioDialogComponent {
    form;

  constructor(
    public dialogRef: MatDialogRef<PrecioDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: PrecioDialogData
  ) {
    this.  form = this.fb.group({
        precio: [null as number | null, [Validators.required, Validators.min(0.01)]],
        motivo: ['', Validators.required]
    });
  }

  confirmar() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue());
  }
}