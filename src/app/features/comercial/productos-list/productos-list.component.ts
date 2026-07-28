import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductoService } from '../producto.service';
import { ProductoResponse } from '../producto.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { PrecioService } from '../precio.service';
import { PrecioDialogComponent } from '../precio-dialog/precio-dialog.component';
import { Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTabsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.scss'
})

export class ProductosListComponent implements OnInit {

  dataSourceTerminados = new MatTableDataSource<ProductoResponse>([]);
  dataSourceInsumos = new MatTableDataSource<ProductoResponse>([]);

  @ViewChild('paginatorTerminados') paginatorTerminados!: MatPaginator;
  @ViewChild('paginatorInsumos') paginatorInsumos!: MatPaginator;
  cargando = signal(true);
  error = signal('');

  columnas = ['nombre', 'categoria', 'codigoBarra', 'estado', 'acciones'];

  constructor(
  private service: ProductoService,
  private precioService: PrecioService,
  private dialog: MatDialog,
  private router: Router
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        const activos = data.filter((p) => p.activo);
        this.dataSourceTerminados.data = activos.filter((p) => p.tipo === 'TERMINADO' || p.tipo === 'AMBOS');
        this.dataSourceInsumos.data = activos.filter((p) => p.tipo === 'INSUMO' || p.tipo === 'AMBOS');
        this.cargando.set(false);
        setTimeout(() => {
          this.dataSourceTerminados.paginator = this.paginatorTerminados;
          this.dataSourceInsumos.paginator = this.paginatorInsumos;
        });
      },
      error: () => {
        this.error.set('No se pudieron cargar los productos');
        this.cargando.set(false);
      }
    });
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
      next: () => this.cargar(),
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
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo actualizar el precio')
    });
  });
}

verHistorialPrecio(item: ProductoResponse) {
  this.router.navigate(['/productos', item.id, 'precios']);
}
}