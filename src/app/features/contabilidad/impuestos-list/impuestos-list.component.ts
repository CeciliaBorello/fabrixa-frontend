import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ImpuestoService } from '../impuesto.service';
import { EstadoImpuesto, ImpuestoResponse } from '../impuesto.model';
import { ImpuestoDialogComponent } from '../impuesto-dialog/impuesto-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-impuestos-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatSortModule, MatSelectModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './impuestos-list.component.html',
  styleUrl: './impuestos-list.component.scss'
})
export class ImpuestosListComponent implements OnInit {
  items = signal<ImpuestoResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  busqueda = signal('');
  filtroEstado = signal<EstadoImpuesto | null>(null);
  sortBy = signal('fechaVencimiento');
  sortDir = signal<'asc' | 'desc'>('asc');
  cargando = signal(true);
  error = signal('');

  busquedaControl = new FormControl('');

  columnas = ['nombre', 'periodo', 'monto', 'fechaVencimiento', 'fechaModificacion', 'estado', 'acciones'];

  constructor(private service: ImpuestoService, private dialog: MatDialog) {
    this.busquedaControl.valueChanges
      .pipe(debounceTime(500), rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3))
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
      .listarPaginado(this.pageIndex(), this.pageSize(), this.filtroEstado(), this.busqueda(), this.sortBy(), this.sortDir())
      .subscribe({
        next: (pagina) => {
          this.items.set(pagina.content);
          this.totalItems.set(pagina.totalElements);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los impuestos');
          this.cargando.set(false);
        }
      });
  }

  onFiltroEstadoChange(estado: EstadoImpuesto | null) {
    this.filtroEstado.set(estado);
    this.pageIndex.set(0);
    this.cargar();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  onSortChange(sort: Sort) {
    if (!sort.direction) {
      this.sortBy.set('fechaVencimiento');
      this.sortDir.set('asc');
    } else {
      this.sortBy.set(sort.active);
      this.sortDir.set(sort.direction as 'asc' | 'desc');
    }
    this.pageIndex.set(0);
    this.cargar();
  }

  abrirNuevo() {
    const ref = this.dialog.open(ImpuestoDialogComponent, { data: { impuesto: null } });
    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargar();
    });
  }

  editar(impuesto: ImpuestoResponse) {
    const ref = this.dialog.open(ImpuestoDialogComponent, { data: { impuesto } });
    ref.afterClosed().subscribe((guardado) => {
      if (guardado) this.cargar();
    });
  }

  marcarPagado(impuesto: ImpuestoResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Marcar como pagado',
        mensaje: `¿Confirmás que "${impuesto.nombre}" (${impuesto.periodo}) ya se pagó?`,
        textoConfirmar: 'Marcar pagado',
        peligroso: false
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.marcarPagado(impuesto.id).subscribe({
          next: () => this.cargar(),
          error: (err) => this.error.set(err.error ?? 'No se pudo marcar como pagado')
        });
      }
    });
  }

  claseEstado(estado: string): string {
    return 'estado-' + estado.toLowerCase();
  }
}