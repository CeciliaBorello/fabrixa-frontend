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
import { ProductoService } from '../producto.service';
import { ProductoResponse } from '../producto.model';
import { PrecioService } from '../precio.service';
import { PrecioDialogComponent } from '../precio-dialog/precio-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTabsModule, MatTableModule, MatSortModule,
    MatPaginatorModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule,
    MatSlideToggleModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.scss'
})
export class ProductosListComponent implements OnInit {
  itemsTerminados = signal<ProductoResponse[]>([]);
  totalTerminados = signal(0);
  pageIndexTerminados = signal(0);
  pageSizeTerminados = signal(10);
  sortByTerminados = signal('fechaModificacion');
  sortDirTerminados = signal<'asc' | 'desc'>('desc');
  mostrarInactivosTerminados = signal(false);
  busquedaTerminados = signal('');
  busquedaControlTerminados = new FormControl('');

  itemsInsumos = signal<ProductoResponse[]>([]);
  totalInsumos = signal(0);
  pageIndexInsumos = signal(0);
  pageSizeInsumos = signal(10);
  sortByInsumos = signal('fechaModificacion');
  sortDirInsumos = signal<'asc' | 'desc'>('desc');
  mostrarInactivosInsumos = signal(false);
  busquedaInsumos = signal('');
  busquedaControlInsumos = new FormControl('');

  cargando = signal(true);
  error = signal('');

  columnas = ['nombre', 'categoria', 'codigoBarra', 'precio', 'estado', 'acciones'];

  constructor(
    private service: ProductoService,
    private precioService: PrecioService,
    private dialog: MatDialog,
    private router: Router
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
    this.service
      .listarPaginado(this.pageIndexTerminados(), this.pageSizeTerminados(), this.sortByTerminados(), this.sortDirTerminados(), !this.mostrarInactivosTerminados(), this.busquedaTerminados(), 'terminados')
      .subscribe({
        next: (pagina) => {
          this.itemsTerminados.set(pagina.content);
          this.totalTerminados.set(pagina.totalElements);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los productos');
          this.cargando.set(false);
        }
      });
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
    if (!sort.direction) { this.sortByTerminados.set('fechaModificacion'); this.sortDirTerminados.set('desc'); }
    else { this.sortByTerminados.set(sort.active); this.sortDirTerminados.set(sort.direction as 'asc' | 'desc'); }
    this.pageIndexTerminados.set(0);
    this.cargarTerminados();
  }

  onSortChangeInsumos(sort: Sort) {
    if (!sort.direction) { this.sortByInsumos.set('fechaModificacion'); this.sortDirInsumos.set('desc'); }
    else { this.sortByInsumos.set(sort.active); this.sortDirInsumos.set(sort.direction as 'asc' | 'desc'); }
    this.pageIndexInsumos.set(0);
    this.cargarInsumos();
  }

  toggleMostrarInactivosTerminados() {
    this.mostrarInactivosTerminados.update((v) => !v);
    this.pageIndexTerminados.set(0);
    this.cargarTerminados();
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

  toggleEstado(item: ProductoResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: item.activo
        ? {
            titulo: 'Desactivar producto',
            mensaje: `¿Seguro que querés desactivar ${item.nombre}?`,
            textoConfirmar: 'Desactivar',
            peligroso: true
          }
        : {
            titulo: 'Reactivar producto',
            mensaje: `¿Reactivar ${item.nombre}?`,
            textoConfirmar: 'Reactivar',
            peligroso: false
          }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.ejecutarToggle(item);
    });
  }

  private ejecutarToggle(item: ProductoResponse) {
    const accion = item.activo ? this.service.desactivar(item.id) : this.service.reactivar(item.id);
    accion.subscribe({ next: () => this.recargarTodo(), error: () => this.error.set('No se pudo cambiar el estado') });
  }

  actualizarPrecio(item: ProductoResponse) {
    const ref = this.dialog.open(PrecioDialogComponent, { data: { productoNombre: item.nombre, precioActual: item.precioActual } });
    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.precioService.registrar(item.id, resultado).subscribe({ next: () => this.recargarTodo(), error: () => this.error.set('No se pudo actualizar el precio') });
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