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
import { ClienteProveedorService } from '../cliente-proveedor.service';
import { ClienteProveedorResponse } from '../cliente-proveedor.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { Router } from '@angular/router';
import { CuentaCorrienteService } from '../../cuentas-corrientes/cuenta-corriente.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    MatSlideToggleModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.scss'
})
export class ClientesListComponent implements OnInit {
  items = signal<ClienteProveedorResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  sortBy = signal('fechaModificacion');
  sortDir = signal<'asc' | 'desc'>('desc');
  mostrarInactivos = signal(false);
  busqueda = signal('');
  cargando = signal(true);
  error = signal('');

  busquedaControl = new FormControl('');

  columnas = ['razonSocial', 'cuit', 'tipo', 'saldo', 'estado', 'acciones'];

  saldosPorCliente = signal<Record<number, number>>({});

  constructor(private service: ClienteProveedorService, private dialog: MatDialog, private router: Router, private cuentaCorrienteService: CuentaCorrienteService) {
    this.busquedaControl.valueChanges
      .pipe(
        debounceTime(500),
        rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3)
      )
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
      .listarPaginado(this.pageIndex(), this.pageSize(), this.sortBy(), this.sortDir(), !this.mostrarInactivos(), this.busqueda())
      .subscribe({
       next: (pagina) => {
          this.items.set(pagina.content);
          this.totalItems.set(pagina.totalElements);
          this.cargando.set(false);

          const ids = pagina.content.map((c) => c.id);
          if (ids.length) {
            this.cuentaCorrienteService.saldosDe(ids).subscribe((saldos) => this.saldosPorCliente.set(saldos));
          }
        },
        error: () => {
          this.error.set('No se pudieron cargar los clientes/proveedores');
          this.cargando.set(false);
        }
      });
      
  }

  saldoDe(id: number): number {
    return this.saldosPorCliente()[id] ?? 0;
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  onSortChange(sort: Sort) {
    if (!sort.direction) {
      this.sortBy.set('fechaModificacion');
      this.sortDir.set('desc');
    } else {
      this.sortBy.set(sort.active);
      this.sortDir.set(sort.direction as 'asc' | 'desc');
    }
    this.pageIndex.set(0);
    this.cargar();
  }

  toggleMostrarInactivos() {
    this.mostrarInactivos.update((v) => !v);
    this.pageIndex.set(0);
    this.cargar();
  }

  verCuentaCorriente(item: ClienteProveedorResponse) {
    this.router.navigate(['/cuentas-corrientes', item.id]);
  }

  toggleEstado(item: ClienteProveedorResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: item.activo
        ? {
            titulo: 'Desactivar registro',
            mensaje: `¿Seguro que querés desactivar a ${item.razonSocial}?`,
            textoConfirmar: 'Desactivar',
            peligroso: true
          }
        : {
            titulo: 'Reactivar registro',
            mensaje: `¿Reactivar a ${item.razonSocial}?`,
            textoConfirmar: 'Reactivar',
            peligroso: false
          }
    });

    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.ejecutarToggle(item);
    });
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

  etiquetaCondicionIva(condicion: string | null): string {
    const mapa: Record<string, string> = {
      RESPONSABLE_INSCRIPTO: 'Responsable Inscripto',
      MONOTRIBUTISTA: 'Monotributista',
      EXENTO: 'Exento',
      CONSUMIDOR_FINAL: 'Consumidor Final'
    };
    return condicion ? (mapa[condicion] ?? condicion) : '-';
  }

  ubicacionCompleta(item: ClienteProveedorResponse): string {
    if (item.ciudadNombre && item.provinciaNombre) return `${item.ciudadNombre}, ${item.provinciaNombre}`;
    return item.provinciaNombre || '-';
  }
}