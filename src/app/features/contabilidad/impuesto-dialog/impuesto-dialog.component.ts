import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { ImpuestoService } from '../impuesto.service';
import { ImpuestoResponse } from '../impuesto.model';

export interface ImpuestoDialogData {
  impuesto: ImpuestoResponse | null;
}

@Component({
  selector: 'app-impuesto-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './impuesto-dialog.component.html',
  styleUrl: './impuesto-dialog.component.scss'
})
export class ImpuestoDialogComponent implements OnInit {
  error = signal('');
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: ImpuestoService,
    private dialogRef: MatDialogRef<ImpuestoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImpuestoDialogData
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      periodo: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      fechaVencimiento: [null as Date | null, Validators.required]
    });
  }

  ngOnInit() {
    if (this.data.impuesto) {
      this.form.patchValue({
        nombre: this.data.impuesto.nombre,
        periodo: this.data.impuesto.periodo,
        monto: this.data.impuesto.monto,
        fechaVencimiento: new Date(this.data.impuesto.fechaVencimiento)
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
      nombre: v.nombre!,
      periodo: v.periodo!,
      monto: v.monto!,
      fechaVencimiento: v.fechaVencimiento!.toISOString().split('T')[0]
    };

    const accion = this.data.impuesto
      ? this.service.actualizar(this.data.impuesto.id, request)
      : this.service.crear(request);

    accion.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => this.error.set(err.error ?? 'No se pudo guardar el impuesto')
    });
  }
}
