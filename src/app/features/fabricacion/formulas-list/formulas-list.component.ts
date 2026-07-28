import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
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
    MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './formulas-list.component.html',
  styleUrl: './formulas-list.component.scss'
})
export class FormulasListComponent implements OnInit {
  dataSource = new MatTableDataSource<FormulaResponse>([]);
  cargando = signal(true);
  error = signal('');

  columnas = ['producto', 'nombre', 'version', 'insumos', 'estado', 'acciones'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private service: FormulaService, private dialog: MatDialog) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.service.listar().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cargando.set(false);
        setTimeout(() => (this.dataSource.paginator = this.paginator));
      },
      error: () => {
        this.error.set('No se pudieron cargar las fórmulas');
        this.cargando.set(false);
      }
    });
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