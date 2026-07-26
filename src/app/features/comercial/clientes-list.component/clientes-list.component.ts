import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClienteProveedorService } from '../cliente-proveedor.service';
import { ClienteProveedorResponse } from '../cliente-proveedor.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule
  ],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.scss'
})
export class ClientesListComponent implements OnInit {
  items = signal<ClienteProveedorResponse[]>([]);
  cargando = signal(true);
  error = signal('');
  sinResultados = computed(() => !this.cargando() && this.items().length === 0);

  columnas = ['razonSocial', 'cuit', 'tipo', 'saldo', 'estado', 'acciones'];

  constructor(private service: ClienteProveedorService, private dialog: MatDialog) {}

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
        this.error.set('No se pudieron cargar los clientes/proveedores');
        this.cargando.set(false);
      }
    });
  }

  toggleEstado(item: ClienteProveedorResponse) {
    if (item.activo) {
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: {
          titulo: 'Desactivar registro',
          mensaje: `¿Seguro que querés desactivar a ${item.razonSocial}?`,
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

  private ejecutarToggle(item: ClienteProveedorResponse) {
    const accion = item.activo ? this.service.desactivar(item.id) : this.service.reactivar(item.id);
    accion.subscribe({
      next: () => this.cargar(),
      error: () => this.error.set('No se pudo cambiar el estado')
    });
  }

  etiquetaTipo(tipo: string): string {
    return tipo === 'CLIENTE' ? 'Cliente' : tipo === 'PROVEEDOR' ? 'Proveedor' : 'Cliente y proveedor';
  }
}