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
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormulaService } from '../formula.service';
import { FormulaResponse } from '../formula.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';
import { ErrorBannerComponent } from '../../../shared/error-banner/error-banner.component';

@Component({
  selector: 'app-formulas-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    MatSlideToggleModule, MatDialogModule, BackButtonComponent, ErrorBannerComponent
  ],
  templateUrl: './formulas-list.component.html',
  styleUrl: './formulas-list.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('180ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class FormulasListComponent implements OnInit {
  items = signal<FormulaResponse[]>([]);
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

  // solo una fila expandida a la vez — los insumos ya vienen en la respuesta, sin carga extra
  filaExpandida = signal<number | null>(null);

  columnas = ['producto', 'nombre', 'version', 'insumos', 'estado', 'acciones'];

  constructor(private service: FormulaService, private dialog: MatDialog) {
    this.busquedaControl.valueChanges
      .pipe(debounceTime(2000), rxFilter((v) => (v?.length ?? 0) === 0 || (v?.length ?? 0) >= 3))
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
        },
        error: () => {
          this.error.set('No se pudieron cargar las fórmulas');
          this.cargando.set(false);
        }
      });
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

  estaExpandida(id: number): boolean {
    return this.filaExpandida() === id;
  }

  toggleExpandir(item: FormulaResponse) {
    this.filaExpandida.set(this.filaExpandida() === item.id ? null : item.id);
  }

  desactivar(item: FormulaResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Desactivar fórmula',
        mensaje: `¿Seguro que querés desactivar "${item.nombre}" (v${item.version}) de ${item.productoTerminadoNombre}?`,
        textoConfirmar: 'Desactivar',
        peligroso: true
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.desactivar(item.id).subscribe({
          next: () => this.cargar(),
          error: () => this.error.set('No se pudo desactivar la fórmula')
        });
      }
    });
  }

  reactivar(item: FormulaResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Reactivar fórmula',
        mensaje: `¿Reactivar "${item.nombre}" (v${item.version}) de ${item.productoTerminadoNombre}?`,
        textoConfirmar: 'Reactivar',
        peligroso: false
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.reactivar(item.id).subscribe({
          next: () => this.cargar(),
          error: () => this.error.set('No se pudo reactivar la fórmula')
        });
      }
    });
  }
}