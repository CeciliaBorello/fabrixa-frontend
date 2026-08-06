import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { StockService } from '../stock.service';
import { StockFilaResponse } from '../stock.model';
import { AjusteDialogComponent } from '../ajuste-dialog/ajuste-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatTabsModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('180ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class StockListComponent implements OnInit {
  cargando = signal(true);
  error = signal('');

  // ---- Productos para la venta ----
  itemsVenta = signal<StockFilaResponse[]>([]);
  totalVenta = signal(0);
  pageIndexVenta = signal(0);
  pageSizeVenta = signal(10);
  busquedaVenta = signal('');
  busquedaControlVenta = new FormControl('');

  // ---- Insumos ----
  itemsInsumos = signal<StockFilaResponse[]>([]);
  totalInsumos = signal(0);
  pageIndexInsumos = signal(0);
  pageSizeInsumos = signal(10);
  busquedaInsumos = signal('');
  busquedaControlInsumos = new FormControl('');

  // ---- presentaciones, cargadas y cacheadas por producto base ----
  filasExpandidas = signal<Set<number>>(new Set());
  presentacionesPorProducto = signal<Record<number, StockFilaResponse[]>>({});
  cargandoPresentaciones = signal<Set<number>>(new Set());

  columnas = ['nombre', 'cantidad', 'unidad', 'acciones'];

  constructor(
    private stockService: StockService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.busquedaControlVenta.valueChanges
      .pipe(debounceTime(500), rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3))
      .subscribe((valor) => {
        this.busquedaVenta.set(valor || '');
        this.pageIndexVenta.set(0);
        this.cargarVenta();
      });

    this.busquedaControlInsumos.valueChanges
      .pipe(debounceTime(500), rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3))
      .subscribe((valor) => {
        this.busquedaInsumos.set(valor || '');
        this.pageIndexInsumos.set(0);
        this.cargarInsumos();
      });
  }

  ngOnInit() {
    this.cargarVenta();
    this.cargarInsumos();
  }

  cargarVenta() {
    this.cargando.set(true);
    this.filasExpandidas.set(new Set());
    this.stockService
      .listarPaginado(this.pageIndexVenta(), this.pageSizeVenta(), 'nombre', 'asc', this.busquedaVenta(), 'venta')
      .subscribe({
        next: (pagina) => {
          this.itemsVenta.set(pagina.content);
          this.totalVenta.set(pagina.totalElements);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el stock');
          this.cargando.set(false);
        }
      });
  }

  cargarInsumos() {
    this.stockService
      .listarPaginado(this.pageIndexInsumos(), this.pageSizeInsumos(), 'nombre', 'asc', this.busquedaInsumos(), 'insumos')
      .subscribe({
        next: (pagina) => {
          this.itemsInsumos.set(pagina.content);
          this.totalInsumos.set(pagina.totalElements);
        },
        error: () => this.error.set('No se pudo cargar los insumos')
      });
  }

  onPageChangeVenta(event: PageEvent) {
    this.pageIndexVenta.set(event.pageIndex);
    this.pageSizeVenta.set(event.pageSize);
    this.cargarVenta();
  }

  onPageChangeInsumos(event: PageEvent) {
    this.pageIndexInsumos.set(event.pageIndex);
    this.pageSizeInsumos.set(event.pageSize);
    this.cargarInsumos();
  }

  estaExpandida(id: number): boolean {
    return this.filasExpandidas().has(id);
  }

  presentacionesDe(id: number): StockFilaResponse[] {
    return this.presentacionesPorProducto()[id] || [];
  }

  estaCargandoPresentaciones(id: number): boolean {
    return this.cargandoPresentaciones().has(id);
  }

  toggleExpandir(fila: StockFilaResponse) {
    const expandidas = new Set(this.filasExpandidas());

    if (expandidas.has(fila.productoId)) {
      expandidas.delete(fila.productoId);
      this.filasExpandidas.set(expandidas);
      return;
    }

    expandidas.add(fila.productoId);
    this.filasExpandidas.set(expandidas);

    if (this.presentacionesPorProducto()[fila.productoId]) return;

    const cargando = new Set(this.cargandoPresentaciones());
    cargando.add(fila.productoId);
    this.cargandoPresentaciones.set(cargando);

    this.stockService.presentacionesConStock(fila.productoId).subscribe({
      next: (data) => {
        this.presentacionesPorProducto.update((mapa) => ({ ...mapa, [fila.productoId]: data }));
        const c = new Set(this.cargandoPresentaciones());
        c.delete(fila.productoId);
        this.cargandoPresentaciones.set(c);
      },
      error: () => {
        const c = new Set(this.cargandoPresentaciones());
        c.delete(fila.productoId);
        this.cargandoPresentaciones.set(c);
      }
    });
  }

  ajustar(fila: StockFilaResponse) {
    const ref = this.dialog.open(AjusteDialogComponent, {
      data: { productoId: fila.productoId, productoNombre: fila.productoNombre, cantidadActual: fila.cantidad }
    });
    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.stockService.ajustar({ productoId: fila.productoId, delta: resultado.delta, motivo: resultado.motivo }).subscribe({
        next: () => {
          this.presentacionesPorProducto.set({});
          this.cargarVenta();
          this.cargarInsumos();
        },
        error: (err) => this.error.set(err.error ?? 'No se pudo ajustar el stock')
      });
    });
  }

  verHistorial(fila: StockFilaResponse) {
    this.router.navigate(['/stock', fila.productoId, 'historial']);
  }
}