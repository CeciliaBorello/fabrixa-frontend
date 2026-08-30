import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ProductoService } from '../producto.service';
import { ProductoResponse } from '../producto.model';
import { PrecioService } from '../precio.service';
import { PrecioDialogComponent } from '../precio-dialog/precio-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { OrdenFabricacionService } from '../../fabricacion/orden-fabricacion.service';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTabsModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
    MatSlideToggleModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('180ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class ProductosListComponent implements OnInit {
  itemsTerminados = signal<ProductoResponse[]>([]);
  totalTerminados = signal(0);
  pageIndexTerminados = signal(0);
  pageSizeTerminados = signal(10);
  sortByTerminados = signal('nombre');
  sortDirTerminados = signal<'asc' | 'desc'>('asc');
  mostrarInactivosTerminados = signal(false);
  busquedaTerminados = signal('');
  busquedaControlTerminados = new FormControl('');

  itemsInsumos = signal<ProductoResponse[]>([]);
  totalInsumos = signal(0);
  pageIndexInsumos = signal(0);
  pageSizeInsumos = signal(10);
  sortByInsumos = signal('nombre');
  sortDirInsumos = signal<'asc' | 'desc'>('asc');
  mostrarInactivosInsumos = signal(false);
  busquedaInsumos = signal('');
  busquedaControlInsumos = new FormControl('');
  costoFabricacionPorProducto = signal<Record<number, number>>({});

  cargando = signal(true);
  error = signal('');

  // ids de productos base actualmente expandidos en la tabla de Terminados
  filasExpandidas = signal<Set<number>>(new Set());
  // cache de presentaciones ya cargadas por producto base, para no repetir el request al volver a expandir
  presentacionesPorProducto = signal<Record<number, ProductoResponse[]>>({});
  cargandoPresentaciones = signal<Set<number>>(new Set());

  // arrays de columnas SEPARADOS: Terminados tiene "costoFabricacion", Insumos no
  columnasTerminados = ['nombre', 'categoria', 'codigoBarra', 'precio', 'costoFabricacion', 'estado', 'acciones'];
  columnasInsumos = ['nombre', 'categoria', 'codigoBarra', 'precio', 'estado', 'acciones'];

  constructor(
    private service: ProductoService,
    private precioService: PrecioService,
    private dialog: MatDialog,
    private router: Router,
    private ordenService: OrdenFabricacionService
  ) {
    this.busquedaControlTerminados.valueChanges
      .pipe(debounceTime(500), rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3))
      .subscribe((valor) => {
        this.busquedaTerminados.set(valor || '');
        this.pageIndexTerminados.set(0);
        this.cargarTerminados();
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
    this.cargarTerminados();
    this.cargarInsumos();
  }

  cargarTerminados() {
    this.cargando.set(true);
    this.filasExpandidas.set(new Set());
    this.service
      .listarPaginado(this.pageIndexTerminados(), this.pageSizeTerminados(), this.sortByTerminados(), this.sortDirTerminados(), !this.mostrarInactivosTerminados(), this.busquedaTerminados(), 'terminados')
      .subscribe({
        next: (pagina) => {
          this.itemsTerminados.set(pagina.content);
          this.totalTerminados.set(pagina.totalElements);
          this.cargando.set(false);

          const ids = pagina.content.map((p) => p.id);
          if (ids.length) {
            this.ordenService.ultimoCostoPorProductos(ids).subscribe((costos) => {
              this.costoFabricacionPorProducto.set(costos);
            });
          }
        },
        error: () => {
          this.error.set('No se pudieron cargar los productos');
          this.cargando.set(false);
        }
      });
  }

  costoFabricacionDe(productoId: number): number | null {
    const valor = this.costoFabricacionPorProducto()[productoId];
    return valor !== undefined ? valor : null;
  }

  cargarInsumos() {
    this.service
      .listarPaginado(this.pageIndexInsumos(), this.pageSizeInsumos(), this.sortByInsumos(), this.sortDirInsumos(), !this.mostrarInactivosInsumos(), this.busquedaInsumos(), 'insumos')
      .subscribe({
        next: (pagina) => {
          this.itemsInsumos.set(pagina.content);
          this.totalInsumos.set(pagina.totalElements);
        },
        error: () => this.error.set('No se pudieron cargar los insumos')
      });
  }

  onPageChangeTerminados(event: PageEvent) {
    this.pageIndexTerminados.set(event.pageIndex);
    this.pageSizeTerminados.set(event.pageSize);
    this.cargarTerminados();
  }

  onPageChangeInsumos(event: PageEvent) {
    this.pageIndexInsumos.set(event.pageIndex);
    this.pageSizeInsumos.set(event.pageSize);
    this.cargarInsumos();
  }

  onSortChangeTerminados(sort: Sort) {
    if (!sort.direction) { this.sortByTerminados.set('nombre'); this.sortDirTerminados.set('asc'); }
    else { this.sortByTerminados.set(sort.active); this.sortDirTerminados.set(sort.direction as 'asc' | 'desc'); }
    this.pageIndexTerminados.set(0);
    this.cargarTerminados();
  }

  onSortChangeInsumos(sort: Sort) {
    if (!sort.direction) { this.sortByInsumos.set('nombre'); this.sortDirInsumos.set('asc'); }
    else { this.sortByInsumos.set(sort.active); this.sortDirInsumos.set(sort.direction as 'asc' | 'desc'); }
    this.pageIndexInsumos.set(0);
    this.cargarInsumos();
  }

  toggleMostrarInactivosInsumos() {
    this.mostrarInactivosInsumos.update((v) => !v);
    this.pageIndexInsumos.set(0);
    this.cargarInsumos();
  }

  private recargarTodo() {
    this.cargarTerminados();
    this.cargarInsumos();
  }

  estaExpandida(id: number): boolean {
    return this.filasExpandidas().has(id);
  }

  presentacionesDe(id: number): ProductoResponse[] {
    return this.presentacionesPorProducto()[id] || [];
  }

  estaCargandoPresentaciones(id: number): boolean {
    return this.cargandoPresentaciones().has(id);
  }

  toggleExpandir(producto: ProductoResponse) {
    const expandidas = new Set(this.filasExpandidas());

    if (expandidas.has(producto.id)) {
      expandidas.delete(producto.id);
      this.filasExpandidas.set(expandidas);
      return;
    }

    expandidas.add(producto.id);
    this.filasExpandidas.set(expandidas);

    if (this.presentacionesPorProducto()[producto.id]) return;

    const cargando = new Set(this.cargandoPresentaciones());
    cargando.add(producto.id);
    this.cargandoPresentaciones.set(cargando);

    // Siempre traemos TODAS las presentaciones (activas e inactivas), sin
    // importar el toggle "Ver desactivados" de arriba -- ese toggle filtra
    // el estado del producto BASE, no tiene relación con sus presentaciones.
    // Cada presentación ya muestra su propio estado en la columna "Estado".
    this.service.listarPresentaciones(producto.id, this.mostrarInactivosTerminados()).subscribe({
      next: (data) => {
        this.presentacionesPorProducto.update((mapa) => ({ ...mapa, [producto.id]: data }));
        const c = new Set(this.cargandoPresentaciones());
        c.delete(producto.id);
        this.cargandoPresentaciones.set(c);
      },
      error: () => {
        const c = new Set(this.cargandoPresentaciones());
        c.delete(producto.id);
        this.cargandoPresentaciones.set(c);
      }
    });
  }

  toggleMostrarInactivosTerminados() {
    this.mostrarInactivosTerminados.update((v) => !v);
    this.pageIndexTerminados.set(0);
    // El cache de presentaciones queda atado solo al id del producto, sin
    // distinguir bajo qué vista (activos/inactivos) se pidió -- si no lo
    // invalidamos acá, expandir el mismo producto en la vista opuesta trae
    // los datos viejos en vez de volver a pedirlos.
    this.presentacionesPorProducto.set({});
    this.cargarTerminados();
  }

  toggleEstado(item: ProductoResponse) {
    if (!item.productoBaseId) {
      this.service.contarPresentaciones(item.id, item.activo).subscribe((cantidad) => {
        this.abrirConfirmacionEstado(item, cantidad);
      });
    } else {
      this.abrirConfirmacionEstado(item, 0);
    }
  }

  private abrirConfirmacionEstado(item: ProductoResponse, cantidadPresentaciones: number) {
    const tienePresentaciones = cantidadPresentaciones > 0;

    const titulo = item.activo ? 'Desactivar producto' : 'Reactivar producto';
    const textoConfirmar = item.activo ? 'Desactivar' : 'Reactivar';

    let mensaje: string;
    if (!tienePresentaciones) {
      mensaje = item.activo ? `¿Seguro que querés desactivar ${item.nombre}?` : `¿Reactivar ${item.nombre}?`;
    } else if (item.activo) {
      mensaje = `${item.nombre} tiene ${cantidadPresentaciones} presentación(es) asociada(s). Al desactivarlo, esas presentaciones también van a quedar desactivadas. ¿Confirmás?`;
    } else {
      mensaje = `${item.nombre} tiene ${cantidadPresentaciones} presentación(es) asociada(s). Al reactivarlo, esas presentaciones también se van a reactivar. ¿Confirmás?`;
    }

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { titulo, mensaje, textoConfirmar, peligroso: item.activo }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.ejecutarToggle(item);
    });
  }

  private ejecutarToggle(item: ProductoResponse) {
    const accion = item.activo ? this.service.desactivar(item.id) : this.service.reactivar(item.id);
    accion.subscribe({
      next: () => {
        // invalidamos el cache de presentaciones de su base (si es una) y recargamos todo
        this.presentacionesPorProducto.set({});
        this.recargarTodo();
      },
      error: () => this.error.set('No se pudo cambiar el estado')
    });
  }

  actualizarPrecio(item: ProductoResponse) {
    const ref = this.dialog.open(PrecioDialogComponent, { data: { productoNombre: item.nombre, precioActual: item.precioActual } });
    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.precioService.registrar(item.id, resultado).subscribe({
        next: () => {
          this.presentacionesPorProducto.set({});
          this.recargarTodo();
        },
        error: () => this.error.set('No se pudo actualizar el precio')
      });
    });
  }

  verHistorialPrecio(item: ProductoResponse) {
    this.router.navigate(['/productos', item.id, 'precios']);
  }

  etiquetaCategoria(categoria: string | null): string {
    const mapa: Record<string, string> = {
      MATERIA_PRIMA: 'Materia Prima',
      ENVASES_Y_EMPAQUES: 'Envases y Empaques',
      ADITIVOS_Y_CONSERVANTES: 'Aditivos y Conservantes',
      LIMPIEZA_E_HIGIENE: 'Limpieza e Higiene',
      REPUESTOS_Y_MANTENIMIENTO: 'Repuestos y Mantenimiento',
      PRODUCTO_PARA_VENTA: 'Producto para la Venta',
      OTROS: 'Otros'
    };
    return categoria ? (mapa[categoria] ?? categoria) : '-';
  }

  
}