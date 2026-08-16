import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { EmpleadoService } from '../../empleado.service';
import { EmpleadoResponse, TipoRemuneracion } from '../../empleado.model';
import { RegistroHorasService } from '../../horas/registro-horas.service';
import { AnticipoService } from '../../anticipos/anticipo.service';
import { LiquidacionMensualService } from '../liquidacion.service';

@Component({
  selector: 'app-generar-liquidacion-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './generar-liquidacion-dialog.component.html',
  styleUrl: './generar-liquidacion-dialog.component.scss'
})
export class GenerarLiquidacionDialogComponent implements OnInit {
  empleados = signal<EmpleadoResponse[]>([]);
  empleadoSeleccionado = signal<EmpleadoResponse | null>(null);
  horasPendientes = signal(0);
  totalCalculado = signal(0);
  anticiposPendientes = signal(0);
  cargandoPreview = signal(false);
  guardando = signal(false);
  error = signal('');

  TipoRemuneracion = TipoRemuneracion;

  esSueldoFijo = computed(() =>
    this.empleadoSeleccionado()?.tipoRemuneracion === TipoRemuneracion.SUELDO_FIJO
  );

  totalSugerido = computed(() => this.totalCalculado() - this.anticiposPendientes());

  form: FormGroup;
  private montoTocadoManualmente = false;

  constructor(
    private fb: FormBuilder,
    private empleadoService: EmpleadoService,
    private registroService: RegistroHorasService,
    private anticipoService: AnticipoService,
    private liquidacionService: LiquidacionMensualService,
    private dialogRef: MatDialogRef<GenerarLiquidacionDialogComponent>
  ) {
    this.form = this.fb.group({
      empleadoId: [null as number | null, Validators.required],
      periodoFecha: [null as Date | null, Validators.required], // mes/año elegido en el calendario
      periodo: ['', Validators.required], // texto derivado, ej: "08/2026" — lo que se envía al backend
      fechaDesde: [null as Date | null],
      fechaHasta: [null as Date | null],
      montoAPagar: [null as number | null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.empleadoService.listar(true, '').subscribe((data) => this.empleados.set(data));

    this.form.get('empleadoId')?.valueChanges.subscribe((empleadoId) => {
      const empleado = this.empleados().find((e) => e.id === empleadoId) ?? null;
      this.empleadoSeleccionado.set(empleado);
      this.montoTocadoManualmente = false;

      const desdeCtrl = this.form.get('fechaDesde')!;
      const hastaCtrl = this.form.get('fechaHasta')!;

      if (!empleado) {
        this.horasPendientes.set(0);
        this.totalCalculado.set(0);
        this.anticiposPendientes.set(0);
        this.limpiarControl(desdeCtrl);
        this.limpiarControl(hastaCtrl);
        return;
      }

      this.cargarAnticiposPendientes(empleado.id);

      if (empleado.tipoRemuneracion === TipoRemuneracion.SUELDO_FIJO) {
        this.horasPendientes.set(0);
        this.limpiarControl(desdeCtrl);
        this.limpiarControl(hastaCtrl);
        this.totalCalculado.set(empleado.sueldoFijo ?? 0);
        this.actualizarMontoSugerido();
        return;
      }

      desdeCtrl.setValidators([Validators.required]);
      hastaCtrl.setValidators([Validators.required]);
      desdeCtrl.updateValueAndValidity({ emitEvent: false });
      hastaCtrl.updateValueAndValidity({ emitEvent: false });

      this.actualizarPreviewHoras();
    });

    this.form.get('fechaDesde')?.valueChanges.subscribe(() => this.actualizarPreviewHoras());
    this.form.get('fechaHasta')?.valueChanges.subscribe(() => this.actualizarPreviewHoras());

    this.form.get('montoAPagar')?.valueChanges.subscribe(() => {
      this.montoTocadoManualmente = true;
    });
  }

  /** Paso 1 del datepicker mes/año: se eligió el año, queda abierto para elegir el mes. */
  chosenYearHandler(normalizedYear: Date) {
    const actual: Date = this.form.get('periodoFecha')?.value ?? new Date();
    const nueva = new Date(actual);
    nueva.setFullYear(normalizedYear.getFullYear());
    this.form.get('periodoFecha')?.setValue(nueva);
  }

  /** Paso 2: se eligió el mes → cerramos el picker y derivamos el texto del período. */
  chosenMonthHandler(normalizedMonth: Date, datepicker: MatDatepicker<Date>) {
    const actual: Date = this.form.get('periodoFecha')?.value ?? new Date();
    const nueva = new Date(actual);
    nueva.setMonth(normalizedMonth.getMonth());
    nueva.setFullYear(normalizedMonth.getFullYear());
    this.form.get('periodoFecha')?.setValue(nueva);

    const mm = String(nueva.getMonth() + 1).padStart(2, '0');
    const yyyy = nueva.getFullYear();
    this.form.get('periodo')?.setValue(`${mm}/${yyyy}`);

    datepicker.close();
  }

  private limpiarControl(ctrl: AbstractControl) {
    ctrl.clearValidators();
    ctrl.setValue(null);
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private cargarAnticiposPendientes(empleadoId: number) {
    this.anticipoService.porEmpleado(empleadoId).subscribe((anticipos) => {
      const pendientes = anticipos.filter((a) => !a.liquidado);
      this.anticiposPendientes.set(pendientes.reduce((acc, a) => acc + a.monto, 0));
      this.actualizarMontoSugerido();
    });
  }

  private actualizarPreviewHoras() {
    const empleado = this.empleadoSeleccionado();
    if (!empleado || empleado.tipoRemuneracion === TipoRemuneracion.SUELDO_FIJO) return;

    const desde: Date | null = this.form.get('fechaDesde')?.value;
    const hasta: Date | null = this.form.get('fechaHasta')?.value;

    if (!desde || !hasta) {
      this.horasPendientes.set(0);
      this.totalCalculado.set(0);
      this.actualizarMontoSugerido();
      return;
    }

    this.cargandoPreview.set(true);
    this.registroService
      .porEmpleadoEnRango(empleado.id, this.aFechaIso(desde), this.aFechaIso(hasta))
      .subscribe({
        next: (registros) => {
          const horas = registros.reduce((acc, r) => acc + r.horas, 0);
          this.horasPendientes.set(horas);
          this.totalCalculado.set(horas * (empleado.valorHora ?? 0));
          this.cargandoPreview.set(false);
          this.actualizarMontoSugerido();
        },
        error: () => {
          this.horasPendientes.set(0);
          this.totalCalculado.set(0);
          this.cargandoPreview.set(false);
        }
      });
  }

  private actualizarMontoSugerido() {
    if (this.montoTocadoManualmente) return;
    this.form.get('montoAPagar')!.setValue(this.totalSugerido(), { emitEvent: false });
  }

  private aFechaIso(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  puedeConfirmar(): boolean {
    if (this.form.invalid || this.guardando()) return false;
    if (!this.esSueldoFijo() && this.horasPendientes() === 0) return false;
    return true;
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
      fechaDesde: !this.esSueldoFijo() && v.fechaDesde ? this.aFechaIso(v.fechaDesde) : null,
      fechaHasta: !this.esSueldoFijo() && v.fechaHasta ? this.aFechaIso(v.fechaHasta) : null,
      totalAPagar: v.montoAPagar
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