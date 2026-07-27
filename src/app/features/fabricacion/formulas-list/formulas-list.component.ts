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
import { FormulaService } from '../formula.service';
import { FormulaResponse } from '../formula.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-formulas-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule
  ],
  templateUrl: './formulas-list.component.html',
  styleUrl: './formulas-list.component.scss'
})
export class FormulasListComponent implements OnInit {
  items = signal<FormulaResponse[]>([]);
  cargando = signal(true);
  error = signal('');
  sinResultados = computed(() => !this.cargando() && this.items().length === 0);

  columnas = ['producto', 'nombre', 'version', 'insumos', 'estado', 'acciones'];

  constructor(private service: FormulaService, private dialog: MatDialog) {}

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