import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AnticipoService } from '../anticipo.service';

export interface AnticipoFormDialogData {
  empleadoId: number;
  empleadoNombre: string;
}

@Component({
  selector: 'app-anticipo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './anticipo-form-dialog.component.html',
  styleUrl: './anticipo-form-dialog.component.scss'
})
export class AnticipoFormComponent {

  private fb = inject(FormBuilder);
  private anticipoService = inject(AnticipoService);
  private dialogRef = inject(MatDialogRef<AnticipoFormComponent>);

  data = inject<AnticipoFormDialogData>(MAT_DIALOG_DATA);

  guardando = signal(false);
  error = signal('');
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      monto: [null as number | null, [
        Validators.required,
        Validators.min(0.01)
      ]],
      fecha: [new Date(), Validators.required],
      motivo: ['']
    });
  }

 ngOnInit() {
    this.dialogRef.afterOpened().subscribe(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  confirmar() {
    if (this.form.invalid || this.guardando()) return;
    this.guardando.set(true);
    this.error.set('');
    const v = this.form.getRawValue();

    this.anticipoService.crear({
      empleadoId: this.data.empleadoId,
      monto: v.monto!,
      fecha: this.aFechaIso(v.fecha),
      motivo: v.motivo || undefined
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo registrar el anticipo');
      }
    });
  }

  private aFechaIso(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}