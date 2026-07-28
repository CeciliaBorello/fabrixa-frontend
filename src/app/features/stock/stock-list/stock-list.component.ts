import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StockService } from '../stock.service';
import { StockFila } from '../stock.model';
import { ProductoService } from '../../comercial/producto.service';
import { AjusteDialogComponent } from '../ajuste-dialog/ajuste-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent implements OnInit {
  dataSource = new MatTableDataSource<StockFila>([]);
  cargando = signal(true);
  error = signal('');

  columnas = ['nombre', 'cantidad', 'unidad', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private stockService: StockService,
    private productoService: ProductoService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    forkJoin({
      productos: this.productoService.listar(),
      stock: this.stockService.listar()
    }).subscribe({
      next: ({ productos, stock }) => {
        const stockPorProducto = new Map(stock.map((s) => [s.productoId, s.cantidad]));

        const filas: StockFila[] = productos
          .filter((p) => p.activo)
          .map((p) => ({
            productoId: p.id,
            productoNombre: p.nombre,
            cantidad: stockPorProducto.get(p.id) ?? 0,
            unidadMedida: p.unidadMedida
          }));

        this.dataSource.data = filas;
        this.cargando.set(false);
        setTimeout(() => (this.dataSource.paginator = this.paginator));
      },
      error: () => {
        this.error.set('No se pudo cargar el stock');
        this.cargando.set(false);
      }
    });
  }

  ajustar(fila: StockFila) {
    const ref = this.dialog.open(AjusteDialogComponent, {
      data: {
        productoId: fila.productoId,
        productoNombre: fila.productoNombre,
        cantidadActual: fila.cantidad
      }
    });

    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) return;

      this.stockService.ajustar({
        productoId: fila.productoId,
        delta: resultado.delta,
        motivo: resultado.motivo
      }).subscribe({
        next: () => this.cargar(),
        error: (err) => this.error.set(err.error ?? 'No se pudo ajustar el stock')
      });
    });
  }

  verHistorial(fila: StockFila) {
    this.router.navigate(['/stock', fila.productoId, 'historial']);
  }
}