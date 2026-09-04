import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrdenFabricacionService } from '../orden-fabricacion.service';
import { OrdenFabricacionResponse } from '../orden-fabricacion.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { FinalizarDialogComponent } from '../finalizar-dialog/finalizar-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { ErrorBannerComponent } from '../../../shared/error-banner/error-banner.component';

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    MatSlideToggleModule, MatDialogModule, BackButtonComponent, ErrorBannerComponent
  ],
  templateUrl: './ordenes-list.component.html',
  styleUrl: './ordenes-list.component.scss'
})
export class OrdenesListComponent implements OnInit {
  items = signal<OrdenFabricacionResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortBy = signal('fechaModificacion');
  sortDir = signal<'asc' | 'desc'>('desc');
  soloCanceladas = signal(false);
  busqueda = signal('');
  cargando = signal(true);
  error = signal('');

  busquedaControl = new FormControl('');

  columnas = ['id', 'producto', 'cantidad', 'estado', 'usuario', 'costo', 'fechaInicio', 'fechaModificacion', 'acciones'];

  constructor(private service: OrdenFabricacionService, private dialog: MatDialog) {
    this.busquedaControl.valueChanges
      .pipe(debounceTime(500), rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3))
      .subscribe((valor) => {
        this.busqueda.set(valor || '');
        this.pageIndex.set(0);
        this.cargar();
      });
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service
      .listarPaginado(this.pageIndex(), this.pageSize(), this.sortBy(), this.sortDir(), this.soloCanceladas(), this.busqueda())
      .subscribe({
        next: (pagina) => {
          this.items.set(pagina.content);
          this.totalItems.set(pagina.totalElements);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las órdenes');
          this.cargando.set(false);
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  onSortChange(sort: Sort) {
    if (!sort.direction) {
      this.sortBy.set('fechaModificacion');
      this.sortDir.set('desc');
    } else {
      this.sortBy.set(sort.active);
      this.sortDir.set(sort.direction as 'asc' | 'desc');
    }
    this.pageIndex.set(0);
    this.cargar();
  }

  toggleSoloCanceladas() {
    this.soloCanceladas.update((v) => !v);
    this.pageIndex.set(0);
    this.cargar();
  }

  etiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      PLANIFICADA: 'Planificada',
      EN_PROCESO: 'En proceso',
      FINALIZADA: 'Finalizada',
      CANCELADA: 'Cancelada'
    };
    return mapa[estado] ?? estado;
  }

  iniciar(orden: OrdenFabricacionResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Iniciar producción',
        mensaje: `¿Confirmás que arranca la producción de la orden #${orden.id} de ${orden.productoNombre}? Se va a descontar el stock de los insumos según la fórmula.`,
        textoConfirmar: 'Iniciar',
        peligroso: false
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.iniciar(orden.id).subscribe({
          next: () => this.cargar(),
          error: (err) => this.error.set(err.error ?? 'No se pudo iniciar la producción (¿hay stock suficiente de los insumos?)')
        });
      }
    });
  }

  finalizar(orden: OrdenFabricacionResponse) {
    const ref = this.dialog.open(FinalizarDialogComponent, {
      data: { productoNombre: orden.productoNombre, cantidadPlanificada: orden.cantidadPlanificada }
    });
    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.service.finalizar(orden.id, resultado).subscribe({
        next: () => this.cargar(),
        error: (err) => this.error.set(err.error ?? 'No se pudo finalizar la orden')
      });
    });
  }

  cancelar(orden: OrdenFabricacionResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Cancelar orden',
        mensaje: `¿Seguro que querés cancelar la orden #${orden.id} de ${orden.productoNombre}?`,
        textoConfirmar: 'Cancelar orden',
        peligroso: true
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.cancelar(orden.id).subscribe({
          next: () => this.cargar(),
          error: (err) => this.error.set(err.error ?? 'No se pudo cancelar la orden')
        });
      }
    });
  }
}