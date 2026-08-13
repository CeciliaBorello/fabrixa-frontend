import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmpleadoService } from '../empleado.service';
import { EmpleadoResponse } from '../empleado.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-empleados-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule, MatSlideToggleModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './empleados-list.component.html',
  styleUrl: './empleados-list.component.scss'
})
export class EmpleadosListComponent implements OnInit {
  items = signal<EmpleadoResponse[]>([]);
  cargando = signal(true);
  error = signal('');
  mostrarInactivos = signal(false);
  busquedaControl = new FormControl('');
  textoBusqueda = signal('');

  columnas = ['nombre', 'dni', 'puesto', 'valorHora', 'estado', 'acciones'];

  constructor(private service: EmpleadoService, private dialog: MatDialog) {
    this.busquedaControl.valueChanges
      .pipe(debounceTime(500), rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3))
      .subscribe((valor) => {
        this.textoBusqueda.set(valor || '');
        this.cargar();
      });
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.listar(!this.mostrarInactivos(), this.textoBusqueda()).subscribe({
      next: (data) => {
        this.items.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los empleados');
        this.cargando.set(false);
      }
    });
  }

  toggleMostrarInactivos() {
    this.mostrarInactivos.update((v) => !v);
    this.cargar();
  }

  toggleEstado(empleado: EmpleadoResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: empleado.activo
        ? { titulo: 'Desactivar empleado', mensaje: `¿Desactivar a ${empleado.nombre}?`, textoConfirmar: 'Desactivar', peligroso: true }
        : { titulo: 'Reactivar empleado', mensaje: `¿Reactivar a ${empleado.nombre}?`, textoConfirmar: 'Reactivar', peligroso: false }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      const accion = empleado.activo ? this.service.desactivar(empleado.id) : this.service.reactivar(empleado.id);
      accion.subscribe({
        next: () => this.cargar(),
        error: () => this.error.set('No se pudo cambiar el estado')
      });
    });
  }
}
