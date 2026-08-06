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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PedidoService } from '../pedido.service';
import { PedidoResponse } from '../pedido.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-pedidos-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    MatSlideToggleModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './pedidos-list.component.html',
  styleUrl: './pedidos-list.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('180ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class PedidosListComponent implements OnInit {
  items = signal<PedidoResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortBy = signal('fechaModificacion');
  sortDir = signal<'asc' | 'desc'>('desc');
  soloCancelados = signal(false);
  busqueda = signal('');
  cargando = signal(true);
  error = signal('');

  busquedaControl = new FormControl('');

  // id del pedido cuya fila de detalle está expandida (solo uno a la vez, simple)
  filaExpandida = signal<number | null>(null);

  columnas = ['id', 'cliente', 'usuario', 'estado', 'fechaPedido', 'fechaModificacion', 'acciones'];

  constructor(private service: PedidoService, private dialog: MatDialog) {
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
      .listarPaginado(this.pageIndex(), this.pageSize(), this.sortBy(), this.sortDir(), this.soloCancelados(), this.busqueda())
      .subscribe({
        next: (pagina) => {
          this.items.set(pagina.content);
          this.totalItems.set(pagina.totalElements);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los pedidos');
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
    if (!sort.direction) { this.sortBy.set('fechaModificacion'); this.sortDir.set('desc'); }
    else { this.sortBy.set(sort.active); this.sortDir.set(sort.direction as 'asc' | 'desc'); }
    this.pageIndex.set(0);
    this.cargar();
  }

  toggleSoloCancelados() {
    this.soloCancelados.update((v) => !v);
    this.pageIndex.set(0);
    this.cargar();
  }

  estaExpandida(id: number): boolean {
    return this.filaExpandida() === id;
  }

  toggleExpandir(pedido: PedidoResponse) {
    this.filaExpandida.set(this.filaExpandida() === pedido.id ? null : pedido.id);
  }

  etiquetaEstado(estado: string): string {
    const mapa: Record<string, string> = {
      NUEVO: 'Nuevo', PENDIENTE_ENTREGA: 'Pendiente de entrega', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
    };
    return mapa[estado] ?? estado;
  }

  pasarAPendiente(pedido: PedidoResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Pasar a pendiente de entrega',
        mensaje: `¿Confirmás que el pedido #${pedido.id} de ${pedido.clienteNombre} ya se facturó y pasa a pendiente de entrega?`,
        textoConfirmar: 'Confirmar',
        peligroso: false
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.marcarPendienteEntrega(pedido.id).subscribe({
          next: () => this.cargar(),
          error: () => this.error.set('No se pudo actualizar el pedido')
        });
      }
    });
  }

  marcarEntregado(pedido: PedidoResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Marcar como entregado',
        mensaje: `¿Confirmás que el pedido #${pedido.id} de ${pedido.clienteNombre} ya fue despachado?`,
        textoConfirmar: 'Confirmar',
        peligroso: false
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.marcarEntregado(pedido.id).subscribe({
          next: () => this.cargar(),
          error: () => this.error.set('No se pudo actualizar el pedido')
        });
      }
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