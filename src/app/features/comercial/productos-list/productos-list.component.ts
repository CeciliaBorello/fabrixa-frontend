import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    CommonModule, RouterLink, MatTabsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule,
    BackButtonComponent
  ],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.scss'
})
export class ProductosListComponent implements OnInit {
  itemsTerminados = signal<ProductoResponse[]>([]);
  totalTerminados = signal(0);
  pageIndexTerminados = signal(0);
  pageSizeTerminados = signal(10);

  itemsInsumos = signal<ProductoResponse[]>([]);
  totalInsumos = signal(0);
  pageIndexInsumos = signal(0);
  pageSizeInsumos = signal(10);

  cargando = signal(true);
  error = signal('');

  columnas = ['nombre', 'categoria', 'codigoBarra', 'precio', 'estado', 'acciones'];

  constructor(
    private service: ProductoService,
    private precioService: PrecioService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarTerminados();
    this.cargarInsumos();
  }

  private cargarTerminados() {
    this.cargando.set(true);
    this.service.listarPaginado(this.pageIndexTerminados(), this.pageSizeTerminados(), 'terminados').subscribe({
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

  private cargarInsumos() {
    this.service.listarPaginado(this.pageIndexInsumos(), this.pageSizeInsumos(), 'insumos').subscribe({
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

  private recargarTodo() {
    this.cargarTerminados();
    this.cargarInsumos();
  }

  toggleEstado(item: ProductoResponse) {
    if (item.activo) {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: {
          titulo: 'Desactivar producto',
          mensaje: `¿Seguro que querés desactivar ${item.nombre}?`,
          textoConfirmar: 'Desactivar',
          peligroso: true
        }
      });
      ref.afterClosed().subscribe((confirmado) => {
        if (confirmado) this.ejecutarToggle(item);
      });
    } else {
      this.ejecutarToggle(item);
    }
  }

  private ejecutarToggle(item: ProductoResponse) {
    const accion = item.activo ? this.service.desactivar(item.id) : this.service.reactivar(item.id);
    accion.subscribe({
      next: () => this.recargarTodo(),
      error: () => this.error.set('No se pudo cambiar el estado')
    });
  }

  actualizarPrecio(item: ProductoResponse) {
    const ref = this.dialog.open(PrecioDialogComponent, {
      data: { productoNombre: item.nombre, precioActual: item.precioActual }
    });

    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) return;

      this.precioService.registrar(item.id, resultado).subscribe({
        next: () => this.recargarTodo(),
        error: () => this.error.set('No se pudo actualizar el precio')
      });
    });
  }

  verHistorialPrecio(item: ProductoResponse) {
    this.router.navigate(['/productos', item.id, 'precios']);
  }
}