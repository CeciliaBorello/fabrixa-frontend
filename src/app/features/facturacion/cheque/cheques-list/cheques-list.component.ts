import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChequeService } from '../cheque.service';
import { ChequeResponse, EstadoCheque } from '../cheque.model';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';

@Component({
  selector: 'app-cheques-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatTabsModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule, MatDialogModule, BackButtonComponent
  ],
  templateUrl: './cheques-list.component.html',
  styleUrl: './cheques-list.component.scss'
})
export class ChequesListComponent implements OnInit {
  cargando = signal(true);
  error = signal('');

  pestanas: { estado: EstadoCheque; label: string }[] = [
    { estado: 'EN_CARTERA', label: 'En cartera' },
    { estado: 'ENTREGADO', label: 'Entregados' },
    { estado: 'COBRADO', label: 'Cobrados' },
    { estado: 'RECHAZADO', label: 'Rechazados' }
  ];

  estadoActivo = signal<EstadoCheque>('EN_CARTERA');
  items = signal<ChequeResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  busqueda = signal('');
  busquedaControl = new FormControl('');

  columnas = ['numero', 'banco', 'tercero', 'monto', 'fechaCobro', 'acciones'];

  constructor(private service: ChequeService, private dialog: MatDialog) {
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
    this.service.listarPaginado(this.pageIndex(), this.pageSize(), this.estadoActivo(), this.busqueda()).subscribe({
      next: (pagina) => {
        this.items.set(pagina.content);
        this.totalItems.set(pagina.totalElements);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los cheques');
        this.cargando.set(false);
      }
    });
  }

  onTabChange(index: number) {
    this.estadoActivo.set(this.pestanas[index].estado);
    this.pageIndex.set(0);
    this.cargar();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  cobrar(cheque: ChequeResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Cobrar cheque',
        mensaje: `¿Confirmás que el cheque #${cheque.numero} se cobró?`,
        textoConfirmar: 'Cobrar',
        peligroso: false
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.cobrar(cheque.id).subscribe({
          next: () => this.cargar(),
          error: (err) => this.error.set(err.error ?? 'No se pudo cobrar el cheque')
        });
      }
    });
  }

  rechazar(cheque: ChequeResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        titulo: 'Rechazar cheque',
        mensaje: `¿Confirmás que el cheque #${cheque.numero} fue rechazado por el banco?`,
        textoConfirmar: 'Rechazar',
        peligroso: true
      }
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.service.rechazar(cheque.id).subscribe({
          next: () => this.cargar(),
          error: (err) => this.error.set(err.error ?? 'No se pudo rechazar el cheque')
        });
      }
    });
  }
}
