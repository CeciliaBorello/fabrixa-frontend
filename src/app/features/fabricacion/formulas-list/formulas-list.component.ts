import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormulaService } from '../formula.service';
import { FormulaResponse } from '../formula.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-formulas-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatPaginatorModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule,
    BackButtonComponent
  ],
  templateUrl: './formulas-list.component.html',
  styleUrl: './formulas-list.component.scss'
})
export class FormulasListComponent implements OnInit {
  items = signal<FormulaResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  cargando = signal(true);
  error = signal('');

  columnas = ['producto', 'nombre', 'version', 'insumos', 'estado', 'acciones'];

  constructor(private service: FormulaService, private dialog: MatDialog) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.listarPaginado(this.pageIndex(), this.pageSize()).subscribe({
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