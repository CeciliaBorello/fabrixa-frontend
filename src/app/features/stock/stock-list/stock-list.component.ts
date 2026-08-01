import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, debounceTime, filter as rxFilter } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
    CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent implements OnInit {
  todasLasFilas = signal<StockFila[]>([]);
  cargando = signal(true);
  error = signal('');

  busquedaControl = new FormControl('');
  textoBusqueda = signal('');

  sortActive = signal('');
  sortDir = signal<'asc' | 'desc' | ''>('');
  pageIndex = signal(0);
  pageSize = signal(10);

  columnas = ['nombre', 'cantidad', 'unidad', 'acciones'];

  filtradas = computed(() => {
    const termino = this.textoBusqueda().toLowerCase().trim();
    if (!termino) return this.todasLasFilas();
    return this.todasLasFilas().filter((f) => f.productoNombre.toLowerCase().includes(termino));
  });

  ordenadas = computed(() => {
    const filas = [...this.filtradas()];
    const activo = this.sortActive();
    const dir = this.sortDir();
    if (!activo || !dir) return filas;

    return filas.sort((a: any, b: any) => {
      const valA = a[activo];
      const valB = b[activo];
      const cmp = typeof valA === 'string' ? valA.localeCompare(valB) : valA - valB;
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  filas = computed(() => {
    const inicio = this.pageIndex() * this.pageSize();
    return this.ordenadas().slice(inicio, inicio + this.pageSize());
  });

  totalItems = computed(() => this.filtradas().length);

  constructor(
    private stockService: StockService,
    private productoService: ProductoService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.busquedaControl.valueChanges
      .pipe(
        debounceTime(500), // acá pediste medio segundo, no 2 — distinto a los demás módulos
        rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3)
      )
      .subscribe((valor) => {
        this.textoBusqueda.set(valor || '');
        this.pageIndex.set(0);
      });
  }

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
        this.todasLasFilas.set(filas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el stock');
        this.cargando.set(false);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSortChange(sort: Sort) {
    this.sortActive.set(sort.direction ? sort.active : '');
    this.sortDir.set(sort.direction as 'asc' | 'desc' | '');
    this.pageIndex.set(0);
  }

  ajustar(fila: StockFila) {
    const ref = this.dialog.open(AjusteDialogComponent, {
      data: { productoId: fila.productoId, productoNombre: fila.productoNombre, cantidadActual: fila.cantidad }
    });
    ref.afterClosed().subscribe((resultado) => {
      if (!resultado) return;
      this.stockService.ajustar({ productoId: fila.productoId, delta: resultado.delta, motivo: resultado.motivo }).subscribe({
        next: () => this.cargar(),
        error: (err) => this.error.set(err.error ?? 'No se pudo ajustar el stock')
      });
    });
  }

  verHistorial(fila: StockFila) {
    this.router.navigate(['/stock', fila.productoId, 'historial']);
  }
}