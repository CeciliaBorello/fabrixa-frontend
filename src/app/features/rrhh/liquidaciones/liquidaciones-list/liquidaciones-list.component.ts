import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, filter as rxFilter } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LiquidacionMensualService } from '../liquidacion.service';
import { LiquidacionMensualResponse } from '../liquidacion.model';
import { TipoRemuneracion } from '../../empleado.model';
import { GenerarLiquidacionDialogComponent } from '../generar-liquidacion-dialog/generar-liquidacion-dialog.component';
import { BackButtonComponent } from '../../../../shared/back-button/back-button.component';
import { ErrorBannerComponent } from '../../../../shared/error-banner/error-banner.component';

@Component({
  selector: 'app-liquidaciones-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule,
    MatDialogModule, BackButtonComponent, ErrorBannerComponent
  ],
  templateUrl: './liquidaciones-list.component.html',
  styleUrl: './liquidaciones-list.component.scss'
})
export class LiquidacionesListComponent implements OnInit {
  items = signal<LiquidacionMensualResponse[]>([]);
  totalItems = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  busqueda = signal('');
  cargando = signal(true);
  error = signal('');

  busquedaControl = new FormControl('');

  TipoRemuneracion = TipoRemuneracion;

  columnas = ['empleado', 'tipo', 'periodo', 'totalHoras', 'valorHoraUsado', 'totalAPagar', 'fechaGeneracion'];

  constructor(private service: LiquidacionMensualService, private dialog: MatDialog) {
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
    this.service.listarPaginado(this.pageIndex(), this.pageSize(), this.busqueda()).subscribe({
      next: (pagina) => {
        this.items.set(pagina.content);
        this.totalItems.set(pagina.totalElements);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las liquidaciones');
        this.cargando.set(false);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.cargar();
  }

  abrirGenerar() {
    const ref = this.dialog.open(GenerarLiquidacionDialogComponent);
    ref.afterClosed().subscribe((generado) => {
      if (generado) this.cargar();
    });
  }
}