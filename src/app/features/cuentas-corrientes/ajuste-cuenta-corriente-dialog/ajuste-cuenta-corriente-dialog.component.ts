import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { Component, inject, signal } from '@angular/core';

export interface AjusteDialogData {
  razonSocial: string;
  saldoActual: number;
}

@Component({
  selector: 'app-ajuste-cuenta-corriente-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatRadioModule],
  template: `
    <h2 mat-dialog-title>Ajuste manual de cuenta corriente</h2>
    <div mat-dialog-content>
      <p class="contexto">
        {{ data.razonSocial }} — Saldo actual: <strong>{{ data.saldoActual | currency:'ARS' }}</strong>
      </p>

      <form [formGroup]="form">
        <div class="tipo-ajuste">
          <mat-radio-group formControlName="sentido">
            <mat-radio-button value="SUMA">Sumar a favor nuestro (nos deben más)</mat-radio-button>
            <mat-radio-button value="RESTA">Restar a favor nuestro (les debemos más / condonar deuda)</mat-radio-button>
          </mat-radio-group>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Monto</mat-label>
          <input matInput type="number" formControlName="montoAbsoluto" min="0.01" step="0.01" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Motivo</mat-label>
          <textarea matInput formControlName="motivo" rows="2" placeholder="Ej: deuda incobrable, corrección de saldo histórico..."></textarea>
        </mat-form-field>
      </form>

      <p class="error" *ngIf="error()">{{ error() }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="confirmar()">Guardar ajuste</button>
    </div>
  `,
  styles: [`
    .contexto { color: #6b7280; font-size: 14px; margin-bottom: 1rem; }
    .tipo-ajuste { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; margin-bottom: 0.5rem; }
    .error { color: #c0392b; font-size: 0.85rem; }
    mat-dialog-content { min-width: 380px; }
  `]
})
export class AjusteCuentaCorrienteDialogComponent {
  error = signal('');

  form: FormGroup;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AjusteCuentaCorrienteDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as AjusteDialogData;

  constructor() {
    this.form = this.fb.group({
      sentido: ['SUMA', Validators.required],
      montoAbsoluto: [0, [Validators.required, Validators.min(0.01)]],
      motivo: ['', Validators.required]
    });
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  confirmar() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const monto = v.sentido === 'SUMA'
      ? v.montoAbsoluto
      : -v.montoAbsoluto;

    this.dialogRef.close({
      monto,
      motivo: v.motivo
    });
  }
}
