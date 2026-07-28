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
import { PedidoService } from '../pedido.service';
import { PedidoResponse } from '../pedido.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './pedidos-list.component.html',
  styleUrl: './pedidos-list.component.scss'
})
export class PedidosListComponent implements OnInit {
  dataSource = new MatTableDataSource<PedidoResponse>([]);
  cargando = signal(true);
  error = signal('');

  columnas = ['id', 'cliente', 'usuario', 'estado', 'fecha', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private service: PedidoService, private dialog: MatDialog) {}

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
        this.error.set('No se pudieron cargar los pedidos');
        this.cargando.set(false);
      }
    });
  }

  etiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      NUEVO: 'Nuevo',
      PENDIENTE_ENTREGA: 'Pendiente de entrega',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado'
    };
    return mapa[estado] ?? estado;
  }

  pasarAPendiente(pedido: PedidoResponse) {
    this.service.marcarPendienteEntrega(pedido.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo actualizar el pedido')
    });
  }

  marcarEntregado(pedido: PedidoResponse) {
    this.service.marcarEntregado(pedido.id).subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo actualizar el pedido')
    });
  }

  cancelar(pedido: PedidoResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Cancelar pedido',
        mensaje: `¿Seguro que querés cancelar el pedido #${pedido.id} de ${pedido.clienteNombre}?`,
        textoConfirmar: 'Cancelar pedido',
        peligroso: true
      }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.cancelar(pedido.id).subscribe({
          next: () => this.cargar(),
          error: () => this.error.set('No se pudo cancelar el pedido')
        });
      }
    });
  }
}