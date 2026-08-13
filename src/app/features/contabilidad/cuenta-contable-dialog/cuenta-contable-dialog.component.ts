import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CuentaContableService } from '../cuenta-contable.service';
import { CuentaContableResponse, TipoCuentaContable } from '../cuenta-contable.model';

export interface CuentaContableDialogData {
  cuenta: CuentaContableResponse | null;
  cuentasDisponibles: CuentaContableResponse[];
}

@Component({
  selector: 'app-cuenta-contable-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.cuenta ? 'Editar cuenta' : 'Nueva cuenta contable' }}
    </h2>

    <div mat-dialog-content>
      <form [formGroup]="form">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Código</mat-label>
          <input matInput formControlName="codigo" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="ACTIVO">Activo</mat-option>
            <mat-option value="PASIVO">Pasivo</mat-option>
            <mat-option value="PATRIMONIO_NETO">Patrimonio Neto</mat-option>
            <mat-option value="INGRESO">Ingreso</mat-option>
            <mat-option value="EGRESO">Egreso</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cuenta padre (opcional)</mat-label>
          <mat-select formControlName="cuentaPadreId">
            <mat-option [value]="null">
              Sin cuenta padre (cuenta de primer nivel)
            </mat-option>

            <mat-option
              *ngFor="let c of data.cuentasDisponibles"
              [value]="c.id">
              {{ c.codigo }} — {{ c.nombre }}
            </mat-option>
          </mat-select>
        </mat-form-field>

      </form>

      <p class="error" *ngIf="error()">
        {{ error() }}
      </p>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>

      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid"
        (click)="guardar()">
        Guardar
      </button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .error {
      color: #c0392b;
      font-size: 0.85rem;
    }

    mat-dialog-content {
      min-width: 380px;
    }
  `]
})
export class CuentaContableDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private service = inject(CuentaContableService);

  private dialogRef =
    inject(MatDialogRef<CuentaContableDialogComponent>);

  public data =
    inject(MAT_DIALOG_DATA) as CuentaContableDialogData;

  error = signal('');
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      tipo: ['ACTIVO' as TipoCuentaContable, Validators.required],
      cuentaPadreId: [null as number | null]
    });
  }

  ngOnInit() {
    if (this.data.cuenta) {
      this.form.patchValue({
        codigo: this.data.cuenta.codigo,
        nombre: this.data.cuenta.nombre,
        tipo: this.data.cuenta.tipo,
        cuentaPadreId: this.data.cuenta.cuentaPadreId
      });
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  guardar() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    const request = {
      codigo: v.codigo!,
      nombre: v.nombre!,
      tipo: v.tipo!,
      cuentaPadreId: v.cuentaPadreId
    };

    const accion = this.data.cuenta
      ? this.service.actualizar(this.data.cuenta.id, request)
      : this.service.crear(request);

    accion.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.error.set(
          err.error ?? 'No se pudo guardar la cuenta'
        );
      }
    });
  }
}