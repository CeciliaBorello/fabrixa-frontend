import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { EmpleadoService } from '../../empleado.service';
import { EmpleadoResponse, TipoRemuneracion } from '../../empleado.model';
import { RegistroHorasService } from '../../horas/registro-horas.service';
import { LiquidacionMensualService } from '../liquidacion.service';

@Component({
  selector: 'app-generar-liquidacion-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './generar-liquidacion-dialog.component.html',
  styleUrl: './generar-liquidacion-dialog.component.scss'
})
export class GenerarLiquidacionDialogComponent implements OnInit {
  empleados = signal<EmpleadoResponse[]>([]);
  empleadoSeleccionado = signal<EmpleadoResponse | null>(null);
  horasPendientes = signal(0);
  cargandoPreview = signal(false);
  guardando = signal(false);
  error = signal('');

  TipoRemuneracion = TipoRemuneracion;

  esSueldoFijo = computed(() =>
    this.empleadoSeleccionado()?.tipoRemuneracion === TipoRemuneracion.SUELDO_FIJO
  );

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private registroService: RegistroHorasService,
    private liquidacionService: LiquidacionMensualService,
    private dialogRef: MatDialogRef<GenerarLiquidacionDialogComponent>
  ) {
    this.form = this.fb.group({
      empleadoId: [null as number | null, Validators.required],
      periodo: ['', Validators.required], // etiqueta, ej: "Agosto 2026 - 1ra quincena"
      fechaDesde: [null as Date | null, Validators.required],
      fechaHasta: [null as Date | null, Validators.required],
      montoAPagar: [null as number | null]
    });
  }

  ngOnInit() {
    this.empleadoService.listar(true, '').subscribe((data) => this.empleados.set(data));

    this.form.get('empleadoId')?.valueChanges.subscribe((empleadoId) => {
      const empleado = this.empleados().find((e) => e.id === empleadoId) ?? null;
      this.empleadoSeleccionado.set(empleado);

      const montoCtrl = this.form.get('montoAPagar')!;

      if (!empleado) {
        this.horasPendientes.set(0);
        montoCtrl.clearValidators();
        montoCtrl.setValue(null);
        montoCtrl.updateValueAndValidity({ emitEvent: false });
        return;
      }

      if (empleado.tipoRemuneracion === TipoRemuneracion.SUELDO_FIJO) {
        this.horasPendientes.set(0);
        montoCtrl.setValidators([Validators.required, Validators.min(0)]);
        montoCtrl.setValue(empleado.sueldoFijo); // precargado, editable
        montoCtrl.updateValueAndValidity({ emitEvent: false });
        return;
      }

      // POR_HORA: sin cambios de lógica respecto al original
      montoCtrl.clearValidators();
      montoCtrl.setValue(null);
      montoCtrl.updateValueAndValidity({ emitEvent: false });

      this.cargandoPreview.set(true);
      this.registroService.porEmpleado(empleado.id).subscribe((registros) => {
        this.horasPendientes.set(registros.reduce((acc, r) => acc + r.horas, 0));
        this.cargandoPreview.set(false);
      });
    });
  }

  puedeConfirmar(): boolean {
    if (this.form.invalid || this.guardando()) return false;
    if (this.esSueldoFijo()) {
      return this.form.get('montoAPagar')?.valid ?? false;
    }
    return this.horasPendientes() > 0;
  }

  cancelar() {
    this.dialogRef.close(null);
  }

  confirmar() {
    if (!this.puedeConfirmar()) return;
    this.guardando.set(true);
    this.error.set('');
    const v = this.form.getRawValue();

    const payload = {
      empleadoId: v.empleadoId!,
      periodo: v.periodo!,
      totalAPagar: this.esSueldoFijo() ? v.montoAPagar : null
    };

    this.liquidacionService.generar(payload).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo generar la liquidación');
      }
    });
  }
}