import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CuentaContableService } from '../cuenta-contable.service';
import { CuentaContableResponse } from '../cuenta-contable.model';
import { CuentaContableDialogComponent } from '../cuenta-contable-dialog/cuenta-contable-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { ErrorBannerComponent } from '../../../shared/error-banner/error-banner.component';

@Component({
  selector: 'app-cuentas-contables-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule, MatSlideToggleModule, MatDialogModule, BackButtonComponent, ErrorBannerComponent
  ],
  templateUrl: './cuentas-contables-list.component.html',
  styleUrl: './cuentas-contables-list.component.scss'
})
export class CuentasContablesListComponent implements OnInit {
  todasLasCuentas = signal<CuentaContableResponse[]>([]);
  cargando = signal(true);
  error = signal('');
  mostrarInactivas = signal(false);
  busquedaControl = new FormControl('');
  textoBusqueda = signal('');

  columnas = ['codigo', 'nombre', 'tipo', 'cuentaPadre', 'estado', 'acciones'];

  constructor(private service: CuentaContableService, private dialog: MatDialog) {
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
    this.service.listar(!this.mostrarInactivas(), this.textoBusqueda()).subscribe({
      next: (data) => {
        this.todasLasCuentas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las cuentas contables');
        this.cargando.set(false);
      }
    });
  }

  toggleMostrarInactivas() {
    this.mostrarInactivas.update((v) => !v);
    this.cargar();
  }

  etiquetaTipo(tipo: string): string {
    const mapa: Record<string, string> = {
      ACTIVO: 'Activo', PASIVO: 'Pasivo', PATRIMONIO_NETO: 'Patrimonio Neto',
      INGRESO: 'Ingreso', EGRESO: 'Egreso'
    };
    return mapa[tipo] ?? tipo;
  }

  abrirNueva() {
    const ref = this.dialog.open(CuentaContableDialogComponent, {
      data: { cuenta: null, cuentasDisponibles: this.todasLasCuentas() }
    });
    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargar();
    });
  }

  editar(cuenta: CuentaContableResponse) {
    const ref = this.dialog.open(CuentaContableDialogComponent, {
      data: { cuenta, cuentasDisponibles: this.todasLasCuentas().filter((c) => c.id !== cuenta.id) }
    });
    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargar();
    });
  }

  toggleEstado(cuenta: CuentaContableResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: cuenta.activo
        ? { titulo: 'Desactivar cuenta', mensaje: `¿Desactivar "${cuenta.nombre}"?`, textoConfirmar: 'Desactivar', peligroso: true }
        : { titulo: 'Reactivar cuenta', mensaje: `¿Reactivar "${cuenta.nombre}"?`, textoConfirmar: 'Reactivar', peligroso: false }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      const accion = cuenta.activo ? this.service.desactivar(cuenta.id) : this.service.reactivar(cuenta.id);
      accion.subscribe({
        next: () => this.cargar(),
        error: () => this.error.set('No se pudo cambiar el estado')
      });
    });
  }
}
