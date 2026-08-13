import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { EmpleadoService } from '../empleado.service';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { EmpleadoRequest, TipoRemuneracion } from '../empleado.model';

@Component({
  selector: 'app-empleado-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule,
    BackButtonComponent, MatButtonToggleModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './empleado-form.component.html',
  styleUrl: './empleado-form.component.scss'
})
export class EmpleadoFormComponent implements OnInit {
  itemId: number | null = null;
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');

  form: FormGroup;

  tipoRemuneracion = signal<TipoRemuneracion>(TipoRemuneracion.POR_HORA);
  TipoRemuneracion = TipoRemuneracion; // para usar el enum en el template

  get esEdicion() {
    return this.itemId !== null;
  }

  constructor(
    private fb: FormBuilder,
    private service: EmpleadoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      dni: ['', Validators.required],
      valorHora: [null as number | null],
      sueldoFijo: [null as number | null],
      puesto: [''],
      fechaIngreso: [null as Date | null],
      fechaNacimiento: [null as Date | null],
      direccion: [''],
      telefono: [''],
      email: ['', Validators.email],
      obraSocial: [''],
      contactoEmergenciaNombre: [''],
      contactoEmergenciaTelefono: [''],
      contactoEmergenciaVinculo: [''],
      observaciones: ['']
    });

    effect(() => {
      const tipo = this.tipoRemuneracion();
      const valorHoraCtrl = this.form.get('valorHora')!;
      const sueldoFijoCtrl = this.form.get('sueldoFijo')!;

      if (tipo === TipoRemuneracion.POR_HORA) {
        valorHoraCtrl.setValidators([Validators.required, Validators.min(0)]);
        sueldoFijoCtrl.clearValidators();
        sueldoFijoCtrl.setValue(null); // limpia lo que no corresponde
      } else {
        sueldoFijoCtrl.setValidators([Validators.required, Validators.min(0)]);
        valorHoraCtrl.clearValidators();
        valorHoraCtrl.setValue(null);
      }
      valorHoraCtrl.updateValueAndValidity({ emitEvent: false });
      sueldoFijoCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  seleccionarTipo(tipo: TipoRemuneracion) {
    this.tipoRemuneracion.set(tipo);
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.itemId = Number(idParam);
      this.cargando.set(true);
      this.service.buscarPorId(this.itemId).subscribe({
        next: (item) => {
          this.tipoRemuneracion.set(item.tipoRemuneracion);
          this.form.patchValue({
            nombre: item.nombre,
            dni: item.dni,
            valorHora: item.valorHora,
            sueldoFijo: item.sueldoFijo,
            puesto: item.puesto ?? '',
            fechaIngreso: item.fechaIngreso ? new Date(item.fechaIngreso) : null,
            fechaNacimiento: item.fechaNacimiento ? new Date(item.fechaNacimiento) : null,
            direccion: item.direccion ?? '',
            telefono: item.telefono ?? '',
            email: item.email ?? '',
            obraSocial: item.obraSocial ?? '',
            contactoEmergenciaNombre: item.contactoEmergenciaNombre ?? '',
            contactoEmergenciaTelefono: item.contactoEmergenciaTelefono ?? '',
            contactoEmergenciaVinculo: item.contactoEmergenciaVinculo ?? '',
            observaciones: item.observaciones ?? ''
          });
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el empleado');
          this.cargando.set(false);
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/empleados']);
  }

  private formatearFecha(d: Date | null): string | undefined {
    if (!d) return undefined;
    return d.toISOString().split('T')[0];
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    const v = this.form.getRawValue();

    const request: EmpleadoRequest = {
      nombre: v.nombre!,
      dni: v.dni!,
      tipoRemuneracion: this.tipoRemuneracion(),
      valorHora: v.valorHora,
      sueldoFijo: v.sueldoFijo,
      puesto: v.puesto || undefined,
      fechaIngreso: this.formatearFecha(v.fechaIngreso),
      fechaNacimiento: this.formatearFecha(v.fechaNacimiento),
      direccion: v.direccion || undefined,
      telefono: v.telefono || undefined,
      email: v.email || undefined,
      obraSocial: v.obraSocial || undefined,
      contactoEmergenciaNombre: v.contactoEmergenciaNombre || undefined,
      contactoEmergenciaTelefono: v.contactoEmergenciaTelefono || undefined,
      contactoEmergenciaVinculo: v.contactoEmergenciaVinculo || undefined,
      observaciones: v.observaciones || undefined
    };

    const accion = this.esEdicion
      ? this.service.actualizar(this.itemId!, request)
      : this.service.crear(request);

    accion.subscribe({
      next: () => this.router.navigate(['/empleados']),
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err.error ?? 'No se pudo guardar');
      }
    });
  }
}