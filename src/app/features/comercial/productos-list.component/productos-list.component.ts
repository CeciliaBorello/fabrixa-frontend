import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductoService } from '../producto.service';
import { ProductoResponse } from '../producto.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatTabsModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule
  ],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.scss'
})
export class ProductosListComponent implements OnInit {
  items = signal<ProductoResponse[]>([]);
  cargando = signal(true);
  error = signal('');

  // "Ambos" aparece en las dos pestañas — no se filtra de forma excluyente
  terminados = computed(() => this.items().filter((p) => p.tipo === 'TERMINADO' || p.tipo === 'AMBOS'));
  insumos = computed(() => this.items().filter((p) => p.tipo === 'INSUMO' || p.tipo === 'AMBOS'));

  sinTerminados = computed(() => !this.cargando() && this.terminados().length === 0);
  sinInsumos = computed(() => !this.cargando() && this.insumos().length === 0);

  columnas = ['nombre', 'categoria', 'codigoBarra', 'estado', 'acciones'];

  constructor(private service: ProductoService, private dialog: MatDialog) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.items.set(data);
        this.cargando.set(false);
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
}