import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegistroHorasService } from '../registro-horas.service';
import { RegistroHorasResponse } from '../registro-horas.model';
import { EmpleadoService } from '../../empleado.service';
import { EmpleadoResponse, TipoRemuneracion } from '../../empleado.model';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-registro-horas',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatTableModule,
    MatTooltipModule, MatDialogModule, BackButtonComponent, MatProgressSpinnerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './registro-horas.component.html',
  styleUrl: './registro-horas.component.scss'
})
export class RegistroHorasComponent implements OnInit {
  empleados = signal<EmpleadoResponse[]>([]);
  registrosPendientes = signal<RegistroHorasResponse[]>([]);
  cargandoRegistros = signal(false);
  guardando = signal(false);
  error = signal('');

  columnas = ['fecha', 'horas', 'origen', 'acciones'];

  form;

  constructor(
    private fb: FormBuilder,
    private service: RegistroHorasService,
    private empleadoService: EmpleadoService,
    private dialog: MatDialog
  ) {
    this.form = this.fb.group({
      empleadoId: [null as number | null, Validators.required],
      fecha: [new Date(), Validators.required],
      horas: [8, [Validators.required, Validators.min(0.1)]]
    });
  }

  ngOnInit() {
    this.empleadoService.listar(true, '').subscribe((data) => this.empleados.set(data));

    this.form.get('empleadoId')?.valueChanges.subscribe((empleadoId) => {
      if (empleadoId) this.cargarPendientes(empleadoId);
      else this.registrosPendientes.set([]);
    });
  }

  cargarPendientes(empleadoId: number) {
    this.cargandoRegistros.set(true);
    this.service.porEmpleado(empleadoId).subscribe({
      next: (data) => {
        this.registrosPendientes.set(data);
        this.cargandoRegistros.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los registros del empleado');
        this.cargandoRegistros.set(false);
      }
    });
  }

  totalHorasPendientes(): number {
    return this.registrosPendientes().reduce((acc, r) => acc + r.horas, 0);
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    const v = this.form.getRawValue();

    const request = {
      empleadoId: v.empleadoId!,
      fecha: v.fecha!.toISOString().split('T')[0],
      horas: v.horas!
    };

    this.service.crear(request).subscribe({
      next: () => {
        this.guardando.set(false);
        this.form.patchValue({ horas: 8 }); // deja el empleado y la fecha, solo resetea horas para cargar rápido varios días
        this.cargarPendientes(v.empleadoId!);
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo guardar el registro');
      }
    });
  }

  eliminar(registro: RegistroHorasResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Eliminar registro',
        mensaje: `¿Eliminar el registro de ${registro.horas}hs del ${registro.fecha}?`,
        textoConfirmar: 'Eliminar',
        peligroso: true
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.eliminar(registro.id).subscribe({
          next: () => this.cargarPendientes(registro.empleadoId),
          error: (err) => this.error.set(err.error ?? 'No se pudo eliminar el registro')
        });
      }
    });
  }

  etiquetaOrigen(origen: string): string {
    return origen === 'DISPOSITIVO' ? 'Dispositivo' : 'Manual';
  }

  
  cargarEmpleados() {
    this.empleadoService.listar(true, '', TipoRemuneracion.POR_HORA)
      .subscribe(empleados => this.empleados.set(empleados));
  }
}
