import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrdenFabricacionService } from '../orden-fabricacion.service';
import { OrdenFabricacionResponse } from '../orden-fabricacion.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { FinalizarDialogComponent } from '../finalizar-dialog/finalizar-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './ordenes-list.component.html',
  styleUrl: './ordenes-list.component.scss'
})
export class OrdenesListComponent implements OnInit {
  dataSource = new MatTableDataSource<OrdenFabricacionResponse>([]);
  cargando = signal(true);
  error = signal('');

  columnas = ['id', 'producto', 'cantidad', 'estado', 'usuario', 'costo', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private service: OrdenFabricacionService, private dialog: MatDialog) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cargando.set(false);
        setTimeout(() => (this.dataSource.paginator = this.paginator));
      },
      error: () => {
        this.error.set('No se pudieron cargar las órdenes');
        this.cargando.set(false);
      }
    });
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
    this.service.iniciar(orden.id).subscribe({
      next: () => this.cargar(),
      error: (err) => this.error.set(err.error ?? 'No se pudo iniciar la producción (¿hay stock suficiente de los insumos?)')
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